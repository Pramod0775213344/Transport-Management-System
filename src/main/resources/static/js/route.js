// load weddima map eka load karanwa
window.addEventListener("load", () => {
  initMap();
  refreshRouteForm();
});

// Table loading
const loadRouteTable = (routeList) => {
  if ($.fn.dataTable.isDataTable("#routeDataTable")) {
    $("#routeDataTable").DataTable().clear().destroy();
  }
  let propertyList = [
    { propertyName: "route_name", dataType: "string" },
    { propertyName: getCustomer, dataType: "function" },
    { propertyName: getPickupLocationForRoute, dataType: "function" },
    { propertyName: getDeliveryLocationForRoute, dataType: "function" },
    { propertyName: getViaLocationsForRoute, dataType: "function" },
    { propertyName: "route_distance", dataType: "string" },
    { propertyName: getRouteStatus, dataType: "function" },
  ];

  dataFillIntoTheInnerTable(routeTableBody, routeList, propertyList, routeEdit, routeDelete);

  const table = $("#routeDataTable").DataTable({
    dom: "rtip", // Hide default search and length
    pageLength: 25,
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
};

const getCustomer = (dataob) => {
  return dataob.customer_id.company_name;
};

const getPickupLocationForRoute = (dataob) => {
  return dataob.pickup_locations_id.name;
};

const getDeliveryLocationForRoute = (dataob) => {
  return dataob.delivery_locations_id.name;
};

const getViaLocationsForRoute = (dataob) => {
  //   vialoaction available nam ewa view karanwa naththan - meka view karanwa
  if (dataob.locations.length > 0) {
    let locations = "";
    dataob.locations.forEach((vialocation, index) => {
      if (dataob.locations.length - 1 == index) {
        locations += vialocation.name;
      } else {
        locations += vialocation.name + ",<br>";
      }
    });
    return locations;
  } else {
    return " - ";
  }
};

const getRouteStatus = (dataob) => {
  if (dataob.route_status_id.status == "Active") {
    return "<span class='status-badge status-active'> <span class='dot'> </span>" + dataob.route_status_id.status + "</span>";
  }

  if (dataob.route_status_id.status == "Inactive") {
    return "<span class='status-badge status-pending'> <span class='dot'> </span>" + dataob.route_status_id.status + "</span>";
  }
  if (dataob.route_status_id.status == "Deleted") {
    return "<span class='status-badge status-inactive'> <span class='dot'> </span>" + dataob.route_status_id.status + "</span>";
  }
};

// Refresh form and table
const refreshRouteForm = () => {
  routeOb = new Object();
  routeOb.locations = [];
  waypoints = [];

  routeForm.reset();
  // refresh weddi distance eka 0 wenna oni
  document.getElementById("routeDistanceDisplay").innerText = "0.00 km";

  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }

  clearAllMarkers();

  // Set default values (assumes setDefault is available from reusabal.js)
  setDefault([selectCustomer, routeName, selectPickup, selectDelivery, selectVia, waypointslist]);
  waypointslist.innerHTML = " ";

  // Get Customers
  let customers = getServiceRequest("/customer/byactiveagreements");
  dataFilIntoSelect(selectCustomer, "Select Customer", customers, "company_name");

  let pickupLocation = getServiceRequest("/pickuplocation/active");
  dataFilIntoSelect(selectPickup, "Select Pickup Location", pickupLocation, "name");

  viaLocations = getServiceRequest("/location/active");
  dataFilIntoSelect(selectVia, "Select Via Location", viaLocations, "name");

  let deliveryLocation = getServiceRequest("/deliverylocation/active");
  dataFilIntoSelect(selectDelivery, "Select Delivery Location", deliveryLocation, "name");

  // Load table
  let allRoutes = getServiceRequest("/route/alldata"); // Guessing this endpoint
  loadRouteTable(allRoutes);

  btnSubmit.style.display = "";
  btnUpdate.style.display = "none";
};

// cutomer select karaddi contact details auto fill kranwa function eka
let selectCustomerNameElement = document.getElementById("selectCustomer");
selectCustomerNameElement.addEventListener("change", () => {
  //   cutomer anuwa loaction eka fill karanawa
  companyname = JSON.parse(selectCustomerNameElement.value);

  let pickupLocation = getServiceRequest("/pickuplocation/bycustomerid?customer_id=" + companyname.id);
  dataFilIntoSelect(selectPickup, "Select Pickup Location", pickupLocation, "name");

  viaLocations = getServiceRequest("/location/bycustomerid?customer_id=" + companyname.id);
  dataFilIntoSelect(selectVia, "Select Via Location", viaLocations, "name");

  let deliveryLocation = getServiceRequest("/deliverylocation/bycustomerid?customer_id=" + companyname.id);
  dataFilIntoSelect(selectDelivery, "Select Delivery Location", deliveryLocation, "name");
});

let map;
let routingControl;

// Initialize Leaflet Map
function initMap() {
  if (typeof L === "undefined") {
    console.warn("Leaflet library not loaded.");
    return;
  }
  if (map) return;

  map = L.map("map").setView([7.8731, 80.7718], 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Force map to recognize container size
  setTimeout(() => {
    map.invalidateSize();
  }, 500);

  // Add event listeners
  // Add event listeners (assuming ID exists in HTML)
  const addWaypointBtn = document.getElementById("add-waypoint");
  if (addWaypointBtn) {
    addWaypointBtn.addEventListener("click", addWaypoint);
  }

  // manage markers manually for better control
  window.currentMarkers = {};

  document.getElementById("selectPickup").addEventListener("change", () => {
    if (document.getElementById("selectPickup").value !== "") {
      let loc = JSON.parse(document.getElementById("selectPickup").value);
      if (loc.latitude && loc.longitude) {
        updatePointMarker('pickup', loc);
      }
    }
    calculateRoute();
  });

  document.getElementById("selectDelivery").addEventListener("change", () => {
    if (document.getElementById("selectDelivery").value !== "") {
      let loc = JSON.parse(document.getElementById("selectDelivery").value);
      if (loc.latitude && loc.longitude) {
        updatePointMarker('delivery', loc);
      }
    }
    calculateRoute();
  });

  document.getElementById("selectVia").addEventListener("change", () => {
    if (document.getElementById("selectVia").value !== "") {
      let loc = JSON.parse(document.getElementById("selectVia").value);
      if (loc.latitude && loc.longitude) {
        updatePointMarker('viaTemp', loc);
      }
    }
  });
}

const clearAllMarkers = () => {
  if (window.currentMarkers) {
    Object.keys(window.currentMarkers).forEach(key => {
      if (Array.isArray(window.currentMarkers[key])) {
        window.currentMarkers[key].forEach(m => map.removeLayer(m));
      } else {
        map.removeLayer(window.currentMarkers[key]);
      }
    });
  }
  window.currentMarkers = {
    viaList: []
  };
};

const updatePointMarker = (type, loc) => {
  if (type === 'viaTemp') {
    if (window.currentMarkers[type]) {
      map.removeLayer(window.currentMarkers[type]);
    }
    window.currentMarkers[type] = L.marker([loc.latitude, loc.longitude])
      .addTo(map)
      .bindPopup("SELECTED: " + loc.name)
      .openPopup();
  } else {
    // Normal pickup/delivery logic is handled in calculateRoute redraw
  }
  map.setView([loc.latitude, loc.longitude], 12);
};

// Add waypoint
const addWaypoint = () => {
  if (selectVia.value !== "") {
    let selectedViaLocations = JSON.parse(selectVia.value);
    routeOb.locations.push(selectedViaLocations);
    customeDataFilIntoSelect(waypointslist, "", routeOb.locations, "name");
    
    // Clear temp marker
    if (window.currentMarkers['viaTemp']) {
      map.removeLayer(window.currentMarkers['viaTemp']);
      delete window.currentMarkers['viaTemp'];
    }

    calculateRoute();

    let extIndex = viaLocations.map((viaLocation) => viaLocation.id).indexOf(selectedViaLocations.id);
    if (extIndex != -1) {
      viaLocations.splice(extIndex, 1);
    }
    dataFilIntoSelect(selectVia, "Select Via Location", viaLocations, "name");
  }
};

//customer Data fill in to the dynamic select elements for select waya locations
const customeDataFilIntoSelect = (parentId, massage, dataList, displayProperties) => {
  parentId.innerHTML = "";
  if (massage != "") {
    let optionMsgEs = document.createElement("option");
    optionMsgEs.value = " ";
    optionMsgEs.selected = "selected";
    optionMsgEs.disabled = "disabled";
    optionMsgEs.innerText = massage;
    parentId.appendChild(optionMsgEs);
  }

  dataList.forEach((dataOb) => {
    let div = document.createElement("div");
    div.className = "row mt-2";
    let divcol = document.createElement("div");
    divcol.className = "col-10";

    let option = document.createElement("Option");
    option.value = JSON.stringify(dataOb);
    option.innerText = dataOb[displayProperties];
    // wayalocation map eke set karanna oni
    option.dataset.location = JSON.stringify(dataOb);

    let divcolnext = document.createElement("div");
    divcolnext.className = "col-2";
    let button = document.createElement("button");
    button.className = "remove-btn";
    button.innerHTML = "Remove";
    button.onclick = () => {
      removeWaypoint(dataOb);
    };

    divcol.appendChild(option);
    divcolnext.appendChild(button);
    div.appendChild(divcol);
    div.appendChild(divcolnext);
    parentId.appendChild(div);
  });
};

// remove function via location from select list
const removeWaypoint = (dataOb) => {
  console.log(dataOb);
  let selectedViaLocations = JSON.parse(JSON.stringify(dataOb));
  console.log(selectedViaLocations);
  viaLocations.push(selectedViaLocations);
  dataFilIntoSelect(selectVia, "Select Via Location", viaLocations, "name");

  let extIndex = routeOb.locations.map((viaLocation) => viaLocation.id).indexOf(selectedViaLocations.id);
  if (extIndex != -1) {
    routeOb.locations.splice(extIndex, 1);
  }
  customeDataFilIntoSelect(waypointslist, "", routeOb.locations, "name");
  // auto calculate the route when change
  calculateRoute();
};

// calculate distance and route
function calculateRoute() {
  const waypoints = [];
  
  // Clear existing real markers (not temp ones)
  if (window.currentMarkers['pickup']) map.removeLayer(window.currentMarkers['pickup']);
  if (window.currentMarkers['delivery']) map.removeLayer(window.currentMarkers['delivery']);
  window.currentMarkers.viaList.forEach(m => map.removeLayer(m));
  window.currentMarkers.viaList = [];

  // Get waypoints from routeOb.locations
  if (routeOb.locations && routeOb.locations.length > 0) {
    routeOb.locations.forEach((loc) => {
      if (loc.latitude && loc.longitude) {
        waypoints.push(L.latLng(loc.latitude, loc.longitude));
        // Add permanent marker for added via location
        let m = L.marker([loc.latitude, loc.longitude], {
          icon: L.divIcon({ className: 'via-marker', html: '<i class="fa-solid fa-location-dot" style="color: #6366f1;"></i>' })
        }).addTo(map).bindPopup("Via: " + loc.name);
        window.currentMarkers.viaList.push(m);
      }
    });
  }

  const originVal = document.getElementById("selectPickup").value;
  const destinationVal = document.getElementById("selectDelivery").value;

  if (!originVal || !destinationVal) {
    return;
  }

  const originParams = JSON.parse(originVal);
  const destinationParams = JSON.parse(destinationVal);

  // Re-add pickup/delivery markers
  window.currentMarkers['pickup'] = L.marker([originParams.latitude, originParams.longitude])
    .addTo(map).bindPopup("Pickup: " + originParams.name);
  window.currentMarkers['delivery'] = L.marker([destinationParams.latitude, destinationParams.longitude])
    .addTo(map).bindPopup("Delivery: " + destinationParams.name);

  if (!originParams.latitude || !originParams.longitude || !destinationParams.latitude || !destinationParams.longitude) {
    console.error("Coordinates missing for offline distance calculation.");
    return;
  }

  if (routingControl) {
    map.removeControl(routingControl);
  }

  // Build full waypoint list
  const fullWaypoints = [
    L.latLng(originParams.latitude, originParams.longitude),
    ...waypoints,
    L.latLng(destinationParams.latitude, destinationParams.longitude)
  ];

  // Try GraphHopper first, but provide a way to fallback
  const ghRouter = L.Routing.graphhopper(undefined, {
    url: "http://localhost:8989/route",
  });

  routingControl = L.Routing.control({
    waypoints: fullWaypoints,
    routeWhileDragging: false,
    addWaypoints: false,
    show: false,
    router: ghRouter,
    lineOptions: {
      styles: [{ color: '#3b82f6', opacity: 0.8, weight: 6 }]
    },
    // Don't create duplicate markers if we already have them
    createMarker: function() { return null; }
  })
    .on("routesfound", function (e) {
      const routes = e.routes;
      const summary = routes[0].summary;
      const totalDistance = (summary.totalDistance / 1000).toFixed(2);

      document.getElementById("routeDistanceDisplay").innerText = `${totalDistance} km`;
      routeOb.route_distance = totalDistance;
    })
    .on("routingerror", function (e) {
      console.error("GraphHopper routing error, falling back to OSRM:", e.error);
      
      // Remove the failed control
      if (routingControl) map.removeControl(routingControl);
      
      // Create new control without explicit router (defaults to OSRM)
      routingControl = L.Routing.control({
        waypoints: fullWaypoints,
        routeWhileDragging: false,
        addWaypoints: false,
        show: false,
        lineOptions: {
          styles: [{ color: '#10b981', opacity: 0.8, weight: 6 }]
        },
        createMarker: function() { return null; }
      }).addTo(map);

      routingControl.on("routesfound", function (e) {
        const routes = e.routes;
        const summary = routes[0].summary;
        const totalDistance = (summary.totalDistance / 1000).toFixed(2);
        document.getElementById("routeDistanceDisplay").innerText = `${totalDistance} km (OSRM)`;
        routeOb.route_distance = totalDistance;
      });
    })
    .addTo(map);
}

const routeDelete = (dataOb) => {
  Swal.fire({
    title: "Confirm Route Deletion",
    text: "Are you sure you want to delete this system route? This action cannot be undone!",
    icon: "warning",
    iconColor: "#ef4444",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete Route",
    cancelButtonText: "No, Keep it",
    allowOutsideClick: false,
    customClass: {
      confirmButton: "btn btn-4",
      cancelButton: "btn btn-1",
      popup: "swal2-border-radius",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      let response = httpServiceRequest("/route/delete", "DELETE", dataOb);
      if (response === "ok") {
        Swal.fire({
          title: "Route Deleted!",
          text: "The system route has been successfully removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-border-radius",
          },
        });
        refreshRouteForm();
      } else {
        Swal.fire({
          title: "Deletion Failed",
          text: response,
          icon: "error",
          customClass: {
            confirmButton: "btn btn-1",
            popup: "swal2-border-radius",
          },
        });
      }
    }
  });
};

const routeEdit = (dataOb) => {
  console.log("Edit:", dataOb);
  routeOb = JSON.parse(JSON.stringify(dataOb));
  oldRouteOb = JSON.parse(JSON.stringify(dataOb));

  // Fill fields
  selectCustomer.value = JSON.stringify(dataOb.customer_id);

  routeName.value = dataOb.route_name;
  selectPickup.value = JSON.stringify(dataOb.pickup_locations_id);
  selectDelivery.value = JSON.stringify(dataOb.delivery_locations_id);

  // waya locations thiyewn nam withrak meka wada karanawa
  if (dataOb.locations != null && dataOb.locations.length > 0) {
    viaLocations = getServiceRequest("/location/withoutselectlocationforroutes?routeId=" + dataOb.id + "&customerId=" + dataOb.customer_id.id);
    console.log(viaLocations);
    dataFilIntoSelect(selectVia, "Select Via Location", viaLocations, "name");

    // wayapoint list ekata data fill karanwa
    customeDataFilIntoSelect(waypointslist, "", dataOb.locations, "name");

    // waya location add karala thiyewn nam route eka calculate karawanawa
    calculateRoute();
  }
  calculateRoute();

  btnSubmit.style.display = "none";
  btnUpdate.style.display = "";
};

const routeView = (dataOb) => {
  // Implement view if needed
  console.log("View:", dataOb);
};

// form eke error check karanwa
const checkFormError = () => {
  let errors = "";

  if (routeOb.customer_id == null) {
    errors = errors + "Please Select Customer Name. <br>";
    selectCustomer.classList.add("is-invalid");
  }
  if (routeOb.route_name == null) {
    errors = errors + "Please Enter Route Name. <br>";
    routeName.classList.add("is-invalid");
  }
  if (routeOb.pickup_locations_id == null) {
    errors = errors + "Please Select Pickup Location. <br>";
    selectPickup.classList.add("is-invalid");
  }
  if (routeOb.delivery_locations_id == null) {
    errors = errors + "Please Select Delivery Location. <br>";
    selectDelivery.classList.add("is-invalid");
  }
  if (routeOb.route_distance == null) {
    errors = errors + "Route Distance not calculated. <br>";
  }
  return errors;
};

// Form submission
const routeSubmit = () => {
  console.log(routeOb);
  let errors = checkFormError();
  if (errors === "") {
    Swal.fire({
      title: "Confirm Route Submission",
      text: "Are you sure you want to save this new system route?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Save Route",
      cancelButtonText: "Cancel",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-2",
        cancelButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    }).then((userConfirm) => {
      if (userConfirm.isConfirmed) {
        let response = httpServiceRequest("/route/insert", "POST", routeOb); // Guessing endpoint
        if (response === "ok") {
          Swal.fire({
            title: "Route Saved!",
            text: "New system route has been successfully saved.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          refreshRouteForm();
        } else {
          Swal.fire({
            title: "Submission Failed",
            text: response,
            icon: "error",
            customClass: {
              confirmButton: "btn btn-1",
              popup: "swal2-border-radius",
            },
          });
        }
      }
    });
  } else {
    Swal.fire({
      title: "Error!",
      text: errors,
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

// check firm
const checkFormUpdates = () => {
  let updates = "";
  if (routeOb != null && oldRouteOb != null) {
    if (routeOb.route_name != oldRouteOb.route_name) {
      updates = updates + "Route name changed. <br>";
    }
    if (routeOb.route_distance != oldRouteOb.route_distance) {
      updates = updates + "Route Distance changed. <br>";
    }
    if (routeOb.pickup_locations_id.name != oldRouteOb.pickup_locations_id.name) {
      updates = updates + "Pickup location changed. <br>";
    }
    if (routeOb.delivery_locations_id.name != oldRouteOb.delivery_locations_id.name) {
      updates = updates + "Delivery location changed. <br>";
    }
    if (routeOb.locations.length != oldRouteOb.locations.length) {
      updates = updates + "Route Waypoints Changed. <br>";
    }
  }
  return updates;
};

// update button
const routeUpdate = () => {
  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    let updates = checkFormUpdates();
    // updates not exit
    if (updates == "") {
      Swal.fire({
        title: "Nothing to Update",
        text: "No changes were detected in the route details.",
        icon: "info",
        allowOutsideClick: false,
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    } else {
      let userConfirm = Swal.fire({
        title: "Confirm Route Update",
        text: "Are you sure you want to update this route's details?" + updates,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Update Booking",
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
          let postResponse = httpServiceRequest("/route/update", "PUT", routeOb);
          if (postResponse == "ok") {
            Swal.fire({
              title: "Route Updated Successfully!",
              text: "The Route details have been successfully synchronized.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
              customClass: {
                popup: "swal2-border-radius",
              },
            });
            refreshRouteForm();
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

// Export Functionality
const exportTable = (type) => {
  const table = $("#routeDataTable").DataTable();

  if (type === "excel") {
    table.button(".buttons-excel").trigger();
  } else if (type === "pdf") {
    table.button(".buttons-pdf").trigger();
  } else if (type === "print") {
    window.print();
  }
};
