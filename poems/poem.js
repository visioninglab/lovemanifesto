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

  // Context for works bound up with the history of slavery and colonialism
  function historyNote(entry) {
    if (!entry.contextNote) return null;
    const note = el("aside", "history-note");
    note.append(el("p", "history-note-title", "A note on history"), el("p", "", entry.contextNote));
    return note;
  }

  function sourceLink(entry) {
    const link = entry.links[0];
    if (!link) return null;
    const a = el("a", "", entry.passage ? "Read the whole work" : "Find this work");
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener";
    return a;
  }

  // Why some poems are shown in full and others only described (shared by the Poems page and the map)
  const VIEW_NOTES = {
    read: ["Poems to read", " are out of copyright, so we can share them in full here."],
    explore: ["Poems to explore", " are mostly still under copyright, so we describe them and link to where you can find them."],
  };

  // Fills (or creates) a note paragraph, with the section name in bold
  function viewNote(readable, node = el("p", "view-note")) {
    const [label, rest] = readable ? VIEW_NOTES.read : VIEW_NOTES.explore;
    node.replaceChildren(el("strong", "", label), rest);
    return node;
  }

  return { el, heading, passage, historyNote, sourceLink, viewNote };
})();
