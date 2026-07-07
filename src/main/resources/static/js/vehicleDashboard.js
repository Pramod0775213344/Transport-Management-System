window.addEventListener("load", function () {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      vehiclecountgeneratebytype();
      generateActiveStatusChart(); // New chart with dummy data
      allVehicleCount();
      activeVehicleCount();
      revenueLicenseExpireVehicleCount();
      insuranceExpireVehicleCount();
      revenueLicenseExpireVehicle();
      insuranceExpireVehicle();
    } catch (e) {
      console.error("Error during vehicle dashboard page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);
});

// vehicle count eka chart eken generate karana function eka
const vehiclecountgeneratebytype = () => {
  let datalist = getServiceRequest("/report/countbyvehicletype");

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
  const ctx = document.getElementById("myChart");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: label,
      datasets: [
        {
          label: "Number of Vehicles",
          data: data,
          backgroundColor: [
            "#6d28d9",
            "#7c3aed",
            "#8b5cf6",
            "#a78bfa",
            "#c4b5fd",
            "#5b21b6",
          ],
          borderColor: "#ffffff",
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
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

// 2. Active Vehicles Status Chart (Doughnut) - DUMMY DATA ONLY FOR THIS
const generateActiveStatusChart = () => {
  const ctx = document.getElementById("activeVehicleChart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["On Trip", "Available", "Maintenance", "Emergency"],
      datasets: [
        {
          data: [65, 25, 8, 2],
          backgroundColor: [
            "#6d28d9", // On-going (Purple)
            "#10b981", // Available (Emerald)
            "#f59e0b", // Maintenance (Amber)
            "#ef4444", // Emergency (Red)
          ],
          hoverOffset: 4,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
      },
      cutout: "70%",
    },
  });
};

// get service request function for get vehicle count
const allVehicleCount = () => {
  let allVehicleCountResult = getServiceRequest("/report/countofallvehicles");
  if (allVehicleCountResult.length == 0) {
    document.getElementById("totalVehicle").innerHTML = "0";
  } else {
    document.getElementById("totalVehicle").innerHTML = allVehicleCountResult;
  }
};

//active vehicle count
const activeVehicleCount = () => {
  let activeVehicleCountResult = getServiceRequest(
    "/report/countofactivevehicles",
  );
  if (activeVehicleCountResult.length == 0) {
    document.getElementById("totalActiveVehicle").innerHTML = "0";
  } else {
    document.getElementById("totalActiveVehicle").innerHTML =
      activeVehicleCountResult;
  }
};

//revenue license expire vehicle count
const revenueLicenseExpireVehicleCount = () => {
  let revenueLicenseExpireVehicleCountResult = getServiceRequest(
    "/report/countofrevenueexpirevehicles",
  );
  if (revenueLicenseExpireVehicleCountResult.length == 0) {
    document.getElementById("totalRevenueLicenseExpireVehicle").innerHTML = "0";
  } else {
    document.getElementById("totalRevenueLicenseExpireVehicle").innerHTML =
      revenueLicenseExpireVehicleCountResult;
  }
};

//insurance expire vehicle count
const insuranceExpireVehicleCount = () => {
  let insuranceExpireVehicleCountResult = getServiceRequest(
    "/report/countofinsuranceexpirevehicles",
  );
  if (insuranceExpireVehicleCountResult.length == 0) {
    document.getElementById("totalInsuranceExpireVehicle").innerHTML = "0";
  } else {
    document.getElementById("totalInsuranceExpireVehicle").innerHTML =
      insuranceExpireVehicleCountResult;
  }
};

//expire revenue licenses recently 5 vehicles
const revenueLicenseExpireVehicle = () => {
  let revenueLicenseExpireVehicleList = getServiceRequest(
    "/report/recentlyupdatedrevenuelicenseexpirevehicles",
  );

  if (revenueLicenseExpireVehicleList.length == 0) {
    document.getElementById("revenueLicenseExpireVehicleTableBody").innerHTML =
      `<tr> <td colspan="7" class="text-center fs-5 m-2">No Data Found</td></tr>`;
  } else {
    let propertyList = [
      { propertyName: getSupplier, dataType: "function" },
      { propertyName: "vehicle_no", dataType: "string" },
      { propertyName: getVehicleType, dataType: "function" },
      { propertyName: "revenu_license_expire_date", dataType: "string" },
    ];

    dataFillIntoTheReportTable(
      document.getElementById("revenueLicenseExpireVehicleTableBody"),
      revenueLicenseExpireVehicleList,
      propertyList,
    );
  }
};

//expire insurance  recently 5 vehicle
const insuranceExpireVehicle = () => {
  let insuranceExpireVehicleList = getServiceRequest(
    "/report/recentlyupdatedinsuranceexpirevehicles",
  );

  if (insuranceExpireVehicleList.length == 0) {
    document.getElementById("insuranceExpireVehicleTableBody").innerHTML =
      `<tr> <td colspan="7" class="text-center fs-5 m-2">No Data Found</td></tr>`;
  } else {
    let propertyList = [
      { propertyName: getSupplier, dataType: "function" },
      { propertyName: "vehicle_no", dataType: "string" },
      { propertyName: getVehicleType, dataType: "function" },
      { propertyName: "insurance_expire_date", dataType: "string" },
    ];

    dataFillIntoTheReportTable(
      document.getElementById("insuranceExpireVehicleTableBody"),
      insuranceExpireVehicleList,
      propertyList,
    );
  }
};

// get supplier name from data object
const getSupplier = (dataOb) => {
  return dataOb.supplier_id ? dataOb.supplier_id.fullname : "N/A";
};

// get vehicle type
const getVehicleType = (dataOb) => {
  return dataOb.vehicle_type_id ? dataOb.vehicle_type_id.name : "N/A";
};
