window.addEventListener("load", () => {
  refreshSupplierPaymentForm();
  loadSupplierPaymentTable();
  loadPendingSuppliersScroller();
  generateBillNo();
});

// customer Payment table eka load karanawa
const loadSupplierPaymentTable = () => {
  // Destroy existing table if it exists
  if ($.fn.DataTable.isDataTable("#supplierPaymentTable")) {
    $("#supplierPaymentTable").DataTable().destroy();
  }

  supplierPaymentList = getServiceRequest("/supplierpayment/alldata");

  const propertyList = [
    { propertyName: "bill_no", dataType: "string" },
    { propertyName: getBatchNo, dataType: "function" },
    { propertyName: getSupplierDetails, dataType: "function" },
    { propertyName: getAmount, dataType: "function" },
    { propertyName: "method", dataType: "string" },
    { propertyName: getReferenceNo, dataType: "function" },
  ];

  supplierPaymentTableBody.innerHTML = "";
  dataFillIntoTheTableWithViewBtn(supplierPaymentTableBody, supplierPaymentList, propertyList, supplierPaymentView, false);
  showTableLoading("supplierPaymentTable", false);

  const table = $("#supplierPaymentTable").DataTable({
    dom: "rtip",
    language: {
      search: "_INPUT_",
      searchPlaceholder: "Search payments...",
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
  document.getElementById("tableSearch").addEventListener("input", function () {
    table.search(this.value).draw();
  });

  // Custom Length
  document.getElementById("tableLength").addEventListener("change", function () {
    table.pageLength(parseInt(this.value)).draw();
  });
};

const getSupplierDetails = (dataOb) => {
  const transport = dataOb.supplier_payable_id.supplier_agreement_id.supplier_id.transportname;
  const name = dataOb.supplier_payable_id.supplier_agreement_id.supplier_id.fullname;
  return `<div>
                <span class="d-block text-dark">${transport}</span>
                <span class="small text-muted">${name}</span>
            </div>`;
};

const getAmount = (dataOb) => {
  return `<div class="fw-bold text-success">${dataOb.amount_paid.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  })}</div>`;
};

const getBatchNo = (dataOb) => {
  return dataOb.supplier_payable_id.batch_no;
};

const getReferenceNo = (dataOb) => {
  if (dataOb.method === "Cash" || !dataOb.reference_no) {
    return `<span class="badge bg-light text-muted"> - </span>`;
  }
  return `<span class="fw-medium">${dataOb.reference_no}</span>`;
};

// supplier payment view
const supplierPaymentView = (dataOb) => {
  // Header Infos
  document.getElementById("slipReceiptNo").innerText = `#${dataOb.bill_no}`;
  document.getElementById("slipDate").innerText = dataOb.added_datetime || "N/A";

  // Amount
  document.getElementById("slipAmount").innerText = dataOb.amount_paid.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });

  // Supplier Details
  const supplier = dataOb.supplier_payable_id.supplier_agreement_id.supplier_id;
  document.getElementById("slipSupplierName").innerText = supplier.transportname;
  document.getElementById("slipSupplierContact").innerText = supplier.mobileno || "N/A";

  $("#paymentSuccessSlipModal").modal("show");
};
// print success slip
const printSuccessSlip = () => {
  const printArea = document.querySelector("#paymentSuccessSlipModal .modal-body");
  const newWindow = window.open("", "_blank");

  newWindow.document.write(`
        <html>
            <head>
                <title>Payment Receipt</title>
                <link rel="stylesheet" href="/bootstrap/bootstrap-5.2.3/css/bootstrap.min.css">
                  <link rel=stylesheet href="/fontawesome-free-6.7.2-web/css/all.css">
                <style>
                    body { font-family: 'Public Sans', sans-serif; display: flex; justify-content: center; padding-top: 50px; }
                    .print-container { width: 650px; padding: 20px; border: 2px solid #d3d3d3ff; border-radius: 20px; height: 650px;}
                    .btn-link, button, .btn-cancel ,.btn-2{ display: none !important; }
                </style>
            </head>
            <body>
                <div class="print-container">
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

// supplier payment form refresh karanawa
const refreshSupplierPaymentForm = () => {
  supplierPayment = new Object();
  supplierPaymentForm.reset();

  // approved agreement thiyena active supplier set eka gnnw
  let supplierList = getServiceRequest("/supplier/alldatabystatuswithagreementapproved");
  dataFillIntoSelectWithTwoNames(selectSupplierName, "Select Transport Name ", supplierList, "transportname", "fullname");

  selectBatch.value = "";
  textReference.disabled = true;
  setDefault([
    selectSupplierName,
    selectBatch,
    textSupplierTotalAmount,
    textSupplierDueAmount,
    textSupplierBalanceAmount,
    textSupplierPaidAmount,
    selectPaymentMethod,
    textReference,
  ]);
};

// horizontal card list ekak load karanwa
const loadPendingSuppliersScroller = () => {
  let supplierList = getServiceRequest("/supplier/supplierpayableavailable");
  suppliersCardContainer.innerHTML = "";

  if (!supplierList || supplierList.length === 0) {
    suppliersCardContainer.innerHTML = '<div class="text-muted small ps-2">No pending settlements found</div>';
    return;
  }

  // suppliers la show karan crad list eka hadagannawa
  supplierList.forEach((supplier) => {
    const card = document.createElement("div");
    card.className = "supplier-compact-card shadow-sm ";
    card.innerHTML = `
            <div class="supplier-info">
                <h4>${supplier.transportname}</h4>
                <p>Supplier Name: ${supplier.fullname}</p>
            </div>
            <button class="ms-3 btn btn-2 text-white btn-1 rounded-pill px-3 w-25 pay-button" data-bs-toggle="modal" data-bs-target="#driverModal" >Pay</button>
        `;
    suppliersCardContainer.appendChild(card);

    // btn eka click kalama modal eka open wenawa.
    const btn = card.querySelector(".pay-button");
    btn.onclick = () => {
      openPaymentForSupplier(supplier);
    };
  });
};

const openPaymentForSupplier = (supplier) => {
  selectSupplierName.value = JSON.stringify(supplier);

  let batchListBySupplier = getServiceRequest("/supplierpayable/seletedsupplier?supplierId=" + supplier.id);
  dataFilIntoSelect(selectBatch, "Select Batch ", batchListBySupplier, "batch_no");
};

// batch eka select kalama auto fill wenawa total amount ekai due amount ekai
const selectBatchElement = document.getElementById("selectBatch");
selectBatchElement.addEventListener("change", () => {
  const selectedBatch = JSON.parse(selectBatchElement.value);
  // supplier batch eka bind karanwa
  supplierPayment.supplier_payable_id = selectedBatch;
  // total amount eka
  textSupplierTotalAmount.value = selectedBatch.total_amount.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });

  //   pending amount eka
  if (selectedBatch.pending_amount === null) {
    textSupplierDueAmount.value = selectedBatch.total_amount.toLocaleString("en-US", {
      style: "currency",
      currency: "LKR",
    });
  } else {
    textSupplierDueAmount.value = selectedBatch.pending_amount.toLocaleString("en-US", {
      style: "currency",
      currency: "LKR",
    });
  }
});

//Calculate the balance
const supplierTotalElement = document.getElementById("textSupplierTotalAmount");
const calculateBalance = (paidValue) => {
  let balanceAmount = 0;

  // type karana paid amount eka number valata convert karanwa
  let typePaidAmount = Number(paidValue.value);

  // total amount eke currancy format eka ayin karanawa
  let totalDueAmountWithoutCurrancy = textSupplierDueAmount.value.replace(/[^0-9.-]+/g, "");

  // total due amount eka null naththan if eka true wela total amount eken paid amount eka adu wela balance eka calculate karanwa
  if (textSupplierDueAmount.value) {
    // if paid amount is greater than total amount
    if (typePaidAmount > Number(totalDueAmountWithoutCurrancy)) {
      balanceAmount = Number(totalDueAmountWithoutCurrancy) - typePaidAmount;
      // alert box ekak display karanawa
      Swal.fire({
        title: "Invalid Amount",
        text: "Paid amount cannot exceed the due amount. Please verify the entered amount.",
        icon: "error",
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
      // set the balance amount to 0
      balanceAmount = 0;
      textSupplierPaidAmount.value = "";
      supplierPayment.paid_amount = null;

      // if paid amount is less than or equal to total amount
    } else if (typePaidAmount <= Number(totalDueAmountWithoutCurrancy)) {
      balanceAmount = Number(totalDueAmountWithoutCurrancy) - typePaidAmount;
      supplierPayment.balance_amount = balanceAmount.toFixed(2);
    }
  } else {
    supplierPayment.balance_amount = balanceAmount;
  }
  textSupplierBalanceAmount.value = balanceAmount.toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });
};

// check errors
const checkFormError = () => {
  let errors = "";

  if (!supplierPayment.amount_paid) {
    errors += "Paid Amount is not Entered.........";
  }
  if (!supplierPayment.method) {
    errors += "Please select the payment method";
  }
  if (supplierPayment.method != "Cash") {
    if (!supplierPayment.reference_no) {
      errors += "please add the reference no or cheque no";
    }
  }

  return errors;
};

// form submit function
const supplierPaymentFormSubmit = () => {
  console.log(supplierPayment);
  generateBillNo();
  // check form error for required element
  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    // errors not exit
    //need to get user confirmation

    let userConfirm = Swal.fire({
      title: "Confirm Payment",
      text: "Are you sure you want to process this payment?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Process Payment",
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
        let postResponse = httpServiceRequest("/supplierpayment/insert", "POST", supplierPayment);
        console.log(supplierPayment);

        if (postResponse == "ok") {
          Swal.fire({
            title: "Payment Successful!",
            text: "The payment has been processed successfully.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          loadSupplierPaymentTable();
          refreshSupplierPaymentForm();
          loadPendingSuppliersScroller();
        } else {
          Swal.fire({
            title: "Payment Not Processed",
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
          text: "Payment Process Cancelled!",
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
      title: "Payment Incomplete",
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
  console.log(supplierPayment);
};

// refereno eka danna oni bank trasfer yanaw nam witharai
const methodElement = document.getElementById("selectPaymentMethod");
methodElement.addEventListener("change", (e) => {
  const value = methodElement.value;
  if (value === "Cash") {
    textReference.disabled = true;
  } else {
    textReference.disabled = false;
  }
});

// generate bill no
const generateBillNo = () => {
  // year eke anthima anka deka gnnawa
  const now = new Date();
  const currentYear = now.getFullYear().toString().slice(-2);
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, "0");
  const prefix = "SPY-" + currentYear + currentMonth;

  //   anthimata add karapu no eka gnnawa
  if (supplierPaymentList.length === 0) {
    supplierPayment.bill_no = "SPY-" + prefix + "-000001";
  } else {
    const lastRecord = supplierPaymentList[0];
    console.log(lastRecord);
    const lastBillNo = lastRecord.bill_no;
    const parts = lastBillNo.split("-");
    const lastNo = parseInt(parts[2]);
    let newNumber = (lastNo + 1).toString().padStart(6, "0");

    const newBillNo = prefix + "-" + newNumber;

    supplierPayment.bill_no = newBillNo;
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
