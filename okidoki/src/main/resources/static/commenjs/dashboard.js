//recent 5 bookings get in to the dashboeard
const loadRecentBookingTableFunction = () => {
    console.log("111")
    let recentBookings = getServiceRequest('/booking/recentbooking');
    console.log(recentBookings)

    let propertyList = [
        { propertyName: "booking_no", dataType: "string" },
        { propertyName: getCustomer, dataType: "function" },
        { propertyName: getVehicleNo, dataType: "function" },
        { propertyName: "pickup_date_time", dataType: "string" },
        { propertyName: "delivery_date_time", dataType: "string" }
    ];

    // Data Filling Function to Table
    dataFillIntoTheReportTable(recentBookingsTableBody,recentBookings,propertyList);
}

window.addEventListener("load", ()=> {
         loadRecentBookingTableFunction();
          bookingcountgeneratebybookingstatus();
          bookingcountgeneratebyCustomer();
          monthlydistancegeneratebyBookings();

      //     counts
    allVehicleCount();
    pendingBookingCount();
    activeCustomerCount();
    activeDriverCount();
      });

      // get customer name
const getCustomer = (dataOb) => {
          return dataOb.customer_id.company_name;
          console.log(dataOb)
      }

      // get vehicle no
const getVehicleNo = (dataOb) => {
          if(dataOb.vehicle_id != null){
              return dataOb.vehicle_id.vehicle_no;
          }else{
              return "<span class='status-badge status-inactive mt-2'>Not Assigned</span>";
          }
      }

      // vehicle count eka chart eken generate karana function eka
const bookingcountgeneratebybookingstatus = () =>{

          let datalist = getServiceRequest('/report/countbybookingstatus');

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
              { propertyName: "count", dataType: "string" },
              { propertyName: "status", dataType: "string" },
          ];
          // chart generate

          const ctx = document.getElementById('myChart');

      //     create another suitable chart design
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

      // booking count eka chart eken generate karana function eka
const bookingcountgeneratebyCustomer = () =>{

          let datalist = getServiceRequest('/report/bookingcountbycustomer');

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
              { propertyName: "count", dataType: "string" },
              { propertyName: "customer_name", dataType: "string" },
          ];
          // chart generate
          const ctx = document.getElementById('myChart2');

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

          // new Chart(ctx, {
          //     type: 'doughnut',
          //     data: {
          //         labels: label,
          //         datasets: [{
          //             label: 'Number Of Bookings',
          //             data: data,
          //             borderWidth: 3,
          //             hoverOffset: 10,
          //             borderColor: '#ffffff',
          //             backgroundColor: [
          //                  '#EF4444',  // Primary red
          //                  '#ff3333',  // Light red
          //                 // '#FCA5A5',  // Soft pastel red
          //                 // '#B91C1C',  // Darker red
          //                 // '#FECACA'   // Very light red
          //                 '#ff6666'
          //             ],
          //         }]
          //     },
          //     options: {
          //         scales: {
          //             y: {
          //                 beginAtZero: true
          //             }
          //         },
          //     }
          // });
}

      // booking count eka chart eken generate karana function eka
const monthlydistancegeneratebyBookings = () =>{

          let datalist = getServiceRequest('/report/totalbookingdistancebymonthlybookings');

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
              { propertyName: "distance", dataType: "string" },
              { propertyName: "month", dataType: "string" },
          ];
          // chart generate
          const ctx = document.getElementById('myChart3');

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

//       status card

// get service request function for get vehicle count
const allVehicleCount = () => {
    let allVehicleCount = getServiceRequest('/report/countofallvehicles');
    console.log(allVehicleCount);
    if (allVehicleCount.length == 0) {
        document.getElementById("totalActiveVehicles").innerHTML = "0";
    } else {
        document.getElementById("totalActiveVehicles").innerHTML = allVehicleCount;
    }
}

//active vehicle count
const pendingBookingCount = () => {
    let activeVehicleCount = getServiceRequest('/report/countofpendingbookings');
    console.log(activeVehicleCount);
    if (activeVehicleCount.length == 0) {
        document.getElementById("totalPendingBookings").innerHTML = "0";
    } else {
        document.getElementById("totalPendingBookings").innerHTML = activeVehicleCount;
    }
}

//revenue license expire vehicle count
const activeCustomerCount = () => {
    let revenueLicenseExpireVehicleCount = getServiceRequest('/report/countofactivecustomers');
    console.log(revenueLicenseExpireVehicleCount);
    if (revenueLicenseExpireVehicleCount.length == 0) {
        document.getElementById("totalActiveCustomers").innerHTML = "0";
    } else {
        document.getElementById("totalActiveCustomers").innerHTML = revenueLicenseExpireVehicleCount;
    }
}

//insurance expire vehicle count
const activeDriverCount = () => {
    let insuranceExpireVehicleCount = getServiceRequest('/report/countofactivedrivers');
    console.log(insuranceExpireVehicleCount);
    if (insuranceExpireVehicleCount.length == 0) {
        document.getElementById("totalActiveDrivers").innerHTML = "0";
    } else {
        document.getElementById("totalActiveDrivers").innerHTML = insuranceExpireVehicleCount;
    }
}

// recent aqctivity feed
const recentBookingActivity = () =>{

    let recentBookingsActivity = getServiceRequest('/booking/alldta');
    console.log(recentBookingsActivity);


}

