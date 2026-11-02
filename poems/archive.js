// Renders the love poetry archive from window.ARCHIVE (data/archive.js), with search, filters and sorting.

(function () {
  const { el, heading, passage, historyNote, sourceLink } = window.Poem;
  const entries = window.ARCHIVE || [];

  const $ = (id) => document.getElementById(id);
  const list = $("entries");
  const search = $("search");
  const alphabet = $("alphabet");
  const resultCount = $("result-count");
  const empty = $("empty");
  const clearButton = $("clear-filters");
  const filterToggle = $("filter-toggle");
  const filterBadge = $("filter-badge");
  const layoutSwitch = $("layout-switch");

  // Lower case, without accents or apostrophes, so "Sao Tome" finds "São Tomé" and "cote divoire" finds Côte d’Ivoire
  function fold(text) {
    return (text || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/ı/g, "i").replace(/[øØ]/g, "o").replace(/[łŁ]/g, "l").replace(/ß/g, "ss")
      .replace(/[’'`ʼ]/g, "")
      .toLowerCase();
  }

  // Other names people may search for
  const ALIASES = {
    "Türkiye": "turkey", "Côte d’Ivoire": "ivory coast", "Myanmar": "burma", "Czechia": "czech republic",
    "Holy See": "vatican", "United Kingdom": "uk britain great britain england scotland wales northern ireland",
    "United States": "usa us america", "Eswatini": "swaziland", "Cabo Verde": "cape verde", "Timor-Leste": "east timor",
    "North Korea": "dprk korea", "South Korea": "korea", "Democratic Republic of the Congo": "drc congo kinshasa zaire",
    "Congo": "congo brazzaville republic of the congo", "Brunei Darussalam": "brunei", "Iran": "persia",
    "Sri Lanka": "ceylon", "North Macedonia": "macedonia", "Netherlands": "holland", "Russia": "russian federation",
    "Vietnam": "viet nam", "Gambia": "the gambia", "Bahamas": "the bahamas", "Saint Kitts and Nevis": "st kitts nevis",
    "Saint Lucia": "st lucia", "Saint Vincent and the Grenadines": "st vincent grenadines",
    "United Arab Emirates": "uae emirates", "Papua New Guinea": "png", "Central African Republic": "car",
    "Kyrgyzstan": "kirghizia", "Micronesia": "federated states of micronesia", "Tanzania": "zanzibar",
    "Sao Tome and Principe": "são tomé", "Bosnia and Herzegovina": "bosnia herzegovina",
  };

  const REGIONS = ["Africa", "Asia", "Europe", "North America", "South America", "Oceania"];
  const TYPES = [
    ["poem", "Poems", (e) => e.formGroup.startsWith("Poem")],
    ["song", "Songs", (e) => /song/i.test(e.formGroup)],
    ["story", "Stories", (e) => e.formGroup === "Narrative & oral"],
  ];
  const PERIODS = [
    ["before-1500", "Before 1500", (y) => y < 1500],
    ["1500-1899", "1500 to 1899", (y) => y >= 1500 && y < 1900],
    ["1900-1999", "1900 to 1999", (y) => y >= 1900 && y < 2000],
    ["2000", "2000 onwards", (y) => y >= 2000],
  ];
  const SORTS = [["country", "Country A–Z"], ["oldest", "Oldest first"], ["newest", "Newest first"]];

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

  // What the page is showing; kept in the address so a filtered view can be shared
  const params = new URLSearchParams(location.search);
  const state = {
    q: params.get("q") || "",
    region: params.get("region") || "",
    type: params.get("type") || "",
    period: params.get("period") || "",
    sort: params.get("sort") || "country",
  };
  let layout = "full";
  try { layout = localStorage.getItem("lm-layout") || "full"; } catch (e) { /* storage unavailable */ }

  function renderEntry(entry) {
    const item = el("li", entry.passage ? "entry has-poem" : "entry");
    item.id = entry.id;
    item.dataset.letter = fold(entry.country)[0].toUpperCase();
    item.append(heading(entry, "h2"));

    // In the titles-only layout each entry opens on demand
    const toggle = el("button", "entry-toggle", entry.passage ? "Show poem" : "Show details");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", () => {
      const open = item.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
      toggle.textContent = open ? (entry.passage ? "Hide poem" : "Hide details") : (entry.passage ? "Show poem" : "Show details");
    });
    item.append(toggle);

    const body = el("div", "entry-body");
    if (entry.passage) body.append(passage(entry));
    else body.append(el("p", "entry-description", entry.description));
    const note = historyNote(entry);
    if (note) body.append(note);
    const links = el("p", "entry-links");
    const source = sourceLink(entry);
    if (source) links.append(source);
    const onMap = el("a", "", "See on map");
    onMap.href = `poems/map.html#${entry.id}`;
    links.append(onMap);
    body.append(links);
    item.append(body);

    entry.searchText = fold([
      entry.country,
      ALIASES[entry.country],
      entry.display.title,
      entry.display.english,
      entry.display.creator,
      entry.display.language,
      entry.passage ? entry.passage.original + " " + entry.passage.english : entry.description,
    ].join(" "));
    entry.sortYear = sortYear(entry.year);
    entry.node = item;
    return item;
  }

  function fillSelect(select, anyLabel, options) {
    select.replaceChildren(new Option(anyLabel, ""), ...options.map(([value, label]) => new Option(label, value)));
  }

  function buildControls() {
    fillSelect($("filter-region"), "All regions", REGIONS.map((r) => [r, r]));
    fillSelect($("filter-type"), "Poems, songs and stories", TYPES.map(([v, l]) => [v, l]));
    fillSelect($("filter-period"), "Any period", PERIODS.map(([v, l]) => [v, l]));
    $("filter-sort").replaceChildren(...SORTS.map(([v, l]) => new Option(l, v)));
    ["region", "type", "period", "sort"].forEach((key) => {
      $(`filter-${key}`).addEventListener("change", (event) => update({ [key]: event.target.value }));
    });

    [["full", "Full poems"], ["titles", "Titles only"]].forEach(([value, label]) => {
      const button = el("button", "chip chip-small", label);
      button.type = "button";
      button.dataset.layout = value;
      button.addEventListener("click", () => {
        layout = value;
        try { localStorage.setItem("lm-layout", value); } catch (e) { /* storage unavailable */ }
        showLayout();
      });
      layoutSwitch.append(button);
    });

    filterToggle.addEventListener("click", () => {
      const open = filterToggle.getAttribute("aria-expanded") !== "true";
      filterToggle.setAttribute("aria-expanded", open);
      $("filters").classList.toggle("panel-open", open);
    });
    clearButton.addEventListener("click", () => {
      search.value = "";
      update({ q: "", region: "", type: "", period: "", sort: "country" });
    });

    let typing;
    search.value = state.q;
    search.addEventListener("input", () => {
      clearTimeout(typing);
      typing = setTimeout(() => update({ q: search.value }), 120);
    });

    const letters = [...new Set(entries.map((e) => fold(e.country)[0].toUpperCase()))];
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

  function showLayout() {
    list.classList.toggle("titles-only", layout === "titles");
    layoutSwitch.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", b.dataset.layout === layout));
  }

  // Does an entry pass every filter, optionally ignoring one of them (for the counts beside each option)?
  function passes(entry, terms, ignore) {
    if (ignore !== "region" && state.region && entry.continent !== state.region) return false;
    if (ignore !== "type" && state.type && !TYPES.find(([v]) => v === state.type)[2](entry)) return false;
    if (ignore !== "period" && state.period) {
      if (entry.sortYear === null || !PERIODS.find(([v]) => v === state.period)[2](entry.sortYear)) return false;
    }
    return terms.every((t) => entry.searchText.includes(t));
  }

  function countWhere(terms, ignore, test) {
    return entries.filter((e) => passes(e, terms, ignore) && test(e)).length;
  }

  function sortEntries() {
    const byCountry = (a, b) => a.country.localeCompare(b.country);
    const known = (e) => e.sortYear !== null;
    const order = [...entries].sort((a, b) => {
      if (state.sort === "country") return byCountry(a, b);
      if (known(a) !== known(b)) return known(a) ? -1 : 1; // undated works go last
      const diff = state.sort === "oldest" ? a.sortYear - b.sortYear : b.sortYear - a.sortYear;
      return diff || byCountry(a, b);
    });
    order.forEach((e) => list.append(e.node));
  }

  function update(changes = {}) {
    const resort = "sort" in changes && changes.sort !== state.sort;
    Object.assign(state, changes);
    const terms = fold(state.q).trim().split(/\s+/).filter(Boolean);

    // Option labels show how many results each choice would give
    [["region", REGIONS.map((r) => [r, (e) => e.continent === r])],
     ["type", TYPES.map(([v, , test]) => [v, test])],
     ["period", PERIODS.map(([v, , test]) => [v, (e) => e.sortYear !== null && test(e.sortYear)])]].forEach(([key, tests]) => {
      const select = $(`filter-${key}`);
      tests.forEach(([value, test], i) => {
        const option = select.options[i + 1];
        option.textContent = `${option.textContent.replace(/ \(\d+\)$/, "")} (${countWhere(terms, key, test)})`;
      });
      select.value = state[key];
    });
    $("filter-sort").value = state.sort;

    if (resort) sortEntries();
    let shown = 0;
    const visibleLetters = new Set();
    entries.forEach((entry) => {
      const match = passes(entry, terms);
      entry.node.hidden = !match;
      if (match) {
        shown += 1;
        visibleLetters.add(entry.node.dataset.letter);
      }
    });

    alphabet.hidden = state.sort !== "country" || shown < 20;
    alphabet.querySelectorAll("a").forEach((a) => a.classList.toggle("disabled", !visibleLetters.has(a.dataset.letter)));

    const active = [state.region, state.type, state.period].filter(Boolean).length + (state.sort !== "country" ? 1 : 0);
    filterBadge.hidden = !active;
    filterBadge.textContent = active;
    clearButton.hidden = !(active || terms.length);
    resultCount.textContent = `${shown} ${shown === 1 ? "result" : "results"}`;

    showEmpty(shown);
    saveToAddress();
  }

  // When nothing matches, offer to clear the search and filters
  function showEmpty(shown) {
    empty.hidden = shown > 0;
    if (shown) return;
    empty.replaceChildren(el("p", "", "Nothing matches."));
    const button = el("button", "button button-quiet", "Clear the search and filters");
    button.type = "button";
    button.addEventListener("click", () => clearButton.click());
    empty.append(button);
  }

  function saveToAddress() {
    const parts = [];
    const add = (key, value) => parts.push(`${key}=${encodeURIComponent(value)}`);
    if (state.q.trim()) add("q", state.q.trim());
    ["region", "type", "period"].forEach((key) => state[key] && add(key, state[key]));
    if (state.sort !== "country") add("sort", state.sort);
    const query = parts.length ? "?" + parts.join("&") : "";
    history.replaceState(null, "", `${location.pathname}${query}${location.hash}`);
  }

  entries.forEach((entry) => list.append(renderEntry(entry)));
  // A link to a country (e.g. from the map) opens that entry
  const linked = entries.find((e) => e.id === decodeURIComponent(location.hash.slice(1)));
  buildControls();
  showLayout();
  sortEntries();
  update();
  if (linked) {
    linked.node.querySelector(".entry-toggle").click();
    linked.node.scrollIntoView({ block: "start" });
  }
})();
