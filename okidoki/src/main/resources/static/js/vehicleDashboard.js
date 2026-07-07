
window.addEventListener("load", function () {
    vehiclecountgeneratebytype();
    allVehicleCount();
    activeVehicleCount();
    revenueLicenseExpireVehicleCount();
    insuranceExpireVehicleCount();
    revenueLicenseExpireVehicle();
    insuranceExpireVehicle();

})


// vehicle count eka chart eken generate karana function eka
const vehiclecountgeneratebytype = () =>{

    let datalist = getServiceRequest('/report/countbyvehicletype');

    let reportDatalist = new Array();
    let data = new Array();
    let label = new Array();

    for (const index in datalist) {
        let object = new Object();
        object.vehicle_type = datalist[index][0];
        object.count = datalist[index][1];
        reportDatalist.push(object);

        label.push(datalist[index][1]);
        data.push(datalist[index][0]);
    }

    const propertyList = [
        { propertyName: "vehicle_type", dataType: "string" },
        { propertyName: "count", dataType: "string" },
    ];
    // chart generate
    const ctx = document.getElementById('myChart');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: label,
            datasets: [{
                label: '# of Votes',
                data: data,
                // borderWidth: 1,
                // backgroundColor: [
                //     '#22C55E',  // Primary green
                //     '#4ADE80',  // Mint green
                //     '#86EFAC',  // Soft light green
                //     '#16A34A',  // Darker green
                //     '#BBF7D0',  // Very light green
                //     '#15803D',  // Forest green
                //     '#A7F3D0'   // Mint pastel
                // ],

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

// get service request function for get vehicle count
const allVehicleCount = () => {
    let allVehicleCount = getServiceRequest('/report/countofallvehicles');
    console.log(allVehicleCount);
    if (allVehicleCount.length == 0) {
        document.getElementById("totalVehicle").innerHTML = "0";
    } else {
        document.getElementById("totalVehicle").innerHTML = allVehicleCount;
    }
}

//active vehicle count
const activeVehicleCount = () => {
    let activeVehicleCount = getServiceRequest('/report/countofactivevehicles');
    console.log(activeVehicleCount);
    if (activeVehicleCount.length == 0) {
        document.getElementById("totalActiveVehicle").innerHTML = "0";
    } else {
        document.getElementById("totalActiveVehicle").innerHTML = activeVehicleCount;
    }
}

//revenue license expire vehicle count
const revenueLicenseExpireVehicleCount = () => {
    let revenueLicenseExpireVehicleCount = getServiceRequest('/report/countofrevenueexpirevehicles');
    console.log(revenueLicenseExpireVehicleCount);
    if (revenueLicenseExpireVehicleCount.length == 0) {
        document.getElementById("totalRevenueLicenseExpireVehicle").innerHTML = "0";
    } else {
        document.getElementById("totalRevenueLicenseExpireVehicle").innerHTML = revenueLicenseExpireVehicleCount;
    }
}

//insurance expire vehicle count
const insuranceExpireVehicleCount = () => {
    let insuranceExpireVehicleCount = getServiceRequest('/report/countofinsuranceexpirevehicles');
    console.log(insuranceExpireVehicleCount);
    if (insuranceExpireVehicleCount.length == 0) {
        document.getElementById("totalInsuranceExpireVehicle").innerHTML = "0";
    } else {
        document.getElementById("totalInsuranceExpireVehicle").innerHTML = insuranceExpireVehicleCount;
    }
}

//expire revenue licenses recently 5 vehicles
const revenueLicenseExpireVehicle = () => {
    let revenueLicenseExpireVehicleList = getServiceRequest("/report/recentlyupdatedrevenuelicenseexpirevehicles");

    if (revenueLicenseExpireVehicleList.length == 0) {
        document.getElementById("revenueLicenseExpireVehicleTableBody").innerHTML = `<tr> <td colspan="7" class="text-center fs-5 m-2">No Data Found</td></tr>`;
    } else {
        let propertyList = [
            {propertyName: getSupplier, dataType: "function"},
            {propertyName: "vehicle_no", dataType: "string"},
            {propertyName: getVehicleType, dataType: "function"},
            {propertyName: "revenu_license_expire_date", dataType: "string"},

        ];

        dataFillIntoTheReportTable(document.getElementById("revenueLicenseExpireVehicleTableBody"), revenueLicenseExpireVehicleList, propertyList);
    }
}

//expire insurance  recently 5 vehicle
const insuranceExpireVehicle = () => {
    let insuranceExpireVehicleList = getServiceRequest("/report/recentlyupdatedinsuranceexpirevehicles");

    if (insuranceExpireVehicleList.length == 0) {
        document.getElementById("insuranceExpireVehicleTableBody").innerHTML = `<tr> <td colspan="7" class="text-center fs-5 m-2">No Data Found</td></tr>`;
    } else {
        let propertyList = [
            {propertyName: getSupplier, dataType: "function"},
            {propertyName: "vehicle_no", dataType: "string"},
            {propertyName: getVehicleType, dataType: "function"},
            {propertyName: "insurance_expire_date", dataType: "string"},
        ];

        dataFillIntoTheReportTable(document.getElementById("insuranceExpireVehicleTableBody"), insuranceExpireVehicleList, propertyList);
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