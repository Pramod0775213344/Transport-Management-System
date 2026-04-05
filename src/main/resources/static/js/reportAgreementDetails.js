window.addEventListener("load", function () {
  refresh();

  // Directly load all data when UI loads
  loadCustomerAgreementDetailsTable();
  loadSupplierAgreementDetailsTable();

  // Fix for DataTables in tabs: Adjust columns and redraw when tab is shown
  $('button[data-bs-toggle="pill"]').on('shown.bs.tab', function (e) {
    $($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();
  });
});

// ----------------------------customer agreement details start_____________________________________________

// ----------------------------customer agreement details start_____________________________________________

// load customer agreement tables
function loadCustomerAgreementDetailsTable() {
  let customerAgreements = getServiceRequest("/customeragreement/alldata");
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

  // print view table ekata data filla karanawa
  dataFillIntoTheReportTable(printViewTableCustomerAgreement, customerAgreements, propertyList);

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

  // Update Counters & Show Print Button
  if (customerAgreements.length > 0) {
    if (document.getElementById("totalCustomerAgreementCount")) document.getElementById("totalCustomerAgreementCount").innerText = customerAgreements.length;
    if (document.getElementById("totalApprovedCustomerAgreementCount")) document.getElementById("totalApprovedCustomerAgreementCount").innerText = customerAgreements.filter(a => a.customer_agreement_status_id.status === "Approved").length;
    if (document.getElementById("totalPendingCustomerAgreementCount")) document.getElementById("totalPendingCustomerAgreementCount").innerText = customerAgreements.filter(a => a.customer_agreement_status_id.status === "Pending").length;
    if (document.getElementById("totalRejectCustomerAgreementCount")) document.getElementById("totalRejectCustomerAgreementCount").innerText = customerAgreements.filter(a => a.customer_agreement_status_id.status === "Reject").length;
    const printBtn = document.getElementById("printButtonCustomerAgreement");
    if (printBtn) printBtn.style.display = "block";
  }


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

// print view eka
const printCustomerAgreementReport = () => {
  let newWindow = window.open();
  let printView = document.getElementById("printViewCustomerAgreement");
  printView.style.display = "block";
  generateDateCustomerAgreement.innerText = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  generateTimeCustomerAgreement.innerText = new Date().toLocaleTimeString();
  generateUserCustomerAgreement.innerText = loggedEmployee.fullname;
  console.log(printView);
  let preview =
    "<head><title>TMS</title><link rel='stylesheet' href='/css/common.css'><link rel='stylesheet' href='bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'></head><body>" +
    printView.outerHTML +
    "</body>";

  newWindow.document.write(preview);

  setTimeout(() => {
    printView.style.display = "none";
    newWindow.stop();
    newWindow.print();
    newWindow.close();
  }, 500);
};

// ----------------------------customer agreement details end ____________________________________________

// ----------------------------Vehicle Supplier agreement details_____________________________________________

// load supplier agreement details to the table
const loadSupplierAgreementDetailsTable = () => {
  let supplierAgreements = getServiceRequest("/supplieragreement/alldata");
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

  // print view table ekata data filla karanawa
  dataFillIntoTheReportTable(printViewTable, supplierAgreements, propertyList);

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

  // Update Counters & Show Print Button
  if (supplierAgreements.length > 0) {
    if (document.getElementById("totalSupplierAgreementCount")) document.getElementById("totalSupplierAgreementCount").innerText = supplierAgreements.length;
    if (document.getElementById("totalApprovedSupplierAgreementCount")) document.getElementById("totalApprovedSupplierAgreementCount").innerText = supplierAgreements.filter(a => a.supplier_agreement_status_id.status === "Approved").length;
    if (document.getElementById("totalPendingSupplierAgreementCount")) document.getElementById("totalPendingSupplierAgreementCount").innerText = supplierAgreements.filter(a => a.supplier_agreement_status_id.status === "Pending").length;
    if (document.getElementById("totalRejectSupplierAgreementCount")) document.getElementById("totalRejectSupplierAgreementCount").innerText = supplierAgreements.filter(a => a.supplier_agreement_status_id.status === "Reject").length;
    const printBtn = document.getElementById("printSupplierAgreement");
    if (printBtn) printBtn.style.display = "block";
  }


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

// print of supplier agreement report
const printSupplierAgreementReport = () => {
  let newWindow = window.open();
  let printView = document.getElementById("printViewSupplierAgreement");
  printView.style.display = "block";
  generateDate.innerText = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  generateTime.innerText = new Date().toLocaleTimeString();
  generateUser.innerText = loggedEmployee.fullname;
  console.log(printView);
  let preview =
    "<head><title>TMS</title><link rel='stylesheet' href='/css/common.css'><link rel='stylesheet' href='bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'></head><body>" +
    printView.outerHTML +
    "</body>";

  newWindow.document.write(preview);

  setTimeout(() => {
    printView.style.display = "none";
    newWindow.stop();
    newWindow.print();
    newWindow.close();
  }, 500);
};

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

// table eke loading spin eka load karanwa
function showTableLoading(loaderId, tableId) {
  const loader = document.getElementById("loaderId");
  const vehicleSupplierAgreementDetailsTable = document.getElementById("vehicleSupplierAgreementDetailsTable");
  loader.style.display = ""; // Clear loading after 2 seconds
  vehicleSupplierAgreementDetailsTable.style.display = "none"; // Hide the booking table while loading
  setTimeout(() => {
    const loader = document.getElementById("loaderId");
    loader.style.display = "none"; // Clear loading after 2 seconds
    vehicleSupplierAgreementDetailsTable.style.display = ""; // Hide the booking table while loading
  }, 500);
}

// table eke loading spin eka load karanwa customer agreement ekata
function showTableLoading2() {
  const loader = document.getElementById("loaderIdCustomer");
  const customerAgreementDetailsTable = document.getElementById("customerAgreementDetailsTable");
  loader.style.display = ""; // Clear loading after 2 seconds
  customerAgreementDetailsTable.style.display = "none"; // Hide the booking table while loading
  setTimeout(() => {
    const loader = document.getElementById("loaderIdCustomer");
    loader.style.display = "none"; // Clear loading after 2 seconds
    customerAgreementDetailsTable.style.display = ""; // Hide the booking table while loading
  }, 500);
}
