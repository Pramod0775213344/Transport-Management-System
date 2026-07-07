window.addEventListener("load", () => {

    refreshVehicleForm();
});

// load bookingtable with search area

const searchVehicle = () =>{
    if ($.fn.dataTable.isDataTable('#vehicleTable')) {
        $('#vehicleTable').DataTable().clear().destroy();
    }
    let searchVehicleStatus = document.getElementById('searchVehicleStatus').value;
    let searchVehicleType = document.getElementById('searchVehicleType').value;

    if (searchVehicleStatus != "" && searchVehicleType != "") {

        vehicleByStatusAndVehicleType = getServiceRequest('/vehicle/bystatusidandvehicletypeid?vehicleStatusId=' + JSON.parse(searchVehicleStatus).id + '&vehicletypeid=' + JSON.parse(searchVehicleType).id);
        // length eka 0 num me if eka wada karanwa
        if (vehicleByStatusAndVehicleType.length <=0){
            $('#vehicleTable').DataTable().clear().draw(); // Clear table if no data
            $('#vehicleTable tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');
        }else{
            loadVehicleTable(vehicleByStatusAndVehicleType);
        }
        showTableLoading();

    } else if (searchVehicleType != "") {

        vehicleByVehicleType = getServiceRequest('/vehicle/byvehicletypeid?vehicletypeid=' + JSON.parse(searchVehicleType).id);
        // length eka 0 num me if eka wada karanwa
        if (vehicleByVehicleType.length <=0){

            $('#vehicleTable').DataTable().clear().draw(); // Clear table if no data
            $('#vehicleTable tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');

        }else{
            loadVehicleTable(vehicleByVehicleType);
        }
        showTableLoading();

    } else if (searchVehicleStatus != "") {
        showTableLoading();
        vehicleByStatus = getServiceRequest('/vehicle/bystatus?&vehicleStatusId=' + JSON.parse(searchVehicleStatus).id);
        // length eka 0 num me if eka wada karanwa
        if (vehicleByStatus.length <=0){
            $('#vehicleTable').DataTable().clear().draw(); // Clear table if no data
            $('#vehicleTable tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');

        }else{
            loadVehicleTable(vehicleByStatus);
        }
    } else  {
        Swal.fire({
            title: "Opps?",
            text: "Please Select Vehicle Type or Vehicle Status",
            icon: "question",
            allowOutsideClick: false,
        });
        loadVehicleTable(vehicles);
    }
};


// load vehicle table
const loadVehicleTable = (vehicles) => {


    const propertyList = [
        { propertyName: "vehicle_photo", dataType: "truck-image-array" },
        { propertyName: getSupplierDetails, dataType: "function" },
        { propertyName: getVehicleDetails, dataType: "function" },
        { propertyName: getVehicleMake, dataType: "function" },
        { propertyName: "model", dataType: "string" },
        { propertyName: getVehicleStatus, dataType: "function" }]

    dataFillIntoTheTable(vehicleTableBody, vehicles, propertyList, vehicleView, vehicleEdit, vehicleDelete, true);


    $("#vehicleTable").dataTable({
        "createdRow": function(row, data, dataIndex) {
            $(row).find("td").css({
                "text-align": "left",
                "height": "80px"
            });
        },
        "headerCallback": function(thead, data, start, end, display) {
            $(thead).find("th").css({
                "text-align": "left",
                "padding": "20px"
            });
        }
    });

};

// get supplier Details Name
const getSupplierDetails = (dataOb) => {
    return `<div class="row fw-bold pb-2" >${dataOb.supplier_id.fullname}</div>
<div class="row pb-2" style="font-size: 14px;">${dataOb.supplier_id.transportname}</div>
<div class="row pb-2" style="font-size: 14px;">${dataOb.supplier_id.mobileno}</div>`;
};

// get Vehicle Type
const getVehicleDetails = (dataOb) => {
    return `<div class="row fw-bold" >${dataOb.vehicle_no}</div>
<div class="row" style="font-size: 14px;">${dataOb.vehicle_type_id.name}</div>`
};

// get Vehicle Make
const getVehicleMake = (dataOb) => {
    return dataOb.vehicle_make_id.name;
};

// get driver Status
const getVehicleStatus = (dataOb) => {
    if (dataOb.vehicle_status_id.status == 'Active') {
        return "<span class='status-badge status-active'>" + dataOb.vehicle_status_id.status + "</span>"
    }

    if (dataOb.vehicle_status_id.status == 'Inactive') {
        return "<span class='status-badge status-pending'>" + dataOb.vehicle_status_id.status + "</span>"
    }
    if (dataOb.vehicle_status_id.status == 'Deleted') {
        return "<span class='status-badge status-inactive'>" + dataOb.vehicle_status_id.status + "</span>"
    }
};

// vehicle form function
const vehicleView = (dataOb) => {

}

// vehicle form Edit Function
const vehicleEdit = (dataOb) => {

    textVehicleTransportName.value = JSON.stringify(dataOb.supplier_id);
    textVehicleNo.value = dataOb.vehicle_no;
    selectVehicleType.value = JSON.stringify(dataOb.vehicle_type_id);
    selectVehicleMake.value = JSON.stringify(dataOb.vehicle_make_id);
    textVehicleModel.value = dataOb.model;
    textVehicleYear.value = dataOb.make_year;

    if (dataOb.category == "Own") {
        radioOwnVehicle.checked = "checked"
    } else {
        radioNonOwnVehicle.checked = "checked"
    }

    if (dataOb.vehicle_photo != null){
        previewImageVehicle.src = atob(dataOb.vehicle_photo);
        photoPreviewVehicle.style.display = 'block';
        uploadContainerVehiclePhoto.style.display = 'none';

    }else {
        photoPreviewVehicle.style.display = 'none';
        uploadContainerVehiclePhoto.style.display = 'block';
    }
    // cr photo
    if (dataOb.cr_photo != null){
        previewImageCr.src = atob(dataOb.cr_photo);
        photoPreviewCr.style.display = 'block';
        uploadContainerCr.style.display = 'none';

    }else {
        photoPreviewCr.style.display = 'none';
        uploadContainerCr.style.display = 'block';
    }
    // revenue license photo
    if (dataOb.revenue_license_photo != null){
        previewImageRl.src = atob(dataOb.revenue_license_photo);
        photoPreviewRl.style.display = 'block';
        uploadContainerRl.style.display = 'none';

    }else {
        photoPreviewRl.style.display = 'none';
        uploadContainerRl.style.display = 'block';
    }
    // insurance card
    if (dataOb.insurance_card_photo != null){
        previewImageInsuranceCard.src = atob(dataOb.insurance_card_photo);
        photoPreviewInsuranceCard.style.display = 'block';
        uploadContainerInsuranceCard.style.display = 'none';

    }else {
        photoPreviewInsuranceCard.style.display = 'none';
        uploadContainerInsuranceCard.style.display = 'block';
    }
    // imspection report
    if (dataOb.inspection_report_photo != null){
        previewImageInspectionReport.src = atob(dataOb.inspection_report_photo);
        photoPreviewInspectionReport.style.display = 'block';
        uploadContainerInspectionReport.style.display = 'none';

    }else {
        photoPreviewInspectionReport.style.display = 'none';
        uploadContainerInspectionReport.style.display = 'block';
    }

    textVehicleInsuranceExpireDate.value = dataOb.insurance_expire_date;
    textVehicleRevenuLicenseExpireDate.value = dataOb.revenu_license_expire_date;
    textVehicleStartMeterReading.value = dataOb.startup_meter_reading;
    textVehicleCurrentMeterReading.value = dataOb.current_meter_reading;
    textVehicleStatus.value = JSON.stringify(dataOb.vehicle_status_id);

    $("#vehicleFormModal").modal("show")

    updateButton.style.display = "";
    submitButton.style.display = "none";
    additionalInformationSection.style.display = "";


    vehicle = JSON.parse(JSON.stringify(dataOb));
    oldVehicle = JSON.parse(JSON.stringify(dataOb));

}

// vehicle form delete function
const vehicleDelete = (dataOb) => {

    let userConfirm = Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Delete it!",
        allowOutsideClick: false,
        customClass :{
            cancelButton :'btn-3d btn-3d-cancel',
            confirmButton :'btn-3d btn-3d-delete'
        }
    }).then((userConfirm) => {
        if (userConfirm.isConfirmed) {
            //call post service
            let deleteResponse = httpServiceRequest("/vehicle/delete", "DELETE", dataOb);
            if (deleteResponse == "ok") {
                Swal.fire({
                    title: "Deleted!",
                    text: "Deleted Successfully",
                    icon: "success",
                    iconColor: "#d33",
                    timer: 1000,
                    confirmButtonColor: "#d33",
                    showConfirmButton: false,
                    customClass :{
                        confirmButton :'btn-3d btn-3d-other'
                    }

                });
                loadVehicleTable();
                refreshVehicleForm();
            } else {
                Swal.fire({
                    title: "Failed to Submit....?",
                    text: deleteResponse,
                    icon: "question",
                    allowOutsideClick: false,
                    customClass :{
                        confirmButton :'btn-3d btn-3d-other'
                    }
                });
            };
        } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: "Cancelled",
                text: "Details not Deleted!",
                icon: "error",
                customClass :{
                    confirmButton :'btn-3d btn-3d-other'
                }
            });
        };
    });
}

// check form errors
const checkFormError = () => {
    let errors = "";

    if (vehicle.supplier_id == null) {
        errors = errors + "Please select the trasnport name....... ";
    }
    if (vehicle.vehicle_no == null) {
        errors = errors + "Please Enter Vehicle Number....... ";
    }
    if (vehicle.model == null) {
        errors = errors + "Please Enter Vehicle Modal....... ";
    }
    if (vehicle.make_year == null) {
        errors = errors + "Please Enter Vehicle make year....... ";
    }
    if (vehicle.insurance_expire_date == null) {
        errors = errors + "Please Enter insurance expire date....... ";
    }
    if (vehicle.revenu_license_expire_date == null) {
        errors = errors + "Please  Enter Revenu license expire date....... ";
    }
    if (vehicle.vehicle_type_id == null) {
        errors = errors + "Please select vehicle Type....... ";
    }
    if (vehicle.vehicle_make_id == null) {
        errors = errors + "Please select the make....... ";
    }
    if (vehicle.category == null) {
        errors = errors + "Please select the Category....... ";
    }

    return errors;

}

//vehicel form submit buttom
const vehicleFormSubmit = () => {
  
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
                let postResponse = httpServiceRequest("/vehicle/insert", "POST", vehicle);

                if (postResponse == "ok") {
                    Swal.fire({
                        title: "Saved!",
                        text: "Saved Successfully",
                        icon: "success",
                        customClass :{
                            confirmButton :'btn-3d btn-3d-other'
                        }
                    });
                    loadVehicleTable();
                    refreshVehicleForm();
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
    console.log(vehicle);
}

// check form updates
const checkFormUpdates = () => {
    let updates = "";
    if (vehicle != null && oldVehicle != null) {
        if (vehicle.supplier_id.transportname != oldVehicle.supplier_id.transportname) {
            updates = updates + "Transport Name is changed.... ";
        }
        if (vehicle.vehicle_photo != oldVehicle.vehicle_photo) {
            updates = updates + "Vehicle Photo is changed.... ";
        }
        if (vehicle.vehicle_no != oldVehicle.vehicle_no) {
            updates = updates + "Vehicle Number is changed.... ";
        }
        if (vehicle.model != oldVehicle.model) {
            updates = updates + "Vehicle Model is changed.... ";
        }
        if (vehicle.make_year != oldVehicle.make_year) {
            updates = updates + "Vehicle Make Year is changed.... ";
        }
        if (vehicle.insurance_expire_date != oldVehicle.insurance_expire_date) {
            updates = updates + "Insurance Expire Date is changed.... ";
        }
        if (vehicle.revenu_license_expire_date != oldVehicle.revenu_license_expire_date) {
            updates = updates + "Revenu License Expire Date is changed.... ";
        }
        if (vehicle.startup_meter_reading != oldVehicle.startup_meter_reading) {
            updates = updates + "Start Meter Reading is changed.... ";
        }
        if (vehicle.vehicle_type_id.name != oldVehicle.vehicle_type_id.name) {
            updates = updates + "Vehicle Type is changed.... ";
        }
        if (vehicle.vehicle_make_id.name != oldVehicle.vehicle_make_id.name) {
            updates = updates + "Vehicle Make is changed.... ";
        }
        if (vehicle.category != oldVehicle.category) {
            updates = updates + "Category is changed.... ";
        }
        if (vehicle.vehicle_status_id.status != oldVehicle.vehicle_status_id.status) {
            updates = updates + "Status is changed.... ";
        }
        if (vehicle.vehicle_photo != oldVehicle.vehicle_photo) {
            updates = updates + "Vehicle photo is changed.... ";
        }
        if (vehicle.cr_photo != oldVehicle.cr_photo) {
            updates = updates + "CR is changed.... ";
        }
        if (vehicle.revenue_license_photo != oldVehicle.revenue_license_photo) {
            updates = updates + "Revenue License is changed.... ";
        }
        if (vehicle.insurance_card_photo != oldVehicle.insurance_card_photo) {
            updates = updates + "Insurance card is changed.... ";
        }
        if (vehicle.inspection_report_photo != oldVehicle.inspection_report_photo) {
            updates = updates + "Inspection Report is changed.... ";
        }
    }

    return updates;

}

// vehicle form update function
const vehicleFormUpdate = () => {
    // check form error for required element
    let errors = checkFormError();
    if (errors == "") {
        let updates = checkFormUpdates();
        // updates not exit
        if (updates == "") {
            Swal.fire({
                title: "Opps?",
                text: "Nothing To Update?",
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
                confirmButtonText: "Yes, Update it!",
                allowOutsideClick: false,
                customClass :{
                    cancelButton :'btn-3d btn-3d-cancel',
                    confirmButton :'btn-3d btn-3d-update'
                }
            }).then((userConfirm) => {
                if (userConfirm.isConfirmed) {
                    //call post service
                    let putResponse = httpServiceRequest("/vehicle/update", "PUT", vehicle);;
                    if (putResponse == "ok") {
                        Swal.fire({
                            title: "Update!",
                            text: "Updated Successfully",
                            icon: "success",
                            customClass :{
                                confirmButton :'btn-3d btn-3d-other'
                            }
                        });
                        loadVehicleTable();
                        refreshVehicleForm();
                        $("#vehicleFormModal").modal("hide");

                    } else {
                        Swal.fire({
                            title: "Failed to Submit....?",
                            text: putResponse,
                            icon: "question",
                            customClass :{
                                confirmButton :'btn-3d btn-3d-other'
                            }
                        });
                    }
                } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
                    Swal.fire({
                        title: "Cancelled",
                        text: "Details not Updated!",
                        icon: "error",
                        allowOutsideClick: false,
                        customClass :{
                            confirmButton :'btn-3d btn-3d-other'
                        }
                    });
                }
            });
        }
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

// vehicle form refresh function
const refreshVehicleForm = () => {

    vehicle = new Object();
    vehicleRegistrationForm.reset();

    setDefault([textVehicleTransportName, textVehicleNo, selectVehicleType, selectVehicleMake, textVehicleModel, textVehicleYear, textVehicleInsuranceExpireDate, textVehicleRevenuLicenseExpireDate, textVehicleStartMeterReading, textVehicleCurrentMeterReading, textVehicleStatus])

    // get only active suppliers
    let transportNames = getServiceRequest('/supplier/alldatabystatus');
    dataFilIntoSelect(textVehicleTransportName, "Select Transport", transportNames, "transportname");

    let vehicleStatus = getServiceRequest('/vehiclestatus/alldata');
    dataFilIntoSelect(textVehicleStatus, "Select Status", vehicleStatus, "status");

    let vehicleType = getServiceRequest('/vehicletype/alldata');
    dataFilIntoSelect(selectVehicleType, "Select Vehicle Type", vehicleType, "name");

    let vehicleMake = getServiceRequest('/vehiclemake/alldata');
    dataFilIntoSelect(selectVehicleMake, "Select Vehicle Make", vehicleMake, "name");

    // current date validate and previous date restrict
    currentdatevalidator('textVehicleInsuranceExpireDate')
    // current date validate and previous date restrict
    currentdatevalidator('textVehicleRevenuLicenseExpireDate')

    submitButton.style.display = "";
    updateButton.style.display = "none";

    // default file format of uploading photo
    photoPreviewVehicle.style.display = 'none';
    uploadContainerVehiclePhoto.style.display = 'block';

    photoPreviewCr.style.display = 'none';
    uploadContainerCr.style.display = 'block';

    photoPreviewRl.style.display = 'none';
    uploadContainerRl.style.display = 'block';

    photoPreviewInsuranceCard.style.display = 'none';
    uploadContainerInsuranceCard.style.display = 'block';

    photoPreviewInspectionReport.style.display = 'none';
    uploadContainerInspectionReport.style.display = 'block';

    additionalInformationSection.style.display = "none";


//     for sreach drop downs
    dataFilIntoSelect(searchVehicleStatus, "Select Status", vehicleStatus, "status");
    dataFilIntoSelect(searchVehicleType, "Select Vehicle Type", vehicleType, "name");

//     refesh ekedi load wenawa tabale eka
    vehicles = getServiceRequest('/vehicle/alldata');
    loadVehicleTable(vehicles);
    showTableLoading();
};
// table eke loading spin eka load karanwa
function showTableLoading(loaderId,tableId) {
    const loader = document.getElementById('loaderId');
    const VehicleTable = document.getElementById('vehicleTable');
    loader.style.display = ''; // Clear loading after 2 seconds
    VehicleTable.style.display = 'none'; // Hide the booking table while loading
    setTimeout(() => {
        const loader = document.getElementById('loaderId');
        loader.style.display = 'none'; // Clear loading after 2 seconds
        VehicleTable.style.display = ''; // Hide the booking table while loading
    }, 500);
}
//Alert Box Call function
Swal.isVisible();