
// ===================== map eka laod karana function =================================
let map, marker;

// Premium custom marker icon matching booking.js color scheme (#22c55e green)
function createCustomIcon() {
  return L.divIcon({
    className: 'custom-location-marker',
    html: `<div style="
      background: #22c55e;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
    "><div style="width:8px;height:8px;background:#fff;border-radius:50%;"></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
}

function initMap() {
  try {
    if (typeof L === "undefined") {
      console.warn("Leaflet library not loaded.");
      return;
    }

    // Fix Leaflet default marker icon 404 issues by using local offline assets
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/images/marker-icon-2x.png',
      iconUrl: '/images/marker-icon.png',
      shadowUrl: '/images/marker-shadow.png',
    });

    // Initialize map centered on Sri Lanka
    map = L.map("map").setView([7.8731, 80.7718], 7);

    // Use local TileServer GL endpoint, with automatic fallback to OSM on tile error
    const localTileServerUrl = "http://localhost:8989/styles/osm-bright/{z}/{x}/{y}.png";
    const osmFallbackUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const mapLayer = L.tileLayer(localTileServerUrl, {
      attribution: "© OpenStreetMap contributors",
    });

    mapLayer.on('tileerror', function (error) {
      const coords = error.coords;
      const tile = error.tile;
      const s = ['a', 'b', 'c'][Math.abs(coords.x + coords.y) % 3];
      const fallbackUrl = osmFallbackUrl
        .replace('{s}', s)
        .replace('{z}', coords.z)
        .replace('{x}', coords.x)
        .replace('{y}', coords.y);
      tile.src = fallbackUrl;
    });

    mapLayer.addTo(map);

    // Force map to recognize container size
    setTimeout(() => {
      map.invalidateSize();
    }, 500);

    // Map click event to pick coordinates and fetch address
    map.on("click", function (e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      if (marker) {
        marker.setLatLng(e.latlng);
      } else {
        marker = L.marker(e.latlng, { icon: createCustomIcon() }).addTo(map);
      }

      locations.latitude = lat;
      locations.longitude = lng;
      locationLatitude.value = lat.toFixed(6);
      locationLongitude.value = lng.toFixed(6);
      locationLatitude.classList.add("is-valid");
      locationLongitude.classList.add("is-valid");

      console.log("Picked Coordinates:", lat, lng);

      // Default behavior if offline or fetch fails
      const setFallbackAddress = () => {
        locationAddress.value = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
        locations.address = locationAddress.value;
        locationAddress.classList.remove("is-valid");
      };

      if (!locationName.value) {
        locationName.value = "New Point";
        locations.name = "New Point";
      }

      // Online: Fetch real address from Nominatim
      if (navigator.onLine) {
        locationAddress.value = "Fetching address...";
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then((response) => response.json())
          .then((data) => {
            if (data && data.display_name) {
              locationAddress.value = data.display_name;
              locations.address = data.display_name;
              locationAddress.classList.add("is-valid");
            } else {
              setFallbackAddress();
            }
          })
          .catch((err) => {
            console.error("Reverse geocoding failed:", err);
            setFallbackAddress();
          });
      } else {
        setFallbackAddress();
      }
    });
  } catch (error) {
    handleError("Failed to initialize map: " + error.message);
  }
}

function handleError(message) {
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = message;
  console.error(message);
}

// ================== end map load functions ===========================================



// =================== load functions =================================================
// Attempt to initialize map when page loads
window.addEventListener("load", function () {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      initMap();
      refreshLocationForm();
    } catch (e) {
      console.error("Error during location page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);


  $("#selectCompanyNameForLocation").select2({
    theme: "bootstrap-5",
  });
});
// ================== end load functions =================================================


// ================== table loading functions =================================================
// Table loading logic
const loadLocationTable = (locationList) => {
  // console.log(locationList);

  if ($.fn.dataTable.isDataTable("#locationDataTable")) {
    $("#locationDataTable").DataTable().clear().destroy();
  }

  const propertyList = [
    { propertyName: "name", dataType: "string" },
    { propertyName: getCustomer, dataType: "function" },
    { propertyName: getLocationtPickupType, dataType: "function" },
    { propertyName: getLocationtWayaType, dataType: "function" },
    { propertyName: getLocationtCeliveryType, dataType: "function" },
  ];

  dataFillIntoTheInnerTable(locationTableBody, locationList, propertyList, locationEdit, locationDelete);

  const table = $("#locationDataTable").DataTable({
    dom: "rtip",
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
      table.page.len(this.value).draw();
    });

  applyPrivileges("Location Management", "locationDataTable", {
  }, ["formAndMapSection"]);

  table.on("draw.dt", function () {
    applyPrivileges("Location Management", "locationDataTable", {}, ["formAndMapSection"]);
  });
};

// get customer details
const getCustomer = (dataOb) => {
  return dataOb.customer_id.company_name;
};

// get location type details
const getLocationtType = (dataOb) => {
  let types = "";
  dataOb.types.forEach((type) => {
    types += `<span class="tag me-1">${type}</span>`;
  });
  return types;
};
const getLocationtPickupType = (dataOb) => {
  const found = dataOb.types.some((type) => type === "pickup");
  return found ? `<span class="status-badge status-active"><i class="fa-solid fa-circle-check me-1"></i>Yes</span>` : `<span class="status-badge status-inactive"><i class="fa-solid fa-circle-xmark me-1"></i>No</span>`;
};

const getLocationtWayaType = (dataOb) => {
  const found = dataOb.types.some((type) => type === "waypoint");
  return found ? `<span class="status-badge status-active"><i class="fa-solid fa-circle-check me-1"></i>Yes</span>` : `<span class="status-badge status-inactive"><i class="fa-solid fa-circle-xmark me-1"></i>No</span>`;
};

const getLocationtCeliveryType = (dataOb) => {
  const found = dataOb.types.some((type) => type === "delivery");
  return found ? `<span class="status-badge status-active"><i class="fa-solid fa-circle-check me-1"></i>Yes</span>` : `<span class="status-badge status-inactive"><i class="fa-solid fa-circle-xmark me-1"></i>No</span>`;
};
// =================== end table load functions =================================================



// =================== delete functions =================================================
// delete function eka
const locationDelete = (dataOb) => {
  let checkboxHtml = "";
  // Checkbox tika hadagannawa thiyena types tika witharak dala
  dataOb.types.forEach((type) => {
    let label = type === "pickup" ? "Pickup Location" : type === "delivery" ? "Delivery Location" : "Waypoint Location";
    checkboxHtml += `
            <div class="form-check text-start mb-2 custom-checkbox">
                <input class="form-check-input delTypes-chk" type="checkbox" value="${type}" id="del_${type}">
                <label class="form-check-label" for="del_${type}">${label}</label>
            </div>`;
  });

  Swal.fire({
    title: "Confirm Location Deletion",
    html: `
            <div class="p-3">
                <p class="text-start mb-3">Select the classifications you want to remove for <b>${dataOb.name}</b>:</p>
                <div class="ms-2">
                    ${checkboxHtml}
                </div>
                <p class="text-danger small mt-3 text-start mb-0">
                    <i class="fa-solid fa-triangle-exclamation me-1"></i> This action will permanently remove selected records.
                </p>
            </div>
        `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete Selected",
    cancelButtonText: "Cancel",
    customClass: {
      confirmButton: "btn btn-1",
      cancelButton: "btn btn-2",
      popup: "swal2-border-radius",
    },
    preConfirm: () => {
      const checkedBoxes = document.querySelectorAll(".delTypes-chk:checked");
      if (checkedBoxes.length === 0) {
        Swal.showValidationMessage("Please select at least one classification to delete");
        return false;
      }
      return Array.from(checkedBoxes).map((cb) => cb.value);
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const typesToDelete = result.value;
      let finalResponse = "ok";

      typesToDelete.forEach((type) => {
        let url = "";
        if (type === "pickup") url = "/pickuplocation/delete";
        else if (type === "delivery") url = "/deliverylocation/delete";
        else if (type === "waypoint") url = "/location/delete";

        // ID eka pass karanna oni eka classification ekata
        let recordToDelete = { id: dataOb.ids[type] };
        let response = httpServiceRequest(url, "DELETE", recordToDelete);
        if (response !== "ok") finalResponse = response;
      });

      if (finalResponse === "ok") {
        Swal.fire({
          title: "Deleted!",
          text: "Selected location classifications have been removed.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal2-border-radius" },
        });
        refreshLocationForm();
      } else {
        Swal.fire({
          title: "Delete Failed",
          text: finalResponse,
          icon: "error",
          customClass: { confirmButton: "btn btn-1", popup: "swal2-border-radius" },
        });
      }
    }
  });
};
// ================= end delete functions =================================================


// ================== view & edit functions =================================================
// view functions eka
const locationView = (dataOb) => {
  // View logic
};

// edit function eka
const locationEdit = (dataOb) => {
  locations = JSON.parse(JSON.stringify(dataOb));
  oldLocations = JSON.parse(JSON.stringify(dataOb));

  // Reset checkboxes first
  pickupLocationChkbox.checked = false;
  deliveryLocationChkbox.checked = false;
  viaLocationChkbox.checked = false;

  [pickupLocationChkbox, deliveryLocationChkbox, viaLocationChkbox].forEach((el) => (el.disabled = false));

  dataOb.types.forEach((type) => {
    if (type === "pickup") {
      pickupLocationChkbox.checked = true;
      pickupLocationChkbox.disabled = true;
    } else if (type === "delivery") {
      deliveryLocationChkbox.checked = true;
      deliveryLocationChkbox.disabled = true;
    } else if (type === "waypoint") {
      viaLocationChkbox.checked = true;
      viaLocationChkbox.disabled = true;
    }
  });

  selectCompanyNameForLocation.value = JSON.stringify(dataOb.customer_id);
  $(selectCompanyNameForLocation).trigger("change");
  select2Default([document.getElementById("selectCompanyNameForLocation")]);
  locationName.value = dataOb.name;
  locationAddress.value = dataOb.address;
  locationLatitude.value = dataOb.latitude;
  locationLongitude.value = dataOb.longitude;

  // Make fields ReadOnly/Disabled
  [selectCompanyNameForLocation, locationName, locationAddress, locationLatitude, locationLongitude].forEach((el) => {
    if (el.tagName === "SELECT") el.disabled = true;
    else el.readOnly = true;
    el.style.backgroundColor = "#f8fafc"; // Light gray to indicate readonly
  });

  if (map && dataOb.latitude && dataOb.longitude) {
    const latlng = L.latLng(dataOb.latitude, dataOb.longitude);
    map.setView(latlng, 15);
    if (marker) {
      marker.setLatLng(latlng);
    } else {
      marker = L.marker(latlng, { icon: createCustomIcon() }).addTo(map);
    }
  }

  submitbtn.style.display = "none";
  updatebtn.style.display = "";
};
// ================= end view & edit functions =================================================




// ================== submit & check error functions =========================================================
//Need to check all the fields are fill
const checkFormError = () => {
  let errors = "";

  if (locations.customer_id == null) {
    errors = errors + "Select Company Name..! \n";
  }
  if (locations.latitude == null) {
    errors = errors + "Please Enter/Pick Latitude..! \n";
  }
  if (locations.longitude == null) {
    errors = errors + "Please Enter/Pick Longitude..! \n";
  }
  if (locations.address == null) {
    errors = errors + "Please Enter/Pick Address..! \n";
  }
  if (pickupLocationChkbox.checked == false && viaLocationChkbox.checked == false && deliveryLocationChkbox.checked == false) {
    errors = errors + "Please Select At Least One Classification..! \n";
  }
  return errors;
};

const pickupLocationChkbox = document.getElementById("pickupLocationChkbox");
const viaLocationChkbox = document.getElementById("viaLocationChkbox");
const deliveryLocationChkbox = document.getElementById("deliveryLocationChkbox");

// get all the checkbox value
const getCheckboxValue = () => {
  locations.types = []; // array eka clear karanwaa
  if (pickupLocationChkbox.checked) {
    locations.types.push(pickupLocationChkbox.value);
  }
  if (viaLocationChkbox.checked) {
    locations.types.push(viaLocationChkbox.value);
  }
  if (deliveryLocationChkbox.checked) {
    locations.types.push(deliveryLocationChkbox.value);
  }
};

//Booking from submit event function
const locationFormSubmit = () => {
  getCheckboxValue(); // Call to populate locations.types
  console.log(locations);

  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    // errors not exit
    let titleText = "Confirm Location Save";
    let bodyText = "Are you sure you want to save this new location?";
    let confirmBtnText = "Yes, Save Location";

    if (typeof oldLocations !== "undefined" && oldLocations !== null) {
      titleText = "Confirm Location Update";
      bodyText = "Are you sure you want to update this location's details?";
      confirmBtnText = "Yes, Update Location";
    }

    let userConfirm = Swal.fire({
      title: titleText,
      text: bodyText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: confirmBtnText,
      allowOutsideClick: false,
      customClass: {
        cancelButton: "btn btn-1",
        confirmButton: "btn btn-2",
        popup: "swal2-border-radius",
      },
    }).then((userConfirm) => {
      if (userConfirm.isConfirmed) {
        if (pickupLocationChkbox.checked) {
          response = httpServiceRequest("/pickuplocation/insert", "POST", locations);
        }
        if (deliveryLocationChkbox.checked) {
          response = httpServiceRequest("/deliverylocation/insert", "POST", locations);
        }
        if (viaLocationChkbox.checked) {
          response = httpServiceRequest("/location/insert", "POST", locations);
        }

        if (response === "ok") {
          Swal.fire({
            title: "Location Saved!",
            text: "New location details have been successfully saved.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: { popup: "swal2-border-radius" },
          });
          refreshLocationForm();
        } else {
          Swal.fire({
            title: "Save Failed",
            text: response,
            icon: "error",
            customClass: { confirmButton: "btn btn-1", popup: "swal2-border-radius" },
          });
        }
      } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: "Cancelled",
          text: "Operation cancelled.",
          icon: "error",
          allowOutsideClick: false,
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
// ================= end submit & check error functions =========================================================



// ================= update functions =========================================================
// update thiyenawd kiyala check karan function eka
const checkFormUpdate = () => {
  getCheckboxValue(); // First update the current types from checkboxes

  let updates = "";
  if (locations != null && oldLocations != null) {
    // type eka change welada kiyala balanna oni
    const currentTypes = [...locations.types].sort().join(",");
    const oldTypes = [...oldLocations.types].sort().join(",");

    if (currentTypes !== oldTypes) {
      updates += "Location classifications have changed. <br>";
    }
  }

  return updates;
};

// update btnn eke function eka
const locationUpdate = () => {
  let updates = checkFormUpdate();
  if (updates == "") {
    Swal.fire({
      title: "Nothing to Update",
      text: "You have not made any changes to the location.",
      icon: "info",
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    return;
  }

  Swal.fire({
    title: "Confirm Location Update",
    text: "Are you sure you want to update this location's details?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Update Location",
    cancelButtonText: "Cancel",
    customClass: {
      confirmButton: "btn btn-1",
      cancelButton: "btn btn-2",
      popup: "swal2-border-radius",
    },
  }).then((userConfirm) => {
    if (userConfirm.isConfirmed) {
      // methandi karanne aluthin add wechhc type eka mkkd kiyala balal ekata adal api eka witharak update karanawa
      if (locations.types.includes("pickup") && !oldLocations.types.includes("pickup")) {
        response = httpServiceRequest("/pickuplocation/insert", "POST", locations);
      }
      if (locations.types.includes("delivery") && !oldLocations.types.includes("delivery")) {
        response = httpServiceRequest("/deliverylocation/insert", "POST", locations);
      }
      if (locations.types.includes("waypoint") && !oldLocations.types.includes("waypoint")) {
        response = httpServiceRequest("/location/insert", "POST", locations);
      }

      if (response === "ok") {
        Swal.fire({
          title: "Location Updated!",
          text: "The location details have been successfully updated.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal2-border-radius" },
        });
        refreshLocationForm();
      } else {
        Swal.fire({
          title: "Update Failed",
          text: response,
          icon: "error",
          customClass: { confirmButton: "btn btn-1", popup: "swal2-border-radius" },
        });
      }
    } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: "Cancelled",
        text: "Location update process cancelled!",
        icon: "error",
        allowOutsideClick: false,
        customClass: { confirmButton: "btn btn-1", popup: "swal2-border-radius" },
      });
    }
  });
};
// ================ end update functions =========================================================


// ================= refresh functions =========================================================

// Reset form function
const refreshLocationForm = () => {
  locations = new Object();
  locations.types = [];
  oldLocations = null;

  locationForm.reset();
  setDefault([locationName, locationLatitude, locationLongitude, locationAddress]);
  select2Default([document.getElementById("selectCompanyNameForLocation")]);


  // Re-enable all fields
  [selectCompanyNameForLocation, locationName, locationLatitude, locationLongitude, locationAddress].forEach((el) => {
    el.readOnly = false;
    el.disabled = false;
    el.style.backgroundColor = "";
  });
  [pickupLocationChkbox, deliveryLocationChkbox, viaLocationChkbox].forEach((el) => {
    el.disabled = false;
  });

  submitbtn.style.display = "";
  updatebtn.style.display = "none";

  let compnayNames = getServiceRequest("/customer/bycustomerstatus");
  dataFilIntoSelect(selectCompanyNameForLocation, "Select Company Name", compnayNames, "company_name");

  // searchinput.value = "";

  // Load table
  let allPickupLocations = getServiceRequest("/pickuplocation/active");
  let allDeliveryLocations = getServiceRequest("/deliverylocation/active");
  let allWaypointLocations = getServiceRequest("/location/active");
  // type eka add karala merge karanawa eka array ekakata
  let allLocations = [
    ...allPickupLocations.map((loc) => ({
      ...loc,
      type: "pickup",
      time: loc.added_datetime,
    })),
    ...allDeliveryLocations.map((loc) => ({
      ...loc,
      type: "delivery",
      time: loc.added_datetime,
    })),
    ...allWaypointLocations.map((loc) => ({
      ...loc,
      type: "waypoint",
      time: loc.added_datetime,
    })),
  ];
  //ekama ewa thiyena group karagnnawa
  let grouped = {};
  allLocations.forEach((location) => {
    let key = location.latitude + "_" + location.longitude;
    if (!grouped[key]) {
      grouped[key] = {
        name: location.name,
        customer_id: location.customer_id,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        times: [],
        types: [],
        ids: {},
        latestId: location.id,
        latestTime: location.time, // last time eka gnnawa
      };
    }

    if (!grouped[key].types.includes(location.type)) {
      grouped[key].types.push(location.type);
      grouped[key].times.push(location.type);
      grouped[key].ids[location.type] = location.id;
      grouped[key].latestId = location.id;

      // latest time eka update karanawa, methanin last-added eka track karanawa
      if (
        !grouped[key].latestTime ||
        new Date(location.time) > new Date(grouped[key].latestTime)
      ) {
        grouped[key].latestTime = location.time;
      }
    }
  });

  let finalLocations = Object.values(grouped);

  // ⬇ latest time eka anuwa descending order ekata sort karanawa (aluthma eka top ekata)
  finalLocations.sort((a, b) => new Date(b.latestTime) - new Date(a.latestTime));
  loadLocationTable(finalLocations);
};

// ================== end refresh functions =========================================================



// ================= export functions =========================================================
// Export Functionality
const exportTable = (type) => {
  if (type === "excel") exportTableToExcelWithSheetJS("#locationDataTable", "locations", { sheetName: "Locations" });
  else if (type === "pdf") exportTableToPdfWithJsPdf("#locationDataTable", "locations", { title: "Locations" });
  else if (type === "print") window.print();
};
// ================= end export functions =========================================================



//Alert Box Call function
Swal.isVisible();
