import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

function adapter() {
  const calls = [];
  const response = { success: true, data: { request_uuid: '12345678-1234-1234-1234-123456789abc', appointment_id: null, checkout: null, pricing_summary: null, can_pay: false, extra_backend_field: { retained: true } }, meta: { request_id: 'test' } };
  const source = fs.readFileSync(new URL('../src/lib/api/zuwara/instant.ts', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const exports = {};
  new Function('require', 'exports', outputText)(name => {
    if (name === 'server-only') return {};
    if (name === '@/lib/auth/session') return { patientApi: async (path, options) => { calls.push({ path, options }); return response; } };
    throw new Error('Unexpected dependency: ' + name);
  }, exports);
  return { api: exports, calls, response };
}
const uuid = '12345678-1234-1234-1234-123456789abc';
const input = { duration_id: 1, consultation_type: 'online', doctor_id: 10, problem: 'Symptoms', payment_method: 'wallet', coupon_id: 2, coupon_code: 'TEST', payable_amount: '0.00' };

test('private initiation never sends payment, coupons or client amounts and retains the full response', async () => {
  const { api, calls, response } = adapter();
  assert.equal(await api.createInstant('private', input, 'stable-key-123'), response);
  assert.deepEqual(calls[0], { path: '/instant-appointments/private', options: { method: 'POST', idempotencyKey: 'stable-key-123', body: { duration_id: 1, consultation_type: 'online', communication_type: 'video', patient_id: undefined, doctor_id: 10, problem: 'Symptoms' } } });
  assert.equal(response.data.appointment_id, null);
  assert.deepEqual(response.data.extra_backend_field, { retained: true });
});
test('public creation sends payment with a stable retry key and never a doctor or client-calculated total', async () => {
  const { api, calls } = adapter();
  await api.createInstant('public', input, 'stable-key-123');
  await api.createInstant('public', input, 'stable-key-123');
  assert.equal(calls[0].options.body.payment_method, 'wallet');
  assert.equal(calls[0].options.body.doctor_id, undefined);
  assert.equal(calls[0].options.body.payable_amount, undefined);
  assert.equal(calls[0].options.idempotencyKey, calls[1].options.idempotencyKey);
});
test('instant payment, cancellation, session and confirmation use only request-bound routes', async () => {
  const { api, calls } = adapter();
  await api.payInstant(uuid, { payment_method: 'wallet' }, 'pay-key-123');
  await api.cancelInstant(uuid, 'cancel-key-123');
  await api.instantCheckout(uuid, uuid);
  await api.instantCheckout(uuid, uuid, 'session');
  await api.instantCheckout(uuid, uuid, 'confirm', 'gateway-payment');
  await api.instantCheckout(uuid, uuid, 'confirm');
  assert.deepEqual(calls.map(row => row.path), [
    `/instant-appointments/${uuid}/pay`, `/instant-appointments/${uuid}/cancel`,
    `/instant-appointments/${uuid}/checkouts/${uuid}`, `/instant-appointments/${uuid}/checkouts/${uuid}/session`,
    `/instant-appointments/${uuid}/checkouts/${uuid}/confirm`, `/instant-appointments/${uuid}/checkouts/${uuid}/confirm`,
  ]);
  assert.deepEqual(calls[3].options.body, {});
  assert.deepEqual(calls[4].options.body, { payment_id: 'gateway-payment' });
  assert.deepEqual(calls[5].options.body, {});
});
test('invalid inputs are rejected before any authenticated API call', () => {
  const { api, calls } = adapter();
  for (const bad of [{ ...input, consultation_type: 'clinic' }, { ...input, problem: 'x'.repeat(556) }, { ...input, duration_id: 0 }, { ...input, payment_method: 'tamara', wallet_recharge_id: 1 }, { ...input, coupon_code: '' }]) {
    assert.throws(() => api.createInstant('public', bad, 'valid-key-123'));
  }
  assert.throws(() => api.createInstant('private', { ...input, doctor_id: undefined }, 'valid-key-123'));
  assert.throws(() => api.createInstant('public', input, 'short'));
  assert.throws(() => api.readInstant('../appointments'));
  assert.throws(() => api.instantCheckout(uuid, '../checkout'));
  assert.throws(() => api.instantHistory(0));
  assert.equal(calls.length, 0);
});
test('instant MyFatoorah initiation requires explicit web acceptance activation', () => {
  const before = process.env.INSTANT_MYFATOORAH_WEB_ENABLED;
  delete process.env.INSTANT_MYFATOORAH_WEB_ENABLED;
  try { const { api, calls } = adapter(); assert.throws(() => api.createInstant('public', { ...input, payment_method: 'myfatoorah' }, 'stable-key-123')); assert.equal(calls.length, 0); }
  finally { if (before !== undefined) process.env.INSTANT_MYFATOORAH_WEB_ENABLED = before; }
});

function renderRequest(data, locale = 'en') {
  const requireDependency = createRequire(import.meta.url);
  const source = fs.readFileSync(new URL('../src/app/[locale]/dashboard/instant/InstantFlow.tsx', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } });
  const exports = {};
  new Function('require', 'exports', outputText)(name => {
    if (name === './actions') return {};
    if (name === 'next/script') return { __esModule: true, default: () => null };
    if (name === '@/i18n/navigation') return { Link: ({ children, ...props }) => React.createElement('a', props, children) };
    if (name === './instant.module.css') return {};
    return requireDependency(name);
  }, exports);
  return renderToStaticMarkup(React.createElement(exports.default, { locale, identity: 'patient', settings: { enabled: true, durations: [] }, initial: { success: true, data }, history: { success: true, data: [] }, categories: [], consultants: [], dependents: [], selectedDoctor: '', cardEnabled: false }));
}
test('only an accepted request with an appointment ID exposes the appointment screen', () => {
  for (const locale of ['en', 'ar']) {
    const row = { request_uuid: uuid, type: 'private', duration_minutes: 30, request_status: 'accepted_awaiting_payment', appointment_id: null, can_pay: true, checkout: null };
    const pending = renderRequest(row, locale);
    assert.ok(!pending.includes('href="/dashboard/appointments/'));
    assert.ok(pending.includes(locale === 'ar' ? 'دفع الطلب المقبول' : 'Pay for accepted request'));
    assert.ok(pending.includes(locale === 'ar' ? 'استجابة الطلب الكاملة' : 'Full request response'));
    const accepted = renderRequest({ ...row, request_status: 'accepted', appointment_id: 42, can_pay: false }, locale);
    assert.ok(accepted.includes('href="/dashboard/appointments/42"'));
  }
});
test('existing and uncertain checkouts cannot expose a new private payment or a payment resume action', () => {
  for (const status of ['creating', 'verifying', 'review_required', 'unknown']) {
    const html = renderRequest({ request_uuid: uuid, type: 'private', request_status: 'accepted_awaiting_payment', can_pay: true, checkout: { checkout_id: uuid, gateway: 'tamara', status, paid: false, amount: '115.00', currency: 'SAR', checkout_url: 'https://checkout.tamara.co/test' } });
    assert.ok(!html.includes('Pay for accepted request'));
    assert.ok(!html.includes('Continue Tamara payment'));
    assert.ok(html.includes('Refresh payment'));
  }
});
