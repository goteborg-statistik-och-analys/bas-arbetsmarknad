const DATA_URL = "data/arbetsmarknad.json";
const COLORS = {
  "totalt": "#3f5564",
  "inrikes född": "#d24723",
  "utrikes född": "#674b99"
};
const LABELS = {
  "totalt": "Totalt",
  "inrikes född": "Inrikes födda",
  "utrikes född": "Utrikes födda"
};
const SEX_LABELS = {
  "totalt": "Totalt",
  "kvinnor": "Kvinnor",
  "män": "Män"
};

let data = [];
let rateChart;
let employedChart;
let breakdown = "total";
let measure = "employment";
let selectedMonth = null;
let selectedRegions = ["Göteborg"];
const axisScales = { rate: "auto", employed: "auto" };
const MEASURES = {
  employment: {
    rate: "sysselsättningsgrad",
    count: "antal sysselsatta",
    rateTitle: "Sysselsättningsgrad",
    countTitle: "Antal sysselsatta",
    rateDescription: "Andel av befolkningen 20–64 år, procent.",
    countDescription: "Antal personer 20–64 år."
  },
  unemployment: {
    rate: "arbetslöshet",
    count: "antal arbetslösa",
    rateTitle: "Arbetslöshet",
    countTitle: "Antal arbetslösa",
    rateDescription: "Andel av arbetskraften, procent.",
    countDescription: "Antal personer 20–64 år."
  }
};

const regionSelect = document.querySelector("#region-select");
const tabs = [...document.querySelectorAll("[data-breakdown]")];
const loading = document.querySelector("#loading");
const error = document.querySelector("#error");

function setUpdateDates(metadata) {
  document.querySelector("#last-updated").textContent = metadata.last_updated || "—";
  document.querySelector("#next-update").textContent = metadata.next_update || "—";
}

function showError(message) {
  loading.hidden = true;
  error.hidden = false;
  error.textContent = message;
}

if (window.location.protocol === "file:") {
  showError("Öppna webbappen via en lokal webbserver. Kör start_web.ps1 i projektmappen och öppna sedan http://127.0.0.1:8765/web/.");
} else if (!window.Chart) {
  showError("Chart.js kunde inte laddas. Kontrollera internetanslutningen och ladda om sidan.");
} else {

function rowsFor(region) {
  return data.filter(row => row.region === region);
}

function displayLabel(value) {
  return SEX_LABELS[value] || LABELS[value] || value.replace(/^./, character => character.toUpperCase());
}

function regionRows(region) {
  return rowsFor(region);
}

function seriesValues(rows) {
  if (breakdown === "sex") return [...new Set(rows.map(row => row.kön))].filter(value => value !== "totalt");
  if (breakdown === "birth-region") return Object.keys(LABELS).filter(value => value !== "totalt");
  return ["totalt"];
}

function rowsForSeries(rows, value) {
  return rows.filter(row => breakdown === "total"
    ? row.kön === "totalt" && row["födelseregion"] === "totalt"
    : breakdown === "sex"
      ? row.kön === value && row["födelseregion"] === "totalt"
      : row.kön === "totalt" && row["födelseregion"] === value);
}

function seriesFor(regions, measure) {
  const regionList = Array.isArray(regions) ? regions : [regions];
  const bySex = breakdown === "sex";
  const byBirthRegion = breakdown === "birth-region";
  const colors = ["#3f5564", "#d24723", "#674b99", "#008767", "#d53878", "#008391", "#ffcd37"];
  return regionList.flatMap(region => {
    const rows = regionRows(region);
    return seriesValues(rows).map((value, index) => ({
    label: regionList.length > 1 ? `${region} · ${bySex ? displayLabel(value) : LABELS[value]}` : bySex ? displayLabel(value) : LABELS[value],
    data: rowsForSeries(rows, value).map(row => row[measure]),
    borderColor: regionList.length === 1 && byBirthRegion ? COLORS[value] : colors[(regionList.indexOf(region) * 3 + index) % colors.length],
    backgroundColor: regionList.length === 1 && byBirthRegion ? COLORS[value] : colors[(regionList.indexOf(region) * 3 + index) % colors.length],
    borderDash: [],
    pointRadius: context => context.chart.data.labels[context.dataIndex] === selectedMonth ? 5 : 0,
    pointHoverRadius: 5,
    borderWidth: 3,
    spanGaps: false,
    tension: 0.15
    }));
  });
}

function chartOptions(unit, scaleKey) {
  const scale = axisScales[scaleKey];
  const minInput = document.querySelector(`#${scaleKey}-min`);
  const maxInput = document.querySelector(`#${scaleKey}-max`);
  const min = scale === "custom" && minInput.value !== "" ? Number(minInput.value) : undefined;
  const max = scale === "custom" && maxInput.value !== "" ? Number(maxInput.value) : undefined;
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "bottom", labels: { color: "#1f1f1f", usePointStyle: true, padding: 18 } },
      tooltip: { callbacks: { label: context => `${context.dataset.label}: ${formatValue(context.raw)} ${unit}` } }
    },
    onClick: (_event, elements, chart) => {
      if (elements.length === 0) return;
      const clickedMonth = chart.data.labels[elements[0].index];
      selectedMonth = selectedMonth === clickedMonth ? null : clickedMonth;
      render(selectedRegions);
    },
    scales: {
      x: { ticks: { color: "#1f1f1f", maxTicksLimit: 10 }, grid: { display: false } },
      y: { beginAtZero: scale === "zero", min, max, ticks: { color: "#1f1f1f", callback: value => formatValue(value) }, grid: { color: "#d1d9dc" }, title: { display: true, text: unit, color: "#1f1f1f" } }
    }
  };
}

function formatValue(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "saknas";
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 1 }).format(value);
}

function formatChange(value, decimals = 0) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "saknas";
  const sign = Number(value) > 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat("sv-SE", { maximumFractionDigits: decimals }).format(value)}`;
}

function monthLabel(month) {
  return month ? month.replace("M", "") : "Period saknas";
}

function monthNumber(month) {
  const match = /^(\d{4})M(\d{2})$/.exec(month);
  return match ? Number(match[1]) * 12 + Number(match[2]) : NaN;
}

function renderKpis(region) {
  const measureConfig = MEASURES[measure];
  const regions = Array.isArray(region) ? region : [region];
  const rows = rowsFor(regions[0]);
  const months = [...new Set(rows.map(row => row.månad))].sort((a, b) => monthNumber(a) - monthNumber(b));
  const latestMonth = months.at(-1);
  const targetMonth = selectedMonth && months.includes(selectedMonth) ? selectedMonth : latestMonth;
  const targetPreviousMonth = months[months.indexOf(targetMonth) - 1];
  const targetPreviousYear = targetMonth ? `${Number(targetMonth.slice(0, 4)) - 1}${targetMonth.slice(4)}` : null;
  const values = regions.flatMap(currentRegion => seriesValues(rowsFor(currentRegion)).map(value => ({ region: currentRegion, value })));
  document.querySelector("#year-change-period").innerHTML = targetMonth ? `<strong>${monthLabel(targetMonth)}</strong> jämförs med <strong>${monthLabel(targetPreviousYear)}</strong>` : "Period saknas";
  document.querySelector("#month-change-period").innerHTML = targetMonth ? `<strong>${monthLabel(targetMonth)}</strong> jämförs med <strong>${monthLabel(targetPreviousMonth)}</strong>` : "Period saknas";
  const renderCard = comparisonMonth => values.map(({ region: currentRegion, value }) => {
    const current = rowsForSeries(rowsFor(currentRegion), value).find(row => row.månad === targetMonth);
    const comparison = rowsForSeries(rowsFor(currentRegion), value).find(row => row.månad === comparisonMonth);
    const numberChange = current && comparison && current[measureConfig.count] != null && comparison[measureConfig.count] != null
      ? Number(current[measureConfig.count]) - Number(comparison[measureConfig.count]) : null;
    const rateChange = current && comparison && current[measureConfig.rate] != null && comparison[measureConfig.rate] != null
      ? Number(current[measureConfig.rate]) - Number(comparison[measureConfig.rate]) : null;
    const label = regions.length > 1 ? `${currentRegion} · ${value === "totalt" ? "Totalt" : displayLabel(value)}` : value === "totalt" ? "Totalt" : displayLabel(value);
    return `<div class="kpi-series"><strong>${label}</strong><span>${formatChange(numberChange)} personer</span><span>${formatChange(rateChange, 1) } procentenheter</span></div>`;
  }).join("");
  document.querySelector("#year-change-kpis").innerHTML = renderCard(targetPreviousYear);
  document.querySelector("#month-change-kpis").innerHTML = renderCard(targetPreviousMonth);
}

function render(region) {
  const measureConfig = MEASURES[measure];
  const regions = Array.isArray(region) ? region : [region];
  const rows = rowsFor(regions[0]);
  const labels = [...new Set(rows.map(row => row.månad))];
  const targetMonth = selectedMonth && labels.includes(selectedMonth) ? selectedMonth : labels.at(-1);
  const breakdownLabel = breakdown === "total" ? "totalt" : breakdown === "sex" ? "uppdelat på kön" : "uppdelat på födelseregion";
  const geographyLabel = regions.length > 1 ? "jämförelse mellan geografier" : `i ${regions[0]}`;
  document.querySelector("#employment-rate-title").textContent = `${measureConfig.rateTitle} ${geographyLabel}, ${breakdownLabel}`;
  document.querySelector("#employment-rate-description").textContent = measureConfig.rateDescription;
  document.querySelector("#employed-title").textContent = `${measureConfig.countTitle} ${geographyLabel}, ${breakdownLabel}`;
  document.querySelector("#employed-description").textContent = measureConfig.countDescription;

  if (rateChart) rateChart.destroy();
  if (employedChart) employedChart.destroy();
  rateChart = new Chart(document.querySelector("#employment-rate-chart"), { type: "line", data: { labels, datasets: seriesFor(regions, measureConfig.rate) }, options: chartOptions("procent", "rate") });
  employedChart = new Chart(document.querySelector("#employed-chart"), { type: "line", data: { labels, datasets: seriesFor(regions, measureConfig.count) }, options: chartOptions("personer", "employed") });
  renderKpis(regions);
  loading.textContent = `Vald månad: ${monthLabel(targetMonth)}. Klicka på en punkt i diagrammet för att byta vald månad.`;
}

document.querySelectorAll("[data-measure]").forEach(tab => tab.addEventListener("click", () => {
  measure = tab.dataset.measure;
  document.querySelectorAll("[data-measure]").forEach(currentTab => {
    const isActive = currentTab === tab;
    currentTab.classList.toggle("is-active", isActive);
    currentTab.setAttribute("aria-selected", isActive);
  });
  render(selectedRegions);
}));

const regionOptions = document.querySelector("#region-options");
regionSelect.querySelectorAll("option").forEach(option => {
  const label = document.createElement("label");
  label.innerHTML = `<input type="checkbox" value="${option.value}"${selectedRegions.includes(option.value) ? " checked" : ""}> ${option.textContent}`;
  regionOptions.append(label);
});
regionOptions.addEventListener("change", event => {
  if (!event.target.matches("input")) return;
  selectedRegions = [...regionOptions.querySelectorAll("input:checked")].map(input => input.value);
  if (selectedRegions.length === 0) {
    event.target.checked = true;
    selectedRegions = [event.target.value];
  }
  document.querySelector("#geography-picker summary").textContent = selectedRegions.length > 1 ? `${selectedRegions.length} geografier valda` : selectedRegions[0];
  render(selectedRegions);
});
document.querySelector("#geography-picker summary").textContent = "Göteborg";

document.querySelectorAll(".scale-select").forEach(select => select.addEventListener("change", event => {
  const controls = event.target.closest("[data-chart-controls]");
  const scaleKey = controls.dataset.chartControls;
  axisScales[scaleKey] = event.target.value;
  controls.querySelector(".custom-scale").hidden = event.target.value !== "custom";
  controls.querySelectorAll(".custom-scale input").forEach(input => {
    input.disabled = event.target.value !== "custom";
  });
  render(selectedRegions);
}));

document.querySelectorAll(".custom-scale input").forEach(input => input.addEventListener("change", event => {
  const controls = event.target.closest("[data-chart-controls]");
  const min = controls.querySelector(`#${controls.dataset.chartControls}-min`).value;
  const max = controls.querySelector(`#${controls.dataset.chartControls}-max`).value;
  if (min !== "" && max !== "" && Number(min) >= Number(max)) {
    event.target.setCustomValidity("Min måste vara mindre än max.");
    event.target.reportValidity();
    return;
  }
  event.target.setCustomValidity("");
  render(selectedRegions);
}));

regionSelect.addEventListener("change", event => render([event.target.value]));
tabs.forEach(tab => tab.addEventListener("click", () => {
  breakdown = tab.dataset.breakdown;
  tabs.forEach(currentTab => {
    const isActive = currentTab === tab;
    currentTab.classList.toggle("is-active", isActive);
    currentTab.setAttribute("aria-selected", isActive);
  });
  render(selectedRegions);
}));

Promise.all([fetch(DATA_URL), fetch("data/metadata.json")])
  .then(async ([dataResponse, metadataResponse]) => {
    if (!dataResponse.ok) throw new Error(`HTTP ${dataResponse.status}`);
    if (!metadataResponse.ok) throw new Error(`Metadata HTTP ${metadataResponse.status}`);
    const [json, metadata] = await Promise.all([dataResponse.json(), metadataResponse.json()]);
    data = json;
    setUpdateDates(metadata);
    if (data.length === 0) throw new Error("Datafilen innehåller inga observationer.");
    render(selectedRegions);
  })
  .catch(err => showError(`Kunde inte läsa datafilen: ${err.message}`));
}
