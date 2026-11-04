import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

function service(payload, ok = true) {
  const calls = [];
  const source = fs.readFileSync(new URL('../src/lib/api/zuwara/interest-fields.ts', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const exports = {};
  new Function('require', 'exports', 'fetch', outputText)(name => {
    assert.equal(name, 'server-only'); return {};
  }, exports, async (url, options) => { calls.push({ url, options }); return { ok, json: async () => payload }; });
  return { ...exports, calls };
}
test('public catalogue uses the supplied endpoint and its status:true envelope without sending patient credentials', async () => {
  const row = { id: 17, title: 'Nutrition', title_ar: 'التغذية', interest_code: 'NUT-001' };
  const api = service({ status: true, data: [row, row] });
  assert.deepEqual(await api.interestFields(undefined, 'ar'), [row]);
  assert.ok(api.calls[0].url.endsWith('/interest-fields'));
  assert.equal(api.calls[0].options.headers['Accept-Language'], 'ar');
  assert.equal(api.calls[0].options.headers.Authorization, undefined);
  assert.equal(api.calls[0].options.cache, 'no-store');
});
test('selected category ID is passed exactly and an empty category is not replaced with unrelated interests', async () => {
  const api = service({ status: true, data: [] });
  assert.deepEqual(await api.interestFields(2), []);
  assert.ok(api.calls[0].url.endsWith('/interest-fields?category_id=2'));
  assert.equal(api.calls.length, 1);
});
test('invalid category values and malformed catalogue responses are rejected', async () => {
  const api = service({ status: true, data: [] });
  for (const id of [0, -1, 1.5, '2', NaN]) await assert.rejects(api.interestFields(id));
  assert.equal(api.calls.length, 0);
  await assert.rejects(service({ status: false, data: [] }).interestFields());
  await assert.rejects(service({ status: true, data: [{ id: 1, title: null }] }).interestFields());
  await assert.rejects(service({ status: true, data: [] }, false).interestFields());
});
