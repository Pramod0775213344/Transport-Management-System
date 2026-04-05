window.addEventListener("load", () => {
  loadPrivilageTable();
  refreshForm();
  roleCard(editFunction);
});

// create role list card with total amount users
const roleCard = (editFunction) => {
  let roleList = getServiceRequest("/role/alldatawithoutadmin");
  console.log(roleList);
  let cardContainer = document.getElementById("roleListContainer");
  cardContainer.innerHTML = "";

  roleList.forEach((role) => {
    console.log(role);

    let userList = getServiceRequest("user/byrole?roleid=" + role.id);
    let card = document.createElement("div");
    card.classList.add("role-card");
    console.log(userList);

    let limit = 4;
    let avatarHtml = "";

    if (userList.length > limit) {
      avatarHtml += `
                <div class="avatar-item avatar-more" title="${userList.length - limit} more users">
                    <span>+${userList.length - limit}</span>
                </div>`;
    }

    // mulinma inn usersla 4 denage pic tika witharak view karawana
    userList
      .slice(0, limit)
      .reverse()
      .forEach((user) => {
        console.log(JSON.stringify(user.employee_id).fullname);

        avatarHtml += `
                <div class="avatar-item" title="${user.employee_id ? user.employee_id : "No name"}">
                    <img src="${user.user_photo ? atob(user.user_photo) : "default-user.png"}" alt="${user.employee_id ? user.employee_id : "No name"}">
                </div>`;
      });

    card.innerHTML = `
            <div class="card-header-flex">
                <span class="total-users-text">Total ${userList.length} users</span>
                <div class="avatar-group">
                    ${avatarHtml}
                </div>
            </div>
            <h3 class="role-title">${role.name}</h3>
            <div class="card-footer-flex">
                <button type="button" class="btn-edit-permission btn btn-3">View Permission</button>
                <button class="copy-btn" onclick="copyToClipboard('${role.name}')">
                    <i class="far fa-copy"></i>
                </button>
            </div>
        `;

    const editBtn = card.querySelector(".btn-edit-permission");
    editBtn.onclick = () => {
      editFunction(role);
    };

    cardContainer.appendChild(card);
  });
};

// role eka anuwa permision tika view karanwa modal eke
const editFunction = (dataOb) => {
  console.log(dataOb);

  document.getElementById("rolePermissionTitle").innerText = `Role Permissions - ${dataOb.name}`;
  $("#permissionModal").modal("show");

  let moduleList = getServiceRequest("/module/alldata");
  let rolePrivilage = getServiceRequest("/privilage/byrole?roleid=" + dataOb.id);

  // Store them for possible saving
  currentEditingRole = dataOb;
  allPrivilegesForRole = rolePrivilage;

  renderPermissionsMatrix(moduleList, rolePrivilage);
};

// module tika group karagannawa matching the requested tabs
const moduleGroups = {
  Operations: ["Booking", "All Booking", "Booking Schedule", "Booking Report", "Fuel Request", "Fuel Management"],
  "Fleet & Assets": ["Vehicle", "Vehicle Assigning", "Vehicle Group", "Route Management", "Location Management", "Fleet Management"],
  Stakeholders: ["Supplier Management", "Driver Management", "Employee Management", "Customer Management"],
  Financials: [
    "Supplier Payment",
    "Customer Payment",
    "Invoices Management",
    "Supplier Payable",
    "Fuel Price Management",
    "Revenue",
    "Package Management",
    "Advance Payment Management",
    "Batch Management",
  ],
  Agreements: ["Supplier Agreement", "Customer Agreement", "Supplier Agreement Approval", "Custome Agreement Approvals"],
  "Administration & Security": ["User Management", "Access Control"],
};

// module name eka wenas nam ekata galapen name ek map karaggnawa
const moduleNameMapper = (modName) => {
  if (modName.includes("Vehicle Assigning")) return "Vehicle Assigning";
  if (modName.includes("Vehicle")) return "Vehicle";
  if (modName.includes("Supplier Payment")) return "Supplier Payment";
  if (modName.includes("Customer Payment")) return "Customer Payment";

  return modName;
};

function getGroupName(moduleName) {
  for (const [group, modules] of Object.entries(moduleGroups)) {
    if (modules.some((m) => moduleName.toLowerCase().includes(m.toLowerCase()))) return group;
  }
  return "Operations"; // Default to Operations
}

function renderPermissionsMatrix(modules, rolePrivilage) {
  const tabNav = document.getElementById("permissionTab");
  const tabContent = document.getElementById("permissionTabContent");

  tabNav.innerHTML = "";
  tabContent.innerHTML = "";

  const groupedModules = {};
  modules.forEach((mod) => {
    const group = getGroupName(mod.name);
    if (!groupedModules[group]) groupedModules[group] = [];
    groupedModules[group].push(mod);
  });

  const privilegeMap = {};
  rolePrivilage.forEach((p) => {
    privilegeMap[p.module_id.id] = p;
  });

  const groups = Object.keys(moduleGroups);
  groups.forEach((groupName, index) => {
    const isActive = index === 0;
    const safeId = groupName.replace(/\s+&?\s+/g, "-").toLowerCase();

    // Create Tab
    const navItem = document.createElement("li");
    navItem.className = "nav-item";
    navItem.role = "presentation";
    navItem.innerHTML = `
        <button class="nav-link ${isActive ? "active" : ""} border-0 py-3 px-0 px-md-2" 
            id="${safeId}-tab" data-bs-toggle="tab" data-bs-target="#${safeId}-pane" 
            type="button" role="tab" style=" font-size: 0.9rem; color: ${isActive ? "#1e1b4b" : "#64748b"}; 
            border-bottom: 3px solid ${isActive ? "#1e1b4b" : "transparent"} !important; background: transparent;">
            ${groupName}
        </button>
    `;
    tabNav.appendChild(navItem);

    // Create Tab Pane
    const tabPane = document.createElement("div");
    tabPane.className = `tab-pane fade ${isActive ? "show active" : ""}`;
    tabPane.id = `${safeId}-pane`;
    tabPane.role = "tabpanel";

    // Add Table Matrix
    let tableHtml = `
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" style="background: transparent;">
                <thead style="background: #f8fafc; border-bottom: 1.5px solid #e2e8f0;">
                    <tr>
                        <th class="py-3 ps-4" style="color: #64748b; font-size: 0.8rem; text-transform: uppercase;">Module</th>
                        <th class="py-3 text-center" style="color: #64748b;  font-size: 0.8rem; text-transform: uppercase;">View</th>
                        <th class="py-3 text-center" style="color: #64748b; font-size: 0.8rem; text-transform: uppercase;">Create</th>
                        <th class="py-3 text-center" style="color: #64748b; font-size: 0.8rem; text-transform: uppercase;">Edit</th>
                        <th class="py-3 text-center" style="color: #64748b; font-size: 0.8rem; text-transform: uppercase;">Delete</th>
                    </tr>
                </thead>
                <tbody>
    `;

    const modsInGroup = groupedModules[groupName] || [];
    if (modsInGroup.length === 0) {
      tableHtml += `<tr><td colspan="6" class="text-center py-5 text-muted">No modules assigned to this category</td></tr>`;
    } else {
      modsInGroup.forEach((mod) => {
        const privi = privilegeMap[mod.id];
        tableHtml += `
            <tr class="permission-row-premium" style="border-bottom: 1px solid #e2e8f0; background: #fff;">
                <td class="py-3 ps-4" style="color: #334155; ">${mod.name}</td>
                <td class="text-center">${createPremiumBadge(mod.id, "view", privi ? privi.privi_select : false)}</td>
                <td class="text-center">${createPremiumBadge(mod.id, "insert", privi ? privi.privi_insert : false)}</td>
                <td class="text-center">${createPremiumBadge(mod.id, "update", privi ? privi.privi_update : false)}</td>
                <td class="text-center">${createPremiumBadge(mod.id, "delete", privi ? privi.privi_delete : false)}</td>
            </tr>
            `;
      });
    }

    tableHtml += `</tbody></table></div>`;
    tabPane.innerHTML = tableHtml;
    tabContent.appendChild(tabPane);
  });

  // Update tab colors on click
  tabNav.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("shown.bs.tab", function (event) {
      tabNav.querySelectorAll("button").forEach((b) => {
        b.style.color = "#64748b";
        b.style.borderBottom = "3px solid transparent";
      });
      event.target.style.color = "#1e1b4b";
      event.target.style.borderBottom = "3px solid #1e1b4b";
    });
  });
}

function createPremiumBadge(moduleId, type, enabled, isNA = false, moduleName = "") {
  if (isNA) {
    return `<span class="badge-premium-na" data-module-id="${moduleId}" data-type="${type}" style="background: #f1f5f9; color: #94a3b8; padding: 6px 16px; border-radius: 6px;font-size: 0.75rem;">N/A</span>`;
  }

  if (enabled) {
    return `<span class="badge-premium-enabled clickable-badge" data-module-id="${moduleId}" data-type="${type}" onclick="togglePermissionBadge(this, ${moduleId}, '${type}')" 
            style="background: #dcfce7; color: #16a34a; padding: 6px 16px; border-radius: 6px; font-size: 0.75rem; cursor: pointer;">Enabled</span>`;
  } else {
    return `<span class="badge-premium-disabled clickable-badge" data-module-id="${moduleId}" data-type="${type}" onclick="togglePermissionBadge(this, ${moduleId}, '${type}')" 
            style="background: #f1f5f9; color: #94a3b8; padding: 6px 16px; border-radius: 6px;font-size: 0.75rem; cursor: pointer;">Disabled</span>`;
  }
}

// Global variables to track state
let currentEditingRole = null;
let allPrivilegesForRole = [];

function togglePermissionBadge(element, moduleId, type) {
  const isEnabled = element.innerText === "Enabled";
  if (isEnabled) {
    element.innerText = "Disabled";
    element.style.background = "#f1f5f9";
    element.style.color = "#94a3b8";
    element.className = "badge-premium-disabled clickable-badge";
  } else {
    element.innerText = "Enabled";
    element.style.background = "#dcfce7";
    element.style.color = "#16a34a";
    element.className = "badge-premium-enabled clickable-badge";
  }
}

function saveRolePermissions() {
  // 1. Get current states from UI
  const newUIStates = {};
  const badges = document.querySelectorAll(".clickable-badge, .badge-premium-na");
  console.log(badges);

  badges.forEach((badge) => {
    const modId = badge.getAttribute("data-module-id");
    const type = badge.getAttribute("data-type");
    const isEnabled = badge.innerText === "Enabled";

    if (!newUIStates[modId]) newUIStates[modId] = {};
    newUIStates[modId][type] = isEnabled;
  });

  console.log(newUIStates);

  // 2. Compare with original data
  const updateList = [];
  const oldPrivMap = {};
  allPrivilegesForRole.forEach((p) => {
    oldPrivMap[p.module_id.id] = p;
  });

  Object.keys(newUIStates).forEach((modId) => {
    const newState = newUIStates[modId];
    const oldPriv = oldPrivMap[modId];

    if (oldPriv) {
      // Check for changes in existing privilege
      const isChanged =
        newState.view !== oldPriv.privi_select ||
        newState.insert !== oldPriv.privi_insert ||
        newState.update !== oldPriv.privi_update ||
        newState.delete !== oldPriv.privi_delete;

      if (isChanged) {
        const updatedObj = { ...oldPriv };
        updatedObj.privi_select = newState.view;
        updatedObj.privi_insert = newState.insert;
        updatedObj.privi_update = newState.update;
        updatedObj.privi_delete = newState.delete;
        updateList.push(updatedObj);
      }
    } else {
      // Check if any permission is enabled for a new privilege entry
      if (newState.view || newState.insert || newState.update || newState.delete) {
        const newPriv = {
          role_id: currentEditingRole,
          module_id: { id: parseInt(modId) },
          privi_select: newState.view || false,
          privi_insert: newState.insert || false,
          privi_update: newState.update || false,
          privi_delete: newState.delete || false,
        };
        updateList.push(newPriv);
      }
    }
  });

  // 3. Handle save feedback
  if (updateList.length === 0) {
    Swal.fire({
      title: "Nothing to update",
      text: "No changes detected in role permissions.",
      icon: "info",
    });
    return;
  }

  // 4. Confirmation and Save
  Swal.fire({
    title: "Are you sure?",
    text: `You have made ${updateList.length} change(s). Do you want to save them?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#1e1b4b",
    cancelButtonColor: "#64748b",
    confirmButtonText: "Yes, Save Changes",
  }).then((result) => {
    if (result.isConfirmed) {
      const response = httpServiceRequest("/privilage/saveall", "POST", updateList);

      if (response === "ok") {
        Swal.fire({
          title: "Saved!",
          text: "Role permissions updated successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        $("#permissionModal").modal("hide");
        loadPrivilageTable(); // Refresh the main table
      } else {
        Swal.fire({
          title: "Error",
          text: response,
          icon: "error",
        });
      }
    }
  });
}

// load data into the table with dbms
const loadPrivilageTable = () => {
  if ($.fn.dataTable.isDataTable("#privilageTable")) {
    $("#privilageTable").DataTable().clear().destroy();
  }

  privilage = getServiceRequest("/privilage/alldata");

  properties = [
    { propertyName: getRole, dataType: "function" },
    { propertyName: getModule, dataType: "function" },
    { propertyName: getSelect, dataType: "function" },
    { propertyName: getInsert, dataType: "function" },
    { propertyName: getUpdate, dataType: "function" },
    { propertyName: getDelete, dataType: "function" },
  ];

  dataFillIntoTheTable(privilageTableBody, privilage, properties, privilageView, privilageEdit, privilageDelete, true);

  const table = $("#privilageTable").DataTable({
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
  $("#tableSearch")
    .off("keyup")
    .on("keyup", function () {
      table.search(this.value).draw();
    });

  // Custom Length
  $("#tableLength")
    .off("change")
    .on("change", function () {
      table.page.len($(this).val()).draw();
    });
};

// role function
const getRole = (dataOb) => {
  return dataOb.role_id.name;
};

// module function
const getModule = (dataOb) => {
  return dataOb.module_id.name;
};

// Select permisson function
const getSelect = (dataOb) => {
  if (dataOb.privi_select) {
    return `<span class="badge-premium-enabled" style="background: #dcfce7; color: #16a34a; padding: 6px 16px; border-radius: 6px; font-size: 0.75rem;">Enabled</span>`;
  } else {
    return `<span class="badge-premium-disabled" style="background: #f1f5f9; color: #94a3b8; padding: 6px 16px; border-radius: 6px; font-size: 0.75rem;">Disabled</span>`;
  }
};

// Insert permisson function
const getInsert = (dataOb) => {
  if (dataOb.privi_insert) {
    return `<span class="badge-premium-enabled" style="background: #dcfce7; color: #16a34a; padding: 6px 16px; border-radius: 6px; font-size: 0.75rem;">Enabled</span>`;
  } else {
    return `<span class="badge-premium-disabled" style="background: #f1f5f9; color: #94a3b8; padding: 6px 16px; border-radius: 6px; font-size: 0.75rem;">Disabled</span>`;
  }
};

// update permisson function
const getUpdate = (dataOb) => {
  if (dataOb.privi_update) {
    return `<span class="badge-premium-enabled" style="background: #dcfce7; color: #16a34a; padding: 6px 16px; border-radius: 6px; font-size: 0.75rem;">Enabled</span>`;
  } else {
    return `<span class="badge-premium-disabled" style="background: #f1f5f9; color: #94a3b8; padding: 6px 16px; border-radius: 6px; font-size: 0.75rem;">Disabled</span>`;
  }
};

// delete permisson function
const getDelete = (dataOb) => {
  if (dataOb.privi_delete) {
    return `<span class="badge-premium-enabled" style="background: #dcfce7; color: #16a34a; padding: 6px 16px; border-radius: 6px; font-size: 0.75rem;">Enabled</span>`;
  } else {
    return `<span class="badge-premium-disabled" style="background: #f1f5f9; color: #94a3b8; padding: 6px 16px; border-radius: 6px; font-size: 0.75rem;">Disabled</span>`;
  }
};

// view button of the table
const privilageView = (dataOb) => {
  console.log(dataOb);
  tdRole.innerText = dataOb.role_id.name;
  tdModule.innerText = dataOb.module_id.name;
  tdSelect.innerHTML = getSelect(dataOb);
  tdInsert.innerHTML = getInsert(dataOb);
  tdUpdate.innerHTML = getUpdate(dataOb);
  tdDelete.innerHTML = getDelete(dataOb);

  $("#privilageView").modal("show");
};

// delete button of the table
const privilageDelete = (dataOb) => {
  console.log(dataOb);

  let userConfirm = Swal.fire({
    title: "Confirm Privilege Deletion",
    text: "Are you sure you want to delete this privilege? This action cannot be undone!",
    icon: "warning",
    iconColor: "#ef4444",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete Privilege",
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
      let postResponse = httpServiceRequest("/privilage/delete", "DELETE", dataOb);
      if (postResponse == "ok") {
        Swal.fire({
          title: "Privilege Deleted!",
          text: "The privilege has been successfully removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-border-radius",
          },
        });
        loadPrivilageTable();
        refreshForm();
      } else {
        Swal.fire({
          title: "Deletion Failed",
          text: postResponse,
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

// edit button of the table
const privilageEdit = (dataOb) => {
  console.log(dataOb);

  privilageRole.value = JSON.stringify(dataOb.role_id);
  privilageModule.value = JSON.stringify(dataOb.module_id);

  if (dataOb.privi_select) {
    chkBoxSelect.checked = true;
    labelSelect.innerText = "Access Granted";
  } else {
    chkBoxSelect.checked = false;
    labelSelect.innerText = "Access Denied";
  }

  if (dataOb.privi_insert) {
    chkBoxInsert.checked = true;
    labelInsert.innerText = "Access Granted";
  } else {
    chkBoxInsert.checked = false;
    labelInsert.innerText = "Access Denied";
  }

  if (dataOb.privi_update) {
    chkBoxUpdate.checked = true;
    labelUpdate.innerText = "Access Granted";
  } else {
    chkBoxUpdate.checked = false;
    labelUpdate.innerText = "Access Denied";
  }

  if (dataOb.privi_delete) {
    chkBoxDelete.checked = true;
    labelDelete.innerText = "Access Granted";
  } else {
    chkBoxDelete.checked = false;
    labelDelete.innerText = "Access Denied";
  }

  updateButton.style.display = "";
  submitButton.style.display = "none";

  privilage = JSON.parse(JSON.stringify(dataOb));
  oldprivilage = JSON.parse(JSON.stringify(dataOb));

  $("#privilageForm").modal("show");
};

// check form errors
const checkFormError = () => {
  let errors = "";

  if (privilage.role_id == null) {
    errors = errors + "Please Select Role ...\n";
  }
  if (privilage.module_id == null) {
    errors = errors + "Please Select Module ...\n";
  }

  return errors;
};

//privilage from submit event function
const privilageFormSubmit = () => {
  console.log(privilage);
  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    // errors not exit
    //need to get user confirmation

    let userConfirm = Swal.fire({
      title: "Confirm Privilege Creation",
      text: "Are you sure you want to create this new privilege?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Create Privilege",
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
        let postResponse = httpServiceRequest("/privilage/insert", "POST", privilage);
        if (postResponse == "ok") {
          Swal.fire({
            title: "Privilege Created!",
            text: "New privilege has been successfully created.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          loadPrivilageTable();
          refreshForm();
        } else {
          Swal.fire({
            title: "Creation Failed",
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
      title: "Privilege Incomplete",
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
  console.log(privilage);
};

// check form updates
const checkFormUpdates = () => {
  let updates = "";

  if (privilage != null && oldprivilage != null) {
    if (privilage.role_id.name != oldprivilage.role_id.name) {
      updates = updates + " Role is changed..\n";
    }

    if (privilage.module_id.name != oldprivilage.module_id.name) {
      updates = updates + " Module is changed...\n";
    }
    if (privilage.privi_select != oldprivilage.privi_select) {
      updates = updates + " Select Privilage is changed...\n";
    }
    if (privilage.privi_insert != oldprivilage.privi_insert) {
      updates = updates + " Insert Privilage is changed...\n";
    }
    if (privilage.privi_update != oldprivilage.privi_update) {
      updates = updates + " Update Privilage is changed...\n";
    }
    if (privilage.privi_delete != oldprivilage.privi_delete) {
      updates = updates + " Delete Privilage is changed....\n";
    }
  }
  return updates;
};

// update button of the form
const privilageFormUpdate = () => {
  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    let updates = checkFormUpdates();
    // updates not exit
    if (updates == "") {
      Swal.fire({
        title: "Nothing to Update",
        text: "No changes were detected in the privilege details.",
        icon: "info",
        allowOutsideClick: false,
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    } else {
      let userConfirm = Swal.fire({
        title: "Confirm Privilege Update",
        text: "Are you sure you want to update this privilege?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Update Privilege",
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
          let postResponse = httpServiceRequest("/privilage/update", "PUT", privilage);
          if (postResponse == "ok") {
            Swal.fire({
              title: "Privilege Updated!",
              text: "The privilege details have been successfully updated.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: "swal2-border-radius",
              },
            });
            loadPrivilageTable();
            refreshForm();
            $("#privilageForm").modal("hide");
          } else {
            Swal.fire({
              title: "Update Failed",
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

// refresh the form
const refreshForm = () => {
  privilage = new Object();

  roles = getServiceRequest("/role/alldata");
  modules = getServiceRequest("/module/alldata");

  dataFilIntoSelect(privilageRole, "Select Role", roles, "name");
  dataFilIntoSelect(privilageModule, "Select Module", modules, "name");

  chkBoxSelect.checked = false;
  privilage.privi_select = false;
  labelSelect.innerText = "Access Denied";
  chkBoxInsert.checked = false;
  labelInsert.innerText = "Access Denied";
  privilage.privi_insert = false;
  chkBoxUpdate.checked = false;
  labelUpdate.innerText = "Access Denied";
  privilage.privi_update = false;
  chkBoxDelete.checked = false;
  labelDelete.innerText = "Access Denied";
  privilage.privi_delete = false;

  setDefault([privilageRole, privilageModule]);

  submitButton.style.display = "";
  updateButton.style.display = "none";
};

//Alert Box Call function
Swal.isVisible();
