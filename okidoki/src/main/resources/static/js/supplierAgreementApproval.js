window.addEventListener("load", () => {

    loadSupplierAgreementApprovalTable();
    refreshSupplierAgreementAprrovalForm();
})

// load supplier agreement approval table
const loadSupplierAgreementApprovalTable = () => {

    supplierAgreementByStatus = getServiceRequest('/supplieragreementapprove/bysupplieragreementstatusid');

    const propertyList = [
        { propertyName: "sup_agreement_no", dataType: "string" },
        { propertyName: getSupplier, dataType: "function" },
        { propertyName: getPackage, dataType: "function" },
        { propertyName: getPackageRate, dataType: "function" },
        { propertyName: "agreement_end_date", dataType: "string" },
        { propertyName: getSupplierAgreementStatus, dataType: "function" }
    ];

    fillDataIntoApprovalTable(supplierAgreementAprrovalTableBody, supplierAgreementByStatus, propertyList, supplierAgreemnentView);

}

// get supplier name
const getSupplier = (dataOb) => {
    return dataOb.supplier_id.fullname;
}

// get package name
const getPackage = (dataOb) => {
    return dataOb.package_id.name;
}

// get package rate
const getPackageRate = (dataOb) => {
    return dataOb.package_id.package_charge_sup;
}

// get supplier agreement status
const getSupplierAgreementStatus = (dataOb) => {
    if (dataOb.supplier_agreement_status_id.status == 'Approved') {
        return "<span class='status-badge status-active'>" + dataOb.supplier_agreement_status_id.status + "</span>"
    }
    if (dataOb.supplier_agreement_status_id.status == 'Pending') {
        return "<span class='status-badge status-pending'> " + dataOb.supplier_agreement_status_id.status + "</span>"
    }
    if (dataOb.supplier_agreement_status_id.status == 'Expired') {
        return "<span class='status-badge status-inactive'> " + dataOb.supplier_agreement_status_id.status + "</span>"
    }
    if (dataOb.supplier_agreement_status_id.status == 'Deleted') {
        return "<span class='status-badge status-inactive'> " + dataOb.supplier_agreement_status_id.status + "</span>"
    }
}

// view supplier agreement
const supplierAgreemnentView = (dataOb) => {
    console.log("Edit", dataOb);

    dataSupplierName.innerHTML = dataOb.supplier_id.fullname;
    dataSupplierEmail.innerHTML = dataOb.supplier_id.email;
    dataSupplierAddress.innerHTML = dataOb.supplier_id.address;
    dataTransportName.innerHTML = dataOb.supplier_id.transportname;
    dataSupplierMobile.innerHTML = dataOb.supplier_id.mobileno;

    dataVehicleNo.innerHTML = dataOb.vehicle_id.vehicle_no;
    dataVehicleTypeOfVehicle.innerHTML = dataOb.vehicle_id.vehicle_type_id.name;
    dataMakeYear.innerHTML = dataOb.vehicle_id.make_year;
    dataInsuranceExpireDate.innerHTML = dataOb.vehicle_id.insurance_expire_date;
    dataRevenueLicenseExpireDate.innerHTML = dataOb.vehicle_id.revenu_license_expire_date;

    dataPackageName.innerHTML = dataOb.package_id.name;
    dataVehicleType.innerHTML = dataOb.package_id.vehicle_type_id.name;
    dataCustomerRate.innerHTML = dataOb.package_id.package_charge_cus;
    dataSupplierRate.innerHTML = dataOb.package_id.package_charge_sup;
    dataDistance.innerHTML = dataOb.package_id.distance;
    dataAdditionalKMChargeCustomer.innerHTML = dataOb.package_id.additinal_km_charge_cus;
    dataAdditionalKMChargeSupplier.innerHTML = dataOb.package_id.additinal_km_charge_sup;


    dataAgreementRegNo.innerHTML = dataOb.sup_agreement_no;
    dataAgreementStartDate.innerHTML = dataOb.agreement_date;
    dataAgreementPeriod.innerHTML = dataOb.agreement_period;
    dataEndDate.innerHTML = dataOb.agreement_end_date;
    dataAgreementCharge.innerHTML = dataOb.agreement_charge;
    dataAdditionalChargersSupplier.innerHTML = dataOb.additional_charge;

    supplierAgreementApprovalNote.value = dataOb.approval_note;

    $("#supplierAgreementAprrovalModal").modal('show');

    supplierAgreementAprrovalButton.onclick = () => {
        supplierAgreementAprrovalButton();
    }
}

// table function
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
const supplierAgreementAprrovalButton = () => {
    console.log("supplierAgreementAprrovalButton", editOb);
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
            let putResponse = httpServiceRequest("/supplieragreementapprove/update", "PUT", dataOb);
            if (putResponse == "ok") {
                Swal.fire({
                    title: "Saved!",
                    text: "Saved Successfully",
                    icon: "success",
                    customClass :{
                        confirmButton :'btn-3d btn-3d-other'
                    }
                });
                loadSupplierAgreementApprovalTable();
                refreshSupplierAgreementAprrovalForm();
                $("#supplierAgreementAprrovalModal").modal('hide');

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
const supplierAgreementRejectButton = () => {
    console.log("supplierAgreementRejectButton", editOb);
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
            let deleteResponse = httpServiceRequest("/supplieragreementapprove/reject", "PUT", editOb);
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
                loadSupplierAgreementApprovalTable();
                refreshSupplierAgreementAprrovalForm();
                $("#supplierAgreementAprrovalModal").modal('hide');
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

// form refresh function
const refreshSupplierAgreementAprrovalForm = () => {

    supplierAgreement = new Object();
}

//Alert Box Call function
Swal.isVisible();
