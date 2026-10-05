// ==================== load functions ===================================
window.addEventListener("load", () => {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      refreshVehicleForm();
    } catch (e) {
      console.error("Error during vehicle page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);
  $("#textVehicleTransportName").select2({
    theme: "bootstrap-5",
    dropdownParent: $("#vehicleFormModal"),
  });
});
// ==================== end load functions ===================================

// ==================== search & reset functions ===================================
// load vehicle table with search area
const searchVehicle = () => {
  let searchVehicleNo = document.getElementById("searchVehicleNo").value;
  let searchVehicleType = document.getElementById("searchVehicleType").value;
  let searchVehicleStatus = document.getElementById("searchVehicleStatus").value;

  let query = "";
  if (searchVehicleNo != "") query += "&vehicleNo=" + searchVehicleNo;
  if (searchVehicleType != "") query += "&vehicleTypeId=" + JSON.parse(searchVehicleType).id;
  if (searchVehicleStatus != "") query += "&statusId=" + JSON.parse(searchVehicleStatus).id;


  if (query == "") {
    loadVehicleTable(vehicles);
  } else {
    // Implement advanced search or filter current 'vehicles' array
    let filteredVehicles = vehicles.filter((v) => {
      let matchNo = searchVehicleNo == "" || v.vehicle_no.toLowerCase().includes(searchVehicleNo.toLowerCase());
      let matchType = searchVehicleType == "" || v.vehicle_type_id.id == JSON.parse(searchVehicleType).id;
      let matchStatus = searchVehicleStatus == "" || v.vehicle_status_id.id == JSON.parse(searchVehicleStatus).id;
      return matchNo && matchType && matchStatus;
    });
    loadVehicleTable(filteredVehicles);
  }
};

const resetSearchVehicle = () => {
  document.getElementById("searchVehicleNo").value = "";
  document.getElementById("searchVehicleType").value = "";
  document.getElementById("searchVehicleStatus").value = "";
  document.getElementById("dtSearch").value = "";
  loadVehicleTable(vehicles);
};
// ==================== end search & reset functions ===================================


// ==================== refresh vehicle form ===================================
const resfreshForm = () => {
  refreshVehicleForm();
};
// ==================== end refresh vehicle form ===================================



// =================== load vehicle table ===================================
// load vehicle table
const loadVehicleTable = (vehicles) => {
  if ($.fn.dataTable.isDataTable("#vehicleTable")) {
    $("#vehicleTable").DataTable().clear().destroy();
  }

  const propertyList = [
    { propertyName: "vehicle_photo", dataType: "truck-image-array" },
    { propertyName: getSupplierDetails, dataType: "function" },
    { propertyName: getVehicleDetails, dataType: "function" },
    { propertyName: getVehicleMake, dataType: "function" },
    { propertyName: "model", dataType: "string" },
    { propertyName: getBreakdown, dataType: "function" },
    { propertyName: getVehicleStatus, dataType: "function" },
  ];

  dataFillIntoTheTable(vehicleTableBody, vehicles, propertyList, vehicleView, vehicleEdit, vehicleDelete, true);

  const table = $("#vehicleTable").DataTable({
    dom: "Brtip",
    buttons: ["copy", "csv", "excel", "pdf", "print"],
    createdRow: function (row, data, dataIndex) {
      $(row).find("td").css({
        "text-align": "left",
        padding: "15px 20px",
        "vertical-align": "middle",
      });
    },
    headerCallback: function (thead, data, start, end, display) {
      $(thead).find("th").css({
        "text-align": "left",
        padding: "15px 20px",
        background: "var(--slate-50)",
        color: "var(--slate-700)",
        "font-weight": "600",
        "font-size": "13px",
        "text-transform": "uppercase",
        "letter-spacing": "0.5px",
      });
    },
  });
  // btn hide karanawa according to the privileges
  applyPrivileges("Fleet Management", "vehicleTable", { add: addButton });

  table.on("draw.dt", function () {
    applyPrivileges("Fleet Management", "vehicleTable", { add: addButton });
  });
};

// Custom Table Controls
const dtSearch = (input) => {
  $("#vehicleTable").DataTable().search(input.value).draw();
};

const dtLength = (select) => {
  $("#vehicleTable").DataTable().page.len(select.value).draw();
};

const dtExport = (type) => {
  if (type === "excel") {
    exportTableToExcelWithSheetJS("#vehicleTable", "vehicles", { sheetName: "Vehicles" });
  } else if (type === "print") {
    $(".buttons-print").click();
  }
};

// get supplier Details Name
const getSupplierDetails = (dataOb) => {
  if (dataOb.supplier_id == null) {
    return "Okidoki";
  } else {
    if (dataOb.supplier_id.category_type == "Individual") {
      return `<div class="row  pb-2" >${dataOb.supplier_id.fullname}</div>
<div class="row pb-2 text-muted" style="font-size: 12px;">${dataOb.supplier_id.transportname}</div>
<div class="row pb-2 text-muted" style="font-size: 12px;">${dataOb.supplier_id.mobileno}</div>`;
    } else {
      return `<div class="row pb-2" >${dataOb.supplier_id.company_name}</div>
<div class="row pb-2 text-muted" style="font-size: 12px;">${dataOb.supplier_id.transportname}</div>
<div class="row pb-2 text-muted" style="font-size: 12px;">${dataOb.supplier_id.company_contact_no}</div>`;
    }
  }
};

// get Vehicle Type
const getVehicleDetails = (dataOb) => {
  return `<div class="row fw-bold" >${dataOb.vehicle_no}</div>
<div class="row" style="font-size: 14px;">${dataOb.vehicle_type_id.name}</div>`;
};

// get Vehicle Make
const getVehicleMake = (dataOb) => {
  return dataOb.vehicle_make_id.name;
};

const getBreakdown = (dataOb) => {
  if (dataOb.is_breakdown) {
    return "<span class='status-badge status-inactive'>Breakdown</span>";
  } else {
    return "<span class='status-badge status-active'>Good</span>";
  }
};

// get driver Status
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
};
// ============================ end of get vehicle status function ==============================



// =========================== delete vehicle function =================================================
// vehicle form delete function
const vehicleDelete = (dataOb) => {

  // check if the vehicle is already deleted
  if (dataOb.vehicle_status_id.status === "Deleted") {
    Swal.fire({
      title: "Vehicle Already Deleted",
      text: "This vehicle record has already been deleted.",
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
    title: "Confirm Vehicle Deletion",
    text: "Are you sure you want to delete this vehicle? This action cannot be undone!",
    icon: "warning",
    iconColor: "#ef4444",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete Vehicle",
    cancelButtonText: "No, Keep it",
    allowOutsideClick: false,
    customClass: {
      cancelButton: "btn-cancel",
      confirmButton: "btn-submit", // Keeping consistent with  system
      popup: "swal2-border-radius",
    },
  }).then((userConfirm) => {
    if (userConfirm.isConfirmed) {
      //call post service
      let deleteResponse = httpServiceRequest("/vehicle/delete", "DELETE", dataOb);
      if (deleteResponse == "ok") {
        Swal.fire({
          title: "Vehicle Deleted!",
          text: "The vehicle has been successfully removed from the fleet.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-border-radius",
          },
        });

        resetSearchVehicle()
        refreshVehicleForm();
      } else {
        Swal.fire({
          title: "Deletion Failed",
          text: deleteResponse,
          icon: "error",
          allowOutsideClick: false,
          customClass: {
            confirmButton: "btn-submit",
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
// =========================== end of delete vehicle function =================================================


// =========================== vehicle view & print function =================================================
// vehicle form function
const vehicleView = (dataOb) => {

  console.log(dataOb);

  document.getElementById("vehicle-number").innerText = dataOb.vehicle_no;
  if (dataOb.supplier_id == null) {
    document.getElementById("vehicle-transport-name").innerText = "Okidoki";
    document.getElementById("detail-supplier-name").innerText = "Okidoki";
    document.getElementById("detail-supplier-mobile").innerText = "011-7474747";
    document.getElementById("detail-supplier-initial").innerText = "O"
  } else {
    document.getElementById("vehicle-transport-name").innerText = dataOb.supplier_id.transportname
    if (dataOb.supplier_id.category_type == "Individual") {
      document.getElementById("detail-supplier-name").innerText = dataOb.supplier_id.fullname;
      document.getElementById("detail-supplier-mobile").innerText = dataOb.supplier_id.mobileno;
      const contactName = dataOb.supplier_id.fullname;
      document.getElementById("detail-supplier-initial").innerText = contactName.trim().charAt(0).toUpperCase() || "J";
    } else {
      document.getElementById("detail-supplier-name").innerText = dataOb.supplier_id.company_name;
      document.getElementById("detail-supplier-mobile").innerText = dataOb.supplier_id.company_contact_no;
      const contactName = dataOb.supplier_id.company_name;
      document.getElementById("detail-supplier-initial").innerText = contactName.trim().charAt(0).toUpperCase() || "J";
    }

  }
  document.getElementById("detail-vehicle-make").innerText = dataOb.vehicle_make_id.name;
  document.getElementById("detail-vehicle-no").innerText = dataOb.vehicle_no;
  document.getElementById("detail-vehicle-status").innerText = dataOb.vehicle_status_id.status;
  document.getElementById("detail-vehicle-type").innerText = dataOb.vehicle_type_id.name;
  document.getElementById("detail-vehicle-fuel").innerText = dataOb.fuel_consumption;
  document.getElementById("detail-vehicle-year").innerText = dataOb.make_year;

  document.getElementById("detail-insurance-expire-date").innerText = dataOb.insurance_expire_date;
  document.getElementById("detail-revenue-expire-date").innerText = dataOb.revenu_license_expire_date;

  // vehicle 4to eka null nam meka show karanwa naM DEFAULT 4TO EKA SHOW KARANWA
  const img = document.getElementById("truck-bg-img");
  const insuranceImage = document.getElementById("insuranceImage");
  const revenueImage = document.getElementById("revenueImage");
  const inspectionImage = document.getElementById("inspectionImage");
  const crImage = document.getElementById("crImage");

  if (dataOb.vehicle_photo) {
    img.src = atob(dataOb.vehicle_photo);
  } else {
    img.src = "/images/truck-booking.jpg";
  }


  if (dataOb.insurance_card_photo) {
    insuranceImage.src = atob(dataOb.insurance_card_photo);
    insuranceImage.style.display = "block";
    document.getElementById("insuranceNoImage").style.display = "none";
  } else {
    // Photo naha nam - image eka hide karala, "No image available" pennanawa
    insuranceImage.style.display = "none";
    document.getElementById("insuranceNoImage").style.display = "block";
  }
  if (dataOb.inspection_report_photo) {
    inspectionImage.src = atob(dataOb.inspection_report_photo);
    inspectionImage.style.display = "block";
    document.getElementById("inspectionNoImage").style.display = "none";

  } else {
    // Photo naha nam - image eka hide karala, "No image available" pennanawa
    inspectionImage.style.display = "none";
    document.getElementById("inspectionNoImage").style.display = "block";
  }
  if (dataOb.revenue_license_photo) {
    revenueImage.src = atob(dataOb.revenue_license_photo);
    revenueImage.style.display = "block";
    document.getElementById("revenueNoImage").style.display = "none";
  } else {
    // Photo naha nam - image eka hide karala, "No image available" pennanawa
    revenueImage.style.display = "none";
    document.getElementById("revenueNoImage").style.display = "block";
  }
  if (dataOb.cr_photo) {
    crImage.src = atob(dataOb.cr_photo);
    crImage.style.display = "block";
    document.getElementById("crNoImage").style.display = "none";
  } else {
    // Photo naha nam - image eka hide karala, "No image available" pennanawa
    crImage.style.display = "none";
    document.getElementById("crNoImage").style.display = "block";
  }



  // fuel history table eka load karanwa
  const fuelHistory = getServiceRequest("fuelrequest/byvehicle?vehicleId=" + dataOb.id)

  if (fuelHistory.length == 0) {

    vehicleFuelHistoryTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No data available</td></tr>`
    console.log("this work 1");


  } else {
    console.log("this work 2");

    const propertyList = [
      { propertyName: "approved_datetime", dataType: "string" },
      { propertyName: "request_fuel_cost_amount", dataType: "string" },
      { propertyName: getBookingNo, dataType: "function" },
      { propertyName: getStatus, dataType: "function" },
    ];
    dataFillIntoTheReportTable(vehicleFuelHistoryTableBody, fuelHistory, propertyList)


  }

  // last 10 bookings load karanwa
  const bookingHistory = getServiceRequest("booking/byvehicleid?vehicleId=" + dataOb.id)

  if (bookingHistory.length == 0) {

    vehicleBookingHistoryTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No data available</td></tr>`
    console.log("this work 1");


  } else {
    console.log("this work 2");
    if ($.fn.DataTable.isDataTable("#vehicleBookingHistoryTable")) {
      $("#vehicleBookingHistoryTable").DataTable().destroy();
    }
    const propertyList = [
      { propertyName: "booking_no", dataType: "string" },
      { propertyName: "pickup_date_time", dataType: "string" },
      { propertyName: "delivery_date_time", dataType: "string" },
      { propertyName: "distance", dataType: "string" },
      { propertyName: getBookingStatus, dataType: "function" },
    ];
    dataFillIntoTheReportTable(vehicleBookingHistoryTableBody, bookingHistory, propertyList)

    const table = $("#vehicleBookingHistoryTable").DataTable({
      dom: "rtip", // custom controls used
      pageLength: 5,
      createdRow: function (row, data, dataIndex) {
        $(row).find("td").css({
          "text-align": "left",
          height: "80px",
        });
      }
    })
  }

  openVehicleDetail();

  // -----------------print deatisl---------------------------
  viewVehicleNo.innerText = dataOb.vehicle_no;
  viewIssuedDate.innerText = dataOb.added_datetime ? dataOb.added_datetime.split("T")[0] : "-";
  if (dataOb.supplier_id != null) {
    viewTransportName.innerText = dataOb.supplier_id.transportname;
  } else {
    viewTransportName.innerText = "Okidoki Transpprt";
    viewSupplierName.innerText = "Okidoki- Global"
    viewSupplierMobile.innerText = "011-7474747";
  }

  if (dataOb.supplier_id.category_type == "Individual") {
    viewSupplierName.innerText = dataOb.supplier_id.fullname;
    viewSupplierMobile.innerText = dataOb.supplier_id.mobileno;
  } else if (dataOb.supplier_id.category_type == "Company") {
    viewSupplierName.innerText = dataOb.supplier_id.company_name;
    viewSupplierMobile.innerText = dataOb.supplier_id.company_contact_no;
  } else {
    viewSupplierName.innerText = "Okidoki- Global"
    viewSupplierMobile.innerText = "011-7474747";
  }

  viewVehicleModel.innerText = dataOb.model;
  viewVehicleNoHeader.innerText = dataOb.vehicle_no;
  viewVehicleMakeHeader.innerText = dataOb.vehicle_make_id.name;
  viewVehicleTypeHeader.innerText = dataOb.vehicle_type_id.name;
  printVehicleNo.innerText = dataOb.vehicle_no;
  printVehicleType.innerText = dataOb.vehicle_type_id.name;
  printVehicleMake.innerText = dataOb.vehicle_make_id.name;
  printVehicleModel.innerText = dataOb.model;
  printMakeYear.innerText = dataOb.make_year;
  printRevenuExpireDate.innerText = dataOb.revenu_license_expire_date;
  printInsuranceExpireDate.innerText = dataOb.insurance_expire_date;
  printStartMeterReading.innerText = dataOb.startup_meter_reading;
  printCurrentMeterReading.innerText = dataOb.current_meter_reading;
  printVehicleNoTerms.innerText = dataOb.vehicle_no;
};

const getBookingNo = (dataOb) => {
  return dataOb.booking_id.booking_no;
}

const getStatus = (dataOb) => {
  return "<span class='status-badge status-active'>" + dataOb.fuel_request_status_id.status + "</span>";
}

// get booking status with color
const getBookingStatus = (dataOb) => {
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
  } else if (status === "Departed From Delivery") {
    statusClass = "status-active";
  } else if (status === "Operation Confirmed") {
    statusClass = "status-active";
  } else if (status === "Settled") {
    statusClass = "status-active";
  } else if (status === "Cancelled") {
    statusClass = "status-cancelled";
  } else if (status === "Inprocess") {
    statusClass = "status-inactive";
  }

  return `<div class="status-badge ${statusClass}">
            <span>${status}</span>
          </div>`;
};

// vehicel details print
const printVehicle = () => {
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
// =========================== end of vehicle view & print function =================================================


// ========================== vehicle form Edit Function =================================================
// vehicle form Edit Function
const vehicleEdit = (dataOb) => {
  // delete karpu vehciel edit karanna ba
  if (dataOb.vehicle_status_id.status === "Deleted") {

    Swal.fire({
      title: "Cannot Edit Deleted Vehicle",
      text: "Can not edit Deleted Vehicle Details",
      icon: "info",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    return;
  }
  //category eka show karana checkbox hide karanna oni
  vehicleCategoryDiv.style.display = "none";



  if (dataOb.supplier_id.fullname == null) {
    dataOb.supplier_id.displayName = dataOb.supplier_id.company_name;
  } else {
    dataOb.supplier_id.displayName = dataOb.supplier_id.fullname;
  }

  textVehicleTransportName.value = JSON.stringify(dataOb.supplier_id);
  $("#textVehicleTransportName").trigger("change");
  select2Default([document.getElementById("textVehicleTransportName")]);

  textVehicleNo.value = dataOb.vehicle_no;
  selectVehicleType.value = JSON.stringify(dataOb.vehicle_type_id);
  selectVehicleMake.value = JSON.stringify(dataOb.vehicle_make_id);
  textVehicleModel.value = dataOb.model;
  textVehicleYear.value = dataOb.make_year;
  textVehicleFuelConsumption.value = dataOb.fuel_consumption;

  if (dataOb.category === "Own") {
    radioOwnVehicle.checked = "checked";
    supplierDiv.style.display = "none";
    textVehicleTransportName.removeAttribute("required");
  } else {
    radioNonOwnVehicle.checked = "checked";
    supplierDiv.style.display = "";
    textVehicleTransportName.setAttribute("required", "required");
  }

  if (dataOb.vehicle_photo != null) {
    previewImageVehicle.src = atob(dataOb.vehicle_photo);
    photoPreviewVehicle.style.display = "block";
    uploadContainerVehiclePhoto.style.display = "none";
  } else {
    photoPreviewVehicle.style.display = "none";
    uploadContainerVehiclePhoto.style.display = "block";
  }
  // cr photo
  if (dataOb.cr_photo != null) {
    previewImageCr.src = atob(dataOb.cr_photo);
    photoPreviewCr.style.display = "block";
    uploadContainerCr.style.display = "none";
  } else {
    photoPreviewCr.style.display = "none";
    uploadContainerCr.style.display = "block";
  }
  // revenue license photo
  if (dataOb.revenue_license_photo != null) {
    previewImageRl.src = atob(dataOb.revenue_license_photo);
    photoPreviewRl.style.display = "block";
    uploadContainerRl.style.display = "none";
  } else {
    photoPreviewRl.style.display = "none";
    uploadContainerRl.style.display = "block";
  }
  // insurance card
  if (dataOb.insurance_card_photo != null) {
    previewImageInsuranceCard.src = atob(dataOb.insurance_card_photo);
    photoPreviewInsuranceCard.style.display = "block";
    uploadContainerInsuranceCard.style.display = "none";
  } else {
    photoPreviewInsuranceCard.style.display = "none";
    uploadContainerInsuranceCard.style.display = "block";
  }
  // imspection report
  if (dataOb.inspection_report_photo != null) {
    previewImageInspectionReport.src = atob(dataOb.inspection_report_photo);
    photoPreviewInspectionReport.style.display = "block";
    uploadContainerInspectionReport.style.display = "none";
  } else {
    photoPreviewInspectionReport.style.display = "none";
    uploadContainerInspectionReport.style.display = "block";
  }

  textVehicleInsuranceExpireDate.value = dataOb.insurance_expire_date;
  textVehicleRevenuLicenseExpireDate.value = dataOb.revenu_license_expire_date;
  textVehicleStartMeterReading.value = dataOb.startup_meter_reading;
  textVehicleCurrentMeterReading.value = dataOb.current_meter_reading;
  textVehicleStatus.value = JSON.stringify(dataOb.vehicle_status_id);

  $("#vehicleFormModal").modal("show");

  updateButton.style.display = "";
  submitButton.style.display = "none";
  statusDiv.style.display = "block";


  vehicle = JSON.parse(JSON.stringify(dataOb));
  oldVehicle = JSON.parse(JSON.stringify(dataOb));
};
// ========================= end of vehicle form Edit Function =================================================




// ======================== category change functions ==================================
// vehicel categroy eka wenas karaddi wenna logic eke function eka
const selectedRadioBtn = document.querySelectorAll('input[name="vehicleCategory"]');
selectedRadioBtn.forEach((radio) => {
  radio.addEventListener("change", (e) => {
    const selectedValue = e.target.value; // danata click karapu value eka

    if (selectedValue === "Own") {
      supplierDiv.style.display = "none";
      vehicle.supplier_id = null;
      textVehicleTransportName.value = "";
      textVehicleTransportName.classList.remove("is-valid", "is-invalid");
      textVehicleTransportName.removeAttribute("required");
    } else {
      supplierDiv.style.display = "";
      textVehicleTransportName.setAttribute("required", "required");
    }
  });
});
// ======================= end of category change functions ==================================




// ======================= submit & check form error functions ==================================
// check form errors
const checkFormError = () => {
  let errors = "";

  // vehicel eka own ekak neme nam thama supplier id eka balanna oni

  if (vehicle.vehicle_no == null) {
    errors = errors + "Please enter the Vehicle Number. <br>";
    textVehicleNo.classList.add("is-invalid");
  }
  if (vehicle.model == null) {
    errors = errors + "Please enter the Vehicle Model. <br>";
    textVehicleModel.classList.add("is-invalid");
  }
  if (vehicle.make_year == null) {
    errors = errors + "Please enter the Vehicle Manufacture Year. <br>";
    textVehicleYear.classList.add("is-invalid");
  }
  if (vehicle.insurance_expire_date == null) {
    errors = errors + "Please enter the Insurance Expiration Date. <br>";
    textVehicleInsuranceExpireDate.classList.add("is-invalid");
  }
  if (vehicle.revenu_license_expire_date == null) {
    errors = errors + "Please enter the Revenue License Expiration Date. <br>";
    textVehicleRevenuLicenseExpireDate.classList.add("is-invalid");
  }
  if (vehicle.vehicle_type_id == null) {
    errors = errors + "Please select the Vehicle Type. <br>";
    selectVehicleType.classList.add("is-invalid");
  }
  if (vehicle.vehicle_make_id == null) {
    errors = errors + "Please select the Vehicle Make/Brand. <br>";
    selectVehicleMake.classList.add("is-invalid");
  }
  if (vehicle.fuel_consumption == null) {
    errors = errors + "Please enter the Vehicle Fuel Consumption. <br>";
    textVehicleFuelConsumption.classList.add("is-invalid");
  }
  if (vehicle.category == null) {
    errors = errors + "Please select the ownership Category. <br>";
  }
  if (vehicle.startup_meter_reading == null) {
    errors = errors + "Please enter start meter reading. <br>";
    textVehicleStartMeterReading.classList.add("is-invalid");
  }
  if (vehicle.category === "Non Own") {
    if (vehicle.supplier_id == null) {
      errors = errors + "Please select the Transport Name. <br>";
      textVehicleTransportName.classList.add("is-invalid");
    }
  } else if (vehicle.category === "Own") {
    textVehicleTransportName.classList.remove("is-invalid");
  }

  return errors;
};

//vehicel form submit buttom
const vehicleFormSubmit = () => {

  // check form error for required element
  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    // errors not exit
    //need to get user confirmation

    let userConfirm = Swal.fire({
      title: "Confirm Vehicle Submission",
      text: "Are you sure you want to register this new vehicle?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Register Vehicle",
      cancelButtonText: "Cancel",
      allowOutsideClick: false,
      customClass: {
        cancelButton: "btn-cancel",
        confirmButton: "btn-submit",
        popup: "swal2-border-radius",
      },
    }).then((userConfirm) => {
      if (userConfirm.isConfirmed) {
        //call post service
        let postResponse = httpServiceRequest("/vehicle/insert", "POST", vehicle);

        if (postResponse == "ok") {
          Swal.fire({
            title: "Vehicle Registered!",
            text: "New vehicle has been successfully added to the system.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          refreshVehicleForm();
          resetSearchVehicle();
          // modal eka close karanwa
          $("#vehicleFormModal").modal("hide");
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
            confirmButton: "btn-submit",
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
        confirmButton: "btn-submit",
        popup: "swal2-border-radius",
      },
    });
  }
  console.log(vehicle);
};
// ========================== end of submit & check form error functions ==================================



// ======================== check form updates function ==================================
// check form updates
const checkFormUpdates = () => {
  let updates = "";
  if (vehicle != null && oldVehicle != null) {
    if (vehicle.supplier_id != null && oldVehicle.supplier_id != null) {
      if (vehicle.supplier_id.transportname != oldVehicle.supplier_id.transportname) {
        updates = updates + "Transport Name updated. <br>";
      }
    }

    if (vehicle.vehicle_photo != oldVehicle.vehicle_photo) {
      updates = updates + "Vehicle Photo updated. <br>";
    }
    if (vehicle.vehicle_no != oldVehicle.vehicle_no) {
      updates = updates + "Vehicle Number updated. <br>";
    }
    if (vehicle.model != oldVehicle.model) {
      updates = updates + "Vehicle Model updated. <br>";
    }
    if (vehicle.make_year != oldVehicle.make_year) {
      updates = updates + "Manufacture Year updated. <br>";
    }
    if (vehicle.fuel_consumption != oldVehicle.fuel_consumption) {
      updates = updates + "Fuel Consumption updated. <br>";
    }
    if (vehicle.insurance_expire_date != oldVehicle.insurance_expire_date) {
      updates = updates + "Insurance Expire Date updated. <br>";
    }
    if (vehicle.revenu_license_expire_date != oldVehicle.revenu_license_expire_date) {
      updates = updates + "Revenue License Expire Date updated. <br>";
    }
    if (vehicle.startup_meter_reading != oldVehicle.startup_meter_reading) {
      updates = updates + "Starting Mileage updated. <br>";
    }
    if (vehicle.current_meter_reading != oldVehicle.current_meter_reading) {
      updates = updates + "Current Mileage updated. <br>";
    }
    if (vehicle.vehicle_type_id.name != oldVehicle.vehicle_type_id.name) {
      updates = updates + "Vehicle Type updated. <br>";
    }
    if (vehicle.vehicle_make_id.name != oldVehicle.vehicle_make_id.name) {
      updates = updates + "Vehicle Make updated. <br>";
    }
    if (vehicle.category != oldVehicle.category) {
      updates = updates + "Category updated. <br>";
    }
    if (vehicle.vehicle_status_id.status != oldVehicle.vehicle_status_id.status) {
      updates = updates + "Status updated. <br>";
    }
    if (vehicle.cr_photo != oldVehicle.cr_photo) {
      updates = updates + "CR Photo updated. <br>";
    }
    if (vehicle.vehicle_photo != oldVehicle.vehicle_photo) {
      updates = updates + "Vehicle Photo updated. <br>";
    }
    if (vehicle.revenue_license_photo != oldVehicle.revenue_license_photo) {
      updates = updates + "Revenue License Photo updated. <br>";
    }
    if (vehicle.insurance_card_photo != oldVehicle.insurance_card_photo) {
      updates = updates + "Insurance Card Photo updated. <br>";
    }
    if (vehicle.inspection_report_photo != oldVehicle.inspection_report_photo) {
      updates = updates + "Inspection Report Photo updated. <br>";
    }
  }

  return updates;
};

// vehicle form update function
const vehicleFormUpdate = () => {
  console.log(vehicle);
  console.log(oldVehicle);

  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    let updates = checkFormUpdates();
    // updates not exit
    if (updates == "") {
      Swal.fire({
        title: "Nothing to Update",
        text: "No changes were detected in the vehicle details.",
        icon: "info",
        allowOutsideClick: false,
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    } else {
      let userConfirm = Swal.fire({
        title: "Confirm Vehicle Update",
        text: "Are you sure you want to update this vehicle's information?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Update Vehicle",
        cancelButtonText: "Cancel",
        allowOutsideClick: false,
        customClass: {
          cancelButton: "btn-cancel",
          confirmButton: "btn-submit",
          popup: "swal2-border-radius",
        },
      }).then((userConfirm) => {
        if (userConfirm.isConfirmed) {
          //call post service
          let putResponse = httpServiceRequest("/vehicle/update", "PUT", vehicle);
          if (putResponse == "ok") {
            Swal.fire({
              title: "Vehicle Updated!",
              text: "The vehicle details have been successfully updated.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: "swal2-border-radius",
              },
            });
            refreshVehicleForm();
            resetSearchVehicle();
            // modal eka close karanwa
            $("#vehicleFormModal").modal("hide");
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
        confirmButton: "btn-submit",
        popup: "swal2-border-radius",
      },
    });
  }
};
// ========================== end of vehicle form update function ==================================



// ========================== vehicle form refresh function ==================================
// vehicle form refresh function
const refreshVehicleForm = () => {

  // vehicle year input max value set to current year + 1
  const yearInput = document.getElementById("textVehicleYear");
  yearInput.max = new Date().getFullYear() + 1;

  vehicle = new Object();
  vehicleRegistrationForm.reset();

  supplierDiv.style.display = "";
  textVehicleTransportName.setAttribute("required", "required");

  setDefault([
    textVehicleTransportName,
    textVehicleNo,
    selectVehicleType,
    selectVehicleMake,
    textVehicleModel,
    textVehicleYear,
    textVehicleInsuranceExpireDate,
    textVehicleRevenuLicenseExpireDate,
    textVehicleStartMeterReading,
    textVehicleCurrentMeterReading,
    textVehicleFuelConsumption,
    textVehicleStatus,
  ]);
  select2Default([document.getElementById("textVehicleTransportName")]);

  // get only active suppliers
  let transportNames = getServiceRequest("/supplier/alldatabystatus");
  transportNames.forEach(t => {
    if (t.fullname == null) {
      t.displayName = t.company_name;
    } else {
      t.displayName = t.fullname;
    }
  });
  dataFillIntoSelectWithTwoNames(textVehicleTransportName, "Select Transport", transportNames, "transportname", "displayName");

  let vehicleStatus = getServiceRequest("/vehiclestatus/alldata").slice(0, -1); //last element eka remove karanawa array eka[deleted status eka remove karanawa]
  dataFilIntoSelect(textVehicleStatus, "Select Status", vehicleStatus, "status");

  let vehicleType = getServiceRequest("/vehicletype/alldata");
  dataFilIntoSelect(selectVehicleType, "Select Vehicle Type", vehicleType, "name");

  let vehicleMake = getServiceRequest("/vehiclemake/alldata");
  dataFilIntoSelect(selectVehicleMake, "Select Vehicle Make", vehicleMake, "name");

  // current date validate and previous date restrict
  currentdatevalidator("textVehicleInsuranceExpireDate");
  // current date validate and previous date restrict
  currentdatevalidator("textVehicleRevenuLicenseExpireDate");



  // default file format of uploading photo
  photoPreviewVehicle.style.display = "none";
  uploadContainerVehiclePhoto.style.display = "block";

  photoPreviewCr.style.display = "none";
  uploadContainerCr.style.display = "block";

  photoPreviewRl.style.display = "none";
  uploadContainerRl.style.display = "block";

  photoPreviewInsuranceCard.style.display = "none";
  uploadContainerInsuranceCard.style.display = "block";

  photoPreviewInspectionReport.style.display = "none";
  uploadContainerInspectionReport.style.display = "block";

  statusDiv.style.display = "none";

  vehicleCategoryDiv.style.display = "none";


  // for sreach drop downs
  dataFilIntoSelect(searchVehicleStatus, "Select Status", vehicleStatus, "status");
  dataFilIntoSelect(searchVehicleType, "Select Vehicle Type", vehicleType, "name");

  // //     refesh ekedi load wenawa tabale eka
  vehicles = getServiceRequest("/vehicle/alldata");
  loadVehicleTable(vehicles);

  submitButton.style.display = ""
  updateButton.style.display = "none";

  const selectedValue = document.querySelector('input[name="vehicleCategory"]:checked').value;
  vehicle.category = selectedValue;
};
// ========================== end of vehicle form refresh function ==================================



// modal colse karaddi form reset wena comman function eka
formResetFunctionWhenClosingModal("vehicleFormModal", "vehicleRegistrationForm", refreshVehicleForm);


const exportVehicleTable = (type) => {
  if (type === "excel") {
    exportTableToExcelWithSheetJS("#vehicleTable", "vehicle_list", { sheetName: "VehicleList" });
  } else if (type === "pdf") {
    exportTableToPdfWithJsPdf("#vehicleTable", "vehicle_list", {
      title: "Vehicle List",
    });
  } else if (type === "print") {
    supplierAgreementFromPrint();
  }
};

//Alert Box Call function
Swal.isVisible();


// ========================= vehicle year validation function ==================================
textVehicleYear.addEventListener("keyup", () => {

  const year = Number(textVehicleYear.value);
  const minYear = 1990;
  const maxYear = new Date().getFullYear() + 1;


  // Min & Max Validation
  if (year >= minYear && year <= maxYear) {
    textVehicleYear.classList.remove("is-invalid");
    textVehicleYear.classList.add("is-valid");
    vehicle.make_year = year;
  } else {
    textVehicleYear.classList.remove("is-valid");
    textVehicleYear.classList.add("is-invalid");
    vehicle.make_year = null;
  }

});
// ========================= end of vehicle year validation function ==================================



// ======================== vehicel view & print overlay open and close functions ==================================
//view overalyy details
const openVehicleDetail = () => {
  toggleView("vehicle-details-overlay", true);
  const backBtn = document.getElementById("backBtn");
  const overlay = document.getElementById("vehicle-details-overlay");
  if (overlay) {
    // toggleView eka "block" widihata display karapuwath,
    // current + newpanel side-by-side ganna "flex" widihatama force karanawa
    overlay.style.display = "flex";
  }
  if (backBtn) {
    backBtn.style.display = "block";
    backBtn.onclick = () => {
      closeVehicleDetail();
    };
  }
};

const closeVehicleDetail = () => {
  toggleView("vehicle-details-overlay", false);
  const backBtn = document.getElementById("backBtn");
  var overlay = document.getElementById('vehicle-details-overlay');
  if (backBtn) {
    backBtn.style.display = "none";
    backBtn.addEventListener('click', function () {
      overlay.classList.remove('open');
    });
  }
};

// print view ekedi slide karanawa
document.addEventListener('DOMContentLoaded', function () {
  var overlay = document.getElementById('vehicle-details-overlay');
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
// ======================== end of vehicel view & print overlay open and close functions ==================================