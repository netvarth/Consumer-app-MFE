// Run without a browser or network: node scripts/check-checkout-phone-loader.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { BehaviorSubject } = require('rxjs');
const sass = require('sass');

const flush = () => new Promise(resolve => setImmediate(resolve));

function createDocument() {
  const elements = new Map();
  const document = {
    defaultView: {},
    elements,
    getElementById: id => elements.get(id) || null,
    createElement(tag) {
      const element = new EventTarget();
      Object.assign(element, { tagName: tag, dataset: {}, sheet: null });
      element.remove = () => elements.delete(element.id);
      return element;
    },
    head: { appendChild: element => elements.set(element.id, element) }
  };
  return document;
}

function loadService(template) {
  const filename = path.resolve(`projects/${template}/src/app/shared/intl-tel-input-loader.service.ts`);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true }
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require(id) {
      if (id === 'rxjs') return { BehaviorSubject };
      if (id === '@angular/core') return { Injectable: () => value => value, Inject: () => () => {} };
      if (id === '@angular/common') return { DOCUMENT: Symbol('document') };
      if (id === 'jconsumer-shared') return {};
      throw new Error(`Unexpected dependency: ${id}`);
    }
  }, { filename });
  return exports.IntlTelInputLoaderService;
}

function observe(service) {
  const state = {};
  service.ready$.subscribe(value => { state.ready = value; });
  service.failed$.subscribe(value => { state.failed = value; });
  return state;
}

function finishCss(document) {
  const link = document.getElementById('intl-tel-input-css');
  link.sheet = {};
  link.dispatchEvent(new Event('load'));
}

function finishUtils(document) {
  document.defaultView.intlTelInputUtils = { formatNumber() {} };
  document.getElementById('intl-tel-input-utils').dispatchEvent(new Event('load'));
}

async function check(template) {
  const Loader = loadService(template);
  const create = document => new Loader(
    { getCDNPath: () => 'https://assets.example.test/' },
    { getEnvironment: () => 'global/intl-tel-input-v1/' },
    document
  );

  // Cold load: CSS alone must not make the control editable.
  const cold = createDocument();
  const first = create(cold);
  const firstState = observe(first);
  const css = cold.getElementById('intl-tel-input-css');
  assert.equal(css.href, 'https://assets.example.test/global/intl-tel-input-v1/css/intlTelInput.min.css');
  for (const image of ['flags.png', 'flags@2x.png']) {
    assert.equal(new URL(`../img/${image}`, css.href).href,
      `https://assets.example.test/global/intl-tel-input-v1/img/${image}`);
  }
  finishCss(cold);
  await flush();
  assert.equal(firstState.ready, false);
  first.load();
  const secondState = observe(create(cold));
  assert.equal(cold.elements.size, 2, 'Concurrent callers must reuse the assets');
  finishUtils(cold);
  await flush();
  assert.equal(firstState.ready, true);
  assert.equal(secondState.ready, true);
  const cachedState = observe(create(cold));
  await flush();
  assert.equal(cachedState.ready, true, 'Cached assets must not wait for another load event');

  // Reverse order: utilities alone must not expose an unstyled country picker.
  const reverse = createDocument();
  const reverseState = observe(create(reverse));
  finishUtils(reverse);
  await flush();
  assert.equal(reverseState.ready, false);
  finishCss(reverse);
  await flush();
  assert.equal(reverseState.ready, true);

  for (const failedId of ['intl-tel-input-css', 'intl-tel-input-utils']) {
    const document = createDocument();
    const loader = create(document);
    const state = observe(loader);
    const failedAsset = document.getElementById(failedId);
    if (failedId === 'intl-tel-input-css') finishUtils(document);
    else finishCss(document);
    failedAsset.dispatchEvent(new Event('error'));
    await flush();
    assert.equal(state.ready, false);
    assert.equal(state.failed, true);
    loader.load();
    assert.equal(state.failed, false);
    assert.notEqual(document.getElementById(failedId), failedAsset);
    if (failedId === 'intl-tel-input-css') finishCss(document);
    else finishUtils(document);
    await flush();
    assert.equal(state.ready, true, 'Retry must recover from an asset failure');
  }

  const missingGlobal = createDocument();
  const missingState = observe(create(missingGlobal));
  finishCss(missingGlobal);
  missingGlobal.getElementById('intl-tel-input-utils').dispatchEvent(new Event('load'));
  await flush();
  assert.equal(missingState.ready, false, 'Script load is insufficient if the formatter is missing');
  assert.equal(missingState.failed, true);

  const address = `projects/${template}/src/app/orders/checkout/address/address.component`;
  const source = fs.readFileSync(`${address}.ts`, 'utf8');
  const html = fs.readFileSync(`${address}.html`, 'utf8');
  const style = sass.compile(`${address}.scss`, { loadPaths: ['node_modules'] }).css;
  assert(!source.includes('node_modules/intl-tel-input') && !source.includes('intl-tel-input/build/js/utils'));
  assert(!style.includes('flags.png') && !style.includes('flags@2x.png'), 'Flag URLs must stay in the external CDN stylesheet');
  assert.match(html, /app-phone-input \*ngIf="intlTelInputLoader\.ready\$ \| async/);
  assert.match(html, /\(click\)="intlTelInputLoader\.load\(\)"/);
  console.log(`${template}: cold/cached/concurrent loading, both completion orders, failures/retry, CDN flag URLs and address integration passed`);
}

(async () => {
  await check('template7');
  await check('template12');
})().catch(error => { console.error(error); process.exitCode = 1; });
