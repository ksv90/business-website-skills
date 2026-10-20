# Sources, access and CAPTCHA

Choose a source per operation: discovery, identity verification, website detection,
or reusable website content. Permission for one operation does not imply the others.
Record the current terms/contract checked, allowed retention and attribution in the
campaign. Public visibility does not automatically grant bulk reuse or photo rights.

## Source selection

| Source | Useful for | Before using at scale |
| --- | --- | --- |
| User-owned CRM/export | Existing prospects and suppression | Confirm scope, age and permission to use |
| Licensed business-directory export | Repeatable prospect collection | Contract must permit lead storage and intended reuse |
| Yandex Maps / Business | Local discovery and identity | Distinguish browser, API and commercial data products |
| 2GIS | Local categories, branches and contacts | Check product contract, API fields, quotas and export rights |
| Google Maps / Places | International discovery | Check storage/display/attribution restrictions |
| Search engines | Independent website discovery | Respect provider access limits; snippets are leads, not final proof |
| Company-controlled social profiles | Official contacts and website links | Verify owner identity; avoid private/personal data |
| Chambers, associations, municipal open data | Local business discovery | Check licence, coverage and age |
| OpenStreetMap data | Supplemental discovery | Observe ODbL/attribution and chosen service limits |

If retention terms are unclear, do not use that source to populate a permanent
export. Choose a suitable licensed source or independently permitted first-party
source. Do not launder restricted provider data through another format or search
snippet. A browser is an access fallback, not a way to cancel API restrictions.

## Access state machine

`available → rate_limited | captcha_required | login_required | unavailable`.
Persist the state separately from each company's website status.

- Prefer a documented connector/API or licensed export that supports the intended
  task. Obtain a key only through the user's established credential workflow.
- In normal permitted browser access, reuse the existing session and modest
  batches. Follow provider limits. For 429 honor Retry-After and the campaign budget;
  allow at most two transient retries, then checkpoint and switch sources.
- For CAPTCHA stop automated interaction with that challenge. Do not build an
  evasion system using fingerprint spoofing, proxy/account rotation, token replay
  or CAPTCHA-solving services. Automated solving is not a dependable product design.
- Continue independent checks through another permitted source. Never interpret
  a blocked listing or a blocked website as “no website”.
- If the blocked source is still necessary, keep its tab open and request the
  user's manual completion once. Resume in the same tab after confirmation and
  verify that the intended page loaded. The agent must not tick “I am not a robot”
  on the user's behalf. If unavailable, retain the unresolved record and continue.
- For login, payment or a new paid data subscription, explain exactly what is needed;
  complete all independent research first. Never silently buy access.

This makes manual CAPTCHA an exceptional recovery path. It cannot promise fully
unattended Yandex scraping. Reliable automation comes from suitable data access and
source diversity, not a guarantee that challenges will disappear.

## Official starting points (reviewed 2026-10-20)

- [Yandex organization-search API](https://yandex.ru/dev/commercial/doc/ru/concepts/geosearch)
  describes restrictions on saving its results.
- [Yandex organization-search product](https://yandex.ru/project/maps/api/search_rules/)
  describes client-base use cases. This is not proof that the API above has the
  same licence: verify the exact purchased product and its offer before exporting.
- [Yandex Maps terms](https://www.yandex.ru/legal/maps_termsofuse/ru/).
- [2GIS organization API](https://docs.2gis.com/api/search/places/overview).
- [Google Places policies](https://developers.google.com/maps/documentation/places/web-service/policies)
  include retention exceptions such as place IDs; do not assume unrestricted storage.
- [Nominatim policy](https://operations.osmfoundation.org/policies/nominatim/): the
  public geocoder is not a bulk POI-harvesting endpoint. For larger OSM work choose
  an appropriate data extract/service with its own limits and licence.

Re-read current official terms for the selected product when executing a campaign.
This reference is an operational routing guide, not legal advice or a stored licence.
