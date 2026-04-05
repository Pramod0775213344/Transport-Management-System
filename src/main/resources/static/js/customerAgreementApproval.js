window.addEventListener("load", () => {
  loadCustomerAgreementApprovalTable();
  refreshCustomerAgreementAprrovalForm();
});

// load customer agreement approval table
const loadCustomerAgreementApprovalTable = () => {
  if ($.fn.dataTable.isDataTable("#customerAgreementApprovalTable")) {
    $("#customerAgreementApprovalTable").DataTable().clear().destroy();
  }

  const customerAgreementByStatus = getServiceRequest("/customeragreementapprove/bycustomeragreementstatusid");

  const propertyList = [
    { propertyName: "cus_agreement_no", dataType: "string" },
    { propertyName: getCustomer, dataType: "function" },
    { propertyName: getPackage, dataType: "function" },
    { propertyName: getPackageRate, dataType: "function" },
    { propertyName: "agreement_end_date", dataType: "string" },
    { propertyName: getCustomerAgreementStatus, dataType: "function" },
  ];

  datafillApprovalTable(customerAgreementAprrovalTableBody, customerAgreementByStatus, propertyList, customerAgreemnentView);

  const table = $("#customerAgreementApprovalTable").DataTable({
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

// get customer name
const getCustomer = (dataOb) => {
  return dataOb.customer_id.company_name;
};

// get package name
const getPackage = (dataOb) => {
  return dataOb.package_id.name;
};

// get package rate
const getPackageRate = (dataOb) => {
  return dataOb.package_id.package_charge_cus;
};

// get customer agreement status
const getCustomerAgreementStatus = (dataOb) => {
  if (dataOb.customer_agreement_status_id.status == "Approved") {
    return "<span class='status-badge status-active'>" + dataOb.customer_agreement_status_id.status + "</span>";
  }

  if (dataOb.customer_agreement_status_id.status == "Pending") {
    return "<span class='status-badge status-pending'> " + dataOb.customer_agreement_status_id.status + "</span>";
  }
  if (dataOb.customer_agreement_status_id.status == "Expired") {
    return "<span class='status-badge status-inactive'> " + dataOb.customer_agreement_status_id.status + "</span>";
  }
  if (dataOb.customer_agreement_status_id.status == "Deleted") {
    return "<span class='status-badge status-inactive'> " + dataOb.customer_agreement_status_id.status + "</span>";
  }
};

// view customer agreement
const customerAgreemnentView = (dataOb) => {
  // set selected object
  editOb = JSON.parse(JSON.stringify(dataOb));

  dataAgreementStatus.innerText = dataOb.customer_agreement_status_id.status;

  // Update status badge class
  dataAgreementStatus.className = "badge px-3 py-2";
  if (dataOb.customer_agreement_status_id.status === "Pending") dataAgreementStatus.classList.add("pending");
  else if (dataOb.customer_agreement_status_id.status === "Approved") dataAgreementStatus.classList.add("approved");
  else dataAgreementStatus.classList.add("rejected");

  // Button Visibility Control
  const decisionButtons = document.getElementById("agreementDecisionButtons");
  const printBtn = document.getElementById("printAgreementBtn");

  if (dataOb.customer_agreement_status_id.status === "Pending") {
    decisionButtons.classList.remove("d-none");
    printBtn.classList.add("d-none");
  } else {
    decisionButtons.classList.add("d-none");
    printBtn.classList.remove("d-none");
  }

  dataCus_Reg_No.innerHTML = dataOb.customer_id.customer_reg_no;
  dataCompanyname.innerHTML = dataOb.customer_id.company_name;

  dataContactPersonName.innerHTML = dataOb.customer_id.contact_person_fullname;
  dataContactPersonEmail.innerHTML = dataOb.customer_id.contact_person_email;
  dataContactPersonMobile.innerHTML = dataOb.customer_id.contact_person_mobileno;

  dataPackageName.innerHTML = dataOb.package_id.name;
  dataVehicleType.innerHTML = dataOb.package_id.vehicle_type_id.name;
  dataCustomerRate.innerHTML = dataOb.package_id.package_charge_cus;

  dataDistance.innerHTML = dataOb.package_id.distance;
  dataAdditionalKMChargeCustomer.innerHTML = dataOb.package_id.additinal_km_charge_cus;

  dataAgreementRegNo.innerHTML = dataOb.cus_agreement_no;
  dataAgreementStartDate.innerHTML = dataOb.agreement_date;
  dataAgreementPeriod.innerHTML = dataOb.agreement_period;
  dataEndDate.innerHTML = dataOb.agreement_end_date;

  customerAgreementApprovalNote.value = dataOb.approval_note;

  let selectedCompany = dataOb.customer_id;
  const customerAgreements = getServiceRequest("/customeragreement/bycutomer?customerId=" + selectedCompany.id);
  console.log(customerAgreements, "agreement");
  if (customerAgreements && customerAgreements.length > 0) {
    customerAgreementViewTable.style.display = "";
    newCustomerNote.style.display = "none";
    const propertyList = [
      { propertyName: "cus_agreement_no", dataType: "string" },
      {
        propertyName: (dataOb) => dataOb.vehicle_type_id.name,
        dataType: "function",
      },
      {
        propertyName: (dataOb) => dataOb.package_id.name,
        dataType: "function",
      },
    ];
    dataFillIntoTheReportTable(customerAgreementViewTableBody, customerAgreements, propertyList);
  } else {
    customerAgreementViewTable.style.display = "none";
    newCustomerNote.style.display = "";
  }

  $("#customerAgreementAprrovalModal").modal("show");
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
    const status = dataOb.customer_agreement_status_id.status;
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

// Approval button
const customerAgreementAprrovalButton = () => {
  console.log("customerAgreementAprrovalButton", editOb);
  let dataOb = editOb;

  let userConfirm = Swal.fire({
    title: "Confirm Approval",
    text: "Are you sure you want to approve this customer agreement?",
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
      let putResponse = httpServiceRequest("/customeragreementapprove/update", "PUT", dataOb);
      if (putResponse == "ok") {
        Swal.fire({
          title: "Agreement Approved!",
          text: "The customer agreement has been successfully approved.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-border-radius",
          },
        });
        loadCustomerAgreementApprovalTable();
        refreshCustomerAgreementAprrovalForm();
        $("#customerAgreementAprrovalModal").modal("hide");
      } else {
        Swal.fire({
          title: "Approval Not Completed",
          text: putResponse,
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

// reject button
const customerAgreementRejectButton = () => {
  console.log("customerAgreementRejectButton", editOb);
  let userConfirm = Swal.fire({
    title: "Confirm Rejection",
    text: "Are you sure you want to reject this agreement? This action cannot be undone!",
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
      let deleteResponse = httpServiceRequest("/customeragreementapprove/reject", "PUT", editOb);
      if (deleteResponse == "ok") {
        Swal.fire({
          title: "Agreement Rejected!",
          text: "The customer agreement has been rejected.",
          icon: "success",
          iconColor: "#ef4444",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-border-radius",
          },
        });
        loadCustomerAgreementApprovalTable();
        refreshCustomerAgreementAprrovalForm();
        $("#customerAgreementAprrovalModal").modal("hide");
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

const refreshCustomerAgreementAprrovalForm = () => {
  customerAgreement = new Object();
};

// table loading show function
function showTableLoading() {
  const loader = document.getElementById("tableOverlay");
  const table = document.getElementById("customerAgreementApprovalTable");
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

//Alert Box Call function
Swal.isVisible();
