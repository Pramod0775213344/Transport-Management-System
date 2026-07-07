// window load event
window.addEventListener("load", () => {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      loadEmployeeTable();
      refreshForm();
    } catch (e) {
      console.error("Error during employee page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);
});

// Get Table data from back end and transfer to front end
const loadEmployeeTable = () => {
  // Destroy existing table if it exists
  if ($.fn.dataTable.isDataTable("#employeeTable")) {
    $("#employeeTable").DataTable().clear().destroy();
  }
  showTableLoading("employeeTable", true);

  let employee = getServiceRequest("/employee/alldata");

  const propertyList = [
    { propertyName: getEmployeeNo, dataType: "function" },
    { propertyName: getEmployeeInfo, dataType: "function" },
    { propertyName: getDesignation, dataType: "function" },
    { propertyName: getDepartment, dataType: "function" },
    { propertyName: "mobileno", dataType: "string" },
    { propertyName: "nic", dataType: "string" },
    { propertyName: getStatus, dataType: "function" },
  ];

  dataFillIntoTheTable(employeeTableBody, employee, propertyList, employeeView, employeeEdit, employeeDelete, true);

  showTableLoading("employeeTable", false);

  const table = $("#employeeTable").DataTable({
    dom: "rtip", // Hide default search and length
    pageLength: 10,
    createdRow: function (row, data, dataIndex) {
      $(row).find("td").addClass("align-middle text-center").css({
        height: "80px",
      });
    },
    headerCallback: function (thead, data, start, end, display) {
      $(thead).find("th").addClass("text-center").css({
        padding: "20px",
      });
    },
  });

  // Custom Search
  document.getElementById("tableSearch").addEventListener("input", function () {
    table.search(this.value).draw();
  });

  // Custom Length
  document.getElementById("tableLength").addEventListener("change", function () {
    table.page.len(parseInt(this.value)).draw();
  });

  applyPrivileges("Employee Management", "employeeTable", {
    add: addButton,
   
  });

  table.on("draw.dt", function () {
    applyPrivileges("Employee Management", "employeeTable", { add: addButton });
  });
};

const getEmployeeInfo = (dataOb) => {
  if (dataOb.emp_photo != null) {
    return ` <div class="row"><div class="col-5 text-end  "><img src="${atob(dataOb.emp_photo)}" class="rounded-circle" style="width: 50px;height: 50px;"></div><div class="col-7 text-start"><span>${dataOb.fullname}</span><span><p class='text-muted mt-2' > ${dataOb.email}</p></span></div></div>`;
  } else {
    return ` <div class="row"><div class="col-5 text-end"><img src="images/user.png" class="rounded-circle" style="width: 50px;height: 50px;"></div><div class="col-7 text-start"><span>${dataOb.fullname}</span><span><p class='text-muted mt-2' > ${dataOb.email}</p></span></div></div>`;
  }
};
// get Employee  no
const getEmployeeNo = (dataOb) => {
  return "<span class ='unique_no'>" + dataOb.emp_no + "</span >";
};

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
  const status = dataOb.employee_status_id.status;
  if (status == "Confirm" || status == "Active") {
    return `<span class='status-badge status-active'><span class='dot'></span>Confirm</span>`;
  }
  if (status == "Resign" || status == "Pending") {
    return `<span class='status-badge status-pending'><span class='dot'></span>Resign</span>`;
  }
  if (status == "Deleted" || status == "Inactive") {
    return `<span class='status-badge status-inactive'><span class='dot'></span>Deleted</span>`;
  }
  return `<span class='status-badge status-pending'><span class='dot'></span>${status}</span>`;
};

// Table Delete Button
const employeeDelete = (dataOb) => {
  console.log(dataOb);

  let userConfirm = Swal.fire({
    title: "Confirm Employee Deletion",
    text: "Are you sure you want to delete this employee record? This action cannot be undone!",
    icon: "warning",
    iconColor: "#ef4444",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete Employee",
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
      let deleteResponse = httpServiceRequest("/employee/delete", "DELETE", dataOb);
      if (deleteResponse == "ok") {
        Swal.fire({
          title: "Employee Deleted!",
          text: "The employee record has been successfully removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-border-radius",
          },
        });
        loadEmployeeTable();
        refreshForm();
      } else {
        Swal.fire({
          title: "Deletion Failed",
          text: deleteResponse,
          icon: "error",
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

// Table View Button
const employeeView = (dataOb) => {
  console.log(dataOb);

  // Set Photo
  if (dataOb.emp_photo != null) {
    viewEmpPhoto.src = atob(dataOb.emp_photo);
  } else {
    viewEmpPhoto.src = "/images/user.png";
  }

  // Basic Top Info
  viewEmpFullName.innerText = dataOb.fullname;
  viewEmpFullName2.innerText = dataOb.fullname;
  viewEmpDesignationTop.innerText = dataOb.designation_id.name;
  viewEmpIdCode.innerText = dataOb.emp_no || "N/A";
  viewEmpBranch.innerText = "Colombo Central Branch"; // Placeholder or from dataOb if available

  // Set Status
  const status = dataOb.employee_status_id.status;
  viewEmpStatusBadge.innerText = status;
  if (status == "Confirm" || status == "Active") {
    viewEmpStatusBadge.className = "status-label";
    viewEmpStatusDot.style.background = "#22c55e";
  } else {
    viewEmpStatusBadge.className = "status-label inactive";
    viewEmpStatusDot.style.background = "#ef4444";
  }

  // Personal Info Tab
  viewEmpDOB.innerText = dataOb.dateofbirth || "-";
  viewEmpGender.innerText = dataOb.gender || "-";
  viewEmpEmail.innerText = dataOb.email || "-";
  viewEmpMobile.innerText = dataOb.mobileno || "-";
  viewEmpAddress.innerText = dataOb.address || "-";

  // Employment Details Section
  viewEmpDept.innerText = dataOb.department_id.name || "-";
  viewEmpJoinDate.innerText = dataOb.join_date || "-";
  viewEmpManager.innerText = "Amara Perera"; // Default placeholder from design

  // Reset to personal tab
  switchProfileTab("personal");

  $("#employeeView").modal("show");
};

// Function for switching tabs in profile view
const switchProfileTab = (tabId) => {
  // Update Buttons
  const buttons = document.querySelectorAll(".profile-tab-btn");
  buttons.forEach((btn) => {
    if (btn.getAttribute("onclick").includes(tabId)) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Update Content
  const panes = document.querySelectorAll(".tab-pane-profile");
  panes.forEach((pane) => {
    if (pane.id === `tab-${tabId}`) {
      pane.classList.remove("d-none");
    } else {
      pane.classList.add("d-none");
    }
  });
};

// print Employee Details
const employeeFromPrint = () => {
  // Logic to print the employee profile
  window.print();
};

// Table edit button
const employeeEdit = (dataOb, index) => {
  console.log(dataOb);

  textEmployeeFullName.value = dataOb.fullname;

  const fullNameParts = textEmployeeFullName.value.split(" ");
  generateCallingName(dataOb.fullname, dataOb.callingname);

  textEmployeeAddress.value = dataOb.address;
  textEmployeeNic.value = dataOb.nic;
  selectCivilStatus.value = dataOb.civil_status;

  if (dataOb.gender == "Male") {
    radioMale.checked = true;
  } else {
    radioFemale.checked = true;
  }

  if (dataOb.emp_photo != null) {
    previewImage.src = atob(dataOb.emp_photo);
    photoPreview.style.display = "block";
    uploadContainer.style.display = "none";
  } else {
    photoPreview.style.display = "none";
    uploadContainer.style.display = "flex";
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

  document.getElementById("modalTitle").innerText = "Update Employee Details";
  document.getElementById("modalSubtitle").innerText = "Modify the existing employee details below.";
};

// define function for get calling name
const generateCallingName = (fullNameValue, selectedValue) => {
  let fullNameParts = fullNameValue.split(" ");
  divParentRadio.innerHTML = "";

  fullNameParts.forEach((part) => {
    const div = document.createElement("div");
    div.className = "form-check form-check-inline";
    const input = document.createElement("input");
    input.className = "form-check-input";
    input.value = part;
    input.onchange = () => {
      employee.callingname = part;
    };
    input.name = "fullnameparts";
    input.type = "radio";
    const label = document.createElement("label");
    label.innerText = part;
    label.className = "form-check-label fw-bold text-muted";

    if (selectedValue != "" && selectedValue == part) {
      input.checked = "checked";
    }
    div.appendChild(input);
    div.appendChild(label);
    divParentRadio.appendChild(div);
  });
};

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
      updates = updates + "Full Name updated. <br>";
    }
    if (employee.callingname != oldEmployee.callingname) {
      updates = updates + "Calling Name updated. <br>";
    }
    if (employee.address != oldEmployee.address) {
      updates = updates + "Address updated. <br>";
    }
    if (employee.nic != oldEmployee.nic) {
      updates = updates + "NIC updated. <br>";
    }
    if (employee.dateofbirth != oldEmployee.dateofbirth) {
      updates = updates + "Date of Birth updated. <br>";
    }
    if (employee.civil_status != oldEmployee.civil_status) {
      updates = updates + "Civil Status updated. <br>";
    }
    if (employee.gender != oldEmployee.gender) {
      updates = updates + "Gender updated. <br>";
    }
    if (employee.email != oldEmployee.email) {
      updates = updates + "Email updated. <br>";
    }
    if (employee.mobileno != oldEmployee.mobileno) {
      updates = updates + "Mobile Number updated. <br>";
    }
    if (employee.department_id.name != oldEmployee.department_id.name) {
      updates = updates + "Department updated. <br>";
    }
    if (employee.designation_id.name != oldEmployee.designation_id.name) {
      updates = updates + "Designation updated. <br>";
    }
    if (employee.join_date != oldEmployee.join_date) {
      updates = updates + "Join Date updated. <br>";
    }
    if (employee.employee_status_id.status != oldEmployee.employee_status_id.status) {
      updates = updates + "Status updated. <br>";
    }
    if (employee.emp_photo != oldEmployee.emp_photo) {
      updates = updates + "Employee Photo updated. <br>";
    }
  }

  return updates;
};

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
        title: "Nothing to Update",
        text: "No changes were detected in the employee details.",
        icon: "info",
        allowOutsideClick: false,
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    } else {
      let userConfirm = Swal.fire({
        title: "Confirm Employee Update",
        text: "Are you sure you want to update this employee's details?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Update Employee",
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
          let putResponse = httpServiceRequest("/employee/update", "PUT", employee);
          if (putResponse == "ok") {
            Swal.fire({
              title: "Employee Updated!",
              text: "The employee details have been successfully updated.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: "swal2-border-radius",
              },
            });
            loadEmployeeTable();
            refreshForm();
            $("#employee").modal("hide");
          } else {
            Swal.fire({
              title: "Update Failed",
              text: putResponse,
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
            text: "Details not Updated!",
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
      title: "Update Validation Error",
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

// check form error for required element
const checkFormError = () => {
  let errors = "";

  if (employee.fullname == null) {
    errors = errors + "Please enter the Full Name. <br>";
    textEmployeeFullName.classList.add("is-invalid");
  }
  if (employee.callingname == null) {
    errors = errors + "Please select the Calling Name. <br>";
  }
  if (employee.address == null) {
    errors = errors + "Please enter the Address. <br>";
    textEmployeeAddress.classList.add("is-invalid");
  }
  if (employee.nic == null) {
    errors = errors + "Please enter the NIC Number. <br>";
    textEmployeeNic.classList.add("is-invalid");
  }
  if (employee.dateofbirth == null) {
    errors = errors + "Please select the Date of Birth. <br>";
    dteDOB.classList.add("is-invalid");
  }
  if (employee.civil_status == null) {
    errors = errors + "Please select the Civil Status. <br>";
    selectCivilStatus.classList.add("is-invalid");
  }
  if (employee.gender == null) {
    errors = errors + "Please select the Gender. <br>";
  }
  if (employee.email == null) {
    errors = errors + "Please enter the Email Address. <br>";
    textEmployeeEmail.classList.add("is-invalid");
  }
  if (employee.mobileno == null) {
    errors = errors + "Please enter the Mobile Number. <br>";
    textEmployeeMobileNo.classList.add("is-invalid");
  }
  if (employee.department_id == null) {
    errors = errors + "Please select the Department. <br>";
    textEmployeeDepartment.classList.add("is-invalid");
  }
  if (employee.designation_id == null) {
    errors = errors + "Please select the Designation. <br>";
    textEmployeeDesignation.classList.add("is-invalid");
  }
  if (employee.join_date == null) {
    errors = errors + "Please select the Join Date. <br>";
    textJoinDate.classList.add("is-invalid");
  }
  return errors;
};

// submit button of the form
const employeeFormSubmit = () => {
  console.log(employee);
  // check form error for required element

  let errors = checkFormError();
  if (errors == "") {
    // errors not exit
    //need to get user confirmation

    let userConfirm = Swal.fire({
      title: "Confirm Employee Registration",
      text: "Are you sure you want to register this new employee?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Register Employee",
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
        let postResponse = httpServiceRequest("/employee/insert", "POST", employee);
        console.log(employee);

        if (postResponse == "ok") {
          Swal.fire({
            title: "Employee Registered!",
            text: "New employee record has been successfully created.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          loadEmployeeTable();
          refreshForm();
          $("#employee").modal("hide");
        } else {
          Swal.fire({
            title: "Registration Failed",
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
          text: "Details not Saved!",
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
      title: "Registration Incomplete",
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
  console.log(employee);
};

// refresh employee form
const refreshForm = () => {
  employee = new Object();

  employeeRegistrationForm.reset();
  divParentRadio.innerHTML = "";

  setDefault([
    textEmployeeFullName,
    textEmployeeAddress,
    textEmployeeNic,
    selectCivilStatus,
    textEmployeeEmail,
    textEmployeeMobileNo,
    textEmployeeDesignation,
    textEmployeeStatus,
    dteDOB,
    textJoinDate,
    textEmployeeDepartment,
  ]);

  let designations = getServiceRequest("/designation/alldata");
  // delete status eka nathuwa data array eka gnnw
  let empStatus = getServiceRequest("/employeestatus/getstatuswithoutdelete");
  let departments = getServiceRequest("/department/alldata");

  dataFilIntoSelect(textEmployeeDesignation, "Select Designation", designations, "name");
  dataFilIntoSelect(textEmployeeStatus, "Select Status", empStatus, "status");
  dataFilIntoSelect(textEmployeeDepartment, "Select Department", departments, "name");

  submitButton.style.display = "";
  updateButton.style.display = "none";

  additionalInformation.style.display = "none";

  // future date eka hide karana function eka methana call karala thiyenw
  futuredateHide();

  // photo preview eka ayin karala uplod container eka load karanawa
  photoPreview.style.display = "none";
  uploadContainer.style.display = "flex";
  document.getElementById("modalTitle").innerText = "Create New Employee";
  document.getElementById("modalSubtitle").innerText = "Complete the form below to register a new staff member.";
};

// ********************* future dates eka hide karana function eka ****************************
const futuredateHide = () => {
  // future date eka disbale karan function eka
  const joinDateInput = document.getElementById("textJoinDate");
  if (joinDateInput) {
    joinDateInput.setAttribute("type", "date");
    joinDateInput.setAttribute("max", new Date().toISOString().split("T")[0]);
  } else {
    console.error("Join Date input element not found.");
  }
};

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
      employee.gender = radioFemaleButton.value;
    }

    //     old nic format
  } else if (nicValue.length === 10) {
    const genderNoRange = parseInt(nicValue.substring(2, 5));
    if (genderNoRange <= 500) {
      radioMaleButton.checked = true;
      employee.gender = radioMaleButton.value;
    } else if (genderNoRange > 500) {
      radioFemaleButton.checked = true;
      employee.gender = radioFemaleButton.value;
    }
  }
});

// showTableLoading function eka
const showTableLoading = (tableId, show) => {
  const tableContainer = document.getElementById(tableId).closest(".table-responsive");
  const overlay = tableContainer.querySelector(".table-loading-overlay");
  if (overlay) {
    if (show) {
      overlay.removeAttribute("hidden");
      overlay.style.display = "flex";
    } else {
      overlay.style.display = "none";
    }
  }
};
// remove photo function
const removeProfilePhoto = () => {
  employee.emp_photo = null;
  filePhotoEmployee.value = null;
  photoPreview.style.display = "none";
  uploadContainer.style.display = "flex";
};

// Export Functionality
const exportTable = (type) => {
  const tableSelector = "#employeeTable";

  if (type === "excel") {
    exportTableToExcelWithSheetJS(tableSelector, "employees", {
      sheetName: "Employees",
    });
  } else if (type === "pdf") {
    exportTableToPdfWithJsPdf(tableSelector, "employees", {
      title: "Employees",
    });
  }
};
