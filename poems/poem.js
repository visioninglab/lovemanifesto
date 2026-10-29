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
    const title = el(titleTag, "entry-title", entry.display.title);
    title.dir = "auto";
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

  function sourceLink(entry) {
    const link = entry.links[0];
    if (!link) return null;
    const a = el("a", "", entry.passage ? "Read the whole work" : "Find this work");
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener";
    return a;
  }

  return { el, heading, passage, sourceLink };
})();
