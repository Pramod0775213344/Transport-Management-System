window.addEventListener("load", () => {
    // A tiny delay to allow the preloader to render before synchronous blocking calls
    setTimeout(() => {
        try {

            loadCustomerAgreementTable();
        } catch (e) {
            console.error("Error during customer-agreement page initialization:", e);
        } finally {
            // Reveal the content after all synchronous data is fetched
            finishPageLoading();
        }
    }, 100);
});


// table data load function
const loadCustomerAgreementTable = () => {
    const loggedInUser = getServiceRequest("/loggeduserdetails");

    const customerAgreements = getServiceRequest("/customeragreement/customeragreementsbycustomerid?customerid=" + loggedInUser.customer_id);

    if ($.fn.dataTable.isDataTable("#customerAgreementsTable")) {
        $("#customerAgreementsTable").DataTable().destroy();
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
    dataFillIntoTheReportTable(customerAgreementsTableBody, customerAgreements, propertyList, customerAgreemnentView);

    const table = $("#customerAgreementsTable").DataTable({
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

const customerAgreemnentView = (dataOb) => {
}
