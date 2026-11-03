import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const requireDependency = createRequire(import.meta.url);
function load(path, dependencies = {}) {
  const source = fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } });
  const exports = {};
  new Function('require', 'exports', outputText)(name => name in dependencies ? dependencies[name] : requireDependency(name), exports);
  return exports;
}
const { consultantReturn, consultantAuthHref, consultantSignInDestination } = load('src/lib/auth/consultant-return.ts');
const target = '/healthcare/doctors/doctor-test-126';
const search = '?consultantReturn=' + encodeURIComponent(target);

test('consultant sign-in returns to the profile while ordinary sign-in keeps its dashboard destination', () => {
  assert.equal(consultantSignInDestination(search), target + '?bookingSignIn=success');
  assert.equal(consultantSignInDestination(''), '/dashboard');
  for (const path of ['/login-page', '/register-page', '/verify-otp-page']) {
    assert.equal(consultantAuthHref(path, search), path + search);
    assert.equal(consultantAuthHref(path, ''), path);
  }
});

test('return destinations reject external URLs, other flows and injected query parameters', () => {
  for (const value of ['https://example.com', '//example.com', '/dashboard', '/ar/healthcare/doctors/test-126', target + '/book', target + '?redirect=https://example.com', '/healthcare/doctors/../dashboard', '/healthcare/doctors/test%2f126', '/healthcare/doctors/test\\126']) {
    const query = '?consultantReturn=' + encodeURIComponent(value);
    assert.equal(consultantReturn(query), null);
    assert.equal(consultantSignInDestination(query), '/dashboard');
  }
});

test('instant booking context survives login, registration and OTP without changing normal sign-in', () => {
  const instantSearch = search + '&bookingFlow=instant';
  for (const path of ['/login-page', '/register-page', '/verify-otp-page']) {
    assert.equal(consultantAuthHref(path, instantSearch), path + instantSearch);
    assert.equal(consultantAuthHref(path, search), path + search);
    assert.equal(consultantAuthHref(path, '?bookingFlow=instant'), path);
  }
  assert.equal(consultantSignInDestination(instantSearch), target + '?bookingSignIn=success&bookingFlow=instant');
  assert.equal(consultantSignInDestination(search + '&bookingFlow=https://example.com'), target + '?bookingSignIn=success');
  assert.equal(consultantSignInDestination('?bookingFlow=instant'), '/dashboard');
  assert.equal(consultantSignInDestination('?consultantReturn=https://example.com&bookingFlow=instant'), '/dashboard');
});

test('public instant entry returns to the consultant directory after sign-in', () => {
  const query = '?consultantReturn=%2Fhealthcare%2Fdoctors&bookingFlow=public-instant';
  assert.equal(consultantReturn(query), '/healthcare/doctors');
  assert.equal(consultantReturn('?consultantReturn=%2Fhealthcare%2Fdoctors'), null);
  for (const path of ['/login-page', '/register-page', '/verify-otp-page']) assert.equal(consultantAuthHref(path, query), path + query);
  assert.equal(consultantSignInDestination(query), '/healthcare/doctors?bookingSignIn=success&bookingFlow=public-instant');
});

test('instant sign-in popup continues with the selected consultant and retains the dashboard choice', () => {
  for (const locale of ['en', 'ar']) {
    const Popup = load('src/components/healthcare/BookingSignInSuccess.tsx', {
      'next-intl': { useLocale: () => locale },
      '@/i18n/navigation': { Link: ({ children, ...props }) => React.createElement('a', props, children) },
      './booking-sign-in-success.module.css': {},
    }).default;
    const html = renderToStaticMarkup(React.createElement(Popup, { bookingHref: '/dashboard/instant?doctor=126' }));
    assert.ok(html.includes('href="/dashboard/instant?doctor=126"'));
    assert.ok(html.includes('href="/dashboard"'));
    assert.ok(!html.includes(target + '/book'));
  }
});

test('success popup offers booking, dashboard and dismissal actions in both languages', () => {
  for (const locale of ['en', 'ar']) {
    const Popup = load('src/components/healthcare/BookingSignInSuccess.tsx', {
      'next-intl': { useLocale: () => locale },
      '@/i18n/navigation': { Link: ({ children, ...props }) => React.createElement('a', props, children) },
      './booking-sign-in-success.module.css': {},
    }).default;
    const html = renderToStaticMarkup(React.createElement(Popup, { bookingHref: target + '/book' }));
    assert.match(html, /<dialog/);
    assert.ok(html.includes(`dir="${locale === 'ar' ? 'rtl' : 'ltr'}"`));
    assert.ok(html.includes(locale === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Signed in successfully'));
    assert.ok(html.includes(`href="${target}/book"`));
    assert.match(html, /href="\/dashboard"/);
    assert.match(html, /<button type="button"/);
  }
});

test('unauthenticated consultant booking redirects with a locale-preserving return path before patient API calls', async () => {
  for (const locale of ['en', 'ar']) {
    const page = load('src/app/[locale]/healthcare/doctors/[slug]/book/page.tsx', {
      '@/i18n/server-ui-text': { getUiText: async () => text => text },
      '@/lib/api/zuwara/slugs': { idFromSlug: () => 126 },
      'next/navigation': { notFound: () => { throw new Error('Unexpected not found'); }, redirect: path => { throw new Error(path); } },
      '@/lib/auth/session': { readSession: async () => null, patientApi: () => { throw new Error('Unexpected patient API call'); } },
      '@/lib/api/zuwara/booking': { bookingDoctor: () => { throw new Error('Unexpected booking API call'); } },
      '@/lib/api/zuwara/v2': { ZuwaraV2Error: class extends Error {} },
      './ConsultationBooking': { default: () => null },
    }).default;
    await assert.rejects(page({ params: Promise.resolve({ locale, slug: 'doctor-test-126' }) }), error => error.message === `/${locale}/login-page${search}`);
  }
});
