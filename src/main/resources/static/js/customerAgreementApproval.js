// ================== load functions ===========================
window.addEventListener("load", () => {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      loadCustomerAgreementApprovalCardList();
      refreshCustomerAgreementAprrovalForm();
    } catch (e) {
      console.error("Error during customer-agreement-approval page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);
});
// ============== end load functions ===============================


// ============== load cards fucnctions ===============================
// load customer agreement approval card list
const loadCustomerAgreementApprovalCardList = () => {
  const customerAgreementByStatus = getServiceRequest("/customeragreementapprove/bycustomeragreementstatusid");
  fillCustomerAgreementCards("agreementCardContainer", customerAgreementByStatus, customerAgreemnentView);
};

const fillCustomerAgreementCards = (parentId, agreements, viewFunction) => {

  let container = document.getElementById(parentId);
  container.innerHTML = "";

  agreements.forEach((agreement) => {

    let card = document.createElement("div");
    card.classList.add("main-card");

    card.innerHTML = `
            <div class="card-header">
                <div class="header-left">
                    <div class="icon-badge">
                        <i class="fa-solid fa-file-lines"></i>
                    </div>
                    <div>
                        <h5 class="fw-bold mb-1">${agreement.cus_agreement_no}</h5>
                        <small class="text-muted">${agreement.customer_id.company_name}</small>
                    </div>
                </div>

                <span class="status-badge status-pending">
                    ${agreement.customer_agreement_status_id.status}
                </span>
            </div>

            <div class="agreement-details">
                <div class="detail-item">
                    <small class="text-muted">Package</small>
                    <p>${agreement.package_id.name}</p>
                </div>
                <div class="detail-item">
                    <small class="text-muted">Vehicle Type</small>
                    <p>${agreement.vehicle_type_id.name}</p>
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
                    <small class="text-muted">Customer Rate</small>
                    <p>LKR ${agreement.package_id.package_charge_cus.toLocaleString()}</p>
                </div>
            </div>

            <div class="card-footer">
                <div>
                    <small class="text-muted">KM Limit</small>
                    <p class="mb-0">${agreement.package_id.distance} KM</p>
                </div>
                <button class="btn btn-cancel" style="color: #000000;;" id="reviewBtn"><i class="fa-solid fa-eye me-2"></i> Review</button>
            </div>
        `;

    card.querySelector("#reviewBtn").addEventListener("click", () => {
      viewFunction(agreement);
    });

    container.appendChild(card);
  });
}
// ============== end load card functions ===========================


// ================ view functions =================================
// view customer agreement
const customerAgreemnentView = (dataOb) => {
  openAgreementReviewPanel()
  // set selected object
  editOb = JSON.parse(JSON.stringify(dataOb));

  dataAgreementStatus.innerText = dataOb.customer_agreement_status_id.status;


  dataCompanyname.innerHTML = dataOb.customer_id.company_name;

  dataContactPersonName.innerHTML = dataOb.customer_id.contact_person_fullname;
  dataContactPersonEmail.innerHTML = dataOb.customer_id.contact_person_email;
  dataContactPersonMobile.innerHTML = dataOb.customer_id.contact_person_mobileno;

  dataPackageName.innerHTML = dataOb.package_id.name;
  dataVehicleType.innerHTML = dataOb.package_id.vehicle_type_id.name;
  dataCustomerRate.innerHTML = dataOb.package_id.package_charge_cus;

  dataDistance.innerHTML = dataOb.package_id.distance;
  dataAdditionalKMChargeCustomer.innerHTML = dataOb.package_id.additinal_km_charge_cus;

  dataAgreementStartDate.innerHTML = dataOb.agreement_date;
  dataAgreementPeriod.innerHTML = dataOb.agreement_period;
  dataEndDate.innerHTML = dataOb.agreement_end_date;

  customerAgreementApprovalNote.value = dataOb.approval_note;

  let selectedCompany = dataOb.customer_id;
  const customerAgreements = getServiceRequest("/customeragreement/bycutomer?customerId=" + selectedCompany.id);
  console.log(customerAgreements, "agreement");
  // currunt agreement eka nathuwa
  const withoutCurruntAgreement = customerAgreements.filter(agreement => agreement.id !== dataOb.id)
  const otherAgreementsSection = document.getElementById("otherAgreementsSection");

  if (withoutCurruntAgreement && withoutCurruntAgreement.length > 0) {
    otherAgreementsSection.style.display = "";
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
    dataFillIntoTheReportTable(customerAgreementViewTableBody, withoutCurruntAgreement, propertyList);
  } else {
    otherAgreementsSection.style.display = "none";
    newCustomerNote.style.display = "";
  }

};
// ================ end view functions ============================



// approval data wala data fill karanwa.stsut eka approv hari reject hari view icon ekak show karanwa.pending nam approve icon eka show karawna
// const datafillApprovalTable = (tableBody, dataList, propertyList, viewFunction) => {
//   tableBody.innerHTML = "";
//   dataList.forEach((dataOb, index) => {
//     let tr = document.createElement("tr");

//     let tdIndex = document.createElement("td");
//     tdIndex.innerHTML = parseInt(index) + 1;
//     tr.appendChild(tdIndex);

//     propertyList.forEach((property) => {
//       let td = document.createElement("td");
//       if (property.dataType == "string") td.innerHTML = dataOb[property.propertyName];
//       if (property.dataType == "function") td.innerHTML = property.propertyName(dataOb);
//       if (property.dataType == "decimal") td.innerHTML = parseFloat(dataOb[property.propertyName]).toFixed(2);
//       tr.appendChild(td);
//     });

//     let tdButton = document.createElement("td");
//     let buttonDiv = document.createElement("div");
//     buttonDiv.className = "actions";

//     let actionBtn = document.createElement("button");
//     actionBtn.className = "action-btn share";

//     // Logic: If Pending -> Action Icon, If Approved/Reject -> View Icon
//     const status = dataOb.customer_agreement_status_id.status;
//     let icon = "fa-eye"; // Default for Approved/Reject
//     let title = "View Details";

//     if (status === "Pending") {
//       icon = "fa-file-signature"; // Icon for Action
//       title = "Approve or Reject";
//       actionBtn.className = "action-btn edit";
//     }

//     actionBtn.innerHTML = `<i class="fa-solid ${icon}"></i>`;
//     actionBtn.setAttribute("title", title);
//     actionBtn.onclick = () => viewFunction(dataOb, index);

//     buttonDiv.appendChild(actionBtn);
//     tdButton.appendChild(buttonDiv);
//     tr.appendChild(tdButton);
//     tableBody.appendChild(tr);
//   });
// };

// Approval button


// ========================== approval functions =======================
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
        loadCustomerAgreementApprovalCardList();
        closeAgreementReviewPanel();
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
// ========================= end approval functions ====================


// ========================= reject functions ===========================
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
        loadCustomerAgreementApprovalCardList();
        closeAgreementReviewPanel();
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
// ========================= reject functions ==========================



// ========================= refresh functions ========================
const refreshCustomerAgreementAprrovalForm = () => {
  customerAgreement = new Object();
};
// ========================= end refresh functions ====================



// ====================== approvla overlay view functions ================
//view overalyy details
const openAgreementReviewPanel = () => {
  document.getElementById("main").classList.add("open");
};

const closeAgreementReviewPanel = () => {
  document.getElementById("main").classList.remove("open");
};
// ==================== end approvla overlay view functions ==============


//Alert Box Call function
Swal.isVisible();