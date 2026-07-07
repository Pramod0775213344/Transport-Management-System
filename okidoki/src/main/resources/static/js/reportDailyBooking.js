window.addEventListener("load",() =>{

    hourlyBookingTrendChartFunction();
    booingCountByStatus();
    refreshDailyBookingReport();
})

// daily hourly booking count eka chart eken generate karana function eka
const hourlyBookingTrendChartFunction = () =>{

    let datalist = getServiceRequest('/report/dailyhourlybooking');

    let reportDatalist = new Array();
    let data = new Array();
    let label = new Array();

    for (const index in datalist) {
        let object = new Object();
        object.hour = datalist[index][0];
        object.booking_count = datalist[index][1];
        reportDatalist.push(object);

        label.push(datalist[index][0]);
        data.push(datalist[index][1]);
    }

    const propertyList = [
        { propertyName: "hour", dataType: "string" },
        { propertyName: "booking_count", dataType: "string" },
    ];

    // table generate
    dataFillIntoTheReportTable(document.getElementById("hourlyBookingTrendTableBody"), reportDatalist, propertyList);

    // chart generate
    const ctx = document.getElementById('hourlyBookingTrendChart');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: label,
            datasets: [{
                label: 'Number Of Bookings',
                data: data,
                backgroundColor: [
                    '#cc0000',
                    '#ff3333',
                    '#ff6666',
                    '#ff9999',
                    '#ffcccc',
                    '#800000',
                ],
                borderColor: '#ffffff',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

//daily booking status count
const booingCountByStatus = () =>{

    let datalist = getServiceRequest('/report/bookingbystatusdaily');

    let reportDatalist = new Array();
    let data = new Array();
    let label = new Array();

    for (const index in datalist) {
        let object = new Object();
        object.status = datalist[index][0];
        object.booking_count = datalist[index][1];
        reportDatalist.push(object);

        label.push(datalist[index][0]);
        data.push(datalist[index][1]);
    }

    const propertyList = [
        { propertyName: "status", dataType: "string" },
        { propertyName: "booking_count", dataType: "string" },
    ];

    // table generate
    dataFillIntoTheReportTable(document.getElementById("bookingStatusDistributionTableBody"), reportDatalist, propertyList);

    // chart generate
    const ctx = document.getElementById('bookingStatusDistributionChart');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: label,
            datasets: [{
                label: 'Distance(KM)',
                data: data,
                borderColor: '#e81515',
                backgroundColor :function(context) {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) {
                        return null;
                    }
                    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    // gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
                    // gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.4)');
                    // gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
                    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');   // Primary red (#EF4444)
                    gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.4)');
                    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.1)');
                    return gradient;
                },
                borderWidth: 2.5,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#EF4444', // Primary red
                pointBorderColor: '#B91C1C',     // Darker red
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointHoverBackgroundColor: '#EF4444', // Primary red
                pointHoverBorderColor: '#B91C1C',     // Darker red
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// selecte tage for view in hourlt booking trend
let selectHourlyBookingView = document.getElementById("selectHourlyBookingView");
selectHourlyBookingView.addEventListener("change",() =>{
if (selectHourlyBookingView.value ==="Chart"){
    hourlyBookingTrendChart.style.display = ""
    hourlyBookingTrendTable.style.display = "none";

}else if(selectHourlyBookingView.value === "Table"){
    hourlyBookingTrendChart.style.display = "none"
    hourlyBookingTrendTable.style.display = "";
}
})


// select tage for view in status booking distribution trend
let selectBookingStatusDistributionView = document.getElementById("selectBookingStatusDistributionView");
selectBookingStatusDistributionView.addEventListener("change",() =>{
    if (selectBookingStatusDistributionView.value ==="Chart"){
        bookingStatusDistributionChart.style.display = ""
        bookingStatusDistributionTable.style.display = "none";

    }else if(selectBookingStatusDistributionView.value === "Table"){
        bookingStatusDistributionChart.style.display = "none"
        bookingStatusDistributionTable.style.display = "";
    }
});

// table search area with selected elements
const searchDailyBookings = () => {
    if ($.fn.dataTable.isDataTable('#dailyBookingReportTable')) {
        $('#dailyBookingReportTable').DataTable().clear().destroy();
    }
    let searchCustomerName = document.getElementById('selectCustomerName');
    let searchStatus = document.getElementById('selectStatus');

    if (searchCustomerName.value !== "" && searchStatus.value !== ""){

        let dailyBookingReportByCustomerAndStatus = getServiceRequest('/report/alldailybookingsbycustomerandstatus?customerId='+ JSON.parse(searchCustomerName.value).id +'&bookingStatusId='+ JSON.parse(searchStatus.value).id);

        // vehicel utilization deatils fill karawna table eke search karana ekata anuwa
        let vehicleUtilizationDetailsList = getServiceRequest('/report/vehicleutilizationsummarybycustomerandstatus?customerId='+ JSON.parse(searchCustomerName.value).id +'&bookingStatusId='+ JSON.parse(searchStatus.value).id);

        if (dailyBookingReportByCustomerAndStatus.length === 0) {
            // td eke css clean karala text ekak display karanawa
            $('#dailyBookingReportTable').DataTable().clear().draw(); // Clear table if no data
            $('#dailyBookingReportTable tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');
            showTableLoading();
            printButtonDailyBookingReport.style.display = "none";
        } else {
            loadDailyBookingReportTable(dailyBookingReportByCustomerAndStatus);
            showTableLoading();
            loadVehicleUtilizationDetailsTable(vehicleUtilizationDetailsList);
            printButtonDailyBookingReport.style.display = "";
        }

    }else if (searchCustomerName.value !== "" && searchStatus.value === "") {

      let dailyBookingReportByCustomer = getServiceRequest('/report/alldailybookingsbycustomer?customerId='+ JSON.parse(searchCustomerName.value).id);

        // vehicel utilization deatils fill karawna table eke search karana ekata anuwa
      let vehicleUtilizationDetailsList = getServiceRequest('/report/vehicleutilizationsummarybycustomer?customerId='+ JSON.parse(searchCustomerName.value).id);

        if (dailyBookingReportByCustomer.length === 0) {
            // td eke css clean karala text ekak display karanawa
            $('#dailyBookingReportTable').DataTable().clear().draw(); // Clear table if no data
            $('#dailyBookingReportTable tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');
            showTableLoading();
            printButtonDailyBookingReport.style.display = "none";
        }else{
            loadDailyBookingReportTable(dailyBookingReportByCustomer);
            showTableLoading();
            loadVehicleUtilizationDetailsTable(vehicleUtilizationDetailsList);
            printButtonDailyBookingReport.style.display = "";
        }
    } else if (searchStatus.value !== "" && searchCustomerName.value === "") {

        let dailyBookingReportByStatus = getServiceRequest('/report/alldailybookingsbystatus?bookingStatusId='+ JSON.parse(searchStatus.value).id);

        // vehicel utilization deatils fill karawna table eke search karana ekata anuwa
        let vehicleUtilizationDetailsList = getServiceRequest('/report/vehicleutilizationsummarybystatus?bookingStatusId='+ JSON.parse(searchStatus.value).id);

        if (dailyBookingReportByStatus.length == 0) {
            // td eke css clean karala text ekak display karanawa
            $('#dailyBookingReportTable').DataTable().clear().draw(); // Clear table if no data
            $('#dailyBookingReportTable tbody').html('<tr><td colspan="100%" class="text-center">No data available</td></tr>');
            showTableLoading();
            printButtonDailyBookingReport.style.display = "none";
        }else{
            loadDailyBookingReportTable(dailyBookingReportByStatus);
            showTableLoading();
            loadVehicleUtilizationDetailsTable(vehicleUtilizationDetailsList);
            printButtonDailyBookingReport.style.display = "";
        }
    }
}

// daily booking report table load karana function eka
const loadDailyBookingReportTable = (dailyBookingReportList) => {
    if ($.fn.dataTable.isDataTable('#dailyBookingReportTable')) {
        $('#dailyBookingReportTable').DataTable().clear().destroy();
    }

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

    dataFillIntoTheReportTable(dailyBookingReportTableBody, dailyBookingReportList, propertyList);
    dataFillIntoTheReportTable(dailyBookingReportPrintTableBody, dailyBookingReportList, propertyList);

    $("#dailyBookingReportTable").dataTable({
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

// get distance
const getDistance = (dataOb) =>{
    return dataOb.distance + " km";
}

// get vehicle type
const getVehicelType = (dataOb) =>{
    return dataOb.vehicle_type_id.name;
}

// get vehicle no
const getVehicle = (dataOb) =>{
    if (dataOb.vehicle_id == null) {
        return " - "
    }else{
        return dataOb.vehicle_id.vehicle_no;
    }
}

// get driver name
const getDriver = (dataOb) =>{
    if (dataOb.driver_id == null) {
        return " - "
    }else{
        return dataOb.driver_id.fullname;
    }

}

// get booking status with color
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

// vehicel utilization details table ekata print karanna view  karana function eka
const loadVehicleUtilizationDetailsTable = (vehicleUtilizationDetailsList) => {

    let reportDatalist = new Array();
    for (const index in vehicleUtilizationDetailsList) {
        let object = new Object();
        object.vehicle_type = vehicleUtilizationDetailsList[index][0].name;
        object.total_bookings = vehicleUtilizationDetailsList[index][1];
        object.total_vehicles = vehicleUtilizationDetailsList[index][2];
        object.total_distance = vehicleUtilizationDetailsList[index][3]+" km";
        reportDatalist.push(object);
    }
    console.log(reportDatalist)
    let propertyList = [
        {propertyName: "vehicle_type", dataType: "string"},
        {propertyName: "total_bookings", dataType: "string"},
        {propertyName: "total_vehicles", dataType: "string"},
        {propertyName: "total_distance", dataType: "string"},
    ];
    dataFillIntoTheReportTable(vehicleUtilizationReportTableBody, reportDatalist, propertyList);
}

const printDailyBookingReport = () =>{
    let newWindow = window.open();
    let printView = document.getElementById("printViewDailyAgreementReport");
    printView.style.display = "block";
    generateDateDailyBookingReport.innerText = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    generateTimeDailyBookingReport.innerText = new Date().toLocaleTimeString();
    generateUserDailyBookingReport.innerText = loggedEmployee.fullname;
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

//refresh function option
const refreshDailyBookingReport = () => {

    // get user all data for view details
    userList = getServiceRequest("report/useralldata")
    // employee wa hoyaganna log wela inna
    employeeList = getServiceRequest("/employee/alldata")
    logedUser = getServiceRequest("/loggeduserdetails");
    loggedEmployee = employeeList.find(employee =>employee.id === logedUser.employee_id);

    let customer = getServiceRequest('/customer/alldata');
    dataFilIntoSelect(selectCustomerName, "All ", customer, "company_name")

    let status = getServiceRequest('/bookingstatus/alldata');
    dataFilIntoSelect(selectStatus, "All ", status, "status")

    // refresh ekedi sampurana daily booings tika load karanwa
    let dailyBookingReportList = getServiceRequest('/report/alldailybookings');
    loadDailyBookingReportTable(dailyBookingReportList);
    showTableLoading();

    let vehicleUtilizationDetailsList = getServiceRequest('/report/dailybookingsummarybyvehicletype');
    loadVehicleUtilizationDetailsTable(vehicleUtilizationDetailsList);
}

// table eke loading spin eka load karanwa
function showTableLoading() {
    const loader = document.getElementById('loaderId');
    const dailyBookingReportTable = document.getElementById('dailyBookingReportTable');
    loader.style.display = ''; // Clear loading after 2 seconds
    dailyBookingReportTable.style.display = 'none'; // Hide the booking table while loading
    setTimeout(() => {
        const loader = document.getElementById('loaderId');
        loader.style.display = 'none'; // Clear loading after 2 seconds
        dailyBookingReportTable.style.display = ''; // Hide the booking table while loading
    }, 500);
}