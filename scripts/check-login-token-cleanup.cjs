// Exercise the installed shared AuthService and root adapter without a browser.
// Run: node scripts/check-login-token-cleanup.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const rxjs = require('rxjs');

const sharedFile = 'node_modules/jconsumer-shared/esm2022/lib/auth-service.mjs';
const sharedSource = ts.createSourceFile(sharedFile, fs.readFileSync(sharedFile, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const sharedClass = sharedSource.statements.find(node => ts.isClassDeclaration(node) && node.name.text === 'AuthService');
// Angular's generated metadata isn't needed for direct service construction.
const runtimeClass = ts.factory.updateClassDeclaration(sharedClass,
  undefined, sharedClass.name, sharedClass.typeParameters, sharedClass.heritageClauses,
  sharedClass.members.filter(member => !member.name?.getText(sharedSource).startsWith('ɵ')));
const AuthService = vm.runInNewContext(
  `${ts.createPrinter().printNode(ts.EmitHint.Unspecified, runtimeClass, sharedSource)}\nAuthService;`,
  { ...rxjs, console: { log() {} } }
);

const adapterFile = 'projects/root/src/app/consumer-auth.service.ts';
const adapterCode = ts.transpileModule(fs.readFileSync(adapterFile, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, experimentalDecorators: true }
}).outputText;
const adapterExports = {};
vm.runInNewContext(adapterCode, {
  exports: adapterExports,
  require(id) {
    if (id === '@angular/core') return { Injectable: () => value => value };
    if (id === 'jconsumer-shared') return { AuthService };
    if (id === '@consumer/cross-tenant') return {};
    return require(id);
  }
}, { filename: adapterFile });
const { ConsumerAuthService } = adapterExports;

function fixture() {
  const local = new Map([['c_authorizationToken', 'OTP_TEMP'], ['mUniqueId', 'DEVICE']]);
  const users = new Map();
  const identity = { token: 'EXISTING_PLATFORM' };
  const requests = [];
  const storage = {
    getitemfromLocalStorage: key => local.get(key),
    setitemonLocalStorage: (key, value) => local.set(key, value),
    removeitemfromLocalStorage: key => local.delete(key)
  };
  const groups = {
    getitemFromGroupStorage: key => users.get(key),
    setitemToGroupStorage: (key, value) => users.set(key, value)
  };
  const api = {
    httpPost() { throw new Error('Configure the login response'); },
    httpDelete(url) {
      requests.push({ method: 'DELETE', url, logout: local.get('logout') });
      // The existing logout interceptor removes the temporary authorization header.
      local.delete('c_authorizationToken');
      return rxjs.of(true);
    }
  };
  const platformTokens = { save: token => { identity.token = token; }, clear: () => { identity.token = null; } };
  const tenantLogout = { clearProviderState() { local.delete('c_authorizationToken'); local.delete('ynw-credentials'); users.clear(); } };
  const auth = new ConsumerAuthService(api, storage, {}, groups, tenantLogout, platformTokens);
  return { auth, api, local, groups, identity, requests };
}

async function checkNormalLogin(method) {
  const f = fixture();
  const response = new rxjs.Subject();
  f.api.httpPost = () => {
    assert.equal(f.local.get('c_authorizationToken'), 'OTP_TEMP');
    return response;
  };
  const observedTokens = [];
  f.auth.getMessage().subscribe(() => observedTokens.push(f.local.get('c_authorizationToken')));
  const login = f.auth[method]({ accountId: 22 });
  assert.equal(f.local.get('c_authorizationToken'), 'OTP_TEMP', 'Keep the temporary token until login completes');
  response.next({ providerConsumer: 201, platform_token: 'NEW_PLATFORM' });
  response.complete();
  await login;
  assert(!f.local.has('c_authorizationToken'), `${method}: clear temporary token on successful login`);
  assert.deepEqual(observedTokens, [undefined], 'Refresh listeners must not see the temporary token');
  assert.equal(f.identity.token, 'NEW_PLATFORM');
  assert.equal(f.auth.isLoggedIn(), true);
}

async function checkAutomaticRetry() {
  const f = fixture();
  const conflict = { status: 401, error: 'Session Already Exist' };
  const retriedResponse = new rxjs.Subject();
  let started;
  const retryStarted = new Promise(resolve => { started = resolve; });
  let attempts = 0;
  f.api.httpPost = url => {
    f.requests.push({ method: 'POST', url, token: f.local.get('c_authorizationToken') });
    if (++attempts === 1) return rxjs.throwError(() => conflict);
    assert.equal(attempts, 2);
    started();
    return retriedResponse;
  };
  const tokensAfterLogin = [];
  f.auth.getMessage().subscribe(() => {
    if (f.auth.isLoggedIn()) tokensAfterLogin.push(f.local.get('c_authorizationToken'));
  });
  // The library rejects the first promise while running a detached retry.
  await assert.rejects(f.auth.login({ accountId: 22 }), error => error === conflict);
  await retryStarted;
  assert.deepEqual(f.requests.map(request => request.method), ['POST', 'DELETE', 'POST']);
  assert.equal(f.requests[1].logout, true, 'Preserve the existing logout header fix');
  assert.equal(f.requests[2].token, 'OTP_TEMP', 'The retried login still needs the verified OTP token');
  retriedResponse.next({ providerConsumer: 201, platform_token: 'RETRY_PLATFORM' });
  retriedResponse.complete();
  await Promise.resolve();
  assert(!f.local.has('c_authorizationToken'), 'Automatic retry must clean up without a component success callback');
  assert.deepEqual(tokensAfterLogin, [undefined]);
  assert.equal(f.identity.token, 'RETRY_PLATFORM');
  assert.equal(f.auth.isLoggedIn(), true);
}

async function main() {
  await checkAutomaticRetry();
  await checkNormalLogin('consumerLogin');
  await checkNormalLogin('login');
  const failed = fixture();
  const error = { status: 400 };
  failed.api.httpPost = () => rxjs.throwError(() => error);
  await assert.rejects(failed.auth.consumerLogin({ accountId: 22 }), received => received === error);
  assert.equal(failed.local.get('c_authorizationToken'), 'OTP_TEMP', 'A failed login must not consume the retry credential');
  const direct = fixture();
  direct.auth.setLoginData({ providerConsumer: 201, platform_token: 'DIRECT_PLATFORM' }, { accountId: 22 });
  assert(!direct.local.has('c_authorizationToken'));
  assert.equal(direct.identity.token, 'DIRECT_PLATFORM');
  console.log('Passed: normal login, automatic 401 retry, refresh notification ordering, failed login and direct login token cleanup.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
