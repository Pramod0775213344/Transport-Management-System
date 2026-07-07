window.addEventListener("load", () => {
    // load weddi table eka load karanawa
    loadDriverTable();
    
    // load weddi form eka refresh karanwa
    refreshDriverForm();

});

// load the employee table
const loadDriverTable = () => {

    const drivers = getServiceRequest('/driver/alldata');

    const propertyList = [
        { propertyName: getDriverRegNo, dataType: "function" },
        { propertyName: getSupplier, dataType: "function" },
        { propertyName: "callingname", dataType: "string" },
        { propertyName: "driving_license_no", dataType: "string" },
        { propertyName: "mobileno", dataType: "string" },
        { propertyName: getDriverStatus, dataType: "function" },
    ];

    dataFillIntoTheTable(driverTableBody, drivers, propertyList, driverView,driverEdit,driverDelete, true);


    $("#driverTable").dataTable({
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

const getDriverRegNo = (dataOb) =>{

    return "<span class ='unique_no'>"+ dataOb.driver_reg_no +"</span >";
}

// get supplier name
const getSupplier = (dataOb) =>{
    if (dataOb.supplier_id != null) {
        return dataOb.supplier_id.transportname;
    } else {
        return "-";
    }
}

// get driver Status
const getDriverStatus = (dataOb) => {
    if (dataOb.driver_status_id.status == 'Active') {
        return "<span class='status-badge status-active'> <span class='dot'> </span>" + dataOb.driver_status_id.status + "</span>"
    }

    if (dataOb.driver_status_id.status == 'Inactive') {
        return "<span class='status-badge status-pending'> <span class='dot'> </span>" + dataOb.driver_status_id.status + "</span>"
    }
    if (dataOb.driver_status_id.status == 'Deleted') {
        return "<span class='status-badge status-inactive'> <span class='dot'> </span>" + dataOb.driver_status_id.status + "</span>"
    }
};

// define  driver details view
const driverView = (dataOb) => {
    viewDriverCallingName.innerText = dataOb.callingname;
    viewDriverRegNo.innerText = dataOb.driver_reg_no;
    viewDriverFullName.innerText = dataOb.fullname;
    viewTransportName.innerText = dataOb.supplier_id.transportname;
    viewNic.innerText = dataOb.nic;
    viewMobileNo.innerText = dataOb.mobileno;
    viewStatus.innerText = dataOb.driver_status_id.status;
    viewDrivingLicenseNo.innerText = dataOb.driving_license_no;
    viewExpireDate.innerText = dataOb.driving_license_expire_date;

    viewSupplierName.innerText = dataOb.supplier_id.fullname;
    viewSupplierAddress.innerText = dataOb.supplier_id.address;
    viewSupplierMobileNo.innerText = dataOb.supplier_id.mobileno;
    viewSupplierEmail.innerText = dataOb.supplier_id.email;
    $("#driverViewModal").modal('show');
}

// define driver edit function
const driverEdit = (dataOb) => {

    textTransportName.value = JSON.stringify(dataOb.supplier_id);
    textDriverFullName.value = dataOb.fullname;

    const fullNameParts = textDriverFullName.value.split(" ");
    generateCallingName(dataOb.fullname, dataOb.callingname);

    textDriverNic.value = dataOb.nic;

    textDrivingLicenseNo.value = dataOb.driving_license_no;

    textDrivingLicenseExpireDate.value = dataOb.driving_license_expire_date;

    textDriverEmail.value = dataOb.email;

    textDriverMobileNo.value = dataOb.mobileno;

    textDriverStatus.value = JSON.stringify(dataOb.driver_status_id);

    updateButton.style.display = "";
    submitButton.style.display = "none";

    $("#driverModal").modal("show");

    driver = JSON.parse(JSON.stringify(dataOb));
    oldDriver = JSON.parse(JSON.stringify(dataOb));
}

// tabel delete button
const driverDelete = (dataOb) => {
    console.log("Delete", dataOb);

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
            let deleteResponse = httpServiceRequest("/driver/delete", "DELETE", dataOb);;
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
                loadDriverTable();
                refreshDriverForm();
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
};

// generate calling name
const generateCallingName = (fullNameValue, selectedValue) => {

    let fullNameParts = fullNameValue.split(" ");
    divParentRadio.innerHTML = "";

    fullNameParts.forEach(part => {
        const div = document.createElement("div");
        div.className = "form-check form-check-inline";
        const input = document.createElement("input");
        input.className = "form-check-input";
        input.value = part;
        input.onchange = () => {
            driver.callingname = part;
        }
        input.name = "fullnameparts";
        input.type = "radio";
        const label = document.createElement("label");
        label.innerText = part;
        label.className = "form-check-label fw-bold text-muted";

        if (selectedValue != "" && selectedValue == part) {
            input.checked = "checked"
        }
        div.appendChild(input);
        div.appendChild(label);
        divParentRadio.appendChild(div);


    });
}

//full Name validator
textDriverFullName.addEventListener("keyup", () => {

    const fullNameValue = textDriverFullName.value;

    if (fullNameValue !== "") {
        if (new RegExp("^([A-Z][a-z]{1,20}[\\s])+([A-Z][a-z]{2,20})$").test(fullNameValue)) {

            driver.fullname = fullNameValue;
            textDriverFullName.classList.remove("is-invalid");
            textDriverFullName.classList.add("is-valid");

            let fullNameParts = fullNameValue.split(" ");

            generateCallingName(fullNameValue);


        } else {
            textDriverFullName.classList.remove("is-valid");
            textDriverFullName.classList.add("is-invalid");
            driver.fullname = null;
        }
    } else {
        if (textDriverFullName.required) {
            textDriverFullName.classList.remove("is-valid");
            textDriverFullName.classList.add("is-invalid");
            driver.fullname = null;
        } else {
            textDriverFullName.classList.remove("is-invalid");
            driver.fullname = null;
        }

    }
});

//define check error function
const checkFormError = () => {

    let errors = "";

    if (driver.supplier_id == null) {
        errors += "Transport Name Required...........";
    }
    if (driver.fullname == null) {
        errors += "Full Name Required...........";
    }
    if (driver.callingname == null) {
        errors += "Calling Name Required...........";
    }
    if (driver.nic == null) {
        errors += "NIC Required..........";
    }
    
    if (driver.driving_license_no == null) {
        errors += "Driving License No Required..........";
    }
    if (driver.driving_license_expire_date == null) {
        errors += "Driving License Expire Date Required..........";
    }

    if (driver.mobileno == null) {
        errors += "Mobile No Required............";
    }
    if (driver.driver_status_id == null) {
        errors += "Status Required...........";
    }

    return errors;
}

// define submite function
const driverFormSubmit = () => {

    console.log(driver);
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
                let postResponse = httpServiceRequest("/driver/insert", "POST", driver);;
                if (postResponse == "ok") {
                    Swal.fire({
                        title: "Saved!",
                        text: "Saved Successfully",
                        icon: "success",
                        customClass :{
                            confirmButton :'btn-3d btn-3d-other'
                        }
                    });
                    loadDriverTable();
                    refreshDriverForm();

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
            text: errors ,
            icon: 'error',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            customClass :{
                confirmButton :'btn-3d btn-3d-other'
            }
        });
    }
    console.log(driver);
};

// define check form update function
const checkFormUpdates = () => {

    let updates = "";

    if (driver != null && oldDriver != null) {

        if (driver.supplier_id.transportname != oldDriver.supplier_id.transportname) {
            updates += "Transport Name is changed.......";
        }
        if (driver.fullname != oldDriver.fullname) {
            updates += "Full Name is changed.......";
        }
        if (driver.callingname != oldDriver.callingname) {
            updates += "Calling Name is changed.......";
        }
        if (driver.nic != oldDriver.nic) {
            updates += "NIC is changed.......";
        }
        if (driver.driving_license_no != oldDriver.driving_license_no) {
            updates += "Driving License No is changed.......";
        }
        if (driver.driving_license_expire_date != oldDriver.driving_license_expire_date) {
            updates += "Driving License Expire Date is changed.......";
        }
        // if (driver.email != oldDriver.email) {
        //     updates += "Email : " + oldDriver.email + " to " + driver.email + "\n";
        // }
        if (driver.mobileno != oldDriver.mobileno) {
            updates += "Mobile No is changed.......";
        }
        if (driver.driver_status_id.status != oldDriver.driver_status_id.status) {
            updates += "Status is changed.......";
        }
    }

    return updates;

}

// define form update function
const driverFormUpdate = () => {
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
                confirmButtonColor: "#0ab315",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, Update it!",
                allowOutsideClick: false,
                customClass :{
                    cancelButton :'btn-3d btn-3d-cancel',
                    confirmButton :'btn-3d btn-3d-update'
                }
            }).then((userConfirm) => {
                if (userConfirm.isConfirmed) {
                    //call post service
                    let putResponse = httpServiceRequest("/driver/update", "PUT", driver);;
                    if (putResponse == "ok") {
                        Swal.fire({
                            title: "Update!",
                            text: "Updated Successfully",
                            icon: "success",
                            customClass :{
                                confirmButton :'btn-3d btn-3d-other'
                            }
                        });
                        loadDriverTable();
                        refreshDriverForm();
                        $("#driverModal").modal("hide");

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
};

// define refresh form function
const refreshDriverForm = () => {

    driver = new Object();

    // form reset
    driverRegistrationForm.reset();

    //form get intial color when refresh the form
    setDefault([textDriverFullName, textDriverNic, textDrivingLicenseNo, textDrivingLicenseExpireDate, textDriverEmail, textDriverMobileNo, textDriverStatus,textTransportName]);

    let transportName = getServiceRequest('/supplier/alldata');
    dataFilIntoSelect(textTransportName, "Select Supplier", transportName, "transportname");

    let driverStatus = getServiceRequest('/driverstatus/alldata');;
    dataFilIntoSelect(textDriverStatus, "Select Status", driverStatus, "status");


    // current date validate and previous date restrict
    currentdatevalidator('textDrivingLicenseExpireDate')

    submitButton.style.display = "";
    updateButton.style.display = "none";


};


//Alert Box Call function
Swal.isVisible();
