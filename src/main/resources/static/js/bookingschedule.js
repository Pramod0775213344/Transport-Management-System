// Window load Function
window.addEventListener("load", () => {
  refreshForm();
  loadScheduleBookingTable();
});

const loadScheduleBookingTable = () => {
  if ($.fn.dataTable.isDataTable("#scheduleBookingTable")) {
    $("#scheduleBookingTable").DataTable().clear().destroy();
  }
  let bookingListForTable = getServiceRequest("/booking/schedulebooking");
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
  dataFillIntoTheReportTable(scheduleBookingTableBody, bookingListForTable, propertyList);

  const table = $("#scheduleBookingTable").DataTable({
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
};

// Export Functionality
const exportTable = (type) => {
  const table = $("#scheduleBookingTable").DataTable();

  if (type === "excel") {
    table.button(".buttons-excel").trigger();
  } else if (type === "pdf") {
    table.button(".buttons-pdf").trigger();
  } else if (type === "print") {
    window.print();
  }
};

const getStatus = (dataOb) => {
  return `<span class="status-badge scheduled">${dataOb.booking_status_id.status}</span>`;
};
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

  let vehicleTypes = getServiceRequest("vehicletype/bycustomeragreementsandcustomerid?customer_id=" + companyname.id);
  dataFilIntoSelect(selectVehicleType, "Select Vehicle Type", vehicleTypes, "name");

  let pickupLocation = getServiceRequest("pickuplocation/bycustomerid?customer_id=" + companyname.id);
  dataFilIntoSelect(textPickupLocation, "Select Pickup Location", pickupLocation, "name");

  viaLocations = getServiceRequest("location/bycustomerid?customer_id=" + companyname.id);
  dataFilIntoSelect(selectViaLocation, "Select Via Location", viaLocations, "name");

  let deliveryLocation = getServiceRequest("/deliverylocation/bycustomerid?customer_id=" + companyname.id);
  dataFilIntoSelect(textDeliveryLocation, "Select Delivery Location", deliveryLocation, "name");

  // customer change weddi add karala thiyena wayapoint ayin wenna oni
  waypointslist.innerHTML = "";

  // customer change karaddi  validation clean wenna oni
  setDefault([textContactPerson, textContactPersonMobileNo, textPickupLocation, textDeliveryLocation, selectVehicleType, textPickupDateAndTime]);

  // agreement div tag eka clean wenna oni
  divParentRadio.innerHTML = "";
  availableAgreementDiv.style.display = "none";

  //   customerta adalawa route list eka gnnwa
  let routeListArray = getServiceRequest("/route/bycutomerid?customerid=" + companyname.id);
  dataFillIntoCard(routeListArray, editFunction);
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

// avialbele agreement gannwa booking add wela nathi select karana date range ekata
let selectVehicleTypeElement = document.getElementById("selectVehicleType");
selectVehicleTypeElement.addEventListener("change", () => {
  setDefault([textPickupDateAndTime]);
  textPickupDateAndTime.value = "";
  divParentRadio.innerHTML = "";
  availableAgreementDiv.style.display = "none";
});

let selectPickupDateAndTimeElement = document.getElementById("textPickupDateAndTime");
console.log(selectPickupDateAndTimeElement.value);
// only get date from date time filed
selectPickupDateAndTimeElement.addEventListener("change", () => {
  let dateValue = selectPickupDateAndTimeElement.value.split("T")[0];
  console.log(dateValue);

  customerAgreementsList = getServiceRequest(
    "/customeragreement/bylistcutomerandvehicletype?customerId=" +
      JSON.parse(selectCompanyNameElement.value).id +
      "&vehicleTypeId=" +
      JSON.parse(selectVehicleTypeElement.value).id,
  );
  for (const customeragreement of customerAgreementsList) {
    console.log(customeragreement);
    if (customeragreement.package_id.package_type === "Fix Rate") {
      availableAgreementDiv.style.display = "";
      divParentRadio.innerHTML = "";
      // database eke bookings nathi agrement tika
      let availableAgreements = getServiceRequest(
        "/customeragreement/bycutomerandvehicletypeandgivendate?customerId=" +
          JSON.parse(selectCompanyNameElement.value).id +
          "&vehicleTypeId=" +
          JSON.parse(selectVehicleTypeElement.value).id +
          "&date=" +
          dateValue,
      );

      console.log(availableAgreements);
      let notInBookingListArrayAgrrement = [];
      // me agreement walin mage booking array eke nathi agreement tika ganna oni
      if (bookingListArray.length > 0) {
        // bookng list eke thiyen agreement id tika gnnawa
        const bookedAgreementIds = bookingListArray.map((b) => b.customer_agreement_id.id);
        // api kalin gaththa id tika nowanawa agreement tika gnnawa
        notInBookingListArrayAgrrement = availableAgreements.filter((agreement) => !bookedAgreementIds.includes(agreement.id));
      } else {
        notInBookingListArrayAgrrement = availableAgreements;
      }
      console.log(notInBookingListArrayAgrrement);
      notInBookingListArrayAgrrement.forEach((agreement) => {
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
      availableAgreementDiv.style.display = "none";
      booking.customer_agreement_id = customeragreement;
    }
  }
});

// waya point add button
const addWaypoint = () => {
  let selectedViaLocations = JSON.parse(selectViaLocation.value);
  booking.locations.push(selectedViaLocations);
  customeDataFilIntoSelect(waypointslist, booking.locations, "name");

  let extIndex = viaLocations.map((viaLocation) => viaLocation.id).indexOf(selectedViaLocations.id);
  if (extIndex != -1) {
    viaLocations.splice(extIndex, 1);
  }
  dataFilIntoSelect(selectViaLocation, "Select Via Location", viaLocations, "name");
};

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

// remove function via location from select list
const removeWaypoint = (dataOb) => {
  console.log(dataOb);
  let selectedViaLocations = JSON.parse(JSON.stringify(dataOb));
  viaLocations.push(selectedViaLocations);
  dataFilIntoSelect(selectViaLocation, "Select Via Location", viaLocations, "name");

  let extIndex = booking.locations.map((viaLocation) => viaLocation.id).indexOf(selectedViaLocations.id);
  if (extIndex != -1) {
    booking.locations.splice(extIndex, 1);
  }
  customeDataFilIntoSelect(waypointslist, booking.locations, "name");
};

let vialocationchkbox = document.getElementById("vialocationchkbox");
vialocationchkbox.addEventListener("click", () => {
  for (const viaLocation of booking.locations) {
    viaLocations.push(viaLocation);
  }
  dataFilIntoSelect(selectViaLocation, "Select Via Location", viaLocations, "name");

  booking.locations = [];
  customeDataFilIntoSelect(waypointslist, booking.locations, "name");
});

// form Refresh after submit the form
const refreshForm = () => {
  bookingListArray = new Array();

  bookingForm.reset();

  setDefault([
    selectCompanyName,
    textContactPerson,
    selectVehicleType,
    textContactPersonMobileNo,
    textPickupLocation,
    textPickupDateAndTime,
    textDeliveryLocation,
    textDeliveryDateAndTime,
  ]);

  let customers = getServiceRequest("/customer/byactiveagreements");
  dataFilIntoSelect(selectCompanyName, "Select Company Name", customers, "company_name");

  let vehicleTypes = getServiceRequest("/vehicletype/alldata");
  dataFilIntoSelect(selectVehicleType, "Select Vehicle Type", vehicleTypes, "name");

  let pickupLocation = getServiceRequest("/pickuplocation/active");
  dataFilIntoSelect(textPickupLocation, "Select Pickup Location", pickupLocation, "name");

  viaLocations = getServiceRequest("/location/active");
  dataFilIntoSelect(selectViaLocation, "Select Via Location", viaLocations, "name");

  let deliveryLocation = getServiceRequest("/deliverylocation/active");
  dataFilIntoSelect(textDeliveryLocation, "Select Delivery Location", deliveryLocation, "name");

  // current date validate and previous date restrict
  currentdatetimevalidator("textPickupDateAndTime");

  bookingUpdateButton.style.display = "none";
  bookingAddButton.style.display = "";

  viaLocation.style.display = "none";
  waypointslist.style.display = "none";

  document.getElementById("selectCompanyName").disabled = false;

  bookings = getServiceRequest("/booking/bystatus");

  // for generate booking no
  bookingList = getServiceRequest("booking/alldata");

  refreshInnerBookingForm();
};

// card ekata data fill karana function eka
const dataFillIntoCard = (routeListArray, editFunction) => {
  routeList = document.getElementById("routeCardContainer");

  routeList.innerHTML = "";
  routeListArray.forEach((route) => {
    const card = document.createElement("div");
    card.className = "route-card";
    card.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <h4>${route.route_name}</h4>
              <div class="route-meta">
                <div><strong>Pickup:</strong>&nbsp;${route.pickup_locations_id.name}</div>
                <div><strong>Delivery:</strong>&nbsp;${route.delivery_locations_id.name}</div>
                ${route.via ? `<div><strong>Via:</strong>&nbsp;${route.via}</div>` : ""}
              </div>
              <div style="margin-top:8px" class="small muted"><strong>Distance:</strong> ${route.route_distance} km</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
              <button class="btn btn-2 applyButton" data-apply="${route.id}"  title="Apply route">Apply</button>
            </div>
          </div>
        `;

    // btn click karankota adala eka gnnawa
    const btn = card.querySelector(".applyButton");

    btn.onclick = () => {
      editFunction(route);
    };

    routeList.appendChild(card);
  });
};

// route collase eke rote eke apply button eka click kalama form eka auto fill wenawa
const editFunction = (dataOb) => {
  console.log(dataOb);
  textPickupLocation.value = JSON.stringify(dataOb.pickup_locations_id);
  booking.pickup_locations_id = dataOb.pickup_locations_id;
  textDeliveryLocation.value = JSON.stringify(dataOb.delivery_locations_id);
  pickupLocationPoint.innerText = dataOb.pickup_locations_id.name;
  deliveryLocationPoint.innerText = dataOb.delivery_locations_id.name;
  booking.delivery_locations_id = dataOb.delivery_locations_id;
  textDistance.value = dataOb.route_distance;
  booking.distance = dataOb.route_distance;

  // waya locations thiyewn nam withrak meka wada karanawa
  if (dataOb.locations != null && dataOb.locations.length > 0) {
    vialocationchkbox.checked = "checked";
    vialocationLabel.innerText = "Available";
    viaLocation.style.display = "none";
    waypointslist.value = "";
    waypointslist.style.display = "";

    customeDataFilIntoSelect(waypointslist, dataOb.locations, "name");

    booking.locations = dataOb.locations;
  } else {
    vialocationchkbox.checked = false;
    vialocationLabel.innerText = "Not Available";
    viaLocation.style.display = "none";
    waypointslist.value = "";
    waypointslist.style.display = "none";
  }

  // Close the collapse panel after applying the route
  const routeCollapse = document.getElementById("routeCollapse");
  if (routeCollapse) {
    const bsCollapse = bootstrap.Collapse.getInstance(routeCollapse) || new bootstrap.Collapse(routeCollapse, { toggle: false });
    bsCollapse.hide();
  }

  // Also auto-collapse Customer Details to focus on entry
  collapseCustomerDetails();
};

const collapseCustomerDetails = () => {
  const customerCollapse = document.getElementById("customerDetailsCollapse");
  if (customerCollapse && customerCollapse.classList.contains("show")) {
    const bsCustomerCollapse = bootstrap.Collapse.getInstance(customerCollapse) || new bootstrap.Collapse(customerCollapse, { toggle: false });
    bsCustomerCollapse.hide();
  }
};

// innerform eka refresh karanwa
const refreshInnerBookingForm = () => {
  // customer change karaddi  validation clean wenna oni
  setDefault([textPickupLocation, textDeliveryLocation, textPickupDateAndTime, textDeliveryDateAndTime]);
  // me tike witharak value clean karal dnawa
  textPickupDateAndTime.value = "";
  textDeliveryDateAndTime.value = "";
  textDistance.value = "";
  divParentRadio.innerHTML = "";
  booking = new Object();
  booking.locations = new Array();

  // object eke me tika clear nokara thiyenwa
  if (
    selectCompanyNameElement &&
    selectCompanyNameElement.value.trim() !== "" &&
    selectVehicleTypeElement &&
    selectVehicleTypeElement.value.trim() !== "" &&
    textContactPerson &&
    textContactPersonMobileNo
  ) {
    try {
      booking.customer_id = JSON.parse(selectCompanyNameElement.value);
      booking.vehicle_type_id = JSON.parse(selectVehicleTypeElement.value);
      booking.booking_contact_person_name = textContactPerson.value;
      booking.booking_contact_person_mobileno = textContactPersonMobileNo.value;

      let pickupLocation = getServiceRequest("pickuplocation/bycustomerid?customer_id=" + booking.customer_id.id);
      dataFilIntoSelect(textPickupLocation, "Select Pickup Location", pickupLocation, "name");

      let deliveryLocation = getServiceRequest("/deliverylocation/bycustomerid?customer_id=" + booking.customer_id.id);
      dataFilIntoSelect(textDeliveryLocation, "Select Delivery Location", deliveryLocation, "name");
    } catch (e) {
      console.error("Error parsing form data: ", e);
    }
  }

  // wayalist default widihata gannawa
  vialocationchkbox.checked = false;
  vialocationLabel.innerText = "Not Available";
  viaLocation.style.display = "none";
  waypointslist.value = "";
  waypointslist.style.display = "none";
  bookingUpdateButton.style.display = "none";
  bookingAddButton.style.display = "";

  //     referesh Inner Table
  const propertyList = [
    { propertyName: getCustomer, dataType: "function" },
    { propertyName: getPickupLocation, dataType: "function" },
    { propertyName: getViaLocations, dataType: "function" },
    { propertyName: getDeliveryLocation, dataType: "function" },
    { propertyName: "distance", dataType: "string" },
  ];

  dataFillIntoTheInnerTable(bookingListTableBody, bookingListArray, propertyList, bookingEdit, bookingDelete, true);
};

const getCustomer = (dataOb) => {
  return dataOb.customer_id.company_name;
};
// get pickup location
const getPickupLocation = (dataOb) => {
  return "<span >" + dataOb.pickup_locations_id.name + "</span><span><p class='text-muted mt-2' >" + dataOb.pickup_date_time + "</p></span>";
};

// get delivery location
const getDeliveryLocation = (dataOb) => {
  return "<span >" + dataOb.delivery_locations_id.name + "</span><span><p class='text-muted mt-2' >" + dataOb.delivery_date_time + "</p></span>";
};

// get  via locations if available
const getViaLocations = (dataOb) => {
  if (dataOb.locations.length > 0) {
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

// inner form eke booking dlete eka
const bookingDelete = (dataOb, index) => {
  Swal.fire({
    title: "Confirm Deletion",
    text: "Are you sure you want to remove this booking?",
    icon: "warning",
    iconColor: "#ef4444",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete",
    cancelButtonText: "No, Keep it",
    allowOutsideClick: false,
    customClass: {
      cancelButton: "btn btn-1",
      confirmButton: "btn btn-4",
      popup: "swal2-border-radius",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      //call post service
      let existIndex = bookingListArray.map((booking) => booking.id).indexOf(dataOb.id);
      if (existIndex !== -1) {
        bookingListArray.splice(existIndex, 1);
      }
      Swal.fire({
        title: "Removed!",
        text: "Cheque has been removed successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: "swal2-border-radius",
        },
      });
      refreshInnerBookingForm();
    }
  });
};

// inner form eke edit eka
const bookingEdit = (dataOb, index) => {
  innerFormIndex = index;

  booking = JSON.parse(JSON.stringify(dataOb));
  oldBooking = JSON.parse(JSON.stringify(dataOb));

  textPickupLocation.value = JSON.stringify(dataOb.pickup_locations_id);
  textDeliveryLocation.value = JSON.stringify(dataOb.delivery_locations_id);
  textPickupDateAndTime.value = dataOb.pickup_date_time;
  textDeliveryDateAndTime.value = dataOb.delivery_date_time;
  textDistance.value = dataOb.distance;

  bookingUpdateButton.style.display = "";
  bookingAddButton.style.display = "none";
};

// form errors check karanwa
const checkInnerFormError = () => {
  let errors = "";

  if (booking.customer_id == null) {
    errors = errors + "Please Select Company Name.. <br>";
  }
  if (booking.pickup_locations_id == null) {
    errors = errors + "Please Select Pickup Location.. <br>";
  }
  if (booking.pickup_date_time == null) {
    errors = errors + "Please Enter valid Pickup Date And Time.. <br>";
    textPickupDateAndTime.classList.add("is-invalid");
  }
  if (booking.delivery_locations_id == null) {
    errors = errors + "Please Select Delivery Location.. <br>";
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
  }
  if (checkContactPersonCheckBox.checked === true) {
    if (booking.booking_contact_person_name == null) {
      errors = errors + "Please Enter Booking Contact Person name... <br>";
    }
    if (booking.booking_contact_person_mobileno == null) {
      errors = errors + "Please Enter Booking Contact Person Mobile no... <br>";
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
const bookingAdd = () => {
  console.log(booking);

  // check form error for required element
  let errors = checkInnerFormError();
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
        bookingListArray.push(booking);
        Swal.fire({
          title: "Booking Successfully added!",
          text: "Congratulations! The new booking has been created.",
          icon: "success",
          showConfirmButton: true,
          confirmButtonText: "Great!",
          customClass: {
            confirmButton: "btn btn-3",
            popup: "swal2-border-radius",
          },
        });
        console.log(bookingListArray);
        refreshInnerBookingForm();
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
      title: "Creation Incomplete",
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

// check inner form update
const checkInnerFormUpdate = () => {
  let updates = "";
  if (booking != null && oldBooking != null) {
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
    if (booking.locations.length != oldBooking.locations.length) {
      updates = updates + "Route Waypoints modified. <br>";
    }
  }

  return updates;
};

// booking update button
const bookingUpdate = () => {
  // check form error for required element
  let errors = checkInnerFormError();
  if (errors == "") {
    let updates = checkInnerFormUpdate();
    // updates not exit
    if (updates == "") {
      Swal.fire({
        title: "Nothing to Update",
        text: "No changes were detected in the Booking details.",
        icon: "info",
        allowOutsideClick: false,
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    } else {
      Swal.fire({
        title: "Confirm Update",
        text: "Are you sure you want to update this Booking?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Update",
        cancelButtonText: "Cancel",
        allowOutsideClick: false,
        customClass: {
          cancelButton: "btn btn-1",
          confirmButton: "btn btn-2",
          popup: "swal2-border-radius",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // user confirm kaloth update wenawa
          bookingListArray[innerFormIndex] = booking;
          Swal.fire({
            title: "Updated!",
            text: "Booking details updated successfully.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          refreshInnerBookingForm();
        }
      });
    }
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

//bookingNo eka generate karanwa

//all bookings submot function eka
const submitAllBookings = () => {
  bookingListArray.forEach((booking, index) => {
    generateBookingNo(booking, index);
  });
  console.log(bookingListArray);
  //need to get user confirmation
  if (bookingListArray.length > 0) {
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
        let postResponse = httpServiceRequest("booking/insertBookingList", "POST", bookingListArray);
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
      title: "No Data to Submit",
      text: "Please add at least one booking to submit.",
      icon: "warning",
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
  }
};

// for generate booking no
let bookingListForBookingNo = getServiceRequest("booking/alldata");

// create booking no using customer name and previous booking no
const generateBookingNo = (booking, index) => {
  // get customer name first three chracters if it has only one word.but if customer have more than one word we get words first chracter
  let customerName = booking.customer_id;
  console.log(customerName);
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

  // after that we ger the year last two characters
  let currentYear = new Date().getFullYear().toString().slice(-2); // Get last two digits of the current year
  customerInitials += currentYear;

  // Get the last booking number and increment it

  let lastBooking = null;
  // bookinglist array eke length eka 0 nam api database eken gnnwa last booking eka.ehema naththan booking array eken gnnwa anthimata add karapu booking no eka;
  if (index === 0) {
    if (bookingListArray.length > 0) {
      lastBooking = bookingListForBookingNo[0];
    }
  } else {
    lastBooking = bookingListArray[index - 1];
  }

  console.log(lastBooking);
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
