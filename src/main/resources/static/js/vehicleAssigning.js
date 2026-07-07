window.addEventListener("load", () => {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      refresh();
      refreshVehicleAssigningForm();
    } catch (e) {
      console.error("Error during vehicle assigning page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);
});

// reset button
const reset = () => {
  bookingsCardsContainer.innerHTML =
    '<div id="emptyState" class="empty-state-wrapper">\n' +
    '<div class="empty-state-content">\n' +
    '<div class="icon-circle">\n' +
    '<i class="fas fa-search"></i> </div>\n' +
    "<h3>No Bookings to Show</h3>\n" +
    "<p>Please select a <b>Date Range</b> and <b>Customer</b>, then click <b>Search</b> to view available bookings.</p>\n" +
    "</div>\n" +
    "</div>";

  let customer = getServiceRequest("/customer/alldata");
  dataFilIntoSelect(selectCustomerSearch, "Select Customer ", customer, "company_name");

  dateFrom.value = "";
  dateTo.value = "";
  bookingCount.innerText = "-";
  txtSearch.disabled = true;
};

// load booking deatils
const search = () => {
  const customerIdElement = document.getElementById("selectCustomerSearch").value;
  if (dateFrom.value === "" || dateTo.value === "" || customerIdElement === "") {
    let currunetDateBookings = getServiceRequest("/booking/bycurruntdate");
    if (currunetDateBookings.length > 0) {
      loadVehicleAssigningCard(currunetDateBookings);
    } else {
      bookingsCardsContainer.innerHTML =
        '<div id="emptyState" class="empty-state-wrapper">\n' +
        '<div class="empty-state-content">\n' +
        '<div class="icon-circle">\n' +
        '<i class="fas fa-search"></i> </div>\n' +
        "<h3>No Bookings to Show</h3>\n" +
        "<p>Please select a <b>Date Range</b> and <b>Customer</b>, then click <b>Search</b> to view available bookings.</p>\n" +
        "</div>\n" +
        "</div>";
    }
    return; // Added return here to prevent further execution
  }

  const customerObj = JSON.parse(customerIdElement);
  bookingList = getServiceRequest("/booking/bydaterangeandcustomerid?startdate=" + dateFrom.value + "&enddate=" + dateTo.value + "&customerid=" + customerObj.id);
  loadVehicleAssigningCard(bookingList);
};

// load booking deatils
const loadVehicleAssigningCard = (bookingList) => {
  let propertyList = [
    { propertyName: "booking_no", dataType: "string" },
    {
      propertyName: getCustomer,
      dataType: "function",
    },
    {
      propertyName: getCustomerContactPersonName,
      dataType: "function",
    },
    { propertyName: getCustomerContactPersonMobile, dataType: "function" },
    {
      propertyName: getVehicleTypeForBooking,
      dataType: "function",
    },
    { propertyName: getPickupLoaction, dataType: "function" },
    {
      propertyName: "pickup_date_time",
      dataType: "datetime",
    },
    { propertyName: getViaLoaction, dataType: "function" },
    {
      propertyName: getDeliveryLoaction,
      dataType: "function",
    },
    { propertyName: "delivery_date_time", dataType: "datetime" },
    {
      propertyName: getDistance,
      dataType: "function",
    },
    { propertyName: getTransportNameForBooking, dataType: "function" },
    {
      propertyName: getSupplierDeatils,
      dataType: "function",
    },
    { propertyName: getVehicleNoForBooking, dataType: "function" },
    {
      propertyName: getVehicleTypeOfVehicle,
      dataType: "function",
    },
    { propertyName: getDriver, dataType: "function" },
    {
      propertyName: getDriverContactDetails,
      dataType: "function",
    },
    {
      propertyName: getStatus,
      dataType: "function",
    },
    {
      propertyName: getVehicleTypeForBooking,
      dataType: "function",
    },
  ];

  if (bookingList.length <= 0) {
    bookingsCardsContainer.innerHTML = "";
    Swal.fire({
      title: "No Bookings Found",
      text: "No bookings found for the selected customer and date range.",
      icon: "info",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    bookingsCardsContainer.innerHTML =
      '<div id="emptyState" class="empty-state-wrapper">\n' +
      '<div class="empty-state-content">\n' +
      '<div class="icon-circle">\n' +
      '<i class="fas fa-search"></i> </div>\n' +
      "<h3>No Bookings to Show</h3>\n" +
      "<p>Please select a <b>Date Range</b> and <b>Customer</b>, then click <b>Search</b> to view available bookings.</p>\n" +
      "</div>\n" +
      "</div>";
    return;
  } else {
    fillDataIntoTheBookingsCardView(bookingsCardsContainer, bookingList, propertyList, vehicleAssigningForm, datetimeFunctionForm, statusTracker);

    // -------------------type and search eka-----------------------------------
    // search eke input eke id eka ggnawa
    const txtSearch = document.getElementById("txtSearch");

    // input eke data type karaddi serach eka wada karanna oni
    txtSearch.addEventListener("input", () => {
      const searchTerm = txtSearch.value.toLowerCase();

      // array eken data filter karagannawa
      const filteredList = bookingList.filter((item) => {
        return (
          item.booking_no.toLowerCase().includes(searchTerm) || //  meka wada karanne vehicle no eka null naththan
          (item.vehicle_id && item.vehicle_id.vehicle_no.toLowerCase().includes(searchTerm)) ||
          item.pickup_locations_id.name.toLowerCase().includes(searchTerm) ||
          item.delivery_locations_id.name.toLowerCase().includes(searchTerm)
        );
      });

      // Filter wuna list eka aye display karanawa
      fillDataIntoTheBookingsCardView(bookingsCardsContainer, filteredList, propertyList, vehicleAssigningForm, datetimeFunctionForm, statusTracker);
    });
    txtSearch.disabled = false;
  }


  // btn hide karanwa
  applyPrivilegesCard("Vehicle Assigning", "bookingsCardsContainer", {
  });
};

// privilege apply karana function eka
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
    document.querySelectorAll(`#${cardContainerId} .assign-btn`)
      .forEach(btn => btn.style.display = p.privi_update ? "" : "none");

    document.querySelectorAll(`#${cardContainerId} .date-button`)
      .forEach(btn => btn.style.display = p.privi_update ? "" : "none");
  }
};

// get customer name
const getCustomer = (dataOb) => {
  return dataOb.customer_id.company_name;
};

// get pickuplocation
const getPickupLoaction = (dataOb) => {
  return dataOb.pickup_locations_id.name;
};

// get delivery Location
const getDeliveryLoaction = (dataOb) => {
  return dataOb.delivery_locations_id.name;
};

// get contact person name
const getCustomerContactPersonName = (dataOb) => {
  return dataOb.booking_contact_person_name;
};

// get contact person mobile no
const getCustomerContactPersonMobile = (dataOb) => {
  return dataOb.booking_contact_person_mobileno;
};

// get vehicle type
const getVehicleTypeForBooking = (dataOb) => {
  return dataOb.vehicle_type_id.name;
};

// get via locations if available
const getViaLoaction = (dataOb) => {
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

// distance eka ganna
const getDistance = (dataOb) => {
  return dataOb.distance + " km";
};

// get suppllier transport name
const getTransportNameForBooking = (dataOb) => {
  if (dataOb.vehicle_id) {
    if (dataOb.vehicle_id.supplier_id && dataOb.vehicle_id.supplier_id.transportname) {
      return dataOb.vehicle_id.supplier_id.transportname;
    } else {
      return "Company";
    }
  } else {
    return "-";
  }
};

// get supplier name
const getSupplierDeatils = (dataOb) => {
  if (dataOb.vehicle_id != null) {
    if (dataOb.vehicle_id.supplier_id == null) {
      return "Vehicle";
    } else {
      return dataOb.vehicle_id.supplier_id.fullname;
    }
  } else {
    return "-";
  }
};

// get vehicle no
const getVehicleNoForBooking = (dataOb) => {
  if (dataOb.vehicle_id != null) {
    return dataOb.vehicle_id.vehicle_no;
  } else {
    return "";
  }
};

// get assignng vehcle type
const getVehicleTypeOfVehicle = (dataOb) => {
  if (dataOb.vehicle_id != null) {
    return dataOb.vehicle_id.vehicle_type_id.name;
  } else {
    return "";
  }
};

// get driver
const getDriver = (dataOb) => {
  if (dataOb.vehicle_id != null) {
    return dataOb.driver_id.fullname;
  } else {
    return "";
  }
};

// get driver contact deatils
const getDriverContactDetails = (dataOb) => {
  if (dataOb.vehicle_id != null) {
    return dataOb.driver_id.mobileno;
  } else {
    return "";
  }
};

// get booking status with color
// get booking status with color
const getStatus = (dataOb) => {
  const status = dataOb.booking_status_id.status;
  let statusClass = "status-badge status-inactive";

  if (status === "Attend") {
    statusClass = "status-badge status-attend";
  } else if (status === "Arrived At Pickup" || status === "Departed From Pickup") {
    statusClass = "status-badge status-pending";
  } else if (status === "Arrived At Delivery" || status === "Departed From Delivery") {
    statusClass = "status-badge status-active";
  } else if (status === "Cancelled") {
    statusClass = "status-badge status-cancelled";
  } else if (status === "Inproccess" || status === "Inprocess") {
    statusClass = "status-badge status-inactive";
  }

  return `<div class="${statusClass}">
            <span>${status}</span>
          </div>`;
};

// assigning form open wena function eka
const vehicleAssigningForm = (dataOb) => {
  console.log(dataOb);
  if (dataOb.booking_status_id.status == "Cancelled") {
    Swal.fire({
      title: "Action Restricted",
      text: "Cannot assign a vehicle to a cancelled booking.",
      icon: "error",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    return;
  }

  // vehicle eka arrived wela nama loaction eken.vehicle eka change karanna ba/eka nisa modal eka open karanna ba
  if (dataOb.booking_status_id.status == "Inproccess" || dataOb.booking_status_id.status == "Attend") {
    // supplier vehcle list eka
    vehicleList = getServiceRequest("vehicle/vehiclebyvehiclegroupandvehicletype?customer_id=" + dataOb.customer_id.id + "&vehicletype_id=" + dataOb.vehicle_type_id.id);
    // cpmapny vehiccle list eka
    companyVehicleList = getServiceRequest("vehicle/companyvehiclebyvehicletype?vehicletype_id=" + dataOb.vehicle_type_id.id);
    // busy vehicles id list eka
    busyVehicleIds = getServiceRequest("/booking/busyvehicleids");

    // // vehicle details null neme nam refill wenna oni
    if (dataOb.vehicle_id) {
      console.log("1");

      // available supplier vehicles
      availableVehicleList = vehicleList.filter((vehicle) => {
        return !busyVehicleIds.includes(vehicle.id) || vehicle.id == dataOb.vehicle_id.id;
      });

      // availablecompanyList
      availablecompanyVehicleList = companyVehicleList.filter((vehicle) => {
        return !busyVehicleIds.includes(vehicle.id) || vehicle.id == dataOb.vehicle_id.id;
      });

      // length 1 nam owan vehicle tika dropdwon eke show karanaw, else nama available vehicle tika show karanwa
      if (availableVehicleList.length === 1 || availablecompanyVehicleList.length === 1) {
        console.log("2");
        document.getElementById("vehicleWarning").innerText = "No available vehicles! Use 'Show Company Vehicles' option.";
        document.getElementById("vehicleWarningDiv").style.display = "block";
        document.getElementById("btnAvailable").style.display = "none";
        document.getElementById("btnShow").style.display = "block";
        document.getElementById("whichListLoadDiv").style.display = "none";
        console.log();

        if (dataOb.vehicle_id.supplier_id == null) {
          console.log("3");
          dataFilIntoSelect(selectVehicleNo, "Select Vehicle ", availablecompanyVehicleList, "vehicle_no");
        } else {
          console.log("4");
          dataFilIntoSelect(selectVehicleNo, "Select Vehicle ", availableVehicleList, "vehicle_no");
        }

        btnShow.addEventListener("click", () => {
          loadCompanyVehicles(availablecompanyVehicleList);
        });

        selectVehicleNo.value = JSON.stringify(dataOb.vehicle_id);
      } else if (!availablecompanyVehicleList.length === 1) {
        console.log("5");
        document.getElementById("vehicleWarningDiv").style.display = "none";
        document.getElementById("btnShow").style.display = "none";
        document.getElementById("btnAvailable").style.display = "block";
        document.getElementById("whichListLoad").innerText = "Already loaded Company Vehicles";
        document.getElementById("whichListLoadDiv").style.display = "block";
        dataFilIntoSelect(selectVehicleNo, "Select Vehicle ", availablecompanyVehicleList, "vehicle_no");
        selectVehicleNo.value = JSON.stringify(dataOb.vehicle_id);
      } else {
        console.log("6");
        document.getElementById("vehicleWarningDiv").style.display = "none";
        document.getElementById("btnShow").style.display = "none";
        document.getElementById("whichListLoadDiv").style.display = "none";
        dataFilIntoSelect(selectVehicleNo, "Select Vehicle ", availableVehicleList, "vehicle_no");
        selectVehicleNo.value = JSON.stringify(dataOb.vehicle_id);
      }
    } //vehicel id eka null num
    else {
      console.log("7");
      // availabe vehicle list eka saha selecct karana booking eke danata assign karala thiyena vehicle eka gnnawa
      availableVehicleList = vehicleList.filter((vehicle) => {
        return !busyVehicleIds.includes(vehicle.id);
      });

      // availablecompanyList
      availablecompanyVehicleList = companyVehicleList.filter((vehicle) => {
        return !busyVehicleIds.includes(vehicle.id);
      });

      if (availableVehicleList.length === 0) {
        console.log("8");
        document.getElementById("vehicleWarning").innerText = "No available vehicles! Use 'Show Company Vehicles' option.";
        document.getElementById("vehicleWarningDiv").style.display = "block";
        document.getElementById("btnAvailable").style.display = "none";
        document.getElementById("btnShow").style.display = "block";
        document.getElementById("whichListLoadDiv").style.display = "none";
        dataFilIntoSelect(selectVehicleNo, "No Available Vehicles", [], "vehicle_no");
        btnShow.addEventListener("click", () => {
          loadCompanyVehicles(availablecompanyVehicleList);
        });
      } else {
        console.log("9");
        document.getElementById("vehicleWarningDiv").style.display = "none";
        document.getElementById("btnAvailable").style.display = "block";
        document.getElementById("btnShow").style.display = "none";
        document.getElementById("whichListLoadDiv").style.display = "none";
        dataFilIntoSelect(selectVehicleNo, "Select Vehicle ", availableVehicleList, "vehicle_no");
      }
    }

    // driver details null neme nam refill wenna oni
    if (dataOb.driver_id) {
      if (dataOb.vehicle_id.supplier_id == null) {
        let driverBySupplier = getServiceRequest("/driver/comanydrivers");

        let busyDriversId = getServiceRequest("booking/busydriversId");
        // availabe driver list eka saha selecct karana booking eke danata assign karala thiyena driver gnnawa
        let availableDrivers = driverBySupplier.filter((driver) => {
          return !busyDriversId.includes(driver.id) || driver.id == dataOb.driver_id.id;
        });

        dataFilIntoSelect(selectdriver, "Select Driver ", availableDrivers, "fullname");
        selectdriver.value = JSON.stringify(dataOb.driver_id);
      } else {
        let driverBySupplier = getServiceRequest("/driver/bysupplierid?supplierid=" + dataOb.vehicle_id.supplier_id.id);

        let busyDriversId = getServiceRequest("booking/busydriversId");
        // availabe driver list eka saha selecct karana booking eke danata assign karala thiyena driver gnnawa
        let availableDrivers = driverBySupplier.filter((driver) => {
          return !busyDriversId.includes(driver.id) || driver.id == dataOb.driver_id.id;
        });

        dataFilIntoSelect(selectdriver, "Select Driver ", availableDrivers, "fullname");
        selectdriver.value = JSON.stringify(dataOb.driver_id);
      }
    }
  } else {
    Swal.fire({
      title: "Action Restricted",
      text: "Cannot assign the vehicle.Because Already Updated arrived at pickup time of this booking.",
      icon: "error",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    return;
  }
  if (dataOb.booking_status_id.status == "Inproccess") {
    updateButton.style.display = "none";
    submitButton.style.display = "";
  } else {
    updateButton.style.display = "";
    submitButton.style.display = "none";
  }

  booking = JSON.parse(JSON.stringify(dataOb));
  oldBooking = JSON.parse(JSON.stringify(dataOb));

  $("#vehicleAssigning").modal("show");

  //     -------------------------revenue----------------------------

  // select month eka filter karala gnnw
  let selectDateMonth = new Date(dateFrom.value).getMonth();
  // current month eka filter karala gnnw
  let currentMonth = new Date().getMonth();

  // current month ekai select karana month ekai samana nam table eka load wenawa
  if (selectDateMonth === currentMonth) {
    revenueTable.style.display = "";

    let datalist = getServiceRequest("report/vehicleRevenueByVehicleType?customerId=" + dataOb.customer_id.id + "&vehicleTypeId=" + dataOb.vehicle_type_id.id);

    let reportDatalist = new Array();

    for (const index in datalist) {
      let object = new Object();
      object.vehicle_no = datalist[index][0];
      object.distance = datalist[index][1].toFixed(2) + " KM";
      reportDatalist.push(object);
    }
    // Sort by distance descending(distance eka wadiya thiyena eka first)
    reportDatalist.sort((a, b) => b.distance - a.distance);

    let propertyList = [
      { propertyName: "vehicle_no", dataType: "string" },
      {
        propertyName: "distance",
        dataType: "string",
      },
    ];

    dataFillIntoTheReportTable(revenueViewTableBody, reportDatalist, propertyList);
  } else {
    revenueTable.style.display = "none";
    revenueViewTableBody.innerHTML = "";
  }

  //     -------------------------revenue----------------------------
};

// show btn eka click kalama data tika fil karanwa
const loadCompanyVehicles = (list) => {
  dataFilIntoSelect(selectVehicleNo, "Select Vehicles", list, "vehicle_no");
};

// datetime adding modal form open function
const datetimeFunctionForm = (dataOb) => {
  // cancelled karapu booking wala date time add karann ba
  if (dataOb.booking_status_id.status == "Cancelled") {
    Swal.fire({
      title: "Action Restricted",
      text: "Cannot add date and time details for a cancelled booking.",
      icon: "error",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    return;
  }
  if (dataOb.booking_status_id.status == "Inproccess") {
    Swal.fire({
      title: "Vehicle Assignment Required",
      text: "Please assign a vehicle to the booking before adding date and time details.",
      icon: "info",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    return;
  }

  if (dataOb.arrived_at_pickup_datetime != null) {
    pickupDateAndTime.value = dataOb.arrived_at_pickup_datetime;

    dateEditButton.style.display = "";
    dateAddButton.style.display = "none";
  }
  if (dataOb.departed_from_pickup_datetime != null) {
    departedPickupDateAndTime.value = dataOb.departed_from_pickup_datetime;

    pickupDateAndTime.disabled = true;

    dateEditButton.style.display = "";
    dateAddButton.style.display = "none";
  }
  if (dataOb.arrived_at_delivery_datetime != null) {
    arrivedDeliveryDateAndTime.value = dataOb.arrived_at_delivery_datetime;

    pickupDateAndTime.disabled = true;
    departedPickupDateAndTime.disabled = true;

    dateEditButton.style.display = "";
    dateAddButton.style.display = "none";
  }
  if (dataOb.departed_from_delivery_datetime != null) {
    departedDeliveryDateAndTime.value = dataOb.departed_from_delivery_datetime;

    pickupDateAndTime.disabled = true;
    departedPickupDateAndTime.disabled = true;
    arrivedDeliveryDateAndTime.disabled = true;

    dateEditButton.style.display = "";
    dateAddButton.style.display = "none";
  }

  //floating rate nam meter reading area eka hide wenawa
  if (dataOb.customer_agreement_id.package_id.package_type == "Floating Rate") {
    meterReadingDiv.style.display = "none";
  }
  if (dataOb.customer_agreement_id.package_id.package_type == "Fix Rate") {
    meterReadingDiv.style.display = "";
    textLastMeterReading.value = dataOb.vehicle_id.current_meter_reading;
  }

  textStartMeterReading.value = dataOb.strat_meter_reading;
  textEndtMeterReading.value = dataOb.end_meter_reading;

  // reason mapping eka - JSON values filter kara select karanna
  if (dataOb.pickup_delay_reason_id != null) {
    selectPickupDelayReason.value = dataOb.pickup_delay_reason_id.id;
  }
  if (dataOb.delivery_delay_reason_id != null) {
    selectDeliveryDelayReason.value = dataOb.delivery_delay_reason_id.id;
  }

  console.log(dataOb);
  $("#datetimeAddingFormModal").modal("show");

  booking = JSON.parse(JSON.stringify(dataOb));
  oldBooking = JSON.parse(JSON.stringify(dataOb));
};

// reason eka view karan validation function eka
// picku delay div eka view karann ariived at pickup time eka request pickutime ekata wada wishala nama
pickupDateAndTime = document.getElementById("pickupDateAndTime");
pickupDelayCollapse = new bootstrap.Collapse(document.getElementById("pickupDelayDiv"), { toggle: false });

pickupDateAndTime.addEventListener("change", () => {
  actualPickupDateTime = pickupDateAndTime.value;
  requestPickUpDatetime = booking.pickup_date_time;
  if (actualPickupDateTime > requestPickUpDatetime) {
    pickupDelayCollapse.show();
  } else {
    pickupDelayCollapse.hide();
  }
});

// delivery delay eka view karanne arrived at delivery time ka request delivery time ekata wada wishala nama
arrivedDeliveryDateAndTime = document.getElementById("arrivedDeliveryDateAndTime");
deliveryDelayCollapse = new bootstrap.Collapse(document.getElementById("deliveryDelayDiv"), { toggle: false });

arrivedDeliveryDateAndTime.addEventListener("change", () => {
  actualDeliveryDateTime = arrivedDeliveryDateAndTime.value;
  requestDeliveryDatetime = booking.delivery_date_time;
  if (actualDeliveryDateTime > requestDeliveryDatetime && actualDeliveryDateTime != null) {
    deliveryDelayCollapse.show();
  } else {
    deliveryDelayCollapse.hide();
  }
});

// form errors check karana function eka
const checkFormError = () => {
  let errors = "";

  if (booking.driver_id == null) {
    errors = errors + "Please Select Driver Name..<br>";
  }
  if (booking.vehicle_id == null) {
    errors = errors + " Please Select Vehicle No..<br>";
  }
  return errors;
};

// form submittion button eka
const vehicleAssigningFormSubmitButton = () => {
  console.log(booking);
  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    // errors not exit
    //need to get user confirmation

    let userConfirm = Swal.fire({
      title: "Confirm Vehicle Assignment",
      text: "Are you sure you want to assign this vehicle to the booking?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Assign Vehicle",
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
        let putResponse = httpServiceRequest("/vehicleassigning/update", "PUT", booking);
        if (putResponse == "ok") {
          Swal.fire({
            title: "Vehicle Assigned!",
            text: "Vehicle has been successfully assigned to the booking.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });

          refreshVehicleAssigningForm();
          statusTracker(booking);
          $("#vehicleAssigning").modal("hide");
          search();
        } else {
          Swal.fire({
            title: "Assignment Failed.",
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
          text: "Vehicle assignment not saved!",
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
      title: "Assignment Incomplete",
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
  console.log(booking);
};

// check form update function eka
const checkFormUpdates = () => {
  let updates = "";

  if (booking != null && oldBooking != null) {
    if (booking.vehicle_id.vehicle_no != oldBooking.vehicle_id.vehicle_no) {
      updates = updates + "Vehicle No changed ";
    }
    if (booking.driver_id.fullname != oldBooking.driver_id.fullname) {
      updates = updates + "Driver changed ";
    }
  }
  return updates;
};

// vehicle assigning form update button eka
const vehicleAssigningFormUpdate = () => {
  console.log(booking);
  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    let updates = checkFormUpdates();
    // updates not exit
    if (updates == "") {
      Swal.fire({
        title: "Nothing to Update",
        text: "No changes were detected in the assignment details.",
        icon: "info",
        allowOutsideClick: false,
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    } else {
      let userConfirm = Swal.fire({
        title: "Confirm Update",
        text: "Are you sure you want to update the assignment details?",
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
      }).then((userConfirm) => {
        if (userConfirm.isConfirmed) {
          //call putt service
          let putResponse = httpServiceRequest("/vehicleassigning/update", "PUT", booking);
          if (putResponse == "ok") {
            Swal.fire({
              title: "Updated!",
              text: "Assignment details have been successfully updated.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: "swal2-border-radius",
              },
            });

            refreshVehicleAssigningForm();
            statusTracker(booking);
            $("#vehicleAssigning").modal("hide");
            search();
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
            text: "Update process cancelled!",
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
      title: "Update Incomplete",
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

const checkDateFormError = () => {
  let errors = "";
  if (booking.arrived_at_pickup_datetime == null) {
    errors = errors + "Please Select arrive date.";
  }
  // depart time eka null nathi saha package eka fix rate nam aniwaren complete karaddi end meter reading eka thiyenna oni
  if (booking.customer_agreement_id.package_id.package_type == "Fix Rate") {
    if (!booking.strat_meter_reading) {
      errors = errors + "Please enter the start meter reading.";
    }

    if (booking.departed_from_delivery_datetime != null) {
      if (!booking.end_meter_reading) {
        errors = errors + "Can not complete booking.please update the End meter reading.";
      }
    }
  }
  const currentPickupDateTime = pickupDateAndTime.value;
  const reqPickUpDatetime = booking.pickup_date_time;
  const currentDeliveryDateTime = arrivedDeliveryDateAndTime.value;
  const reqDeliveryDatetime = booking.delivery_date_time;

  if (currentDeliveryDateTime != "" && currentDeliveryDateTime > reqDeliveryDatetime) {
    if (booking.delivery_delay_reason_id == null) {
      errors = errors + "Please select the reason for delivery delay.<br>";
    }
  }
  if (currentPickupDateTime != "" && currentPickupDateTime > reqPickUpDatetime) {
    if (booking.pickup_delay_reason_id == null) {
      errors = errors + "Please select the reason for pickup delay.<br>";
    }
  }
  return errors;
};

// date adding button finction
const dateAddingButton = () => {
  let errors = checkDateFormError();

  if (errors == "") {
    let customeResponse = httpServiceRequest("/vehicleassigning/arrivedatpickupdatetime", "PUT", booking);
    if (customeResponse == "ok") {
      Swal.fire({
        title: "Date Added!",
        text: "Date and time have been successfully added.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: "swal2-border-radius",
        },
      });
      search();
      refreshVehicleAssigningForm();
      statusTracker(booking);
      $("#datetimeAddingFormModal").modal("hide");
    } else {
      Swal.fire({
        title: "Addition Failed",
        text: customeResponse,
        icon: "error",
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    }
  } else {
    Swal.fire({
      title: "Incomplete Data",
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

// check form update function eka
const checkDateFormUpdates = () => {
  let updates = "";

  if (booking != null && oldBooking != null) {
    if (booking.arrived_at_pickup_datetime != oldBooking.arrived_at_pickup_datetime) {
      updates = updates + "Arrived at Pickup date and time changed ";
    }
    if (booking.departed_from_pickup_datetime != oldBooking.departed_from_pickup_datetime) {
      updates = updates + " Departed from Pickup date and time changed";
    }
    if (booking.arrived_at_delivery_datetime != oldBooking.arrived_at_delivery_datetime) {
      updates = updates + " Arrived at Delivery date and time changed";
    }
    if (booking.departed_from_delivery_datetime != oldBooking.departed_from_delivery_datetime) {
      updates = updates + " Departed from Delivery date and time changed";
    }

    if (booking.strat_meter_reading != oldBooking.strat_meter_reading) {
      updates = updates + " Meter Reading changed";
    }

    if (booking.end_meter_reading != oldBooking.end_meter_reading) {
      updates = updates + " Distance changed";
    }
  }
  return updates;
};

// date form  update button eka
const dateUpadteButton = () => {
  // check form error for required element
  let errors = checkDateFormError();
  if (errors == "") {
    let updates = checkDateFormUpdates();
    // updates not exit
    if (updates == "") {
      Swal.fire({
        title: "Nothing to Update",
        text: "No changes were detected in the date/time details.",
        icon: "info",
        allowOutsideClick: false,
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    } else {
      let userConfirm = Swal.fire({
        title: "Confirm Update",
        text: "Are you sure you want to update the date/time details?",
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
      }).then((userConfirm) => {
        if (userConfirm.isConfirmed) {
          //call putt service
          let putResponse = httpServiceRequest("/vehicleassigning/arrivedatpickupdatetime", "PUT", booking);
          if (putResponse == "ok") {
            Swal.fire({
              title: "Updated!",
              text: "Date and time details updated successfully.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: "swal2-border-radius",
              },
            });
            search();
            refreshVehicleAssigningForm();
            statusTracker();
            $("#datetimeAddingFormModal").modal("hide");
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
            text: "Update process cancelled!",
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
      title: "Update Incomplete",
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

// refresh form funtion eka
const refresh = () => {
  booking = new Object();
  pickupDelayCollapse.hide();
  deliveryDelayCollapse.hide();
  datetimeAddingForm.reset();
  selectPickupDelayReason.selectedIndex = 0;
  selectDeliveryDelayReason.selectedIndex = 0;
  // let transportnames = getServiceRequest('/supplier/alldatabystatus');
  // dataFilIntoSelect(selectTransportName, "Select Transport Name", transportnames, "transportname")

  let driver = getServiceRequest("/driver/alldata");
  dataFilIntoSelect(selectdriver, "Select Driver ", driver, "fullname");

  let pickupDelay = getServiceRequest("/delayreasons/forpickup");
  dataFilIntoSelect(selectPickupDelayReason, "Select Reason ", pickupDelay, "delay_reasons");

  let deliveryDelay = getServiceRequest("/delayreasons/fordelivery");
  dataFilIntoSelect(selectDeliveryDelayReason, "Select Reason ", deliveryDelay, "delay_reasons");

  updateButton.style.display = "none";
  submitButton.style.display = "";

  dateEditButton.style.display = "none";
  dateAddButton.style.display = "";

  pickupDateAndTime.disabled = false;
  departedPickupDateAndTime.disabled = false;
  arrivedDeliveryDateAndTime.disabled = false;

  setDefault([
    selectPickupDelayReason,
    selectDeliveryDelayReason,
    selectVehicleNo,
    selectdriver,
    pickupDateAndTime,
    departedPickupDateAndTime,
    arrivedDeliveryDateAndTime,
    departedDeliveryDateAndTime,
    textStartMeterReading,
    textEndtMeterReading,
  ]);

  let customer = getServiceRequest("/customer/alldata");
  dataFilIntoSelect(selectCustomerSearch, "Select Customer ", customer, "company_name");

  dateFrom.value = "";
  dateTo.value = "";
  txtSearch.disabled = true;

  let currunetDateBookings = getServiceRequest("/booking/bycurruntdate");
  if (currunetDateBookings.length > 0) {
    loadVehicleAssigningCard(currunetDateBookings);
  } else {
    bookingsCardsContainer.innerHTML =
      '<div id="emptyState" class="empty-state-wrapper">\n' +
      '<div class="empty-state-content">\n' +
      '<div class="icon-circle">\n' +
      '<i class="fas fa-search"></i> </div>\n' +
      "<h3>No Bookings to Show</h3>\n" +
      "<p>Please select a <b>Date Range</b> and <b>Customer</b>, then click <b>Search</b> to view available bookings.</p>\n" +
      "</div>\n" +
      "</div>";
  }
  resetSteps();
  // btn hide karanwa
  applyPrivilegesCard("Vehicle Assigning", "bookingsCardsContainer", {
  });

};

const refreshVehicleAssigningForm = () => {
  // let vehicleList = getServiceRequest("vehicle/vehiclebyvehiclegroupandvehicletype?customer_id="+booking.customer_id.id +"&vehicletype_id="+booking.vehicle_type_id.id);
  // dataFilIntoSelect(selectVehicleNo, "Select Vehicle ", vehicleList, "vehicle_no")

  let driver = getServiceRequest("/driver/alldata");
  dataFilIntoSelect(selectdriver, "Select Driver ", driver, "fullname");

  let vehicleList = getServiceRequest("/vehicle/alldata");
  dataFilIntoSelect(selectVehicleNo, "Select Vehicle ", vehicleList, "vehicle_no");

  updateButton.style.display = "none";
  submitButton.style.display = "";

  datetimeAddingForm.reset();
  setDefault([
    selectVehicleNo,
    selectdriver,
    pickupDateAndTime,
    departedPickupDateAndTime,
    arrivedDeliveryDateAndTime,
    departedDeliveryDateAndTime,
    textStartMeterReading,
    textEndtMeterReading,
  ]);

  // Collapse and reasons also reset wenna oni me refreshForm ekedi
  pickupDelayCollapse.hide();
  deliveryDelayCollapse.hide();
  selectPickupDelayReason.selectedIndex = 0;
  selectDeliveryDelayReason.selectedIndex = 0;

  resetSteps();
};

// select driver name by suppliier id using vehicle id
selectVehicleNo.addEventListener("change", () => {
  let vehicle = JSON.parse(selectVehicleNo.value);
  let supplier = vehicle.supplier_id;
  selectVehicleNo.classList.add("is-valid");
  booking.vehicle_id = JSON.parse(selectVehicleNo.value);
  // select karan vehicle eke supllier null nam company driverslas load karanwa
  if (supplier == null) {
    let companyDrivers = getServiceRequest("/driver/comanydrivers");
    console.log(companyDrivers);
    let busyDriversId = getServiceRequest("booking/busydriversId");
    let availableDrivers = companyDrivers.filter((driver) => {
      return !busyDriversId.includes(driver.id);
    });
    console.log(availableDrivers);

    dataFilIntoSelect(selectdriver, "Select Driver ", availableDrivers, "fullname");
  } else {
    let driverBySupplier = getServiceRequest("/driver/bysupplierid?supplierid=" + supplier.id);
    let busyDriversId = getServiceRequest("booking/busydriversId");
    let availableDrivers = driverBySupplier.filter((driver) => {
      return !busyDriversId.includes(driver.id);
    });
    dataFilIntoSelect(selectdriver, "Select Driver ", availableDrivers, "fullname");
  }

  // object eka saha validation clear karanna oni
  selectdriver.classList.remove("is-valid");
  booking.driver_id = "";

  // diasble wena ewa none disable karanna oni.
  pickupDateAndTime.disabled = false;
  departedPickupDateAndTime.disabled = false;
  arrivedDeliveryDateAndTime.disabled = false;
  departedDeliveryDateAndTime.disabled = false;
});

//Alert Box Call function
Swal.isVisible();

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

// end meter reading validator
textEndtMeterReading.addEventListener("keyup", () => {
  const elementValue = textEndtMeterReading.value;
  const regExp = new RegExp("^[0-9]{2,15}$");

  if (elementValue != "") {
    if (regExp.test(elementValue)) {
      const startMeterReading = parseFloat(booking.strat_meter_reading);
      const endMeterReading = parseFloat(elementValue);

      // end meter reading eka vishala wenna oni start meter reading ekataw wada
      if (!isNaN(startMeterReading) && !isNaN(endMeterReading) && startMeterReading < endMeterReading) {
        textEndtMeterReading.classList.remove("is-invalid");
        textEndtMeterReading.classList.add("is-valid");
        booking.end_meter_reading = endMeterReading;
      } else {
        textEndtMeterReading.classList.remove("is-valid");
        textEndtMeterReading.classList.add("is-invalid");
        booking.end_meter_reading = null;
      }
    } else {
      textEndtMeterReading.classList.remove("is-valid");
      textEndtMeterReading.classList.add("is-invalid");
      booking.end_meter_reading = null;
    }
  } else {
    if (textEndtMeterReading.required) {
      textEndtMeterReading.classList.remove("is-valid");
      textEndtMeterReading.classList.add("is-invalid");
      booking.end_meter_reading = null;
    } else {
      textEndtMeterReading.classList.remove("is-invalid");
      booking.end_meter_reading = "";
    }
  }
  // customer package eka fix rate nam distance calculate wenna oni start meter reading eka saha end meter reading eke differences eken
  if (booking.strat_meter_reading != null && booking.end_meter_reading != null) {
    const distanceTotal = booking.end_meter_reading - booking.strat_meter_reading;
    console.log(`Distance: ${distanceTotal} km`);
    booking.distance = distanceTotal;
  } else {
    console.log("Start or end meter reading is missing.");
  }
});

const bookingListsForDate = getServiceRequest("/booking/alldata");

const fromDate = new Date("2024-03-24T01:03");
const toDate = new Date("2024-05-24T01:03");

const daterange = bookingListsForDate.filter((booking) => {
  const pickupDate = new Date(booking.pickup_date_time);
  const deliveryDate = new Date(booking.delivery_date_time);

  return pickupDate >= fromDate && deliveryDate <= toDate;
});

// -----------------testing for use card view---------------------

const fillDataIntoTheBookingsCardView = (container, dataList, propertyList, editAction, datetimeFunctionForm, viewFunction) => {
  // booking count eka
  const bookingCount = document.getElementById("bookingCount");
  bookingCount.innerText = dataList.length;

  container.innerHTML = "";

  dataList.forEach((dataOb, index) => {
    //card eka create karagannwA
    const card = document.createElement("div");
    card.className = "main-card booking-card-premium";

    //bookings gana pennana badge eka hadaggnawa
    const badge = document.createElement("div");
    badge.className = "booking-badge";
    badge.innerText = "B" + (index + 1);
    card.appendChild(badge);

    // card eke body eka create karagannawa
    const content = document.createElement("div");
    content.className = "booking-card-body";

    // property values tika daganna oni variables tika hadagannawa
    let bookingNo = dataOb.booking_no;
    let pickupDate = datetimeformat(dataOb.pickup_date_time);
    let deliveryDate = datetimeformat(dataOb.delivery_date_time);
    let customerName = getCustomer(dataOb);
    let transportName = getTransportNameForBooking(dataOb);
    let supplierName = getSupplierDeatils(dataOb);
    let pickupLoc = getPickupLoaction(dataOb);
    let deliveryLoc = getDeliveryLoaction(dataOb);
    let distance = getDistance(dataOb);
    let statusText = getStatus(dataOb);
    let vehicleType = getVehicleTypeForBooking(dataOb);
    let diverName = getDriver(dataOb);
    let vehicleNo = getVehicleNoForBooking(dataOb);

    // card eka elements create karanawa

    // mulinma card ekata bookings no ekai pickup date eka danna oni
    const title = document.createElement("div");
    title.className = "booking-title";
    title.innerHTML = `
            <div class="d-flex justify-content-between align-items-center w-100 mb-2">
                <span>Booking <b>#${bookingNo}</b></span>
                 ${statusText}
            </div>
            <div style="font-size: 14px; font-weight: 600;">
                 Pickup: ${pickupDate} 
                <span class="mx-2 text-slate-300">|</span> 
                 Delivery: ${deliveryDate}
            </div>
        `;
    content.appendChild(title);

    // eeta passe customer name eka danna oni
    const customerInfo = document.createElement("div");
    customerInfo.className = "booking-customer";
    customerInfo.innerHTML = `Customer: ${customerName}`;
    content.appendChild(customerInfo);

    // ---------- TAGS ROW (chips)
    const tagsRow = document.createElement("div");
    tagsRow.className = "booking-tags";
    tagsRow.innerHTML = `
            <span class="tag">Type: ${vehicleType}</span>
            <span class="tag">Pickup: ${pickupLoc}</span>
            <span class="tag">Delivery: ${deliveryLoc}</span>
            <span class="tag">Distance: ${distance}</span>
        `;

    content.appendChild(tagsRow);

    // supplier transport name saha vehicle no eka danna oni
    const bottomInfo = document.createElement("div");
    bottomInfo.className = "booking-bottom-info";

    bottomInfo.innerHTML = `
            <div class="transport-block">
                Transport: ${transportName} - ${supplierName}<br>
                Diver: ${diverName}<br>
                Vehicle No: ${vehicleNo}
            </div>

            <div class="card-actions">
                <button class="view-btn" >View</button>
                <button class="assign-btn" >Assign</button>
                <button class="date-button"> Add Date</button>
            </div>
        `;
    content.appendChild(bottomInfo);

    card.appendChild(content);

    // assigning button eka click karama edit function eka call wenawa
    const assigningButton = card.querySelector(".assign-btn");
    if (assigningButton) {
      assigningButton.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent card-level click
        editAction(dataOb, index);
        window["editOb"] = dataOb;
        window["editRowIndex"] = index;
      });
    }

    // date adding button eka click karama date adding form open wenawa
    const dateTimeButton = card.querySelector(".date-button");
    if (dateTimeButton) {
      dateTimeButton.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent card-level click
        datetimeFunctionForm(dataOb, index);
        window["editOb"] = dataOb;
        window["editRowIndex"] = index;
      });
    }

    // date adding button eka click karama date adding form open wenawa
    const viewButton = card.querySelector(".view-btn");
    if (viewButton) {
      viewButton.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent card-level click
        viewFunction(dataOb, index);
        window["editOb"] = dataOb;
        window["editRowIndex"] = index;
      });
    }

    container.appendChild(card);
  });
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
// ----------------------availbale vehicle view karanwa off canvas eke------------------------

const availableVehiclesContainer = document.getElementById("availableVehiclesContainer");
const availableVehicleSearch = document.getElementById("availableVehicleSearch");

// This should be called when opening the offcanvas or triggered by the button
document.querySelector('[data-bs-target="#offcanvasRight"]').addEventListener("click", () => {
  loadAndShowAvailableVehicles();
});

let allAvailableVehicles = [];

const loadAndShowAvailableVehicles = () => {
  try {
    // 1. Get vehicles for the selected booking's vehicle type
    let allVehicles = [];
    if (vehicleList.length === 0) {
      allVehicles = companyVehicleList;
    } else {
      allVehicles = vehicleList;
    }
    //  busy vehicle wala id tika gnnawa
    const busyIds = getServiceRequest("/booking/busyvehicleids") || [];

    // available vehicle witharak filter karala gnnawa
    allAvailableVehicles = allVehicles.filter((v) => !busyIds.includes(v.id));

    console.log(allVehicles);
    console.log(busyIds);
    console.log(allAvailableVehicles);


    renderAvailableVehicleCards(allAvailableVehicles);
  } catch (e) {
    console.error("Error loading available vehicles:", e);
  }
};

// vehicle card tika load karan function eka
const renderAvailableVehicleCards = (list) => {
  availableVehiclesContainer.innerHTML = "";

  // list eke vehicle naththan meka inner karanwa
  if (list.length === 0) {
    availableVehiclesContainer.innerHTML = `
      <div class="text-center py-5">
        <div class="text-muted mb-3"><i class="fa-solid fa-truck-fade fs-1"></i></div>
        <p class="text-secondary">No available vehicles found matching your criteria.</p>
      </div>
    `;
    return;
  }

  list.forEach((vehicle) => {
    const card = document.createElement("div");
    card.className = "vehicle-card-premium";

    const isReady = vehicle.vehicle_status_id?.name === "Available";
    const badgeHtml = isReady ? '<span class="vehicle-badge-ready">Ready</span>' : '<span class="vehicle-badge-match">Available</span>';

    // Fetch actual last trip completion time from the new API
    const lastTripVal = getServiceRequest("/report/vehiclelasttripcompletion?vehicleid=" + vehicle.id);
    const lastTrip = lastTripVal ? new Date(lastTripVal).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "None";

    const vehicleType = vehicle.vehicle_type_id?.name || "Standard";

    // Fetch actual total KM for current month from the new API
    const kmValue = getServiceRequest("/report/vehiclecurrentmonthkm?vehicleid=" + vehicle.id);
    const totalKm = typeof kmValue === "number" ? `${kmValue.toFixed(2)} KM` : "0.00 KM";

    card.innerHTML = `
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h6 class="fw-bold mb-1">${vehicle.vehicle_no} · ${vehicle.model}</h6>
          <p class="text-muted small mb-0">${vehicle.supplier_id?.transportname || "Company Yard"} · Owner: ${vehicle.supplier_id?.fullname || "Company Driver"}</p>
        </div>
        ${badgeHtml}
      </div>
      
      <div class="vehicle-stats-grid">
        <div class="stat-box">
          <div class="stat-label">Vehicle Type</div>
          <div class="stat-value">${vehicleType}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Total Km</div>
          <div class="stat-value">${totalKm}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Last Trip End</div>
          <div class="stat-value">${lastTrip}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Status</div>
          <div class="stat-value text-success">${vehicle.vehicle_status_id?.status}</div>
        </div>
      </div>
      
      <div class="d-flex gap-2">
       
        <button class="btn-assign-mini flex-grow-1" onclick="assignVehicleFromOffcanvas(${vehicle.id}, '${vehicle.vehicle_no}')">Assign</button>
      </div>
    `;

    availableVehiclesContainer.appendChild(card);
  });
};

// Search Functionality
if (availableVehicleSearch) {
  availableVehicleSearch.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allAvailableVehicles.filter(
      (v) => v.vehicle_no.toLowerCase().includes(term) || v.model.toLowerCase().includes(term) || (v.supplier_id?.transportname || "").toLowerCase().includes(term),
    );
    renderAvailableVehicleCards(filtered);
  });
}

const assignVehicleFromOffcanvas = (id, no) => {
  const selectVehicle = document.getElementById("selectVehicleNo");
  const selectCompanyVehicle = document.getElementById("flexSwitchCheckDefault");

  const tryFindAndSelect = () => {
    for (let i = 0; i < selectVehicle.options.length; i++) {
      const val = selectVehicle.options[i].value;
      if (val && val !== " ") {
        const obj = JSON.parse(val);
        if (obj.id == id) {
          selectVehicle.selectedIndex = i;
          // Trigger change event to load drivers etc.
          selectVehicle.dispatchEvent(new Event("change"));

          // Close offcanvas
          bootstrap.Offcanvas.getInstance(document.getElementById("offcanvasRight")).hide();
          return true;
        }
      }
    }
    return false;
  };

  // Try finding in current list first
  if (tryFindAndSelect()) return;

  // If not found, and it's a company vehicle (maybe toggle isn't checked)
  if (selectCompanyVehicle && !selectCompanyVehicle.checked) {
    selectCompanyVehicle.checked = true;
    selectCompanyVehicle.dispatchEvent(new Event("change"));

    // Try finding again after loading company list
    if (tryFindAndSelect()) return;
  }

  // If still not found
  Swal.fire({
    title: "Vehicle Selection",
    text: `Vehicle ${no} selected. Please confirm in the main form.`,
    icon: "info",
    timer: 1500,
    showConfirmButton: false,
  });
};
