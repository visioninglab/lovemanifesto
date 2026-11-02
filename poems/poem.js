// Shared rendering for the archive and the map: how an entry and its poem look to a reader.

window.Poem = (function () {
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function meta(entry) {
    return [entry.display.language, entry.year].filter(Boolean).join(" · ");
  }

  // Title block: country, title, English title, creator, language and year
  function heading(entry, titleTag) {
    const frag = document.createDocumentFragment();
    const head = el("div", "entry-head");
    head.append(el("p", "entry-country", entry.country), el("span", "entry-form", entry.form));
    frag.append(head);
    // Titles can mix scripts ("שיר השירים / Song of Songs"): isolate each part so it keeps its own direction
    const title = el(titleTag, "entry-title");
    entry.display.title.split(" / ").forEach((part, i) => {
      if (i) title.append(" / ");
      title.append(el("bdi", "", part));
    });
    frag.append(title);
    if (entry.display.english) frag.append(el("p", "entry-title-english", entry.display.english));
    frag.append(el("p", "entry-creator", entry.display.creator));
    if (meta(entry)) frag.append(el("p", "entry-language", meta(entry)));
    return frag;
  }

  // The poem itself: original beside English, or a single text for works written in English
  function passage(entry) {
    const { original, english, status } = entry.passage;
    const section = el("div", "passage");
    if (status === "english-original") {
      section.append(el("blockquote", "passage-text", english));
      return section;
    }
    const origLines = original.split("\n");
    const engLines = english.split("\n");
    if (origLines.length === engLines.length) {
      // One grid, filled column by column: each original line shares a row with its translation,
      // so long lines that wrap stay aligned. On narrow screens it falls back to one column.
      const grid = el("div", "passage-grid");
      grid.style.setProperty("--rows", origLines.length + 1);
      origLines.forEach((line) => {
        const node = el("p", "passage-line", line);
        node.dir = "auto";
        grid.append(node);
      });
      grid.append(el("p", "passage-note passage-note-original", entry.display.language || "Original"));
      engLines.forEach((line) => grid.append(el("p", "passage-line", line)));
      grid.append(el("p", "passage-note", "English"));
      section.append(grid);
      return section;
    }
    section.classList.add("passage-pair");
    const orig = el("figure", "passage-col");
    const origText = el("blockquote", "passage-text", original);
    origText.dir = "auto";
    orig.append(origText, el("figcaption", "passage-note", entry.display.language || "Original"));
    const eng = el("figure", "passage-col");
    eng.append(el("blockquote", "passage-text", english), el("figcaption", "passage-note", "English"));
    section.append(orig, eng);
    return section;
  }

  // A short note on the history behind the work, its maker or its place
  function historyNote(entry) {
    if (!entry.contextNote) return null;
    const note = el("aside", "history-note");
    note.append(el("p", "history-note-title", "A note on history"), el("p", "", entry.contextNote));
    return note;
  }

  // Labels from the spreadsheet that say what the reader will find; anything else is a research note
  const READER_LABELS = new Set([
    "Listen to the song", "Listen to the poem", "Watch the video", "Read the lyrics", "Read the text",
    "Read about it", "Read about the poet",
  ]);

  function sourceLink(entry) {
    const link = entry.links[0];
    if (!link) return null;
    const fallback = entry.passage ? "Read the whole work" : "Find this work";
    const a = el("a", "", READER_LABELS.has(link.label) ? link.label : fallback);
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener";
    return a;
  }

  // A sortable year from labels such as "c. 600 BCE", "13th century", "before 1933" or "by 2016"
  function sortYear(label) {
    const text = (label || "").toLowerCase();
    const century = text.match(/(\d+)(st|nd|rd|th) century/);
    if (century) return (Number(century[1]) - 1) * 100 + 50;
    const number = text.match(/\d+/);
    if (!number) return null;
    const year = Number(number[0]);
    if (/bce/.test(text) || text.trim().startsWith("-")) return -year;
    if (/before/.test(text)) return year - 1;
    if (/early \d+s/.test(text)) return year + 10;
    return year;
  }

  // Periods, oldest first (shared by the Poems page filter and the map's shading)
  const PERIODS = [
    ["before-1500", "Before 1500", (y) => y < 1500],
    ["1500-1899", "1500 to 1899", (y) => y >= 1500 && y < 1900],
    ["1900-1999", "1900 to 1999", (y) => y >= 1900 && y < 2000],
    ["2000", "2000 onwards", (y) => y >= 2000],
  ];

  function periodOf(entry) {
    const year = sortYear(entry.year);
    const found = year === null ? null : PERIODS.find(([, , test]) => test(year));
    return found ? found[0] : null;
  }

  return { el, heading, passage, historyNote, sourceLink, sortYear, PERIODS, periodOf };
})();
