// window load event
window.addEventListener("load", () => {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      loadUserTable();
      refreshUserForm();
    } catch (e) {
      console.error("Error during user page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);
});

// get the data from back end and view in front end
const loadUserTable = () => {
  let users = getServiceRequest("/user/alldata");

  const propertyList = [
    { propertyName: "user_photo", dataType: "image-array" },
    { propertyName: getEmployeeOrDriver, dataType: "function" },
    { propertyName: "username", dataType: "string" },
    { propertyName: "email", dataType: "string" },
    { propertyName: getRoles, dataType: "function" },
    { propertyName: getUserStatus, dataType: "function" },
  ];

  dataFillIntoTheTable(userTableBody, users, propertyList, userView, userEdit, userDelete, true);

  if ($.fn.dataTable.isDataTable("#userTable")) {
    $("#userTable").DataTable().clear().destroy();
  }

  const table = $("#userTable").DataTable({
    dom: "rtip", // Hide default search and length
    pageLength: 10,
    createdRow: function (row, data, dataIndex) {
      $(row).find("td").css({
        "text-align": "left",
        height: "80px",
      });
    },
    headerCallback: function (thead, data, start, end, display) {
      $(thead).find("th").css({
        "text-align": "left",
        padding: "20px",
      });
    },
  });

  // Custom Search
  $("#tableSearch").on("keyup", function () {
    table.search(this.value).draw();
  });

  // Custom Length
  $("#tableLength").on("change", function () {
    table.page.len($(this).val()).draw();
  });

  applyPrivileges("User Management", "userTable", {
    add: addButton,
    update: updateButton,
    submit: submitButton,
  });

  table.on("draw.dt", function () {
    applyPrivileges("User Management", "userTable", {
      add: addButton,
      update: updateButton,
      submit: submitButton,
    });
  });
};

// get employee data from backend to the table
const getEmployeeOrDriver = (dataOb) => {
  if (dataOb.employee_id != null) {
    return dataOb.employee_id.fullname;
  } else if (dataOb.driver_id != null) {
    return dataOb.driver_id.fullname;
  } else if (dataOb.customer_id != null) {
    return dataOb.customer_id.compnay_name;
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
    return "<span class='status-badge status-active mt-2'>" + "Active" + "</span>";
  } else {
    return "<span class='status-badge status-inactive'> " + "Inactive" + "</span>";
  }
};

const userView = (dataOb) => {
  // Set User Photo
  if (dataOb.user_photo != null) {
    viewUserPhoto.src = atob(dataOb.user_photo);
  } else {
    viewUserPhoto.src = "images/user.png";
  }

  // Set Default Values
  let fullName = "-";
  let idCode = "N/A";
  let mobile = "-";
  let department = "General";
  let joinedDate = "-";
  let manager = "Saman Kumara"; // Default placeholder as seen in design
  let roles = dataOb.roles.map((r) => r.name).join(", ");

  if (dataOb.employee_id != null) {
    fullName = dataOb.employee_id.fullname;
    idCode = dataOb.employee_id.emp_no || "N/A";
    mobile = dataOb.employee_id.mobileno || "-";
    department = dataOb.employee_id.department_id ? dataOb.employee_id.department_id.name : "N/A";
    joinedDate = dataOb.employee_id.join_date || "-";
  } else if (dataOb.driver_id != null) {
    fullName = dataOb.driver_id.fullname;
    idCode = dataOb.driver_id.driver_no || "N/A";
    mobile = dataOb.driver_id.mobileno || "-";
    department = "Fleet Operations";
    joinedDate = dataOb.driver_id.join_date || "-";
  }

  // Update UI Elements
  viewUserName.innerText = fullName;
  viewEmployeeId.innerText = idCode;
  viewUserEmail.innerText = dataOb.email;
  viewUserPhone.innerText = mobile;

  // Dynamically generate individual cards for each role
  viewUserRolesContainer.innerHTML = "";
  dataOb.roles.forEach((role) => {
    let roleCard = document.createElement("div");
    roleCard.className = "role-content-card";

    let iconClass = "fa-user-gear";
    let desc = "Standard user access permissions.";

    if (role.name === "Admin") {
      iconClass = "fa-user-shield";
      desc = "Full administrative access to all system modules and settings.";
    } else if (role.name === "Manager" || role.name.includes("Manager")) {
      iconClass = "fa-user-tie";
      desc = "Management access to shipment, fleet, and employee records.";
    } else if (role.name === "Driver") {
      iconClass = "fa-truck-fast";
      desc = "Access to personal delivery schedules and vehicle assignments.";
    } else if (dataOb.note) {
      desc = dataOb.note;
    }

    roleCard.innerHTML = `
        <div class="role-icon-bg">
            <i class="fa-solid ${iconClass}"></i>
        </div>
        <div class="role-info">
            <h4>${role.name}</h4>
            <p>${desc}</p>
        </div>
    `;
    viewUserRolesContainer.appendChild(roleCard);
  });

  viewUserDept.innerText = department;
  viewUserJoinedDate.innerText = joinedDate;
  viewUserManager.innerText = manager;

  // Set Status Badge & Indicator
  if (dataOb.status) {
    viewUserStatusBadge.innerText = "Active";
    viewUserStatusBadge.className = "view-status-badge badge-active";
    viewUserStatusIndicator.style.background = "#22c55e";
  } else {
    viewUserStatusBadge.innerText = "Inactive";
    viewUserStatusBadge.className = "view-status-badge badge-inactive";
    viewUserStatusIndicator.style.background = "#ef4444";
  }

  $("#userViewModal").modal("show");
};

// user edit function
const userEdit = (dataOb) => {

  userCategoryDiv.style.display = "none";
  // alldata gaththe naththan refil wela show wenne na
  let employees = getServiceRequest("/employee/alldata");
  dataFilIntoSelect(selectEmployee, "Select Employee", employees, "fullname");

  let customer = getServiceRequest("customer/alldata");
  dataFilIntoSelect(selectCustomer, "Select Customer", customer, "company_name");

  let drivers = getServiceRequest("/driver/alldata");
  dataFilIntoSelect(selectDriver, "Select Driver", drivers, "fullname");
  selectEmployee.disabled = true;
  selectCustomer.disabled = true;
  selectDriver.disabled = true;

  if (dataOb.employee_id != null) {
    radioEmployee.checked = true;
    changeUserType("Employee");
  } else if (dataOb.driver_id != null) {
    radioDriver.checked = true;
    changeUserType("Driver");
  } else if (dataOb.customer_id != null) {
    radioCustomer.checked = true;
    changeUserType("Customer");
  }
  if (dataOb.user_photo != null) {
    previewImage.src = atob(dataOb.user_photo);
    photoPreview.style.display = "block";
    uploadContainer.style.display = "none";
  } else {
    photoPreview.style.display = "none";
    uploadContainer.style.display = "flex";
  }
  selectEmployee.value = JSON.stringify(dataOb.employee_id);
  selectDriver.value = JSON.stringify(dataOb.driver_id);
  selectCustomer.value = JSON.stringify(dataOb.customer_id);
  textUserName.value = dataOb.username;

  textUserEmail.value = dataOb.email;

  textUserPassword.disabled = true;
  textUserRetypePassword.disabled = true;

  // user notes optional nisa check karanna
  if ((dataOb.note = null || dataOb.note == undefined)) {
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

  let divRoles = document.querySelector("#divRoles");
  divRoles.innerHTML = "";

  roles.forEach((role, index) => {
    let div = document.createElement("div");
    div.className = "form-check form-check-inline";

    let inputCheck = document.createElement("input");
    inputCheck.className = "form-check-input";
    inputCheck.type = "checkbox";
    inputCheck.id = role.id;

    // user categeri eka anuwa select karanwa role set eka
    if (radioEmployee.checked && role.name === "Driver") {
      inputCheck.disabled = true;
    } else if (radioDriver.checked && role.name !== "Driver") {
      inputCheck.disabled = true;
    } else if (radioCustomer.checked && role.name !== "Customer") {
      inputCheck.disabled = true;
    }
    inputCheck.onclick = () => {
      if (inputCheck.checked) {
        user.roles.push(role);
      } else {
        let extIndex = user.roles.map((userRole) => userRole.name).indexOf(role.name);
        if (extIndex != -1) {
          user.roles.splice(extIndex, 1);
        }
      }
    };

    // generate karan role walin user adala role tika check karala check box eka true karanwa
    let extIndex = dataOb.roles.map((userRole) => userRole.name).indexOf(role.name);
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
    title: "Confirm User Deletion",
    text: "Are you sure you want to delete this user? This action cannot be undone!",
    icon: "warning",
    iconColor: "#ef4444",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete User",
    cancelButtonText: "No, Keep it",
    allowOutsideClick: false,
    customClass: {
      cancelButton: "btn btn-1",
      confirmButton: "btn btn-4",
      popup: "swal2-border-radius",
    },
  }).then((userConfirm) => {
    if (userConfirm.isConfirmed) {
      //call post service
      let deleteResponse = httpServiceRequest("/user/delete", "DELETE", dataOb);
      if (deleteResponse == "ok") {
        Swal.fire({
          title: "User Deleted!",
          text: "The user has been successfully removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-border-radius",
          },
        });
        loadUserTable();
        refreshUserForm();
      } else {
        Swal.fire({
          title: "Failed to Submit....?",
          text: deleteResponse,
          icon: "question",
          allowOutsideClick: false,
          customClass: {
            confirmButton: "btn btn-1",
            popup: "swal2-border-radius",
          },
        });
      }
    } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: "Cancelled",
        text: "Details not Deleted!",
        icon: "error",
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    }
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
};

// user form error check function
const checkFormError = () => {
  let errors = "";

  if (user.username == null) {
    errors += "Please Enter the username <br>";
    textUserName.classList.add("is-invalid");
  }
  if (user.email == null) {
    errors += "Please Enter the Email <br>";
    textUserEmail.classList.add("is-invalid");
  }
  if (user.password == null) {
    errors += "Please Enter the password <br>";
    textUserPassword.classList.add("is-invalid");
  }
  if (oldUser == null) {
    if (textUserRetypePassword.value == "") {
      errors += "Please retype the password <br>";
      textUserRetypePassword.classList.add("is-invalid");
    }
  }

  if (user.roles.length == 0) {
    errors += "Please Enter the role <br>";
  }

  return errors;
};

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
      title: "Confirm User Creation",
      text: "Are you sure you want to create this new user account?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Create User",
      cancelButtonText: "Cancel",
      allowOutsideClick: false,
      customClass: {
        cancelButton: "btn btn-1",
        confirmButton: "btn btn-2",
        popup: "swal2-border-radius",
      },
    }).then((userConfirm) => {
      if (userConfirm.isConfirmed) {
        //call post service
        let postResponse = httpServiceRequest("/user/insert", "POST", user);
        console.log(user);

        if (postResponse == "ok") {
          Swal.fire({
            title: "User Created!",
            text: "The new user account has been successfully created.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          loadUserTable();
          refreshUserForm();
          $("#userformModal").modal("hide");
        } else {
          Swal.fire({
            title: "Failed to Create...?",
            text: postResponse,
            icon: "question",
            customClass: {
              confirmButton: "btn btn-1",
              popup: "swal2-border-radius",
            },
          });
        }
      } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: "Cancelled",
          text: "User creation process cancelled!",
          icon: "error",
          customClass: {
            confirmButton: "btn btn-1",
            popup: "swal2-border-radius",
          },
        });
      }
    });
  } else {
    Swal.fire({
      title: "Incomplete Data",
      html: `<div class="text-start">${errors.replace(/\n/g, "<br>")}</div>`,
      icon: "error",
      confirmButtonText: "OK",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
  }
  console.log(user);
};

// check form updates
const checkFormUpdates = () => {
  let updates = "";

  if (user != null && oldUser != null) {
    if (user.user_photo != oldUser.user_photo) {
      updates = updates + "User Photo is changed";
    }
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
};

// update button of the user form
const userFormUpdate = () => {
  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    let updates = checkFormUpdates();
    // updates not exit
    if (updates == "") {
      Swal.fire({
        title: "Nothing to Update",
        text: "No changes were detected in the user details.",
        icon: "info",
        allowOutsideClick: false,
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    } else {
      let userConfirm = Swal.fire({
        title: "Confirm User Update",
        text: "Are you sure you want to update this user's details?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Update User",
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
          let putResponse = httpServiceRequest("/user/update", "PUT", user);
          if (putResponse == "ok") {
            Swal.fire({
              title: "User Updated!",
              text: "The user details have been successfully updated.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: "swal2-border-radius",
              },
            });
            $("#userformModal").modal("hide");
            refreshUserForm();
          } else {
            Swal.fire({
              title: "Failed to Update...?",
              text: putResponse,
              icon: "question",
              customClass: {
                confirmButton: "btn btn-1",
                popup: "swal2-border-radius",
              },
            });
          }
        } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: "Cancelled",
            text: "User update process cancelled!",
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
  } else {
    Swal.fire({
      title: "Update Incomplete",
      html: `<div class="text-start">${errors.replace(/\n/g, "<br>")}</div>`,
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

let roles = [];

// refresh user form
const refreshUserForm = () => {
  user = new Object();
  user.roles = new Array();
  userRegistrationForm.reset();
  // update eked reytpe password eke value eka nathi nisa error ekak enw.eka nawaththanna error check karanna kalin old user null da kiyala balanna oni.update eka wunata passe aye old user null wenna oni
  oldUser = null;
  userCategoryDiv.style.display = "";
  let employees = getServiceRequest("/employee/alldatawithoutuseracconut");
  dataFilIntoSelect(selectEmployee, "Select Employee", employees, "fullname");

  let drivers = getServiceRequest("/driver/alldatawithoutuseracconut");
  dataFilIntoSelect(selectDriver, "Select Driver", drivers, "fullname");

  let customers = getServiceRequest("/customer/alldata");
  dataFilIntoSelect(selectCustomer, "Select Customer", customers, "company_name");

  userStatusChkbox.checked = "checked";
  labelUserStatus.innerText = "User Account is active";
  user.status = true;

  roles = getServiceRequest("/role/alldatawithoutadmin");

  let divRoles = document.querySelector("#divRoles");
  divRoles.innerHTML = "";

  roles.forEach((role, index) => {
    let div = document.createElement("div");
    div.className = "form-check form-check-inline";

    let inputCheck = document.createElement("input");
    inputCheck.className = "form-check-input";
    inputCheck.type = "checkbox";
    inputCheck.value = role.name;

    inputCheck.onchange = () => {
      if (inputCheck.checked) {
        user.roles.push(role);
      } else {
        let extIndex = user.roles.map((userRole) => userRole.name).indexOf(role.name);
        if (extIndex != -1) {
          user.roles.splice(extIndex, 1);
        }
      }
    };
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
  selectDriver.disabled = false;

  radioEmployee.checked = true;
  changeUserType("Employee");

  setDefault([selectEmployee, textUserName, textUserEmail, textUserPassword, textUserRetypePassword, textUserNote]);
};

// user select karana type eka anuwa check box tika tik karanwa
const changeUserType = (type) => {
  const roleCheckboxes = document.querySelectorAll("#divRoles .form-check-input");

  // user roles tika clear karanwa
  user.roles = [];

  if (type === "Employee") {
    divSelectEmployee.style.display = "";
    divSelectDriver.style.display = "none";
    divSelectCustomer.style.display = "none";
    selectDriver.value = "";
    selectCustomer.value = "";

    roleCheckboxes.forEach((cb) => {
      const roleName = cb.nextSibling.innerText; // Label eke nama gnnawa
      if (roleName === "Driver") {
        cb.checked = false;
        cb.disabled = true;
      } else {
        cb.disabled = false;
      }
    });
  } else if (type === "Driver") {
    divSelectDriver.style.display = "";
    divSelectCustomer.style.display = "none";
    divSelectEmployee.style.display = "none";
    selectEmployee.value = "";
    selectCustomer.value = "";

    roleCheckboxes.forEach((cb) => {
      const roleName = cb.nextSibling.innerText;
      if (roleName === "Driver") {
        cb.disabled = false;
        cb.checked = true;

        const driverRole = roles.find((role) => role.name === "Driver");
        if (driverRole) {
          user.roles.push(driverRole);
        }
      } else {
        cb.checked = false;
        cb.disabled = true;
      }
    });
  } else if (type === "Customer") {
    divSelectCustomer.style.display = "";
    divSelectEmployee.style.display = "none";
    divSelectDriver.style.display = "none";
    selectEmployee.value = "";
    selectDriver.value = "";

    roleCheckboxes.forEach((cb) => {
      const roleName = cb.nextSibling.innerText;
      if (roleName === "Customer") {
        cb.disabled = false;
        cb.checked = true;

        const customerRole = roles.find((role) => role.name === "Customer");
        if (customerRole) {
          user.roles.push(customerRole);
        }
      } else {
        cb.checked = false;
        cb.disabled = true;
      }
    });
  }
};

// remove photo function
const removeProfilePhoto = () => {
  user.user_photo = null;
  filePhotoEmployee.value = null;
  photoPreview.style.display = "none";
  uploadContainer.style.display = "flex";
};

//Alert Box Call function
Swal.isVisible();

// Export Functionality
const exportTable = (type) => {
  const tableSelector = "#userTable";

  if (type === "excel") {
    exportTableToExcelWithSheetJS(tableSelector, "users", {
      sheetName: "Users",
    });
  } else if (type === "pdf") {
    exportTableToPdfWithJsPdf(tableSelector, "users", {
      title: "Users",
    });
  }
};

const userFromPrint = () => {
  window.print();
};
