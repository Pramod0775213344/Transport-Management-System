
// ===================== load functions =========================
window.addEventListener("load", function () {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      refresh();
      loadSupplierPayableDetailsTable();
    } catch (e) {
      console.error("Error during supplier-payable page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);
});
// ===================== end load functions =========================


// ======================== search karana functions =====================
let supplierAgreements = getServiceRequest("/supplieragreement/active");
// vehicle select kalama ekata adala package type eka ganna oni
const vehicleNoElement = document.querySelector("#selectVehicle");
const selectedMonthElement = document.querySelector("#selectMonth");
vehicleNoElement.addEventListener("change", (e) => {
  const vehicleNo = JSON.parse(vehicleNoElement.value);
  const selectedVehicleId = vehicleNo.id;

  const supplierAgreement = supplierAgreements.find((supplierAgreement) => supplierAgreement.vehicle_id.id === selectedVehicleId);

  const packageType = supplierAgreement.package_id.package_type;

  if (packageType === "Fix Rate") {
    selectedAgreementType.value = "Fix Rate";
    document.getElementById("selectedAgreementType").style.display = "none";
    document.getElementById("selectPackageDisplay").innerText = "Fixed Rate";
    document.getElementById("selectPackageDisplay").style.display = "block";
  } else if (packageType === "Floating Rate") {
    selectedAgreementType.value = "Floating Rate";
    document.getElementById("selectedAgreementType").style.display = "none";
    document.getElementById("selectPackageDisplay").innerText = "Floating Rate";
    document.getElementById("selectPackageDisplay").style.display = "block";
  } else {
    selectedAgreementType.value = "no available";
    document.getElementById("selectedAgreementType").style.display = "none";
    document.getElementById("selectPackageDisplay").innerText = "No Agreement";
    document.getElementById("selectPackageDisplay").style.display = "block";
  }

  let paymentMonthBySupplier = getServiceRequest("/booking/supplierpaymentmonth?vehicleid=" + vehicleNo.id);
  dataFilIntoSelect(selectMonth, "Select Month ", paymentMonthBySupplier, "formatted_date");

  autoSelectIfSingleOption(document.getElementById("selectMonth"), document.getElementById("monthDropdownDisplay"), paymentMonthBySupplier, "formatted_date");
});

// month eka change weddi ekata adala last date eka ganna oni
selectedMonthElement.addEventListener("change", (e) => {
  const selectedMonth = JSON.parse(selectedMonthElement.value).formatted_date;

  const parts = selectedMonth.split("-");
  const year = parseInt(parts[0]); //string walin thiyena nisa
  const monthName = parts[1]; //mnth name eka gnnawa
  //   month name ekata adala no eka gnnawa(Jan = 0, Feb = 1...)
  const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();

  //   select month eke last date eka gnnawa (date eka 0 kiyanne kalin mase last date eka)
  const lastDate = new Date(year, monthIndex + 1, 0);
  // date eka hadagnnawa 2026-01-31 widihata
  const formattedLastDate = lastDate.toISOString().split("T")[0];

  supplierPayable.date = formattedLastDate;
});

// search function
const SearchPaymentDetails = () => {
  if (selectedAgreementType.value == "Floating Rate") {
    loadFloatingRateTable();
    getFloatingRateBookingsTotalPrice();
  } else {
    loadFixedRateTable();
    getFixedRateBookingsTotalPrice();
  }
};
// ========================= end search karana functions =====================




// ======================== load floating Rate  tabel =======================================
//selet karana supplier adlawa payment avalaibale bookings tike price saha amount dispay karawna
const loadFloatingRateTable = () => {
  if ($.fn.dataTable.isDataTable("#supplierPayableTableFloating")) {
    $("#supplierPayableTableFloating").DataTable().clear().destroy();
  }

  bookingDetailsContainer.style.display = "block";
  supplierPayableTableFixContainer.style.display = "none";
  supplierPayableTableFloatingContainer.style.display = "block";

  bookingListWithPriceFlotingRate = getServiceRequest(
    "/supplierpayable/seletedvehicleandmonth?vehicleId=" + JSON.parse(vehicleNoElement.value).id + "&month=" + JSON.parse(selectedMonthElement.value).formatted_date,
  );

  const propertyList = [
    { propertyName: "booking_no", dataType: "string" },
    { propertyName: "date", dataType: "string" },
    { propertyName: "distance", dataType: "string" },
    { propertyName: getFloatingRateAmount, dataType: "function" },
  ];

  dataFillIntoTheTableWithViewBtn(supplierPayableTableBodyFloating, bookingListWithPriceFlotingRate, propertyList, (dataOb) => {
    // For individual bookings, we could potentially show individual booking details
    // But for now, let's keep it consistent or just a log
    console.log("View individual booking", dataOb);
  });

  console.log(bookingListWithPriceFlotingRate);

  // booking id tiken ewata adala bookings tika aragenna .mulinma booking id tika aragena, eeta passe booking details tika gnnawa
  supplierPayable.bookings = bookingListWithPriceFlotingRate.map((booking) => booking.booking_id);

  $("#supplierPayableTableFloating").DataTable({
    dom: "rtip",
    language: {
      search: "_INPUT_",
      searchPlaceholder: "Search...",
    },
    createdRow: function (row, data, dataIndex) {
      $(row).find("td").css({
        "text-align": "center",
        "vertical-align": "middle",
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
};

//booking wise price eka gnnawa
const getFloatingRateAmount = (dataOb) => {
  const bookingPrice = parseFloat(dataOb.supplier_Charge) * parseFloat(dataOb.distance);
  return `<div class="fw-bold">${parseFloat(bookingPrice).toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  })}</div>`;
};

// allbooking price eka gnnawa
const getFloatingRateBookingsTotalPrice = () => {
  totalAmount.innerText = "";
  totalDeduction.innerText = "";
  netAmount.innerText = "";
  // clean karanna oni variable eka
  let totalFloatingRateBookingsPrice = 0;
  let totalDistanceFloatingRate = 0;

  bookingListWithPriceFlotingRate.forEach((booking) => {
    let bookingprice = parseFloat(booking.supplier_Charge) * parseFloat(booking.distance);
    let bookingDistance = parseFloat(booking.distance);
    totalDistanceFloatingRate += bookingDistance;
    totalFloatingRateBookingsPrice += bookingprice;
  });

  // total amount eka view karanawa
  totalAmount.innerText = totalFloatingRateBookingsPrice.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });

  //   fuel cost eka gnnawa select karana vehicel ekata saha date ekara adlawa
  const fuelCost = getServiceRequest(
    "fuelrequest/fuelcostbyvehicleandselectedmonth?vehicleId=" +
    JSON.parse(vehicleNoElement.value).id +
    "&month=" +
    JSON.parse(selectedMonthElement.value).formatted_date,
  );
  const fuelRequestIds = fuelCost.fuel_request_ids; // Fuel request IDs for reference
  // mkd supplier paybele id eka add karanna oni wagema fuel request eke status eka maru karannath oni
  // array ekata push karanwa
  if (fuelRequestIds) {
    supplierPayable.fuelRequests = fuelRequestIds.split(",").map((id) => parseInt(id));
  } else {
    supplierPayable.fuelRequests = [];
  }

  const totalfuelCost = parseFloat(fuelCost.fuel_cost);

  const totaldeduction = totalfuelCost;
  totalDeduction.innerText = totaldeduction.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });

  const netamount = parseFloat(totalFloatingRateBookingsPrice) - parseFloat(totaldeduction);
  netAmount.innerText = netamount.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });

  //   object ekata bine karanwa
  supplierPayable.month = JSON.parse(selectedMonthElement.value).formatted_date;
  supplierPayable.total_distance = totalDistanceFloatingRate;
  supplierPayable.gross_amount = parseFloat(totalFloatingRateBookingsPrice).toFixed(2);
  supplierPayable.net_amount = parseFloat(netamount).toFixed(2);
  supplierPayable.fuel_deduction_amount = parseFloat(totaldeduction).toFixed(2);
  supplierPayable.pending_amount = parseFloat(netamount).toFixed(2);

  // supllier agrrement eka hoyagannawa
  let supplierAgreements = getServiceRequest("/supplieragreement/active");
  const supplierAgreement = supplierAgreements.find((s) => s.vehicle_id.id === JSON.parse(vehicleNoElement.value).id);
  supplierPayable.supplier_agreement_id = supplierAgreement;
  console.log(supplierPayable);
};
// ======================== end load floating Rate  tabel =======================================



// ====================== load fixed rate ========================================================
//selet karana supplier adlawa payment avalaibale bookings tike price saha amount dispay karawna
const loadFixedRateTable = () => {
  if ($.fn.dataTable.isDataTable("#supplierPayableTableFixed")) {
    $("#supplierPayableTableFixed").DataTable().clear().destroy();
  }

  bookingDetailsContainer.style.display = "block";
  supplierPayableTableFixContainer.style.display = "block";
  supplierPayableTableFloatingContainer.style.display = "none";

  bookingListWithPriceFixRate = getServiceRequest(
    "/supplierpayable/seletedvehicleandmonthforfixrate?vehicleId=" +
    JSON.parse(vehicleNoElement.value).id +
    "&month=" +
    JSON.parse(selectedMonthElement.value).formatted_date,
  );

  const propertyList = [
    { propertyName: "agreement_no", dataType: "string" },
    { propertyName: "booking_count", dataType: "string" },
    { propertyName: "package_distance", dataType: "string" },
    { propertyName: getAdditionalKm, dataType: "function" },
    { propertyName: "total_distance", dataType: "string" },
    { propertyName: getAmount, dataType: "function" },
  ];

  dataFillIntoTheTableWithViewBtn(supplierPayableTableBodyFixed, bookingListWithPriceFixRate, propertyList, (dataOb) => {
    console.log("View fixed rate agreement summary", dataOb);
  });

  supplierPayable.bookings = [];

  bookingListWithPriceFixRate.forEach((row) => {
    if (row.booking_ids) {
      // "8,9,10" kiyana string eka comma walin split karanawa
      const idsArray = row.booking_ids.split(",");

      // ["8", "9", "10"] widihata thiyena string tika, number walata convert karala push karanawa
      idsArray.forEach((id) => {
        supplierPayable.bookings.push(parseInt(id));
      });
    }
  });

  $("#supplierPayableTableFixed").DataTable({
    dom: "rtip",
    language: {
      search: "_INPUT_",
      searchPlaceholder: "Search...",
    },
    createdRow: function (row, data, dataIndex) {
      $(row).find("td").css({
        "text-align": "center",
        "vertical-align": "middle",
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
};

const getAdditionalKm = (dataOb) => {
  const totalDistance = parseFloat(dataOb.total_distance);
  const packageDistance = parseFloat(dataOb.package_distance);
  if (totalDistance > packageDistance) {
    return totalDistance - packageDistance + "KM ";
  } else {
    return "-";
  }
};

let totalAmountFixPackage = 0;
let totalDistanceFixPackage = 0;
let agreementNoFixPackage = null;
const getAmount = (dataOb) => {
  agreementNoFixPackage = dataOb.agreement_no;
  totalDistanceFixPackage = parseFloat(dataOb.total_distance);
  const packageDistance = parseFloat(dataOb.package_distance);
  const packagePrice = parseFloat(dataOb.supplier_Charge);

  if (totalDistanceFixPackage > packageDistance) {
    const additionalKm = totalDistanceFixPackage - packageDistance;
    const additionalKMCharge = additionalKm * parseFloat(dataOb.additional_km_charge);
    const totalamount = packagePrice + additionalKMCharge;
    totalAmountFixPackage = totalamount;
    return `<div class="fw-bold">${totalamount.toLocaleString("en-US", {
      style: "currency",
      currency: "LKR",
    })}</div>`;
  } else {
    totalAmountFixPackage = packagePrice;
    return `<div class="fw-bold">${packagePrice.toLocaleString("en-US", {
      style: "currency",
      currency: "LKR",
    })}</div>`;
  }
};

// all bookings price gnnawa fixrate ekata adlawa
const getFixedRateBookingsTotalPrice = () => {
  // total amount eka view karanawa
  totalAmount.innerText = totalAmountFixPackage.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });
  //   fuel cost eka gnnawa select karana vehicel ekata saha date ekara adlawa
  const fuelCost = getServiceRequest(
    "fuelrequest/fuelcostbyvehicleandselectedmonth?vehicleId=" +
    JSON.parse(vehicleNoElement.value).id +
    "&month=" +
    JSON.parse(selectedMonthElement.value).formatted_date,
  );

  const fuelRequestIds = fuelCost.fuel_request_ids; // Fuel request IDs for reference
  // mkd supplier paybele id eka add karanna oni wagema fuel request eke status eka maru karannath oni
  // array ekata push karanwa
  if (fuelRequestIds) {
    supplierPayable.fuelRequests = fuelRequestIds.split(",").map((id) => parseInt(id));
  } else {
    supplierPayable.fuelRequests = [];
  }


  const totalfuelCost = parseFloat(fuelCost.fuel_cost);

  const totaldeduction = totalfuelCost;
  totalDeduction.innerText = totaldeduction.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });

  const netamount = parseFloat(totalAmountFixPackage) - parseFloat(totaldeduction);
  netAmount.innerText = netamount.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });

  //   object ekata bine karanwa
  supplierPayable.month = JSON.parse(selectedMonthElement.value).formatted_date;
  supplierPayable.total_distance = totalDistanceFixPackage;
  supplierPayable.gross_amount = parseFloat(totalAmountFixPackage).toFixed(2);
  supplierPayable.net_amount = parseFloat(netamount).toFixed(2);
  supplierPayable.fuel_deduction_amount = parseFloat(totaldeduction).toFixed(2);
  supplierPayable.pending_amount = parseFloat(netamount).toFixed(2);

  // supllier agrrement eka hoyagannawa
  let supplierAgreements = getServiceRequest("/supplieragreement/active");
  const supplierAgreement = supplierAgreements.find((s) => s.sup_agreement_no === agreementNoFixPackage);
  supplierPayable.supplier_agreement_id = supplierAgreement;
  console.log(supplierPayable);
};
// ========================= end load fixed rate ========================================================


// ========================= generate bacth functions ==================================================
// check form errror function
const checkError = () => {
  let errors = "";

  if (supplierPayable.month == null) {
    errors += "month not selected. <br>";
  }
  if (supplierPayable.total_distance == null) {
    errors += "total distance not calculated. <br>";
  }
  if (supplierPayable.gross_amount == null) {
    errors += "gross amount not calculated. <br>";
  }
  if (supplierPayable.supplier_agreement_id == null) {
    errors += "Agreement not selected. <br>";
  }

  return errors;
};

// create batch button
const createBatchButton = () => {
  // check form error for required element
  // check form error for required element
  let errors = checkError();
  generateBillNo();
  if (errors == "") {
    // errors not exit
    //need to get user confirmation

    let userConfirm = Swal.fire({
      title: "Confirm Batch Submission",
      text: "Are you sure you want to Create this new Batch?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Create Batch",
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
        let postResponse = httpServiceRequest("/supplierpayable/insert", "POST", supplierPayable);

        if (postResponse == "ok") {
          Swal.fire({
            title: "Batch Created!",
            text: "New Batch has been successfully added to the system.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });

          refresh();
          loadSupplierPayableDetailsTable();
        } else {
          Swal.fire({
            title: "Creation Failed",
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
// ======================== end generate bacth functions ==================================================




// ======================== load supplier payable details table ==================================================
// load supplier payable details table eka load karanwa
const loadSupplierPayableDetailsTable = () => {
  if ($.fn.dataTable.isDataTable("#supplierPayableDetailsTable")) {
    $("#supplierPayableDetailsTable").DataTable().clear().destroy();
  }
  supplierPayableList = getServiceRequest("/supplierpayable/alldata");

  const propertyList = [
    { propertyName: "batch_no", dataType: "string" },
    { propertyName: "month", dataType: "string" },
    { propertyName: getTotalDistance, dataType: "function" },
    { propertyName: getGrossAmount, dataType: "function" },
    { propertyName: getNetAmount, dataType: "function" },
    { propertyName: getPaidAmount, dataType: "function" },
    { propertyName: getPendingAmount, dataType: "function" },
    { propertyName: getStatus, dataType: "function" },
  ];

  dataFillIntoTheTableWithViewBtn(supplierPayableDetailsTableBody, supplierPayableList, propertyList, supplierPayableView);

  const table = $("#supplierPayableDetailsTable").DataTable({
    dom: "rtip",
    pageLength: 25,
    language: {
      search: "_INPUT_",
      searchPlaceholder: "Search...",
    },
    createdRow: function (row, data, dataIndex) {
      $(row).find("td").css({
        "text-align": "center",
        "vertical-align": "middle",
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
  document.getElementById("tableSearch").addEventListener("input", function (e) {
    table.search(this.value).draw();
  });

  // Custom Length
  document.getElementById("tableLength").addEventListener("change", function (e) {
    table.page.len(parseInt(this.value)).draw();
  });

  applyPrivileges("Batch Management", "supplierPayableDetailsTable", {
    submit: submitButton,
  });

  table.on("draw.dt", function () {
    applyPrivileges("Batch Management", "supplierPayableDetailsTable", { submit: submitButton });
  });
};

const getTotalDistance = (dataOb) => {
  return parseFloat(dataOb.total_distance).toFixed(2) + " KM";
};

const getGrossAmount = (dataOb) => {
  return `<div class="fw-bold">${dataOb.gross_amount.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  })}</div>`;
};
const getNetAmount = (dataOb) => {
  return `<div class="fw-bold">${dataOb.net_amount.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  })}</div>`;
};
const getPaidAmount = (dataOb) => {
  if (dataOb.paid_amount == null || dataOb.paid_amount == 0) {
    return "-";
  } else {
    return `<div class="fw-bold text-success">${dataOb.paid_amount.toLocaleString("en-US", {
      style: "currency",
      currency: "LKR",
    })}</div>`;
  }
};
const getPendingAmount = (dataOb) => {
  if (dataOb.pending_amount == null || dataOb.pending_amount == 0) {
    return "-";
  } else {
    return `<div class="fw-bold text-danger">${dataOb.pending_amount.toLocaleString("en-US", {
      style: "currency",
      currency: "LKR",
    })}</div>`;
  }
};
const getStatus = (dataOb) => {
  const status = dataOb.supplier_payable_status_id.status;
  if (status === "Settled") {
    return `<span class="status-badge status-active">${status}</span>`;
  } else if (status === "Pending") {
    return `<span class="status-badge status-pending">${status}</span>`;
  } else {
    return `<span class="status-badge status-inactive">${status}</span>`;
  }
};
// ======================= end load supplier payable details table ==================================================



// ========================= generate bill no ==================================================
// generate bill no
const generateBillNo = () => {
  // year eke anthima anka deka gnnawa
  const now = new Date();
  const currentYear = now.getFullYear().toString().slice(-2);
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, "0");
  const prefix = "SPB-" + currentYear + currentMonth;

  //   anthimata add karapu no eka gnnawa
  if (supplierPayableList.length === 0) {
    supplierPayable.batch_no = "SPB-" + prefix + "-000001";
  } else {
    const lastRecord = supplierPayableList[0];
    console.log(lastRecord);
    const lastBillNo = lastRecord.batch_no;
    const parts = lastBillNo.split("-");
    const lastNo = parseInt(parts[2]);
    let newNumber = (lastNo + 1).toString().padStart(6, "0");

    const newBillNo = prefix + "-" + newNumber;

    supplierPayable.batch_no = newBillNo;
  }
};
// ======================== end generate bill no ==================================================




// ======================= supplier payable view & print functionality ==================================================
const supplierPayableView = (dataOb, index) => {

  console.log(dataOb, index);

  // Header Infos
  document.getElementById("textViewBatchNoHeader").innerText = `#${dataOb.batch_no}`;
  document.getElementById("textViewBatchMonth").innerText = dataOb.month;

  const statusSpan = document.getElementById("textViewBatchStatus");
  const status = dataOb.supplier_payable_status_id.status;
  statusSpan.innerText = status.toUpperCase();

  // Set status color based on status
  if (status === "Settled") {
    statusSpan.className = "status-badge status-active";
  } else {
    statusSpan.className = "status-badge status-pending";
  }

  // Supplier Details
  const supplier = dataOb.supplier_agreement_id.supplier_id;
  document.getElementById("textViewSupplierTransport").innerText = supplier.transportname;
  document.getElementById("textViewSupplierName").innerText = supplier.fullname;
  document.getElementById("textViewSupplierAddress").innerText = supplier.address || "No Address Provided";
  document.getElementById("textViewSupplierContact").innerText = supplier.mobileno || "N/A";

  // Batch Agreement Details
  document.getElementById("textViewAgreementNo").innerText = dataOb.supplier_agreement_id.sup_agreement_no;
  document.getElementById("textViewVehicleNo").innerText = dataOb.supplier_agreement_id.vehicle_id.vehicle_no;

  const packageType = dataOb.supplier_agreement_id.package_id.package_type;
  const packageTypeSpan = document.getElementById("textViewPackageType");
  packageTypeSpan.innerText = packageType;

  // Thematic colors for package types
  if (packageType.includes("Fixed")) {
    packageTypeSpan.style.backgroundColor = "rgba(124, 58, 237, 0.1)";
    packageTypeSpan.style.color = "#7c3aed";
  } else {
    packageTypeSpan.style.backgroundColor = "rgba(14, 165, 233, 0.1)";
    packageTypeSpan.style.color = "#0ea5e9";
  }

  // Table Breakdown
  const payableBreakingTableBody = document.getElementById("payableBreakingTableBody");
  payableBreakingTableBody.innerHTML = `
    <tr>
      <td>Standard Batch Settlement for ${dataOb.month}</td>
      <td class="text-center">${dataOb.total_distance} KM</td>
      <td class="text-end text-muted">${dataOb.gross_amount.toLocaleString("en-US", { style: "currency", currency: "LKR" })}</td>
        <td class="text-end text-muted">${(dataOb.fuel_deduction_amount || 0).toLocaleString("en-US", { style: "currency", currency: "LKR" })}</td>
      <td class="text-end fw-bold text-dark">${(dataOb.paid_amount || 0).toLocaleString("en-US", { style: "currency", currency: "LKR" })}</td>
      <td class="text-end text-danger">${(dataOb.pending_amount || 0).toLocaleString("en-US", { style: "currency", currency: "LKR" })}</td>
    </tr>
  `;

  // Summary
  document.getElementById("textViewGrossPayable").innerText = dataOb.gross_amount.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });
  document.getElementById("textViewPendingAmount").innerText = (dataOb.pending_amount || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });

  // $("#supplierPayableViewModal").modal("show");
  openBatchPrintDetail();
};
// print function
const printContent = () => {
  let printContent = document.getElementById("printContent");
  let newWindow = window.open();
  let preview =
    "<html><head><title>Invoice - OKI DOKI</title>" +
    "<link rel='stylesheet' href='/css/supplierPayable.css'>" +
    "<link rel='stylesheet' href='/css/printView.css'>" +
    "<link rel='stylesheet' href='/bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'>" +
    "<style>body { padding: 20px; font-family: 'Rubik', sans-serif; }</style>" +
    "</head><body>" +
    printContent.innerHTML +
    "</body></html>";
  newWindow.document.write(preview);
  setTimeout(() => {
    newWindow.document.close();
    newWindow.print();
    newWindow.close();
  }, 500);
};
// ======================== end of supplier payable view & print functionality ==================================================


// ============================ refresh function ==================================================
// refresh function eka
const refresh = () => {
  supplierPayable = new Object();
  supplierPayable.bookings = new Array();
  supplierPayable.fuelRequests = new Array();

  //   supplier dropdown eka fil karanwa payment thiyena suppliers lagen witharak
  // let supplier = getServiceRequest("/supplier/paymentavailable");
  // dataFilIntoSelect(selectSupplier, "Select Supplier", supplier, "transportname");

  let paymentAvailableVehicles = getServiceRequest("/vehicle/paymentAvailableVehicles")
  dataFilIntoSelect(selectVehicle, "Select Vehicle ", paymentAvailableVehicles, "vehicle_no");

  // value tika clean karanawa
  // selectSupplier.value = "";
  selectVehicle.value = "";
  selectMonth.value = "";
  selectedAgreementType.value = "";

  bookingDetailsContainer.style.display = "none";

  // package type / agreement type auto-select wela hide unoth eeka reset karanwa
  document.getElementById("selectedAgreementType").value = "";
  document.getElementById("selectedAgreementType").style.display = "";
  document.getElementById("selectPackageDisplay").innerText = "";
  document.getElementById("selectPackageDisplay").style.display = "none";

  // month dropdown eka auto-select wela hide unoth eeka reset karanwa
  document.getElementById("selectMonth").value = "";
  document.getElementById("selectMonth").style.display = "";
  document.getElementById("monthDropdownDisplay").innerText = "";
  document.getElementById("monthDropdownDisplay").style.display = "none";
};
// ============================ end refresh function ==================================================


// ======================== export functionality ==================================================
// Export Functionality
const exportTable = (type) => {
  const tableSelector = "#supplierPayableDetailsTable";

  if (type === "excel") {
    exportTableToExcelWithSheetJS(tableSelector, "supplier_payables", {
      sheetName: "SupplierPayables",
    });
  } else if (type === "pdf") {
    exportTableToPdfWithJsPdf(tableSelector, "supplier_payables", {
      title: "Supplier Payables",
    });
  } else if (type === "print") {
    window.print();
  }
};
// ======================== end export functionality ==================================================




// ===================== overlay view functions =========================
const openBatchPrintDetail = () => {
  toggleView("batchPrintPreviewOverlay", true);
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.style.display = "";
    backBtn.onclick = () => {
      closeBatchPrintDetail();
    };
  }
};

const closeBatchPrintDetail = () => {
  toggleView("batchPrintPreviewOverlay", false);
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.style.display = "none";

  }
};
// ==================== end overlay view functions =========================

// print view ekedi slide karanawa
// document.addEventListener('DOMContentLoaded', function () {
//   var overlay = document.getElementById('main');
//   var openBtn = document.getElementById('openBtn');
//   var closeBtn = document.getElementById('closeBtn');

//   if (openBtn) {
//     openBtn.addEventListener('click', function () {
//       overlay.classList.add('open');
//       openBtn.style.visibility = "hidden";
//       var printButtonCol = document.getElementById('printButtonCol');
//       if (printButtonCol) {
//         printButtonCol.style.display = "none";
//       }
//     });
//   }

//   if (closeBtn) {
//     closeBtn.addEventListener('click', function () {
//       overlay.classList.remove('open');
//       if (openBtn) {
//         openBtn.style.visibility = "visible";
//       }
//       var printButtonCol = document.getElementById('printButtonCol');
//       if (printButtonCol) {
//         printButtonCol.style.display = "block";
//       }
//     });
//   }
// });

//view overalyy details
// const openBatchPrintPanel = () => {
//   document.getElementById("main").classList.add("open");
// };

// const closeBatchPrintPanel = () => {
//   document.getElementById("main").classList.remove("open");
// };