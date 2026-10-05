// ===================== loading funstions ===========================
window.addEventListener("load", () => {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      refreshVehicleGroupForm();
      // $('#vehicleTableByVehicleGroup').DataTable().clear().destroy();
      $("#vehicleTableByVehicleGroup").DataTable().clear().draw(); // Clear table if no data
      $("#vehicleTableByVehicleGroup tbody").html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');
    } catch (e) {
      console.error("Error during vehicle group page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);

  $("#selectCoordinator").select2({
    theme: "bootstrap-5",
    dropdownParent: $("#vehicleGroupModal"),
  });
  //     enable type and search of the select element
  $("#selectVehicleNo").select2({
    theme: "bootstrap-5",
    dropdownParent: $("#vehicleAddModalForGroup"),
  });
  $("#selectTemporyVehicleNo").select2({
    theme: "bootstrap-5",
    dropdownParent: $("#vehicleAddModalForGroup"),
  });
});


// ===================== group card loading ==============================
//create view vehicle group dynamic cards
const createVehicleGroupCards = (vehicleGroups, editFunction, viewFunction) => {
  const vehicleGroupContainer = document.getElementById("vehicleGroupContainer");
  vehicleGroupContainer.innerHTML = ""; // Clear existing content

  vehicleGroups.forEach((vehicleGroup) => {
    // vehicle count eka gannwa card load karaddima
    let vCount = vehicleGroup.vehicles ? vehicleGroup.vehicles.length : 0;

    const card = document.createElement("div");
    card.classList.add("group-card");
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
      // focus karanawa table eka
      document.getElementById("vehicleTableCard").scrollIntoView({ behavior: "smooth" });

      if (viewFunction) {
        viewFunction(vehicleGroup);
      }
    };

    vehicleGroupContainer.appendChild(card);
  });

  const privileges = getModulePrivilege("Vehicle Group Management");
  document.querySelectorAll("#vehicleGroupContainer .table-button-edit").forEach((btn) => {
    btn.style.display = privileges.privi_update ? "" : "none";
  });
};
// ===================== end of group card loading ==============================



// ===================== group submit & error checking ==============================
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
          $("#vehicleGroupModal").modal("hide");
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
// ===================== end of group submit & error checking ==============================

// check form error for required element
// const checkFormErrorForVehicleAdd = () => {
//   let updates = "";
//   if (vehicleGroup != null && oldVehicleGroup != null) {
//     if (
//       vehicleGroup.vehicles.length !== oldVehicleGroup.vehicles.length ||
//       !vehicleGroup.vehicles.every((elemnt, index) => JSON.stringify(elemnt) === JSON.stringify(oldVehicleGroup.vehicles[index]))
//     ) {
//       updates += "Change the additional chargers list..... ";
//     }
//   }
//   return updates;
// };


// ===================== vehicle add to group submit & error checking ==============================
const checkFormErrorForVehicleAdd = () => {
  let errors = "";
  if (vehicelGroupHasVehicles.vehicle_id == null) {
    errors += "Please Select the Vehicle No.....";
  }
  if (vehicelGroupHasVehicles.is_temporary == null) {
    errors += "Please Select the Vehicle Category.....";
  }
  if (vehicelGroupHasVehicles.vehicle_group_id == null) {
    errors += "Vehicle Group ID is missing.....";
  }
  return errors;
}

// vehicle Group Add funtion
const vehicleAddToGroup = () => {
  console.log(vehicelGroupHasVehicles);
  let errors = checkFormErrorForVehicleAdd();
  if (errors == "") {
    // errors not exit
    //need to get user confirmation

    let userConfirm = Swal.fire({
      title: "Confirm Vehicle Addition",
      text: "Are you sure you want to add this vehicle to the group?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Add Vehicle",
      allowOutsideClick: false,
      customClass: {
        cancelButton: "btn btn-1",
        confirmButton: "btn btn-2",
        popup: "swal2-border-radius",
      },
    }).then((userConfirm) => {
      if (userConfirm.isConfirmed) {
        //call post service
        let postResponse = httpServiceRequest("/vehiclegroup/addvehicle", "PUT", vehicelGroupHasVehicles);
        if (postResponse == "ok") {
          Swal.fire({
            title: "Vehicle Added!",
            text: "The vehicle has been successfully added to the group.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          refreshVehicleGroupForm();
          // hide the modal after successful addition
          $("#vehicleAddModalForGroup").modal("hide");
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
          text: "Vehicle addition cancelled.",
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

// ==================== end of vehicle add to group submit & error checking ==============================



// ==================== vehicel category eka change weddi vehicle object eke category property eka update karanawa ==============================
// vehicel category radio button eka change karaddi vehicle object eke category property eka update karanawa
const selectedRadioBtn = document.querySelectorAll('input[name="vehicleCategory"]');
// card eke button eka click kalma modal eka open wenawa.eken vehicle group has vehicle database table eka update karanawa
const addVehicle = (dataOb) => {
  $("#vehicleAddModalForGroup").modal("show");
  // Reset the form
  vehicleGroup = JSON.parse(JSON.stringify(dataOb));
  oldVehicleGroup = JSON.parse(JSON.stringify(dataOb));


  selectedRadioBtn.forEach((radio) => {
    // 
    radio.addEventListener("change", (e) => {
      vehicelGroupHasVehicles = {} // Reset the vehicles array when category changes
      const selectedValue = e.target.value;

      if (selectedValue === "Permanent") {

        vehicelGroupHasVehicles.is_temporary = false;
        // permant nam api ganne wena vehicle group walata assign karala nathi vehicle witharai
        const vehicleByVehicleGroupNotInAnyGroup = getServiceRequest("vehicle/vehiclebyvehiclegroupandsupplieragreementandnotinanygroup");
        const fiterdvehicleByVehicleGroup = vehicleByVehicleGroupNotInAnyGroup.map((vehicle) => {
          return {
            ...vehicle,
            vehicle_type_name: vehicle.vehicle_type_id.name,
          };
        });
        vehicelGroupHasVehicles.vehicle_group_id = vehicleGroup;

        dataFillIntoSelectWithTwoNames(selectVehicleNo, "Select Vehicle No", fiterdvehicleByVehicleGroup, "vehicle_no", "vehicle_type_name");
        vehicleNoDiv.style.display = "";
        temporyVehicleNoDiv.style.display = "none";
        select2Default([document.getElementById("selectVehicleNo")]); // Reset validation state
      } else {

        vehicelGroupHasVehicles.is_temporary = true;        // wena grop ekakata assign karala thiyena vehicle gnnawa
        let vehicleByVehicleGroup = getServiceRequest("vehicle/vehiclebyvehiclegroupandsupplieragreement?vehiclegroup_id=" + dataOb.id);
        const fiterdvehicleByVehicleGroup = vehicleByVehicleGroup.map((vehicle) => {
          return {
            ...vehicle,
            vehicle_type_name: vehicle.vehicle_type_id.name,
          };
        });
        vehicelGroupHasVehicles.vehicle_group_id = vehicleGroup;

        busyVehicleIds = getServiceRequest("/booking/busyvehicleids");
        // availableVehicles
        const availableVehicles = fiterdvehicleByVehicleGroup.filter((v) => !busyVehicleIds.includes(v.id))

        dataFillIntoSelectWithTwoNames(selectTemporyVehicleNo, "Select Temporary Vehicle No", availableVehicles, "vehicle_no", "vehicle_type_name");
        vehicleNoDiv.style.display = "none";
        temporyVehicleNoDiv.style.display = "";
        select2Default([document.getElementById("selectTemporyVehicleNo")]); // Reset validation state
      }
    });
  });

  vehicelGroupHasVehicles.vehicle_group_id = vehicleGroup;
  // let getVehicleTypeForDataList = (dataOb) => dataOb.vehicle_type_id.name;

  // dataFillIntoSelectWithTwoNames(selectVehicleNo, "Select Vehicle", vehicleByVehicleGroup, "vehicle_no",);

  console.log(vehicleGroup);
  console.log(oldVehicleGroup);
};
// ===================== end of vehicel category eka change weddi vehicle object eke category property eka update karanawa ==============================


// ===================== table load karanawa ==============================
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

// ===================== end of table load karanawa ==============================


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



// ==================== form reset karanawa ==============================
const refreshVehicleGroupForm = () => {
  vehicleGroup = new Object();

  vehicelGroupHasVehicles = new Object();
  vehicelGroupHasVehicles.is_temporary = false;

  vehicleGroupAddForm.reset();
  vehicleAddForm.reset();

  let customers = getServiceRequest("/customer/bynotinvehiclegroup");
  dataFilIntoSelect(selectCustomerName, "Select Company Name", customers, "company_name");

  let coordinatorList = getServiceRequest("/user/coordinatorlist");
  // employee no eka coordinator list ekata add karala thiyenne fullname eka witharai. e nisa dataFillIntoSelectWithTwoNames function eka use karala fullname saha employee no eka select box ekata add karanawa
  let filleterdList = coordinatorList.map((coordinator) => {
    return {
      ...coordinator,
      fullname: coordinator.employee_id.fullname,
      empNo: coordinator.employee_id.emp_no,
    };
  });
  dataFillIntoSelectWithTwoNames(selectCoordinator, "Select Coordinator", filleterdList, "fullname", "empNo");



  // loged wela inna userwa gnnawa
  logedUserDetails = getServiceRequest("/loggeduserdetails");
  // user role name eka gnnawa
  const findRoleNameById = (roleId) => {
    const roles = getServiceRequest("/role/alldata");
    const role = roles.find((r) => r.id === roleId);
    return role ? role.name : null;
  }

  // role eka gnnawa
  const roleName = findRoleNameById(logedUserDetails.role_id);
  console.log("Logged-in User Role Name:", roleName);

  // coordinator kenek nam eyata show karanne eyata assogn karala thiyena vehicle group tika witharai
  if (roleName === "Coordinator") {

    // loged wela inna userge vehicle group id tika gnnawa
    let availableVehicleGroupsId = getServiceRequest("/vehiclegroup/getbyuserid?userid=" + logedUserDetails.id);
    console.log(availableVehicleGroupsId);

    let vehicleGroups = getServiceRequest("/vehiclegroup/alldata");
    //  vehicleGroups = vehicleGroups.filter((group) => availableVehicleGroupsId.includes(group.id));
    // id tikata adala vehicle group tika gnnawa filter function eka use karala
    availableVehicleGroups = vehicleGroups.filter((group) => availableVehicleGroupsId.includes(group.id));
    console.log(availableVehicleGroups);
    // ekan show karanwa coordinator kenek nam eyata assogn karala thiyena vehicle group tika
    createVehicleGroupCards(availableVehicleGroups, addVehicle, loadTable);

  } else {
    let vehicleGroups = getServiceRequest("/vehiclegroup/alldata");
    createVehicleGroupCards(vehicleGroups, addVehicle, loadTable);
  }

  vehicleList = getServiceRequest("/vehicle/alldata");
  const vehicleByVehicleGroupNotInAnyGroup = getServiceRequest("vehicle/vehiclebyvehiclegroupandsupplieragreementandnotinanygroup");
  const fiterdvehicleByVehicleGroup = vehicleByVehicleGroupNotInAnyGroup.map((vehicle) => {
    return {
      ...vehicle,
      vehicle_type_name: vehicle.vehicle_type_id.name,
    };
  });
  dataFillIntoSelectWithTwoNames(selectVehicleNo, "Select Vehicle No", fiterdvehicleByVehicleGroup, "vehicle_no", "vehicle_type_name");

  // feild wala validation eka reset karanawa
  setDefault([textGroupName, selectCustomerName, selectVehicleNo]);
  select2Default([document.getElementById("selectCoordinator"), document.getElementById("selectVehicleNo"), document.getElementById("selectTemporyVehicleNo")]);



  applyPrivileges("Vehicle Group Management", null, {
    add: addButton,
  }, ["vehicleGroupform"]);
};


// ==================== end of form reset karanawa ==============================



// modal eka hide karaddi object eka reset wenawa
$("#vehicleAddModalForGroup").on("hidden.bs.modal", refreshVehicleGroupForm);


// Export Functionality
const exportTable = (type) => {
  if (type === "excel") {
    exportTableToExcelWithSheetJS("#vehicleTableByVehicleGroup", "vehicle_groups", { sheetName: "VehicleGroups" });
  } else if (type === "pdf") {
    exportTableToPdfWithJsPdf("#vehicleTableByVehicleGroup", "vehicle_groups", {
      title: "Vehicle Groups",
    });
  } else if (type === "print") {
    window.print();
  }
};

formResetFunctionWhenClosingModal("vehicleGroupModal", "vehicleGroupAddForm", refreshVehicleGroupForm);
