
window.addEventListener("load", () => {

    loadSupplierTable();

    refreshSupplierForm();   // Clear the form


});

// Get Table data from back end and transfer to front end
const loadSupplierTable = () => {
    const supplierIndividual = getServiceRequest("/supplier/individual");

    const propertyList = [
        { propertyName: "fullname", dataType: "string" },
        { propertyName: "driving_licence_no", dataType: "string" },
        { propertyName: "nic", dataType: "string" },
        { propertyName: "email", dataType: "string" },
        { propertyName: "mobileno", dataType: "string" },
        { propertyName: getDrivingStatus, dataType: "function" },
        { propertyName: getSupplierStatus, dataType: "function" }
    ];

    dataFillIntoTheTable(supplierTableBody, supplierIndividual, propertyList, supplierView, supplierEdit, supplierDelete, true);


    const supplierCompany = getServiceRequest("/supplier/company");

    const propertyLists = [
        { propertyName: "company_name", dataType: "string" },
        { propertyName: "company_reg_no", dataType: "string" },
        { propertyName: "company_email", dataType: "string" },
        { propertyName: "company_contact_no", dataType: "string" },
        { propertyName: getSupplierStatus, dataType: "function" }
    ];

    dataFillIntoTheTable(supplierTableBodyCompany, supplierCompany, propertyLists, supplierView, supplierEdit, supplierDelete, true);


    $("#supplierTable").dataTable({
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
    $("#supplierTableCompany").dataTable({
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

// driving status Function
const getDrivingStatus = (dataOb) => {
    if (dataOb.driving_status) {
        return "<span class='status-badge status-active fw-bold'>Yes</span>";
    } else {
        return "<span class='status-badge status-inactive fw-bold'>No</span>";
    }
}

// status Function
const getSupplierStatus = (dataOb) => {

    if (dataOb.supplier_status_id.status == 'Active') {
        return "<span class='status-badge status-active'>" + dataOb.supplier_status_id.status + "</span>"
    }
    if (dataOb.supplier_status_id.status == 'Inactive') {
        return "<span class='status-badge status-pending'>" + dataOb.supplier_status_id.status + "</span>"
    }
    if (dataOb.supplier_status_id.status == 'Delete') {
        return "<span class='status-badge status-inactive'> " + dataOb.supplier_status_id.status + "</span>"
    }
};

// Table View Button
const supplierView = (dataOb) => { }; //shoul be implement

const supplierEdit = (dataOb) => {

    console.log(dataOb);

    textSupplierFullName.value = dataOb.fullname;
    textSupplierCategory.disabled = true;
    // categeroy type eka anuwa changw wenna oni
    if (dataOb.category_type === "Individual") {
        textSupplierCategory.value = dataOb.category_type;
        individualSupplierDetails.style.display = "";
        companyDetails.style.display = "none";

        const fullNameParts = textSupplierFullName.value.split(" ");
        generateCallingName(dataOb.fullname, dataOb.callingname);

        textSupplierAddress.value = dataOb.address;
        textSupplierNic.value = dataOb.nic;
        textSupplierDrivingLicenseNo.value = dataOb.driving_licence_no;
        textSupplierDrivingLicenseExpireDate.value = dataOb.driving_licencen_expiredate;
        textSupplierEmail.value = dataOb.email;
        textSupplierMobileNo.value = dataOb.mobileno;

    }else if (dataOb.category_type === "Company") {
        textSupplierCategory.value = dataOb.category_type;
        individualSupplierDetails.style.display = "none";
        companyDetails.style.display = "";

        textSupplierCompanyName.value = dataOb.company_name;
        textSupplierCompanyRegNo.value = dataOb.company_reg_no;
        textSupplierCompanyAddress.value = dataOb.company_address;
        textSupplierCompanyEmail.value = dataOb.company_email;
        textSupplierCompanyContactNo.value = dataOb.company_contact_no;
        textSupplierContactPersonName.value = dataOb.company_contact_person;
        textSupplierContactPersonMobileNo.value = dataOb.company_contact_person_mobileno;
        textSupplierContactPersonEmail.value = dataOb.company_contact_person_email;

    }


    textSupplierAccountHolderName.value = dataOb.account_holder_name;
    textSupplierBankName.value = dataOb.bank_name;
    textSupplierBranchName.value = dataOb.branch_name;
    textSupplierAccountNo.value = dataOb.account_no;
    textTransportName.value = dataOb.transportname;
    textSupplierStatus.value = JSON.stringify(dataOb.supplier_status_id);

    updateButton.style.display = "";
    submitButton.style.display = "none";
    textSupplierStatusDiv.style.display = "";

    supplier = JSON.parse(JSON.stringify(dataOb));
    oldSupplier = JSON.parse(JSON.stringify(dataOb));

    $('#supplierForm').modal('show');



};

// Table Delete Button
const supplierDelete = (dataOb) => {

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
            let deleteResponse = httpServiceRequest("/supplier/delete", "DELETE", dataOb);
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
                loadSupplierTable();
                refreshSupplierForm();
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

// define function for get calling name
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
            supplier.callingname = part;
        }
        input.name = "fullnameparts";
        input.type = "radio";
        const label = document.createElement("label");
        label.innerText = part;
        label.className = "form-check-label fw-bold text-muted"

        if (selectedValue != "" && selectedValue == part) {
            input.checked = "checked"
        }
        div.appendChild(input);
        div.appendChild(label);
        divParentRadio.appendChild(div);


    });
}

// categeru eka select karaddi adala details view wenna oni
let textSupplierCategory = document.getElementById("textSupplierCategory");
textSupplierCategory.addEventListener("change", () => {

    let selectedCategory = textSupplierCategory.value;
    if (selectedCategory === "Company") {
        individualSupplierDetails.style.display = "none";
        companyDetails.style.display = "";
        setDefault([textSupplierFullName, textSupplierAddress, textSupplierNic, textSupplierDrivingLicenseNo, textSupplierDrivingLicenseExpireDate, textSupplierEmail, textSupplierMobileNo, textSupplierAccountHolderName, textSupplierBankName, textSupplierBranchName, textSupplierAccountNo, textSupplierStatus,textSupplierCompanyName,textSupplierCompanyRegNo,textSupplierCompanyAddress,textSupplierCompanyEmail,textSupplierCompanyContactNo,textSupplierContactPersonName,textSupplierContactPersonMobileNo,textSupplierContactPersonEmail]);
        // form reset without catiegary
        // Store the current category value
        let currentCategory = textSupplierCategory.value;
       // Reset the form
        supplierRegistrationForm.reset();
         // Restore the category value
        textSupplierCategory.value = currentCategory;

    }else if (selectedCategory === "Individual") {
        individualSupplierDetails.style.display = "";
        companyDetails.style.display = "none";
        setDefault([textSupplierFullName, textSupplierAddress, textSupplierNic, textSupplierDrivingLicenseNo, textSupplierDrivingLicenseExpireDate, textSupplierEmail, textSupplierMobileNo, textSupplierAccountHolderName, textSupplierBankName, textSupplierBranchName, textSupplierAccountNo, textSupplierStatus,textSupplierCompanyName,textSupplierCompanyRegNo,textSupplierCompanyAddress,textSupplierCompanyEmail,textSupplierCompanyContactNo,textSupplierContactPersonName,textSupplierContactPersonMobileNo,textSupplierContactPersonEmail]);
        let currentCategory = textSupplierCategory.value;
        // Reset the form
        supplierRegistrationForm.reset();
        // Restore the category value
        textSupplierCategory.value = currentCategory;
    }
});

//full name validator
textSupplierFullName.addEventListener("keyup", () => {

    const supplierFullNameValue = textSupplierFullName.value;
    if (supplierFullNameValue !== "") {
        if (new RegExp("^([A-Z][a-z]{1,20}[\\s])+([A-Z][a-z]{2,20})$").test(supplierFullNameValue)) {
            supplier.fullname = supplierFullNameValue;
            textSupplierFullName.classList.remove("is-invalid");
            textSupplierFullName.classList.add("is-valid");

            let supplierFullNameParts = supplierFullNameValue.split(" ");

            generateCallingName(supplierFullNameValue, supplier.callingname);

        } else {
            textSupplierFullName.classList.add("is-invalid");
            textSupplierFullName.classList.remove("is-valid");
            supplier.fullname = null;
        }
    } else {
        if (textSupplierFullName.required) {
            textSupplierFullName.classList.add("is-invalid");
            textSupplierFullName.classList.remove("is-valid");
            supplier.fullname = null;

        } else {
            textSupplierFullName.classList.remove("is-invalid");
            supplier.fullname = null;
        }
    }
});

// // calling name validater
// const callingNameValidator = (callingNameElement) => {
//     const supplierCallingNameValue = callingNameElement.value;
//     const supplierFullNameValue = textSupplierFullName.value;
//     let supplierFullNameParts = supplierFullNameValue.split(" ");

//     if (supplierCallingNameValue !== "") {
//         let extIndex = supplierFullNameParts.indexOf(supplierCallingNameValue);
//         if (extIndex != -1) {
//             callingNameElement.classList.add("is-valid");
//             callingNameElement.classList.remove("is-invalid");
//             supplier.callingname = textSupplierCallingName.value;
//         } else {
//             callingNameElement.classList.add("is-invalid");
//             callingNameElement.classList.remove("is-valid");
//             supplier.callingname = null;
//         }
//     } else {
//         callingNameElement.classList.add("is-invalid");
//         callingNameElement.classList.remove("is-valid");
//         supplier.callingname = null;
//     }

// }

// Chcek form errors
const checkFormError = () => {
    let errors = "";

    if (textSupplierCategory.value ==="Individual") {
        if (supplier.fullname == null) {
            errors += "Please Enter the Full Name......"
        }
        if (supplier.callingname == null) {
            errors += "Please Enter the Calling Name......"
        }
        if (supplier.address == null) {
            errors += "Please Enter the Address......"
        }
        if (supplier.nic == null) {
            errors += "Please Enter the NIC......"
        }
        if (supplier.email == null) {
            errors += "Please Enter the Email......"
        };
        if (supplier.mobileno == null) {
            errors += "Please Enter the Mobile No......"
        };
    }
    if (textSupplierCategory.value ==="Company") {
        if (supplier.company_name == null) {
            errors += "Please Enter the Company Name......"
        }
        if (supplier.company_reg_no == null) {
            errors += "Please Enter the Company Address......"
        }
        if (supplier.company_address == null) {
            errors += "Please Enter the Address......"
        }
        if (supplier.company_contact_person == null) {
            errors += "Please Enter the Contact Person Name......"
        }
        if (supplier.company_contact_person_email == null) {
            errors += "Please Enter the  Contact Person email......"
        }
        if (supplier.company_contact_person_mobileno == null) {
            errors += "Please Enter the Contact Person Mobile No......"
        }
        if (supplier.company_email == null) {
            errors += "Please Enter the Company Email......"
        }
        if (supplier.company_contact_no == null) {
            errors += "Please Enter the Company Mobile No......"
        }
    }
    // if (supplier.driving_licence_no == null) {
    //     errors += "Please Enter the Driving License No......"
    // };
    // if (supplier.driving_licencen_expiredate == null) {
    //     errors += "Please Enter the Driving License Expire Date......"
    // };

    if (supplier.account_holder_name == null) {
        errors += "Please Enter the Account Holder Name......"
    };
    if (supplier.bank_name == null) {
        errors += "Please Enter the Bank Name......"
    };
    if (supplier.branch_name == null) {
        errors += "Please Enter the Branch Name......"
    };
    if (supplier.account_no == null) {
        errors += "Please Enter the Account No......"
    };
    if (supplier.transportname == null) {
        errors += "Please Enter the Transport name........."
    }
    return errors;

}

// Supplier Form Submit
const supplierFormSubmit = () => {
    console.log(supplier);
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
                let postResponse = httpServiceRequest("/supplier/insert", "POST", supplier);
                console.log(supplier);

                if (postResponse == "ok") {
                    Swal.fire({
                        title: "Saved!",
                        text: "Saved Successfully",
                        icon: "success",
                        customClass :{
                            confirmButton :'btn-3d btn-3d-other'
                        }
                    });
                    loadSupplierTable();
                    refreshSupplierForm();

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
    console.log(supplier);
}

// check form updates
const checkFormUpdates = () => {

    let updates = "";

    if (supplier != null && oldSupplier != null) {
        if (supplier.fullname != oldSupplier.fullname) {
            updates += "Full Name is changed ";
        };

        if (supplier.callingname != oldSupplier.callingname) {
            updates += "Calling Name is changed ";
        };

        if (supplier.address != oldSupplier.address) {
            updates += "Address is changed ";
        };

        if (supplier.nic != oldSupplier.nic) {
            updates += "NIC is changed ";
        };

        if (supplier.driving_licence_no != oldSupplier.driving_licence_no) {
            updates += "Driving License No is changed ";
        };

        if (supplier.driving_licencen_expiredate != oldSupplier.driving_licencen_expiredate) {
            updates += "Driving License Expire Date is changed ";
        };

        if (supplier.email != oldSupplier.email) {
            updates += "Email is changed ";
        };

        if (supplier.mobileno != oldSupplier.mobileno) {
            updates += "Mobile No is changed ";
        };
        if (supplier.account_holder_name != oldSupplier.account_holder_name) {
            updates += "Account Holder Name is changed ";
        };

        if (supplier.bank_name != oldSupplier.bank_name) {
            updates += "Bank Name is changed ";
        };

        if (supplier.branch_name != oldSupplier.branch_name) {
            updates += "Branch Name is changed ";
        };

        if (supplier.account_no != oldSupplier.account_no) {
            updates += "Account No is changed ";
        };

        if (supplier.transportname != oldSupplier.transportname) {
            updates += "Transport Name is changed ";
            
        }
        if (supplier.supplier_status_id.status != oldSupplier.supplier_status_id.status) {
            updates += "Status is changed ";
        };

        if (supplier.driving_status != oldSupplier.driving_status) {
            updates += "Driving Status is changed ";
        };
        if (supplier.category != oldSupplier.category) {
            updates += "Category is changed ";
        };
        if (supplier.company_name != oldSupplier.company_name) {
            updates += "Company Name is changed ";
        };
        if (supplier.company_reg_no != oldSupplier.company_reg_no) {
            updates += "Company Reg No is changed ";
        };
        if (supplier.company_address != oldSupplier.company_address) {
            updates += "Company Address is changed ";
        };
        if (supplier.company_email != oldSupplier.company_email) {
            updates += "Company Email is changed ";
        };
        if (supplier.company_contact_no != oldSupplier.company_contact_no) {
            updates += "Company Contact No is changed ";
        };
        if (supplier.company_contact_person != oldSupplier.company_contact_person) {
            updates += "Company Contact Person is changed ";
        };
        if (supplier.company_contact_person_mobileno != oldSupplier.company_contact_person_mobileno) {
            updates += "Company Contact Person Mobile No is changed ";
        };
        if (supplier.company_contact_person_email != oldSupplier.company_contact_person_email) {
            updates += "Company Contact Person Email is changed ";
        };

    }
    return updates;
}

// supplier form update
const supplierFormUpdate = () => {
    console.log(supplier);
    console.log(oldSupplier);
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
                    let putResponse = httpServiceRequest("/supplier/update", "PUT", supplier);;
                    if (putResponse == "ok") {
                        Swal.fire({
                            title: "Update!",
                            text: "Updated Successfully",
                            icon: "success",
                            customClass :{
                                confirmButton :'btn-3d btn-3d-other'
                            }
                        });
                        loadSupplierTable();
                        refreshSupplierForm();
                        $("#supplierForm").modal("hide");

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

// refersh form function
const refreshSupplierForm = () => {


    supplier = new Object();

    supplierRegistrationForm.reset();
    divParentRadio.innerHTML = "";

    let supplierStatus = getServiceRequest('/supplierstatus/alldata');
    dataFilIntoSelect(textSupplierStatus, "Select Status", supplierStatus, "status")

    const drivingStatusChkbox = document.getElementById("drivingStatusChkbox");
    drivingStatusChkbox.checked = false;
    labelDrivingStatus.innerText = "No";
    supplier.driving_status = false;

    setDefault([textSupplierFullName, textSupplierAddress, textSupplierNic, textSupplierDrivingLicenseNo, textSupplierDrivingLicenseExpireDate, textSupplierEmail, textSupplierMobileNo, textSupplierAccountHolderName, textSupplierBankName, textSupplierBranchName, textSupplierAccountNo, textSupplierStatus,textSupplierCategory,textSupplierCompanyName,textSupplierCompanyRegNo,textSupplierCompanyAddress,textSupplierCompanyEmail,textSupplierCompanyContactNo,textSupplierContactPersonName,textSupplierContactPersonMobileNo,textSupplierContactPersonEmail]);

    submitButton.style.display = "";
    updateButton.style.display = "none";
    textSupplierStatusDiv.style.display = "none";
    textSupplierCategory.disabled = false;

    currentdatevalidator('textSupplierDrivingLicenseExpireDate')

    individualSupplierDetails.style.display = "none";
    companyDetails.style.display = "none";
}

//Alert Box Call function
Swal.isVisible();
