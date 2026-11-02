# Love Manifesto

A website devoted to poetry, personal reflections, and other creative work inspired by love in all its forms.

## Overview

Love Manifesto is a digital space for writing that explores romance, connection, heartbreak, healing, friendship, family, and self-love. The site brings together poems, essays, short pieces, and curated literary work that centre emotional truth and human experience.

## What the site includes

- Poetry and spoken-word pieces
- Personal essays and reflections on love
- Short stories and prose inspired by relationships
- A warm, minimal visual style that emphasises reading and feeling
- Space for both original work and curated selections

## Project vision

This project celebrates love as a source of creativity, vulnerability, and transformation. It is designed to feel intimate, thoughtful, and welcoming—like a digital journal or literary gallery for emotionally resonant writing.

## Suggested content themes

- First love and longing
- Commitment and partnership
- Loss, longing, and grief
- Self-acceptance and self-love
- Friendship and community
- Healing after heartbreak
- Everyday tenderness and gratitude

## Recommended structure

A simple site structure could look like this:

```text
/
├── index.html
├── styles.css
├── script.js
├── poems/
│   ├── featured-poems.html
│   └── archive.html
├── essays/
│   └── love-essays.html
├── about.html
└── README.md
```

## Getting started

To run the site locally:

1. Open the project folder in your browser or a local web server.
2. Start a simple local server if needed, for example:

```bash
python -m http.server 8000
```

3. Visit:

```text
http://localhost:8000
```

## Love poetry archive

The home page (`index.html`) is a searchable catalogue of love poems, songs, stories and oral traditions from 195 countries, plus Greenland and Taiwan. Its source document is the master spreadsheet, copied into `data/source/Manifesto_for_Love_MASTER.xlsx`.

The pages are written for casual readers. All entries are listed together. Works that are out of copyright show their passage in the original language beside English; the rest are described, with a link to the work at its source. Search ignores accents and knows other country names ("Turkey", "Burma", "UK"). Search sits behind a Search button that drops down a text box. Filters for region, type and period, and a sort by country or date, sit beside it (behind a Filters button on phones); each option shows how many results it would give, and the choices are kept in the address (`?q=`, `region=`, `type=`, `period=`, `sort=`) so a filtered view can be shared. "Titles only" shows a compact list that opens one entry at a time. The page ends with a short About section. Research notes, evidence links and cataloguing remarks stay in the spreadsheet and `data/archive.json` and are not shown; the build script also strips bracketed notes such as "(incipit)" from displayed titles and names. A footer line says that English versions are new translations made with AI assistance.

When you change `styles.css`, any script or `data/archive.js`, change the `?v=` version on their links in `index.html` and `poems/map.html` (one value for all of them). GitHub Pages lets browsers keep files for ten minutes, and without a new version a reader can get a new script with an old one, which breaks the page.

The map (`poems/map.html`) shows the entries on a world map. Countries are shaded in green by when their work was made, using the same periods as the Poems page filter: darker for older works, with a neutral shade for traditional or undated ones (in dark mode the ramp flips so older works are brightest). Click a country (small countries appear as dots) to see its entry below the map. Links can point at a country directly, for example `poems/map.html#kenya`; the old `poems/archive.html` address forwards to the home page, keeping `#country`.

After editing the spreadsheet, regenerate the archive data:

```bash
pip install openpyxl
python scripts/build_archive_data.py
# or build straight from a spreadsheet elsewhere:
python scripts/build_archive_data.py path/to/Manifesto_for_Love_MASTER.xlsx
```

This writes `data/archive.json` and `data/archive.js`. The page reads `archive.js`, so it also works when opened directly from disk.

## Design direction

The visual tone can lean towards:

- soft neutrals and warm accents
- elegant typography
- spacious layouts
- calm, reflective pacing
- imagery that feels intimate and poetic

## Contribution

Contributions are welcome for:

- new poems and prose
- improved design and layout
- accessibility enhancements
- site organisation and navigation updates

## Notes

This project is intended as a creative, expressive website. You can adapt it for personal art, a portfolio, a blog, or a digital literary collection.

## Licence

This project does not include a licence yet. If you plan to publish it publicly, add an appropriate open-source licence based on your intended use.
