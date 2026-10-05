// ======================== page load functions =========================
window.addEventListener("load", () => {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      loadSupplierTable(); // Load the supplier table

      refreshSupplierForm(); // Clear the form
    } catch (e) {
      console.error("Error during supplier page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);
});
// ======================== end page load functions =========================



// ==================== search functions ==========================
// Function for searching and filtering supplier
const SearchSupplier = () => {
  const companySuppliers = getServiceRequest("/supplier/company")
  const individualSuppliers = getServiceRequest("/supplier/individual")
  const name = document.getElementById("searchSupplierName").value.toLowerCase();
  const nic = document.getElementById("searchSupplierNic").value.toLowerCase();
  const status = document.getElementById("searchSupplierStatus").value;

  const individualTabActive = $("#nav-individual-tab").hasClass("active");
  const suppliers = individualTabActive ? individualSuppliers : companySuppliers;

  const filteredSuppliers = suppliers.filter((supplier) => {
    let nameMatch = false;
    let identityMatch = false;

    if (individualTabActive) {
      nameMatch = (supplier.fullname || "").toLowerCase().includes(name);
      identityMatch = (supplier.nic || "").toLowerCase().includes(nic);
    } else {
      nameMatch = (supplier.company_name || "").toLowerCase().includes(name);
      identityMatch = (supplier.company_reg_no || "").toLowerCase().includes(nic);
    }

    const statusMatch = status === "" || (supplier.supplier_status_id && supplier.supplier_status_id.status === status);

    return nameMatch && identityMatch && statusMatch;
  });

  loadSupplierTable(filteredSuppliers);
};

// Function for resetting search filters
const resetSearchSupplier = () => {
  document.getElementById("searchSupplierName").value = "";
  document.getElementById("searchSupplierNic").value = "";
  document.getElementById("searchSupplierStatus").value = "";
  document.getElementById("tableSearch").value = "";
  SearchSupplier();
};
// ==================== end serach functions ==========================



// =================== table laod functions =======================
// function for load supplier table
const loadSupplierTable = (filteredData = null) => {
  // Check which tab is active to load the correct table
  const individualTabActive = $("#nav-individual-tab").hasClass("active");

  if (individualTabActive) {
    // parameter eka null nam api getServiceRequest("/supplier/individual") call karanwa
    individualSuppliers = filteredData !== null ? filteredData : getServiceRequest("/supplier/individual");
    if ($.fn.dataTable.isDataTable("#supplierTable")) {
      $("#supplierTable").DataTable().destroy();
    }
    const propertyList = [
      { propertyName: "fullname", dataType: "string" },
      { propertyName: "transportname", dataType: "string" },
      { propertyName: "nic", dataType: "string" },
      { propertyName: "email", dataType: "string" },
      { propertyName: "mobileno", dataType: "string" },
      { propertyName: getDrivingStatus, dataType: "function" },
      { propertyName: getSupplierStatus, dataType: "function" },
    ];

    dataFillIntoTheTable(supplierTableBody, individualSuppliers, propertyList, supplierView, supplierEdit, supplierDelete, true);

    const table = $("#supplierTable").DataTable({
      dom: "rtip",
      pageLength: 10,
      createdRow: function (row, data, dataIndex) {
        $(row).find("td").css({
          "text-align": "left",
          padding: "25px",
          height: "80px",
        });
      },
      headerCallback: function (thead, data, start, end, display) {
        $(thead).find("th").css({
          "text-align": "left",
          padding: "20px",
        });
      },
    });

    // Custom Search Sync
    $("#tableSearch")
      .off("keyup")
      .on("keyup", function () {
        table.search(this.value).draw();
      });

    // Custom Length Sync
    $("#tableLength")
      .off("change")
      .on("change", function () {
        table.page.len(this.value).draw();
      });

    applyPrivileges("Supplier Management", "supplierTable", {
      add: addButton,

    });

    table.on("draw.dt", function () {
      applyPrivileges("Supplier Management", "supplierTable", { add: addButton });
    });
  } else {
    // Company Tab logic
    if ($.fn.dataTable.isDataTable("#supplierTableCompany")) {
      $("#supplierTableCompany").DataTable().destroy();
    }
    // parameter eka null nam api getServiceRequest("/supplier/company") call karanwa
    companySuppliers = filteredData !== null ? filteredData : getServiceRequest("/supplier/company");
    const companyPropertyList = [
      { propertyName: "company_name", dataType: "string" },
      { propertyName: "company_reg_no", dataType: "string" },
      { propertyName: "company_email", dataType: "string" },
      { propertyName: "company_contact_no", dataType: "string" },
      { propertyName: getSupplierStatus, dataType: "function" },
    ];

    dataFillIntoTheTable(supplierTableBodyCompany, companySuppliers, companyPropertyList, supplierView, supplierEdit, supplierDelete, true);

    const tableCompany = $("#supplierTableCompany").DataTable({
      dom: "rtip",
      pageLength: 25,
      createdRow: function (row, data, dataIndex) {
        $(row).find("td").css({
          "text-align": "left",
          padding: "25px",
          height: "80px",
        });
      },
      headerCallback: function (thead, data, start, end, display) {
        $(thead).find("th").css({
          "text-align": "left",
          padding: "20px",
        });
      },
    });

    // Custom Search Sync
    $("#tableSearch")
      .off("keyup")
      .on("keyup", function () {
        tableCompany.search(this.value).draw();
      });

    // Custom Length Sync
    $("#tableLength")
      .off("change")
      .on("change", function () {
        tableCompany.page.len(this.value).draw();
      });

    applyPrivileges("Supplier Management", "supplierTableCompany", {
      add: addButton,

    });

    tableCompany.on("draw.dt", function () {
      applyPrivileges("Supplier Management", "supplierTableCompany", { add: addButton });
    });
  }
};

// Handle tab changes to reload data and sync controls
$('button[data-bs-toggle="tab"]').on("shown.bs.tab", function (e) {
  SearchSupplier();
});

// driving status Function
const getDrivingStatus = (dataOb) => {
  if (dataOb.driving_status) {
    return "<span class='status-badge status-active fw-bold'>Yes</span>";
  } else {
    return "<span class='status-badge status-inactive fw-bold'>No</span>";
  }
};

// status Function
const getSupplierStatus = (dataOb) => {
  if (dataOb.supplier_status_id.status == "Active") {
    return "<span class='status-badge status-active'>" + dataOb.supplier_status_id.status + "</span>";
  }
  if (dataOb.supplier_status_id.status == "Inactive") {
    return "<span class='status-badge status-pending'>" + dataOb.supplier_status_id.status + "</span>";
  }
  if (dataOb.supplier_status_id.status == "Delete") {
    return "<span class='status-badge status-inactive'> " + dataOb.supplier_status_id.status + "</span>";
  }
};

const getVehicleType = (dataOb) => {
  return dataOb.vehicle_type_id.name;
}

const getVehicleStatus = (dataOb) => {
  if (dataOb.vehicle_status_id.status == "Active") {
    return "<span class='status-badge status-active'>" + dataOb.vehicle_status_id.status + "</span>";
  }

  if (dataOb.vehicle_status_id.status == "Inactive") {
    return "<span class='status-badge status-pending'>" + dataOb.vehicle_status_id.status + "</span>";
  }
  if (dataOb.vehicle_status_id.status == "Deleted") {
    return "<span class='status-badge status-inactive'>" + dataOb.vehicle_status_id.status + "</span>";
  }
}
// =================== end table laod functions =======================



// =========================== delete functions ====================================
// Table Delete Button
const supplierDelete = (dataOb) => {
  if (dataOb.supplier_status_id.status === "Delete") {
    Swal.fire({
      title: "Supplier Already Deleted",
      text: "This Supplier record has already been deleted",
      icon: "info",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    return;
  }
  let userConfirm = Swal.fire({
    title: "Confirm Supplier Deletion",
    text: "Are you sure you want to delete this supplier record? This action cannot be undone!",
    icon: "warning",
    iconColor: "#ef4444",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete Supplier",
    cancelButtonText: "No, Keep it",
    allowOutsideClick: false,
    customClass: {
      cancelButton: "btn btn-1",
      confirmButton: "btn btn-4",
      popup: "swal2-border-radius",
    },
  }).then((userConfirm) => {
    if (userConfirm.isConfirmed) {
      //call post service
      let deleteResponse = httpServiceRequest("/supplier/delete", "DELETE", dataOb);
      if (deleteResponse == "ok") {
        Swal.fire({
          title: "Supplier Deleted!",
          text: "The supplier record has been successfully removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-border-radius",
          },
        });
        loadSupplierTable();
        refreshSupplierForm();
      } else {
        Swal.fire({
          title: "Deletion Failed",
          text: deleteResponse,
          icon: "error",
          allowOutsideClick: false,
          customClass: {
            confirmButton: "btn btn-1",
            popup: "swal2-border-radius",
          },
        });
      }
    } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: "Cancelled",
        text: "Details not Deleted!",
        icon: "error",
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    }
  });
};
// =========================== end delete functions ====================================



// =========================== view & print functions ====================================
// Table View Button
const supplierView = (dataOb) => {
  console.log(dataOb);

  if (dataOb.category_type === "Individual") {
    individualSupplierCard.style.display = ""
    companySupplierCard.style.display = "none";

    viewSupplierNameHeader.innerText = dataOb.fullname;
    viewSupplierFullName.innerText = dataOb.fullname;
    viewSupplierCallingName.innerText = dataOb.callingname;
    viewSupplierNic.innerText = dataOb.nic;
    viewSupplierAddress.innerText = dataOb.address;
    viewSupplierEmail.innerText = dataOb.email;
    viewSupplierMobileNo.innerText = dataOb.mobileno;
    if (dataOb.driving_status) {
      viewDrivingLicensNo.innerText = dataOb.driving_licence_no;
      viewDlExpireDate.innerText = dataOb.driving_licencen_expiredate;
    } else {
      viewDrivingLicensNo.innerText = "-";
      viewDlExpireDate.innerText = "-";
    }
    viewStatus.innerHTML = getStatusBadge(dataOb.supplier_status_id.status);
    const imgEl = document.getElementById("viewImage");
    const initialsEl = document.getElementById("viewImageInitials");

    if (dataOb.profile_photo_url) {
      imgEl.src = dataOb.profile_photo_url;
      imgEl.style.display = "block";     // show the photo
      initialsEl.style.display = "none"; // hide the initials box
    } else {
      imgEl.style.display = "none";      // hide the empty broken image
      initialsEl.style.display = "flex"; // <-- this line was missing, so it stayed "none" from the CSS
      initialsEl.innerText = getInitials(dataOb.fullname);
    }

  } else if (dataOb.category_type === "Company") {

    individualSupplierCard.style.display = "none";
    companySupplierCard.style.display = "";
    viewSupplierNameHeader.innerText = dataOb.company_name;
    viewSupplierCompanyName.innerText = dataOb.company_name;
    viewSupplierRegistrationNo.innerText = dataOb.company_reg_no;
    viewSupplierAddress.innerText = dataOb.company_address;
    viewSupplierCompanyEmail.innerText = dataOb.company_email;
    viewSupplierCompanyContactNo.innerText = dataOb.company_contact_no;
    viewSupplierContactPersonName.innerText = dataOb.company_contact_person_name;
    viewSupplierContactPersonMobile.innerText = dataOb.company_contact_person_mobileno;
    viewSupplierContactPersonEmail.innerText = dataOb.company_contact_person_email;
    viewCompanyStatus.innerHTML = getStatusBadge(dataOb.supplier_status_id.status);
    const imgEl = document.getElementById("viewImageCompany");
    const initialsEl = document.getElementById("viewImageInitialsCompany");

    if (dataOb.profile_photo_url) {
      imgEl.src = dataOb.profile_photo_url;
      imgEl.style.display = "block";     // show the photo
      initialsEl.style.display = "none"; // hide the initials box
    } else {
      imgEl.style.display = "none";      // hide the empty broken image
      initialsEl.style.display = "flex"; // <-- this line was missing, so it stayed "none" from the CSS
      initialsEl.innerText = getInitials(dataOb.company_name);
    }
  }


  function getStatusBadge(status) {
    if (status == "Active") {
      return "<span class='status-badge status-active'>" + status + "</span>";
    }
    if (status == "Inactive") {
      return "<span class='status-badge status-pending'>" + status + "</span>";
    }
    if (status == "Delete") {
      return "<span class='status-badge status-inactive'>" + status + "</span>";
    }
    return "";
  }
  // -----------name eken akuru genarate karanwa-------------
  function getInitials(name) {
    if (!name) return "-";
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(word => word[0].toUpperCase())
      .join("");
  }
  viewAccountName.innerText = dataOb.account_holder_name;
  viewBankName.innerText = dataOb.bank_name;
  viewBranchName.innerText = dataOb.branch_name;
  viewAccountNo.innerText = dataOb.account_no;
  viewTransportNameHeader.innerText = dataOb.transportname;

  // ---------------print fields populate karanwa--------------------------
  // letterhead / header fields
  const todayDate = new Date().toLocaleDateString("en-GB");
  printIssuedDate.innerText = todayDate;
  printSupplierNo.innerText = dataOb.id || "-";

  // intro paragraph supplier name
  const displayName = dataOb.category_type === "Individual"
    ? (dataOb.fullname || dataOb.callingname || "-")
    : (dataOb.company_name || "-");
  printSupplierIntroName.innerText = displayName;
  printSupplierRegNo.innerText = "SUP" + String(dataOb.id || "").padStart(5, "0");

  // parties block
  printPartySupplierName.innerText = displayName;
  printPartyTransportName.innerText = dataOb.transportname || "-";
  printPartySupplierMobile.innerText = dataOb.category_type === "Individual"
    ? (dataOb.mobileno || "-")
    : (dataOb.company_contact_no || "-");
  printPartyAccountName.innerText = dataOb.account_holder_name || "-";
  printPartyBankName.innerText = (dataOb.bank_name || "-") + " — " + (dataOb.branch_name || "-");
  printPartyAccountNo.innerText = dataOb.account_no || "-";

  // common fields
  printTransportName.innerText = dataOb.transportname || "-";
  printAccountName.innerText = dataOb.account_holder_name || "-";
  printBankName.innerText = dataOb.bank_name || "-";
  printBranchName.innerText = dataOb.branch_name || "-";
  printAccountNo.innerText = dataOb.account_no || "-";

  // individual or company specific rows hide/show
  const indRows = ["printRowFullName", "printRowCallingName", "printRowNic", "printRowAddress", "printRowEmail", "printRowMobile", "printRowDlNo", "printRowDlExpiry"];
  const comRows = ["printRowCompanyName", "printRowRegNo", "printRowCompanyEmail", "printRowCompanyContact", "printRowContactPerson", "printRowContactMobile", "printRowContactEmail"];

  if (dataOb.category_type === "Individual") {
    indRows.forEach(id => document.getElementById(id).style.display = "");
    comRows.forEach(id => document.getElementById(id).style.display = "none");
    printFullName.innerText = dataOb.fullname || "-";
    printCallingName.innerText = dataOb.callingname || "-";
    printNic.innerText = dataOb.nic || "-";
    printAddress.innerText = dataOb.address || "-";
    printEmail.innerText = dataOb.email || "-";
    printMobileNo.innerText = dataOb.mobileno || "-";
    printDlNo.innerText = dataOb.driving_status ? (dataOb.driving_licence_no || "-") : "-";
    printDlExpiry.innerText = dataOb.driving_status ? (dataOb.driving_licencen_expiredate || "-") : "-";
  } else {
    indRows.forEach(id => document.getElementById(id).style.display = "none");
    comRows.forEach(id => document.getElementById(id).style.display = "");
    printCompanyName.innerText = dataOb.company_name || "-";
    printRegNo.innerText = dataOb.company_reg_no || "-";
    printCompanyEmail.innerText = dataOb.company_email || "-";
    printCompanyContact.innerText = dataOb.company_contact_no || "-";
    printContactPerson.innerText = dataOb.company_contact_person_name || "-";
    printContactMobile.innerText = dataOb.company_contact_person_mobileno || "-";
    printContactEmail.innerText = dataOb.company_contact_person_email || "-";
  }

  //
  const printSupplierDetail = () => {
    let newWindow = window.open();
    let preview =
      "<html><head><title>TMS</title><link rel='stylesheet' href='/css/supplier.css'><link rel='stylesheet' href='/css/common.css'><link rel='stylesheet' href='/css/printView.css'><link rel='stylesheet' href='/bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'><script src='/bootstrap/bootstrap-5.2.3/js/bootstrap.bundle.min.js'></script></head><body>" +
      "<div class='row'><div class='col-12'>" +
      printContent.outerHTML +
      "</div></div></body></html>";

    newWindow.document.write(preview);

    setTimeout(() => {
      newWindow.stop();
      newWindow.print();
      newWindow.close();
    }, 500);
  };
  window.printSupplierDetail = printSupplierDetail;

  // --------supplierta adala vehicle list eka-----------------
  if ($.fn.DataTable.isDataTable("#viewSupplierVehicleListTable")) {
    $("#viewSupplierVehicleListTable").DataTable().destroy();
  }
  // recent booking tika fill karanawa
  const dataList = getServiceRequest("/vehicle/bysupplierid?supplierid=" + dataOb.id);
  let propertyListView = [
    { propertyName: "vehicle_no", dataType: "string" },
    { propertyName: getVehicleType, dataType: "function" },
    { propertyName: getVehicleStatus, dataType: "function" },
  ];
  dataFillIntoTheReportTable(viewSupplierVehicleListTableBody, dataList, propertyListView)

  const table = $("#viewSupplierVehicleListTable").DataTable({
    dom: "rtip", // custom controls used
    pageLength: 5,
    createdRow: function (row, data, dataIndex) {
      $(row).find("td").css({
        "text-align": "left",
        height: "80px",
      });
    }
  })
  openSupplierDetail();
};

// print window open karanwa (new pattern)
const printSupplierDetail = () => {
  let newWindow = window.open();
  let preview =
    "<html><head><title>TMS</title><link rel='stylesheet' href='/css/supplier.css'><link rel='stylesheet' href='/css/common.css'><link rel='stylesheet' href='/css/printView.css'><link rel='stylesheet' href='/bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'><script src='/bootstrap/bootstrap-5.2.3/js/bootstrap.bundle.min.js'></scr" +
    "ipt></head><body>" +
    "<div class='row'><div class='col-12'>" +
    printContent.outerHTML +
    "</div></div></body></html>";

  newWindow.document.write(preview);

  setTimeout(() => {
    newWindow.stop();
    newWindow.print();
    newWindow.close();
  }, 500);
};
// =========================== end view & print functions ====================================


// =================================== edit functions =========================
const supplierEdit = (dataOb) => {
  if (dataOb.supplier_status_id.status === "Delete") {
    Swal.fire({
      title: "Cannot Edit Deleted Supplier",
      text: "Can not edit Delete Supplier Deatils",
      icon: "info",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    return;
  }
  console.log(dataOb);

  textSupplierFullName.value = dataOb.fullname;
  textSupplierCategory.disabled = true;
  // categeroy type eka anuwa changw wenna oni
  if (dataOb.category_type === "Individual") {
    textSupplierCategory.value = dataOb.category_type;

    individualCollapse.show();
    companyCollapse.hide();

    const fullNameParts = textSupplierFullName.value.split(" ");
    generateCallingName(dataOb.fullname, dataOb.callingname);

    textSupplierAddress.value = dataOb.address;
    textSupplierNic.value = dataOb.nic;
    textSupplierDrivingLicenseNo.value = dataOb.driving_licence_no;
    textSupplierDrivingLicenseExpireDate.value = dataOb.driving_licencen_expiredate;
    textSupplierEmail.value = dataOb.email;
    textSupplierMobileNo.value = dataOb.mobileno;
  } else if (dataOb.category_type === "Company") {
    textSupplierCategory.value = dataOb.category_type;

    individualCollapse.hide();
    companyCollapse.show();

    textSupplierCompanyName.value = dataOb.company_name;
    textSupplierCompanyRegNo.value = dataOb.company_reg_no;
    textSupplierCompanyAddress.value = dataOb.company_address;
    textSupplierCompanyEmail.value = dataOb.company_email;
    textSupplierCompanyContactNo.value = dataOb.company_contact_no;
    textSupplierContactPersonName.value = dataOb.company_contact_person_name;
    textSupplierContactPersonMobileNo.value = dataOb.company_contact_person_mobileno;
    textSupplierContactPersonEmail.value = dataOb.company_contact_person_email;
  }

  textSupplierAccountHolderName.value = dataOb.account_holder_name;
  textSupplierBankName.value = dataOb.bank_name;
  textSupplierBranchName.value = dataOb.branch_name;
  textSupplierAccountNo.value = dataOb.account_no;
  textTransportName.value = dataOb.transportname;
  textSupplierStatus.value = JSON.stringify(dataOb.supplier_status_id);

  updateButton.style.display = "";
  submitButton.style.display = "none";
  textSupplierStatusDiv.style.display = "";

  document.getElementById("modalTitle").innerText = "Edit Supplier";
  document.getElementById("modalSubtitle").innerText = "Modify the supplier details below and update the record.";

  supplier = JSON.parse(JSON.stringify(dataOb));
  oldSupplier = JSON.parse(JSON.stringify(dataOb));

  $("#supplierForm").modal("show");
};
// =================================== end edit functions =========================




// ================================ submit & check error functions ========================
// Chcek form errors
const checkFormError = () => {
  let errors = "";

  if (textSupplierCategory.value === "Individual") {
    if (supplier.fullname == null) {
      errors += "Please enter the Full Name. <br>";
      textSupplierFullName.classList.add("is-invalid");
    }
    if (supplier.callingname == null) {
      errors += "Please select the Calling Name. <br>";
    }
    if (supplier.address == null) {
      errors += "Please enter the Address. <br>";
      textSupplierAddress.classList.add("is-invalid");
    }
    if (supplier.nic == null) {
      errors += "Please enter the NIC Number. <br>";
      textSupplierNic.classList.add("is-invalid");
    }
    if (supplier.email == null) {
      errors += "Please enter the Email Address. <br>";
      textSupplierEmail.classList.add("is-invalid");
    }
    if (supplier.mobileno == null) {
      errors += "Please enter the Mobile Number. <br>";
      textSupplierMobileNo.classList.add("is-invalid");
    }
  }
  if (textSupplierCategory.value === "Company") {
    if (supplier.company_name == null) {
      errors += "Please enter the Company Name. <br>";
      textSupplierCompanyName.classList.add("is-invalid");
    }
    if (supplier.company_reg_no == null) {
      errors += "Please enter the Company Registration No. <br>";
      textSupplierCompanyRegNo.classList.add("is-invalid");
    }
    if (supplier.company_address == null) {
      errors += "Please enter the Company Address. <br>";
      textSupplierCompanyAddress.classList.add("is-invalid");
    }
    if (supplier.company_contact_person_name == null) {
      errors += "Please enter the Contact Person Name. <br>";
      textSupplierContactPersonName.classList.add("is-invalid");
    }
    if (supplier.company_contact_person_email == null) {
      errors += "Please enter the Contact Person Email. <br>";
      textSupplierContactPersonEmail.classList.add("is-invalid");
    }
    if (supplier.company_contact_person_mobileno == null) {
      errors += "Please enter the Contact Person Mobile No. <br>";
      textSupplierContactPersonMobileNo.classList.add("is-invalid");
    }
    if (supplier.company_email == null) {
      errors += "Please enter the Company Email. <br>";
      textSupplierCompanyEmail.classList.add("is-invalid");
    }
    if (supplier.company_contact_no == null) {
      errors += "Please enter the Company Contact No. <br>";
      textSupplierCompanyContactNo.classList.add("is-invalid");
    }
  }

  if (supplier.account_holder_name == null) {
    errors += "Please enter the Account Holder Name. <br>";
    textSupplierAccountHolderName.classList.add("is-invalid");
  }
  if (supplier.bank_name == null) {
    errors += "Please enter the Bank Name. <br>";
    textSupplierBankName.classList.add("is-invalid");
  }
  if (supplier.branch_name == null) {
    errors += "Please enter the Branch Name. <br>";
    textSupplierBranchName.classList.add("is-invalid");
  }
  if (supplier.account_no == null) {
    errors += "Please enter the Account No. <br>";
    textSupplierAccountNo.classList.add("is-invalid");
  }
  if (supplier.transportname == null) {
    errors += "Please enter the Transport/Business Name. <br>";
    textTransportName.classList.add("is-invalid");
  }
  return errors;
};

// Supplier Form Submit
const supplierFormSubmit = () => {
  console.log(supplier);
  // check form error for required element
  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    // errors not exit
    //need to get user confirmation

    let userConfirm = Swal.fire({
      title: "Confirm Supplier Registration",
      text: "Are you sure you want to register this new supplier?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Register Supplier",
      cancelButtonText: "Cancel",
      allowOutsideClick: false,
      customClass: {
        cancelButton: "btn btn-1",
        confirmButton: "btn btn-2",
        popup: "swal2-border-radius",
      },
    }).then((userConfirm) => {
      if (userConfirm.isConfirmed) {
        //call post service
        let postResponse = httpServiceRequest("/supplier/insert", "POST", supplier);
        console.log(supplier);

        if (postResponse == "ok") {
          Swal.fire({
            title: "Supplier Registered!",
            text: "New supplier has been successfully added to the system.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          loadSupplierTable();
          refreshSupplierForm();
          $("#supplierForm").modal("hide");
        } else {
          Swal.fire({
            title: "Registration Failed",
            text: postResponse,
            icon: "error",
            customClass: {
              confirmButton: "btn btn-1",
              popup: "swal2-border-radius",
            },
          });
        }
      } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: "Cancelled",
          text: "Details not Saved!",
          icon: "error",
          customClass: {
            confirmButton: "btn btn-1",
            popup: "swal2-border-radius",
          },
        });
      }
    });
  } else {
    Swal.fire({
      title: "Registration Incomplete",
      html: `<div class="text-start">${errors}</div>`,
      icon: "error",
      confirmButtonText: "OK",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
  }
  console.log(supplier);
};
// ============================= end submit & check error functions ========================



// ============================= update & check form updates ========================
// check form updates
const checkFormUpdates = () => {
  let updates = "";

  if (supplier != null && oldSupplier != null) {
    if (supplier.fullname != oldSupplier.fullname) {
      updates += "Full Name updated. <br>";
    }
    if (supplier.callingname != oldSupplier.callingname) {
      updates += "Calling Name updated. <br>";
    }
    if (supplier.address != oldSupplier.address) {
      updates += "Address updated. <br>";
    }
    if (supplier.nic != oldSupplier.nic) {
      updates += "NIC updated. <br>";
    }
    if (supplier.driving_licence_no != oldSupplier.driving_licence_no) {
      updates += "Driving License No updated. <br>";
    }
    if (supplier.driving_licencen_expiredate != oldSupplier.driving_licencen_expiredate) {
      updates += "Driving License Expire Date updated. <br>";
    }
    if (supplier.email != oldSupplier.email) {
      updates += "Email updated. <br>";
    }
    if (supplier.mobileno != oldSupplier.mobileno) {
      updates += "Mobile Number updated. <br>";
    }
    if (supplier.account_holder_name != oldSupplier.account_holder_name) {
      updates += "Account Holder Name updated. <br>";
    }
    if (supplier.bank_name != oldSupplier.bank_name) {
      updates += "Bank Name updated. <br>";
    }
    if (supplier.branch_name != oldSupplier.branch_name) {
      updates += "Branch Name updated. <br>";
    }
    if (supplier.account_no != oldSupplier.account_no) {
      updates += "Account No updated. <br>";
    }
    if (supplier.transportname != oldSupplier.transportname) {
      updates += "Transport Name updated. <br>";
    }
    if (supplier.supplier_status_id.status != oldSupplier.supplier_status_id.status) {
      updates += "Status updated. <br>";
    }
    if (supplier.driving_status != oldSupplier.driving_status) {
      updates += "Driving Status updated. <br>";
    }
    if (supplier.company_name != oldSupplier.company_name) {
      updates += "Company Name updated. <br>";
    }
    if (supplier.company_reg_no != oldSupplier.company_reg_no) {
      updates += "Company Registration No updated. <br>";
    }
    if (supplier.company_address != oldSupplier.company_address) {
      updates += "Company Address updated. <br>";
    }
    if (supplier.company_email != oldSupplier.company_email) {
      updates += "Company Email updated. <br>";
    }
    if (supplier.company_contact_no != oldSupplier.company_contact_no) {
      updates += "Company Contact No updated. <br>";
    }
    if (supplier.company_contact_person_name != oldSupplier.company_contact_person_name) {
      updates += "Contact Person updated. <br>";
    }
    if (supplier.company_contact_person_email != oldSupplier.company_contact_person_email) {
      updates += "Contact Person Email updated. <br>";
    }
    if (supplier.company_contact_person_mobileno != oldSupplier.company_contact_person_mobileno) {
      updates += "Contact Person Mobile No updated. <br>";
    }
  }
  return updates;
};

// supplier form update
const supplierFormUpdate = () => {
  console.log(supplier);
  console.log(oldSupplier);
  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    let updates = checkFormUpdates();
    // updates not exit
    if (updates == "") {
      Swal.fire({
        title: "Nothing to Update",
        text: "No changes were detected in the supplier details.",
        icon: "info",
        allowOutsideClick: false,
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    } else {
      let userConfirm = Swal.fire({
        title: "Confirm Supplier Update",
        text: "Are you sure you want to update this supplier's details?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Update Supplier",
        cancelButtonText: "Cancel",
        allowOutsideClick: false,
        customClass: {
          cancelButton: "btn btn-1",
          confirmButton: "btn btn-2",
          popup: "swal2-border-radius",
        },
      }).then((userConfirm) => {
        if (userConfirm.isConfirmed) {
          //call putt service
          let putResponse = httpServiceRequest("/supplier/update", "PUT", supplier);
          if (putResponse == "ok") {
            Swal.fire({
              title: "Supplier Updated!",
              text: "The supplier details have been successfully updated.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: "swal2-border-radius",
              },
            });
            loadSupplierTable();
            refreshSupplierForm();
            $("#supplierForm").modal("hide");
          } else {
            Swal.fire({
              title: "Update Failed",
              text: putResponse,
              icon: "error",
              customClass: {
                confirmButton: "btn btn-1",
                popup: "swal2-border-radius",
              },
            });
          }
        } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: "Cancelled",
            text: "Details not Updated!",
            icon: "error",
            allowOutsideClick: false,
            customClass: {
              confirmButton: "btn btn-1",
              popup: "swal2-border-radius",
            },
          });
        }
      });
    }
  } else {
    Swal.fire({
      title: "Update Validation Error",
      html: `<div class="text-start">${errors}</div>`,
      icon: "error",
      confirmButtonText: "OK",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
  }
};
// ============================= end update & check form updates ========================



// ========================= refrsh form function ==================
// refersh form function
const refreshSupplierForm = () => {
  supplier = new Object();

  supplierRegistrationForm.reset();
  divParentRadio.innerHTML = "";

  document.getElementById("modalTitle").innerText = "Supplier Registration";
  document.getElementById("modalSubtitle").innerText = "Fill in the details below to register a new supplier in the system.";

  let supplierStatus = getServiceRequest("/supplierstatus/alldata");
  // delete status eka nathuwa gnnawa supplier status eka select karanawa
  const withoutDeletedStatus = supplierStatus.filter(status => status.status !== "Delete");

  dataFilIntoSelect(textSupplierStatus, "Select Status", withoutDeletedStatus, "status");

  const drivingStatusChkbox = document.getElementById("drivingStatusChkbox");

  drivingStatusChkbox.checked = false;
  labelDrivingStatus.innerText = "Is the supplier also a driver? No";
  supplier.driving_status = false;

  drivingLicenseDiv.style.display = "none";
  supplierDrivingLicenseExpireDateDiv.style.display = "none";

  setDefault([
    textSupplierFullName,
    textSupplierAddress,
    textSupplierNic,
    textSupplierDrivingLicenseNo,
    textSupplierDrivingLicenseExpireDate,
    textSupplierEmail,
    textSupplierMobileNo,
    textSupplierAccountHolderName,
    textSupplierBankName,
    textSupplierBranchName,
    textSupplierAccountNo,
    textSupplierStatus,
    textSupplierCategory,
    textSupplierCompanyName,
    textSupplierCompanyRegNo,
    textSupplierCompanyAddress,
    textSupplierCompanyEmail,
    textSupplierCompanyContactNo,
    textSupplierContactPersonName,
    textSupplierContactPersonMobileNo,
    textSupplierContactPersonEmail,
    textTransportName,
  ]);

  submitButton.style.display = "";
  updateButton.style.display = "none";
  textSupplierStatusDiv.style.display = "none";
  textSupplierCategory.disabled = false;

  currentdatevalidator("textSupplierDrivingLicenseExpireDate");

  individualCollapse.hide();
  companyCollapse.hide();
};
// ========================= end refrsh form function =========================



// =================== overlay view & print functions =========================
// Overlay animation helper functions
const openSupplierDetail = () => {
  toggleView("supplier-details-overlay", true);
  const backBtn = document.getElementById("backBtn");
  const overlay = document.getElementById("supplier-details-overlay");
  if (overlay) {
    // toggleView eka "block" widihata display karapuwath,
    // current + newpanel side-by-side ganna "flex" widihatama force karanawa
    overlay.style.display = "flex";
  }
  if (backBtn) {
    backBtn.style.display = "block";
    backBtn.onclick = () => {
      closeSupplierDetailOverlay();
    };
  }
};

const closeSupplierDetailOverlay = () => {
  toggleView("supplier-details-overlay", false);
  const backBtn = document.getElementById("backBtn");
  const overlay = document.getElementById("supplier-details-overlay");
  // print preview panel close karanwa (overlay close weda)
  if (overlay) {
    overlay.classList.remove("open");
  }
  if (backBtn) {
    backBtn.style.display = "none";
  }
};

// print view ekedi slide karanawa
document.addEventListener('DOMContentLoaded', function () {
  var overlay = document.getElementById('supplier-details-overlay');
  var openBtn = document.getElementById('openBtn');
  var closeBtn = document.getElementById('closeBtn');

  if (openBtn) {
    openBtn.addEventListener('click', function () {
      overlay.classList.add('open');
      openBtn.style.visibility = "hidden";
      printButtonCol.style.display = "none"; // Hide the print button column when the overlay is open

    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      overlay.classList.remove('open');
      openBtn.style.visibility = "visible";
      printButtonCol.style.display = "block"; // Show the print button column when the overlay is closed

    });
  }
});
// =================== overlay view & print functions =========================


// ==================== validation functions =========================
// define function for get calling name
const generateCallingName = (fullNameValue, selectedValue) => {
  let fullNameParts = fullNameValue.split(" ");
  divParentRadio.innerHTML = "";

  fullNameParts.forEach((part) => {
    const div = document.createElement("div");
    div.className = "form-check form-check-inline";
    const input = document.createElement("input");
    input.className = "form-check-input";
    input.value = part;
    input.onchange = () => {
      supplier.callingname = part;
    };
    input.name = "fullnameparts";
    input.type = "radio";
    const label = document.createElement("label");
    label.innerText = part;
    label.className = "form-check-label fw-bold text-muted";

    if (selectedValue != "" && selectedValue == part) {
      input.checked = "checked";
    }
    div.appendChild(input);
    div.appendChild(label);
    divParentRadio.appendChild(div);
  });
};

// categeru eka select karaddi adala details view wenna oni
let textSupplierCategory = document.getElementById("textSupplierCategory");
const individualCollapse = new bootstrap.Collapse(document.getElementById("individualSupplierDetails"), { toggle: false });
const companyCollapse = new bootstrap.Collapse(document.getElementById("companyDetails"), { toggle: false });
textSupplierCategory.addEventListener("change", () => {
  // object eka clean wenna oni
  supplier = {};
  let selectedCategory = textSupplierCategory.value;
  if (selectedCategory === "Company") {
    individualCollapse.hide();
    companyCollapse.show();
    supplier.driving_status = false;
    supplier.category_type = textSupplierCategory.value
    setDefault([
      textSupplierFullName,
      textSupplierAddress,
      textSupplierNic,
      textSupplierDrivingLicenseNo,
      textSupplierDrivingLicenseExpireDate,
      textSupplierEmail,
      textSupplierMobileNo,
      textSupplierAccountHolderName,
      textSupplierBankName,
      textSupplierBranchName,
      textSupplierAccountNo,
      textSupplierStatus,
      textSupplierCompanyName,
      textSupplierCompanyRegNo,
      textSupplierCompanyAddress,
      textSupplierCompanyEmail,
      textSupplierCompanyContactNo,
      textSupplierContactPersonName,
      textSupplierContactPersonMobileNo,
      textSupplierContactPersonEmail,
      textTransportName
    ]);
    // form reset without catiegary
    // Store the current category value
    let currentCategory = textSupplierCategory.value;
    // Reset the form
    supplierRegistrationForm.reset();
    // Restore the category value
    textSupplierCategory.value = currentCategory;
  } else if (selectedCategory === "Individual") {
    individualCollapse.show();
    companyCollapse.hide();
    supplier.driving_status = false;

    // object eka bind karanwa
    supplier.category_type = textSupplierCategory.value
    setDefault([
      textSupplierFullName,
      textSupplierAddress,
      textSupplierNic,
      textSupplierDrivingLicenseNo,
      textSupplierDrivingLicenseExpireDate,
      textSupplierEmail,
      textSupplierMobileNo,
      textSupplierAccountHolderName,
      textSupplierBankName,
      textSupplierBranchName,
      textSupplierAccountNo,
      textSupplierStatus,
      textSupplierCompanyName,
      textSupplierCompanyRegNo,
      textSupplierCompanyAddress,
      textSupplierCompanyEmail,
      textSupplierCompanyContactNo,
      textSupplierContactPersonName,
      textSupplierContactPersonMobileNo,
      textSupplierContactPersonEmail,
      textTransportName
    ]);
    let currentCategory = textSupplierCategory.value;
    // Reset the form
    supplierRegistrationForm.reset();
    // Restore the category value
    textSupplierCategory.value = currentCategory;
  }
});

//full name validator
textSupplierFullName.addEventListener("keyup", () => {
  const supplierFullNameValue = textSupplierFullName.value;
  if (supplierFullNameValue !== "") {
    if (new RegExp("^([A-Z][a-z]{1,20}[\\s])+([A-Z][a-z]{2,20})$").test(supplierFullNameValue)) {
      supplier.fullname = supplierFullNameValue;
      textSupplierFullName.classList.remove("is-invalid");
      textSupplierFullName.classList.add("is-valid");

      let supplierFullNameParts = supplierFullNameValue.split(" ");

      generateCallingName(supplierFullNameValue, supplier.callingname);
    } else {
      textSupplierFullName.classList.add("is-invalid");
      textSupplierFullName.classList.remove("is-valid");
      supplier.fullname = null;
    }
  } else {
    if (textSupplierFullName.required) {
      textSupplierFullName.classList.add("is-invalid");
      textSupplierFullName.classList.remove("is-valid");
      supplier.fullname = null;
    } else {
      textSupplierFullName.classList.remove("is-invalid");
      supplier.fullname = null;
    }
  }
});


// // calling name validater
// const callingNameValidator = (callingNameElement) => {
//     const supplierCallingNameValue = callingNameElement.value;
//     const supplierFullNameValue = textSupplierFullName.value;
//     let supplierFullNameParts = supplierFullNameValue.split(" ");

//     if (supplierCallingNameValue !== "") {
//         let extIndex = supplierFullNameParts.indexOf(supplierCallingNameValue);
//         if (extIndex != -1) {
//             callingNameElement.classList.add("is-valid");
//             callingNameElement.classList.remove("is-invalid");
//             supplier.callingname = textSupplierCallingName.value;
//         } else {
//             callingNameElement.classList.add("is-invalid");
//             callingNameElement.classList.remove("is-valid");
//             supplier.callingname = null;
//         }
//     } else {
//         callingNameElement.classList.add("is-invalid");
//         callingNameElement.classList.remove("is-valid");
//         supplier.callingname = null;
//     }

// }



// ==================== end validation functions =========================


// ================== driving status change function =========================
const handleDrivingStatusChange = (checkbox) => {
  if (checkbox.checked) {
    supplier.driving_status = true;
    labelDrivingStatus.innerText = "Is the supplier also a driver? Yes";
    drivingLicenseDiv.style.display = "";
    supplierDrivingLicenseExpireDateDiv.style.display = "";
  } else {
    supplier.driving_status = false;
    labelDrivingStatus.innerText = "Is the supplier also a driver? No";
    drivingLicenseDiv.style.display = "none";
    supplierDrivingLicenseExpireDateDiv.style.display = "none";
  }
};
// ================= end driving status change function =========================



// ======================== export table functionality =========================
const exportSupplierTable = (type) => {
  const activeTab = $(".nav-tabs .nav-link.active").attr("id");
  const tableId = activeTab === "nav-individual-tab" ? "#supplierTable" : "#supplierTableCompany";
  const table = $(tableId).DataTable();

  if (type === "excel") {
    // Basic CSV/Excel export logic
    let csv = [];
    const rows = $(tableId + " tr");
    for (let i = 0; i < rows.length; i++) {
      let row = [],
        cols = rows[i].querySelectorAll("td, th");
      for (let j = 0; j < cols.length - 1; j++) row.push(cols[j].innerText);
      csv.push(row.join(","));
    }
    const csvContent = "data:text/csv;charset=utf-8," + csv.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `suppliers_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
  } else if (type === "pdf" || type === "print") {
    window.print();
  }
};
// Export Functionality
const exportTable = (type) => {
  // active tab eka anuwa table eka select karanawa
  const activeTab = $("#nav-tab .nav-link.active").attr("id");
  const tableId = activeTab === "nav-individual-tab" ? "#supplierTable" : "#supplierTableCompany";
  const table = $(tableId).DataTable();
  console.log(activeTab);
  console.log(tableId);
  if (type === "excel") {
    exportTableToExcelWithSheetJS(tableId, "suppliers", { sheetName: "Suppliers" });
  } else if (type === "pdf") {
    exportTableToPdfWithJsPdf(tableId, "suppliers", { title: "Suppliers" });
  } else if (type === "print") {
    printCustomer();
  }
};


// ======================== end export table functionality =========================

// modal eka close weddi form eka clear karan function eka
formResetFunctionWhenClosingModal("supplierForm", "supplierRegistrationForm", refreshSupplierForm);


//Alert Box Call function
Swal.isVisible();