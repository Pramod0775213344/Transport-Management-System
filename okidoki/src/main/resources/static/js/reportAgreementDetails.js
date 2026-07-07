window.addEventListener("load", function () {
    refresh();

    // vehicle supplier agreement table eka load karanwa
    $('#vehicleSupplierAgreementDetailsTable').DataTable().clear().draw(); // Clear table if no data
    $('#vehicleSupplierAgreementDetailsTable tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');

    // Customer agreement table eka load karanwa
    $('#customerAgreementDetailsTable').DataTable().clear().draw(); // Clear table if no data
    $('#customerAgreementDetailsTable tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');

    // printButton eka hide karanwa
    printSupplierAgreement.style.display = "none";
    printButtonCustomerAgreement.style.display = "none";
})

// ----------------------------customer agreement details start_____________________________________________

// search area
const searchCustomerAgreement = () =>{
    if ($.fn.dataTable.isDataTable('#customerAgreementDetailsTable')) {
        $('#customerAgreementDetailsTable').DataTable().clear().destroy();
    }
    let searchCustomerForCustomerAgreement = document.getElementById("searchCustomerForCustomerAgreement");

    // date range ekai supplier ekai select karala thiyenne oni
    if (searchCustomerForCustomerAgreement.value !== "" && dateFromCustomerAgreement.value !== "" && dateToCustomerAgreement.value !== "") {

        const customerId = JSON.parse(searchCustomerForCustomerAgreement.value).id;
        let customerAgreements = getServiceRequest(
            "/report/customeragreement/bydaterangeandcustomerid?startdate="+dateFromCustomerAgreement.value +"&endtdate=" +dateToCustomerAgreement.value +"&customerid=" + customerId
        );
        if (customerAgreements.length === 0){
            $('#customerAgreementDetailsTable').DataTable().clear().draw(); // Clear table if no data
            $('#customerAgreementDetailsTable tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');
            printButtonCustomerAgreement.style.display = "none";
        }else{
            loadCustomerAgreementDetailsTable(customerAgreements);
            //     print view form details
            startDateViewCustomerAgreement.innerText = dateFromCustomerAgreement.value;
            endDateViewCustomerAgreement.innerText = dateToCustomerAgreement.value;
            customerName.innerText = customerId.company_name;
            recordCountCustomerAgreement.innerText = customerAgreements.length;
            totalCustomerAgreementCount.innerText = customerAgreements.length;

            // approved agreement count eka
            let approvedCount = customerAgreements.filter(agreement => agreement.customer_agreement_status_id.status === "Approved").length;
            totalApprovedCustomerAgreementCount.innerText = approvedCount;
            // pending agreement count eka
            let pendingCount = customerAgreements.filter(agreement => agreement.customer_agreement_status_id.status === "Pending").length;
            totalPendingCustomerAgreementCount.innerText = pendingCount;
            // reject agreement count eka
            let rejectCount = customerAgreements.filter(agreement => agreement.customer_agreement_status_id.status === "Reject").length;
            totalRejectCustomerAgreementCount.innerText = rejectCount;

            printButtonCustomerAgreement.style.display = "block";
        }
        showTableLoading2();
        //     date range eka witharak select karala thiyenw nam
    }else if (searchCustomerForCustomerAgreement.value == "" && dateFromCustomerAgreement.value !== "" && dateToCustomerAgreement.value !== "") {
        let customerAgreements = getServiceRequest(
            "/report/customeragreement/bydaterange?startdate="+dateFromCustomerAgreement.value +"&endtdate=" +dateToCustomerAgreement.value
        );
        if (customerAgreements.length === 0){
            $('#customerAgreementDetailsTable').DataTable().clear().draw(); // Clear table if no data
            $('#customerAgreementDetailsTable tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');
            printButtonCustomerAgreement.style.display = "none";
        }else{
            loadCustomerAgreementDetailsTable(customerAgreements);

            //     print view form details
            startDateViewCustomerAgreement.innerText = dateFromCustomerAgreement.value;
            endDateViewCustomerAgreement.innerText = dateToCustomerAgreement.value;
            customerName.innerText = "All Customers";
            recordCountCustomerAgreement.innerText = customerAgreements.length;
            totalCustomerAgreementCount.innerText = customerAgreements.length;

            // approved agreement count eka
            let approvedCount = customerAgreements.filter(agreement => agreement.customer_agreement_status_id.status === "Approved").length;
            totalApprovedCustomerAgreementCount.innerText = approvedCount;
            // pending agreement count eka
            let pendingCount = customerAgreements.filter(agreement => agreement.customer_agreement_status_id.status === "Pending").length;
            totalPendingCustomerAgreementCount.innerText = pendingCount;
            // reject agreement count eka
            let rejectCount = customerAgreements.filter(agreement => agreement.customer_agreement_status_id.status === "Reject").length;
            totalRejectCustomerAgreementCount.innerText = rejectCount;

            printButtonCustomerAgreement.style.display = "block";
        }
        showTableLoading2();
    }else{
        Swal.fire({
            title: "Opps?",
            text: "Please Select Date Range or Date Range with Supplier",
            icon: "question",
            allowOutsideClick: false,
        });
        $('#customerAgreementDetailsTable').DataTable().clear().draw(); // Clear table if no data
        $('#customerAgreementDetailsTable tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');
        printButtonCustomerAgreement.style.display = "none";
    }

}

// load customer agreement tables
const loadCustomerAgreementDetailsTable = (customerAgreements) =>{

    let propertyList = [
        {propertyName: "cus_agreement_no", dataType: "string"},
        {propertyName: getCustomerAgreementCustomer, dataType: "function"},
        {propertyName: getCustomerAgreementVehicleType, dataType: "function"},
        {propertyName: "added_datetime", dataType: "datetime"},
        {propertyName: getCustomerAgreementAddedUser, dataType: "function"},
        {propertyName: "reject_datetime", dataType: "datetime"},
        {propertyName: getCustomerAgreementRejectedUser, dataType: "function"},
        {propertyName: "approved_datetime", dataType: "datetime"},
        {propertyName: getCustomerAgreementApprovedUser, dataType: "function"},
        {propertyName: getStatus, dataType: "function"}
        ]
    dataFillIntoTheReportTable(customerAgreementDetailsTableBody, customerAgreements, propertyList);

    // print view table ekata data filla karanawa
    dataFillIntoTheReportTable(printViewTableCustomerAgreement, customerAgreements, propertyList);

    $("#customerAgreementDetailsTable").dataTable({
        scrollX: true,
        "createdRow": function(row, data, dataIndex) {
            $(row).find("td").css({
                "text-align": "center",
                "height": "80px"
            });
        },
        "headerCallback": function(thead, data, start, end, display) {
            $(thead).find("th").css({
                "text-align": "center",
                "height": "80px"
            });
        }
    });

}

// get supplier name from data object
const getCustomerAgreementCustomer = (dataOb) => {
    return dataOb.customer_id.company_name;
}

// get vehicle type
const getCustomerAgreementVehicleType = (dataOb) => {
    return dataOb.vehicle_type_id.name;
}

const getCustomerAgreementAddedUser = (dataOb) => {
    let findUser = userList.find(user =>user.id === dataOb.added_user_id)
    return findUser && findUser.employee_id && findUser.employee_id.fullname ? findUser.employee_id.fullname : "-";

}

const getCustomerAgreementRejectedUser = (dataOb) =>{
    let findUser = userList.find(user =>user.id === dataOb.reject_user_id)
    return findUser && findUser.employee_id && findUser.employee_id.fullname ? findUser.employee_id.fullname : "-";
}

const getCustomerAgreementApprovedUser = (dataOb) =>{
    let findUser = userList.find(user =>user.id === dataOb.approved_user_id)
    return findUser && findUser.employee_id && findUser.employee_id.fullname ? findUser.employee_id.fullname : "-";
}

const getStatus = (dataOb) =>{
    if ( dataOb.customer_agreement_status_id.status === "Approved"){
        return" <span style='color: #006600'> "+dataOb.customer_agreement_status_id.status +"</span>";
    }else if ( dataOb.customer_agreement_status_id.status === "Pending"){
        return" <span style='color: #cc6600'>"+ dataOb.customer_agreement_status_id.status+" </span>";
    }else if( dataOb.customer_agreement_status_id.status === "Reject"){
        return" <span style='color: #cc0000'>"+ dataOb.customer_agreement_status_id.status +"</span>";
    }
}


// print view eka
const printCustomerAgreementReport = () =>{
    let newWindow = window.open();
    let printView = document.getElementById("printViewCustomerAgreement");
    printView.style.display = "block";
    generateDateCustomerAgreement.innerText = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    generateTimeCustomerAgreement.innerText = new Date().toLocaleTimeString();
    generateUserCustomerAgreement.innerText = loggedEmployee.fullname;
    console.log(printView)
    let preview = "<head><title>TMS</title><link rel='stylesheet' href='/css/common.css'><link rel='stylesheet' href='bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'></head><body>" +
        printView.outerHTML +"</body>";

    newWindow.document.write(preview);

    setTimeout(()=>{
        printView.style.display = "none";
        newWindow.stop();
        newWindow.print();
        newWindow.close();
    },500)
}

// reset the search fields and table
const customerSearchReset = () =>{
    dateFromCustomerAgreement.value = "";
    dateToCustomerAgreement.value = "";
    searchCustomerForCustomerAgreement.value = "";

    $('#customerAgreementDetailsTable').DataTable().clear().draw(); // Clear table if no data
    $('#customerAgreementDetailsTable tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');
    showTableLoading2();
    printButtonCustomerAgreement.style.display = "none";

//     print view eke thiyewn remove karanna oni
    startDateViewCustomerAgreement.innerText = '';
    endDateViewCustomerAgreement.innerText = '';
    customerName.innerText = "";
    recordCountCustomerAgreement.innerText = '';
    totalCustomerAgreementCount.innerText = '';

    // approved agreement count eka
    totalApprovedCustomerAgreementCount.innerText = '';
    // pending agreement count eka
    totalPendingCustomerAgreementCount.innerText = '';
    // reject agreement count eka
    totalRejectCustomerAgreementCount.innerText = '';

}

// ----------------------------customer agreement details end ____________________________________________

// ----------------------------Vehicle Supplier agreement details_____________________________________________

// load booking deatils
const searchVehicleSupplierAgreement = () =>{
    if ($.fn.dataTable.isDataTable('#vehicleSupplierAgreementDetailsTable')) {
        $('#vehicleSupplierAgreementDetailsTable').DataTable().clear().destroy();
    }
    let searchSupplierForVehicleSupplierAgreement = document.getElementById("searchSupplierForVehicleSupplierAgreement");

    // date range ekai supplier ekai select karala thiyenne oni
    if (searchSupplierForVehicleSupplierAgreement.value !== "" && dateFromVehicleSupplierAgreement.value !== "" && dateToVehicleSupplierAgreement.value !== "") {

        const supplierId = JSON.parse(searchSupplierForVehicleSupplierAgreement.value).id;
        let supplierAgreements = getServiceRequest(
            "/report/supplieragreement/bydaterangeandsupplierid?startdate="+dateFromVehicleSupplierAgreement.value +"&endtdate=" +dateToVehicleSupplierAgreement.value +"&supplierid=" + supplierId
        );
        if (supplierAgreements.length === 0){
            $('#vehicleSupplierAgreementDetailsTable').DataTable().clear().draw(); // Clear table if no data
            $('#vehicleSupplierAgreementDetailsTable tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');
            printSupplierAgreement.style.display = "none";
        }else{
            loadSupplierAgreementDetailsTable(supplierAgreements);
        //     print view form details
            startDateView.innerText = dateFromVehicleSupplierAgreement.value;
            endDateView.innerText = dateToVehicleSupplierAgreement.value;
            supplierName.innerText = supplierId.transportname;
            recordCount.innerText = supplierAgreements.length;
            totalSupplierAgreementCount.innerText = supplierAgreements.length;

            // approved agreement count eka
            let approvedCount = supplierAgreements.filter(agreement => agreement.supplier_agreement_status_id.status === "Approved").length;
            totalApprovedSupplierAgreementCount.innerText = approvedCount;
            // pending agreement count eka
            let pendingCount = supplierAgreements.filter(agreement => agreement.supplier_agreement_status_id.status === "Pending").length;
            totalPendingSupplierAgreementCount.innerText = pendingCount;
            // reject agreement count eka
            let rejectCount = supplierAgreements.filter(agreement => agreement.supplier_agreement_status_id.status === "Reject").length;
            totalRejectSupplierAgreementCount.innerText = rejectCount;

            printSupplierAgreement.style.display = "block";
        }
        showTableLoading();
    //     date range eka witharak select karala thiyenw nam
    }else if (searchSupplierForVehicleSupplierAgreement.value == "" && dateFromVehicleSupplierAgreement.value !== "" && dateToVehicleSupplierAgreement.value !== "") {
        let supplierAgreements = getServiceRequest(
            "/report/supplieragreement/bydaterange?startdate="+dateFromVehicleSupplierAgreement.value +"&endtdate=" +dateToVehicleSupplierAgreement.value
        );
        if (supplierAgreements.length === 0){
            $('#vehicleSupplierAgreementDetailsTable').DataTable().clear().draw(); // Clear table if no data
            $('#vehicleSupplierAgreementDetailsTable tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');
            printSupplierAgreement.style.display = "none";
        }else{
            loadSupplierAgreementDetailsTable(supplierAgreements);

            //     print view form details
            startDateView.innerText = dateFromVehicleSupplierAgreement.value;
            endDateView.innerText = dateToVehicleSupplierAgreement.value;
            supplierName.innerText = "All Transport";
            recordCount.innerText = supplierAgreements.length;
            totalSupplierAgreementCount.innerText = supplierAgreements.length;

            // approved agreement count eka
            let approvedCount = supplierAgreements.filter(agreement => agreement.supplier_agreement_status_id.status === "Approved").length;
            totalApprovedSupplierAgreementCount.innerText = approvedCount;
            // pending agreement count eka
            let pendingCount = supplierAgreements.filter(agreement => agreement.supplier_agreement_status_id.status === "Pending").length;
            totalPendingSupplierAgreementCount.innerText = pendingCount;
            // reject agreement count eka
            let rejectCount = supplierAgreements.filter(agreement => agreement.supplier_agreement_status_id.status === "Reject").length;
            totalRejectSupplierAgreementCount.innerText = rejectCount;

            printSupplierAgreement.style.display = "block";
        }
        showTableLoading();
    }else{
        Swal.fire({
            title: "Opps?",
            text: "Please Select Date Range or Date Range with Supplier",
            icon: "question",
            allowOutsideClick: false,
        });
        $('#vehicleSupplierAgreementDetailsTable').DataTable().clear().draw(); // Clear table if no data
        $('#vehicleSupplierAgreementDetailsTable tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');
        printSupplierAgreement.style.display = "none";
    }

}

// load supplier agreement details to the table
const loadSupplierAgreementDetailsTable = (supplierAgreements) =>{

    let propertyList = [
        {propertyName: "sup_agreement_no", dataType: "string"},
        {propertyName: getSupplierAgreementSupplier, dataType: "function"},
        {propertyName: getSupplierAgreementVehicle, dataType: "function"},
        {propertyName: "added_datetime", dataType: "datetime"},
        {propertyName: getSupplierAgreementAddedUser, dataType: "function"},
        {propertyName: "reject_datetime", dataType: "datetime"},
        {propertyName: getSupplierAgreementRejectedUser, dataType: "function"},
        {propertyName: "approved_datetime", dataType: "datetime"},
        {propertyName: getSupplierAgreementApprovedUser, dataType: "function"},
        {propertyName: getSupplierAgreementStatus, dataType: "function"}
    ]
    dataFillIntoTheReportTable(vehicleSupplierAgreementDetailsTableBody, supplierAgreements, propertyList);

    // print view table ekata data filla karanawa
    dataFillIntoTheReportTable(printViewTable, supplierAgreements, propertyList);

    $("#vehicleSupplierAgreementDetailsTable").dataTable({
        scrollX: true,
        "createdRow": function(row, data, dataIndex) {
            $(row).find("td").css({
                "text-align": "center",
                "height": "80px"
            });
        },
        "headerCallback": function(thead, data, start, end, display) {
            $(thead).find("th").css({
                "text-align": "center",
                "height": "80px"
            });
        },
    });

}

// get supplier name from data object
const getSupplierAgreementSupplier = (dataOb) => {
    return dataOb.supplier_id.fullname;
}

// get vehicle type
const getSupplierAgreementVehicle = (dataOb) => {
    return dataOb.vehicle_id.vehicle_no;
}

const getSupplierAgreementAddedUser = (dataOb) => {
    let findUser = userList.find(user =>user.id === dataOb.added_user_id)
    return findUser && findUser.employee_id && findUser.employee_id.fullname ? findUser.employee_id.fullname : "-";

}

const getSupplierAgreementRejectedUser = (dataOb) =>{
    let findUser = userList.find(user =>user.id === dataOb.reject_user_id)
    return findUser && findUser.employee_id && findUser.employee_id.fullname ? findUser.employee_id.fullname : "-";
}

const getSupplierAgreementApprovedUser = (dataOb) =>{
    let findUser = userList.find(user =>user.id === dataOb.approved_user_id)
    return findUser && findUser.employee_id && findUser.employee_id.fullname ? findUser.employee_id.fullname : "-";
}

const getSupplierAgreementStatus = (dataOb) =>{
    if ( dataOb.supplier_agreement_status_id.status === "Approved"){
        return" <span style='color: #006600'> "+dataOb.supplier_agreement_status_id.status +"</span>";
    }else if ( dataOb.supplier_agreement_status_id.status === "Pending"){
        return" <span style='color: #cc6600'>"+ dataOb.supplier_agreement_status_id.status+" </span>";
    }else if( dataOb.supplier_agreement_status_id.status === "Reject"){
        return" <span style='color: #cc0000'>"+ dataOb.supplier_agreement_status_id.status +"</span>";
    }
}

// print of supplier agreement report
const printSupplierAgreementReport = () =>{
    let newWindow = window.open();
    let printView = document.getElementById("printViewSupplierAgreement");
    printView.style.display = "block";
    generateDate.innerText = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    generateTime.innerText = new Date().toLocaleTimeString();
    generateUser.innerText = loggedEmployee.fullname;
    console.log(printView)
    let preview = "<head><title>TMS</title><link rel='stylesheet' href='/css/common.css'><link rel='stylesheet' href='bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'></head><body>" +
        printView.outerHTML +"</body>";

    newWindow.document.write(preview);

    setTimeout(()=>{
        printView.style.display = "none";
        newWindow.stop();
        newWindow.print();
        newWindow.close();
    },500)
}

// reset the search fields and table
const supplierSearchReset = () =>{
    dateFromVehicleSupplierAgreement.value = "";
    dateToVehicleSupplierAgreement.value = "";
    searchSupplierForVehicleSupplierAgreement.value = "";

    $('#vehicleSupplierAgreementDetailsTable').DataTable().clear().draw(); // Clear table if no data
    $('#vehicleSupplierAgreementDetailsTable tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');
    showTableLoading();
    printSupplierAgreement.style.display = "none";

//     print view eke thiyewn remove karanna oni
    startDateView.innerText = '';
    endDateView.innerText = '';
    supplierName.innerText = "";
    recordCount.innerText = '';
    totalSupplierAgreementCount.innerText = '';

    // approved agreement count eka
    totalApprovedSupplierAgreementCount.innerText = '';
    // pending agreement count eka
    totalPendingSupplierAgreementCount.innerText = '';
    // reject agreement count eka
    totalRejectSupplierAgreementCount.innerText = '';
}

// ----------------------------Vehicle Supplier agreement details End_____________________________________________

//refersh input types and clear the table
const refresh = () => {
    // get user all data for view details
    userList = getServiceRequest("report/useralldata")
    // employee wa hoyaganna log wela inna
    employeeList = getServiceRequest("/employee/alldata")
    logedUser = getServiceRequest("/loggeduserdetails");
    loggedEmployee = employeeList.find(employee =>employee.id === logedUser.employee_id);

    let transportName = getServiceRequest('/supplier/alldata');
    dataFilIntoSelect(searchSupplierForVehicleSupplierAgreement, "All ", transportName, "transportname")

    let customerNameList = getServiceRequest('/customer/alldata');
    dataFilIntoSelect(searchCustomerForCustomerAgreement, "All ", customerNameList, "company_name")


}

// table eke loading spin eka load karanwa
function showTableLoading(loaderId,tableId) {
    const loader = document.getElementById('loaderId');
    const vehicleSupplierAgreementDetailsTable = document.getElementById('vehicleSupplierAgreementDetailsTable');
    loader.style.display = ''; // Clear loading after 2 seconds
    vehicleSupplierAgreementDetailsTable.style.display = 'none'; // Hide the booking table while loading
    setTimeout(() => {
        const loader = document.getElementById('loaderId');
        loader.style.display = 'none'; // Clear loading after 2 seconds
        vehicleSupplierAgreementDetailsTable.style.display = ''; // Hide the booking table while loading
    }, 500);
}

// table eke loading spin eka load karanwa customer agreement ekata
function showTableLoading2() {
    const loader = document.getElementById('loaderIdCustomer');
    const customerAgreementDetailsTable = document.getElementById('customerAgreementDetailsTable');
    loader.style.display = ''; // Clear loading after 2 seconds
    customerAgreementDetailsTable.style.display = 'none'; // Hide the booking table while loading
    setTimeout(() => {
        const loader = document.getElementById('loaderIdCustomer');
        loader.style.display = 'none'; // Clear loading after 2 seconds
        customerAgreementDetailsTable.style.display = ''; // Hide the booking table while loading
    }, 500);
}