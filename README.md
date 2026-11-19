# Daily Glimmer

Redesigned with taste-skill 2.5.1. Built with plain HTML, CSS, and JavaScript; no build step required.

## Getting started

From this directory, run:

    python -m http.server 5173 --directory dist

Open http://localhost:5173.

## Content

The English edition contains 14 daily notes in dist/content.json. Entries are scheduled using China Standard Time; on unscheduled days the home page falls back to the latest published note. Each note has a shareable route such as #/day/day-001.

Seven landscape photographs are bundled with taste-skill from Wikimedia Commons. Their source pages, photographers, licenses, and download dates are recorded in the data file; the site provides full credits. Images are cropped for display, with applicable licenses preserved. Downloaded PNG posters include source and license links. Reused skill assets retain their MIT license.

## Checks

Browser checks verified the home page, scheduled content, copy success and failure feedback (clipboard stub), nine published archive notes, individual note routes, future-date filtering, seven photo credits, image fallback, and PNG export.

Browser screenshots are in shots/; design notes are in DESIGN.md. The general company-landing-page checker has rules that do not fit this daily reading product, so its result is documented accurately.
