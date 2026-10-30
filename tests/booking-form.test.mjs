import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const requireDependency = createRequire(import.meta.url);

function load(filename, dependencies = {}) {
  const source = fs.readFileSync(new URL('../' + filename, import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } });
  const exports = {};
  new Function('require', 'exports', compiled.outputText)(name => name in dependencies ? dependencies[name] : requireDependency(name), exports);
  return exports;
}

function render(types, locale) {
  const component = load('src/app/[locale]/healthcare/doctors/[slug]/book/ConsultationBooking.tsx', {
    '@/i18n/use-ui-text': { useUiText: () => value => value },
    'next-intl': { useLocale: () => locale },
    '@/i18n/navigation': { Link: ({ children, ...props }) => React.createElement('a', props, children), useRouter: () => ({}) },
    '@/lib/api/zuwara/booking-errors': load('src/lib/api/zuwara/booking-errors.ts'),
    '@/lib/api/zuwara/booking-options': load('src/lib/api/zuwara/booking-options.ts'),
    '@/lib/api/zuwara/slugs': { doctorSlug: (_name, id) => 'test-' + id },
    './actions': { slotsAction: () => { throw new Error('Unexpected API call'); }, previewAction: () => { throw new Error('Unexpected preview'); }, createBookingAction: () => { throw new Error('Unexpected creation'); } },
    './consultation-booking.module.css': new Proxy({}, { get: (_target, name) => name === '__esModule' ? false : String(name) }),
  }).default;
  return renderToStaticMarkup(React.createElement(component, {
    doctor: { id: 126, name: 'Test consultant', name_ar: null, consultation_types: types, duration_options: [{ minutes: 15, price_halalas: 100 }] },
    dependents: [], today: '2026-11-02',
  }));
}

test('the booking form hides consultation choices in both languages', () => {
  for (const locale of ['en', 'ar']) {
    const html = render(['chat', 'audio', 'video', 'clinic'], locale);
    const radios = html.match(/<input[^>]*name="consultation-type"[^>]*>/g) || [];
    assert.equal(radios.length, 0);
    assert.match(html, /<button[^>]*type="submit"[^>]*disabled/);
    assert.ok(html.includes(locale === 'ar' ? 'اشرح مشكلتك' : 'Explain your problem'));
    assert.doesNotMatch(html, /In person|Online consultation|Choose your consultation type/);
  }
});

test('multiple supported categories do not expose a consultation selector', () => {
  const html = render(['online', 'clinic'], 'en');
  const radios = html.match(/<input[^>]*name="consultation-type"[^>]*>/g) || [];
  assert.equal(radios.length, 0);
  assert.doesNotMatch(html, /Online consultation|In person/);
});

test('a catalogue containing only channels cannot silently enable online booking', () => {
  const html = render(['chat', 'audio', 'video'], 'en');
  assert.doesNotMatch(html, /<input[^>]*name="consultation-type"/);
  assert.match(html, /Booking options for this consultant are temporarily unavailable/);
  assert.match(html, /<button[^>]*type="submit"[^>]*disabled/);
});
