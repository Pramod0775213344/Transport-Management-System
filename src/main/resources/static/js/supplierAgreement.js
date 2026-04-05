window.addEventListener("load", () => {
  // get count of the supplier agreement
  let supplierAgreementCount = getServiceRequest("/supplieragreement/countall");
  document.getElementById("supplierAgreementCount").innerText = supplierAgreementCount;

  // get count of the active supplier agreement
  let activeSupplierAgreementCount = getServiceRequest("/supplieragreement/countactive");
  document.getElementById("activeSupplierAgreementCount").innerText = activeSupplierAgreementCount;

  // get count of the pending supplier agreement
  let pendingSupplierAgreementCount = getServiceRequest("/supplieragreement/countpending");
  document.getElementById("pendingSupplierAgreementCount").innerText = pendingSupplierAgreementCount;

  // get count of the reject supplier agreement
  let rejectSupplierAgreementCount = getServiceRequest("/supplieragreement/countreject");
  document.getElementById("rejectSupplierAgreementCount").innerText = rejectSupplierAgreementCount;

  refreshSupplierAgreementForm();

  // Check pending renewal eka open karanwa
  const pendingRenewal = localStorage.getItem("pendingRenewal");
  if (pendingRenewal) {
    const dataOb = JSON.parse(pendingRenewal);

    // data ob eka supplier agreemnt eka bind karanwa
    supplierAgreement.vehicle_id = dataOb.vehicle_id;
    // Database ID eka null karanna oni aluth ekak widihata save wenna
    supplierAgreement.sup_agreement_no = null;
    // supplierAgreement.supplierAgreement.isRenewal = true; // identification ekata

    // modal eke title eka wenas karanwa
    $("#supplierAgreementFormModal").modal("show");
    document.getElementById("modalTitle").innerText = "Renewal Service Agreement";
    document.getElementById("modalSubtitle").innerText = "Renew the existing agreement details below.";

    // select input ekata value eka asigni karana change eka hadala thiyena function tika trigger karanwa
    $("#selectTransportName").val(JSON.stringify(dataOb.supplier_id)).trigger("change");
    selectTransportName.disabled = true;

    $("#selectVehicleNo").val(JSON.stringify(dataOb.vehicle_id)).trigger("change");

    const packageByVehicle = getServiceRequest("/package/byvehicleid?vehicleid=" + dataOb.vehicle_id.id);
    dataFilIntoSelect(selectPackageType, "Select Package Type", packageByVehicle, "name");
    $("#selectPackageType").val(JSON.stringify(dataOb.package_id)).trigger("change");
    selectPackageType.disabled = false;

    textSupplierAgreementDate.value = dataOb.agreement_date;
    textSupplierAgreementPeriod.value = dataOb.agreement_period;
    textSupplierAgreementEndDate.value = dataOb.agreement_end_date;
    textSupplierAgreementApprovalNote.value = dataOb.approval_note;

    // submit kalama loacl storage eka claen karannawa
    localStorage.removeItem("pendingRenewal");

    Swal.fire({
      title: "Renewal Mode",
      text: `${dataOb.supplier_id.transportname} agreemnt details succdefull added to the Renewal form.`,
      icon: "info",
      timer: 2000,
      showConfirmButton: false,
      customClass: { popup: "swal2-border-radius" },
    });
  }
});

// filtering area functions
const filteringSupplierName = document.getElementById("filteringSupplierName");
const filteringSupplierVehicleType = document.getElementById("filteringSupplierVehicleType");
const filteringSupplierAgreementStatus = document.getElementById("filteringSupplierAgreementStatus");
const supplierAgreementTableBody = document.getElementById("supplierAgreementTableBody");
const supplierAggrementTable = document.getElementById("supplierAggrementTable");
const tableOverlay = document.getElementById("tableOverlay");
const tableLength = document.getElementById("tableLength");
const tableSearch = document.getElementById("tableSearch");
const filtering = () => {
  if ($.fn.dataTable.isDataTable("#supplierAggrementTable")) {
    $("#supplierAggrementTable").DataTable().destroy();
  }

  // supplier name eka witharak thiyenw nam
  if (filteringSupplierName.value != "" && filteringSupplierVehicleType.value === "" && filteringSupplierAgreementStatus.value === "") {
    let selectSupplier = JSON.parse(filteringSupplierName.value);
    let supplierAgreements = getServiceRequest("/supplieragreement/filterbysupplierid?supplierId=" + selectSupplier.id);
    loadSupplierAgreementTable(supplierAgreements);
  }
  // vehicle type eka witharak thiyenw nam
  else if (filteringSupplierName.value === "" && filteringSupplierVehicleType.value != "" && filteringSupplierAgreementStatus.value === "") {
    let selectSupplierVehicleType = JSON.parse(filteringSupplierVehicleType.value);
    let supplierAgreements = getServiceRequest("/supplieragreement/filterbyvehicletype?vehicleTypeId=" + selectSupplierVehicleType.id);
    loadSupplierAgreementTable(supplierAgreements);
  }
  // status eka witharak thiyenw nam
  else if (filteringSupplierName.value === "" && filteringSupplierVehicleType.value === "" && filteringSupplierAgreementStatus.value != "") {
    let selectSupplierAgreementStatus = JSON.parse(filteringSupplierAgreementStatus.value);
    let supplierAgreements = getServiceRequest("/supplieragreement/filterbystatus?statusId=" + selectSupplierAgreementStatus.id);
    loadSupplierAgreementTable(supplierAgreements);
  }
  //     supplier name eka saha vehicle type eka thiyenw nam
  else if (filteringSupplierName.value != "" && filteringSupplierVehicleType.value != "" && filteringSupplierAgreementStatus.value === "") {
    let selectSupplier = JSON.parse(filteringSupplierName.value);
    let selectSupplierVehicleType = JSON.parse(filteringSupplierVehicleType.value);
    let supplierAgreements = getServiceRequest(
      "/supplieragreement/filterbysupplieridandvehicletype?supplierId=" + selectSupplier.id + "&vehicleTypeId=" + selectSupplierVehicleType.id,
    );
    loadSupplierAgreementTable(supplierAgreements);
  }
  // supplier name eka saha status eka thiyenw nam
  else if (filteringSupplierName.value != "" && filteringSupplierVehicleType.value === "" && filteringSupplierAgreementStatus.value != "") {
    let selectSupplier = JSON.parse(filteringSupplierName.value);
    let selectSupplierAgreementStatus = JSON.parse(filteringSupplierAgreementStatus.value);
    let supplierAgreements = getServiceRequest(
      "/supplieragreement/filterbysupplieridandstatus?supplierId=" + selectSupplier.id + "&statusId=" + selectSupplierAgreementStatus.id,
    );
    loadSupplierAgreementTable(supplierAgreements);
  }
  // vehicle type eka saha status eka thiyenw nam
  else if (filteringSupplierName.value === "" && filteringSupplierVehicleType.value != "" && filteringSupplierAgreementStatus.value != "") {
    let selectSupplierVehicleType = JSON.parse(filteringSupplierVehicleType.value);
    let selectSupplierAgreementStatus = JSON.parse(filteringSupplierAgreementStatus.value);
    let supplierAgreements = getServiceRequest(
      "/supplieragreement/filterbyvehicletypeandstatus?vehicleTypeId=" + selectSupplierVehicleType.id + "&statusId=" + selectSupplierAgreementStatus.id,
    );
    loadSupplierAgreementTable(supplierAgreements);
  }
  // customerge name eka saha vehicle type eka saha status eka thiyenw nam
  else if (filteringSupplierName.value != "" && filteringSupplierVehicleType.value != "" && filteringSupplierAgreementStatus.value != "") {
    let selectSupplier = JSON.parse(filteringSupplierName.value);
    let selectSupplierVehicleType = JSON.parse(filteringSupplierVehicleType.value);
    let selectSupplierAgreementStatus = JSON.parse(filteringSupplierAgreementStatus.value);
    let supplierAgreements = getServiceRequest(
      "/supplieragreement/filterbysupplieridandvehicletypeandstatus?supplierId=" +
        selectSupplier.id +
        "&vehicleTypeId=" +
        selectSupplierVehicleType.id +
        "&statusId=" +
        selectSupplierAgreementStatus.id,
    );
    loadSupplierAgreementTable(supplierAgreements);
  }
  // ewa naththam alll data gannawa
  else {
    let supplierAgreements = getServiceRequest("/supplieragreement/alldata");
    loadSupplierAgreementTable(supplierAgreements);
    Swal.fire({
      title: "Search Criteria Missing",
      text: "Please fill in at least one search field.",
      icon: "info",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
  }
};

// filtering eka reset karanwa funtion eka
const resetFilter = () => {
  // select wala value eka reset karanawa
  filteringSupplierName.value = "";
  filteringSupplierVehicleType.value = "";
  filteringSupplierAgreementStatus.value = "";

  // data table eka destroy karanawa
  if ($.fn.dataTable.isDataTable("#supplierAggrementTable")) {
    $("#supplierAggrementTable").DataTable().destroy();
  }

  // all agreement data tika load karanwa
  let supplierAgreements = getServiceRequest("/supplieragreement/alldata");
  loadSupplierAgreementTable(supplierAgreements);
};

// table data load function
const loadSupplierAgreementTable = (supplierAgreements) => {
  // data table eka destroy karanawa
  if ($.fn.dataTable.isDataTable("#supplierAggrementTable")) {
    $("#supplierAggrementTable").DataTable().destroy();
  }
  const propertyList = [
    { propertyName: getSupplierAgreementNo, dataType: "function" },
    { propertyName: getSupplier, dataType: "function" },
    { propertyName: getVehicleDetails, dataType: "function" },
    { propertyName: getPackageDetails, dataType: "function" },
    { propertyName: getCotranctPeriod, dataType: "function" },
    { propertyName: getSupplierAgreementStatus, dataType: "function" },
  ];

  dataFillIntoTheTable(supplierAgreementTableBody, supplierAgreements, propertyList, supplierAgreementView, supplierAgreementEdit, supplierAgreementDelete, true);

  const table = $("#supplierAggrementTable").DataTable({
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

// get supplier transport name
const getSupplierAgreementNo = (dataOb) => {
  return "<span class ='unique_no'>" + dataOb.sup_agreement_no + "</span >";
};

// get supplier
const getSupplier = (dataOb) => {
  if (dataOb.supplier_id.category_type === "Company") {
    return `<div class="row" >${dataOb.supplier_id.company_name}</div>
<div class="row text-muted" style="font-size: 14px;">${dataOb.supplier_id.transportname}</div>
<div class="row text-muted" style="font-size: 14px;">${dataOb.supplier_id.company_contact_no}</div>`;
  } else {
    return `<div class="row" >${dataOb.supplier_id.fullname}</div>
<div class="row text-muted" style="font-size: 14px;">${dataOb.supplier_id.transportname}</div>
<div class="row text-muted" style="font-size: 14px;">${dataOb.supplier_id.mobileno}</div>`;
  }
};

// get vehicle type
const getVehicleDetails = (dataOb) => {
  return `<div class="row" >${dataOb.vehicle_id.vehicle_no}</div>
<div class="row text-muted" style="font-size: 14px;">${dataOb.vehicle_id.vehicle_type_id.name}</div>`;
};

// get package type
const getPackageDetails = (dataOb) => {
  return `<div class="row" >${dataOb.package_id.name}</div>
<div class="row text-muted" style="font-size: 14px;">${dataOb.package_id.distance} Km</div>`;
};

// get contract period
const getCotranctPeriod = (dataOb) => {
  return `<div class="row" >${dateformat(dataOb.agreement_date)}  - ${dateformat(dataOb.agreement_end_date)}</div>
<div class="row text-muted" >${dataOb.agreement_period} months</div>`;
};

// get supplier agreement status
const getSupplierAgreementStatus = (dataOb) => {
  if (dataOb.supplier_agreement_status_id.status == "Approved") {
    return "<span class='status-badge status-active'>" + dataOb.supplier_agreement_status_id.status + "</span>";
  }

  if (dataOb.supplier_agreement_status_id.status == "Pending") {
    return "<span class='status-badge status-pending'> " + dataOb.supplier_agreement_status_id.status + "</span>";
  }
  if (dataOb.supplier_agreement_status_id.status == "Expired") {
    return "<span class='status-badge status-inactive'> " + dataOb.supplier_agreement_status_id.status + "</span>";
  }
  if (dataOb.supplier_agreement_status_id.status == "Deleted") {
    return "<span class='status-badge status-inactive'> " + dataOb.supplier_agreement_status_id.status + "</span>";
  }
  if (dataOb.supplier_agreement_status_id.status == "Reject") {
    return "<span class='status-badge status-reject'> " + dataOb.supplier_agreement_status_id.status + "</span>";
  }
  if (dataOb.supplier_agreement_status_id.status == "Closed") {
    return "<span class='status-badge status-renewd'> " + dataOb.supplier_agreement_status_id.status + "</span>";
  }
};

// supplier agreement view function
const supplierAgreementView = (dataOb) => {
  dataAgreementRegNo.innerText = dataOb.sup_agreement_no;
  dataAgreementStartDate.innerText = dataOb.agreement_date;
  dataEndDate.innerText = dataOb.agreement_end_date;

  dataAgreementStartDateTitle.innerText = dataOb.agreement_date;
  dataEndDateTitle.innerText = dataOb.agreement_end_date;
  dataAgreementPeriod.innerText = dataOb.agreement_period + " month";
  agreementNo1.innerText = dataOb.sup_agreement_no;
  agreementPeriod1.innerText = dataOb.agreement_period + " month";
  agreementVehicleType.innerText = dataOb.vehicle_id.vehicle_type_id.name;
  agreementPackageName.innerText = dataOb.package_id.name;
  agreementDistance.innerText = dataOb.package_id.distance + " KM";

  dataPackageName.innerText = dataOb.package_id.name;
  dataVehicleType.innerText = dataOb.vehicle_id.vehicle_type_id.name;
  dataDistance.innerText = dataOb.package_id.distance + " KM";

  if (dataOb.package_id.package_type === "Floating Rate") {
    dataSupplierRate.innerText = "Rs. " + dataOb.package_id.package_charge_sup + " Per Km";
    termsPackageRate.innerText = dataOb.package_id.package_charge_sup + " Per Km";
  } else {
    dataSupplierRate.innerText = "Rs. " + dataOb.package_id.package_charge_sup;
  }

  dataVehicleNo1.innerText = dataOb.vehicle_id.vehicle_no;

  termsAgreementStartDate.innerText = dataOb.agreement_date;
  termsAgreementEndDate.innerText = dataOb.agreement_end_date;
  termsPeriod.innerText = dataOb.agreement_period + " month";
  termsDistance.innerText = dataOb.package_id.distance + " KM";
  termsVehicleNo.innerText = dataOb.vehicle_id.vehicle_no;

  agreementstatus.innerText = dataOb.supplier_agreement_status_id.status;

  if (dataOb.supplier_id.category_type === "Company") {
    dataSuppliername.innerText = dataOb.supplier_id.company_name;

    dataSupplierMobileNo.innerText = dataOb.supplier_id.company_contact_no;
    dataSupplierEmail.innerText = dataOb.supplier_id.company_email;
    dataSupplierAddress.innerText = dataOb.supplier_id.company_address;

    termsSupplierName.innerText = dataOb.supplier_id.company_name;

    supplierName.innerText = dataOb.supplier_id.company_name;
    supplierAddress.innerText = dataOb.supplier_id.company_address;
    supplierEmail.innerText = dataOb.supplier_id.company_email;
    supplierMobile.innerText = dataOb.supplier_id.company_contact_no;

    termsSupplierAddress.innerText = dataOb.supplier_id.company_address;
    termsSupplierEmail.innerText = dataOb.supplier_id.company_email;
    termsSupplierMobile.innerText = dataOb.supplier_id.company_contact_no;
  } else {
    dataSuppliername.innerText = dataOb.supplier_id.fullname;

    dataSupplierMobileNo.innerText = dataOb.supplier_id.mobileno;
    dataSupplierEmail.innerText = dataOb.supplier_id.email;
    dataSupplierAddress.innerText = dataOb.supplier_id.address;

    termsSupplierName.innerText = dataOb.supplier_id.fullname;

    supplierName.innerText = dataOb.supplier_id.fullname;
    supplierAddress.innerText = dataOb.supplier_id.address;
    supplierEmail.innerText = dataOb.supplier_id.email;
    supplierMobile.innerText = dataOb.supplier_id.mobileno;

    termsSupplierAddress.innerText = dataOb.supplier_id.address;
    termsSupplierEmail.innerText = dataOb.supplier_id.email;
    termsSupplierMobile.innerText = dataOb.supplier_id.mobileno;
  }

  // when click the edit button the form will be display
  $("#supplierAgreementViewModal").modal("show");
};

// supplier agreement print function eka
const supplierAgreementFromPrint = () => {
  let newWindow = window.open();
  let printView =
    "<head><title>TMS</title><link rel='stylesheet' href='/css/supplierAgreement.css'><link rel='stylesheet' href='/bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'></head><body>" +
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

// supplier agreement delete function
const supplierAgreementDelete = (dataOb) => {
  let userConfirm = Swal.fire({
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
  }).then((userConfirm) => {
    if (userConfirm.isConfirmed) {
      //call post service
      let deleteResponse = httpServiceRequest("/supplieragreement/delete", "DELETE", dataOb);
      if (deleteResponse == "ok") {
        Swal.fire({
          title: "Agreement Deleted!",
          text: "The supplier agreement has been successfully removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-border-radius",
          },
        });
        refreshSupplierAgreementForm();
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
        text: "Agreement not Deleted!",
        icon: "error",
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    }
  });
};

// supplier agreement edit function
const supplierAgreementEdit = (dataOb) => {
  // check the status of the agreementa and if it is approved can't edit the details
  if (
    dataOb.supplier_agreement_status_id.status == "Approved" ||
    dataOb.supplier_agreement_status_id.status == "Closed" ||
    dataOb.supplier_agreement_status_id.status == "Deleted"
  ) {
    Swal.fire({
      title: "Action Restricted",
      text: "Cannot edit the details of an approved or closed agreement.",
      icon: "info",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    return;
  }

  // check the status of the agreementa and if it is Deletd can't edit the details
  if (dataOb.supplier_agreement_status_id.status == "Deleted") {
    Swal.fire({
      title: "Action Restricted",
      text: "Cannot edit the details of a deleted agreement.",
      icon: "error",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    return;
  }

  selectTransportName.value = JSON.stringify(dataOb.supplier_id);

  let vehicleBySupplier = getServiceRequest("/vehicle/bysupplierid?supplierid=" + dataOb.supplier_id.id);
  dataFilIntoSelect(selectVehicleNo, "Select Vehicle", vehicleBySupplier, "vehicle_no");

  selectVehicleNo.value = JSON.stringify(dataOb.vehicle_id);

  textSupplierAgreementDate.value = dataOb.agreement_date;

  textSupplierAgreementPeriod.value = dataOb.agreement_period;

  textSupplierAgreementEndDate.value = dataOb.agreement_end_date;

  let packageByVehicle = getServiceRequest("/package/byvehicleid?vehicleid=" + dataOb.vehicle_id.id);
  dataFilIntoSelect(selectPackageType, "Select Package Type", packageByVehicle, "name");
  selectPackageType.value = JSON.stringify(dataOb.package_id);

  textSupplierAgreementApprovalNote.value = dataOb.approval_note;

  supplierAgreement = JSON.parse(JSON.stringify(dataOb));
  oldSupplierAgreement = JSON.parse(JSON.stringify(dataOb));

  // when click the edit button the form will be display
  $("#supplierAgreementFormModal").modal("show");

  selectVehicleNo.disabled = false;

  updateButton.style.display = "";
  submitButton.style.display = "none";

  let supplierAgreements = getServiceRequest("/supplieragreement/filterbysupplierid?supplierId=" + dataOb.supplier_id.id);
  console.log(supplierAgreements, "agreement");
  if (supplierAgreements && supplierAgreements.length > 0) {
    supplierAgreementViewTable.style.display = "";
    newSupplierNote.style.display = "none";
    const propertyList = [
      { propertyName: "sup_agreement_no", dataType: "string" },
      {
        propertyName: (dataOb) => dataOb.vehicle_id.vehicle_no,
        dataType: "function",
      },
      {
        propertyName: (dataOb) => dataOb.package_id.name,
        dataType: "function",
      },
    ];
    dataFillIntoTheReportTable(supplierAgreementViewTableBody, supplierAgreements, propertyList);
  } else {
    supplierAgreementViewTable.style.display = "none";
    newSupplierNote.style.display = "";
  }
  supplierAgreementApprovalDiv.style.display = "";

  document.getElementById("modalTitle").innerText = "Update Service Agreement";
  document.getElementById("modalSubtitle").innerText = "Modify the existing agreement details below.";
};

// check form errros
const checkFormError = () => {
  let errors = "";

  if (supplierAgreement.supplier_id == null) {
    errors = errors + "Please Select Supplier Name <br>";
    selectTransportName.classList.add("is-invalid");
  }
  if (supplierAgreement.vehicle_id == null) {
    errors = errors + "Please Select Vehicle Number <br>";
    selectVehicleNo.classList.add("is-invalid");
  }
  if (supplierAgreement.agreement_date == null) {
    errors = errors + "Please Select Agreement Date <br>";
    textSupplierAgreementDate.classList.add("is-invalid");
  }
  if (supplierAgreement.agreement_period == null) {
    errors = errors + "Please Select Agreement Period <br>";
    textSupplierAgreementPeriod.classList.add("is-invalid");
  }
  if (supplierAgreement.agreement_end_date == null) {
    errors = errors + "Please Select Agreement End Date <br>";
    textSupplierAgreementEndDate.classList.add("is-invalid");
  }
  if (supplierAgreement.package_id == null) {
    errors = errors + "Please Select Package Type <br>";
    selectPackageType.classList.add("is-invalid");
  }

  return errors;
};

// supplier agreement form submit
const supplierAgreementFormSubmit = () => {
  console.log(supplierAgreement);

  // check form error for required element
  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    // errors not exit
    //need to get user confirmation

    let userConfirm = Swal.fire({
      title: "Confirm Agreement Submission",
      text: "Are you sure you want to create this new supplier agreement?",
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
        let postResponse = httpServiceRequest("/supplieragreement/insert", "POST", supplierAgreement);
        if (postResponse == "ok") {
          Swal.fire({
            title: "Agreement Created!",
            text: "The Supplier Agreement has been successfully created.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          refreshSupplierAgreementForm();
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

  if (supplierAgreement != null && oldSupplierAgreement != null) {
    if (supplierAgreement.supplier_id.transportname != oldSupplierAgreement.supplier_id.transportname) {
      updates = updates + "Transport Name is changed.....";
    }
    if (supplierAgreement.vehicle_id.vehicle_no != oldSupplierAgreement.vehicle_id.vehicle_no) {
      updates = updates + "Vehicle Number is changed ";
    }
    if (supplierAgreement.agreement_date != oldSupplierAgreement.agreement_date) {
      updates = updates + "Agreement Date is changed  ";
    }
    if (supplierAgreement.agreement_period != oldSupplierAgreement.agreement_period) {
      updates = updates + "Agreement Period is changed  ";
    }
    if (supplierAgreement.agreement_end_date != oldSupplierAgreement.agreement_end_date) {
      updates = updates + "Agreement End Date is changed  ";
    }

    if (supplierAgreement.package_id.name != oldSupplierAgreement.package_id.name) {
      updates = updates + "Package Type is changed  ";
    }
    if (supplierAgreement.agreement_charge != oldSupplierAgreement.agreement_charge) {
      updates = updates + "Agreement Charge is changed  ";
    }
    if (supplierAgreement.additional_charge != oldSupplierAgreement.additional_charge) {
      updates = updates + "Additional Charge is changed  ";
    }
    if (supplierAgreement.distance != oldSupplierAgreement.distance) {
      updates = updates + "Distance is changed  ";
    }
    if (supplierAgreement.total_amount != oldSupplierAgreement.total_amount) {
      updates = updates + "Total Amount is changed  ";
    }

    if (supplierAgreement.special_note != oldSupplierAgreement.special_note) {
      updates = updates + "Note is changed  ";
    }
  }
  return updates;
};

// supplier agreement form update
const supplierAgreementFormUpdate = () => {
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
      console.log(oldSupplierAgreement);
      console.log(supplierAgreement);
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
          let putResponse = httpServiceRequest("/supplieragreement/update", "PUT", supplierAgreement);
          if (putResponse == "ok") {
            Swal.fire({
              title: "Agreement Updated!",
              text: "The supplier agreement has been successfully updated.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: "swal2-border-radius",
              },
            });
            refreshSupplierAgreementForm();
            $("#supplierAgreementFormModal").modal("hide");
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

// refresh supplier agreement form
const refreshSupplierAgreementForm = () => {
  supplierAgreement = new Object();

  supplierAgreementForm.reset();

  setDefault([selectTransportName, selectVehicleNo, textSupplierAgreementDate, textSupplierAgreementPeriod, textSupplierAgreementEndDate, selectPackageType]);

  let transportnames = getServiceRequest("/supplier/alldatabystatus");
  dataFilIntoSelect(selectTransportName, "Select Transport Name", transportnames, "transportname");

  let vehicles = getServiceRequest("/vehicle/alldata");
  dataFilIntoSelect(selectVehicleNo, "Select Vehicle ", vehicles, "vehicle_no");

  let packageTypes = getServiceRequest("/package/bypackagestatus");
  dataFilIntoSelect(selectPackageType, "Select Package Type", packageTypes, "name");

  selectVehicleNo.disabled = true;
  selectPackageType.disabled = true;

  submitButton.style.display = "";
  updateButton.style.display = "none";
  supplierAgreementApprovalDiv.style.display = "none";
  supplierAgreementViewTable.style.display = "none";
  newSupplierNote.style.display = "none";

  //     filtering area eke thiyen drop down tika fil karanawa
  dataFilIntoSelect(filteringSupplierName, "Select Company Name", transportnames, "transportname");

  let vehiclesTypes = getServiceRequest("/vehicletype/alldata");
  dataFilIntoSelect(filteringSupplierVehicleType, "Select Vehicle Type", vehiclesTypes, "name");

  let agreementStatus = getServiceRequest("/supplieragreementstatus/alldata");
  dataFilIntoSelect(filteringSupplierAgreementStatus, "Select Status ", agreementStatus, "status");

  // all agreement data tika load karanwa
  let supplierAgreements = getServiceRequest("/supplieragreement/alldata");
  loadSupplierAgreementTable(supplierAgreements);

  document.getElementById("modalTitle").innerText = "Add New Supplier Agreement";
  document.getElementById("modalSubtitle").innerText = "Fill in the details below to create a new service agreement.";
};

// filter function for select transport name
let transportNameElement = document.querySelector("#selectTransportName");
transportNameElement.addEventListener("change", () => {
  let supplier = JSON.parse(transportNameElement.value);
  supplierAgreement.supplier_id = JSON.parse(transportNameElement.value);

  selectTransportName.classList.remove("is-invalid");
  selectTransportName.classList.add("is-valid");

  selectVehicleNo.disabled = false;

  let vehicleBySupplier = getServiceRequest("/vehicle/bysupplierid?supplierid=" + supplier.id);
  console.log(vehicleBySupplier);
  // get vehicle type function
  let getVehicleType = (vehicle) => vehicle.vehicle_type_id.name;
  dataFillIntoSelectWithTwoNamesWithBracket(selectVehicleNo, "Select Vehicle ", vehicleBySupplier, "vehicle_no", getVehicleType);
});

// filter function for selct package type using vehicle id
let vehicleElement = document.querySelector("#selectVehicleNo");
vehicleElement.addEventListener("change", () => {
  let vehicle = JSON.parse(vehicleElement.value);
  supplierAgreement.vehicle_id = JSON.parse(vehicleElement.value);

  // onchange ekedi object eka clear karanawa
  supplierAgreement.package_id = null;
  setDefault([selectPackageType]);

  selectVehicleNo.classList.remove("is-invalid");
  selectVehicleNo.classList.add("is-valid");

  selectPackageType.disabled = false;

  let packageByVehicle = getServiceRequest("/package/byvehicleid?vehicleid=" + vehicle.id);
  dataFilIntoSelect(selectPackageType, "Select Package Type", packageByVehicle, "name");
});

//calclate end date using given date and time period

let agreementEndDate = (startDateStr, periodValue) => {
  const startdate = new Date(startDateStr);
  const enddate = new Date(startdate);
  enddate.setMonth(startdate.getMonth() + Number(periodValue));

  // input type ekata galapena widihata date input format ekata convert karanna
  return `${enddate.getFullYear()}-${(enddate.getMonth() + 1).toString().padStart(2, "0")}-${enddate.getDate().toString().padStart(2, "0")}`;
};

document.getElementById("textSupplierAgreementPeriod").onchange = () => {
  const agreementStartDate = document.getElementById("textSupplierAgreementDate").value;
  const agreementPeriod = document.getElementById("textSupplierAgreementPeriod").value;

  //object ekata bind karanawa
  supplierAgreement.agreement_period = agreementPeriod;
  // validation
  textSupplierAgreementPeriod.classList.remove("is-invalid");
  textSupplierAgreementPeriod.classList.add("is-valid");

  const endDate = agreementEndDate(agreementStartDate, agreementPeriod);
  document.getElementById("textSupplierAgreementEndDate").value = endDate;

  // object ekata bind karanawa
  supplierAgreement.agreement_end_date = endDate;
  // validation
  textSupplierAgreementEndDate.classList.remove("is-invalid");
  textSupplierAgreementEndDate.classList.add("is-valid");
  console.log(endDate); // "7/15/2024"
};

// Supplier ta adala agreement thiyenw nam ewa view karanwa form eke
// Show agreements for selected supplier in the form
let selectTransportName = document.getElementById("selectTransportName");
$("#selectTransportName").on("change", function (e) {
  console.log(2);
  console.log(selectTransportName.value);
  let supplier = JSON.parse(selectTransportName.value);
  let supplierAgreements = getServiceRequest("supplieragreement/filterbysupplierid?supplierId=" + supplier.id);
  console.log(supplierAgreements, "agreement");
  if (supplierAgreements && supplierAgreements.length > 0) {
    supplierAgreementViewTable.style.display = "";
    newSupplierNote.style.display = "none";
    const propertyList = [
      { propertyName: "sup_agreement_no", dataType: "string" },
      {
        propertyName: (dataOb) => dataOb.vehicle_id.vehicle_no,
        dataType: "function",
      },
      {
        propertyName: (dataOb) => dataOb.package_id.name,
        dataType: "function",
      },
    ];
    dataFillIntoTheReportTable(supplierAgreementViewTableBody, supplierAgreements, propertyList);
  } else {
    supplierAgreementViewTable.style.display = "none";
    newSupplierNote.style.display = "";
  }
});

//-----------------------table loading show function-------------------
// table eke loading spin eka load karanwa
function showTableLoading() {
  const loader = document.getElementById("tableOverlay");
  const table = document.getElementById("supplierAggrementTable");
  if (loader && table) {
    loader.removeAttribute("hidden");
    loader.style.display = "flex";
    table.style.display = "none";
    setTimeout(() => {
      loader.style.display = "none";
      loader.setAttribute("hidden", "hidden");
      table.style.display = "";
    }, 500);
  }
}

// modal eka close weddi form eka clear karan function eka
formResetFunctionWhenClosingModal("supplierAgreementFormModal", "supplierAgreementForm", refreshSupplierAgreementForm);

//Alert Box Call function
Swal.isVisible();
