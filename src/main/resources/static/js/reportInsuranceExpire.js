window.addEventListener("load", function () {
  // Initialize current date for print header
  const printDateElements = document.querySelectorAll(".print-current-date");
  const now = new Date();
  printDateElements.forEach((el) => {
    el.innerText = now.toLocaleDateString() + " " + now.toLocaleTimeString();
  });

  loadInsuranceExpireReportTable();

  // masa 02 k issrahata thiyena date block karanwa
  const dateInput = document.getElementById("newExpiryDate");

  const today = new Date();
  const twoMonthsLater = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate());

  const yyyy = twoMonthsLater.getFullYear();
  const mm = String(twoMonthsLater.getMonth() + 1).padStart(2, "0"); // 0-based month
  const dd = String(twoMonthsLater.getDate()).padStart(2, "0");

  dateInput.min = `${yyyy}-${mm}-${dd}`;
  // ---------------------------------------------------------------------------
});

const loadInsuranceExpireReportTable = () => {
  let insuranceExpireList = getServiceRequest("/report/insuranceexpirevehicle");
  console.log(insuranceExpireList);

  // Destroy existing DataTable if it exists
  if ($.fn.dataTable.isDataTable("#insuranceExpireReportTable")) {
    $("#insuranceExpireReportTable").DataTable().destroy();
  }

  // array eke length eka 0 nam table eka display karanna epa
  if (insuranceExpireList.length == 0) {
    insuranceExpireReportTableBody.innerHTML = `<tr> <td colspan="6" class="text-center fs-5 p-5 text-muted">No insurance expiry data found in the fleet</td></tr>`;
    updateCharts([]);
  } else {
    let propertyList = [
      { propertyName: "vehicle_no", dataType: "string" },
      { propertyName: getSupplier, dataType: "function" },
      { propertyName: getVehicleType, dataType: "function" },
      { propertyName: getInsuranceExpireDate, dataType: "function" },
      { propertyName: getStatus, dataType: "function" },
    ];

    fillDataIntoRenewTable(insuranceExpireReportTableBody, insuranceExpireList, propertyList, renewInsuranceFunction);

    // Initialize DataTable like in driver.js
    const table = $("#insuranceExpireReportTable").DataTable({
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

    pieChartStatus(insuranceExpireList);
    upcomingTrendChart();
  }
};

let insuranceStatusChart;
let expiryTrendsChart;

// insruance dstibution chart eka
const pieChartStatus = (insuranceExpireList) => {
  let total = insuranceExpireList.length;
  document.getElementById("totalVehiclesChart").innerText = total;
  let expired = 0;
  let expiringSoon = 0;
  // Current date
  const currentDate = new Date();

  insuranceExpireList.forEach((dataOb) => {
    const expireDate = new Date(dataOb.insurance_expire_date);
    const diffTime = expireDate - currentDate;
    // days walin ganna thama mehema karanne
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      expired++;
    } else if (diffDays <= 30) {
      expiringSoon++;
    }
  });

  // 1. Insurance Status Distribution Chart (Doughnut)
  if (insuranceStatusChart) insuranceStatusChart.destroy();
  const ctxStatus = document.getElementById("insuranceStatusChart").getContext("2d");
  insuranceStatusChart = new Chart(ctxStatus, {
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
  const legendContainer = document.getElementById("insuranceLegendContainer");
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
  let datalist = getServiceRequest("/report/upcomingexpiredinsurancecount");
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
          borderColor: "#8b25ebff",
          backgroundColor: "rgba(172, 37, 235, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: "#8b25ebff",
          borderWidth: 3,
        },
      ],
    },
    options: {
      plugins: { legend: { display: true } },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "#f7f1f9ff" },
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
const getInsuranceExpireDate = (dataOb) => {
  let expireDate = new Date(dataOb.insurance_expire_date);
  let currentDate = new Date();

  let diffTime = expireDate - currentDate;
  let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // Already expired
    return "<span>" + dataOb.insurance_expire_date + "</span><span><br><p class='status-badge status-inactive'>Overdue " + Math.abs(diffDays) + " days</p></span>";
  } else if (diffDays <= 30) {
    // Expiring within 30 days
    return "<span>" + dataOb.insurance_expire_date + "</span><span><br><p class='status-badge status-pending'>" + diffDays + " days left</p></span>";
  }
};

// get vehicle type
const getVehicleType = (dataOb) => {
  return dataOb.vehicle_type_id ? dataOb.vehicle_type_id.name : "N/A";
};

// get status
const getStatus = (dataOb) => {
  let expireDate = new Date(dataOb.insurance_expire_date);
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
const exportInsuranceTable = (type) => {
  if (type === "excel") {
    // Basic Excel export logic or alert
    Swal.fire("Export to Excel", "Insurance report exported successfully.", "success");
  } else if (type === "pdf") {
    printInsuranceExpireReport();
  }
};

// print view eka
const printInsuranceExpireReport = () => {
  const generatedAt = new Date().toLocaleString();
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
        <html>
            <head>
                <title>Insurance Expiry Report</title>
                <link rel="stylesheet" href="/bootstrap/bootstrap-5.2.3/css/bootstrap.min.css">
                <style>
                    body { font-family: Arial, sans-serif; padding: 28px; color: #1e293b; }
                    .report-print-header { text-align: center; margin-bottom: 16px; }
                    .report-print-header h2 { margin: 0; font-size: 22px; font-weight: 700; }
                    .report-print-header p { margin: 6px 0 0 0; color: #64748b; font-size: 12px; }
                    .main-card { border: none !important; box-shadow: none !important; }
                    .table { width: 100%; margin-top: 30px; border-collapse: collapse; }
                    th { background-color: #f8fafc !important; color: #64748b !important; text-transform: uppercase; font-size: 0.8rem; padding: 12px !important; border-bottom: 2px solid #e2e8f0 !important; }
                    td { padding: 12px !important; border-bottom: 1px solid #e2e8f0 !important; font-size: 0.9rem; }
                    .badge { padding: 5px 12px; border-radius: 50px; font-weight: 500; font-size: 0.75rem; }
                    .bg-danger { background-color: #fef2f2 !important; color: #ef4444 !important; border: 1px solid #fee2e2 !important; }
                    .bg-warning { background-color: #fffbeb !important; color: #f59e0b !important; border: 1px solid #fef3c7 !important; }
                    .bg-success { background-color: #f0fdf4 !important; color: #22c55e !important; border: 1px solid #dcfce7 !important; }
                    @media print {
                        .table-header-wrapper, .btn, .d-print-none { display: none !important; }
                        tr { page-break-inside: avoid; }
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
              <div class="report-print-header">
                <h2>Insurance Expire Report</h2>
                <p>Generated on: ${generatedAt}</p>
              </div>
                ${document.getElementById("printableArea").innerHTML}
            </body>
        </html>
    `);

  setTimeout(() => {
    printWindow.stop();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, 1000);
};

let selectedVehicle = null;

// data fill karan d=function eka formekata
const renewInsuranceFunction = (dataOb) => {
  selectedVehicle = dataOb;
  document.getElementById("renewVehicleNo").value = dataOb.vehicle_no;
  document.getElementById("currentExpiryDate").value = dataOb.insurance_expire_date;
  document.getElementById("newExpiryDate").value = "";
  $("#insuranceRenewalModal").modal("show");
};

// renewal eka submit karan btn eka
const submitInsuranceRenewal = () => {
  const newDate = document.getElementById("newExpiryDate").value;

  if (newDate === "") {
    Swal.fire({
      title: "Validation Error",
      text: "Please select a new insurance expiry date.",
      icon: "error",
      customClass: { popup: "swal2-border-radius" },
    });
    return;
  }

  // Avehicle object ekata bind karanwa date eka
  selectedVehicle.insurance_expire_date = newDate;

  Swal.fire({
    title: "Confirm Update",
    text: `Are you sure you want to update the insurance expiry for ${selectedVehicle.vehicle_no} to ${newDate}?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, Update",
    cancelButtonText: "Cancel",
    customClass: { popup: "swal2-border-radius" },
  }).then((result) => {
    if (result.isConfirmed) {
      let response = httpServiceRequest("/vehicle/update", "PUT", selectedVehicle);
      if (response === "ok") {
        $("#insuranceRenewalModal").modal("hide");
        Swal.fire({
          title: "Renewd Successfully",
          text: "Insurance expiration date has been updated.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal2-border-radius" },
        });
        loadInsuranceExpireReportTable(); // Refresh the table and charts
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
