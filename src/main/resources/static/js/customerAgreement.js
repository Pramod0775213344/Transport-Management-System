window.addEventListener("load", () => {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      // get count of the customer agreement
      let customerAgreementCount = getServiceRequest("/customeragreement/countall");
      document.getElementById("customerAgreementCount").innerText = customerAgreementCount;

      // get count of the active customer agreement
      let activeCustomerAgreementCount = getServiceRequest("/customeragreement/countactive");
      document.getElementById("activeCustomerAgreementCount").innerText = activeCustomerAgreementCount;

      // get count of the pending customer agreement
      let pendingCustomerAgreementCount = getServiceRequest("/customeragreement/countpending");
      document.getElementById("pendingCustomerAgreementCount").innerText = pendingCustomerAgreementCount;

      // get count of the reject customer agreement
      let rejectCustomerAgreementCount = getServiceRequest("/customeragreement/countreject");
      document.getElementById("rejectCustomerAgreementCount").innerText = rejectCustomerAgreementCount;

      // refresh the customer agreement form
      refreshCustomerAgreementForm();

      //     enable type and search of the select element

      $("#selectCompanyName").select2({
        theme: "bootstrap-5",
        dropdownParent: $("#customerAgreementModal"),
      });

      // Check pending renewal eka open karanwa
      const pendingRenewal = localStorage.getItem("pendingRenewal");
      if (pendingRenewal) {
        const dataOb = JSON.parse(pendingRenewal);

        // data ob eka customer agreemnt ekata bind karanwa
        customerAgreement = dataOb;
        // Database ID eka null karanna oni aluth ekak widihata save wenna
        customerAgreement.id = null;
        customerAgreement.cus_agreement_no = null;
        customerAgreement.isRenewal = true;

        // modal eke title eka wenas karanwa
        $("#customerAgreementModal").modal("show");
        document.getElementById("modalTitle").innerText = "Renewal Service Agreement";
        document.getElementById("modalSubtitle").innerText = "Renew the existing agreement details below.";

        // select input ekata value eka asign karala change event eka trigger karanwa
        $("#selectCompanyName").val(JSON.stringify(dataOb.customer_id)).trigger("change");
        selectCompanyName.disabled = true;

        $("#selectVehicleType").val(JSON.stringify(dataOb.vehicle_type_id)).trigger("change");

        $("#selectPackageType").val(JSON.stringify(dataOb.package_id)).trigger("change");
        selectPackageType.disabled = false;

        textCustomerAgreementDate.value = dataOb.agreement_date;
        textCustomerAgreementPeriod.value = dataOb.agreement_period;
        textCustomerAgreementEndDate.value = dataOb.agreement_end_date;
        textCustomerDeliveryFrequency.value = dataOb.delivery_frequency;
        textCustomerAgreementApprovalNote.value = dataOb.approval_note;

        // localStorage clear කරනවා
        localStorage.removeItem("pendingRenewal");

        Swal.fire({
          title: "Renewal Mode",
          text: `${dataOb.customer_id.company_name} agreement details successfully added to the Renewal form.`,
          icon: "info",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "swal2-border-radius" },
        });
      }
    } catch (e) {
      console.error("Error during customer-agreement page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);
});

// filtering area functions
const filteringCustomerName = document.getElementById("filteringCustomerName");
const filteringVehicleType = document.getElementById("filteringVehicleType");
const filteringStatus = document.getElementById("filteringStatus");
const filtering = () => {
  if ($.fn.dataTable.isDataTable("#customerAgreementTable")) {
    $("#customerAgreementTable").DataTable().destroy();
  }

  // customerge name eka witharak thiyenw nam
  if (filteringCustomerName.value != "" && filteringVehicleType.value === "" && filteringStatus.value === "") {
    let selectCustomer = JSON.parse(filteringCustomerName.value);
    let customerAgreements = getServiceRequest("/customeragreement/bycutomer?customerId=" + selectCustomer.id);
    loadCustomerAgreementTable(customerAgreements);
  }
  // vehicle type eka witharak thiyenw nam
  else if (filteringCustomerName.value === "" && filteringVehicleType.value != "" && filteringStatus.value === "") {
    let selectVehicleType = JSON.parse(filteringVehicleType.value);
    let customerAgreements = getServiceRequest("/customeragreement/filterbyvehicletype?vehicleTypeId=" + selectVehicleType.id);
    loadCustomerAgreementTable(customerAgreements);
  }
  // status eka witharak thiyenw nam
  else if (filteringCustomerName.value === "" && filteringVehicleType.value === "" && filteringStatus.value != "") {
    let selectStatus = JSON.parse(filteringStatus.value);
    let customerAgreements = getServiceRequest("/customeragreement/filterbystatus?statusId=" + selectStatus.id);
    loadCustomerAgreementTable(customerAgreements);
  }
  //     customerge name eka saha vehicle type eka thiyenw nam
  else if (filteringCustomerName.value != "" && filteringVehicleType.value != "" && filteringStatus.value === "") {
    let selectCustomer = JSON.parse(filteringCustomerName.value);
    let selectVehicleType = JSON.parse(filteringVehicleType.value);
    let customerAgreements = getServiceRequest(
      "/customeragreement/filterbycustomerandvehicletype?customerId=" + selectCustomer.id + "&vehicleTypeId=" + selectVehicleType.id,
    );
    loadCustomerAgreementTable(customerAgreements);
  }
  // customerge name eka saha status eka thiyenw nam
  else if (filteringCustomerName.value != "" && filteringVehicleType.value === "" && filteringStatus.value != "") {
    let selectCustomer = JSON.parse(filteringCustomerName.value);
    let selectStatus = JSON.parse(filteringStatus.value);
    let customerAgreements = getServiceRequest("/customeragreement/filterbycustomerandstatus?customerId=" + selectCustomer.id + "&statusId=" + selectStatus.id);
    loadCustomerAgreementTable(customerAgreements);
  }
  // vehicle type eka saha status eka thiyenw nam
  else if (filteringCustomerName.value === "" && filteringVehicleType.value != "" && filteringStatus.value != "") {
    let selectVehicleType = JSON.parse(filteringVehicleType.value);
    let selectStatus = JSON.parse(filteringStatus.value);
    let customerAgreements = getServiceRequest("/customeragreement/filterbyvehicletypeandstatus?vehicleTypeId=" + selectVehicleType.id + "&statusId=" + selectStatus.id);
    loadCustomerAgreementTable(customerAgreements);
  }
  // customerge name eka saha vehicle type eka saha status eka thiyenw nam
  else if (filteringCustomerName.value != "" && filteringVehicleType.value != "" && filteringStatus.value != "") {
    let selectCustomer = JSON.parse(filteringCustomerName.value);
    let selectVehicleType = JSON.parse(filteringVehicleType.value);
    let selectStatus = JSON.parse(filteringStatus.value);
    let customerAgreements = getServiceRequest(
      "/customeragreement/filterbycustomerandvehicletypeandstatus?customerId=" +
      selectCustomer.id +
      "&vehicleTypeId=" +
      selectVehicleType.id +
      "&statusId=" +
      selectStatus.id,
    );
    loadCustomerAgreementTable(customerAgreements);
  }
  // ewa naththam alll data gannawa
  else {
    let customerAgreements = getServiceRequest("/customeragreement/alldata");
    loadCustomerAgreementTable(customerAgreements);
  }
};
// filtering eka reset karanwa funtion eka
const resetFilter = () => {
  // select wala value eka reset karanawa
  filteringCustomerName.value = "";
  filteringVehicleType.value = "";
  filteringStatus.value = "";
  document.getElementById("tableSearch").value = "";

  // data table eka destroy karanawa
  if ($.fn.dataTable.isDataTable("#customerAgreementTable")) {
    $("#customerAgreementTable").DataTable().destroy();
  }

  // all agreement data tika load karanwa
  let customerAgreements = getServiceRequest("/customeragreement/alldata");
  loadCustomerAgreementTable(customerAgreements);
};

// table data load function
const loadCustomerAgreementTable = (customerAgreements) => {
  if ($.fn.dataTable.isDataTable("#customerAgreementTable")) {
    $("#customerAgreementTable").DataTable().destroy();
  }
  const propertyList = [
    { propertyName: getAgreementNo, dataType: "function" },
    { propertyName: getCustomer, dataType: "function" },
    { propertyName: getPackage, dataType: "function" },
    { propertyName: getVehicleType, dataType: "function" },
    { propertyName: getContractDetails, dataType: "function" },
    { propertyName: getCustomerAgreementStatus, dataType: "function" },
  ];

  // table data fill function
  dataFillIntoTheTable(customerAgreementTableBody, customerAgreements, propertyList, customerAgreemnentView, customerAgreemnentEdit, customerAgreemnentDelete, true);

  const table = $("#customerAgreementTable").DataTable({
    dom: "rtip", // Hide default search and length
    pageLength: 10,
    createdRow: function (row, data, dataIndex) {
      $(row).find("td").css({
        "text-align": "left",
        padding: "25px",
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

  applyPrivileges("Customer Agreement Management", "customerAgreementTable", {
    add: addButton

  });

  table.on("draw.dt", function () {
    applyPrivileges("Customer Agreement Management", "customerAgreementTable", { add: addButton });
  });
};

// get agreement no
const getAgreementNo = (dataOb) => {
  return "<span class ='unique_no'>" + dataOb.cus_agreement_no + "</span >";
};

// get customer name
const getCustomer = (dataOb) => {
  return `<div class="row fw-bold" >${dataOb.customer_id.company_name}</div>
<div class="row" style="font-size: 14px;">${dataOb.customer_id.business_type_id.name}</div>`;
};

// get package name
const getPackage = (dataOb) => {
  return `<div class="row" >${dataOb.package_id.name}</div>
<div class="row" style="font-size: 14px;">${dataOb.package_id.distance} Km</div>`;
};

//get vehicle type
const getVehicleType = (dataOb) => {
  return `<div class="row" >${dataOb.vehicle_type_id.name} Truck</div>`;
};

// get contract details
const getContractDetails = (dataOb) => {
  return `<div class="row" >${dateformat(dataOb.agreement_date)}  - ${dateformat(dataOb.agreement_end_date)}</div>
<div class="row" >${dataOb.agreement_period} months</div>`;
};

// get customer agreement Status
const getCustomerAgreementStatus = (dataOb) => {
  if (dataOb.customer_agreement_status_id.status == "Approved") {
    return "<span class='status-badge status-active'>" + dataOb.customer_agreement_status_id.status + "</span>";
  }

  if (dataOb.customer_agreement_status_id.status == "Pending") {
    return "<span class='status-badge status-pending'>" + dataOb.customer_agreement_status_id.status + "</span>";
  }
  if (dataOb.customer_agreement_status_id.status == "Expired") {
    return "<span class='status-badge status-inactive'> " + dataOb.customer_agreement_status_id.status + "</span>";
  }
  if (dataOb.customer_agreement_status_id.status == "Deleted") {
    return "<span class='status-badge status-inactive'> " + dataOb.customer_agreement_status_id.status + "</span>";
  }
  if (dataOb.customer_agreement_status_id.status == "Reject") {
    return "<span class='status-badge status-reject'> " + dataOb.customer_agreement_status_id.status + "</span>";
  }
  if (dataOb.customer_agreement_status_id.status == "Closed") {
    return "<span class='status-badge status-renewd'> " + dataOb.customer_agreement_status_id.status + "</span>";
  }
};

// customer agreement view
const customerAgreemnentView = (dataOb) => {
  // Header
  document.getElementById("dataAgreementRegNo").innerText = dataOb.cus_agreement_no || "N/A";
  document.getElementById("dataAgreementSubId").innerText = `AG-${dataOb.id || "000"}`;

  // Period Info
  document.getElementById("dataAgreementStartDate").innerText = dataOb.agreement_date || "N/A";
  document.getElementById("dataEndDate").innerText = dataOb.agreement_end_date || "N/A";
  document.getElementById("dataAgreementPeriod").innerText = dataOb.agreement_period || "0";

  // Customer Information
  document.getElementById("dataCompanyname").innerText = dataOb.customer_id ? dataOb.customer_id.company_name : "N/A";
  document.getElementById("dataCompanyDesc").innerText = dataOb.customer_id && dataOb.customer_id.business_type_id ? dataOb.customer_id.business_type_id.name : "Business Partner";
  document.getElementById("dataTelephone2").innerText = dataOb.customer_id ? dataOb.customer_id.direct_telephone_no : "N/A";
  document.getElementById("dataCompanyEmail2").innerText = dataOb.customer_id ? dataOb.customer_id.direct_email_no : "N/A";
  document.getElementById("dataCompanyAddress2").innerText = dataOb.customer_id ? dataOb.customer_id.company_address : "N/A";

  // Contact Person
  document.getElementById("dataContactPersonName").innerText = dataOb.customer_id ? dataOb.customer_id.contact_person_fullname : "N/A";
  document.getElementById("dataContactPersonMobile").innerText = dataOb.customer_id ? dataOb.customer_id.contact_person_mobileno : "N/A";
  document.getElementById("dataContactPersonEmail").innerText = dataOb.customer_id ? dataOb.customer_id.contact_person_email : "N/A";

  // Agreement Info
  document.getElementById("dataVehicleType").innerText = dataOb.vehicle_type_id ? dataOb.vehicle_type_id.name : "N/A";
  document.getElementById("dataCustomerRate").innerText = dataOb.package_id ? "LKR " + dataOb.package_id.package_charge_cus : "N/A";

  // Package Details
  document.getElementById("dataPackageName").innerText = dataOb.package_id ? dataOb.package_id.name : "N/A";
  document.getElementById("dataDistance").innerText = dataOb.package_id ? `Distance: ${dataOb.package_id.distance} KM` : "Distance: N/A";

  // Package Status Badge
  const badge = document.getElementById("agreementstatusBadge");
  const status = dataOb.customer_agreement_status_id ? dataOb.customer_agreement_status_id.status : "Unknown";
  badge.innerText = status.toUpperCase();
  if (status === "Approved" || status === "Active") {
    badge.style.backgroundColor = "#6ee7b7";
    badge.style.color = "#065f46";
  } else if (status === "Pending") {
    badge.style.backgroundColor = "#fde047";
    badge.style.color = "#854d0e";
  } else {
    badge.style.backgroundColor = "#fca5a5";
    badge.style.color = "#991b1b";
  }

  // Show Offcanvas
  const offcanvasElement = document.getElementById("customerAgreementOffcanvas");
  const bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement);
  bsOffcanvas.show();
};

const customerAgreementFromPrint = () => {
  // Get values from DOM to bind into the print view
  const regNo = document.getElementById("dataAgreementRegNo")?.innerText || "N/A";
  const startDate = document.getElementById("dataAgreementStartDate")?.innerText || "N/A";
  const endDate = document.getElementById("dataEndDate")?.innerText || "N/A";
  const period = document.getElementById("dataAgreementPeriod")?.innerText || "0";

  const companyName = document.getElementById("dataCompanyname")?.innerText || "N/A";
  const companyDesc = document.getElementById("dataCompanyDesc")?.innerText || "N/A";
  const telephone = document.getElementById("dataTelephone2")?.innerText || "N/A";
  const email = document.getElementById("dataCompanyEmail2")?.innerText || "N/A";
  const address = document.getElementById("dataCompanyAddress2")?.innerText || "N/A";

  const contactName = document.getElementById("dataContactPersonName")?.innerText || "N/A";
  const contactMobile = document.getElementById("dataContactPersonMobile")?.innerText || "N/A";
  const contactEmail = document.getElementById("dataContactPersonEmail")?.innerText || "N/A";

  const vehicle = document.getElementById("dataVehicleType")?.innerText || "N/A";
  const rateText = document.getElementById("dataCustomerRate")?.innerText || "0";
  const rate = rateText.replace("LKR ", "").trim();
  const packageName = document.getElementById("dataPackageName")?.innerText || "N/A";
  const distanceText = document.getElementById("dataDistance")?.innerText || "";
  const distance = distanceText.replace("Distance: ", "").trim();

  let newWindow = window.open();
  let printView = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Agreement - ${regNo}</title>
        <link rel="stylesheet" href="/bootstrap/bootstrap-5.2.3/css/bootstrap.min.css">
        <link rel="stylesheet" href="/fontawesome-free-6.7.2-web/css/all.min.css">
        <style>
            body { font-family: system-ui, -apple-system, sans-serif; background-color: white; color: #334155; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin: 0; padding: 0; }
            .print-container { max-width: 1000px; margin: 0 auto; padding: 40px; }
            
            /* Header Card */
            .header-card { background-color: #f1f5f9; padding: 30px; border-radius: 12px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: stretch; }
            .company-info { font-size: 0.85rem; font-weight: 600; color: #64748b; line-height: 1.6; }
            .agreement-title { font-size: 2rem; font-weight: 800; color: #475569; margin-bottom: 20px; text-transform: uppercase; text-align: right; letter-spacing: -0.5px; }
            .date-info table { width: auto; margin-left: auto; font-size: 0.9rem; font-weight: 600; color: #64748b; }
            .date-info td { padding: 4px 0 4px 15px; text-align: right; }
            .date-info td:first-child { color: #94a3b8; font-weight: 500; }
            
            /* Section Headers */
            .section-title { font-size: 0.75rem; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
            .section-title i { font-size: 1rem; color: #475569; }
            
            /* Info Cards */
            .info-card { background-color: #ffffff; border-radius: 12px; padding: 25px; height: 100%; border: 1px solid #e2e8f0; }
            .info-card.bordered-left { border-left: 6px solid #1e293b; background-color: #f1f5f9; border-top: none; border-right: none; border-bottom: none; border-radius: 4px 12px 12px 4px; }
            
            /* Customer Info */
            .info-label { font-size: 0.65rem; color: #475569; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px; }
            .info-value { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 15px; }
            .info-subtext { font-size: 0.85rem; color: #64748b; font-weight: 400; font-style: italic; }
            
            /* Contact Person */
            .primary-liaison-box { background-color: #f1f5f9; text-align: center; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
            .contact-row { display: flex; justify-content: space-between; border-bottom: 1px dashed #cbd5e0; padding: 10px 0; }
            .contact-row:last-child { border-bottom: none; padding-bottom: 0; }
            .contact-label { font-size: 0.85rem; color: #64748b; font-weight: 500; }
            .contact-val { font-size: 0.9rem; font-weight: 700; color: #0f172a; }
            
            /* Dark Banner Grid */
            .dark-banner { background-color: #1e293b; color: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; display: flex; justify-content: space-between; }
            .banner-col { flex: 1; }
            .banner-col.center { display: flex; flex-direction: column; align-items: center; justify-content: center; }
            .banner-label { font-size: 0.65rem; color: #cbd5e0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
            .banner-value { font-size: 1.6rem; font-weight: 800; color: white; margin-bottom: 4px; }
            .banner-subtext { font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; font-weight: 600; }
            
            .rate-value { font-size: 2.2rem; font-weight: 800; color: white; line-height: 1; }
            .rate-unit { font-size: 0.75rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; margin-left: 4px; }
            
            .pill-badge { background-color: rgba(255,255,255,0.15); color: #e2e8f0; font-size: 0.65rem; font-weight: 600; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-top: 6px; }

            /* Footer Notes */
            .notes-section { background-color: #f1f5f9; padding: 25px; border-radius: 12px; }
            .notes-content { background-color: white; padding: 20px 25px; border-left: 4px solid #0f172a; border-radius: 2px 6px 6px 2px; font-size: 0.9rem; line-height: 1.6; color: #334155; margin-top: 15px; font-weight: 500; }

            @media print {
                body { padding: 0; margin: 0; }
                .print-container { width: 100%; max-width: none; padding: 20px; }
            }
        </style>
    </head>
    <body onload="setTimeout(() => { window.print(); setTimeout(() => { window.close(); }, 500); }, 500)">
        <div class="print-container">
            
            <!-- Header -->
            <div class="header-card">
                <div>
                   <!-- Logo Placeholder -->
                    <div style="font-weight: 900; font-size: 1.25rem; color: #6d28d9; margin-bottom: 20px; letter-spacing: 0.5px; display:flex; align-items:center; gap: 8px;">
                      <div style="width:24px; height:24px; background:#6d28d9; border-radius:4px; display:flex; align-items:center; justify-content:center;">
                          <div style="width:12px; height:12px; background:white; border-radius:2px;"></div>
                      </div>
                      OKI-DOKI Logistics
                    </div>
                    <div class="company-info">
                        No. 390, Avissawella Road<br>
                        Wellampitiya, Sri Lanka<br>
                        +94 11 7474747<br>
                        hello@okidoki.global
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; justify-content: space-between;">
                    <div class="agreement-title">#AGREEMENT - ${regNo}</div>
                    <div class="date-info">
                        <table cellspacing="0" cellpadding="0">
                            <tr><td>Start Date:</td><td style="color:#0f172a;">${startDate}</td></tr>
                            <tr><td>End Date:</td><td style="color:#0f172a;">${endDate}</td></tr>
                            <tr><td>Period:</td><td style="color:#0f172a;">${period} Mo.</td></tr>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Two Columns -->
            <div class="row g-4 mb-4">
                <!-- Customer Info -->
                <div class="col-7">
                    <div class="info-card bordered-left">
                        <div class="section-title">
                            <i class="fa-regular fa-building"></i> CUSTOMER INFORMATION
                        </div>
                        
                        <div style="margin-bottom: 25px;">
                            <div class="info-label">COMPANY NAME</div>
                            <div class="info-value" style="margin-bottom: 2px;">${companyName}</div>
                            <div class="info-subtext">(${companyDesc})</div>
                        </div>
                        
                        <div class="row g-3" style="margin-bottom: 25px;">
                            <div class="col-5">
                                <div class="info-label">PHONE</div>
                                <div class="info-value mb-0" style="font-size: 0.95rem;">${telephone}</div>
                            </div>
                            <div class="col-7">
                                <div class="info-label">EMAIL</div>
                                <div class="info-value mb-0" style="font-size: 0.95rem;">${email}</div>
                            </div>
                        </div>
                        
                        <div>
                            <div class="info-label">ADDRESS</div>
                            <div class="info-value mb-0" style="font-size: 0.95rem; font-weight: 500; line-height: 1.5;">${address}</div>
                        </div>
                    </div>
                </div>

                <!-- Contact Person -->
                <div class="col-5">
                    <div class="info-card" style="box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
                        <div class="section-title">
                            <i class="fa-regular fa-user-circle"></i> CONTACT PERSON DETAILS
                        </div>
                        
                        <div class="primary-liaison-box">
                            <div class="info-label" style="font-size:0.60rem; margin-bottom: 6px;">PRIMARY LIAISON</div>
                            <div class="info-value mb-0" style="font-size: 1.15rem;">${contactName}</div>
                        </div>
                        
                        <div style="padding: 0 10px;">
                            <div class="contact-row">
                                <div class="contact-label">Mobile</div>
                                <div class="contact-val">${contactMobile}</div>
                            </div>
                            <div class="contact-row">
                                <div class="contact-label">Email</div>
                                <div class="contact-val">${contactEmail}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dark Banner -->
            <div class="dark-banner">
                <div class="banner-col">
                    <div class="banner-label"><i class="fa-solid fa-truck"></i> AGREEMENT INFO</div>
                    <div class="banner-value">${vehicle}</div>
                    <div class="banner-subtext">ALLOCATED VEHICLE CATEGORY</div>
                </div>
                
                <div class="banner-col center">
                    <div class="banner-label"><i class="fa-solid fa-money-bill-wave"></i> BASE RATE</div>
                    <div>
                        <span class="rate-value">LKR ${rate}</span><span class="rate-unit">/ PER UNIT</span>
                    </div>
                </div>
                
                <div class="banner-col" style="padding-left: 30px;">
                    <div class="banner-label"><i class="fa-solid fa-box-open"></i> PACKAGE DETAILS</div>
                    <div class="banner-value">${packageName}</div>
                    <div class="pill-badge">${distance} Increment</div>
                </div>
            </div>

            <!-- Notes -->
            <div class="notes-section">
                <div class="section-title mb-0" style="font-size: 0.70rem;">
                    SERVICE NOTES & LOGISTICS REQUIREMENTS
                </div>
                <div class="notes-content">
                    "Customer rate applies as agreed per logistical requirements. This agreement covers metropolitan freight transit and distribution within the ${companyName}. OKI-DOKI Logistics Authority guarantees priority dispatch for the ${vehicle} fleet during peak periods."
                </div>
            </div>

        </div>
    </body>
    </html>
  `;
  newWindow.document.write(printView);

  setTimeout(() => {
    newWindow.stop();
    newWindow.print();
    newWindow.close();
  }, 1000);
};

// agreement delete function
const customerAgreemnentDelete = (dataOb) => {
  Swal.fire({
    title: "Confirm Agreement Deletion",
    text: "Are you sure you want to delete this agreement? This action cannot be undone!",
    icon: "warning",
    iconColor: "#ef4444",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete Agreement",
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
      let deleteResponse = httpServiceRequest("/customeragreement/delete", "DELETE", dataOb);
      if (deleteResponse == "ok") {
        Swal.fire({
          title: "Deleted!",
          text: "Agreement has been deleted successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "swal2-border-radius",
          },
        });
        refreshCustomerAgreementForm();
      } else {
        Swal.fire({
          title: "Deletion Failed",
          text: deleteResponse,
          icon: "error",
          customClass: {
            confirmButton: "btn btn-1",
            popup: "swal2-border-radius",
          },
        });
      }
    }
  });
};

// agreement refill karana finction eka
const customerAgreemnentEdit = (dataOb) => {
  // check the status of the agreementa and if it is approved can't edit the details
  if (
    dataOb.customer_agreement_status_id.status == "Approved" ||
    dataOb.customer_agreement_status_id.status == "Closed" ||
    dataOb.customer_agreement_status_id.status == "Deleted"
  ) {
    Swal.fire({
      title: "Access Denied",
      text: "Cannot edit an agreement that has already been approved.",
      icon: "warning",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    return;
  }

  $("#selectCompanyName").val(JSON.stringify(dataOb.customer_id)).trigger("change");

  textCustomerAgreementDate.value = dataOb.agreement_date;

  textCustomerAgreementPeriod.value = dataOb.agreement_period;

  textCustomerAgreementEndDate.value = dataOb.agreement_end_date;

  textCustomerDeliveryFrequency.value = dataOb.delivery_frequency;

  selectVehicleType.value = JSON.stringify(dataOb.vehicle_type_id);

  let packageByVehicleType = getServiceRequest("package/byvehicletype?vehicletypeid=" + dataOb.vehicle_type_id.id);
  dataFilIntoSelect(selectPackageType, "Select Package Type", packageByVehicleType, "name");
  packageTypeDiv.style.display = "";
  selectPackageType.value = JSON.stringify(dataOb.package_id);

  textCustomerAgreementApprovalNote.value = dataOb.approval_note;

  // Update labels for Edit mode and handle button visibility
  document.getElementById("modalTitle").innerText = "Update Service Agreement";
  document.getElementById("modalSubtitle").innerText = "Modify the existing agreement details below.";

  updateButton.style.display = "";
  submitButton.style.display = "none";
  textCustomerAgreementApprovalNoteDiv.style.display = "";

  // when click the edit button the form will be display
  $("#customerAgreementModal").modal("show");

  customerAgreement = JSON.parse(JSON.stringify(dataOb));
  oldCustomerAgreement = JSON.parse(JSON.stringify(dataOb));

  let customerAgreements = getServiceRequest("/customeragreement/bycutomer?customerId=" + dataOb.customer_id.id);
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
};

// check form errors
const checkFormError = () => {
  let errors = "";

  if (customerAgreement.customer_id == null) {
    errors += "Please select Company Name. <br>";
    selectCompanyName.classList.add("is-invalid");
  }
  if (customerAgreement.agreement_date == null) {
    errors += "Please select Agreement Date. <br>";
    textCustomerAgreementDate.classList.add("is-invalid");
  }
  if (customerAgreement.agreement_period == null) {
    errors += "Please select Agreement Period. <br>";
    textCustomerAgreementPeriod.classList.add("is-invalid");
  }
  if (customerAgreement.agreement_end_date == null) {
    errors += "Please select Agreement End Date. <br>";
    textCustomerAgreementEndDate.classList.add("is-invalid");
  }
  if (customerAgreement.delivery_frequency == null) {
    errors += "Please select Delivery Frequency. <br>";
    textCustomerDeliveryFrequency.classList.add("is-invalid");
  }
  if (customerAgreement.vehicle_type_id == null) {
    errors += "Please select Vehicle Type. <br>";
    selectVehicleType.classList.add("is-invalid");
  }
  if (customerAgreement.package_id == null) {
    errors += "Please select Package. <br>";
    selectPackageType.classList.add("is-invalid");
  }
  return errors;
};

// customer agreement form submit function
const customerAgreementFormSubmit = () => {
  // check form error for required element
  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    // errors not exit
    //need to get user confirmation

    let userConfirm = Swal.fire({
      title: "Confirm Agreement Submission",
      text: "Are you sure you want to create this new customer agreement?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Create Agreement",
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
        let postResponse = httpServiceRequest("/customeragreement/insert", "POST", customerAgreement);
        if (postResponse == "ok") {
          Swal.fire({
            title: "Agreement Created!",
            text: "The Customer Agreement has been successfully created.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal2-border-radius",
            },
          });
          refreshCustomerAgreementForm();
          $("#customerAgreementModal").modal("hide");
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
          text: "Agreement details not Saved!",
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
      title: "Validation Error",
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

// check form updates
const checkFormUpdates = () => {
  let updates = "";

  if (customerAgreement != null && oldCustomerAgreement != null) {
    if (customerAgreement.customer_id.company_name != oldCustomerAgreement.customer_id.company_name) {
      updates += "Company Name updated. <br>";
    }
    if (customerAgreement.agreement_date != oldCustomerAgreement.agreement_date) {
      updates += "Agreement Date updated. <br>";
    }
    if (customerAgreement.agreement_period != oldCustomerAgreement.agreement_period) {
      updates += "Agreement Period updated. <br>";
    }
    if (customerAgreement.agreement_end_date != oldCustomerAgreement.agreement_end_date) {
      updates += "Agreement End Date updated. <br>";
    }
    if (customerAgreement.delivery_frequency != oldCustomerAgreement.delivery_frequency) {
      updates += "Delivery Frequency updated. <br>";
    }
    if (customerAgreement.vehicle_type_id.name != oldCustomerAgreement.vehicle_type_id.name) {
      updates += "Vehicle Type updated. <br>";
    }
    if (customerAgreement.package_id.name != oldCustomerAgreement.package_id.name) {
      updates += "Package updated. <br>";
    }
  }

  return updates;
};

// customer agreement form update function
const customerAgreementFormUpdate = () => {
  // check form error for required element
  let errors = checkFormError();
  if (errors == "") {
    let updates = checkFormUpdates();
    // updates not exit
    if (updates == "") {
      Swal.fire({
        title: "Nothing to Update",
        text: "No changes were detected in the agreement details.",
        icon: "info",
        allowOutsideClick: false,
        customClass: {
          confirmButton: "btn btn-1",
          popup: "swal2-border-radius",
        },
      });
    } else {
      let userConfirm = Swal.fire({
        title: "Confirm Agreement Update",
        text: "Are you sure you want to update this agreement's details?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Update Agreement",
        cancelButtonText: "Cancel",
        allowOutsideClick: false,
        customClass: {
          cancelButton: "btn btn-1",
          confirmButton: "btn btn-2",
          popup: "swal2-border-radius",
        },
      }).then((userConfirm) => {
        if (userConfirm.isConfirmed) {
          //call putt service
          let putResponse = httpServiceRequest("/customeragreement/update", "PUT", customerAgreement);
          if (putResponse == "ok") {
            Swal.fire({
              title: "Agreement Updated!",
              text: "The customer agreement has been successfully updated.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: "swal2-border-radius",
              },
            });

            refreshCustomerAgreementForm();
            $("#customerAgreementModal").modal("hide");
          } else {
            Swal.fire({
              title: "Update Failed",
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
            text: "Agreement details not Updated!",
            icon: "error",
            customClass: {
              confirmButton: "btn btn-1",
              popup: "swal2-border-radius",
            },
          });
        }
      });
    }
  } else {
    Swal.fire({
      title: "Update Validation Error",
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

// refresh customer agreement form
const refreshCustomerAgreementForm = () => {
  // main onbject eka
  customerAgreement = new Object();
  // main object ekata list ekak adda karanawa

  customerAgreementForm.reset();

  //form get intial color when refresh the form
  setDefault([
    selectCompanyName,
    textCustomerAgreementDate,
    textCustomerAgreementPeriod,
    textCustomerAgreementEndDate,
    textCustomerDeliveryFrequency,
    selectVehicleType,
    selectPackageType,
  ]);

  let compnayNames = getServiceRequest("/customer/bycustomerstatus");
  dataFilIntoSelect(selectCompanyName, "Select Company Name", compnayNames, "company_name");

  let vehicleTypes = getServiceRequest("/vehicletype/alldata");
  dataFilIntoSelect(selectVehicleType, "Select Vehicle Type", vehicleTypes, "name");

  let packageTypes = getServiceRequest("/package/bypackagestatus");
  dataFilIntoSelect(selectPackageType, "Select Package Type", packageTypes, "name");

  packageTypeDiv.style.display = "none";
  submitButton.style.display = "";
  updateButton.style.display = "none";
  textCustomerAgreementApprovalNoteDiv.style.display = "none";
  customerAgreementViewTable.style.display = "none";
  newCustomerNote.style.display = "none";

  // Reset Modal Labels
  document.getElementById("modalTitle").innerText = "New Customer Agreement";
  document.getElementById("modalSubtitle").innerText = "Fill in the details below to create a new service agreement.";

  // removing validation at refresh
  const s2Container = selectCompanyName.nextElementSibling;
  if (s2Container && s2Container.classList.contains("select2-container")) {
    const s2Selection = s2Container.querySelector(".select2-selection");
    if (s2Selection) {
      s2Selection.style.border = "1px solid #ced4da";
      s2Selection.style.borderBottom = "1px solid #ced4da";
      s2Selection.classList.remove("is-valid", "is-invalid");
    }
  }

  //     filtering area eke thiyen drop down tika fil karanawa
  dataFilIntoSelect(filteringCustomerName, "Select Company Name", compnayNames, "company_name");

  dataFilIntoSelect(filteringVehicleType, "Select Vehicle Type", vehicleTypes, "name");

  let agreementStatus = getServiceRequest("/customeragreementstatus/alldata");
  dataFilIntoSelect(filteringStatus, "Select Status ", agreementStatus, "status");

  let customerAgreements = getServiceRequest("/customeragreement/alldata");
  loadCustomerAgreementTable(customerAgreements);

  // -------------------------agrement start date eka dawas 7 kata kalin ewa block karanwaa----------------
  const today = new Date();

  // දවස් 7ක් අඩු කරනවා
  const minDate = new Date();
  minDate.setDate(today.getDate() - 7);

  // format (YYYY-MM-DD)
  const formattedDate = minDate.toISOString().split("T")[0];

  // input එකට set කරනවා
  document.getElementById("textCustomerAgreementDate").min = formattedDate;

  // ---------------------------------------------
};

// filetr function and validation function
let vehicleTypeElement = document.querySelector("#selectVehicleType");
vehicleTypeElement.addEventListener("change", () => {
  let vehicleType = JSON.parse(vehicleTypeElement.value);
  customerAgreement.vehicle_type_id = JSON.parse(vehicleTypeElement.value);

  selectVehicleType.classList.remove("is-invalid");
  selectVehicleType.classList.add("is-valid");

  packageTypeDiv.style.display = "";

  let packageByVehicleType = getServiceRequest("package/byvehicletype?vehicletypeid=" + vehicleType.id);
  dataFilIntoSelect(selectPackageType, "Select Package Type", packageByVehicleType, "name");
});

//calclate end date using given date and time period
let agreementEndDate = (startDateStr, periodValue) => {
  const startdate = new Date(startDateStr);
  const enddate = new Date(startdate);
  enddate.setMonth(startdate.getMonth() + Number(periodValue));

  // input type ekata galapena widihata date input format ekata convert karanna
  return `${enddate.getFullYear()}-${(enddate.getMonth() + 1).toString().padStart(2, "0")}-${enddate.getDate().toString().padStart(2, "0")}`;
};

document.getElementById("textCustomerAgreementPeriod").onchange = () => {
  const agreementStartDate = document.getElementById("textCustomerAgreementDate").value;
  const agreementPeriod = document.getElementById("textCustomerAgreementPeriod").value;

  //object ekata bind karanawa
  customerAgreement.agreement_period = agreementPeriod;
  // validation
  textCustomerAgreementPeriod.classList.remove("is-invalid");
  textCustomerAgreementPeriod.classList.add("is-valid");

  const endDate = agreementEndDate(agreementStartDate, agreementPeriod);
  document.getElementById("textCustomerAgreementEndDate").value = endDate;

  if (!agreementStartDate) {
    // object ekata bind karanawa
    customerAgreement.agreement_end_date = null;
    // validation
    textCustomerAgreementEndDate.classList.add("is-invalid");
    textCustomerAgreementEndDate.classList.remove("is-valid");
  } else {
    // object ekata bind karanawa
    customerAgreement.agreement_end_date = endDate;
    // validation
    textCustomerAgreementEndDate.classList.remove("is-invalid");
    textCustomerAgreementEndDate.classList.add("is-valid");
  }

  console.log(endDate); // "7/15/2024"
};

// customer ta adala agreement thiyenw nam ewa view karanwa form eke
// Show agreements for selected company in the form
let selectCompanyNameElement = document.getElementById("selectCompanyName");
$("#selectCompanyName").on("change", function (e) {
  // your code here
  console.log(2);
  console.log(selectCompanyNameElement.value);
  let selectedCompany = JSON.parse(selectCompanyNameElement.value);
  let customerAgreements = getServiceRequest("/customeragreement/bycutomer?customerId=" + selectedCompany.id);
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
});

// ------------------------------------------------------------------------------------------------------------------------
// table eke loading spin eka load karanwa
function showTableLoading() {
  const loader = document.getElementById("loaderId");
  const customerAgreementTable = document.getElementById("customerAgreementTable");
  loader.style.display = ""; // Clear loading after 2 seconds
  customerAgreementTable.style.display = "none"; // Hide the booking table while loading
  setTimeout(() => {
    const loader = document.getElementById("loaderId");
    loader.style.display = "none"; // Clear loading after 2 seconds
    customerAgreementTable.style.display = ""; // Hide the booking table while loading
  }, 500);
}
// modal eka close weddi form eka clear karan function eka
formResetFunctionWhenClosingModal("customerAgreementModal", "customerAgreementForm", refreshCustomerAgreementForm);
//Alert Box Call function
Swal.isVisible();
// Export Functionality
const exportTable = (type) => {
  if (type === "excel") {
    exportTableToExcelWithSheetJS("#customerAgreementTable", "customer_agreements", { sheetName: "CustomerAgreements" });
  } else if (type === "pdf") {
    exportTableToPdfWithJsPdf("#customerAgreementTable", "customer_agreements", {
      title: "Customer Agreements",
    });
  } else if (type === "print") {
    customerAgreementFromPrint();
  }
};
