// reportBookingDelay.js
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

    // enable type and search of the select element
    $("#selectCustomer").select2({
        theme: "bootstrap-5",
    });

    $("#selectVehicle").select2({
        theme: "bootstrap-5",
    });

    $("#selectDriver").select2({
        theme: "bootstrap-5",
    });

    // period wenas unama chart eka witharak refresh wenawa
    document.getElementById("selectPeriod").addEventListener("change", updateChart);

});

// slect element value eka parse karala object ekak return karanawa
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

const bookingDelayReport = () => {

    let customerId = getSelectValue("selectCustomer").id;
    let vehicleId = getSelectValue("selectVehicle").id;
    let driverId = getSelectValue("selectDriver").id;
    let delayType = document.getElementById("selectDelayType") ? document.getElementById("selectDelayType").value : "";
    let startDate = document.getElementById("startDateFilter").value;
    let endDate = document.getElementById("endDateFilter").value;

    // empty key,value pair ekak hadanawa
    let params = new URLSearchParams();

    // variable eka true wunoth without value eka append karanawa, false wunoth append karanawa na
    // false karanne null,undefined,empty string value ekak thiyenawanam eka skip karanwa
    if (customerId) params.append("customerId", customerId);
    if (vehicleId) params.append("vehicleId", vehicleId);
    if (driverId) params.append("driverId", driverId);
    if (delayType) params.append("delayType", delayType);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    // params toString eken add karapu parameter tika url eke query string ekata convert karanawa
    let datalist = getServiceRequest("/report/alldelaybookins?" + params.toString());

    if (!datalist || datalist.length === 0) {
        document.getElementById("bookingReportTableBody").innerHTML = "<tr><td colspan='11' class='text-center'>No data available</td></tr>";

        currentReportData = [];

        if (window.myBarChart) {
            window.myBarChart.destroy();
            window.myBarChart = null;
        }

        return;
    }

    let reportDatalist = [];
    for (const index in datalist) {
        let object = new Object();
        object.bookingNo = datalist[index][0];
        object.customer = datalist[index][1];
        object.vehicleNo = datalist[index][2];
        object.pickup = datalist[index][3];
        object.destination = datalist[index][4];
        object.pickupTime = datalist[index][5];
        object.deliveryTime = datalist[index][6];
        object.actualPickupTime = datalist[index][7];
        object.actualDeliveryTime = datalist[index][8];
        object.pickupDelay = parseInt(datalist[index][9]) || 0;
        object.deliveryDelay = parseInt(datalist[index][10]) || 0;
        object.pickupReason = datalist[index][11] || "-";
        object.deliveryReason = datalist[index][12] || "-";
        reportDatalist.push(object);
    }

    const propertyList = [
        { propertyName: "bookingNo", dataType: "string" },
        { propertyName: "customer", dataType: "string" },
        { propertyName: "vehicleNo", dataType: "string" },
        { propertyName: getRoute, dataType: "function" },
        { propertyName: getScheduleDateTime, dataType: "function" },
        { propertyName: getActualDateTime, dataType: "function" },
        { propertyName: getPickupDelayBadge, dataType: "function" },
        { propertyName: getPickupReason, dataType: "function" },
        { propertyName: getDeliveryDelayBadge, dataType: "function" },
        { propertyName: getDeliveryReason, dataType: "function" },
    ];

    currentReportData = reportDatalist; // global ekata save karanawa

    // table generate
    dataFillIntoTheReportTable(document.getElementById("bookingReportTableBody"), reportDatalist, propertyList);

    // charet generate karanawa, default period eka monthly
    updateChart();

};

// currentReportData eka use karala, dan select kara period ekට anuwa chart eka refresh karanawa
const updateChart = () => {
    const period = document.getElementById("selectPeriod").value;
    // meken return karanw aproup karapu data list eka
    const groupedData = groupBookingsByPeriod(currentReportData, period);
    // eka chart ekata pass karanawa
    generateBarChart(groupedData);
};


const formatDateTime = (dt) => {
    if (!dt) return "N/A";
    let date = new Date(dt);
    if (isNaN(date.getTime())) return dt.replace("T", " ");
    return date.toLocaleString('en-US', {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

const getRoute = (dataOb) => {
    return `<div class="route-cell py-1">
        <div>${dataOb.pickup || "-"}</div>
        <div class="my-1 text-center"><i class="fas fa-arrow-down text-muted" style="font-size: 0.7rem;"></i></div>
        <div>${dataOb.destination || "-"}</div>
    </div>`;
};

const getScheduleDateTime = (dataOb) => {
    return `
        <div class="timestamp-container">
            <div class="timestamp-item mb-1">
                <span class="ts-label small text-muted d-block" style="font-size: 0.7rem; font-weight: 600;">PICKUP</span>
                <span class="ts-value fw-medium" style="font-size: 0.8rem;">${formatDateTime(dataOb.pickupTime)}</span>
            </div>
            <div class="timestamp-item">
                <span class="ts-label small text-muted d-block" style="font-size: 0.7rem; font-weight: 600;">DELIVERY</span>
                <span class="ts-value fw-medium" style="font-size: 0.8rem;">${formatDateTime(dataOb.deliveryTime)}</span>
            </div>
        </div>
    `;
};

const getActualDateTime = (dataOb) => {
    return `
        <div class="timestamp-container">
            <div class="timestamp-item mb-1">
                <span class="ts-label small text-muted d-block" style="font-size: 0.7rem; font-weight: 600;">ARRIVED PICKUP</span>
                <span class="ts-value fw-medium" style="font-size: 0.8rem;">${formatDateTime(dataOb.actualPickupTime)}</span>
            </div>
            <div class="timestamp-item">
                <span class="ts-label small text-muted d-block" style="font-size: 0.7rem; font-weight: 600;">ARRIVED DELIVERY</span>
                <span class="ts-value fw-medium" style="font-size: 0.8rem;">${formatDateTime(dataOb.actualDeliveryTime)}</span>
            </div>
        </div>
    `;
};

const getPickupDelayBadge = (dataOb) => {
    let delay = parseInt(dataOb.pickupDelay) || 0;
    if (delay <= 0) return `<span class="status-badges status-low-delay">0 min</span>`;
    let badgeClass = delay > 30 ? "status-badges status-high-delay" : "status-badges status-medium-delay";
    return `<span class="${badgeClass}">${delay} min</span>`;
};

const getPickupReason = (dataOb) => {
    return `<span class="text-muted small">${dataOb.pickupReason || "-"}</span>`;
};

const getDeliveryDelayBadge = (dataOb) => {
    let delay = parseInt(dataOb.deliveryDelay) || 0;
    if (delay <= 0) return `<span class="status-badges status-low-delay">0 min</span>`;
    let badgeClass = delay > 60 ? "status-badges status-high-delay" : "status-badges status-medium-delay";
    return `<span class="${badgeClass}">${delay} min</span>`;
};

const getDeliveryReason = (dataOb) => {
    return `<span class="text-muted small">${dataOb.deliveryReason || "-"}</span>`;
};

// perido eka anuawa data tika group karanawa, pickup saha delivery delay count wenama gannawa
const groupBookingsByPeriod = (dataList, period) => {
    // empty object ekak hadagannawa
    const grouped = {};

    // datalist eken object ekin eka ekin eka read karanwa
    dataList.forEach((dataOb) => {

        // pickdate time sah delivery date time agnnawa.
        const dtStr = dataOb.pickupTime || dataOb.deliveryTime;
        // ewa naththan meka return karanwa
        if (!dtStr) return;

        // date eka convert karanwa
        const date = new Date(dtStr);

        // date eka valida nam eka number eka invalidd nam string ekak
        // invalid eka nam skip karanwa data corrupt wena eka nawaththanna
        if (isNaN(date.getTime())) return;

        let key;
        // prediod eka anuwa api key eka hadanawa. monthly nam 2025-07, weekly nam 2025-W29, daily nam 2025-07-15 widihata
        if (period === "monthly") {
            // ex= 2025
            // getmonth eken enne 6 nama api ganna oni 7.mkd 7 kiyanne july getmonth eken enne.human read karan widihata ganna oni nisa 1 ekauth karanwa
            //getMonth --------------> 0 idan 11 dakwa (0=Jan, 7=Aug, 11=Dec)
            // api read karanne -------------> 1 idan 12 dakwa (1=Jan, 8=Aug, 12=Dec)
            // pad start eken karanne (getmonth ekne enne 9 nam eka convert karanwa 09 lese.habai already 12 awoth convert karanne 12 mai)
            key = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
            // final widihata enawa 2025-07
        } else if (period === "weekly") {
            // mekan api gnnawa year eke fisrsta date ekata adal week eka. ex= 2025-07-15 kiyanne 2025 year eke 29 week eka
            // date(yaer--->2025,  0--->jan,   1--->fisrtdate eka month ekea)
            const start = new Date(date.getFullYear(), 0, 1);
            // jan 1 idan ada wneawan dawas keeyak gihind kaiyala abalanwa
            const diffInDays = Math.floor((date - start) / (1000 * 60 * 60 * 24));
            // ena dawas ganawa 7 bedala no eka gnnawa
            const weekNumber = Math.floor(diffInDays / 7) + 1;
            // ex-2025-w27
            key = date.getFullYear() + "-W" + weekNumber;
        } else {
            // else kiyanne daily nam. ex= 2025-07-15
            key = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
        }

        // key eka object eke naththan intialize karanwa
        // e kiyanne grouped["2025-08"] kiyan eka eddi object key eka na.eka nisa deafult value ekak hadanawa. ex= grouped["2025-08"] = { pickupDelayCount: 0, deliveryDelayCount: 0 }
        if (!grouped[key]) {
            grouped[key] = { pickupDelayCount: 0, deliveryDelayCount: 0 };
        }

        // delay > 0 unoth witharak count karanawa (0 min delay kiyanne delay ekak na)
        // booking eke pickupdelay eka 0 ta wadi nam pickupDelayCount eka 1 wadi karanawa. deliverydelay eka 0 ta wadi nam deliveryDelayCount eka 1 wadi karanawa
        if (dataOb.pickupDelay > 0) {
            grouped[key].pickupDelayCount += 1;
        }
        if (dataOb.deliveryDelay > 0) {
            grouped[key].deliveryDelayCount += 1;
        }
    });

    // eeta passe final gropued object eka return karanawa
    return grouped;

    // ex :- {
    //   "2025-06": { pickupDelayCount: 3, deliveryDelayCount: 5 },
    //   "2025-07": { pickupDelayCount: 1, deliveryDelayCount: 0 },
    //   "2025-08": { pickupDelayCount: 7, deliveryDelayCount: 2 } }

};

// chart ekagenerate karana function ekak hadanawa
const generateBarChart = (groupedData) => {
    const ctx = document.getElementById('barChart').getContext('2d');
    const labels = Object.keys(groupedData);
    // key ekaka pickup count eka saha delivery count eka wenama arrays widihata gannawa
    const pickupDelayValues = labels.map((key) => groupedData[key].pickupDelayCount);

    const deliveryDelayValues = labels.map((key) => groupedData[key].deliveryDelayCount);

    if (window.myBarChart) {
        window.myBarChart.destroy();
    }

    window.myBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Pickup Delay Count',
                    data: pickupDelayValues,
                    backgroundColor: 'rgba(245, 158, 11, 0.6)', // orange
                    borderColor: 'rgba(245, 158, 11, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'Delivery Delay Count',
                    data: deliveryDelayValues,
                    backgroundColor: 'rgba(239, 68, 68, 0.6)', // red
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        precision: 0
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ": " + context.raw;
                        }
                    }
                }
            }
        }
    });
};

const refreshReport = () => {
    document.getElementById("startDateFilter").value = "";
    document.getElementById("endDateFilter").value = "";
    if (document.getElementById("selectDelayType")) {
        document.getElementById("selectDelayType").value = "";
    }

    $("#selectCustomer").val(null).trigger("change");
    $("#selectVehicle").val(null).trigger("change");
    $("#selectDriver").val(null).trigger("change");

    const customerList = getServiceRequest("/customer/alldata");
    dataFilIntoSelect(selectCustomer, "All", customerList, "company_name");

    const vehicleList = getServiceRequest("/vehicle/alldata");
    dataFilIntoSelect(selectVehicle, "All", vehicleList, "vehicle_no");

    const driverList = getServiceRequest("/driver/alldata");
    dataFillIntoSelectWithTwoNames(selectDriver, "All", driverList, "fullname", "nic");

    bookingDelayReport();
};


// print
const printBookingDelayReport = () => {
    const chartCanvas = document.getElementById("barChart");
    const chartImage = window.myBarChart ? window.myBarChart.toBase64Image() : (chartCanvas ? chartCanvas.toDataURL("image/png") : "");

    // filter details tika print header ekata pennanna
    const customerText = $("#selectCustomer").select2("data")[0]?.text || "All";
    const vehicleText = $("#selectVehicle").select2("data")[0]?.text || "All";
    const driverText = $("#selectDriver").select2("data")[0]?.text || "All";
    const delayTypeEl = document.getElementById("selectDelayType");
    const delayTypeText = delayTypeEl && delayTypeEl.value ? delayTypeEl.options[delayTypeEl.selectedIndex].text : "All";
    const startDate = document.getElementById("startDateFilter").value || "-";
    const endDate = document.getElementById("endDateFilter").value || "-";

    // table eke search box eke value ekath consider karanawa (screen eke filter karagena thiyena widihatama print karanna)
    const searchValue = (document.getElementById("tableSearch")?.value || "").trim().toLowerCase();

    const filteredData = (currentReportData || []).filter((item) => {
        if (!searchValue) return true;
        const searchText = `${item.bookingNo || ""} ${item.customer || ""} ${item.vehicleNo || ""} ${item.pickup || ""} ${item.destination || ""}`.toLowerCase();
        return searchText.includes(searchValue);
    });

    const tableRowsHtml = filteredData
        .map((item, index) => {
            return `
    <tr>
      <td>${index + 1}</td>
      <td>${item.bookingNo || "-"}</td>
      <td>${item.customer || "-"}</td>
      <td>${item.vehicleNo || "-"}</td>
      <td>${item.pickup || "-"} &rarr; ${item.destination || "-"}</td>
      <td>Pickup: ${formatDateTime(item.pickupTime)}<br>Delivery: ${formatDateTime(item.deliveryTime)}</td>
      <td>Pickup: ${formatDateTime(item.actualPickupTime)}<br>Delivery: ${formatDateTime(item.actualDeliveryTime)}</td>
      <td>${item.pickupDelay || 0} min</td>
      <td>${item.pickupReason || "-"}</td>
      <td>${item.deliveryDelay || 0} min</td>
      <td>${item.deliveryReason || "-"}</td>
    </tr>
    `;
        })
        .join("");

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
        <html>
            <head>
                <title>Bookings Delay Analysis Report</title>
                <style>
          body { font-family: Arial, sans-serif; padding: 28px; color: #1e293b; }
                    .report-header { margin-bottom: 16px; text-align: center; }
          .report-title { margin: 0; font-size: 22px; font-weight: 700; }
          .report-subtitle { margin: 6px 0 0 0; color: #64748b; font-size: 13px; }
          .report-meta { margin: 8px 0 0 0; color: #64748b; font-size: 12px; }
          .filter-summary { display: flex; justify-content: center; gap: 18px; flex-wrap: wrap; margin: 14px 0; font-size: 12px; color: #334155; }
          .filter-summary span strong { color: #1e293b; }
          .chart-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; margin: 20px 0 24px 0; }
          .chart-card h4 { margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #334155; }
          .chart-image-wrap { display: flex; justify-content: center; align-items: center; min-height: 220px; }
          .chart-image-wrap img { max-width: 100%; max-height: 280px; }
          .table-title { font-size: 14px; font-weight: 700; margin: 8px 0 10px 0; text-transform: uppercase; color: #334155; }
          table { width: 100%; border-collapse: collapse; }
          th { background-color: #f8fafc; color: #64748b; text-transform: uppercase; font-size: 10px; padding: 8px; border: 1px solid #e2e8f0; }
          td { padding: 8px; border: 1px solid #e2e8f0; font-size: 11px; }
          td:first-child, th:first-child { text-align: center; width: 34px; }
                    @media print {
                        body { padding: 0; }
            .chart-card, tr { page-break-inside: avoid; }
                        table { font-size: 10px; }
                    }
                </style>
            </head>
            <body>
        <div class="report-header">
          <h1 class="report-title">Bookings Delay Analysis Report</h1>
          <p class="report-subtitle">Comprehensive analysis of transport delays and booking performance metrics</p>
          <p class="report-meta">Generated on: ${new Date().toLocaleString()}</p>
        </div>

        <div class="filter-summary">
          <span>Customer: <strong>${customerText}</strong></span>
          <span>Vehicle: <strong>${vehicleText}</strong></span>
          <span>Driver: <strong>${driverText}</strong></span>
          <span>Delay Type: <strong>${delayTypeText}</strong></span>
          <span>Start Date: <strong>${startDate}</strong></span>
          <span>End Date: <strong>${endDate}</strong></span>
        </div>

        <div class="chart-card">
          <h4>Delay Trend</h4>
          <div class="chart-image-wrap">
            ${chartImage ? `<img src="${chartImage}" alt="Delay Trend Chart">` : "<span>Chart unavailable</span>"}
          </div>
        </div>

        <div class="table-title">Booking Delay Details</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Booking No</th>
              <th>Customer</th>
              <th>Vehicle No</th>
              <th>Route</th>
              <th>Scheduled Time</th>
              <th>Actual Time</th>
              <th>Pickup Delay</th>
              <th>Pickup Reason</th>
              <th>Delivery Delay</th>
              <th>Delivery Reason</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml || '<tr><td colspan="11" style="text-align:center;">No data available</td></tr>'}
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