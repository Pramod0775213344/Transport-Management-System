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

// "default" | "chipFilter" | "search"
let currentViewMode = "default";


// ========================== filtering and serch eka =================================
// reset button
const reset = () => {
  currentViewMode = "default";
  bookingsCardsContainer.innerHTML =
    '<div id="emptyState" class="empty-state-wrapper">\n' +
    '<div class="empty-state-content">\n' +
    '<div class="icon-circle">\n' +
    '<i class="fas fa-search"></i> </div>\n' +
    "<h3>No Bookings to Show</h3>\n" +
    "<p>Please select a <b>Date Range</b> and <b>Customer</b>, then click <b>Search</b> to view available bookings.</p>\n" +
    "</div>\n" +
    "</div>";

  // loged wela inna userwa gnnawa
  logedUserDetails = getServiceRequest("/loggeduserdetails");
  // user role name eka gnnawa
  const findRoleNameById = (roleId) => {
    const roles = getServiceRequest("/role/alldata");
    const role = roles.find((r) => r.id === roleId);
    return role ? role.name : null;
  }

  // role eka gnnawa
  const roleName = findRoleNameById(logedUserDetails.role_id);
  console.log("Logged-in User Role Name:", roleName);

  if (roleName === "Coordinator") {

    // e gropu ekata adlawa customer list eka gnnawa
    let customerList = getServiceRequest("customer/byuser?userid=" + logedUserDetails.id);
    console.log(customerList, "1");
    dataFilIntoSelect(selectCustomerSearch, "Select Customer ", customerList, "company_name");

  } else {
    let customer = getServiceRequest("/customer/alldata");
    console.log(customer, "2");
    dataFilIntoSelect(selectCustomerSearch, "Select Customer ", customer, "company_name");
  }


  dateFrom.value = "";
  dateTo.value = "";
  bookingCount.innerText = "-";
  txtSearch.disabled = true;

  document.querySelectorAll('input[name="dateRange"]').forEach(radio => radio.checked = false);

};

// select karan filetring option eke value eka gnnawa
document.querySelectorAll('input[name="dateRange"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    currentViewMode = "chipFilter";//curun view eka
    const filterOptionValue = e.target.value;
    const range = filterByDateRange(filterOptionValue);

    if (range) {
      dateFrom.value = range.from;
      dateTo.value = range.to;
    }
    // date range set wechcha yatatama API call eka yawanwa
    runfiltering();
  });
});

// select karana filter ekata anuwa api call karana function eka
const filterByDateRange = (filterOptionValue) => {

  const today = new Date();
  let from = new Date(today);
  let to = new Date(today);

  switch (filterOptionValue) {
    case "today":
      // froma and to kiyana deka default set karala thiyenawa today kiyala
      break;
    case "yesterday":
      from.setDate(today.getDate() - 1);
      to.setDate(today.getDate() - 1);
      break;
    case "thisweek":
      // week eke palawen date eka gannawa
      const firstDayOfWeek = today.getDate() - today.getDay();
      from.setDate(firstDayOfWeek);
      // to ekata defaukt date eka watenawa
      break;
    case "thismonth":
      // month eke palawen date eka gannawa
      // year eka,month eka,1st date eka
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    default:
  }

  return {
    // me format eken return karanwa (yyyy-mm-dd) format ekata anuwa
    // database eke save wela thiyenne me format ekene
    from: toLocalDateString(from),
    to: toLocalDateString(to)
  }
};

// date ekak (yyyy-mm-dd) format ekata convert karan function eka
const toLocalDateString = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// filerting eka serch karana finction eka
// filerting eka serch karana finction eka
const runfiltering = () => {

  let filteredBookingList = [];   // <-- let, const nemei

  if (roleName === "Coordinator") {
    // e gropu ekata adlawa customer list eka gnnawa
    let customerList = getServiceRequest("customer/byuser?userid=" + logedUserDetails.id);

    const bookingList = getServiceRequest(
      "/booking/bydaterange?startdate=" + dateFrom.value + "&enddate=" + dateTo.value
    );

    // customer list eke id eka gnnawa.meka use karal aluth array eka hadal thiyenwa
    const customerIds = customerList.map(customer => customer.id);
    // customer list eke id eka anuwa booking list eka filter karanwa
    filteredBookingList = bookingList.filter(booking => customerIds.includes(booking.customer_id.id));

  } else {

    const bookingList = getServiceRequest(
      "/booking/bydaterange?startdate=" + dateFrom.value + "&enddate=" + dateTo.value
    );

    filteredBookingList = bookingList;   // <-- dan meka wada karanawa, let nisa
  }

  if (!filteredBookingList || filteredBookingList.length === 0) {
    bookingsCardsContainer.innerHTML =
      '<div id="emptyState" class="empty-state-wrapper">\n' +
      '<div class="empty-state-content">\n' +
      '<div class="icon-circle">\n' +
      '<i class="fas fa-search"></i> </div>\n' +
      "<h3>No Bookings to Show</h3>\n" +
      "<p>Please select a <b>Date Range</b> and <b>Customer</b>, then click <b>Search</b> to view available bookings.</p>\n" +
      "</div>\n" +
      "</div>";
  } else {
    loadVehicleAssigningCard(filteredBookingList);
  }

};
// search booking details
const search = () => {
  currentViewMode = "search";
  const customerIdElement = document.getElementById("selectCustomerSearch").value;
  if (dateFrom.value === "" || dateTo.value === "" || customerIdElement === "") {
    Swal.fire({
      title: "Missing Information",
      text: "Please select a date range and customer before searching.",
      icon: "warning",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
  } else {
    const customerObj = JSON.parse(customerIdElement);
    bookingList = getServiceRequest("/booking/bydaterangeandcustomerid?startdate=" + dateFrom.value + "&enddate=" + dateTo.value + "&customerid=" + customerObj.id);
    if (bookingList.length > 0) {
      loadVehicleAssigningCard(bookingList);
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
  }
};
// =================================  end filtering and serch eka ============================





// ================================ start of load booking deatils into card view =================
// load booking deatils
const loadVehicleAssigningCard = (bookingList) => {
  bookingsCardsContainer.innerHTML = ""; // Clear existing cards

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
    // card ekata data fil kranwa
    fillDataIntoTheBookingsCardView(bookingsCardsContainer, bookingList, vehicleAssigningForm, datetimeFunctionForm, statusTracker);

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
      fillDataIntoTheBookingsCardView(bookingsCardsContainer, filteredList, vehicleAssigningForm, datetimeFunctionForm, statusTracker);
    });
    txtSearch.disabled = false;
  }


  // btn hide karanwa
  applyPrivilegesCard("Vehicle Assigning", "bookingsCardsContainer", {
  });
};

const fillDataIntoTheBookingsCardView = (container, dataList, editAction, datetimeFunctionForm, viewFunction) => {
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

// // get customer name
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
// ================================ end card view eka ============================================



// ================================ status track karana function eka ==============================

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
const resetSteps = () => {
  for (let i = 1; i <= 6; i++) {
    let step = document.getElementById("step" + i);
    let icon = document.getElementById("step" + i + "Icon");
    let time = document.getElementById("step" + i + "Time");

    step.classList.remove("active", "completed", "upcoming");
    icon.innerText = "";
    time.innerText = "";
  }
}
// ================================ end of status track karana function eka ===========================





// ================================= data feild validation karanwa =========================================
const MAX_HOURS_WINDOW = 48;

// paya 48 kata wadi ewa saha adu ewa block karanwa
const validateDateWithinWindow = (end, fieldLabel) => {
  // current date time eka gnnawa
  const now = new Date();
  // end date time eka gnnawa
  const endDate = new Date(end.value);

  const hoursDiff = (endDate - now) / (1000 * 60 * 60); // hours ganata convert karanawa
  // hoursDiff eka positive nam - future ekak (endDate > now)
  // hoursDiff eka negative nam - past ekak (endDate < now)

  if (hoursDiff > MAX_HOURS_WINDOW) {
    showFieldError(end, `${fieldLabel}: Please enter a time within the next 1 days (24 hours).`);
    return false;
  }

  if (hoursDiff < -MAX_HOURS_WINDOW) {
    showFieldError(end, `${fieldLabel}: Please enter a time within the last 1 days (24 hours).`);
    return false;
  }

  // future ekak kisima widiyakata allow karanne na
  // if (hoursDiff > 0) {
  //   showFieldError(end, `${fieldLabel}: Future dates are not allowed.`);
  //   return false;
  // }

  return true; // window ekata athulatha
};

// date validation eka karan function eka error masage eka view karan function eka
const showFieldError = (elementId, errorMessage) => {
  elementId.classList.remove("is-invalid");
  elementId.classList.add("is-invalid");

  let feedback = elementId.parentElement.querySelector(".invalid-feedback");
  if (!feedback) {
    feedback = document.createElement("div");
    feedback.className = "invalid-feedback";
    elementId.parentElement.appendChild(feedback);
  }
  feedback.innerHTML = errorMessage;
};

// error masage eka clear karan function eka
const clearFieldError = (input) => {
  input.classList.remove("is-invalid");
  input.classList.add("is-valid");
  const feedback = input.parentElement.querySelector(".invalid-feedback");
  if (feedback) feedback.textContent = "";
};

// date time form eke date range validation eka karan function eka
const vehicleDateRangeValidator = (end, start, object, property, fieldLabel) => {
  const startDate = start;
  const endDate = end.value;
  const ob = window[object];

  // end field empty
  if (endDate === "") {
    if (end.required) {
      showFieldError(end, "This field is required.");
      ob[property] = null;
    } else {
      end.classList.remove("is-invalid", "is-valid");
      ob[property] = "";
    }
    return;
  }

  // kalin field eka (start) empty nam
  if (startDate === "" || startDate == null) {
    showFieldError(end, "Please fill the previous step first before entering this date.");
    ob[property] = null;
    return;
  }

  // future-date check karan eka cuurunt date time ekath ekka
  // const now = new Date();
  // if (new Date(endDate) > now) {
  //   showFieldError(end, "This timestamp cannot be in the future.");
  //   ob[property] = null;
  //   return;
  // }


  // future-date saha too-far-in-past check eka (48h window)
  if (!validateDateWithinWindow(end, fieldLabel)) {
    ob[property] = null;
    return;
  }


  // kkalin data feild ekata wada wishala wenna oni
  if (new Date(startDate) >= new Date(endDate)) {
    showFieldError(end, "This must be after the previous time & date.");
    ob[property] = null;
    return;
  }

  // ok nam clear karana field eka
  clearFieldError(end);
  ob[property] = endDate;
};

// date block karana function eka
const dateRangeBlocker = (start, end) => {
  if (start.value) {
    end.min = start.value;
  } else {
    end.removeAttribute("min");
  }
};

// Arrival At Pickup eke validation eka
document.getElementById("pickupDateAndTime").addEventListener("change", function () {
  const ob = window.booking;
  let isValid = true;

  if (this.value === "") {
    showFieldError(this, "This field is required.");
    ob.arrived_at_pickup_datetime = null;
    isValid = false;
  } else if (!validateDateWithinWindow(this, "Arrival At Pickup")) {
    ob.arrived_at_pickup_datetime = null;
    isValid = false;
  } else {
    clearFieldError(this);
    ob.arrived_at_pickup_datetime = this.value;
  }

  // cascading re-validation - Arrival eka valid nam witharai
  const departedInput = document.getElementById("departedPickupDateAndTime");
  if (isValid && departedInput.value !== "") {
    vehicleDateRangeValidator(departedInput, this.value, "booking", "departed_from_pickup_datetime", "Departed From Pickup");
  }
  dateRangeBlocker(this, departedInput);

});

// Departed From Pickup eke validation eka on change ekedi
document.getElementById("departedPickupDateAndTime").addEventListener("change", function () {
  //  star valu eka
  const startValue = document.getElementById("pickupDateAndTime").value;
  const isValid = vehicleDateRangeValidator(this, startValue, "booking", "departed_from_pickup_datetime", "Departed From Pickup");

  const arrivedDeliveryInput = document.getElementById("arrivedDeliveryDateAndTime");
  if (isValid && arrivedDeliveryInput.value !== "") {
    vehicleDateRangeValidator(arrivedDeliveryInput, this.value, "booking", "arrived_at_delivery_datetime", "Arrived At Delivery");
  }
  dateRangeBlocker(this, arrivedDeliveryInput);
});

// Arrived At Delivery eke validation eka
document.getElementById("arrivedDeliveryDateAndTime").addEventListener("change", function () {
  const startValue = document.getElementById("departedPickupDateAndTime").value;
  const isValid = vehicleDateRangeValidator(this, startValue, "booking", "arrived_at_delivery_datetime", "Arrived At Delivery");

  const departedDeliveryInput = document.getElementById("departedDeliveryDateAndTime");
  if (isValid && departedDeliveryInput.value !== "") {
    vehicleDateRangeValidator(departedDeliveryInput, this.value, "booking", "departed_from_delivery_datetime", "Departed From Delivery");
  }
  dateRangeBlocker(this, departedDeliveryInput);
});

// Departed From Delivery eke validation eka
document.getElementById("departedDeliveryDateAndTime").addEventListener("change", function () {
  const startValue = document.getElementById("arrivedDeliveryDateAndTime").value;
  vehicleDateRangeValidator(this, startValue, "booking", "departed_from_delivery_datetime", "Departed From Delivery");
});

// ============================== end of the date validation function  =======================================



// =============================== start of validation of delay reasons =======================================
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

// ================================ end of validation of delay reasons ========================================



// ================================= start of vehice assigning form ============================================
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

  if (dataOb.booking_status_id.status == "Attend" && dataOb.is_breakdown == true) {
    Swal.fire({
      title: "Action Restricted",
      text: "Cannot assign a vehicle again to a breakdown booking.Beacause another vehicle is already assigned to this booking.",
      icon: "error",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    return;
  }
  // assign karapu vehicle wena vehicle group ekak thiyena me group ekata  tempory add karapu ekak nam aye change karanna ba
  // vehicle group ekata adala customer id eka gnnawa

  if (dataOb.vehicle_id != null) {
    vehicleGroupCustomerId = getServiceRequest("/vehiclegroup/customeridbyvehicle?vehicleId=" + dataOb.vehicle_id.id);
    console.log(vehicleGroupCustomerId);

    if (vehicleGroupCustomerId != dataOb.customer_id.id) {
      Swal.fire({
        title: "Action Restricted",
        text: "Cannot change a assigned temporary vehicle.Please contact the administrator for assistance.",
        icon: "error",
        allowOutsideClick: false,
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
      return;
    }
  }

  // vehicle eka arrived wela nama loaction eken.vehicle eka change karanna ba/eka nisa modal eka open karanna ba
  // e kiyann attend hari inprocces hari thiyenaw nam witahrai booking ekaka vehicle eka change karanna puluwan
  if (dataOb.booking_status_id.status == "Inproccess" || dataOb.booking_status_id.status == "Attend") {

    // vehcle list eka(vehilcle group and vehicle type anuwa)
    vehicleList = getServiceRequest("vehicle/vehiclebyvehiclegroupandvehicletype?customer_id=" + dataOb.customer_id.id + "&vehicletype_id=" + dataOb.vehicle_type_id.id);

    // company vehicle list eka
    companyVehicleList = getServiceRequest("vehicle/companyvehiclebyvehicletype?vehicletype_id=" + dataOb.vehicle_type_id.id);

    // busy vehicles id list eka
    // danata active bookings thiyena vehicle tike id tika witharak gannawa
    busyVehicleIds = getServiceRequest("/booking/busyvehicleids");
    console.log(busyVehicleIds);

    // // vehicle details null neme nam refill wenna oni
    // vehicel id eka null naththan witharai refeil wenna oni assign form eka open karaddi
    if (dataOb.vehicle_id) {
      console.log("1");

      // available supplier vehicles
      // vehicel lsit eken filter karala gnnawa active booking nathi vehicles
      availableVehicleList = vehicleList.filter((vehicle) => {
        return !busyVehicleIds.includes(vehicle.id) || vehicle.id == dataOb.vehicle_id.id;
      });
      console.log(availableVehicleList);

      // availablecompany vehicle tika gannawa active bookings nathi
      availablecompanyVehicleList = companyVehicleList.filter((vehicle) => {
        return !busyVehicleIds.includes(vehicle.id) || vehicle.id == dataOb.vehicle_id.id;
      });

      const isCompanyVehicle = dataOb.vehicle_id.supplier_id == null;
      const relevantList = isCompanyVehicle ? availablecompanyVehicleList : availableVehicleList;
      const otherList = isCompanyVehicle ? availableVehicleList : availablecompanyVehicleList;

      if (relevantList.length === 1) {
        document.getElementById("vehicleWarning").innerText = "No vehicles are available for reassignment.";
        document.getElementById("vehicleWarningDiv").style.display = "block";
        document.getElementById("btnAvailable").style.display = "block";
        document.getElementById("btnShow").style.display = "none";
        document.getElementById("whichListLoadDiv").style.display = "none";

        dataFilIntoSelect(selectVehicleNo, "Click Available Vehicle ", relevantList, "vehicle_no");
        selectVehicleNo.disabled = isCompanyVehicle ? false : true;

        btnShow.addEventListener("click", () => {
          loadCompanyVehicles(otherList);
          renderAvailableVehicleCards(otherList);
        });

      } else {
        document.getElementById("vehicleWarningDiv").style.display = "none";
        document.getElementById("btnShow").style.display = "none";
        document.getElementById("whichListLoadDiv").style.display = "none";
        dataFilIntoSelect(selectVehicleNo, "Click Available Vehicle ", relevantList, "vehicle_no");
        selectVehicleNo.disabled = true;
      }

      selectVehicleNo.value = JSON.stringify(dataOb.vehicle_id);
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
          renderAvailableVehicleCards(availablecompanyVehicleList);
        });
        // select eka disable flase karanawa company vehicle nam naththna disable true karanawa karala thiyanawa
        selectVehicleNo.disabled = false;
      } else {
        console.log("9");
        document.getElementById("vehicleWarningDiv").style.display = "none";
        document.getElementById("btnAvailable").style.display = "block";
        document.getElementById("btnShow").style.display = "none";
        document.getElementById("whichListLoadDiv").style.display = "none";
        dataFilIntoSelect(selectVehicleNo, "Click Available Vehicle ", availableVehicleList, "vehicle_no");
        selectVehicleNo.disabled = true;

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
  let selectDateMonth = dateFrom.value ? new Date(dateFrom.value).getMonth() : new Date().getMonth();
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
          refreshCurrentBookingsList();
          statusTracker(booking);
          $("#vehicleAssigning").modal("hide");
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
            refreshCurrentBookingsList();
            statusTracker(booking);
            $("#vehicleAssigning").modal("hide");
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

const refreshVehicleAssigningForm = () => {
  // let vehicleList = getServiceRequest("vehicle/vehiclebyvehiclegroupandvehicletype?customer_id="+booking.customer_id.id +"&vehicletype_id="+booking.vehicle_type_id.id);
  // dataFilIntoSelect(selectVehicleNo, "Select Vehicle ", vehicleList, "vehicle_no")

  let driver = getServiceRequest("/driver/alldata");
  dataFilIntoSelect(selectdriver, "Select Driver ", driver, "fullname");

  let vehicleList = getServiceRequest("/vehicle/alldata");
  dataFilIntoSelect(selectVehicleNo, "Click Available Vehicle ", vehicleList, "vehicle_no");

  updateButton.style.display = "none";
  submitButton.style.display = "";
  dateEditButton.style.display = "none";
  dateAddButton.style.display = "";

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
    selectPickupDelayReason,
    selectDeliveryDelayReason
  ]);

  // Collapse and reasons also reset wenna oni me refreshForm ekedi
  pickupDelayCollapse.hide();
  deliveryDelayCollapse.hide();
  selectPickupDelayReason.selectedIndex = 0;
  selectDeliveryDelayReason.selectedIndex = 0;

  // disable eka flas ekaranwa
  pickupDateAndTime.disabled = false;
  departedPickupDateAndTime.disabled = false;
  arrivedDeliveryDateAndTime.disabled = false;
  departedDeliveryDateAndTime.disabled = false;
  selectVehicleNo.disabled = true;

  resetSteps();



  const pickup = document.getElementById("pickupDateAndTime");
  const departedPickup = document.getElementById("departedPickupDateAndTime");
  const arrivedDelivery = document.getElementById("arrivedDeliveryDateAndTime");
  const departedDelivery = document.getElementById("departedDeliveryDateAndTime");

  dateRangeBlocker(pickup, departedPickup);
  dateRangeBlocker(departedPickup, arrivedDelivery);
  dateRangeBlocker(arrivedDelivery, departedDelivery);
};



// show btn eka click kalama data tika fil karanwa
const loadCompanyVehicles = (list) => {
  dataFilIntoSelect(selectVehicleNo, "Click Available Vehicle", list, "vehicle_no");
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

// ================================== end of vehice assigning form ===========================================





// ==================================== availbale vehicle view karanwa off canvas eke ========================

const availableVehiclesContainer = document.getElementById("availableVehiclesContainer");
const availableVehicleSearch = document.getElementById("availableVehicleSearch");

// This should be called when opening the offcanvas or triggered by the button
document.querySelector('[data-bs-target="#offcanvasRight"]').addEventListener("click", () => {
  loadAndShowAvailableVehicles();
});

let allAvailableVehicles = [];

// all avaialable vehicle list eka gnnawa saha filter karala available vehicle list eka render karanwa
const loadAndShowAvailableVehicles = () => {
  console.log("meka wada");

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


    // date range eka athulatha busy vehicle id tika gnnawa
    // const busyVehiclesIdsByDateRange = getServiceRequest("/booking/busyvehicleidsbydatetime?pickupdatetime=" + booking.pickup_date_time + "&deliverydatetime=" + booking.delivery_date_time) || [];
    // console.log(busyVehiclesIdsByDateRange,"busyVehiclesIdsByDateRange");



    // available vehicle witharak filter karala gnnawa
    allAvailableVehicles = allVehicles.filter((v) => !busyIds.includes(v.id));

    // booking eke time period eka athulatha adala vehicle witharak filter karanwa

    // adala vehicle walata package type eka assign karawa
    allAvailableVehicles.forEach((vehicle) => {
      const vehiclePackageType = getServiceRequest("/vehicleassigning/getpackagetypebyvehicleid?vehicleId=" + vehicle.id);
      vehicle.package_name = vehiclePackageType;
    });

    console.log(allVehicles);
    console.log(busyIds);
    console.log(allAvailableVehicles);


    // booking eka fix rate nam
    // booking.customer_agreement_id.package_id.package_type == "Fix Rate" nam vehicle type eka match karala filter karanwa
    // vehicle eka ganna oni me maseta me agreement eka kalin booking gihin thiyena vehicle ekamai.habai meka mase first eka nam okkom vehicle pennaawa avaialbale
    if (booking.customer_agreement_id.package_id.package_type === "Fix Rate") {

      // agreement id eka gnnawa
      const agreementId = booking.customer_agreement_id.id;
      // me agreement id ekata adala vehicle eka gnnawa currunt month eka perviously assigned
      const previouslyAssignedVehicleList = getServiceRequest("/vehicleassigning/getvehiclesbyagreementid?agreementId=" + agreementId);
      console.log("previouslyAssignedVehicleList", previouslyAssignedVehicleList);

      if (previouslyAssignedVehicleList && previouslyAssignedVehicleList.length > 0 && previouslyAssignedVehicleList[0] !== null) {
        // previously assigned vehicle eka gnnawa
        const previouslyAssignedVehicleId = previouslyAssignedVehicleList[0];
        // available vehicle list eka filter karanwa previously assigned vehicle eka match karala
        allAvailableVehicles = allAvailableVehicles.filter((v) => v.id === previouslyAssignedVehicleId && v.package_name[0] === booking.customer_agreement_id.package_id.name);
        console.log("allAvailableVehicles after filter by previouslyAssignedVehicleId", allAvailableVehicles);

      } else {
        // if no previously assigned vehicle found, then filter by vehicle type
        // curunt month fix rate wena agreement eka nathi nam all available vehicle list eka filter karanwa vehicle type eka match karala
        const curruntMonthNotAssignedVehicles = getServiceRequest("/vehicleassigning/getavailablevehiclesbyagreementid");//id list eka enawa
        // available vehicle list eka filter karanwa currunt month fix rate agreement eka nathi vehicle type eka match karala
        console.log("curruntMonthNotAssignedVehicles", curruntMonthNotAssignedVehicles);
        console.log("allAvailableVehicles", allAvailableVehicles);
        allAvailableVehicles = allAvailableVehicles.filter((v) => curruntMonthNotAssignedVehicles.includes(v.id) && v.package_name[0] === booking.customer_agreement_id.package_id.name);
        console.log("allAvailableVehicles after filter by curruntMonthNotAssignedVehicles", allAvailableVehicles);
      }
    } else {
      // booking eka Floating Rate nam - floating rate package thiyena vehicle witharak filter karanwa
      console.log(allAvailableVehicles, "allAvailableVehicles before filter by Floating Rate");
      allAvailableVehicles = allAvailableVehicles.filter((v) => v.package_name[0] === booking.customer_agreement_id.package_id.name);
      console.log("allAvailableVehicles-Floating Rate", allAvailableVehicles);
    }

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
  // total km tika dala array eka hadagannawa
  const vehiclesWithKm = list.map((vehicle) => {
    const kmValue = getServiceRequest("/report/vehiclecurrentmonthkm?vehicleid=" + vehicle.id);
    return {
      ...vehicle,
      _totalKmValue: typeof kmValue === "number" ? kmValue : 0,
    };
  });

  // total distance eka aduma eka mulinma enna sort karanwa
  vehiclesWithKm.sort((a, b) => a._totalKmValue - b._totalKmValue);


  for (const vehicle of vehiclesWithKm) {
    const card = document.createElement("div");
    card.className = "vehicle-card";

    const isReady = vehicle.vehicle_status_id?.status === "Available";
    const badgeHtml = isReady ? '<span class="vehicle-badge-ready">Ready</span>' : '<span class="vehicle-badge-match">Available</span>';

    // last assign trip eke date eka gnnawa
    const lastTripVal = getServiceRequest("/report/vehiclelasttripcompletion?vehicleid=" + vehicle.id);
    const lastTrip = lastTripVal
      ? new Date(lastTripVal).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : "None";

    const vehicleType = vehicle.vehicle_type_id?.name;
    const totalKm = `${vehicle._totalKmValue.toFixed(2)} KM`;

    // last assign driver eka gnnawa
    const lastAssignedDriver = getServiceRequest("/report/getlastassigneddriver?vehicleid=" + vehicle.id);
    const lastAssignedDriverName = lastAssignedDriver ? lastAssignedDriver.fullname : "N/A";
    const lastAssignedDriverId = lastAssignedDriver ? lastAssignedDriver.id : null;
    console.log(lastAssignedDriver.fullname);

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
          <div class="stat-label">Last Assigned Driver</div>
          <div class="stat-value">${lastAssignedDriverName}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Status</div>
          <div class="stat-value text-success">${vehicle.vehicle_status_id?.status}</div>
        </div>
      </div>

      <div class="d-flex gap-2">
        <button class="btn-assign-mini flex-grow-1" onclick="assignVehicleFromOffcanvas(${vehicle.id}, '${vehicle.vehicle_no}', '${lastAssignedDriverId}')">Assign</button>
      </div>
    `;

    availableVehiclesContainer.appendChild(card);
  };
};

// Search function eka vehicles
if (availableVehicleSearch) {
  availableVehicleSearch.addEventListener("input", (e) => {
    // value eka lower case karanwa search karaddi case insensitive wenna
    const term = e.target.value.toLowerCase();

    // filter karanwa vehicle no, model, supplier name anuwa
    const filtered = allAvailableVehicles.filter(
      // vehicle no eka lower case karala search karaddi case insensitive wenna saha include use karala balnawa thiyenwd kiyala
      (v) => v.vehicle_no.toLowerCase().includes(term)
        || v.model.toLowerCase().includes(term)
        || (v.supplier_id?.transportname || "").toLowerCase().includes(term),
    );
    renderAvailableVehicleCards(filtered);
  });
}

// vehicel eka assig karanwa slect ekata
const assignVehicleFromOffcanvas = (selectedVehicleId, no, lastAssignedDriverId) => {
  // select karana vehicle no eka gnnawa
  const selectVehicle = document.getElementById("selectVehicleNo");
  // slect karana driver wa gnnawa
  const selectDriver = document.getElementById("selectdriver");
  // const selectCompanyVehicle = document.getElementById("flexSwitchCheckDefault");

  // driver eka select karanwa
  const tryFindAndSelectDriver = () => {
    if (!selectDriver || !lastAssignedDriverId) return false;

    // select karana driver eka value eka gnnawa
    for (let i = 0; i < selectDriver.options.length; i++) {
      const selectedDriverVal = selectDriver.options[i].value;

      if (selectedDriverVal && selectedDriverVal !== " ") {
        const driverObj = JSON.parse(selectedDriverVal);
        console.log("driverObj", driverObj);
        if (driverObj.id == lastAssignedDriverId) {
          selectDriver.selectedIndex = i;
          // chage eka triger karanwa ethakota thama validation tika saha object bind eka wada karanne
          selectDriver.dispatchEvent(new Event("change"));


          return true;
        }
      }
    }
    return false;
  };
  const tryFindAndSelect = () => {

    // select eke thiyena vehicle no list eka loop karanwa
    for (let i = 0; i < selectVehicle.options.length; i++) {

      // select karana vehicle eka value eka gnnawa
      const selectedVehicleVal = selectVehicle.options[i].value;

      // value eka null nathnam saha empty string nathnam parse karanwa JSON widihata
      if (selectedVehicleVal && selectedVehicleVal !== " ") {
        // object eka jason parse karala gnnawa
        const vehicelObj = JSON.parse(selectedVehicleVal);
        console.log("vehicelObj", vehicelObj);
        if (vehicelObj.id == selectedVehicleId) {
          // select eke index eka set karanwa
          selectVehicle.selectedIndex = i;

          // triger event ekak danwa change weddi adala driversla tika load wenna oni nisa
          selectVehicle.dispatchEvent(new Event("change"));

          // methan function eka call karanwa driver eka select karanwa
          tryFindAndSelectDriver();

          // Close offcanvas eka hide karanwa
          bootstrap.Offcanvas.getInstance(document.getElementById("offcanvasRight")).hide();
          return true;
        }
      }
    }
    return false;
  };

  // Try finding in current list first
  if (tryFindAndSelect()) return;


  // If still not found
  Swal.fire({
    title: "Vehicle Selection",
    text: `Vehicle ${no} selected. Please confirm in the main form.`,
    icon: "info",
    timer: 1500,
    showConfirmButton: false,
  });
};

//  ============================ end of availbale vehicle view karanwa off canvas eke ==========================




// ============================= start of vehicle date & time adding Form =======================================

// datetime adding modal form open function
const datetimeFunctionForm = (dataOb) => {
  // actuak date view karawanwa

  pickupDate.innerText = datetimeformat(dataOb.pickup_date_time);
  deliveryDate.innerText = datetimeformat(dataOb.delivery_date_time);

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
    pickupDateAndTime.dispatchEvent(new Event("change"));
    pickupDateAndTime.classList.remove("is-valid")

    dateEditButton.style.display = "";
    dateAddButton.style.display = "none";
  }
  if (dataOb.departed_from_pickup_datetime != null) {
    departedPickupDateAndTime.value = dataOb.departed_from_pickup_datetime;
    departedPickupDateAndTime.dispatchEvent(new Event("change"));
    departedPickupDateAndTime.classList.remove("is-valid")


    pickupDateAndTime.disabled = true;

    dateEditButton.style.display = "";
    dateAddButton.style.display = "none";
  }
  if (dataOb.arrived_at_delivery_datetime != null) {
    arrivedDeliveryDateAndTime.value = dataOb.arrived_at_delivery_datetime;
    arrivedDeliveryDateAndTime.dispatchEvent(new Event("change"));
    arrivedDeliveryDateAndTime.classList.remove("is-valid")


    pickupDateAndTime.disabled = true;
    departedPickupDateAndTime.disabled = true;

    dateEditButton.style.display = "";
    dateAddButton.style.display = "none";
  }
  if (dataOb.departed_from_delivery_datetime != null) {
    departedDeliveryDateAndTime.value = dataOb.departed_from_delivery_datetime;
    departedDeliveryDateAndTime.dispatchEvent(new Event("change"));
    departedDeliveryDateAndTime.classList.remove("is-valid")



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
    textLastMeterReading.value = dataOb.vehicle_id.current_meter_reading ? dataOb.vehicle_id.current_meter_reading : dataOb.vehicle_id.startup_meter_reading;
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

const checkDateFormError = () => {
  let errors = "";
  if (booking.arrived_at_pickup_datetime == null) {
    errors = errors + "Please Select arrive date & time.";
  }
  // input field eke data fill nam null wenna ba
  if (departedPickupDateAndTime.value) {
    if (booking.departed_from_pickup_datetime == null) {
      errors = errors + "Please select the departed date &time from pickup location.";
    }
  }
  if (arrivedDeliveryDateAndTime.value) {
    if (booking.arrived_at_delivery_datetime == null) {
      errors = errors + "Please select the arrival date &time from delivery location.";
    }
  }
  if (departedDeliveryDateAndTime.value) {
    if (booking.departed_from_delivery_datetime == null) {
      errors = errors + "Please select the departed date &time from delivery location.";
    }
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
    if (booking.delivery_delay_reasons_id == null) {
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
      refreshVehicleAssigningForm();
      refreshCurrentBookingsList();
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
            refreshVehicleAssigningForm();
            refreshCurrentBookingsList();
            statusTracker(booking);
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

// start meter reading validator karanawa currunt meter reading ekata wada adu wenna ba
textStartMeterReading.addEventListener("keyup", () => {
  const elementValue = textStartMeterReading.value;
  const regExp = new RegExp("^[0-9]{2,15}$");
  console.log("Start Meter Reading:", elementValue);

  // start meter reading eka current vehicle eke current meter reading ekata wada adu wenna ba
  if (elementValue != "") {
    if (regExp.test(elementValue)) {
      const currentMeterReading = parseFloat(booking.vehicle_id.current_meter_reading ? booking.vehicle_id.current_meter_reading : booking.vehicle_id.startup_meter_reading);
      const startMeterReading = parseFloat(elementValue);

      if (!isNaN(currentMeterReading) && !isNaN(startMeterReading) && startMeterReading >= currentMeterReading) {
        textStartMeterReading.classList.remove("is-invalid");
        textStartMeterReading.classList.add("is-valid");
        booking.strat_meter_reading = startMeterReading;
      } else {
        textStartMeterReading.classList.remove("is-valid");
        textStartMeterReading.classList.add("is-invalid");
        booking.strat_meter_reading = null;
      }

    } else {
      textStartMeterReading.classList.remove("is-valid");
      textStartMeterReading.classList.add("is-invalid");
      booking.strat_meter_reading = null;
    }

  } else {
    if (textStartMeterReading.required) {
      textStartMeterReading.classList.remove("is-valid");
      textStartMeterReading.classList.add("is-invalid");
      booking.strat_meter_reading = null;
    } else {
      textStartMeterReading.classList.remove("is-invalid");
      booking.strat_meter_reading = "";
    }
  }
});
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

// ================================= end of vehicle date & time adding Form ================================================



// ============================ refresh form ================================================
// refresh form funtion eka
const refresh = () => {
  currentViewMode = "default";
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

  // loged wela inna userwa gnnawa
  logedUserDetails = getServiceRequest("/loggeduserdetails");
  // user role name eka gnnawa
  const findRoleNameById = (roleId) => {
    const roles = getServiceRequest("/role/alldata");
    const role = roles.find((r) => r.id === roleId);
    return role ? role.name : null;
  }

  // role eka gnnawa
  roleName = findRoleNameById(logedUserDetails.role_id);
  console.log("Logged-in User Role Name:", roleName);


  if (roleName === "Coordinator") {
    // e gropu ekata adlawa customer list eka gnnawa
    let customerList = getServiceRequest("customer/byuser?userid=" + logedUserDetails.id);
    console.log(customerList, "1");
    dataFilIntoSelect(selectCustomerSearch, "Select Customer ", customerList, "company_name");


  } else {
    let customer = getServiceRequest("/customer/alldata");
    console.log(customer, "2");
    dataFilIntoSelect(selectCustomerSearch, "Select Customer ", customer, "company_name");
  }


  dateFrom.value = "";
  dateTo.value = "";
  txtSearch.disabled = true;

  let currunetDateBookings = getFilteredCurrentDateBookings();
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
// ============================ end of refresh form ================================================ 



//Alert Box Call function
Swal.isVisible();

// date assigning form eka close weddi
formResetFunctionWhenClosingModal("datetimeAddingFormModal", "datetimeAddingForm", refreshVehicleAssigningForm);
formResetFunctionWhenClosingModal("vehicleAssigning", "vehicleAssigningForm", refreshVehicleAssigningForm);
// ----------------------------------- refresh karanawa currunt load wela thiyena dta lis eka anuwa--------------------
// current view eka mokakda kiyala track karana variable eka



// ============================ bookin list refresh function eka =====================================

// currunt load wela thiyena data list eka anuwa refresh karanawa(eg:- default view, chip filter view, search view)
// mema function ekama call karanawa hema success handler ekakama
const refreshCurrentBookingsList = () => {
  switch (currentViewMode) {
    case "default": {
      const currunetDateBookings = getFilteredCurrentDateBookings();
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
      break;
    }
    case "chipFilter":
      runfiltering();
      break;
    case "search":
      search();
      break;
    default:
      runfiltering();
  }
};
// ============================ end of bookin list refresh function eka ==============================




// ======================= role anuwa currunt date bookings tika filter karana shared function eka========================
// role eka anuwa currunt date bookings tika filter karana shared function eka
const getFilteredCurrentDateBookings = () => {
  const currunetDateBookings = getServiceRequest("/booking/bycurruntdate");

  if (roleName === "Coordinator") {
    // coordinator ta adala customer list eka gnnawa
    const customerList = getServiceRequest("customer/byuser?userid=" + logedUserDetails.id);
    const customerIds = customerList.map((customer) => customer.id);

    // customer id ekata adala booking tika witharak filter karanwa
    return currunetDateBookings.filter((booking) => customerIds.includes(booking.customer_id.id));
  }

  return currunetDateBookings;
};
// ====================== end of role anuwa currunt date bookings tika filter karana shared function eka========================
