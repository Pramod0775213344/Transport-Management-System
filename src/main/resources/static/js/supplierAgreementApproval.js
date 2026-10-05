window.addEventListener("load", () => {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      loadSupplierAgreementApprovalCardList();
      refreshSupplierAgreementAprrovalForm();
    } catch (e) {
      console.error("Error during supplier-agreement-approval page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);
});

// ==================== card list load functions =================================
// load supplier agreement approval table
const loadSupplierAgreementApprovalCardList = () => {
  // if ($.fn.dataTable.isDataTable("#supplierAgreementApprovalTable")) {
  //   $("#supplierAgreementApprovalTable").DataTable().clear().destroy();
  // }
  const supplierAgreementByStatus = getServiceRequest(
    "/supplieragreementapprove/bysupplieragreementstatusid",
  );

  // const propertyList = [
  //   { propertyName: "sup_agreement_no", dataType: "string" },
  //   { propertyName: getSupplier, dataType: "function" },
  //   { propertyName: getPackage, dataType: "function" },
  //   { propertyName: getPackageRate, dataType: "function" },
  //   { propertyName: "agreement_end_date", dataType: "string" },
  //   { propertyName: getSupplierAgreementStatus, dataType: "function" },
  // ];

  // datafillApprovalTable(
  //   supplierAgreementAprrovalTableBody,
  //   supplierAgreementByStatus,
  //   propertyList,
  //   supplierAgreemnentView,
  // );
  fillSupplierAgreementCards("agreementCardContainer", supplierAgreementByStatus, supplierAgreemnentView);

  // const table = $("#supplierAgreementApprovalTable").DataTable({
  //   dom: "rtip",
  //   pageLength: 10,
  //   createdRow: function (row, data, dataIndex) {
  //     $(row).find("td").css({
  //       "text-align": "center",
  //       "vertical-align": "middle",
  //       height: "80px",
  //     });
  //   },
  //   headerCallback: function (thead, data, start, end, display) {
  //     $(thead).find("th").css({
  //       "text-align": "center",
  //       padding: "20px",
  //     });
  //   },
  // });

  // // Custom Search Control
  // document.getElementById("tableSearch").addEventListener("keyup", function () {
  //   table.search(this.value).draw();
  // });

  // // Custom Length Control
  // document
  //   .getElementById("tableLength")
  //   .addEventListener("change", function () {
  //     table.page.len(this.value).draw();
  //   });

  // applyPrivileges("Supplier Agreement Approval Management", "supplierAgreementApprovalTable", {
  //   update: [approveButton, rejectButton],
  // });

  // table.on("draw.dt", function () {
  //   applyPrivileges("Supplier Agreement Approval Management", "supplierAgreementApprovalTable", { update: [approveButton, rejectButton] });
  // });
};

const fillSupplierAgreementCards = (parentId, agreements, viewFunction) => {

  let container = document.getElementById(parentId);
  container.innerHTML = "";

  agreements.forEach((agreement) => {

    let card = document.createElement("div");
    card.classList.add("main-card");

    // supplier name - company or individual අනුව
    let supplierName = agreement.supplier_id.category_type === "Company"
      ? agreement.supplier_id.company_name
      : agreement.supplier_id.fullname;

    // status class
    let statusClass = "";
    switch (agreement.supplier_agreement_status_id.status) {
      case "Approved":
        statusClass = "status-approved";
        break;
      case "Pending":
        statusClass = "status-pending";
        break;
      default:
        statusClass = "status-rejected";
        break;
    }

    card.innerHTML = `
            <div class="card-header">
                <div class="header-left">
                    <div class="icon-badge">
                        <i class="fa-solid fa-truck"></i>
                    </div>
                    <div>
                        <h5 class="fw-bold mb-1">${agreement.sup_agreement_no}</h5>
                        <small class="text-muted">${supplierName}</small>
                    </div>
                </div>

                <span class="status-badge ${statusClass}">
                    ${agreement.supplier_agreement_status_id.status}
                </span>
            </div>

            <div class="agreement-details">
                <div class="detail-item">
                    <small class="text-muted">Vehicle No</small>
                    <p>${agreement.vehicle_id.vehicle_no}</p>
                </div>
                <div class="detail-item">
                    <small class="text-muted">Vehicle Type</small>
                    <p>${agreement.vehicle_id.vehicle_type_id.name}</p>
                </div>
                <div class="detail-item">
                    <small class="text-muted">Agreement Date</small>
                    <p>${agreement.agreement_date}</p>
                </div>
                <div class="detail-item">
                    <small class="text-muted">End Date</small>
                    <p>${agreement.agreement_end_date}</p>
                </div>
                <div class="detail-item">
                    <small class="text-muted">Period</small>
                    <p>${agreement.agreement_period} Months</p>
                </div>
                <div class="detail-item">
                    <small class="text-muted">Supplier Rate</small>
                    <p>LKR ${agreement.package_id.package_charge_sup.toLocaleString()}</p>
                </div>
            </div>

            <div class="card-footer">
                <div>
                    <small class="text-muted">KM Limit</small>
                    <p class="mb-0">${agreement.package_id.distance} KM</p>
                </div>
                <button class="btn btn-cancel" style="color: #000000;" id="reviewBtn">
                    <i class="fa-solid fa-eye me-2"></i> Review
                </button>
            </div>
        `;

    card.querySelector("#reviewBtn").addEventListener("click", () => {
      viewFunction(agreement);
    });

    container.appendChild(card);
  });
}
// ==================== end card list load functions =================================



// ================= view function =========================
// view supplier agreement
const supplierAgreemnentView = (dataOb) => {
  openAgreementReviewPanel();
  // set selected object
  editOb = JSON.parse(JSON.stringify(dataOb));

  dataAgreementStatus.innerText = dataOb.supplier_agreement_status_id.status;

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

  dataAgreementPeriod.innerText = dataOb.agreement_period;
  dataAgreementStartDate.innerText = dataOb.agreement_date;
  dataAgreementEndDate.innerText = dataOb.agreement_end_date;

  supplierAgreementApprovalNote.value = dataOb.approval_note;

  const otherAgreementsSection = document.getElementById("otherAgreementsSection");

  const supplierAgreements = getServiceRequest(
    "/supplieragreement/filterbysupplierid?supplierId=" + dataOb.supplier_id.id,
  );
  console.log(supplierAgreements, "agreement");
  // without seleted agreememt
  const withoutCurruntAgreement = supplierAgreements.filter(agreement => agreement.id !== dataOb.id)

  if (withoutCurruntAgreement && withoutCurruntAgreement.length > 0) {
    otherAgreementsSection.style.display = "";
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
      withoutCurruntAgreement,
      propertyList,
    );
  } else {
    otherAgreementsSection.style.display = "none";
    newSupplierNote.style.display = "";
  }

};
// ==================== end view function =================================



// =================== approval and reject button functions =========================
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
        closeAgreementReviewPanel();
        loadSupplierAgreementApprovalCardList();
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
        closeAgreementReviewPanel();
        loadSupplierAgreementApprovalCardList();
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
// ==================== end approval and reject button functions =========================


// ==================== form refresh function =========================
// form refresh function
const refreshSupplierAgreementAprrovalForm = () => {
  supplierAgreement = new Object();
};
// ================== end form refresh function =========================


// Alert Box Call function
Swal.isVisible();


// ============================ view overalyy  =========================
//view overalyy details
const openAgreementReviewPanel = () => {
  document.getElementById("main").classList.add("open");
};

const closeAgreementReviewPanel = () => {
  document.getElementById("main").classList.remove("open");
};
// ========================== end view overalyy  =========================