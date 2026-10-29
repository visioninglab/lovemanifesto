// Renders the love poetry archive from window.ARCHIVE (data/archive.js).

(function () {
  const entries = window.ARCHIVE || [];
  const FORM_GROUPS = ["Poem", "Song", "Poem & song", "Oral tradition", "Epic & romance"];

  const list = document.getElementById("entries");
  const search = document.getElementById("search");
  const formFilters = document.getElementById("form-filters");
  const alphabet = document.getElementById("alphabet");
  const resultCount = document.getElementById("result-count");
  const empty = document.getElementById("empty");

  let activeGroup = "All";

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function detail(label, value) {
    const row = el("div", "detail");
    row.append(el("dt", "", label), el("dd", "", value));
    return row;
  }

  function renderEntry(entry) {
    const item = el("li", "entry");
    item.id = entry.id;
    item.dataset.letter = entry.country[0].toUpperCase();

    const head = el("div", "entry-head");
    head.append(el("p", "entry-country", entry.country), el("span", "entry-form", entry.form));
    item.append(head);

    item.append(el("h2", "entry-title", entry.title));
    item.append(el("p", "entry-creator", entry.creator));
    item.append(el("p", "entry-language", entry.language));
    item.append(el("p", "entry-description", entry.description));

    const more = el("details", "entry-more");
    more.append(el("summary", "", "Provenance, translation and rights"));
    const dl = el("dl", "details");
    dl.append(
      detail("Provenance", entry.provenance),
      detail("Translation", entry.translation),
      detail("Rights & cultural considerations", entry.rights),
      detail("Source", entry.source)
    );
    more.append(dl);
    item.append(more);

    const links = el("p", "entry-links");
    entry.links.filter((l) => l.url).forEach((link, i) => {
      const a = el("a", "", i === 0 ? `Source: ${link.label}` : link.label);
      a.href = link.url;
      a.rel = "noopener";
      a.target = "_blank";
      links.append(a);
    });
    item.append(links);

    entry.searchText = [entry.country, entry.title, entry.creator, entry.language, entry.form, entry.description]
      .join(" ")
      .toLowerCase();
    entry.node = item;
    return item;
  }

  function renderFormFilters() {
    ["All", ...FORM_GROUPS].forEach((group) => {
      const count = group === "All" ? entries.length : entries.filter((e) => e.formGroup === group).length;
      const button = el("button", "chip", `${group} (${count})`);
      button.type = "button";
      button.dataset.group = group;
      button.setAttribute("aria-pressed", group === activeGroup);
      button.addEventListener("click", () => {
        activeGroup = group;
        formFilters.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", b.dataset.group === group));
        applyFilters();
      });
      formFilters.append(button);
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
    const terms = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let shown = 0;
    const visibleLetters = new Set();
    entries.forEach((entry) => {
      const matches =
        (activeGroup === "All" || entry.formGroup === activeGroup) &&
        terms.every((t) => entry.searchText.includes(t));
      entry.node.hidden = !matches;
      if (matches) {
        shown += 1;
        visibleLetters.add(entry.country[0].toUpperCase());
      }
    });
    alphabet.querySelectorAll("a").forEach((a) => a.classList.toggle("disabled", !visibleLetters.has(a.dataset.letter)));
    resultCount.textContent = shown === entries.length ? `${shown} entries` : `${shown} of ${entries.length} entries`;
    empty.hidden = shown > 0;
  }

  entries.forEach((entry) => list.append(renderEntry(entry)));
  renderFormFilters();
  renderAlphabet();
  search.addEventListener("input", applyFilters);
  applyFilters();
})();
