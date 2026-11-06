import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
import { createRequire } from 'node:module';

const requireDependency = createRequire(import.meta.url);
const { NextRequest } = requireDependency('next/server');
const { unstable_getResponseFromNextConfig, getRedirectUrl } = requireDependency('next/experimental/testing/server');
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

const configSource = fs.readFileSync(new URL('../next.config.ts', import.meta.url), 'utf8');
const configCompiled = ts.transpileModule(configSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
const configExports = {};
new Function('require', 'exports', configCompiled.outputText)(name => {
  if (name === 'next-intl/plugin') return { __esModule: true, default: () => config => config };
  return requireDependency(name);
}, configExports);

test('Next.js configuration redirects fresh English-browser homepage visits even without proxy execution', async () => {
  const response = await unstable_getResponseFromNextConfig({ url: 'https://zuwara.net/?ref=homepage', nextConfig: configExports.default, headers: { 'accept-language': 'en-US,en;q=0.9' } });
  assert.equal(response.status, 307);
  assert.equal(getRedirectUrl(response), 'https://zuwara.net/ar?ref=homepage');
});
test('Next.js homepage redirect preserves saved language choices and rejects unsupported values', async () => {
  for (const locale of ['en', 'ar']) {
    const response = await unstable_getResponseFromNextConfig({ url: 'https://zuwara.net/', nextConfig: configExports.default, cookies: { NEXT_LOCALE: locale } });
    assert.equal(getRedirectUrl(response), null);
  }
  const response = await unstable_getResponseFromNextConfig({ url: 'https://zuwara.net/', nextConfig: configExports.default, cookies: { NEXT_LOCALE: 'fr' } });
  assert.equal(getRedirectUrl(response), 'https://zuwara.net/ar');
});
test('homepage fallback does not redirect Arabic pages or API requests', async () => {
  for (const path of ['/ar', '/api/app-download', '/api/contact', '/healthcare/doctors']) {
    const response = await unstable_getResponseFromNextConfig({ url: 'https://zuwara.net' + path, nextConfig: configExports.default });
    assert.equal(getRedirectUrl(response), null);
  }
});
