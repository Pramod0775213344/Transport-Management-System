
// ====================== loading functions ==========================
window.addEventListener("load", () => {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      refresh();
    } catch (e) {
      console.error("Error during revenue page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);

  $("#selectVehicleType").select2({
    theme: "bootstrap-5",
  });

  $("#selectCustomerName").select2({
    theme: "bootstrap-5",
  });
});
// ====================== loading functions ==========================


// ====================== datetype change karana function eka ==========================
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

// ===================== end of datetype change karana function eka ==========================




// ===================== get select 2 wala value eka ganna function eka ==========================
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
// ==================== end of get select 2 wala value eka ganna function eka ==========================

let currentReportData = [];



// =================== table eka fill karana function eka ==========================
// vehicle count eka chart eken generate karana function eka
const revenueReport = () => {

  let vehicleType = getSelectValue("selectVehicleType").id;
  let customer = getSelectValue("selectCustomerName").id;
  let dateType = document.getElementById("selectdateType").value;
  let startDate = document.getElementById("startDateFilter").value;
  let endDate = document.getElementById("endDateFilter").value;

  let params = new URLSearchParams();
  if (vehicleType) params.append("vehicletypeid", vehicleType);
  if (customer) params.append("customerid", customer);
  if (startDate) params.append("startdate", startDate);
  if (endDate) params.append("enddate", endDate);


  const datalist = getServiceRequest(`/report/revenue?${params.toString()}`);

  // datalist eka empty nam, table eka clear karanawa, card saha chart tika clear karanawa
  if (!datalist || datalist.length === 0) {
    document.getElementById("revenueCurrentMonthTableBody").innerHTML = "<tr><td colspan='8' class='text-center'>No data available</td></tr>";

    currentReportData = []; // methana add karanna - global data eka empty karanawa 

    // parana revenu chart eka destroy karanawa, ehema na nam chart eka render karanna error ekak pennanawa
    if (window.revenueChartInstance) {
      window.revenueChartInstance.destroy();
      window.revenueChartInstance = null;
    }
    return;

  }

  // wadima eka udata gannawa, distance eka anuwa sort karanawa, distance eka number ekak widiyata convert karala sort karanawa
  const sortedDataList = [...datalist].sort((left, right) => Number(right[1]) - Number(left[1]));

  let reportDatalist = new Array();
  let data = new Array();
  let label = new Array();

  for (const index in sortedDataList) {
    let object = new Object();
    object.distance = sortedDataList[index][0] + " KM";
    object.vehicle_no = sortedDataList[index][1];
    reportDatalist.push(object);

    label.push(sortedDataList[index][1]);
    data.push(sortedDataList[index][0]);
  }

  currentReportData = reportDatalist; // methana add karanna - global data eka update karanawa

  let propertyList = [
    { propertyName: "vehicle_no", dataType: "string" },
    { propertyName: "distance", dataType: "string" },
  ];

  dataFillIntoTheReportTable(revenueCurrentMonthTableBody, reportDatalist, propertyList);

  renderRevenueChart(reportDatalist);

};
// ================== end of table eka fill karana function eka ==========================




// ================= revenue chart eka render karana function eka ==========================
// revenue chart
const renderRevenueChart = (datalist) => {
  console.log("Rendering revenue chart with data:", datalist);
  const labels = datalist.map((row) => String(row.vehicle_no || "-"));
  const distanceData = datalist.map((row) => Number(row.distance.split(" ")[0] || 0));

  const barCanvas = document.getElementById("myChart");
  if (barCanvas) {
    if (window.revenueChartInstance) {
      window.revenueChartInstance.destroy();
    }

    window.revenueChartInstance = new Chart(barCanvas, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Total Distance (KM)",
            data: distanceData,
            borderWidth: 1,
            borderRadius: 3,
            borderSkipped: false,
            backgroundColor: '#7c3aed',
            borderColor: 'rgba(153, 102, 255, 1)',
          },
        ],
      },
      options: {
        indexAxis: "x",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "#1e293b",
            padding: 12,
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
            callbacks: {
              // bar eka hover kaloth pennana value eka formatted karanawa
              label: function (context) {
                return ` Total Distance: ${context.parsed.y} KM`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#64748b",
              font: {
                weight: "600",
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(148, 163, 184, 0.18)",
            },
            ticks: {
              color: "#64748b",
            },
          },
        },
      },
    });
  }
};
// ================= end of revenue chart eka render karana function eka ==========================




// =================== refresh karana function eka ==========================
const refresh = () => {

  let customers = getServiceRequest("/customer/byactiveagreements");
  dataFilIntoSelect(selectCustomerName, "All", customers, "company_name");

  let vehicleTypes = getServiceRequest("/vehicletype/alldata");
  dataFilIntoSelect(selectVehicleType, "All", vehicleTypes, "name");

  selectCustomerName.selectedIndex = 0;
  selectVehicleType.selectedIndex = 0;
  revenueCurrentMonthTableBody.innerHTML = "";


  // reset date filters
  const startDateInput = document.getElementById("startDateFilter");
  const endDateInput = document.getElementById("endDateFilter");
  startDateInput.disabled = true;
  endDateInput.disabled = true;

  // currunt month eka default widiyata select karanawa, ehema na nam, last month eka default widiyata select karanawa
  document.getElementById("selectdateType").value = "this_month";


  const range = calculateDateRange(document.getElementById("selectdateType").value);

  // range eka true nam start date eka saha end date eka set karanawa defautl value ekata anuwa
  if (range) {
    startDateInput.value = range.start;
    endDateInput.value = range.end;
  }
  revenueReport();
};
// ================== end of refresh karana function eka ==========================


// ================== print report eka render karana function eka ==========================
const printRevenueReport = () => {
  const chartImage = window.revenueChartInstance
    ? window.revenueChartInstance.toBase64Image()
    : "";

  // filter details tika print header ekata pennanna
  const vehicleTypeText = $("#selectVehicleType").select2("data")[0]?.text || "All";
  const customerText = $("#selectCustomerName").select2("data")[0]?.text || "All";
  const dateTypeEl = document.getElementById("selectdateType");
  const dateTypeText = dateTypeEl.options[dateTypeEl.selectedIndex].text;
  const startDate = document.getElementById("startDateFilter").value || "-";
  const endDate = document.getElementById("endDateFilter").value || "-";
 
  // total distance eka calculate karanawa summary ekata
  const totalDistance = currentReportData.reduce((sum, row) => {
    return sum + Number(String(row.distance).split(" ")[0] || 0);
  }, 0);

  const tableRowsHtml = currentReportData
    .map((row, index) => {
      return `
    <tr>
      <td>${index + 1}</td>
      <td>${row.vehicle_no}</td>
      <td>${row.distance}</td>
    </tr>
    `;
    })
    .join("");

  const htmlContent = `
        <html>
            <head>
                <title>Vehicle Revenue Report</title>
       <link rel="icon" type="image/svg+xml"
        href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M20 30L50 70L80 30' stroke='%238A2BE2' stroke-width='15' stroke-linecap='round' stroke-linejoin='round'/><path d='M40 30L50 45L60 30' stroke='%23D8BFD8' stroke-width='8' stroke-linecap='round'/></svg>">
                <style>
          body { font-family: Arial, sans-serif; padding: 28px; color: #1e293b; }
                    .report-header { margin-bottom: 16px; text-align: center; }
          .report-title { margin: 0; font-size: 22px; font-weight: 700; }
          .report-subtitle { margin: 6px 0 0 0; color: #64748b; font-size: 13px; }
          .report-meta { margin: 8px 0 0 0; color: #64748b; font-size: 12px; }
          .filter-summary { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin: 14px 0; font-size: 12px; color: #334155; }
          .filter-summary span strong { color: #1e293b; }
          .kpi-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 12px; margin: 20px 0; max-width: 260px; margin-left: auto; margin-right: auto; }
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
          .report-logo {display: flex;justify-content: center;margin-bottom: 8px;}
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
          <h1 class="report-title">Vehicle Revenue Report</h1>
          <p class="report-subtitle">Distance analysis across vehicles for the selected period</p>
          <p class="report-meta">Generated on: ${new Date().toLocaleString()}</p>
        </div>

        <div class="filter-summary">
          <span>Vehicle Type: <strong>${vehicleTypeText}</strong></span>
          <span>Customer: <strong>${customerText}</strong></span>
          <span>Period: <strong>${dateTypeText}</strong></span>
          <span>Start Date: <strong>${startDate}</strong></span>
          <span>End Date: <strong>${endDate}</strong></span>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="label">Total Distance</div>
            <div class="value">${totalDistance.toFixed(2)} KM</div>
          </div>
        </div>

        <div class="chart-card">
          <h4>Vehicle Distance Overview</h4>
          <div class="chart-image-wrap">
            ${chartImage ? `<img src="${chartImage}" alt="Vehicle Distance Chart">` : "<span>Chart unavailable</span>"}
          </div>
        </div>

        <div class="table-title">Vehicle Revenue Summary</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Vehicle No</th>
              <th>Total Distance</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml || '<tr><td colspan="3">No data available</td></tr>'}
          </tbody>
        </table>
            </body>
        </html>
    `;

    //mehema karanne apita document write eken kelinma falcon icon ekak penna bar nisa

    // create karanawa blob ekak.meka nika api hadaganna tempory html file ekak wage
  const blob = new Blob([htmlContent], { type: "text/html" });
  // html file eka use karala create karanwa blob url ekak
  const blobUrl = URL.createObjectURL(blob);
  // eka open karanwa wena window ekak athule, new tab ekak widiyata open karanawa
  const printWindow = window.open(blobUrl, "_blank");
  

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    setTimeout(() => {
      printWindow.close();
      URL.revokeObjectURL(blobUrl); // memory cleanup
    }, 500);
  };
};
// ================= end of print report eka render karana function eka ==========================
