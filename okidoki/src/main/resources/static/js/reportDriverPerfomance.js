window.addEventListener('load', () => {

    let drivers = getServiceRequest('report/driverlistwithatleastonetrip');
    dataFilIntoSelect(driverName, "All Drivers", drivers, "fullname");

})
let overallDeliveryPerfomanceChart = null;
// when the user select a driver from the dropdown
genearetButton.addEventListener('click', () => {
    oneDriverDetails.style.display = "hidden"
    allDriversDetails.style.display = "hidden"
    if (overallDeliveryPerfomanceChart) {
        overallDeliveryPerfomanceChart.destroy();
        overallDeliveryPerfomanceChart = null;
    }

    if ($.fn.DataTable.isDataTable('#driverPerformanceTable')) {
        $('#driverPerformanceTable').DataTable().clear().destroy();
    }
    let driverElement =document.getElementById("driverName").value;
    let fromDateText = document.getElementById("fromDateText");
    let toDateText = document.getElementById("toDateText");
    console.log(driverElement)
    // methanin all drivers details table eka load karanna oni
    if (driverElement === "" && fromDateText.value == "" && toDateText.value == "") {
        oneDriverDetails.style.display = "none"
        allDriversDetails.style.display = ""
        let performanceDetails = getServiceRequest('/report/alldriverperformance');
        // load all drivers performance table
        loadAllDriversPerfomanceTable(performanceDetails);

    }else if(driverElement === "" && fromDateText.value !== "" && toDateText.value !== ""){
        // menke wenna all drivers details table eka load karanna oni date range ekata adalwa
        oneDriverDetails.style.display = "none"
        allDriversDetails.style.display = ""
        let performanceDetails = getServiceRequest('report/driverperformancebydaterange?startdate='+fromDateText.value +'&endtdate=' + toDateText.value);
        loadAllDriversPerfomanceTable(performanceDetails);

    }else if (driverElement !== "" && fromDateText.value !== "" && toDateText.value !== "") {
        let driverId = JSON.parse(driverElement).id;
        // meken wenne selected driverta adala data gnnw
        allDriversDetails.style.display = "none"
        oneDriverDetails.style.display = ""
        let driverPerformanceDetails = getServiceRequest('report/driverperformancebydriveridanddaterange?driverid=' + driverId + '&startdate=' + fromDateText.value + '&endtdate=' + toDateText.value);
        console.log(driverPerformanceDetails)
        driverPerformanceCard(driverPerformanceDetails);
        let driverRankDetails = getServiceRequest('/report/driverrankings?driverid=' + driverId);
        loadDriverRankDetails(driverRankDetails);
        overallOntimePerfomance(driverPerformanceDetails);


    }else  if (driverElement !== "" && fromDateText.value == "" && toDateText.value == "") {
        let driverId = JSON.parse(driverElement).id;
        // meken selected driverta adala data gnnw selecte karanaa date range eka anuwa
        allDriversDetails.style.display = "none"
        oneDriverDetails.style.display = ""
        let driverPerformanceDetails = getServiceRequest('report/driverperformancebydriverid?driverid=' + driverId);
        driverPerformanceCard(driverPerformanceDetails);
        let driverRankDetails = getServiceRequest('/report/driverrankings?driverid=' + driverId);
        loadDriverRankDetails(driverRankDetails);
        overallOntimePerfomance(driverPerformanceDetails);
    }
})

// reset buton click event
const reset = () => {
    oneDriverDetails.style.display = "none"
    allDriversDetails.style.display = "none"
    driverName.value = "";
    fromDateText.value = "";
    toDateText.value = "";
    driverPerformanceTableBody.innerHTML = "";
    let drivers = getServiceRequest('report/driverlistwithatleastonetrip');
    dataFilIntoSelect(driverName, "All Drivers", drivers, "fullname");

}

// load all drivers perfomance table
const loadAllDriversPerfomanceTable = (performanceDetails) =>{


    let reportDatalist = new Array();
    for (const index in performanceDetails) {
        let object = new Object();
        object.driver_name = performanceDetails[index][0];
        object.total_bookings = performanceDetails[index][1];
        object.ontime_delivery = performanceDetails[index][2];
        object.late_delivery = performanceDetails[index][3];
        object.performance = performanceDetails[index][4]
        reportDatalist.push(object);
    }
    console.log(reportDatalist)
    let propertyList = [
        {propertyName: "driver_name", dataType: "string"},
        {propertyName: "total_bookings", dataType: "string"},
        {propertyName: "ontime_delivery", dataType: "string"},
        {propertyName: "late_delivery", dataType: "string"},
       {propertyName: getPerformance, dataType: "function"}
    ];
    dataFillIntoTheReportTable(driverPerformanceTableBody, reportDatalist, propertyList);

    $("#driverPerformanceTable").dataTable({
        "createdRow": function(row, data, dataIndex) {

            $(row).find("td").css({
                "text-align": "center",
                "height": "50px"
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

// load selected driver performance card eka ganna function eka
const driverPerformanceCard = (driverPerformanceDetails) => {
    if (driverPerformanceDetails.length === 0){
        oneDriverDetails.style.display = "none"
        Swal.fire({
            title: "Sorry?",
            text: "No Data Available",
            icon: "question",
            allowOutsideClick: false,
        });
        return;
    }else{
        driverNameCard.innerText = driverPerformanceDetails[0][0];
        totalBookings.innerText = driverPerformanceDetails[0][1];
        ontimeDelivery.innerText = driverPerformanceDetails[0][2];
        lateDelivery.innerText = driverPerformanceDetails[0][3];

        let totalDriverCountValue = getServiceRequest('report/countofallactiveandinactiveDrivers');
        console.log(totalDriverCountValue);
        totalDriverCount.innerText = totalDriverCountValue;
    }


}

// load rank details on slected driver
const loadDriverRankDetails = (driverRankDetails) => {

    console.log(driverRankDetails);

    driverRegNo.innerText = driverRankDetails[0][1];
    driverRank.innerText = driverRankDetails[0][4];
    let driverName = driverRankDetails[0][2];
    console.log(driverName)
    // driverge name eka kotas walata wen karala eke kotaswalta palawen leters aran jon karanwa
    let driverInitials = driverName.split(" ").map(w => w[0]).join("").toUpperCase();
    driverProfileIcon.innerText = driverInitials;


}

const getPerformance = (dataOb) => {

    if (dataOb.performance >= 75) {
        return `<span class="status-chip green">${dataOb.performance}%</span>`;
    } else if (dataOb.performance >= 50) {
        return `<span class="status-chip yellow">${dataOb.performance}%</span>`;
    }else{
        return `<span class="status-chip red">${dataOb.performance}%</span>`;
    }
}

// overall performance chart eka generate karana function eka
const overallOntimePerfomance = (datalist) => {

    if (overallDeliveryPerfomanceChart){
        overallDeliveryPerfomanceChart.destroy();
        overallDeliveryPerfomanceChart = null;
    }

    let data = [];
    let label = ["On Time", "Delay"];

    if (Array.isArray(datalist)) {
        datalist.forEach(item => {
            // ontime percentage eka ganna
            data.push((item[2]/item[1])*100);
            // delay percentage eka ganna
            data.push((item[3]/item[1])*100);
            ontimePrecentage.innerText = 0 + "%";
            performanceScore.innerText = 0 + "%";

        });
    }

    const ctx = document.getElementById('overallDeliveryPerfomanceChart');
    overallDeliveryPerfomanceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: label,
            datasets: [{
                label: 'Overall Performance',
                data: data, // On-time vs Delayed percentages
                backgroundColor: [
                    '#ff1a58',
                    '#ecf0f1'
                ],
                borderWidth: 0,
                cutout: '75%' // ring eke size eka wenas karanwa
            }]
        },
        options: {
            // reasponive true karanna oni
            responsive: true,
            // assept ratio true karanna oni
            maintainAspectRatio: true,
            // animation eka smooth wenna duration eka 2 second karanna oni
            animation: {
                animateRotate: true,
                animateScale: false,
                duration: 2000, // 2 second animation
                easing: 'easeOutQuart'
            },
            elements: {
                arc: {
                    borderWidth: 0,
                }
            }
        }
    });


// Animate the percentage counter when the chart is rendered
//     element - id eka html tag eke
//     end - iwara wenna oni value eka (example - 100%)
//     duration - animation eka thiyena duration eka (example - 1500ms)
    function animateValue(element, end, duration) {
        // count karana eka start karanwa api 0 idan
        let current = 0;
        const step = end / (duration / 20); // update every 20ms
        const timer = setInterval(() => {
            current += step;
            if (current >= end){
                current = end; clearInterval(timer);
            }
            element.innerText = current.toFixed(2) + "%";
            performanceScore.textContent =current.toFixed(2) + "%";
        }, 20);
    }

    // Get the percentage element and start the animation
    const percentageElement = document.querySelector(".percentage");
    if (percentageElement) {
        const value = ((datalist[0][2]/datalist[0][1])*100);
        animateValue(percentageElement, value, 1500);
    }

    return overallDeliveryPerfomanceChart;
}