window.addEventListener("load", () => {
  hourlyBookingTrendChartFunction();
  booingCountByStatus();
  refreshDailyBookingReport();
});

// daily hourly booking count eka chart eken generate karana function eka
const hourlyBookingTrendChartFunction = () => {
  let datalist = getServiceRequest("/report/dailyhourlybooking");

  let reportDatalist = new Array();
  let data = new Array();
  let label = new Array();

  for (const index in datalist) {
    let hour = parseInt(datalist[index][0]);
    let ampm = hour >= 12 ? "PM" : "AM";
    let displayHour = hour % 12;
    displayHour = displayHour === 0 ? 12 : displayHour;
    let formattedHour = displayHour + " " + ampm;

    let object = new Object();
    object.hour = formattedHour;
    object.booking_count = datalist[index][1];
    reportDatalist.push(object);

    label.push(formattedHour);
    data.push(datalist[index][1]);
  }

  const propertyList = [
    { propertyName: "hour", dataType: "string" },
    { propertyName: "booking_count", dataType: "string" },
  ];

  // table generate
  dataFillIntoTheReportTable(document.getElementById("hourlyBookingTrendTableBody"), reportDatalist, propertyList);

  // chart generate
  const ctx = document.getElementById("hourlyBookingTrendChart").getContext("2d");

  // Create Gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, "rgba(124, 58, 237, 0.3)");
  gradient.addColorStop(1, "rgba(124, 58, 237, 0)");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: label,
      datasets: [
        {
          label: "Number Of Bookings",
          data: data,
          borderColor: "#7c3aed",
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4, // Smooth curves
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#7c3aed",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // Hide legend as there's only one dataset
        },
        tooltip: {
          backgroundColor: "#1e293b",
          padding: 12,
          titleFont: { size: 14, weight: "700" },
          bodyFont: { size: 13 },
          cornerRadius: 8,
          displayColors: false,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: "#94a3b8",
            font: { size: 11 },
          },
        },
        y: {
          beginAtZero: true,
          border: { dash: [4, 4] },
          grid: { color: "#f1f5f9" },
          ticks: {
            color: "#94a3b8",
            font: { size: 11 },
            stepSize: 5,
          },
        },
      },
    },
  });
};

//daily booking status count
const booingCountByStatus = () => {
  let datalist = getServiceRequest("/report/bookingbystatusdaily");

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
  const ctx = document.getElementById("bookingStatusDistributionChart");

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: label,
      datasets: [
        {
          label: "Number of Bookings",
          data: data,
          backgroundColor: ["#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899"],
          hoverOffset: 15,
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    },
    options: {
      circumference: 180,
      rotation: -90,
      cutout: "75%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 11,
              weight: "500",
            },
          },
        },
      },
      layout: {
        padding: {
          bottom: 0,
        },
      },
      maintainAspectRatio: false,
    },
  });
};

// selecte tage for view in hourlt booking trend
let selectHourlyBookingView = document.getElementById("selectHourlyBookingView");
selectHourlyBookingView.addEventListener("change", () => {
  if (selectHourlyBookingView.value === "Chart") {
    hourlyBookingTrendChart.style.display = "";
    hourlyBookingTrendTable.style.display = "none";
  } else if (selectHourlyBookingView.value === "Table") {
    hourlyBookingTrendChart.style.display = "none";
    hourlyBookingTrendTable.style.display = "";
  }
});

// select tage for view in status booking distribution trend
let selectBookingStatusDistributionView = document.getElementById("selectBookingStatusDistributionView");
selectBookingStatusDistributionView.addEventListener("change", () => {
  if (selectBookingStatusDistributionView.value === "Chart") {
    bookingStatusDistributionChart.style.display = "";
    bookingStatusDistributionTable.style.display = "none";
  } else if (selectBookingStatusDistributionView.value === "Table") {
    bookingStatusDistributionChart.style.display = "none";
    bookingStatusDistributionTable.style.display = "";
  }
});

// daily booking report table load karana function eka
const loadDailyBookingReportTable = (dailyBookingReportList) => {
  updateKPICards(dailyBookingReportList);
  if ($.fn.dataTable.isDataTable("#dailyBookingReportTable")) {
    $("#dailyBookingReportTable").DataTable().clear().destroy();
  }

  let propertyList = [
    { propertyName: "booking_no", dataType: "string" },
    { propertyName: getCustomer, dataType: "function" },
    { propertyName: getPickupLoaction, dataType: "function" },
    { propertyName: getViaLoaction, dataType: "function" },
    { propertyName: getDeliveryLoaction, dataType: "function" },
    { propertyName: getDistance, dataType: "function" },
    { propertyName: getVehicelType, dataType: "function" },
    { propertyName: getVehicle, dataType: "function" },
    { propertyName: getDriver, dataType: "function" },
    { propertyName: "arrived_at_pickup_datetime", dataType: "datetime" },
    { propertyName: "departed_from_pickup_datetime", dataType: "datetime" },
    { propertyName: "arrived_at_delivery_datetime", dataType: "datetime" },
    { propertyName: "departed_from_delivery_datetime", dataType: "datetime" },
    { propertyName: getStatus, dataType: "function" },
  ];

  dataFillIntoTheReportTable(dailyBookingReportTableBody, dailyBookingReportList, propertyList);

  const table = $("#dailyBookingReportTable").DataTable({
    dom: "rtip",
    searching: true,
    lengthChange: false,
    pageLength: 10,
    autoWidth: false,
    scrollX: true,
    language: {
      emptyTable: "No booking records found",
    },
    createdRow: function (row, data, dataIndex) {
      $(row).find("td").css({
        "text-align": "left",
        padding: "16px 24px",
      });
    },
    headerCallback: function (thead, data, start, end, display) {
      $(thead).find("th").css({
        "text-align": "left",
        padding: "16px 24px",
        "font-weight": "700",
        color: "#64748b",
        "border-bottom": "1px solid #edf2f7",
      });
    },
  });

  // Custom Search Implementation
  document.getElementById("searchDailyBookings").addEventListener("keyup", function () {
    table.search(this.value).draw();
  });

  // Custom Length Implementation
  document.getElementById("tableLength").addEventListener("change", function () {
    table.page.len(parseInt(this.value)).draw();
  });
};

// update kpi card
const updateKPICards = (dailyBookingReportList) => {
  let totalBookings = dailyBookingReportList.length;
  let completed = 0;
  let pending = 0;
  let cancelled = 0;
  let totalDistance = 0;
  let drivers = new Set();
  let vehicles = new Set();

  dailyBookingReportList.forEach((booking) => {
    let status = booking.booking_status_id.status;
    if (status === "Departed From Delivery") completed++;
    else if (status === "Cancelled") cancelled++;
    else pending++;

    totalDistance += parseFloat(booking.distance || 0);
    if (booking.driver_id) drivers.add(booking.driver_id.id);
    if (booking.vehicle_id) vehicles.add(booking.vehicle_id.id);
  });

  // Update UI
  document.getElementById("kpi-total-bookings").innerText = totalBookings;
  document.getElementById("kpi-completed").innerText = completed;
  document.getElementById("kpi-pending").innerText = pending;
  document.getElementById("kpi-cancelled").innerText = cancelled;

  // Format distance
  let distanceDisplay = totalDistance;
  if (totalDistance >= 1000) {
    distanceDisplay = (totalDistance / 1000).toFixed(1) + "k";
  } else {
    distanceDisplay = totalDistance.toFixed(1);
  }
  document.getElementById("kpi-total-distance").innerText = distanceDisplay;

  // Percentages and progress bars
  if (totalBookings > 0) {
    let compPerc = ((completed / totalBookings) * 100).toFixed(1);
    let pendPerc = ((pending / totalBookings) * 100).toFixed(1);
    let cancPerc = ((cancelled / totalBookings) * 100).toFixed(1);

    document.getElementById("kpi-completed-percent").innerText = compPerc + "%";
    document.getElementById("kpi-completed-bar").style.width = compPerc + "%";

    document.getElementById("kpi-pending-percent").innerText = pendPerc + "%";
    document.getElementById("kpi-pending-bar").style.width = pendPerc + "%";

    document.getElementById("kpi-cancelled-percent").innerText = cancPerc + "%";
    document.getElementById("kpi-cancelled-bar").style.width = cancPerc + "%";
  } else {
    document.getElementById("kpi-completed-percent").innerText = "0%";
    document.getElementById("kpi-completed-bar").style.width = "0%";
    document.getElementById("kpi-pending-percent").innerText = "0%";
    document.getElementById("kpi-pending-bar").style.width = "0%";
    document.getElementById("kpi-cancelled-percent").innerText = "0%";
    document.getElementById("kpi-cancelled-bar").style.width = "0%";
  }

  // Drivers and Vehicles
  let assignedDriversCount = drivers.size;
  let usedVehiclesCount = vehicles.size;

  document.getElementById("kpi-assigned-drivers").innerText = assignedDriversCount;
  document.getElementById("kpi-used-vehicles").innerText = usedVehiclesCount;

  // Total drivers and vehicles from server
  let totalDriversCount = getServiceRequest("/report/countofallactiveandinactiveDrivers") || 0;
  let totalVehiclesCount = getServiceRequest("/report/countofallvehicles") || 0;

  document.getElementById("kpi-total-drivers").innerText = totalDriversCount;
  document.getElementById("kpi-total-vehicles").innerText = totalVehiclesCount;

  if (totalDriversCount > 0) {
    document.getElementById("kpi-drivers-bar").style.width = (assignedDriversCount / totalDriversCount) * 100 + "%";
  } else {
    document.getElementById("kpi-drivers-bar").style.width = "0%";
  }

  if (totalVehiclesCount > 0) {
    document.getElementById("kpi-vehicles-bar").style.width = (usedVehiclesCount / totalVehiclesCount) * 100 + "%";
  } else {
    document.getElementById("kpi-vehicles-bar").style.width = "0%";
  }
};

// get customer name from data object
const getCustomer = (dataOb) => {
  return dataOb.customer_id.company_name;
};

// get pickup location
const getPickupLoaction = (dataOb) => {
  return `
    <div class="d-flex flex-column gap-1">
      <div class="fw-bold text-dark"><i class="fas fa-map-marker-alt text-success me-2" style="font-size: 0.8rem;"></i>${dataOb.pickup_locations_id.name}</div>
      <div class="text-muted small"><i class="far fa-calendar-alt me-1"></i> ${dataOb.pickup_date_time.replace("T", " ")}</div>
    </div>`;
};

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
    return " - ";
  }
};

// get delivery location
const getDeliveryLoaction = (dataOb) => {
  return `
    <div class="d-flex flex-column gap-1">
      <div class="fw-bold text-dark"><i class="fas fa-location-arrow text-danger me-2" style="font-size: 0.8rem;"></i>${dataOb.delivery_locations_id.name}</div>
      <div class="text-muted small"><i class="far fa-calendar-alt me-1"></i> ${dataOb.delivery_date_time.replace("T", " ")}</div>
    </div>`;
};

// get distance
const getDistance = (dataOb) => {
  return `<span class="badge bg-light text-dark border fw-bold" style="padding: 6px 10px; border-radius: 6px;">${dataOb.distance} KM</span>`;
};

// get vehicle type
const getVehicelType = (dataOb) => {
  return dataOb.vehicle_type_id.name;
};

// get vehicle no
const getVehicle = (dataOb) => {
  if (dataOb.vehicle_id == null) {
    return " - ";
  } else {
    return dataOb.vehicle_id.vehicle_no;
  }
};

// get driver name
const getDriver = (dataOb) => {
  if (dataOb.driver_id == null) {
    return " - ";
  } else {
    return dataOb.driver_id.fullname;
  }
};

// get booking status with color
const getStatus = (dataOb) => {
  const status = dataOb.booking_status_id.status;
  let statusClass = "status-inactive";
  if (status === "Attend") {
    statusClass = "status-badge status-attend";
  } else if (status === "Arrived At Pickup") {
    statusClass = "status-pending";
  } else if (status === "Departed From Pickup") {
    statusClass = "status-pending";
  } else if (status === "Arrived At Delivery") {
    statusClass = "status-active";
  } else if (status === "Departed From Pickup") {
    statusClass = "status-active";
  } else if (status === "Cancelled") {
    statusClass = "status-cancelled";
  } else if (status === "Inprocess") {
    statusClass = "status-inactive";
  }

  return `<div class="status-badge ${statusClass}">
            <span>${status}</span>
          </div>`;
};

const printDailyBookingReport = () => {
  let newWindow = window.open();
  let printView = document.getElementById("printViewDailyAgreementReport");
  printView.style.display = "block";
  generateDateDailyBookingReport.innerText = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  generateTimeDailyBookingReport.innerText = new Date().toLocaleTimeString();
  generateUserDailyBookingReport.innerText = loggedEmployee.fullname;
  console.log(printView);
  let preview =
    "<head><title>TMS</title><link rel='stylesheet' href='/css/common.css'><link rel='stylesheet' href='bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'></head><body>" +
    printView.outerHTML +
    "</body>";

  newWindow.document.write(preview);

  setTimeout(() => {
    printView.style.display = "none";
    newWindow.stop();
    newWindow.print();
    newWindow.close();
  }, 500);
};

//refresh function option
const refreshDailyBookingReport = () => {
  // get user all data for view details
  userList = getServiceRequest("report/useralldata");
  // employee wa hoyaganna log wela inna
  employeeList = getServiceRequest("/employee/alldata");
  logedUser = getServiceRequest("/loggeduserdetails");
  loggedEmployee = employeeList.find((employee) => employee.id === logedUser.employee_id);

  // refresh ekedi sampurana daily booings tika load karanwa
  let dailyBookingReportList = getServiceRequest("/report/alldailybookings");
  loadDailyBookingReportTable(dailyBookingReportList);
};

// table eke loading spin eka load karanwa
function showTableLoading() {
  const loader = document.getElementById("loaderId");
  const dailyBookingReportTable = document.getElementById("dailyBookingReportTable");
  loader.style.display = ""; // Clear loading after 2 seconds
  dailyBookingReportTable.style.display = "none"; // Hide the booking table while loading
  setTimeout(() => {
    const loader = document.getElementById("loaderId");
    loader.style.display = "none"; // Clear loading after 2 seconds
    dailyBookingReportTable.style.display = ""; // Hide the booking table while loading
  }, 500);
}
