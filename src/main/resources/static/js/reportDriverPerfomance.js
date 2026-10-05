// reportSupplierPayment.js
document.addEventListener("DOMContentLoaded", function () {

  setTimeout(() => {
    try {
      refreshReport();
    } catch (e) {
      console.error("Error during revenue page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);


  //     enable type and search of the select element
  $("#selectSupplier").select2({
    theme: "bootstrap-5",
  });

  $("#selectStatus").select2({
    theme: "bootstrap-5",
  });

  $("#selectDriver").select2({
    theme: "bootstrap-5",
  });

});

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

let currentReportData = [];


const driverPerformanceReport = () => {

  let driverId = getSelectValue("selectDriver").id;
  let supplierId = getSelectValue("selectSupplier").id;
  let statusId = getSelectValue("selectStatus").id;
  let startDate = document.getElementById("startDateFilter").value;
  let endDate = document.getElementById("endDateFilter").value;

  // empty key,value pair ekak hadanawa
  let params = new URLSearchParams();

  // variable eka true wunoth without value eka append karanawa, false wunoth append karanawa na
  // false karanne null,undefined,empty string value ekak thiyenawanam eka skip karanwa

  if (driverId) params.append("driverid", driverId);
  if (supplierId) params.append("supplierid", supplierId);
  if (statusId) params.append("statusid", statusId);
  if (startDate) params.append("startdate", startDate);
  if (endDate) params.append("enddate", endDate);

  // params toString eken add karapu parameter tika url eke query string ekata convert karanawa
  // supplier id eka witharak add kaloth url eka --> /report/supplierpaymentlist?supplierid=5
  // supplier id saha vehicle id add kaloth url eka --> /report/supplierpaymentlist?supplierid=5&vehicleid=2
  let datalist = getServiceRequest("/report/driverperformance?" + params.toString());

  if (!datalist || datalist.length === 0) {
    document.getElementById("driverPerformanceReportTableBody").innerHTML = "<tr><td colspan='8' class='text-center'>No data available</td></tr>";

    currentReportData = []; // methana add karanna - global data eka empty karanawa 

    if (window.myBarChart) {
      window.myBarChart.destroy(); // methana add karanna - parana chart eka clear karanawa 
      window.myBarChart = null;
    }

    return;
  }
  // datalist eka object ekakata convert karanawa
  // datalist eka 2D array ekak nisa eka object ekakata convert karanawa

  let reportDatalist = new Array();
  for (const index in datalist) {
    let object = new Object();
    object.drivername = datalist[index][0];
    object.suppliername = datalist[index][1];
    object.totalTrips = datalist[index][2];
    object.totaldistance = parseFloat(datalist[index][3]).toFixed(2) + " km";
    object.delayCount = datalist[index][4];
    object.pickupdelayTime = datalist[index][5];
    object.deliverydelayTime = datalist[index][6];
    reportDatalist.push(object);


  }

  const sortedReportDatalist = reportDatalist.sort((a, b) => {
    const aOnTimePct = (a.totalTrips - a.delayCount) / a.totalTrips;
    const bOnTimePct = (b.totalTrips - b.delayCount) / b.totalTrips;
    return bOnTimePct - aOnTimePct; // descending order
  });

  const driverPerformanceReportTableBody = document.getElementById("driverPerformanceReportTableBody");
  driverPerformanceReportTableBody.innerHTML = ""; // table eka clear karanawa

  const propertyList = [
    { propertyName: "drivername", dataType: "string" },
    { propertyName: "suppliername", dataType: "string" },
    { propertyName: "totalTrips", dataType: "string" },
    { propertyName: getOntimePrecentage, dataType: "function" },
    { propertyName: getAverageDelay, dataType: "function" },
    { propertyName: "totaldistance", dataType: "string" },
    { propertyName: getPerfomance, dataType: "function" },
  ];

  currentReportData = sortedReportDatalist; // === methana add karanna - global ekata save karanawa ===;

  // table generate
  dataFillIntoTheReportTable(driverPerformanceReportTableBody, sortedReportDatalist, propertyList);
  generateDriverPerfomanceChart(sortedReportDatalist); // chart eka generate karanawa

}

// currentReportData eka use karala, dan select kara period ekට anuwa chart eka refresh karanawa
const updateChart = () => {
  generateDriverPerfomanceChart(currentReportData);
};

// ontime percentage eka calculate karanawa
const getOntimePrecentage = (dataOb) => {
  return ((dataOb.totalTrips - dataOb.delayCount) / dataOb.totalTrips * 100).toFixed(2) + "%";
}

// average delay time eka calculate karanawa
const getAverageDelay = (dataOb) => {
  return ((parseInt(dataOb.pickupdelayTime) + parseInt(dataOb.deliverydelayTime)) / (parseInt(dataOb.delayCount) || 1)).toFixed(2) + " min";

}

// performance eka calculate karanawa
const getPerfomance = (dataOb) => {
  let ontimePercentage = (dataOb.totalTrips - dataOb.delayCount) / dataOb.totalTrips * 100;
  if (ontimePercentage >= 90) {
    return "<span class='status-chip green'>Excellent</span>";
  } else if (ontimePercentage >= 75) {
    return "<span class='status-chip yellow'>Good</span>";
  } else if (ontimePercentage >= 50) {
    return "<span class='status-chip red'>Average</span>";
  } else {
    return "<span class='status-chip red'>Poor</span>";
  }
}


// bar chart eka generate karana function eka
// bar chart eka generate karana function eka - on-time % highest ekata sort karala, x-axis eke percentage eka pennanawa
const generateDriverPerfomanceChart = (reportDatalist) => {

  // mulinma driver ekaka on-time percentage eka calculate karanawa
  // map eken aluth array ekak hadanawa, original array eka change wenne na
  const dataWithPercentage = reportDatalist.map((d) => {
    const totalTrips = parseInt(d.totalTrips);
    const delayCount = parseInt(d.delayCount);
    const onTimePct = ((totalTrips - delayCount) / totalTrips) * 100;

    return {
      drivername: d.drivername,
      totalTrips: totalTrips,
      onTimePct: onTimePct,
    };
  });

  // on-time percentage eka highest ekata sort karanawa (descending)
  // [...dataWithPercentage]--->array eke copy ekak hadanwa original eka change nokara
  // sort((a,b) )-----------> comaprae karala number eka return karanwa
  // negative return kaloth a ta kalin b thiyenna oni
  // positive return kaloth b ta kalin a thiyenna oni
  // o return kaloth wenasak wenne na
  // ex:-  a.ontimepc = 10 and b.ontimepc = 20
  // 10-20 = -10 ---> a ta kalin b thiyenna oni
  // 20-10 = 10 ---> b ta kalin a thiyenna oni
  // a-b ----->lowest to hihhest
  // b-a ----->highest to lowest
  const sorted = [...dataWithPercentage].sort((a, b) => b.onTimePct - a.onTimePct);
  // newly created array eka thama sorted kiyana eka, original array eka change wenne na

  // performance anuwa color widihata denawa
  const barColors = sorted.map((d) => {
    if (d.onTimePct >= 85) return '#10b981';   // green - excellent
    if (d.onTimePct >= 70) return '#6d28d9';   // purple - good
    if (d.onTimePct >= 50) return '#f59e0b';   // yellow - average
    return '#ef4444';                          // red - needs improvement
  });

  const barHeight = 32; // eka bar ekaka height eka (pixels)
  const chartContainer = document.getElementById('driverPerformanceChart').parentElement;
  chartContainer.style.height = (sorted.length * barHeight + 60) + "px";

  const ctx = document.getElementById('driverPerformanceChart').getContext('2d');

  if (window.myBarChart) {
    window.myBarChart.destroy();
  }

  window.myBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map((d) => d.drivername),
      datasets: [{
        label: 'On-time %',
        data: sorted.map((d) => d.onTimePct.toFixed(1)), // <-- x-axis eka percentage eken
        backgroundColor: barColors,
        borderRadius: 6,
        // barThickness ain kala - percentage witharak use karanawa gap ekata
        categoryPercentage: 0.8,
        barPercentage: 0.85,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              const trips = sorted[context.dataIndex].totalTrips;
              return `${trips} trips • ${context.raw}% on-time`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100, // <-- percentage scale nisa 100 wenakan
          grid: { color: '#f1f5f9' },
          ticks: {
            callback: function (value) {
              return value + "%"; // <-- x-axis labels "0%, 20%, 40%..." widihata
            }
          }
        },
        y: {
          grid: { display: false }
        }
      }
    }
  });
};
// call karanawa - currentReportData eka direct denawa, groupBookingsByPeriod use karanna one na
generateDriverPerfomanceChart(currentReportData);
// call karanawa - period selector ekak methanata one na
generateDriverPerfomanceChart(currentReportData);

// refrsh function eka
const refreshReport = () => {

  // mulinma filter tika clear karanawa 
  startDateFilter.value = "";
  endDateFilter.value = "";

  // select2 dropdowns tika "All" ekata reset karanawa
  $("#selectSupplier").val(null).trigger("change");
  $("#selectStatus").val(null).trigger("change");
  $("#selectDriver").val(null).trigger("change");

  // supplier list fill into the select element
  const supplierList = getServiceRequest("/supplier/alldata");
  dataFilIntoSelect(selectSupplier, "All", supplierList, "transportname");

  // status list fill into the select element
  const statusList = getServiceRequest("/driverstatus/statuswithoutdelete");
  dataFilIntoSelect(selectStatus, "All", statusList, "status");

  // driver list fill into the select element
  const driverList = getServiceRequest("/driver/alldata");
  dataFillIntoSelectWithTwoNames(selectDriver, "All", driverList, "fullname", "nic");

  // === ohaseansehima ithuru unaata passe report eka generate karanawa ===
  driverPerformanceReport();
  updateChart();
}


// print eka
const printDriverPerfomanceReport = () => {
  const chartCanvas = document.getElementById("driverPerformanceChart");
  const chartImage = window.myBarChart ? window.myBarChart.toBase64Image() : (chartCanvas ? chartCanvas.toDataURL("image/png") : "");

  // filter details tika print header ekata pennanna
  const driverText = $("#selectDriver").select2("data")[0]?.text || "All";
  const supplierText = $("#selectSupplier").select2("data")[0]?.text || "All";
  const statusText = $("#selectStatus").select2("data")[0]?.text || "All";
  const startDate = document.getElementById("startDateFilter").value || "-";
  const endDate = document.getElementById("endDateFilter").value || "-";

  const tableRowsHtml = currentReportData
    .map((d, index) => {
      const ontimePercentage = getOntimePrecentage(d);
      const avgDelay = getAverageDelay(d);
      const performance = getPerfomance(d).replace(/<[^>]*>/g, ""); // status-chip HTML strip karanawa

      return `
    <tr>
      <td>${index + 1}</td>
      <td>${d.suppliername || "-"}</td>
      <td>${d.drivername || "-"}</td>
      <td>${d.totalTrips || "-"}</td>
      <td>${ontimePercentage}</td>
      <td>${avgDelay}</td>
      <td>${d.totaldistance || "-"}</td>
      <td>${performance}</td>
    </tr>
    `;
    })
    .join("");

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
        <html>
            <head>
                <title>Driver Performance Summary Report</title>
                <style>
          body { font-family: Arial, sans-serif; padding: 28px; color: #1e293b; }
                    .report-header { margin-bottom: 16px; text-align: center; }
          .report-title { margin: 0; font-size: 22px; font-weight: 700; }
          .report-subtitle { margin: 6px 0 0 0; color: #64748b; font-size: 13px; }
          .report-meta { margin: 8px 0 0 0; color: #64748b; font-size: 12px; }
          .filter-summary { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin: 14px 0; font-size: 12px; color: #334155; }
          .filter-summary span strong { color: #1e293b; }
          .chart-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; margin: 20px 0 24px 0; }
          .chart-card h4 { margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #334155; text-align: center; }
          .chart-image-wrap { display: flex; justify-content: center; align-items: center; min-height: 220px; }
          .chart-image-wrap img { max-width: 100%; max-height: 280px; }
          .table-title { font-size: 14px; font-weight: 700; margin: 8px 0 10px 0; text-transform: uppercase; color: #334155; }
          table { width: 100%; border-collapse: collapse; }
          th { background-color: #f8fafc; color: #64748b; text-transform: uppercase; font-size: 11px; padding: 10px; border: 1px solid #e2e8f0; }
          td { padding: 10px; border: 1px solid #e2e8f0; font-size: 12px; text-align: center; }
          td:first-child, th:first-child { width: 44px; }
                    @media print {
                        body { padding: 0; }
            .chart-card, tr { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
        <div class="report-header">
          <h1 class="report-title">Driver Performance Summary</h1>
          <p class="report-subtitle">Detailed overview of driver performance metrics</p>
          <p class="report-meta">Generated on: ${new Date().toLocaleString()}</p>
        </div>

        <div class="filter-summary">
          <span>Driver: <strong>${driverText}</strong></span>
          <span>Supplier: <strong>${supplierText}</strong></span>
          <span>Status: <strong>${statusText}</strong></span>
          <span>Start Date: <strong>${startDate}</strong></span>
          <span>End Date: <strong>${endDate}</strong></span>
        </div>

        <div class="chart-card">
          <h4>Top Performing Drivers</h4>
          <div class="chart-image-wrap">
            ${chartImage ? `<img src="${chartImage}" alt="Driver Performance Chart">` : "<span>Chart unavailable</span>"}
          </div>
        </div>

        <div class="table-title">Driver Performance Details</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Supplier</th>
              <th>Driver Name</th>
              <th>Total Trips</th>
              <th>On Time</th>
              <th>AVG Delay</th>
              <th>Total Distance</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml || '<tr><td colspan="8">No data available</td></tr>'}
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