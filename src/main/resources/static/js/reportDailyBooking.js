// reportDailyBooking.js
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        try {
            refreshDailyBookingReport();
            hourlyBookingTrendChartFunction();
            booingCountByStatus();
        } catch (e) {
            console.error("Error during revenue page initialization:", e);
        } finally {
            // Reveal the content after all synchronous data is fetched
            finishPageLoading();
        }
    }, 100);


    // enable type and search of the select elements
    $("#selectCustomer").select2({ theme: "bootstrap-5" });
    $("#selectBookingStatus").select2({ theme: "bootstrap-5" });
    $("#selectVehicle").select2({ theme: "bootstrap-5" });
    $("#selectDriver").select2({ theme: "bootstrap-5" });

});

// get select element value eka parse karala return karana function eka
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

// global variable eka daily booking report data eka store karana
let currentDailyReportData = [];

// daily booking report eka table generate karana function eka
const dailyBookingReport = () => {

    let customerId = getSelectValue("selectCustomer").id;
    let bookingStatusId = getSelectValue("selectBookingStatus").id;
    let vehicleId = getSelectValue("selectVehicle").id;
    let driverId = getSelectValue("selectDriver").id;


    // empty key,value pair ekak hadanawa
    let params = new URLSearchParams();
    // variable eka true wunoth without value eka append karanawa, false wunoth append karanawa na
    // false karanne null,undefined,empty string value ekak thiyenawanam eka skip karanwa
    if (customerId) params.append("customerId", customerId);
    if (bookingStatusId) params.append("bookingStatusId", bookingStatusId);
    if (vehicleId) params.append("vehicleId", vehicleId);
    if (driverId) params.append("driverId", driverId);

    let datalist = getServiceRequest("/report/alldailybookings?" + params.toString());

    if (!datalist || datalist.length === 0) {
        dailyBookingReportTableBody.innerHTML = `<tr><td colspan="6" class="text-center">No data available</td></tr>`;
        return;
    }

    let reportDatalist = new Array();
    for (const index in datalist) {

        let object = new Object();
        object.bookingNo = datalist[index][0];
        object.customer = datalist[index][1];
        object.vehicle = datalist[index][2] ? datalist[index][2] : "-";
        object.driver = datalist[index][3] ? datalist[index][3] : "-";
        object.distance = datalist[index][4] + " KM";
        object.status = datalist[index][5];
        reportDatalist.push(object);

    }
    currentDailyReportData = reportDatalist;

    let propertyList = [
        { propertyName: "bookingNo", dataType: "string" },
        { propertyName: "customer", dataType: "string" },
        { propertyName: "vehicle", dataType: "string" },
        { propertyName: "driver", dataType: "string" },
        { propertyName: "distance", dataType: "string" },
        { propertyName: getStatus, dataType: "function" },
    ];




    dataFillIntoTheReportTable(dailyBookingReportTableBody, currentDailyReportData, propertyList);


};

// daily hourly booking count eka chart eken generate karana function eka
const hourlyBookingTrendChartFunction = () => {
    let datalist = getServiceRequest("/report/dailyhourlybooking");

    let data = [];
    let label = [];

    for (const index in datalist) {
        let hour = parseInt(datalist[index][0]);
        let ampm = hour >= 12 ? "PM" : "AM";
        let displayHour = hour % 12;
        displayHour = displayHour === 0 ? 12 : displayHour;
        let formattedHour = displayHour + " " + ampm;

        label.push(formattedHour);
        data.push(datalist[index][1]);
    }

    const canvasElem = document.getElementById("hourlyBookingTrendChart");
    if (!canvasElem) return;
    const ctx = canvasElem.getContext("2d");

    // Create Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, "rgba(124, 58, 237, 0.3)");
    gradient.addColorStop(1, "rgba(124, 58, 237, 0)");

    if (window.hourlyChartInstance) {
        window.hourlyChartInstance.destroy();
    }

    window.hourlyChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: label,
            datasets: [
                {
                    label: "Number Of Bookings",
                    data: data,
                    borderColor: "#7c3aed",
                    backgroundColor: gradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: "#ffffff",
                    pointBorderColor: "#7c3aed",
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "#1e293b",
                    padding: 12,
                    titleFont: { size: 14, weight: "700" },
                    bodyFont: { size: 13 },
                    cornerRadius: 8,
                    displayColors: false,
                },
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: "#94a3b8", font: { size: 11 } },
                },
                y: {
                    beginAtZero: true,
                    border: { dash: [4, 4] },
                    grid: { color: "#f1f5f9" },
                    ticks: { color: "#94a3b8", font: { size: 11 }, stepSize: 5 },
                },
            },
        },
    });
};

// daily booking status count
const booingCountByStatus = () => {
    let datalist = getServiceRequest("/report/bookingbystatusdaily");

    let data = [];
    let label = [];

    for (const index in datalist) {
        label.push(datalist[index][0]);
        data.push(datalist[index][1]);
    }

    const canvasElem = document.getElementById("bookingStatusDistributionChart");
    if (!canvasElem) return;
    const ctx = canvasElem.getContext("2d");

    if (window.statusChartInstance) {
        window.statusChartInstance.destroy();
    }

    window.statusChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: label,
            datasets: [
                {
                    label: "Number of Bookings",
                    data: data,
                    backgroundColor: ["#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899"],
                    hoverOffset: 15,
                    borderWidth: 2,
                    borderColor: "#ffffff",
                },
            ],
        },
        options: {
            circumference: 180,
            rotation: -90,
            cutout: "75%",
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: { size: 11, weight: "500" },
                    },
                },
            },
            maintainAspectRatio: false,
        },
    });
};

// get status eka return karana function eka
const getStatus = (dataOb) => {
    const status = dataOb.status;
    let statusClass = "status-inactive";
    if (status === "Attend") {
        statusClass = "status-badge status-attend";
    } else if (status === "Arrived At Pickup" || status === "Departed From Pickup") {
        statusClass = "status-pending";
    } else if (status === "Arrived At Delivery" || status === "Departed From Delivery") {
        statusClass = "status-active";
    } else if (status === "Cancelled") {
        statusClass = "status-cancelled";
    }

    return `<div class="status-badge ${statusClass}">
            <span>${status}</span>
          </div>`;
};

// daily booking report eka refresh karana function eka
const refreshDailyBookingReport = () => {

    $("#selectCustomer").val(null).trigger("change");
    $("#selectBookingStatus").val(null).trigger("change");
    $("#selectVehicle").val(null).trigger("change");
    $("#selectDriver").val(null).trigger("change");

    const customerList = getServiceRequest("/customer/alldata");

    dataFilIntoSelect(selectCustomer, "All", customerList, "company_name");

    const statusList = getServiceRequest("/bookingstatus/alldata");
    dataFilIntoSelect(selectBookingStatus, "All", statusList, "status");

    const vehicleList = getServiceRequest("/vehicle/alldata");
    dataFilIntoSelect(selectVehicle, "All", vehicleList, "vehicle_no");

    const driverList = getServiceRequest("/driver/alldata");
    dataFillIntoSelectWithTwoNames(selectDriver, "All", driverList, "fullname", "nic");


    dailyBookingReport();
};

// print eka
const printDailyBookingReport = () => {
    const hourlyChartImage = window.hourlyChartInstance ? window.hourlyChartInstance.toBase64Image() : "";
    const statusChartImage = window.statusChartInstance ? window.statusChartInstance.toBase64Image() : "";

    // filter details tika print header ekata pennanna
    const customerText = $("#selectCustomer").select2("data")[0]?.text || "All";
    const statusText = $("#selectBookingStatus").select2("data")[0]?.text || "All";
    const vehicleText = $("#selectVehicle").select2("data")[0]?.text || "All";
    const driverText = $("#selectDriver").select2("data")[0]?.text || "All";

    const tableRowsHtml = currentDailyReportData
        .map((item, index) => {
            return `
    <tr>
      <td>${index + 1}</td>
      <td>${item.bookingNo || "-"}</td>
      <td>${item.customer || "-"}</td>
      <td>${item.vehicle || "-"}</td>
      <td>${item.driver || "-"}</td>
      <td>${item.distance || "-"}</td>
      <td>${item.status || "-"}</td>
    </tr>
    `;
        })
        .join("");

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
        <html>
            <head>
                <title>Daily Booking Summary Report</title>
                <style>
          body { font-family: Arial, sans-serif; padding: 28px; color: #1e293b; }
                    .report-header { margin-bottom: 16px; text-align: center; }
          .report-title { margin: 0; font-size: 22px; font-weight: 700; }
          .report-subtitle { margin: 6px 0 0 0; color: #64748b; font-size: 13px; }
          .report-meta { margin: 8px 0 0 0; color: #64748b; font-size: 12px; }
          .filter-summary { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin: 14px 0; font-size: 12px; color: #334155; }
          .filter-summary span strong { color: #1e293b; }
          .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0 24px 0; }
          .chart-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; }
          .chart-card h4 { margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #334155; text-align: center; }
          .chart-image-wrap { display: flex; justify-content: center; align-items: center; min-height: 220px; }
          .chart-image-wrap img { max-width: 100%; max-height: 230px; }
          .table-title { font-size: 14px; font-weight: 700; margin: 8px 0 10px 0; text-transform: uppercase; color: #334155; }
          table { width: 100%; border-collapse: collapse; }
          th { background-color: #f8fafc; color: #64748b; text-transform: uppercase; font-size: 11px; padding: 10px; border: 1px solid #e2e8f0; }
          td { padding: 10px; border: 1px solid #e2e8f0; font-size: 12px; }
          td:first-child, th:first-child { text-align: center; width: 44px; }
                    @media print {
                        body { padding: 0; }
            .chart-card, tr { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
        <div class="report-header">
          <h1 class="report-title">Daily Booking Summary Report</h1>
          <p class="report-subtitle">Real-time operational overview, compliance tracking, and financial performance for today</p>
          <p class="report-meta">Generated on: ${new Date().toLocaleString()}</p>
        </div>

        <div class="filter-summary">
          <span>Customer: <strong>${customerText}</strong></span>
          <span>Status: <strong>${statusText}</strong></span>
          <span>Vehicle: <strong>${vehicleText}</strong></span>
          <span>Driver: <strong>${driverText}</strong></span>
        </div>

        <div class="charts-grid">
          <div class="chart-card">
            <h4>Hourly Booking Trend</h4>
            <div class="chart-image-wrap">
              ${hourlyChartImage ? `<img src="${hourlyChartImage}" alt="Hourly Booking Trend Chart">` : "<span>Chart unavailable</span>"}
            </div>
          </div>
          <div class="chart-card">
            <h4>Booking Status Distribution</h4>
            <div class="chart-image-wrap">
              ${statusChartImage ? `<img src="${statusChartImage}" alt="Booking Status Distribution Chart">` : "<span>Chart unavailable</span>"}
            </div>
          </div>
        </div>

        <div class="table-title">Daily Booking Details</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Booking No</th>
              <th>Customer</th>
              <th>Vehicle No</th>
              <th>Driver</th>
              <th>Distance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml || '<tr><td colspan="7" style="text-align:center;">No data available</td></tr>'}
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