window.addEventListener("load", () => {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {
      refreshForm();
      refreshTable();
    } catch (e) {
      console.error("Error during fuel-price page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);
});

const refreshTable = () => {
  if ($.fn.dataTable.isDataTable("#fuelPriceTable")) {
    $("#fuelPriceTable").DataTable().clear().destroy();
  }

  fuelPrices = getServiceRequest("/fuelprice/alldata");

  const propertyList = [
    { propertyName: getFuelType, dataType: "function" },
    { propertyName: getUnitPrice, dataType: "function" },
    { propertyName: getEffectiveDate, dataType: "function" },
    { propertyName: getIsCurrent, dataType: "function" },
    { propertyName: "updated_by", dataType: "string" },
  ];

  dataFillIntoTheReportTable(fuelPriceTableBody, fuelPrices, propertyList);

  const table = $("#fuelPriceTable").DataTable({
    dom: "rtip",
    pageLength: 10,
    createdRow: function (row, data, dataIndex) {
      $(row).find("td").css({
        "text-align": "left",
        height: "80px",
      });
    },
    headerCallback: function (thead, data, start, end, display) {
      $(thead).find("th").css({
        "text-align": "left",
        padding: "20px",
      });
    },
  });

  $("#tableSearch")
    .off("keyup")
    .on("keyup", function () {
      table.search(this.value).draw();
    });

  $("#tableLength")
    .off("change")
    .on("change", function () {
      table.page.len(this.value).draw();
    });

  applyPrivileges("Fuel Price Management", null, {
    add: addButton,

  });
};

const getFuelType = (dataOb) => {
  return dataOb.fuel_type_id.fuel_name;
};
const getUnitPrice = (dataOb) => {
  return `<div class="fw-bold">${parseFloat(dataOb.unit_price).toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  })}</div>`;
};
const getEffectiveDate = (dataOb) => {
  return dataOb.effective_date.replace("T", " ").substring(0, 16);
};
const getIsCurrent = (dataOb) => {
  if (dataOb.is_current) {
    return `<span class="status-badge status-active"><i class="fa-solid fa-circle-check me-1"></i>Current</span>`;
  } else {
    return `<span class="status-badge status-inactive">Expired</span>`;
  }
};

const refreshForm = () => {
  fuelPrice = new Object();

  const fuelTypes = getServiceRequest("/fueltype/alldata");
  dataFilIntoSelect(selectFuelType, "Select Fuel Type", fuelTypes, "fuel_name");

  fuelPriceForm.reset();
  selectFuelType.value = "";
  selectFuelType.classList.remove("is-valid", "is-invalid");
  textUnitPrice.classList.remove("is-valid", "is-invalid");
};

const submitForm = () => {
  if (fuelPrice.fuel_type_id == null) {
    Swal.fire("Error", "Please select a fuel type.", "error");
    return;
  }
  if (fuelPrice.unit_price == null) {
    Swal.fire("Error", "Please enter a unit price.", "error");
    return;
  }

  Swal.fire({
    title: "Are you sure?",
    text: "You want to update the fuel price? The old price will expire.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Save it!",
  }).then((result) => {
    if (result.isConfirmed) {
      const response = httpServiceRequest("/fuelprice/insert", "POST", fuelPrice);
      if (response === "ok") {
        Swal.fire("Saved!", "Fuel price updated successfully.", "success");
        $("#fuelPriceFormModal").modal("hide");
        refreshTable();
        refreshForm();
      } else {
        Swal.fire("Error!", response, "error");
      }
    }
  });
};
