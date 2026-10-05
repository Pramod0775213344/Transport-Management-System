
// =============== load function ================================
window.addEventListener("load", () => {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      refreshCustomerForm();
    } catch (e) {
      console.error("Error during customer page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);
});

// ================ end load functions =========================




//  =============== load table functions =========================
// customer table load area
const loadCustomerTable = (customers) => {
  if ($.fn.dataTable.isDataTable("#customerTable")) {
    $("#customerTable").DataTable().clear().destroy();
  }

  let propertyList = [
    { propertyName: getCompnayDetails, dataType: "function" },
    { propertyName: getBusinessType, dataType: "function" },
    { propertyName: getContactPersonDeatils, dataType: "function" },
    { propertyName: "contact_person_mobileno", dataType: "string" },
    { propertyName: getCustomerStatus, dataType: "function" },
  ];

  dataFillIntoTheTable(customerTableBody, customers, propertyList, customerView, customerEdit, customerDelete, true);

  const table = $("#customerTable").DataTable({
    dom: "rtip", // Hide default search and length
    pageLength: 10,
    createdRow: function (row, data, dataIndex) {
      $(row).find("td").css({
        "text-align": "left",
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

  // Custom Search
  $("#tableSearch")
    .off("keyup")
    .on("keyup", function () {
      table.search(this.value).draw();
    });

  // Custom Length
  $("#tableLength")
    .off("change")
    .on("change", function () {
      table.page.len(this.value).draw();
    });

  applyPrivileges("Customer Management", "customerTable", {
    add: addButton,
  });

  table.on("draw.dt", function () {
    applyPrivileges("Customer Management", "customerTable", { add: addButton });
  });


};

// cutomer deatils
const getCompnayDetails = (dataOb) => {
  return "<span>" + dataOb.company_name + "</span><span><p class='text-muted mt-2' >" + dataOb.direct_email_no + "</p></span>";
};

// customer details
const getContactPersonDeatils = (dataOb) => {
  return "<span >" + dataOb.contact_person_fullname + "</span><span><p class='text-muted mt-2' >" + dataOb.contact_person_email + "</p></span>";
};

// status Function
const getCustomerStatus = (dataOb) => {
  if (dataOb.customer_status_id.status == "Active") {
    return "<span class='status-badge status-active'> <span class='dot'> </span>" + dataOb.customer_status_id.status + "</span>";
  }

  if (dataOb.customer_status_id.status == "Inactive") {
    return "<span class='status-badge status-pending'> <span class='dot'> </span>" + dataOb.customer_status_id.status + "</span>";
  }

  if (dataOb.customer_status_id.status == "Deleted") {
    return "<span class='status-badge status-inactive'> <span class='dot'> </span>" + dataOb.customer_status_id.status + "</span>";
  }
};

// Business Type Function
const getBusinessType = (dataOb) => {
  return dataOb.business_type_id.name;
};
// =================== end load table functions ========================



// =================== delete function =================================
// Table Delete Button
const customerDelete = (dataOb) => {
  console.log(dataOb);

  // check if the customer is already deleted
  if (dataOb.customer_status_id.status === "Deleted") {
    Swal.fire({
      title: "Customer Already Deleted",
      text: "This customer record has already been deleted.",
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
    title: "Confirm Customer Deletion",
    text: "Are you sure you want to delete this customer record? This action cannot be undone!",
    icon: "warning",
    iconColor: "#ef4444",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete Customer",
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
      let deleteResponse = httpServiceRequest("/customer/delete", "DELETE", dataOb);
      if (deleteResponse == "ok") {
        Swal.fire({
          title: "Customer Deleted!",
          text: "The customer record has been successfully removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-border-radius",
          },
        });
        refreshCustomerForm();
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
// ================== end delete function ==============================


// =================== customer view functions ========================
// Table View Button
const customerView = (dataOb) => {
  console.log(dataOb);

  viewCompanyNameHeader.innerText = dataOb.company_name;
  viewBusinessTypeHeader.innerText = dataOb.business_type_id.name;
  viewCompanyName.innerText = dataOb.company_name;
  viewBusinessType.innerText = dataOb.business_type_id.name;
  viewBusinessRegistrationNo.innerText = dataOb.brn_no;
  viewDirectEmail.innerText = dataOb.direct_email_no;
  viewDirectPhone.innerText = dataOb.direct_telephone_no
  viewCompnayAddress.innerText = dataOb.company_address
  viewContactPersonName.innerText = dataOb.contact_person_fullname
  viewContactPersonEmail.innerText = dataOb.contact_person_email
  viewMobilePhoneNo.innerText = dataOb.contact_person_mobileno;

  if (dataOb.customer_status_id.status == "Active") {
    viewStatus.innerHTML = "<span class='status-badge status-active'> <span class='dot'> </span>" + dataOb.customer_status_id.status + "</span>";
  }
  if (dataOb.customer_status_id.status == "Inactive") {
    viewStatus.innerHTML = "<span class='status-badge status-pending'> <span class='dot'> </span>" + dataOb.customer_status_id.status + "</span>";
  }
  if (dataOb.customer_status_id.status == "Deleted") {
    viewStatus.innerHTML = "<span class='status-badge status-inactive'> <span class='dot'> </span>" + dataOb.customer_status_id.status + "</span>";
  }

  if ($.fn.DataTable.isDataTable("#viewCustomerBookingsTable")) {
    $("#viewCustomerBookingsTable").DataTable().destroy();
  }
  // recent booking tika fill karanawa
  const dataList = getServiceRequest("/booking/recentbookingbycustomerid?customerid=" + dataOb.id);
  let propertyListView = [
    { propertyName: "booking_no", dataType: "string" },
    { propertyName: getPickup, dataType: "function" },
    { propertyName: getVia, dataType: "function" },
    { propertyName: getDelivery, dataType: "function" },
    { propertyName: getVehicle, dataType: "function" },
    { propertyName: getStatus, dataType: "function" },
  ];
  dataFillIntoTheReportTable(viewCustomerBookingsTableBody, dataList, propertyListView)

  const table = $("#viewCustomerBookingsTable").DataTable({
    dom: "rtip", // custom controls used
    pageLength: 5,
    createdRow: function (row, data, dataIndex) {
      $(row).find("td").css({
        "text-align": "left",
        height: "80px",
      });
    }
  });

  // --------------------letters show karanwa---------------------
  const imgEl = document.getElementById("viewImage");
  const initialsEl = document.getElementById("viewImageInitials");

  if (dataOb.profile_photo_url) {
    imgEl.src = dataOb.profile_photo_url;
    imgEl.style.display = "block";     // show the photo
    initialsEl.style.display = "none"; // hide the initials box
  } else {
    imgEl.style.display = "none";      // hide the empty broken image
    initialsEl.style.display = "flex"; // <-- this line was missing, so it stayed "none" from the CSS
    initialsEl.innerText = getInitials(dataOb.company_name);
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

  openCustomerDetail();


  // -------------------for print view ------------------------------
  viewCustomerNo.innerText = dataOb.customer_reg_no || "-";
  viewIssuedDate.innerText = dataOb.added_datetime ? dataOb.added_datetime.split("T")[0] : "-";

  const introSpan = printContent.querySelector(".intro-text span");
  if (introSpan) {
    introSpan.innerText = dataOb.company_name;
  }

  document.querySelectorAll("#viewCompanyName").forEach(el => el.innerText = dataOb.company_name);
  viewContactName.innerText = "Attn: " + (dataOb.contact_person_fullname || "-");
  viewContactMobile.innerText = dataOb.direct_telephone_no || "-";

  document.querySelectorAll("#printContactPersonName").forEach(el => el.innerText = dataOb.contact_person_fullname || "-");
  document.querySelectorAll("#printContactPersonEmail").forEach(el => el.innerText = dataOb.contact_person_email || "-");
  document.querySelectorAll("#printContactPersonMobile").forEach(el => el.innerText = dataOb.contact_person_mobileno || "-");

  printCustomerName.innerText = dataOb.company_name;
  printBusinessType.innerText = dataOb.business_type_id ? dataOb.business_type_id.name : "-";
  printBusinessRegistrationNo.innerText = dataOb.brn_no || "-";
  printDirectEmail.innerText = dataOb.direct_email_no || "-";
  printDirectPhone.innerText = dataOb.direct_telephone_no || "-";
  printCompnayAddress.innerText = dataOb.company_address || "-";
  printCustomerNo.innerText = dataOb.customer_reg_no || "-";
};

const getPickup = (dataOb) => {
  return `
    <div class="d-flex flex-column gap-1">
      <div class="fw-bold text-dark">${dataOb.pickup_locations_id.name}</div>
      <div class="text-muted small"> ${dataOb.pickup_date_time.replace("T", " ")}</div>
    </div>`;
}
const getVia = (dataOb) => {
  if (dataOb.locations.length > 0) {
    let locations = "";
    dataOb.locations.forEach((vialocation, index) => {
      if (dataOb.locations.length - 1 == index) {
        locations += vialocation.name;
      } else {
        locations += vialocation.name + ",<br>";
      }
    });
    return locations;
  } else {
    return " - ";
  }
}
const getDelivery = (dataOb) => {
  return `
    <div class="d-flex flex-column gap-1">
      <div class="fw-bold text-dark">${dataOb.delivery_locations_id.name}</div>
      <div class="text-muted small"> ${dataOb.delivery_date_time.replace("T", " ")}</div>
    </div>`;
}
const getVehicle = (dataOb) => {
  if (dataOb.vehicle_id == null) {
    return `<div class ='status-badge status-inactive'>Unassigned</div>`;
  } else {
    return `
      <div class="booking-info-cell">
        <span class="booking-id">${dataOb.vehicle_id.vehicle_no}</span>
        <span class="customer-id">${dataOb.vehicle_type_id.name}</span>
      </div>
    `;
  }
}
const getStatus = (dataOb) => {
  const status = dataOb.booking_status_id.status;
  let statusClass = "status-inactive";
  if (status === "Attend") {
    statusClass = "status-badge status-attend";
  } else if (status === "Arrived At Pickup") {
    statusClass = "status-pending";
  } else if (status === "Departed From Pickup") {
    statusClass = "status-pending";
  } else if (status === "Arrived At Delivery") {
    statusClass = "status-active";
  } else if (status === "Departed From Pickup") {
    statusClass = "status-active";
  } else if (status === "Cancelled") {
    statusClass = "status-cancelled";
  } else if (status === "Inprocess") {
    statusClass = "status-inactive";
  }

  return `<div class="status-badge ${statusClass}">
            <span>${status}</span>
          </div>`;
}
// =================== end customer view functions =======================


// =================== print functions ====================================
const printCustomer = () => {
  let newWindow = window.open();
  let preview =
    "<html><head><title>TMS</title><link rel='stylesheet' href='/css/customer.css'><link rel='stylesheet' href='/css/common.css'><link rel='stylesheet' href='/css/printView.css'><link rel='stylesheet' href='/bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'><script src='/bootstrap/bootstrap-5.2.3/js/bootstrap.bundle.min.js'></script></head><body>" +
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
// ================== end print view functions ============================



// =================== edit functions ====================================
// Table edit button
const customerEdit = (dataOb) => {

  if (dataOb.customer_status_id.status === "Deleted") {
    Swal.fire({
      title: "Cannot Edit Deleted Customer",
      text: "Can not edit Deleted Customer Deatils",
      icon: "info",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    return;
  }

  // Update labels for Edit mode and handle button visibility
  document.getElementById("modalTitle").innerText = "Update Customer Details";
  document.getElementById("modalSubtitle").innerText = "Modify the existing customer details below.";
  textCustomerName.value = dataOb.company_name;

  textBusinessType.value = JSON.stringify(dataOb.business_type_id);
  if (dataOb.business_registration_no == null) {
    textBusinessRegistrationNo.value = "";
  } else {
    textBusinessRegistrationNo.value = dataOb.business_registration_no;
  }
  textBusinessRegistrationNo.value = dataOb.brn_no;
  textEmail.value = dataOb.direct_email_no;

  textTelephoneNo.value = dataOb.direct_telephone_no;

  textContactPersonFullName.value = dataOb.contact_person_fullname;

  textContactPersonEmail.value = dataOb.contact_person_email;

  textContactPersonMobileNo.value = dataOb.contact_person_mobileno;

  textCompanyAddress.value = dataOb.company_address;

  textCustomerStatus.value = JSON.stringify(dataOb.customer_status_id);

  updateButton.style.display = "";
  submitButton.style.display = "none";

  statusDiv.style.display = "";

  customer = JSON.parse(JSON.stringify(dataOb));
  oldcustomer = JSON.parse(JSON.stringify(dataOb));

  $("#customerModal").modal("show");
};
// ================== end edit functions =================================




// ================== submit & error check ================================
// check form errror function
const checkFormError = () => {
  let errors = "";

  if (customer.company_name == null) {
    errors += "Please enter the vaild Customer/Company Name. <br>";
    textCustomerName.classList.add("is-invalid");
  }
  if (customer.brn_no == null) {
    errors += "Please enter the vaild Business Registration No. <br>";
    textBusinessRegistrationNo.classList.add("is-invalid");
  }
  if (customer.business_type_id == null) {
    errors += "Please select the vaild Business Type. <br>";
    textBusinessType.classList.add("is-invalid");
  }
  if (customer.direct_email_no == null) {
    errors += "Please enter the vaild Customer Direct Email. <br>";
    textEmail.classList.add("is-invalid");
  }
  if (customer.direct_telephone_no == null) {
    errors += "Please enter the vaild Customer Direct Telephone No. <br>";
    textTelephoneNo.classList.add("is-invalid");
  }
  if (customer.contact_person_fullname == null) {
    errors += "Please enter the vaild Contact Person Full Name. <br>";
    textContactPersonFullName.classList.add("is-invalid");
  }
  if (customer.contact_person_email == null) {
    errors += "Please enter the vaild Contact Person Email Address. <br>";
    textContactPersonEmail.classList.add("is-invalid");
  }
  if (customer.contact_person_mobileno == null) {
    errors += "Please enter the vaild Contact Person Mobile Number. <br>";
    textContactPersonMobileNo.classList.add("is-invalid");
  }
  if (customer.company_address == null) {
    errors += "Please enter the vaild Customer/Company Address. <br>";
    textCompanyAddress.classList.add("is-invalid");
  }

  return errors;
};

// form submit function
const customerFormSubmit = () => {
  console.log(customer);
  // check form error for required element
  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    // errors not exit
    //need to get user confirmation

    let userConfirm = Swal.fire({
      title: "Confirm Customer Submission",
      text: "Are you sure you want to register this new customer?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Save Customer",
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
        let postResponse = httpServiceRequest("/customer/insert", "POST", customer);
        console.log(customer);

        if (postResponse == "ok") {
          Swal.fire({
            title: "Customer Registered!",
            text: "New customer has been successfully added to the system.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          refreshCustomerForm();
          $("#customerModal").modal("hide");
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
  console.log(customer);
};
// ================ end submit & error check ==============================




// =============== update & check update ==================================
// check form updates
const checkFormUpdates = () => {
  let updates = "";

  if (customer != null && oldcustomer != null) {
    if (customer.company_name != oldcustomer.company_name) {
      updates += "Company Name updated. <br>";
    }
    if (customer.business_type_id.name != oldcustomer.business_type_id.name) {
      updates += "Business Type updated. <br>";
    }
    if (customer.business_registration_no != oldcustomer.business_registration_no) {
      updates += "Business Registration No updated. <br>";
    }
    if (customer.direct_email_no != oldcustomer.direct_email_no) {
      updates += "Direct Email updated. <br>";
    }
    if (customer.direct_telephone_no != oldcustomer.direct_telephone_no) {
      updates += "Direct Telephone No updated. <br>";
    }
    if (customer.contact_person_fullname != oldcustomer.contact_person_fullname) {
      updates += "Contact Person Name updated. <br>";
    }
    if (customer.contact_person_email != oldcustomer.contact_person_email) {
      updates += "Contact Person Email updated. <br>";
    }
    if (customer.contact_person_mobileno != oldcustomer.contact_person_mobileno) {
      updates += "Contact Person Mobile No updated. <br>";
    }
    if (customer.company_address != oldcustomer.company_address) {
      updates += "Company Address updated. <br>";
    }
    if (customer.customer_status_id.status != oldcustomer.customer_status_id.status) {
      updates += "Customer Status updated. <br>";
    }
  }
  return updates;
};

// from update function
const customerFormUpdate = () => {
  console.log(customer);
  console.log(oldcustomer);
  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    let updates = checkFormUpdates();
    // updates not exit
    if (updates == "") {
      Swal.fire({
        title: "Nothing to Update",
        text: "No changes were detected in the customer details.",
        icon: "info",
        allowOutsideClick: false,
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    } else {
      let userConfirm = Swal.fire({
        title: "Confirm Customer Update",
        text: "Are you sure you want to update this customer's details?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Update Customer",
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
          let putResponse = httpServiceRequest("/customer/update", "PUT", customer);
          if (putResponse == "ok") {
            Swal.fire({
              title: "Customer Updated!",
              text: "The customer details have been successfully updated.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: "swal2-border-radius",
              },
            });

            refreshCustomerForm();
            $("#customerModal").modal("hide");
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
// =============== end update & check update =============================


// ============== refresh function =======================================
// form refresh function
const refreshCustomerForm = () => {
  customer = new Object();

  companyRegistrationForm.reset();

  setDefault([
    textCustomerName,
    textBusinessType,
    textBusinessRegistrationNo,
    textEmail,
    textTelephoneNo,
    textContactPersonFullName,
    textContactPersonEmail,
    textContactPersonMobileNo,
    textCompanyAddress,
    textCustomerStatus,
  ]);

  let businessTypes = getServiceRequest("/businesstype/alldata");
  let customerStatus = getServiceRequest("/customerstatus/statuswithoutdelete");

  dataFilIntoSelect(textBusinessType, "Select Business Type", businessTypes, "name");
  dataFilIntoSelect(textCustomerStatus, "Select Status", customerStatus, "status");

  submitButton.style.display = "";
  updateButton.style.display = "none";

  statusDiv.style.display = "none";

  document.getElementById("modalTitle").innerText = "Create New Customer";
  document.getElementById("modalSubtitle").innerText = "Fill in the details below to register a new customer.";

  //  table eka load wenwawa
  let customers = getServiceRequest("/customer/alldata");
  loadCustomerTable(customers);
};
//  ============ end refresh functions ================================


// ============ view and print overlay dispaly functions ================
//view overalyy details
const openCustomerDetail = () => {
  toggleView("customer-details-overlay", true);
  const backBtn = document.getElementById("backBtn");
  const overlay = document.getElementById("customer-details-overlay");
  if (overlay) {
    // toggleView eka "block" widihata display karapuwath,
    // current + newpanel side-by-side ganna "flex" widihatama force karanawa
    overlay.style.display = "flex";
  }
  if (backBtn) {
    backBtn.style.display = "block";
    backBtn.onclick = () => {
      closeCustomerDetailOverlay();
    };
  }
};

const closeCustomerDetailOverlay = () => {
  toggleView("customer-details-overlay", false);
  const backBtn = document.getElementById("backBtn");
  var overlay = document.getElementById('customer-details-overlay');
  if (backBtn) {
    backBtn.style.display = "none";
    backBtn.addEventListener('click', function () {
      overlay.classList.remove('open');
    });
  }
};

// print view ekedi slide karanawa
document.addEventListener('DOMContentLoaded', function () {
  var overlay = document.getElementById('customer-details-overlay');
  var openBtn = document.getElementById('openBtn');
  var closeBtn = document.getElementById('closeBtn');

  if (openBtn) {
    openBtn.addEventListener('click', function () {
      overlay.classList.add('open');
      openBtn.style.visibility = "hidden"
      printButtonCol.style.display = "none"; // Hide the print button column when the overlay is open

    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      overlay.classList.remove('open');
      openBtn.style.visibility = "visible"
      printButtonCol.style.display = "block"; // Show the print button column when the overlay is closed

    });
  }
});
// ========== end view and print disaply overlay ========================


// ============= export functions ========================================
// Export Functionality
const exportTable = (type) => {
  if (type === "excel") {
    exportTableToExcelWithSheetJS("#customerTable", "customers", { sheetName: "Customers" });
  } else if (type === "pdf") {
    exportTableToPdfWithJsPdf("#customerTable", "customers", { title: "Customers" });
  } else if (type === "print") {
    printCustomer();
  }
};
// =========== end export functions ===================================




// modal eka close weddi form eka clear karan function eka
formResetFunctionWhenClosingModal("customerModal", "companyRegistrationForm", refreshCustomerForm);

//Alert Box Call function
Swal.isVisible();