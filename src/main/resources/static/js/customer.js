window.addEventListener("load", () => {
  refreshCustomerForm();
});

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

// Table Delete Button
const customerDelete = (dataOb) => {
  console.log(dataOb);

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

// Table View Button
const customerView = (dataOb) => {
  // kpi cards

  document.getElementById("completedBookings").innerText = getServiceRequest("/booking/completecountbycustomer?customerId=" + dataOb.id);
  document.getElementById("activeBookingTotal").innerText = getServiceRequest("/booking/pendingcountbycustomer?customerId=" + dataOb.id);
  document.getElementById("fleetSize").innerText = getServiceRequest("/vehiclegroup/vehiclecountbycustomer?customerId=" + dataOb.id);
  document.getElementById("distance").innerText = getServiceRequest("/booking/totaldistancecountbycustomer?customerId=" + dataOb.id).toFixed(2);
  // Populate Redesigned Overlay
  document.getElementById("detail-company-name-large").innerText = dataOb.company_name;
  document.getElementById("detail-company-name-small").innerText = dataOb.company_name;

  // Status Badge Logic
  const statusBadge = document.getElementById("detail-status-badge");
  statusBadge.innerText = dataOb.customer_status_id.status;

  // Apply visual style based on status
  if (dataOb.customer_status_id.status === "Active") {
    statusBadge.style.background = "var(--success-bg)";
    statusBadge.style.color = "var(--success)";
  } else {
    statusBadge.style.background = "var(--slate-200)";
    statusBadge.style.color = "var(--slate-600)";
  }

  document.getElementById("detail-business-type").innerText = dataOb.business_type_id.name;
  document.getElementById("detail-reg-no").innerText = dataOb.customer_reg_no || "REG-PENDING";

  // Handle Dates using the dateformat utility from reusabal.js
  const addedDate = dataOb.added_datetime;
  document.getElementById("detail-created-date").innerText = addedDate;

  // Stakeholder Info
  document.getElementById("detail-stakeholder-name").innerText = dataOb.contact_person_fullname;
  document.getElementById("detail-stakeholder-email").innerText = dataOb.contact_person_email;
  document.getElementById("detail-stakeholder-mobile").innerText = dataOb.contact_person_mobileno;

  // Office Info
  document.getElementById("detail-office-email").innerText = dataOb.direct_email_no;
  document.getElementById("detail-office-mobile").innerText = dataOb.direct_telephone_no;
  document.getElementById("detail-office-address").innerText = dataOb.company_address;

  // Description placeholder logic
  document.getElementById("detail-company-desc").innerText =
    `${dataOb.company_name} is a key strategic partner specializing in ${dataOb.business_type_id.name.toUpperCase()} operations.`;

  toggleView("cust-detail-overlay", true);

  breadcrumbDiv.style.display = "none";
  document.getElementById("backBtn").style.display = "block";
  document.getElementById("backBtn").onclick = () => {
    toggleView("cust-detail-overlay", false);
    document.getElementById("backBtn").style.display = "none";
    breadcrumbDiv.style.display = "";
  };
};

//
const printCustomer = () => {
  document.getElementById("printBtn").style.display = "none";
  let newWindow = window.open();
  let preview =
    "<html><head><title>TMS</title><link rel='stylesheet' href='/css/customer.css'><link rel='stylesheet' href='/css/common.css'><link rel='stylesheet' href='/bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'><script src='/bootstrap/bootstrap-5.2.3/js/bootstrap.bundle.min.js'></script></head><body>" +
    "<div class='row'><div class='col-12'>" +
    singleCustomerDetails.outerHTML +
    "</div></div></body></html>";

  newWindow.document.write(preview);

  setTimeout(() => {
    newWindow.stop();
    newWindow.print();
    newWindow.close();
  }, 500);

  document.getElementById("printBtn").style.display = "";
};

// Table edit button
const customerEdit = (dataOb) => {
  if (dataOb.customer_status_id.status === "Deleted") {
    Swal.fire({
      title: "Warning",
      text: "Can not edit Delete Customer Deatils",
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

// check form errror function
const checkFormError = () => {
  let errors = "";

  if (customer.company_name == null) {
    errors += "Please enter the Customer/Company Name. <br>";
    textCustomerName.classList.add("is-invalid");
  }
  if (customer.business_type_id == null) {
    errors += "Please select the Business Type. <br>";
    textBusinessType.classList.add("is-invalid");
  }
  if (customer.direct_email_no == null) {
    errors += "Please enter the Customer Direct Email. <br>";
    textEmail.classList.add("is-invalid");
  }
  if (customer.direct_telephone_no == null) {
    errors += "Please enter the Customer Direct Telephone No. <br>";
    textTelephoneNo.classList.add("is-invalid");
  }
  if (customer.contact_person_fullname == null) {
    errors += "Please enter the Contact Person Full Name. <br>";
    textContactPersonFullName.classList.add("is-invalid");
  }
  if (customer.contact_person_email == null) {
    errors += "Please enter the Contact Person Email Address. <br>";
    textContactPersonEmail.classList.add("is-invalid");
  }
  if (customer.contact_person_mobileno == null) {
    errors += "Please enter the Contact Person Mobile Number. <br>";
    textContactPersonMobileNo.classList.add("is-invalid");
  }
  if (customer.company_address == null) {
    errors += "Please enter the Customer/Company Address. <br>";
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

// table eke loading spin eka load karanwa
function showTableLoading() {
  const loader = document.getElementById("loaderId");
  const CustomerTable = document.getElementById("customerTable");
  loader.style.display = ""; // Clear loading after 2 seconds
  CustomerTable.style.display = "none"; // Hide the booking table while loading
  setTimeout(() => {
    const loader = document.getElementById("loaderId");
    loader.style.display = "none"; // Clear loading after 2 seconds
    CustomerTable.style.display = ""; // Hide the booking table while loading
  }, 500);
}

// Export Functionality
const exportTable = (type) => {
  const table = $("#customerTable").DataTable();

  if (type === "excel") {
    // Basic implementation using XLSX or similar if available, otherwise CSV
    // For now, let's provide a message or use a simple CSV export if logic is needed
    // Assuming user might have a library or wants a placeholder for now
    table.button(".buttons-excel").trigger();
  } else if (type === "pdf") {
    table.button(".buttons-pdf").trigger();
  } else if (type === "print") {
    printCustomer();
  }
};

// modal eka close weddi form eka clear karan function eka
formResetFunctionWhenClosingModal("customerModal", "companyRegistrationForm", refreshCustomerForm);

//Alert Box Call function
Swal.isVisible();
