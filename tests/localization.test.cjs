const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');
const arabic = require('../messages/ui-ar.json');

function loadModule(filename, dependencies) {
  const source = fs.readFileSync(path.join(__dirname, '..', filename), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } });
  const exports = {};
  new Function('require', 'exports', compiled.outputText)((name) => dependencies[name], exports);
  return exports;
}

const ui = loadModule('src/i18n/ui-text.ts', { '../../messages/ui-ar.json': arabic });
const healthcare = loadModule('src/i18n/healthcare-text.ts', { './ui-text': ui });

test('switching languages restores English and preserves unknown user content', () => {
  assert.equal(ui.createUiText('ar')('Sign In'), 'تسجيل الدخول');
  assert.equal(ui.createUiText('en')('Sign In'), 'Sign In');
  assert.equal(ui.createUiText('ar')('Patient-provided text'), 'Patient-provided text');
});

test('healthcare display selects the requested language without mutating API records', () => {
  const record = Object.freeze({ name: 'Doctor name', nameAr: 'اسم الطبيب', degrees: 'MBBS', degreeAr: 'بكالوريوس الطب' });
  assert.equal(healthcare.healthcareText(record, 'name', 'ar'), 'اسم الطبيب');
  assert.equal(healthcare.healthcareText(record, 'name', 'en'), 'Doctor name');
  assert.equal(healthcare.healthcareText(record, 'degrees', 'ar'), 'بكالوريوس الطب');
  assert.equal(record.name, 'Doctor name');
  assert.equal(healthcare.healthcareText({ name: 'Original name', nameAr: null }, 'name', 'ar'), 'Original name');
});

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(filename) : [filename];
  });
}

test('next-intl namespaces and message keys remain stable in both languages', () => {
  const catalogs = {
    en: require('../messages/en.json'),
    ar: require('../messages/ar.json'),
  };
  const failures = [];
  const lookup = (catalog, key) => key.split('.').reduce((value, part) => value?.[part], catalog);
  for (const filename of filesIn(path.join(__dirname, '../src')).filter(name => /\.tsx?$/.test(name))) {
    const tree = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest, true, filename.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const bindings = new Map();
    function scopeOf(node) {
      for (let current = node.parent; current; current = current.parent) {
        if (ts.isFunctionLike(current) || ts.isSourceFile(current)) return current;
      }
      return tree;
    }
    function findBindings(node) {
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
        const initializer = ts.isAwaitExpression(node.initializer) ? node.initializer.expression : node.initializer;
        if (ts.isCallExpression(initializer) && ['useTranslations', 'getTranslations'].includes(initializer.expression.getText(tree))) {
          const argument = initializer.arguments[0];
          let namespace = '';
          if (argument && ts.isStringLiteral(argument)) namespace = argument.text;
          else if (argument && ts.isObjectLiteralExpression(argument)) {
            const property = argument.properties.find(value => ts.isPropertyAssignment(value) && value.name.getText(tree) === 'namespace');
            if (property && ts.isStringLiteral(property.initializer)) namespace = property.initializer.text;
          } else if (argument) {
            failures.push(`${filename}: translation namespace must be a stable identifier`);
          }
          for (const [locale, catalog] of Object.entries(catalogs)) {
            if (namespace && !lookup(catalog, namespace)) failures.push(`${filename}: missing ${locale} namespace ${namespace}`);
          }
          const scope = scopeOf(node);
          if (!bindings.has(scope)) bindings.set(scope, new Map());
          bindings.get(scope).set(node.name.text, namespace);
        }
      }
      ts.forEachChild(node, findBindings);
    }
    findBindings(tree);
    function visit(node) {
      if (ts.isCallExpression(node)) {
        const callee = ts.isPropertyAccessExpression(node.expression) ? node.expression.expression : node.expression;
        if (ts.isIdentifier(callee)) {
          let namespace;
          for (let current = node; current; current = current.parent) {
            if (bindings.get(current)?.has(callee.text)) { namespace = bindings.get(current).get(callee.text); break; }
          }
          if (namespace !== undefined && node.arguments[0]) {
            const key = node.arguments[0];
            if (ts.isCallExpression(key) && key.expression.getText(tree) === 'uiText') failures.push(`${filename}: message keys must not be translated`);
            if (ts.isStringLiteral(key)) {
              const fullKey = [namespace, key.text].filter(Boolean).join('.');
              for (const [locale, catalog] of Object.entries(catalogs)) {
                if (lookup(catalog, fullKey) === undefined) failures.push(`${filename}: missing ${locale} message ${fullKey}`);
              }
            }
          }
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(tree);
  }
  assert.deepEqual(failures, []);
});

test('every static UI translation has Arabic copy and client directives precede imports', () => {
  for (const [source, translated] of Object.entries(arabic)) {
    assert.match(translated, /[\u0600-\u06ff]/, `Arabic translation was lost or corrupted: ${source}`);
  }
  const missing = [];
  for (const filename of filesIn(path.join(__dirname, '../src')).filter(name => name.endsWith('.tsx'))) {
    const source = fs.readFileSync(filename, 'utf8');
    const tree = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const directiveIndex = tree.statements.findIndex(node => ts.isExpressionStatement(node) && ts.isStringLiteral(node.expression) && node.expression.text === 'use client');
    assert.ok(directiveIndex <= 0, `${filename}: misplaced client directive`);
    function visit(node) {
      if (ts.isCallExpression(node) && node.expression.getText(tree) === 'uiText' && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) {
        const text = node.arguments[0].text;
        if (!arabic[text]) missing.push(`${filename}: ${text}`);
      }
      ts.forEachChild(node, visit);
    }
    visit(tree);
  }
  assert.deepEqual(missing, []);
});
