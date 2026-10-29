// Renders the love poetry archive from window.ARCHIVE (data/archive.js).

(function () {
  const { el, heading, passage, historyNote, sourceLink, viewNote: fillViewNote } = window.Poem;
  const entries = window.ARCHIVE || [];

  const list = document.getElementById("entries");
  const search = document.getElementById("search");
  const viewSwitch = document.getElementById("view-switch");
  const alphabet = document.getElementById("alphabet");
  const resultCount = document.getElementById("result-count");
  const viewNote = document.getElementById("view-note");
  const empty = document.getElementById("empty");

  // Two views: poems to read here, and poems to explore at their source. Start with the ones to read.
  let readable = !new URLSearchParams(location.search).has("explore");

  function renderEntry(entry) {
    const item = el("li", entry.passage ? "entry has-poem" : "entry");
    item.id = entry.id;
    item.dataset.letter = entry.country[0].toUpperCase();
    item.append(heading(entry, "h2"));
    if (entry.passage) item.append(passage(entry));
    else item.append(el("p", "entry-description", entry.description));
    const note = historyNote(entry);
    if (note) item.append(note);

    const links = el("p", "entry-links");
    const source = sourceLink(entry);
    if (source) links.append(source);
    const onMap = el("a", "", "See on map");
    onMap.href = `../index.html#${entry.id}`;
    links.append(onMap);
    item.append(links);

    entry.searchText = [
      entry.country,
      entry.display.title,
      entry.display.english,
      entry.display.creator,
      entry.display.language,
      entry.passage ? entry.passage.original + " " + entry.passage.english : entry.description,
    ]
      .join(" ")
      .toLowerCase();
    entry.node = item;
    return item;
  }

  function renderViewSwitch() {
    const toRead = entries.filter((e) => e.passage).length;
    [
      [true, `Poems to read (${toRead})`],
      [false, `Poems to explore (${entries.length - toRead})`],
    ].forEach(([value, label]) => {
      const button = el("button", "chip", label);
      button.type = "button";
      button.setAttribute("aria-pressed", value === readable);
      button.addEventListener("click", () => {
        readable = value;
        viewSwitch.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", b === button));
        applyFilters();
      });
      viewSwitch.append(button);
    });
  }

  function renderAlphabet() {
    const letters = [...new Set(entries.map((e) => e.country[0].toUpperCase()))];
    letters.forEach((letter) => {
      const a = el("a", "", letter);
      a.href = "#";
      a.dataset.letter = letter;
      a.addEventListener("click", (event) => {
        event.preventDefault();
        const target = list.querySelector(`.entry[data-letter="${letter}"]:not([hidden])`);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      alphabet.append(a);
    });
  }

  function applyFilters() {
    fillViewNote(readable, viewNote);
    const terms = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let shown = 0;
    const visibleLetters = new Set();
    entries.forEach((entry) => {
      const matches = Boolean(entry.passage) === readable && terms.every((t) => entry.searchText.includes(t));
      entry.node.hidden = !matches;
      if (matches) {
        shown += 1;
        visibleLetters.add(entry.country[0].toUpperCase());
      }
    });
    alphabet.querySelectorAll("a").forEach((a) => a.classList.toggle("disabled", !visibleLetters.has(a.dataset.letter)));
    resultCount.textContent = terms.length ? `${shown} found` : "";
    empty.hidden = shown > 0;
  }

  entries.forEach((entry) => list.append(renderEntry(entry)));
  // A link to a country (e.g. from the map) opens whichever view that country is in
  const linked = entries.find((e) => e.id === decodeURIComponent(location.hash.slice(1)));
  if (linked) readable = Boolean(linked.passage);
  renderViewSwitch();
  renderAlphabet();
  search.addEventListener("input", applyFilters);
  applyFilters();
  if (linked) linked.node.scrollIntoView({ block: "start" });
})();
