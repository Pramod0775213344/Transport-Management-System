window.addEventListener("load", () => {
  // // Check privilege
  // userPrivilege = getServiceRequest(
  //   "/userprivilage/bymodule?modulename=Vehicle Inspection",
  // );
  refreshForm();
  refreshTable();
});

// Refresh Table
const refreshTable = () => {
  if ($.fn.dataTable.isDataTable("#inspectionTable")) {
    $("#inspectionTable").DataTable().clear().destroy();
  }

  inspections = getServiceRequest("/vehicleinspection/alldata");

  // Load search selects with cleaner labels
  const vehicles = getServiceRequest("/vehicle/alldata");
  dataFilIntoSelect(searchVehicleSearch, "All Vehicles", vehicles, "vehicle_no");

  const statuses = getServiceRequest("/vehicleinspectiontatus/alldata");
  dataFilIntoSelect(searchStatusSearch, "All Statuses", statuses, "status");

  const propertyList = [
    { propertyName: getVehicleNo, dataType: "function" },
    { propertyName: getInsepctionDate, dataType: "function" },
    { propertyName: "odometer_reading", dataType: "string" },
    { propertyName: getStatus, dataType: "function" },
    { propertyName: getAddedUser, dataType: "function" },
  ];
  console.log(inspections);

  dataFillIntoTheTable(inspectionTableBody, inspections, propertyList, viewInspection, editInspection, deleteInspectionRecord, false);

  const table = $("#inspectionTable").DataTable({
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

  // Filter Search Logic for Selects
  $("#searchVehicleSearch").on("change", function () {
    const val = $(this).val();
    if (val) {
      const obj = JSON.parse(val);
      table.column(1).search(obj.vehicle_no).draw();
    } else {
      table.column(1).search("").draw();
    }
  });

  $("#searchStatusSearch").on("change", function () {
    const val = $(this).val();
    if (val) {
      const obj = JSON.parse(val);
      // We use a custom search here because status badges have HTML
      table.column(4).search(obj.status).draw();
    } else {
      table.column(4).search("").draw();
    }
  });
};

// Export Functionality
const exportTable = (type) => {
  const table = $("#inspectionTable").DataTable();

  if (type === "excel") {
    table.button(".buttons-excel").trigger();
  } else if (type === "pdf") {
    table.button(".buttons-pdf").trigger();
  } else if (type === "print") {
    window.print();
  }
};

const getVehicleNo = (dataOb) => {
  return `<span class="unique_no">${dataOb.vehicle_id.vehicle_no}</span>`;
};
const getInsepctionDate = (dataOb) => {
  return dataOb.inspection_datetime.split("T")[0] + " " + dataOb.inspection_datetime.split("T")[1].substring(0, 5);
};
const getStatus = (dataOb) => {
  let status = dataOb.vehicle_inspection_status_id.status;
  if (status === "Passed" || status === "Success") {
    return `<span class="status-badge status-active"><i class="fa-solid fa-circle-check me-1"></i>${status}</span>`;
  } else if (status === "Pending") {
    return `<span class="status-badge status-pending"><i class="fa-solid fa-circle-notch fa-spin me-1"></i>${status}</span>`;
  } else if (status === "Failed" || status === "Issue") {
    return `<span class="status-badge status-reject"><i class="fa-solid fa-circle-xmark me-1"></i>${status}</span>`;
  }
  return `<span class="status-badge status-inactive">${status}</span>`;
};
const getAddedUser = (dataOb) => {
  return dataOb.added_user_id;
};

// Refresh Form
const refreshForm = () => {
  inspection = new Object();

  // Set default values for checkboxes
  inspection.tires_ok = false;
  inspection.brakes_ok = false;
  inspection.lights_ok = false;
  inspection.engine_oil_ok = false;
  inspection.coolant_ok = false;
  inspection.battery_ok = false;
  inspection.body_condition_ok = false;

  const vehicles = getServiceRequest("/vehicle/alldata");
  dataFilIntoSelect(selectVehicle, "Select Vehicle", vehicles, "vehicle_no");

  const statuses = getServiceRequest("/vehicleinspectiontatus/alldata");
  dataFilIntoSelect(selectStatus, "Select Status", statuses, "status");

  // Reset Elements
  inspectionForm.reset();
  selectVehicle.value = "";
  selectStatus.value = "";
  selectVehicle.classList.remove("is-valid", "is-invalid");
  textOdometer.classList.remove("is-valid", "is-invalid");
  selectStatus.classList.remove("is-valid", "is-invalid");
  selectPeriod.classList.remove("is-valid", "is-invalid");
  textNextDate.value = "";

  removePhoto(photoPreview, previewImage, uploadContainerPhoto);

  // Set Inspection Time
  inspection.inspection_datetime = new Date().toISOString().slice(0, 19).replace("T", " ");
};

// Calculate Next Inspection Date
const calculateNextDate = (element) => {
  const months = parseInt(element.value);
  if (!isNaN(months)) {
    inspection.valid_period = months + " Months";

    let nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + months);

    // Formatting for display and object
    textNextDate.value = nextDate.toISOString().split("T")[0];
    inspection.next_inspection_date = nextDate.toISOString();

    element.classList.add("is-valid");
  } else {
    inspection.valid_period = null;
    inspection.next_inspection_date = null;
    textNextDate.value = "";
    element.classList.remove("is-valid");
  }
};

// Checkbox Validator Helper
const checkBoxValidator = (element, object, property) => {
  window[object][property] = element.checked;
  if (element.checked) {
    element.classList.add("is-valid");
  } else {
    element.classList.remove("is-valid");
  }
};

// Submit Form
const submitForm = () => {
  console.log(inspection);

  const errors = checkFormErrors();
  if (errors === "") {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to save this inspection record?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Save it!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Ensure datetime is set before sending
        inspection.inspection_datetime = new Date().toISOString();

        const response = httpServiceRequest("/vehicleinspection/insert", "POST", inspection);
        if (response === "ok") {
          Swal.fire("Saved!", "Inspection record saved successfully.", "success");
          $("#inspectionFormModal").modal("hide");
          refreshTable();
          refreshForm();
        } else {
          Swal.fire("Error!", response, "error");
        }
      }
    });
  } else {
    Swal.fire("Form Errors!", errors, "error");
  }
};

const checkFormErrors = () => {
  let errors = "";
  if (inspection.vehicle_id == null) errors += "Vehicle is required.<br>";
  if (inspection.odometer_reading == null) errors += "Odometer reading is required.<br>";
  if (inspection.vehicle_inspection_status_id == null) errors += "Overall status is required.<br>";
  if (inspection.valid_period == null) errors += "Validation Period is required.<br>";
  return errors;
};

// View Inspection
const viewInspection = (obj) => {
  $("#inspectionViewModal").modal("show");
  let html = `
        <div class="row">
            <div class="col-md-6">
                <p><strong>Vehicle:</strong> ${obj.vehicle_id.vehicle_no}</p>
                <p><strong>Date:</strong> ${obj.inspection_datetime.replace("T", " ")}</p>
                <p><strong>Odometer:</strong> ${obj.odometer_reading}</p>
                <p><strong>Status:</strong> ${obj.vehicle_inspection_status_id.status}</p>
            </div>
            <div class="col-md-6">
               <h6>Checklist Results:</h6>
               <ul class="list-group">
                   <li class="list-group-item d-flex justify-content-between align-items-center">
                       Tires ${obj.tires_ok ? '<span class="badge bg-success">OK</span>' : '<span class="badge bg-danger">Issue</span>'}
                   </li>
                   <li class="list-group-item d-flex justify-content-between align-items-center">
                       Brakes ${obj.brakes_ok ? '<span class="badge bg-success">OK</span>' : '<span class="badge bg-danger">Issue</span>'}
                   </li>
                   <li class="list-group-item d-flex justify-content-between align-items-center">
                       Lights ${obj.lights_ok ? '<span class="badge bg-success">OK</span>' : '<span class="badge bg-danger">Issue</span>'}
                   </li>
               </ul>
            </div>
        </div>
        <div class="mt-3">
            <p><strong>Remarks:</strong> ${obj.remarks || "None"}</p>
        </div>
    `;
  inspectionViewBody.innerHTML = html;
};

const editInspection = (obj) => {
  // Usually inspections aren't edited, they are new records.
  Swal.fire("Info", "Inspection records are historical and cannot be edited. Please create a new record if needed.", "info");
};

const deleteInspectionRecord = (obj) => {
  Swal.fire({
    title: "Are you sure?",
    text: "You want to delete this inspection record?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      const response = httpServiceRequest("/vehicle_inspection/delete", "DELETE", obj);
      if (response === "ok") {
        Swal.fire("Deleted!", "Record has been deleted.", "success");
        refreshTable();
      } else {
        Swal.fire("Error!", response, "error");
      }
    }
  });
};
