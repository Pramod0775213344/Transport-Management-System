// reportIncome.js
document.addEventListener("DOMContentLoaded", function () {
  try {
    refreshReport();
  } catch (e) {
    console.error("Error during profit report initialization:", e);
  } finally {
    finishPageLoading();
  }

  //     enable type and search of the select element
  $("#selectCustomer").select2({
    theme: "bootstrap-5",
  });

});

// select period ekedi custome slect kaloth start date saha end date filter tika enable karanawa, ehema na nam disable karanawa
document.getElementById("selectdateType").addEventListener("change", function () {
  const startDateInput = document.getElementById("startDateFilter");
  const endDateInput = document.getElementById("endDateFilter");
  if (this.value === "custom") {
    startDateInput.disabled = false;
    endDateInput.disabled = false;
  } else {
    const range = calculateDateRange(this.value);
    if (range) {
      startDateInput.value = range.start;
      endDateInput.value = range.end;
    }
    startDateInput.disabled = true;
    endDateInput.disabled = true;
  }
});

// date range eka caluclate karanwa select karana date type eka anuwa, this month, last month, last 3 months, last 6 months, this year, last year kiyana date range tika calculate karanawa
const calculateDateRange = (dateType) => {
  const today = new Date();
  let start = new Date(today);
  let end = new Date(today);

  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  switch (dateType) {
    case "this_month":
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      // current month eke last date eka ganna
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
    case "last_month":
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0); // last month eke ledest date eka
      break;
    case "last_3_months":
      start = new Date(today.getFullYear(), today.getMonth() - 3, 1);
      // current month eke last date eka ganna
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      break;
    case "last_6_months":
      start = new Date(today.getFullYear(), today.getMonth() - 6, 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      break;
    case "this_year":
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
    case "last_year":
      start = new Date(today.getFullYear() - 1, 0, 1);
      end = new Date(today.getFullYear() - 1, 11, 31);
      break;
    default:
      return null; // custom nam manual input use karanawa
  }

  return { start: formatDate(start), end: formatDate(end) };
};

// select karanwa valuve eka eka ganna hadapu function eka select 2 walin
const getSelectValue = (elementId) => {
  const val = document.getElementById(elementId).value;
  if (!val) return {};
  try {
    return JSON.parse(val);
  } catch (e) {
    console.error(`Failed to parse value for ${elementId}:`, val);
    return {};
  }
};

let currentReportData = []; //  global eka, dewni report eke wage - card/chart update karanna use karanawa 

const incomeReport = () => {

  let customer = getSelectValue("selectCustomer").id;
  let dateType = document.getElementById("selectdateType").value;
  let startDate = document.getElementById("startDateFilter").value;
  let endDate = document.getElementById("endDateFilter").value;

  let params = new URLSearchParams();
  if (customer) params.append("customerid", customer);
  if (startDate) params.append("startdate", startDate);
  if (endDate) params.append("enddate", endDate);


  const datalist = getServiceRequest(`/report/profit?${params.toString()}`);

  // datalist eka empty nam, table eka clear karanawa, card saha chart tika clear karanawa
  if (!datalist || datalist.length === 0) {
    document.getElementById("profitReportTableBody").innerHTML = "<tr><td colspan='8' class='text-center'>No data available</td></tr>";
    // card tika clear karanawa
    updateProfitCards([]);

    currentReportData = []; // methana add karanna - global data eka empty karanawa 

    // parana revenu chart eka destroy karanawa, ehema na nam chart eka render karanna error ekak pennanawa
    if (window.revenueExpensesChartInstance) {
      window.revenueExpensesChartInstance.destroy();
      window.revenueExpensesChartInstance = null;
    }
    // parana customer distribution chart eka destroy karanawa, ehema na nam chart eka render karanna error ekak pennanawa
    if (window.profitSummaryChartInstance) {
      window.profitSummaryChartInstance.destroy();
      window.profitSummaryChartInstance = null;
    }

    return;

  }



  let reportDatalist = new Array();
  for (const index in datalist) {
    let object = new Object();
    object.month = datalist[index][0];
    object.income = datalist[index][1];
    object.expense = datalist[index][2];
    object.profit = datalist[index][3];
    object.tax = datalist[index][4];
    reportDatalist.push(object);

  }

  currentReportData = reportDatalist;

  const propertyList = [
    { propertyName: getReportPeriodLabel, dataType: "function" },
    { propertyName: getReportIncomeAmount, dataType: "function" },
    { propertyName: getReportExpenseAmount, dataType: "function" },
    { propertyName: getReportProfitAmount, dataType: "function" },
  ];

  dataFillIntoTheReportTable(profitReportTableBody, currentReportData, propertyList);

  updateChart(); // === card saha chart update karana wenama function eka call karanawa ===
};

// currentReportData eka use karala, card saha chart tika refresh karanawa - fetch aluthin karanne na
const updateChart = () => {
  updateProfitCards(currentReportData);
  renderProfitCharts(currentReportData);
};

// year eka format karanwa - 2025 --> 25, month eka format karanawa - 06 --> Jun
const getReportPeriodLabel = (dataOb) => {
  const month = dataOb.month;

  const [year, monthNum] = month.split("-"); // year = "2025", monthNum = "06"
  const date = new Date(year, monthNum - 1); // now year & monthNum are defined

  const monthShort = date.toLocaleString('en-US', { month: 'short' }); // Jun
  const yearShort = year.slice(-2); // 25

  return `${monthShort} ${yearShort}`;

};

// table eka income , expense, profit column tika format karanawa
const getReportIncomeAmount = (dataOb) => {
  return formatCurrency(dataOb.income);
};

const getReportExpenseAmount = (dataOb) => {
  return formatCurrency(dataOb.expense);
};

const getReportProfitAmount = (dataOb) => {
  return formatCurrency(dataOb.profit);
};


// curruncy format karana function eka
const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });
};

// card tika update karanawa, income, expense, profit, tax percentage, income growth calculate karala card tika update karanawa
const updateProfitCards = (datalist) => {
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalProfit = 0;
  let totalTax = 0;

  // income eka total karanawa, expense eka total karanawa, profit eka total karanawa
  datalist.forEach((row) => {
    totalIncome += Number(row.income || 0);
    totalExpenses += Number(row.expense || 0);
    totalProfit += Number(row.profit || 0);
    totalTax += Number(row.tax || 0);
  });

  // expense ratio, profit margin, tax percentage, income growth calculate karanawa
  const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const profitMargin = totalIncome > 0 ? (totalProfit / totalIncome) * 100 : 0;
  const taxPercentage = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const incomeGrowth = totalIncome > 0 ? ((totalProfit / totalIncome) * 100) : 0;

  // card element tika ganna
  const totalIncomeEl = document.getElementById("totalIncome");
  const totalExpensesEl = document.getElementById("totalExpenses");
  const netProfitEl = document.getElementById("netProfit");
  const totalTaxEl = document.getElementById("totalTax");
  const incomeGrowthEl = document.getElementById("incomeGrowth");
  const expenseRatioEl = document.getElementById("expenseRatio");
  const profitMarginEl = document.getElementById("profitMargin");
  const taxPercentageEl = document.getElementById("taxPercentage");
  const expenseStatusEl = document.getElementById("expenseStatus");

  // card element tika update karanawa
  if (totalIncomeEl) totalIncomeEl.innerText = formatCurrency(totalIncome);
  if (totalExpensesEl) totalExpensesEl.innerText = formatCurrency(totalExpenses);
  if (netProfitEl) netProfitEl.innerText = formatCurrency(totalProfit);
  if (totalTaxEl) totalTaxEl.innerText = formatCurrency(totalTax);
  if (incomeGrowthEl) incomeGrowthEl.innerText = incomeGrowth.toFixed(1);
  if (expenseRatioEl) expenseRatioEl.innerText = expenseRatio.toFixed(1);
  if (profitMarginEl) profitMarginEl.innerText = profitMargin.toFixed(1);
  if (taxPercentageEl) taxPercentageEl.innerText = taxPercentage.toFixed(1);

  // ratio eka calculate karanwa data eka low, moderate, high kiyana status ekakata classify karanawa, e status eka card eke display karanawa
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


const renderProfitCharts = (datalist) => {
  const labels = datalist.map((row) => String(row.month || "-"));
  const revenueData = datalist.map((row) => Number(row.income || 0));
  const expenseData = datalist.map((row) => Number(row.expense || 0));
  const profitData = datalist.map((row) => Number(row.profit || 0));

  const lineCanvas = document.getElementById("revenueExpensesChart");
  if (lineCanvas) {
    if (window.revenueExpensesChartInstance) {
      window.revenueExpensesChartInstance.destroy();
    }

    window.revenueExpensesChartInstance = new Chart(lineCanvas, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Revenue", data: revenueData, backgroundColor: "#6d28d9", borderRadius: 6 },
          { label: "Expenses", data: expenseData, backgroundColor: "#f87171", borderRadius: 6 },
          { label: "Profit", data: profitData, backgroundColor: "#10b981", borderRadius: 6 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              // bar eka hover kaloth pennana value eka formatted karanawa
              label: function (context) {
                return context.dataset.label + ": " + context.raw.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' });
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { display: false },
            ticks: {
              // y-axis eke number tika LKR format ekata pennanawa
              callback: function (value) {
                return value.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' });
              }
            }
          },
          x: { grid: { display: false } },
        },
      },
    });
  }


};


// mulinma filter tika default state ekata reset karala, report eka generate karanawa
const refreshReport = () => {

  // customer list fill into the select element
  const customer = getServiceRequest("/customer/alldata");
  dataFilIntoSelect(selectCustomer, "All", customer, "company_name");

  // reset date filters
  const startDateInput = document.getElementById("startDateFilter");
  const endDateInput = document.getElementById("endDateFilter");
  startDateInput.disabled = true;
  endDateInput.disabled = true;

  // load ekedi last month eka default select karanwa
  document.getElementById("selectdateType").value = "last_month";


  // calculate date range eka call karala, start date saha end date filter tika set karanawa
  const range = calculateDateRange(document.getElementById("selectdateType").value);

  // range eka true nam start date eka saha end date eka set karanawa defautl value ekata anuwa
  if (range) {
    startDateInput.value = range.start;
    endDateInput.value = range.end;
  }

  incomeReport();
};


// print eka
const printIncomeReport = () => {
  const chartCanvas = document.getElementById("revenueExpensesChart");
  const chartImage = window.revenueExpensesChartInstance
    ? window.revenueExpensesChartInstance.toBase64Image()
    : (chartCanvas ? chartCanvas.toDataURL("image/png") : "");

  // filter details tika print header ekata pennanna
  const customerText = $("#selectCustomer").select2("data")[0]?.text || "All";
  const dateTypeEl = document.getElementById("selectdateType");
  const dateTypeText = dateTypeEl.options[dateTypeEl.selectedIndex].text;
  const startDate = document.getElementById("startDateFilter").value || "-";
  const endDate = document.getElementById("endDateFilter").value || "-";

  // kpi card values tika gnnawa
  const totalIncome = document.getElementById("totalIncome")?.innerText || "-";
  const totalExpenses = document.getElementById("totalExpenses")?.innerText || "-";
  const netProfit = document.getElementById("netProfit")?.innerText || "-";
  const totalTax = document.getElementById("totalTax")?.innerText || "-";
  const profitMargin = document.getElementById("profitMargin")?.innerText || "0";
  const expenseRatio = document.getElementById("expenseRatio")?.innerText || "0";

  const tableRowsHtml = currentReportData
    .map((row, index) => {
      return `
    <tr>
      <td>${index + 1}</td>
      <td>${getReportPeriodLabel(row)}</td>
      <td>${formatCurrency(row.income)}</td>
      <td>${formatCurrency(row.expense)}</td>
      <td>${formatCurrency(row.profit)}</td>
    </tr>
    `;
    })
    .join("");

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
        <html>
            <head>
                <title>Financial Summary Report</title>
                <style>
          body { font-family: Arial, sans-serif; padding: 28px; color: #1e293b; }
                    .report-header { margin-bottom: 16px; text-align: center; }
          .report-title { margin: 0; font-size: 22px; font-weight: 700; }
          .report-subtitle { margin: 6px 0 0 0; color: #64748b; font-size: 13px; }
          .report-meta { margin: 8px 0 0 0; color: #64748b; font-size: 12px; }
          .filter-summary { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin: 14px 0; font-size: 12px; color: #334155; }
          .filter-summary span strong { color: #1e293b; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 20px 0; }
          .kpi-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; text-align: center; }
          .kpi-card .label { font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 6px; }
          .kpi-card .value { font-size: 16px; font-weight: 700; color: #1e293b; }
          .chart-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; margin: 20px 0 24px 0; }
          .chart-card h4 { margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #334155; text-align: center; }
          .chart-image-wrap { display: flex; justify-content: center; align-items: center; min-height: 220px; }
          .chart-image-wrap img { max-width: 100%; max-height: 300px; }
          .table-title { font-size: 14px; font-weight: 700; margin: 8px 0 10px 0; text-transform: uppercase; color: #334155; }
          table { width: 100%; border-collapse: collapse; }
          th { background-color: #f8fafc; color: #64748b; text-transform: uppercase; font-size: 11px; padding: 10px; border: 1px solid #e2e8f0; }
          td { padding: 10px; border: 1px solid #e2e8f0; font-size: 12px; text-align: center; }
          td:first-child, th:first-child { width: 44px; }
                    @media print {
                        body { padding: 0; }
            .chart-card, .kpi-card, tr { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
        <div class="report-header">
          <h1 class="report-title">Financial Summary</h1>
          <p class="report-subtitle">Strategic overview of operational revenue, tax commitments, and net earnings</p>
          <p class="report-meta">Generated on: ${new Date().toLocaleString()}</p>
        </div>

        <div class="filter-summary">
          <span>Customer: <strong>${customerText}</strong></span>
          <span>Period: <strong>${dateTypeText}</strong></span>
          <span>Start Date: <strong>${startDate}</strong></span>
          <span>End Date: <strong>${endDate}</strong></span>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="label">Total Income</div>
            <div class="value">${totalIncome}</div>
          </div>
          <div class="kpi-card">
            <div class="label">Total Expenses</div>
            <div class="value">${totalExpenses}</div>
          </div>
          <div class="kpi-card">
            <div class="label">Net Profit</div>
            <div class="value">${netProfit}</div>
          </div>
          <div class="kpi-card">
            <div class="label">Total Tax</div>
            <div class="value">${totalTax}</div>
          </div>
        </div>

        <div class="chart-card">
          <h4>Revenue vs Expenses</h4>
          <div class="chart-image-wrap">
            ${chartImage ? `<img src="${chartImage}" alt="Revenue vs Expenses Chart">` : "<span>Chart unavailable</span>"}
          </div>
        </div>

        <div class="table-title">Profit Summary</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Date/Month</th>
              <th>Income</th>
              <th>Expenses</th>
              <th>Net Profit</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml || '<tr><td colspan="5">No data available</td></tr>'}
          </tbody>
        </table>
            </body>
        </html>
    `);

  setTimeout(() => {
    printWindow.stop();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, 500);
};