window.addEventListener('load',()=>{

    let customers = getServiceRequest('/customer/byactiveagreements');
    dataFilIntoSelect(selectCustomerName, "Select Company Name", customers, "company_name")

    let vehicleTypes = getServiceRequest('/vehicletype/alldata');;
    dataFilIntoSelect(selectVehicleType, "Select Vehicle Type", vehicleTypes, "name")
})

// vehicle count eka chart eken generate karana function eka
const currentmonthvehiclerevenue = () =>{

    let datalist = getServiceRequest('/report/vehiclerevenuecurrentmonth?customerid=' + JSON.parse(selectCustomerName.value).id + '&vehicletypeid='+JSON.parse(selectVehicleType.value).id);

    let reportDatalist = new Array();
    let data = new Array();
    let label = new Array();

    for (const index in datalist) {
        let object = new Object();
        object.distance = datalist[index][1];
        object.vehicle_no = datalist[index][0]+" KM";
        reportDatalist.push(object);

        label.push(datalist[index][1]);
        data.push(datalist[index][0]);
    }

    let propertyList = [
        {propertyName: "distance", dataType: "string"},
        {propertyName: "vehicle_no", dataType: "string"}

    ]

    dataFillIntoTheReportTable(revenueCurrentMonthTableBody, reportDatalist, propertyList);

    $("#revenueCurrentMonthTable").dataTable({
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


    // Remove old chart if exists
    const oldChart = document.getElementById('myChart');
    if (oldChart) {
        oldChart.remove();
    }

// Create and append new canvas
    const chartContainer = document.getElementById('chartContainer'); // Make sure you have a container with this id in your HTML
    const canvas = document.createElement('canvas');
    canvas.id = 'myChart';
    chartContainer.appendChild(canvas);

// Generate chart
    const ctx = document.getElementById('myChart');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: label,
            datasets: [{
                label: 'Distance(KM)',
                axis: 'y',
                data: data,
                borderWidth: 1,
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)'
                ],
            }]
        },
        options: {
            indexAxis: 'y',
        }
    });
    // chart generate
    // const ctx = document.getElementById('myChart');
    //
    // new Chart(ctx, {
    //     type: 'bar',
    //     data: {
    //         labels: label,
    //         datasets: [{
    //             label: 'Distance(KM)',
    //             axis: 'y',
    //             data: data,
    //             borderWidth: 1,
    //             backgroundColor: [
    //                 'rgb(255, 99, 132)',
    //                 'rgb(54, 162, 235)',
    //                 'rgb(255, 205, 86)',
    //                 'rgb(54, 162, 235)',
    //                 'rgb(255, 205, 86)'
    //             ],
    //         }]
    //     },
    //     options: {
    //         indexAxis: 'y',
    //     }
    // });
}

// Remove old chart if exists
const oldChart = document.getElementById('myChart');
if (oldChart) {
    oldChart.remove();
}

// Create and append new canvas
const chartContainer = document.getElementById('chartContainer'); // Make sure you have a container with this id in your HTML
const canvas = document.createElement('canvas');
canvas.id = 'myChart';
chartContainer.appendChild(canvas);

// Generate chart
const ctx = document.getElementById('myChart');
new Chart(ctx, {
    type: 'bar',
    data: {
        labels: label,
        datasets: [{
            label: 'Distance(KM)',
            axis: 'y',
            data: data,
            borderWidth: 1,
            backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)'
            ],
        }]
    },
    options: {
        indexAxis: 'y',
    }
});