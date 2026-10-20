# Contacts and integrations

Maintain a small integration table: feature, destination/provider, demo behavior,
production behavior, credentials owner, verification and blocker.

## Phone and messengers

Use a verified business number for `tel:` with an unambiguous international format;
preserve familiar display formatting. A phone number does not prove a messenger account.
For MAX or any other messenger, obtain the actual company profile/chat/deep link from
the owner or a verified company-controlled source. Open it in browser/mobile context
to check destination without sending a message. Consult the current official help/API
for the relevant link type; bot links and personal-chat links are not interchangeable.

For Russian-market sites consider MAX as requested by the brief. If no verified MAX
link exists, omit that control and record a launch question; do not invent `max://`
or concatenate a phone into an assumed URL. Keep a working phone or other confirmed
contact alternative. Do not promise every visitor has an app installed.

## Forms

Demo: disable submission with an explicit demo explanation, or use a clearly isolated
test endpoint that never reaches the business/CRM. No fake “message sent” state.
Production: agreed destination and data processor, minimal fields, field labels,
client and server validation, pending/success/error states, duplicate submission guard,
spam controls suitable to the environment, safe logging and secrets only on the server.
An HTTP response is not proof a lead reached its intended destination: verify receipt
in an authorized test channel using synthetic data. Never send a test lead to a real
business without authorization.

Document what is stored, where, for how long and who can access it. Determine applicable
privacy/consent requirements from current authoritative local sources before launch;
do not generate a claim of legal compliance from a generic template. Avoid unnecessary
sensitive data. Production analytics/cookies follow the agreed market requirements.

## Booking, payments, CRM

Use a provider's supported integration and test environment when available. Document
account ownership and recurring fees. Booking requires timezone, availability authority,
conflict handling and confirmation/cancellation semantics. Payment requires server-side
amount authority, verified callbacks, idempotent order updates and ambiguous outcome
handling. Never collect card details in a homemade form or treat a return URL alone as
confirmed payment. CRM/webhook retries must not create duplicate leads.

## Maps, analytics and SEO

Prefer a verified route/map link for early demos. Embeds require appropriate licence,
attribution and load/privacy review. Analytics are off in demos unless specifically
needed and authorized. Production events measure real CTA/form outcomes, not simulated
conversion. Use title, description, canonical URL, sitemap and structured data only
where their facts and production URLs are known. Do not add fake ratings to schema.

Demo uses noindex metadata/header and stays out of production sitemap. Noindex is not
access control; use a private/password-protected preview for restricted content.
