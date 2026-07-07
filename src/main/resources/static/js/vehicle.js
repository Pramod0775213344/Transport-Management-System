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

});

// load vehicle table with search area
const searchVehicle = () => {
  let searchVehicleNo = document.getElementById("searchVehicleNo").value;
  let searchVehicleType = document.getElementById("searchVehicleType").value;
  let searchVehicleStatus = document.getElementById("searchVehicleStatus").value;

  let query = "";
  if (searchVehicleNo != "") query += "&vehicleNo=" + searchVehicleNo;
  if (searchVehicleType != "") query += "&vehicleTypeId=" + JSON.parse(searchVehicleType).id;
  if (searchVehicleStatus != "") query += "&statusId=" + JSON.parse(searchVehicleStatus).id;

  // Note: This logic depends on your backend supporting these parameters.
  // If not, you might need to filter locally or use existing endpoints.
  // Assuming backend support or falling back to a general search.

  // For now, let's keep it simple and filter based on what's available
  // or just call the main list if all empty
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

const resetVehicleFilter = () => {
  document.getElementById("searchVehicleNo").value = "";
  document.getElementById("searchVehicleType").value = "";
  document.getElementById("searchVehicleStatus").value = "";
  document.getElementById("dtSearch").value = "";
  loadVehicleTable(vehicles);
};

const resfreshForm = () => {
  refreshVehicleForm();
};

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
    document.getElementById("vehicle-transport-name").innerText = dataOb.supplier_id.transportname;
    document.getElementById("detail-supplier-name").innerText = dataOb.supplier_id.fullname;
    document.getElementById("detail-supplier-mobile").innerText = dataOb.supplier_id.mobileno;
    const contactName = dataOb.supplier_id.fullname;
    document.getElementById("detail-supplier-initial").innerText = contactName.trim().charAt(0).toUpperCase() || "J";
  }
  document.getElementById("detail-vehicle-make").innerText = dataOb.vehicle_make_id.name;
  document.getElementById("detail-vehicle-no").innerText = dataOb.vehicle_no;
  document.getElementById("detail-vehicle-status").innerText = dataOb.vehicle_status_id.status;
  document.getElementById("detail-vehicle-type").innerText = dataOb.vehicle_type_id.name;
  document.getElementById("detail-vehicle-fuel").innerText = dataOb.fuel_consumption;
  document.getElementById("detail-vehicle-year").innerText = dataOb.make_year;

  document.getElementById("detail-insurance-expire-date").innerText = dataOb.insurance_expire_date;
  document.getElementById("detail-revenue-expire-date").innerText = dataOb.revenu_license_expire_date;




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

    const propertyList = [
      { propertyName: "booking_no", dataType: "string" },
      { propertyName: "pickup_date_time", dataType: "string" },
      { propertyName: "delivery_date_time", dataType: "string" },
      { propertyName: "distance", dataType: "string" },
      { propertyName: getBookingStatus, dataType: "function" },
    ];
    dataFillIntoTheReportTable(vehicleBookingHistoryTableBody, bookingHistory, propertyList)
  }

  openVehicleDetail();
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
};

// vehicel details print
const printVehicleDetails = () => {
  document.getElementById("printButton").style.display = "none";
  let newWindow = window.open();
  let printView =
    "<head><title>TMS</title><link rel='stylesheet' href='/css/common.css'><link rel='stylesheet' href='/css/vehicle.css'><link rel='stylesheet' href='bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'></head><body>" +
    vehicleViewModalBody.outerHTML +
    "</body>";
  newWindow.document.write(printView);

  setTimeout(() => {
    newWindow.stop();
    newWindow.print();
    newWindow.close();
  }, 500);
  document.getElementById("printButton").style.display = "block";
};

// vehicle form Edit Function
const vehicleEdit = (dataOb) => {

  textVehicleTransportName.value = JSON.stringify(dataOb.supplier_id);
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
  additionalInformationSection.style.display = "none";

  vehicle = JSON.parse(JSON.stringify(dataOb));
  oldVehicle = JSON.parse(JSON.stringify(dataOb));
};

// vehicle form delete function
const vehicleDelete = (dataOb) => {
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
      confirmButton: "btn-submit", // Keeping consistent with premium system
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

// vehicle form refresh function
const refreshVehicleForm = () => {
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

  // get only active suppliers
  let transportNames = getServiceRequest("/supplier/alldatabystatus");
  dataFilIntoSelect(textVehicleTransportName, "Select Transport", transportNames, "transportname");

  let vehicleStatus = getServiceRequest("/vehiclestatus/alldata");
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

  additionalInformationSection.style.display = "none";

  //     for sreach drop downs
  dataFilIntoSelect(searchVehicleStatus, "Select Status", vehicleStatus, "status");
  dataFilIntoSelect(searchVehicleType, "Select Vehicle Type", vehicleType, "name");

  // //     refesh ekedi load wenawa tabale eka
  vehicles = getServiceRequest("/vehicle/alldata");
  loadVehicleTable(vehicles);

  submitButton.style.display = ""
  updateButton.style.display = "none";
};

// modal colse karaddi form reset wena comman function eka
formResetFunctionWhenClosingModal("vehicleFormModal", "vehicleRegistrationForm", refreshVehicleForm);

// table eke loading spin eka load karanwa
function showTableLoading(loaderId, tableId) {
  const loader = document.getElementById("loaderId");
  const VehicleTable = document.getElementById("vehicleTable");
  loader.style.display = ""; // Clear loading after 2 seconds
  VehicleTable.style.display = "none"; // Hide the booking table while loading
  setTimeout(() => {
    const loader = document.getElementById("loaderId");
    loader.style.display = "none"; // Clear loading after 2 seconds
    VehicleTable.style.display = ""; // Hide the booking table while loading
  }, 500);
}

// overalyy details
const openVehicleDetail = () => {
  toggleView("vehicle-details-overlay", true);
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.style.display = "block";
    backBtn.onclick = () => {
      closeInvoiceDetail();
    };
  }
};

const closeVehicleDetail = () => {
  toggleView("vehicle-details-overlay", false);
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.style.display = "none";
  }
};

//Alert Box Call function
Swal.isVisible();
