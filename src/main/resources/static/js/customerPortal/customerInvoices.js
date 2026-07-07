window.addEventListener("load", function () {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      loadInvoiceViewTable();
    } catch (e) {
      console.error("Error during invoice page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);
});


const loadInvoiceViewTable = () => {
    console.log("Loading invoice view table...");

   if ($.fn.dataTable.isDataTable("#customerInvoicesTable")) {
      $("#customerInvoicesTable").DataTable().destroy();
    }
  invoiceList = getServiceRequest("/invoice/customerinvoices");

  properties = [
    { propertyName: "invoice_no", dataType: "string" },
    { propertyName: getInvoiceTotal, dataType: "function" },
    { propertyName: getPaidAmount, dataType: "function" },
    { propertyName: "invoice_month", dataType: "string" },
    { propertyName: "incoice_issue_date", dataType: "string" },
    { propertyName: getInvoiceStatus, dataType: "function" },
  ];

  dataFillIntoTheTableWithViewBtn(customerInvoicesTableBody, invoiceList, properties, invoiceView);

  const table = $("#customerInvoicesTable").DataTable({
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

};

const getInvoicePreviewStyleMarkup = () => {
  return '<link rel="stylesheet" href="/css/invoice.css">';
};

// Ensure the invoice stylesheet is loaded into the current page head
const ensureInvoiceStylesLoaded = () => {
  try {
    const href = '/css/invoice.css';
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  } catch (e) {
    console.error('Failed to ensure invoice stylesheet:', e);
  }
};

const showInvoiceTableSection = () => {
  const tableSection = document.getElementById("customerInvoicesTableSection");
  const previewSection = document.getElementById("invoicePreviewSection");

  if (tableSection) {
    tableSection.classList.remove("d-none");
  }
  if (previewSection) {
    previewSection.classList.add("d-none");
  }
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

// invoice detail view
const invoiceView = (dataOb) => {
  console.log("Viewing Invoice", dataOb);

  const printForm = document.getElementById("printViewInvoiceForm");
  const tableSection = document.getElementById("customerInvoicesTableSection");
  const previewSection = document.getElementById("invoicePreviewSection");

  if (!printForm || !tableSection || !previewSection) {
    console.error("Invoice preview markup is missing on the customer invoices page.");
    return;
  }

  // Ensure invoice CSS is available on this page
  ensureInvoiceStylesLoaded();

  tableSection.classList.add("d-none");
  previewSection.classList.remove("d-none");

  // Header Info
  document.getElementById("textInvoiceNo").innerText = dataOb.invoice_no || "N/A";
  document.getElementById("textInvoiceDate").innerText = dataOb.incoice_issue_date ? dateformat(dataOb.incoice_issue_date) : "N/A";
  document.getElementById("textDueDate").innerText = dataOb.invoice_due_date ? dateformat(dataOb.invoice_due_date) : "N/A";

  // Customer Info
  const customer = dataOb.bookings && dataOb.bookings.length > 0 ? dataOb.bookings[0].customer_id : null;
  document.getElementById("textCustomerName").innerText = customer?.company_name || "N/A";
  document.getElementById("textCustomerAddress").innerText = customer?.company_address || "N/A";
  document.getElementById("textCustomerContact").innerText = customer?.direct_telephone_no || "N/A";
  document.getElementById("textCustomerEmail").innerText = customer?.direct_email_no || "N/A";

  // Table Data - Grouping bookings for display
  const groupedData = {};
  (dataOb.bookings || []).forEach((booking) => {
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
  const subtotal = parseFloat(dataOb.invoice_subtotal || 0).toLocaleString("en-US", { style: "currency", currency: "LKR" });
  const tax = parseFloat(dataOb.invoice_tax || 0).toLocaleString("en-US", { style: "currency", currency: "LKR" });
  const total = parseFloat(dataOb.invoice_total || 0).toLocaleString("en-US", { style: "currency", currency: "LKR" });
  document.getElementById("textPrintSubTotal").innerText = subtotal;
  document.getElementById("textPrintTax").innerText = tax;
  document.getElementById("textPrintTotalAmount").innerText = total;
  document.getElementById("textPrintTotalAmount_Side").innerText = total;

};

// print invoice form
const printInvoiceForm = () => {
  const printContent = document.getElementById("printViewInvoiceForm");
  if (!printContent) {
    return;
  }

  let newWindow = window.open();
  let preview =
    "<html><head><title>Invoice - OKI DOKI</title>" +
    getInvoicePreviewStyleMarkup() +
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