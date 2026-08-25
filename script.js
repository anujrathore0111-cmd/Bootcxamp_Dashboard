/* ==========================================================================
   NEXUS//SIM - Global Telecom Command Center OS v4.2
   Interactive Controller & High-Tech Telemetry Engine
   ========================================================================== */

console.log("NEXUS//SIM Command OS Initialized");

// ---- Supabase project credentials ----
const SUPABASE_URL = "https://clmygdsltelivvmrjylx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_OVK4S0KDoBJk0SAOBSbqGg_UQS44MKt";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Audio FX Synthesizer (Web Audio API) ---------- */
let audioCtx = null;
let soundEnabled = true;

function playUiSound(type) {
  if (!soundEnabled || prefersReducedMotion) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    if (type === "click") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "success") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.06);
      osc.frequency.setValueAtTime(783.99, now + 0.12);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === "switch") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}

/* ---------- Toast Notification System ---------- */
function showToast(msg) {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--accent-cyan);">' +
    '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />' +
    '<polyline points="22 4 12 14.01 9 11.01" />' +
    '</svg>' +
    '<span>' + msg + '</span>';
  container.appendChild(toast);
  setTimeout(function () {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(40px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(function () { toast.remove(); }, 300);
  }, 3500);
}

/* ---------- Formatting Helpers ---------- */
function formatCurrency(amount) {
  return "\u20b9" + Math.round(amount || 0).toLocaleString("en-IN");
}

function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(function (part) { return part[0].toUpperCase(); })
    .join("");
}

function setTrendClass(elementId, trendType) {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.classList.remove("positive", "negative", "neutral");
  element.classList.add(trendType === "positive" ? "positive" : trendType === "negative" ? "negative" : "neutral");
}

/* ---------- Loading & Error State Handlers ---------- */
function setLoading(isLoading) {
  document.querySelectorAll("#kpiCards .card").forEach(function (card) {
    card.classList.toggle("is-loading", isLoading);
  });
}

function showError(message) {
  const banner = document.getElementById("errorBanner");
  if (banner) {
    document.getElementById("errorMessage").textContent = message;
    banner.hidden = false;
  }
}

function hideError() {
  const banner = document.getElementById("errorBanner");
  if (banner) banner.hidden = true;
}

/* ---------- Animated Digital Counter ---------- */
function animateCounter(el, target, formatter) {
  if (!el) return;
  if (prefersReducedMotion) {
    el.textContent = formatter(target);
    return;
  }
  const duration = 650;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = formatter(target * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ---------- Luminescent Neon Sparklines ---------- */
function renderSparkline(svgId, values) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  if (!values || values.length < 2) {
    svg.innerHTML = "";
    return;
  }

  const w = 100, h = 28, pad = 3;
  const min = Math.min.apply(null, values);
  const max = Math.max.apply(null, values);
  const range = max - min || 1;

  const points = values.map(function (v, i) {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y];
  });

  const d = points.map(function (p, i) {
    return (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1);
  }).join(" ");

  const last = points[points.length - 1];
  const areaD = d + " L" + last[0].toFixed(1) + "," + h + " L" + points[0][0].toFixed(1) + "," + h + " Z";
  const gradId = "sparkGrad-" + svgId;

  svg.innerHTML =
    '<defs>' +
    '<linearGradient id="' + gradId + '" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#b8ff4a" stop-opacity="0.5"/>' +
    '<stop offset="100%" stop-color="#b8ff4a" stop-opacity="0.0"/>' +
    '</linearGradient>' +
    '</defs>' +
    '<path d="' + areaD + '" fill="url(#' + gradId + ')"></path>' +
    '<path d="' + d + '" fill="none" stroke="#b8ff4a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>' +
    '<circle cx="' + last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="2.5" fill="#b8ff4a" stroke="#030508" stroke-width="1.5"></circle>';
}

/* ---------- Top Performers Podium Strip ---------- */
function renderPerformerChips(leaderboard) {
  const strip = document.getElementById("performerStrip");
  if (!strip) return;
  strip.innerHTML = "";

  if (!leaderboard.length) {
    strip.innerHTML = '<p class="empty-note">No SIM dispatches recorded for this billing cycle.</p>';
    return;
  }

  const medals = ["\ud83e\udd47", "\ud83e\udd48", "\ud83e\udd49", "\u2b50", "\u2b50"];

  leaderboard.slice(0, 5).forEach(function (rep, idx) {
    const chip = document.createElement("div");
    chip.className = "coverage-chip";
    chip.innerHTML =
      '<span class="avatar-circle">' + initials(rep.sales_representative) + '</span>' +
      '<div>' +
      '<strong style="display:block; font-size:0.88rem; color: var(--text-highlight);">' + (rep.sales_representative || "Unassigned") + '</strong>' +
      '<small style="color: var(--text-muted); font-size:0.75rem;">Rank ' + medals[idx] + ' • ' + formatCurrency(rep.mtd_revenue) + '</small>' +
      '</div>' +
      '<span class="units mono">' + (rep.mtd_sales || 0).toLocaleString("en-IN") + ' Units</span>';
    strip.appendChild(chip);
  });
}

/* ---------- Leaderboard Breakdown Table ---------- */
function renderLeaderboardTable(leaderboard) {
  const body = document.getElementById("breakdownBody");
  if (!body) return;
  body.innerHTML = "";

  if (!leaderboard.length) {
    body.innerHTML = '<tr><td colspan="5" class="empty-note">No active telemetry found for this date.</td></tr>';
    return;
  }

  const totalMtd = leaderboard.reduce(function (sum, r) { return sum + (r.mtd_sales || 0); }, 0) || 1;

  leaderboard.forEach(function (rep, idx) {
    const share = Math.round(((rep.mtd_sales || 0) / totalMtd) * 100);
    const row = document.createElement("tr");
    const isTop = idx === 0;

    row.innerHTML =
      '<td>' +
      '<div style="display:flex; align-items:center; gap:10px;">' +
      '<span class="avatar-circle" style="width:30px; height:30px; font-size:0.75rem;">' + initials(rep.sales_representative) + '</span>' +
      '<strong>' + (rep.sales_representative || "Unassigned") + '</strong>' +
      (isTop ? '<span class="badge badge-success" style="font-size:0.65rem;">Leader</span>' : '') +
      '</div>' +
      '</td>' +
      '<td class="mono-cell">' + (rep.today_sales || 0).toLocaleString("en-IN") + '</td>' +
      '<td class="mono-cell" style="color: var(--accent-cyan); font-weight:700;">' + (rep.mtd_sales || 0).toLocaleString("en-IN") + '</td>' +
      '<td class="mono-cell">' + formatCurrency(rep.mtd_revenue) + '</td>' +
      '<td>' +
      '<div style="display:flex; align-items:center; gap:10px;">' +
      '<div class="share-track"><div class="share-fill" style="width:' + share + '%"></div></div>' +
      '<span class="mono" style="font-size:0.75rem; color:var(--text-muted); width:32px;">' + share + '%</span>' +
      '</div>' +
      '</td>';
    body.appendChild(row);
  });
}

/* ---------- Monthly Daily Trend Histogram ---------- */
function renderTrendBars(dailyMetrics, selectedDate) {
  const container = document.getElementById("trendBars");
  if (!container) return;
  container.innerHTML = "";

  if (!dailyMetrics.length) {
    container.innerHTML = '<p class="empty-note">No daily metric stream available for this month.</p>';
    return;
  }

  const maxSales = Math.max.apply(null, dailyMetrics.map(function (d) { return d.no_of_sales || 0; }));

  dailyMetrics.forEach(function (d) {
    const row = document.createElement("div");
    row.className = "bar-row";
    const width = maxSales ? ((d.no_of_sales || 0) / maxSales) * 100 : 0;
    const isActive = d.order_date === selectedDate;
    row.innerHTML =
      '<span class="mono" style="' + (isActive ? 'color: var(--accent-emerald); font-weight: 700;' : '') + '">' + d.order_date.slice(5) + '</span>' +
      '<div class="bar-track"><div class="bar-fill' + (isActive ? ' active' : '') + '" style="width:' + width + '%"></div></div>' +
      '<strong class="mono">' + (d.no_of_sales || 0) + '</strong>';
    container.appendChild(row);
  });
}

/* ---------- Main Dashboard Renderer ---------- */
function renderDashboard(payload, reportDate) {
  const kpi = payload.kpi_cards || {};
  const leaderboard = (payload.leaderboard_metrics || []).filter(Boolean);
  const daily = (payload.daily_metrics || []).filter(Boolean);

  const todaySales = kpi.TODAY_SALES || 0;
  const todayRevenue = kpi.TODAY_REVENUE || 0;
  const mtdSales = kpi.mtd_sales || 0;
  const mtdRevenue = kpi.MTD_REVENUE || 0;
  const pmsdSales = kpi.PMSD_SALES || 0;

  animateCounter(document.getElementById("totalUnits"), todaySales, function (v) {
    return Math.round(v).toLocaleString("en-IN");
  });
  animateCounter(document.getElementById("totalRevenue"), todayRevenue, formatCurrency);

  document.getElementById("unitsTrend").textContent = "MTD: " + mtdSales.toLocaleString("en-IN") + " SIMs";
  document.getElementById("revenueTrend").textContent = "MTD: " + formatCurrency(mtdRevenue);
  setTrendClass("unitsTrend", "neutral");
  setTrendClass("revenueTrend", "neutral");

  const topPerformer = leaderboard.length ? leaderboard[0].sales_representative : "-";
  document.getElementById("topPerformer").textContent = topPerformer || "-";

  const growthPct = pmsdSales > 0 ? (((mtdSales - pmsdSales) / pmsdSales) * 100) : null;
  const growthEl = document.getElementById("mtdGrowth");
  const growthStatusEl = document.getElementById("mtdGrowthStatus");
  if (growthPct === null) {
    growthEl.textContent = "\u2013";
    growthStatusEl.textContent = "Baseline calibrating";
    setTrendClass("mtdGrowthStatus", "neutral");
  } else {
    growthEl.textContent = (growthPct >= 0 ? "+" : "") + growthPct.toFixed(1) + "%";
    growthStatusEl.textContent = "vs. PMSD benchmark";
    setTrendClass("mtdGrowthStatus", growthPct >= 0 ? "positive" : "negative");
  }

  const insightEl = document.getElementById("insightText");
  if (insightEl) {
    insightEl.innerHTML = todaySales
      ? "\ud83d\udce1 <strong>Live Status:</strong> Active report logged <strong>" + todaySales + " SIM sales</strong> generating <strong>" + formatCurrency(todayRevenue) + "</strong>. " +
        "Cumulative MTD performance stands at <strong>" + mtdSales + " units (" + formatCurrency(mtdRevenue) + ")</strong>" +
        (topPerformer ? ", anchored by lead representative <strong>" + topPerformer + "</strong>." : ".")
      : "\u26a0\ufe0f <em>No sales records found on date " + reportDate + ". Try selecting 2026-05-31 or active billing dates.</em>";
  }

  const dailySalesSeries = daily.map(function (d) { return d.no_of_sales || 0; });
  const dailyRevenueSeries = daily.map(function (d) { return d.total_revenue || 0; });
  renderSparkline("sparkline-units", dailySalesSeries);
  renderSparkline("sparkline-revenue", dailyRevenueSeries);

  renderPerformerChips(leaderboard.slice().sort(function (a, b) { return (b.mtd_sales || 0) - (a.mtd_sales || 0); }));
  renderLeaderboardTable(leaderboard);
  renderTrendBars(daily, reportDate);
  renderInteractiveCharts(payload);
}

/* ---------- Chart.js Interactive High-Tech Visuals ---------- */
let salesLineAreaChartInstance = null;
let repPieChartInstance = null;
let monthlyBarChartInstance = null;

function getChartColors() {
  const isFrost = document.documentElement.getAttribute("data-theme") === "frost";
  return {
    grid: isFrost ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.06)",
    tick: isFrost ? "#64748b" : "#94a3b8",
    tooltipBg: isFrost ? "#0f172a" : "#0d1321",
    tooltipBorder: isFrost ? "rgba(99, 102, 241, 0.5)" : "rgba(0, 242, 254, 0.4)"
  };
}

function renderInteractiveCharts(payload) {
  if (typeof Chart === "undefined") return;

  const daily = (payload.daily_metrics || []).filter(Boolean);
  const leaderboard = (payload.leaderboard_metrics || []).filter(Boolean);
  const monthly = (payload.monthly_metrics || []).filter(Boolean);

  /* 1. Dual Spline Area Chart */
  const lineCanvas = document.getElementById("salesLineAreaChart");
  if (lineCanvas) {
    const labels = daily.map(function (d) { return d.order_date ? d.order_date.slice(5) : ""; });
    const salesData = daily.map(function (d) { return d.no_of_sales || 0; });
    const revenueData = daily.map(function (d) { return d.total_revenue || 0; });

    const ctx = lineCanvas.getContext("2d");
    const gradSales = ctx.createLinearGradient(0, 0, 0, 260);
    gradSales.addColorStop(0, "rgba(184, 255, 74, 0.45)");
    gradSales.addColorStop(1, "rgba(184, 255, 74, 0.0)");

    const gradRevenue = ctx.createLinearGradient(0, 0, 0, 260);
    gradRevenue.addColorStop(0, "rgba(92, 143, 255, 0.35)");
    gradRevenue.addColorStop(1, "rgba(92, 143, 255, 0.0)");

    if (salesLineAreaChartInstance) {
      salesLineAreaChartInstance.destroy();
    }

    salesLineAreaChartInstance = new Chart(lineCanvas, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Daily Sales (Units)",
            data: salesData,
            borderColor: "#b8ff4a",
            backgroundColor: gradSales,
            fill: true,
            tension: 0.3,
            borderWidth: 2,
            pointBackgroundColor: "#b8ff4a",
            pointBorderColor: "#030508",
            pointBorderWidth: 1.5,
            pointRadius: 3,
            pointHoverRadius: 5,
            yAxisID: "ySales"
          },
          {
            label: "Daily Revenue (\u20b9)",
            data: revenueData,
            borderColor: "#5c8fff",
            backgroundColor: gradRevenue,
            fill: true,
            tension: 0.3,
            borderWidth: 2,
            pointBackgroundColor: "#5c8fff",
            pointBorderColor: "#030508",
            pointBorderWidth: 1.5,
            pointRadius: 3,
            pointHoverRadius: 5,
            yAxisID: "yRevenue"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800, easing: "easeOutQuart" },
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "top",
            labels: { color: "rgba(220,232,252,0.45)", font: { family: "Space Mono", size: 10, weight: "700" }, usePointStyle: true, boxWidth: 7 }
          },
          tooltip: {
            backgroundColor: "#0c1118",
            titleColor: "#dce8fc",
            bodyColor: "rgba(220,232,252,0.65)",
            borderColor: "rgba(184,255,74,0.35)",
            borderWidth: 1,
            padding: 10,
            boxPadding: 5,
            usePointStyle: true,
            callbacks: {
              label: function (context) {
                if (context.datasetIndex === 0) {
                  return " Sales: " + context.raw.toLocaleString("en-IN") + " units";
                } else {
                  return " Revenue: " + formatCurrency(context.raw);
                }
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: "rgba(255,255,255,0.04)" },
            ticks: { color: "rgba(220,232,252,0.3)", font: { family: "Space Mono", size: 9 } }
          },
          ySales: {
            type: "linear",
            position: "left",
            grid: { color: "rgba(255,255,255,0.04)" },
            ticks: { color: "#b8ff4a", font: { family: "Space Mono", size: 9 } },
            title: { display: true, text: "Sales (Units)", color: "#b8ff4a", font: { family: "Space Mono", size: 9, weight: "700" } }
          },
          yRevenue: {
            type: "linear",
            position: "right",
            grid: { drawOnChartArea: false },
            ticks: {
              color: "#5c8fff",
              font: { family: "Space Mono", size: 9 },
              callback: function (val) { return "\u20b9" + Math.round(val / 1000) + "k"; }
            },
            title: { display: true, text: "Revenue (\u20b9)", color: "#5c8fff", font: { family: "Space Mono", size: 9, weight: "700" } }
          }
        }
      }
    });
  }

  /* 2. Rep Volume Share Donut */
  const pieCanvas = document.getElementById("repPieChart");
  if (pieCanvas) {
    const sortedReps = leaderboard.slice().sort(function (a, b) { return (b.mtd_sales || 0) - (a.mtd_sales || 0); });
    const repLabels = sortedReps.map(function (r) { return r.sales_representative || "Unassigned"; });
    const repSales = sortedReps.map(function (r) { return r.mtd_sales || 0; });

    const pastelColors = [
      "#b8ff4a",
      "#5c8fff",
      "#3dffa5",
      "#ffcc44",
      "#ff7c5c",
      "#c084fc",
      "#f472b6",
      "#94a3b8"
    ];

    if (repPieChartInstance) {
      repPieChartInstance.destroy();
    }

    repPieChartInstance = new Chart(pieCanvas, {
      type: "doughnut",
      data: {
        labels: repLabels,
        datasets: [
          {
            data: repSales,
            backgroundColor: pastelColors.slice(0, repLabels.length),
            borderColor: "#030508",
            borderWidth: 3,
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800, easing: "easeOutQuart" },
        plugins: {
          legend: {
            position: "right",
            labels: { color: "rgba(220,232,252,0.5)", font: { family: "Space Mono", size: 9, weight: "700" }, usePointStyle: true, boxWidth: 7 }
          },
          tooltip: {
            backgroundColor: "#0c1118",
            titleColor: "#dce8fc",
            bodyColor: "rgba(220,232,252,0.65)",
            borderColor: "rgba(184,255,74,0.35)",
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: function (context) {
                const total = context.dataset.data.reduce(function (a, b) { return a + b; }, 0) || 1;
                const val = context.raw || 0;
                const pct = Math.round((val / total) * 100);
                return " " + context.label + ": " + val.toLocaleString("en-IN") + " sales (" + pct + "%)";
              }
            }
          }
        },
        cutout: "70%"
      }
    });
  }

  /* 3. Monthly Sales Velocity Bar Chart */
  const barCanvas = document.getElementById("monthlyBarChart");
  if (barCanvas) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const barLabels = monthly.map(function (m) { return (monthNames[(m.month || 1) - 1] || "M" + m.month) + " " + m.year; });
    const barData = monthly.map(function (m) { return m.no_of_sales || 0; });
    
    const ctx = barCanvas.getContext("2d");
    const barGrad = ctx.createLinearGradient(0, 0, 0, 250);
    barGrad.addColorStop(0, "#b8ff4a");
    barGrad.addColorStop(1, "rgba(184,255,74,0.15)");

    if (monthlyBarChartInstance) {
      monthlyBarChartInstance.destroy();
    }

    monthlyBarChartInstance = new Chart(barCanvas, {
      type: "bar",
      data: {
        labels: barLabels,
        datasets: [
          {
            label: "Monthly Sales Volume",
            data: barData,
            backgroundColor: barGrad,
            borderRadius: 2,
            borderSkipped: false,
            maxBarThickness: 40
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800, easing: "easeOutQuart" },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#0c1118",
            titleColor: "#dce8fc",
            bodyColor: "rgba(220,232,252,0.65)",
            borderColor: "rgba(184,255,74,0.35)",
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: function (context) {
                return " Total Sales: " + context.raw.toLocaleString("en-IN") + " units";
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "rgba(220,232,252,0.35)", font: { family: "Space Mono", size: 9 } }
          },
          y: {
            grid: { color: "rgba(255,255,255,0.04)" },
            ticks: { color: "rgba(220,232,252,0.3)", font: { family: "Space Mono", size: 9 } }
          }
        }
      }
    });
  }
}

/* ---------- Supabase Data Fetching ---------- */
let latestRequestId = 0;

async function updateDashboard(reportDate) {
  const requestId = ++latestRequestId;
  setLoading(true);
  hideError();

  try {
    const baseUrl = SUPABASE_URL.replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
    const response = await fetch(baseUrl + "/rest/v1/rpc/get_sale_dashboard", {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + SUPABASE_ANON_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ report_date: reportDate })
    });

    const rows = await response.json();
    if (requestId !== latestRequestId) return;

    if (!response.ok) {
      throw new Error((rows && rows.message) || "Supabase error " + response.status);
    }

    setLoading(false);
    hideError();
    const payload = Array.isArray(rows) ? rows[0] : rows;
    currentPayload = payload;
    renderDashboard(payload || {}, reportDate);

    if (currentActiveView === "settlements") {
      renderSettlementsView(payload);
    }
    showToast("Telemetry synced for " + reportDate);
    playUiSound("success");
  } catch (error) {
    if (requestId !== latestRequestId) return;
    console.error("Supabase fetch error:", error);
    setLoading(false);
    showError("Can't reach Supabase: " + error.message);
    renderDashboard({}, reportDate);
  }
}

/* ---------- View Switching ---------- */
const VIEW_METADATA = {
  overview: {
    category: "OVERVIEW",
    title: "International SIM Sales",
    sub: "Daily sales performance by rep, sourced live from Supabase"
  },
  settlements: {
    category: "FINANCIAL SETTLEMENTS",
    title: "Representative Financial Ledger",
    sub: "15% rep commission reconciliation, cleared payouts, and billing status"
  }
};

let currentActiveView = "overview";
let currentPayload = null;

function switchView(viewName) {
  if (!VIEW_METADATA[viewName]) return;
  currentActiveView = viewName;
  playUiSound("switch");

  document.querySelectorAll(".rail-nav .rail-item").forEach(function (el) {
    if (el.getAttribute("data-view") === viewName) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });

  document.querySelectorAll(".view-content").forEach(function (viewEl) {
    if (viewEl.id === "view-" + viewName) {
      viewEl.removeAttribute("hidden");
    } else {
      viewEl.setAttribute("hidden", "true");
    }
  });

  const meta = VIEW_METADATA[viewName];
  const catEl = document.getElementById("crumbCategory");
  const titleEl = document.getElementById("crumbTitle");
  const subEl = document.getElementById("crumbSub");
  if (catEl) catEl.textContent = meta.category;
  if (titleEl) titleEl.textContent = meta.title;
  if (subEl) subEl.textContent = meta.sub;

  closeSidebar();

  if (viewName === "settlements") {
    renderSettlementsView(currentPayload);
  } else if (viewName === "overview") {
    if (salesLineAreaChartInstance) salesLineAreaChartInstance.resize();
  }
}

/* ---------- Settlements View Renderer ---------- */
let repPayoutChartInstance = null;
let paymentChannelChartInstance = null;

function renderSettlementRows(items, tbody) {
  tbody.innerHTML = "";
  items.forEach(function (item, i) {
    const ref = "SET-2026-" + (1040 + i);
    const comm = (item.mtd_revenue || 0) * 0.15;
    const isCleared = item.status === "Cleared";
    const methods = ["UPI Instant", "Bank Wire", "UPI Instant", "Credit Card", "Bank Wire"];
    const method = methods[i % methods.length];

    const row = document.createElement("tr");
    row.innerHTML =
      '<td class="mono-cell" style="color: var(--accent-cyan);"><strong>' + ref + '</strong></td>' +
      '<td><div style="display:flex;align-items:center;gap:8px;"><span class="avatar-circle" style="width:26px;height:26px;font-size:0.7rem;">' + initials(item.sales_representative) + '</span><strong>' + (item.sales_representative || "Sales Rep") + '</strong></div></td>' +
      '<td class="mono-cell">' + formatCurrency(item.mtd_revenue) + '</td>' +
      '<td class="mono-cell" style="color:var(--text-muted);">15%</td>' +
      '<td class="mono-cell" style="color: var(--accent-emerald); font-weight:700;">' + formatCurrency(comm) + '</td>' +
      '<td><span class="carrier-tag">' + method + '</span></td>' +
      '<td><span class="badge ' + (isCleared ? 'badge-success' : 'badge-pending') + '">' + item.status + '</span></td>' +
      '<td class="mono-cell" style="color: var(--text-muted);">' + item.date + '</td>';
    tbody.appendChild(row);
  });
}

function renderSettlementsView(payload) {
  const leaderboard = (payload && payload.leaderboard_metrics) || [];
  const tbody = document.getElementById("settlementsTableBody");
  
  if (tbody) {
    if (!leaderboard.length) {
      const sample = [
        { sales_representative: "Faizan", mtd_revenue: 215870, status: "Cleared", date: "2026-05-31" },
        { sales_representative: "Prabhat", mtd_revenue: 122820, status: "Cleared", date: "2026-05-31" },
        { sales_representative: "Bhageshri", mtd_revenue: 109080, status: "Cleared", date: "2026-05-31" },
        { sales_representative: "Talha", mtd_revenue: 105040, status: "Processing", date: "2026-06-02" },
        { sales_representative: "Sanika", mtd_revenue: 103420, status: "Pending", date: "2026-06-02" }
      ];
      renderSettlementRows(sample, tbody);
    } else {
      const data = leaderboard.map(function (item, idx) {
        return {
          sales_representative: item.sales_representative,
          mtd_revenue: item.mtd_revenue,
          status: idx < 3 ? "Cleared" : idx < 5 ? "Processing" : "Pending",
          date: idx < 3 ? "2026-05-31" : "2026-06-02"
        };
      });
      renderSettlementRows(data, tbody);
    }
  }

  if (typeof Chart === "undefined") return;

  const reps = leaderboard.length
    ? leaderboard.map(function (r) { return r.sales_representative; })
    : ["Faizan", "Prabhat", "Bhageshri", "Talha", "Sanika"];
  const gross = leaderboard.length
    ? leaderboard.map(function (r) { return r.mtd_revenue || 0; })
    : [215870, 122820, 109080, 105040, 103420];
  const comms = gross.map(function (v) { return v * 0.15; });

  const payoutCanvas = document.getElementById("repPayoutChart");
  if (payoutCanvas) {
    if (repPayoutChartInstance) repPayoutChartInstance.destroy();
    repPayoutChartInstance = new Chart(payoutCanvas, {
      type: "bar",
      data: {
        labels: reps,
        datasets: [
          {
            label: "Gross Sales (\u20b9)",
            data: gross,
            backgroundColor: "rgba(184, 255, 74, 0.2)",
            borderColor: "#b8ff4a",
            borderWidth: 1,
            borderRadius: 2
          },
          {
            label: "Net Comm. 15% (\u20b9)",
            data: comms,
            backgroundColor: "#5c8fff",
            borderRadius: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top", labels: { color: "rgba(220,232,252,0.45)", font: { family: "Space Mono", size: 9, weight: "700" } } },
          tooltip: {
            backgroundColor: "#0c1118",
            titleColor: "#dce8fc",
            bodyColor: "rgba(220,232,252,0.65)",
            borderColor: "rgba(184,255,74,0.35)",
            borderWidth: 1,
            callbacks: {
              label: function (ctx) {
                return " " + ctx.dataset.label + ": " + formatCurrency(ctx.raw);
              }
            }
          }
        },
        scales: {
          x: { ticks: { color: "rgba(220,232,252,0.35)", font: { family: "Space Mono", size: 9 } }, grid: { color: "rgba(255,255,255,0.04)" } },
          y: {
            grid: { color: "rgba(255,255,255,0.04)" },
            ticks: {
              color: "rgba(220,232,252,0.3)",
              font: { family: "Space Mono", size: 9 },
              callback: function (val) { return "\u20b9" + Math.round(val / 1000) + "k"; }
            }
          }
        }
      }
    });
  }

  const channelCanvas = document.getElementById("paymentChannelChart");
  if (channelCanvas) {
    if (paymentChannelChartInstance) paymentChannelChartInstance.destroy();
    paymentChannelChartInstance = new Chart(channelCanvas, {
      type: "doughnut",
      data: {
        labels: ["UPI / Instant Transfer", "Credit & Debit Cards", "Direct Wire Transfer"],
        datasets: [{
          data: [58, 32, 10],
          backgroundColor: ["#b8ff4a", "#5c8fff", "#ffcc44"],
          borderColor: "#030508",
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { color: "rgba(220,232,252,0.45)", font: { family: "Space Mono", size: 9, weight: "700" }, usePointStyle: true, boxWidth: 7 } }
        },
        cutout: "70%"
      }
    });
  }
}

/* ---------- Sidebar Helpers ---------- */
function closeSidebar() {
  // No sidebar in this layout — no-op kept for call-site compatibility
}

/* ---------- Interactive Mouse Follower & 3D Tilt ---------- */
function initInteractiveFx() {
  const ambientGlow = document.getElementById("ambientGlow");
  if (ambientGlow) {
    window.addEventListener("mousemove", function (e) {
      ambientGlow.style.left = e.clientX + "px";
      ambientGlow.style.top = e.clientY + "px";
    });
  }

  // 3D Card Hover Tilt
  document.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      if (prefersReducedMotion) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      card.style.transform = "perspective(600px) rotateX(" + (-y / 20) + "deg) rotateY(" + (x / 20) + "deg) translateY(-4px)";
    });
    card.addEventListener("mouseleave", function () {
      card.style.transform = "";
    });
  });
}

/* ---------- Realtime UTC / Local Digital Clock ---------- */
function initLiveClock() {
  const clockEl = document.getElementById("liveClock");
  if (!clockEl) return;
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    clockEl.textContent = hours + ":" + minutes + ":" + seconds + " IST";
  }
  setInterval(updateClock, 1000);
  updateClock();
}

/* ---------- Theme Switcher Engine ---------- */
function initThemeEngine() {
  const toggleBtn = document.getElementById("themeToggleBtn");
  const themeMenu = document.getElementById("themeMenu");
  const savedTheme = localStorage.getItem("nexus_sim_theme") || "nebula";

  setTheme(savedTheme);

  if (toggleBtn && themeMenu) {
    toggleBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      themeMenu.classList.toggle("show");
      playUiSound("click");
    });

    document.addEventListener("click", function () {
      themeMenu.classList.remove("show");
    });

    document.querySelectorAll(".theme-opt").forEach(function (opt) {
      opt.addEventListener("click", function () {
        const theme = this.getAttribute("data-set-theme");
        setTheme(theme);
        themeMenu.classList.remove("show");
        showToast("Theme switched to " + theme.toUpperCase());
        playUiSound("success");
      });
    });
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("nexus_sim_theme", theme);

  document.querySelectorAll(".theme-opt").forEach(function (btn) {
    if (btn.getAttribute("data-set-theme") === theme) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Re-render active charts with updated theme colors
  if (currentPayload) {
    renderInteractiveCharts(currentPayload);
    if (currentActiveView === "settlements") {
      renderSettlementsView(currentPayload);
    }
  }
}

/* ---------- DOM Initialization ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const reportDateInput = document.getElementById("reportDate");
  const retryBtn = document.getElementById("retryBtn");
  const refreshActionBtn = document.getElementById("refreshActionBtn");
  const soundToggleBtn = document.getElementById("soundToggleBtn");
  const soundLabel = document.getElementById("soundLabel");

  initInteractiveFx();
  initLiveClock();
  initThemeEngine();

  // Navigation tab listeners (top nav tabs)
  document.querySelectorAll(".topnav-tabs [data-view]").forEach(function (item) {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const view = this.getAttribute("data-view");
      switchView(view);
    });
  });

  // Mobile sidebar drawer handlers
  const sidebarToggle = document.getElementById("sidebarToggle");
  const rail = document.getElementById("rail");
  const railBackdrop = document.getElementById("railBackdrop");

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", function () {
      if (rail) rail.classList.toggle("open");
      if (railBackdrop) railBackdrop.classList.toggle("open");
      playUiSound("click");
    });
  }

  if (railBackdrop) {
    railBackdrop.addEventListener("click", closeSidebar);
  }

  // SFX Toggle
  if (soundToggleBtn && soundLabel) {
    soundToggleBtn.addEventListener("click", function () {
      soundEnabled = !soundEnabled;
      soundLabel.textContent = soundEnabled ? "SFX On" : "SFX Off";
      soundToggleBtn.classList.toggle("active", soundEnabled);
      showToast(soundEnabled ? "Audio UI effects enabled" : "Audio UI muted");
      if (soundEnabled) playUiSound("click");
    });
  }

  function refresh() {
    const reportDate = (reportDateInput && reportDateInput.value) || "2026-05-31";
    updateDashboard(reportDate);
  }

  if (reportDateInput) {
    reportDateInput.addEventListener("change", function () {
      playUiSound("click");
      refresh();
    });
  }

  if (retryBtn) {
    retryBtn.addEventListener("click", function () {
      playUiSound("click");
      refresh();
    });
  }

  if (refreshActionBtn) {
    refreshActionBtn.addEventListener("click", function () {
      playUiSound("click");
      refresh();
    });
  }

  // Initial dashboard load
  refresh();
});