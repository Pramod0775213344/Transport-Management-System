window.addEventListener("load", () => {
  setTimeout(() => {
    try {
      loadFuelRequestTable();
      loadApprovalFuelRequestTable();
      refreshFuelRequestForm();
    } catch (e) {
      console.error("Error during fuel-request page initialization:", e);
    } finally {
      finishPageLoading();
    }
  }, 100);
});

const loadFuelRequestTable = () => {
  let fuelRequestList = getServiceRequest("fuelrequest/pendinglist");

  if ($.fn.dataTable.isDataTable("#fuelRequestTable")) {
    $("#fuelRequestTable").DataTable().clear().destroy();
  }
  let propertyList = [
    { propertyName: getDriver, dataType: "function" },
    { propertyName: getVehicleNo, dataType: "function" },
    { propertyName: getfuelCardNo, dataType: "function" },
    { propertyName: getRequestAmount, dataType: "function" },
    { propertyName: getRoute, dataType: "function" },
    { propertyName: getstatus, dataType: "function" },
  ];

  datafillApprovalTable(fuelRequestTableBody, fuelRequestList, propertyList, viewFuelRequest);


  const table = $("#fuelRequestTable").DataTable({
    dom: "rtip",
    pageLength: 25,
    createdRow: function (row, data, dataIndex) {
      $(row).find("td").css({
        "text-align": "center",
        height: "80px",
      });
    },
    headerCallback: function (thead, data, start, end, display) {
      $(thead).find("th").css({
        "text-align": "center",
        padding: "20px",
      });
    },
  });

  // Custom Search
  $("#tableSearchPending")
    .off("keyup")
    .on("keyup", function () {
      table.search(this.value).draw();
    });

  // Custom Length
  $("#tableLengthPending")
    .off("change")
    .on("change", function () {
      table.page.len(this.value).draw();
    });
  applyPrivileges("Fuel Request Approvals", "fuelRequestTable", {
  });

  table.on("draw.dt", function () {
    applyPrivileges("Fuel Request Approvals", "fuelRequestTable", {});
  });

  applyPrivileges("Fuel Request Management", "", {
    add: addButton
  });
};

const loadApprovalFuelRequestTable = () => {
  let approveFuelRequest = getServiceRequest("fuelrequest/approvedlist");
  if ($.fn.dataTable.isDataTable("#approvedFuelRequestTable")) {
    $("#approvedFuelRequestTable").DataTable().clear().destroy();
  }

  let propertyList2 = [
    { propertyName: getMonth, dataType: "function" },
    { propertyName: getDate, dataType: "function" },
    { propertyName: "fuel_request_no", dataType: "string" },
    { propertyName: getDriver, dataType: "function" },
    { propertyName: getVehicleNo, dataType: "function" },
    { propertyName: getfuelCardNo, dataType: "function" },
    { propertyName: getRequestAmount, dataType: "function" },
    { propertyName: getstatus, dataType: "function" },
  ];

  datafillApprovalTable(approvedFuelRequestTableBody, approveFuelRequest, propertyList2, viewFuelRequest);
  const table = $("#approvedFuelRequestTable").DataTable({
    dom: "rtip",
    pageLength: 25,
    createdRow: function (row, data, dataIndex) {
      $(row).find("td").css({
        "text-align": "center",
        height: "80px",
      });
    },
    headerCallback: function (thead, data, start, end, display) {
      $(thead).find("th").css({
        "text-align": "center",
        padding: "20px",
      });
    },
  });

  // Custom Search
  $("#tableSearchApproved")
    .off("keyup")
    .on("keyup", function () {
      table.search(this.value).draw();
    });

  // Custom Length
  $("#tableLengthApproved")
    .off("change")
    .on("change", function () {
      table.page.len(this.value).draw();
    });
};

const exportTable = (type, tableType) => {
  const tableId = tableType === "pending" ? "#fuelRequestTable" : "#approvedFuelRequestTable";

  if (type === "excel") {
    const fileName = tableType === "pending" ? "fuel_requests_pending" : "fuel_requests_approved";
    const sheetName = tableType === "pending" ? "PendingRequests" : "ApprovedRequests";
    exportTableToExcelWithSheetJS(tableId, fileName, { sheetName });
  } else if (type === "pdf") {
    const fileName = tableType === "pending" ? "fuel_requests_pending" : "fuel_requests_approved";
    const title = tableType === "pending" ? "Fuel Requests - Pending" : "Fuel Requests - Approved";
    exportTableToPdfWithJsPdf(tableId, fileName, { title });
  }
};

// get Driver NAME
const getRequestAmount = (dataOb) => {
  return `<div class="fw-bold">${dataOb.request_fuel_cost_amount.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  })} <span></span></div>`;
};

// get Driver NAME
const getDriver = (dataOb) => {
  return `<div class="fw-bold">${dataOb.driver_id.fullname}</div>
<div class="text-muted" style="font-size: 13px"><span>Driver ID :</span>${dataOb.driver_id.driver_reg_no}</div>`;
};

// GET Vehicle no
const getVehicleNo = (dataOb) => {
  return dataOb.vehicle_id.vehicle_no;
};

// getFuel card no
const getfuelCardNo = (dataOb) => {
  return dataOb.fuel_cards_id.fuel_cards_no;
};

// get Month
const getMonth = (dataOb) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const date = new Date(dataOb.added_datetime);
  return `<div>${months[date.getMonth()]}</div>`;
};

// get Date
const getDate = (dataOb) => {
  const date = new Date(dataOb.added_datetime);
  return `<div class="text-muted" style="font-size: 13px">${date.toLocaleDateString("en-GB")}</div>`;
};

// get Route
const getRoute = (dataOb) => {
  return `<div class="mb-1"><span> ${dataOb.booking_id.pickup_locations_id.name}</span> <i class="me-3 ms-3 fa-solid fa-arrow-right" style="color: #0bb613"></i> <span> ${dataOb.booking_id.delivery_locations_id.name}</span></div>
<div class="text-muted " style="font-size: 14px">Distance - <span >${dataOb.booking_id.distance}</span> km</div>`;
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

// Common function for Fuel Request tables with dynamic status-based action buttons
const datafillApprovalTable = (tableBody, dataList, propertyList, viewFunction) => {
  tableBody.innerHTML = "";
  dataList.forEach((dataOb, index) => {
    let tr = document.createElement("tr");

    let tdIndex = document.createElement("td");
    tdIndex.innerHTML = parseInt(index) + 1;
    tr.appendChild(tdIndex);

    propertyList.forEach((property) => {
      let td = document.createElement("td");
      if (property.dataType == "string") td.innerHTML = dataOb[property.propertyName];
      if (property.dataType == "function") td.innerHTML = property.propertyName(dataOb);
      if (property.dataType == "decimal") td.innerHTML = parseFloat(dataOb[property.propertyName]).toFixed(2);
      tr.appendChild(td);
    });

    let tdButton = document.createElement("td");
    let buttonDiv = document.createElement("div");
    buttonDiv.className = "actions";

    let actionBtn = document.createElement("button");
    actionBtn.className = "action-btn share";

    // Logic: If Pending -> Action Icon, If Approved/Reject -> View Icon
    const status = dataOb.fuel_request_status_id.status;
    let icon = "fa-eye"; // Default for Approved/Reject
    let title = "View Details";

    if (status === "Pending") {
      icon = "fa-file-signature"; // Icon for Action
      title = "Approve or Reject";
      actionBtn.className = "action-btn edit";
    }

    actionBtn.innerHTML = `<i class="fa-solid ${icon}"></i>`;
    actionBtn.setAttribute("title", title);
    actionBtn.onclick = () => viewFunction(dataOb, index);

    buttonDiv.appendChild(actionBtn);
    tdButton.appendChild(buttonDiv);
    tr.appendChild(tdButton);
    tableBody.appendChild(tr);
  });
};

const viewFuelRequest = (dataOb) => {
  selectedFuelRequest = JSON.parse(JSON.stringify(dataOb));

  document.getElementById("viewRequestNo").innerText = `#${dataOb.fuel_request_no}`;
  document.getElementById("viewAmount").innerText = dataOb.request_fuel_cost_amount.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });
  document.getElementById("viewFuelCard").innerText = dataOb.fuel_cards_id.fuel_cards_no;
  document.getElementById("viewDriver").innerText = dataOb.driver_id.fullname;
  document.getElementById("viewVehicle").innerText = dataOb.vehicle_id.vehicle_no;
  document.getElementById("viewRoute").innerText = `${dataOb.booking_id.pickup_locations_id.name} -> ${dataOb.booking_id.delivery_locations_id.name}`;
  document.getElementById("viewBookingNo").innerText = `Booking: #${dataOb.booking_id.booking_no}`;
  document.getElementById("viewNote").innerText = dataOb.note || "No notes provided";

  // buttons hide karana view karana function eka
  const decisionButtons = document.getElementById("decisionButtons");
  if (dataOb.fuel_request_status_id.status === "Pending") {
    decisionButtons.classList.remove("d-none");
    decisionButtons.classList.add("d-flex");
    printButton.style.display = "none";
  } else {
    decisionButtons.classList.add("d-none");
    decisionButtons.classList.remove("d-flex");
    printButton.style.display = "";
  }

  $("#fuelRequestViewModal").modal("show");
};

const approveRequest = () => {
  approveFuelRequest(selectedFuelRequest);
  $("#fuelRequestViewModal").modal("hide");
};

const rejectRequest = () => {
  rejectFuelRequest(selectedFuelRequest);
  $("#fuelRequestViewModal").modal("hide");
};

// aprove finction
const approveFuelRequest = (dataOb) => {
  let userConfirm = Swal.fire({
    title: "Confirm Approval",
    text: "Are you sure you want to approve this fuel request?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Approve",
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
      let postResponse = httpServiceRequest("fuelrequest/approve", "PUT", dataOb);
      if (postResponse == "ok") {
        Swal.fire({
          title: "Request Approved!",
          text: "The fuel request has been successfully approved.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-border-radius",
          },
        });
        loadFuelRequestTable();
        refreshFuelRequestForm();
      } else {
        Swal.fire({
          title: "Approval Not Completed",
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
        text: "Approval Process Cancelled!",
        icon: "error",
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    }
  });
};

// reject funtion
const rejectFuelRequest = (dataOb) => {
  let userConfirm = Swal.fire({
    title: "Confirm Rejection",
    text: "Are you sure you want to reject this fuel request? This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Reject",
    cancelButtonText: "Cancel",
    allowOutsideClick: false,
    customClass: {
      cancelButton: "btn btn-1",
      confirmButton: "btn btn-4",
      popup: "swal2-border-radius",
    },
  }).then((userConfirm) => {
    if (userConfirm.isConfirmed) {
      //call post service
      let deleteResponse = httpServiceRequest("/fuelrequest/reject", "PUT", dataOb);
      if (deleteResponse == "ok") {
        Swal.fire({
          title: "Request Rejected!",
          text: "Fuel request has been rejected.",
          icon: "success",
          iconColor: "#ef4444",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-border-radius",
          },
        });
        loadFuelRequestTable();
        refreshFuelRequestForm();
      } else {
        Swal.fire({
          title: "Rejection Not Completed",
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
        text: "Rejection Process Cancelled!",
        icon: "error",
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    }
  });
};

// print function eka
const printFuelRequestDetail = () => {
  const printContent = document.querySelector("#fuelRequestViewModal .modal-body").innerHTML;
  const newWindow = window.open("", "_blank");
  newWindow.document.write(`
        <html>
            <head>
                <title>Fuel Request Detail - OKI-DOKI</title>
                <link rel="stylesheet" href="/bootstrap/bootstrap-5.2.3/css/bootstrap.min.css">
                <link rel=stylesheet href="/fontawesome-free-6.7.2-web/css/all.css">
                <style>
                    body { font-family: 'Public Sans', sans-serif; padding: 40px; }
                    .btn, .btn-link ,.btn-cancel { display: none !important; }
                    .modal-content { border: none !important; }
                </style>
            </head>
            <body style="background-color: white;">
                <div style="max-width: 600px; margin: 0 auto; border: 2px solid #d3d3d3ff; padding: 20px; border-radius: 20px;">
                    ${printContent}
                </div>
            </body>
        </html>
    `);
  newWindow.document.close();
  setTimeout(() => {
    newWindow.print();
    newWindow.close();
  }, 500);
};

// form error check karana function eka
const checkFormError = () => {
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
  let errors = checkFormError();
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
        let postResponse = httpServiceRequest("fuelrequest/insert", "POST", fuelRequest);
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
          loadFuelRequestTable();
          refreshFuelRequestForm();
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

const refreshFuelRequestForm = () => {
  fuelRequest = new Object();
  selectedFuelRequest = new Object();
  fuelRequestForm.reset();

  vehicleList = getServiceRequest("/vehicle/allvehicleswhichhasfuelcard");
  // dataFilIntoSelect(selectVehicleNo, "Select Company Name", vehicleList, "vehicle_no")
  dataFillIntoDataList(textVehicleNo, vehicleList, "vehicle_no");

  let driver = getServiceRequest("/driver/alldata");
  dataFilIntoSelect(selectDriver, "Select Driver ", driver, "fullname");

  setDefault([selectVehicleNo, selectDriver, selectBooking, textRequestAmount, textNote]);
  selectBooking.value = "";

  monthlyEarn.innerText = "LKR 0.00";
  maxLimit.innerText = "0.00 L";
  tripCost.innerText = "LKR 0.00";


};

// Data filing function to fuel request  table
const dataFillIntoFuelRequestTheTable = (tableBodyId, dataList, propertyList, approveFunction, rejectFunction, buttonVisibilty = true) => {
  tableBodyId.innerHTML = "";

  dataList.forEach((dataOb, index) => {
    let tr = document.createElement("tr");

    // let tdICheckBox = document.createElement("td");
    // let checkBox = document.createElement("input");
    // checkBox.type = "checkbox";
    // checkBox.className = "form-check-input";
    // tdICheckBox.appendChild(checkBox);
    // tr.appendChild(tdICheckBox);

    let tdIndex = document.createElement("td");
    tdIndex.innerHTML = parseInt(index) + 1;
    tr.appendChild(tdIndex);

    for (const property of propertyList) {
      let td = document.createElement("td");

      if (property.dataType == "string") {
        td.innerHTML = dataOb[property.propertyName];
      }
      if (property.dataType == "function") {
        td.innerHTML = property.propertyName(dataOb);
      }
      if (property.dataType == "decimal") {
        td.innerHTML = parseFloat(dataOb[property.propertyName]).toFixed(2);
      }
      if (property.dataType == "image-array") {
        let img = document.createElement("img");
        img.className = "table-img rounded-circle";
        if (dataOb[property.propertyName] != null) {
          img.src = atob(dataOb[property.propertyName]);
        } else {
          img.src = "images/user.png";
        }
        td.appendChild(img);
      }
      if (property.dataType == "truck-image-array") {
        let img = document.createElement("img");
        img.className = "table-img rounded-circle";
        if (dataOb[property.propertyName] != null) {
          img.src = atob(dataOb[property.propertyName]);
        } else {
          img.src = "images/truck.png";
        }
        td.appendChild(img);
      }
      tr.appendChild(td);
    }

    //Button List
    let tdbutton = document.createElement("td");
    tdbutton.style.position = "relative";

    let buttonDiv = document.createElement("div");
    buttonDiv.className = "action";

    let editButton = document.createElement("button");
    editButton.className = "btn btn-3 me-3";
    editButton.innerHTML = "Approve";
    editButton.setAttribute("title", "Approve");
    editButton.onclick = () => {
      approveFunction(dataOb, index);
    };
    buttonDiv.appendChild(editButton);

    let viewButton = document.createElement("button");
    viewButton.className = "btn btn-4";
    viewButton.innerHTML = "Reject";
    viewButton.setAttribute("title", "Reject");
    viewButton.onclick = () => {
      rejectFunction(dataOb, index);
    };
    buttonDiv.appendChild(viewButton);

    tdbutton.appendChild(buttonDiv);
    tr.appendChild(tdbutton);
    tableBodyId.appendChild(tr);
  });
};


// gloabal varibals
let vehicleObj = null;
let usableFuelAmountPrice = 0;
//filtering for selected vehicle bookings and drivers,fuel calculation
const selectedVehicleElement = document.querySelector("#selectVehicleNo");
selectedVehicleElement.addEventListener("change", () => {
  //   change ekedi input clean wenn oni
  setDefault([selectDriver, selectBooking, textRequestAmount, textNote]);
  let vehicleNo = selectedVehicleElement.value;
  const extVehicleId = vehicleList.findIndex((v) => v.vehicle_no === vehicleNo);
  vehicleObj = vehicleList[extVehicleId];

  let supplier = vehicleObj.supplier_id;

  // vehicle id eka object ekata bind karawna
  fuelRequest.vehicle_id = JSON.parse(JSON.stringify(vehicleObj));

  let driverBySupplier = getServiceRequest("/driver/allsupplierid?supplierid=" + supplier.id);
  dataFilIntoSelect(selectDriver, "Select Driver ", driverBySupplier, "fullname");

  // fuel id card eka bind karanawa
  let fuelCardsByVehicle = getServiceRequest("/fuelscards/byvehicle?vehicleId=" + vehicleObj.id);
  fuelRequest.fuel_cards_id = JSON.parse(JSON.stringify(fuelCardsByVehicle));

  // -----------------vehicle walata adalwa fuel calculation eka-----------------------------------

  // danata maseta duwala thiyena bookings wala sampurna gana vehicle wise

  // vehicel no eka change weddi meka wenas wenawa

  /*mulinma packe price eka gnnawa*/
  const packagePrice = getServiceRequest("/package/suppricebyvehicleid?vehicleid=" + vehicleObj.id);

  // vehicle ekata adala totala dura hoyagannawa
  const currentMonthTotalDistance = getServiceRequest("booking/totaldistanceforselectedvehicle?vehicleid=" + vehicleObj.id);

  //   currunt month ekek danata use karala thiyena pramanaya gannawa
  const deductionObj = getServiceRequest("/fuelrequest/getDeductions?vehicleId=" + vehicleObj.id);

  const usedAmount = parseFloat(deductionObj.totalDeduction);
  //   -----------------package eka anuwa wenas wena data tika hadanwa-----------------------------
  const packagename = getServiceRequest("/package/packagenamebyvehicleid?vehicleid=" + vehicleObj.id);
  let totalPrice = 0;
  usableFuelAmountPrice = 0;
  if (packagename == "Floating Rate") {
    // currunt month eke total amount eka
    totalPrice = packagePrice * currentMonthTotalDistance;
    // usable amount for fuel requests
    usableFuelAmountPrice = (totalPrice * 60) / 100 - usedAmount;
  } else {
    const oneBookingPrice = packagePrice / 25;
    totalPrice = oneBookingPrice * currentMonthTotalDistance;
    // usable amount for fuel requests
    usableFuelAmountPrice = (packagePrice * 60) / 100 - usedAmount;
  }

  if (usableFuelAmountPrice < 0) {
    usableFuelAmountPrice = 0;
  }

  monthlyEarn.innerHTML = usableFuelAmountPrice.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });

  //   available liter gana gnnawa
  const maximumLiter = usableFuelAmountPrice / 279;
  maxLimit.innerHTML = maximumLiter.toFixed(2) + " L";

  // ----------vehicle eke fuel card ekata fuel price id eka object ekata bind karanaw
  fuelRequest.fuel_price_id = getServiceRequest("/fuelprice/fuelobjectbyvehicle?vehicleId=" + vehicleObj.id);
});

// booking ganna filtering eka
const selectedDriverElement = document.querySelector("#selectDriver");
selectedDriverElement.addEventListener("change", () => {
  //   change ekedi input clean wenn oni
  setDefault([selectBooking, textRequestAmount, textNote]);
  let driver = JSON.parse(selectedDriverElement.value);

  fuelRequest.driver_id = JSON.parse(JSON.stringify(driver));

  //     driver ta saha vehicle ekata adlawa ongoing bookings gannawa
  let vehicleBookings = getServiceRequest("/booking/ongonibookingbyvehicleiddriverid?vehicleid=" + vehicleObj.id + "&driverid=" + driver.id);
  dataFilIntoSelect(selectBooking, "Select Booking ", vehicleBookings, "booking_no");
});

// select karana booking ekata adlawa denna puluwan uparima liter ganaa balanawa,extar calculation eka thiyenne methana
const selectedBookingElemeny = document.querySelector("#selectBooking");
selectedBookingElemeny.addEventListener("change", () => {
  //   booking list eke distance eka gnnwa current month eke
  let selectedBooking = JSON.parse(selectedBookingElemeny.value);

  // select karapu booking eke distance eka
  const selectBookingDistance = selectedBooking.distance;

  //   select karapu vehicle eke fuel consumption eka
  const selecteVehicleFuelConsumption = vehicleObj.fuel_consumption;

  //   fuel price
  const fuelPrice = getServiceRequest("fuelprice/byvehicle?vehicleId=" + vehicleObj.id);
  let estimatedTripFuelCost = 0;
  const packagename = getServiceRequest("/package/packagenamebyvehicleid?vehicleid=" + vehicleObj.id);

  if (packagename == "Floating Rate") {
    // Floating Rate nam trip distance eka anuwa hadanawa

    estimatedTripFuelCost = (selectBookingDistance / selecteVehicleFuelConsumption) * fuelPrice;
  } else {
    // Fixed Rate nam usable amount eka 25 n bedanawa
    if (typeof usableFuelAmountPrice !== "undefined" && usableFuelAmountPrice > 0) {
      estimatedTripFuelCost = usableFuelAmountPrice / 25;
    } else {
      estimatedTripFuelCost = 0;
    }
  }

  tripCost.innerHTML = estimatedTripFuelCost.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });
});

// Function for datalist validation and object assignment
const dataListValidator = (element, object, property) => {
  const elementValue = element.value;

  const extIndex = vehicleList.findIndex((vehicle) => vehicle.vehicle_no === elementValue);

  // if the value exists, assign it to the array and add validation class
  if (extIndex !== -1) {
    fuelRequest.vehicle_id = vehicleList[extIndex];
    element.classList.remove("is-invalid");
    element.classList.add("is-valid");
  } else {
    window[object][property] = null;
    element.classList.add("is-invalid");
    element.classList.remove("is-valid");
  }
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

// amount ekata validation ekak danna oni
const amountElement = document.querySelector("#textRequestAmount");
amountElement.addEventListener("keyup", () => {
  const availableAmountForMonth = parseFloat(document.getElementById("monthlyEarn").innerText.replace(/[^\d.-]/g, ""));
  const requestAmount = parseFloat(amountElement.value);

  if (!isNaN(requestAmount)) {
    if (requestAmount <= availableAmountForMonth) {
      amountElement.classList.add("is-valid");
      amountElement.classList.remove("is-invalid");
      fuelRequest.request_fuel_cost_amount = requestAmount;
    } else {
      amountElement.classList.remove("is-valid");
      amountElement.classList.add("is-invalid");
      fuelRequest.request_fuel_cost_amount = null;
      Swal.fire({
        title: "Limit Exceeded",
        text: "Requested amount cannot be greater than the available amount.",
        icon: "error",
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    }
  } else {
    amountElement.classList.remove("is-valid");
    fuelRequest.request_fuel_cost_amount = null;
  }
});
// modal eka close weddi form eka refresh karana comman function eka
formResetFunctionWhenClosingModal("fuelRequestFormModal", "fuelRequestForm", refreshFuelRequestForm);
