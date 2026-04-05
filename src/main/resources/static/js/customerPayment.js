window.addEventListener("load", () => {
  refreshCustomerPaymentForm();
  loadCustomerPaymentTable();
  loadInvoiceCard();
});

// invoice card load karanawa
const loadInvoiceCard = () => {
  invoiceList = getServiceRequest("/invoice/unpaidinvoices");

  fillDataIntoPackageCard("pendingInvoiceCardContainer", invoiceList, customerPaymentAdd);
};

// functions for get customer name and business type
const getCustomer = (dataOb) => {
  return dataOb.bookings[0].customer_id.company_name;
};

const getBusinessType = (dataOb) => {
  return dataOb.bookings[0].customer_id.business_type_id.name;
};

const getInvoiceStatus = (dataOb) => {
  return dataOb.invoice_status_id.status;
};

// pending invoice dtnamic card generate  finction
const fillDataIntoPackageCard = (ParentId, invoices, editFunction) => {
  let invoiceContainer = document.getElementById(ParentId);
  invoiceContainer.innerHTML = "";

  invoices.forEach((invoice) => {
    let balance = (parseFloat(invoice.invoice_total) - parseFloat(invoice.paid_amount)).toFixed(2);
    let card = document.createElement("div");
    card.classList.add("invoice-card");
    card.style.cursor = "pointer";

    let customer = getCustomer(invoice);
    let businessType = getBusinessType(invoice);
    let invoiceStatus = getInvoiceStatus(invoice);

    let cardContent = `
        <div class="card-head">
            <div class="invoice-id">#${invoice.invoice_no}</div>
            <div class="status pending">${invoiceStatus}</div>
        </div>

        <div class="card-mid">
            <div class="client">${customer}</div>
            <div class="muted">${businessType}</div>
        </div>
 
        <div class="meta">
            <div class="muted">Due: <strong>${invoice.invoice_due_date}</strong></div>
            <div class="amount">LKR. ${balance}</div>
        </div>
        <div>
           <button class="btn btn-2">Pay</button>
          </div>
        `;

    card.innerHTML = cardContent;

    // click event
    card.onclick = () => {
      editFunction(invoice);
    };

    invoiceContainer.appendChild(card);
  });
};

// payment form eke modal eka open karala properties input walata assigning karanawa
const customerPaymentAdd = (dataOb) => {
  $("#paymentModal").modal("show");
  textInvoiceNo.value = dataOb.invoice_no;
  textInvoiceDate.value = dataOb.invoice_due_date;
  textTotalAmount.value = parseFloat(dataOb.invoice_total).toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });

  // currunt payment null name nam due payment eka enna oni kali  due eken curruntpaymnent eka adu wela
  if (dataOb.paid_amount != null) {
    // due amount eka hadenna oni total amount eken paid amount eka adu wela
    textDueAmount.value = (parseFloat(dataOb.invoice_total) - parseFloat(dataOb.paid_amount)).toLocaleString("en-US", {
      style: "currency",
      currency: "LKR",
    });
  } else {
    textCurrentAmount.value = "";
    customerPayment.current_payment = null;
    textDueAmount.value = parseFloat(dataOb.invoice_total).toLocaleString("en-US", {
      style: "currency",
      currency: "LKR",
    });
  }
  customerPayment.invoice_id = dataOb;
  console.log("Update", customerPayment);
};

// customer Payment table eka load karanawa
const loadCustomerPaymentTable = () => {
  if ($.fn.dataTable.isDataTable("#paymentTable")) {
    $("#paymentTable").DataTable().clear().destroy();
  }
  customerPaymentList = getServiceRequest("/customerpayment/alldata");

  const propertyList = [
    { propertyName: "bill_no", dataType: "string" },
    { propertyName: getInvoiceNo, dataType: "function" },
    { propertyName: getCurrentPayment, dataType: "function" },
    { propertyName: getAddedDatetime, dataType: "function" },
  ];

  // table data fill function
  dataFillIntoTheReportTable(paymentTableBody, customerPaymentList, propertyList);

  const table = $("#paymentTable").DataTable({
    dom: "rtip",
    pageLength: 10,
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

  // Custom Search Control
  document.getElementById("tableSearch").addEventListener("keyup", function () {
    table.search(this.value).draw();
  });

  // Custom Length Control
  document.getElementById("tableLength").addEventListener("change", function () {
    table.page.len(this.value).draw();
  });
};

// table loading show function
function showTableLoading() {
  const loader = document.getElementById("tableOverlay");
  const table = document.getElementById("paymentTable");
  if (loader && table) {
    loader.removeAttribute("hidden");
    loader.style.display = "flex";
    table.style.display = "none";
    setTimeout(() => {
      loader.style.display = "none";
      loader.setAttribute("hidden", "hidden");
      table.style.display = "";
    }, 500);
  }
}

// invoice no ganna function eka
const getInvoiceNo = (dataOb) => {
  return dataOb.invoice_id.invoice_no;
};

const getAddedDatetime = (dataOb) => {
  parts = dataOb.added_datetime.split("T");
  datetime = parts[0];
  return datetime;
};

const getCurrentPayment = (dataOb) => {
  return `<div class="fw-bold text-success">${parseFloat(dataOb.current_payment).toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  })}</div>`;
};

const checkFormError = () => {
  let errors = "";
  // current payment eka check karanawa
  if (customerPayment.current_payment == null || customerPayment.current_payment <= 0) {
    errors += "Paid Amount is required and should be greater than zero. <br>";
  }

  return errors;
};
// customer payment submit button
const customerPaymentPaidButton = () => {
  console.log(customerPayment);
  generateBillNo();
  let errors = checkFormError();
  if (errors == "") {
    Swal.fire({
      title: "Confirm Payment",
      text: "Are you sure you want to record this payment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Record Payment",
      cancelButtonText: "Cancel",
      allowOutsideClick: false,
      customClass: {
        cancelButton: "btn btn-1",
        confirmButton: "btn btn-2",
        popup: "swal2-border-radius",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        let postResponse = httpServiceRequest("/customerpayment/insert", "POST", customerPayment);
        if (postResponse == "ok") {
          Swal.fire({
            title: "Payment Recorded!",
            text: "The payment has been successfully recorded in the system.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          loadCustomerPaymentTable();
          refreshCustomerPaymentForm();
          loadInvoiceCard();
          $("#paymentModal").modal("hide");
        } else {
          Swal.fire({
            title: "Payment Failed",
            text: postResponse,
            icon: "error",
            customClass: {
              confirmButton: "btn btn-1",
              popup: "swal2-border-radius",
            },
          });
        }
      }
    });
  } else {
    Swal.fire({
      title: "Payment Validation Error",
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

// payment method select karana element eka
methodOfCash = new bootstrap.Collapse(document.getElementById("methodOfCash"), {
  toggle: false,
});
methodOfCheque = new bootstrap.Collapse(document.getElementById("methodOfCheque"), { toggle: false });
methodOfIbt = new bootstrap.Collapse(document.getElementById("methodOfIbt"), {
  toggle: false,
});
const paymentMethodSelect = (ElementValue) => {
  if (ElementValue.value === "Cash") {
    methodOfCash.show();
    methodOfCheque.hide();
    methodOfIbt.hide();
  } else if (ElementValue.value === "Cheque") {
    methodOfCash.hide();
    methodOfCheque.show();
    methodOfIbt.hide();
  } else if (ElementValue.value === "Inter Bank Transfer(IBT)") {
    methodOfCash.hide();
    methodOfCheque.hide();
    methodOfIbt.show();
  } else {
    methodOfCash.hide();
    methodOfCheque.hide();
    methodOfIbt.hide();
  }
};

// refresh karanawa form eka
const refreshCustomerPaymentForm = () => {
  customerPayment = new Object();

  customerPayment.chequePaymentList = new Array();
  customerPayment.interBankTransferPaymentList = new Array();

  setDefault([selectPaymentMethod, textBalanceAmount, textCurrentAmount]);

  selectPaymentMethod.value = "";
  textCurrentAmount.value = "";
  textBalanceAmount.value = "";
  textCurrentTypeAmount.value = "";
  customerPayment.current_payment = null;
  customerPayment.balance_amount = null;

  // refresh weddi payment method hide karala thiyanna oni
  methodOfCash.hide();
  methodOfCheque.hide();
  methodOfIbt.hide();

  refreshChequePaymentInnerForm();
  refreshIbtPaymentInnerForm();
};

// inner form table body eka saha input clear karanawa payment method change karaddi
const innerFormTableBodyClear = () => {
  refreshChequePaymentInnerForm();
  refreshIbtPaymentInnerForm();
  // inner form table body eka clear karanawa
  innerChequeTableBody.innerHTML = "";
  innerIbtTableBody.innerHTML = "";
  textCurrentAmount.value = "";
  textBalanceAmount.value = "";

  // type eka change weedi validation color remove wenna oni
  textCurrentAmount.classList.remove("is-invalid");
  textCurrentAmount.classList.remove("is-valid");
  textBalanceAmount.classList.remove("is-invalid");
  textBalanceAmount.classList.remove("is-valid");
};

// generate transaction no
const generateBillNo = () => {
  // year eke anthima anka deka gnnawa
  const now = new Date();
  const currentYear = now.getFullYear().toString().slice(-2);
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, "0");
  const prefix = "RCP-" + currentYear + currentMonth;

  //   anthimata add karapu no eka gnnawa
  if (customerPaymentList.length === 0) {
    customerPayment.bill_no = "RCP-" + prefix + "-000001";
  } else {
    const lastRecord = customerPaymentList[0];
    console.log(lastRecord);
    const lastBillNo = lastRecord.bill_no;
    const parts = lastBillNo.split("-");
    const lastNo = parseInt(parts[2]);
    let newNumber = (lastNo + 1).toString().padStart(6, "0");

    const newBillNo = prefix + "-" + newNumber;

    customerPayment.bill_no = newBillNo;
  }
};

// -------------------------------------cash Payment Method ---------------------------------------------------------

// payment method eka cash kiyala select karala type karaddi paid amount eka auto fill wenawa
const paymentMethodCash = (input) => {
  const paidAmount = parseFloat(input.value);

  const dueAmount = parseFloat(document.getElementById("textDueAmount").value.replace(/[^0-9.-]+/g, ""));

  // currancy fromat ekata change karanwa
  textCurrentAmount.value = paidAmount.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });
  customerPayment.current_payment = paidAmount.toFixed(2);

  // Calculate and set balance
  const balance = dueAmount - paidAmount;
  textBalanceAmount.value = balance.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });
  if (paidAmount > dueAmount) {
    // If paid amount is greater than due amount wennath ba
    Swal.fire({
      title: "Invalid Amount",
      text: "Paid amount cannot be greater than the due amount.",
      icon: "error",
      confirmButtonText: "OK",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    textCurrentAmount.value = "";
    textBalanceAmount.value = "";
    textCurrentTypeAmount.value = "";
  } else if (paidAmount < 0) {
    // paid amount eka negative num ekak wenna ba
    Swal.fire({
      title: "Invalid Amount",
      text: "Paid amount cannot be negative.",
      icon: "error",
      confirmButtonText: "OK",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
  }

  if (input.value === "" || parseFloat(input.value) === 0) {
    // Clear paid and balance amounts if input is empty or zero
    textBalanceAmount.value = "";
    textCurrentAmount.value = "";

    // null pass karanaw
    customerPayment.current_payment = null;

    // Remove validation classes
    setDefault([textCurrentAmount, textBalanceAmount]);
  }
};

//----------------------------------------Cheque Payment Method inner Form---------------------------------------------

const refreshChequePaymentInnerForm = () => {
  chequePayment = new Object();

  // input clean wenna oni
  textChequeAmount.value = "";
  textChequeNo.value = "";
  textChequeDate.value = "";

  // validation deafult value ekata gnnw
  setDefault([textChequeAmount, textChequeNo, textChequeDate]);

  //     referesh Inner Table
  const propertyList = [
    { propertyName: "cheque_no", dataType: "string" },
    { propertyName: "cheque_amount", dataType: "decimal" },
    { propertyName: "cheque_date", dataType: "string" },
  ];

  dataFillIntoTheInnerTable(innerChequeTableBody, customerPayment.chequePaymentList, propertyList, chequePaymentEdit, chequePaymentDelete, true);

  // cheque inner form eke button handling
  updateButtonChequeInnerForm.style.display = "none";
  submitButtonChequeInnerForm.style.display = "";
};

// cheque payment edit karanna ona inner form eka fill karanna
const chequePaymentEdit = (dataOb, index) => {
  innerFormIndex = index;
  chequePayment = JSON.parse(JSON.stringify(dataOb));
  oldChequePayment = JSON.parse(JSON.stringify(dataOb));

  textChequeNo.value = dataOb.cheque_no;
  textChequeAmount.value = dataOb.cheque_amount;
  textChequeDate.value = dataOb.cheque_date;

  updateButtonChequeInnerForm.style.display = "";
  submitButtonChequeInnerForm.style.display = "none";
};

// inner form data delete function
const chequePaymentDelete = (dataOb, index) => {
  Swal.fire({
    title: "Confirm Deletion",
    text: "Are you sure you want to remove this cheque?",
    icon: "warning",
    iconColor: "#ef4444",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete",
    cancelButtonText: "No, Keep it",
    allowOutsideClick: false,
    customClass: {
      cancelButton: "btn btn-1",
      confirmButton: "btn btn-4",
      popup: "swal2-border-radius",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      //call post service
      let existIndex = customerPayment.chequePaymentList.map((chequePayment) => chequePayment.id).indexOf(dataOb.id);
      if (existIndex !== -1) {
        customerPayment.chequePaymentList.splice(existIndex, 1);
      }
      Swal.fire({
        title: "Removed!",
        text: "Cheque has been removed successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: "swal2-border-radius",
        },
      });
      refreshChequePaymentInnerForm();
      updateTotalAmountUsingCheque();
    }
  });
};

// cheque inner form error check karanawa
const checkChequeInnerFormError = () => {
  let errors = "";
  // cheque no eka check karanawa
  if (chequePayment.cheque_no == null) {
    errors += "Cheque No is required. <br>";
  }
  if (chequePayment.cheque_amount == null) {
    errors += "Cheque Amount is required. <br>";
  }
  // currunt payemnt eka null  nam balanawa chewue amount ekath ekka due amount eka
  if (customerPayment.current_payment == null) {
    if (chequePayment.cheque_amount > customerPayment.due_amount) {
      errors += "Cheque Amount cannot be greater than due Payment. <br>";
    }
  }
  //     meka wada karanna oni object deka null nam witharai.naththan update ekedi error ekak enw
  if (chequePayment == null && oldChequePayment == null) {
    if (customerPayment.current_payment != null && chequePayment.cheque_amount > customerPayment.current_payment) {
      errors += "Cheque Amount cannot be greater than Current Payment. <br>";
    }
  }
  if (chequePayment.cheque_date == null) {
    errors += "Cheque Date is required. <br>";
  }
  return errors;
};

// cheque inner form eka submit karana button eke function ea
const chequeInnerFormSubmit = () => {
  console.log(chequePayment);
  let errors = checkChequeInnerFormError();
  if (errors == "") {
    Swal.fire({
      title: "Confirm Cheque",
      text: "Do you want to add this cheque to the payment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Add Cheque",
      cancelButtonText: "Cancel",
      allowOutsideClick: false,
      customClass: {
        cancelButton: "btn btn-1",
        confirmButton: "btn btn-2",
        popup: "swal2-border-radius",
      },
    }).then((result) => {
      // check form error for required element
      if (result.isConfirmed) {
        customerPayment.chequePaymentList.push(chequePayment);
        Swal.fire({
          title: "Cheque Added!",
          text: "Cheque has been added successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-border-radius",
          },
        });
        updateTotalAmountUsingCheque();
        refreshChequePaymentInnerForm();
      }
    });
  } else {
    Swal.fire({
      title: "Cheque Validation Error",
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

// check inner form updates
const checkChequeInnerFormUpdate = () => {
  let updates = "";
  if (chequePayment != null && oldChequePayment != null) {
    if (chequePayment.cheque_no != oldChequePayment.cheque_no) {
      updates += "Cheque no is changed..... ";
    }

    if (chequePayment.cheque_amount != oldChequePayment.cheque_amount) {
      updates += "Cheque amount is changed..... ";
      if (chequePayment.cheque_amount > chequePayment.due_amount) {
        updates += "cant update";
      }
    }
    if (chequePayment.cheque_date != oldChequePayment.cheque_date) {
      updates += "Cheque date is changed..... ";
    }
  }

  return updates;
};

// customer agreement inner form update function
const chequeInnerFormUpdate = () => {
  // check form error for required element
  let errors = checkChequeInnerFormError();
  if (errors == "") {
    let updates = checkChequeInnerFormUpdate();
    // updates not exit
    if (updates == "") {
      Swal.fire({
        title: "Nothing to Update",
        text: "No changes were detected in the cheque details.",
        icon: "info",
        allowOutsideClick: false,
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    } else {
      Swal.fire({
        title: "Confirm Update",
        text: "Are you sure you want to update this cheque?",
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
      }).then((result) => {
        if (result.isConfirmed) {
          // user confirm kaloth update wenawa
          customerPayment.chequePaymentList[innerFormIndex] = chequePayment;
          Swal.fire({
            title: "Updated!",
            text: "Cheque details updated successfully.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          updateTotalAmountUsingCheque();
          refreshChequePaymentInnerForm();
        }
      });
    }
  } else {
    Swal.fire({
      title: "Error!",
      text: errors,
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

// define function check existing cheque no
const checkExtChequeNo = () => {
  let chequeNo = document.getElementById("textChequeNo").value;

  let extIndex = customerPayment.chequePaymentList.map((cheque) => cheque.cheque_no).indexOf(chequeNo);

  if (extIndex > -1) {
    window.alert("already exist");
    refreshChequePaymentInnerForm();
  }
};

// cheque no eka enter karaddi digits enter karanna puluwan 16
const formatInput = (input) => {
  // Remove all non-digits
  let value = input.value.replace(/\D/g, "");

  // Limit to 16 digits
  value = value.slice(0, 16);

  // Insert '-' every 4 digits
  let formatted = value.match(/.{1,4}/g)?.join("-") || "";

  input.value = formatted;
  chequePayment.cheque_no = formatted; // bind the chequePayment object
};

// update paid amount if add mutiple cheques
const updateTotalAmountUsingCheque = () => {
  let paidAmount = 0.0;

  // total amount eka gannwa eke thiyen currancy format eka remove karala
  const totalAmount = parseFloat(document.getElementById("textTotalAmount").value.replace(/[^0-9.-]+/g, ""));
  const dueAmount = parseFloat(document.getElementById("textDueAmount").value.replace(/[^0-9.-]+/g, ""));

  // for loop eken paid amount eke total eka gnnw
  for (const cheque of customerPayment.chequePaymentList) {
    paidAmount = parseFloat(paidAmount) + parseFloat(cheque.cheque_amount);
  }
  // type karana paid amount eka due amount ekaatas samana nam ho adu nam meka wada karanwa
  if (paidAmount <= dueAmount) {
    //currancy format ekata change karanawa
    textCurrentAmount.value = paidAmount.toLocaleString("en-US", {
      style: "currency",
      currency: "LKR",
    });
    customerPayment.current_payment = paidAmount;

    // balnance eka auto calculate wenna hadanna oni
    const balanceAmount = totalAmount - paidAmount;
    // balance amount eka curaancy format ekata change karanawa
    textBalanceAmount.value = balanceAmount.toLocaleString("en-US", {
      style: "currency",
      currency: "LKR",
    });

    // balance amount eka hadenna oni total amount eken paid amount eka adu wela

    // validation
    textCurrentAmount.classList.remove("is-invalid");
    textCurrentAmount.classList.add("is-valid");

    textBalanceAmount.classList.remove("is-invalid");
    textBalanceAmount.classList.add("is-valid");
  } else {
    //paid amount amount eka due amount ekata wada wadi nam error msg ekak ewanwa
    Swal.fire({
      title: "Error!",
      text: "Paid amount cannot be greater than due amount.",
      icon: "error",
      confirmButtonText: "OK",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });

    // add karana cheque eka list eken remove karanwa
    const currantladdcheque = customerPayment.chequePaymentList.length - 1;
    customerPayment.chequePaymentList.splice(currantladdcheque, 1);

    // type karana amount 0 hari empty hari wunoth validation ayin wenawa
    setDefault([textCurrentAmount, textBalanceAmount]);
  }
};

//-----------------------------------------Inter Bank Transfer Payment Method inner Form---------------------------------------------

// refresh ibt form
const refreshIbtPaymentInnerForm = () => {
  // ibt inner object hadagannw
  ibtPayment = new Object();

  // input clean wenna oni
  textReferenceNo.value = "";
  textIbtAmount.value = "";
  textIbtDate.value = "";

  // validation deafult value ekata gnnw
  setDefault([textReferenceNo, textIbtAmount, textIbtDate]);

  //     referesh Inner Table
  const propertyList = [
    { propertyName: "reference_no", dataType: "string" },
    { propertyName: "amount", dataType: "decimal" },
    { propertyName: "ibt_date", dataType: "string" },
  ];

  dataFillIntoTheInnerTable(innerIbtTableBody, customerPayment.interBankTransferPaymentList, propertyList, ibtPaymentEdit, ibtPaymentDelete, true);

  // cheque inner form eke button handling
  updateButtonIbtInnerForm.style.display = "none";
  submitButtonIbtInnerForm.style.display = "";
};

// ibt payment edit karanna ona inner form eka fill karanna
const ibtPaymentEdit = (dataOb, index) => {
  // innerform index eka gnnw.mkd update karaddi index eka balanna oni
  innerFormIndex = index;
  ibtPayment = JSON.parse(JSON.stringify(dataOb));
  oldIbtPayment = JSON.parse(JSON.stringify(dataOb));

  textReferenceNo.value = dataOb.reference_no;
  textIbtAmount.value = dataOb.amount;
  textIbtDate.value = dataOb.ibt_date;

  updateButtonIbtInnerForm.style.display = "";
  submitButtonIbtInnerForm.style.display = "none";
};

// inner form data delete function
const ibtPaymentDelete = (dataOb, index) => {
  Swal.fire({
    title: "Confirm Deletion",
    text: "Are you sure you want to remove this transfer?",
    icon: "warning",
    iconColor: "#ef4444",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete",
    cancelButtonText: "No, Keep it",
    allowOutsideClick: false,
    customClass: {
      cancelButton: "btn btn-1",
      confirmButton: "btn btn-4",
      popup: "swal2-border-radius",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      //call post service
      let existIndex = customerPayment.interBankTransferPaymentList.map((ibtPayment) => ibtPayment.id).indexOf(dataOb.id);
      if (existIndex !== -1) {
        customerPayment.interBankTransferPaymentList.splice(existIndex, 1);
      }
      Swal.fire({
        title: "Removed!",
        text: "Transfer has been removed successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: "swal2-border-radius",
        },
      });
      refreshIbtPaymentInnerForm();
      updateTotalAmountUsingIbt();
    }
  });
};

// ibt inner form error check karanawa
const checkIbtInnerFormError = () => {
  let errors = "";
  // cheque no eka check karanawa
  if (ibtPayment.reference_no == null) {
    errors += "Reference No is required. <br>";
  }
  if (ibtPayment.amount == null) {
    errors += "Amount is required. <br>";
  }
  if (ibtPayment.ibt_date == null) {
    errors += "Ibt Date is required. <br>";
  }
  // currunt payemnt eka null  nam balanawa ibt amount eka  due amount ekata wda wishalada kiyala
  if (ibtPayment.current_payment == null) {
    if (ibtPayment.amount > ibtPayment.due_amount) {
      errors += "Ibt Amount cannot be greater than due Payment. <br>";
    }
  }
  //     meka wada karanna oni object deka null nam witharai.naththan update ekedi error ekak enw
  if (ibtPayment == null && oldIbtPayment == null) {
    if (customerPayment.ibtPayment != null && ibtPayment.amount > ibtPayment.current_payment) {
      errors += "Ibt Amount cannot be greater than Current Payment. <br>";
    }
  }
  return errors;
};

// ibt inner form eka submit karana button eke function ea
const ibtInnerFormSubmit = () => {
  // check form error for required element
  // check form error for required element
  let errors = checkIbtInnerFormError();
  if (errors == "") {
    Swal.fire({
      title: "Confirm Transfer",
      text: "Do you want to add this transfer to the payment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Add Transfer",
      cancelButtonText: "Cancel",
      allowOutsideClick: false,
      customClass: {
        cancelButton: "btn btn-1",
        confirmButton: "btn btn-2",
        popup: "swal2-border-radius",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        customerPayment.interBankTransferPaymentList.push(ibtPayment);
        Swal.fire({
          title: "Transfer Added!",
          text: "Transfer has been added successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-border-radius",
          },
        });
        updateTotalAmountUsingIbt();
        refreshIbtPaymentInnerForm();
      }
    });
  } else {
    Swal.fire({
      title: "Transfer Validation Error",
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

// check inner form updates
const checkIbtInnerFormUpdate = () => {
  let updates = "";
  if (ibtPayment != null && oldIbtPayment != null) {
    if (ibtPayment.reference_no != oldIbtPayment.reference_no) {
      updates += "Reference no is changed..... ";
    }
    if (ibtPayment.amount != oldIbtPayment.amount) {
      updates += "Amount is changed..... ";
    }
    if (ibtPayment.ibt_date != oldIbtPayment.ibt_date) {
      updates += "Ibt date is changed..... ";
    }
  }

  return updates;
};

// ibt inner form update function
const ibtInnerFormUpdate = () => {
  // check form error for required element
  let errors = checkIbtInnerFormError();
  if (errors == "") {
    let updates = checkIbtInnerFormUpdate();
    // updates not exit
    if (updates == "") {
      Swal.fire({
        title: "Nothing to Update",
        text: "No changes were detected in the transfer details.",
        icon: "info",
        allowOutsideClick: false,
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    } else {
      Swal.fire({
        title: "Confirm Update",
        text: "Are you sure you want to update this transfer?",
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
      }).then((result) => {
        if (result.isConfirmed) {
          // user confirm kaloth update wenawa
          customerPayment.interBankTransferPaymentList[innerFormIndex] = ibtPayment;
          Swal.fire({
            title: "Updated!",
            text: "Transfer details updated successfully.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          updateTotalAmountUsingIbt();
          refreshIbtPaymentInnerForm();
        }
      });
    }
  } else {
    Swal.fire({
      title: "Error!",
      text: errors,
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

// define function check existing chargers
const checkExtReferenceNo = () => {
  let referenceNo = document.getElementById("textReferenceNo").value;

  let extIndex = customerPayment.interBankTransferPaymentList.map((ibt) => ibt.reference_no).indexOf(referenceNo);

  if (extIndex > -1) {
    window.alert("already exist");
    refreshIbtPaymentInnerForm();
  }
};

// update paid amount if add mutiple cheques
const updateTotalAmountUsingIbt = () => {
  // empty varibale ekak hadagannw
  let paidAmount = 0.0;
  // total amount ekai due amount ekai gnnw currancy ayin karala
  const totalAmount = parseFloat(document.getElementById("textTotalAmount").value.replace(/[^0-9.-]+/g, ""));
  const dueAmount = parseFloat(document.getElementById("textDueAmount").value.replace(/[^0-9.-]+/g, ""));

  // for loop eken paid amount eke total eka gnnw
  for (const ibt of customerPayment.interBankTransferPaymentList) {
    paidAmount = parseFloat(paidAmount) + parseFloat(ibt.amount);
  }

  // type karana paid amount eka due amount ekata samana nam ho adu nam meka wada karanwa
  if (paidAmount <= dueAmount) {
    //currancy format ekata change karanawa
    textCurrentAmount.value = paidAmount.toLocaleString("en-US", {
      style: "currency",
      currency: "LKR",
    });
    customerPayment.current_payment = paidAmount;

    // balnance eka auto calculate wenna hadanna oni
    const balanceAmount = totalAmount - paidAmount;

    // balance amount eka curaancy format ekata change karanawa
    textBalanceAmount.value = balanceAmount.toLocaleString("en-US", {
      style: "currency",
      currency: "LKR",
    });

    // balance amount eka hadenna oni total amount eken paid amount eka adu wela

    // validation
    textCurrentAmount.classList.remove("is-invalid");
    textCurrentAmount.classList.add("is-valid");

    textBalanceAmount.classList.remove("is-invalid");
    textBalanceAmount.classList.add("is-valid");
  } else {
    //paid amount amount eka due amount ekata wada wadi nam error msg ekak ewanwa
    Swal.fire({
      title: "Invalid Amount",
      text: "Paid amount cannot be greater than the due amount.",
      icon: "error",
      confirmButtonText: "OK",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    // add karana cheque eka list eken remove karanwa
    const currantladdIbt = customerPayment.interBankTransferPaymentList.length - 1;

    customerPayment.interBankTransferPaymentList.splice(currantladdIbt, 1);

    // type karana amount 0 hari empty hari wunoth validation ayin wenawa
    setDefault([textCurrentAmount, textBalanceAmount]);
  }
};
