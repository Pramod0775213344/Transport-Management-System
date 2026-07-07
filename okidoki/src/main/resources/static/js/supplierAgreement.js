
window.addEventListener('load', () => {

    // all agreement data tika load karanwa
    let supplierAgreements =  getServiceRequest('/supplieragreement/alldata');;
    loadSupplierAgreementTable(supplierAgreements);
    showTableLoading();


    // get count of the supplier agreement
    let supplierAgreementCount = getServiceRequest('/supplieragreement/countall');
    document.getElementById('supplierAgreementCount').innerText = supplierAgreementCount;

    // get count of the active supplier agreement
    let activeSupplierAgreementCount = getServiceRequest('/supplieragreement/countactive');
    document.getElementById('activeSupplierAgreementCount').innerText = activeSupplierAgreementCount;

    // get count of the pending supplier agreement
    let pendingSupplierAgreementCount = getServiceRequest('/supplieragreement/countpending');
    document.getElementById('pendingSupplierAgreementCount').innerText = pendingSupplierAgreementCount;

    // get count of the reject supplier agreement
    let rejectSupplierAgreementCount = getServiceRequest('/supplieragreement/countreject');
    document.getElementById('rejectSupplierAgreementCount').innerText = rejectSupplierAgreementCount;

    refreshSupplierAgreementForm();

});

// filtering area functions
const filteringSupplierName = document.getElementById('filteringSupplierName')
const filteringSupplierVehicleType = document.getElementById('filteringSupplierVehicleType')
const filteringSupplierAgreementStatus = document.getElementById('filteringSupplierAgreementStatus')
const filtering = () => {
    if ($.fn.dataTable.isDataTable('#supplierAggrementTable')) {
        $('#supplierAggrementTable').DataTable().destroy();
    }

    // supplier name eka witharak thiyenw nam
    if (filteringSupplierName.value != "" && filteringSupplierVehicleType.value === "" && filteringSupplierAgreementStatus.value === "") {
        let selectSupplier = JSON.parse(filteringSupplierName.value);
        let supplierAgreements = getServiceRequest("/supplieragreement/filterbysupplierid?supplierId=" + selectSupplier.id);
        loadSupplierAgreementTable(supplierAgreements);
        showTableLoading();
    }
    // vehicle type eka witharak thiyenw nam
    else if (filteringSupplierName.value === "" && filteringSupplierVehicleType.value != "" && filteringSupplierAgreementStatus.value === "") {
        let selectSupplierVehicleType = JSON.parse(filteringSupplierVehicleType.value);
        let supplierAgreements = getServiceRequest("/supplieragreement/filterbyvehicletype?vehicleTypeId=" + selectSupplierVehicleType.id);
        loadSupplierAgreementTable(supplierAgreements);
        showTableLoading();
    }
    // status eka witharak thiyenw nam
    else if (filteringSupplierName.value === "" && filteringSupplierVehicleType.value === "" && filteringSupplierAgreementStatus.value != "") {
        let selectSupplierAgreementStatus = JSON.parse(filteringSupplierAgreementStatus.value);
        let supplierAgreements = getServiceRequest("/supplieragreement/filterbystatus?statusId=" + selectSupplierAgreementStatus.id);
        loadSupplierAgreementTable(supplierAgreements);
        showTableLoading();
    }
//     supplier name eka saha vehicle type eka thiyenw nam
    else if (filteringSupplierName.value != "" && filteringSupplierVehicleType.value != "" && filteringSupplierAgreementStatus.value === "") {
        let selectSupplier = JSON.parse(filteringSupplierName.value);
        let selectSupplierVehicleType = JSON.parse(filteringSupplierVehicleType.value);
        let supplierAgreements = getServiceRequest("/supplieragreement/filterbysupplieridandvehicletype?supplierId=" + selectSupplier.id + "&vehicleTypeId=" + selectSupplierVehicleType.id);
        loadSupplierAgreementTable(supplierAgreements);
        showTableLoading();
    }
    // supplier name eka saha status eka thiyenw nam
    else if (filteringSupplierName.value != "" && filteringSupplierVehicleType.value === "" && filteringSupplierAgreementStatus.value != "") {
        let selectSupplier = JSON.parse(filteringSupplierName.value);
        let selectSupplierAgreementStatus = JSON.parse(filteringSupplierAgreementStatus.value);
        let supplierAgreements = getServiceRequest("/supplieragreement/filterbysupplieridandstatus?supplierId=" + selectSupplier.id + "&statusId=" + selectSupplierAgreementStatus.id);
        loadSupplierAgreementTable(supplierAgreements);
        showTableLoading();
    }
    // vehicle type eka saha status eka thiyenw nam
    else if (filteringSupplierName.value === "" && filteringSupplierVehicleType.value != "" && filteringSupplierAgreementStatus.value != "") {
        let selectSupplierVehicleType = JSON.parse(filteringSupplierVehicleType.value);
        let selectSupplierAgreementStatus = JSON.parse(filteringSupplierAgreementStatus.value);
        let supplierAgreements = getServiceRequest("/supplieragreement/filterbyvehicletypeandstatus?vehicleTypeId=" + selectSupplierVehicleType.id + "&statusId=" + selectSupplierAgreementStatus.id);
        loadSupplierAgreementTable(supplierAgreements);
        showTableLoading();
    }
    // customerge name eka saha vehicle type eka saha status eka thiyenw nam
    else if (filteringSupplierName.value != "" && filteringSupplierVehicleType.value != "" && filteringSupplierAgreementStatus.value != "") {
        let selectSupplier = JSON.parse(filteringSupplierName.value);
        let selectSupplierVehicleType = JSON.parse(filteringSupplierVehicleType.value);
        let selectSupplierAgreementStatus = JSON.parse(filteringSupplierAgreementStatus.value);
        let supplierAgreements = getServiceRequest("/supplieragreement/filterbysupplieridandvehicletypeandstatus?supplierId=" + selectSupplier.id + "&vehicleTypeId=" + selectSupplierVehicleType.id + "&statusId=" + selectSupplierAgreementStatus.id);
        loadSupplierAgreementTable(supplierAgreements);
        showTableLoading();
    }
    // ewa naththam alll data gannawa
    else {
        let supplierAgreements = getServiceRequest('/supplieragreement/alldata');
        loadSupplierAgreementTable(supplierAgreements);
        showTableLoading();
    }
}

// filtering eka reset karanwa funtion eka
const resetFilter = () => {
    // select wala value eka reset karanawa
    filteringSupplierName.value = "";
    filteringSupplierVehicleType.value = "";
    filteringSupplierAgreementStatus.value = "";

    // data table eka destroy karanawa
    if ($.fn.dataTable.isDataTable('#supplierAggrementTable')) {
        $('#supplierAggrementTable').DataTable().destroy();
    }

    // all agreement data tika load karanwa
    let supplierAgreements =  getServiceRequest('/supplieragreement/alldata');;
    loadSupplierAgreementTable(supplierAgreements);
    showTableLoading();
}

// table data load function
const loadSupplierAgreementTable = (supplierAgreements) => {
    
    const propertyList = [
        { propertyName: getSupplierAgreementNo, dataType: "function" },
        { propertyName: getSupplier, dataType: "function" },
        { propertyName: getVehicleDetails, dataType: "function" },
        { propertyName: getPackageDetails, dataType: "function" },
        { propertyName: getCotranctPeriod, dataType: "function" },
        { propertyName: getSupplierAgreementStatus, dataType: "function" }
    ];

    dataFillIntoTheTable(supplierAgreementTableBody, supplierAgreements, propertyList, supplierAgreementView,supplierAgreementEdit, supplierAgreementDelete, true);


    $("#supplierAggrementTable").dataTable({
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
};


// get supplier transport name
const getSupplierAgreementNo = (dataOb) => {

    return "<span class ='unique_no'>" + dataOb.sup_agreement_no + "</span >";

}

// get supplier
const getSupplier = (dataOb) => {
    return `<div class="row fw-bold" >${dataOb.supplier_id.fullname}</div>
<div class="row" style="font-size: 14px;">${dataOb.supplier_id.transportname}</div>
<div class="row" style="font-size: 14px;">${dataOb.supplier_id.mobileno}</div>`;
}

// get vehicle type
const getVehicleDetails = (dataOb) => {
    return `<div class="row fw-bold" >${dataOb.vehicle_id.vehicle_no}</div>
<div class="row" style="font-size: 14px;">${dataOb.vehicle_id.vehicle_type_id.name}</div>`

}

// get package type
const getPackageDetails = (dataOb) => {
    return `<div class="row" >${dataOb.package_id.name}</div>
<div class="row" style="font-size: 14px;">${dataOb.package_id.distance} Km</div>`
}

// get contract period
const getCotranctPeriod = (dataOb) => {
    return `<div class="row" >${dateformat(dataOb.agreement_date)}  - ${dateformat(dataOb.agreement_end_date)}</div>
<div class="row" >${(dataOb.agreement_period)} months</div>`;
}


// get supplier agreement status
const getSupplierAgreementStatus = (dataOb) => {
    if (dataOb.supplier_agreement_status_id.status == 'Approved') {
        return "<span class='status-badge status-active'>" + dataOb.supplier_agreement_status_id.status + "</span>"
    }

    if (dataOb.supplier_agreement_status_id.status == 'Pending') {
        return "<span class='status-badge status-pending'> " + dataOb.supplier_agreement_status_id.status + "</span>"
    }
    if (dataOb.supplier_agreement_status_id.status == 'Expired') {
        return "<span class='status-badge status-inactive'> " + dataOb.supplier_agreement_status_id.status + "</span>"
    }
    if (dataOb.supplier_agreement_status_id.status == 'Deleted') {
        return "<span class='status-badge status-inactive'> " + dataOb.supplier_agreement_status_id.status + "</span>"
    }
    if (dataOb.supplier_agreement_status_id.status == 'Reject') {
        return "<span class='status-badge status-reject'> " + dataOb.supplier_agreement_status_id.status + "</span>"
    }
}


// supplier agreement view function
const supplierAgreementView = (dataOb) => {
    viewAgreementNo.innerText = dataOb.sup_agreement_no;
    viewCurrentDate.innerText = new Date().toLocaleDateString();
    viewSupplierName.innerText = dataOb.supplier_id.fullname;
    viewSupplierAddress.innerText = dataOb.supplier_id.address;
    viewSupplierEmail.innerText = dataOb.supplier_id.email;
    viewSupplierPhone.innerText = dataOb.supplier_id.mobileno;
    viewVehicleNo.innerText = dataOb.vehicle_id.vehicle_no;
    viewVehicleType.innerText = dataOb.vehicle_id.vehicle_type_id.name;
    viewAgreementStartDate.innerText = dataOb.agreement_date;
    viewAgreementEndDate.innerText = dataOb.agreement_end_date;
    viewAgreementPeriod.innerText = dataOb.agreement_period+' month';
    viewPackageName.innerText = dataOb.package_id.name;
    viewPackageDistance.innerText = dataOb.package_id.distance +' KM';
    if (dataOb.package_id.package_type === "Floating Rate"){
        viewPackageRate.innerText = "Rs. "+dataOb.package_id.package_charge_sup +" Per Km";
    }else {
        viewPackageRate.innerText = "Rs. "+dataOb.package_id.package_charge_sup
    }

    // when click the edit button the form will be display
    $("#supplierAgreementViewModal").modal("show");
}

// supplier agreement delete function
const supplierAgreementDelete = (dataOb) => {
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
            let deleteResponse = httpServiceRequest("/supplieragreement/delete", "DELETE", dataOb);
            if (deleteResponse == "ok") {
                Swal.fire({
                    title: "Deleted!",
                    text: "Deletd Successfully",
                    icon: "success",
                    iconColor: "#d33",
                    timer: 1000,
                    showConfirmButton: false,
                    customClass :{
                        confirmButton :'btn-3d btn-3d-other'
                    }
                });
                loadSupplierAgreementTable();
                refreshSupplierAgreementForm();
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

// supplier agreement edit function
const supplierAgreementEdit = (dataOb) => {

    // check the status of the agreementa and if it is approved can't edit the details
    if (dataOb.supplier_agreement_status_id.status == 'Approved' ) {
        Swal.fire({
            title: "Opps?",
            text: "Can't Edit Approved Details",
            icon: "question",
            allowOutsideClick: false,
        });
        return;
    }

       // check the status of the agreementa and if it is Deletd can't edit the details
       if (dataOb.supplier_agreement_status_id.status == 'Deleted' ) {
        Swal.fire({
            title: "Opps?",
            text: "Can't Edit Deleted Details",
            icon: "question",
            allowOutsideClick: false,
        });
        return;
    }

    selectTransportName.value = JSON.stringify(dataOb.supplier_id);

    let vehicleBySupplier = getServiceRequest('/vehicle/bysupplierid?supplierid=' + dataOb.supplier_id.id);
    dataFilIntoSelect(selectVehicleNo, "Select Vehicle", vehicleBySupplier, "vehicle_no")

    selectVehicleNo.value = JSON.stringify(dataOb.vehicle_id);

    // ----------------------------------------------------------------------
    if (dataOb.agreement_charge == null || dataOb.agreement_charge == undefined) {
        
        textSupplierAgreementCharge.value = dataOb.agreement_charge;
    } else {
        textSupplierAgreementCharge.value = "";
    }

    // ----------------------------------------------------------------------
    if (dataOb.additional_charge == null || dataOb.additional_charge == undefined) {
       
        textSupplierAgreementAdditionalCharge.value = dataOb.additional_charge; 
    } else {
        textSupplierAgreementAdditionalCharge.value = "";
    }

    // ----------------------------------------------------------------------
    if (dataOb.special_note == null || dataOb.special_note == undefined) {
        textSupplierAgreementNote.value = dataOb.special_note;
        
    } else {
        textSupplierAgreementNote.value = "";
    }

    textSupplierAgreementDate.value = dataOb.agreement_date;

    textSupplierAgreementPeriod.value = dataOb.agreement_period;

    textSupplierAgreementEndDate.value = dataOb.agreement_end_date;

    selectPackageType.value = JSON.stringify(dataOb.package_id);

    textSupplierAgreementTotalAmount.value = dataOb.total_amount;

    textSupplierAgreementApprovalNote.value = dataOb.approval_note;



    supplierAgreement = JSON.parse(JSON.stringify(dataOb));
    oldSupplierAgreement = JSON.parse(JSON.stringify(dataOb));

    // when click the edit button the form will be display
    $("#supplierAgreementFormModal").modal("show");

    selectVehicleNo.disabled = false;

    updateButton.style.display = "";
    submitButton.style.display = "none";

}

// check form errros
const checkFormError = () => {
    let errors = "";

    if (supplierAgreement.supplier_id == null) {
        errors = errors + "Please Select Supplier Name........";
    }
    if (supplierAgreement.vehicle_id == null) {
        errors = errors + "Please Select Vehicle Number........";
    }
    if (supplierAgreement.agreement_date == null) {
        errors = errors + "Please Select Agreement Date........";
    }
    if (supplierAgreement.agreement_period == null) {
        errors = errors + "Please Select Agreement Period........";
    }
    if (supplierAgreement.agreement_end_date == null) {
        errors = errors + "Please Select Agreement End Date........";
    }
    if (supplierAgreement.package_id == null) {
        errors = errors + "Please Select Package Type........";
    }

    return errors;
}

// supplier agreement form submit
const supplierAgreementFormSubmit = () => {
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
                let postResponse = httpServiceRequest("/supplieragreement/insert", "POST", supplierAgreement);
                if (postResponse == "ok") {
                    Swal.fire({
                        title: "Saved!",
                        text: "Saved Successfully",
                        icon: "success",
                        customClass :{
                            confirmButton :'btn-3d btn-3d-other'
                        }
                    });
                    loadSupplierAgreementTable();
                    refreshSupplierAgreementForm();

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
}

// supplier agreement form update
const supplierAgreementFormUpdate = () => {

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
            });
            console.log(oldSupplierAgreement);
            console.log(supplierAgreement);
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
                    //call putt service
                    let putResponse = httpServiceRequest("/supplieragreement/update", "PUT", supplierAgreement);
                    if (putResponse == "ok") {
                        Swal.fire({
                            title: "Update!",
                            text: "Updated Successfully",
                            icon: "success",
                            customClass :{
                                confirmButton :'btn-3d btn-3d-other'
                            }
                        });
                        loadSupplierAgreementTable();
                        refreshSupplierAgreementForm();
                        $("#supplierAgreementFormModal").modal("hide");

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

// refresh supplier agreement form
const refreshSupplierAgreementForm = () => {

    supplierAgreement = new Object();

    supplierAgreementForm.reset();

    setDefault([selectTransportName, selectVehicleNo, textSupplierAgreementDate, textSupplierAgreementPeriod, textSupplierAgreementEndDate, selectPackageType, textSupplierAgreementCharge, textSupplierAgreementAdditionalCharge, textSupplierAgreementTotalAmount, textSupplierAgreementNote]);

    let transportnames =  getServiceRequest('/supplier/alldatabystatus');
    dataFilIntoSelect(selectTransportName, "Select Transport Name", transportnames, "transportname")

    let vehicles = getServiceRequest('/vehicle/alldata');
    dataFilIntoSelect(selectVehicleNo, "Select Vehicle ", vehicles, "vehicle_no")


    let packageTypes =  getServiceRequest('/package/bypackagestatus');
    dataFilIntoSelect(selectPackageType, "Select Package Type", packageTypes, "name")

    selectVehicleNo.disabled = true;
    selectPackageType.disabled = true;

    submitButton.style.display = "";
    updateButton.style.display = "none";

    //     filtering area eke thiyen drop down tika fil karanawa
    dataFilIntoSelect(filteringSupplierName, "Select Company Name", transportnames, "transportname")

    let vehiclesTypes = getServiceRequest('/vehicletype/alldata');
    dataFilIntoSelect(filteringSupplierVehicleType, "Select Vehicle Type", vehiclesTypes, "name")

    let agreementStatus = getServiceRequest('/supplieragreementstatus/alldata');;
    dataFilIntoSelect(filteringSupplierAgreementStatus, "Select Status ", agreementStatus, "status")
}

// filter function for select transport name
let transportNameElement = document.querySelector("#selectTransportName");
transportNameElement.addEventListener("change", () => {

    let supplier = JSON.parse(transportNameElement.value);
    supplierAgreement.supplier_id = JSON.parse(transportNameElement.value);

    selectTransportName.classList.remove("is-invalid");
    selectTransportName.classList.add("is-valid");

    selectVehicleNo.disabled = false;

    let vehicleBySupplier = getServiceRequest('/vehicle/bysupplierid?supplierid=' + supplier.id);
    console.log(vehicleBySupplier);
    // get vehicle type function
    let getVehicleType = (vehicle) => vehicle.vehicle_type_id.name;
    dataFillIntoSelectWithTwoNamesWithBracket(selectVehicleNo, "Select Vehicle ", vehicleBySupplier, "vehicle_no", getVehicleType);


})

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
   
    let packageByVehicle = getServiceRequest('/package/byvehicleid?vehicleid=' + vehicle.id);
    dataFilIntoSelect(selectPackageType, "Select Package Type", packageByVehicle, "name")
})

//Alert Box Call function
Swal.isVisible();

//calclate end date using given date and time period

let agreementEndDate = (startDateStr, periodValue) => {
    const startdate = new Date(startDateStr);
    const enddate = new Date(startdate);
    enddate.setMonth(startdate.getMonth() + Number(periodValue));

    // input type ekata galapena widihata date input format ekata convert karanna
    return `${enddate.getFullYear()}-${(enddate.getMonth() + 1).toString().padStart(2, '0')}-${enddate.getDate().toString().padStart(2, '0')}`;
};

document.getElementById('textSupplierAgreementPeriod').onchange = () => {
    const agreementStartDate = document.getElementById('textSupplierAgreementDate').value;
    const agreementPeriod = document.getElementById('textSupplierAgreementPeriod').value;

    //object ekata bind karanawa
    supplierAgreement.agreement_period = agreementPeriod;
    // validation
    textSupplierAgreementPeriod.classList.remove("is-invalid");
    textSupplierAgreementPeriod.classList.add("is-valid");

    const endDate = agreementEndDate(agreementStartDate, agreementPeriod);
    document.getElementById('textSupplierAgreementEndDate').value = endDate;

    // object ekata bind karanawa
    supplierAgreement.agreement_end_date = endDate;
    // validation
    textSupplierAgreementEndDate.classList.remove("is-invalid");
    textSupplierAgreementEndDate.classList.add("is-valid");
    console.log(endDate); // "7/15/2024"
};

//-----------------------table loading show function-------------------
// table eke loading spin eka load karanwa
function showTableLoading() {
    const loader = document.getElementById('loaderId');
    const supplierAggrementTable = document.getElementById('supplierAggrementTable');
    loader.style.display = ''; // Clear loading after 2 seconds
    supplierAggrementTable.style.display = 'none'; // Hide the booking table while loading
    setTimeout(() => {
        const loader = document.getElementById('loaderId');
        loader.style.display = 'none'; // Clear loading after 2 seconds
        supplierAggrementTable.style.display = ''; // Hide the booking table while loading
    }, 500);
}