window.addEventListener("load", function () {
  // Initialize current date for print header
  const printDateElements = document.querySelectorAll(".print-current-date");
  const now = new Date();
  printDateElements.forEach((el) => {
    el.innerText = now.toLocaleDateString() + " " + now.toLocaleTimeString();
  });

  loadRevenueLicenseExpireReportTable();

  // masa 02 k issrahata thiyena date block karanwa
  const dateInput = document.getElementById("newExpiryDateRev");

  const today = new Date();
  const twoMonthsLater = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate());

  const yyyy = twoMonthsLater.getFullYear();
  const mm = String(twoMonthsLater.getMonth() + 1).padStart(2, "0"); // 0-based month
  const dd = String(twoMonthsLater.getDate()).padStart(2, "0");

  dateInput.min = `${yyyy}-${mm}-${dd}`;
  // -------------------------------------------------------------------------------
});

let revenueVehicleList = [];

const getDaysDiffFromToday = (dateValue) => {
  const expireDate = new Date(dateValue);
  const currentDate = new Date();
  return Math.floor((expireDate - currentDate) / (1000 * 60 * 60 * 24));
};

const getExpiryStatusMeta = (dateValue) => {
  const diffDays = getDaysDiffFromToday(dateValue);
  if (diffDays < 0) {
    return {
      status: "Expired",
      badgeClass: "status-inactive",
      infoText: `Overdue ${Math.abs(diffDays)} days`,
    };
  }

  return {
    status: "Expiring Soon",
    badgeClass: "status-pending",
    infoText: `${diffDays} days left`,
  };
};

const loadRevenueLicenseExpireReportTable = () => {
  let vehicleList = getServiceRequest("/report/revenuelicenseexpirevehicle");
  // data eka array ekak naththam empty array ekakata assign karanwa print function eka show karaganna
  revenueVehicleList = Array.isArray(vehicleList) ? vehicleList : [];

  // Destroy existing DataTable if it exists
  if ($.fn.dataTable.isDataTable("#revenueLicenseExpireReportTable")) {
    $("#revenueLicenseExpireReportTable").DataTable().destroy();
  }

  // array eke length eka 0 nam table eka display karanna epa
  if (vehicleList.length == 0) {
    revenueLicenseExpireReportTableBody.innerHTML = `<tr> <td colspan="6" class="text-center fs-5 p-5 text-muted">No revenue license expiry data found in the fleet</td></tr>`;
    document.getElementById("totalVehiclesChart").innerText = "0";
    document.getElementById("revenueLegendContainer").innerHTML = "";
    if (revenueStatusChart) revenueStatusChart.destroy();
    if (expiryTrendsChart) expiryTrendsChart.destroy();
    upcomingTrendChart();
  } else {
    let propertyList = [
      { propertyName: "vehicle_no", dataType: "string" },
      { propertyName: getSupplier, dataType: "function" },
      { propertyName: getVehicleType, dataType: "function" },
      { propertyName: getRevenueLicenseExpireDate, dataType: "function" },
      { propertyName: getStatus, dataType: "function" },
    ];

    fillDataIntoRenewTable(revenueLicenseExpireReportTableBody, vehicleList, propertyList, renewRevenueLicenseFunction);

    // Initialize DataTable like in driver.js
    const table = $("#revenueLicenseExpireReportTable").DataTable({
      dom: "rtip", // Hide default search and length
      pageLength: 10,
      createdRow: function (row, data, dataIndex) {
        $(row).find("td").css({
          "text-align": "center",
          "vertical-align": "middle",
          height: "60px",
        });
      },
      headerCallback: function (thead, data, start, end, display) {
        $(thead).find("th").css({
          "text-align": "center",
          padding: "15px",
        });
      },
    });

    // Custom Search Control
    document.getElementById("tableSearch").addEventListener("keyup", function () {
      table.search(this.value).draw();
    });

    // Custom Length Control
    document.getElementById("tableLength").addEventListener("change", function () {
      table.page.len(this.value).draw();
    });

    pieChartStatus(vehicleList);
    upcomingTrendChart();
  }
};

let revenueStatusChart;
let expiryTrendsChart;

// revenue license dstibution chart eka
const pieChartStatus = (vehicleList) => {
  let total = vehicleList.length;
  document.getElementById("totalVehiclesChart").innerText = total;
  let expired = 0;
  let expiringSoon = 0;
  // Current date
  const currentDate = new Date();

  vehicleList.forEach((dataOb) => {
    const expireDate = new Date(dataOb.revenu_license_expire_date);
    const diffTime = expireDate - currentDate;
    // days walin ganna thama mehema karanne
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      expired++;
    } else if (diffDays <= 30) {
      expiringSoon++;
    }
  });

  // 1. Revenue License Status Distribution Chart (Doughnut)
  if (revenueStatusChart) revenueStatusChart.destroy();
  const ctxStatus = document.getElementById("revenueStatusChart").getContext("2d");
  revenueStatusChart = new Chart(ctxStatus, {
    type: "doughnut",
    data: {
      labels: ["Expiring Soon", "Expired"],
      datasets: [
        {
          data: [expiringSoon, expired],
          backgroundColor: ["#f59e0b", "#ef4444"],
          borderWidth: 0,
          cutout: "70%",
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      maintainAspectRatio: false,
    },
  });

  // 2. Custom Legend
  const legendContainer = document.getElementById("revenueLegendContainer");
  const calcPercent = (val) => (total > 0 ? Math.round((val / total) * 100) : 0);

  legendContainer.innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <span class="status-dot" style="background: #f59e0b; width: 10px; height: 10px; border-radius: 50%; display: inline-block;"></span>
            <span class="small text-muted" style="font-size: 0.8rem;">Expiring Soon (${calcPercent(expiringSoon)}% - ${expiringSoon})</span>
        </div>
        <div class="d-flex align-items-center gap-2">
            <span class="status-dot" style="background: #ef4444; width: 10px; height: 10px; border-radius: 50%; display: inline-block;"></span>
            <span class="small text-muted" style="font-size: 0.8rem;">Expired (${calcPercent(expired)}% - ${expired})</span>
        </div>
    `;
};

const upcomingTrendChart = (list) => {
  // Data for Trends (Next 5 months including current)
  let datalist = getServiceRequest("/report/upcomingexpiredrevenuelicensecount");
  const months = [];
  const data = [];

  for (const index in datalist) {
    months.push(datalist[index][0]);
    data.push(datalist[index][1]);
  }

  // Upcoming Expiry Trends Chart (Line)
  if (expiryTrendsChart) expiryTrendsChart.destroy();

  const ctxTrends = document.getElementById("expiryTrendsChart").getContext("2d");
  expiryTrendsChart = new Chart(ctxTrends, {
    type: "line",
    data: {
      labels: months,
      datasets: [
        {
          label: "Expirations",
          data: data,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: "#3b82f6",
          borderWidth: 3,
        },
      ],
    },
    options: {
      plugins: { legend: { display: true } },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "#f1f5f9" },
          ticks: { font: { size: 10 } },
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 } },
        },
      },
      maintainAspectRatio: false,
    },
  });
};

// get supplier name from data object
const getSupplier = (dataOb) => {
  return dataOb.supplier_id ? dataOb.supplier_id.fullname : "N/A";
};

// get expiredate and days remaining
const getRevenueLicenseExpireDate = (dataOb) => {
  let expireDate = new Date(dataOb.revenu_license_expire_date);
  let currentDate = new Date();

  let diffTime = expireDate - currentDate;
  let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // Already expired
    return "<span>" + dataOb.revenu_license_expire_date + "</span><span><br><p class='status-badge status-inactive'>Overdue " + Math.abs(diffDays) + " days</p></span>";
  } else if (diffDays <= 30) {
    // Expiring within 30 days
    return "<span>" + dataOb.revenu_license_expire_date + "</span><span><br><p class='status-badge status-pending'>" + diffDays + " days left</p></span>";
  }
};

// get vehicle type
const getVehicleType = (dataOb) => {
  return dataOb.vehicle_type_id ? dataOb.vehicle_type_id.name : "N/A";
};

// get status
const getStatus = (dataOb) => {
  let expireDate = new Date(dataOb.revenu_license_expire_date);
  let currentDate = new Date();

  let diffTime = expireDate - currentDate;
  let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // Already expired
    return "<span class='status-badge status-inactive'>Expired</span>";
  } else if (diffDays <= 30) {
    // Expiring within 30 days
    return "<span class='status-badge status-pending'>Expiring Soon</span>";
  }
};

// Export function
const exportRevenueLicenseTable = (type) => {
  if (type === "excel") {
    Swal.fire("Export to Excel", "Revenue License report exported successfully.", "success");
  } else if (type === "pdf") {
    printRevenueLicenseExpireReport();
  }
};

// print view eka
const printRevenueLicenseExpireReport = () => {
  const statusCanvas = document.getElementById("revenueStatusChart");
  const trendCanvas = document.getElementById("expiryTrendsChart");
  const statusImage = revenueStatusChart ? revenueStatusChart.toBase64Image() : (statusCanvas ? statusCanvas.toDataURL("image/png") : "");
  const trendImage = expiryTrendsChart ? expiryTrendsChart.toBase64Image() : (trendCanvas ? trendCanvas.toDataURL("image/png") : "");
  const legendHtml = document.getElementById("revenueLegendContainer")?.innerHTML || "";

  const tableRowsHtml = revenueVehicleList
  .map((vehicle, index) => {
    const statusMeta = getExpiryStatusMeta(vehicle.revenu_license_expire_date);
    return `
    <tr>
      <td>${index + 1}</td>
      <td>${vehicle.vehicle_no || "-"}</td>
      <td>${vehicle.supplier_id ? vehicle.supplier_id.fullname : "N/A"}</td>
      <td>${vehicle.vehicle_type_id ? vehicle.vehicle_type_id.name : "N/A"}</td>
      <td>${vehicle.revenu_license_expire_date || "-"}</td>
      <td>${statusMeta.status}</td>
    </tr>
    `;
  })
  .join("");

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
        <html>
            <head>
                <title>Revenue License Expiry Report</title>
                <style>
          body { font-family: Arial, sans-serif; padding: 28px; color: #1e293b; }
                    .report-header { margin-bottom: 16px; text-align: center; }
          .report-title { margin: 0; font-size: 22px; font-weight: 700; }
          .report-subtitle { margin: 6px 0 0 0; color: #64748b; font-size: 13px; }
          .report-meta { margin: 8px 0 0 0; color: #64748b; font-size: 12px; }
          .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0 24px 0; }
          .chart-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; }
          .chart-card h4 { margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #334155; }
          .chart-image-wrap { display: flex; justify-content: center; align-items: center; min-height: 220px; }
          .chart-image-wrap img { max-width: 100%; max-height: 230px; }
          .legend-wrap { margin-top: 12px; }
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
          <h1 class="report-title ">Revenue License Expire Report</h1>
          <p class="report-subtitle">Monitoring vehicle revenue license validity across the fleet</p>
          <p class="report-meta">Generated on: ${new Date().toLocaleString()}</p>
        </div>

        <div class="charts-grid">
          <div class="chart-card">
            <h4>Revenue License Compliance</h4>
            <div class="chart-image-wrap">
              ${statusImage ? `<img src="${statusImage}" alt="Revenue License Compliance Chart">` : "<span>Chart unavailable</span>"}
            </div>
            <div class="legend-wrap">${legendHtml}</div>
          </div>
          <div class="chart-card">
            <h4>Upcoming Expiry Trends</h4>
            <div class="chart-image-wrap">
              ${trendImage ? `<img src="${trendImage}" alt="Upcoming Expiry Trends Chart">` : "<span>Chart unavailable</span>"}
            </div>
          </div>
        </div>

        <div class="table-title">Vehicle Expiry Details</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Vehicle No</th>
              <th>Supplier</th>
              <th>Vehicle Type</th>
              <th>Expiry Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml || '<tr><td colspan="6" style="text-align:center;">No data available</td></tr>'}
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

let selectedVehicle = null;

// data fill karanwa form ekata
const renewRevenueLicenseFunction = (dataOb) => {
  selectedVehicle = dataOb;
  document.getElementById("renewVehicleNoRev").value = dataOb.vehicle_no;
  document.getElementById("currentExpiryDateRev").value = dataOb.revenu_license_expire_date;
  document.getElementById("newExpiryDateRev").value = "";
  $("#revenueLicenseRenewalModal").modal("show");
};

// submit function eka
const submitRevenueLicenseRenewal = () => {
  const newDate = document.getElementById("newExpiryDateRev").value;

  if (newDate === "") {
    Swal.fire({
      title: "Validation Error",
      text: "Please select a new revenue license expiry date.",
      icon: "error",
      customClass: { popup: "swal2-border-radius" },
    });
    return;
  }

  //vehicle object eka bind karanwada.
  selectedVehicle.revenu_license_expire_date = newDate;

  Swal.fire({
    title: "Confirm Update",
    text: `Are you sure you want to update the revenue license expiry for ${selectedVehicle.vehicle_no} to ${newDate}?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, Update",
    cancelButtonText: "Cancel",
    customClass: { popup: "swal2-border-radius" },
  }).then((result) => {
    if (result.isConfirmed) {
      let response = httpServiceRequest("/vehicle/update", "PUT", selectedVehicle);
      if (response === "ok") {
        $("#revenueLicenseRenewalModal").modal("hide");
        Swal.fire({
          title: "Renewed Successfully",
          text: "Revenue license expiration date has been updated.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal2-border-radius" },
        });
        loadRevenueLicenseExpireReportTable(); // Refresh the table and charts
      } else {
        Swal.fire({
          title: "Update Failed",
          text: response,
          icon: "error",
          customClass: { popup: "swal2-border-radius" },
        });
      }
    }
  });
};

// table ekata data fill karana fucntion eka
const fillDataIntoRenewTable = (tableBodyId, dataList, propertyList, renewFunction) => {
  tableBodyId.innerHTML = "";

  dataList.forEach((dataOb, index) => {
    let tr = document.createElement("tr");

    let tdIndex = document.createElement("td");
    tdIndex.innerHTML = parseInt(index) + 1;
    tr.appendChild(tdIndex);

    for (const property of propertyList) {
      let td = document.createElement("td");

      if (property.dataType == "string") {
        td.innerHTML = dataOb[property.propertyName];
      }
      if (property.dataType == "function") {
        td.innerHTML = property.propertyName(dataOb);
      }

      tr.appendChild(td);
    }

    //Button List
    let tdbutton = document.createElement("td");
    tdbutton.style.position = "relative";

    let buttonDiv = document.createElement("div");
    buttonDiv.className = "actions";

    let renewButton = document.createElement("button");
    renewButton.className = "action-btn share w-75";
    renewButton.innerHTML = "Renew";
    renewButton.setAttribute("title", "renew");
    renewButton.onclick = () => {
      console.log("View", dataOb);
      renewFunction(dataOb, index);
    };

    buttonDiv.appendChild(renewButton);

    tdbutton.appendChild(buttonDiv);
    tr.appendChild(tdbutton);

    tableBodyId.appendChild(tr);
  });
};
