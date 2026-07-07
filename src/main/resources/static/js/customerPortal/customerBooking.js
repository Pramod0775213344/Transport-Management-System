// Window load Function
window.addEventListener("load", () => {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      refreshCustomerBookingForm();
    } catch (e) {
      console.error("Error during booking page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);

  // Modal hidden event to refresh/clear after close completes animation
  $("#newBookingModal").on("hidden.bs.modal", function () {
    refreshCustomerBookingForm();
  });


});

// Booking Table Load Function
const loadcustomerBookingsTable = (bookings) => {
  if ($.fn.dataTable.isDataTable("#customerBookingsTable")) {
    $("#customerBookingsTable").DataTable().clear().destroy();
  }
  // Property List
  let propertyList = [
    { propertyName: "booking_no", dataType: "string" },
    { propertyName: getPickupLocation, dataType: "function" },
    { propertyName: getDeliveryLocation, dataType: "function" },
    { propertyName: "distance", dataType: "string" },
    { propertyName: getStatus, dataType: "function" },
  ];

  // Data Filling Function to Table
  dataFillIntoTheTable(customerBookingsTableBody, bookings, propertyList, bookingView, bookingEdit, bookingDelete);

  const table = $("#customerBookingsTable").DataTable({
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
      let deleteresponse = httpServiceRequest("/booking/delete", "DELETE", dataOb);
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
        refreshCustomerBookingForm();
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
  document.getElementById("offcanvasBookingNo").innerText = "#" + dataOb.booking_no;
  document.getElementById("offcanvasStatus").innerText = dataOb.booking_status_id ? dataOb.booking_status_id.status : "Unknown";

  const dateStr = dataOb.added_datetime || dataOb.pickup_date_time;
  if (dateStr) {
    const d = new Date(dateStr);
    document.getElementById("offcanvasDate").innerText = "Started " + d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  document.getElementById("offcanvasOrigin").innerText = dataOb.pickup_locations_id ? dataOb.pickup_locations_id.name : "N/A";
  document.getElementById("offcanvasDestination").innerText = dataOb.delivery_locations_id ? dataOb.delivery_locations_id.name : "N/A";

  // Repurpose Cargo Cards for Customer and Distance to be consistent with Booking data
  const weightParent = document.getElementById("offcanvasWeight").parentElement.parentElement;
  weightParent.querySelector("p").innerText = "Customer Name";
  document.getElementById("offcanvasWeight").innerText = dataOb.customer_id ? dataOb.customer_id.company_name : "N/A";
  document.getElementById("offcanvasWeight").style.fontSize = "1rem";
  document.getElementById("offcanvasWeight").nextElementSibling.innerText = "";
  weightParent.querySelector("i").className = "fa-solid fa-building mb-3";

  const volumeParent = document.getElementById("offcanvasVolume").parentElement.parentElement;
  volumeParent.querySelector("p").innerText = "Distance";
  document.getElementById("offcanvasVolume").innerText = dataOb.distance || "0";
  document.getElementById("offcanvasVolume").nextElementSibling.innerText = "KM";
  volumeParent.querySelector("i").className = "fa-solid fa-route mb-3";

  document.getElementById("offcanvasShipmentType").innerText = dataOb.vehicle_type_id ? dataOb.vehicle_type_id.name : "N/A";
  document.getElementById("offcanvasShipmentType").parentElement.querySelector("p").innerText = "Requested Vehicle Type";

  // Show Offcanvas
  const offcanvasElement = document.getElementById("bookingDetailsOffcanvas");
  const bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement);
  bsOffcanvas.show();
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

  // edita eked customer agreement gahala tiyen vehicle type tika witharak enna oni
  let vehicleTypes = getServiceRequest("/vehicletype/bycustomeragreementsandcustomerid?customer_id=" + dataOb.customer_id.id);
  dataFilIntoSelect(selectVehicleType, "Select Vehicle Type", vehicleTypes, "name");

  textContactPerson.value = dataOb.booking_contact_person_name;
  textContactPersonMobileNo.value = dataOb.booking_contact_person_mobileno;

  textPickupDateAndTime.value = dataOb.pickup_date_time;

  textDeliveryDateAndTime.value = dataOb.delivery_date_time;
  textDistance.value = dataOb.distance;

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
  let pickupLocation = getServiceRequest("/pickuplocation/bycustomerid?customer_id=" + dataOb.customer_id.id);
  dataFilIntoSelect(textPickupLocation, "Select Pickup Location", pickupLocation, "name");
  console.log("2-" + pickupLocation);
  textPickupLocation.value = JSON.stringify(dataOb.pickup_locations_id);
  pickupLocationPoint.innerText = dataOb.pickup_locations_id.name;

  console.log(dataOb);

  $("#newBookingModal").modal("show");
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
        let postResponse = httpServiceRequest("/booking/insert", "POST", booking);
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
          refreshCustomerBookingForm();
          // modal eka hide karanwa
          $("#newBookingModal").modal("hide");
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
  console.log(booking);

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
          let postResponse = httpServiceRequest("/booking/update", "PUT", booking);
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
            refreshCustomerBookingForm();
            $("#newBookingModal").modal("hide");
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
const refreshCustomerBookingForm = () => {
  console.log("Refreshing Customer Booking Form...");
  booking = new Object();
  booking.locations = new Array();

  customerBookingForm.reset();

  setDefault([
    textContactPerson,
    textContactPersonMobileNo,
    textPickupLocation,
    textPickupDateAndTime,
    textDeliveryLocation,
    textDeliveryDateAndTime,
    selectVehicleType,
  ]);


  // current date validate and previous date restrict
  currentdatetimevalidator("textPickupDateAndTime");

  submitButton.style.display = "";
  updateButton.style.display = "none";

  viaLocation.style.display = "none";
  waypointslist.style.display = "none";
  viaLocation.style.display = "none";


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

  loggedInUser = getServiceRequest("/loggeduserdetails");
  console.log(loggedInUser);

  bookings = getServiceRequest("/booking/bystatus?customerId=" + loggedInUser.customer_id);
  loadcustomerBookingsTable(bookings);

  // for generate booking no
  bookingList = getServiceRequest("/booking/alldata");

  // location list view eka
  pickupLocationPoint.innerText = "Select Pickup to see view";
  deliveryLocationPoint.innerText = " Select Delivery to see view";
};


// Export Functionality
const exportcustomerBookingsTable = (type) => {
  if (type === "excel") {
    exportTableToExcelWithSheetJS("#customerBookingsTable", "bookings", { sheetName: "Bookings" });
  } else if (type === "pdf") {
    exportTableToPdfWithJsPdf("#customerBookingsTable", "bookings", { title: "Bookings" });
  } else if (type === "print") {
    window.print();
  }
};

// get all active customers data
let customers = getServiceRequest("/customer/bycustomerstatus");

// create booking no using customer name and previous booking no
const generateBookingNo = () => {
  // input eke object jason parse karagannawa
  const selectCustomer = loggedInUser.customer_id;
  // get customer name first three chracters if it has only one word.but if customer have more than one word we get words first chracter
  let customerName = customers.find((customer) => customer.id === selectCustomer);;
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


const loadCustomerDetails = () => {

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
  let selectCustomer = loggedInUser.customer_id;
  console.log(selectCustomer + "-selectedcustomer");


  // gaththa customers lage all data walin id eka witharak gannawa
  let customerFound = customers.find((customer) => customer.id === selectCustomer);
  booking.customer_id = customerFound;

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
  companyname = loggedInUser.customer_id;

  let vehicleTypes = getServiceRequest("/vehicletype/bycustomeragreementsandcustomerid?customer_id=" + companyname);
  dataFilIntoSelect(selectVehicleType, "Select Vehicle Type", vehicleTypes, "name");

  let pickupLocation = getServiceRequest("/pickuplocation/bycustomerid?customer_id=" + companyname);
  dataFilIntoSelect(textPickupLocation, "Select Pickup Location", pickupLocation, "name");

  viaLocations = getServiceRequest("/location/bycustomerid?customer_id=" + companyname);
  dataFilIntoSelect(selectViaLocation, "Select Via Location", viaLocations, "name");

  let deliveryLocation = getServiceRequest("/deliverylocation/bycustomerid?customer_id=" + companyname);
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
};

// check box eka true karaddi input type clean wenna oni.e wage input eka flase karaddi select customers ta adal contact deatils tik aye   input type walata fill wela input type tika disabled wenna oni
checkContactPersonCheckBox.addEventListener("click", function () {
  // select wela thiyena eke object eka jason parse karagannawa
  let selectCustomer = loggedInUser.customer_id;

  // selecte wela customerge id eka witharak gannawa
  let customerFound = customers.find((customer) => customer.id === selectCustomer);

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


// route type eka anuwa ui eka display karanawa
// route type eka select karana function eka
const selecetRouteElemenet = document.getElementById("selectRouteType");
selecetRouteElemenet.addEventListener("change", () => {
  selectedValue = selecetRouteElemenet.value;

  if (selectedValue === "System Route") {
    viaLocation.style.display = "none";
    viaLocationCheckbox.style.display = "none";
    // selectCompanyNameElement
    let customerid = loggedInUser.customer_id;

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


// --------------------map eka-------------------------
let map;
let routingControl;

// map initialize function
function initMap() {
  if (typeof L === "undefined") {
    console.warn("Leaflet library (L) is not defined. Map features will not work offline without downloaded libraries.");
    return;
  }
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

  // Offline Tiles (Assume they will be downloaded to /maps/tiles/)
  // For now using OSM CDN, but can be changed to local path
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

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
  customerAgreementsList = getServiceRequest("/customeragreement/bylistcutomerandvehicletype?customerId=" + loggedInUser.customer_id + "&vehicleTypeId=" + JSON.parse(selectVehicleTypeElement.value).id,);
  for (const customeragreement of customerAgreementsList) {
    console.log(customeragreement);
    if (customeragreement.package_id.package_type === "Fix Rate") {
      availableAgreementDiv.style.display = "";
      divParentRadio.innerHTML = "";
      // select karana date ekata adala availabel agreemnt gnnawa
      let availableAgreements = getServiceRequest("/customeragreement/bycutomerandvehicletypeandgivendate?customerId=" + loggedInUser.customer_id + "&vehicleTypeId=" + JSON.parse(selectVehicleTypeElement.value).id + "&date=" + dateValue,);
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

