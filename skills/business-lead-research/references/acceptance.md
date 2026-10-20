# Behavioral acceptance cases

Use these as offline scenarios during maintenance, and as a checklist during campaigns.
Do not make live calls, messages or paid requests to test the skill.

| Situation | Required outcome |
| --- | --- |
| Listing lacks link; phone search reveals matching official site | present; exclude from no-site offer |
| Listing blocked by CAPTCHA | listing_website=blocked; alternative checks; no negative inference |
| All relevant searches blocked | unknown, review, checkpoint; no fabricated quota completion |
| Same name in two cities | Separate identities until address/contact match |
| Two branches share phone | Distinct branch leads with group_id; avoid duplicate outreach |
| Official site returns 403 only to agent | unknown pending independent availability evidence |
| Only official social page found after complete accessible checks | social_only, medium confidence at most |
| Site exists on a hosted builder subdomain | present, not automatically social_only |
| Source licence forbids permanent export | Do not export that content; choose permitted source |
| Opt-out lead has highest score | Suppressed; never placed in active contact shortlist |
| Business name starts with spreadsheet formula | Safe literal export, not executable formula |
| Time budget expires at 13 qualified leads out of 20 requested | Deliver 13 and explicit coverage/shortfall |

Review final table against JSON; open a few evidence URLs when allowed; inspect website
decisions and dedupe reasons. Report which checks actually ran. A schema validator and
offline fixture test do not prove live collection or source access works.
