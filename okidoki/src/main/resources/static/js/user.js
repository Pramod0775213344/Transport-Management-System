// window load event
window.addEventListener('load', () => {

    loadUserTable();

    refreshUserForm();

});

// get the data from back end and view in front end
const loadUserTable = () => {

    let users = getServiceRequest("/user/alldata");

    const propertyList = [
        { propertyName: "user_photo", dataType: "image-array" },
        { propertyName: getEmployee, dataType: "function" },
        { propertyName: "username", dataType: "string" },
        { propertyName: "email", dataType: "string" },
        { propertyName: getRoles, dataType: "function" },
        { propertyName: getUserStatus, dataType: "function" }
    ];

    dataFillIntoTheTable(userTableBody, users, propertyList, userView, userEdit, userDelete, true);

    $("#userTable").dataTable({
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

}

// get employee data from backend to the table
const getEmployee = (dataOb) => {
    if (dataOb.employee_id != null) {
        return dataOb.employee_id.fullname;
    } else {
        return "-";
    }
};

// get roles data from backend tho the table
const getRoles = (dataOb) => {
    let roles = "";
    dataOb.roles.forEach((role) => {
        roles += role.name + " ";
    });
    return roles;
};

// get user status from backend to the table
const getUserStatus = (dataOb) => {
    if (dataOb.status) {
        return "<span class='status-badge status-active mt-2'>" + "Active" + "</span>"
    } else {
        return "<span class='status-badge status-inactive'> " + "Inactive" + "</span>"
    }
};

const userView = (dataOb) => { };

// user edit function
const userEdit = (dataOb) => {


    // okkoma aya refill karanna oni
    let employees = getServiceRequest("/employee/alldata");
    dataFilIntoSelect(selectEmployee, "Select Employee", employees, "fullname");
    selectEmployee.disabled = true;

    selectEmployee.value = JSON.stringify(dataOb.employee_id);

    textUserName.value = dataOb.username;

    textUserEmail.value = dataOb.email;

    textUserPassword.disabled = true;
    textUserRetypePassword.disabled = true;

    // user notes optional nisa check karanna
    if (dataOb.note = null || dataOb.note == undefined) {
        textUserNote.value = "";
    } else {
        textUserNote.value = dataOb.note;
    }

    // user status check box
    userStatusChkbox.checked = "checked";
    labelUserStatus.innerText = "User Account is active";
    if (dataOb.status) {
        userStatusChkbox.checked = "checked";
        labelUserStatus.innerText = "User Account is active";

    } else {
        userStatusChkbox.checked = "";
        labelUserStatus.innerText = "User Account is Inactive";
    }
    user.status = true;

    // roles generate karaanawa
    let roles = getServiceRequest("/role/alldatawithoutadmin");

    let divRoles = document.querySelector("#divRoles");
    divRoles.innerHTML = "";

    roles.forEach((role, index) => {
        let div = document.createElement("div");
        div.className = "form-check form-check-inline";


        let inputCheck = document.createElement("input");
        inputCheck.className = "form-check-input";
        inputCheck.type = "checkbox";
        inputCheck.id = role.id;

        inputCheck.onclick = () => {
            if (inputCheck.checked) {
                user.roles.push(role);
            } else {
                let extIndex = user.roles.map(userRole => userRole.name).indexOf(role.name);
                if (extIndex != -1) {
                    user.roles.splice(extIndex, 1);
                }
            }
        }

        // generate karan role walin user adala role tika check karala checck box eka true karanwa
        let extIndex = dataOb.roles.map(userRole => userRole.name).indexOf(role.name);
        if (extIndex != -1) {
            inputCheck.checked = true;
        }

        div.appendChild(inputCheck);

        let label = document.createElement("label");
        label.className = "form-check-label";
        label.innerText = role.name;
        div.appendChild(label);

        divRoles.appendChild(div);

    });


    user = JSON.parse(JSON.stringify(dataOb));
    oldUser = JSON.parse(JSON.stringify(dataOb));

    $("#userformModal").modal("show");

    updateButton.style.display = "";
    submitButton.style.display = "none";
};

// user Delete function
const userDelete = (dataOb) => {
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
            let deleteResponse = httpServiceRequest("/user/delete", "DELETE", dataOb);;
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
                loadUserTable();
                refreshUserForm();
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

// password validator for retype password
const retypePasswordValidator = () => {

    if (textUserPassword.value == textUserRetypePassword.value) {
        user.password = textUserPassword.value;
        textUserRetypePassword.classList.remove("is-invalid");
        textUserRetypePassword.classList.add("is-valid");

    } else {
        user.password = null;
        textUserRetypePassword.classList.remove("is-valid");
        textUserRetypePassword.classList.add("is-invalid");
    }
}

// user form error check function
const checkFormError = () => {

    let errors = "";

    if (user.username == null) {
        errors += "Please Enter the username......"
    }
    if (user.email == null) {
        errors += "Please Enter the Email......"
    }
    if (user.password == null) {
        errors += "Please Enter the password......"
    }
    if(oldUser == null){
        if (textUserRetypePassword.value == "") {
            errors += "Please retype the password......"
        }
    }

    if (user.roles.length == 0) {
        errors += "Please Enter the role......"
    }

    return errors;
}

// submit button of the user form
const userFormSubmit = () => {
    console.log(user);
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
                let postResponse = httpServiceRequest("/user/insert", "POST", user);
                console.log(user);

                if (postResponse == "ok") {
                    Swal.fire({
                        title: "Saved!",
                        text: "Saved Successfully",
                        icon: "success",
                        customClass :{
                            confirmButton :'btn-3d btn-3d-other'
                        }
                    });
                    loadUserTable();
                    refreshUserForm();
                    $("#user").modal("hide");
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
    console.log(user);
};

// check form updates
const checkFormUpdates = () => {
    let updates = "";

    if (user != null && oldUser != null) {
        if (user.username != oldUser.username) {
            updates = updates + "Username is changed";
        }
        if (user.email != oldUser.email) {
            updates = updates + "Email is changed";
        }
        if (user.note != oldUser.note) {
            updates = updates + "Note is changed";
        }
        if (user.status != oldUser.status) {
            updates = updates + "Status is changed";
        }
        if (user.roles.length != oldUser.roles.length) {
            updates = updates + "Roles are changed";
        }
    }
    return updates;
}

// update button of the user form
const userFormUpdate = () => {

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
                    let putResponse = httpServiceRequest("/user/update", "PUT", user);;
                    if (putResponse == "ok") {
                        Swal.fire({
                            title: "Update!",
                            text: "Updated Successfully",
                            icon: "success",
                            customClass :{
                                confirmButton :'btn-3d btn-3d-other'
                            }
                        });
                        loadUserTable();
                        refreshUserForm();
                        $("#userformModal").modal("hide");

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


// refresh user form
const refreshUserForm = () => {

    user = new Object();
    user.roles = new Array();
    userRegistrationForm.reset();
    // update eked reytpe password eke value eka nathi nisa error ekak enw.eka nawaththanna error check karanna kalin old user null da kiyala balanna oni.update eka wunata passe aye old user null wenna oni
    oldUser = null;

    let employees = getServiceRequest("/employee/alldatawithoutuseracconut");
    dataFilIntoSelect(selectEmployee, "Select Employee", employees, "fullname");

    userStatusChkbox.checked = "checked";
    labelUserStatus.innerText = "User Account is active";
    user.status = true;

    let roles = getServiceRequest("/role/alldatawithoutadmin");

    let divRoles = document.querySelector("#divRoles");
    divRoles.innerHTML = "";

    roles.forEach((role, index) => {
        let div = document.createElement("div");
        div.className = "form-check form-check-inline";


        let inputCheck = document.createElement("input");
        inputCheck.className = "form-check-input";
        inputCheck.type = "checkbox";

        inputCheck.onchange = () => {
            if (inputCheck.checked) {
                user.roles.push(role);
            } else {
                let extIndex = user.roles.map(userRole => userRole.name).indexOf(role.name);
                if (extIndex != -1) {
                    user.roles.splice(extIndex, 1);
                }
            }
        }
        div.appendChild(inputCheck);

        let label = document.createElement("label");
        label.className = "form-check-label";
        label.innerText = role.name;
        div.appendChild(label);

        divRoles.appendChild(div);

    });


    submitButton.style.display = "";
    updateButton.style.display = "none";

    selectEmployee.disabled = false;
    textUserPassword.disabled = false;
    textUserRetypePassword.disabled = false;

    setDefault([selectEmployee, textUserName, textUserEmail, textUserPassword, textUserRetypePassword, textUserNote]);

}


//Alert Box Call function
Swal.isVisible()
