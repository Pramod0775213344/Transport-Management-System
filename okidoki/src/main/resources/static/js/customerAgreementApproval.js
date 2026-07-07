window.addEventListener("load", () => {

    loadCustomerAgreementApprovalTable();
    refreshCustomerAgreementAprrovalForm();
})

// load customer agreement approval table
const loadCustomerAgreementApprovalTable = () => {


    customerAgreementByStatus = getServiceRequest('/customeragreementapprove/bycustomeragreementstatusid');

    const propertyList = [
        { propertyName: "cus_agreement_no", dataType: "string" },
        { propertyName: getCustomer, dataType: "function" },
        { propertyName: getPackage, dataType: "function" },
        { propertyName: getPackageRate, dataType: "function" },
        { propertyName: "agreement_end_date", dataType: "string" },
        { propertyName: getCustomerAgreementStatus, dataType: "function" }
    ];

    fillDataIntoApprovalTable(customerAgreementAprrovalTableBody, customerAgreementByStatus, propertyList, customerAgreemnentView);

}

// get customer name
const getCustomer = (dataOb) => {
    return dataOb.customer_id.company_name;
}

// get package name
const getPackage = (dataOb) => {
    return dataOb.package_id.name;
}

// get package rate
const getPackageRate = (dataOb) => {
    return dataOb.package_id.package_charge_cus;
}

// get customer agreement status
const getCustomerAgreementStatus = (dataOb) => {
    if (dataOb.customer_agreement_status_id.status == 'Approved') {
        return "<span class='status-badge status-active'>" + dataOb.customer_agreement_status_id.status + "</span>"
    }

    if (dataOb.customer_agreement_status_id.status == 'Pending') {
        return "<span class='status-badge status-pending'> " + dataOb.customer_agreement_status_id.status + "</span>"
    }
    if (dataOb.customer_agreement_status_id.status == 'Expired') {
        return "<span class='status-badge status-inactive'> " + dataOb.customer_agreement_status_id.status + "</span>"
    }
    if (dataOb.customer_agreement_status_id.status == 'Deleted') {
        return "<span class='status-badge status-inactive'> " + dataOb.customer_agreement_status_id.status + "</span>"
    }
}

// view customer agreement
const customerAgreemnentView = (dataOb) => {
    console.log("Edit", dataOb);

    dataAgreementStatus.innerText = dataOb.customer_agreement_status_id.status;

    dataCus_Reg_No.innerHTML = dataOb.customer_id.customer_reg_no;
    dataCompanyname.innerHTML = dataOb.customer_id.company_name;
    dataCompanyEmail.innerHTML = dataOb.customer_id.direct_email_no;
    dataCompanyAddress.innerHTML = dataOb.customer_id.company_address;
    dataContactPersonName.innerHTML = dataOb.customer_id.contact_person_fullname;
    dataContactPersonEmail.innerHTML = dataOb.customer_id.contact_person_email;
    dataContactPersonMobile.innerHTML = dataOb.customer_id.contact_person_mobileno;


    dataPackageName.innerHTML = dataOb.package_id.name;
    dataVehicleType.innerHTML = dataOb.package_id.vehicle_type_id.name;
    dataCustomerRate.innerHTML = dataOb.package_id.package_charge_cus;
    dataSupplierRate.innerHTML = dataOb.package_id.package_charge_sup;
    dataDistance.innerHTML = dataOb.package_id.distance;
    dataAdditionalKMChargeCustomer.innerHTML = dataOb.package_id.additinal_km_charge_cus;
    dataAdditionalKMChargeSupplier.innerHTML = dataOb.package_id.additinal_km_charge_sup;


    dataAgreementRegNo.innerHTML = dataOb.cus_agreement_no;
    dataAgreementStartDate.innerHTML = dataOb.agreement_date;
    dataAgreementPeriod.innerHTML = dataOb.agreement_period;
    dataEndDate.innerHTML = dataOb.agreement_end_date;


    customerAgreementApprovalNote.value = dataOb.approval_note;

    let selectedCompany = dataOb.customer_id;
    let customerAgreements = getServiceRequest("/customeragreement/bycutomer?customerId=" + selectedCompany.id);
    console.log(customerAgreements, "agreement");
    if (customerAgreements && customerAgreements.length > 0) {
        customerAgreementViewTable.style.display = "";
        newCustomerNote.style.display = "none";
        const propertyList = [
            { propertyName: "cus_agreement_no", dataType: "string" },
            { propertyName: (dataOb) => dataOb.vehicle_type_id.name, dataType: "function" },
            { propertyName: (dataOb) => dataOb.package_id.name, dataType: "function" },
        ];
        dataFillIntoTheReportTable(customerAgreementViewTableBody, customerAgreements, propertyList);
    } else {
        customerAgreementViewTable.style.display = "none";
        newCustomerNote.style.display = "";
    }

    $("#customerAgreementAprrovalModal").modal('show');

    customerAgreementAprrovalButton.onclick = () => {
        customerAgreementAprrovalButton();
    }
}

// data fill table function  without button
const fillDataIntoApprovalTable = (tableBodyId, dataList, propertyList, editFunction, buttonVisibility = false) => {

    tableBodyId.innerHTML = "";

    dataList.forEach((dataob, index) => {
        let tr = document.createElement("tr");

        let tdIndex = document.createElement("td");
        tdIndex.innerHTML = parseInt(index) + 1;
        tr.appendChild(tdIndex);

        for (const property of propertyList) {
            let td = document.createElement("td");

            if (property.dataType == "string") {
                td.innerText = dataob[property.propertyName];
            }
            if (property.dataType == "function") {
                td.innerHTML = property.propertyName(dataob);
            }
            tr.appendChild(td);
        }

        // if you click the tr edita function call
        tr.onclick = () => {
            editFunction(dataob, index);
            window['editOb'] = dataob;
            window['editRowIndex'] = index;
        };


        tableBodyId.appendChild(tr);

    });
}

// Approval button
const customerAgreementAprrovalButton = () => {
    console.log("customerAgreementAprrovalButton", editOb);
    let dataOb = editOb;

    let userConfirm = Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, save it!",
        allowOutsideClick: false,
        customClass :{
            cancelButton :'btn-3d btn-3d-cancel',
            confirmButton :'btn-3d btn-3d-submit'
        }

    }).then((userConfirm) => {
        if (userConfirm.isConfirmed) {
            //call post service
            let putResponse = httpServiceRequest("/customeragreementapprove/update", "PUT", dataOb);
            if (putResponse == "ok") {
                Swal.fire({
                    title: "Saved!",
                    text: "Saved Successfully",
                    icon: "success",
                    customClass :{
                        confirmButton :'btn-3d btn-3d-other'
                    }
                });
                loadCustomerAgreementApprovalTable();
                refreshCustomerAgreementAprrovalForm();
                $("#customerAgreementAprrovalModal").modal('hide');

            } else {
                Swal.fire({
                    title: "Failed to Submit....?",
                    text: putResponse,
                    icon: "question",
                    customClass :{
                        confirmButton :'btn-3d btn-3d-other'
                    }
                });
            }
        } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: "Cancelled",
                text: "Details not Saved!",
                icon: "error",
                customClass :{
                    confirmButton :'btn-3d btn-3d-other'
                }
            });
        }
    });
}

// reject button
const customerAgreementRejectButton = () => {
    console.log("customerAgreementRejectButton", editOb);
    let userConfirm = Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Reject it!",
        allowOutsideClick: false,
        customClass :{
            cancelButton :'btn-3d btn-3d-cancel',
            confirmButton :'btn-3d btn-3d-delete'
        }
    }).then((userConfirm) => {
        if (userConfirm.isConfirmed) {
            //call post service
            let deleteResponse = httpServiceRequest("/customeragreementapprove/reject", "PUT", editOb);
            if (deleteResponse == "ok") {
                Swal.fire({
                    title: "Rejected!",
                    text: "Rejected Successfully",
                    icon: "success",
                    iconColor: "#d33",
                    timer: 1000,
                    showConfirmButton: false,
                    customClass :{
                        confirmButton :'btn-3d btn-3d-other'
                    }
                });
                loadCustomerAgreementApprovalTable();
                refreshCustomerAgreementAprrovalForm();
                $("#customerAgreementAprrovalModal").modal('hide');
            } else {
                Swal.fire({
                    title: "Failed to Submit....?",
                    text: deleteResponse,
                    icon: "question",
                    allowOutsideClick: false,
                    customClass :{
                        confirmButton :'btn-3d btn-3d-other'
                    }
                });
            };
        } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: "Cancelled",
                text: "Details not Deleted!",
                icon: "error",
                customClass :{
                    confirmButton :'btn-3d btn-3d-other'
                }
            });
        };
    });
}

const refreshCustomerAgreementAprrovalForm = () => {

    customerAgreement = new Object();
}


//Alert Box Call function
Swal.isVisible();
