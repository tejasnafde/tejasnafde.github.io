# Learnlang Coming Soon Card

## Goal

Keep Learnlang visible as upcoming work without linking to its private GitHub repository.

## Design

The Learnlang card keeps its current product description and technology tags. The project name becomes plain text. A `COMING SOON` badge replaces the GitHub destination. The card uses the existing flat, non-clickable project treatment.

## Verification

Add a source test that requires a null Learnlang link and a `coming-soon` status. Confirm that the rendered card has no anchor, displays the status badge, and keeps the existing description and tags.
