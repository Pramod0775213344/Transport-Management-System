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
      { propertyName: getCustomer, dataType: "function" },
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
      </div>
    `;
};

const getCustomer = (dataOb) => {
 return dataOb.customer_id ? dataOb.customer_id.company_name : "-";
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
  const generatedAt = new Date().toLocaleString();
  const searchValue = (document.getElementById("tableSearch")?.value || "").trim().toLowerCase();
  const barChartCanvas = document.getElementById("pendingBookingBarChart");
  const pieChartCanvas = document.getElementById("bookingDistributionPieChart");
  const barChartImage = barChartCanvas ? barChartCanvas.toDataURL("image/png") : "";
  const pieChartImage = pieChartCanvas ? pieChartCanvas.toDataURL("image/png") : "";
  const legendHtml = document.getElementById("chartLegend")?.innerHTML || "";

  const filteredBookings = (pendingBookingList || []).filter((booking) => {
    if (!searchValue) return true;

    const searchText = `${booking.booking_no || ""} ${booking.customer_id?.company_name || ""} ${booking.pickup_locations_id?.name || ""} ${booking.delivery_locations_id?.name || ""} ${booking.vehicle_id?.vehicle_no || ""} ${booking.driver_id?.callingname || ""} ${booking.booking_status_id?.status || ""}`.toLowerCase();
    return searchText.includes(searchValue);
  });

  const assignedCount = filteredBookings.filter((b) => b.vehicle_id !== null).length;
  const unassignedCount = filteredBookings.filter((b) => b.vehicle_id === null).length;

  const rowsHtml = filteredBookings
    .map((booking, index) => {
      const pickup = booking.pickup_locations_id?.name || "-";
      const delivery = booking.delivery_locations_id?.name || "-";
      const vehicle = booking.vehicle_id?.vehicle_no || "Unassigned";
      const driver = booking.driver_id?.callingname || "Unassigned";
      const status = booking.booking_status_id?.status || "-";
      const customer = booking.customer_id?.company_name || "-";

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${booking.booking_no || "-"}</td>
          <td>${customer}</td>
          <td>${pickup} -> ${delivery}</td>
          <td>${vehicle}</td>
          <td>${driver}</td>
          <td>${status}</td>
        </tr>
      `;
    })
    .join("");

  const newWindow = window.open("", "_blank");
  const preview = `
    <html>
      <head>
        <title>Pending Booking Report - TMS</title>
        <style>
          body { padding: 28px; background: white; color: #1e293b; font-family: Arial, sans-serif; }
          .report-print-header { text-align: center; margin-bottom: 16px; }
          .report-print-header h2 { margin: 0; font-size: 22px; font-weight: 700; }
          .report-print-header p { margin: 6px 0 0 0; color: #64748b; font-size: 12px; }
          .meta-row { display: flex; justify-content: center; gap: 18px; margin-top: 10px; font-size: 12px; color: #475569; }
          .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 18px 0 22px 0; }
          .chart-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; }
          .chart-card h4 { margin: 0 0 8px 0; text-align: center; font-size: 13px; text-transform: uppercase; color: #334155; }
          .chart-wrap { min-height: 220px; display: flex; justify-content: center; align-items: center; }
          .chart-wrap img { max-width: 100%; max-height: 220px; }
          .legend-wrap { margin-top: 10px; font-size: 12px; }
          .table-title { font-size: 14px; font-weight: 700; margin: 10px 0; text-transform: uppercase; color: #334155; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #e2e8f0; padding: 9px; font-size: 12px; }
          th { background: #f8fafc; color: #64748b; text-transform: uppercase; }
          td:first-child, th:first-child { text-align: center; width: 44px; }
          @media print {
            body { padding: 0; }
            .chart-card, tr { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="report-print-header">
          <h2>Pending Booking Report</h2>
          <p>Generated on: ${generatedAt}</p>
          <div class="meta-row">
            <span>Total: ${filteredBookings.length}</span>
            <span>Assigned: ${assignedCount}</span>
            <span>Unassigned: ${unassignedCount}</span>
          </div>
        </div>

        <div class="charts-grid">
          <div class="chart-card">
            <h4>Pending Bookings by Vehicle Type</h4>
            <div class="chart-wrap">${barChartImage ? `<img src="${barChartImage}" alt="Pending Booking Bar Chart"/>` : "<span>Chart unavailable</span>"}</div>
          </div>
          <div class="chart-card">
            <h4>Booking Distribution</h4>
            <div class="chart-wrap">${pieChartImage ? `<img src="${pieChartImage}" alt="Booking Distribution Chart"/>` : "<span>Chart unavailable</span>"}</div>
            <div class="legend-wrap">${legendHtml}</div>
          </div>
        </div>

        <div class="table-title">Pending Booking Details</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Booking No</th>
              <th>Customer</th>
              <th>Route</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="7" style="text-align:center;">No pending bookings found</td></tr>'}
          </tbody>
        </table>
      </body>
    </html>
  `;

  newWindow.document.write(preview);

  setTimeout(() => {
    newWindow.stop();
    newWindow.focus();
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
          label: "Pending Bookings",
          data: count,
          backgroundColor: [
            "#6d28d9", // Purple
            "#0ea5e9", // Sky Blue
            "#10b981", // Emerald
            "#f59e0b", // Amber
            "#f87171", // Rose
            "#6366f1", // Indigo
          ],
          borderColor: [
            "#5b21b6",
            "#0284c7",
            "#059669",
            "#d97706",
            "#f05252",
            "#4f46e5",
          ],
          borderWidth: 1,
          borderRadius: 8,
          maxBarThickness: 50,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { top: 20, right: 20, left: 20, bottom: 20 },
      },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 16,
            font: { size: 12, weight: "500", family: "'Inter', sans-serif" },
            color: "#64748b",
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: "rgba(30, 41, 59, 0.95)",
          titleColor: "#fff",
          bodyColor: "#e2e8f0",
          borderColor: "#334155",
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          cornerRadius: 8,
          titleFont: { size: 13, weight: "600" },
          bodyFont: { size: 12 },
          callbacks: {
            label: function (context) {
              return context.dataset.label + ": " + context.parsed.y + " bookings";
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false, drawBorder: false },
          ticks: {
            color: "#64748b",
            font: { size: 12, weight: "500", family: "'Inter', sans-serif" },
            padding: 10,
          },
          border: { display: false },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "#e2e8f0",
            lineWidth: 0.5,
            drawBorder: false,
          },
          ticks: {
            color: "#64748b",
            font: { size: 12, weight: "500", family: "'Inter', sans-serif" },
            padding: 12,
          },
          border: { display: false },
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
            "#e2e8f0", // Gray (Pending)
          ],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    },
    options: {
      cutout: "75%",
      responsive: true,
      maintainAspectRatio: false,
      elements: {
        arc: {
            borderRadius: 8
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(30, 41, 59, 0.95)",
          titleColor: "#ffffff",
          bodyColor: "#f8fafc",
          padding: 12,
          displayColors: true,
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          cornerRadius: 8,
        },
      },
    },
    plugins: [
      {
        id: "centerText",
        beforeDraw: function (chart) {
          if (chart.data.datasets.length === 0) return;
          const { ctx, chartArea: { top, bottom, left, right } } = chart;
          ctx.save();
          
          const centerX = (left + right) / 2;
          const centerY = (top + bottom) / 2;

          // Draw Total Number
          ctx.font = "bold 2.5rem 'Inter', sans-serif";
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          ctx.fillStyle = "#1e293b";
          const textTotal = total.toString();
          ctx.fillText(textTotal, centerX, centerY - 10);

          // Draw "TOTAL" label
          ctx.font = "600 0.75rem 'Inter', sans-serif";
          ctx.fillStyle = "#94a3b8";
          ctx.textAlign = "center";
          const textLabel = "TOTAL BOOKINGS";
          ctx.fillText(textLabel, centerX, centerY + 25);

          ctx.restore();
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
