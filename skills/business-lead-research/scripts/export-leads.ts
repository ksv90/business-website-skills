import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

type Row = Record<string, unknown>;
export type LeadData = { schema_version: number; campaign_id: string; leads: Row[]; evidence: Row[] };
const websiteStates = ['present', 'not_found', 'social_only', 'broken', 'parked', 'unknown'];
const listingStates = ['present', 'absent', 'blocked', 'unknown'];
const qualificationStates = ['qualified', 'review', 'excluded'];
const outreachStates = ['not_contacted', 'permission_to_send', 'sent', 'replied', 'won', 'lost', 'do_not_contact'];
const evidenceKinds = ['identity', 'listing', 'search', 'website', 'contact', 'rights', 'owner_confirmation'];

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
function row(value: unknown): value is Row {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function nonempty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
function date(value: unknown): boolean {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value));
}
function url(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password;
  } catch { return false; }
}

export function validateData(input: unknown): asserts input is LeadData {
  ensure(row(input) && input.schema_version === 1, 'Expected schema_version 1');
  ensure(nonempty(input.campaign_id), 'campaign_id is required');
  ensure(Array.isArray(input.leads) && Array.isArray(input.evidence), 'leads and evidence must be arrays');
  const leads = new Map<string, Row>();
  for (const lead of input.leads) {
    ensure(row(lead), 'Lead must be an object');
    ensure(nonempty(lead.id) && !leads.has(lead.id), 'Lead IDs must be unique and nonempty');
    const id = lead.id;
    for (const field of ['name', 'niche', 'city', 'reason', 'opportunity', 'next_action']) {
      ensure(nonempty(lead[field]), `${id}: missing ${field}`);
    }
    for (const field of ['group_id', 'address', 'phone', 'email']) {
      ensure(lead[field] === null || nonempty(lead[field]), `${id}: ${field} must be text or null`);
    }
    for (const field of ['listing_url', 'website_url', 'messenger_url']) {
      ensure(lead[field] === null || url(lead[field]), `${id}: invalid ${field}`);
    }
    ensure(websiteStates.includes(String(lead.website_status)), `${id}: invalid website_status`);
    ensure(listingStates.includes(String(lead.listing_website)), `${id}: invalid listing_website`);
    ensure(qualificationStates.includes(String(lead.qualification)), `${id}: invalid qualification`);
    ensure(['low', 'medium', 'high'].includes(String(lead.confidence)), `${id}: invalid confidence`);
    ensure(outreachStates.includes(String(lead.outreach_status)), `${id}: invalid outreach_status`);
    ensure(typeof lead.do_not_contact === 'boolean', `${id}: do_not_contact must be boolean`);
    ensure(typeof lead.score === 'number' && Number.isFinite(lead.score) && lead.score >= 0 && lead.score <= 100, `${id}: invalid score`);
    ensure(date(lead.checked_at), `${id}: checked_at must be an ISO timestamp with timezone`);
    ensure(Array.isArray(lead.evidence_ids) && lead.evidence_ids.length > 0 && lead.evidence_ids.every(nonempty), `${id}: evidence_ids required`);
    ensure(new Set(lead.evidence_ids).size === lead.evidence_ids.length, `${id}: duplicate evidence reference`);
    if (['not_found', 'social_only'].includes(String(lead.website_status))) {
      ensure(lead.confidence !== 'high', `${id}: negative search cannot have high confidence`);
    }
    if (['present', 'broken', 'parked'].includes(String(lead.website_status))) {
      ensure(url(lead.website_url), `${id}: identified website requires URL`);
    }
    if (lead.qualification === 'qualified') {
      ensure(lead.website_status !== 'unknown', `${id}: unknown website cannot be qualified`);
      ensure(!lead.do_not_contact && lead.outreach_status !== 'do_not_contact', `${id}: suppressed lead cannot be qualified`);
      ensure(lead.phone || lead.email || lead.messenger_url, `${id}: qualified lead requires a contact`);
    }
    leads.set(id, lead);
  }
  const evidenceMap = new Map<string, Row>();
  for (const item of input.evidence) {
    ensure(row(item), 'Evidence must be an object');
    ensure(nonempty(item.id) && !evidenceMap.has(item.id), 'Evidence IDs must be unique and nonempty');
    ensure(nonempty(item.lead_id) && leads.has(item.lead_id), `${item.id}: unknown lead_id`);
    ensure(evidenceKinds.includes(String(item.kind)), `${item.id}: invalid evidence kind`);
    ensure(url(item.source_url), `${item.id}: source_url required`);
    ensure(item.query === null || nonempty(item.query), `${item.id}: query must be text or null`);
    ensure(date(item.checked_at), `${item.id}: invalid checked_at`);
    ensure(nonempty(item.observation) && nonempty(item.retention_basis), `${item.id}: observation and retention_basis required`);
    evidenceMap.set(item.id, item);
  }
  for (const [id, lead] of leads) {
    for (const evidenceId of lead.evidence_ids as string[]) {
      ensure(evidenceMap.get(evidenceId)?.lead_id === id, `${id}: missing or cross-lead evidence ${evidenceId}`);
    }
  }
}

const columns = [
  ['score', 'Приоритет'], ['qualification', 'Отбор'], ['name', 'Организация'],
  ['niche', 'Ниша'], ['city', 'Город'], ['address', 'Адрес'],
  ['website_status', 'Статус сайта'], ['website_url', 'Сайт'], ['phone', 'Телефон'],
  ['email', 'Email'], ['messenger_url', 'Мессенджер'], ['reason', 'Причина'],
  ['opportunity', 'Предложение'], ['next_action', 'Следующий шаг'], ['listing_url', 'Карточка'],
  ['listing_website', 'Ссылка в карточке'], ['confidence', 'Уверенность'],
  ['checked_at', 'Проверено'], ['evidence_ids', 'Источники'], ['do_not_contact', 'Не контактировать'],
  ['outreach_status', 'Этап'], ['id', 'ID'], ['group_id', 'Группа'],
] as const;
const evidenceColumns = ['id', 'lead_id', 'kind', 'source_url', 'query', 'checked_at', 'observation', 'retention_basis'];
const display = (value: unknown): string => value == null ? '' : Array.isArray(value) ? value.join('; ') : String(value);
export function csvCell(value: unknown): string {
  let text = display(value);
  if (/^[\s\u0000-\u001f]*[=+@-]/u.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function escapeHtml(value: unknown): string {
  return display(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
function csv(headers: readonly string[], rows: unknown[][]): string {
  return '\uFEFF' + [headers, ...rows].map(values => values.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
export function render(data: LeadData): { leadsCsv: string; evidenceCsv: string; html: string } {
  validateData(data);
  const sorted = [...data.leads].sort((a, b) => qualificationStates.indexOf(String(a.qualification)) - qualificationStates.indexOf(String(b.qualification)) || Number(b.score) - Number(a.score) || String(a.id).localeCompare(String(b.id)));
  const counts = qualificationStates.map(state => `${state}: ${sorted.filter(lead => lead.qualification === state).length}`).join(' · ');
  const table = (headers: readonly string[], rows: unknown[][]) => `<table><thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(values => `<tr>${values.map(value => `<td>${url(value) ? `<a href="${escapeHtml(value)}" rel="noreferrer">${escapeHtml(value)}</a>` : escapeHtml(value)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const leadRows = sorted.map(lead => columns.map(([field]) => lead[field]));
  const evidenceRows = data.evidence.map(item => evidenceColumns.map(field => item[field]));
  return {
    leadsCsv: csv(columns.map(([, title]) => title), leadRows),
    evidenceCsv: csv(evidenceColumns, evidenceRows),
    html: `<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Лиды — ${escapeHtml(data.campaign_id)}</title><style>body{font:15px/1.5 system-ui;margin:24px;color:#18212f}table{border-collapse:collapse;font-size:13px}th,td{border:1px solid #d8dee8;padding:8px;min-width:120px;vertical-align:top;white-space:pre-wrap}th{position:sticky;top:0;background:#eaf0f6;text-align:left}section{overflow:auto;max-height:70vh}a{color:#145ab8}input{padding:10px;min-width:280px}</style><h1>Лиды — ${escapeHtml(data.campaign_id)}</h1><p>${escapeHtml(counts)}. Всего: ${sorted.length}.</p><p>Пусто = неизвестно/не указано. not_found = сайт не найден после проверки, а не доказанное отсутствие. social_only = найдены только соцсети; present = сайт найден; broken = подтверждённый сбой; parked = парковка; unknown = проверка не завершена.</p><label>Поиск по таблице <input id="filter" type="search"></label><section id="leads">${table(columns.map(([, title]) => title), leadRows)}</section><h2>Доказательства</h2><section>${table(evidenceColumns, evidenceRows)}</section><script>document.getElementById('filter').addEventListener('input', function(){const q=this.value.toLocaleLowerCase();document.querySelectorAll('#leads tbody tr').forEach(row=>{row.hidden=!row.textContent.toLocaleLowerCase().includes(q)})});</script></html>`,
  };
}

async function main() {
  const [inputPath, outputPath] = process.argv.slice(2);
  ensure(inputPath && outputPath && process.argv.length === 4, 'Usage: node export-leads.ts leads.json output-directory');
  const data: unknown = JSON.parse(await readFile(resolve(inputPath), 'utf8'));
  validateData(data);
  const output = render(data);
  await mkdir(resolve(outputPath), { recursive: true });
  // Exclusive creation prevents accidental replacement of a reviewed export.
  await writeFile(resolve(outputPath, 'leads.csv'), output.leadsCsv, { flag: 'wx' });
  await writeFile(resolve(outputPath, 'evidence.csv'), output.evidenceCsv, { flag: 'wx' });
  await writeFile(resolve(outputPath, 'leads.html'), output.html, { flag: 'wx' });
  console.log(`Exported ${data.leads.length} leads to ${resolve(outputPath)}`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
