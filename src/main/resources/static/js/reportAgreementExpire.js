window.addEventListener("load", function () {
  setTimeout(() => {
    try {
      refresh();

      loadAllAgreements();
    } catch (e) {
      console.error("Error during revenue page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);

});

let allAgreements = [];
let agreementChart = null;
let customerAgreements = [];
let supplierAgreements = [];

// agreemnt refresh karan function eka
const refresh = () => { };

const refreshTable = () => {
  document.getElementById("agreementSearch").value = "";
  document.getElementById("agreementTypeFilter").value = "All";
  loadAllAgreements();
};

const loadAllAgreements = () => {
  // agreemnt all data tika gnnawa
  customerAgreements = getServiceRequest("/customeragreement/expired");
  supplierAgreements = getServiceRequest("/supplieragreement/expired");

  // array dekama ekam formata ekakata ena widihata new array ekak hadagannawa
  const newCustomerAgreements = customerAgreements.map((customerAgreement) => ({
    id: customerAgreement.cus_agreement_no,
    partner: customerAgreement.customer_id.company_name,
    partnerType: customerAgreement.customer_id.customer_status_id.status,
    type: "Customer",
    startDate: customerAgreement.agreement_date,
    expiryDate: customerAgreement.agreement_end_date,
    status: customerAgreement.customer_agreement_status_id.status,
  }));

  const newSupplierAgreements = supplierAgreements.map((supplierAgreement) => ({
    id: supplierAgreement.sup_agreement_no,
    partner: supplierAgreement.supplier_id.fullname,
    partnerType: supplierAgreement.supplier_id.supplier_status_id.status,
    type: "Supplier",
    startDate: supplierAgreement.agreement_date,
    expiryDate: supplierAgreement.agreement_end_date,
    status: supplierAgreement.supplier_agreement_status_id.status,
  }));

  // Combine and Filter
  let filteredAgreements = [...newCustomerAgreements, ...newSupplierAgreements];
  allAgreements = filteredAgreements;

  const typeFilterValue = document.getElementById("agreementTypeFilter").value;
  if (typeFilterValue !== "All") {
    filteredAgreements = filteredAgreements.filter((a) => a.type === typeFilterValue);
  }

  // Destroy existing DataTable if it exists
  if ($.fn.DataTable.isDataTable("#allAgreementsTable")) {
    $("#allAgreementsTable").DataTable().destroy();
  }

  const propertyList = [
    { propertyName: "id", dataType: "string" },
    { propertyName: getPartner, dataType: "function" },
    { propertyName: "startDate", dataType: "string" },
    { propertyName: gerExpierDate, dataType: "function" },
    { propertyName: getStatus, dataType: "function" },
  ];

  // Manual fill if still needed, but DataTables will handle display
  fillDataIntoRenewTable(allAgreementsTableBody, filteredAgreements, propertyList, renewFunction);

  // Initialize DataTable like driver.js
  const table = $("#allAgreementsTable").DataTable({
    dom: "rtip", // custom controls used
    pageLength: parseInt(document.getElementById("agreementTableLength").value),
    ordering: true,
    language: {
      info: "Showing _START_ to _END_ of _TOTAL_ agreements",
      infoEmpty: "Showing 0 to 0 of 0 agreements",
    },
    createdRow: function (row, data, dataIndex) {
      $(row).find("td").css({
        "vertical-align": "middle",
        height: "80px",
      });
      // Center all columns except Partner Name (index 2)
      $(row)
        .find("td")
        .each(function (index) {
          if (index !== 2) {
            $(this).css("text-align", "center");
          }
        });
    },
    headerCallback: function (thead, data, start, end, display) {
      $(thead).find("th").css({
        "text-align": "center",
        padding: "20px",
      });
    },
  });

  // serach karana eka
  document.getElementById("agreementSearch").addEventListener("keyup", function () {
    table.search(this.value).draw();
  });

  // custom design karapu length
  document.getElementById("agreementTableLength").addEventListener("change", function () {
    table.page.len(parseInt(this.value)).draw();
  });

  initializeChart(filteredAgreements);
};

const initializeChart = (allAgreements) => {
  // Initialize counters
  let expiredCount = 0;
  let expiringSoonCount = 0;
  let activeCount = 0;
  let total = allAgreements.length;

  // Array to store counts
  let dataArray = [];

  // Current date
  const currentDate = new Date();

  allAgreements.forEach(({ expiryDate }) => {
    const expireDate = new Date(expiryDate);
    const diffTime = expireDate - currentDate;
    // days walin ganna thama mehema karanne
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      expiredCount++;
    } else if (diffDays <= 30) {
      expiringSoonCount++;
    } else {
      activeCount++;
    }
  });

  // Push counts in order: Active, Expiring Soon, Expired
  dataArray.push(expiringSoonCount, expiredCount);

  console.log(dataArray);


  // document.getElementById("activePercent").innerText = ((activeCount / total) * 100).toFixed(0) + "%";
  document.getElementById("nearExpPercent").innerText = ((expiringSoonCount / total) * 100).toFixed(0) + "%" + " - " + expiringSoonCount;
  document.getElementById("expiredPercent").innerText = ((expiredCount / total) * 100).toFixed(0) + "%" + " - " + expiredCount;

  const ctx = document.getElementById("agreementStatusChart").getContext("2d");

  // Destroy previous chart if it exists
  if (agreementChart !== null) {
    agreementChart.destroy();
  }

  agreementChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Near Expiry", "Expired"],
      datasets: [
        {
          data: dataArray,
          backgroundColor: ["#f59e0b", "#ef4444"],
          borderWidth: 0,
          cutout: "75%",
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    },
  });
};

const getPartner = (dataOb) => {
  return "<span>" + dataOb.partner + "</span><span><p class='text-muted mt-2' >" + dataOb.type + "</p></span>";
};

// get expire date and overdue date remainings
const gerExpierDate = (dataOb) => {
  let expireDate = new Date(dataOb.expiryDate);
  let currentDate = new Date();

  let diffTime = expireDate - currentDate;
  let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // Already expired
    return "<span>" + dataOb.expiryDate + "</span><span><p class='text-danger mt-2'>Overdue " + Math.abs(diffDays) + " days</p></span>";
  } else if (diffDays <= 30) {
    // Expiring within 30 days
    return "<span>" + dataOb.expiryDate + "</span><span><p class='text-warning mt-2'>" + diffDays + " days left (Expiring Soon)</p></span>";
  } else {
    // More than 30 days left
    return "<span>" + dataOb.expiryDate + "</span>";
  }
};

const getStatus = (dataOb) => {
  if (dataOb.status == "Approved") {
    return "<span class='status-badge status-active'>" + dataOb.status + "</span>";
  }

  if (dataOb.status == "Pending") {
    return "<span class='status-badge status-pending'>" + dataOb.status + "</span>";
  }
  if (dataOb.status == "Expired") {
    return "<span class='status-badge status-inactive'> " + dataOb.status + "</span>";
  }
  if (dataOb.status == "Deleted") {
    return "<span class='status-badge status-inactive'> " + dataOb.status + "</span>";
  }
  if (dataOb.status == "Reject") {
    return "<span class='status-badge status-reject'> " + dataOb.status + "</span>";
  }
  if (dataOb.status == "Renewd") {
    return "<span class='status-badge status-renewd'> " + dataOb.status + "</span>";
  }
};

// data fill karan function renew btn ekat ekka
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
      if (property.dataType == "decimal") {
        td.innerHTML = parseFloat(dataOb[property.propertyName]).toFixed(2);
      }

      tr.appendChild(td);
    }

    if (dataOb.status === "Expired") {
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
    } else {
      let tdText = document.createElement("td");

      let divText = document.createElement("div");
      divText.innerHTML = "Renew Not Available";
      tdText.appendChild(divText);
      tr.appendChild(tdText);
    }

    tableBodyId.appendChild(tr);
  });
};

// print karana dunction eka
const printAgreementReport = () => {
  const generatedAt = new Date().toLocaleString();
  const typeFilterValue = document.getElementById("agreementTypeFilter")?.value || "All";
  const searchValue = (document.getElementById("agreementSearch")?.value || "").trim().toLowerCase();

  let printableAgreements = [...allAgreements];

  if (typeFilterValue !== "All") {
    printableAgreements = printableAgreements.filter((item) => item.type === typeFilterValue);
  }

  if (searchValue) {
    printableAgreements = printableAgreements.filter((item) => {
      const text = `${item.id} ${item.partner} ${item.type} ${item.startDate} ${item.expiryDate} ${item.status}`.toLowerCase();
      return text.includes(searchValue);
    });
  }

  const chartCanvas = document.getElementById("agreementStatusChart");
  const chartImage = agreementChart
    ? agreementChart.toBase64Image()
    : chartCanvas
      ? chartCanvas.toDataURL("image/png")
      : "";


  const nearPercentText = document.getElementById("nearExpPercent")?.innerText || "0%";
  const expiredPercentText = document.getElementById("expiredPercent")?.innerText || "0%";

  const rowsHtml = printableAgreements
    .map((item, index) => {
      const statusLabel = item.status || "-";
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${item.id || "-"}</td>
          <td>${item.partner || "-"} <span class="type-meta">(${item.type || "-"})</span></td>
          <td>${item.startDate || "-"}</td>
          <td>${item.expiryDate || "-"}</td>
          <td>${statusLabel}</td>
        </tr>
      `;
    })
    .join("");

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>Agreement Expire Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 28px; color: #1e293b; }
          .report-header { text-align: center; margin-bottom: 18px; }
          .report-header h1 { margin: 0; font-size: 22px; font-weight: 700; }
          .report-header p { margin: 6px 0 0 0; color: #64748b; font-size: 12px; }
          .meta-row { display: flex; justify-content: center; gap: 22px; margin-top: 10px; font-size: 12px; color: #475569; }
          .chart-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin: 18px 0; }
          .chart-title { margin: 0 0 10px 0; text-align: center; font-size: 14px; text-transform: uppercase; color: #334155; }
          .chart-wrap { display: flex; justify-content: center; align-items: center; min-height: 240px; }
          .chart-wrap img { max-width: 100%; max-height: 240px; }
          .legend { display: flex; justify-content: center; gap: 18px; font-size: 12px; color: #475569; margin-top: 10px; }
          .table-title { font-size: 14px; font-weight: 700; margin: 18px 0 10px 0; text-transform: uppercase; color: #334155; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #e2e8f0; padding: 10px; font-size: 12px; }
          th { background: #f8fafc; color: #64748b; text-transform: uppercase; }
          td:first-child, th:first-child { text-align: center; width: 44px; }
          .type-meta { color: #64748b; font-size: 11px; }
          @media print {
            body { padding: 0; }
            tr, .chart-card { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <h1>Agreement Expire Report</h1>
          <p>Generated on: ${generatedAt}</p>
          <div class="meta-row">
            <span>Near Expiry: ${nearPercentText}</span>
            <span>Expired: ${expiredPercentText}</span>
          </div>
        </div>

        <div class="chart-card">
          <h3 class="chart-title">Agreement Status Distribution</h3>
          <div class="chart-wrap">
            ${chartImage ? `<img src="${chartImage}" alt="Agreement Status Chart" />` : "<span>Chart unavailable</span>"}
          </div>
          <div class="legend">
            <span>Near Expiry: ${nearPercentText}</span>
            <span>Expired: ${expiredPercentText}</span>
          </div>
        </div>

        <div class="table-title">Agreement Details</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Agreement ID</th>
              <th>Partner Name</th>
              <th>Start Date</th>
              <th>Expiry Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="6" style="text-align:center;">No data available</td></tr>'}
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

// Renew ekata adala agreemnt hotaganna function eka
const renewFunction = (dataOb) => {
  if (dataOb.type == "Customer") {
    const findCusAgreemnt = customerAgreements.find((ca) => ca.cus_agreement_no === dataOb.id);
    if (findCusAgreemnt) {
      renewAgreement(findCusAgreemnt.cus_agreement_no, "Customer", findCusAgreemnt.customer_id.company_name, findCusAgreemnt);
    }
  } else if (dataOb.type == "Supplier") {
    const findSupAgreemnt = supplierAgreements.find((sa) => sa.sup_agreement_no === dataOb.id);
    if (findSupAgreemnt) {
      const partnerName = findSupAgreemnt.supplier_id.fullname || findSupAgreemnt.supplier_id.transportname;
      renewAgreement(findSupAgreemnt.sup_agreement_no, "Supplier", partnerName, findSupAgreemnt);
    }
  }
};

// agreemnt rewna karan function eka
const renewAgreement = (id, type, partnerName, dataOb) => {
  console.log(dataOb);

  Swal.fire({
    title: "Renew Agreement?",
    text: `Do you want to start the renewal process for ${partnerName}'s ${type} Agreement?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, Renew Now",
    cancelButtonText: "Later",
    confirmButtonColor: "#7c3aed",
    cancelButtonColor: "#f1f5f9",
    customClass: {
      confirmButton: "btn btn-primary",
      cancelButton: "btn btn-light text-dark",
      popup: "swal2-border-radius",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      // Store data for the target page to pick up (pre-filling logic)
      localStorage.setItem("pendingRenewal", JSON.stringify(dataOb));

      // Redirect to the appropriate page
      if (type === "Customer") {
        window.location.href = "/customeragreement";
      } else {
        window.location.href = "/supplieragreement";
      }
    }
  });
};
