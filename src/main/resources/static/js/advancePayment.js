window.addEventListener("load", () => {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      refreshTable();
      refreshForm();
    } catch (e) {
      console.error("Error during advance-payment page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);
});

// Refresh Table
const refreshTable = () => {
  if ($.fn.dataTable.isDataTable("#advanceTable")) {
    $("#advanceTable").DataTable().clear().destroy();
  }

  advances = getServiceRequest("/advancepayment/alldata");

  // Load search selects with cleaner labels
  const suppliers = getServiceRequest("/supplier/alldatabystatus");
  dataFilIntoSelect(searchSupplierSearch, "All Suppliers", suppliers, "transportname");

  const propertyList = [
    { propertyName: "advance_no", dataType: "string" },
    { propertyName: getSupplierName, dataType: "function" },
    { propertyName: getAmount, dataType: "function" },
    { propertyName: "payment_method", dataType: "string" },
    { propertyName: "description", dataType: "string" },
    { propertyName: getAddedDateTime, dataType: "function" },
    { propertyName: getStatus, dataType: "function" },
  ];

  datafillApprovalTable(advanceTableBody, advances, propertyList, viewAdvance, true);

  const table = $("#advanceTable").DataTable({
    dom: "rtip", // Hide default search and length
    pageLength: 10,
    createdRow: function (row, data, dataIndex) {
      $(row).find("td").css({
        "text-align": "left",
        height: "80px",
      });
    },
    headerCallback: function (thead, data, start, end, display) {
      $(thead).find("th").css({
        "text-align": "left",
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

  // Filter Search Logic for Selects
  $("#searchSupplierSearch").on("change", function () {
    const val = $(this).val();
    if (val) {
      const obj = JSON.parse(val);
      table.column(2).search(obj.fullname).draw();
    } else {
      table.column(2).search("").draw();
    }
  });

  applyPrivileges("Advance Payment Management", "advanceTable", {
    add: addButton,
  });

  table.on("draw.dt", function () {
    applyPrivileges("Advance Payment Management", "advanceTable", { add: addButton });
  });
};

const getSupplierName = (dataOb) => {
  return dataOb.supplier_id ? dataOb.supplier_id.fullname || dataOb.supplier_id.company_name : "-";
};

const getAmount = (dataOb) => {
  return `<div class="fw-bold text-danger">${parseFloat(dataOb.amount).toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  })}</div>`;
};

const getAddedDateTime = (dataOb) => {
  return dataOb.added_datetime.replace("T", " ").substring(0, 16);
};

const getStatus = (dataOb) => {
  if (dataOb.supplier_advance_status_id.status == "Approved") {
    return "<span class='status-badge status-active'> <span class='dot'> </span>" + dataOb.supplier_advance_status_id.status + "</span>";
  }

  if (dataOb.supplier_advance_status_id.status == "Pending") {
    return "<span class='status-badge status-pending'> <span class='dot'> </span>" + dataOb.supplier_advance_status_id.status + "</span>";
  }
  if (dataOb.supplier_advance_status_id.status == "Reject") {
    return "<span class='status-badge status-inactive'> <span class='dot'> </span>" + dataOb.supplier_advance_status_id.status + "</span>";
  }
};
// Refresh Form
const refreshForm = () => {
  advance = new Object();
  selectedAdvance = new Object();

  // Load Suppliers
  const suppliers = getServiceRequest("/supplier/alldatabystatus");
  dataFilIntoSelect(selectSupplier, "Select Supplier", suppliers, "transportname");

  // Reset Form
  advanceForm.reset();

  // Reset Validation Classes
  selectSupplier.classList.remove("is-valid", "is-invalid");
  selectVehicle.classList.remove("is-valid", "is-invalid");
  textAmount.classList.remove("is-valid", "is-invalid");
  selectMethod.classList.remove("is-valid", "is-invalid");
  textDescription.classList.remove("is-valid", "is-invalid");
  textReference.classList.remove("is-valid", "is-invalid");

  // Set Default Objects and Values
  advance.supplier_id = null;
  advance.vehicle_id = null;
  advance.amount = null;
  advance.payment_method = null;
  advance.description = null;
  advance.reference_no = "";

  selectSupplier.value = "";
  refreshVehicleList();

  // UI Updates
  document.getElementById("availableBalanceText").style.display = "none";
};

// Toggle Modal or Submit Logic
const submitForm = () => {
  const errors = checkFormErrors();
  if (errors === "") {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to save this advance payment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Save it!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Ensure values are correct before sending
        if (typeof advance.amount === "string") {
          advance.amount = parseFloat(advance.amount.replace(/[^0-9.]/g, ""));
        }

        const response = httpServiceRequest("/advancepayment/insert", "POST", advance);
        if (response === "ok") {
          Swal.fire("Saved!", "Advance record saved successfully.", "success");
          $("#advanceFormModal").modal("hide");
          refreshTable();
          refreshForm();
        } else {
          Swal.fire("Error!", response, "error");
        }
      }
    });
  } else {
    Swal.fire("Form Errors!", errors, "error");
  }
};

let currentAvailableBalance = 0;

const calculateAvailableBalance = () => {
  if (advance.vehicle_id != null) {
    const vehicleId = advance.vehicle_id.id;

    // 1. Get Monthly Earned Amount
    const packagePrice = parseFloat(getServiceRequest("/package/suppricebyvehicleid?vehicleid=" + vehicleId));
    const currentMonthTotalDistance = parseFloat(getServiceRequest("booking/totaldistanceforselectedvehicle?vehicleid=" + vehicleId));
    const packagename = getServiceRequest("/package/packagenamebyvehicleid?vehicleid=" + vehicleId);
    const currentMonthBookingCount = parseInt(getServiceRequest("/booking/completedbookingcountbyvehicle?vehicleId=" + vehicleId));

    let totalEarned = 0;
    if (!isNaN(packagePrice)) {
      if (packagename == "Floating Rate") {
        if (!isNaN(currentMonthTotalDistance)) {
          totalEarned = packagePrice * currentMonthTotalDistance;
        }
      } else {
        if (!isNaN(currentMonthBookingCount)) {
          totalEarned = (packagePrice / 25) * currentMonthBookingCount;
        }
      }
    }

    // 2. Get Deductions
    const deductionObj = getServiceRequest("/advancepayment/getDeductions?vehicle_id=" + vehicleId);
    const totalDeductions = parseFloat(deductionObj.totalDeduction || 0);

    console.log("Total Deductions:", totalDeductions);

    // 3. Current Available Balance
    currentAvailableBalance = totalEarned - totalDeductions;

    // Prevent negative balance display
    if (currentAvailableBalance < 0) {
      currentAvailableBalance = 0;
    }

    document.getElementById("availableBalanceText").style.display = "block";

    const displayBalanceElement = document.getElementById("availableBalanceAmount");
    displayBalanceElement.innerText = currentAvailableBalance.toLocaleString("en-US", { style: "currency", currency: "LKR" });

    if (currentAvailableBalance <= 0) {
      displayBalanceElement.classList.replace("text-success", "text-danger");
    } else {
      displayBalanceElement.classList.replace("text-danger", "text-success");
    }
  } else {
    document.getElementById("availableBalanceText").style.display = "none";
    currentAvailableBalance = 0;
  }
};

const refreshVehicleList = () => {
  if (advance.supplier_id != null) {
    const vehicles = getServiceRequest("/vehicle/bysupplierid?supplierid=" + advance.supplier_id.id);
    dataFilIntoSelect(selectVehicle, "Select Vehicle", vehicles, "vehicle_no");
  } else {
    selectVehicle.innerHTML = "<option value=''>Select Supplier First</option>";
    selectVehicle.classList.remove("is-valid", "is-invalid");
    advance.vehicle_id = null;
  }
  calculateAvailableBalance();
};

const textAmountElement = document.getElementById("textAmount");
textAmountElement.addEventListener("keyup", () => {
  let requestedAmount = parseFloat(textAmountElement.value.replace(/,/g, ""));

  if (!isNaN(requestedAmount) && requestedAmount > currentAvailableBalance) {
    textAmountElement.classList.remove("is-valid");
    textAmountElement.classList.add("is-invalid");

    Swal.fire({
      title: "Insufficient Balance",
      text: "Advance amount cannot be greater than the available balance: LKR " + currentAvailableBalance.toFixed(2),
      icon: "error",
      customClass: { popup: "swal2-border-radius" },
    });

    textAmountElement.value = "";
    advance.amount = null;
  }
});

const checkFormErrors = () => {
  let errors = "";
  if (advance.supplier_id == null) errors += "Supplier is required.<br>";
  if (advance.vehicle_id == null) errors += "Vehicle is required.<br>";
  if (advance.amount == null || advance.amount == 0 || advance.amount > currentAvailableBalance) errors += "Valid Amount below balance is required.<br>";
  if (advance.payment_method == null || advance.payment_method == "") errors += "Payment method is required.<br>";
  if (advance.description == null || advance.description == "") errors += "Description is required.<br>";
  return errors;
};

// Dummy functions for table actions (since advances usually shouldn't be edited/deleted after payment)
const viewAdvance = (obj) => {
  selectedAdvance = JSON.parse(JSON.stringify(obj)); // Deep copy to avoid reference issues

  document.getElementById("viewAdvanceNo").innerText = `#${obj.advance_no}`;
  document.getElementById("viewAmount").innerText = parseFloat(obj.amount).toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });
  document.getElementById("viewMethod").innerText = obj.payment_method.toUpperCase();
  document.getElementById("viewSupplier").innerText = getSupplierName(obj);
  document.getElementById("viewVehicle").innerText = obj.vehicle_id ? obj.vehicle_id.vehicle_no : "-";
  document.getElementById("viewDescription").innerText = obj.description;
  document.getElementById("viewDate").innerText = getAddedDateTime(obj);
  document.getElementById("viewReference").innerText = obj.reference_no || "-";

  // Control button visibility
  const decisionButtons = document.getElementById("decisionButtons");
  if (obj.supplier_advance_status_id.status == "Pending") {
    decisionButtons.classList.remove("d-none");
    decisionButtons.classList.add("d-flex");
    printButtons.style.display = "none";
  } else {
    decisionButtons.classList.add("d-none");
    decisionButtons.classList.remove("d-flex");
    printButtons.style.display = "";
  }

  $("#advanceViewModal").modal("show");
};

// approve karana btn eke function eka
const approveRequest = () => {
  Swal.fire({
    title: "Approve Advance?",
    text: `Are you sure you want to approve advance ${selectedAdvance.advance_no}?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#10b981",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Approve",
  }).then((result) => {
    if (result.isConfirmed) {
      const response = httpServiceRequest("/advancepayment/approve", "PUT", selectedAdvance);
      if (response === "ok") {
        Swal.fire("Approved!", "Advance payment has been approved.", "success");
        $("#advanceViewModal").modal("hide");
        refreshTable();
      } else {
        Swal.fire("Error!", response, "error");
      }
    }
  });
};

// reject katana button eke function ea
const rejectRequest = () => {
  Swal.fire({
    title: "Reject Advance?",
    text: `Are you sure you want to reject advance ${selectedAdvance.advance_no}?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Reject",
  }).then((result) => {
    if (result.isConfirmed) {
      const response = httpServiceRequest("/advancepayment/reject", "PUT", selectedAdvance);
      if (response === "ok") {
        Swal.fire("Rejected!", "Advance payment has been rejected.", "success");
        $("#advanceViewModal").modal("hide");
        refreshTable();
      } else {
        Swal.fire("Error!", response, "error");
      }
    }
  });
};

const printAdvanceDetail = () => {
  const printContent = document.querySelector("#advanceViewModal .modal-body").innerHTML;
  const newWindow = window.open("", "_blank");
  newWindow.document.write(`
        <html>
            <head>
                <title>Advance Detail - OKI-DOKI</title>
                <link rel="stylesheet" href="/bootstrap/bootstrap-5.2.3/css/bootstrap.min.css">
                <link rel="stylesheet" href="/css/advancePayment.css">
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

const editAdvance = (obj) => {
  Swal.fire("Info", "Advance records are historical and cannot be edited. Please delete and recreacte if it was a mistake and not yet processed.", "info");
};

const deleteAdvanceRecord = (obj) => {
  Swal.fire("Info", "Deletion of financial records is restricted. Contact Administrator.", "warning");
};

// approval data wala data fill karanwa.stsut eka approv hari reject hari view icon ekak show karanwa.pending nam approve icon eka show karawna
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
    const status = dataOb.supplier_advance_status_id.status;
    let icon = "fa-eye"; // Default for Approved/Reject
    let title = "View Details";

    if (status === "Pending") {
      icon = "fa-file-signature"; // Icon for Action
      title = "Approve or Reject ";
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
