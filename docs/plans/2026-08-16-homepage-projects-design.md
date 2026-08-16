# Homepage projects design

## Goal

The projects area must present serious product and engineering work before recreational sites. It must help hiring managers scan scope and help engineers understand what each project does.

## Structure

### Featured work

Show four product rows in this order:

1. Switchboard
2. Someday
3. Scout
4. WatchWithMi

Use the existing index-row visual language. Give each row a number, icon, name, outcome-focused description, destination, and chevron. Keep Switchboard first without making it a different card type.

### More engineering work

Keep this directly below Featured work in the same Projects section. Use the existing compact two-column cards for macremote, FZM Server Manager, bbpr, tejas-skills, Learnlang, Unetsim-Routing, and MyOptum.

Describe Learnlang as a personalized voice tutor. Link the Unetsim-Routing research credit to Prof. Sarang C. Dhongdi's BITS Pilani profile.

### For fun

Move Follymarket, Board Games, and Marvel Syllabus into a compact section after Writing and before Contact. These sites remain discoverable without defining the first view of the portfolio.

## Link behavior

- Switchboard links to `https://switchboard.tn07.dev`. The hostname currently redirects to its releases page. A future promo site can replace that response without another homepage edit.
- Someday, Scout, and WatchWithMi link to their live sites.
- Fun projects link to their live sites.
- Scout is a live link because its hostname now returns HTTP 200.

## Responsive behavior

Featured rows use the full index layout on desktop. On mobile, hide the hostname, keep the number and icon visible, and let descriptions wrap. More engineering work becomes one column below 560px. The page must not overflow horizontally.

## Verification

- Test the featured order and destinations.
- Test that recreational sites only appear in the later For fun section.
- Test the Learnlang wording and linked research credit.
- Run the production build.
- Inspect the projects section at 1440px and 375px in both themes.
