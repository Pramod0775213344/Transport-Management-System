window.addEventListener("load", () => {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      refreshForm();
      refreshTable();
    } catch (e) {
      console.error("Error during vehicle inspection page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);
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

  applyPrivileges("Vehicle Inspection", "inspectionTable", {
    add: addButton,
 
  });

  table.on("draw.dt", function () {
    applyPrivileges("Vehicle Inspection", "inspectionTable", { add: addButton });
  });
};

// Export Functionality
const exportTable = (type) => {
  if (type === "excel") {
    exportTableToExcelWithSheetJS("#inspectionTable", "vehicle_inspections", { sheetName: "Inspections" });
  } else if (type === "pdf") {
    exportTableToPdfWithJsPdf("#inspectionTable", "vehicle_inspections", {
      title: "Vehicle Inspections",
    });
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
  // Status Logic
  const statusEl = document.getElementById("offcanvasInspStatus");
  const statusName = obj.vehicle_inspection_status_id ? obj.vehicle_inspection_status_id.status : "Unknown";
  statusEl.innerText = statusName.toUpperCase();
  if (statusName === "Passed" || statusName === "Success") {
      statusEl.style.backgroundColor = "#6ee7b7";
      statusEl.style.color = "#065f46";
  } else if (statusName === "Pending") {
      statusEl.style.backgroundColor = "#fde047";
      statusEl.style.color = "#854d0e";
  } else {
      statusEl.style.backgroundColor = "#fca5a5";
      statusEl.style.color = "#991b1b";
  }

  // Header
  document.getElementById("offcanvasInspRecordId").innerText = `Record ID: INS-${obj.id || Math.floor(Math.random() * 9000 + 1000)}`;

  // Grid
  document.getElementById("offcanvasInspVehicleNo").innerText = obj.vehicle_id ? obj.vehicle_id.vehicle_no : "N/A";
  document.getElementById("offcanvasInspOdometer").innerText = (obj.odometer_reading ? Number(obj.odometer_reading).toLocaleString() : "0") + " KM";

  // Next Inspection & Validation
  const dObj = obj.next_inspection_date ? new Date(obj.next_inspection_date) : null;
  document.getElementById("offcanvasInspNextDate").innerText = dObj ? dObj.toLocaleDateString("en-US", {year: "numeric", month: "short", day: "numeric"}) : "N/A";
  document.getElementById("offcanvasInspPeriod").innerText = obj.valid_period || "N/A";

  // Checklist Generation
  const checklistItems = [
      { label: "Tires Condition", icon: "fa-solid fa-truck-monster", val: obj.tires_ok },
      { label: "Brakes & Handbrake", icon: "fa-truck-fast fa-solid", val: obj.brakes_ok },
      { label: "Lights & Indicators", icon: "fa-regular fa-lightbulb", val: obj.lights_ok },
      { label: "Engine Oil Level", icon: "fa-solid fa-oil-can", val: obj.engine_oil_ok },
      { label: "Coolant/Water Level", icon: "fa-solid fa-droplet", val: obj.coolant_ok },
      { label: "Battery & Electrical", icon: "fa-solid fa-car-battery", val: obj.battery_ok },
      { label: "Body Condition", icon: "fa-solid fa-car-side", val: obj.body_condition_ok }
  ];

  let checklistHTML = "";
  checklistItems.forEach(item => {
      let badgeHTML = item.val 
          ? `<span class="badge shadow-sm" style="background-color: #ecfdf5; color: #10b981; border-radius: 20px; font-size: 0.65rem; padding: 0.4em 0.8em;"><i class="fa-solid fa-circle-check me-1"></i>GOOD</span>`
          : `<span class="badge shadow-sm" style="background-color: #fef2f2; color: #ef4444; border-radius: 20px; font-size: 0.65rem; padding: 0.4em 0.8em;"><i class="fa-solid fa-circle-xmark me-1"></i>ISSUE</span>`;

      // Match the mockup specific case for coolant/water
      if (item.label === "Coolant/Water Level" && item.val) {
           badgeHTML = `<span class="badge shadow-sm" style="background-color: #eff6ff; color: #3b82f6; border-radius: 20px; font-size: 0.65rem; padding: 0.4em 0.8em;"><i class="fa-solid fa-circle-info me-1"></i>CHECKED</span>`;
      }

      checklistHTML += `
          <div class="d-flex justify-content-between align-items-center py-3 border-bottom border-light">
              <div class="d-flex align-items-center gap-3">
                  <div class="text-secondary" style="width: 20px; text-align: center;"><i class="${item.icon}"></i></div>
                  <span class="text-dark fw-medium" style="font-size: 0.85rem;">${item.label}</span>
              </div>
              ${badgeHTML}
          </div>
      `;
  });
  document.getElementById("offcanvasChecklistContainer").innerHTML = checklistHTML;

  // Remarks
  document.getElementById("offcanvasInspRemarks").innerHTML = obj.remarks || "No special remarks or issues recorded during this inspection.";

  // Show Offcanvas
  const offcanvasElement = document.getElementById("inspectionOffcanvas");
  const bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement);
  bsOffcanvas.show();
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
