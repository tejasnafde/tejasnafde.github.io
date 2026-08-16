# Homepage hero design

## Goal

The hero must introduce Tejas to hiring managers, recruiters, engineers, and potential collaborators with equal priority.

## Direction

Keep the current identity-led structure and restrained visual style. Keep the large name as the main visual element. Do not add a portrait, project logo, availability badge, metrics strip, or featured project.

Use precise copy that states the engineering focus, current employer, and education. Add a Selected work link before the existing profile links. It must scroll to the projects section.

## Content

- Label: Software Engineer / Bengaluru
- Name: Tejas Nafde
- Description: I build backend systems, real-time infrastructure, and developer tools. Currently at GeoIQ, a Lenskart company. BITS Pilani Goa alumnus.
- Links: Selected work, GitHub, LinkedIn, Email, Resume

## Responsive behavior

Keep the current desktop and mobile composition. The links may wrap on narrow screens. The hero must remain readable at 375px and must not overflow horizontally.

## Verification

- Assert the agreed copy and Selected work anchor in an automated source test.
- Run the Astro production build.
- Inspect the rendered hero at 1440px and 375px.
