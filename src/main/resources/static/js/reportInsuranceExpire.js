window.addEventListener("load", function () {
  setTimeout(() => {
    try {
      loadInsuranceExpireReportTable();

      console.error("Error during revenue page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);
  // Initialize current date for print header
  const printDateElements = document.querySelectorAll(".print-current-date");
  const now = new Date();
  printDateElements.forEach((el) => {
    el.innerText = now.toLocaleDateString() + " " + now.toLocaleTimeString();
  });


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

let currentInsuranceList = [];

const loadInsuranceExpireReportTable = () => {
  let insuranceExpireList = getServiceRequest("/report/insuranceexpirevehicle");
  currentInsuranceList = insuranceExpireList;

  if ($.fn.dataTable.isDataTable("#insuranceExpireReportTable")) {
    $("#insuranceExpireReportTable").DataTable().destroy();
  }

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

    const table = $("#insuranceExpireReportTable").DataTable({
      dom: "rtip",
      pageLength: 10,
      createdRow: function (row, data, dataIndex) {
        $(row).find("td").css({ "text-align": "center", "vertical-align": "middle", height: "60px" });
      },
      headerCallback: function (thead, data, start, end, display) {
        $(thead).find("th").css({ "text-align": "center", padding: "15px" });
      },
    });

    document.getElementById("tableSearch").addEventListener("keyup", function () {
      table.search(this.value).draw();
    });

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
      let response = httpServiceRequest("/vehicle/updatevehicleinsurance", "PUT", selectedVehicle);
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
      } else if (response === "ok_not_activated") {
        // update una, but revenue license expire wela nisa vehicle eka active wela na
        $("#insuranceRenewalModal").modal("hide");
        Swal.fire({
          title: "Insurance Updated",
          text: "Insurance expiry date updated, but the vehicle was not activated because the revenue license has expired.",
          icon: "warning",
          customClass: { popup: "swal2-border-radius" },
        });
        loadInsuranceExpireReportTable();
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



// print view eka
const printInsuranceExpireReport = () => {
  const generatedAt = new Date().toLocaleString();

  // charts tika base64 image widihata gannawa (canvas draw karapu content eka)
  const statusChartImage = insuranceStatusChart ? insuranceStatusChart.toBase64Image() : "";
  const trendChartImage = expiryTrendsChart ? expiryTrendsChart.toBase64Image() : "";
  const legendHtml = document.getElementById("insuranceLegendContainer")?.innerHTML || "";

  // search filter eka apply karala, pagination ekak nathuwa siyaluma matching rows tika gannawa
  const searchValue = (document.getElementById("tableSearch")?.value || "").trim().toLowerCase();
  const filteredList = currentInsuranceList.filter((v) => {
    if (!searchValue) return true;
    const searchText = `${v.vehicle_no || ""} ${v.supplier_id?.fullname || ""} ${v.vehicle_type_id?.name || ""} ${v.insurance_expire_date || ""}`.toLowerCase();
    return searchText.includes(searchValue);
  });

  const tableRowsHtml = filteredList
    .map((v, index) => {
      return `
    <tr>
      <td>${index + 1}</td>
      <td>${v.vehicle_no || "-"}</td>
      <td>${getSupplier(v)}</td>
      <td>${getVehicleType(v)}</td>
      <td>${v.insurance_expire_date || "-"}</td>
      <td>${getStatus(v).replace(/<[^>]*>/g, "")}</td>
    </tr>
    `;
    })
    .join("");

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
        <html>
            <head>
                <title>Insurance Expiry Report</title>
                <style>
          body { font-family: Arial, sans-serif; padding: 28px; color: #1e293b; }
                    .report-header { margin-bottom: 16px; text-align: center; }
          .report-title { margin: 0; font-size: 22px; font-weight: 700; }
          .report-subtitle { margin: 6px 0 0 0; color: #64748b; font-size: 13px; }
          .report-meta { margin: 8px 0 0 0; color: #64748b; font-size: 12px; }
          .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0 24px 0; }
          .chart-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; }
          .chart-card h4 { margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #334155; text-align: center; }
          .chart-image-wrap { display: flex; justify-content: center; align-items: center; min-height: 200px; }
          .chart-image-wrap img { max-width: 100%; max-height: 220px; }
          .legend-wrap { margin-top: 12px; display: flex; justify-content: center; gap: 20px; font-size: 12px; }
          .table-title { font-size: 14px; font-weight: 700; margin: 8px 0 10px 0; text-transform: uppercase; color: #334155; }
          table { width: 100%; border-collapse: collapse; }
          th { background-color: #f8fafc; color: #64748b; text-transform: uppercase; font-size: 11px; padding: 10px; border: 1px solid #e2e8f0; }
          td { padding: 10px; border: 1px solid #e2e8f0; font-size: 12px; text-align: center; }
                    @media print {
                        body { padding: 0; }
            .chart-card, tr { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
        <div class="report-header">
          <h2>Insurance Expire Report</h2>
          <p class="report-subtitle">Monitoring vehicle insurance validity across the fleet</p>
          <p class="report-meta">Generated on: ${generatedAt}</p>
        </div>

        <div class="charts-grid">
          <div class="chart-card">
            <h4>Insurance Status Distribution</h4>
            <div class="chart-image-wrap">
              ${statusChartImage ? `<img src="${statusChartImage}" alt="Insurance Status Chart">` : "<span>Chart unavailable</span>"}
            </div>
            <div class="legend-wrap">${legendHtml}</div>
          </div>
          <div class="chart-card">
            <h4>Upcoming Expiry Trends</h4>
            <div class="chart-image-wrap">
              ${trendChartImage ? `<img src="${trendChartImage}" alt="Expiry Trends Chart">` : "<span>Chart unavailable</span>"}
            </div>
          </div>
        </div>

        <div class="table-title">Vehicle Insurance Details</div>
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
            ${tableRowsHtml || '<tr><td colspan="6">No data available</td></tr>'}
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