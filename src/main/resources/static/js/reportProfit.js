window.addEventListener("load", function () {
  setTimeout(() => {
    try {
      fetchIncomeReport();
    } catch (e) {
      console.error("Error during profit report initialization:", e);
    } finally {
      finishPageLoading();
    }
  }, 100);
});

const fetchIncomeReport = () => {
  const monthSelect = document.getElementById("monthSelect");
  const dateType = monthSelect ? monthSelect.value : "last_month";

  const reportRows = getServiceRequest(`/report/profit?dateType=${encodeURIComponent(dateType)}`) || [];

  if ($.fn.dataTable.isDataTable("#profitReportTable")) {
    $("#profitReportTable").DataTable().destroy();
  }

  const tableBody = document.getElementById("profitReportTableBody");
  if (!tableBody) {
    console.error("profitReportTableBody not found");
    return;
  }

  const propertyList = [
    { propertyName: getReportPeriodLabel, dataType: "function" },
    { propertyName: getReportIncomeAmount, dataType: "function" },
    { propertyName: getReportExpenseAmount, dataType: "function" },
    { propertyName: getReportProfitAmount, dataType: "function" },
  ];

  dataFillIntoTheReportTable(tableBody, reportRows, propertyList);

  $("#profitReportTable").DataTable({
    dom: "rtip",
    pageLength: 10,
    order: [],
    createdRow: function (row) {
      $(row).find("td").css({
        "text-align": "center",
        padding: "18px",
      });
    },
    headerCallback: function (thead) {
      $(thead).find("th").css({
        "text-align": "center",
        padding: "16px",
      });
    },
  });

  updateProfitCards(reportRows);
  renderProfitCharts(reportRows);
};

const getReportPeriodLabel = (row) => {
  const period = row[0];
  return period !== null && period !== undefined && period !== "" ? String(period) : "-";
};

const getReportIncomeAmount = (row) => formatCurrency(row[1]);
const getReportExpenseAmount = (row) => formatCurrency(row[2]);
const getReportProfitAmount = (row) => formatCurrency(row[3]);

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });
};

const updateProfitCards = (rows) => {
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalProfit = 0;

  rows.forEach((row) => {
    totalIncome += Number(row[1] || 0);
    totalExpenses += Number(row[2] || 0);
    totalProfit += Number(row[3] || 0);
  });

  const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const profitMargin = totalIncome > 0 ? (totalProfit / totalIncome) * 100 : 0;
  const taxPercentage = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const incomeGrowth = totalIncome > 0 ? ((totalProfit / totalIncome) * 100) : 0;

  const totalIncomeEl = document.getElementById("totalIncome");
  const totalExpensesEl = document.getElementById("totalExpenses");
  const netProfitEl = document.getElementById("netProfit");
  const totalTaxEl = document.getElementById("totalTax");
  const incomeGrowthEl = document.getElementById("incomeGrowth");
  const expenseRatioEl = document.getElementById("expenseRatio");
  const profitMarginEl = document.getElementById("profitMargin");
  const taxPercentageEl = document.getElementById("taxPercentage");
  const expenseStatusEl = document.getElementById("expenseStatus");

  if (totalIncomeEl) totalIncomeEl.innerText = formatCurrency(totalIncome);
  if (totalExpensesEl) totalExpensesEl.innerText = formatCurrency(totalExpenses);
  if (netProfitEl) netProfitEl.innerText = formatCurrency(totalProfit);
  if (totalTaxEl) totalTaxEl.innerText = formatCurrency(totalExpenses);
  if (incomeGrowthEl) incomeGrowthEl.innerText = incomeGrowth.toFixed(1);
  if (expenseRatioEl) expenseRatioEl.innerText = expenseRatio.toFixed(1);
  if (profitMarginEl) profitMarginEl.innerText = profitMargin.toFixed(1);
  if (taxPercentageEl) taxPercentageEl.innerText = taxPercentage.toFixed(1);

  if (expenseStatusEl) {
    if (expenseRatio < 35) {
      expenseStatusEl.innerText = "Low";
      expenseStatusEl.style.backgroundColor = "#dcfce7";
      expenseStatusEl.style.color = "#166534";
    } else if (expenseRatio < 65) {
      expenseStatusEl.innerText = "Moderate";
      expenseStatusEl.style.backgroundColor = "#fef3c7";
      expenseStatusEl.style.color = "#92400e";
    } else {
      expenseStatusEl.innerText = "High";
      expenseStatusEl.style.backgroundColor = "#fee2e2";
      expenseStatusEl.style.color = "#991b1b";
    }
  }
};

const renderProfitCharts = (rows) => {
  const labels = rows.map((row) => String(row[0] || "-"));
  const revenueData = rows.map((row) => Number(row[1] || 0));
  const expenseData = rows.map((row) => Number(row[2] || 0));
  const profitData = rows.map((row) => Number(row[3] || 0));

  const lineCanvas = document.getElementById("expiryTrendsChart");
  if (lineCanvas) {
    if (window.expiryTrendsChartInstance) {
      window.expiryTrendsChartInstance.destroy();
    }

    window.expiryTrendsChartInstance = new Chart(lineCanvas, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Revenue",
            data: revenueData,
            backgroundColor: "#6d28d9",
            borderRadius: 6,
          },
          {
            label: "Expenses",
            data: expenseData,
            backgroundColor: "#f87171",
            borderRadius: 6,
          },
          {
            label: "Profit",
            data: profitData,
            backgroundColor: "#10b981",
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { display: false },
          },
          x: {
            grid: { display: false },
          },
        },
      },
    });
  }

  const doughnutCanvas = document.getElementById("insuranceStatusChart");
  const legendContainer = document.getElementById("insuranceLegendContainer");
  const totalVehiclesChart = document.getElementById("totalVehiclesChart");
  if (doughnutCanvas) {
    if (window.profitSummaryChartInstance) {
      window.profitSummaryChartInstance.destroy();
    }

    const totalRevenue = revenueData.reduce((sum, value) => sum + value, 0);
    const totalExpenses = expenseData.reduce((sum, value) => sum + value, 0);
    const totalProfit = profitData.reduce((sum, value) => sum + value, 0);
    const total = totalRevenue + totalExpenses + totalProfit;

    if (totalVehiclesChart) {
      totalVehiclesChart.innerText = formatCurrency(total).replace("LKR", "").trim();
    }

    if (legendContainer) {
      legendContainer.innerHTML = `
        <div class="d-flex align-items-center justify-content-between gap-2">
          <div><span class="legend-dot" style="background:#6d28d9"></span>Revenue</div>
          <strong>${formatCurrency(totalRevenue)}</strong>
        </div>
        <div class="d-flex align-items-center justify-content-between gap-2">
          <div><span class="legend-dot" style="background:#f87171"></span>Expenses</div>
          <strong>${formatCurrency(totalExpenses)}</strong>
        </div>
        <div class="d-flex align-items-center justify-content-between gap-2">
          <div><span class="legend-dot" style="background:#10b981"></span>Profit</div>
          <strong>${formatCurrency(totalProfit)}</strong>
        </div>
      `;
    }

    window.profitSummaryChartInstance = new Chart(doughnutCanvas, {
      type: "doughnut",
      data: {
        labels: ["Revenue", "Expenses", "Profit"],
        datasets: [
          {
            data: [totalRevenue, totalExpenses, totalProfit],
            backgroundColor: ["#6d28d9", "#f87171", "#10b981"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        cutout: "72%",
      },
    });
  }
};

const printIncomeReport = () => {
  const printableArea = document.getElementById("printableArea");
  if (!printableArea) return;

  const newWindow = window.open("", "_blank", "width=1200,height=900");
  if (!newWindow) return;

  const html = `
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Financial Summary</title>
      <link rel="stylesheet" href="/bootstrap/bootstrap-5.2.3/css/bootstrap.min.css">
      <link rel="stylesheet" href="/css/report.css">
      <link rel="stylesheet" href="/css/bookingReport.css">
      <link rel="stylesheet" href="/css/reportIncome.css">
      <style>
        body { padding: 24px; background: #fff; }
        .page-header, .table-header-wrapper, .dropdown, button, select, input { display: none !important; }
        .main-card { box-shadow: none !important; border: 1px solid #e5e7eb; }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      ${printableArea.innerHTML}
    </body>
    </html>
  `;

  newWindow.document.write(html);
  newWindow.document.close();
  setTimeout(() => {
    newWindow.focus();
    newWindow.print();
    newWindow.close();
  }, 300);
};
