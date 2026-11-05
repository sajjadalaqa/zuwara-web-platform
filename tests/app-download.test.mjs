import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRequire } from 'node:module';

const requireDependency = createRequire(import.meta.url);
function load(path, dependencies = {}) {
  const source = fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } });
  const exports = {};
  new Function('require', 'exports', outputText)(name => name in dependencies ? dependencies[name] : requireDependency(name), exports);
  return exports;
}
const stores = load('src/data/site.ts');
const download = load('src/lib/app-download.ts', { '@/data/site': stores });
const route = load('src/app/api/app-download/route.ts', { '@/lib/app-download': download });

test('QR destination routes iPhone, iPad and Android to the supplied stores', () => {
  for (const [agent, url] of [['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)', stores.APP_STORE_URL], ['Mozilla/5.0 (iPad; CPU OS 18_0)', stores.APP_STORE_URL], ['Mozilla/5.0 (Linux; Android 15; Pixel)', stores.GOOGLE_PLAY_URL]]) {
    const response = route.GET(new Request('https://zuwara.net/api/app-download', { headers: { 'user-agent': agent } }));
    assert.equal(response.status, 307);
    assert.equal(response.headers.get('Location'), url);
    assert.match(response.headers.get('Cache-Control'), /no-store/);
    assert.equal(response.headers.get('Vary'), 'User-Agent');
  }
});
test('desktop or unknown devices can choose their store on the localized download page', () => {
  assert.equal(download.appDownloadDestination('Mozilla/5.0 (Windows NT 10.0)'), '/download');
  const response = route.GET(new Request('https://zuwara.net/api/app-download?lang=ar&redirect=https://example.com'));
  assert.equal(response.headers.get('Location'), '/ar/download');
});
test('homepage card offers both store links and a minimize control in both languages before QR hydration', () => {
  for (const locale of ['en', 'ar']) {
    const Card = load('src/components/AppDownloadCard.tsx', {
      '@/data/site': stores,
      'next/image': { __esModule: true, default: () => null },
      './AppDownloadCard.module.css': {},
    }).default;
    const html = renderToStaticMarkup(React.createElement(Card, { locale }));
    assert.ok(html.includes(`href="${stores.APP_STORE_URL}"`));
    assert.ok(html.includes(stores.GOOGLE_PLAY_URL.replaceAll('&', '&amp;')));
    assert.ok(html.includes(locale === 'ar' ? 'تصغير بطاقة تحميل التطبيق' : 'Minimize app download card'));
    assert.ok(html.includes(`dir="${locale === 'ar' ? 'rtl' : 'ltr'}"`));
  }
});
