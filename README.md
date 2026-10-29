# Love Manifesto

A website devoted to poetry, personal reflections, and other creative work inspired by love in all its forms.

## Overview

Love Manifesto is a digital space for writing that explores romance, connection, heartbreak, healing, friendship, family, and self-love. The site brings together poems, essays, short pieces, and curated literary work that center emotional truth and human experience.

## What the site includes

- Poetry and spoken-word pieces
- Personal essays and reflections on love
- Short stories and prose inspired by relationships
- A warm, minimal visual style that emphasizes reading and feeling
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

`poems/archive.html` is a searchable catalogue of love poems, songs and oral traditions from 195 countries. Its source document is the spreadsheet in `data/source/Manifesto_for_Love_195_Country_Reference.xlsx`.

The archive describes each work and links to where it is published. It does not reproduce texts or recordings, because rights for them have not been cleared (see the rights column in the spreadsheet).

After editing the spreadsheet, regenerate the archive data:

```bash
pip install openpyxl
python scripts/build_archive_data.py
```

This writes `data/archive.json` and `data/archive.js`. The page reads `archive.js`, so it also works when opened directly from disk.

## Design direction

The visual tone can lean toward:

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
- site organization and navigation updates

## Notes

This project is intended as a creative, expressive website. You can adapt it for personal art, a portfolio, a blog, or a digital literary collection.

## License

This project does not include a license yet. If you plan to publish it publicly, add an appropriate open-source license based on your intended use.
