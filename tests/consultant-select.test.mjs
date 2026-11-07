import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRequire } from 'node:module';

const requireDependency = createRequire(import.meta.url);
const source = fs.readFileSync(new URL('../src/app/[locale]/dashboard/instant/ConsultantSelect.tsx', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } });
const component = {};
new Function('require', 'exports', outputText)(name => name === './consultant-select.module.css' ? {} : requireDependency(name), component);
const options = Object.freeze([{ id: 65, name: 'majda Amoudi' }, { id: 126, name: 'Doctor test' }, { id: 77, name: 'خلود صالح' }]);

test('consultant search filters existing options by name while preserving their backend IDs', () => {
  assert.deepEqual(component.filterConsultantOptions(options, ' AMOUDI ').map(row => row.id), [65]);
  assert.deepEqual(component.filterConsultantOptions(options, 'خلود').map(row => row.id), [77]);
  assert.deepEqual(component.filterConsultantOptions(options, 'no such doctor'), []);
  assert.equal(component.filterConsultantOptions(options, '').length, 3);
  assert.equal(options[0].name, 'majda Amoudi');
});
test('searchable field keeps the selected consultant, accessible label and required form validation', () => {
  const html = renderToStaticMarkup(React.createElement(component.default, { options, value: '65', onChange: () => {}, ar: false, disabled: false }));
  assert.ok(html.includes('role="combobox"'));
  assert.ok(html.includes('aria-autocomplete="list"'));
  assert.ok(html.includes('required=""'));
  assert.ok(html.includes('value="majda Amoudi"'));
  assert.ok(html.includes('Search or select a consultant'));
});
test('Arabic and disabled states are supported and unavailable IDs do not appear as valid selections', () => {
  const html = renderToStaticMarkup(React.createElement(component.default, { options, value: '9999', onChange: () => {}, ar: true, disabled: true }));
  assert.ok(html.includes('ابحث أو اختر استشارياً'));
  assert.ok(html.includes('disabled=""'));
  assert.ok(html.includes('value=""'));
});
