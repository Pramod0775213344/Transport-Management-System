window.addEventListener("load", () => {
  refreshVehicleGroupForm();
  // $('#vehicleTableByVehicleGroup').DataTable().clear().destroy();
  $("#vehicleTableByVehicleGroup").DataTable().clear().draw(); // Clear table if no data
  $("#vehicleTableByVehicleGroup tbody").html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');
});

const refreshVehicleGroupForm = () => {
  vehicleGroup = new Object();
  vehicleGroup.vehicles = new Array();

  vehicleGroupAddForm.reset();
  vehicleAddForm.reset();

  let customers = getServiceRequest("/customer/bynotinvehiclegroup");
  dataFilIntoSelect(selectCustomerName, "Select Company Name", customers, "company_name");

  let vehicleGroups = getServiceRequest("/vehiclegroup/alldata");
  createVehicleGroupCards(vehicleGroups, addVehicle, loadTable);

  vehicleList = getServiceRequest("/vehicle/alldata");
  // dataFilIntoSelect(selectVehicleNo, "Select Company Name", vehicleList, "vehicle_no")
  dataFillIntoDataList(textVehicleName, vehicleList, "vehicle_no");

  setDefault([textGroupName, selectCustomerName, selectVehicleNo]);
};

//create view vehicle group dynamic cards
const createVehicleGroupCards = (vehicleGroups, editFunction, viewFunction) => {
  const vehicleGroupContainer = document.getElementById("vehicleGroupContainer");
  vehicleGroupContainer.innerHTML = ""; // Clear existing content

  vehicleGroups.forEach((vehicleGroup) => {
    // vehicle count eka gannwa card load karaddima
    let vCount = vehicleGroup.vehicles ? vehicleGroup.vehicles.length : 0;

    const card = document.createElement("div");
    card.classList.add("stat-card", "mb-3", "me-3", "group-card");
    card.setAttribute("data-group-id", vehicleGroup.id);
    card.style.display = "inline-block";
    card.style.width = "20rem";
    card.style.cursor = "pointer";
    card.innerHTML = `
        <div class="card-body">
            <div class="row align-items-center">
                <div class="col-2">
                    <div class="meta-icon" style="background: rgba(99, 102, 241, 0.1); color: #6366f1;">
                        <i class="fa-solid fa-truck"></i>
                    </div>
                </div>
                <div class="col-7">
                    <h3 class="vehicle-group-title m-0" style="font-weight:600; color:#2c3e50; font-size: 1.1rem;">${vehicleGroup.name}</h3>
                    <div class="mt-1">
                        <span class="text-muted" style="font-size: 0.85rem;">Customer: ${vehicleGroup.customer_id.company_name}</span>
                    </div>
                    <div class="mt-2">
                        <span class="count-badge">Vehicles: ${vCount}</span>
                    </div>
                </div>
                <div class="col-3 text-end">
                    <button class="btn btn-submit w-75 table-button-edit" title="Add Vehicle" style="padding: 8px;"><i class="fa-solid fa-plus"></i></button>
                </div>
            </div>
        </div>       
    `;

    // Add button event after HTML is inserted
    if (editFunction) {
      const button = card.querySelector(".table-button-edit");
      if (button) {
        button.onclick = (e) => {
          e.stopPropagation(); // Prevent card click
          editFunction(vehicleGroup);
        };
      }
    }
    // card eka click karaddi view function eka call wenawa
    card.onclick = () => {
      // Remove highlight from all cards
      document.querySelectorAll(".group-card").forEach((c) => c.classList.remove("selected-card"));
      // Add highlight to this card
      card.classList.add("selected-card");

      if (viewFunction) {
        viewFunction(vehicleGroup);
      }
    };

    vehicleGroupContainer.appendChild(card);
  });
};

// check form error for required element
const checkFormError = () => {
  let errors = "";

  if (vehicleGroup.customer_id == null) {
    errors = errors + "Please Select the Customer.....";
  }
  if (vehicleGroup.name == null) {
    errors = errors + "Please Enter the Group Name.....";
  }
  return errors;
};

// vehicle Group Add funtion
const vehicleGroupAdd = () => {
  console.log(vehicleGroup);
  // check form error for required element
  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    // errors not exit
    //need to get user confirmation

    let userConfirm = Swal.fire({
      title: "Confirm Group Creation",
      text: "Are you sure you want to create this new vehicle group?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Save Group",
      allowOutsideClick: false,
      customClass: {
        cancelButton: "btn btn-1",
        confirmButton: "btn btn-2",
        popup: "swal2-border-radius",
      },
    }).then((userConfirm) => {
      if (userConfirm.isConfirmed) {
        //call post service
        let postResponse = httpServiceRequest("/vehiclegroup/insert", "POST", vehicleGroup);
        if (postResponse == "ok") {
          Swal.fire({
            title: "Vehicle Group Saved!",
            text: "New vehicle group has been successfully created.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          refreshVehicleGroupForm();
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
          text: "Vehicle group generation cancelled.",
          icon: "error",
          allowOutsideClick: false,
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

// check form error for required element
const checkFormErrorForVehicleAdd = () => {
  let updates = "";
  if (vehicleGroup != null && oldVehicleGroup != null) {
    if (
      vehicleGroup.vehicles.length !== oldVehicleGroup.vehicles.length ||
      !vehicleGroup.vehicles.every((elemnt, index) => JSON.stringify(elemnt) === JSON.stringify(oldVehicleGroup.vehicles[index]))
    ) {
      updates += "Change the additional chargers list..... ";
    }
  }
  return updates;
};

// vehicle Group Add funtion
const vehicleAddToGroup = () => {
  console.log(vehicleGroup);
  let updates = checkFormErrorForVehicleAdd();
  // updates not exit
  if (updates == "") {
    Swal.fire({
      title: "No Changes Detected",
      text: "No new vehicles selected to add.",
      icon: "question",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
  } else {
    let userConfirm = Swal.fire({
      title: "Confirm Update",
      text: "Are you sure you want to add these vehicles to the group?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Add Vehicles",
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
        let postResponse = httpServiceRequest("/vehiclegroup/addvehicle", "PUT", vehicleGroup);
        if (postResponse == "ok") {
          Swal.fire({
            title: "Vehicles Added!",
            text: "New vehicles have been successfully added to the group.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          refreshVehicleGroupForm();
          $("#vehicleAddModalForGroup").modal("hide");
        } else {
          Swal.fire({
            title: "Add Failed",
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
          text: "Vehicle adding cancelled.",
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
};

// card eke button eka click kalma modal eka open wenawa.eken vehicle group has vehicle database table eka update karanawa
const addVehicle = (dataOb) => {
  $("#vehicleAddModalForGroup").modal("show");
  // Reset the form
  vehicleGroup = JSON.parse(JSON.stringify(dataOb));
  oldVehicleGroup = JSON.parse(JSON.stringify(dataOb));

  let vehicleByVehicleGroup = getServiceRequest("vehicle/vehiclebyvehiclegroupandsupplieragreement?vehiclegroup_id=" + dataOb.id);
  dataFillIntoDataList(textVehicleName, vehicleByVehicleGroup, "vehicle_no");

  console.log(vehicleGroup);
  console.log(oldVehicleGroup);
};

// select karana vehicle group card eka anuwa table eka load karanawa
const loadTable = (dataOb) => {
  // Show the table card
  $("#vehicleTableCard").show();

  // vehicle group ekata adala vehicle tika gannawa
  let vehicleByVehicleGroup = getServiceRequest("vehicle/vehiclebyvehiclegroup?vehiclegroup_id=" + dataOb.id);

  // active (Busy) booking thiyena vehicle IDs tikath gannawa/meka oni status eka change karana thanata
  busyVehicleIds = getServiceRequest("/booking/busyvehicleids");

  if ($.fn.dataTable.isDataTable("#vehicleTableByVehicleGroup")) {
    $("#vehicleTableByVehicleGroup").DataTable().clear().destroy();
  }
  if (vehicleByVehicleGroup.length >= 0) {
    const propertyList = [
      {
        propertyName: "vehicle_photo",
        dataType: "truck-image-array",
      },
      { propertyName: getTransportName, dataType: "function" },
      {
        propertyName: "vehicle_no",
        dataType: "string",
      },
      { propertyName: getVehicleType, dataType: "function" },
      {
        propertyName: getVehicleMake,
        dataType: "function",
      },
      { propertyName: "model", dataType: "string" },
      { propertyName: getVehicleStatus, dataType: "function" },
    ];

    dataFillIntoTheReportTable(vehicleTableByVehicleGroupBody, vehicleByVehicleGroup, propertyList);

    const table = $("#vehicleTableByVehicleGroup").DataTable({
      dom: "rtip", // Hide default search and length
      pageLength: 10,
      createdRow: function (row, data, dataIndex) {
        $(row).find("td").css({
          "text-align": "center",
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
  } else {
    $("#vehicleTableByVehicleGroup").DataTable().clear().draw(); // Clear table if no data
    $("#vehicleTableByVehicleGroup tbody").html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');
  }
};

// get Transport Name
const getTransportName = (dataOb) => {
  return dataOb.supplier_id.transportname;
};

// get Vehicle Type
const getVehicleType = (dataOb) => {
  return dataOb.vehicle_type_id.name;
};

// get Vehicle Make
const getVehicleMake = (dataOb) => {
  return dataOb.vehicle_make_id.name;
};

// get Vehicle Status Badge
const getVehicleStatus = (dataOb) => {
  // Check if current vehicle ID is in the busy list
  let isBusy = busyVehicleIds.includes(dataOb.id);

  if (isBusy) {
    return `<span class="badge-busy"><i class="fas fa-route me-1"></i> On a Trip</span>`;
  } else {
    return `<span class="badge-available"><i class="fas fa-check-circle me-1"></i> Available</span>`;
  }
};

// Function for datalist validation and object assignment
const dataListValidator = (element, object, property) => {
  const elementValue = element.value;
  console.log(elementValue);
  // Check if the value exists in the vehicleList
  // vehicel list array eken vehicle no eka match karanawa
  const extIndex = vehicleList.findIndex((vehicle) => vehicle.vehicle_no === elementValue);

  // if the value exists, assign it to the array and add validation class
  if (extIndex !== -1) {
    [object][property] = vehicleList[extIndex];
    vehicleGroup.vehicles.push(vehicleList[extIndex]);
    element.classList.remove("is-invalid");
    element.classList.add("is-valid");
  } else {
    window[object][property] = null;
    element.classList.add("is-invalid");
    element.classList.remove("is-valid");
  }
};

// modal eka hide karaddi object eka reset wenawa
$("#vehicleAddModalForGroup").on("hidden.bs.modal", refreshVehicleGroupForm);

// table eke loading spin eka load karanwa
function showTableLoading(loaderId, tableId) {
  const loader = document.getElementById("loaderId");
  const vehicleTableByVehicleGroup = document.getElementById("vehicleTableByVehicleGroup");
  loader.style.display = ""; // Clear loading after 2 seconds
  vehicleTableByVehicleGroup.style.display = "none"; // Hide the booking table while loading
  setTimeout(() => {
    const loader = document.getElementById("loaderId");
    loader.style.display = "none"; // Clear loading after 2 seconds
    vehicleTableByVehicleGroup.style.display = ""; // Hide the booking table while loading
  }, 500);
}

// Export Functionality
const exportTable = (type) => {
  const table = $("#vehicleTableByVehicleGroup").DataTable();

  if (type === "excel") {
    table.button(".buttons-excel").trigger();
  } else if (type === "pdf") {
    table.button(".buttons-pdf").trigger();
  } else if (type === "print") {
    window.print();
  }
};
