window.addEventListener("load", () => {
  loadPackageCards();

  refereshPackageForm();
});

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

// package print  function
const packagePrinrt = (dataOb) => {};

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

  $("#packageFormModal").modal("show");

  updateButton.style.display = "";
  submitButton.style.display = "none";

  package = JSON.parse(JSON.stringify(dataOb));
  oldPackage = JSON.parse(JSON.stringify(dataOb));
};

// form errors check function
const checkFormError = () => {
  let errors = "";

  if (package.name == null) {
    errors = errors + "Please Enter the Package Name.....";
  }
  if (package.distance == null) {
    errors = errors + "Please Enter Distance.....";
  }
  if (package.package_charge_cus == null) {
    errors = errors + "Please Enter Package charge of customer.....";
  }
  if (package.package_charge_sup == null) {
    errors = errors + "Please Enter  Package charge of supplier.....";
  }
  if (package.additinal_km_charge_cus == null) {
    errors = errors + "Please Enter the Additional km charge of customer.....";
  }
  if (package.additinal_km_charge_sup == null) {
    errors = errors + "Please Enter the Additional km charge of supplier.....";
  }
  if (package.vehicle_type_id == null) {
    errors = errors + "Please Select the Vehicle type.....";
  }
  if (package.package_status_id == null) {
    errors = errors + "Please Select the status.....";
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
};

//Alert Box Call function
Swal.isVisible();
