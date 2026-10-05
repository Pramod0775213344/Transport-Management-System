window.addEventListener("load", function () {
  setTimeout(() => {
    try {
      refresh();

      // Directly load all data when UI loads
      loadCustomerAgreementDetailsTable();
      loadSupplierAgreementDetailsTable();

    } catch (e) {
      console.error("Error during revenue page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);


  // Fix for DataTables in tabs: Adjust columns and redraw when tab is shown
  $('button[data-bs-toggle="pill"]').on('shown.bs.tab', function (e) {
    $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();
  });
});

let currentCustomerAgreements = [];
let currentSupplierAgreements = [];


// ----------------------------customer agreement details start_____________________________________________

// ----------------------------customer agreement details start_____________________________________________

// load customer agreement tables
const loadCustomerAgreementDetailsTable = () => {
  let customerAgreements = getServiceRequest("/customeragreement/alldata");
  currentCustomerAgreements = customerAgreements;
  let propertyList = [
    { propertyName: "cus_agreement_no", dataType: "string" },
    { propertyName: getCustomerAgreementCustomer, dataType: "function" },
    { propertyName: getCustomerAgreementVehicleType, dataType: "function" },
    { propertyName: "added_datetime", dataType: "datetime" },
    { propertyName: getCustomerAgreementAddedUser, dataType: "function" },
    { propertyName: "reject_datetime", dataType: "datetime" },
    { propertyName: getCustomerAgreementRejectedUser, dataType: "function" },
    { propertyName: "approved_datetime", dataType: "datetime" },
    { propertyName: getCustomerAgreementApprovedUser, dataType: "function" },
    { propertyName: getStatus, dataType: "function" },
  ];
  dataFillIntoTheReportTable(customerAgreementDetailsTableBody, customerAgreements, propertyList);


  // Initialize DataTable
  const table = $("#customerAgreementDetailsTable").DataTable({
    destroy: true, // Allow re-initialization
    dom: "rtip", // Hide default search and length
    scrollX: true,
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
  document.getElementById("customerTableSearch").addEventListener("keyup", function () {
    table.search(this.value).draw();
  });

  // Custom Length Control
  document.getElementById("customerTableLength").addEventListener("change", function () {
    table.page.len(this.value).draw();
  });
};

// get supplier name from data object
const getCustomerAgreementCustomer = (dataOb) => {
  return dataOb.customer_id.company_name;
};

// get vehicle type
const getCustomerAgreementVehicleType = (dataOb) => {
  return dataOb.vehicle_type_id.name;
};

const getCustomerAgreementAddedUser = (dataOb) => {
  let findUser = userList.find((user) => user.id === dataOb.added_user_id);
  return findUser && findUser.employee_id && findUser.employee_id.fullname ? findUser.employee_id.fullname : "-";
};

const getCustomerAgreementRejectedUser = (dataOb) => {
  let findUser = userList.find((user) => user.id === dataOb.reject_user_id);
  return findUser && findUser.employee_id && findUser.employee_id.fullname ? findUser.employee_id.fullname : "-";
};

const getCustomerAgreementApprovedUser = (dataOb) => {
  let findUser = userList.find((user) => user.id === dataOb.approved_user_id);
  return findUser && findUser.employee_id && findUser.employee_id.fullname ? findUser.employee_id.fullname : "-";
};

const getStatus = (dataOb) => {
  const status = dataOb.customer_agreement_status_id.status;
  if (status === "Approved") {
    return `<span class="status-badge status-active">Approved</span>`;
  } else if (status === "Pending") {
    return `<span class="status-badge status-pending">Pending</span>`;
  } else if (status === "Reject") {
    return `<span class="status-badge status-reject">Rejected</span>`;
  }
  return `<span class="status-badge status-inactive">${status}</span>`;
};


// ----------------------------customer agreement details end ____________________________________________

// ----------------------------Vehicle Supplier agreement details_____________________________________________

// load supplier agreement details to the table
const loadSupplierAgreementDetailsTable = () => {
  let supplierAgreements = getServiceRequest("/supplieragreement/alldata");
  currentSupplierAgreements = supplierAgreements;
  let propertyList = [
    { propertyName: "sup_agreement_no", dataType: "string" },
    { propertyName: getSupplierAgreementSupplier, dataType: "function" },
    { propertyName: getSupplierAgreementVehicle, dataType: "function" },
    { propertyName: "added_datetime", dataType: "datetime" },
    { propertyName: getSupplierAgreementAddedUser, dataType: "function" },
    { propertyName: "reject_datetime", dataType: "datetime" },
    { propertyName: getSupplierAgreementRejectedUser, dataType: "function" },
    { propertyName: "approved_datetime", dataType: "datetime" },
    { propertyName: getSupplierAgreementApprovedUser, dataType: "function" },
    { propertyName: getSupplierAgreementStatus, dataType: "function" },
  ];
  dataFillIntoTheReportTable(vehicleSupplierAgreementDetailsTableBody, supplierAgreements, propertyList);

  // Initialize DataTable
  const table = $("#vehicleSupplierAgreementDetailsTable").DataTable({
    destroy: true, // Allow re-initialization
    dom: "rtip", // Hide default search and length
    scrollX: true,
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
  document.getElementById("supplierTableSearch").addEventListener("keyup", function () {
    table.search(this.value).draw();
  });

  // Custom Length Control
  document.getElementById("supplierTableLength").addEventListener("change", function () {
    table.page.len(this.value).draw();
  });
};

// get supplier name from data object
const getSupplierAgreementSupplier = (dataOb) => {
  return dataOb.supplier_id.fullname;
};

// get vehicle type
const getSupplierAgreementVehicle = (dataOb) => {
  return dataOb.vehicle_id.vehicle_no;
};

const getSupplierAgreementAddedUser = (dataOb) => {
  let findUser = userList.find((user) => user.id === dataOb.added_user_id);
  return findUser && findUser.employee_id && findUser.employee_id.fullname ? findUser.employee_id.fullname : "-";
};

const getSupplierAgreementRejectedUser = (dataOb) => {
  let findUser = userList.find((user) => user.id === dataOb.reject_user_id);
  return findUser && findUser.employee_id && findUser.employee_id.fullname ? findUser.employee_id.fullname : "-";
};

const getSupplierAgreementApprovedUser = (dataOb) => {
  let findUser = userList.find((user) => user.id === dataOb.approved_user_id);
  return findUser && findUser.employee_id && findUser.employee_id.fullname ? findUser.employee_id.fullname : "-";
};

const getSupplierAgreementStatus = (dataOb) => {
  const status = dataOb.supplier_agreement_status_id.status;
  if (status === "Approved") {
    return `<span class="status-badge status-active">Approved</span>`;
  } else if (status === "Pending") {
    return `<span class="status-badge status-pending">Pending</span>`;
  } else if (status === "Reject") {
    return `<span class="status-badge status-reject">Rejected</span>`;
  }
  return `<span class="status-badge status-inactive">${status}</span>`;
};

;

// reset the search fields and table
const supplierSearchReset = () => {
  dateFromVehicleSupplierAgreement.value = "";
  dateToVehicleSupplierAgreement.value = "";
  searchSupplierForVehicleSupplierAgreement.value = "";
  loadAllSupplierAgreements();
};

// ----------------------------Vehicle Supplier agreement details End_____________________________________________

//refersh input types and clear the table
const refresh = () => {
  // get user all data for view details
  userList = getServiceRequest("report/useralldata");
  // employee wa hoyaganna log wela inna
  employeeList = getServiceRequest("/employee/alldata");
  logedUser = getServiceRequest("/loggeduserdetails");
  loggedEmployee = employeeList.find((employee) => employee.id === logedUser.employee_id);
};


// dan active wela thiyena tab eka anuwa, e report eka print karanawa
const printAgreementDetailsReport = () => {
  const isCustomerTabActive = document.getElementById("pills-home").classList.contains("active");

  if (isCustomerTabActive) {
    printAgreementReport("Customer Agreement Report", currentCustomerAgreements, [
      { label: "Agreement No", get: (a) => a.cus_agreement_no || "-" },
      { label: "Customer Name", get: (a) => getCustomerAgreementCustomer(a) },
      { label: "Vehicle Type", get: (a) => getCustomerAgreementVehicleType(a) },
      { label: "Added Date", get: (a) => a.added_datetime || "-" },
      { label: "Added User", get: (a) => getCustomerAgreementAddedUser(a) },
      { label: "Approved Date", get: (a) => a.approved_datetime || "-" },
      { label: "Approved User", get: (a) => getCustomerAgreementApprovedUser(a) },
      { label: "Status", get: (a) => a.customer_agreement_status_id.status || "-" },
    ]);
  } else {
    printAgreementReport("Supplier Agreement Report", currentSupplierAgreements, [
      { label: "Agreement No", get: (a) => a.sup_agreement_no || "-" },
      { label: "Supplier Name", get: (a) => getSupplierAgreementSupplier(a) },
      { label: "Vehicle No", get: (a) => getSupplierAgreementVehicle(a) },
      { label: "Added Date", get: (a) => a.added_datetime || "-" },
      { label: "Added User", get: (a) => getSupplierAgreementAddedUser(a) },
      { label: "Approved Date", get: (a) => a.approved_datetime || "-" },
      { label: "Approved User", get: (a) => getSupplierAgreementApprovedUser(a) },
      { label: "Status", get: (a) => a.supplier_agreement_status_id.status || "-" },
    ]);
  }
};

// reusable print function eka - customer saha supplier dekatama use karanawa
const printAgreementReport = (title, dataList, columns) => {
  const tableHeaderHtml = columns.map((col) => `<th>${col.label}</th>`).join("");

  const tableRowsHtml = (dataList || [])
    .map((item, index) => {
      const cells = columns.map((col) => `<td>${col.get(item)}</td>`).join("");
      return `<tr><td>${index + 1}</td>${cells}</tr>`;
    })
    .join("");

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
        <html>
            <head>
                <title>${title}</title>
                <style>
          body { font-family: Arial, sans-serif; padding: 28px; color: #1e293b; }
                    .report-header { margin-bottom: 16px; text-align: center; }
          .report-title { margin: 0; font-size: 22px; font-weight: 700; }
          .report-meta { margin: 8px 0 0 0; color: #64748b; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #f8fafc; color: #64748b; text-transform: uppercase; font-size: 11px; padding: 10px; border: 1px solid #e2e8f0; }
          td { padding: 10px; border: 1px solid #e2e8f0; font-size: 12px; text-align: center; }
          td:first-child, th:first-child { width: 44px; }
                    @media print {
                        body { padding: 0; }
            tr { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
        <div class="report-header">
          <h1 class="report-title">${title}</h1>
          <p class="report-meta">Generated on: ${new Date().toLocaleString()}</p>
          <p class="report-meta">Total Records: ${dataList.length}</p>
        </div>

        <table>
          <thead>
            <tr><th>#</th>${tableHeaderHtml}</tr>
          </thead>
          <tbody>
            ${tableRowsHtml || `<tr><td colspan="${columns.length + 1}">No data available</td></tr>`}
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


