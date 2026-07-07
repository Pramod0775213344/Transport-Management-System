// Window load Function
window.addEventListener("load", () => {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      refreshForm();
    } catch (e) {
      console.error("Error during booking page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);

  // Modal hidden event to refresh/clear after close completes animation
  $("#bookingFormModal").on("hidden.bs.modal", function () {
    refreshForm();
  });


});

// load bookingtable with search area
const searchBooking = () => {
  if ($.fn.dataTable.isDataTable("#bookingTable")) {
    $("#bookingTable").DataTable().clear().destroy();
  }
  let searchCustomerName = document.getElementById("searchCustomerName").value;
  let searchVehicleType = document.getElementById("searchVehicleType").value;

  if (searchCustomerName != "" && searchVehicleType != "") {
    let bookingsByCustomerAndVehicleType = getServiceRequest(
      "/booking/inproccessbookingbycustomeridandvehicletypeid?customerid=" + JSON.parse(searchCustomerName).id + "&vehicletypeid=" + JSON.parse(searchVehicleType).id,
    );
    loadBookingTable(bookingsByCustomerAndVehicleType);
  } else if (searchVehicleType != "") {
    let bookingsByVehicleType = getServiceRequest("/booking/inproccessbookingbyvehicletypeid?vehicletypeid=" + JSON.parse(searchVehicleType).id);
    loadBookingTable(bookingsByVehicleType);
  } else if (searchCustomerName != "") {
    let bookingsByCustomer = getServiceRequest("/booking/inproccessbookingbycustomerid?customerid=" + JSON.parse(searchCustomerName).id);
    loadBookingTable(bookingsByCustomer);
  } else {
    Swal.fire({
      title: "Selection Required",
      text: "Please select a Customer Name or Vehicle Type to search.",
      icon: "info",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    loadBookingTable(bookings);
  }
};

// Booking Table Load Function
const loadBookingTable = (bookings) => {
  if ($.fn.dataTable.isDataTable("#bookingTable")) {
    $("#bookingTable").DataTable().clear().destroy();
  }
  // Property List
  let propertyList = [
    { propertyName: "booking_no", dataType: "string" },
    { propertyName: getCustomer, dataType: "function" },
    { propertyName: getPickupLocation, dataType: "function" },
    { propertyName: getDeliveryLocation, dataType: "function" },
    { propertyName: "distance", dataType: "string" },
    { propertyName: getStatus, dataType: "function" },
  ];

  // Data Filling Function to Table
  dataFillIntoTheTable(bookingTableBody, bookings, propertyList, bookingView, bookingEdit, bookingDelete);

  const table = $("#bookingTable").DataTable({
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
      table.page.len(this.value).draw();
    });

  // btn hide karanawa according to the privileges
  applyPrivileges("Booking Management", "bookingTable", { add: addButton });

  // meka use karanne datatable eke pagination, search, length change karama hide/show karanna according to privileges
  // pagination walin maru weddi nawath reset karan nisa hide karapuwa ayin wenawa.eka nawaththna me function eka call karanawa
  table.on("draw.dt", function () {
    applyPrivileges("Booking Management", "bookingTable", { add: addButton });
  });
};

// get customer name
const getCustomer = (dataOb) => {
  return dataOb.customer_id.company_name;
};

// get pickup location
const getPickupLocation = (dataOb) => {
  return dataOb.pickup_locations_id.name;
};

// get via locations if available
const getDeliveryLocation = (dataOb) => {
  return dataOb.delivery_locations_id.name;
};

// Status of The booking Table
let getStatus = (dataOb) => {
  if (dataOb.booking_status_id.status == "Inproccess") {
    return "<span class='status-badge status-inactive mt-2'>" + dataOb.booking_status_id.status + "</span>";
  }
};

// Delete Button Of the Table
const bookingDelete = (dataOb, index) => {
  console.log(dataOb);
  let userConfirm = Swal.fire({
    title: "Confirm Booking Deletion",
    text: "Are you sure you want to delete this booking? This action cannot be undone!",
    icon: "warning",
    iconColor: "#ef4444",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete Booking",
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
      let deleteresponse = httpServiceRequest("booking/delete", "DELETE", dataOb);
      if (deleteresponse == "ok") {
        Swal.fire({
          title: "Booking Deleted!",
          text: "The booking has been successfully removed from the system.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-border-radius",
          },
        });
        refreshForm();
      } else {
        Swal.fire({
          title: "Deletion Failed",
          text: deleteresponse,
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

// View Button Of the Table
const bookingView = (dataOb, index) => {
  console.log(dataOb);
  statusTracker(dataOb);
  // map initialize block
  initMap();

  // map container style check to ensure it is visible
  const mapElement = document.getElementById("map");
  if (mapElement) {
    mapElement.style.display = "block";
  }

  // Clear existing routing control from previous view/calculation
  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }

  //----------------------------- map eke route eka view karanawa-----------------------

  // pickuploaction eke
  const plLatitude = dataOb.pickup_locations_id.latitude;
  const plLongitude = dataOb.pickup_locations_id.longitude;

  // dilvery location eke
  const dlLatitude = dataOb.delivery_locations_id.latitude;
  const dlLongitude = dataOb.delivery_locations_id.longitude;

  const waypoints = [];

  if (plLatitude && plLongitude) {
    waypoints.push(L.latLng(plLatitude, plLongitude));
  }

  // waya location avavilable nam eke latitide longitude eka gnnawa
  if (dataOb.locations && dataOb.locations.length > 0) {
    dataOb.locations.forEach(loc => {
      if (loc.latitude && loc.longitude) {
        waypoints.push(L.latLng(loc.latitude, loc.longitude));
      }
    });
  }

  if (dlLatitude && dlLongitude) {
    waypoints.push(L.latLng(dlLatitude, dlLongitude));
  }

  if (waypoints.length >= 2) {
    // Try offline GraphHopper router first
    const offlineRouter = L.Routing.graphhopper(undefined, {
      url: "http://localhost:8989/route",
    });

    const routeLineOptions = {
      styles: [
        { color: '#ffffff', opacity: 0.9, weight: 10 },
        { color: '#f59e0b', opacity: 1, weight: 6 }
      ]
    };

    const createCustomMarker = function (i, wp, n) {
      const markerColor = '#22c55e'; // Premium Green as in user image
      const label = i + 1;
      return L.marker(wp.latLng, {
        icon: L.divIcon({
          className: 'custom-route-marker',
          html: `<div style="
            background: ${markerColor};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 3px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            color: #ffffff;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Outfit', sans-serif;
            font-size: 11px;
          ">${label}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        })
      });
    };

    const updateFloatingPanels = function (routes) {
      if (routes && routes.length > 0) {



        document.getElementById("map-floating-pickup").innerText = dataOb.pickup_locations_id.name;
        document.getElementById("map-floating-delivery").innerText = dataOb.delivery_locations_id.name;

        document.getElementById("map-info-card").style.display = "block";
        document.getElementById("map-route-card").style.display = "block";
      }
    };

    routingControl = L.Routing.control({
      waypoints: waypoints,
      routeWhileDragging: false,
      addWaypoints: false,
      show: false,
      router: offlineRouter,
      lineOptions: routeLineOptions,
      createMarker: createCustomMarker
    })
      .on("routesfound", function (e) {
        updateFloatingPanels(e.routes);
      })
      .on("routingerror", function (e) {
        console.error("GraphHopper view routing error, falling back to OSRM:", e.error);
        if (routingControl) {
          map.removeControl(routingControl);
        }
        // Fallback to online OSRM
        routingControl = L.Routing.control({
          waypoints: waypoints,
          routeWhileDragging: false,
          addWaypoints: false,
          show: false,
          lineOptions: routeLineOptions,
          createMarker: createCustomMarker
        })
          .on("routesfound", function (evt) {
            updateFloatingPanels(evt.routes);
          })
          .addTo(map);
      })
      .addTo(map);
  }

  // booking  details
  document.getElementById("booking-number").innerText = dataOb.booking_no;
  document.getElementById("booking-customer-name").innerText = dataOb.customer_id.company_name;
  document.getElementById("detail-booking-no").innerText = dataOb.booking_no;
  document.getElementById("detail-customer-name").innerText = dataOb.customer_id.company_name;
  document.getElementById("detail-vehicle-type").innerText = dataOb.vehicle_type_id.name;
  document.getElementById("detail-truck-type").innerText = dataOb.vehicle_type_id.name;
  document.getElementById("detail-agreement-no").innerText = dataOb.customer_agreement_id.cus_agreement_no;
  document.getElementById("detail-customer-mobile").innerText = dataOb.customer_id.direct_telephone_no;

  //Contact Person Details bind karanwa dynamically
  const contactName = dataOb.booking_contact_person_name || "Jameson Doe";
  const contactMobile = dataOb.booking_contact_person_mobileno || "+532 6129 257";
  document.getElementById("detail-contact-name").innerText = contactName;
  document.getElementById("detail-contact-mobile").innerText = contactMobile;
  document.getElementById("detail-contact-initial").innerText = contactName.trim().charAt(0).toUpperCase() || "J";

  document.getElementById("map-floating-distance").innerText = dataOb.distance + ` KM`;

  //  Location Details bind karnawa
  const pTime = dataOb.pickup_date_time ? new Date(dataOb.pickup_date_time) : null;
  const dTime = dataOb.delivery_date_time ? new Date(dataOb.delivery_date_time) : null;


  let timelineHtml = '';

  // 1. Pickup
  timelineHtml += `
    <div style="position: relative; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-start; z-index: 2;">
        <div style="position: absolute; left: -36px; top: 4px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            <div style="width: 14px; height: 14px; border-radius: 50%; border: 3px solid #0f172a; background-color: #ffffff; box-shadow: 0 0 0 4px #ffffff;"></div>
        </div>
        <div style="flex: 1; padding-right: 12px;">
            <span style="font-size: 0.7rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; display: block; text-transform: uppercase;">PICKUP</span>
            <span style="font-size: 0.95rem; font-weight: 600; color: #1e293b; display: block; margin-top: 2px;">${dataOb.pickup_locations_id.name}</span>
        </div>
        <div style="font-size: 0.85rem; font-weight: 500; color: #64748b; display: flex; align-items: center; gap: 6px; margin-top: 2px; white-space: nowrap;">
            <i class="fa-regular fa-clock text-slate-400" style="font-size: 0.9rem;"></i>
            <span>${datetimeformat(pTime)}</span>
        </div>
    </div>
  `;

  // 2. Via locations (if any)
  if (dataOb.locations && dataOb.locations.length > 0) {
    dataOb.locations.forEach((loc, idx) => {

      timelineHtml += `
        <div style="position: relative; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-start; z-index: 2;">
            <div style="position: absolute; left: -36px; top: 4px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
                <div style="width: 12px; height: 12px; border-radius: 50%; border: 2.5px solid #94a3b8; background-color: #ffffff; box-shadow: 0 0 0 4px #ffffff;"></div>
            </div>
            <div style="flex: 1; padding-right: 12px;">
                <span style="font-size: 0.7rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; display: block; text-transform: uppercase;">VIA</span>
                <span style="font-size: 0.95rem; font-weight: 600; color: #1e293b; display: block; margin-top: 2px;">${loc.name}</span>
            </div>
            <div style="font-size: 0.85rem; font-weight: 500; color: #64748b; display: flex; align-items: center; gap: 6px; margin-top: 2px; white-space: nowrap;">
            </div>
        </div>
      `;
    });
  }

  // 3. Delivery
  timelineHtml += `
    <div style="position: relative; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-start; z-index: 2;">
             <div style="position: absolute; left: -36px; top: 4px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
                <div style="width: 12px; height: 12px; border-radius: 50%; border: 2.5px solid #94a3b8; background-color: #ffffff; box-shadow: 0 0 0 4px #ffffff;"></div>
            </div>
        <div style="flex: 1; padding-right: 12px;">
            <span style="font-size: 0.7rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; display: block; text-transform: uppercase;">DELIVERY</span>
            <span style="font-size: 0.95rem; font-weight: 600; color: #1e293b; display: block; margin-top: 2px;">${dataOb.delivery_locations_id.name}</span>
        </div>
        <div style="font-size: 0.85rem; font-weight: 500; color: #64748b; display: flex; align-items: center; gap: 6px; margin-top: 2px; white-space: nowrap;">
            <i class="fa-regular fa-clock text-slate-400" style="font-size: 0.9rem;"></i>
            <span>${datetimeformat(dTime)}</span>
        </div>
    </div>
  `;

  const timelineContainer = document.getElementById("detail-location-timeline");
  if (timelineContainer) {
    const connectorHtml = `<div id="timeline-connector-line" style="position: absolute; left: 11px; top: 12px; bottom: 12px; width: 2px; border-left: 2px dashed #cbd5e1; z-index: 1;"></div>`;
    timelineContainer.innerHTML = connectorHtml + timelineHtml;
  }

  // overlay eka open karan function eka
  openBookingDetail();

  // invalidate size with timeout so leaflet map calculates bounds correctly after display block is rendered
  setTimeout(() => {
    if (map) {
      map.invalidateSize();
      if (waypoints.length > 0) {
        const bounds = L.latLngBounds(waypoints);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, 500);
};

//Print Button  Of the Table
const buttonPrintRow = () => {
  let newWindow = window.open();
  let printView =
    "<head><title>TMS</title><link rel='stylesheet' href='/css/common.css'><link rel='stylesheet' href='/css/booking.css'><link rel='stylesheet' href='bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'></head><body>" +
    bookingPrintPreview.outerHTML +
    "</body>";
  newWindow.document.write(printView);

  setTimeout(() => {
    newWindow.stop();
    newWindow.print();
    newWindow.close();
  }, 500);
};

//Edit Button of the Table(for Refilling The Form)
const bookingEdit = (dataOb, index) => {
  console.log(dataOb);

  // reset karanwa via loaction kalin bookin eke thiyena ewa wenna puluwan nisa
  vialocationchkbox.checked = false;
  vialocationLabel.innerText = "Not Available";
  viaLocationCheckbox.style.display = "";
  viaLocation.style.display = "none";
  waypointslist.innerHTML = "";
  booking.locations = [];

  selectCompanyName.value = JSON.stringify(dataOb.customer_id);

  // edita eked customer agreement gahala tiyen vehicle type tika witharak enna oni
  let vehicleTypes = getServiceRequest("vehicletype/bycustomeragreementsandcustomerid?customer_id=" + dataOb.customer_id.id);
  dataFilIntoSelect(selectVehicleType, "Select Vehicle Type", vehicleTypes, "name");

  textContactPerson.value = dataOb.booking_contact_person_name;
  textContactPersonMobileNo.value = dataOb.booking_contact_person_mobileno;

  textPickupDateAndTime.value = dataOb.pickup_date_time;

  textDeliveryDateAndTime.value = dataOb.delivery_date_time;
  textDistance.value = dataOb.distance;

  document.getElementById("selectCompanyName").disabled = true;

  // waya locations thiyewn nam withrak meka wada karanawa
  if (dataOb.locations != null && dataOb.locations.length > 0) {
    vialocationchkbox.checked = true;
    vialocationLabel.innerText = "Available";
    viaLocationCheckbox.style.display = "";
    viaLocation.style.display = "";
    waypointslist.innerHTML = "";
    waypointslist.style.display = "";

    viaLocations = getServiceRequest("/location/withoutselectlocation?bookingid=" + dataOb.id + "&customerId=" + dataOb.customer_id.id);
    console.log(viaLocations);
    dataFilIntoSelect(selectViaLocation, "Select Via Location", viaLocations, "name");

    customeDataFilIntoSelect(waypointslist, dataOb.locations, "name");
  } else {
    vialocationchkbox.checked = false;
    vialocationLabel.innerText = "Not Available";
    viaLocationCheckbox.style.display = "";
    viaLocation.style.display = "none";
    waypointslist.innerHTML = "";
    waypointslist.style.display = "none";
    booking.locations = [];
  }

  selectVehicleType.value = JSON.stringify(dataOb.vehicle_type_id);

  updateButton.style.display = "";
  submitButton.style.display = "none";
  shipmentdetails.style.display = "";

  booking = JSON.parse(JSON.stringify(dataOb));
  oldBooking = JSON.parse(JSON.stringify(dataOb));

  // edit ekedi customer adala location tika witharak fill wenna oni
  let deliveryLocation = getServiceRequest("/deliverylocation/bycustomerid?customer_id=" + dataOb.customer_id.id);
  dataFilIntoSelect(textDeliveryLocation, "Select Delivery Location", deliveryLocation, "name");
  console.log("1" + deliveryLocation);
  textDeliveryLocation.value = JSON.stringify(dataOb.delivery_locations_id);
  deliveryLocationPoint.innerText = dataOb.delivery_locations_id.name;

  // edit ekedi customer adala location tika witharak fill wenna oni
  let pickupLocation = getServiceRequest("pickuplocation/bycustomerid?customer_id=" + dataOb.customer_id.id);
  dataFilIntoSelect(textPickupLocation, "Select Pickup Location", pickupLocation, "name");
  console.log("2-" + pickupLocation);
  textPickupLocation.value = JSON.stringify(dataOb.pickup_locations_id);
  pickupLocationPoint.innerText = dataOb.pickup_locations_id.name;

  console.log(dataOb);

  $("#bookingFormModal").modal("show");
};

//Need to check all the fields are fill
const checkContactPersonCheckBox = document.getElementById("checkContactPersonCheckBox");

// form errors check karanwa
const checkFormError = () => {
  let errors = "";

  if (booking.customer_id == null) {
    errors = errors + "Please Select Company Name.. <br>";
    selectCompanyNameElement.classList.add("is-invalid");
  }
  if (booking.pickup_locations_id == null) {
    errors = errors + "Please Select Pickup Location.. <br>";
    textPickupLocation.classList.add("is-invalid");
  }
  if (booking.pickup_date_time == null) {
    errors = errors + "Please Enter valid Pickup Date And Time.. <br>";
    textPickupDateAndTime.classList.add("is-invalid");
  }
  if (booking.delivery_locations_id == null) {
    errors = errors + "Please Select Delivery Location.. <br>";
    textDeliveryLocation.classList.add("is-invalid");
  }
  if (booking.delivery_date_time == null) {
    errors = errors + "Please Enter Delivery Date And Time.. <br>";
    textDeliveryDateAndTime.classList.add("is-invalid");
  }
  if (booking.distance == null) {
    errors = errors + "Please Calculate the route distance.. <br>";
  }
  if (booking.vehicle_type_id == null) {
    errors = errors + "Please Select requested Vehicle Type.. <br>";
    selectVehicleType.classList.add("is-invalid");
  }
  if (checkContactPersonCheckBox.checked === true) {
    if (booking.booking_contact_person_name == null) {
      errors = errors + "Please Enter Booking Contact Person name... <br>";
      textContactPerson.classList.add("is-invalid");
    }
    if (booking.booking_contact_person_mobileno == null) {
      errors = errors + "Please Enter Booking Contact Person Mobile no... <br>";
      textContactPersonMobileNo.classList.add("is-invalid");
    }
  }
  if (vialocationchkbox.checked === true) {
    if (booking.locations.length === 0) {
      errors = errors + "Please select at least one Via Location.. <br>";
    }
  }

  if (booking.customer_agreement_id == null) {
    errors = errors + "Please Select Correct customer agreement... <br>";
  }
  return errors;
};

//Booking from submit event function
const bookingFormSubmit = () => {
  console.log(booking);

  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    // errors not exit
    //need to get user confirmation

    let userConfirm = Swal.fire({
      title: "Confirm Booking Submission",
      text: "Are you sure you want to save this new booking data?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Save Booking",
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
        let postResponse = httpServiceRequest("booking/insert", "POST", booking);
        if (postResponse == "ok") {
          Swal.fire({
            title: "Booking Saved Successfully!",
            text: "Congratulations! The new booking has been created.",
            icon: "success",
            showConfirmButton: true,
            confirmButtonText: "Great!",
            customClass: {
              confirmButton: "btn btn-3",
              popup: "swal2-border-radius",
            },
          });
          refreshForm();
          // modal eka hide karanwa
          $("#bookingFormModal").modal("hide");
        } else {
          Swal.fire({
            title: "Failed to Submit....?",
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
};

//Need to check all the fields are fill
const checkFormUpdates = () => {
  let updates = "";

  if (booking != null && oldBooking != null) {
    if (booking.booking_contact_person_name != oldBooking.booking_contact_person_name) {
      updates = updates + "Contact Person Name updated. <br>";
    }
    if (booking.booking_contact_person_mobileno != oldBooking.booking_contact_person_mobileno) {
      updates = updates + "Contact Person Mobile No updated. <br>";
    }
    if (booking.pickup_locations_id.name != oldBooking.pickup_locations_id.name) {
      updates = updates + "Pickup Location updated. <br>";
    }
    if (booking.pickup_date_time != oldBooking.pickup_date_time) {
      updates = updates + "Pickup Date & Time updated. <br>";
    }
    if (booking.delivery_locations_id.name != oldBooking.delivery_locations_id.name) {
      updates = updates + "Delivery Location updated. <br>";
    }
    if (booking.delivery_date_time != oldBooking.delivery_date_time) {
      updates = updates + "Delivery Date & Time updated. <br>";
    }
    if (booking.vehicle_type_id.name != oldBooking.vehicle_type_id.name) {
      updates = updates + "Requested Vehicle Type updated. <br>";
    }
    if (booking.locations.length != oldBooking.locations.length) {
      updates = updates + "Route Waypoints modified. <br>";
    }
  }

  return updates;
};

// update button
const bookingFormUpdate = () => {
  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    let updates = checkFormUpdates();
    // updates not exit
    if (updates == "") {
      Swal.fire({
        title: "Nothing to Update",
        text: "No changes were detected in the booking details.",
        icon: "info",
        allowOutsideClick: false,
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    } else {
      let userConfirm = Swal.fire({
        title: "Confirm Booking Update",
        text: "Are you sure you want to update this booking's details?",
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
          let postResponse = httpServiceRequest("booking/update", "PUT", booking);
          if (postResponse == "ok") {
            Swal.fire({
              title: "Booking Updated Successfully!",
              text: "The booking details have been successfully synchronized.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
              customClass: {
                popup: "swal2-border-radius",
              },
            });
            loadBookingTable();
            refreshForm();
            $("#bookingFormModal").modal("hide");
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

// form Refresh after submit the form
const refreshForm = () => {

  booking = new Object();
  booking.locations = new Array();

  bookingForm.reset();

  setDefault([
    selectCompanyName,
    textContactPerson,
    textContactPersonMobileNo,
    textPickupLocation,
    textPickupDateAndTime,
    textDeliveryLocation,
    textDeliveryDateAndTime,
    selectVehicleType,
  ]);

  let customers = getServiceRequest("/customer/byactiveagreements");
  dataFilIntoSelect(selectCompanyName, "Select Company Name", customers, "company_name");
  dataFilIntoSelect(searchCustomerName, "Select Company Name", customers, "company_name");

  let vehicleTypes = getServiceRequest("/vehicletype/alldata");
  dataFilIntoSelect(selectVehicleType, "Select Vehicle Type", vehicleTypes, "name");
  dataFilIntoSelect(searchVehicleType, "Select Vehicle Type", vehicleTypes, "name");

  let pickupLocation = getServiceRequest("/pickuplocation/active");
  dataFilIntoSelect(textPickupLocation, "Select Pickup Location", pickupLocation, "name");

  viaLocations = getServiceRequest("/location/active");
  dataFilIntoSelect(selectViaLocation, "Select Via Location", viaLocations, "name");

  dataFilIntoSelect(waypointslist, "", booking.locations, "name");

  let deliveryLocation = getServiceRequest("/deliverylocation/active");
  dataFilIntoSelect(textDeliveryLocation, "Select Delivery Location", deliveryLocation, "name");

  // current date validate and previous date restrict
  currentdatetimevalidator("textPickupDateAndTime");

  submitButton.style.display = "";
  updateButton.style.display = "none";

  viaLocation.style.display = "none";
  waypointslist.style.display = "none";
  viaLocation.style.display = "none";

  document.getElementById("selectCompanyName").disabled = false;

  shipmentdetails.style.display = "none";

  if (document.getElementById("routeModalButton")) {
    document.getElementById("routeModalButton").style.display = "none";
  }
  const routeCollapse = document.getElementById("collapseExample");
  if (routeCollapse) {
    const bsCollapse = bootstrap.Collapse.getInstance(routeCollapse);
    if (bsCollapse) {
      bsCollapse.hide();
    }
  }

  bookings = getServiceRequest("/booking/bystatus");
  loadBookingTable(bookings);

  // for generate booking no
  bookingList = getServiceRequest("booking/alldata");

  // location list view eka
  pickupLocationPoint.innerText = "Select Pickup to see view";
  deliveryLocationPoint.innerText = " Select Delivery to see view";
};

// filtering by booking no using datatable
const filterByBookingNo = () => {
  const table = $.fn.dataTable.isDataTable("#bookingTable") ? $("#bookingTable").DataTable() : null;
  if (table) {
    let bookingNo = document.getElementById("searchBookingNo").value;
    // column 1 is the Booking Number column
    table.column(1).search(bookingNo).draw();
  }
};

// reset button eke function ekek
const resetButton = () => {
  document.getElementById("searchCustomerName").value = "";
  document.getElementById("searchVehicleType").value = "";
  document.getElementById("searchBookingNo").value = "";
  document.getElementById("tableSearch").value = "";

  // reset button ekata
  if ($.fn.dataTable.isDataTable("#bookingTable")) {
    $("#bookingTable").DataTable().clear().destroy();
  }
  bookings = getServiceRequest("/booking/bystatus");
  loadBookingTable(bookings);
};

// Export Functionality
const exportBookingTable = (type) => {
  if (type === "excel") {
    exportTableToExcelWithSheetJS("#bookingTable", "bookings", { sheetName: "Bookings" });
  } else if (type === "pdf") {
    exportTableToPdfWithJsPdf("#bookingTable", "bookings", { title: "Bookings" });
  } else if (type === "print") {
    window.print();
  }
};

// create booking no using customer name and previous booking no
const generateBookingNo = () => {
  // get customer name first three chracters if it has only one word.but if customer have more than one word we get words first chracter
  let customerName = JSON.parse(selectCompanyNameElement.value);
  let customerNameParts = customerName.company_name.split(" ");
  console.log(customerNameParts);
  let customerInitials = "";

  if (customerNameParts.length === 1) {
    // Only one word: use first three characters (pad with 'X' if less than 3)
    customerInitials = customerNameParts[0].substring(0, 3).toUpperCase().padEnd(3, "X");
    console.log(customerInitials);
  } else {
    // More than one word: use first character of each word, up to 3 characters
    customerInitials = customerNameParts
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .substring(0, 3);
    console.log(customerInitials);
  }

  // cuurunt year eke last two digit gannawa
  let currentYear = new Date().getFullYear().toString().slice(-2);
  customerInitials += currentYear;

  // Get the last booking number and increment
  const lastBooking = bookingList[0];
  if (lastBooking == null) {
    lastBookingNo = customerInitials + "00000001"; // If no previous booking, start with 00000001
    booking.booking_no = lastBookingNo;
    console.log(lastBookingNo);
  } else {
    let lastBookingNo = lastBooking.booking_no;
    // last booking no eken numbers tika witharak gannawa
    let numberPart = parseInt(lastBookingNo.slice(5));
    console.log(numberPart);

    let newBookingNo = customerInitials + String(numberPart + 1).padStart(8, "0");
    booking.booking_no = newBookingNo;
    console.log(newBookingNo);
  }
};
// -------------------------------------------------------------------------------------------------------------------
// get all active customers data
let customers = getServiceRequest("/customer/bycustomerstatus");

// cutomer select karaddi contact details auto fill kranwa function eka
let selectCompanyNameElement = document.getElementById("selectCompanyName");
selectCompanyNameElement.addEventListener("change", () => {
  // booking object eka select customer value eka pass karanawa
  booking.customer_id = JSON.parse(selectCompanyNameElement.value);

  // check box eka details gnnw
  let checkBocCustomerPerson = document.querySelector("#checkContactPersonCheckBox");

  //customerwa change karaddi check box auto false wela input disbale wela value eka claen wenna oni
  checkBocCustomerPerson.checked = false;
  document.getElementById("textContactPerson").disabled = true;
  document.getElementById("textContactPersonMobileNo").disabled = true;
  document.getElementById("textContactPerson").value = "";
  document.getElementById("textContactPersonMobileNo").value = "";

  // validation remove wenna oni
  textContactPerson.classList.remove("is-invalid");
  textContactPerson.classList.remove("is-valid");

  textContactPersonMobileNo.classList.remove("is-invalid");
  textContactPersonMobileNo.classList.remove("is-valid");

  // input eke object jason parse karagannawa
  let selectCustomer = JSON.parse(selectCompanyNameElement.value);

  // gaththa customers lage all data walin id eka witharak gannawa
  let customerFound = customers.find((customer) => customer.id === selectCustomer.id);

  // check box eka true kale naththan db eke thiyena contact data assign wenawa
  if (!checkBocCustomerPerson.checked) {
    console.log("12345");
    // gaththa id eka select karapu id eka samana nam conatct personge nama saha mobile nume eka input walata adesha wenawa
    if (customerFound) {
      document.getElementById("textContactPerson").value = customerFound.contact_person_fullname;
      document.getElementById("textContactPersonMobileNo").value = customerFound.contact_person_mobileno;
      booking.booking_contact_person_name = textContactPerson.value;
      booking.booking_contact_person_mobileno = textContactPersonMobileNo.value;
    }
  } else {
    document.getElementById("textContactPerson").disabled = true;
    document.getElementById("textContactPersonMobileNo").disabled = true;
    document.getElementById("textContactPerson").value = "";
    document.getElementById("textContactPersonMobileNo").value = "";
  }

  //   -----------------------------------------------------------------------------------
  //   cutomer anuwa vehicle type eka select karanawa
  companyname = JSON.parse(selectCompanyNameElement.value);
  booking.customer_id = JSON.parse(selectCompanyNameElement.value);

  let vehicleTypes = getServiceRequest("vehicletype/bycustomeragreementsandcustomerid?customer_id=" + companyname.id);
  dataFilIntoSelect(selectVehicleType, "Select Vehicle Type", vehicleTypes, "name");

  let pickupLocation = getServiceRequest("pickuplocation/bycustomerid?customer_id=" + companyname.id);
  dataFilIntoSelect(textPickupLocation, "Select Pickup Location", pickupLocation, "name");

  viaLocations = getServiceRequest("location/bycustomerid?customer_id=" + companyname.id);
  dataFilIntoSelect(selectViaLocation, "Select Via Location", viaLocations, "name");

  let deliveryLocation = getServiceRequest("/deliverylocation/bycustomerid?customer_id=" + companyname.id);
  dataFilIntoSelect(textDeliveryLocation, "Select Delivery Location", deliveryLocation, "name");

  shipmentdetails.style.display = "none";
  // customer change weddi add karala thiyena wayapoint ayin wenna oni
  waypointslist.innerHTML = "";

  // customer change karaddi  validation clean wenna oni
  setDefault([textContactPerson, textContactPersonMobileNo, textPickupLocation, textDeliveryLocation, selectVehicleType, textPickupDateAndTime]);

  // agreement div tag eka clean wenna oni
  divParentRadio.innerHTML = "";
  selectRouteType.value = "";
  availableAgreementDiv.style.display = "none";
  generateBookingNo();
});

// check box eka true karaddi input type clean wenna oni.e wage input eka flase karaddi select customers ta adal contact deatils tik aye   input type walata fill wela input type tika disabled wenna oni
checkContactPersonCheckBox.addEventListener("click", function () {
  // select wela thiyena eke object eka jason parse karagannawa
  let selectCustomer = JSON.parse(selectCompanyNameElement.value);

  // selecte wela customerge id eka witharak gannawa
  let customerFound = customers.find((customer) => customer.id === selectCustomer.id);

  if (this.checked) {
    document.getElementById("textContactPerson").disabled = false;
    document.getElementById("textContactPersonMobileNo").disabled = false;
    document.getElementById("textContactPerson").value = null;
    document.getElementById("textContactPersonMobileNo").value = null;
  } else {
    // select wela thiyen customerge id ekata adala contact deatils tika assign karanwa input ekata
    if (customerFound) {
      document.getElementById("textContactPerson").disabled = true;
      document.getElementById("textContactPersonMobileNo").disabled = true;

      document.getElementById("textContactPerson").value = customerFound.contact_person_fullname;
      document.getElementById("textContactPersonMobileNo").value = customerFound.contact_person_mobileno;
      booking.booking_contact_person_name = textContactPerson.value;
      booking.booking_contact_person_mobileno = textContactPersonMobileNo.value;

      // validation remove wenna oni
      textContactPerson.classList.remove("is-invalid");
      textContactPerson.classList.remove("is-valid");

      textContactPersonMobileNo.classList.remove("is-invalid");
      textContactPersonMobileNo.classList.remove("is-valid");
    }
  }
});

// booking form clear Button
const bookingFormClearButton = () => {
  refreshForm();
};

//Alert Box Call function
Swal.isVisible();

let map;
let routingControl;

// map initialize function
function initMap() {
  if (typeof L === "undefined") {
    console.warn("Leaflet library (L) is not defined. Map features will not work offline without downloaded libraries.");
    return;
  }

  // Resolve Leaflet marker icon 404 issues by using local offline assets
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/images/marker-icon-2x.png',
    iconUrl: '/images/marker-icon.png',
    shadowUrl: '/images/marker-shadow.png',
  });

  if (map) return; // Prevent multiple initializations

  // Create a hidden map element if it doesn't exist (Leaflet Routing needs a map instance)
  let mapDiv = document.getElementById("map");
  if (!mapDiv) {
    mapDiv = document.createElement("div");
    mapDiv.id = "map";
    mapDiv.style.display = "none";
    document.body.appendChild(mapDiv);
  }

  map = L.map("map").setView([7.8731, 80.7718], 7);

  // Use TileServer GL local style endpoint (falling back to standard OSM tiles dynamically on failure)
  const localTileServerUrl = "http://localhost:8989/styles/osm-bright/{z}/{x}/{y}.png";
  const osmFallbackUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const mapLayer = L.tileLayer(localTileServerUrl, {
    attribution: "© OpenStreetMap contributors"
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

  // Add event listeners
  document.getElementById("add-waypoint").addEventListener("click", addWaypoint);
  document.getElementById("textPickupLocation").addEventListener("change", () => {
    if (document.getElementById("textDeliveryLocation").value !== "") {
      calculateRoute();
    }
  });
  document.getElementById("textDeliveryLocation").addEventListener("change", calculateRoute);
}

// calculate distance and route
function calculateRoute() {
  const waypointItems = document.querySelectorAll("#waypointslist .route-item.via");
  const waypoints = [];

  // Get waypoints from the waypoint items
  for (let i = 0; i < waypointItems.length; i++) {
    const locData = waypointItems[i].dataset.location;
    if (locData) {
      const parsedLoc = JSON.parse(locData);
      if (parsedLoc.latitude && parsedLoc.longitude) {
        waypoints.push(L.latLng(parsedLoc.latitude, parsedLoc.longitude));
      }
    }
  }

  const originVal = document.getElementById("textPickupLocation").value;
  const destinationVal = document.getElementById("textDeliveryLocation").value;

  if (!originVal || !destinationVal) {
    Swal.fire({
      title: "Error!",
      text: "Please Select both Pickup Location and Delivery Location.",
      icon: "error",
      confirmButtonText: "OK",
      allowOutsideClick: false,
    });
    return;
  }

  const originParams = JSON.parse(originVal);
  const destinationParams = JSON.parse(destinationVal);

  console.log("Origin Location Data:", originParams);
  console.log("Destination Location Data:", destinationParams);

  if (!originParams.latitude || !originParams.longitude || !destinationParams.latitude || !destinationParams.longitude) {
    console.error("Coordinates missing for offline distance calculation.");
    return;
  }

  if (routingControl) {
    map.removeControl(routingControl);
  }

  //Offline GraphHopper
  const offlineRouter = L.Routing.graphhopper(undefined, {
    url: "http://localhost:8989/route",
  });

  routingControl = L.Routing.control({
    waypoints: [L.latLng(originParams.latitude, originParams.longitude), ...waypoints, L.latLng(destinationParams.latitude, destinationParams.longitude)],
    routeWhileDragging: false,
    addWaypoints: false,
    show: false,
    router: offlineRouter,
  })
    .on("routesfound", function (e) {
      const routes = e.routes;
      const summary = routes[0].summary;
      const totalDistance = (summary.totalDistance / 1000).toFixed(2);
      const totalDuration = (summary.totalTime / 60).toFixed(2);

      document.getElementById("textDistance").value = `${totalDistance} km`;
      booking.distance = totalDistance;
    })
    .on("routingerror", function (e) {
      console.error("Routing error:", e.error);
    })
    .addTo(map);
}

//customer Data fill in to the dynamic select elements for select waya locations
const customeDataFilIntoSelect = (parentId, dataList, displayProperties) => {
  parentId.innerHTML = "";

  dataList.forEach((dataOb) => {
    let div = document.createElement("div");
    div.classList.add("route-item", "via");

    let span = document.createElement("span");
    span.classList.add("dot");
    div.innerText = dataOb[displayProperties];
    div.dataset.location = JSON.stringify(dataOb);

    let button = document.createElement("button");
    button.className = "remove-btn";
    button.innerHTML = "Remove";

    button.onclick = () => {
      removeWaypoint(dataOb);
      div.remove();
    };

    div.appendChild(span);
    div.appendChild(button);

    parentId.appendChild(div);
  });
};

// waya point add button
const addWaypoint = () => {
  let selectedViaLocations = JSON.parse(selectViaLocation.value);
  booking.locations.push(selectedViaLocations);
  customeDataFilIntoSelect(waypointslist, booking.locations, "name");
  calculateRoute();

  let extIndex = viaLocations.map((viaLocation) => viaLocation.id).indexOf(selectedViaLocations.id);
  if (extIndex != -1) {
    viaLocations.splice(extIndex, 1);
  }
  dataFilIntoSelect(selectViaLocation, "Select Via Location", viaLocations, "name");
};

// remove function via location from select list
const removeWaypoint = (dataOb) => {
  console.log(dataOb);
  let selectedViaLocations = JSON.parse(JSON.stringify(dataOb));
  console.log(selectedViaLocations);
  viaLocations.push(selectedViaLocations);
  dataFilIntoSelect(selectViaLocation, "Select Via Location", viaLocations, "name");

  let extIndex = booking.locations.map((viaLocation) => viaLocation.id).indexOf(selectedViaLocations.id);
  if (extIndex != -1) {
    booking.locations.splice(extIndex, 1);
  }
  customeDataFilIntoSelect(waypointslist, booking.locations, "name");
  // auto calculate the route when change
  calculateRoute();
};

//check box eka onclick ekedi list eka clean karanna oni
// delete all data function eka liyanna oni
let vialocationchkbox = document.getElementById("vialocationchkbox");
vialocationchkbox.addEventListener("click", () => {
  for (const viaLocation of booking.locations) {
    viaLocations.push(viaLocation);
  }
  dataFilIntoSelect(selectViaLocation, "Select Via Location", viaLocations, "name");

  booking.locations = [];
  customeDataFilIntoSelect(waypointslist, booking.locations, "name");
  // auto calculate the route
  calculateRoute();
});

// vehicle type eka selecgt karaddi pickup date and time eka clean karanwa and agreement div eka clean karanwa
// mokada m=vehicle type ekata adal agreemnt tika thama ganna oni select karan date ekata
let selectVehicleTypeElement = document.getElementById("selectVehicleType");
selectVehicleTypeElement.addEventListener("change", () => {
  setDefault([textPickupDateAndTime]);
  textPickupDateAndTime.value = "";
  booking.pickup_date_time = null;
  divParentRadio.innerHTML = "";
  availableAgreementDiv.style.display = "none";
});

// agreement auto ganna thana
let selectPickupDateAndTimeElement = document.getElementById("textPickupDateAndTime");
console.log(selectPickupDateAndTimeElement.value);
// only get date from date time filed
// fixrate agrrement thiyenawa nam select karan vehicle type ekata adlawa currunt date ekaata available agreement gannawa
// mkd agreemnt walata adalawa pending booking ekak thiyenawa nam e agreemnt ekata aye bookig ekak danna bari wenna oni fixrate package ekak nam
selectPickupDateAndTimeElement.addEventListener("change", () => {
  // datetime flied eken date ek witharak gannawa
  let dateValue = selectPickupDateAndTimeElement.value.split("T")[0];
  console.log(dateValue);

  //select karan vehicle type ekata adlawa agreement gannawa
  customerAgreementsList = getServiceRequest("/customeragreement/bylistcutomerandvehicletype?customerId=" + JSON.parse(selectCompanyNameElement.value).id + "&vehicleTypeId=" + JSON.parse(selectVehicleTypeElement.value).id,);
  for (const customeragreement of customerAgreementsList) {
    console.log(customeragreement);
    if (customeragreement.package_id.package_type === "Fix Rate") {
      availableAgreementDiv.style.display = "";
      divParentRadio.innerHTML = "";
      // select karana date ekata adala availabel agreemnt gnnawa
      let availableAgreements = getServiceRequest("/customeragreement/bycutomerandvehicletypeandgivendate?customerId=" + JSON.parse(selectCompanyNameElement.value).id + "&vehicleTypeId=" + JSON.parse(selectVehicleTypeElement.value).id + "&date=" + dateValue,);
      console.log(availableAgreements);

      // agreemnt view karanwa chekk box div set eka
      availableAgreements.forEach((agreement) => {
        const div = document.createElement("div");
        div.className = "form-check form-check-inline";
        const input = document.createElement("input");
        input.className = "form-check-input";
        input.value = agreement.cus_agreement_no;
        input.name = "customerAgreement";
        input.type = "radio";
        input.onchange = () => {
          booking.customer_agreement_id = agreement;
        };
        const label = document.createElement("label");
        label.innerText = agreement.cus_agreement_no;
        label.className = "form-check-label fw-bold text-muted";
        div.appendChild(input);
        div.appendChild(label);
        divParentRadio.appendChild(div);
      });

    } else if (customeragreement.package_id.package_type === "Floating Rate") {
      // floating rate agreement ekak nam
      availableAgreementDiv.style.display = "none";
      booking.customer_agreement_id = customeragreement;
    }
  }
});

// -------------------------------------route cards-----------------------------------------------------------

// load route cards
const loadRouteCards = (routeListArray) => {
  let routeList = document.getElementById("routeCardContainer");

  routeList.innerHTML = "";
  routeListArray.forEach((route) => {
    let viaLocationsStr = getViaLocations(route);
    const card = document.createElement("div");
    card.className = "route-card";
    card.innerHTML = `
          <div style="display:d-flex;align-items:flex-start">
            <div>
              <h4>${route.route_name}</h4>
              <div class="route-meta">
                <div><strong>Pickup:</strong>&nbsp;${route.pickup_locations_id.name}</div>
                <div><strong>Delivery:</strong>&nbsp;${route.delivery_locations_id.name}</div>
                ${route.locations && route.locations.length > 0 ? `<div class="mt-1"><strong>Via:</strong><br>${viaLocationsStr}</div>` : ""}
              </div>
              <div style="margin-top:8px" class="small muted"><strong>Distance:</strong> ${route.route_distance} km</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
              <button type="button" style="width: 100px;" class="btn-cancel applyButton" data-apply="${route.id}"  title="Apply route">Apply</button>
            </div>
          </div>
        `;

    // btn click karankota adala eka gnnawa
    const btn = card.querySelector(".applyButton");

    btn.onclick = () => {
      addDataFunction(route);
    };

    routeList.appendChild(card);
  });
};

// via locations thiyenawanam eka string ekakata convert karana function eka
const getViaLocations = (dataOb) => {
  if (dataOb.locations && dataOb.locations.length > 0) {
    let locations = "";
    dataOb.locations.forEach((vialocation, index) => {
      if (dataOb.locations.length - 1 == index) {
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


// route card eke apply button ekata data add karana function eka
const addDataFunction = (dataOb) => {
  waypointslist.innerHTML = "";
  viaLocation.style.display = "none";
  textPickupLocation.value = JSON.stringify(dataOb.pickup_locations_id);
  textDeliveryLocation.value = JSON.stringify(dataOb.delivery_locations_id);
  deliveryLocationPoint.innerText = dataOb.delivery_locations_id.name;
  pickupLocationPoint.innerText = dataOb.pickup_locations_id.name;
  textDistance.value = dataOb.route_distance;

  booking.pickup_locations_id = dataOb.pickup_locations_id;
  booking.delivery_locations_id = dataOb.delivery_locations_id;
  booking.distance = dataOb.route_distance;
  textPickupLocation.classList.add("is-valid");
  textDeliveryLocation.classList.add("is-valid");

  // waya locations thiyewn nam withrak meka wada karanawa
  if (dataOb.locations != null && dataOb.locations.length > 0) {
    vialocationchkbox.checked = "checked";
    vialocationLabel.innerText = "Available";
    waypointslist.value = "";
    viaLocationCheckbox.style.display = "none";
    waypointslist.style.display = "";

    customeDataFilIntoSelect(waypointslist, dataOb.locations, "name");

    booking.locations = dataOb.locations;
  }

  const allRemoveBtns = document.querySelectorAll(".remove-btn");

  allRemoveBtns.forEach((btn) => {
    btn.style.display = "none";
  });

  // Hide the collapse panel and show the shipment fields
  const routeCollapse = document.getElementById("collapseExample");
  if (routeCollapse) {
    const bsCollapse = bootstrap.Collapse.getInstance(routeCollapse) || new bootstrap.Collapse(routeCollapse, { toggle: false });
    bsCollapse.hide();
  }
};

// route type eka select karana function eka
const selecetRouteElemenet = document.getElementById("selectRouteType");
selecetRouteElemenet.addEventListener("change", () => {
  selectedValue = selecetRouteElemenet.value;

  if (selectedValue === "System Route") {
    viaLocation.style.display = "none";
    viaLocationCheckbox.style.display = "none";
    // selectCompanyNameElement
    let customerid = JSON.parse(selectCompanyNameElement.value).id;

    let routeList = getServiceRequest("/route/bycutomerid?customerid=" + customerid);
    loadRouteCards(routeList);
    console.log(routeList);
    routeModalButton.style.display = "";
    textPickupLocation.disabled = true;
    textDeliveryLocation.disabled = true;
    vialocationchkbox.disabled = true;
    selectViaLocation.disabled = true;
    waypointslist.disabled = true;
    shipmentdetails.style.display = "";
  } else if (selectedValue === "Custom Route") {
    viaLocation.style.display = "none";
    viaLocationCheckbox.style.display = "";
    routeModalButton.style.display = "none";
    textPickupLocation.disabled = false;
    textDeliveryLocation.disabled = false;
    vialocationchkbox.disabled = false;
    selectViaLocation.disabled = false;
    waypointslist.disabled = false;
    shipmentdetails.style.display = "";
    initMap();
  } else {
    routeModalButton.style.display = "none";
    shipmentdetails.style.display = "none";
  }
});

// pickupdateValidater paya 3 kalin booking ekak danna oni
const pickupdateValidater = (element) => {
  let now = new Date();
  let minTime = new Date();
  minTime.setHours(minTime.getHours() + 3);

  // Restrict past dates completely
  element.min = now.toISOString().slice(0, 16);

  let selected = new Date(element.value);

  if (!element.value) {
    element.classList.remove("is-invalid", "is-valid");
    return false;
  }

  // If selected date is today → must be +3 hours
  let isToday = selected.getFullYear() === now.getFullYear() && selected.getMonth() === now.getMonth() && selected.getDate() === now.getDate();

  if (selected < now || (isToday && selected < minTime)) {
    element.classList.add("is-invalid");
    element.classList.remove("is-valid");
    return false;
  } else {
    element.classList.remove("is-invalid");
    element.classList.add("is-valid");
    return true;
  }
};


// overalyy details
const openBookingDetail = () => {
  toggleView("booking-details-overlay", true);
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.style.display = "block";
    backBtn.onclick = () => {
      closeInvoiceDetail();
    };
  }
};

const closeDetailOverlay = () => {
  toggleView("booking-details-overlay", false);
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.style.display = "none";
  }
};

// status track karana function ekata adala status walal array eka
const statuses = ["Inproccess", "Attend", "Arrived At Pickup", "Departed From Pickup", "Arrived At Delivery", "Departed From Delivery"];

// status track karana function eka
const statusTracker = (dataOb) => {
  // function eka run karaddi kalin thibuna data clean karanwa
  resetSteps();

  // currunt status gannawa mulinma
  let currentStatus = dataOb.booking_status_id.status;
  // cuurunt status eke index eka gannwa
  let index = statuses.indexOf(currentStatus);

  for (let i = 1; i <= statuses.length; i++) {
    // step eka gnnwa index ekath ekka/ me thiyenne id eka dynamic widihata hadala(i=2 nam step2)
    let step = document.getElementById("step" + i);

    // adala icon ekak ggnawa id eken/me thiyenne id eka dynamic widihata hadala(i=2 nam step2Icon)
    let icon = document.getElementById("step" + i + "Icon");

    // adala time eka gnnawa id eken/ me thiyenne id eka dynamic widihata hadala(i=2 nam step2Time)
    let time = document.getElementById("step" + i + "Time");

    // i = 2 nam
    if (i - 1 < index) {
      step.classList.add("completed");
      icon.innerText = "✓";
    } else if (i - 1 === index) {
      step.classList.add("active");
      icon.innerText = "•";
    } else {
      step.classList.add("upcoming");
      icon.innerText = "•";
      time.innerText = "Not Updated Yet";
    }
  }

  // time tika assign karanwa
  if (dataOb.added_datetime) step1Time.innerText = datetimeformat(dataOb.added_datetime);
  if (dataOb.assigned_date_time) step2Time.innerText = datetimeformat(dataOb.assigned_date_time);
  if (dataOb.arrived_at_pickup_datetime) step3Time.innerText = datetimeformat(dataOb.arrived_at_pickup_datetime);
  if (dataOb.departed_from_pickup_datetime) step4Time.innerText = datetimeformat(dataOb.departed_from_pickup_datetime);
  if (dataOb.arrived_at_delivery_datetime) step5Time.innerText = datetimeformat(dataOb.arrived_at_delivery_datetime);
  if (dataOb.departed_from_delivery_datetime) step6Time.innerText = datetimeformat(dataOb.departed_from_delivery_datetime);
};

// reset karana function eka
function resetSteps() {
  for (let i = 1; i <= 6; i++) {
    let step = document.getElementById("step" + i);
    let icon = document.getElementById("step" + i + "Icon");
    let time = document.getElementById("step" + i + "Time");

    step.classList.remove("active", "completed", "upcoming");
    icon.innerText = "";
    time.innerText = "";
  }
}

// datetime format function
const datetimeformat = (selecttime) => {
  let date = new Date(selecttime);

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  // Get month name abbreviated
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];

  // Format day and year
  const day = date.getDate();
  const year = date.getFullYear();

  // Return the formatted string
  return `${hours}:${minutes}\n ${month} ${day}, ${year}`;
};