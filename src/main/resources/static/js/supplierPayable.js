window.addEventListener("load", function () {
  refresh();
  loadSupplierPayableDetailsTable();
});

// refresh function eka
const refresh = () => {
  supplierPayable = new Object();

  //   supplier dropdown eka fil karanwa payment thiyena suppliers lagen witharak
  let supplier = getServiceRequest("/supplier/paymentavailable");
  dataFilIntoSelect(selectSupplier, "Select Supplier", supplier, "transportname");

  // value tika clean karanawa
  selectSupplier.value = "";
  selectVehicle.value = "";
  selectMonth.value = "";
  selectedAgreementType.value = "";

  bookingDetailsContainer.style.display = "none";
};

// supplier select kalama eyata adala vehicle tika enna oni
const transportNameElement = document.getElementById("selectSupplier");
transportNameElement.addEventListener("change", (e) => {
  let transportName = JSON.parse(transportNameElement.value);

  // payment thiyena vehicel  witharai ,ethanata enna oni
  let vehicleBySupplier = getServiceRequest("/vehicle/paymentAvailableVehicles?supplierId=" + transportName.id);
  dataFilIntoSelect(selectVehicle, "Select Vehicle ", vehicleBySupplier, "vehicle_no");
});

let supplierAgreements = getServiceRequest("/supplieragreement/alldata");
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
  } else if (packageType === "Floating Rate") {
    selectedAgreementType.value = "Floating Rate";
  } else {
    selectedAgreementType.value = "no available";
  }

  let paymentMonthBySupplier = getServiceRequest("/booking/supplierpaymentmonth?vehicleid=" + vehicleNo.id);
  dataFilIntoSelect(selectMonth, "Select Month ", paymentMonthBySupplier, "formatted_date");
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

// -------------------------floating Rate-------------------------------------------------------
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
  supplierPayable.total_amount = parseFloat(totalFloatingRateBookingsPrice).toFixed(2);

  // supllier agrrement eka hoyagannawa
  let supplierAgreements = getServiceRequest("/supplieragreement/alldata");
  const supplierAgreement = supplierAgreements.find((s) => s.vehicle_id.id === JSON.parse(vehicleNoElement.value).id);
  supplierPayable.supplier_agreement_id = supplierAgreement;
  console.log(supplierPayable);
};

// -------------------------fixed rate--------------------------------------------
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
      <td class="text-end text-muted">${dataOb.total_amount.toLocaleString("en-US", { style: "currency", currency: "LKR" })}</td>
      <td class="text-end fw-bold text-dark">${(dataOb.paid_amount || 0).toLocaleString("en-US", { style: "currency", currency: "LKR" })}</td>
      <td class="text-end text-danger">${(dataOb.pending_amount || 0).toLocaleString("en-US", { style: "currency", currency: "LKR" })}</td>
    </tr>
  `;

  // Summary
  document.getElementById("textViewGrossPayable").innerText = dataOb.total_amount.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });
  document.getElementById("textViewPendingAmount").innerText = (dataOb.pending_amount || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });

  $("#supplierPayableViewModal").modal("show");
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
  supplierPayable.total_amount = parseFloat(totalAmountFixPackage).toFixed(2);
  supplierPayable.pending_amount = parseFloat(totalAmountFixPackage).toFixed(2);

  // supllier agrrement eka hoyagannawa
  let supplierAgreements = getServiceRequest("/supplieragreement/alldata");
  const supplierAgreement = supplierAgreements.find((s) => s.sup_agreement_no === agreementNoFixPackage);
  supplierPayable.supplier_agreement_id = supplierAgreement;
};

// check form errror function
const checkError = () => {
  let errors = "";

  if (supplierPayable.month == null) {
    errors += "month not selected. <br>";
  }
  if (supplierPayable.total_distance == null) {
    errors += "total distance not calculated. <br>";
  }
  if (supplierPayable.total_amount == null) {
    errors += "total amount not calculated. <br>";
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
    { propertyName: getTotalAmount, dataType: "function" },
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
};

const getTotalDistance = (dataOb) => {
  return dataOb.total_distance + " KM";
};

const getTotalAmount = (dataOb) => {
  return `<div class="fw-bold">${dataOb.total_amount.toLocaleString("en-US", {
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
    return `<span class="status-badge status-pending">${status}</span>`;
  }
};

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

// showTableLoading function eka
const showTableLoading = (tableId, show) => {
  const tableContainer = document.getElementById(tableId).closest(".table-responsive");
  const overlay = tableContainer.querySelector(".table-loading-overlay");
  if (overlay) {
    if (show) {
      overlay.removeAttribute("hidden");
      overlay.style.display = "flex";
    } else {
      overlay.style.display = "none";
    }
  }
};
// print function
const printContent = (id) => {
  const printArea = document.getElementById(id);
  const newWindow = window.open("", "_blank");

  newWindow.document.write(`
        <html>
            <head>
                <title>Print Summary</title>
                <link rel="stylesheet" href="/css/invoice.css">
                <link rel="stylesheet" href="/bootstrap/bootstrap-5.2.3/css/bootstrap.min.css">
                <style>
                    @media print {
                        .btn-cancel, .btn-submit, .btn-2, .btn-1, .modal-footer { display: none !important; }
                        .invoice-preview-wrapper { box-shadow: none !important; border: none !important; margin: 0 !important; padding: 20px !important; }
                        body { background: white !important; }
                    }
                </style>
            </head>
            <body>
                <div class="p-4">
                    ${printArea.innerHTML}
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
