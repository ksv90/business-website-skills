# Website verification

## Status vocabulary

| ID | Meaning | Default no-site campaign |
| --- | --- | --- |
| present | Working official website, including a valid hosted builder site | Exclude or route to separate approved redesign offer |
| not_found | Required accessible checks completed; official site not found | Candidate; never claim proven absence |
| social_only | Official social/directory presence found; required site search complete | Candidate; say exactly what exists |
| broken | Official website identified, persistent observable failure | Separate recovery opportunity |
| parked | Official/linked domain shows parking or for-sale page | Separate opportunity; verify ownership link |
| unknown | Unfinished, blocked, conflicting or ambiguous checks | Review queue, not qualified as no-site |

Record `listing_website`: `present`, `absent`, `blocked`, or `unknown` independently.
“Absent” is allowed only after inspecting the relevant listing field. A listing can
have no website link while the business has a working site found elsewhere.

## Required bounded search

1. Inspect the source listing and website/contact links if accessible.
2. Search exact business name + city/address; account for spelling and brand aliases.
3. Search the public business phone with country-code/local formatting variants when
   available. If no phone exists, record this and search a second identity cue.
4. Inspect a second independent source or an official social profile for website links.
5. Open plausible sites; follow their actual redirects and match organization identity.

Record query/URL, timestamp, outcome and coverage for each step. For search results,
inspect up to the first five plausible candidates per query; stop sooner on a verified
match. If relevant checks are blocked or time expires, use `unknown`, not `not_found`.
Search engines have incomplete coverage; even completed negative checks have at most
medium confidence. Owner confirmation can be recorded separately with date and source.

Match at least two meaningful cues (for example exact phone and address, or brand and
branch address). A shared brand name alone is insufficient. A chain's official branch
page counts as an existing website for that branch. A booking marketplace, social page
or directory card is not a standalone site; a business-controlled hosted builder site
can be. A link shortener is a candidate: inspect its destination before classifying.

## Availability and ambiguity

An HTTP success code alone cannot verify a website. Inspect rendered title/content,
contact identity and whether it is a parked domain or unrelated business. A certificate
error, 403, CAPTCHA or timeout in the agent environment does not establish that visitors
cannot access the site. Confirm with a second access method or later attempt within
budget; otherwise retain `unknown` with the observed failure. Do not disable TLS checks
or evade access controls. Record old and final URLs for redirects.

## Deduplication

Use stable provider ID/URL when permitted plus normalized name, city, address and phone.
Do not merge solely on a shared call-centre number or similar business names. Keep
branches distinct when location matters; use a parent/group ID to avoid repeated sales
contact to the same owner. Record merge reasons and retain source references. Normalize
phones for comparison while preserving the original displayed value. Never guess a
country code when the country is unknown.
