window.addEventListener("load", () => {
  // load weddi table eka load karanawa
  loadDriverTable();

  // load weddi form eka refresh karanwa
  refreshDriverForm();
});

// search function
const SearchDriver = () => {
  const driverTable = $("#driverTable").DataTable();

  const searchDriverName = $("#searchDriverName").val().toLowerCase();
  const searchTransportName = $("#searchTransportName").val().toLowerCase();
  const searchStatus = $("#serachStatus").val();

  driverTable.columns(3).search(searchDriverName); // Name column
  driverTable.columns(2).search(searchTransportName); // Transport column

  if (searchStatus) {
    driverTable.columns(6).search(searchStatus); // Exact status match
  } else {
    driverTable.columns(6).search("");
  }

  driverTable.draw();
};

// reset search function
const resetSearchDriver = () => {
  $("#searchDriverName").val("");
  $("#searchTransportName").val("");
  $("#serachStatus").val("");
  $("#tableSearch").val("");

  const table = $("#driverTable").DataTable();
  table.search("").columns().search("").draw();
};

// load the driver table
const loadDriverTable = () => {
  if ($.fn.dataTable.isDataTable("#driverTable")) {
    $("#driverTable").DataTable().destroy();
  }

  const drivers = getServiceRequest("/driver/alldata");

  const propertyList = [
    { propertyName: getDriverRegNo, dataType: "function" },
    { propertyName: getSupplier, dataType: "function" },
    { propertyName: "callingname", dataType: "string" },
    { propertyName: "driving_license_no", dataType: "string" },
    { propertyName: "mobileno", dataType: "string" },
    { propertyName: getDriverStatus, dataType: "function" },
  ];

  dataFillIntoTheTable(driverTableBody, drivers, propertyList, driverView, driverEdit, driverDelete, true);

  const table = $("#driverTable").DataTable({
    dom: "rtip", // Hide default search and length
    pageLength: 10,
    createdRow: function (row, data, dataIndex) {
      $(row).find("td").css({
        "text-align": "center",
        "vertical-align": "middle",
        height: "80px",
      });
    },
    headerCallback: function (thead, data, start, end, display) {
      $(thead).find("th").css({
        "text-align": "center",
        padding: "20px",
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
};

const getDriverRegNo = (dataOb) => {
  return "<span class ='unique_no'>" + dataOb.driver_reg_no + "</span >";
};

// get supplier name
const getSupplier = (dataOb) => {
  if (dataOb.supplier_id != null) {
    return dataOb.supplier_id.transportname;
  } else {
    return "-";
  }
};

// get driver Status
const getDriverStatus = (dataOb) => {
  if (dataOb.driver_status_id.status == "Active") {
    return "<span class='status-badge status-active'> <span class='dot'> </span>" + dataOb.driver_status_id.status + "</span>";
  }

  if (dataOb.driver_status_id.status == "Inactive") {
    return "<span class='status-badge status-pending'> <span class='dot'> </span>" + dataOb.driver_status_id.status + "</span>";
  }
  if (dataOb.driver_status_id.status == "Deleted") {
    return "<span class='status-badge status-inactive'> <span class='dot'> </span>" + dataOb.driver_status_id.status + "</span>";
  }
};

// Tab switching for Driver View Profile (Mirroring employee profile behavior)
const switchDriverProfileTab = (tabName) => {
  // Hide all panes
  document.querySelectorAll(".tab-pane-profile").forEach((pane) => {
    pane.classList.add("d-none");
  });

  // Show target pane
  document.getElementById("tab-" + tabName).classList.remove("d-none");

  // Update button active state
  document.querySelectorAll(".profile-tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Find which button to activate
  if (tabName === "personal") document.getElementById("tabBtnPersonal").classList.add("active");
  if (tabName === "license") document.getElementById("tabBtnLicense").classList.add("active");
  if (tabName === "supplier") document.getElementById("tabBtnSupplier").classList.add("active");
};

// define driver details view
const driverView = (dataOb) => {
  // Default to personal tab
  switchDriverProfileTab("personal");

  dataDriverName.innerText = dataOb.fullname;
  dataDriverName2.innerText = dataOb.fullname;
  dataDriverRegNo.innerText = dataOb.driver_reg_no;

  let transportProvider = dataOb.supplier_id ? dataOb.supplier_id.transportname : "Company Owned";
  dataTransportName.innerText = transportProvider;
  dataTransportNameTop.innerText = transportProvider;

  // Set Profile Avatar (Initials)
  let driverName = dataOb.fullname;
  let driverLetters = driverName.match(/\b\w/g).join("").toUpperCase();
  dataDriverNameLetters.innerText = driverLetters.substring(0, 2);

  // Set Status Badge
  dataStatusBadge.innerText = dataOb.driver_status_id.status;
  dataDriverStatusTxt.innerText = dataOb.driver_status_id.status;

  // Set Profile Designation/Category Top
  let driverCat = dataOb.supplier_id ? "Supplier Driver" : "Company Driver";
  dataDriverCategoryTop.innerText = driverCat;
  dataDriverCategory.innerText = driverCat;

  // Set Detailed Info
  dataDriverNic.innerText = dataOb.nic;
  dataDriverMobile.innerText = dataOb.mobileno;
  dataDriverEmail.innerText = dataOb.email || "Not Provided";

  dataDLNo.innerText = dataOb.driving_license_no;
  dataDlExpireDate.innerText = dataOb.driving_license_expire_date;

  // Supplier Details
  if (dataOb.supplier_id) {
    if (dataOb.supplier_id.category_type === "Company") {
      let companyName = dataOb.supplier_id.company_name;
      let letters = companyName.match(/\b\w/g).join("").toUpperCase();
      dataSupplierNameLetters.innerText = letters.substring(0, 2);

      dataSupplierName.innerText = companyName;
      dataSupplierAddress.innerText = dataOb.supplier_id.company_address;
      dataSupplierMobile.innerText = dataOb.supplier_id.company_contact_no;
      dataSupplierEmail.innerText = dataOb.supplier_id.company_email;
    } else {
      let supplierName = dataOb.supplier_id.fullname;
      let letters = supplierName.match(/\b\w/g).join("").toUpperCase();
      dataSupplierNameLetters.innerText = letters.substring(0, 2);

      dataSupplierName.innerText = supplierName;
      dataSupplierAddress.innerText = dataOb.supplier_id.address;
      dataSupplierMobile.innerText = dataOb.supplier_id.mobileno;
      dataSupplierEmail.innerText = dataOb.supplier_id.email;
    }
  } else {
    dataSupplierNameLetters.innerText = "OKI";
    dataSupplierName.innerText = "Okidoki (Pvt) Ltd";
    dataSupplierAddress.innerText = "Colombo, Sri Lanka";
    dataSupplierMobile.innerText = "0112 XXXXXXX";
    dataSupplierEmail.innerText = "info@okidoki.lk";
  }

  $("#driverViewModal").modal("show");
};

// driver profile print function
const driverFromPrint = () => {
  // Show all tabs for printing so all info is visible
  document.querySelectorAll(".tab-pane-profile").forEach((pane) => {
    pane.classList.remove("d-none");
  });

  let newWindow = window.open();
  let printView =
    "<head><title>TMS - Driver Profile</title><link rel='stylesheet' href='/css/common.css'><link rel='stylesheet' href='/css/driver.css'><link rel='stylesheet' href='/bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'>" +
    "<style>body{padding:20px; font-family: 'Poppins', sans-serif;} .modal-footer, .close-btn, .profile-tabs-nav {display:none !important;} " +
    ".rounded-4{border: 1px solid #f1f5f9 !important; border-radius: 1rem !important;} .bg-light{background-color: #f8fafc !important;} " +
    ".tab-pane-profile{display: block !important;} .content-section{page-break-inside: avoid; margin-bottom: 25px !important;} " +
    ".profile-top-banner{padding: 20px !important;}</style></head><body>" +
    "<div>" +
    viewModal.outerHTML +
    "</div></body>";
  newWindow.document.write(printView);

  setTimeout(() => {
    newWindow.stop();
    newWindow.print();
    newWindow.close();
    // Re-hide non-active tabs after printing
    switchDriverProfileTab("personal");
  }, 500);
};

// define driver edit function
const driverEdit = (dataOb) => {
  if (dataOb.supplier_id == null) {
    radioOwnDriver.checked = "checked";
    supplierDiv.style.display = "none";
    textTransportName.removeAttribute("required");
    textTransportName.value = "";
  } else {
    radioNonOwnDriver.checked = "checked";
    supplierDiv.style.display = "";
    textTransportName.setAttribute("required", "required");
    textTransportName.value = JSON.stringify(dataOb.supplier_id);
  }

  textDriverFullName.value = dataOb.fullname;

  const fullNameParts = textDriverFullName.value.split(" ");
  generateCallingName(dataOb.fullname, dataOb.callingname);

  textDriverNic.value = dataOb.nic;

  textDrivingLicenseNo.value = dataOb.driving_license_no;

  textDrivingLicenseExpireDate.value = dataOb.driving_license_expire_date;

  textDriverEmail.value = dataOb.email;

  textDriverMobileNo.value = dataOb.mobileno;

  textDriverStatus.value = JSON.stringify(dataOb.driver_status_id);

  updateButton.style.display = "";
  submitButton.style.display = "none";
  statusDiv.style.display = "";

  $("#driverModal").modal("show");

  driver = JSON.parse(JSON.stringify(dataOb));
  oldDriver = JSON.parse(JSON.stringify(dataOb));
};

// tabel delete button
const driverDelete = (dataOb) => {
  console.log("Delete", dataOb);

  let userConfirm = Swal.fire({
    title: "Confirm Driver Deletion",
    text: "Are you sure you want to delete this driver's record? This action cannot be undone!",
    icon: "warning",
    iconColor: "#ef4444",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete Driver",
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
      let deleteResponse = httpServiceRequest("/driver/delete", "DELETE", dataOb);
      if (deleteResponse == "ok") {
        Swal.fire({
          title: "Driver Deleted!",
          text: "The driver record has been successfully removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-border-radius",
          },
        });
        loadDriverTable();
        refreshDriverForm();
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

// generate calling name
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
      driver.callingname = part;
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

//full Name validator
textDriverFullName.addEventListener("keyup", () => {
  const fullNameValue = textDriverFullName.value;

  if (fullNameValue !== "") {
    if (new RegExp("^([A-Z][a-z]{1,20}[\\s])+([A-Z][a-z]{2,20})$").test(fullNameValue)) {
      driver.fullname = fullNameValue;
      textDriverFullName.classList.remove("is-invalid");
      textDriverFullName.classList.add("is-valid");

      let fullNameParts = fullNameValue.split(" ");

      generateCallingName(fullNameValue);
    } else {
      textDriverFullName.classList.remove("is-valid");
      textDriverFullName.classList.add("is-invalid");
      driver.fullname = null;
    }
  } else {
    if (textDriverFullName.required) {
      textDriverFullName.classList.remove("is-valid");
      textDriverFullName.classList.add("is-invalid");
      driver.fullname = null;
    } else {
      textDriverFullName.classList.remove("is-invalid");
      driver.fullname = null;
    }
  }
});

// driver category selection logic
const selectedRadioBtn = document.querySelectorAll('input[name="driverCategory"]');
selectedRadioBtn.forEach((radio) => {
  radio.addEventListener("change", (e) => {
    const selectedValue = e.target.value;

    if (selectedValue === "Own") {
      supplierDiv.style.display = "none";
      driver.supplier_id = null;
      textTransportName.value = "";
      textTransportName.classList.remove("is-valid", "is-invalid");
      textTransportName.removeAttribute("required");
    } else {
      supplierDiv.style.display = "";
      textTransportName.setAttribute("required", "required");
    }
  });
});

// define check error function
const checkFormError = () => {
  let errors = "";

  if (document.getElementById("radioNonOwnDriver").checked && driver.supplier_id == null) {
    errors += "Please select the Transport/Supplier Name. <br>";
    textTransportName.classList.add("is-invalid");
  }
  if (driver.fullname == null) {
    errors += "Please enter the Full Name. <br>";
    textDriverFullName.classList.add("is-invalid");
  }
  if (driver.callingname == null) {
    errors += "Please select the Calling Name. <br>";
  }
  if (driver.nic == null) {
    errors += "Please enter the NIC Number. <br>";
    textDriverNic.classList.add("is-invalid");
  }
  if (driver.driving_license_no == null) {
    errors += "Please enter the Driving License Number. <br>";
    textDrivingLicenseNo.classList.add("is-invalid");
  }
  if (driver.driving_license_expire_date == null) {
    errors += "Please select the Driving License Expiration Date. <br>";
    textDrivingLicenseExpireDate.classList.add("is-invalid");
  }
  if (driver.mobileno == null) {
    errors += "Please enter the Mobile Number. <br>";
    textDriverMobileNo.classList.add("is-invalid");
  }

  return errors;
};

// define submite function
const driverFormSubmit = () => {
  console.log(driver);
  // check form error for required element
  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    // errors not exit
    //need to get user confirmation

    let userConfirm = Swal.fire({
      title: "Confirm Driver Registration",
      text: "Are you sure you want to register this new driver?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Register Driver",
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
        let postResponse = httpServiceRequest("/driver/insert", "POST", driver);
        if (postResponse == "ok") {
          Swal.fire({
            title: "Driver Registered!",
            text: "New driver record has been successfully created.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          loadDriverTable();
          refreshDriverForm();
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
  console.log(driver);
};

// define check form update function
const checkFormUpdates = () => {
  let updates = "";

  if (driver != null && oldDriver != null) {
    if (driver.supplier_id.transportname != oldDriver.supplier_id.transportname) {
      updates += "Transport Name updated. <br>";
    }
    if (driver.fullname != oldDriver.fullname) {
      updates += "Full Name updated. <br>";
    }
    if (driver.callingname != oldDriver.callingname) {
      updates += "Calling Name updated. <br>";
    }
    if (driver.nic != oldDriver.nic) {
      updates += "NIC updated. <br>";
    }
    if (driver.driving_license_no != oldDriver.driving_license_no) {
      updates += "Driving License No updated. <br>";
    }
    if (driver.driving_license_expire_date != oldDriver.driving_license_expire_date) {
      updates += "Driving License Expire Date updated. <br>";
    }
    if (driver.mobileno != oldDriver.mobileno) {
      updates += "Mobile Number updated. <br>";
    }
    if (driver.driver_status_id.status != oldDriver.driver_status_id.status) {
      updates += "Status updated. <br>";
    }
  }

  return updates;
};

// define form update function
const driverFormUpdate = () => {
  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    let updates = checkFormUpdates();
    // updates not exit
    if (updates == "") {
      Swal.fire({
        title: "Nothing to Update",
        text: "No changes were detected in the driver details.",
        icon: "info",
        allowOutsideClick: false,
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    } else {
      let userConfirm = Swal.fire({
        title: "Confirm Driver Update",
        text: "Are you sure you want to update this driver's details?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Update Driver",
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
          let putResponse = httpServiceRequest("/driver/update", "PUT", driver);
          if (putResponse == "ok") {
            Swal.fire({
              title: "Driver Updated!",
              text: "The driver details have been successfully updated.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: "swal2-border-radius",
              },
            });
            loadDriverTable();
            refreshDriverForm();
            $("#driverModal").modal("hide");
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

// define refresh form function
const refreshDriverForm = () => {
  driver = new Object();

  // form reset
  driverRegistrationForm.reset();

  supplierDiv.style.display = "";
  textTransportName.setAttribute("required", "required");

  //form get intial color when refresh the form
  setDefault([
    textDriverFullName,
    textDriverNic,
    textDrivingLicenseNo,
    textDrivingLicenseExpireDate,
    textDriverEmail,
    textDriverMobileNo,
    textDriverStatus,
    textTransportName,
  ]);

  let transportName = getServiceRequest("/supplier/alldata");
  dataFilIntoSelect(textTransportName, "Select Supplier", transportName, "transportname");

  let driverStatus = getServiceRequest("/driverstatus/alldata");
  dataFilIntoSelect(textDriverStatus, "Select Status", driverStatus, "status");

  // current date validate and previous date restrict
  currentdatevalidator("textDrivingLicenseExpireDate");

  submitButton.style.display = "";
  updateButton.style.display = "none";
  statusDiv.style.display = "none";
};

// modal eka close weddi form eka clear karan function eka
formResetFunctionWhenClosingModal("driverModal", "driverRegistrationForm", refreshSupplierForm);

//Alert Box Call function
Swal.isVisible();
