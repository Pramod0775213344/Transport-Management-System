
//  ----------------------------------------------------------------------------------------------------------------------------------------
// Window load Function
window.addEventListener("load", () => {

  loadBookingTable();
  refreshForm();

});

// Booking Table Load Function
const loadBookingTable = () => {
  // Booking Array

  bookings = getServiceRequest('/booking/bystatus');

  // Property List
  let propertyList = [
    { propertyName: "booking_no", dataType: "string" },
    { propertyName: getCustomer, dataType: "function" },
    { propertyName: getPickupLocation, dataType: "function" },
    { propertyName: getDeliveryLocation, dataType: "function" },
    { propertyName: "distance", dataType: "string" },
    { propertyName: getStatus, dataType: "function" }
  ];

  // Data Filling Function to Table
  dataFillIntoTheTable(bookingTableBody, bookings, propertyList, bookingView, bookingEdit, bookingDelete,);

  $('#bookingTable').DataTable();

};

// get customer name
const getCustomer = (dataOb) => {
  return dataOb.customer_id.company_name;
}

// get pickup location
const getPickupLocation = (dataOb) => {
  return dataOb.pickup_locations_id.name;
}

// get via locations if available
const getDeliveryLocation = (dataOb) => {
  return dataOb.delivery_locations_id.name;
}

// Status of The booking Table
let getStatus = (dataOb) => {
  if (dataOb.booking_status_id.status == "Inproccess") {
    return "<span class='status-badge status-inactive mt-2'>" + dataOb.booking_status_id.status + "</span>"
  }
}

// Delete Button Of the Table
const bookingDelete = (dataOb, index) => {
  console.log(dataOb);
  let userConfirm = Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete it!",
    allowOutsideClick: false,
    customClass :{
      cancelButton :'btn-3d btn-3d-cancel',
      confirmButton :'btn-3d btn-3d-delete'
    }
  }).then((userConfirm) => {
    if (userConfirm.isConfirmed) {
      //call post service
      let deleteresponse = httpServiceRequest("booking/delete", "DELETE", dataOb);;
      if (deleteresponse == "ok") {
        Swal.fire({
          title: "Deleted!",
          text: "Deleted Successfully",
          icon: "success",
          iconColor: "#d33",
          timer: 1000,
          showConfirmButton: false,
          customClass :{
            confirmButton :'btn-3d btn-3d-other'
          }
        });
        loadBookingTable();
        refreshForm();

      } else {
        Swal.fire({
          title: "Failed to Submit....?",
          text: postResponse,
          icon: "question",
          allowOutsideClick: false,
          customClass :{
            confirmButton :'btn-3d btn-3d-other'
          }
        });
      }
    } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: "Cancelled",
        text: "Details not Deleted!",
        icon: "error",
        customClass :{
          confirmButton :'btn-3d btn-3d-other'
        }
      });
    };
  });

};

// View Button Of the Table
const bookingView = (dataOb, index) => {

  dataCompanyName.innerText = dataOb.customer_id.company_name;
  dataBookingNo.innerText = dataOb.booking_no;
  dataContactPersonName.innerText = dataOb.booking_contact_person_name;
  dataContactPersonMobileNo.innerText = dataOb.booking_contact_person_mobileno;
  dataPickupLocation.innerText = dataOb.pickup_locations_id.name;
  dataPickupDateAndTime.innerText = dataOb.pickup_date_time;
  dataDeliveryLocation.innerText = dataOb.delivery_locations_id.name;
  dataDeliveryDateAndTime.innerText = dataOb.delivery_date_time;
  dataVehicleType.innerText = dataOb.vehicle_type_id.name;
  dataDistance.innerText = dataOb.distance;

  dataBookingStatus.innerText = dataOb.booking_status_id.status;


  $("#bookingViewForm").modal("show");
};

//Print Button  Of the Table
const buttonPrintRow = () => {
  let newWindow = window.open();
  let printView = "<head><title>TMS</title><link rel='stylesheet' href='/css/common.css'><link rel='stylesheet' href='/css/booking.css'><link rel='stylesheet' href='bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'></head><body>"
      + bookingPrintPreview.outerHTML +"</body>";
  newWindow.document.write(printView);

  setTimeout(() => {
    newWindow.stop();
    newWindow.print();
    newWindow.close();
  }, 500)
}

//Edit Button of the Table(for Refilling The Form)
const bookingEdit = (dataOb, index) => {
  console.log(dataOb);

  selectCompanyName.value = JSON.stringify(dataOb.customer_id);

  // edita eked customer agreement gahala tiyen vehicle type tika witharak enna oni
  let vehicleTypes = getServiceRequest('vehicletype/bycustomeragreementsandcustomerid?customer_id=' + dataOb.customer_id.id);
  dataFilIntoSelect(selectVehicleType, "Select Vehicle Type", vehicleTypes, "name")


  textContactPerson.value = dataOb.booking_contact_person_name;
  textContactPersonMobileNo.value = dataOb.booking_contact_person_mobileno;

  textPickupDateAndTime.value = dataOb.pickup_date_time;


  textDeliveryDateAndTime.value = dataOb.delivery_date_time;
  textDistance.value = dataOb.distance;


  document.getElementById('selectCompanyName').disabled = true;

  // waya locations thiyewn nam withrak meka wada karanawa
  if (dataOb.locations != null && dataOb.locations.length > 0) {
    vialocationchkbox.checked = "checked";
    vialocationLabel.innerText = 'Available';
    viaLocation.style.display = '';
    waypointslist.value = '';
    waypointslist.style.display = '';

    viaLocations = getServiceRequest('/location/withoutselectlocation?bookingid=' + dataOb.id);
    console.log(viaLocations)
    dataFilIntoSelect(selectViaLocation, "Select Via Location", viaLocations, "name")

    customeDataFilIntoSelect(waypointslist, "", dataOb.locations, "name")
  }

  selectVehicleType.value = JSON.stringify(dataOb.vehicle_type_id);

  updateButton.style.display = "";
  submitButton.style.display = "none";
  shipmentdetails.style.display = "";

  booking = JSON.parse(JSON.stringify(dataOb));
  oldBooking = JSON.parse(JSON.stringify(dataOb));

  // edit ekedi customer adala location tika witharak fill wenna oni
  let deliveryLocation = getServiceRequest('/deliverylocation/bycustomerid?customer_id=' + dataOb.customer_id.id);
  dataFilIntoSelect(textDeliveryLocation, "Select Delivery Location", deliveryLocation, "name")
  console.log("1" + deliveryLocation)
  textDeliveryLocation.value = JSON.stringify(dataOb.delivery_locations_id);

  // edit ekedi customer adala location tika witharak fill wenna oni
  let pickupLocation = getServiceRequest('pickuplocation/bycustomerid?customer_id=' + dataOb.customer_id.id);
  dataFilIntoSelect(textPickupLocation, "Select Pickup Location", pickupLocation, "name")
  console.log("2-"  + pickupLocation)
  textPickupLocation.value = JSON.stringify(dataOb.pickup_locations_id);

  $(document).ready(function () {
    // Activate the first tab by default (optional)
    $('#pills-bookingform-tab').click();
  });

  console.log(dataOb)
}

//Need to check all the fields are fill
const checkContactPersonCheckBox = document.getElementById("checkContactPersonCheckBox");
const checkFormError = () => {
  let errors = "";

  if (booking.customer_id == null) {
    errors = errors + "Please Enter Company Name..! \n";
  }
  if (booking.pickup_locations_id == null) {
    errors = errors + "Please Enter Pickup Location..! \n";
  }
  if (booking.pickup_date_time == null) {
    errors = errors + "Please Enter valid Pickup Date And Time..! \n";
  }
  if (booking.delivery_locations_id == null) {
    errors = errors + "Please Enter Delivery Location..! \n";
  }
  if (booking.delivery_date_time == null) {
    errors = errors + "Please Enter Delivery Date And Time..! \n";
  }
  if (booking.distance == null) {
    errors = errors + "Please Calculate the distance..! \n";
  }
  if (booking.vehicle_type_id == null) {
    errors = errors + "Please Select Vehicle Type..! \n";
  }
  if (checkContactPersonCheckBox.checked === true) {
    if (booking.booking_contact_person_name == null) {
      errors = errors + "Please Select Booking contact Person name... \n";
    }
    if (booking.booking_contact_person_mobileno == null) {
      errors = errors + "Please Select Booking Contact Person Mobile no... \n";
    }
  }
  if (vialocationchkbox.checked === true) {
    if (booking.locations.length === 0) {
      errors = errors + "Please Select via locations..! \n";
    }
  }
  return errors;
}

//Booking from submit event function
const bookingFormSubmit = () => {
  console.log(booking);

  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    // errors not exit
    //need to get user confirmation

    let userConfirm = Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, save it!",
      allowOutsideClick: false,
      customClass :{
        cancelButton :'btn-3d btn-3d-cancel',
        confirmButton :'btn-3d btn-3d-submit'
      }

    }).then((userConfirm) => {
      if (userConfirm.isConfirmed) {
        //call post service
        let postResponse = httpServiceRequest("booking/insert", "POST", booking);
        if (postResponse == "ok") {
          Swal.fire({
            title: "Saved!",
            text: "Saved Successfully",
            icon: "success",
            customClass :{
              confirmButton :'btn-3d btn-3d-other'
            }
          });
          loadBookingTable();
          refreshForm();
          $("#booking").offcanvas("hide");
        } else {
          Swal.fire({
            title: "Failed to Submit....?",
            text: postResponse,
            icon: "question",
            customClass :{
              confirmButton :'btn-3d btn-3d-other'
            }
          });
        }
      } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: "Cancelled",
          text: "Details not Saved!",
          icon: "error",
          customClass :{
            confirmButton :'btn-3d btn-3d-other'
          }
        });
      }
    });
  } else {
    Swal.fire({
      title: 'Error!',
      text: errors,
      icon: 'error',
      confirmButtonText: 'OK',
      allowOutsideClick: false,
      customClass :{
        confirmButton :'btn-3d btn-3d-other'
      }
    });
  }

}

//Need to check all the fields are fill
const checkFormUpdates = () => {
  let updates = "";

  if (booking != null && oldBooking != null) {

    if (booking.booking_contact_person_name != oldBooking.booking_contact_person_name) {
      updates = updates + "Contact Person Name  Changed..! \n";
    }
    if (booking.booking_contact_person_mobileno != oldBooking.booking_contact_person_mobileno) {
      updates = updates + "Contact Person Mobile No Changed..! \n";
    }
    if (booking.pickup_locations_id.name != oldBooking.pickup_locations_id.name) {
      updates = updates + "Pickup Location  Changed..! \n";
    }
    if (booking.pickup_date_time != oldBooking.pickup_date_time) {
      updates = updates + "Pickup Date And Time  Changed..! \n";
    }
    if (booking.delivery_locations_id.name != oldBooking.delivery_locations_id.name) {
      updates = updates + "Delivery Location Changed..! \n";
    }
    if (booking.delivery_date_time != oldBooking.delivery_date_time) {
      updates = updates + "Delivery Date And Time Changed..! \n";
    }
    if (booking.vehicle_type_id.name != oldBooking.vehicle_type_id.name) {
      updates = updates + "Vehicle Type Changed..! \n";
    }
    if (booking.locations.length != oldBooking.locations.length) {
      updates = updates + "Location Changed..! \n";
    }
  }

  return updates;
}

// update button
const bookingFormUpdate = () => {
  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    let updates = checkFormUpdates();
    // updates not exit
    if (updates == "") {
      Swal.fire({
        title: "Opps?",
        text: "Nothing To Update?",
        icon: "question",
        allowOutsideClick: false,
        customClass :{
          confirmButton :'btn-3d btn-3d-other'
        }
      });
    } else {
      let userConfirm = Swal.fire({
        title: "Are you sure?",
        text: "You want to update this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Update it!",
        allowOutsideClick: false,
        customClass :{
          cancelButton :'btn-3d btn-3d-cancel',
          confirmButton :'btn-3d btn-3d-update'
        }
      }).then((userConfirm) => {
        if (userConfirm.isConfirmed) {
          //call post service
          let postResponse = httpServiceRequest("booking/update", "PUT", booking);
          if (postResponse == "ok") {
            Swal.fire({
              title: "Update!",
              text: "Updated Successfully",
              icon: "success",
              customClass :{
                confirmButton :'btn-3d btn-3d-other'
              }
            });
            loadBookingTable();
            refreshForm();
            $("#booking").offcanvas("hide");

          } else {
            Swal.fire({
              title: "Failed to Submit....?",
              text: postResponse,
              icon: "question",
              customClass :{
                confirmButton :'btn-3d btn-3d-other'
              }
            });
          }
        } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: "Cancelled",
            text: "Details not Updated!",
            icon: "error",
            allowOutsideClick: false,
            customClass :{
              confirmButton :'btn-3d btn-3d-other'
            }
          });
        }
      });
    }
  } else {
    Swal.fire({
      title: 'Error!',
      text: errors,
      icon: 'error',
      confirmButtonText: 'OK',
      allowOutsideClick: false,
      customClass :{
        confirmButton :'btn-3d btn-3d-other'
      }
    });
  }
}

// form Refresh after submit the form
const refreshForm = () => {
  booking = new Object();
  booking.locations = new Array();
  booking.additionalChargersList = new Array();

  bookingForm.reset();

  setDefault([selectCompanyName, textContactPerson, textContactPersonMobileNo, textPickupLocation, textPickupDateAndTime, textDeliveryLocation, textDeliveryDateAndTime, selectVehicleType])

  let customers = getServiceRequest('/customer/byactiveagreements');
  dataFilIntoSelect(selectCompanyName, "Select Company Name", customers, "company_name")

  let vehicleTypes = getServiceRequest('/vehicletype/alldata');;
  dataFilIntoSelect(selectVehicleType, "Select Vehicle Type", vehicleTypes, "name")

  let pickupLocation = getServiceRequest('/pickuplocation/alldata');;
  dataFilIntoSelect(textPickupLocation, "Select Pickup Location", pickupLocation, "name")

  viaLocations = getServiceRequest('/location/alldata');
  dataFilIntoSelect(selectViaLocation, "Select Via Location", viaLocations, "name")

  dataFilIntoSelect(waypointslist, "", booking.locations, "name")

  let deliveryLocation = getServiceRequest('/deliverylocation/alldata');;
  dataFilIntoSelect(textDeliveryLocation, "Select Delivery Location", deliveryLocation, "name")


  // current date validate and previous date restrict
  currentdatetimevalidator('textPickupDateAndTime')

  submitButton.style.display = "";
  updateButton.style.display = "none";
  addButton.style.display = "none";

  viaLocation.style.display = "none";
  waypointslist.style.display = "none";

  document.getElementById('selectCompanyName').disabled = false;

  textDistance.disabled = false;

  shipmentdetails.style.display = "none";

//   chargers div eka clean wenna oni
  divChargers.innerHTML = "";

}

// -------------------------------------------------------------------------------------------------------------------
// get all active customers data
let customers = getServiceRequest('/customer/bycustomerstatus');

// cutomer select karaddi contact details auto fill kranwa function eka
let selectCompanyNameElement = document.querySelector("#selectCompanyName");
selectCompanyNameElement.addEventListener("change", () => {

  // booking object eka select customer value eka pass karanawa
  booking.customer_id = JSON.parse(selectCompanyNameElement.value);

  // check box eka details gnnw
  let checkBocCustomerPerson = document.querySelector("#checkContactPersonCheckBox");

  //customerwa change karaddi check box auto false wela input disbale wela value eka claen wenna oni
  checkBocCustomerPerson.checked = false;
  document.getElementById('textContactPerson').disabled = true;
  document.getElementById('textContactPersonMobileNo').disabled = true;
  document.getElementById('textContactPerson').value = "";
  document.getElementById('textContactPersonMobileNo').value = "";

  // validation remove wenna oni
  textContactPerson.classList.remove("is-invalid");
  textContactPerson.classList.remove("is-valid");

  textContactPersonMobileNo.classList.remove("is-invalid");
  textContactPersonMobileNo.classList.remove("is-valid");

  // input eke object jason parse karagannawa
  let selectCustomer = JSON.parse(selectCompanyNameElement.value);


  // gaththa customers lage all data walin id eka witharak gannawa
  let customerFound = customers.find(customer => customer.id === selectCustomer.id);

  // check box eka true kale naththan db eke thiyena contact data assign wenawa
  if (!checkBocCustomerPerson.checked) {
    console.log("12345")
    // gaththa id eka select karapu id eka samana nam conatct personge nama saha mobile nume eka input walata adesha wenawa
    if (customerFound) {
      document.getElementById('textContactPerson').value = customerFound.contact_person_fullname;
      document.getElementById('textContactPersonMobileNo').value = customerFound.contact_person_mobileno;
      booking.booking_contact_person_name = textContactPerson.value;
      booking.booking_contact_person_mobileno = textContactPersonMobileNo.value;
    }
  } else {
    document.getElementById('textContactPerson').disabled = true;
    document.getElementById('textContactPersonMobileNo').disabled = true;
    document.getElementById('textContactPerson').value = "";
    document.getElementById('textContactPersonMobileNo').value = "";

  }

//   -----------------------------------------------------------------------------------
//   cutomer anuwa vehicle type eka select karanawa
  companyname = JSON.parse(selectCompanyNameElement.value);
  booking.customer_id = JSON.parse(selectCompanyNameElement.value);

  let vehicleTypes = getServiceRequest('vehicletype/bycustomeragreementsandcustomerid?customer_id=' + companyname.id);
  dataFilIntoSelect(selectVehicleType, "Select Vehicle Type", vehicleTypes, "name")
  console.log(vehicleTypes)



  let pickupLocation = getServiceRequest('pickuplocation/bycustomerid?customer_id=' + companyname.id);
  dataFilIntoSelect(textPickupLocation, "Select Pickup Location", pickupLocation, "name")

  viaLocations = getServiceRequest('location/bycustomerid?customer_id=' + companyname.id);
  dataFilIntoSelect(selectViaLocation, "Select Via Location", viaLocations, "name")

  let deliveryLocation = getServiceRequest('/deliverylocation/bycustomerid?customer_id=' + companyname.id);;
  dataFilIntoSelect(textDeliveryLocation, "Select Delivery Location", deliveryLocation, "name")

  shipmentdetails.style.display = "";
  // customer change weddi add karala thiyena wayapoint ayin wenna oni
  waypointslist.innerHTML = '';

// customer change karaddi  validation clean wenna oni
  setDefault([textContactPerson, textContactPersonMobileNo, textPickupLocation, textDeliveryLocation, selectVehicleType])

  generateBookingNo();

});

// vehicle type ekai customer anuwa eyata adala package type eka fix rate nam distance eka 0 widihata defult pass karanawa
const vehicleTypeElement = document.querySelector("#selectVehicleType");
vehicleTypeElement.addEventListener("change", () => {

 vehicleType = JSON.parse(vehicleTypeElement.value);
  console.log(vehicleType);
  let packageName = getServiceRequest('/package/bycutomerandvehicletype?customerId='+companyname.id+'&vehicleTypeId='+vehicleType.id);
  console.log(packageName);
  for (const packageNameElement of packageName) {
    // package type eka fix rate nam distance eka 0 widihata defult pass karanawa
    if (packageNameElement.package_type == "Fix Rate") {
      booking.distance = parseFloat( 0.00).toFixed(2);
      textDistance.value = booking.distance;
      textDistance.disabled = true;
    } else {
      textDistance.disabled = false;
      textDistance.value = "";
      booking.distance = null;
    }
  }
  additionalChagersCheckBox();

});

// check box eka true karaddi input type clean wenna oni.e wage input eka flase karaddi select customers ta adal contact deatils tik aye   input type walata fill wela input type tika disabled wenna oni
checkContactPersonCheckBox.addEventListener("click", function () {

  // select wela thiyena eke object eka jason parse karagannawa
  let selectCustomer = JSON.parse(selectCompanyNameElement.value);

  // selecte wela customerge id eka witharak gannawa
  let customerFound = customers.find(customer => customer.id === selectCustomer.id);

  if (this.checked) {
    document.getElementById('textContactPerson').disabled = false;
    document.getElementById('textContactPersonMobileNo').disabled = false;
    document.getElementById('textContactPerson').value = null;
    document.getElementById('textContactPersonMobileNo').value = null;

  } else {

    // select wela thiyen customerge id ekata adala contact deatils tika assign karanwa input ekata
    if (customerFound) {
      document.getElementById('textContactPerson').disabled = true;
      document.getElementById('textContactPersonMobileNo').disabled = true;

      document.getElementById('textContactPerson').value = customerFound.contact_person_fullname;
      document.getElementById('textContactPersonMobileNo').value = customerFound.contact_person_mobileno;
      booking.booking_contact_person_name = textContactPerson.value;
      booking.booking_contact_person_mobileno = textContactPersonMobileNo.value;

      // validation remove wenna oni
      textContactPerson.classList.remove("is-invalid");
      textContactPerson.classList.remove("is-valid");

      textContactPersonMobileNo.classList.remove("is-invalid");
      textContactPersonMobileNo.classList.remove("is-valid");
    }
  }
})

// booking form clear Button
const bookingFormClearButton = () => {
  refreshForm();
}

// ----------------------------------------------------------------------------------------------

//Alert Box Call function
Swal.isVisible();

// waya point add button
const addWaypoint = () => {
  let selectedViaLocations = JSON.parse(selectViaLocation.value)
  booking.locations.push(selectedViaLocations);
  customeDataFilIntoSelect(waypointslist, "", booking.locations, "name")


  let extIndex = viaLocations.map(viaLocation => viaLocation.id).indexOf(selectedViaLocations.id);
  if (extIndex != -1) {
    viaLocations.splice(extIndex, 1);
  }
  dataFilIntoSelect(selectViaLocation, "Select Via Location", viaLocations, "name")
}

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

  dataList.forEach(dataOb => {
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
    button.className = "btn btn-danger";
    button.innerText = "Delete";
    button.id = "btndelete";
    button.onclick = () => {
      removeWaypoint(dataOb);
    }

    divcol.appendChild(option);
    divcolnext.appendChild(button);
    div.appendChild(divcol);
    div.appendChild(divcolnext);
    parentId.appendChild(div);
  });

}

// remove function via location from select list
const removeWaypoint = (dataOb) => {
  console.log(dataOb)
  let selectedViaLocations = JSON.parse(JSON.stringify(dataOb))
  console.log(selectedViaLocations);
  viaLocations.push(selectedViaLocations);
  dataFilIntoSelect(selectViaLocation, "Select Via Location", viaLocations, "name")


  let extIndex = booking.locations.map(viaLocation => viaLocation.id).indexOf(selectedViaLocations.id);
  if (extIndex != -1) {
    booking.locations.splice(extIndex, 1);
  }
  customeDataFilIntoSelect(waypointslist, "", booking.locations, "name")
}

//check box eka onclick ekedi list eka clean karanna oni
// delete all data function eka liyanna oni
let vialocationchkbox = document.getElementById("vialocationchkbox");
vialocationchkbox.addEventListener('click', () => {

  for (const viaLocation of booking.locations) {
    viaLocations.push(viaLocation);
  }
  dataFilIntoSelect(selectViaLocation, "Select Via Location", viaLocations, "name")

  booking.locations = [];
  customeDataFilIntoSelect(waypointslist, "", booking.locations, "name")
})

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
    customerInitials = customerNameParts.map(part => part.charAt(0).toUpperCase()).join("").substring(0, 3);
    console.log(customerInitials);
  }

  // after that we ger the year last two characters
    let currentYear = new Date().getFullYear().toString().slice(-2); // Get last two digits of the current year
    customerInitials += currentYear;

  let numberPart = 0;
  if (Array.isArray(bookings) && bookings.length > 0) {
    const lastBooking = bookings[bookings.length - 1];
    let lastBookingNo = lastBooking && lastBooking.booking_no ? lastBooking.booking_no : null;
    if (lastBookingNo && lastBookingNo.length >= 5) {
      numberPart = parseInt(lastBookingNo.slice(5)) || 0;
    }
  }
  let newBookingNo = customerInitials + String(numberPart + 1).padStart(8, "0");
  booking.booking_no = newBookingNo;
  console.log(newBookingNo);
}

// additional chargers check box function
const additionalChagersCheckBox = () => {

  // vehicle type ekatai customertai adala agreement eka gnnw
  let customeragreement = getServiceRequest("/customeragreement/bycutomerandvehicletype?customerId="+companyname.id+"&vehicleTypeId="+vehicleType.id);
  // customer agreement ekata anuwa customer adala additional chargers tika ganna oni
  let chargers = getServiceRequest("/customeragreementchargers/bycutomeragreement?customerId="+customeragreement.id);

  let divChargers = document.querySelector("#divChargers");
  divChargers.innerHTML = "";

  chargers.forEach((charge, index) => {
    let div = document.createElement("div");
    div.className = "form-check form-check-inline";


    let inputCheck = document.createElement("input");
    inputCheck.className = "form-check-input";
    inputCheck.type = "checkbox";

    inputCheck.onchange = () => {
      if (inputCheck.checked) {
        booking.additionalChargersList.push(charge);
        console.log(booking.additionalChargersList);
      } else {
        let extIndex = booking.additionalChargersList.map(charger => charger.charge_type).indexOf(charge.charge_type);
        if (extIndex != -1) {
          booking.additionalChargersList.splice(extIndex, 1);
        }
      }
    }
    div.appendChild(inputCheck);

    let label = document.createElement("label");
    label.className = "form-check-label";
    label.innerText = charge.charge_type;
    div.appendChild(label);

    divChargers.appendChild(div);

  });
}