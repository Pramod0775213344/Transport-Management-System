window.addEventListener("load", () => {
  // Initialize current date for print header
  const printDateElements = document.querySelectorAll(".print-current-date");
  const now = new Date();
  printDateElements.forEach((el) => {
    el.innerText = now.toLocaleDateString() + " " + now.toLocaleTimeString();
  });

  // Load initial dummy analytics
  loadIncomeCharts();
  loadKPICards();
});

let incomelineChart = null;
let customerBarChart = null;

let totalGrossAmount = 0;
let totalNetAmount = 0;
let totalTaxAmount = 0;
const loadIncomeCharts = () => {
  let datalistMonthly = getServiceRequest("/report/incomesummary");

  let reportDatalist = new Array();
  let dataGross_Amount = new Array();
  let dataNet_amount = new Array();
  let labelMonth = new Array();

  for (const index in datalistMonthly) {
    // object ekak hadala object ekata danwa
    let object = new Object();
    object.month = datalistMonthly[index][0];
    object.booking_count = datalistMonthly[index][1];
    object.gross_amount = datalistMonthly[index][2].toLocaleString("en-US", {
      style: "currency",
      currency: "LKR",
    });
    object.tax_amount = datalistMonthly[index][3].toLocaleString("en-US", {
      style: "currency",
      currency: "LKR",
    });
    object.net_amount = datalistMonthly[index][4].toLocaleString("en-US", {
      style: "currency",
      currency: "LKR",
    });
    reportDatalist.push(object);

    labelMonth.push(datalistMonthly[index][0]);
    dataGross_Amount.push(parseInt(datalistMonthly[index][2]));
    dataNet_amount.push(parseInt(datalistMonthly[index][4]));

    // kpi karad walata assign karanna oni nisa methana hadagannawa
    netAmount = parseFloat(datalistMonthly[index][4]);
    grossAmount = parseFloat(datalistMonthly[index][2]);
    taxAmount = parseFloat(datalistMonthly[index][3]);
    totalGrossAmount += grossAmount;
    totalNetAmount += netAmount;
    totalTaxAmount += taxAmount;
  }
  const propertyList = [
    { propertyName: "month", dataType: "string" },
    { propertyName: "booking_count", dataType: "string" },
    { propertyName: "gross_amount", dataType: "string" },
    { propertyName: "tax_amount", dataType: "string" },
    { propertyName: "net_amount", dataType: "string" },
  ];
  dataFillIntoTheReportTable(incomeSummaryTableBody, reportDatalist, propertyList);

  // table eke footer eke load karala pennawa
  document.getElementById("totalGross").innerText = "LKR " + totalGrossAmount.toLocaleString();
  document.getElementById("totalNet").innerText = "LKR " + totalNetAmount.toLocaleString();
  document.getElementById("totalTax").innerText = "LKR " + totalTaxAmount.toLocaleString();

  // 1. Revenue Trend Line Chart
  const lineCtx = document.getElementById("incomelineChart").getContext("2d");
  if (incomelineChart) incomelineChart.destroy();

  incomelineChart = new Chart(lineCtx, {
    type: "line",
    data: {
      labels: labelMonth,
      datasets: [
        {
          label: "Gross Revenue",
          data: dataGross_Amount,
          borderColor: "#4f46e5",
          backgroundColor: "rgba(79, 70, 229, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 4,
        },
        {
          label: "Net Earnings",
          data: dataNet_amount,
          borderColor: "#10b981",
          borderDash: [5, 5],
          backgroundColor: "transparent",
          fill: false,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: function (context) {
              return context.dataset.label + ": LKR " + context.raw.toLocaleString();
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { drawBorder: false },
          ticks: {
            callback: (value) => "LKR " + value / 1000 + "k",
          },
        },
        x: { grid: { display: false } },
      },
    },
  });

  // ---------------------------------------clint wise--------------------------------------
  let datalistCustomer = getServiceRequest("/report/incomesummarycustomerwise");

  let dataCustomer = new Array();
  let labelCustomer = new Array();

  for (const index in datalistCustomer) {
    labelCustomer.push(datalistCustomer[index][0]);
    dataCustomer.push(parseInt(datalistCustomer[index][1]));
  }
  // 2. Client Portfolio Pie/Doughnut Chart
  const barCtx = document.getElementById("incomeBarChartCustomer").getContext("2d");
  if (customerBarChart) customerBarChart.destroy();

  customerBarChart = new Chart(barCtx, {
    type: "doughnut",
    data: {
      labels: labelCustomer,
      datasets: [
        {
          data: dataCustomer,
          backgroundColor: ["#6366f1", "#a855f7", "#ec4899", "#f43f5e", "#f59e0b"],
          hoverOffset: 15,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: { usePointStyle: true, padding: 20 },
        },
      },
      cutout: "70%",
    },
  });
};

const loadKPICards = () => {
  document.getElementById("totalincome").innerText = "LKR " + totalGrossAmount.toLocaleString();
  document.getElementById("completedIncome").innerText = "LKR " + totalNetAmount.toLocaleString();
  document.getElementById("pendingIncome").innerText = "LKR " + totalNetAmount.toLocaleString();
  document.getElementById("cancellation").innerText = "LKR " + totalTaxAmount.toLocaleString();
};

const printIncomeReport = () => {
  const printContents = document.getElementById("printableArea").innerHTML;
  const originalContents = document.body.innerHTML;

  // Create a temporarily printable structure
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
        <html>
            <head>
                <title>TMS Financial Report</title>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <style>
                    body { font-family: 'Inter', sans-serif; padding: 20px; }
                    .card { border: 1px solid #eee !important; box-shadow: none !important; }
                    .d-print-none { display: none !important; }
                    canvas { max-width: 100% !important; height: auto !important; }
                    @media print {
                        .no-print { display: none; }
                        tr { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                ${document.getElementById("printableArea").innerHTML}
            </body>
        </html>
    `);

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 1000);
};
