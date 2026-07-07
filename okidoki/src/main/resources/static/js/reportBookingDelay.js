window.addEventListener('load', (event) => {
    delayBookingTrendChartFunction();
    loadDelayBookingTable();
    let datalist = getServiceRequest('/report/overallperformancethismonth');
    overallOntimePerfomance(datalist);
})

let selectWeeklyBookingDelayView = document.getElementById("selectWeeklyBookingDelayView");
let weeklyDelayTrendChart = document.getElementById("weeklyDelayTrendChart");
let weeklyDelayTrendTable = document.getElementById("weeklyDelayTrendTableDiv");
// chart eka store karaganna instance ekak hadanawaa
let weeklyDelayTrendChartPattern = null;

//weekly vooking delay table ekai chart ekai view karanwa slect karanwa value eka anua
selectWeeklyBookingDelayView.addEventListener("change", function() {
    if (this.value === "Chart") {
        // me function eka load karaddi chart ekak create wela thiyenw nam eka destroy karanna oni.
        if (weeklyDelayTrendChartPattern) {
            weeklyDelayTrendChartPattern.destroy();
            weeklyDelayTrendChartPattern = null;
        }

        weeklyDelayTrendChartPattern = delayBookingTrendChartFunction();
        weeklyDelayTrendChart.style.display = "block";
        weeklyDelayTrendTable.style.display = "none";
    } else {
        if (weeklyDelayTrendChartPattern) {
            weeklyDelayTrendChartPattern.destroy();
            weeklyDelayTrendChartPattern = null;
        }
        weeklyDelayTrendChart.style.display = "none";
        weeklyDelayTrendTable.style.display = "block";
    }
});

// delay booking chart eka generate karana function eka
const delayBookingTrendChartFunction = () =>{

    // me function eka load karaddi chart ekak create wela thiyenw nam eka destroy karanna oni.
    if (weeklyDelayTrendChartPattern) {
        weeklyDelayTrendChartPattern.destroy();
        weeklyDelayTrendChartPattern = null;
    }

    let datalist = getServiceRequest('/report/delaybookingthisweek');

    let reportDatalist = new Array();
    let data = new Array();
    let label = new Array();
    for (const index in datalist) {
        let object = new Object();
        object.day = datalist[index][0];
        object.total_bookings = datalist[index][1];
        object.delay_delivery = datalist[index][2];
        object.delay_percentage = datalist[index][3]+"%";
        object.ontime_delivery = datalist[index][4];
        reportDatalist.push(object);

        label.push(datalist[index][0]);
        data.push(datalist[index][2]);
    }

    const propertyList = [
        { propertyName: "day", dataType: "string" },
        { propertyName: "total_bookings", dataType: "string" },
        { propertyName: "delay_delivery", dataType: "string" },
        { propertyName: "delay_percentage", dataType: "string" },
        { propertyName: "ontime_delivery", dataType: "string" },

    ];

    // table generate
    dataFillIntoTheReportTable(document.getElementById("weeklyBookingTrendTableBody"), reportDatalist, propertyList);

    // chart generate
    const ctx = document.getElementById('weeklyDelayTrendChart');

    weeklyDelayTrendChartPattern = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: label,
            datasets: [{
                label: 'Number Of delay delivery',
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
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    return weeklyDelayTrendChartPattern;
}

// ovearll perfomance eka view karanaw select value eka anua
let selectTimePeriod = document.getElementById("selectTimePeriod");
let overallDailyPerformanceChart = null;
let chartWrapper = document.getElementsByClassName("chart-wrapper");
selectTimePeriod.addEventListener("change", function() {

    if (this.value === "ThisMonth") {
        let datalist = getServiceRequest('/report/overallperformancethismonth');
        if (overallDailyPerformanceChart){
            overallDailyPerformanceChart.destroy();
            overallDailyPerformanceChart = null;
        }
        if (datalist[0][1] === null){

        }else{
            overallDailyPerformanceChart = overallOntimePerfomance(datalist);
        }

    }else if (this.value === "LastMonth") {
        let datalist = getServiceRequest('/report/overallperformancelastmonth');
        if (overallDailyPerformanceChart){
            overallDailyPerformanceChart.destroy();
            overallDailyPerformanceChart = null;
        }
        if (datalist[0][1] === null){
            alert("no data available")
        }else{
            overallDailyPerformanceChart = overallOntimePerfomance(datalist);
        }
    }else if (this.value === "Last6Month") {
        let datalist = getServiceRequest('/report/overallperformancelastsixmonth');
        if (overallDailyPerformanceChart){
            overallDailyPerformanceChart.destroy();
            overallDailyPerformanceChart = null;
        }
        if (datalist[0][1] === null){

        }else{

            overallDailyPerformanceChart = overallOntimePerfomance(datalist);
        }
    }else if (this.value === "ThisYear") {
        let datalist = getServiceRequest('/report/overallperformancethisyear');
        if (overallDailyPerformanceChart){
            overallDailyPerformanceChart.destroy();
            overallDailyPerformanceChart = null;
        }
        if (datalist[0][1] === null){

        }else{

            overallDailyPerformanceChart = overallOntimePerfomance(datalist);
        }
    }else if (this.value === "LastYear") {
        let datalist = getServiceRequest('/report/overallperformancelastyear');
        if (overallDailyPerformanceChart){
            overallDailyPerformanceChart.destroy();
            overallDailyPerformanceChart = null;
        }
        if (datalist[0][1] === null){

        }else{

            overallDailyPerformanceChart = overallOntimePerfomance(datalist);
        }
    }

});

// overall performance chart eka generate karana function eka
const overallOntimePerfomance = (datalist) => {

    if (overallDailyPerformanceChart){
        overallDailyPerformanceChart.destroy();
        overallDailyPerformanceChart = null;
    }

    let data = [];
    let label = ["On Time", "Delay"];

    if (Array.isArray(datalist)) {
        datalist.forEach(item => {
            // ontime percentage eka ganna
            data.push((((item[0]-item[1])/item[0])*100));
            // delay percentage eka ganna
            data.push((item[1]/item[0])*100);
            ontimePrecentage.innerText = (((item[0] - item[1]) / item[0]) * 100).toFixed(2) + "%";

        });
    }

    const ctx = document.getElementById('overallDeliveryPerfomanceChart');
    overallDailyPerformanceChart = new Chart(ctx, {
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
    function animateValue(element, end, duration) {
        let current = 0;
        const step = end / (duration / 20); // update every 20ms
        const timer = setInterval(() => {
            current += step;
            if (current >= end) { current = end; clearInterval(timer); }
            element.textContent = current.toFixed(1) + "%";
        }, 20);
    }

    // Get the percentage element and start the animation
    const percentageElement = document.querySelector(".percentage");
    if (percentageElement) {
        const value = ((datalist[0][0] - datalist[0][1]) / datalist[0][0]) * 100;
        animateValue(percentageElement, value, 1500);
    }

    return overallDailyPerformanceChart;
}


const loadDelayBookingTable = () => {
    let delayBookings = getServiceRequest('/report/alldelaybookins');

    let reportDatalist = new Array();
    for (const index in delayBookings) {
        let object = new Object();
        object.booking_no = delayBookings[index][0];
        object.customer = delayBookings[index][1];
        object.pickup = delayBookings[index][2];
        object.delivery = delayBookings[index][3];
        object.schedule = delayBookings[index][4]+" - " + delayBookings[index][5];
        object.supplier = delayBookings[index][6];
        object.vehicle = delayBookings[index][7];
        object.driver = delayBookings[index][8];
        object.actual_pickup = delayBookings[index][9];
        object.delay_pickup = delayBookings[index][10];
        object.actual_delivery = delayBookings[index][11];
        object.delay_delivery = delayBookings[index][12];
        reportDatalist.push(object);
    }
    console.log(reportDatalist)
    let propertyList = [
        {propertyName: "booking_no", dataType: "string"},
        {propertyName: "customer", dataType: "string"},
        {propertyName: getPickupAndDelivery, dataType: "function"},
        {propertyName: "schedule", dataType: "string"},
        {propertyName: "supplier", dataType: "string"},
        {propertyName: "vehicle", dataType: "string"},
        {propertyName: "driver", dataType: "string"},
        {propertyName: "actual_pickup", dataType: "string"},
        {propertyName: "delay_pickup", dataType: "string"},
        {propertyName: "actual_delivery", dataType: "string"},
        {propertyName: "delay_delivery", dataType: "string"}
    ];
    dataFillIntoTheReportTable(delayBookingReportTableBody, reportDatalist, propertyList);

    $("#delayBookingReportTable").dataTable({
        scrollX: true,
        "createdRow": function(row, data, dataIndex) {

            $(row).find("td").css({
                "text-align": "center",
                "height": "100px"
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

const getPickupAndDelivery = (dataOb)=>{
    return `<div class="time-slot">
                            <div class="time-row pickup-time">
                                <div class="time-icon"></div>
                                <span>${dataOb.pickup}</span>
                            </div>
                            <div class="time-row delivery-time">
                                <div class="time-icon"></div>
                                <span>${dataOb.delivery}</span>
                            </div>
               </div>`;
}
