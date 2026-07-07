window.addEventListener("load", () => {

    loadPackageCards();

    refereshPackageForm();
})

// packge cards load function
const loadPackageCards = () => {

    packages = getServiceRequest('/package/alldata');

    // property list eke name
    const propertyListName = [
        { propertyName: "Package Name", dataType: "string" },
        { propertyName: "Vehicle type", dataType: "function" },
        { propertyName: "Distance (Km)", dataType: "string" },
        { propertyName: "Price (Rs.)", dataType: "string" },
        { propertyName: "Status", dataType: "function" }
    ];

    // property list eke property name and data type
    const propertyList = [
        { propertyName: "name", dataType: "string" },
        { propertyName: getVehicleType, dataType: "function" },
        { propertyName: "distance", dataType: "string" },
        { propertyName: "package_charge_cus", dataType: "string" },
        { propertyName: getPackageStatus, dataType: "function" }
    ];



    fillDataIntoPackageCard("package-container", packages, propertyList, propertyListName, editFunction);
}

// card ekata data fill karana function eka
const fillDataIntoPackageCard = (ParentId, packages, propertyList, propertyListName, editFunction) => {

    // get the package container from id
    let packageContainer = document.getElementById(ParentId);
    // clear the container
    packageContainer.innerHTML = "";

    // packages walin eka package ekak ekak create karanna
    packages.forEach((package) => {
        let card = document.createElement("div");
        card.classList.add("package-card", "mb-3", "me-3");
        card.style.display = "inline-block";
        card.style.width = "15.3rem";
        card.style.cursor = "pointer";


        // card eke body eka create karanawa
        let cardContent = `<div>`;

        propertyList.forEach((property, index) => {
            // function ekak nam property eka function ekakata yawanawa
            if (property.dataType === "function") {
                cardContent += `<p><strong>${propertyListName[index].propertyName} : </strong> ${property.propertyName(package)}</p>`;
            }
            // string ekak nam property eka string ekakata yawanawa
            if (property.dataType == "string") {
                if (propertyListName[index].propertyName == "Package Name") {
                    cardContent += `<h4 class="text-success"><strong> ${package[property.propertyName]} </strong> </h4>`;
                } else {
                    cardContent += `<p -text"><strong>${propertyListName[index].propertyName} : </strong> ${package[property.propertyName]}</p>`;
                }
            }
        });
        cardContent += `</div>`;

        // card eka click karala edit function eka call karannawa
        card.innerHTML = cardContent;
        card.onclick = () => {
            editFunction(package);
        };

        packageContainer.appendChild(card);
    });

};

// get vehicle type
const getVehicleType = (dataOb) => {
    return dataOb.vehicle_type_id.name;
}

// package eke status eka ganna function eka
const getPackageStatus = (dataOb) => {
    if (dataOb.package_status_id.status == "Active") {
        return "<span class='status-badge status-active'> <span class='dot'> </span>" + dataOb.package_status_id.status + "</span>";

    }
    if (dataOb.package_status_id.status == "Inactive") {
        return "<span class='status-badge status-pending'> <span class='dot'> </span>" + dataOb.package_status_id.status + "</span>";
    }
    if (dataOb.package_status_id.status == "Deleted") {
        return "<span class='status-badge status-inactive'> <span class='dot'> </span>" + dataOb.package_status_id.status + "</span>";
    }
}

// package name eka auto genearte karana function eka
const generatePackageName = () =>{

    const packageType = document.getElementById('packageType').value;
    const distance = document.getElementById('packageDistance').value;
    const packageNameInput = document.getElementById('textPackageName');

    if (packageType =='Fix Rate'){
        const packageName = packageType+ " - " + distance + " Km" ;
        packageNameInput.value = packageName;
        package.name = packageName;
    } else{
        packageNameInput.value = packageType;
        package.name = packageName;
    }
}

// package print  function
const packagePrinrt = (dataOb) => {

}

// package Delete function
const packageDelete = () => {
    console.log(package);

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
            let deleteResponse = httpServiceRequest("/package/delete", "DELETE", package);
            if (deleteResponse == "ok") {
                Swal.fire({
                    title: "Deleted!",
                    text: "Deleted Successfully",
                    icon: "success",
                    iconColor: "#d33",
                    timer: 1000,
                    showConfirmButton: false,
                    customClass :{
                        confirmButton :'btn-3d btn-3d-other'
                    }
                });
                loadPackageCards();
                refereshPackageForm();
                $("#packageFormModal").modal("hide");
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
        }
    });
}

// edit function of package form
const editFunction = (dataOb) => {

    packageType.value = dataOb.package_type;

    textPackageName.value = dataOb.name;

    packageDistance.value = dataOb.distance;

    packageCustomerCharge.value = dataOb.package_charge_cus;

    packageSupplierCharge.value = dataOb.package_charge_sup;

    packageAdditonalKmChargeCustomer.value = dataOb.additinal_km_charge_cus;

    packageAdditonalKmChargeSupplier.value = dataOb.additinal_km_charge_sup;

    selectPackageVehicleType.value = JSON.stringify(dataOb.vehicle_type_id);

    selectPackageStatus.value = JSON.stringify(dataOb.package_status_id);

    $('#packageFormModal').modal('show')

    deleteButton.style.display = "";
    printButton.style.display = "";

    updateButton.style.display = "";
    submitButton.style.display = "none";

    package = JSON.parse(JSON.stringify(dataOb));
    oldPackage = JSON.parse(JSON.stringify(dataOb));
}

// form errors check function
const checkFormError = () =>{
    let errors = "";

    if (package.name == null){
        errors = errors + "Please Enter the Package Name.....";
    }
    if (package.distance == null){
        errors = errors + "Please Enter Distance.....";
    }
    if (package.package_charge_cus == null){
        errors = errors + "Please Enter Package charge of customer.....";
    }
    if (package.package_charge_sup == null){
        errors = errors + "Please Enter  Package charge of supplier.....";
    }
    if (package.additinal_km_charge_cus == null){
        errors = errors + "Please Enter the Additional km charge of customer.....";
    }
    if (package.additinal_km_charge_sup == null){
        errors = errors + "Please Enter the Additional km charge of supplier.....";
    }
    if (package.vehicle_type_id == null){
        errors = errors + "Please Select the Vehicle type.....";
    }
    if (package.package_status_id == null){
        errors = errors + "Please Select the status.....";
    }
    return errors;
}

// package form submition
const packageFormSubmit = () =>{
    console.log(package);
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
                let postResponse = httpServiceRequest("/package/insert", "POST", package);
                if (postResponse == "ok") {
                    Swal.fire({
                        title: "Saved!",
                        text: "Saved Successfully",
                        icon: "success",
                        customClass :{
                            confirmButton :'btn-3d btn-3d-other'
                        }                    });
                    loadEmployeeTable();
                    refreshForm();
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
    console.log(package);
}

// package form update
const checkFormUpdates = () =>{
    let updates = "";

    if(package != null && oldPackage != null){
        if (package.name != oldPackage.name){
            updates = updates + "Package Name is changed";
        }
        if (package.distance != oldPackage.distance){
            updates = updates + "Package Name is changed";
        }
        if (package.package_charge_cus != oldPackage.package_charge_cus){
            updates = updates + "Package Name is changed";
        }
        if (package.package_charge_sup != oldPackage.package_charge_sup){
            updates = updates + "Package Name is changed";
        }
        if (package.additinal_km_charge_cus != oldPackage.additinal_km_charge_cus){
            updates = updates + "Package Name is changed";
        }
        if (package.additinal_km_charge_sup != oldPackage.additinal_km_charge_sup){
            updates = updates + "Package Name is changed";
        }
        if (package.vehicle_type_id.name != oldPackage.vehicle_type_id.name){
            updates = updates + "Package Name is changed";
        }
        if (package.package_status_id.status != oldPackage.package_status_id.status){
            updates = updates + "Package Name is changed";
        }

    }
    return updates;
}

// package form update
const  packageFormUpdate = () =>{
    console.log(package);
    console.log(oldPackage);
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
                    //call putt service
                    let putResponse = httpServiceRequest("/package/update", "PUT", package);;
                    if (putResponse == "ok") {
                        Swal.fire({
                            title: "Update!",
                            text: "Updated Successfully",
                            icon: "success",
                            customClass :{
                                confirmButton :'btn-3d btn-3d-other'
                            }                        });
                        loadPackageCards();
                        refereshPackageForm();
                        $("#packageFormModal").modal("hide");

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

// form Refresh function
const refereshPackageForm = () => {

    package = new Object();

    packageForm.reset();

     setDefault([packageType,textPackageName, packageDistance, packageCustomerCharge, packageSupplierCharge, packageAdditonalKmChargeCustomer, packageAdditonalKmChargeSupplier,selectPackageVehicleType,selectPackageStatus]);

    let vehicleTypes = getServiceRequest('/vehicletype/alldata');;
    dataFilIntoSelect(selectPackageVehicleType, "Select Vehicle Type", vehicleTypes, "name")

    let packageStatsus = getServiceRequest('/packagestatus/alldata');;
    dataFilIntoSelect(selectPackageStatus, "Select Status ", packageStatsus, "status")

    deleteButton.style.display = "none";
    printButton.style.display = "none";

    submitButton.style.display = "";
    updateButton.style.display = "none";


}

//Alert Box Call function
Swal.isVisible();