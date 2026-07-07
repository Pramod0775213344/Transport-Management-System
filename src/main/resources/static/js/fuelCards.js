let fuelCardsList = [];
let usableFuelAmount = 0;
window.addEventListener("load", () => {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      resfreshForm();
      loadFuelCards();
      generateFuelCardNo();
    } catch (e) {
      console.error("Error during fuel cards page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);
});

// fuel card load karana funtion eka
const loadFuelCards = () => {
  fuelCardsList = getServiceRequest("/fuelscards/alldata");
  renderFuelCards(fuelCardsList);

  applyPrivilegesCard("Fuel Card Management", "fuelCardsContainer", {
    add: addButton
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
    document.querySelectorAll(`#${cardContainerId} .decativeBtn`)
      .forEach(btn => btn.style.display = p.privi_update ? "" : "none");

    document.querySelectorAll(`#${cardContainerId} .activeBtn`)
      .forEach(btn => btn.style.display = p.privi_update ? "" : "none");
  }
};

// Main function to render cards
const renderFuelCards = (dataList) => {
  const cardContainer = document.getElementById("fuelCardsContainer");
  let html = "";

  if (dataList.length === 0) {
    cardContainer.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No fuel cards found matching your criteria.</p></div>';
    return;
  }

  dataList.forEach((dataOb, index) => {
    console.log(dataOb);

    // is active kiyana variable eka status eka check karala set karanwa
    const isActive = dataOb.fuel_card_status_id?.status === "Active";

    // status class name eka set karanwa.is acyive eka true na, active class eka add wenawa.false nama inactive badge eka add wenawa
    const statusClassName = isActive ? "badge-active" : "badge-inactive";

    /*fuel summary eka gannawa object ekak widihata(fuel card id,fueal card no,pacchake type,package price,totala distance*/
    const fuelSummary = getServiceRequest("/fuelscards/summary?vehicleId=" + dataOb.vehicle_id.id);

    const packageName = fuelSummary[0][2];
    const packagePrice = parseFloat(fuelSummary[0][3]).toFixed(2);

    //   currunt month ekek danata use karala thiyena pramanaya gannawa
    const deductionObj = getServiceRequest("/fuelrequest/getDeductions?vehicleId=" + dataOb.vehicle_id.id);

    const usedAmount = parseFloat(deductionObj.totalDeduction);
    console.log(usedAmount);

    const usedFuelCost = parseFloat(deductionObj.totalFuelCost);
    const currentMonthTotalDistance = parseFloat(fuelSummary[0][5]).toFixed(2);

    if (packageName == "Floating Rate") {
      const totalAmount = packagePrice * currentMonthTotalDistance;
      usableFuelAmount = (totalAmount * 60) / 100;
    } else {
      const totalAmount = packagePrice;
      usableFuelAmount = (totalAmount * 60) / 100;
    }

    // balance eken liter ganawa gnnawa
    const balance = parseFloat(usableFuelAmount - usedAmount);
    console.log(balance);

    const currentBalanceLkr = (balance < 0 ? 0 : balance).toFixed(2);

    const fuelLiterAmount = getServiceRequest("/fuelprice/byvehicle?vehicleId=" + dataOb.vehicle_id.id) || 1;
    const balanceLiters = currentBalanceLkr / fuelLiterAmount;

    // Usage status color based on balance
    const statusColor = balanceLiters > 10 ? "#10b881" : balanceLiters > 0 ? "#f59e0b" : "#ef4444";
    let balanceClass = "balance-normal";
    let cardAlertClass = "";

    if (balanceLiters <= 0) {
      balanceClass = "balance-red";
      cardAlertClass = "empty-balance";
    } else if (balanceLiters < 10) {
      cardAlertClass = "low-balance";
    }

    // Formatting date
    const lastUpdated = dataOb.update_datetime ? new Date(dataOb.update_datetime).toLocaleDateString("en-GB") : "N/A";

    // Fuel Type Badge
    const fuelType = dataOb.fuel_type || "Diesel";
    const fuelBadgeClass = fuelType === "Petrol" ? "petrol-badge" : "diesel-badge";

    html += `
            <div class="fuel-card ${cardAlertClass}">
                <div class="card-top">
                    <div>
                        <div class="card-meta">Card • <span>${dataOb.fuel_cards_no}</span></div>
                        <div class="card-balance ${balanceClass}"><span>${balanceLiters.toFixed(2)}</span> L</div>
                        <div class="small text-muted mt-1">LKR ${currentBalanceLkr.toLocaleString()} Available</div>
                    </div>
                    <div class="text-end">
                        <span class="fuel-type-badge ${fuelBadgeClass}">${fuelType}</span>
                        <div style="font-weight:700; margin-top: 5px; color: #2d3748;">${dataOb.vehicle_id.vehicle_no}</div>
                    </div>
                </div>

                <div class="usage-stats mt-3">
                    <div class="stat-box">
                        <span class="stat-label">Used This Month</span>
                        <div class="stat-value-group">
                            <span class="stat-value text-danger"> ${(usedFuelCost / fuelLiterAmount).toFixed(2)} L</span>
                            <span class="stat-sub-value"> LKR ${usedFuelCost.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div class="card-content mt-3">
                    <div class="card-info-row">
                        <span class="info-label">Last Updated:</span>
                        <span class="info-value">${lastUpdated}</span>
                    </div>
                    <div class="card-info-row">
                         <span class="info-label">Status:</span>
                         <span class="card-meta ${statusClassName}">
                            <span>${dataOb.fuel_card_status_id.status}</span>
                        </span>
                    </div>
                </div>

                <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                    <div class="d-flex gap-2">
                        <button class="btn btn-2" style="padding: 6px 14px; font-size: 12px;width:100px" onclick="viewHistory(${index})">
                             History
                        </button>
                        ${
                          isActive
                            ? `<button class="btn btn-4 decativeBtn" style="padding: 6px 14px; font-size: 12px;width:100px" onclick="toggleStatus(${index}, false)">Deactivate</button>`
                            : `<button class="btn btn-3 activeBtn" style="padding: 6px 14px; font-size: 12px;width:100px" onclick="toggleStatus(${index}, true)">Activate</button>`
                        }
                    </div>
                    <button class="top-up-btn" onclick="fuelRequestModal(${index})" title="New Fuel Request">
                        <i class="fa-solid fa-gas-pump"></i>
                    </button>
                </div>
            </div>`;
  });

  cardContainer.innerHTML = html;
};

// Filter Functionality
const filterFuelCards = () => {
  const searchTerm = document.getElementById("searchTerm").value.toLowerCase();
  const statusFilter = document.getElementById("statusFilter").value;

  const filteredList = fuelCardsList.filter((card) => {
    const matchesSearch = card.fuel_cards_no.toLowerCase().includes(searchTerm) || card.vehicle_id.vehicle_no.toLowerCase().includes(searchTerm);
    const matchesStatus = statusFilter === "all" || card.fuel_card_status_id.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  renderFuelCards(filteredList);
};

// History Viewer
const viewHistory = (index) => {
  if ($.fn.dataTable.isDataTable("#fuelHistoryTable")) {
    $("#fuelHistoryTable").DataTable().clear().destroy();
  }
  const card = fuelCardsList[index];
  console.log(card);

  // modal eke id eken modal eka gnnawa
  const historyModalElement = document.getElementById("fuelCardHistoryModal");

  historyModal = new bootstrap.Modal(historyModalElement);

  historyModal.show();

  //   card no eka modal eke show karanwa
  document.getElementById("selectedCardNo").innerText = card.fuel_cards_no;

  //   history table ekata data fill karanna oni
  //   fuel card eke id ekata adala currunt month eke fuel request tika ganna oni
  //   fuel request tika gnnawa currunt month ekata adala
  const fuelRequestList = getServiceRequest("/fuelrequest/currentmonthfuelrequest?fuelCardId=" + card.id);
  console.log(fuelRequestList);
  // data available naththan no data avaialble kiyla show karanwa
  if (fuelRequestList.length > 0) {
    loadFuelHistoryTable(fuelRequestList);
  }
  $("#fuelHistoryTable").DataTable({
    dom: "rtp",
    pageLength: 5,
    createdRow: function (row, data, dataIndex) {
      $(row).find("td").css({
        "text-align": "center",
        padding: "15px 10px",
      });
    },
    headerCallback: function (thead, data, start, end, display) {
      $(thead).find("th").css({
        "text-align": "center",
        padding: "15px 10px",
      });
    },
  });
};

// data fill karanawa full hsitry table ekata
const loadFuelHistoryTable = (fuelRequestList) => {
  let propertyList = [
    { propertyName: getAddedDatetime, dataType: "function" },
    { propertyName: getVehicleNo, dataType: "function" },
    { propertyName: getLiterCount, dataType: "function" },
    { propertyName: getRequestAmount, dataType: "function" },
    { propertyName: getBookingNo, dataType: "function" },
    { propertyName: getstatus, dataType: "function" },
  ];

  dataFillIntoTheReportTable(fuelHistoryTableBody, fuelRequestList, propertyList);
};

const getAddedDatetime = (dataOb) => {
  return dataOb.added_datetime.replace("T", " ").split(".")[0];
};

const getVehicleNo = (dataOb) => {
  return dataOb.vehicle_id.vehicle_no;
};

const getLiterCount = (dataOb) => {
  return (parseFloat(dataOb.request_fuel_cost_amount) / 279).toFixed(2) + " L";
};

const getRequestAmount = (dataOb) => {
  return parseFloat(dataOb.request_fuel_cost_amount).toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });
};

const getBookingNo = (dataOb) => {
  return dataOb.booking_id.booking_no;
};

const getstatus = (dataOb) => {
  if (dataOb.fuel_request_status_id.status == "Pending") {
    return `<span class="status-badge status-pending"> ${dataOb.fuel_request_status_id.status} </span>`;
  } else if (dataOb.fuel_request_status_id.status == "Approved") {
    return `<span class="status-badge status-active"> ${dataOb.fuel_request_status_id.status} </span>`;
  } else {
    return `<span class="status-badge status-reject"> ${dataOb.fuel_request_status_id.status} </span>`;
  }
};

// Status Toggle
const toggleStatus = (index, activate) => {
  // fuel card eka gnnawa select karala thiyena
  fuelCard = fuelCardsList[index];
  if (activate) {
    activeFuelCard();
  } else {
    inactiveFuelCard();
  }
};

// new request modal
const fuelRequestModal = (index) => {
  card = fuelCardsList[index];
  console.log(card);
  if (card.fuel_card_status_id.status == "Inactive") {
    Swal.fire({
      title: "Can't add new fuel request for this card",
      text: "Card Already Inactive.Please Activate the card before add fuel request",
      icon: "error",
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
  } else {
    fuelCard = { ...card };
    const modal = new bootstrap.Modal(document.getElementById("newRequestModal"));
    modal.show();
  }

  // card ekata adala drivers la tika gnnawa
  let driverBySupplier = getServiceRequest("/driver/allsupplierid?supplierid=" + card.vehicle_id.supplier_id.id);
  dataFilIntoSelect(selectDriver, "Select Driver ", driverBySupplier, "fullname");
  fuelRequest.vehicle_id = card.vehicle_id;
  fuelRequest.fuel_cards_id = card;
};

// booking ganna filtering eka
const selectedDriverElement = document.querySelector("#selectDriver");
selectedDriverElement.addEventListener("change", () => {
  //   change ekedi input clean wenn oni
  setDefault([selectBooking]);
  let driver = JSON.parse(selectedDriverElement.value);

  fuelRequest.driver_id = JSON.parse(JSON.stringify(driver));

  //     driver ta saha vehicle ekata adlawa ongoing bookings gannawa
  let vehicleBookings = getServiceRequest("/booking/ongonibookingbyvehicleiddriverid?vehicleid=" + card.vehicle_id.id + "&driverid=" + driver.id);
  dataFilIntoSelect(selectBooking, "Select Booking ", vehicleBookings, "booking_no");
});

// selected booking ekata adala maxium amount ek gnnawa
const selectedBookingElement = document.querySelector("#selectBooking");
selectedBookingElement.addEventListener("change", () => {
  let selectedBooking = JSON.parse(selectedBookingElement.value);

  // select karapu booking eke distance eka
  const selectBookingDistance = selectedBooking.distance;

  //   select karapu vehicle eke fuel consumption eka
  const selecteVehicleFuelConsumption = card.vehicle_id.fuel_consumption;

  let estimatedTripFuelCost = 0;
  const fuelLiterAmount = getServiceRequest("fuelprice/byvehicle?vehicleId=" + card.vehicle_id.id);
  const packagename = getServiceRequest("/package/packagenamebyvehicleid?vehicleid=" + card.vehicle_id.id);

  if (packagename == "Floating Rate") {
    // Floating Rate nam trip distance eka anuwa hadanawa
    estimatedTripFuelCost = (selectBookingDistance / selecteVehicleFuelConsumption) * fuelLiterAmount;
  } else {
    // Fixed Rate nam usable amount eka 25 n bedanawa
    if (typeof usableFuelAmount !== "undefined" && usableFuelAmount > 0) {
      estimatedTripFuelCost = usableFuelAmount / 25;
    } else {
      estimatedTripFuelCost = 0;
    }
  }

  maximumLimit.value = estimatedTripFuelCost.toFixed(2);
});

//amount eke type karaddi validation eka liynawa
const requestAmountElement = document.querySelector("#textRequestAmount");
const maxiumPriceElement = document.querySelector("#maximumLimit");
requestAmountElement.addEventListener("keyup", () => {
  const requestAmount = parseInt(requestAmountElement.value);
  const maximumLimit = parseInt(maxiumPriceElement.value);
  if (requestAmount > maximumLimit) {
    Swal.fire({
      title: "Error",
      text: "You don't have any enough balance.!",
      icon: "error",
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    requestAmountElement.classList.add("is-invalid");
    requestAmountElement.value = 0;
  } else {
    requestAmountElement.classList.remove("is-invalid");
  }
});

// form error check karana function eka
const checkRequestFormError = () => {
  let errors = "";

  if (fuelRequest.vehicle_id == null) {
    errors = errors + "Please select the vehicle..! \n";
    selectVehicleNo.classList.add("is-invalid");
  }
  if (fuelRequest.driver_id == null) {
    errors = errors + "Please Select driver..! \n";
    selectDriver.classList.add("is-invalid");
  }
  if (fuelRequest.booking_id == null) {
    errors = errors + "Please Select booking..! \n";
    selectBooking.classList.add("is-invalid");
  }
  if (fuelRequest.request_fuel_cost_amount == null) {
    errors = errors + "Please Enter request fuel amount..! \n";
    textRequestAmount.classList.add("is-invalid");
  }
  if (fuelRequest.fuel_cards_id == null) {
    errors = errors + "fuel card not generated..! \n";
  }

  return errors;
};

// form submition
const fuelRequestFormSubmit = () => {
  console.log(fuelRequest);
  generateFuelRequestNo();

  // check form error for required element
  let errors = checkRequestFormError();
  if (errors == "") {
    // errors not exit
    //need to get user confirmation

    let userConfirm = Swal.fire({
      title: "Confirm Fuel Request",
      text: "Are you sure you want to create this fuel request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Create Request",
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
        let postResponse = httpServiceRequest("/fuelrequest/insert", "POST", fuelRequest);
        if (postResponse == "ok") {
          Swal.fire({
            title: "Request Created!",
            text: "New fuel request has been successfully created.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          resfreshForm();
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
          text: "Request not Saved!",
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
      title: "Request Incomplete",
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

// refresh form eka
const resfreshForm = () => {
  fuelCard = new Object();
  fuelCardForm.reset();
  fuelRequest = new Object();
  newRequestForm.reset();

  vehicleList = getServiceRequest("/vehicle/alldata");
  dataFillIntoDataList(textVehicleNo, vehicleList, "vehicle_no");

  let fuelType = getServiceRequest("/fueltype/alldata");
  dataFilIntoSelect(textFuelType, "Select Fuel Type ", fuelType, "fuel_name");

  setDefault([selectVehicleNo, textNote, textFuelType, selectDriver, selectBooking, textRequestAmount]);
};

//generate fuel Request no
const generateFuelRequestNo = () => {
  //     no format----FR-202512-000001

  let date = new Date();
  let year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, "0");

  let prefix = `FR-${year}${month}-`;

  const fuelrequest = getServiceRequest("/fuelrequest/alldata");

  let previousFuelRequestNo = fuelrequest[fuelrequest.length - 1];

  //     get previous fuel card no
  if (previousFuelRequestNo == null) {
    fuelRequest.fuel_request_no = prefix + "000001";
  } else {
    // split karanwa hyphen eka use karala
    let parts = previousFuelRequestNo.fuel_request_no.split("-");
    let lastNumber = parseInt(parts[2]); // number part eka aragena array eken eka int walata parse karanawa
    let newNumber = (lastNumber + 1).toString().padStart(6, "0");
    fuelRequest.fuel_request_no = prefix + newNumber;
  }
};

// Function for datalist validation and object assignment
const dataListValidator = (element, object, property) => {
  const elementValue = element.value;
  const extIndex = vehicleList.findIndex((vehicle) => vehicle.vehicle_no === elementValue);

  // if the value exists, assign it to the array and add validation class
  if (extIndex !== -1) {
    fuelCard.vehicle_id = vehicleList[extIndex];
    element.classList.remove("is-invalid");
    element.classList.add("is-valid");
  } else {
    window[object][property] = null;
    element.classList.add("is-invalid");
    element.classList.remove("is-valid");
  }
};

// generte Fuel Card No
const generateFuelCardNo = () => {
  //     "FC-25-000001"
  //     previous fuel card  no eka mokkd kiyala balanna oni

  const fuelCards = getServiceRequest("/fuelscards/alldata");
  let currentYear = new Date().getFullYear().toString().slice(-2);

  if (fuelCards.length === 0) {
    fuelCard.fuel_cards_no = "FC-" + currentYear + "-000001";
  } else {
    // anithimata add karapu card eka gnnawa
    const lastCard = fuelCards[fuelCards.length - 1];
    // split karanwa hyphen eka use karala
    let parts = lastCard.fuel_cards_no.split("-");

    //  2 index eke gnnawa.eke thama no eka thiyenne
    let lastNumber = parseInt(parts[2]);
    //  eelaga no eka generate karanwa
    let newNumber = (lastNumber + 1).toString().padStart(6, "0");
    fuelCard.fuel_cards_no = "FC-" + currentYear + "-" + newNumber;
  }
};

// fuel card form error check karanwa
const checkFormError = () => {
  let errors = "";

  if (fuelCard.vehicle_id == null) {
    errors = errors + "Please Select the vehicle no..! \n";
    selectVehicleNo.classList.add("is-invalid");
  }
  if (fuelCard.fuel_type_id == null) {
    errors = errors + "Please select the fuel type..! \n";
    textFuelType.classList.add("is-invalid");
  }
  return errors;
};

//fuel card from submit event function
const fuelCardFormSubmit = () => {
  console.log(fuelCard);
  generateFuelCardNo();

  // Set initial balance identical to allocated amount
  fuelCard.currunt_balance = fuelCard.allocated_amount;

  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    // errors not exit
    //need to get user confirmation

    let userConfirm = Swal.fire({
      title: "Confirm Fuel Card Creation",
      text: "Are you sure you want to create this new fuel card? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Create Card",
      allowOutsideClick: false,
      customClass: {
        cancelButton: "btn btn-1",
        confirmButton: "btn btn-2",
        popup: "swal2-border-radius",
      },
    }).then((userConfirm) => {
      if (userConfirm.isConfirmed) {
        //call post service
        let postResponse = httpServiceRequest("/fuelscards/insert", "POST", fuelCard);
        if (postResponse == "ok") {
          Swal.fire({
            title: "Fuel Card Created!",
            text: "New fuel card has been successfully created.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          resfreshForm();
          loadFuelCards();
          bootstrap.Modal.getInstance(document.getElementById("fuelCardAddFormModal")).hide();
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
          text: "Fuel card creation cancelled.",
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

// activate karana function eka
const activeFuelCard = () => {
  let postResponse = httpServiceRequest("/fuelscards/updatestatusactive", "PUT", fuelCard);
  if (postResponse == "ok") {
    Swal.fire({
      title: "Fuel Card Activated!",
      text: "The fuel card has been successfully activated.",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
      customClass: {
        popup: "swal2-border-radius",
      },
    });
    resfreshForm();
    loadFuelCards();
  } else {
    Swal.fire({
      title: "Activation Failed",
      text: postResponse,
      icon: "error",
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
  }
};

// inactivate karana function eka
const inactiveFuelCard = () => {
  let postResponse = httpServiceRequest("/fuelscards/updatestatusinactive", "PUT", fuelCard);
  if (postResponse == "ok") {
    Swal.fire({
      title: "Fuel Card Deactivated!",
      text: "The fuel card has been successfully deactivated.",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
      customClass: {
        popup: "swal2-border-radius",
      },
    });
    resfreshForm();
    loadFuelCards();
  } else {
    Swal.fire({
      title: "Deactivation Failed",
      text: postResponse,
      icon: "error",
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
  }
};

// modal eka close weddi form eka refresh karana comman function eka
formResetFunctionWhenClosingModal("fuelCardAddFormModal", "fuelCardForm", resfreshForm);

// modal eka close weddi form eka refresh karana comman function eka
formResetFunctionWhenClosingModal("newRequestModal", "newRequestForm", resfreshForm);
