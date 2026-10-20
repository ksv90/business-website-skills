import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateData, render, csvCell, escapeHtml } from '../skills/business-lead-research/scripts/export-leads.ts';

const fixture = JSON.parse(await readFile(new URL('./fixtures/synthetic-leads.json', import.meta.url), 'utf8'));

test('valid evidence-linked lead exports as UTF-8 CSV and escaped HTML', () => {
  validateData(fixture);
  const output = render(fixture);
  assert(output.leadsCsv.startsWith('\uFEFF'));
  assert(output.leadsCsv.includes('"\'+70000000000"'));
  assert(output.html.includes('Синтетическая мастерская'));
  assert(output.evidenceCsv.includes('synthetic-e1'));
});

test('spreadsheet payloads are literal; CSV quotes and newlines survive', () => {
  for (const value of ['=1+1', '+1', '-1', '@SUM(A1)', ' \t=HYPERLINK("x")', '\r=1']) {
    assert(csvCell(value).startsWith('"\''));
  }
  assert.equal(csvCell('a,"b"\nc'), '"a,""b""\nc"');
  assert.equal(csvCell(null), '""');
});

test('HTML content cannot become active markup', () => {
  const changed = structuredClone(fixture);
  changed.leads[0].name = '<script>alert(1)</script>';
  const output = render(changed);
  assert(!output.html.includes('<script>alert(1)</script>'));
  assert(output.html.includes('&lt;script&gt;'));
  assert.equal(escapeHtml('"<&'), '&quot;&lt;&amp;');
});

test('unknown, suppressed and unsupported negative conclusions are rejected', () => {
  for (const patch of [
    { website_status: 'unknown' }, { do_not_contact: true },
    { confidence: 'high' }, { phone: null, email: null, messenger_url: null },
  ]) {
    const changed = structuredClone(fixture);
    Object.assign(changed.leads[0], patch);
    assert.throws(() => validateData(changed));
  }
});

test('duplicate identities, broken evidence references and unsafe URLs are rejected', () => {
  const duplicate = structuredClone(fixture);
  duplicate.leads.push(structuredClone(duplicate.leads[0]));
  assert.throws(() => validateData(duplicate), /unique/);
  const missing = structuredClone(fixture);
  missing.leads[0].evidence_ids = ['missing'];
  assert.throws(() => validateData(missing), /evidence/);
  const unsafe = structuredClone(fixture);
  unsafe.leads[0].website_url = 'javascript:alert(1)';
  assert.throws(() => validateData(unsafe), /website_url/);
});

test('identified website requires URL; report accepts empty completed batch', () => {
  const changed = structuredClone(fixture);
  changed.leads[0].website_status = 'present';
  assert.throws(() => validateData(changed), /requires URL/);
  const empty = { schema_version: 1, campaign_id: 'empty-test', leads: [], evidence: [] };
  assert(render(empty).html.includes('Всего: 0'));
});
