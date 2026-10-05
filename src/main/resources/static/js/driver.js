
// ================== load functions ===============================
window.addEventListener("load", () => {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      // load weddi table eka load karanawa
      loadDriverTable();

      // load weddi form eka refresh karanwa
      refreshDriverForm();
    } catch (e) {
      console.error("Error during driver page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);
  $("#textTransportName").select2({
    theme: "bootstrap-5",
    dropdownParent: $("#driverModal"),
  });
});
// ================= end load functions ===============================

// ================= search and filter functions ===============================
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
// =============== end search and filter functions ===============================

// ============== load table functions ===========================================
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

  applyPrivileges("Driver Management", "driverTable", {
    add: addButton,
  });

  table.on("draw.dt", function () {
    applyPrivileges("Driver Management", "driverTable", { add: addButton });
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
// ============== end load tabel functions =======================================

// =============== driver delete function =========================================
// tabel delete button
const driverDelete = (dataOb) => {
  // delete karpu record ekak aye delete kranna bari wennath oni
  if (dataOb.driver_status_id.status === "Deleted") {
    Swal.fire({
      title: "Driver Already Deleted",
      text: "This driver record has already been deleted.",
      icon: "error",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    return;
  }

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
// ================ end driver delete function =========================================


// =============== view & print driver details function =========================================
// define driver details view
const driverView = (dataOb) => {

  console.log(dataOb);

  // Set Headers
  viewDriverNameHeader.innerText = dataOb.fullname || "-";
  viewTransportNameHeader.innerText = dataOb.supplier_id ? dataOb.supplier_id.transportname : "Okidoki (Company Driver)";

  // Personal Information
  viewName.innerText = dataOb.fullname || "-";
  viewCallingName.innerText = dataOb.callingname || "-";
  viewMobileNo.innerText = dataOb.mobileno || "-";
  viewDrivingLicenseNo.innerText = dataOb.driving_license_no || "-";
  viewDrivingLicenseExpiryDate.innerText = dataOb.driving_license_expire_date || "-";
  viewNIC.innerText = dataOb.nic || "-";

  // Status Badge
  const status = dataOb.driver_status_id.status;
  if (status == "Active") {
    viewStatus.innerHTML = "<span class='status-badge status-active'> <span class='dot'> </span>" + status + "</span>";
  } else if (status == "Inactive") {
    viewStatus.innerHTML = "<span class='status-badge status-pending'> <span class='dot'> </span>" + status + "</span>";
  } else if (status == "Deleted" || status == "Delete") {
    viewStatus.innerHTML = "<span class='status-badge status-inactive'> <span class='dot'> </span>" + status + "</span>";
  }

  // Profile Photo / Initials
  const imgEl = document.getElementById("viewImage");
  const initialsEl = document.getElementById("viewImageInitials");

  if (dataOb.profile_photo_url) {
    imgEl.src = dataOb.profile_photo_url;
    imgEl.style.display = "block";
    initialsEl.style.display = "none";
  } else {
    imgEl.style.display = "none";
    initialsEl.style.display = "flex";
    initialsEl.innerText = getInitials(dataOb.fullname);
  }

  function getInitials(name) {
    if (!name) return "-";
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(word => word[0].toUpperCase())
      .join("");
  }

  // Supplier Card Population
  if (dataOb.supplier_id != null) {
    const supplierOb = dataOb.supplier_id;
    if (supplierOb.category_type === "Individual") {
      individualSupplierCard.style.display = "";
      companySupplierCard.style.display = "none";

      viewSupplierFullName.innerText = supplierOb.fullname || "-";
      viewSupplierCallingName.innerText = supplierOb.callingname || "-";
      viewSupplierNic.innerText = supplierOb.nic || "-";
      document.querySelectorAll("#viewSupplierAddress").forEach(el => el.innerText = supplierOb.address || "-");
      viewSupplierEmail.innerText = supplierOb.email || "-";
      viewSupplierMobileNo.innerText = supplierOb.mobileno || "-";
      if (supplierOb.driving_status) {
        viewDrivingLicensNo.innerText = supplierOb.driving_licence_no || "-";
        viewDlExpireDate.innerText = supplierOb.driving_licencen_expiredate || "-";
      } else {
        viewDrivingLicensNo.innerText = "-";
        viewDlExpireDate.innerText = "-";
      }
      // Populate individual supplier status badge
      const supStatusEl = individualSupplierCard.querySelector("#viewStatus");
      if (supStatusEl) {
        supStatusEl.innerHTML = getStatusBadge(supplierOb.supplier_status_id.status);
      }

      const supImgEl = individualSupplierCard.querySelector(".profile-photo");
      const supInitialsEl = individualSupplierCard.querySelector(".initials-avatar");
      if (supImgEl && supInitialsEl) {
        if (supplierOb.profile_photo_url) {
          supImgEl.src = supplierOb.profile_photo_url;
          supImgEl.style.display = "block";
          supInitialsEl.style.display = "none";
        } else {
          supImgEl.style.display = "none";
          supInitialsEl.style.display = "flex";
          supInitialsEl.innerText = getInitials(supplierOb.fullname);
        }
      }

    } else if (supplierOb.category_type === "Company") {
      individualSupplierCard.style.display = "none";
      companySupplierCard.style.display = "";

      viewSupplierCompanyName.innerText = supplierOb.company_name || "-";
      viewSupplierRegistrationNo.innerText = supplierOb.company_reg_no || "-";
      document.querySelectorAll("#viewSupplierAddress").forEach(el => el.innerText = supplierOb.company_address || "-");
      viewSupplierCompanyEmail.innerText = supplierOb.company_email || "-";
      viewSupplierCompanyContactNo.innerText = supplierOb.company_contact_no || "-";
      viewSupplierContactPersonName.innerText = supplierOb.company_contact_person_name || "-";
      viewSupplierContactPersonMobile.innerText = supplierOb.company_contact_person_mobileno || "-";
      viewSupplierContactPersonEmail.innerText = supplierOb.company_contact_person_email || "-";
      viewCompanyStatus.innerHTML = getStatusBadge(supplierOb.supplier_status_id.status);

      const compImgEl = companySupplierCard.querySelector(".profile-photo");
      const compInitialsEl = companySupplierCard.querySelector(".initials-avatar");
      if (compImgEl && compInitialsEl) {
        if (supplierOb.profile_photo_url) {
          compImgEl.src = supplierOb.profile_photo_url;
          compImgEl.style.display = "block";
          compInitialsEl.style.display = "none";
        } else {
          compImgEl.style.display = "none";
          compInitialsEl.style.display = "flex";
          compInitialsEl.innerText = getInitials(supplierOb.company_name);
        }
      }
    }
  } else {
    // Company Own Driver
    individualSupplierCard.style.display = "none";
    companySupplierCard.style.display = "none";
  }

  function getStatusBadge(status) {
    let statusClass = "status-active";
    if (status === "Inactive") {
      statusClass = "status-pending";
    } else if (status === "Deleted" || status === "Delete") {
      statusClass = "status-inactive";
    }
    return `<span class="status-badge ${statusClass}"> <span class="dot"> </span>${status}</span>`;
  }

  // Populate print view details
  printDriverNo.innerText = dataOb.driver_reg_no || "-";
  printIssuedDate.innerText = dataOb.added_datetime ? dataOb.added_datetime.split("T")[0] : new Date().toISOString().split("T")[0];
  printDriverIntroName.innerText = dataOb.fullname || "-";
  printDriverName.innerText = dataOb.fullname || "-";
  printDriverNIC.innerText = "NIC: " + (dataOb.nic || "-");
  printDriverMobile.innerText = "Mobile: " + (dataOb.mobileno || "-");

  // Supplier party details on print view
  if (dataOb.supplier_id != null) {
    printSupplierParty.style.display = "block";
    printSupplierName.innerText = dataOb.supplier_id.transportname || "-";
    if (dataOb.supplier_id.category_type === "Individual") {
      printSupplierContact.innerText = "Contact: " + (dataOb.supplier_id.mobileno || "-");
      printSupplierEmail.innerText = "Email: " + (dataOb.supplier_id.email || "-");
    } else {
      printSupplierContact.innerText = "Contact: " + (dataOb.supplier_id.company_contact_no || "-");
      printSupplierEmail.innerText = "Email: " + (dataOb.supplier_id.company_email || "-");
    }
  } else {
    printSupplierParty.style.display = "none";
  }

  // Table details on print view
  printTableDriverName.innerText = dataOb.fullname || "-";
  printTableCallingName.innerText = dataOb.callingname || "-";
  printTableNIC.innerText = dataOb.nic || "-";
  printTableDLNo.innerText = dataOb.driving_license_no || "-";
  printTableDLExpire.innerText = dataOb.driving_license_expire_date || "-";
  printTableCategory.innerText = dataOb.supplier_id ? "Supplier Driver" : "Company Driver";
  printTableMobile.innerText = dataOb.mobileno || "-";
  printTableEmail.innerText = dataOb.email || "-";
  printTableStatus.innerText = dataOb.driver_status_id.status || "-";
  printDriverRecordNo.innerText = dataOb.driver_reg_no || "-";

  openDriverDetail();
};

// print eka
const printDriver = () => {
  let newWindow = window.open();
  let preview =
    "<html><head><title>TMS - Driver Record</title><link rel='stylesheet' href='/css/driver.css'><link rel='stylesheet' href='/css/common.css'><link rel='stylesheet' href='/css/printView.css'><link rel='stylesheet' href='/bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'><script src='/bootstrap/bootstrap-5.2.3/js/bootstrap.bundle.min.js'></script></head><body>" +
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
// ================ end view & print driver details function =========================================


// =============== driver edit function =========================================
// define driver edit function
const driverEdit = (dataOb) => {
  // delete karpu driver record ekak edit karann bari wenna oni
  if (dataOb.driver_status_id.status === "Deleted") {
    Swal.fire({
      title: "Cannot Edit Deleted Driver",
      text: "This driver record has been deleted and cannot be edited.",
      icon: "error",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    return;
  }

  // if (dataOb.supplier_id == null) {
  //   radioOwnDriver.checked = "checked";
  //   supplierDiv.style.display = "none";
  //   textTransportName.removeAttribute("required");
  //   textTransportName.value = "";
  // } else {
  //   radioNonOwnDriver.checked = "checked";
  //   supplierDiv.style.display = "";
  //   textTransportName.setAttribute("required", "required");
  //   textTransportName.value = JSON.stringify(dataOb.supplier_id);
  // }
  if (dataOb.supplier_id.fullname == null) {
    dataOb.supplier_id.displayName = dataOb.supplier_id.company_name;
  } else {
    dataOb.supplier_id.displayName = dataOb.supplier_id.fullname;
  }
  textTransportName.value = JSON.stringify(dataOb.supplier_id);
  $("#textTransportName").trigger("change");
  select2Default([document.getElementById("textTransportName")]);
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
// ================ end driver edit function =========================================



// ================ submit & check error functions =========================================
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
          $("#driverModal").modal("hide");
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
// ================ end submit & check error functions =========================================



// ================ update & check update functions ============================================
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
// ================ end update & check update functions ============================================



// =============== validations =====================================================================
// generate calling name
const generateCallingName = (fullNameValue, selectedValue) => {
  let fullNameParts = fullNameValue.split(" ");
  divParentRadio.innerHTML = "";
  // validation eka full name eka enter karala nathnam select from name above kiyana message eka display karanawa
  if (fullNameValue.trim() === "") return   divParentRadio.innerText = "Select from name above";
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

// dropdwon ekakta select karana calling name eka generate karanawa
const generateCallingNameForDrodown = (fullNameValue, selectedValue) => {
  let fullNameParts = fullNameValue.split(" ");
  const parentId = document.getElementById("selectCallingName");
  parentId.innerHTML = "";
  massage = "Select Calling Name"
  if (massage != "") {
    let optionMsgEs = document.createElement("option");
    optionMsgEs.value = "";
    optionMsgEs.selected = "selected";
    optionMsgEs.disabled = "disabled";
    optionMsgEs.innerText = massage;
    parentId.appendChild(optionMsgEs);
  }
  if (fullNameValue.trim() === "") return;
  fullNameParts.forEach((part) => {
    let option = document.createElement("Option");
    option.value = part;
    option.innerText = part;
    parentId.appendChild(option);
  });
}

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
      generateCallingName(fullNameValue);
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
    generateCallingName(fullNameValue);
  }
});

// ============== end validations =====================================================================




// ============== driver category selection logic ============================================
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
// ================ end driver category selection logic ============================================



// ================ refresh form function ============================================
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

  ]);
  select2Default([document.getElementById("textTransportName")]);

  let transportName = getServiceRequest("/supplier/alldatabystatus");
  transportName.forEach(t => {
    if (t.fullname == null) {
      t.displayName = t.company_name;
    } else {
      t.displayName = t.fullname;
    }
  });
  dataFillIntoSelectWithTwoNames(textTransportName, "Select Supplier", transportName, "transportname", "displayName");

  let driverStatus = getServiceRequest("/driverstatus/statuswithoutdelete");
  dataFilIntoSelect(textDriverStatus, "Select Status", driverStatus, "status");

  // current date validate and previous date restrict
  currentdatevalidator("textDrivingLicenseExpireDate");

  submitButton.style.display = "";
  updateButton.style.display = "none";
  statusDiv.style.display = "none";
  driverCategoryDiv.style.display = "none";

  const selectedValue = document.querySelector('input[name="driverCategory"]:checked').value;
  driver.category = selectedValue;
};
// ================ end refresh form function ============================================



// ================= export functionality =========================
// Export Functionality
const exportDriverTable = (type) => {
  if (type === "excel") {
    exportTableToExcelWithSheetJS("#driverTable", "drivers", { sheetName: "Drivers" });
  } else if (type === "pdf") {
    exportTableToPdfWithJsPdf("#driverTable", "drivers", { title: "Drivers" });
  } else if (type === "print") {
    driverFromPrint();
  }
};
// ================= end export functionality =========================



// ================= print & view overlay functionality =========================
// Overlay animation helper functions
const openDriverDetail = () => {
  toggleView("driver-details-overlay", true);
  const backBtn = document.getElementById("backBtn");
  const overlay = document.getElementById("driver-details-overlay");
  if (overlay) {
    // toggleView eka "block" widihata display karapuwath,
    // current + newpanel side-by-side ganna "flex" widihatama force karanawa
    overlay.style.display = "flex";
  }
  if (backBtn) {
    backBtn.style.display = "block";
    backBtn.onclick = () => {
      closeDriverDetailOverlay();
    };
  }
};

const closeDriverDetailOverlay = () => {
  toggleView("driver-details-overlay", false);
  const backBtn = document.getElementById("backBtn");
  const overlay = document.getElementById("driver-details-overlay");
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
  var overlay = document.getElementById('driver-details-overlay');
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
// ================ end print & view overlay functionality =========================



// modal eka close weddi form eka clear karan function eka
formResetFunctionWhenClosingModal("driverModal", "driverRegistrationForm", refreshDriverForm);

//Alert Box Call function
Swal.isVisible();
