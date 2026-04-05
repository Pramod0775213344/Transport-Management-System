window.addEventListener("load", () => {
  loadPendingBookingTable();
  bookingDistributionPieChart();
  pendingBookingBarChart();
});

const loadPendingBookingTable = () => {
  if ($.fn.dataTable.isDataTable("#pendingBookingReportTable")) {
    $("#pendingBookingReportTable").DataTable().clear().destroy();
  }

  pendingBookingList = getServiceRequest("/report/allpendingbookings");

  // Fill data if exists
  if (pendingBookingList.length > 0) {
    let propertyList = [
      { propertyName: getBookingInfo, dataType: "function" },
      { propertyName: getLocations, dataType: "function" },
      { propertyName: getVehicleInfo, dataType: "function" },
      { propertyName: getDriverInfo, dataType: "function" },
      { propertyName: getStatus, dataType: "function" },
    ];

    dataFillIntoTheReportTable(pendingBookingReportTableBody, pendingBookingList, propertyList);
    printButtonBookingReport.style.display = "";
  } else {
    pendingBookingReportTableBody.innerHTML = "";
    printButtonBookingReport.style.display = "none";
  }

  // Initialize DataTable with premium options
  const table = $("#pendingBookingReportTable").DataTable({
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
  const formatTime = (dt) => {
    if (!dt) return "N/A";
    let date = new Date(dt);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  return `
      <div class="locations-cell">
        <div class="location-item">
            <i class="fa-solid fa-location-dot pickup-icon"></i> 
            <span>${dataOb.pickup_locations_id.name}</span>
            <small class="text-muted ms-2">at ${formatTime(dataOb.pickup_date_time)}</small>
        </div>
        <div class="location-item mt-2">
            <i class="fa-solid fa-flag delivery-icon"></i> 
            <span>${dataOb.delivery_locations_id.name}</span>
            <small class="text-muted ms-2">at ${formatTime(dataOb.delivery_date_time)}</small>
        </div>
      </div>
    `;
};

const getVehicleInfo = (dataOb) => {
  if (dataOb.vehicle_id == null) {
    return `<div class ='status-badge status-inactive'>Unassigned</div>`;
  } else {
    return `
      <div class="booking-info-cell">
        <span class="booking-id">${dataOb.vehicle_id.vehicle_no}</span>
        <span class="customer-id">${dataOb.vehicle_type_id.name}</span>
      </div>
    `;
  }
};

const getDriverInfo = (dataOb) => {
  if (dataOb.driver_id == null) {
    return `<div class ='status-badge status-inactive'>Unassigned</div>`;
  } else {
    return `
      <div class="booking-info-cell">
        <span class="booking-id">${dataOb.driver_id.callingname}</span>
        <span class="customer-id">${dataOb.driver_id.mobileno}</span>
      </div>
    `;
  }
};

// get booking status with color
const getStatus = (dataOb) => {
  const status = dataOb.booking_status_id.status;
  let statusClass = "status-badge status-inactive";

  if (status === "Attend") {
    statusClass = "status-badge status-attend";
  } else if (status === "Arrived At Pickup" || status === "Departed From Pickup") {
    statusClass = "status-badge status-pending";
  } else if (
    status === "Arrived At Delivery" ||
    status === "Departed From Delivery"
  ) {
    statusClass = "status-badge status-active";
  } else if (status === "Cancelled") {
    statusClass = "status-badge status-cancelled";
  } else if (status === "Inproccess" || status === "Inprocess") {
    statusClass = "status-badge status-inactive";
  }

  return `<div class="${statusClass}">
            <span>${status}</span>
          </div>`;
};

// print view eka
const printBookingReport = () => {
  let newWindow = window.open();
  let preview =
    "<html><head><title>Pending Booking Report - TMS</title>" +
    "<link rel='stylesheet' href='/css/report.css'>" +
    "<link rel='stylesheet' href='/css/common.css'>" +
    "<link rel='stylesheet' href='/bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'>" +
    "<link rel='stylesheet' href='/fontawesome/css/all.min.css'>" +
    "<style>body { padding: 40px; background: white; } .report-table-container { box-shadow: none; border: 1px solid #eee; }</style>" +
    "</head><body>" +
    "<div class ='mb-4' ><h4 class='text-center mb-1 fw-bold' style='color: #1e293b;'>Pending Booking Report</h4><p class='text-center text-muted small mb-0'>List of shipment bookings awaiting confirmation or further action.</p></div>" +
    "<div class='report-table-container'>" +
    pendingBookingReportTable.outerHTML +
    "</div></body></html>";

  newWindow.document.write(preview);

  setTimeout(() => {
    newWindow.stop();
    newWindow.print();
    newWindow.close();
  }, 500);
};

//refersh input types and clear the table
const refresh = () => {
  loadPendingBookingTable();
};

// ------------------------chart tika-----------------------

// pending booking show karana bar chart eka vehicle type wise
const pendingBookingBarChart = () => {
  let dataList = getServiceRequest("/report/allpendingbookingsWithVechicletype");

  let labelList = new Array();
  let count = new Array();

  for (const index in dataList) {
    labelList.push(dataList[index][0]);
    count.push(parseInt(dataList[index][1]));
  }
  const ctx = document.getElementById("pendingBookingBarChart").getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labelList,
      datasets: [
        {
          data: count,
          backgroundColor: [
            "#7c3aed", // Violet
            "#0ea5e9", // Sky Blue
            "#10b981", // Emerald
            "#f59e0b", // Amber
            "#f43f5e", // Rose
            "#6366f1", // Indigo
          ],
          borderRadius: 6,
          barThickness: 42,
          borderWidth: 0,
        },
      ],
    },
    options: {
      indexAxis: "y", // Horizontal Layout
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
          displayColors: true,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            color: "#f1f5f9",
            drawBorder: false,
          },
          ticks: {
            color: "#94a3b8",
            font: { family: "'Inter', sans-serif", size: 11 },
          },
          border: { display: false },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: "#64748b",
            font: { family: "'Inter', sans-serif", size: 12, weight: "600" },
          },
          border: { display: false },
        },
      },
      layout: {
        padding: { left: 10, right: 30, top: 10, bottom: 10 },
      },
    },
  });
};

// time perod ekakata adalawa bookin count eka show karanw bar chart eka
const timeBaseHorzontalBarChart = () => {
  const ctx = document.getElementById("timeBaseHorzontalBarChart").getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["<30m", "30m-1h", "1h-4h", "4h+"],
      datasets: [
        {
          data: [45, 32, 35, 12], // Dummy Data
          backgroundColor: [
            "#10b981", // Green
            "#3b82f6", // Blue
            "#f59e0b", // Orange
            "#ef4444", // Red
          ],
          barThickness: 12,
          borderRadius: 20,
        },
      ],
    },
    options: {
      indexAxis: "y", // Horizontal Layout
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // Legend එක අයින් කිරීම
        },
        tooltip: {
          enabled: true,
        },
      },
      scales: {
        x: {
          display: false, // යට තියෙන numbers අයින් කිරීම
          grid: { display: false },
        },
        y: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: "#64748b",
            font: {
              size: 13,
              weight: "500",
            },
          },
        },
      },
    },
  });
};

// assigning karala thiyena saha pending assigning show karana pie chart eka
const bookingDistributionPieChart = () => {
  let count = new Array();
  let assignedCount = pendingBookingList.filter((b) => b.vehicle_id !== null).length;
  let pendingCount = pendingBookingList.filter((b) => b.vehicle_id === null).length;
  count.push(assignedCount);
  count.push(pendingCount);

  const ctx = document.getElementById("bookingDistributionPieChart").getContext("2d");
  const dataLabels = ["Assigned", "Pending"];
  const total = count.reduce((a, b) => a + b, 0);

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: dataLabels,
      datasets: [
        {
          data: count,
          backgroundColor: [
            "#7c3aed", // Violet (Assigned)
            "#f1f5f9", // Light Gray (Pending)
          ],
          borderWidth: 2,
          borderColor: "#ffffff",
          hoverOffset: 10,
        },
      ],
    },
    options: {
      cutout: "80%",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          titleColor: "#1e293b",
          bodyColor: "#64748b",
          borderColor: "#e2e8f0",
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
        },
      },
    },
    plugins: [
      {
        id: "centerText",
        afterDraw: function (chart) {
          const { width, height, ctx } = chart;
          ctx.restore();

          // Draw Total Number
          ctx.font = "bold 2.5rem 'Inter', sans-serif";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#1e293b";
          const textTotal = total.toString();
          const textTotalX = Math.round((width - ctx.measureText(textTotal).width) / 2);
          ctx.fillText(textTotal, textTotalX, height / 2 - 10);

          // Draw "TOTAL" label
          ctx.font = "600 0.75rem 'Inter', sans-serif";
          ctx.fillStyle = "#94a3b8";
          const textLabel = "TOTAL BOOKINGS";
          const textLabelX = Math.round((width - ctx.measureText(textLabel).width) / 2);
          ctx.fillText(textLabel, textLabelX, height / 2 + 25);

          ctx.save();
        },
      },
    ],
  });

  // Generate Custom Legend
  const legendContainer = document.getElementById("chartLegend");
  legendContainer.innerHTML = "";
  legendContainer.style.cssText = "display: flex; justify-content: center; gap: 32px; margin-top: 24px; padding: 0;";

  const colors = ["#7c3aed", "#94a3b8"];

  dataLabels.forEach((label, index) => {
    const percentage = total > 0 ? ((count[index] / total) * 100).toFixed(0) : 0;
    const legendItem = document.createElement("div");
    legendItem.style.cssText = "display: flex; align-items: center; gap: 12px;";

    legendItem.innerHTML = `
            <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${colors[index]};"></div>
            <div style="display: flex; flex-direction: column;">
                <div style="display: flex; align-items: baseline; gap: 6px;">
                    <span style="font-size: 1.125rem; font-weight: 700; color: #1e293b;">${count[index]}</span>
                    <span style="font-size: 0.75rem; font-weight: 600; color: #94a3b8;">${percentage}%</span>
                </div>
                <span style="font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.025em;">${label}</span>
            </div>
        `;
    legendContainer.appendChild(legendItem);
  });
};
