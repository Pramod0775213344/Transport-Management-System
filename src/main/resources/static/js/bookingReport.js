document.addEventListener("DOMContentLoaded", function () {


    setTimeout(() => {
        try {
            refreshReport();

        } catch (e) {
            console.error("Error during supplier page initialization:", e);
        } finally {
            // Reveal the content after all synchronous data is fetched
            finishPageLoading();
        }
    }, 100);

    //     enable type and search of the select element
    $("#selectCustomer").select2({
        theme: "bootstrap-5",
    });

    $("#selectVehicle").select2({
        theme: "bootstrap-5",
    });

    $("#selectDriver").select2({
        theme: "bootstrap-5",
    });
    $("#selectStatus").select2({
        theme: "bootstrap-5",
    });


    // === methana add karanna - period wenas unama chart eka witharak refresh wenawa ===
    document.getElementById("selectPeriod").addEventListener("change", updateChart);
});


// ================ select 2 valude get function =============================
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

// =============== end select 2 valude get function =========================

let currentReportData = [];


// ================= load booking table =======================================
const bookingReportTable = () => {

    let customerId = getSelectValue("selectCustomer").id;
    let vehicleId = getSelectValue("selectVehicle").id;
    let driverId = getSelectValue("selectDriver").id;
    let statusId = getSelectValue("selectStatus").id;
    let startDate = document.getElementById("startDateFilter").value;
    let endDate = document.getElementById("endDateFilter").value;

    // empty key,value pair ekak hadanawa
    let params = new URLSearchParams();

    // variable eka true wunoth without value eka append karanawa, false wunoth append karanawa na
    // false karanne null,undefined,empty string value ekak thiyenawanam eka skip karanwa

    if (customerId) params.append("customerid", customerId);
    if (vehicleId) params.append("vehicleid", vehicleId);
    if (driverId) params.append("driverid", driverId);
    if (statusId) params.append("statusid", statusId);
    if (startDate) params.append("startdate", startDate);
    if (endDate) params.append("enddate", endDate);

    // params toString eken add karapu parameter tika url eke query string ekata convert karanawa
    // customer id eka witharak add kaloth url eka --> /report/bookinglist?customerid=5
    // customet id saha vehicle id add kaloth url eka --> /report/bookinglist?customerid=5&vehicleid=2
    let datalist = getServiceRequest("/report/bookinglist?" + params.toString());

    if (!datalist || datalist.length === 0) {
        document.getElementById("bookingReportTableBody").innerHTML = "<tr><td colspan='8' class='text-center'>No data available</td></tr>";

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
        object.bookingNo = datalist[index][0];
        object.bookingDate = datalist[index][1];
        object.customer = datalist[index][2]
        object.supplier = datalist[index][3];
        object.driver = datalist[index][4];
        object.vehicleNo = datalist[index][5];
        object.distance = datalist[index][6];
        object.status = datalist[index][7];
        reportDatalist.push(object);


    }

    const propertyList = [
        { propertyName: "bookingNo", dataType: "string" },
        { propertyName: "bookingDate", dataType: "string" },
        { propertyName: "customer", dataType: "string" },
        { propertyName: "supplier", dataType: "string" },
        { propertyName: "driver", dataType: "string" },
        { propertyName: "vehicleNo", dataType: "string" },
        { propertyName: "distance", dataType: "string" },
        { propertyName: getStatus, dataType: "function" },
    ];

    currentReportData = reportDatalist; // === methana add karanna - global ekata save karanawa ===

    // table generate
    dataFillIntoTheReportTable(document.getElementById("bookingReportTableBody"), reportDatalist, propertyList);

    updateChart();


}

const getStatus = (dataOb) => {
    const status = dataOb.status;
    let statusClass = "status-badge status-inactive";

    if (status === "Attend") {
        statusClass = "status-badge status-attend";
    } else if (status === "Arrived At Pickup" || status === "Departed From Pickup") {
        statusClass = "status-badge status-pending";
    } else if (status === "Arrived At Delivery" || status === "Departed From Delivery") {
        statusClass = "status-badge status-active";
    } else if (status === "Cancelled") {
        statusClass = "status-badge status-cancelled";
    } else if (status === "Inproccess" || status === "Inprocess") {
        statusClass = "status-badge status-inactive";
    }

    return `<div class="${statusClass}">
            <span>${status}</span>
          </div>`;
}
// =============== end laod booking tbale functions =============================


// ================ chart load functions ========================================

// currentReportData eka use karala, dan select kara period ekට anuwa chart eka refresh karanawa
const updateChart = () => {
    const period = document.getElementById("selectPeriod").value;
    const groupedData = groupBookingsByPeriod(currentReportData, period);
    generateBarChart(groupedData);
};

// bookingDate anuwa daily/weekly/monthly widiyata booking count group karanawa
const groupBookingsByPeriod = (dataList, period) => {

    // empty object ekak hadanawa - key eka date eka, value eka count eka
    const grouped = {};

    // datalist eken eka booking ekak gnnawa
    dataList.forEach((item) => {

        // bokking eke date eka gnnawa - date eka object ekakata convert karanawa
        const date = new Date(item.bookingDate);
        // date eka anuwa key eka hadanawa - monthly, weekly, daily anuwa
        // meke pennanne day nam date eka weeka no weka no eka and month nam month eka
        let key;

        // me group karana logic eka - monthly, weekly, daily anuwa key eka hadanawa
        if (period === "monthly") {
            // date.getMonth() + 1 karanne month eka 0-11 range ekata thiyenawa nisa, 1 add karanawa
            key = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");

        } else if (period === "weekly") {

            // yaer eke fisrs monthe eke fisrt date eka gnnawa
            // 0- january  1-day
            const start = new Date(date.getFullYear(), 0, 1);
            // 
            // jan 1 idan api dena date eka wenakan dina keyyak gihinda
            const diffInDays = Math.floor((date - start) / (1000 * 60 * 60 * 24));

            // week number gannwa (day 1-7 = week 1, 8-14 = week 2, widihata)
            const weekNumber = Math.floor(diffInDays / 7) + 1;

            key = date.getFullYear() + "-W" + weekNumber;

        } else {
            key = item.bookingDate;
        }

        // booking count eka gnnawa
        const bookingCount = 1

        // grouped object ekata key eka thiyenawanam, value eka increment karanawa, nathnam new key ekak hadanawa
        grouped[key] = (grouped[key] || 0) + bookingCount;

    });

    return grouped;
};

// bar chart eka generate karana function eka
const generateBarChart = (groupedData) => {
    // chart eka render karana context eka gnnawa
    const ctx = document.getElementById('bookingCountChart').getContext('2d');
    // labels saha values gnnawa - key saha value tika
    const labels = Object.keys(groupedData);
    const values = Object.values(groupedData);

    if (window.myBarChart) {
        window.myBarChart.destroy();
    }

    window.myBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Bookings Count',
                // decimal oni nam parseInt karanawa, nathnam string widiyata pennanawa
                data: values,
                // backgroundColor: 'rgba(153, 102, 255, 0.2)',
                backgroundColor: '#7c3aed',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return value;
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        // bar eka hover kaloth pennana value eka formatted karanawa
                        label: function (context) {
                            return context.dataset.label + ": " + context.raw;
                        }
                    }
                }
            }
        }
    });
};

// ============= end chart load functions =====================================


// ============== refresh functions ==========================================
const refreshReport = () => {

    // mulinma filter tika clear karanawa 
    startDateFilter.value = "";
    endDateFilter.value = "";

    // select2 dropdowns tika "All" ekata reset karanawa
    $("#selectCustomer").val(null).trigger("change");
    $("#selectVehicle").val(null).trigger("change");
    $("#selectDriver").val(null).trigger("change");
    $("#selectStatus").val(null).trigger("change");



    // customer list fill into the select element
    const customer = getServiceRequest("/customer/alldata");
    dataFilIntoSelect(selectCustomer, "All", customer, "company_name");

    // vehicle list fill into the select element
    const vehicleList = getServiceRequest("/vehicle/alldata");
    dataFilIntoSelect(selectVehicle, "All", vehicleList, "vehicle_no");

    // driver list fill into the select element
    const driverList = getServiceRequest("/driver/alldata");
    dataFillIntoSelectWithTwoNames(selectDriver, "All", driverList, "fullname", "nic");

    // booking status id list
    const statusList = getServiceRequest("bookingstatus/alldata")
    dataFilIntoSelect(selectStatus, "All", statusList, "status");


    // === ohaseansehima ithuru unaata passe report eka generate karanawa ===
    bookingReportTable();
}
// ================= end refresh function ==================================== 



//============================= print ========================================
const printBookingReport = () => {
    const chartCanvas = document.getElementById("bookingCountChart");
    const chartImage = window.myBarChart ? window.myBarChart.toBase64Image() : (chartCanvas ? chartCanvas.toDataURL("image/png") : "");

    // filter details tika print header ekata pennanna
    const customerText = $("#selectCustomer").select2("data")[0]?.text || "All";
    const vehicleText = $("#selectVehicle").select2("data")[0]?.text || "All";
    const driverText = $("#selectDriver").select2("data")[0]?.text || "All";
    const statusText = $("#selectStatus").select2("data")[0]?.text || "All";
    const startDate = document.getElementById("startDateFilter").value || "-";
    const endDate = document.getElementById("endDateFilter").value || "-";

    const tableRowsHtml = currentReportData
        .map((bk, index) => {
            return `
    <tr>
      <td>${index + 1}</td>
      <td>${bk.bookingNo || "-"}</td>
      <td>${bk.bookingDate || "-"}</td>
      <td>${bk.customer || "-"}</td>
      <td>${bk.supplier || "-"}</td>
      <td>${bk.driver || "-"}</td>
      <td>${bk.vehicleNo || "-"}</td>
      <td>${bk.distance || "-"}</td>
      <td>${bk.status || "-"}</td>
    </tr>
    `;
        })
        .join("");

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
        <html>
            <head>
                <title>Booking Performance Report</title>
                <style>
          body { font-family: Arial, sans-serif; padding: 28px; color: #1e293b; }
                    .report-header { margin-bottom: 16px; text-align: center; }
          .report-title { margin: 0; font-size: 22px; font-weight: 700; }
          .report-subtitle { margin: 6px 0 0 0; color: #64748b; font-size: 13px; }
          .report-meta { margin: 8px 0 0 0; color: #64748b; font-size: 12px; }
          .filter-summary { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin: 14px 0; font-size: 12px; color: #334155; }
          .filter-summary span strong { color: #1e293b; }
          .chart-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; margin: 20px 0 24px 0; }
          .chart-card h4 { margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #334155; }
          .chart-image-wrap { display: flex; justify-content: center; align-items: center; min-height: 220px; }
          .chart-image-wrap img { max-width: 100%; max-height: 280px; }
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
          <h1 class="report-title">Booking Performance Report</h1>
          <p class="report-subtitle">Operational efficiency and booking lifecycle analytics</p>
          <p class="report-meta">Generated on: ${new Date().toLocaleString()}</p>
        </div>

        <div class="filter-summary">
          <span>Customer: <strong>${customerText}</strong></span>
          <span>Vehicle: <strong>${vehicleText}</strong></span>
          <span>Driver: <strong>${driverText}</strong></span>
          <span>Status: <strong>${statusText}</strong></span>
          <span>Start Date: <strong>${startDate}</strong></span>
          <span>End Date: <strong>${endDate}</strong></span>
        </div>

        <div class="chart-card">
          <h4>Booking Trend</h4>
          <div class="chart-image-wrap">
            ${chartImage ? `<img src="${chartImage}" alt="Booking Trend Chart">` : "<span>Chart unavailable</span>"}
          </div>
        </div>

        <div class="table-title">Booking Details</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Booking No</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Supplier</th>
              <th>Driver</th>
              <th>Vehicle No</th>
              <th>Distance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml || '<tr><td colspan="9" style="text-align:center;">No data available</td></tr>'}
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
// ============================ end print function ===========================