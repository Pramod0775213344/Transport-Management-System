window.addEventListener("load", function () {
    refresh();
    loadInsuranceExpireReportTable();
})


const loadInsuranceExpireReportTable = () =>{

    let insuranceExpireList = getServiceRequest("/report/insuranceexpirevehicle")

//     array eke length eka 0 nam table eka display karanna epa
if (insuranceExpireList.length == 0) {
    // td eke css clean karala text ekak display karanawa
    insuranceExpireReportTableBody.innerHTML = `<tr> <td colspan="7" class="text-center fs-5  m-2">No Data Found</td></tr>`;

} else {
    let propertyList = [
        {propertyName: "vehicle_no", dataType: "string"},
        {propertyName: getSupplier, dataType: "function"},
        {propertyName: getVehicleType, dataType: "function"},
        {propertyName: "insurance_expire_date", dataType: "string"},
        {propertyName: getStatus, dataType: "function"}
    ]

    dataFillIntoTheReportTable(insuranceExpireReportTableBody, insuranceExpireList, propertyList);

    $("#insuranceExpireReportTable").dataTable({
        "createdRow": function(row, data, dataIndex) {
            $(row).find("td").css({
                "text-align": "center",
                "height": "80px"
            });
        },
        "headerCallback": function(thead, data, start, end, display) {
            $(thead).find("th").css({
                "text-align": "center",
                "padding": "20px"
            });
        }
    });
}
}

// get supplier name from data object
const getSupplier = (dataOb) => {
    return dataOb.supplier_id.fullname;
}

// get vehicle type
const getVehicleType = (dataOb) => {
    return dataOb.vehicle_type_id.name;
}

const getStatus = (dataOb) =>{
    if (dataOb.vehicle_status_id.status == 'Active') {
        return "<span class='status-badge status-active'>" + dataOb.vehicle_status_id.status + "</span>"
    }
}

// print view eka
const printInsuranceExpireReport = () =>{
    let newWindow = window.open();
    let preview = "<head><title>TMS</title><link rel='stylesheet' href='/css/common.css'><link rel='stylesheet' href='bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'></head><body><h1 class='bg-secondary p-2 text-dark bg-opacity-25 text-center'>Insurance Expire List</h1><br>" +
        "<div class='row'><div class = 'col-1'></div><div class='col-10'> "+ insuranceExpireReportTable.outerHTML +"</div><div class='col-1'></div> </div></body>";

    newWindow.document.write(preview);

    setTimeout(()=>{
        newWindow.stop();
        newWindow.print();
        newWindow.close();
    },500)
}

//refersh input types and clear the table
const refresh = () => {


    // td eke css clean karala text ekak display karanawa
    insuranceExpireReportTableBody.innerHTML = `<tr> <td colspan="7" class="text-center fs-5 m-2">No Data Found</td></tr>`;


}