/* Medical Study AI with BR — no framework required */
"use strict";

const DATA_PATHS = {
  subjects: "data/subjects.json",
  resources: "data/resources.json",
  medicines: "data/medicines.json"
};
const state = { subjects: [], resources: [], medicines: [] };
const $ = (selector) => document.querySelector(selector);

async function loadArray(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const value = await response.json();
    if (!Array.isArray(value)) throw new Error("Expected a JSON array");
    return value;
  } catch (error) {
    console.error(`Unable to load ${path}`, error);
    return [];
  }
}
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
}
function safeHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch { return false; }
}
function externalLink(url, label) {
  if (!safeHttpUrl(url)) return null;
  const link = el("a", "", label);
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}
function showMessage(container, message, isError = false) {
  if (!container) return;
  container.replaceChildren(el("p", isError ? "status-error" : "muted", message));
}
function searchText(values, query) {
  return values.filter((v) => v !== undefined && v !== null)
    .map((v) => typeof v === "string" ? v : JSON.stringify(v))
    .join(" ").toLocaleLowerCase().includes(query);
}

function setupNavigation() {
  const toggle = $("#menuToggle");
  const nav = $("#mainNav");
  if (!toggle || !nav) return;
  const close = () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
  };
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") close(); });
}

function renderSubjects() {
  const container = $("#bhmsYears");
  if (!container) return;
  container.replaceChildren();
  if (!state.subjects.length) {
    showMessage(container, "Subject data could not be loaded. Check data/subjects.json.", true);
    return;
  }
  state.subjects.forEach((year, index) => {
    const card = el("article", "year-card");
    card.append(el("span", "year-number", String(index + 1).padStart(2, "0")));
    card.append(el("h3", "", year.year || `BHMS Year ${index + 1}`));
    const subjects = Array.isArray(year.subjects) ? year.subjects : [];
    if (!subjects.length) card.append(el("p", "muted", "Subjects will be added after syllabus verification."));
    const list = el("ul");
    subjects.forEach((subject) => {
      const name = typeof subject === "string" ? subject : subject.name || "Unnamed subject";
      const li = el("li", "", name);
      if (subject && typeof subject === "object" && subject.description) li.title = subject.description;
      list.append(li);
    });
    card.append(list);
    container.append(card);
  });
}

function setupGlobalSearch() {
  const input = $("#globalSearch");
  const button = $("#searchButton");
  const output = $("#searchResults");
  if (!input || !output) return;

  function runSearch() {
    const query = input.value.trim().toLocaleLowerCase();
    output.replaceChildren();
    if (!query) {
      showMessage(output, "Type a search term first.");
      return;
    }
    const results = [];
    state.subjects.forEach((year) => (year.subjects || []).forEach((subject) => {
      const name = typeof subject === "string" ? subject : subject.name || "";
      const description = typeof subject === "object" ? subject.description || "" : "";
      if (searchText([name, description, year.year], query))
        results.push({ title: name, detail: `${year.year} · BHMS subject`, section: "BHMS" });
    }));
    state.resources.forEach((resource) => {
      if (searchText([resource.title, resource.description, resource.category, resource.year, resource.status], query))
        results.push({ title: resource.title || "Resource", detail: resource.description || resource.category || "", section: "Resource", url: resource.url, pdf: resource.pdf });
    });
    state.medicines.forEach((medicine) => {
      if (searchText(Object.values(medicine), query))
        results.push({ title: medicine.name || medicine.generic || "Medicine", detail: medicine.category || "Medicine reference", section: "Allopathy" });
    });
    if (!results.length) { showMessage(output, "No matching results found."); return; }
    results.slice(0, 50).forEach((item) => {
      const card = el("article", "result-item");
      card.append(el("h3", "", item.title));
      card.append(el("p", "", `${item.section} · ${item.detail}`));
      const link = externalLink(item.url, "Open source");
      if (link) card.append(link);
      if (item.pdf && safeHttpUrl(item.pdf)) {
        const view = el("button", "small-button", "Preview PDF");
        view.type = "button";
        view.addEventListener("click", () => openPdf(item.pdf, item.title));
        card.append(view);
      }
      output.append(card);
    });
  }
  button?.addEventListener("click", runSearch);
  input.addEventListener("keydown", (event) => { if (event.key === "Enter") runSearch(); });
}

function setupMedicineSearch() {
  const input = $("#medicineSearch");
  const output = $("#medicineResults");
  if (!input || !output) return;
  input.addEventListener("input", () => {
    const query = input.value.trim().toLocaleLowerCase();
    output.replaceChildren();
    if (!query) return;
    const matches = state.medicines.filter((medicine) => searchText(Object.values(medicine), query));
    if (!matches.length) { showMessage(output, "No match in the current starter dataset."); return; }
    matches.forEach((medicine) => {
      const card = el("article", "result-item");
      card.append(el("h3", "", medicine.name || medicine.generic || "Medicine"));
      const fields = [
        ["Generic name", "generic"], ["Brand", "brand"], ["Composition", "composition"],
        ["Strength", "strength"], ["Manufacturer", "manufacturer"], ["Category", "category"],
        ["Indications", "indications"], ["Side effects", "sideEffects"],
        ["Contraindications", "contraindications"], ["Precautions", "precautions"],
        ["Interactions", "interactions"], ["Dosage information", "dosageReference"],
        ["Status", "status"]
      ];
      fields.forEach(([label, key]) => {
        if (medicine[key]) card.append(el("p", "", `${label}: ${medicine[key]}`));
      });
      const source = externalLink(medicine.source, "Open reference source");
      if (source) card.append(source);
      output.append(card);
    });
  });
}

function setupImagePreview() {
  const input = $("#medicineImage");
  const output = $("#imagePreview");
  if (!input || !output) return;
  let currentUrl = null;
  input.addEventListener("change", () => {
    output.replaceChildren();
    if (currentUrl) URL.revokeObjectURL(currentUrl);
    const file = input.files && input.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showMessage(output, "Choose a valid image file.", true); return; }
    if (file.size > 10 * 1024 * 1024) { showMessage(output, "Image must be smaller than 10 MB.", true); input.value = ""; return; }
    currentUrl = URL.createObjectURL(file);
    const image = el("img");
    image.alt = "Selected medicine package preview";
    image.src = currentUrl;
    image.onerror = () => showMessage(output, "Could not preview this image.", true);
    output.append(image);
    output.append(el("p", "muted", "Preview only. This version does not identify medicines from images."));
  });
}

function categoryKey(value) {
  return String(value || "").toLowerCase().trim().replace(/[\s_]+/g, "-");
}
function matchesResourceType(resource, selected) {
  if (selected === "all") return true;
  const category = categoryKey(resource.category);
  const type = categoryKey(resource.type);
  const map = {
    syllabus: ["syllabus"],
    "question-paper": ["question-paper", "question-papers"],
    notes: ["notes", "study-material", "study-materials"],
    reference: ["reference", "university", "college"],
    allopathy: ["allopathy", "drug-reference"]
  };
  const allowed = map[selected] || [selected];
  return allowed.includes(category) || allowed.includes(type);
}
function openPdf(url, title) {
  if (!safeHttpUrl(url)) return;
  const viewer = $("#pdfViewer");
  const frame = $("#pdfFrame");
  const newTab = $("#pdfNewTab");
  if (!viewer || !frame || !newTab) return;
  $("#pdfTitle").textContent = title || "PDF preview";
  frame.src = url;
  newTab.href = url;
  viewer.hidden = false;
  viewer.scrollIntoView({ behavior: "smooth", block: "start" });
}
function setupPdfViewer() {
  $("#closePdf")?.addEventListener("click", () => {
    $("#pdfFrame").src = "about:blank";
    $("#pdfViewer").hidden = true;
  });
}
function setupResources() {
  const container = $("#resourceList");
  const filter = $("#resourceType");
  if (!container) return;
  function render() {
    container.replaceChildren();
    const selected = filter?.value || "all";
    const resources = state.resources.filter((r) => matchesResourceType(r, selected));
    if (!resources.length) { showMessage(container, "No resources match this filter."); return; }
    resources.forEach((resource) => {
      const card = el("article", "result-item");
      card.append(el("h3", "", resource.title || "Study resource"));
      if (resource.year) card.append(el("p", "", `Year: ${resource.year}`));
      if (resource.description) card.append(el("p", "", resource.description));
      if (resource.status) card.append(el("p", "", `Source status: ${resource.status}`));
      const actions = el("div", "result-actions");
      const link = externalLink(resource.url, "Open source");
      if (link) actions.append(link);
      if (resource.pdf && safeHttpUrl(resource.pdf)) {
        const preview = el("button", "small-button", "Preview PDF");
        preview.type = "button";
        preview.addEventListener("click", () => openPdf(resource.pdf, resource.title));
        actions.append(preview);
      }
      if (actions.childNodes.length) card.append(actions);
      container.append(card);
    });
  }
  filter?.addEventListener("change", render);
  render();
}

async function init() {
  setupNavigation();
  setupPdfViewer();
  [state.subjects, state.resources, state.medicines] = await Promise.all([
    loadArray(DATA_PATHS.subjects), loadArray(DATA_PATHS.resources), loadArray(DATA_PATHS.medicines)
  ]);
  renderSubjects();
  setupGlobalSearch();
  setupMedicineSearch();
  setupImagePreview();
  setupResources();
}
document.addEventListener("DOMContentLoaded", init);
