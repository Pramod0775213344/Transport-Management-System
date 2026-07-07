window.addEventListener("load", function () {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      refreshCalculateForm();
      loadInvoiceViewTable();
    } catch (e) {
      console.error("Error during invoice page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);
});

//invoice table eka load karanwaa
const loadInvoiceTable = () => {
  let selected = document.querySelector('input[name="package-type"]:checked');
  let selectMonth = document.getElementById("monthDropdown");

  if (selectMonth.value == null || (selectMonth.value === "" && selectCustomer.value == null) || selectCustomer.value === "") {
    Swal.fire({
      title: "Warning",
      text: "Please select a Customer ,package type and Month before the calculate .",
      icon: "info",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    return;
  }

  bookingList = getServiceRequest(
    "/booking/forinvoiceui?customerid=" +
      JSON.parse(selectCustomer.value).id +
      "&packageType=" +
      selected.value +
      "&month=" +
      JSON.parse(selectMonth.value).formatted_date,
  );
  console.log(bookingList);

  // booking list eka group karala gannwa agreement id eka anuwa saha vehicle type eka anuwa
  const groupedData = {};
  bookingList.forEach((booking) => {
    const key = `${booking.customer_agreement_id.id}-${booking.vehicleType}`;
    if (!groupedData[key]) {
      groupedData[key] = {
        cus_agreement_no: booking.customer_agreement_id.cus_agreement_no,
        vehicleType: booking.vehicle_type_id.name,
        totalDistance: 0,
        packageType: booking.customer_agreement_id.package_id.package_type,
        customerCharge: booking.customer_agreement_id.package_id.package_charge_cus,
        packageDistance: booking.customer_agreement_id.package_id.distance,
        additionalKmCharge: booking.customer_agreement_id.package_id.additinal_km_charge_cus,
      };
    }
    groupedData[key].totalDistance += parseFloat(booking.distance);
    // booking array ekata push karanawa
    invoice.bookings.push(booking);
  });

  // grouped data eka array ekakata parase karanwa
  invoiceDetailsArray = Object.values(groupedData);
  console.log(invoiceDetailsArray);

  // arraye lenght eka 0 nam msg eka display karanwa
  if (bookingList.length <= 0) {
    Swal.fire({
      title: "No Data Found",
      text: "No invoice records found for the selected criteria.",
      icon: "info",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    document.getElementById("bookingCountCards").style.display = "none";
    document.getElementById("printViewInvoiceForm").style.display = "none";
    document.getElementById("invoiceContainer").style.display = "";
    refreshCalculateForm();
    return;
  } else {
    propertyList = [
      { propertyName: "cus_agreement_no", dataType: "string" },
      {
        propertyName: "vehicleType",
        dataType: "string",
      },
      { propertyName: "totalDistance", dataType: "string" },
      { propertyName: getAmount, dataType: "function" },
    ];

    // total amount eka ganna function eka call karanwa
    getTotalOfAll(invoiceDetailsArray);
    let confirmCount = 0; // confirm booking count eka
    let pendingCount = 0; // pening booking count eka
    let totalCount = 0; // mulu booking count ea
    let confirmBookings = []; // confirm booking list eka
    pendingBookings = []; // pending booking list eka.error waladi mekath check karanwa.meka o wune naththna generate karanna ba invoice eka
    bookingList.forEach((booking) => {
      if (booking.booking_status_id.id === 6) {
        confirmCount++;
        confirmBookings.push(booking);
      } else {
        pendingCount++;
        pendingBookings.push(booking);
      }

      // total count eka gannawa
      totalCount++;
    });

    totalCountId.innerText = totalCount;
    confirmCountId.innerText = confirmCount;
    pendingCountId.innerText = pendingCount;

    propertyListBookings = [
      { propertyName: "booking_no", dataType: "string" },
      { propertyName: getPickupLoaction, dataType: "function" },
      { propertyName: getDeliveryLocation, dataType: "function" },
      { propertyName: getVehicle, dataType: "function" },
      { propertyName: getBookingDistance, dataType: "function" },
      { propertyName: getBookingStatus, dataType: "function" },
    ];

    if ($.fn.dataTable.isDataTable("#confirmBookingTable")) {
      $("#confirmBookingTable").DataTable().destroy();
    }
    if ($.fn.dataTable.isDataTable("#pendingBookingTable")) {
      $("#pendingBookingTable").DataTable().destroy();
    }

    dataFillIntoTheReportTable(confirmBookingTableBody, confirmBookings, propertyListBookings);

    dataFillIntoTheReportTable(pendingBookingTableBody, pendingBookings, propertyListBookings);

    const confirmTable = $("#confirmBookingTable").DataTable({
      dom: "rtip",
      pageLength: 10,
    });

    const pendingTable = $("#pendingBookingTable").DataTable({
      dom: "rtip",
      pageLength: 10,
    });

    // Modal Search Handlers
    $("#confirmTableSearch")
      .off("keyup")
      .on("keyup", function () {
        confirmTable.search(this.value).draw();
      });
    $("#pendingTableSearch")
      .off("keyup")
      .on("keyup", function () {
        pendingTable.search(this.value).draw();
      });

    // Modal Length Handlers
    $("#confirmTableLength")
      .off("change")
      .on("change", function () {
        confirmTable.page.len(this.value).draw();
      });
    $("#pendingTableLength")
      .off("change")
      .on("change", function () {
        pendingTable.page.len(this.value).draw();
      });

    document.getElementById("bookingCountCards").style.display = "block";
    getPrintPreviewInvoice();
  }
};

const getPickupLoaction = (dataOb) => {
  return dataOb.pickup_locations_id.name;
};

const getDeliveryLocation = (dataOb) => {
  return dataOb.delivery_locations_id.name;
};

const getVehicle = (dataOb) => {
  if (dataOb.vehicle_id === null) {
    return "-";
  } else {
    return dataOb.vehicle_id.vehicle_no;
  }
};

const getBookingDistance = (dataOb) => {
  return dataOb.distance;
};
const getBookingStatus = (dataOb) => {
  return dataOb.booking_status_id.status;
};
// get total amount of each agreemnt
const getAmount = (dataOb) => {
  // package price ekai totala diostance tikai
  const packagePrice = parseInt(dataOb.customerCharge);
  const totalDistance = parseInt(dataOb.totalDistance);

  if (dataOb.packageType == "Floating Rate") {
    // totala distance eka 2 eken wadi karana oni.mkd api up and down dekatama paya karanwa
    totalAmount = (packagePrice * (totalDistance * 2)).toLocaleString("en-US", {
      style: "currency",
      currency: "LKR",
    });
  } else {
    // distance eka int walata parase karagannawa
    const packageDistance = parseInt(dataOb.packageDistance);
    const additionalKmCharge = parseInt(dataOb.additionalKmCharge);

    if (totalDistance > packageDistance) {
      const additionalKm = totalDistance - packageDistance;
      const additionalKmChargeAmount = additionalKmCharge * additionalKm;

      totalAmount = (additionalKmChargeAmount + packagePrice).toLocaleString("en-US", {
        style: "currency",
        currency: "LKR",
      });
    } else if (totalDistance <= packageDistance) {
      totalAmount = packagePrice.toLocaleString("en-US", {
        style: "currency",
        currency: "LKR",
      });
    }
  }

  return totalAmount;
};

// getAmount eken en pricese tika okkoma ekathu karanwa
const getTotalOfAll = (dataList) => {
  let total = 0;

  dataList.forEach((item) => {
    // amount eka gnnaawa format karaganna oni
    const formatted = getAmount(item);

    // curruncy format eka ayin karala number format ekata gannwa .ekathu karanna oni nisa
    const number = Number(formatted.replace(/[^0-9.-]+/g, ""));

    total += number;
  });

  // subtotal ekata inner karanawa total eka
  document.getElementById("textSubTotal").innerText = total.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });

  //     tax eka calculate karanwa 18% akata
  const tax = total * 0.08;
  document.getElementById("textTax").innerText = tax.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });

  //    grand total eka calculate karanwa
  const grandTotal = total + tax;
  document.getElementById("textTotalAmount").innerText = grandTotal.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });
};

// // dropdown ekata cuurunt month eka nathuwa anith tika gannawa wenakan month tika fill karanwaaa
// const getMonth = () => {
//   // Get the current date
//   const today = new Date()
//   const currentMonth = today.getMonth() // 0 = January, 11 = December
//   const currentYear = today.getFullYear()
//
//   // Get the dropdown element
//   const dropdown = document.getElementById('monthDropdown')
//
//   // Loop through months from January to current month
//   for (let i = 0; i < currentMonth; i++) {
//     // Get month name (e.g., "January", "February", etc.)
//     const monthName = new Date(currentYear, i).toLocaleString('default', {
//       month: 'long',
//     })
//
//     // Create an option element
//     const option = document.createElement('option')
//     option.value = `${monthName}`
//     option.text = `${monthName}` // display text
//
//     // Add to dropdown
//     dropdown.appendChild(option)
//   }
// }

// customer eka change karaddi ekata adala payement availabe month tika gannawa month dropdown ekata fill karanwa
const customerElement = document.getElementById("selectCustomer");
customerElement.addEventListener("change", (event) => {
  if (customerElement.value === "") return;
  const selectedCustomer = JSON.parse(customerElement.value);

  let paymentMonthByCustomer = getServiceRequest("/booking/customerpaymentmonth?customerid=" + selectedCustomer.id);
  dataFilIntoSelect(document.getElementById("monthDropdown"), "Select Month ", paymentMonthByCustomer, "formatted_date");
});

// month eka change weddi ekata adala last date eka ganna oni
const selectedMonthElement = document.getElementById("monthDropdown");
selectedMonthElement.addEventListener("change", (e) => {
  const selectedMonth = JSON.parse(selectedMonthElement.value).formatted_date;
  console.log(selectedMonth);
  const parts = selectedMonth.split("-");
  const year = parseInt(parts[0]); //string walin thiyena nisa
  const monthName = parts[1]; //mnth name eka gnnawa
  //   month name ekata adala no eka gnnawa(Jan = 0, Feb = 1...)
  const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();

  //   select month eke last date eka gnnawa (date eka 0 kiyanne kalin mase last date eka)
  const lastDate = new Date(year, monthIndex + 1, 0);
  // date eka hadagnnawa 2026-01-31 widihata
  const formattedLastDate = lastDate.toISOString().split("T")[0];

  invoice.invoice_date = formattedLastDate;
});

// print preivie incoice modal ekata data fill karanwa
getPrintPreviewInvoice = () => {
  // invoice no eka generate karan function eka
  const invoiceNo = createInvoiceNo();

  // customer name eka fill karanwa
  const selectedCustomer = JSON.parse(selectCustomer.value);
  textCustomerName.innerText = selectedCustomer.company_name;
  textCustomerAddress.innerText = selectedCustomer.company_address;
  textCustomerContact.innerText = selectedCustomer.direct_telephone_no;
  textCustomerEmail.innerText = selectedCustomer.direct_email_no;

  // invoice no eka fill karanwa
  textInvoiceNo.innerText = invoiceNo;

  // date eka fill karanwa
  const invoiceDate = new Date();
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedInvoiceDate = invoiceDate.toLocaleDateString(undefined, options);
  textInvoiceDate.innerText = formattedInvoiceDate;

  // due date eka fill karanwa (10 days later)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 10);
  const formattedDueDate = dueDate.toLocaleDateString(undefined, options);
  textDueDate.innerText = formattedDueDate;

  const subTotalText = document.getElementById("textSubTotal").innerText;
  const taxText = document.getElementById("textTax").innerText;
  const totalAmountText = document.getElementById("textTotalAmount").innerText;

  document.getElementById("textPrintSubTotal").innerText = subTotalText;
  document.getElementById("textPrintTax").innerText = taxText;
  document.getElementById("textPrintTotalAmount").innerText = totalAmountText;
  document.getElementById("textPrintTotalAmount_Side").innerText = totalAmountText;

  // table data tika print preview table ekata danawa
  const printTblBody = document.getElementById("printInvoiceTableBody");
  printTblBody.innerHTML = "";
  // table ekata data fill karanawaa
  dataFillIntoTheReportTable(printTblBody, invoiceDetailsArray, propertyList);

  // invoice object eka fill karanwa
  const chooseMonth = document.getElementById("monthDropdown");
  invoice.invoice_month = JSON.parse(chooseMonth.value).formatted_date;
  invoice.invoice_subtotal = parseFloat(subTotalText.replace(/[^0-9.-]+/g, ""));
  invoice.invoice_tax = parseFloat(taxText.replace(/[^0-9.-]+/g, ""));
  invoice.invoice_total = parseFloat(totalAmountText.replace(/[^0-9.-]+/g, ""));
  invoice.incoice_issue_date = new Date(invoiceDate).toISOString().split("T")[0];
  invoice.invoice_due_date = new Date(dueDate).toISOString().split("T")[0];

  console.log(invoice);

  document.getElementById("printViewInvoiceForm").style.display = "";
  document.getElementById("invoiceContainer").style.display = "none";
};

// print invoice form
const printInvoiceForm = () => {
  let printContent = document.getElementById("printViewInvoiceForm");

  // modal eka athule thiyena ekada balanawa (view karaddi)
  const modalContent = document.getElementById("invoicePreviewModalContent");
  if ($("#invoicePreviewModal").is(":visible") && modalContent.innerHTML.trim() !== "") {
    printContent = modalContent;
  }

  let newWindow = window.open();
  let preview =
    "<html><head><title>Invoice - OKI DOKI</title>" +
    "<link rel='stylesheet' href='/css/invoice.css'>" +
    "<link rel='stylesheet' href='/bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'>" +
    "<style>body { padding: 20px; font-family: 'Public Sans', sans-serif; }</style>" +
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

const refresh = () => {
  // clear invoice table body
  invoiceTableBody.innerHTML = "";
  // clear subtotal, tax, total amount
  textSubTotal.innerText = "";
  textTax.innerText = "";
  textTotalAmount.innerText = "";
};

const createInvoiceNo = () => {
  // get the last invoice from the payments list
  // Ex:- INV-2025-0000001
  console.log(paymentsList);
  if (paymentsList.length === 0) {
    // payment details mukyth naththan set karanwa invoice number ekata INV-2025-0000001
    invoice.invoice_no = `INV-${new Date().getFullYear()}-000001`;
    console.log(invoice.invoice_no);
    return invoice.invoice_no;
  } else {
    // paymentsList eka front end ekata enne desinding widihata.eka nisa previous invoice number eka thiyenne 0 index eke
    let previousInvoice = paymentsList[0];
    console.log(previousInvoice);
    const previousInvoiceNo = previousInvoice.invoice_no;
    console.log(previousInvoiceNo);

    let numberPartOfInvoiceNo = parseInt(previousInvoiceNo.slice(-6));
    console.log(numberPartOfInvoiceNo);
    // increment the number part by 1
    numberPartOfInvoiceNo += 1;
    // create the new invoice number
    const newInvoiceNo = `INV-${new Date().getFullYear()}-${numberPartOfInvoiceNo.toString().padStart(6, "0")}`;
    // set the new invoice number to the payment object
    invoice.invoice_no = newInvoiceNo;
    console.log(newInvoiceNo);
    return newInvoiceNo;
  }
};

// calculate form eka refresh karanwa(invoice generate karaddi form eka reset karanwa saha data tika clear karanwa)
const refreshCalculateForm = () => {
  invoice = new Object();
  invoice.bookings = new Array();

  setDefault([selectCustomer]);

  if ($.fn.dataTable.isDataTable("#invoiceTable")) {
    $("#invoiceTable").DataTable().clear().destroy();
  }
  // invoice no eka generate karan function eka
  paymentsList = getServiceRequest("invoice/alldata");

  // let compnayNames = getServiceRequest("/customer/bycustomerstatus");
  // payment availbale customer names tika select box ekata fill karanwa
  let compnayNames = getServiceRequest("/customer/paymentavailcustomer");
  dataFilIntoSelect(selectCustomer, "Select Company Name", compnayNames, "company_name");

  document.getElementById("totalCountId").innerText = 0;
  document.getElementById("confirmCountId").innerText = 0;
  document.getElementById("pendingCountId").innerText = 0;
  document.getElementById("monthDropdown").value = "";
  document.getElementById("textSubTotal").innerText = "Not Available";
  document.getElementById("textTax").innerText = "Not Available";
  document.getElementById("textTotalAmount").innerText = "Not Available";
  document.getElementById("bookingCountCards").style.display = "none";
  document.getElementById("printViewInvoiceForm").style.display = "none";
  document.getElementById("invoiceContainer").style.display = "";

  // table eka initialize karanawa
  $("#invoiceTable").dataTable({
    paging: false,
    info: false,
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
};

// check errors
const checkErrors = () => {
  let errors = [];

  if (invoice.customer_id == null) {
    errors = errors + "Please select a customer.";
  }

  if (invoiceTableBody.innerHTML.trim() === "" || invoice.bookings.length === 0) {
    errors = errors + "Service table is empty. Please Calculate the Amount.";
  }
  if (pendingBookings.length !== 0) {
    errors = errors + `Unable to generate invoice. You have ${pendingBookings.length} pending booking(s) remaining.`;
  }

  return errors;
};

//invoice Submit button
const createInvoice = () => {
  console.log(invoice);
  let errors = checkErrors();
  if (errors == "") {
    let userConfirm = Swal.fire({
      title: "Confirm Invoice Creation",
      text: "Are you sure you want to create and save this invoice?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Create Invoice",
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
        let postResponse = httpServiceRequest("/invoice/insert", "POST", invoice);
        if (postResponse == "ok") {
          Swal.fire({
            title: "Invoice Created!",
            text: "New invoice has been successfully generated.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          // invoice eka print karanwa
          printInvoiceForm();
          refreshCalculateForm();
          loadInvoiceViewTable();
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
          text: "Invoice creation cancelled!",
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
      title: "Invoice Generate Not Success",
      html: `<div class="text-start">${errors + "<br>"}</div>`,
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

const loadInvoiceViewTable = () => {

   if ($.fn.dataTable.isDataTable("#invoiceViewTable")) {
      $("#invoiceViewTable").DataTable().destroy();
    }
  invoiceList = getServiceRequest("/invoice/alldata");

  properties = [
    { propertyName: "invoice_no", dataType: "string" },
    { propertyName: getCustomer, dataType: "function" },
    { propertyName: getInvoiceTotal, dataType: "function" },
    { propertyName: getPaidAmount, dataType: "function" },
    { propertyName: "invoice_month", dataType: "string" },
    { propertyName: "incoice_issue_date", dataType: "string" },
    { propertyName: getInvoiceStatus, dataType: "function" },
  ];

  dataFillIntoTheTableWithViewBtn(invoiceViewTableBody, invoiceList, properties, invoiceView);

  const table = $("#invoiceViewTable").DataTable({
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

  applyPrivileges("Invoice Management", "invoiceViewTable", {
    add: addButton,

  });

  table.on("draw.dt", function () {
    applyPrivileges("Invoice Management", "invoiceViewTable", { add: addButton });
  });
};

const getCustomer = (dataOb) => {
  if (dataOb.bookings && dataOb.bookings.length > 0) {
    return dataOb.bookings[0].customer_id.company_name;
  }
  return "N/A";
};

const getInvoiceTotal = (dataOb) => {
  return `<div class="fw-bold">${parseFloat(dataOb.invoice_total).toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  })}</div>`;
};

const getPaidAmount = (dataOb) => {
  return `<div class="fw-bold text-success">${parseFloat(dataOb.paid_amount || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  })}</div>`;
};

const getInvoiceStatus = (dataOb) => {
  if (dataOb.invoice_status_id.status == "Paid") {
    return `<span class="status-badge status-active"><span class="dot"></span>${dataOb.invoice_status_id.status}</span>`;
  } else if (dataOb.invoice_status_id.status == "Pending") {
    return `<span class="status-badge status-pending"><span class="dot"></span>${dataOb.invoice_status_id.status}</span>`;
  } else {
    return `<span class="status-badge status-inactive"><span class="dot"></span>${dataOb.invoice_status_id.status}</span>`;
  }
};

// excel walata export karanwa invoice table eka
const exportInvoiceTableAsExcel = () => {
  if (typeof XLSX === "undefined") {
    Swal.fire({
      icon: "error",
      title: "Export Failed",
      text: "SheetJS library is not loaded.",
      timer: 2000,
      showConfirmButton: false,
    });
    return;
  }

  const tableElement = document.getElementById("invoiceViewTable");
  if (!tableElement) {
    return;
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.table_to_sheet(tableElement, { raw: true });

  // Remove the actions column from exported content.
  if (worksheet["!ref"]) {
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    if (range.e.c > 0) {
      for (let row = range.s.r; row <= range.e.r; row += 1) {
        const actionCell = XLSX.utils.encode_cell({ r: row, c: range.e.c });
        delete worksheet[actionCell];
      }
      range.e.c -= 1;
      worksheet["!ref"] = XLSX.utils.encode_range(range);
    }
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  XLSX.writeFile(workbook, `invoices_${yyyy}${mm}${dd}.xlsx`);
};

// Export Functionality
const exportTable = (type) => {
  if (type === "excel") {
    exportInvoiceTableAsExcel();
  } else if (type === "pdf") {
    exportTableToPdfWithJsPdf("#invoiceViewTable", "invoices", { title: "Invoices" });
  } else if (type === "print") {
    window.print();
  }
};

// invoice detail view
const invoiceView = (dataOb) => {
  console.log("Viewing Invoice", dataOb);

  // Set Modal Title & Subtitle
  document.getElementById("previewModalTitle").innerText = "Invoice Details";
  document.getElementById("previewModalSubtitle").innerText = "Currently viewing a previously generated invoice.";

  // Dynamic Button Visibility
  document.getElementById("printInvoiceBtn").style.display = "block";

  // Header Info
  document.getElementById("textInvoiceNo").innerText = dataOb.invoice_no;
  document.getElementById("textInvoiceDate").innerText = dateformat(dataOb.incoice_issue_date);
  document.getElementById("textDueDate").innerText = dateformat(dataOb.invoice_due_date);

  // Customer Info
  const customer = dataOb.bookings[0].customer_id;
  document.getElementById("textCustomerName").innerText = customer.company_name;
  document.getElementById("textCustomerAddress").innerText = customer.company_address;
  document.getElementById("textCustomerContact").innerText = customer.direct_telephone_no;
  document.getElementById("textCustomerEmail").innerText = customer.direct_email_no;

  // Table Data - Grouping bookings for display
  const groupedData = {};
  dataOb.bookings.forEach((booking) => {
    const key = `${booking.customer_agreement_id.id}-${booking.vehicle_type_id.id}`;
    if (!groupedData[key]) {
      groupedData[key] = {
        cus_agreement_no: booking.customer_agreement_id.cus_agreement_no,
        vehicleType: booking.vehicle_type_id.name,
        totalDistance: 0,
        packageType: booking.customer_agreement_id.package_id.package_type,
        customerCharge: booking.customer_agreement_id.package_id.package_charge_cus,
        packageDistance: booking.customer_agreement_id.package_id.distance,
        additionalKmCharge: booking.customer_agreement_id.package_id.additinal_km_charge_cus,
      };
    }
    groupedData[key].totalDistance += parseFloat(booking.distance);
  });

  const invoiceDetailsArrayView = Object.values(groupedData);

  const propertyListInvoice = [
    { propertyName: "cus_agreement_no", dataType: "string" },
    { propertyName: "vehicleType", dataType: "string" },
    {
      propertyName: (d) => d.totalDistance + " KM",
      dataType: "function",
    },
    { propertyName: getAmount, dataType: "function" },
  ];

  const printTblBody = document.getElementById("printInvoiceTableBody");
  printTblBody.innerHTML = "";
  dataFillIntoTheReportTable(printTblBody, invoiceDetailsArrayView, propertyListInvoice);

  // Summary
  document.getElementById("textPrintSubTotal").innerText = parseFloat(dataOb.invoice_subtotal).toLocaleString("en-US", { style: "currency", currency: "LKR" });
  document.getElementById("textPrintTax").innerText = parseFloat(dataOb.invoice_tax).toLocaleString("en-US", { style: "currency", currency: "LKR" });
  document.getElementById("textPrintTotalAmount").innerText = parseFloat(dataOb.invoice_total).toLocaleString("en-US", { style: "currency", currency: "LKR" });
  document.getElementById("textPrintTotalAmount_Side").innerText = parseFloat(dataOb.invoice_total).toLocaleString("en-US", { style: "currency", currency: "LKR" });

  // Inject the form content into the modal
  const formContent = document.getElementById("printViewInvoiceForm").innerHTML;
  document.getElementById("invoicePreviewModalContent").innerHTML = formContent;

  $("#invoicePreviewModal").modal("show");
};

const openInvoiceDetail = () => {
  toggleView("invoice-detail-overlay", true);
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.style.display = "block";
    backBtn.onclick = () => {
      closeInvoiceDetail();
    };
  }
};

const closeInvoiceDetail = () => {
  toggleView("invoice-detail-overlay", false);
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.style.display = "none";
  }
};
