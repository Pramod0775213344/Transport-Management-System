window.addEventListener("load", () => {
  // get count of the customer agreement
  let customerAgreementCount = getServiceRequest("/customeragreement/countall");
  document.getElementById("customerAgreementCount").innerText = customerAgreementCount;

  // get count of the active customer agreement
  let activeCustomerAgreementCount = getServiceRequest("/customeragreement/countactive");
  document.getElementById("activeCustomerAgreementCount").innerText = activeCustomerAgreementCount;

  // get count of the pending customer agreement
  let pendingCustomerAgreementCount = getServiceRequest("/customeragreement/countpending");
  document.getElementById("pendingCustomerAgreementCount").innerText = pendingCustomerAgreementCount;

  // get count of the reject customer agreement
  let rejectCustomerAgreementCount = getServiceRequest("/customeragreement/countreject");
  document.getElementById("rejectCustomerAgreementCount").innerText = rejectCustomerAgreementCount;

  // refresh the customer agreement form
  refreshCustomerAgreementForm();

  //     enable type and search of the select element

  $("#selectCompanyName").select2({
    theme: "bootstrap-5",
    dropdownParent: $("#customerAgreementModal"),
  });

  // Check pending renewal eka open karanwa
  const pendingRenewal = localStorage.getItem("pendingRenewal");
  if (pendingRenewal) {
    const dataOb = JSON.parse(pendingRenewal);

    // data ob eka customer agreemnt ekata bind karanwa
    customerAgreement = dataOb;
    // Database ID eka null karanna oni aluth ekak widihata save wenna
    customerAgreement.id = null;
    customerAgreement.cus_agreement_no = null;
    customerAgreement.isRenewal = true;

    // modal eke title eka wenas karanwa
    $("#customerAgreementModal").modal("show");
    document.getElementById("modalTitle").innerText = "Renewal Service Agreement";
    document.getElementById("modalSubtitle").innerText = "Renew the existing agreement details below.";

    // select input ekata value eka asign karala change event eka trigger karanwa
    $("#selectCompanyName").val(JSON.stringify(dataOb.customer_id)).trigger("change");
    selectCompanyName.disabled = true;

    $("#selectVehicleType").val(JSON.stringify(dataOb.vehicle_type_id)).trigger("change");

    $("#selectPackageType").val(JSON.stringify(dataOb.package_id)).trigger("change");
    selectPackageType.disabled = false;

    textCustomerAgreementDate.value = dataOb.agreement_date;
    textCustomerAgreementPeriod.value = dataOb.agreement_period;
    textCustomerAgreementEndDate.value = dataOb.agreement_end_date;
    textCustomerDeliveryFrequency.value = dataOb.delivery_frequency;
    textCustomerAgreementApprovalNote.value = dataOb.approval_note;

    // localStorage clear කරනවා
    localStorage.removeItem("pendingRenewal");

    Swal.fire({
      title: "Renewal Mode",
      text: `${dataOb.customer_id.company_name} agreement details successfully added to the Renewal form.`,
      icon: "info",
      timer: 2000,
      showConfirmButton: false,
      customClass: { popup: "swal2-border-radius" },
    });
  }
});

// filtering area functions
const filteringCustomerName = document.getElementById("filteringCustomerName");
const filteringVehicleType = document.getElementById("filteringVehicleType");
const filteringStatus = document.getElementById("filteringStatus");
const filtering = () => {
  if ($.fn.dataTable.isDataTable("#customerAgreementTable")) {
    $("#customerAgreementTable").DataTable().destroy();
  }

  // customerge name eka witharak thiyenw nam
  if (filteringCustomerName.value != "" && filteringVehicleType.value === "" && filteringStatus.value === "") {
    let selectCustomer = JSON.parse(filteringCustomerName.value);
    let customerAgreements = getServiceRequest("/customeragreement/bycutomer?customerId=" + selectCustomer.id);
    loadCustomerAgreementTable(customerAgreements);
  }
  // vehicle type eka witharak thiyenw nam
  else if (filteringCustomerName.value === "" && filteringVehicleType.value != "" && filteringStatus.value === "") {
    let selectVehicleType = JSON.parse(filteringVehicleType.value);
    let customerAgreements = getServiceRequest("/customeragreement/filterbyvehicletype?vehicleTypeId=" + selectVehicleType.id);
    loadCustomerAgreementTable(customerAgreements);
  }
  // status eka witharak thiyenw nam
  else if (filteringCustomerName.value === "" && filteringVehicleType.value === "" && filteringStatus.value != "") {
    let selectStatus = JSON.parse(filteringStatus.value);
    let customerAgreements = getServiceRequest("/customeragreement/filterbystatus?statusId=" + selectStatus.id);
    loadCustomerAgreementTable(customerAgreements);
  }
  //     customerge name eka saha vehicle type eka thiyenw nam
  else if (filteringCustomerName.value != "" && filteringVehicleType.value != "" && filteringStatus.value === "") {
    let selectCustomer = JSON.parse(filteringCustomerName.value);
    let selectVehicleType = JSON.parse(filteringVehicleType.value);
    let customerAgreements = getServiceRequest(
      "/customeragreement/filterbycustomerandvehicletype?customerId=" + selectCustomer.id + "&vehicleTypeId=" + selectVehicleType.id,
    );
    loadCustomerAgreementTable(customerAgreements);
  }
  // customerge name eka saha status eka thiyenw nam
  else if (filteringCustomerName.value != "" && filteringVehicleType.value === "" && filteringStatus.value != "") {
    let selectCustomer = JSON.parse(filteringCustomerName.value);
    let selectStatus = JSON.parse(filteringStatus.value);
    let customerAgreements = getServiceRequest("/customeragreement/filterbycustomerandstatus?customerId=" + selectCustomer.id + "&statusId=" + selectStatus.id);
    loadCustomerAgreementTable(customerAgreements);
  }
  // vehicle type eka saha status eka thiyenw nam
  else if (filteringCustomerName.value === "" && filteringVehicleType.value != "" && filteringStatus.value != "") {
    let selectVehicleType = JSON.parse(filteringVehicleType.value);
    let selectStatus = JSON.parse(filteringStatus.value);
    let customerAgreements = getServiceRequest("/customeragreement/filterbyvehicletypeandstatus?vehicleTypeId=" + selectVehicleType.id + "&statusId=" + selectStatus.id);
    loadCustomerAgreementTable(customerAgreements);
  }
  // customerge name eka saha vehicle type eka saha status eka thiyenw nam
  else if (filteringCustomerName.value != "" && filteringVehicleType.value != "" && filteringStatus.value != "") {
    let selectCustomer = JSON.parse(filteringCustomerName.value);
    let selectVehicleType = JSON.parse(filteringVehicleType.value);
    let selectStatus = JSON.parse(filteringStatus.value);
    let customerAgreements = getServiceRequest(
      "/customeragreement/filterbycustomerandvehicletypeandstatus?customerId=" +
        selectCustomer.id +
        "&vehicleTypeId=" +
        selectVehicleType.id +
        "&statusId=" +
        selectStatus.id,
    );
    loadCustomerAgreementTable(customerAgreements);
  }
  // ewa naththam alll data gannawa
  else {
    let customerAgreements = getServiceRequest("/customeragreement/alldata");
    loadCustomerAgreementTable(customerAgreements);
  }
};
// filtering eka reset karanwa funtion eka
const resetFilter = () => {
  // select wala value eka reset karanawa
  filteringCustomerName.value = "";
  filteringVehicleType.value = "";
  filteringStatus.value = "";
  document.getElementById("tableSearch").value = "";

  // data table eka destroy karanawa
  if ($.fn.dataTable.isDataTable("#customerAgreementTable")) {
    $("#customerAgreementTable").DataTable().destroy();
  }

  // all agreement data tika load karanwa
  let customerAgreements = getServiceRequest("/customeragreement/alldata");
  loadCustomerAgreementTable(customerAgreements);
};

// table data load function
const loadCustomerAgreementTable = (customerAgreements) => {
  if ($.fn.dataTable.isDataTable("#customerAgreementTable")) {
    $("#customerAgreementTable").DataTable().destroy();
  }
  const propertyList = [
    { propertyName: getAgreementNo, dataType: "function" },
    { propertyName: getCustomer, dataType: "function" },
    { propertyName: getPackage, dataType: "function" },
    { propertyName: getVehicleType, dataType: "function" },
    { propertyName: getContractDetails, dataType: "function" },
    { propertyName: getCustomerAgreementStatus, dataType: "function" },
  ];

  // table data fill function
  dataFillIntoTheTable(customerAgreementTableBody, customerAgreements, propertyList, customerAgreemnentView, customerAgreemnentEdit, customerAgreemnentDelete, true);

  const table = $("#customerAgreementTable").DataTable({
    dom: "rtip", // Hide default search and length
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

// get agreement no
const getAgreementNo = (dataOb) => {
  return "<span class ='unique_no'>" + dataOb.cus_agreement_no + "</span >";
};

// get customer name
const getCustomer = (dataOb) => {
  return `<div class="row fw-bold" >${dataOb.customer_id.company_name}</div>
<div class="row" style="font-size: 14px;">${dataOb.customer_id.business_type_id.name}</div>`;
};

// get package name
const getPackage = (dataOb) => {
  return `<div class="row" >${dataOb.package_id.name}</div>
<div class="row" style="font-size: 14px;">${dataOb.package_id.distance} Km</div>`;
};

//get vehicle type
const getVehicleType = (dataOb) => {
  return `<div class="row" >${dataOb.vehicle_type_id.name} Truck</div>`;
};

// get contract details
const getContractDetails = (dataOb) => {
  return `<div class="row" >${dateformat(dataOb.agreement_date)}  - ${dateformat(dataOb.agreement_end_date)}</div>
<div class="row" >${dataOb.agreement_period} months</div>`;
};

// get customer agreement Status
const getCustomerAgreementStatus = (dataOb) => {
  if (dataOb.customer_agreement_status_id.status == "Approved") {
    return "<span class='status-badge status-active'>" + dataOb.customer_agreement_status_id.status + "</span>";
  }

  if (dataOb.customer_agreement_status_id.status == "Pending") {
    return "<span class='status-badge status-pending'>" + dataOb.customer_agreement_status_id.status + "</span>";
  }
  if (dataOb.customer_agreement_status_id.status == "Expired") {
    return "<span class='status-badge status-inactive'> " + dataOb.customer_agreement_status_id.status + "</span>";
  }
  if (dataOb.customer_agreement_status_id.status == "Deleted") {
    return "<span class='status-badge status-inactive'> " + dataOb.customer_agreement_status_id.status + "</span>";
  }
  if (dataOb.customer_agreement_status_id.status == "Reject") {
    return "<span class='status-badge status-reject'> " + dataOb.customer_agreement_status_id.status + "</span>";
  }
  if (dataOb.customer_agreement_status_id.status == "Closed") {
    return "<span class='status-badge status-renewd'> " + dataOb.customer_agreement_status_id.status + "</span>";
  }
};

// customer agreement view
const customerAgreemnentView = (dataOb) => {
  dataCompanyname.innerHTML = dataOb.customer_id.company_name;
  dataCompanyEmail.innerHTML = dataOb.customer_id.direct_email_no;
  dataCompanyEmail2.innerHTML = dataOb.customer_id.direct_email_no;
  dataCompanyAddress.innerHTML = dataOb.customer_id.company_address;
  dataCompanyAddress2.innerHTML = dataOb.customer_id.company_address;
  dataTelephone2.innerHTML = dataOb.customer_id.direct_telephone_no;
  dataContactPersonName.innerHTML = dataOb.customer_id.contact_person_fullname;
  dataContactPersonEmail.innerHTML = dataOb.customer_id.contact_person_email;
  dataContactPersonMobile.innerHTML = dataOb.customer_id.contact_person_mobileno;

  dataPackageName.innerHTML = dataOb.package_id.name;
  dataVehicleType.innerHTML = dataOb.package_id.vehicle_type_id.name;
  dataCustomerRate.innerHTML = "LKR " + dataOb.package_id.package_charge_cus;

  dataDistance.innerHTML = dataOb.package_id.distance + " KM";

  dataAgreementRegNo.innerHTML = dataOb.cus_agreement_no;
  dataAgreementStartDate.innerHTML = dataOb.agreement_date;
  dataAgreementPeriod.innerHTML = dataOb.agreement_period;
  dataEndDate.innerHTML = dataOb.agreement_end_date;

  companyName2.innerText = dataOb.customer_id.company_name;
  agreementPeriod1.innerText = dataOb.agreement_period;
  agreementPackageName.innerText = dataOb.package_id.name;

  $("#customerAgreementViewModal").modal("show");
};

const customerAgreementFromPrint = () => {
  let newWindow = window.open();
  let printView =
    "<head><title>TMS</title><link rel='stylesheet' href='/css/customerAgreement.css'><link rel='stylesheet' href='/bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'></head><body>" +
    "<div>" +
    viewModal.outerHTML +
    "</div></body>";
  newWindow.document.write(printView);

  setTimeout(() => {
    newWindow.stop();
    newWindow.print();
    newWindow.close();
  }, 1500);
};

// agreement delete function
const customerAgreemnentDelete = (dataOb) => {
  Swal.fire({
    title: "Confirm Agreement Deletion",
    text: "Are you sure you want to delete this agreement? This action cannot be undone!",
    icon: "warning",
    iconColor: "#ef4444",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete Agreement",
    cancelButtonText: "No, Keep it",
    allowOutsideClick: false,
    customClass: {
      cancelButton: "btn btn-1",
      confirmButton: "btn btn-4",
      popup: "swal2-border-radius",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      //call post service
      let deleteResponse = httpServiceRequest("/customeragreement/delete", "DELETE", dataOb);
      if (deleteResponse == "ok") {
        Swal.fire({
          title: "Deleted!",
          text: "Agreement has been deleted successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-border-radius",
          },
        });
        refreshCustomerAgreementForm();
      } else {
        Swal.fire({
          title: "Deletion Failed",
          text: deleteResponse,
          icon: "error",
          customClass: {
            confirmButton: "btn btn-1",
            popup: "swal2-border-radius",
          },
        });
      }
    }
  });
};

// agreement refill karana finction eka
const customerAgreemnentEdit = (dataOb) => {
  // check the status of the agreementa and if it is approved can't edit the details
  if (
    dataOb.customer_agreement_status_id.status == "Approved" ||
    dataOb.customer_agreement_status_id.status == "Closed" ||
    dataOb.customer_agreement_status_id.status == "Deleted"
  ) {
    Swal.fire({
      title: "Access Denied",
      text: "Cannot edit an agreement that has already been approved.",
      icon: "warning",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    return;
  }

  $("#selectCompanyName").val(JSON.stringify(dataOb.customer_id)).trigger("change");

  textCustomerAgreementDate.value = dataOb.agreement_date;

  textCustomerAgreementPeriod.value = dataOb.agreement_period;

  textCustomerAgreementEndDate.value = dataOb.agreement_end_date;

  textCustomerDeliveryFrequency.value = dataOb.delivery_frequency;

  selectVehicleType.value = JSON.stringify(dataOb.vehicle_type_id);

  let packageByVehicleType = getServiceRequest("package/byvehicletype?vehicletypeid=" + dataOb.vehicle_type_id.id);
  dataFilIntoSelect(selectPackageType, "Select Package Type", packageByVehicleType, "name");
  packageTypeDiv.style.display = "";
  selectPackageType.value = JSON.stringify(dataOb.package_id);

  textCustomerAgreementApprovalNote.value = dataOb.approval_note;

  // Update labels for Edit mode and handle button visibility
  document.getElementById("modalTitle").innerText = "Update Service Agreement";
  document.getElementById("modalSubtitle").innerText = "Modify the existing agreement details below.";

  updateButton.style.display = "";
  submitButton.style.display = "none";
  textCustomerAgreementApprovalNoteDiv.style.display = "";

  // when click the edit button the form will be display
  $("#customerAgreementModal").modal("show");

  customerAgreement = JSON.parse(JSON.stringify(dataOb));
  oldCustomerAgreement = JSON.parse(JSON.stringify(dataOb));

  let customerAgreements = getServiceRequest("/customeragreement/bycutomer?customerId=" + dataOb.customer_id.id);
  console.log(customerAgreements, "agreement");
  if (customerAgreements && customerAgreements.length > 0) {
    customerAgreementViewTable.style.display = "";
    newCustomerNote.style.display = "none";
    const propertyList = [
      { propertyName: "cus_agreement_no", dataType: "string" },
      {
        propertyName: (dataOb) => dataOb.vehicle_type_id.name,
        dataType: "function",
      },
      {
        propertyName: (dataOb) => dataOb.package_id.name,
        dataType: "function",
      },
    ];
    dataFillIntoTheReportTable(customerAgreementViewTableBody, customerAgreements, propertyList);
  } else {
    customerAgreementViewTable.style.display = "none";
    newCustomerNote.style.display = "";
  }
};

// check form errors
const checkFormError = () => {
  let errors = "";

  if (customerAgreement.customer_id == null) {
    errors += "Please select Company Name. <br>";
    selectCompanyName.classList.add("is-invalid");
  }
  if (customerAgreement.agreement_date == null) {
    errors += "Please select Agreement Date. <br>";
    textCustomerAgreementDate.classList.add("is-invalid");
  }
  if (customerAgreement.agreement_period == null) {
    errors += "Please select Agreement Period. <br>";
    textCustomerAgreementPeriod.classList.add("is-invalid");
  }
  if (customerAgreement.agreement_end_date == null) {
    errors += "Please select Agreement End Date. <br>";
    textCustomerAgreementEndDate.classList.add("is-invalid");
  }
  if (customerAgreement.delivery_frequency == null) {
    errors += "Please select Delivery Frequency. <br>";
    textCustomerDeliveryFrequency.classList.add("is-invalid");
  }
  if (customerAgreement.vehicle_type_id == null) {
    errors += "Please select Vehicle Type. <br>";
    selectVehicleType.classList.add("is-invalid");
  }
  if (customerAgreement.package_id == null) {
    errors += "Please select Package. <br>";
    selectPackageType.classList.add("is-invalid");
  }
  return errors;
};

// customer agreement form submit function
const customerAgreementFormSubmit = () => {
  // check form error for required element
  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    // errors not exit
    //need to get user confirmation

    let userConfirm = Swal.fire({
      title: "Confirm Agreement Submission",
      text: "Are you sure you want to create this new customer agreement?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Create Agreement",
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
        let postResponse = httpServiceRequest("/customeragreement/insert", "POST", customerAgreement);
        if (postResponse == "ok") {
          Swal.fire({
            title: "Agreement Created!",
            text: "The Customer Agreement has been successfully created.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          refreshCustomerAgreementForm();
          $("#customerAgreementModal").modal("hide");
        } else {
          Swal.fire({
            title: "Submission Failed",
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
          text: "Agreement details not Saved!",
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
      title: "Validation Error",
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

// check form updates
const checkFormUpdates = () => {
  let updates = "";

  if (customerAgreement != null && oldCustomerAgreement != null) {
    if (customerAgreement.customer_id.company_name != oldCustomerAgreement.customer_id.company_name) {
      updates += "Company Name updated. <br>";
    }
    if (customerAgreement.agreement_date != oldCustomerAgreement.agreement_date) {
      updates += "Agreement Date updated. <br>";
    }
    if (customerAgreement.agreement_period != oldCustomerAgreement.agreement_period) {
      updates += "Agreement Period updated. <br>";
    }
    if (customerAgreement.agreement_end_date != oldCustomerAgreement.agreement_end_date) {
      updates += "Agreement End Date updated. <br>";
    }
    if (customerAgreement.delivery_frequency != oldCustomerAgreement.delivery_frequency) {
      updates += "Delivery Frequency updated. <br>";
    }
    if (customerAgreement.vehicle_type_id.name != oldCustomerAgreement.vehicle_type_id.name) {
      updates += "Vehicle Type updated. <br>";
    }
    if (customerAgreement.package_id.name != oldCustomerAgreement.package_id.name) {
      updates += "Package updated. <br>";
    }
  }

  return updates;
};

// customer agreement form update function
const customerAgreementFormUpdate = () => {
  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    let updates = checkFormUpdates();
    // updates not exit
    if (updates == "") {
      Swal.fire({
        title: "Nothing to Update",
        text: "No changes were detected in the agreement details.",
        icon: "info",
        allowOutsideClick: false,
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    } else {
      let userConfirm = Swal.fire({
        title: "Confirm Agreement Update",
        text: "Are you sure you want to update this agreement's details?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Update Agreement",
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
          let putResponse = httpServiceRequest("/customeragreement/update", "PUT", customerAgreement);
          if (putResponse == "ok") {
            Swal.fire({
              title: "Agreement Updated!",
              text: "The customer agreement has been successfully updated.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: "swal2-border-radius",
              },
            });

            refreshCustomerAgreementForm();
            $("#customerAgreementModal").modal("hide");
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
            text: "Agreement details not Updated!",
            icon: "error",
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

// refresh customer agreement form
const refreshCustomerAgreementForm = () => {
  // main onbject eka
  customerAgreement = new Object();
  // main object ekata list ekak adda karanawa

  customerAgreementForm.reset();

  //form get intial color when refresh the form
  setDefault([
    selectCompanyName,
    textCustomerAgreementDate,
    textCustomerAgreementPeriod,
    textCustomerAgreementEndDate,
    textCustomerDeliveryFrequency,
    selectVehicleType,
    selectPackageType,
  ]);

  let compnayNames = getServiceRequest("/customer/bycustomerstatus");
  dataFilIntoSelect(selectCompanyName, "Select Company Name", compnayNames, "company_name");

  let vehicleTypes = getServiceRequest("/vehicletype/alldata");
  dataFilIntoSelect(selectVehicleType, "Select Vehicle Type", vehicleTypes, "name");

  let packageTypes = getServiceRequest("/package/bypackagestatus");
  dataFilIntoSelect(selectPackageType, "Select Package Type", packageTypes, "name");

  packageTypeDiv.style.display = "none";
  submitButton.style.display = "";
  updateButton.style.display = "none";
  textCustomerAgreementApprovalNoteDiv.style.display = "none";
  customerAgreementViewTable.style.display = "none";
  newCustomerNote.style.display = "none";

  // Reset Modal Labels
  document.getElementById("modalTitle").innerText = "New Customer Agreement";
  document.getElementById("modalSubtitle").innerText = "Fill in the details below to create a new service agreement.";

  // removing validation at refresh
  const s2Container = selectCompanyName.nextElementSibling;
  if (s2Container && s2Container.classList.contains("select2-container")) {
    const s2Selection = s2Container.querySelector(".select2-selection");
    if (s2Selection) {
      s2Selection.style.border = "1px solid #ced4da";
      s2Selection.style.borderBottom = "1px solid #ced4da";
      s2Selection.classList.remove("is-valid", "is-invalid");
    }
  }

  //     filtering area eke thiyen drop down tika fil karanawa
  dataFilIntoSelect(filteringCustomerName, "Select Company Name", compnayNames, "company_name");

  dataFilIntoSelect(filteringVehicleType, "Select Vehicle Type", vehicleTypes, "name");

  let agreementStatus = getServiceRequest("/customeragreementstatus/alldata");
  dataFilIntoSelect(filteringStatus, "Select Status ", agreementStatus, "status");

  let customerAgreements = getServiceRequest("/customeragreement/alldata");
  loadCustomerAgreementTable(customerAgreements);

  // -------------------------agrement start date eka dawas 7 kata kalin ewa block karanwaa----------------
  const today = new Date();

  // දවස් 7ක් අඩු කරනවා
  const minDate = new Date();
  minDate.setDate(today.getDate() - 7);

  // format (YYYY-MM-DD)
  const formattedDate = minDate.toISOString().split("T")[0];

  // input එකට set කරනවා
  document.getElementById("textCustomerAgreementDate").min = formattedDate;

  // ---------------------------------------------
};

// filetr function and validation function
let vehicleTypeElement = document.querySelector("#selectVehicleType");
vehicleTypeElement.addEventListener("change", () => {
  let vehicleType = JSON.parse(vehicleTypeElement.value);
  customerAgreement.vehicle_type_id = JSON.parse(vehicleTypeElement.value);

  selectVehicleType.classList.remove("is-invalid");
  selectVehicleType.classList.add("is-valid");

  packageTypeDiv.style.display = "";

  let packageByVehicleType = getServiceRequest("package/byvehicletype?vehicletypeid=" + vehicleType.id);
  dataFilIntoSelect(selectPackageType, "Select Package Type", packageByVehicleType, "name");
});

//calclate end date using given date and time period
let agreementEndDate = (startDateStr, periodValue) => {
  const startdate = new Date(startDateStr);
  const enddate = new Date(startdate);
  enddate.setMonth(startdate.getMonth() + Number(periodValue));

  // input type ekata galapena widihata date input format ekata convert karanna
  return `${enddate.getFullYear()}-${(enddate.getMonth() + 1).toString().padStart(2, "0")}-${enddate.getDate().toString().padStart(2, "0")}`;
};

document.getElementById("textCustomerAgreementPeriod").onchange = () => {
  const agreementStartDate = document.getElementById("textCustomerAgreementDate").value;
  const agreementPeriod = document.getElementById("textCustomerAgreementPeriod").value;

  //object ekata bind karanawa
  customerAgreement.agreement_period = agreementPeriod;
  // validation
  textCustomerAgreementPeriod.classList.remove("is-invalid");
  textCustomerAgreementPeriod.classList.add("is-valid");

  const endDate = agreementEndDate(agreementStartDate, agreementPeriod);
  document.getElementById("textCustomerAgreementEndDate").value = endDate;

  if (!agreementStartDate) {
    // object ekata bind karanawa
    customerAgreement.agreement_end_date = null;
    // validation
    textCustomerAgreementEndDate.classList.add("is-invalid");
    textCustomerAgreementEndDate.classList.remove("is-valid");
  } else {
    // object ekata bind karanawa
    customerAgreement.agreement_end_date = endDate;
    // validation
    textCustomerAgreementEndDate.classList.remove("is-invalid");
    textCustomerAgreementEndDate.classList.add("is-valid");
  }

  console.log(endDate); // "7/15/2024"
};

// customer ta adala agreement thiyenw nam ewa view karanwa form eke
// Show agreements for selected company in the form
let selectCompanyNameElement = document.getElementById("selectCompanyName");
$("#selectCompanyName").on("change", function (e) {
  // your code here
  console.log(2);
  console.log(selectCompanyNameElement.value);
  let selectedCompany = JSON.parse(selectCompanyNameElement.value);
  let customerAgreements = getServiceRequest("/customeragreement/bycutomer?customerId=" + selectedCompany.id);
  console.log(customerAgreements, "agreement");
  if (customerAgreements && customerAgreements.length > 0) {
    customerAgreementViewTable.style.display = "";
    newCustomerNote.style.display = "none";
    const propertyList = [
      { propertyName: "cus_agreement_no", dataType: "string" },
      {
        propertyName: (dataOb) => dataOb.vehicle_type_id.name,
        dataType: "function",
      },
      {
        propertyName: (dataOb) => dataOb.package_id.name,
        dataType: "function",
      },
    ];
    dataFillIntoTheReportTable(customerAgreementViewTableBody, customerAgreements, propertyList);
  } else {
    customerAgreementViewTable.style.display = "none";
    newCustomerNote.style.display = "";
  }
});

// ------------------------------------------------------------------------------------------------------------------------
// table eke loading spin eka load karanwa
function showTableLoading() {
  const loader = document.getElementById("loaderId");
  const customerAgreementTable = document.getElementById("customerAgreementTable");
  loader.style.display = ""; // Clear loading after 2 seconds
  customerAgreementTable.style.display = "none"; // Hide the booking table while loading
  setTimeout(() => {
    const loader = document.getElementById("loaderId");
    loader.style.display = "none"; // Clear loading after 2 seconds
    customerAgreementTable.style.display = ""; // Hide the booking table while loading
  }, 500);
}
// modal eka close weddi form eka clear karan function eka
formResetFunctionWhenClosingModal("customerAgreementModal", "customerAgreementForm", refreshCustomerAgreementForm);
//Alert Box Call function
Swal.isVisible();
// Export Functionality
const exportTable = (type) => {
  const table = $("#customerAgreementTable").DataTable();

  if (type === "excel") {
    table.button(".buttons-excel").trigger();
  } else if (type === "pdf") {
    table.button(".buttons-pdf").trigger();
  } else if (type === "print") {
    customerAgreementFromPrint();
  }
};
