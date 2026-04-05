window.addEventListener("load", function () {
  refresh();
});

const loadBookingReportTable = () => {
  const textStarDate = document.getElementById("textStarDate");
  const textEndDate = document.getElementById("textEndDate");

  if ($.fn.dataTable.isDataTable("#bookingReportTable")) {
    $("#bookingReportTable").DataTable().clear().destroy();
  }

  let bookingReportTableData = getServiceRequest("/reportbooking/bydaterangeandtype?startdate=" + textStarDate.value + "&endtdate=" + textEndDate.value);

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
      { propertyName: getLocations, dataType: "function" },
      { propertyName: getTimestamps, dataType: "function" },
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

// date filtering logic eka thama meka.meke karanne maseta adal data tik auto fill karanawa custome date range eken eeta asse ka auto api eken call wela data dispaly karanwa table eke
$(document).ready(function () {
  $("#filterTabs .nav-link").on("click", function (e) {
    const range = $(this).data("range");
    const targetCollapse = document.getElementById("customRangeCollapse");
    const textStarDate = document.getElementById("textStarDate");
    const textEndDate = document.getElementById("textEndDate");

    // Handle Active State for Tabs
    $("#filterTabs .nav-link").removeClass("active");
    $(this).addClass("active");

    if (range === "custom") {
      // custome date range ea select karaddi ekata value eka assign wela thiyena nam ayin wenna oni
      textStarDate.value = "";
      textEndDate.value = "";
      return;
    }

    // If not custom, close the collapse section
    if (typeof bootstrap !== "undefined" && targetCollapse) {
      let bsCollapse = bootstrap.Collapse.getInstance(targetCollapse);
      if (!bsCollapse) bsCollapse = new bootstrap.Collapse(targetCollapse, { toggle: false });
      bsCollapse.hide();
    } else {
      $("#customRangeCollapse").collapse("hide");
    }

    // Calculate Dates based ekata
    const today = new Date();
    let start, end;

    switch (range) {
      case "this_month":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = today;
        bookingPerfomanceChart("this_month");
        break;
      case "last_month":
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        bookingPerfomanceChart("last_month");
        break;
      case "last_3_months":
        start = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        end = today;
        bookingPerfomanceChart("last_3_months");
        break;
      case "last_6_months":
        start = new Date(today.getFullYear(), today.getMonth() - 6, 1);
        end = today;
        bookingPerfomanceChart("last_6_months");
        break;
      case "this_year":
        start = new Date(today.getFullYear(), 0, 1);
        end = today;
        bookingPerfomanceChart("this_year");
        break;
    }

    // Format to YYYY-MM-DD for input type="date"
    const formatDate = (date) => {
      let d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;
      return [year, month, day].join("-");
    };

    if (start && end) {
      textStarDate.value = formatDate(start);
      textEndDate.value = formatDate(end);
    }

    // Load the report for the calculated range
    loadBookingReportTable();
  });
});

// overall performance chart eka generate karana function eka
let perfomanceChartInstance = null; // Store instance to destroy before redraw

const bookingPerfomanceChart = (dateType) => {
  let dataList = getServiceRequest("/reportbooking/chartdata?dateType=" + dateType);

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
      <span class="customer-id">${dataOb.customer_id.company_name}</span>
      <span class="customer-id text-muted" style="font-size: 0.75rem;">ID: #${dataOb.customer_id.customer_reg_no || dataOb.customer_id.id}</span>
    </div>
  `;
};

const getLocations = (dataOb) => {
  let viaHtml = "";
  if (dataOb.locations && dataOb.locations.length > 0) {
    viaHtml = `<div class="via-locations text-muted small mt-1 ms-4">
      <i class="fa-solid fa-arrow-right-long me-1" style="font-size: 0.7rem;"></i> 
      Via: ${Array.from(dataOb.locations)
        .map((l) => l.name)
        .join(", ")}
    </div>`;
  }

  return `
    <div class="locations-cell">
      <div class="location-item"><i class="fa-solid fa-location-dot pickup-icon"></i> ${dataOb.pickup_locations_id.name}</div>
      ${viaHtml}
      <div class="location-item"><i class="fa-solid fa-flag delivery-icon"></i> ${dataOb.delivery_locations_id.name}</div>
      <div class="distance-badge">${dataOb.distance} KM</div>
    </div>
  `;
};

const getTimestamps = (dataOb) => {
  const formatTime = (dt) => {
    if (!dt) return "N/A";
    let date = new Date(dt);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  return `
    <div class="timestamp-container">
      <div class="timestamp-item">
        <span class="ts-label">ARRIVED PICKUP</span>
        <span class="ts-value">${formatTime(dataOb.arrived_at_pickup_datetime)}</span>
      </div>
      <div class="timestamp-item">
        <span class="ts-label">DEPARTED DELIVERY</span>
        <span class="ts-value">${formatTime(dataOb.departed_from_delivery_datetime)}</span>
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

// print view eka
const printBookingReport = () => {
  let newWindow = window.open();
  let preview =
    "<html><head><title>Booking Report - TMS</title>" +
    "<link rel='stylesheet' href='/css/report.css'>" +
    "<link rel='stylesheet' href='/css/common.css'>" +
    "<link rel='stylesheet' href='/bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'>" +
    "<link rel='stylesheet' href='/fontawesome/css/all.min.css'>" +
    "<style>body { padding: 40px; background: white; } .report-table-container { box-shadow: none; border: 1px solid #eee; }</style>" +
    "</head><body>" +
    "<div class='report-table-container'>" +
    bookingReportTable.outerHTML +
    "</div></body></html>";

  newWindow.document.write(preview);

  setTimeout(() => {
    newWindow.stop();
    newWindow.print();
    newWindow.close();
  }, 500);
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

  // Trigger the "This month" filter by default
  $("#filterTabs .nav-link:first").trigger("click");
  printButtonBookingReport.style.display = "none";
};

// KPIs update logic based on data list
const updateKpiCards = (dataList) => {
  const total = dataList.length;

  // Status Counts
  const completed = dataList.filter(
    (b) => b.booking_status_id.status === "Arrived At Delivery" || b.booking_status_id.status === "Departed From Delivery" || b.booking_status_id.status === "Confirmed",
  ).length;

  const cancelled = dataList.filter((b) => b.booking_status_id.status === "Cancelled").length;
  const pending = total - completed - cancelled;

  // Additional Metrics
  const totalDistance = dataList.reduce((sum, b) => sum + (parseFloat(b.distance) || 0), 0);

  // Unique Drivers and Vehicles from current bookings
  const driversUsed = new Set(dataList.map((b) => (b.driver_id ? b.driver_id.id : null)).filter((id) => id !== null)).size;
  const vehiclesUsed = new Set(dataList.map((b) => (b.vehicle_id ? b.vehicle_id.id : null)).filter((id) => id !== null)).size;

  // Percentages
  const completedPct = total > 0 ? ((completed / total) * 100).toFixed(1) : "0.0";
  const cancelledPct = total > 0 ? ((cancelled / total) * 100).toFixed(1) : "0.0";
  const pendingPct = total > 0 ? ((pending / total) * 100).toFixed(1) : "0.0";

  // Use real counts fetched during refresh()
  const totalDrivers = totalAvailableDrivers;
  const totalVehicles = totalAvailableVehicles;

  // Update Main Values Directly (Removed Animation)
  document.getElementById("activeAllBookings").innerText = total.toLocaleString();
  document.getElementById("totalCompletedBookings").innerText = completed.toLocaleString();
  document.getElementById("currentDateBookings").innerText = cancelled.toLocaleString();
  document.getElementById("totalActiveVehicles").innerText = pending.toLocaleString();
  document.getElementById("assignedDrivers").innerText = driversUsed.toLocaleString();
  document.getElementById("usedVehicles").innerText = vehiclesUsed.toLocaleString();
  document.getElementById("totalDistance").innerText = totalDistance.toFixed(1);

  // Update Secondary Indicators
  document.getElementById("completedPercentage").innerText = completedPct + "%";
  document.getElementById("cancelledPercentage").innerText = cancelledPct + "%";
  document.getElementById("pendingPercentage").innerText = pendingPct + "%";
  document.getElementById("driversTarget").innerText = "of " + totalDrivers;
  document.getElementById("vehiclesTarget").innerText = "of " + totalVehicles;

  // Update Progress Bars
  const pendingProgress = document.getElementById("pendingProgress");
  const cancelledProgress = document.getElementById("cancelledProgress");
  if (pendingProgress) pendingProgress.style.width = pendingPct + "%";
  if (cancelledProgress) cancelledProgress.style.width = cancelledPct + "%";

  // Dynamic trend placeholder for Total Bookings
  document.getElementById("totalBookingsTrend").innerText = total > 0 ? "+12%" : "+0%";
};
