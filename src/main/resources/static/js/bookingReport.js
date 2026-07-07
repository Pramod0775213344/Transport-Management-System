window.addEventListener("load", function () {
  refresh();
});

const loadBookingReportTable = () => {
  const textStarDate = document.getElementById("textStarDate");
  const textEndDate = document.getElementById("textEndDate");

  if ($.fn.dataTable.isDataTable("#bookingReportTable")) {
    $("#bookingReportTable").DataTable().clear().destroy();
  }

  let bookingReportTableData = getServiceRequest("/report/bydaterangeandtype?startdate=" + textStarDate.value + "&endtdate=" + textEndDate.value);

  // Update status indicators
  const lastUpdatedElem = document.getElementById("lastUpdatedTime");

  if (lastUpdatedElem) {
    const now = new Date();
    lastUpdatedElem.innerText = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  }

  // Fill data if exists
  if (bookingReportTableData.length > 0) {
    let propertyList = [
      { propertyName: getBookingInfo, dataType: "function" },
      { propertyName: getSheduleTime, dataType: "function" },
      { propertyName: getActualTime, dataType: "function" },
      { propertyName: getDelayReasons, dataType: "function" },
      { propertyName: getMeterReading, dataType: "function" },
    ];
    dataFillIntoTheReportTable(bookingReportTableBody, bookingReportTableData, propertyList);
    printButtonBookingReport.style.display = "";
    // Update KPI cards based on the filtered data
    updateKpiCards(bookingReportTableData);
  } else {
    bookingReportTableBody.innerHTML = "";
    printButtonBookingReport.style.display = "none";
    // Reset KPI cards to zero if no data
    updateKpiCards([]);
  }

  // Initialize DataTable with premium options (ALWAYS)
  const table = $("#bookingReportTable").DataTable({
    dom: "rtip", // Hide default search and length
    searching: true, // Keeping search active for the custom input
    lengthChange: false, // Disabling default length menu
    pageLength: 10,
    autoWidth: false,
    language: {
      emptyTable: "No data found for the selected range",
    },
    layout: {
      topStart: null,
      topEnd: null,
      bottomStart: "info",
      bottomEnd: "paging",
    },
    createdRow: function (row, data, dataIndex) {
      $(row).find("td").css({
        "text-align": "left",
        height: "80px",
        padding: "20px 24px",
      });
      // Right align the last column (Meter Reading)
      $(row).find("td:last-child").css("text-align", "right");
    },
    headerCallback: function (thead, data, start, end, display) {
      $(thead).find("th").css({
        "text-align": "left",
        padding: "20px 24px",
        "font-weight": "800",
      });
      // Right align the last header
      $(thead).find("th:last-child").css("text-align", "right");
    },
  });

  // Custom Search
  $("#tableSearch")
    .off("keyup")
    .on("keyup", function () {
      table.search(this.value).draw();
    });

  // Custom Length
  $("#tableLength")
    .off("change")
    .on("change", function () {
      table.page.len(this.value).draw();
    });
};

const formatBookingDate = (date) => {
  let d = new Date(date), month = '' + (d.getMonth() + 1), day = '' + d.getDate(), year = d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('-');
};

const applyBookingRangeSelection = (range) => {
  const targetCollapse = document.getElementById('customRangeCollapse');
  const textStarDate = document.getElementById('textStarDate');
  const textEndDate = document.getElementById('textEndDate');

  if (range === 'custom') {
    if (typeof bootstrap !== 'undefined' && targetCollapse) {
      let bsCollapse = bootstrap.Collapse.getInstance(targetCollapse);
      if (!bsCollapse) bsCollapse = new bootstrap.Collapse(targetCollapse, { toggle: false });
      bsCollapse.show();
    } else {
      $('#customRangeCollapse').collapse('show');
    }
    if (textStarDate) textStarDate.value = '';
    if (textEndDate) textEndDate.value = '';
    return;
  }

  if (typeof bootstrap !== 'undefined' && targetCollapse) {
    let bsCollapse = bootstrap.Collapse.getInstance(targetCollapse);
    if (!bsCollapse) bsCollapse = new bootstrap.Collapse(targetCollapse, { toggle: false });
    bsCollapse.hide();
  } else {
    $('#customRangeCollapse').collapse('hide');
  }

  const today = new Date();
  let start, end;

  switch (range) {
    case 'this_month':
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = today;
      break;
    case 'last_month':
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    case 'last_3_months':
      start = new Date(today.getFullYear(), today.getMonth() - 3, 1);
      end = today;
      break;
    case 'last_6_months':
      start = new Date(today.getFullYear(), today.getMonth() - 6, 1);
      end = today;
      break;
    case 'this_year':
      start = new Date(today.getFullYear(), 0, 1);
      end = today;
      break;
    default:
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = today;
      range = 'this_month';
      break;
  }

  if (textStarDate && textEndDate) {
    textStarDate.value = formatBookingDate(start);
    textEndDate.value = formatBookingDate(end);
  }

  bookingPerfomanceChart(range);
  loadBookingReportTable();
};

// month select change handler (replaces tab UI)
const monthSelect = document.getElementById('monthSelect');
if (monthSelect) {
  monthSelect.addEventListener('change', (e) => {
    applyBookingRangeSelection(e.target.value);
  });
}

// overall performance chart eka generate karana function eka
let perfomanceChartInstance = null; // Store instance to destroy before redraw

const bookingPerfomanceChart = (dateType) => {
  let dataList = getServiceRequest("/report/chartdata?dateType=" + dateType);

  let labelList = new Array();
  let travelTimeList = new Array();
  let idleTimeList = new Array();
  console.log(dataList);

  for (const index in dataList) {
    labelList.push(dataList[index][0]); // date string
    travelTimeList.push(parseInt(dataList[index][1])); // scheduled / travel time
    idleTimeList.push(parseInt(dataList[index][2])); // actual / idle time
  }

  console.log(labelList);
  console.log(travelTimeList);
  console.log(idleTimeList);

  const ctx = document.getElementById("bookingPerfomanceChart").getContext("2d");

  // Destroy existing chart if it exists
  if (perfomanceChartInstance) {
    perfomanceChartInstance.destroy();
  }


  perfomanceChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labelList,
      datasets: [
        {
          label: "Travel Time (min)",
          data: travelTimeList,
          backgroundColor: "#7c3aed",
          borderRadius: 6,
          barPercentage: 0.7,
          categoryPercentage: 0.8,
        },
        {
          label: "Scheduled Time (min)",
          data: idleTimeList,
          backgroundColor: "#f43f5e",
          borderRadius: 6,
          barPercentage: 0.7,
          categoryPercentage: 0.8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              family: "'Inter', sans-serif",
              size: 13,
              weight: "600",
            },
            color: "#64748b",
          },
        },
        tooltip: {
          backgroundColor: "#1e293b",
          padding: 12,
          titleFont: { size: 14, weight: "700" },
          bodyFont: { size: 13 },
          cornerRadius: 8,
          displayColors: true,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: "#94a3b8",
            font: { size: 12 },
          },
        },
        y: {
          border: { dash: [4, 4] },
          grid: { color: "#f1f5f9" },
          ticks: {
            color: "#94a3b8",
            font: { size: 12 },
            stepSize: 50,
          },
        },
      },
    },
  });
};

// Formatting Functions for Premium Table
const getBookingInfo = (dataOb) => {
  return `
    <div class="booking-info-cell">
      <span class="booking-id">${dataOb.booking_no}</span>
    </div>
  `;
};

const getSheduleTime = (dataOb) => {
 const formatDateTime = (dt) => {
  if (!dt) return "N/A";

  let date = new Date(dt);

  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

  return `
    <div class="timestamp-container">
      <div class="timestamp-item">
        <span class="ts-label">SCHEDULED PICKUP</span>
        <span class="ts-value">${formatDateTime(dataOb.pickup_date_time)}</span>
      </div>
      <div class="timestamp-item">
        <span class="ts-label">SCHEDULED DELIVERY</span>
        <span class="ts-value">${formatDateTime(dataOb.delivery_date_time)}</span>
      </div>
    </div>
  `;
};

const getActualTime = (dataOb) => {
 const formatDateTime = (dt) => {
  if (!dt) return "N/A";

  let date = new Date(dt);

  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

  return `
    <div class="timestamp-container">
      <div class="timestamp-item">
        <span class="ts-label">ARRIVED PICKUP</span>
        <span class="ts-value">${formatDateTime(dataOb.arrived_at_pickup_datetime)}</span>
      </div>
      <div class="timestamp-item">
        <span class="ts-label">DEPARTED DELIVERY</span>
        <span class="ts-value">${formatDateTime(dataOb.departed_from_delivery_datetime)}</span>
      </div>
    </div>
  `;
};

const getDelayReasons = (dataOb) => {
  // Helper to determine reason text based on data availability
  const getReasonText = (reasonObj, timestamp) => {
    if (reasonObj && reasonObj.delay_reasons) return reasonObj.delay_reasons;
    return timestamp ? "On-Time" : "N/A";
  };

  const pickupDelay = getReasonText(dataOb.pickup_delay_reason_id, dataOb.arrived_at_pickup_datetime);
  const deliveryDelay = getReasonText(dataOb.delivery_delay_reasons_id, dataOb.departed_from_delivery_datetime);

  const getBadgeClass = (reason) => {
    if (reason === "On-Time") return "on-time";
    if (reason === "N/A") return "caution";
    return "delayed";
  };

  return `
    <div class="delays-cell">
      <div class="delay-badge ${getBadgeClass(pickupDelay)}">
        <span class="delay-type">P:</span> ${pickupDelay}
      </div>
      <div class="delay-badge ${getBadgeClass(deliveryDelay)}">
        <span class="delay-type">D:</span> ${deliveryDelay}
      </div>
    </div>
  `;
};

const getMeterReading = (dataOb) => {
  return `
    <div class="meter-cell">
      <span class="meter-range">${dataOb.strat_meter_reading || "0.0"} - ${dataOb.end_meter_reading || "0.0"}</span>
      <span class="add-km">Add. KM: <span>${dataOb.additional_km || "0.0"}</span></span>
    </div>
  `;
};



let totalAvailableDrivers = 0;
let totalAvailableVehicles = 0;

//refersh input types and clear the table
const refresh = () => {
  // Fetch total counts for KPI targets
  const driverRes = getServiceRequest("/report/countofactivedrivers");
  const vehicleRes = getServiceRequest("/report/countofallvehicles");
  totalAvailableDrivers = driverRes || 0;
  totalAvailableVehicles = vehicleRes || 0;
  
  // Load the default selected range directly for smoother initial render
  const monthSelectEl = document.getElementById('monthSelect');
  applyBookingRangeSelection(monthSelectEl && monthSelectEl.value ? monthSelectEl.value : 'this_month');
  printButtonBookingReport.style.display = "none";
};

// KPIs update logic based on data list
const updateKpiCards = (dataList) => {
  const total = dataList.length;

  // status walata anuwa count eka gnnawa
  const completed = dataList.filter(
    (b) => b.booking_status_id.status === "Settled" || b.booking_status_id.status === "Departed From Delivery" || b.booking_status_id.status === "Operation Confirmed",
  ).length;

  const cancelled = dataList.filter((b) => b.booking_status_id.status === "Cancelled").length;
  const pending = total - completed - cancelled;

  // Percentages calculate karala gannawa
  const completedPct = total > 0 ? ((completed / total) * 100).toFixed(1) : "0.0";
  const cancelledPct = total > 0 ? ((cancelled / total) * 100).toFixed(1) : "0.0";
  const pendingPct = total > 0 ? ((pending / total) * 100).toFixed(1) : "0.0";


  // card tika update karanwa
  document.getElementById("activeAllBookings").innerText = total.toLocaleString();
  document.getElementById("totalCompletedBookings").innerText = completed.toLocaleString();
  document.getElementById("currentDateBookings").innerText = cancelled.toLocaleString();
  document.getElementById("totalActiveVehicles").innerText = pending.toLocaleString();


  // precenatge tika update karanwa
  document.getElementById("completedPercentage").innerText = completedPct + "%";
  document.getElementById("cancelledPercentage").innerText = cancelledPct + "%";
  document.getElementById("pendingPercentage").innerText = pendingPct + "%";
  

  // Update Progress Bars
  const pendingProgress = document.getElementById("pendingProgress");
  const cancelledProgress = document.getElementById("cancelledProgress");
  if (pendingProgress) pendingProgress.style.width = pendingPct + "%";
  if (cancelledProgress) cancelledProgress.style.width = cancelledPct + "%";

  // Dynamic trend placeholder for Total Bookings
  document.getElementById("totalBookingsTrend").innerText = total > 0 ? "+12%" : "+0%";
};


// print view eka
const printBookingReport = () => {

  const canvas = document.getElementById("bookingPerfomanceChart");
  const chartImage =(canvas ? canvas.toDataURL("image/png") : "");

  printReport({
    title: "Booking Perfomance Report",
    subtitle: "Operational efficiency and booking lifecycle analytics.",
    charts: [
      {
        title: "Booking Performance",
        image: chartImage
      }
    ],
      tableTitle: "Booking Details",
      tableid: document.getElementById("bookingReportTable")
  });

};