window.addEventListener("load", () => {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      loadSupplierAgreementApprovalTable();
      refreshSupplierAgreementAprrovalForm();
    } catch (e) {
      console.error("Error during supplier-agreement-approval page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);
});

// load supplier agreement approval table
const loadSupplierAgreementApprovalTable = () => {
  if ($.fn.dataTable.isDataTable("#supplierAgreementApprovalTable")) {
    $("#supplierAgreementApprovalTable").DataTable().clear().destroy();
  }
  const supplierAgreementByStatus = getServiceRequest(
    "/supplieragreementapprove/bysupplieragreementstatusid",
  );

  const propertyList = [
    { propertyName: "sup_agreement_no", dataType: "string" },
    { propertyName: getSupplier, dataType: "function" },
    { propertyName: getPackage, dataType: "function" },
    { propertyName: getPackageRate, dataType: "function" },
    { propertyName: "agreement_end_date", dataType: "string" },
    { propertyName: getSupplierAgreementStatus, dataType: "function" },
  ];

  datafillApprovalTable(
    supplierAgreementAprrovalTableBody,
    supplierAgreementByStatus,
    propertyList,
    supplierAgreemnentView,
  );

  const table = $("#supplierAgreementApprovalTable").DataTable({
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
  document
    .getElementById("tableLength")
    .addEventListener("change", function () {
      table.page.len(this.value).draw();
    });

  applyPrivileges("Supplier Agreement Approval Management", "supplierAgreementApprovalTable", {
    update: [approveButton, rejectButton],
  });

  table.on("draw.dt", function () {
    applyPrivileges("Supplier Agreement Approval Management", "supplierAgreementApprovalTable", { update: [approveButton, rejectButton] });
  });
};

// get supplier name
const getSupplier = (dataOb) => {
  if (dataOb.supplier_id.category_type === "Company") {
    return dataOb.supplier_id.company_name;
  }
  return dataOb.supplier_id.fullname;
};

// get package name
const getPackage = (dataOb) => {
  return dataOb.package_id.name;
};

// get package rate
const getPackageRate = (dataOb) => {
  return dataOb.package_id.package_charge_sup;
};

// get supplier agreement status
const getSupplierAgreementStatus = (dataOb) => {
  if (dataOb.supplier_agreement_status_id.status == "Approved") {
    return (
      "<span class='status-badge status-active'>" +
      dataOb.supplier_agreement_status_id.status +
      "</span>"
    );
  }
  if (dataOb.supplier_agreement_status_id.status == "Pending") {
    return (
      "<span class='status-badge status-pending'> " +
      dataOb.supplier_agreement_status_id.status +
      "</span>"
    );
  }
  if (dataOb.supplier_agreement_status_id.status == "Expired") {
    return (
      "<span class='status-badge status-inactive'> " +
      dataOb.supplier_agreement_status_id.status +
      "</span>"
    );
  }
  if (dataOb.supplier_agreement_status_id.status == "Deleted") {
    return (
      "<span class='status-badge status-inactive'> " +
      dataOb.supplier_agreement_status_id.status +
      "</span>"
    );
  }
};

// view supplier agreement
const supplierAgreemnentView = (dataOb) => {
  // set selected object
  editOb = JSON.parse(JSON.stringify(dataOb));

  dataAgreementStatus.innerText = dataOb.supplier_agreement_status_id.status;

  // Update status badge class
  dataAgreementStatus.className = "badge px-3 py-2";
  if (dataOb.supplier_agreement_status_id.status === "Pending")
    dataAgreementStatus.classList.add("pending");
  else if (dataOb.supplier_agreement_status_id.status === "Approved")
    dataAgreementStatus.classList.add("approved");
  else dataAgreementStatus.classList.add("rejected");

  // Button Visibility Control
  const decisionButtons = document.getElementById("agreementDecisionButtons");
  const printBtn = document.getElementById("printAgreementBtn");

  if (dataOb.supplier_agreement_status_id.status === "Pending") {
    decisionButtons.classList.remove("d-none");
    printBtn.classList.add("d-none");
  } else {
    decisionButtons.classList.add("d-none");
    printBtn.classList.remove("d-none");
  }

  if (dataOb.supplier_id.category_type === "Company") {
    dataSupplierName.innerText = dataOb.supplier_id.company_name;
    dataSupplierEmail.innerText = dataOb.supplier_id.company_email;
    dataSupplierMobile.innerText = dataOb.supplier_id.company_contact_no;
    dataSupplierAddress.innerText = dataOb.supplier_id.company_address;
  } else {
    dataSupplierName.innerText = dataOb.supplier_id.fullname;
    dataSupplierEmail.innerText = dataOb.supplier_id.email;
    dataSupplierMobile.innerText = dataOb.supplier_id.mobileno;
    dataSupplierAddress.innerText = dataOb.supplier_id.address;
  }

  dataTransportName.innerText = dataOb.supplier_id.transportname;
  dataVehicleNo.innerText = dataOb.vehicle_id.vehicle_no;
  dataVehicleType.innerText = dataOb.vehicle_id.vehicle_type_id.name;
  dataVehicleYear.innerText = dataOb.vehicle_id.make_year;

  dataPackageName.innerText = dataOb.package_id.name;
  dataSupplierRate.innerText = dataOb.package_id.package_charge_sup;
  dataPackageDistance.innerText = dataOb.package_id.distance;
  dataAdditionalKMCharge.innerText = dataOb.package_id.additinal_km_charge_sup;

  dataAgreementNo.innerText = dataOb.sup_agreement_no;
  dataAgreementPeriod.innerText = dataOb.agreement_period;
  dataAgreementStartDate.innerText = dataOb.agreement_date;
  dataAgreementEndDate.innerText = dataOb.agreement_end_date;

  supplierAgreementApprovalNote.value = dataOb.approval_note;

  const supplierAgreements = getServiceRequest(
    "/supplieragreement/filterbysupplierid?supplierId=" + dataOb.supplier_id.id,
  );
  console.log(supplierAgreements, "agreement");
  if (supplierAgreements && supplierAgreements.length > 0) {
    supplierAgreementViewTable.style.display = "";
    newSupplierNote.style.display = "none";
    const propertyList = [
      { propertyName: "sup_agreement_no", dataType: "string" },
      {
        propertyName: (dataOb) => dataOb.vehicle_id.vehicle_type_id.name,
        dataType: "function",
      },
      {
        propertyName: (dataOb) => dataOb.package_id.name,
        dataType: "function",
      },
    ];
    dataFillIntoTheReportTable(
      supplierAgreementViewTableBody,
      supplierAgreements,
      propertyList,
    );
  } else {
    supplierAgreementViewTable.style.display = "none";
    newSupplierNote.style.display = "";
  }

  $("#supplierAgreementAprrovalModal").modal("show");
};

// approval data wala data fill karanwa.stsut eka approv hari reject hari view icon ekak show karanwa.pending nam approve icon eka show karawna
const datafillApprovalTable = (
  tableBody,
  dataList,
  propertyList,
  viewFunction,
) => {
  tableBody.innerHTML = "";
  dataList.forEach((dataOb, index) => {
    let tr = document.createElement("tr");

    let tdIndex = document.createElement("td");
    tdIndex.innerHTML = parseInt(index) + 1;
    tr.appendChild(tdIndex);

    propertyList.forEach((property) => {
      let td = document.createElement("td");
      if (property.dataType == "string")
        td.innerHTML = dataOb[property.propertyName];
      if (property.dataType == "function")
        td.innerHTML = property.propertyName(dataOb);
      if (property.dataType == "decimal")
        td.innerHTML = parseFloat(dataOb[property.propertyName]).toFixed(2);
      tr.appendChild(td);
    });

    let tdButton = document.createElement("td");
    let buttonDiv = document.createElement("div");
    buttonDiv.className = "actions";

    let actionBtn = document.createElement("button");
    actionBtn.className = "action-btn share";

    // Logic: If Pending -> Action Icon, If Approved/Reject -> View Icon
    const status = dataOb.supplier_agreement_status_id.status;
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
const supplierAgreementAprrovalButton = () => {
  console.log("supplierAgreementAprrovalButton", editOb);
  let dataOb = editOb;

  let userConfirm = Swal.fire({
    title: "Confirm Approval",
    text: "Are you sure you want to approve this supplier agreement?",
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
      let putResponse = httpServiceRequest(
        "/supplieragreementapprove/update",
        "PUT",
        dataOb,
      );
      if (putResponse == "ok") {
        Swal.fire({
          title: "Agreement Approved!",
          text: "The supplier agreement has been successfully approved.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-border-radius",
          },
        });
        loadSupplierAgreementApprovalTable();
        refreshSupplierAgreementAprrovalForm();
        $("#supplierAgreementAprrovalModal").modal("hide");
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
const supplierAgreementRejectButton = () => {
  console.log("supplierAgreementRejectButton", editOb);
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
      let deleteResponse = httpServiceRequest(
        "/supplieragreementapprove/reject",
        "PUT",
        editOb,
      );
      if (deleteResponse == "ok") {
        Swal.fire({
          title: "Agreement Rejected!",
          text: "The supplier agreement has been rejected.",
          icon: "success",
          iconColor: "#ef4444",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-border-radius",
          },
        });
        loadSupplierAgreementApprovalTable();
        refreshSupplierAgreementAprrovalForm();
        $("#supplierAgreementAprrovalModal").modal("hide");
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

// form refresh function
const refreshSupplierAgreementAprrovalForm = () => {
  supplierAgreement = new Object();
};

// Export Functionality
const exportTable = (type) => {
  const tableSelector = "#supplierAgreementApprovalTable";

  if (type === "excel") {
    exportTableToExcelWithSheetJS(tableSelector, "supplier_agreement_approvals", {
      sheetName: "SupplierAgreementApprovals",
    });
  } else if (type === "pdf") {
    exportTableToPdfWithJsPdf(tableSelector, "supplier_agreement_approvals", {
      title: "Supplier Agreement Approvals",
    });
  } else if (type === "print") {
    window.print();
  }
};

// table loading show function
function showTableLoading() {
  const loader = document.getElementById("tableOverlay");
  const table = document.getElementById("supplierAgreementApprovalTable");
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

// Alert Box Call function
Swal.isVisible();
