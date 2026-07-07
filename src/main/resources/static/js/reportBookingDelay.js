// Global instances
let overallDailyPerformanceChart = null;
let weeklyDelayTrendChartPattern = null;

// delay booking chart eka generate karana function eka
const delayBookingTrendChartFunction = () => {
  // me function eka load karaddi chart ekak create wela thiyenw nam eka destroy karanna oni.
  if (weeklyDelayTrendChartPattern) {
    weeklyDelayTrendChartPattern.destroy();
    weeklyDelayTrendChartPattern = null;
  }

  let datalist = getServiceRequest("/report/delaybookingthisweek");
  let reportDatalist = new Array();
  let data = new Array();
  let label = new Array();
  for (const index in datalist) {
    let object = new Object();
    object.day = datalist[index][0];
    object.total_bookings = datalist[index][1];
    object.delay_delivery = datalist[index][2];
    object.delay_percentage = datalist[index][3] + "%";
    object.ontime_delivery = datalist[index][4];
    reportDatalist.push(object);

    label.push(datalist[index][0]);
    data.push(datalist[index][2]);
  }

  const propertyList = [
    { propertyName: "day", dataType: "string" },
    {
      propertyName: "total_bookings",
      dataType: "string",
    },
    { propertyName: "delay_delivery", dataType: "string" },
    {
      propertyName: "delay_percentage",
      dataType: "string",
    },
    { propertyName: "ontime_delivery", dataType: "string" },
  ];

  // table generate
  dataFillIntoTheReportTable(document.getElementById("weeklyBookingTrendTableBody"), reportDatalist, propertyList);

  // chart generate
  const canvasElem = document.getElementById("weeklyDelayTrendChart");
  const ctx = canvasElem.getContext("2d");

  // Create gradient
  let gradient = ctx.createLinearGradient(0, 0, 0, 350);
  gradient.addColorStop(0, "rgba(124, 58, 237, 0.3)"); // Premium Violet with opacity
  gradient.addColorStop(1, "rgba(124, 58, 237, 0.0)");

  weeklyDelayTrendChartPattern = new Chart(canvasElem, {
    type: "line",
    data: {
      labels: label,
      datasets: [
        {
          label: "Delayed Deliveries",
          data: data,
          backgroundColor: gradient,
          borderColor: "#7c3aed",
          borderWidth: 3,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#7c3aed",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4, // Smooth curve
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "#1e293b",
          padding: 12,
          titleFont: { family: "'Inter', sans-serif", size: 14 },
          bodyFont: { family: "'Inter', sans-serif", size: 13 },
          cornerRadius: 8,
          displayColors: false,
        },
      },
      scales: {
        x: {
          grid: {
            display: true,
            drawBorder: false,
            color: "#f1f5f9",
            drawOnChartArea: true,
            borderDash: [5, 5],
          },
          ticks: {
            color: "#64748b",
            font: { family: "'Inter', sans-serif", size: 12 },
            padding: 10,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            color: "#f1f5f9",
            drawBorder: false,
            borderDash: [5, 5],
          },
          ticks: {
            color: "#94a3b8",
            font: { family: "'Inter', sans-serif", size: 12 },
            stepSize: 5,
            padding: 10,
          },
        },
      },
    },
  });

  return weeklyDelayTrendChartPattern;
};


// Delay Reason Pie Chart eka generate karanna
let delayReasonPieChart = null;
const delayReasonPieChartFunction = () => {
  const chartElement = document.getElementById("delayReasonPieChart");
  if (!chartElement) return;

  if (delayReasonPieChart) {
    delayReasonPieChart.destroy();
  }

  const dataList = getServiceRequest("/report/delayprecenategbyreason");
  const labels = [];
  const data = [];
  for (const index in dataList) {
    reason = dataList[index][0];
    percentage = dataList[index][2] + "%";
    total = dataList[index][1];

    const reasonView = reason ;

    labels.push(reasonView);
    data.push(total);
  }
  const ctx = chartElement.getContext("2d");

  // System-matched report palette (aligned with other dashboard/report charts)
  const colors = [
    "#7c3aed", // Primary Violet
    "#f43f5e", // Rose
    "#10b981", // Emerald
    "#f97316", // Orange
    "#0ea5e9", // Sky Blue
    "#8b5cf6", // Secondary Violet
    "#14b8a6", // Teal
    "#eab308", // Amber
  ];

  delayReasonPieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          // Use modulo so colors repeat cleanly if reason count exceeds palette length
          backgroundColor: labels.map((_, index) => colors[index % colors.length]),
          borderWidth: 2,
          borderColor: "#ffffff",
          hoverOffset: 15,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            padding: 30, // Increased padding
            font: {
              family: "'Inter', sans-serif",
              size: 12, // Slightly reduced font size to fit more text
              weight: "500",
            },
            color: "#64748b",
          },
        },
        tooltip: {
          backgroundColor: "#1e293b",
          padding: 12,
          cornerRadius: 8,
          bodyFont: { family: "'Inter', sans-serif", size: 14 },
          callbacks: {
            label: function (context) {
              return ` ${context.label}`;
            },
          },
        },
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 2000,
        easing: "easeOutQuart",
      },
    },
  });
};

// Ensure charts are initialized on window load
window.addEventListener("load", (event) => {
  delayBookingTrendChartFunction();
  loadDelayBookingTable();
  delayReasonPieChartFunction();
  monthlyPerformanceTrendChartFunction();
});

const loadDelayBookingTable = () => {
  // Clear existing DataTable instance if it exists to avoid re-initialization error
  if ($.fn.DataTable.isDataTable("#recentDeliveriesTable")) {
    $("#recentDeliveriesTable").DataTable().clear().destroy();
  }

  let delayBookings = getServiceRequest("/report/alldelaybookins");
  console.log(delayBookings);

  // let delayBookings = [
  //   ["BN-001", "Acme Corp", "Colombo", "Galle", "08:00", "12:00", "Express Ltd", "WP-ABC-1234", "John Doe", "08:05", "5 min", "12:15", "15 min"],
  //   ["BN-002", "Global Tech", "Gampaha", "Kandy", "09:00", "14:00", "Swift Logistics", "WP-DEF-5678", "Jane Smith", "09:30", "30 min", "14:45", "45 min"],
  //   ["BN-003", "Eco Services", "Kalutara", "Matara", "07:30", "11:30", "Prime Transport", "WP-GHI-9012", "Bob Smith", "08:45", "1.25 Hrs", "13:00", "1.5 Hrs"],
  // ];

  let reportDatalist = new Array();
  for (const index in delayBookings) {
    let object = new Object();
    object.booking_no = delayBookings[index][0];
    object.customer = delayBookings[index][1];
    object.vehicleno = delayBookings[index][2];
    object.pickup = delayBookings[index][3];
    object.destination = delayBookings[index][4];
    object.pickup_time = delayBookings[index][5];
    object.deliver_time = delayBookings[index][6];
    object.actual_pickup_time = delayBookings[index][7];
    object.actual_delivery_time = delayBookings[index][8];
    object.pickup_delay = delayBookings[index][9];
    object.delivery_delay = delayBookings[index][10];
    object.pickup_delay_reason_id = delayBookings[index][11];
    object.delivery_delay_reason_id = delayBookings[index][12];

    let isDelayed =
      (object.delay_pickup && object.delay_pickup !== "-" && parseFloat(object.delay_pickup) > 0) ||
      (object.delay_delivery && object.delay_delivery !== "-" && parseFloat(object.delay_delivery) > 0);

    if (object.actual_delivery === "-") {
      object.status = isDelayed ? "Delayed" : "In Transit";
      object.ontime = isDelayed ? "No" : "Pending";
    } else {
      object.status = "Delivered";
      object.ontime = isDelayed ? "No" : "Yes";
    }

    reportDatalist.push(object);
  }

  // columns after # to match the updated HTML headers
  let propertyList = [
    { propertyName: getBookingInfo, dataType: "function" },
    { propertyName: getRoute, dataType: "function" },
    { propertyName: getSheduleDateTime, dataType: "function" },
    { propertyName: getActualDateTime, dataType: "function" },
    { propertyName: getDelayTimePickup, dataType: "function" },
    { propertyName: getDelayPickupReason, dataType: "function" },
    { propertyName: getDelayTimePDelivery, dataType: "function" },
    { propertyName: getDelayDeliveryReason, dataType: "function" },
  ];

  const recentDeliveriesTableBody = document.getElementById("recentDeliveriesTableBody");
  dataFillIntoTheReportTable(recentDeliveriesTableBody, reportDatalist, propertyList);

  const table = $("#recentDeliveriesTable").DataTable({
    dom: "rtip", // Hide default search and length
    searching: true,
    lengthChange: false,
    pageLength: 10,
    autoWidth: false,
    language: {
      emptyTable: "No pending bookings found",
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
    },
    headerCallback: function (thead, data, start, end, display) {
      $(thead).find("th").css({
        "text-align": "left",
        padding: "20px 24px",
        "font-weight": "800",
      });
    },
  });

  // Custom Search Integration
  $("#searchDeliveries").on("keyup", function () {
    $("#recentDeliveriesTable").DataTable().search(this.value).draw();
  });
};
const getBookingInfo = (dataOb) => {
  return `
      <div class="booking-info-cell">
        <span class="booking-id">${dataOb.booking_no}</span>
      </div>
    `;
};
const getRoute = (dataOb) => {
  return `<div class="route-cell py-1">
            <div>${dataOb.pickup}</div>
            <div class="my-1 text-center"><i class="fas fa-arrow-down text-muted" style="font-size: 0.7rem;"></i></div>
            <div > ${dataOb.destination}</div>
          </div>`;
};

const getSheduleDateTime = (dataOb) => {
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
        <span class="ts-value">${formatDateTime(dataOb.pickup_time)}</span>
      </div>
      <div class="timestamp-item">
        <span class="ts-label">SCHEDULED DELIVERY</span>
        <span class="ts-value">${formatDateTime(dataOb.deliver_time)}</span>
      </div>
    </div>
  `;
};

const getActualDateTime = (dataOb) => {
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
        <span class="ts-value">${formatDateTime(dataOb.actual_pickup_time)}</span>
      </div>
      <div class="timestamp-item">
        <span class="ts-label">DEPARTED DELIVERY</span>
        <span class="ts-value">${formatDateTime(dataOb.actual_delivery_time)}</span>
      </div>
    </div>
  `;
};

const getDelayTimePickup = (dataOb) => {
  let delay = parseInt(dataOb.pickup_delay) || 0;
  if (delay === 0) return `<span class="status-badges status-low-delay">0 min</span>`;
  let badgeColor = delay > 30 ? "status-badges status-high-delay" : "status-badges status-medium-delay";
  return `<span class="badge ${badgeColor}">${delay} min</span>`;
};

const getDelayPickupReason = (dataOb) => {
  return `<span class="text-muted">${dataOb.pickup_delay_reason_id || "-"}</span>`;
};

const getDelayTimePDelivery = (dataOb) => {
  let delay = parseInt(dataOb.delivery_delay) || 0;
  if (delay === 0) return `<span class="status-badges status-low-delay">0 min</span>`;
  let badgeColor = delay > 60 ? "status-badges status-high-delay" : "status-badges status-medium-delay";
  return `<span class="badge ${badgeColor}">${delay} min</span>`;
};

const getDelayDeliveryReason = (dataOb) => {
  return `<span class="text-muted">${dataOb.delivery_delay_reason_id || "-"}</span>`;
};

// month wise intime delay time perfomance eka ganna chart eka
let monthlyTrendChartPattern = null;

const monthlyPerformanceTrendChartFunction = () => {
  const chartElement = document.getElementById("monthlyPerformanceTrendChart");
  if (!chartElement) return;

  if (monthlyTrendChartPattern) {
    monthlyTrendChartPattern.destroy();
  }

  const dataList = getServiceRequest("/report/ontimedelaypredentage");
  const months = [];
  const onTimeData = [];
  const delayedData = [];

  for (const index in dataList) {
    const object = new Object();
    monthNo = dataList[index][0];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = monthNames[monthNo - 1];
    const ontime = parseFloat(dataList[index][1]);
    const delay = parseFloat(dataList[index][2]);

    months.push(monthName);
    onTimeData.push(ontime);
    delayedData.push(delay);
  }

  const ctx = chartElement.getContext("2d");

  monthlyTrendChartPattern = new Chart(ctx, {
    type: "bar",
    data: {
      labels: months,
      datasets: [
        {
          label: "On Time",
          data: onTimeData,
          backgroundColor: "#7c3aed", // Premium Violet (TMS Primary)
          borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 4, bottomRight: 4 },
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        },
        {
          label: "Delayed",
          data: delayedData,
          backgroundColor: "#f43f5e", // Premium Rose/Red
          borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            padding: 25,
            font: { family: "'Inter', sans-serif", size: 13, weight: "600" },
            color: "#64748b",
          },
        },
        tooltip: {
          backgroundColor: "#1e293b",
          padding: 12,
          titleFont: { family: "'Inter', sans-serif", size: 14, weight: "700" },
          bodyFont: { family: "'Inter', sans-serif", size: 13 },
          cornerRadius: 8,
          callbacks: {
            label: function (context) {
              return ` ${context.dataset.label}: ${context.raw}%`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true, // Enable stacking
          grid: {
            display: false,
          },
          ticks: {
            color: "#64748b",
            font: { family: "'Inter', sans-serif", size: 12, weight: "500" },
            padding: 10,
          },
          border: { display: false },
        },
        y: {
          stacked: true, // Enable stacking
          min: 0,
          max: 100,
          grid: {
            color: "#f1f5f9",
            drawBorder: false,
            borderDash: [5, 5],
          },
          ticks: {
            color: "#94a3b8",
            stepSize: 20,
            font: { family: "'Inter', sans-serif", size: 12 },
            padding: 10,
          },
          border: { display: false },
        },
      },
    },
  });
};

// Customer Specific Delivery Performance Chart
let customerPerformanceChartPattern = null;

const customerDelayChartFunction = () => {
  if ($.fn.DataTable.isDataTable("#customerPerformanceTable")) {
    $("#customerPerformanceTable").DataTable().clear().destroy();
  }
  const chartElement = document.getElementById("customerDelayChartFunction");
  if (!chartElement) return;

  if (customerPerformanceChartPattern) {
    customerPerformanceChartPattern.destroy();
  }

  let dataList = getServiceRequest("/report/delaydetailsbycustomer");

  let repoertTableData = [];
  const customers = [];
  const onTimePercentage = [];
  const delayPercentage = [];
  const totalDeliveries = [];

  for (const index in dataList) {
    const ob = new Object();
    ob.customer = dataList[index][0];
    ob.ontimePrecenatge = parseFloat(dataList[index][1]);
    ob.delyaPrecentage = parseFloat(dataList[index][2]);
    ob.totalBookings = dataList[index][3];
    ob.pickupDelay = dataList[index][4];
    ob.deliveryDelay = dataList[index][5];

    repoertTableData.push(ob);

    customers.push(dataList[index][0]);
    onTimePercentage.push(parseFloat(dataList[index][1]));
    delayPercentage.push(parseFloat(dataList[index][2]));
    totalDeliveries.push(parseFloat(dataList[index][3]));
  }

  let propertyList = [
    { propertyName: "customer", dataType: "string" },
    {
      propertyName: "ontimePrecenatge",
      dataType: "string",
    },
    {
      propertyName: "totalBookings",
      dataType: "string",
    },
    { propertyName: getPickupDelayAvg, dataType: "function" },
    {
      propertyName: getDeliveryDelayAvg,
      dataType: "function",
    },
    {
      propertyName: getPerfomnace,
      dataType: "function",
    },
  ];

  const delayBookingReportTableBody = document.getElementById("delayBookingReportTableBody");
  dataFillIntoTheReportTable(document.getElementById("customerPerformanceTableBody"), repoertTableData, propertyList);

  const table = $("#customerPerformanceTable").DataTable({
    dom: "rtip", // Hide default search and length
    searching: true,
    lengthChange: false,
    pageLength: 10,
    autoWidth: false,
    language: {
      emptyTable: "No pending bookings found",
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
    },
    headerCallback: function (thead, data, start, end, display) {
      $(thead).find("th").css({
        "text-align": "left",
        padding: "20px 24px",
        "font-weight": "800",
      });
    },
  });

  const ctx = chartElement.getContext("2d");

  customerPerformanceChartPattern = new Chart(ctx, {
    type: "bar",
    data: {
      labels: customers,
      datasets: [
        {
          label: "On-Time Percentage",
          data: onTimePercentage,
          backgroundColor: "#6d28d9", // Premium Violet (TMS Primary)
          borderRadius: 6,
          yAxisID: "yPercentage",
          barPercentage: 0.7,
          categoryPercentage: 0.6,
        },
        {
          label: "Delay Percentage",
          data: delayPercentage,
          backgroundColor: "#f87171", // Premium Violet (TMS Primary)
          borderRadius: 6,
          yAxisID: "yPercentage",
          barPercentage: 0.7,
          categoryPercentage: 0.6,
        },
        {
          label: "Total Deliveries",
          data: totalDeliveries,
          backgroundColor: "#10b981", // Emerald/Green
          borderRadius: 6,
          yAxisID: "yCount",
          barPercentage: 0.7,
          categoryPercentage: 0.6,
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
            pointStyle: "rect",
            padding: 20,
            font: { family: "'Inter', sans-serif", size: 13, weight: "500" },
            color: "#64748b",
          },
        },
        tooltip: {
          backgroundColor: "#1e293b",
          padding: 12,
          titleFont: { family: "'Inter', sans-serif", size: 14 },
          bodyFont: { family: "'Inter', sans-serif", size: 13 },
        },
      },
      scales: {
        x: {
          grid: {
            display: false, // Cleaner X axis
          },
          ticks: {
            color: "#64748b",
            font: { family: "'Inter', sans-serif", size: 12 },
          },
        },
        yPercentage: {
          type: "linear",
          position: "left",
          min: 0,
          max: 100,
          grid: {
            color: "#f1f5f9",
            borderDash: [5, 5],
            drawBorder: false,
          },
          title: {
            display: true,
            text: "Percentage (%)",
            color: "#64748b",
            font: { family: "'Inter', sans-serif", size: 12, weight: "600" },
          },
          ticks: {
            color: "#94a3b8",
            stepSize: 25,
          },
        },
        yCount: {
          type: "linear",
          position: "right",
          min: 0,
          max: 600,
          grid: {
            drawOnChartArea: false, // Only show grid lines for the left axis
          },
          title: {
            display: true,
            text: "Total Count",
            color: "#64748b",
            font: { family: "'Inter', sans-serif", size: 12, weight: "600" },
          },
          ticks: {
            color: "#94a3b8",
            stepSize: 150,
          },
        },
      },
    },
  });
};

const getPickupDelayAvg = (ob) => {
  if (ob.pickupDelay == null) {
    return "-";
  } else {
    const days = (parseInt(ob.pickupDelay) / 60 / 24).toFixed(2);

    return days + " days";
  }
};
const getDeliveryDelayAvg = (ob) => {
  if (ob.deliveryDelay == null) {
    return "-";
  } else {
    const days = (parseInt(ob.deliveryDelay) / 60 / 24).toFixed(2);
    return days + " days";
  }
};
const getPerfomnace = (ob) => {
  let perfClass = "perf-high";
  if (ob.ontimePrecenatge < 80) perfClass = "perf-low";
  else if (ob.ontimePrecenatge < 90) perfClass = "perf-med";
  return `
       <div class="performance-progress-wrapper">
                        <div class="perf-progress-container">
                            <div class="perf-progress-bar ${perfClass}" style="width: ${ob.ontimePrecenatge}%"></div>
                        </div>
                        <span class="perf-label">${ob.ontimePrecenatge}%</span>
                    </div>`;
};


window.addEventListener("load", (event) => {
  // Initializing listeners after load
  const selectWeeklyBookingDelayView = document.getElementById("selectWeeklyBookingDelayView");
  const weeklyDelayTrendChart = document.getElementById("weeklyDelayTrendChartDiv");
  const weeklyDelayTrendTable = document.getElementById("weeklyDelayTrendTableDiv");
  const selectTimePeriod = document.getElementById("selectTimePeriod");

  if (selectWeeklyBookingDelayView) {
    selectWeeklyBookingDelayView.addEventListener("change", function () {
      if (this.value === "Chart") {
        if (weeklyDelayTrendChartPattern) {
          weeklyDelayTrendChartPattern.destroy();
          weeklyDelayTrendChartPattern = null;
        }
        weeklyDelayTrendChartPattern = delayBookingTrendChartFunction();
        if (weeklyDelayTrendChart) weeklyDelayTrendChart.style.display = "block";
        if (weeklyDelayTrendTable) weeklyDelayTrendTable.style.display = "none";
      } else {
        if (weeklyDelayTrendChartPattern) {
          weeklyDelayTrendChartPattern.destroy();
          weeklyDelayTrendChartPattern = null;
        }
        if (weeklyDelayTrendChart) weeklyDelayTrendChart.style.display = "none";
        if (weeklyDelayTrendTable) weeklyDelayTrendTable.style.display = "block";
      }
    });
  }

  if (selectTimePeriod) {
    selectTimePeriod.addEventListener("change", function () {
      // This listener can be used to update the delay reason chart if needed based on time period
      delayReasonPieChartFunction();
    });
  }

  // Initial load
  delayBookingTrendChartFunction();
  loadDelayBookingTable();
  delayReasonPieChartFunction(); // Initialize the new pie chart
  monthlyPerformanceTrendChartFunction();
  customerDelayChartFunction();
});

// load karan table ekata adlawa function load karanwa

// vehicle type ta adalwa chart ekai table ekai hadana function eka
let vehiclePerformanceChartPattern = null;
const vehicleDelayChartFunction = () => {
  if ($.fn.DataTable.isDataTable("#vehiclePerformanceTable")) {
    $("#vehiclePerformanceTable").DataTable().clear().destroy();
  }
  const chartElement = document.getElementById("vehicleDelayChart");
  if (!chartElement) return;

  if (vehiclePerformanceChartPattern) {
    vehiclePerformanceChartPattern.destroy();
  }

  let dataList = getServiceRequest("/report/delaydetailsbyvehicle");

  let repoertTableData = [];
  const vehicleTypes = [];
  const onTimePercentage = [];
  const delayPercentage = [];
  const totalBookings = [];

  for (const index in dataList) {
    const ob = new Object();
    ob.vehicleType = dataList[index][0];
    ob.ontimePrecenatge = parseFloat(dataList[index][1]);
    ob.delyaPrecentage = parseFloat(dataList[index][2]);
    ob.totalBookings = dataList[index][3];
    ob.pickupDelay = dataList[index][4];
    ob.deliveryDelay = dataList[index][5];

    repoertTableData.push(ob);

    vehicleTypes.push(dataList[index][0]);
    onTimePercentage.push(parseFloat(dataList[index][1]));
    delayPercentage.push(parseFloat(dataList[index][2]));
    totalBookings.push(parseFloat(dataList[index][3]));
  }

  let propertyList = [
    { propertyName: "vehicleType", dataType: "string" },
    {
      propertyName: "ontimePrecenatge",
      dataType: "string",
    },
    {
      propertyName: "totalBookings",
      dataType: "string",
    },
    { propertyName: getPickupDelayAvg, dataType: "function" },
    {
      propertyName: getDeliveryDelayAvg,
      dataType: "function",
    },
    {
      propertyName: getPerfomnace,
      dataType: "function",
    },
  ];

  dataFillIntoTheReportTable(document.getElementById("vehiclePerformanceTableBody"), repoertTableData, propertyList);
  const table = $("#vehiclePerformanceTable").DataTable({
    dom: "rtip", // Hide default search and length
    searching: true,
    lengthChange: false,
    pageLength: 10,
    autoWidth: false,
    language: {
      emptyTable: "No pending bookings found",
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
    },
    headerCallback: function (thead, data, start, end, display) {
      $(thead).find("th").css({
        "text-align": "left",
        padding: "20px 24px",
        "font-weight": "800",
      });
    },
  });
  const ctx = chartElement.getContext("2d");

  vehiclePerformanceChartPattern = new Chart(ctx, {
    type: "bar",
    data: {
      labels: vehicleTypes,
      datasets: [
        {
          label: "On-Time %",
          data: onTimePercentage,
          backgroundColor: "#7c3aed",
          borderRadius: 6,
          yAxisID: "yPercentage",
          barPercentage: 0.7,
          categoryPercentage: 0.6,
        },
        {
          label: "Delay %",
          data: delayPercentage,
          backgroundColor: "#f97316", // Orange for delay
          borderRadius: 6,
          yAxisID: "yPercentage",
          barPercentage: 0.7,
          categoryPercentage: 0.6,
        },
        {
          label: "Total Bookings",
          data: totalBookings,
          backgroundColor: "#10b981",
          borderRadius: 6,
          yAxisID: "yCount",
          barPercentage: 0.7,
          categoryPercentage: 0.6,
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
            pointStyle: "rect",
            padding: 20,
            font: { family: "'Inter', sans-serif", size: 13, weight: "500" },
            color: "#64748b",
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#64748b", font: { family: "'Inter', sans-serif", size: 12 } },
        },
        yPercentage: {
          type: "linear",
          position: "left",
          min: 0,
          max: 100,
          grid: { color: "#f1f5f9", borderDash: [5, 5], drawBorder: false },
          title: { display: true, text: "Percentage (%)", color: "#64748b", font: { weight: "600" } },
        },
        yCount: {
          type: "linear",
          position: "right",
          grid: { drawOnChartArea: false },
          title: { display: true, text: "Total Count", color: "#64748b", font: { weight: "600" } },
        },
      },
    },
  });
};

$('button[data-bs-toggle="pill"]').on("shown.bs.tab", function (event) {
  // danata active tab eke id eka gannawa
  var tabId = $(event.target).attr("id");

  // small timeout ekak daddi chart animation wada karanawa container size eka hariyata settle unama
  setTimeout(() => {
    if (tabId === "overview-tab") {
      delayBookingTrendChartFunction();
      loadDelayBookingTable();
      delayReasonPieChartFunction();
      monthlyPerformanceTrendChartFunction();
    } else if (tabId === "customer-tab") {
      customerDelayChartFunction();
    } else if (tabId === "vehicle-tab") {
      vehicleDelayChartFunction();
    } else if (tabId === "deliveries-tab") {
      loadDelayBookingTable();
    }
  }, 100);
});

$('button[data-bs-toggle="pill"]').on("shown.bs.tab", function (event) {
  // danata active tab eke id eka gannawa
  var tabId = $(event.target).attr("id");

  // small timeout ekak daddi chart animation wada karanawa container size eka hariyata settle unama
  setTimeout(() => {
    if (tabId === "overview-tab") {
      delayBookingTrendChartFunction();
      loadDelayBookingTable();
      delayReasonPieChartFunction();
      monthlyPerformanceTrendChartFunction();
    } else if (tabId === "customer-tab") {
      customerDelayChartFunction();
    } else if (tabId === "vehicle-tab") {
      vehicleDelayChartFunction();
    } else if (tabId === "deliveries-tab") {
      loadDelayBookingTable();
    }
  }, 100);
});
