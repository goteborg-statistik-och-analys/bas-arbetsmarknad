const DATA_URL = "data/branscher.json";
const MAX_SELECTED = 7;
const COLORS = ["#3f5564", "#008391", "#008767", "#ffcd37", "#d24723", "#d53878", "#674b99"];
const DASHES = [[], [10, 5], [3, 4], [12, 4, 3, 4], [2, 3], [14, 5], [7, 3, 2, 3]];
const DEFAULT_CODES = ["B+C", "F", "G", "J", "Q"];
const SHORT_LABELS = {
  "A": "Jordbruk, skogsbruk och fiske",
  "B+C": "Tillverkning och utvinning",
  "D+E": "Energi och miljö",
  "F": "Byggindustri",
  "G": "Handel och fordonsservice",
  "H": "Transport och magasinering",
  "I": "Hotell och restaurang",
  "J": "Information och kommunikation",
  "K": "Finans och försäkring",
  "L": "Fastighetsverksamhet",
  "M+N": "Företagstjänster",
  "O": "Offentlig förvaltning och försvar",
  "P": "Utbildning",
  "Q": "Vård, omsorg och socialtjänst",
  "R+S+T+U": "Kultur, nöje och övrig service"
};

let data = [];
let chart;
let barChart;
let selectedMonth = null;
let selectedBranches = [];

const loading = document.querySelector("#loading");
const error = document.querySelector("#error");
const regionSelect = document.querySelector("#branch-region");
const branchOptions = document.querySelector("#branch-options");

function showError(message) {
  loading.hidden = true;
  error.hidden = false;
  error.textContent = message;
}

function branchCode(label) {
  return data.find(row => row.bransch === label)?.branschkod || "";
}

function branchLabel(label) {
  if (branchCode(label) === "A-U+US") return "Samtliga branscher";
  if (branchCode(label) === "US") return "Uppgift saknas";
  return label.replace(/^./, character => character.toUpperCase());
}

function shortBranchLabel(row) {
  return SHORT_LABELS[row.branschkod] || branchLabel(row.bransch);
}

function monthNumber(month) {
  const match = /^(\d{4})M(\d{2})$/.exec(month);
  return match ? Number(match[1]) * 12 + Number(match[2]) : NaN;
}

function monthLabel(month) {
  return month ? month.replace("M", "-") : "Period saknas";
}

function formatValue(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "saknas";
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(value);
}

function formatChange(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "saknas";
  return `${Number(value) > 0 ? "+" : ""}${formatValue(value)}`;
}

function rowsFor(region, branch) {
  return data
    .filter(row => row.region === region && row.bransch === branch)
    .sort((a, b) => monthNumber(a.månad) - monthNumber(b.månad));
}

function renderOptions() {
  const branches = [...new Set(data.map(row => row.bransch))]
    .filter(branch => !["A-U+US", "US"].includes(branchCode(branch)));
  selectedBranches = branches.filter(branch => DEFAULT_CODES.includes(branchCode(branch)));
  branchOptions.replaceChildren(...branches.map(branch => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = branch;
    input.checked = selectedBranches.includes(branch);
    const text = document.createElement("span");
    text.textContent = `${branchCode(branch)} · ${SHORT_LABELS[branchCode(branch)] || branchLabel(branch)}`;
    label.append(input, text);
    return label;
  }));
}

function renderTable(region, targetMonth) {
  const previousYear = targetMonth ? `${Number(targetMonth.slice(0, 4)) - 1}${targetMonth.slice(4)}` : null;
  const allMonths = [...new Set(data.filter(row => row.region === region).map(row => row.månad))]
    .sort((a, b) => monthNumber(a) - monthNumber(b));
  const previousMonth = allMonths[allMonths.indexOf(targetMonth) - 1];
  document.querySelector("#summary-title").textContent = `Läget ${monthLabel(targetMonth)} i ${region}`;
  document.querySelector("#summary-body").innerHTML = selectedBranches.map((branch, index) => {
    const rows = rowsFor(region, branch);
    const current = rows.find(row => row.månad === targetMonth)?.antal;
    const monthComparison = rows.find(row => row.månad === previousMonth)?.antal;
    const yearComparison = rows.find(row => row.månad === previousYear)?.antal;
    const monthChange = current != null && monthComparison != null ? Number(current) - Number(monthComparison) : null;
    const yearChange = current != null && yearComparison != null ? Number(current) - Number(yearComparison) : null;
    return `<tr><td><span class="swatch" style="background:${COLORS[index]}"></span>${branchCode(branch)} · ${branchLabel(branch)}</td><td>${formatValue(current)}</td><td>${formatChange(monthChange)}</td><td>${formatChange(yearChange)}</td></tr>`;
  }).join("");
}

function renderBarChart(region, latestMonth) {
  const topBranches = data
    .filter(row => row.region === region && row.månad === latestMonth)
    .filter(row => !["A-U+US", "US"].includes(row.branschkod) && row.antal != null)
    .sort((a, b) => Number(b.antal) - Number(a.antal))
    .slice(0, MAX_SELECTED);
  const leader = topBranches[0];

  document.querySelector("#branch-bar-title").textContent = leader
    ? `${shortBranchLabel(leader)} är största branschen i ${region}`
    : `De största branscherna i ${region}`;
  document.querySelector("#branch-bar-description").textContent =
    `De sju största branscherna ${monthLabel(latestMonth)}, antal sysselsatta 15–74 år.`;
  document.querySelector("#branch-bar-chart").setAttribute(
    "aria-label",
    `De sju största branscherna i ${region} ${monthLabel(latestMonth)}. ${leader ? `${leader.branschkod} är störst.` : ""}`
  );

  if (barChart) barChart.destroy();
  barChart = new Chart(document.querySelector("#branch-bar-chart"), {
    type: "bar",
    data: {
      labels: topBranches.map(row => `${row.branschkod} · ${shortBranchLabel(row)}`),
      datasets: [{
        label: "Sysselsatta",
        data: topBranches.map(row => row.antal),
        backgroundColor: "#3f5564",
        borderColor: "#3f5564",
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: context => `${formatValue(context.raw)} personer` } }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { color: "#1f1f1f", callback: formatValue },
          grid: { color: "#d1d9dc" },
          title: { display: true, text: "personer", color: "#1f1f1f" }
        },
        y: { ticks: { color: "#1f1f1f", autoSkip: false }, grid: { display: false } }
      }
    }
  });
}

function render() {
  const region = regionSelect.value;
  const labels = [...new Set(data.filter(row => row.region === region).map(row => row.månad))]
    .sort((a, b) => monthNumber(a) - monthNumber(b));
  const targetMonth = selectedMonth && labels.includes(selectedMonth) ? selectedMonth : labels.at(-1);
  const datasets = selectedBranches.map((branch, index) => ({
    label: `${branchCode(branch)} · ${branchLabel(branch)}`,
    data: rowsFor(region, branch).map(row => row.antal),
    borderColor: COLORS[index],
    backgroundColor: COLORS[index],
    borderDash: DASHES[index],
    borderWidth: 3,
    pointRadius: context => context.chart.data.labels[context.dataIndex] === targetMonth ? 5 : 0,
    pointHoverRadius: 5,
    spanGaps: false,
    tension: 0.15
  }));

  document.querySelector("#branch-chart-title").textContent = `Sysselsättningen i valda branscher i ${region}`;
  document.querySelector("#selection-note").textContent = `${selectedBranches.length} av högst ${MAX_SELECTED} branscher valda.`;
  if (chart) chart.destroy();
  chart = new Chart(document.querySelector("#branch-chart"), {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { position: "bottom", labels: { color: "#1f1f1f", usePointStyle: true, padding: 18 } },
        tooltip: { callbacks: { label: context => `${context.dataset.label}: ${formatValue(context.raw)} personer` } }
      },
      onClick: (_event, elements) => {
        if (elements.length === 0) return;
        selectedMonth = labels[elements[0].index];
        render();
      },
      scales: {
        x: { ticks: { color: "#1f1f1f", maxTicksLimit: 10 }, grid: { display: false } },
        y: { ticks: { color: "#1f1f1f", callback: formatValue }, grid: { color: "#d1d9dc" }, title: { display: true, text: "personer", color: "#1f1f1f" } }
      }
    }
  });
  renderBarChart(region, labels.at(-1));
  renderTable(region, targetMonth);
  loading.textContent = `Vald månad: ${monthLabel(targetMonth)}.`;
}

branchOptions.addEventListener("change", event => {
  if (!event.target.matches("input")) return;
  const checked = [...branchOptions.querySelectorAll("input:checked")];
  if (checked.length > MAX_SELECTED) {
    event.target.checked = false;
    document.querySelector("#selection-note").textContent = `Du kan välja högst ${MAX_SELECTED} branscher.`;
    return;
  }
  if (checked.length === 0) {
    event.target.checked = true;
    return;
  }
  selectedBranches = checked.map(input => input.value);
  render();
});

regionSelect.addEventListener("change", () => {
  selectedMonth = null;
  render();
});

if (window.location.protocol === "file:") {
  showError("Öppna webbappen via en lokal webbserver.");
} else if (!window.Chart) {
  showError("Chart.js kunde inte laddas. Kontrollera internetanslutningen och ladda om sidan.");
} else {
  Promise.all([fetch(DATA_URL), fetch("data/metadata.json")])
    .then(async ([dataResponse, metadataResponse]) => {
      if (!dataResponse.ok) throw new Error(`HTTP ${dataResponse.status}`);
      if (!metadataResponse.ok) throw new Error(`Metadata HTTP ${metadataResponse.status}`);
      const [json, metadata] = await Promise.all([dataResponse.json(), metadataResponse.json()]);
      data = json;
      document.querySelector("#last-updated").textContent = metadata.last_updated || "—";
      document.querySelector("#next-update").textContent = metadata.next_update || "—";
      if (data.length === 0) throw new Error("Datafilen innehåller inga observationer.");
      [...new Set(data.map(row => row.region))].forEach(region => regionSelect.add(new Option(region, region, false, region === "Göteborg")));
      renderOptions();
      render();
    })
    .catch(err => showError(`Kunde inte läsa branschdatan: ${err.message}`));
}
