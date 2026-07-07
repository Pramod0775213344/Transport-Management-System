window.addEventListener('load', () => {
    refreshVehicleGroupForm();
    // $('#vehicleTableByVehicleGroup').DataTable().clear().destroy();
    $('#vehicleTableByVehicleGroup').DataTable().clear().draw(); // Clear table if no data
    $('#vehicleTableByVehicleGroup tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');
});

const refreshVehicleGroupForm = () => {

    vehicleGroup = new Object()
    vehicleGroup.vehicles = new Array();

    vehicleGroupAddForm.reset();
    vehicleAddForm.reset();

    let customers = getServiceRequest('/customer/bynotinvehiclegroup');
    dataFilIntoSelect(selectCustomerName, "Select Company Name", customers, "company_name")

    let vehicleGroups = getServiceRequest('/vehiclegroup/alldata');
    createVehicleGroupCards(vehicleGroups,addVehicle,loadTable);

    vehicleList = getServiceRequest('/vehicle/alldata');
    // dataFilIntoSelect(selectVehicleNo, "Select Company Name", vehicleList, "vehicle_no")
    dataFillIntoDataList(textVehicleName, vehicleList, "vehicle_no");

    setDefault([textGroupName,selectCustomerName, selectVehicleNo]);
}


//create view vehicle group dynamic cards
const createVehicleGroupCards = (vehicleGroups,editFunction,viewFunction) => {
    const vehicleGroupContainer = document.getElementById('vehicleGroupContainer');
    vehicleGroupContainer.innerHTML = ''; // Clear existing content

    vehicleGroups.forEach(vehicleGroup => {
        const card = document.createElement('div');
        card.classList.add("stat-card", "mb-3", "me-3");
        card.style.display = "inline-block";
        card.style.width = "15.3rem";
        card.style.cursor = "pointer";
        card.style.width = "20rem";
        card.innerHTML = `
 
        <div class="card-body">
        <div class="row">
        <div class="col-md-9">
         <h3 class="vehicle-group-title" style="font-weight:600; color:#2c3e50; margin-bottom:20px; ">${vehicleGroup.name}</h3></div>
          <div class="col-md-3">
           <button class="btn-icon table-button-edit " style="float:right; margin-right:10px;padding: 5px 6px)" ><i class="fa-solid fa-plus"></i></button></div>
        </div>
            <p>Customer: ${vehicleGroup.customer_id.company_name}</p>
         </div>       
        `;
         // Add button event after HTML is inserted
        if (editFunction) {
            const button = card.querySelector('.table-button-edit');
            if (button) {
                button.onclick = () => {
                    editFunction(vehicleGroup);
                };
            }
        }
        // card eka click karaddi view function eka call wenawa
        card.onclick = () => {
            if (viewFunction) {
                viewFunction(vehicleGroup);
            }
        }

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
}

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
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, save it!",
            allowOutsideClick: false,
            customClass :{
                cancelButton :'btn-3d btn-3d-cancel',
                confirmButton :'btn-3d btn-3d-submit'
            }

        }).then((userConfirm) => {
            if (userConfirm.isConfirmed) {
                //call post service
                let postResponse = httpServiceRequest("/vehiclegroup/insert", "POST", vehicleGroup);
                if (postResponse == "ok") {
                    Swal.fire({
                        title: "Saved!",
                        text: "Saved Successfully",
                        icon: "success",
                        customClass :{
                            confirmButton :'btn-3d btn-3d-other'
                        }
                    });
                   refreshVehicleGroupForm();
                } else {
                    Swal.fire({
                        title: "Failed to Submit....?",
                        text: postResponse,
                        icon: "question",
                        customClass :{
                            confirmButton :'btn-3d btn-3d-other'
                        }
                    });
                }
            } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
                Swal.fire({
                    title: "Cancelled",
                    text: "Details not Saved!",
                    icon: "error",
                    customClass :{
                        confirmButton :'btn-3d btn-3d-other'
                    }
                });
            }
        });
    } else {
        Swal.fire({
            title: 'Error!',
            text: errors,
            icon: 'error',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            customClass :{
                confirmButton :'btn-3d btn-3d-other'
            }
        });
    }
}

// check form error for required element
const checkFormErrorForVehicleAdd = () => {
    let updates = "";
    if (vehicleGroup != null && oldVehicleGroup != null) {
        if (vehicleGroup.vehicles.length !== oldVehicleGroup.vehicles.length ||
            !vehicleGroup.vehicles.every((elemnt, index) =>
                JSON.stringify(elemnt) === JSON.stringify(oldVehicleGroup.vehicles[index]))
        ) {
            updates += "Change the additional chargers list..... ";
        }
    }
    return updates;
}

// vehicle Group Add funtion
const vehicleAddToGroup = () => {
    console.log(vehicleGroup);
    let updates = checkFormErrorForVehicleAdd();
    // updates not exit
    if (updates == "") {
        Swal.fire({
            title: "Opps?",
            text: "Nothing To Add?",
            icon: "question",
            allowOutsideClick: false,
            customClass :{
                confirmButton :'btn-3d btn-3d-other'
            }
        });
    } else {
        let userConfirm = Swal.fire({
            title: "Are you sure?",
            text: "You want to update this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Add !",
            allowOutsideClick: false,
            customClass :{
                cancelButton :'btn-3d btn-3d-cancel',
                confirmButton :'btn-3d btn-3d-Submit'
            }
        }).then((userConfirm) => {
            if (userConfirm.isConfirmed) {
                //call putt service
                let postResponse = httpServiceRequest("/vehiclegroup/addvehicle", "PUT", vehicleGroup);
                if (postResponse == "ok") {
                    Swal.fire({
                        title: "Added!",
                        text: "Added Successfully",
                        icon: "success",
                        customClass :{
                            confirmButton :'btn-3d btn-3d-other'
                        }
                    });
                    refreshVehicleGroupForm();
                    $('#vehicleAddModalForGroup').modal('hide');
                } else {
                    Swal.fire({
                        title: "Failed to Submit....?",
                        text: postResponse,
                        icon: "question",
                        customClass :{
                            confirmButton :'btn-3d btn-3d-other'
                        }
                    });
                }
            } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
                Swal.fire({
                    title: "Cancelled",
                    text: "Details not Added!",
                    icon: "error",
                    allowOutsideClick: false,
                    customClass :{
                        confirmButton :'btn-3d btn-3d-other'
                    }
                });
            }
        });
    }
}

// card eke button eka click kalma modal eka open wenawa.eken vehicle group has vehicle database table eka update karanawa
const addVehicle = (dataOb) => {

    $('#vehicleAddModalForGroup').modal('show');
    // Reset the form
    vehicleGroup = JSON.parse(JSON.stringify(dataOb));
    oldVehicleGroup = JSON.parse(JSON.stringify(dataOb));

    let vehicleByVehicleGroup = getServiceRequest('vehicle/vehiclebyvehiclegroupandsupplieragreement?vehiclegroup_id=' + dataOb.id);
    dataFillIntoDataList(textVehicleName, vehicleByVehicleGroup, "vehicle_no");

    console.log(vehicleGroup);
    console.log(oldVehicleGroup);
}

// select karana vehicle group card eka anuwa table eka load karanawa
const loadTable = (dataOb) => {
    let vehicleByVehicleGroup = getServiceRequest('vehicle/vehiclebyvehiclegroup?vehiclegroup_id=' + dataOb.id);
    if ($.fn.dataTable.isDataTable('#vehicleTableByVehicleGroup')) {
        $('#vehicleTableByVehicleGroup').DataTable().clear().destroy();
    }
if (vehicleByVehicleGroup.length >= 0){

    const propertyList = [
        { propertyName: "vehicle_photo", dataType: "truck-image-array" },
        { propertyName: getTransportName, dataType: "function" },
        { propertyName: "vehicle_no", dataType: "string" },
        { propertyName: getVehicleType, dataType: "function" },
        { propertyName: getVehicleMake, dataType: "function" },
        { propertyName: "model", dataType: "string" }]

    dataFillIntoTheTable(vehicleTableByVehicleGroupBody, vehicleByVehicleGroup, propertyList, vehicleView, vehicleEdit, vehicleDelete, true);

    for (const index in vehicleByVehicleGroup) {
        vehicleTableByVehicleGroupBody.children[index].lastChild.children[0].classList.add("d-none");
        vehicleTableByVehicleGroupBody.children[index].lastChild.children[1].classList.add("d-none");
    }
    showTableLoading();
    $("#vehicleTableByVehicleGroup").dataTable({
        "createdRow": function(row, data, dataIndex) {
            $(row).find("td").css({
                "text-align": "center",
                "height": "80px"
            });
        },
        "headerCallback": function(thead, data, start, end, display) {
            $(thead).find("th").css({
                "text-align": "center",
                "padding": "20px"
            });
        }
    });
}else{

    $('#vehicleTableByVehicleGroup').DataTable().clear().draw(); // Clear table if no data
    $('#vehicleTableByVehicleGroup tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');
    showTableLoading();
}

}

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
}

const vehicleView = (dataOb) => {

}

const vehicleEdit = (dataOb) => {

}

const vehicleDelete = (dataOb) => {

}

// Function for datalist validation and object assignment
const dataListValidator = (element, object, property) => {
    const elementValue = element.value;
    console.log(elementValue)
    // Check if the value exists in the vehicleList
    // vehicel list array eken vehicle no eka match karanawa
    const extIndex = vehicleList.findIndex(vehicle => vehicle.vehicle_no === elementValue);

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
$('#vehicleAddModalForGroup').on('hidden.bs.modal', refreshVehicleGroupForm);

// table eke loading spin eka load karanwa
function showTableLoading(loaderId,tableId) {
    const loader = document.getElementById('loaderId');
    const vehicleTableByVehicleGroup = document.getElementById('vehicleTableByVehicleGroup');
    loader.style.display = ''; // Clear loading after 2 seconds
    vehicleTableByVehicleGroup.style.display = 'none'; // Hide the booking table while loading
    setTimeout(() => {
        const loader = document.getElementById('loaderId');
        loader.style.display = 'none'; // Clear loading after 2 seconds
        vehicleTableByVehicleGroup.style.display = ''; // Hide the booking table while loading
    }, 500);
}