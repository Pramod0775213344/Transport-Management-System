window.addEventListener("load", () => {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      let customers = getServiceRequest("/customer/byactiveagreements");
      dataFilIntoSelect(selectCustomerName, "Select Company Name", customers, "company_name");

      let vehicleTypes = getServiceRequest("/vehicletype/alldata");
      dataFilIntoSelect(selectVehicleType, "Select Vehicle Type", vehicleTypes, "name");
    } catch (e) {
      console.error("Error during revenue page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);
});



// vehicle count eka chart eken generate karana function eka
const currentmonthvehiclerevenue = () => {
  if (!selectCustomerName.value || !selectVehicleType.value) {
    Swal.fire({
      title: "Selection Required",
      text: "Please select both Customer and Vehicle Type before generating the report.",
      icon: "info",
      allowOutsideClick: false,
      customClass: {
        confirmButton: "btn btn-1",
        popup: "swal2-border-radius",
      },
    });
    return;
  }

  const customer = JSON.parse(selectCustomerName.value);
  const vehicleType = JSON.parse(selectVehicleType.value);
  const dateType = monthSelect.value;

  let datalist = getServiceRequest(
    "/report/revenue?customerid=" + customer.id + "&vehicletypeid=" + vehicleType.id + "&dateType=" + dateType
  );

  // Destroy existing DataTable if it exists
  if ($.fn.dataTable.isDataTable("#revenueCurrentMonthTable")) {
    $("#revenueCurrentMonthTable").DataTable().destroy();
  }

  const sortedDataList = [...datalist].sort((left, right) => Number(right[1]) - Number(left[1]));

  let reportDatalist = new Array();
  let data = new Array();
  let label = new Array();

  for (const index in datalist) {
    let object = new Object();
    object.distance = datalist[index][1];
    object.vehicle_no = datalist[index][0] + " KM";
    reportDatalist.push(object);

    label.push(datalist[index][1]);
    data.push(datalist[index][0]);
  }

  let propertyList = [
    { propertyName: "distance", dataType: "string" },
    { propertyName: "vehicle_no", dataType: "string" },
  ];

  dataFillIntoTheReportTable(revenueCurrentMonthTableBody, reportDatalist, propertyList);


   // Initialize DataTable
    const table = $("#revenueCurrentMonthTable").DataTable({
      dom: "rtip", // Hide default search and length
      pageLength: 10,
      createdRow: function (row, data, dataIndex) {
        $(row).find("td").css({
          "text-align": "center",
          "vertical-align": "middle",
          height: "60px",
        });
      },
      headerCallback: function (thead, data, start, end, display) {
        $(thead).find("th").css({
          "text-align": "center",
          padding: "15px",
        });
      },
    });

    // Custom Search Control
    document.getElementById("tableSearch").addEventListener("keyup", function () {
      table.search(this.value).draw();
    });

    // Custom Length Control
    document.getElementById("tableLength").addEventListener("change", function () {
      table.page.len(this.value).draw();
    });

  // Remove old chart if exists
  const oldChart = document.getElementById("myChart");
  if (oldChart) {
    oldChart.remove();
  }

  // Create and append new canvas
  const chartContainer = document.getElementById("chartContainer");
  const canvas = document.createElement("canvas");
  canvas.id = "myChart";
  chartContainer.appendChild(canvas);

  // Generate chart
  const ctx = document.getElementById("myChart");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: label,
      datasets: [
        {
          label: "Total Distance (KM)",
          data: data,
          borderWidth: 1,
          borderRadius: 3,
          borderSkipped: false,
          backgroundColor: ["#7c3aed", "#f43f5e", "#10b981", "#f97316", "#0ea5e9", "#8b5cf6", "#14b8a6", "#eab308"],
          borderColor: ["#6d28d9", "#e11d48", "#059669", "#ea580c", "#0284c7", "#7c3aed", "#0f766e", "#ca8a04"],
        },
      ],
    },
    options: {
      indexAxis: "x",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "#1e293b",
          padding: 12,
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          callbacks: {
            label: function (context) {
              return ` Total Distance: ${context.parsed.y} KM`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: "#64748b",
            font: {
              weight: "600",
            },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(148, 163, 184, 0.18)",
          },
          ticks: {
            color: "#64748b",
          },
        },
      },
    },
  });

};

const reset = () => {
  selectCustomerName.selectedIndex = 0;
  selectVehicleType.selectedIndex = 0;
  revenueCurrentMonthTableBody.innerHTML = "";
 

   
  const oldChart = document.getElementById("myChart");
  if (oldChart) {
    oldChart.remove();
  }
};
