window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  const dashboardContent = document.getElementById("dashboardContent");

  // A tiny delay to ensure the preloader renders before the synchronous blocking starts
  setTimeout(() => {
    try {
      // Run all original synchronous functions
      loadRecentBookingTableFunction();
      bookingcountgeneratebybookingstatus();
      bookingcountgeneratebyCustomer();
      monthlydistancegeneratebyBookings();

      allVehicleCount();
      activeDriverCount();

      dutyDrivers();
      dutyDriversCount();
      bookingActivityList();
      activeBookings();
      ontimeRateBookings();
      currentDateBookingsCount();
      delayRateBookingCount();
      revenueLicenseExpireVehicleCount();

      initRevenueVsExpensesChart();
      initBookingStatusOverviewChart();
      initFleetUtilizationChart();
    } catch (e) {
      console.error("Dashboard loading error:", e);
    } finally {
      // reveal everything at once with a smooth fade using common function
      finishPageLoading();
    }
  }, 100);
});
//recent 5 bookings get in to the dashboeard

const loadRecentBookingTableFunction = () => {
  console.log("111");
  let recentBookings = getServiceRequest("/booking/recentbooking");
  console.log(recentBookings);

  let propertyList = [
    { propertyName: "booking_no", dataType: "string" },
    { propertyName: getCustomer, dataType: "function" },
    { propertyName: getVehicleNo, dataType: "function" },
    { propertyName: getPickupDateTime, dataType: "function" },
    { propertyName: getDeliveryDateTime, dataType: "function" },
    // {propertyName: getStatus, dataType: "function"}
  ];

  // Data Filling Function to Table
  dataFillIntoTheReportTable(recentBookingsTableBody, recentBookings, propertyList);
  lastAssignedVehicles();
};
// get customer name
const getCustomer = (dataOb) => {
  return dataOb.customer_id.company_name;
  console.log(dataOb);
};

// get vehicle no
const getVehicleNo = (dataOb) => {
  if (dataOb.vehicle_id != null) {
    return dataOb.vehicle_id.vehicle_no;
  } else {
    return "<span class='status status-inprocess  mt-2'>Not Assigned</span>";
  }
};

const getPickupDateTime = (dataOb) => {
  return datetimeformat(dataOb.pickup_date_time);
}

const getDeliveryDateTime = (dataOb) => {
  return datetimeformat(dataOb.delivery_date_time);
}

// get booking status
const getStatus = (dataOb) => {
  const status = dataOb.status;
  let statusClass = "status-badge status-inactive";

  if (status === "Attend") {
    statusClass = "status-badge status-attend";
  } else if (status === "Arrived At Pickup" || status === "Departed From Pickup") {
    statusClass = "status-badge status-pending";
  } else if (status === "Arrived At Delivery" || status === "Departed From Delivery") {
    statusClass = "status-badge status-active";
  } else if (status === "Cancelled") {
    statusClass = "status-badge status-cancelled";
  } else if (status === "Inproccess" || status === "Inprocess") {
    statusClass = "status-badge status-inactive";
  }

  return `<div class="${statusClass}">
            <span>${status}</span>
          </div>`;

}

// booking count eka chart eken generate karana function eka
const bookingcountgeneratebybookingstatus = () => {
  let datalist = getServiceRequest("/report/countbybookingstatus");

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

  const ctx = document.getElementById("myChart");

  //     create another suitable chart design
  new Chart(ctx, {
    type: "line",
    data: {
      labels: label,
      datasets: [
        {
          label: "Number Of Bookings",
          data: data,
          borderColor: "#6d28d9", // Purple line
          backgroundColor: function (context) {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return null;
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, "rgba(109, 40, 217, 0.8)"); // Primary purple
            gradient.addColorStop(0.5, "rgba(109, 40, 217, 0.4)");
            gradient.addColorStop(1, "rgba(109, 40, 217, 0.1)");
            return gradient;
          },
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#6d28d9",
          pointBorderColor: "#5b21b6",
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: "#6d28d9",
          pointHoverBorderColor: "#5b21b6",
          pointHoverBorderWidth: 3,
        },
      ],
    },
    options: {
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
};

// booking count eka chart eken generate karana function eka
const bookingcountgeneratebyCustomer = () => {
  let datalist = getServiceRequest("/report/bookingcountbycustomer");

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
  const ctx = document.getElementById("myChart2");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: label,
      datasets: [
        {
          label: "Number Of Bookings",
          data: data,
          backgroundColor: ["#6d28d9", "#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#5b21b6"],
          borderColor: "#ffffff",
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
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
};

// booking count eka chart eken generate karana function eka
const monthlydistancegeneratebyBookings = () => {
  let datalist = getServiceRequest("/report/totalbookingdistancebymonthlybookings");

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
  const ctx = document.getElementById("myChart3");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: label,
      datasets: [
        {
          label: "Distance(KM)",
          data: data,
          borderColor: "#6d28d9", // Updated to new purple color
          backgroundColor: function (context) {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) {
              return null;
            }
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, "rgba(109, 40, 217, 0.8)"); // Primary purple (#6D28D9)
            gradient.addColorStop(0.5, "rgba(109, 40, 217, 0.4)");
            gradient.addColorStop(1, "rgba(109, 40, 217, 0.1)");
            return gradient;
          },
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#6d28d9",
          pointBorderColor: "#5b21b6",
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: "#6d28d9",
          pointHoverBorderColor: "#5b21b6",
          pointHoverBorderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
};

//       status card
// get service request function for get vehicle count
const allVehicleCount = () => {
  let allVehicleCount = getServiceRequest("/report/countofallvehicles");
  console.log(allVehicleCount);
  if (allVehicleCount.length == 0) {
    document.getElementById("totalActiveVehicles").innerHTML = "0";
  } else {
    document.getElementById("totalActiveVehicles").innerHTML = allVehicleCount;
  }
};

//active vehicle count
const pendingBookingCount = () => {
  let activeVehicleCount = getServiceRequest("/report/countofpendingbookings");
  console.log(activeVehicleCount);
  if (activeVehicleCount.length == 0) {
    document.getElementById("totalPendingBookings").innerHTML = "0";
  } else {
    document.getElementById("totalPendingBookings").innerHTML = activeVehicleCount;
  }
};

//revenue license expire vehicle count
const revenueLicenseExpireVehicleCount = () => {
  let revenueLicenseExpireVehicleCount = getServiceRequest("/report/countofactivecustomers");
  console.log(revenueLicenseExpireVehicleCount);
  if (revenueLicenseExpireVehicleCount.length == 0) {
    document.getElementById("expireCount").innerHTML = "0";
  } else {
    document.getElementById("expireCount").innerHTML = revenueLicenseExpireVehicleCount;
  }
};

//insurance expire vehicle count
const activeDriverCount = () => {
  let totalActiveDrivers = getServiceRequest("/report/countofactivedrivers");
  if (totalActiveDrivers.length == 0) {
    document.getElementById("totalActiveDrivers").innerHTML = "0";
  } else {
    document.getElementById("totalActiveDrivers").innerHTML = totalActiveDrivers;
  }
};

// create dymamic card for last assigned vehicles
const lastAssignedVehicles = () => {
  let lastAssignedVehicles = getServiceRequest("/report/lastassignedtwovehicles");

  const cardDatalist = new Array();
  //    vehicle tika new array ekakata push karanwa
  for (const index in lastAssignedVehicles) {
    let object = new Object();
    object.vehicelNo = lastAssignedVehicles[index][0];
    object.vehicleType = lastAssignedVehicles[index][1];
    object.location = lastAssignedVehicles[index][2];
    object.status = lastAssignedVehicles[index][3];
    cardDatalist.push(object);
  }

  let container = document.getElementById("lastAssignedVehiclesCardContainer");
  container.innerHTML = "";

  //     dynamicly card details generate karanawa
  cardDatalist.forEach((vehicle) => {
    let vehicleNumberEnglishLetters = vehicle.vehicelNo.toString();

    status = getStatus(vehicle);

    let letters = vehicleNumberEnglishLetters.split("-")[1];
    container.innerHTML += `
           <div class="list-item" >
                                <div class="small-avatar">${letters}</div>
                                <div style="flex:1">
                                    <div style="font-weight:700">${vehicle.vehicelNo}</div>
                                    <div style="font-size:12px;color:var(--muted)"><span> ${vehicle.vehicleType}</span> — Delivery: <span>${vehicle.location}</span></div>
                                </div>
                                <div style="text-align:right">
                                    <div class="status in-transit">${status}</div>
                                </div>
                            </div>`;
  });
};

//create dynamically duty drivers
const dutyDrivers = () => {
  let lastAssignedDrivers = getServiceRequest("/report/lastassignedtwoDrivers");
  console.log(lastAssignedDrivers);

  const cardDatalist = new Array();
  //    vehicle tika new array ekakata push karanwa
  for (const index in lastAssignedDrivers) {
    let object = new Object();
    object.name = lastAssignedDrivers[index][0];
    object.vehicleType = lastAssignedDrivers[index][1];
    object.deliverylocation = lastAssignedDrivers[index][2];
    object.pickuploaction = lastAssignedDrivers[index][3];
    object.deliverydate = lastAssignedDrivers[index][4];
    cardDatalist.push(object);
  }

  let container = document.getElementById("lastAssignedDriverCardContainer");
  container.innerHTML = "";

  console.log(cardDatalist);

  //     dynamicly card details generate karanawa
  cardDatalist.forEach((driver) => {
    // driver name eken frist letter deka witharak gnnawa
    let drivername = driver.name.split(" ");
    drivername = drivername[0].charAt(0) + drivername[1].charAt(0);
    console.log(drivername);

    // get date time eken month ekai date ekai witharak
    let date = driver.deliverydate;
    let formattedDate = new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });

    console.log(formattedDate);

    container.innerHTML += `
             <div class="list-item">
                                <div class="small-avatar">${drivername}</div>
                                <div style="flex:1">
                                    <div style="font-weight:700">${driver.name}</div>
                                    <div style="font-size:12px;color:var(--muted)"><span>${driver.vehicleType}</span> • <span>${driver.pickuploaction}</span> to <span>${driver.deliverylocation}</span></div>
                                </div>
                                <div style="text-align:right;font-size:12px;color:var(--muted)"> <span>${formattedDate}</span></div>
                            </div>`;
  });
};

//active vehicle count
const dutyDriversCount = () => {
  let dutyDriversCount = getServiceRequest("/report/countofdutydrivers");
  if (dutyDriversCount.length == 0) {
    document.getElementById("dutyDriversCountElement").innerHTML = "0";
  } else {
    document.getElementById("dutyDriversCountElement").innerHTML = dutyDriversCount;
  }
};

// Booking Activity List
const bookingActivityList = () => {
  // API response
  const activityList = getServiceRequest("/report/bookingactivitymessage");

  const activities = [];

  // Convert response array → object array
  for (const item of activityList) {
    activities.push({
      id: Number(item[0]),
      bookingNo: item[1],
      message: item[2],
      time: item[3],
    });
  }

  const container = document.getElementById("bookingActivityListContainer");
  container.innerHTML = "";

  activities.forEach((activity) => {
    let color = getDotColor(activity.id);

    container.innerHTML += `
            <div class="act">
                <div class="dot ${color}"></div>
                <div>
                    <strong>#${activity.bookingNo}</strong>
                    <span>${activity.message}</span> • 
                    <span>${formatTime(activity.time)}</span>
                </div>
            </div>
        `;
  });

  function getDotColor(id) {
    switch (id) {
      case 1:
        return "red";
      case 2:
        return "blue";
      case 3:
        return "purple";
      case 4:
        return "yellow";
      case 5:
        return "orange";
      case 6:
        return "green";
      default:
        return "gray";
    }
  }

  function formatTime(dateTime) {
    return new Date(dateTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

//get total avtive shipmenmts
// get service request function for get vehicle count
const activeBookings = () => {
  let allActiveBookings = getServiceRequest("/report/activebookingscount");

  document.getElementById("activeAllBookings").innerHTML = allActiveBookings;
};

// get ontime rate bookings
const ontimeRateBookings = () => {
  let onTimeRateeBookings = getServiceRequest("/report/ontimerate");

  document.getElementById("ontimeRate").innerHTML = onTimeRateeBookings;
};

// get currunt date bookings
const currentDateBookingsCount = () => {
  let currentDateBookings = getServiceRequest("/report/allbookingsincurrentday");

  document.getElementById("currentDateBookings").innerHTML = currentDateBookings;
};

// get delay rate bookings
const delayRateBookingCount = () => {
  let delayRateBooking = getServiceRequest("/report/currentdatedelaybookingpercentage");

  document.getElementById("delayRateBooking").innerHTML = delayRateBooking;
  if (delayRateBooking === 0) {
    const statusOfRate = document.getElementById("status");
    statusOfRate.classList.remove("high");
    statusOfRate.classList.add("good");
    statusOfRate.innerText = "Good";
  }
};

// Revenue vs Expenses - Bar Chart (Monthly)
const initRevenueVsExpensesChart = () => {
  let datalist1 = getServiceRequest("/report/revenuandexpense");
  let revenue = new Array();
  let expenses = new Array();
  let label1 = new Array();

  for (const index in datalist1) {
    let object = new Object();
    object.month = datalist1[index][0];
    object.revenue = datalist1[index][1];
    object.revenue = datalist1[index][2];

    label1.push(datalist1[index][0]);
    revenue.push(datalist1[index][1]);
    expenses.push(datalist1[index][2]);
  }

  const ctx = document.getElementById("revenueExpensesChart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: label1,
      datasets: [
        {
          label: "Revenue",
          data: revenue,
          backgroundColor: "#6d28d9", // Unified Purple
          borderRadius: 6,
        },
        {
          label: "Expenses",
          data: expenses,
          backgroundColor: "#f87171", // Soft Red
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { display: false },
        },
        x: {
          grid: { display: false },
        },
      },
    },
  });
};

// Booking Status Overview - Donut Chart (Today)
const initBookingStatusOverviewChart = () => {
  let datalist = getServiceRequest("/report/bookingoverview"); // Expected: [Pending, On-going, Completed]
  if (!datalist || datalist.length === 0) datalist = [0, 0, 0];

  const ctx = document.getElementById("bookingStatusChart");
  if (!ctx) return;

  const labels = ["Pending", "On-going", "Completed"];
  const colors = ["#f59e0b", "#6d28d9", "#10b981"];

  // total eka calculate karala gnnawa
  const total = datalist.reduce((a, b) => a + b, 0);
  document.getElementById("totalBookingStatus").innerText = total;

  // Calculate karanwa efficiency eka (Completed % of Total)
  const completed = datalist[2] || 0;
  const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;
  document.getElementById("bookingEfficiency").innerText = `${efficiency}%`;

  // customized karapu legend section eka thama me
  const legendContainer = document.getElementById("bookingStatusLegend");
  if (legendContainer) {
    legendContainer.innerHTML = "";
    labels.forEach((label, index) => {
      const val = datalist[index] || 0;
      legendContainer.innerHTML += `
        <div class="legend-item">
            <div class="legend-info">
                <span class="legend-dot" style="background: ${colors[index]}"></span>
                <span>${label.toLowerCase()}</span>
            </div>
            <div class="legend-line"></div>
            <div class="legend-value">${val}</div>
        </div>
      `;
    });
  }

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: datalist,
          backgroundColor: colors,
          hoverOffset: 4,
          borderWidth: 3,
          borderColor: "#ffffff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw || 0;
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
      cutout: "75%",
    },
  });
};

// Fleet Utilization - Gauge Chart (Semi-Donut)
const initFleetUtilizationChart = () => {
  let datalist = getServiceRequest("/report/fleetutilization");

  const busyVehicle = datalist[0];
  const freeVehicle = datalist[1];

  const precentage = parseInt((busyVehicle / (busyVehicle + freeVehicle)) * 100);
  utilizationValue.innerText = `${precentage}%`;

  const ctx = document.getElementById("fleetUtilizationChart");
  if (!ctx) return;

  const labels = ["On Road", "Available"];
  const colors = ["#6d28d9", "#e5e7eb"];

  // customized karapu legend section eka thama me
  const legendContainer = document.getElementById("fleetUtilizationLegend");
  if (legendContainer) {
    legendContainer.innerHTML = "";
    labels.forEach((label, index) => {
      const val = datalist[index] || 0;
      legendContainer.innerHTML += `
        <div class="legend-item">
            <div class="legend-info">
                <span class="legend-dot" style="background: ${colors[index]}"></span>
                <span>${label.toLowerCase()}</span>
            </div>
            <div class="legend-line"></div>
            <div class="legend-value">${val}</div>
        </div>
      `;
    });
  }

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: datalist,
          backgroundColor: colors,
          circumference: 180,
          rotation: -90,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
      cutout: "80%",
    },
  });
};

// role based dashboard content visibility
const roleBasedDashboardContentVisibility = () => {
  const loggedInUser = getServiceRequest("/loggeduserdetails"); // Assume this function retrieves the logged-in user object
  const userRole = loggedInUser.role_name; // Assume the user object has a role_name property

  const elementsToHideForCoordinators = document.querySelectorAll(".hide-for-coordinators");
  const elementsToHideForSupervisors = document.querySelectorAll(".hide-for-Supervisors");
  const elementsToHideForManagers = document.querySelectorAll(".hide-for-managers");
  const elementsToHideForAdmins = document.querySelectorAll(".hide-for-admins");

  if (userRole === "Coordinator") {
    elementsToHideForCoordinators.forEach((el) => el.style.display = "none");
  } else if (userRole === "Supervisor") {
    elementsToHideForSupervisors.forEach((el) => el.style.display = "none");
  } else if (userRole === "Manager") {
    elementsToHideForManagers.forEach((el) => el.style.display = "none");
  } else if (userRole === "Admin") {
    elementsToHideForAdmins.forEach((el) => el.style.display = "none");
  } else {
    // If the role is not recognized, hide all role-specific elements
    elementsToHideForCoordinators.forEach((el) => el.style.display = "none");
    elementsToHideForSupervisors.forEach((el) => el.style.display = "none");
    elementsToHideForManagers.forEach((el) => el.style.display = "none");
    elementsToHideForAdmins.forEach((el) => el.style.display = "none");
  }
};

// Call the function to set visibility based on role
roleBasedDashboardContentVisibility();
