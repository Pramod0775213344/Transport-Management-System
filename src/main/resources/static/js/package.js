
// ==================== page load functions =========================
window.addEventListener("load", () => {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      loadPackageCards();
      refereshPackageForm();
    } catch (e) {
      console.error("Error during package page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);
});
// =================== end of page load functions =========================


// =================== package card load functions =========================
// packge cards load function
const loadPackageCards = () => {
  packages = getServiceRequest("/package/alldata");

  // property list eke name
  const propertyListName = [
    { propertyName: "Package Name", dataType: "string" },
    { propertyName: "Vehicle type", dataType: "function" },
    { propertyName: "Distance (Km)", dataType: "string" },
    { propertyName: "Price (Rs.)", dataType: "string" },
    { propertyName: "Status", dataType: "function" },
  ];

  // property list eke property name and data type
  const propertyList = [
    { propertyName: "name", dataType: "string" },
    { propertyName: getVehicleType, dataType: "function" },
    { propertyName: "distance", dataType: "string" },
    { propertyName: "package_charge_cus", dataType: "string" },
    { propertyName: getPackageStatus, dataType: "function" },
  ];

  fillDataIntoPackageCard("package-container", packages, propertyList, propertyListName, editFunction);

  applyPrivilegesCard("Package Management", "package-container", {
    add: addButton,

  });
};
const applyPrivilegesCard = (moduleName, cardContainerId, btns = {}) => {
  const p = getModulePrivilege(moduleName);

  const handleBtn = (btn, allowed) => {
    if (!btn) return;
    if (Array.isArray(btn)) {
      btn.forEach(b => b && (b.style.display = allowed ? "" : "none"));
    } else {
      btn.style.display = allowed ? "" : "none";
    }
  };

  handleBtn(btns.add, p.privi_insert);
  handleBtn(btns.update, p.privi_update);
  handleBtn(btns.submit, p.privi_insert);

  if (cardContainerId) {
    document.querySelectorAll(`#${cardContainerId} .main-card`)
      .forEach(card => {
        // card click eka block karana code eka update privilage eka nathi nam
        if (!p.privi_update) {
          card.onclick = null;   // block click
          card.style.cursor = "not-allowed";
          card.style.opacity = "0.6";
        }
      });

    document.querySelectorAll(`#${cardContainerId} .btn-delete-card`)
      .forEach(btn => btn.style.display = p.privi_delete ? "" : "none");
  }
};

// card ekata data fill karana function eka
const fillDataIntoPackageCard = (ParentId, packages, propertyList, propertyListName, editFunction) => {
  let packageContainer = document.getElementById(ParentId);
  packageContainer.innerHTML = "";

  packages.forEach((pkg) => {
    let card = document.createElement("div");
    card.classList.add("main-card");

    // Determine Icon based on Package Type
    const isFloating = pkg.package_type === "Floating Rate";
    const typeIcon = isFloating ? "fa-water" : "fa-route";
    const typeColor = isFloating ? "text-primary" : "text-success";

    card.innerHTML = `
      <div class="card-header-premium d-flex justify-content-between align-items-center mb-3">
        <div class="type-indicator">
            <div class="icon-circle shadow-sm">
                <i class="fa-solid ${typeIcon} ${typeColor}"></i>
            </div>
            <span class="small fw-bold text-uppercase tracking-wider text-slate-400 ms-2">${pkg.package_type}</span>
        </div>
        <div class="d-flex align-items-center gap-2">
            ${getPackageStatus(pkg)}
            <button class="btn-delete-card" title="Delete Package">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
      </div>

      <h4 class="package-title mb-1">${pkg.name}</h4>
      <p class="text-slate-400 small mb-3">
        <i class="fa-solid fa-truck-fast me-1"></i> ${pkg.vehicle_type_id.name}
      </p>

      <div class="price-grid mt-auto">
        <div class="price-item">
            <span class="price-label">Customer Base</span>
            <span class="price-value">LKR ${pkg.package_charge_cus.toLocaleString()}</span>
        </div>
        <div class="price-separator"></div>
        <div class="price-item">
            <span class="price-label">Supplier Base</span>
            <span class="price-value">LKR ${pkg.package_charge_sup.toLocaleString()}</span>
        </div>
      </div>

      <div class="distance-badge mt-3">
        <span class="small fw-medium"><i class="fa-solid fa-location-dot me-1"></i> ${pkg.distance} KM Limit</span>
      </div>
    `;

    // Handle Delete Click
    const deleteBtn = card.querySelector(".btn-delete-card");
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      packageDelete(pkg);
    };

    card.onclick = () => {
      editFunction(pkg);
    };

    packageContainer.appendChild(card);
  });
};

// get vehicle type
const getVehicleType = (dataOb) => {
  return dataOb.vehicle_type_id.name;
};

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
};
// =================== end of package card load functions =========================



// =================== auto generate package name function =========================
// package name eka auto genearte karana function eka
const generatePackageName = () => {
  const packageType = document.getElementById("packageType").value;
  const distance = document.getElementById("packageDistance").value;
  const packageNameInput = document.getElementById("textPackageName");

  if (packageType == "Fix Rate") {
    const packageName = packageType + " - " + distance + " Km";
    packageNameInput.value = packageName;
    package.name = packageName;
  } else {
    packageNameInput.value = packageType;
    package.name = packageName;
  }
};
// ================= end of auto generate package name function =========================



// ================== delete package function =========================
// package Delete function
const packageDelete = (pkgToDelete) => {
  const targetPackage = pkgToDelete || package;
  console.log(targetPackage);

  let userConfirm = Swal.fire({
    title: "Confirm Deletion",
    text: `Are you sure you want to delete "${targetPackage.name}"? This action cannot be undone!`,
    icon: "warning",
    iconColor: "#ef4444",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete Package",
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
      let deleteResponse = httpServiceRequest("/package/delete", "DELETE", targetPackage);
      if (deleteResponse == "ok") {
        Swal.fire({
          title: "Package Deleted!",
          text: "The package has been successfully removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-border-radius",
          },
        });
        loadPackageCards();
        refereshPackageForm();
        $("#packageFormModal").modal("hide");
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
        text: "Package not Deleted!",
        icon: "error",
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    }
  });
};
// ================ end of delete package function =========================


// ================== package edit functions =========================
// edit function of package form
const editFunction = (dataOb) => {
  // active package edit karanna ba
  if (dataOb.package_status_id.status == "Active") {
    Swal.fire({
      title: "Edit Not Allowed",
      text: "Active packages cannot be edited.",
      icon: "error",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    return;
  }
    // active package edit karanna ba
  if (dataOb.package_status_id.status == "Deleted") {
    Swal.fire({
      title: "Edit Not Allowed",
      text: "Deletd packages cannot be edited.",
      icon: "error",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    return;
  }
  packageType.value = dataOb.package_type;

  textPackageName.value = dataOb.name;



  packageCustomerCharge.value = dataOb.package_charge_cus;

  packageSupplierCharge.value = dataOb.package_charge_sup;



  selectPackageVehicleType.value = JSON.stringify(dataOb.vehicle_type_id);

  selectPackageStatus.value = JSON.stringify(dataOb.package_status_id);

  if (dataOb.package_type === "Fix Rate") {
    packageDistanceContainer.style.display = "";

    packageAdditonalKmChargeCustomerContainer.style.display = "";
    packageAdditonalKmChargeSupplierContainer.style.display = "";

    packageAdditonalKmChargeCustomer.value = dataOb.additinal_km_charge_cus;
    packageAdditonalKmChargeSupplier.value = dataOb.additinal_km_charge_sup;
    packageDistance.value = dataOb.distance;

  } else {
    packageDistanceContainer.style.display = "none";
    packageAdditonalKmChargeCustomerContainer.style.display = "none";
    packageAdditonalKmChargeSupplierContainer.style.display = "none";
  }

  $("#packageFormModal").modal("show");

  updateButton.style.display = "";
  submitButton.style.display = "none";

  package = JSON.parse(JSON.stringify(dataOb));
  oldPackage = JSON.parse(JSON.stringify(dataOb));
};
// package print  function
const packagePrinrt = (dataOb) => { };
// ================= end of package edit functions =========================



// ================ submit & check error functions =========================
// form errors check function
const checkFormError = () => {
  let errors = "";

  if (package.name == null) {
    errors = errors + "Please Enter the Package Name.....";
  }
  if (package.package_type == null) {
    errors = errors + "Please Select the Package Type.....";
    packageType.classList.add("is-invalid");
  }
  if (package.distance == null) {
    errors = errors + "Please Enter Distance.....";
    packageDistance.classList.add("is-invalid");
  }
  if (package.package_charge_cus == null) {
    errors = errors + "Please Enter Package charge of customer.....";
    packageCustomerCharge.classList.add("is-invalid");
  }
  if (package.package_charge_sup == null) {
    errors = errors + "Please Enter  Package charge of supplier.....";
    packageSupplierCharge.classList.add("is-invalid");
  }
  if (package.additinal_km_charge_cus == null) {
    errors = errors + "Please Enter the Additional km charge of customer.....";
    packageAdditonalKmChargeCustomer.classList.add("is-invalid");
  }
  if (package.additinal_km_charge_sup == null) {
    errors = errors + "Please Enter the Additional km charge of supplier.....";
    packageAdditonalKmChargeSupplier.classList.add("is-invalid");
  }
  if (package.vehicle_type_id == null) {
    errors = errors + "Please Select the Vehicle type.....";
    selectPackageVehicleType.classList.add("is-invalid");
  }
  return errors;
};

// package form submition
const packageFormSubmit = () => {
  console.log(package);
  // check form error for required element

  let errors = checkFormError();
  if (errors == "") {
    // errors not exit
    //need to get user confirmation

    let userConfirm = Swal.fire({
      title: "Confirm Package Submission",
      text: "Are you sure you want to create this new package?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Save Package",
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
        let postResponse = httpServiceRequest("/package/insert", "POST", package);
        if (postResponse == "ok") {
          Swal.fire({
            title: "Package Saved!",
            text: "New package has been successfully developed.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          loadPackageCards();
          refereshPackageForm();
          $("#packageFormModal").modal("hide");
        } else {
          Swal.fire({
            title: "Submission Failed",
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
          text: "Package details not Saved!",
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
      title: "Validation Error",
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
  console.log(package);
};
// ================ end of submit & check error functions =========================



// =============== update & check updates functions =========================
// package form update
const checkFormUpdates = () => {
  let updates = "";

  if (package != null && oldPackage != null) {
    if (package.name != oldPackage.name) {
      updates = updates + "Package Name is changed";
    }
    if (package.distance != oldPackage.distance) {
      updates = updates + "Package Name is changed";
    }
    if (package.package_charge_cus != oldPackage.package_charge_cus) {
      updates = updates + "Package Name is changed";
    }
    if (package.package_charge_sup != oldPackage.package_charge_sup) {
      updates = updates + "Package Name is changed";
    }
    if (package.additinal_km_charge_cus != oldPackage.additinal_km_charge_cus) {
      updates = updates + "Package Name is changed";
    }
    if (package.additinal_km_charge_sup != oldPackage.additinal_km_charge_sup) {
      updates = updates + "Package Name is changed";
    }
    if (package.vehicle_type_id.name != oldPackage.vehicle_type_id.name) {
      updates = updates + "Package Name is changed";
    }
    if (package.package_status_id.status != oldPackage.package_status_id.status) {
      updates = updates + "Package Name is changed";
    }
  }
  return updates;
};

// package form update
const packageFormUpdate = () => {
  console.log(package);
  console.log(oldPackage);
  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    let updates = checkFormUpdates();
    // updates not exit
    if (updates == "") {
      Swal.fire({
        title: "Nothing to Update",
        text: "No changes were detected in the package details.",
        icon: "info",
        allowOutsideClick: false,
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    } else {
      let userConfirm = Swal.fire({
        title: "Confirm Package Update",
        text: "Are you sure you want to update this package's details?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Update Package",
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
          let putResponse = httpServiceRequest("/package/update", "PUT", package);
          if (putResponse == "ok") {
            Swal.fire({
              title: "Package Updated!",
              text: "The package details have been successfully updated.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: "swal2-border-radius",
              },
            });
            loadPackageCards();
            refereshPackageForm();
            $("#packageFormModal").modal("hide");
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
      title: "Validation Error",
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
// ================ end of update & check updates functions =========================




// =============== form refresh function =========================
// form Refresh function
const refereshPackageForm = () => {
  package = new Object();

  packageForm.reset();

  setDefault([
    packageType,
    textPackageName,
    packageDistance,
    packageCustomerCharge,
    packageSupplierCharge,
    packageAdditonalKmChargeCustomer,
    packageAdditonalKmChargeSupplier,
    selectPackageVehicleType,
    selectPackageStatus,
  ]);

  let vehicleTypes = getServiceRequest("/vehicletype/alldata");
  dataFilIntoSelect(selectPackageVehicleType, "Select Vehicle Type", vehicleTypes, "name");

  let packageStatsus = getServiceRequest("/packagestatus/alldata");
  dataFilIntoSelect(selectPackageStatus, "Select Status ", packageStatsus, "status");

  submitButton.style.display = "";
  updateButton.style.display = "none";

  // conatiner tika hide karana code eka
  packageDistanceContainer.style.display = "none";
  packageAdditonalKmChargeCustomerContainer.style.display = "none";
  packageAdditonalKmChargeSupplierContainer.style.display = "none";
};
// ================ end of form refresh function =========================



//Alert Box Call function
Swal.isVisible();





// ==================== filtering and validation functions =========================
// select karan package type eka anuwa wenas karana fill karanna oni data eka
const packageTypeElement = document.getElementById("packageType");
packageTypeElement.addEventListener("change", () => {
  const selectedType = packageTypeElement.value;
  if (selectedType === "Fix Rate") {
    packageDistanceContainer.style.display = "";
    packageAdditonalKmChargeCustomerContainer.style.display = "";
    packageAdditonalKmChargeSupplierContainer.style.display = "";
     textPackageName.value = "";


  } else {
    // conatiner tika hide karana code eka
    packageDistanceContainer.style.display = "none";
    packageAdditonalKmChargeCustomerContainer.style.display = "none";
    packageAdditonalKmChargeSupplierContainer.style.display = "none";

    // packege name eka input eka anuwa wenas karana code eka
    textPackageName.value = selectedType;

    // data bind karanwa package object eka anuwa
    package.name = selectedType;
    package.distance = 1;
    package.additinal_km_charge_cus = 0;
    package.additinal_km_charge_sup = 0;
  }
});

// pacckage disstance eka 2000 km wlata wada wadi wenna oni
const packageDistanceElement = document.getElementById("packageDistance");

packageDistanceElement.addEventListener("keyup", () => {
  const distanceValue = parseInt(packageDistanceElement.value, 10);
  const isFormatValid = /^([0-9]{1,11})$/.test(packageDistanceElement.value);

  if (isFormatValid && !isNaN(distanceValue) && distanceValue >= 2000) {
    packageDistanceElement.classList.add("is-valid");
    packageDistanceElement.classList.remove("is-invalid");
    package.distance = distanceValue;
  } else {
    packageDistanceElement.classList.add("is-invalid");
    packageDistanceElement.classList.remove("is-valid");
    package.distance = null;
  }

  generatePackageName();
});

// rate valiador
const rateValidator = (element, dataPattern, object, property, min = null, max = null) => {
  const elementValue = element.value;
  const regExp = new RegExp(dataPattern);
  const ob = window[object];

  if (elementValue != "") {
    const numValue = parseFloat(elementValue);
    const formatValid = regExp.test(elementValue);
    const rangeValid = (min === null || numValue >= min) && (max === null || numValue <= max);

    if (formatValid && rangeValid) {
      element.classList.remove("is-invalid");
      element.classList.add("is-valid");
      ob[property] = elementValue;
    } else {
      element.classList.remove("is-valid");
      element.classList.add("is-invalid");
      ob[property] = null;
    }
  } else {
    if (element.required) {
      element.classList.remove("is-valid");
      element.classList.add("is-invalid");
      ob[property] = null;
    } else {
      element.classList.remove("is-invalid");
      element.classList.remove("is-valid");
      ob[property] = "";
    }
  }
};

// customer charge eka saha supplier charge eka compare karana function eka
function validateSupplierLessThanCustomer() {
  const customerEl = document.getElementById("packageCustomerCharge");
  const supplierEl = document.getElementById("packageSupplierCharge");

  const customerValue = parseFloat(customerEl.value);
  const supplierValue = parseFloat(supplierEl.value);

  // dekama valid numbers nam witharai me check eka run wenne
  if (isNaN(customerValue) || isNaN(supplierValue)) {
    return;
  }

  if (supplierValue >= customerValue) {
    supplierEl.classList.remove("is-valid");
    supplierEl.classList.add("is-invalid");
    // alert message eka display karana code eka
    Swal.fire({
      title: "Validation Error",
      text: "Supplier charge must be less than Customer charge.",
    });
    package.supplierBaseCharge = null;
  } else {
    supplierEl.classList.remove("is-invalid");
    supplierEl.classList.add("is-valid");

    package.supplierBaseCharge = supplierEl.value;
  }
}
// ==================== end of filtering and validation functions =========================