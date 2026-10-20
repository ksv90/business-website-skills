# Lead data and table contract

Canonical interchange: JSON object with `schema_version: 1`, `campaign_id`, `leads`
and `evidence`. See [template](../assets/leads.template.json). Empty arrays mean no
research yet, not zero businesses in the market. Unknown scalar values are `null`.
Copy [lead record](../assets/lead-record.template.json) and
[evidence record](../assets/evidence-record.template.json) into the corresponding arrays,
then fill from research. These blank record templates intentionally cannot pass export
validation until identity, observation, timestamp and provenance fields are supplied.
Do not put invented example businesses in a live prospect table.

Each lead contains:

| Field | Meaning |
| --- | --- |
| id / group_id | Stable campaign lead ID / optional parent business |
| name / niche / city / address | Business identity and segment |
| listing_url / listing_website | Discovery reference and independent link-field status |
| phone / email / messenger_url | Public business contacts, strings or null |
| website_url / website_status | Candidate/official URL and verification outcome |
| confidence / checked_at | low, medium, high / ISO timestamp including timezone |
| evidence_ids | IDs supporting identity, contact and website conclusion |
| qualification / score / reason | qualified, review, excluded / 0–100 / explanation |
| opportunity / next_action | Specific website gap and next task |
| do_not_contact / outreach_status | Suppression flag / actual sales stage |

`outreach_status`: not_contacted, permission_to_send, sent, replied, won, lost,
do_not_contact. Do not advance it based on a prepared draft. Preserve opt-outs.

Each evidence item: `id`, `lead_id`, `kind` (identity, listing, search, website,
contact, rights, owner_confirmation), `source_url`, `query` (nullable), `checked_at`,
`observation`, `retention_basis`. Retention basis identifies an actual licence,
first-party source, user-provided permission or other verified basis, not merely
“public”. Store only permitted observations; do not archive full pages or photos by
default. Unknown rights mean choose another source before including restricted data.

The schema allows additional fields for CRM compatibility. The exporter validates
required fields, enums, dates, unique IDs and evidence links; semantic accuracy still
requires the agent's verification. The schema is the minimum interchange, not a claim
that machine validation proves ownership or source rights.

## Human-facing table

Put priority, organization, niche/location, website verdict, website URL, phone,
messenger, reason and next action first. Include listing link, confidence, timestamp
and evidence IDs. Keep raw evidence in its own tab/file. Use a status legend and
filters, never color alone. Format phone/email/IDs as text; render null as blank with
the legend “blank = unknown/not supplied”. Never display unknown price as zero.

Sort qualified records by score, then review, then excluded. Respect suppression even
for highly ranked prospects. Export all records so exclusions and uncertainty remain
auditable. Include counts and coverage separately from the table.

The bundled CSV starts with UTF-8 BOM, quotes fields and neutralizes formula prefixes
(`=`, `+`, `-`, `@` and control/space-prefixed variants). HTML escapes all source text.
Consumers must still import phone and ID columns as text. CSV cannot preserve all
spreadsheet formatting; use a spreadsheet tool when a formatted workbook is requested.

## Campaign report

Include actual discovered, unique, qualified, review, excluded and suppressed counts;
deduplication count; sources attempted and blocked; query coverage; start/end times;
paid requests/cost if used; freshness and known limitations; paths to JSON, table and
evidence. Do not calculate “market coverage %” without a known denominator.
