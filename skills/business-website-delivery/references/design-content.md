# Design, content and editability

## Visitor sequence

Within the first screen make service, location/coverage and primary action clear.
Use a specific heading supported by evidence, one useful explanation and a visible CTA.
Choose a visual direction appropriate to the business: clean spacing, restrained color,
strong type hierarchy, good contrast and purposeful imagery. Minimal does not mean
generic. Respect an established brand when supplied.

Select sections to answer actual visitor questions:

| Section candidate | Include when |
| --- | --- |
| Services / solutions | Visitors must choose between verified offerings |
| Prices or price factors | Accurate current prices exist, or factors can be explained honestly |
| Process | Actual steps are known; otherwise obtain confirmation |
| Work / portfolio | Authentic work and publication rights exist |
| Reasons to choose | Each claim has evidence, rather than invented advantages |
| Team / credentials | Verified identities, qualifications and image rights exist |
| Reviews | Authentic and reusable testimonials are available |
| FAQ | Answers are known and remove real uncertainty |
| Contacts / route / hours | Details have been verified for this branch |

Do not require every section. Remove unsupported blocks and duplicates. Avoid meaningless
badges, false counters, fabricated discounts and countdowns. Keep a direct phone/contact
route available even if the preferred messenger is absent.

## Responsive interaction

Design content-first for small screens and expand to desktop. Use readable text lengths,
fluid grids and intrinsic image sizes. Prevent horizontal overflow and layout shift.
Allow 200% zoom, visible focus, logical heading order, descriptive labels and meaningful
alt text; decorative images have empty alt text. Prefer controls at least 44×44 CSS pixels
as a design target. Avoid hover-only content and animation that ignores reduced motion.
Sticky mobile actions must not cover content, fields, consent text or browser controls.

## Editable implementation

Separate company content from layout in typed data/CMS fields appropriate to the stack:
name, descriptions, services, prices with units, hours, address, contact destinations,
image paths/alt/rights and theme. Do not expose deployment secrets in that content layer.
Supply a short edit guide locating these values and explaining rebuild/publish needs.

Keep dependencies modest, optimize local images and fonts, lazy-load below-the-fold
media, and defer heavy embeds. A map link may be better than a blocking map widget.
Use semantic HTML where the platform supports it. Good visuals and performance must
be checked in the rendered output; source inspection alone is insufficient.

## Demo presentation

Use a discreet but visible “Демонстрационный вариант — не официальный сайт” label.
Explain test-only form behavior near the form. Do not cover the composition with developer
notes. Keep missing integration details in the handoff document. A preview should let the
buyer assess the actual look, flow and editable content before deciding to purchase.
