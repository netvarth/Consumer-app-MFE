// Run after building home and root with native federation:
// node --experimental-vm-modules scripts/check-cross-tenant-federation.mjs
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import ts from 'typescript';

const sharedPackage = '@consumer/cross-tenant';
const newExport = 'isBrowserSessionToken';
const directories = process.argv.slice(2);
if (!directories.length) directories.push('dist/home/browser', 'dist/root/browser');

function importedNames(code, file) {
  const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const imports = new Map();
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) continue;
    if (!statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const specifier = statement.moduleSpecifier.text;
    const names = imports.get(specifier) ?? new Set();
    if (ts.isImportDeclaration(statement)) {
      if (statement.importClause?.name) names.add('default');
      const bindings = statement.importClause?.namedBindings;
      if (bindings && ts.isNamedImports(bindings)) {
        for (const item of bindings.elements) names.add((item.propertyName ?? item.name).text);
      }
    } else if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const item of statement.exportClause.elements) names.add((item.propertyName ?? item.name).text);
    }
    imports.set(specifier, names);
  }
  return imports;
}

// Confirm this check reproduces the reported error against an older shared module.
const originalFailure = new SourceTextModule(`import { ${newExport} } from '${sharedPackage}';`);
await assert.rejects(
  originalFailure.link(() => new SyntheticModule([], () => {})),
  /does not provide an export named 'isBrowserSessionToken'/
);

for (const directory of directories) {
  // A plain Angular build does not exercise federation's shared-mapping rewrite.
  const manifest = JSON.parse(await readFile(path.join(directory, 'remoteEntry.json'), 'utf8'));
  assert(manifest.shared.some(item => item.packageName === sharedPackage), 'Expected a federation build');
  let checked = 0;
  for (const file of await readdir(directory)) {
    if (!file.endsWith('.js')) continue;
    const filename = path.join(directory, file);
    const code = await readFile(filename, 'utf8');
    if (!code.includes(sharedPackage)) continue;
    const imports = importedNames(code, filename);
    if (!imports.has(sharedPackage)) continue;

    // Link real generated app code with a shared runtime missing the new helper.
    // Other dependencies are stubs: this checks ESM linking, not app execution.
    const app = new SourceTextModule(code, { identifier: filename });
    await app.link(specifier => {
      const names = [...(imports.get(specifier) ?? [])].filter(
        name => specifier !== sharedPackage || name !== newExport
      );
      return new SyntheticModule(names, () => {}, { identifier: specifier });
    });
    checked++;
  }
  assert(checked > 0, `No app imports of ${sharedPackage} found in ${directory}`);
  console.log(`${directory}: ${checked} generated module(s) link with the older shared runtime`);
}
