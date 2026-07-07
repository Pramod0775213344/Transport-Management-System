window.addEventListener("load", function () {
    refresh();

    // vehicle supplier agreement table eka load karanwa
    $('#bookingReportTable').DataTable().clear().draw(); // Clear table if no data
    $('#bookingReportTable tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');
})


const loadBookingReportTable = () =>{
    if ($.fn.dataTable.isDataTable('#bookingReportTable')) {
        $('#bookingReportTable').DataTable().clear().destroy();
    }
    let bookingReportTableData = getServiceRequest("/reportbooking/bydaterangeandtype?startdate="+ textStarDate.value +"&endtdate="+textEndDate.value )

//     array eke length eka 0 nam table eka display karanna epa
if (bookingReportTableData.length == 0) {
    // td eke css clean karala text ekak display karanawa
    $('#bookingReportTable').DataTable().clear().draw(); // Clear table if no data
    $('#bookingReportTable tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');
    showTableLoading();
    printButtonBookingReport.style.display = "none";
} else {
    let propertyList = [
        {propertyName: "booking_no", dataType: "string"},
        {propertyName: getCustomer, dataType: "function"},
        {propertyName: getPickupLoaction, dataType: "function"},
        {propertyName: getViaLoaction, dataType: "function"},
        {propertyName: getDeliveryLoaction, dataType: "function"},
        {propertyName: getDistance, dataType: "function"},
        {propertyName: getVehicelType, dataType: "function"},
        {propertyName: getVehicle, dataType: "function"},
        {propertyName: getDriver, dataType: "function"},
        {propertyName: "arrived_at_pickup_datetime", dataType: "datetime"},
        {propertyName: "departed_from_pickup_datetime", dataType: "datetime"},
        {propertyName: "arrived_at_delivery_datetime", dataType: "datetime"},
        {propertyName: "departed_from_delivery_datetime", dataType: "datetime"},
        {propertyName: getStatus, dataType: "function"}
        ]

    dataFillIntoTheReportTable(bookingReportTableBody, bookingReportTableData, propertyList);
    printButtonBookingReport.style.display = "";
    showTableLoading();
    $("#bookingReportTable").dataTable({
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
                "padding": "20px"
            });
        }
    });
}
}

// get customer name from data object
const getCustomer = (dataOb) => {
    return dataOb.customer_id.company_name;
}

// get pickup location
const getPickupLoaction = (dataOb) => {
    return "<span>" + dataOb.pickup_locations_id.name + "</span><span><p class='text-muted mt-2' >"+ (dataOb.pickup_date_time).replace('T', ' ') +"</p></span>";
}

// get via locations if available
const getViaLoaction = (dataOb) => {
    if (dataOb.locations.length > 0) {
        let locations = "";
        dataOb.locations.forEach((vialocation, index) => {
            if (dataOb.locations.length - 1 == index) {
                locations += vialocation.name;
            } else {
                locations += vialocation.name + ",<br>";
            }
        });
        return locations;
    } else {
        return " - "
    }

}

// get delivery location
const getDeliveryLoaction = (dataOb) => {
    return "<span>" + dataOb.delivery_locations_id.name + "</span><span><p class='text-muted mt-2' >"+ (dataOb.delivery_date_time).replace('T', ' ') +"</p></span>";

}

const getDistance = (dataOb) =>{
    return dataOb.distance + " km";
}

const getVehicelType = (dataOb) =>{
    return dataOb.vehicle_type_id.name;
}

const getVehicle = (dataOb) =>{
    if (dataOb.vehicle_id == null) {
        return " - "
    }else{
        return dataOb.vehicle_id.vehicle_no;
    }
}

const getDriver = (dataOb) =>{
    if (dataOb.driver_id == null) {
        return " - "
    }else{
        return dataOb.driver_id.fullname;
    }

}

const getStatus = (dataOb) =>{
    if (dataOb.booking_status_id.status == "Inproccess") {
        return "<div class = 'status-cell status-inprocess'> <span class='status-indicator'></span>" + dataOb.booking_status_id.status + "</div>"
    }
    if (dataOb.booking_status_id.status == "Attend") {
        return "<div  class = 'status-cell status-attend'> <span class='status-indicator'></span>" + dataOb.booking_status_id.status + "</div>"
    }
    if (dataOb.booking_status_id.status == "Arrived At Pickup") {
        return "<div  class = 'status-cell status-arrived-pickup'><span class='status-indicator'></span> " + dataOb.booking_status_id.status + "</div>"
    }
    if (dataOb.booking_status_id.status == "Departed From Pickup") {
        return "<div  class = 'status-cell status-departed-pickup'><span class='status-indicator'></span>" + dataOb.booking_status_id.status + "</div>"
    }
    if (dataOb.booking_status_id.status == "Arrived At Delivery") {
        return "<div  class = 'status-cell status-arrived-delivery '><span class='status-indicator'></span>" + dataOb.booking_status_id.status + "</div>"
    }
    if (dataOb.booking_status_id.status == "Departed From Delivery") {
        return "<div  class = 'status-cell status-departed'><span class='status-indicator'></span>" + dataOb.booking_status_id.status + "</div>"
    }
    if (dataOb.booking_status_id.status == "Cancelled") {
        return "<div  class = 'status-cell status-cancelled'><span class='status-indicator'></span>" + dataOb.booking_status_id.status + "</div>"
    }
    if (dataOb.booking_status_id.status == "Operation Confirmed") {
        return "<div  class = 'status-cell status-operation-confirmed'><span class='status-indicator'></span>" + dataOb.booking_status_id.status + "</div>"
    }
}

// print view eka
const printBookingReport = () =>{
    let newWindow = window.open();
    let preview = "<head><title>TMS</title><link rel='stylesheet' href='/css/common.css'><link rel='stylesheet' href='bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'></head><body><h1 class='bg-secondary p-2 text-dark bg-opacity-25 text-center'>Booking Report</h1><br>" +
        "<div class='row'><div class = 'col-1'></div><div class='col-10'> "+ bookingReportTable.outerHTML +"</div><div class='col-1'></div> </div></body>";

    newWindow.document.write(preview);

    setTimeout(()=>{
        newWindow.stop();
        newWindow.print();
        newWindow.close();
    },500)
}

//refersh input types and clear the table
const refresh = () => {
    textStarDate.value = "";
    textEndDate.value = "";

    $('#bookingReportTable').DataTable().clear().draw(); // Clear table if no data
    $('#bookingReportTable tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');
    showTableLoading();
    printButtonBookingReport.style.display = "none";
}

// table eke loading spin eka load karanwa
function showTableLoading() {
    const loader = document.getElementById('loaderId');
    const bookingReportTable = document.getElementById('bookingReportTable');
    loader.style.display = ''; // Clear loading after 2 seconds
    bookingReportTable.style.display = 'none'; // Hide the booking table while loading
    setTimeout(() => {
        const loader = document.getElementById('loaderId');
        loader.style.display = 'none'; // Clear loading after 2 seconds
        bookingReportTable.style.display = ''; // Hide the booking table while loading
    }, 500);
}