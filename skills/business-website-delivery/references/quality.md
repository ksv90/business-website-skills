# Observable quality gates

Choose checks for implemented features. Record passed, failed, not run and why.

## Every delivery

- Build/type/lint checks available in the chosen project; no unexplained console errors.
- Render at representative widths such as 360, 390, 768 and 1440 pixels; inspect real
  screenshots for overflow, clipped text, spacing, sticky overlap and image crops.
- Use keyboard only: logical focus sequence, visible focus, reachable controls, correctly
  labelled form fields. Check contrast, 200% zoom and reduced-motion behavior.
- Verify every navigation/CTA/contact destination. No dead `#` buttons or links to other
  template clients. Do not trigger calls or send messages merely to test link presence.
- Cross-check names, branch, phone, services, prices/units and hours against the ledger.
- Check all image/font rights, attribution, placeholders and demo markings.
- Inspect phone-sized first screen: service, location and primary action are understandable.

## Performance and discoverability

Measure using available browser/performance tooling and report device/network conditions.
Aim for stable content, quick primary rendering and responsive interaction. Useful initial
lab budgets for a simple landing: initial transfer around 1 MB or less, no unnecessary
third-party scripts and no large layout jumps. Adapt to real content rather than gaming
a score. Do not promise field Core Web Vitals or search ranking from one lab run.
Verify demo noindex/private access; production canonical, sitemap and robots behavior.

## Integration checks

Forms: empty/invalid input, loading, duplicate activation, server failure, offline/timeout,
success and verified receipt in authorized test destination. Check no secrets enter the
bundle/logs. Test phone/messenger routing without sending unsolicited contact.
Booking/payment/custom routes add their acceptance cases from the selected contract:
conflicting slots, duplicate callback, unauthorized role, interrupted flow and recovery.

If browser/build/deployment tools are unavailable, deliver what can be verified and name
the missing check precisely. A screenshot does not prove forms work; a successful build
does not prove the visual page is correct. Do not mark the site production-ready while
an essential integration or ownership dependency remains unresolved.
