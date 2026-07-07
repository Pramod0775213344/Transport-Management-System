
// window load event
window.addEventListener("load", () => {

    loadEmployeeTable();
    refreshForm();

});

// Get Table data from back end and transfer to front end
const loadEmployeeTable = () => {

    let employee = getServiceRequest('/employee/alldata');

    const propertyList = [
        { propertyName: getEmployeeNo, dataType: "function" },
        { propertyName: getEmployeeInfo, dataType: "function" },
        { propertyName: getDesignation, dataType: "function" },
        { propertyName: getDepartment, dataType: "function" },
        { propertyName: "mobileno", dataType: "string" },
        { propertyName: "nic", dataType: "string" },
        { propertyName: getStatus, dataType: "function" }
    ];

    dataFillIntoTheTable(employeeTableBody, employee, propertyList, employeeView, employeeEdit, employeeDelete, true);

    $("#employeeTable").dataTable({
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

const getEmployeeInfo = (dataOb) => {
    if (dataOb.emp_photo != null) {
        return ` <div class="row"><div class="col-2"><img src="${atob(dataOb.emp_photo)}" class="rounded-circle" style="width: 50px;height: 50px;"></div><div class="col-10"><span>${dataOb.fullname}</span><span><p class='text-muted mt-2' > ${dataOb.email}</p></span></div></div>`;
    } else {
        return ` <div class="row"><div class="col-2"><img src="images/user.png" class="rounded-circle" style="width: 50px;height: 50px;"></div><div class="col-10"><span>${dataOb.fullname}</span><span><p class='text-muted mt-2' > ${dataOb.email}</p></span></div></div>`;
    }
}
// get Employee  no
const getEmployeeNo = (dataOb) => {
    return "<span class ='unique_no'>" + dataOb.emp_no + "</span >";
}

// designation function
const getDesignation = (dataOb) => {
    return dataOb.designation_id.name;
};

// Department Function
const getDepartment = (dataOb) => {
    return dataOb.department_id.name;
};

// status Function
const getStatus = (dataOb) => {

    if (dataOb.employee_status_id.status == 'Confirm') {
        return "<span class='status-badge status-active mt-2'>" + dataOb.employee_status_id.status + "</span>"
    }
    if (dataOb.employee_status_id.status == 'Resign') {
        return "<span class='status-badge status-pending'>" + dataOb.employee_status_id.status + "</span>"
    }
    if (dataOb.employee_status_id.status == 'Deleted') {
        return "<span class='status-badge status-inactive'> " + dataOb.employee_status_id.status + "</span>"
    }

};

// Table Delete Button
const employeeDelete = (dataOb) => {
    console.log(dataOb);

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
            let deleteResponse = httpServiceRequest("/employee/delete", "DELETE", dataOb);
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
                loadEmployeeTable();
                refreshForm();
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

// Table View Button
const employeeView = (dataOb) => {
    console.log(dataOb);

    dataFullName.innerHTML = dataOb.fullname;
    dataCallingName.innerText = dataOb.callingname;
    dataAddress.innerText = dataOb.address;
    dataNic.innerText = dataOb.nic;
    dataCivilStatus.innerText = dataOb.civil_status;
    dataGender.innerText = dataOb.gender;
    dataDob.innerText = dataOb.dateofbirth;
    dataEmail.innerText = dataOb.email;
    dataMobileNo.innerText = dataOb.mobileno;
    // dataStatus.innerText = dataOb.status_id.status;

    picName.innerText = dataOb.fullname;

    titleName.innerText = dataOb.fullname;
    titleDesignation.innerText = dataOb.designation_id.name;
    titleDepartment.innerText = dataOb.department_id.name;

    cardDepartment.innerText = dataOb.department_id.name;
    cardDesignation.innerText = dataOb.designation_id.name;
    cardJoinDate.innerText = dataOb.join_date;

    $("#employeeView").modal("show");

};

// print Employee Details
const employeeFromPrint = () => {
    let newWindow = window.open();
    let printView = "<head></head> " + "<body></body>"
    newWindow.document.write(printView);

    setTimeout(() => {
        newWindow.stop();
        newWindow.print();
        newWindow.close();
    })
}

// Table edit button
const employeeEdit = (dataOb, index) => {
    console.log(dataOb);

    textEmployeeFullName.value = dataOb.fullname;

    const fullNameParts = textEmployeeFullName.value.split(" ");
    generateCallingName(dataOb.fullname, dataOb.callingname);

    textEmployeeAddress.value = dataOb.address;
    textEmployeeNic.value = dataOb.nic;
    selectCivilStatus.value = dataOb.civil_status;

    if (dataOb.gender == 'Male') {
        radioMale.checked = true;
    } else {
        radioFemale.checked = true;
    }

    if (dataOb.emp_photo != null){
        previewImage.src = atob(dataOb.emp_photo);
        photoPreview.style.display = 'block';
        uploadContainer.style.display = 'none';

    }else {
        photoPreview.style.display = 'none';
        uploadContainer.style.display = 'block';
    }
    textEmployeeEmail.value = dataOb.email;
    dteDOB.value = dataOb.dateofbirth;
    textEmployeeMobileNo.value = dataOb.mobileno;
    textJoinDate.value = dataOb.join_date;

    textEmployeeDesignation.value = JSON.stringify(dataOb.designation_id);

    textEmployeeDepartment.value = JSON.stringify(dataOb.department_id);

    textEmployeeStatus.value = JSON.stringify(dataOb.employee_status_id);

    updateButton.style.display = "";
    submitButton.style.display = "none";

    // edit ekedi witharak status eka pennanawa
    additionalInformation.style.display = "";

    $("#employee").modal("show");


    employee = JSON.parse(JSON.stringify(dataOb));
    oldEmployee = JSON.parse(JSON.stringify(dataOb));

    futuredateHide();

}

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
            employee.callingname = part;
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
textEmployeeFullName.addEventListener("keyup", () => {

    const fullNameValue = textEmployeeFullName.value;

    if (fullNameValue !== "") {
        if (new RegExp("^([A-Z][a-z]{1,20}[\\s])+([A-Z][a-z]{2,20})$").test(fullNameValue)) {

            employee.fullname = fullNameValue;
            textEmployeeFullName.classList.remove("is-invalid");
            textEmployeeFullName.classList.add("is-valid");

            let fullNameParts = fullNameValue.split(" ");

            generateCallingName(fullNameValue);


        } else {
            textEmployeeFullName.classList.remove("is-valid");
            textEmployeeFullName.classList.add("is-invalid");
            employee.fullname = null;
        }
    } else {
        if (textEmployeeFullName.required) {
            textEmployeeFullName.classList.remove("is-valid");
            textEmployeeFullName.classList.add("is-invalid");
            employee.fullname = null;
        } else {
            textEmployeeFullName.classList.remove("is-invalid");
            employee.fullname = null;
        }

    }
});

// // calling Name Validator
// const callingNameValidator = (callingNameElement) => {
//     const callingNameValue = callingNameElement.value;
//     const fullNameValue = textEmployeeFullName.value;
//     let fullNameParts = fullNameValue.split(" ");

//     if (fullNameValue !== "") {
//         let extIndex = fullNameParts.indexOf(callingNameValue);
//         if (extIndex !== -1) {
//             callingNameElement.classList.add("is-valid");
//             callingNameElement.classList.remove("is-invalid");
//             employee.callingname = textEmployeeCallingName.value;
//         } else {
//             callingNameElement.classList.remove("is-valid");
//             callingNameElement.classList.add("is-invalid");
//             employee.callingname = null;
//         }
//     } else {
//         callingNameElement.classList.remove("is-valid");
//         callingNameElement.classList.add("is-invalid");
//         employee.callingname = null;
//     }
// };

// form updates
const checkFormUpdates = () => {
    let updates = "";

    if (employee != null && oldEmployee != null) {

        if (employee.fullname != oldEmployee.fullname) {
            updates = updates + "Full Name Changed..!";
        }
        if (employee.callingname != oldEmployee.callingname) {
            updates = updates + " Calling Name Changed..!";
        }
        if (employee.address != oldEmployee.address) {
            updates = updates + "Address Changed..!";
        }
        if (employee.nic != oldEmployee.nic) {
            updates = updates + "Nic Changed..!";
        }
        if (employee.dateofbirth != oldEmployee.dateofbirth) {
            updates = updates + "Date of Birth Changed..!";
        }
        if (employee.civil_status != oldEmployee.civil_status) {
            updates = updates + "Civil Status Changed..!";
        }
        if (employee.gender != oldEmployee.gender) {
            updates = updates + "Gender Changed..!";
        }
        if (employee.email != oldEmployee.email) {
            updates = updates + "Email Changed..!";
        }
        if (employee.mobileno != oldEmployee.mobileno) {
            updates = updates + "Mobile No Changed..!";
        }
        if (employee.department_id.name != oldEmployee.department_id.name) {
            updates = updates + "Designation Changed..!";
        }
        if (employee.designation_id.name != oldEmployee.designation_id.name) {
            updates = updates + "Designation Changed..!";
        }
        if (employee.join_date != oldEmployee.join_date) {
            updates = updates + "Mobile No Changed..!";
        }
        if (employee.employee_status_id.status != oldEmployee.employee_status_id.status) {
            updates = updates + "Status Changed..!";
        }
        if (employee.emp_photo != oldEmployee.emp_photo) {
            updates = updates + "Employee Photo Changed..!";
        }
    }

    return updates;

}

// update button of the form
const employeeFormUpdate = () => {
    console.log(employee);
    console.log(oldEmployee);
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
                    let putResponse = httpServiceRequest("/employee/update", "PUT", employee);;
                    if (putResponse == "ok") {
                        Swal.fire({
                            title: "Update!",
                            text: "Updated Successfully",
                            icon: "success",
                            customClass :{
                                confirmButton :'btn-3d btn-3d-other'
                            }
                        });
                        loadEmployeeTable();
                        refreshForm();
                        $("#employee").modal("hide");

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

// check form error for required element
const checkFormError = () => {
    let errors = "";

    if (employee.fullname == null) {
        errors = errors + "Please Enter the Full Name.....";
    }
    if (employee.callingname == null) {
        errors = errors + "Please Select the Calling Name.....";
    }
    if (employee.address == null) {
        errors = errors + "Please Enter Address.....";
    }
    if (employee.nic == null) {
        errors = errors + "Please Enter Nic.....";
    }
    if (employee.dateofbirth == null) {
        errors = errors + "Please Select Date of Birth.....";
    }

    if (employee.civil_status == null) {
        errors = errors + "Please Select Civil Status.....";
    }
    if (employee.gender == null) {
        errors = errors + "Please Select Gender.....";
    }
    if (employee.email == null) {
        errors = errors + "Please Enter Email.....";
    }
    if (employee.mobileno == null) {
        errors = errors + "Please Enter Mobile No.....";
    }
    if (employee.department_id == null) {
        errors = errors + "Please Select Department.....";
    }
    if (employee.designation_id == null) {
        errors = errors + "Please Select Designation.....";
    }
    if (employee.join_date == null) {
        errors = errors + "Please Join Date.....";
    }
    // if (employee.employee_status_id == null) {
    //     errors = errors + "Please Select Status.....";
    // }
    return errors;
}

// submit button of the form
const employeeFormSubmit = () => {
    console.log(employee);
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
                let postResponse = httpServiceRequest("/employee/insert", "POST", employee);
                console.log(employee);

                if (postResponse == "ok") {
                    Swal.fire({
                        title: "Saved!",
                        text: "Saved Successfully",
                        icon: "success",
                        customClass :{
                            confirmButton :'btn-3d btn-3d-other'
                        }
                    });
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
    console.log(employee);

}

// refresh employee form 
const refreshForm = () => {
    employee = new Object();

    employeeRegistrationForm.reset();
    divParentRadio.innerHTML = "";


    setDefault([textEmployeeFullName, textEmployeeAddress, textEmployeeNic, selectCivilStatus, textEmployeeEmail, textEmployeeMobileNo, textEmployeeDesignation, textEmployeeStatus, dteDOB, textJoinDate, textEmployeeDepartment]);

    let designations = getServiceRequest('/designation/alldata');
    // delete status eka nathuwa data array eka gnnw
    let empStatus = getServiceRequest('/employeestatus/getstatuswithoutdelete');
    let departments = getServiceRequest('/department/alldata');

    dataFilIntoSelect(textEmployeeDesignation, "Select Designation", designations, "name");
    dataFilIntoSelect(textEmployeeStatus, "Select Status", empStatus, "status");
    dataFilIntoSelect(textEmployeeDepartment, "Select Department", departments, "name");

    submitButton.style.display = "";
    updateButton.style.display = "none";

    additionalInformation.style.display = "none";

    // future date eka hide karana function eka methana call karala thiyenw
    futuredateHide();

    // photo preview eka ayin karala uplod container eka load karanawa
    photoPreview.style.display = 'none';
    uploadContainer.style.display = 'block';

}

// ********************* future dates eka hide karana function eka ****************************
const futuredateHide = () => {
    // future date eka disbale karan function eka
    const joinDateInput = document.getElementById('textJoinDate');
    if (joinDateInput) {
        joinDateInput.setAttribute('type', 'date');
        joinDateInput.setAttribute('max', new Date().toISOString().split('T')[0]);
    } else {
        console.error("Join Date input element not found.");
    }
}

// *****************************Nic no eka anuwa geneder change wenawa**********************************************
const NicNumber = document.getElementById("textEmployeeNic");
NicNumber.addEventListener("keyup", () => {
    
    const radioMaleButton = document.getElementById("radioMale");
    const radioFemaleButton = document.getElementById("radioFemale");
    const nicValue = NicNumber.value; // Get the input value

    // new nic format(4 the chracter of the nic)
    if (nicValue.length === 12) {
        const genderNo = parseInt(nicValue.charAt(4));
        if (genderNo <= 5) {
            radioMaleButton.checked = true;
            employee.gender = radioMaleButton.value;
        } else if (genderNo > 5) {
            radioFemaleButton.checked = true;
            employee.gender =radioFemaleButton.value;
        }

    //     old nic format
    } else if (nicValue.length === 10) {
        const genderNoRange = parseInt(nicValue.substring(2,5));
        if(genderNoRange <= 500){
            radioMaleButton.checked = true;
            employee.gender = radioMaleButton.value;
        }else if(genderNoRange > 500){
            radioFemaleButton.checked = true;
            employee.gender =radioFemaleButton.value;
        }
    }
});

//Alert Box Call function
Swal.isVisible();