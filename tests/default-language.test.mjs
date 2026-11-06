import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
import { createRequire } from 'node:module';

const requireDependency = createRequire(import.meta.url);
const { NextRequest } = requireDependency('next/server');
const source = fs.readFileSync(new URL('../src/proxy.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
const exports = {};
const delegated = [];
new Function('require', 'exports', outputText)(name => {
  if (name === 'next-intl/middleware') return { __esModule: true, default: () => request => { delegated.push(request); return 'existing-locale-routing'; } };
  if (name === './i18n/routing') return { routing: { locales: ['en', 'ar'], defaultLocale: 'en' } };
  return requireDependency(name);
}, exports);

test('new visitors start in Arabic regardless of browser language', () => {
  for (const language of ['en-US,en;q=0.9', 'ar-SA', 'fr', '']) {
    const response = exports.default(new NextRequest('https://zuwara.net/', { headers: { 'accept-language': language } }));
    assert.equal(response.status, 307);
    assert.equal(response.headers.get('Location'), 'https://zuwara.net/ar');
  }
});
test('Arabic default keeps the requested page and query parameters', () => {
  const response = exports.default(new NextRequest('https://zuwara.net/healthcare/doctors?category=2'));
  assert.equal(response.headers.get('Location'), 'https://zuwara.net/ar/healthcare/doctors?category=2');
});
test('saved English/Arabic choices and explicit language URLs keep their existing routing', () => {
  for (const locale of ['en', 'ar']) {
    const request = new NextRequest('https://zuwara.net/dashboard', { headers: { cookie: `NEXT_LOCALE=${locale}` } });
    assert.equal(exports.default(request), 'existing-locale-routing');
    assert.equal(delegated.at(-1), request);
    assert.equal(exports.default(new NextRequest(`https://zuwara.net/${locale}/healthcare`)), 'existing-locale-routing');
  }
});
test('invalid language cookies cannot override the Arabic default', () => {
  const response = exports.default(new NextRequest('https://zuwara.net/', { headers: { cookie: 'NEXT_LOCALE=fr' } }));
  assert.equal(response.headers.get('Location'), 'https://zuwara.net/ar');
});
