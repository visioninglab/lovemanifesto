// World map of the archive, shown on the home page. Clicking a country shows its poem below the map.

(function () {
  const WORLD_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json";
  const WIDTH = 960;
  const HEIGHT = 480;
  // Countries smaller than this (in map units at full view) also get a dot, so they can be found and clicked
  const SMALL_AREA = 14;

  // Archive country name -> Natural Earth name, where they differ
  const ATLAS_NAMES = {
    "Antigua and Barbuda": "Antigua and Barb.",
    "Bosnia and Herzegovina": "Bosnia and Herz.",
    "Brunei Darussalam": "Brunei",
    "Central African Republic": "Central African Rep.",
    "Côte d’Ivoire": "Côte d'Ivoire",
    "Democratic Republic of the Congo": "Dem. Rep. Congo",
    "Dominican Republic": "Dominican Rep.",
    "Equatorial Guinea": "Eq. Guinea",
    "Eswatini": "eSwatini",
    "Holy See": "Vatican",
    "Marshall Islands": "Marshall Is.",
    "North Macedonia": "Macedonia",
    "Saint Kitts and Nevis": "St. Kitts and Nevis",
    "Saint Vincent and the Grenadines": "St. Vin. and Gren.",
    "Sao Tome and Principe": "São Tomé and Principe",
    "Solomon Islands": "Solomon Is.",
    "South Sudan": "S. Sudan",
    "Türkiye": "Turkey",
    "United States": "United States of America",
  };
  // Not in the 1:50m map at all: [longitude, latitude]
  const EXTRA_POINTS = { Tuvalu: [179.2, -8.5] };

  const CATEGORIES = [
    { key: "poem", label: "Poems to read" },
    { key: "listed", label: "Poems to explore" },
  ];
  const categoryOf = (entry) => (entry.passage ? "poem" : "listed");
  const { el, heading, passage, historyNote, sourceLink, VIEW_NOTES } = window.Poem;

  const entries = window.ARCHIVE || [];
  const byAtlasName = new Map(entries.map((e) => [ATLAS_NAMES[e.country] || e.country, e]));
  const byId = new Map(entries.map((e) => [e.id, e]));

  const svg = d3.select("#map");
  const frame = document.getElementById("map-frame");
  const tooltip = document.getElementById("tooltip");
  const card = document.getElementById("map-card");
  const select = document.getElementById("country-select");
  const status = document.getElementById("map-status");

  const layer = svg.append("g");
  let selectedId = null;
  let zoomScale = 1;

  function renderLegend() {
    const legend = document.getElementById("legend");
    CATEGORIES.forEach((c) => {
      const count = entries.filter((e) => categoryOf(e) === c.key).length;
      const li = document.createElement("li");
      li.innerHTML = `<span class="swatch cat-${c.key}"></span>${c.label} <span class="legend-count">${count}</span>`;
      legend.append(li);
    });
  }

  function renderSelect() {
    entries.forEach((e) => select.add(new Option(e.country, e.id)));
    select.addEventListener("change", () => select.value && choose(select.value, true));
  }

  function showTooltip(event, entry) {
    tooltip.innerHTML = "";
    const country = document.createElement("strong");
    country.textContent = entry.country;
    const title = document.createElement("span");
    title.textContent = entry.display.english || entry.display.title;
    tooltip.append(country, title);
    tooltip.hidden = false;
    const box = frame.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    const flip = x > box.width - 220;
    tooltip.style.left = `${flip ? x - 12 : x + 12}px`;
    tooltip.style.top = `${y + 12}px`;
    tooltip.style.transform = flip ? "translateX(-100%)" : "";
  }

  function hideTooltip() {
    tooltip.hidden = true;
  }

  function renderCard(entry) {
    card.innerHTML = "";
    card.append(heading(entry, "h2"));
    card.append(entry.passage ? passage(entry) : el("p", "entry-description", entry.description));
    const note = historyNote(entry);
    if (note) card.append(note);
    const links = el("p", "entry-links");
    const source = sourceLink(entry);
    if (source) links.append(source);
    const onPoems = el("a", "", "See on the Poems page");
    onPoems.href = `poems/archive.html${entry.passage ? "" : "?explore"}#${entry.id}`;
    links.append(onPoems);
    card.append(links);
    card.append(el("p", "view-note", entry.passage ? VIEW_NOTES.read : VIEW_NOTES.explore));
    card.hidden = false;
  }

  function choose(id, scrollToCard) {
    const entry = byId.get(id);
    if (!entry) return;
    selectedId = id;
    select.value = id;
    layer.selectAll(".country, .dot").classed("selected", (d) => d.entry && d.entry.id === id);
    layer.selectAll(".dot.selected").raise();
    renderCard(entry);
    history.replaceState(null, "", `#${id}`);
    if (scrollToCard) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function largestPolygon(feature) {
    if (feature.geometry.type !== "MultiPolygon") return feature;
    const polygons = feature.geometry.coordinates.map((coordinates) => ({
      type: "Feature",
      geometry: { type: "Polygon", coordinates },
    }));
    return polygons.reduce((a, b) => (d3.geoArea(a) >= d3.geoArea(b) ? a : b));
  }

  function draw(world) {
    const features = topojson
      .feature(world, world.objects.countries)
      .features.filter((f) => f.properties.name !== "Antarctica");
    features.forEach((f) => (f.entry = byAtlasName.get(f.properties.name) || null));

    const projection = d3.geoEqualEarth().fitExtent(
      [[8, 8], [WIDTH - 8, HEIGHT - 8]],
      { type: "FeatureCollection", features }
    );
    const path = d3.geoPath(projection);

    const interactive = (selection) =>
      selection
        .on("pointermove", (event, d) => showTooltip(event, d.entry))
        .on("pointerleave", hideTooltip)
        .on("click", (event, d) => {
          hideTooltip();
          choose(d.entry.id, true);
        });

    layer
      .selectAll("path")
      .data(features)
      .join("path")
      .attr("d", path)
      .attr("class", (d) => (d.entry ? `country cat-${categoryOf(d.entry)}` : "country no-entry"))
      .filter((d) => d.entry)
      .call(interactive);

    const dots = features
      .filter((f) => f.entry && path.area(f) < SMALL_AREA)
      .map((f) => ({ entry: f.entry, point: projection(d3.geoCentroid(largestPolygon(f))) }));
    Object.entries(EXTRA_POINTS).forEach(([name, lonLat]) => {
      const entry = byAtlasName.get(name);
      if (entry) dots.push({ entry, point: projection(lonLat) });
    });

    const dot = layer
      .selectAll("g.dot")
      .data(dots)
      .join("g")
      .attr("class", (d) => `dot cat-${categoryOf(d.entry)}`)
      .attr("transform", (d) => `translate(${d.point})`)
      .call(interactive);
    dot.append("circle").attr("class", "dot-hit");
    dot.append("circle").attr("class", "dot-mark");
    sizeDots();

    const missing = entries.filter((e) => !features.some((f) => f.entry === e) && !dots.some((d) => d.entry === e));
    if (missing.length) console.warn("Not on the map:", missing.map((e) => e.country));
  }

  // On phones the map gets a taller frame (see styles.css) and fills it, cropping the far east and west;
  // the zoom extent is set to the visible area so those edges can still be dragged into view
  function fitView() {
    const node = svg.node();
    if (!node.clientWidth) return; // hidden on phones
    const crop = node.clientWidth < 640;
    svg.attr("preserveAspectRatio", crop ? "xMidYMid slice" : "xMidYMid meet");
    const scale = viewScale();
    const visibleWidth = Math.min(WIDTH, node.clientWidth / scale);
    const x0 = (WIDTH - visibleWidth) / 2;
    zoom.extent([[x0, 0], [x0 + visibleWidth, HEIGHT]]);
  }

  // Screen pixels per map unit at zoom level 1
  function viewScale() {
    const node = svg.node();
    const sx = node.clientWidth / WIDTH;
    const sy = node.clientHeight / HEIGHT;
    return svg.attr("preserveAspectRatio") === "xMidYMid slice" ? Math.max(sx, sy) : Math.min(sx, sy);
  }

  // Keep dots the same size on screen whatever the map's width or zoom level
  function sizeDots() {
    const unitsPerPixel = 1 / (viewScale() * zoomScale);
    layer.selectAll(".dot-mark").attr("r", 4 * unitsPerPixel);
    layer.selectAll(".dot-hit").attr("r", 11 * unitsPerPixel);
  }
  window.addEventListener("resize", () => {
    fitView();
    sizeDots();
  });

  const zoom = d3
    .zoom()
    .scaleExtent([1, 16])
    .translateExtent([[0, 0], [WIDTH, HEIGHT]])
    .on("zoom", (event) => {
      zoomScale = event.transform.k;
      layer.attr("transform", event.transform);
      sizeDots();
      hideTooltip();
    });
  fitView();
  svg.call(zoom);
  document.getElementById("zoom-in").addEventListener("click", () => svg.transition().call(zoom.scaleBy, 1.8));
  document.getElementById("zoom-out").addEventListener("click", () => svg.transition().call(zoom.scaleBy, 1 / 1.8));
  document.getElementById("zoom-reset").addEventListener("click", () => svg.transition().call(zoom.transform, d3.zoomIdentity));

  renderLegend();
  renderSelect();

  const chooseFromLink = () => {
    const initial = decodeURIComponent(location.hash.slice(1));
    if (byId.has(initial)) choose(initial, false);
  };

  // Phones get the country list only (the map is hidden by styles.css), so skip downloading it
  if (window.matchMedia("(max-width: 40rem)").matches) {
    chooseFromLink();
    return;
  }

  d3.json(WORLD_URL)
    .then((world) => {
      draw(world);
      status.remove();
      chooseFromLink();
    })
    .catch(() => {
      status.textContent = "The map could not load. You can still choose a country from the list above.";
    });
})();
