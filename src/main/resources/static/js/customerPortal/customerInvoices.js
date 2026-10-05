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

// ============================= view & print invoice details modal eka open karanwa ===============================


const invoiceView = (dataOb) => {
  console.log("Viewing Invoice", dataOb);

  // Set Modal Title & Subtitle
  document.getElementById("previewModalTitle").innerText = "Invoice Details";
  document.getElementById("previewModalSubtitle").innerText = "Currently viewing a previously generated invoice.";

  // Dynamic Button Visibility
  document.getElementById("printInvoiceBtn").style.display = "block";

  const formattedIssueDate = dateformat(dataOb.incoice_issue_date);
  const formattedDueDate = dateformat(dataOb.invoice_due_date);

  // Header Info
  if (document.getElementById("textInvoiceNo")) document.getElementById("textInvoiceNo").innerText = dataOb.invoice_no;
  if (document.getElementById("textInvoiceDate")) document.getElementById("textInvoiceDate").innerText = formattedIssueDate;
  if (document.getElementById("textDueDate")) document.getElementById("textDueDate").innerText = formattedDueDate;

  // Customer Info
  const customer = dataOb.bookings[0].customer_id;
  if (document.getElementById("textCustomerName")) document.getElementById("textCustomerName").innerText = customer.company_name;
  if (document.getElementById("textCustomerAddress")) document.getElementById("textCustomerAddress").innerText = customer.company_address;
  if (document.getElementById("textCustomerContact")) document.getElementById("textCustomerContact").innerText = customer.direct_telephone_no;
  if (document.getElementById("textCustomerEmail")) document.getElementById("textCustomerEmail").innerText = customer.direct_email_no;

  if (document.getElementById("textCustomerNameIntro")) document.getElementById("textCustomerNameIntro").innerText = customer.company_name;
  if (document.getElementById("textDueDateText")) document.getElementById("textDueDateText").innerText = formattedDueDate;
  if (document.getElementById("textInvoiceNoFooter")) document.getElementById("textInvoiceNoFooter").innerText = dataOb.invoice_no;

  // Update elements in the print preview panel (#invoicePreview)
  if (document.getElementById("printInvoiceNo")) document.getElementById("printInvoiceNo").innerText = dataOb.invoice_no;
  if (document.getElementById("printInvoiceDate")) document.getElementById("printInvoiceDate").innerText = formattedIssueDate;
  if (document.getElementById("printInvoiceDueDate")) document.getElementById("printInvoiceDueDate").innerText = formattedDueDate;
  if (document.getElementById("printCustomerNameIntro")) document.getElementById("printCustomerNameIntro").innerText = customer.company_name;

  if (document.getElementById("printCustomerName")) document.getElementById("printCustomerName").innerText = customer.company_name;
  if (document.getElementById("printCustomerAddress")) document.getElementById("printCustomerAddress").innerText = customer.company_address;
  if (document.getElementById("printCustomerContact")) document.getElementById("printCustomerContact").innerText = customer.direct_telephone_no;
  if (document.getElementById("printCustomerEmail")) document.getElementById("printCustomerEmail").innerText = customer.direct_email_no;

  const formattedInvoiceMonth = dataOb.invoice_month;
  if (document.getElementById("printInvoiceMonth")) document.getElementById("printInvoiceMonth").innerText = formattedInvoiceMonth;
  if (document.getElementById("printDueDateText")) document.getElementById("printDueDateText").innerText = formattedDueDate;

  const subTotalFormatted = parseFloat(dataOb.invoice_subtotal).toLocaleString("en-US", { style: "currency", currency: "LKR" });
  const taxFormatted = parseFloat(dataOb.invoice_tax).toLocaleString("en-US", { style: "currency", currency: "LKR" });
  const totalFormatted = parseFloat(dataOb.invoice_total).toLocaleString("en-US", { style: "currency", currency: "LKR" });

  if (document.getElementById("printTotalAmountText")) document.getElementById("printTotalAmountText").innerText = totalFormatted;
  if (document.getElementById("printSubTotal")) document.getElementById("printSubTotal").innerText = subTotalFormatted;
  if (document.getElementById("printTax")) document.getElementById("printTax").innerText = taxFormatted;
  if (document.getElementById("printTotalAmount")) document.getElementById("printTotalAmount").innerText = totalFormatted;
  if (document.getElementById("printInvoiceNoFooter")) document.getElementById("printInvoiceNoFooter").innerText = dataOb.invoice_no;

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
  if (printTblBody) {
    printTblBody.innerHTML = "";
    dataFillIntoTheReportTable(printTblBody, invoiceDetailsArrayView, propertyListInvoice);
  }

  const previewTblBody = document.getElementById("printPreviewTableBody");
  if (previewTblBody) {
    previewTblBody.innerHTML = "";
    dataFillIntoTheReportTable(previewTblBody, invoiceDetailsArrayView, propertyListInvoice);
  }

  // Summary
  if (document.getElementById("textPrintSubTotal")) document.getElementById("textPrintSubTotal").innerText = subTotalFormatted;
  if (document.getElementById("textPrintTax")) document.getElementById("textPrintTax").innerText = taxFormatted;
  if (document.getElementById("textPrintTotalAmount")) document.getElementById("textPrintTotalAmount").innerText = totalFormatted;
  if (document.getElementById("textPrintTotalAmount_Side")) document.getElementById("textPrintTotalAmount_Side").innerText = totalFormatted;


  openInvoicePrintDetail();
};

const printInvoice = () => {
  let printContent = document.getElementById("printContent");
  let newWindow = window.open();
  let preview =
    "<html><head><title>Invoice - OKI DOKI</title>" +
    "<link rel='stylesheet' href='/css/invoice.css'>" +
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

// ============================= end view & print invoice details modal eka open karanwa ===============================


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

const openInvoiceDetail = () => {
  toggleView("invoice-detail-overlay", true);
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.style.display = "";
    backBtn.onclick = () => {
      closeInvoiceDetail();
      refreshCalculateForm();
    };
  }
};

const closeInvoiceDetail = () => {
  toggleView("invoice-detail-overlay", false);
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.style.display = "none";

  }
  // setTimeout(() => {
  //   const mainContainer = document.getElementById("main");
  //   if (mainContainer) {
  //     mainContainer.style.setProperty("display", "flex", "important");
  //   }
  // }, 410);
};

const openInvoicePrintDetail = () => {
  toggleView("invoicePrintPreviewOverlay", true);
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.style.display = "";
    backBtn.onclick = () => {
      closeInvoiceDetail();
      refreshCalculateForm();
    };
  }
};

const closeInvoicePrintDetail = () => {
  toggleView("invoicePrintPreviewOverlay", false);
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.style.display = "none";

  }
  // setTimeout(() => {
  //   const mainContainer = document.getElementById("main");
  //   if (mainContainer) {
  //     mainContainer.style.setProperty("display", "flex", "important");
  //   }
  // }, 410);
};