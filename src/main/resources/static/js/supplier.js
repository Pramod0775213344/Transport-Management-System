let individualSuppliers = [];
let companySuppliers = [];

window.addEventListener("load", () => {
  // Initial data fetch
  individualSuppliers = getServiceRequest("/supplier/individual") || [];
  companySuppliers = getServiceRequest("/supplier/company") || [];

  // Initial load
  SearchSupplier();

  refreshSupplierForm(); // Clear the form
});

// Function for searching and filtering supplier
const SearchSupplier = () => {
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

// function for load supplier table
const loadSupplierTable = (suppliers) => {
  // Check which tab is active to load the correct table
  const individualTabActive = $("#nav-individual-tab").hasClass("active");

  if (individualTabActive) {
    if ($.fn.dataTable.isDataTable("#supplierTable")) {
      $("#supplierTable").DataTable().destroy();
    }
    const propertyList = [
      { propertyName: "fullname", dataType: "string" },
      { propertyName: "driving_licence_no", dataType: "string" },
      { propertyName: "nic", dataType: "string" },
      { propertyName: "email", dataType: "string" },
      { propertyName: "mobileno", dataType: "string" },
      { propertyName: getDrivingStatus, dataType: "function" },
      { propertyName: getSupplierStatus, dataType: "function" },
    ];

    dataFillIntoTheTable(supplierTableBody, suppliers, propertyList, supplierView, supplierEdit, supplierDelete, true);

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
  } else {
    // Company Tab logic
    if ($.fn.dataTable.isDataTable("#supplierTableCompany")) {
      $("#supplierTableCompany").DataTable().destroy();
    }
    const companyPropertyList = [
      { propertyName: "company_name", dataType: "string" },
      { propertyName: "company_reg_no", dataType: "string" },
      { propertyName: "company_email", dataType: "string" },
      { propertyName: "company_contact_no", dataType: "string" },
      { propertyName: getSupplierStatus, dataType: "function" },
    ];

    dataFillIntoTheTable(supplierTableBodyCompany, suppliers, companyPropertyList, supplierView, supplierEdit, supplierDelete, true);

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

// Table View Button
const supplierView = (dataOb) => {
  //     modal eake data display karanwa
  $("#supplierViewModal").modal("show");

  console.log(dataOb);

  // set data to modal

  if (dataOb.category_type === "Company") {
    companySection.style.display = "";
    individualSupplier.style.display = "none";

    supplierNameFirstLetter.innerText = dataOb.company_name.charAt(0).toUpperCase();
    viewSupplierName.innerText = dataOb.company_name;
    viewCompanyName.innerText = dataOb.company_name;
    viewCompanyRegNo.innerText = dataOb.company_reg_no;
    viewCompanyAddress.innerText = dataOb.company_address;
    viewCompanyEmail.innerText = dataOb.company_email;
    ViewCompanyContactNo.innerText = dataOb.company_contact_no;
    viewContactPersonName.innerText = dataOb.company_contact_person_mobileno;
    viewContactPersonMobileNo.innerText = dataOb.company_contact_person_mobileno;
    viewContactPersonEmail.innerText = dataOb.company_contact_person_email;
  } else {
    companySection.style.display = "none";
    individualSupplier.style.display = "";

    supplierNameFirstLetter.innerText = dataOb.fullname.charAt(0).toUpperCase();
    viewSupplierName.innerText = dataOb.fullname;
    viewFullName.innerText = dataOb.fullname;
    viewCallingName.innerText = dataOb.callingname;
    viewAddress.innerText = dataOb.address;
    if (dataOb.driving_status) {
      viewDriverStatus.innerText = "Yes";
      //     remove class from red
      viewDriverStatus.classList.remove("inactive");
      //     add class to green
      viewDriverStatus.classList.add("active");
    } else {
      viewDriverStatus.innerText = "No";
      viewDriverStatus.classList.remove("active");
      viewDriverStatus.classList.add("inactive");
    }

    viewDlNo.innerText = dataOb.driving_licence_no;
    viewDlExp.innerText = dataOb.driving_licencen_expiredate;
    viewNic.innerText = dataOb.nic;
    viewEmail.innerText = dataOb.email;
    ViewMobile.innerText = dataOb.mobileno;
  }

  viewTransportName.innerText = dataOb.transportname;

  viewAccName.innerText = dataOb.account_holder_name;
  viewBankName.innerText = dataOb.bank_name;
  viewBranchName.innerText = dataOb.branch_name;
  viewAccNo.innerText = dataOb.account_no;
  viewTransportName2.innerText = dataOb.transportname;

  if (dataOb.supplier_status_id.status == "Active") {
    viewStatus.classList.remove("inactive");
    viewStatus.classList.remove("delete");
    viewStatus.classList.add("active");
    viewStatus.innerText = dataOb.supplier_status_id.status;
  }
  if (dataOb.supplier_status_id.status == "Inactive") {
    viewStatus.classList.remove("active");
    viewStatus.classList.remove("delete");
    viewStatus.classList.add("inactive");
    viewStatus.innerText = dataOb.supplier_status_id.status;
  }
  if (dataOb.supplier_status_id.status == "Delete") {
    viewStatus.classList.remove("active");
    viewStatus.classList.remove("inactive");
    viewStatus.classList.add("delete");
    viewStatus.innerText = dataOb.supplier_status_id.status;
  }
};

// print view eka floating rate booking invoice ekata
const printSupplier = () => {
  document.getElementById("printButton").style.display = "none";
  let newWindow = window.open();
  let preview =
    "<html><head><title>TMS</title><link rel='stylesheet' href='/css/supplier.css'><link rel='stylesheet' href='/css/common.css.css'><link rel='stylesheet' href='/bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'><script src='/bootstrap/bootstrap-5.2.3/js/bootstrap.bundle.min.js'></script></head><body>" +
    "<div class='row'><div class='col-12'>" +
    printViewModalBody.outerHTML +
    "</div></div></body></html>";

  newWindow.document.write(preview);

  setTimeout(() => {
    newWindow.stop();
    newWindow.print();
    newWindow.close();
  }, 500);

  document.getElementById("printButton").style.display = "block";
};

const supplierEdit = (dataOb) => {
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
    textSupplierContactPersonName.value = dataOb.company_contact_person;
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

// Table Delete Button
const supplierDelete = (dataOb) => {
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
  let selectedCategory = textSupplierCategory.value;
  if (selectedCategory === "Company") {
    individualCollapse.hide();
    companyCollapse.show();
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
    if (supplier.company_contact_person == null) {
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
          loadSupplierTable(companySuppliers);
          refreshSupplierForm();
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
    if (supplier.company_contact_person != oldSupplier.company_contact_person) {
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

// refersh form function
const refreshSupplierForm = () => {
  supplier = new Object();

  supplierRegistrationForm.reset();
  divParentRadio.innerHTML = "";

  document.getElementById("modalTitle").innerText = "Supplier Registration";
  document.getElementById("modalSubtitle").innerText = "Fill in the details below to register a new supplier in the system.";

  let supplierStatus = getServiceRequest("/supplierstatus/alldata");
  dataFilIntoSelect(textSupplierStatus, "Select Status", supplierStatus, "status");

  const drivingStatusChkbox = document.getElementById("drivingStatusChkbox");
  drivingStatusChkbox.checked = false;
  labelDrivingStatus.innerText = "Is the supplier also a driver? No";
  supplier.driving_status = false;
  drivingLicenseDiv.style.display = "";
  supplierDrivingLicenseExpireDateDiv.style.display = "";

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

// table eke loading spin eka load karanwa
function showTableLoading() {
  const loader1 = document.getElementById("loaderId1");
  const supplierTable = document.getElementById("supplierTable");
  loader1.style.display = ""; // Clear loading after 2 seconds
  supplierTable.style.display = "none"; // Hide the booking table while loading
  setTimeout(() => {
    const loader = document.getElementById("loaderId");
    loader1.style.display = "none"; // Clear loading after 2 seconds
    supplierTable.style.display = ""; // Hide the booking table while loading
  }, 500);
}

// table eke loading spin eka load karanwa
function showTableLoading2() {
  const loader2 = document.getElementById("loaderId2");
  const supplierTableCompany = document.getElementById("supplierTableCompany");
  loader2.style.display = ""; // Clear loading after 2 seconds
  supplierTableCompany.style.display = "none"; // Hide the booking table while loading
  setTimeout(() => {
    const loader = document.getElementById("loaderId");
    loader2.style.display = "none"; // Clear loading after 2 seconds
    supplierTableCompany.style.display = ""; // Hide the booking table while loading
  }, 500);
}
// modal eka close weddi form eka clear karan function eka
formResetFunctionWhenClosingModal("supplierForm", "supplierRegistrationForm", refreshSupplierForm);
//Alert Box Call function
Swal.isVisible();
