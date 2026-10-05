// reportSupplierPayment.js
window.addEventListener("load", () => {
    // A tiny delay to allow the preloader to render before synchronous blocking calls
    setTimeout(() => {
        try {
            refreshReport();

        } catch (e) {
            console.error("Error during supplier page initialization:", e);
        } finally {
            // Reveal the content after all synchronous data is fetched
            finishPageLoading();
        }
    }, 100);

    //     enable type and search of the select element
    $("#selectFuelCardNo").select2({
        theme: "bootstrap-5",
    });

    $("#selectVehicle").select2({
        theme: "bootstrap-5",
    });

    $("#selectDriver").select2({
        theme: "bootstrap-5",
    });

    // === methana add karanna - period wenas unama chart eka witharak refresh wenawa ===
    document.getElementById("selectPeriod").addEventListener("change", updateChart);

});

const getSelectValue = (elementId) => {
    const val = document.getElementById(elementId).value;
    if (!val) return {};
    try {
        return JSON.parse(val);
    } catch (e) {
        console.error(`Failed to parse value for ${elementId}:`, val);
        return {};
    }
};

let currentReportData = [];

const fuelSummaryReport = () => {

    let vehicleId = getSelectValue("selectVehicle").id;
    let driverId = getSelectValue("selectDriver").id;
    let fuelCardId = getSelectValue("selectFuelCardNo").id;
    let startDate = document.getElementById("startDateFilter").value;
    let endDate = document.getElementById("endDateFilter").value;

    // empty key,value pair ekak hadanawa
    let params = new URLSearchParams();

    // variable eka true wunoth without value eka append karanawa, false wunoth append karanawa na
    // false karanne null,undefined,empty string value ekak thiyenawanam eka skip karanwa
    if (vehicleId) params.append("vehicleid", vehicleId);
    if (driverId) params.append("driverid", driverId);
    if (fuelCardId) params.append("fuelCardid", fuelCardId);
    if (startDate) params.append("startdate", startDate);
    if (endDate) params.append("enddate", endDate);

    // params toString eken add karapu parameter tika url eke query string ekata convert karanawa
    // supplier id eka witharak add kaloth url eka --> /report/supplierpaymentlist?supplierid=5
    // supplier id saha vehicle id add kaloth url eka --> /report/supplierpaymentlist?supplierid=5&vehicleid=2
    let datalist = getServiceRequest("/report/fuelsummaryreport?" + params.toString());

    if (!datalist || datalist.length === 0) {
        document.getElementById("fuelSummaryReportTableBody").innerHTML = "<tr><td colspan='8' class='text-center'>No data available</td></tr>";

        currentReportData = []; // methana add karanna - global data eka empty karanawa 

        if (window.myBarChart) {
            window.myBarChart.destroy(); // methana add karanna - parana chart eka clear karanawa 
            window.myBarChart = null;
        }

        return;
    }
    // datalist eka object ekakata convert karanawa
    // datalist eka 2D array ekak nisa eka object ekakata convert karanawa

    let reportDatalist = new Array();
    for (const index in datalist) {
        let object = new Object();
        object.bookingNo = datalist[index][0];
        object.vehicleNo = datalist[index][1];
        object.driver = datalist[index][2];
        object.amount = datalist[index][3];
        object.fuelCardNo = datalist[index][4];
        object.addeddate = datalist[index][5];
        reportDatalist.push(object);


    }

    const propertyList = [
        { propertyName: "bookingNo", dataType: "string" },
        { propertyName: "vehicleNo", dataType: "string" },
        { propertyName: "driver", dataType: "string" },
        { propertyName: "fuelCardNo", dataType: "string" },
        { propertyName: getPrice, dataType: "function" },
    ];

    currentReportData = reportDatalist; // === methana add karanna - global ekata save karanawa ===
    // meken sum karana data
    totalPrice = reportDatalist.reduce((sum, item) => sum + calculateRawPrice(item), 0);
    document.getElementById("totalPrice").innerText = totalPrice.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' });

    // table generate
    dataFillIntoTheReportTable(document.getElementById("fuelSummaryReportTableBody"), reportDatalist, propertyList);

    updateChart();


}

// currentReportData eka use karala, dan select kara period ekට anuwa chart eka refresh karanawa
const updateChart = () => {
    const period = document.getElementById("selectPeriod").value;
    const groupedData = groupByPeriod(currentReportData, period);
    generateBarChart(groupedData);
};

// distance eka saha package type anuwa price eka caluclauate karana function calculatePrice(distance, packageType) {
const calculateRawPrice = (dataOb) => {
    let price = 0;
    price = parseFloat(dataOb.amount);
    return price;
};

// table eke pennanna - currency format eka methanin
const getPrice = (dataOb) => {
    let price = calculateRawPrice(dataOb);
    return price.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' });
};


// bookingDate anuwa daily/weekly/monthly widiyata booking count group karanawa
const groupByPeriod = (dataList, period) => {

    // empty object ekak hadanawa - key eka date eka, value eka count eka
    const grouped = {};

    // datalist eken eka booking ekak gnnawa
    dataList.forEach((item) => {

        // bokking eke date eka gnnawa - date eka object ekakata convert karanawa
        const date = new Date(item.addeddate);
        // date eka anuwa key eka hadanawa - monthly, weekly, daily anuwa
        // meke pennanne day nam date eka weeka no weka no eka and month nam month eka
        let key;

        // me group karana logic eka - monthly, weekly, daily anuwa key eka hadanawa
        if (period === "monthly") {
            // date.getMonth() + 1 karanne month eka 0-11 range ekata thiyenawa nisa, 1 add karanawa
            key = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");

        } else if (period === "weekly") {

            // yaer eke fisrs monthe eke fisrt date eka gnnawa
            // 0- january  1-day
            const start = new Date(date.getFullYear(), 0, 1);
            // 
            // jan 1 idan api dena date eka wenakan dina keyyak gihinda
            const diffInDays = Math.floor((date - start) / (1000 * 60 * 60 * 24));

            // week number gannwa (day 1-7 = week 1, 8-14 = week 2, widihata)
            const weekNumber = Math.floor(diffInDays / 7) + 1;

            key = date.getFullYear() + "-W" + weekNumber;

        } else {
            key = item.addeddate;
        }

        // price eka calculate karanawa - distance saha package type anuwa
        const price = calculateRawPrice(item);

        // grouped object ekata key eka thiyenawanam, value eka increment karanawa, nathnam new key ekak hadanawa
        grouped[key] = (grouped[key] || 0) + price;

    });

    return grouped;
};

// bar chart eka generate karana function eka
const generateBarChart = (groupedData) => {
    // chart eka render karana context eka gnnawa
    const ctx = document.getElementById('barChart').getContext('2d');
    // labels saha values gnnawa - key saha value tika
    const labels = Object.keys(groupedData);
    const values = Object.values(groupedData);

    if (window.myBarChart) {
        window.myBarChart.destroy();
    }

    window.myBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Payment (LKR)',
                data: values,
                // backgroundColor: 'rgba(54, 162, 235, 0.2)',
                // borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: '#7c3aed',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        // y-axis eke number tika LKR format ekata pennanawa
                        callback: function (value) {
                            return value.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' });
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        // bar eka hover kaloth pennana value eka formatted karanawa
                        label: function (context) {
                            return context.dataset.label + ": " + context.raw.toLocaleString('en-LK', { style: 'currency', currency: 'LKR' });
                        }
                    }
                }
            }
        }
    });
};

const refreshReport = () => {

    // mulinma filter tika clear karanawa 
    startDateFilter.value = "";
    endDateFilter.value = "";

    // select2 dropdowns tika "All" ekata reset karanawa
    $("#selectFuelCardNo").val(null).trigger("change");
    $("#selectVehicle").val(null).trigger("change");
    $("#selectDriver").val(null).trigger("change");

    // supplier list fill into the select element
    const fuelCardList = getServiceRequest("/fuelscards/alldata");
    dataFilIntoSelect(selectFuelCardNo, "All", fuelCardList, "fuel_cards_no");

    // vehicle list fill into the select element
    const vehicleList = getServiceRequest("/vehicle/alldata");
    dataFilIntoSelect(selectVehicle, "All", vehicleList, "vehicle_no");

    // driver list fill into the select element
    const driverList = getServiceRequest("/driver/alldata");
    dataFillIntoSelectWithTwoNames(selectDriver, "All", driverList, "fullname", "nic");

    // === ohaseansehima ithuru unaata passe report eka generate karanawa ===
    fuelSummaryReport();
}

const printFuelSummaryReport = () => {
    const chartCanvas = document.getElementById("barChart");
    const chartImage = window.myBarChart ? window.myBarChart.toBase64Image() : (chartCanvas ? chartCanvas.toDataURL("image/png") : "");

    // filter details tika print header ekata pennanna

    const vehicleText = $("#selectVehicle").select2("data")[0]?.text || "All";
    const driverText = $("#selectDriver").select2("data")[0]?.text || "All";
    const fuelCardText = $("#selectFuelCardNo").select2("data")[0]?.text || "All";
    const startDate = document.getElementById("startDateFilter").value || "-";
    const endDate = document.getElementById("endDateFilter").value || "-";
    const totalPriceText = document.getElementById("totalPrice").innerText || "";

    const tableRowsHtml = currentReportData
        .map((fs, index) => {
            return `
    <tr>
      <td>${index + 1}</td>
      <td>${fs.bookingNo || "-"}</td>
      <td>${fs.vehicleNo || "-"}</td>
      <td>${fs.driver || "-"}</td>
      <td>${fs.fuelCardNo || "-"}</td>
      <td>${getPrice(fs)}</td>
    </tr>
    `;
        })
        .join("");

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
        <html>
            <head>
                <title>Fuel Payment Summary Report</title>
                <style>
          body { font-family: Arial, sans-serif; padding: 28px; color: #1e293b; }
                    .report-header { margin-bottom: 16px; text-align: center; }
          .report-title { margin: 0; font-size: 22px; font-weight: 700; }
          .report-subtitle { margin: 6px 0 0 0; color: #64748b; font-size: 13px; }
          .report-meta { margin: 8px 0 0 0; color: #64748b; font-size: 12px; }
          .filter-summary { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin: 14px 0; font-size: 12px; color: #334155; }
          .filter-summary span strong { color: #1e293b; }
          .chart-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; margin: 20px 0 24px 0; }
          .chart-card h4 { margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #334155; }
          .chart-image-wrap { display: flex; justify-content: center; align-items: center; min-height: 220px; }
          .chart-image-wrap img { max-width: 100%; max-height: 280px; }
          .table-title { font-size: 14px; font-weight: 700; margin: 8px 0 10px 0; text-transform: uppercase; color: #334155; }
          .total-summary { text-align: right; margin: 10px 0; font-size: 14px; font-weight: 700; color: #1e293b; }
          table { width: 100%; border-collapse: collapse; }
          th { background-color: #f8fafc; color: #64748b; text-transform: uppercase; font-size: 11px; padding: 10px; border: 1px solid #e2e8f0; }
          td { padding: 10px; border: 1px solid #e2e8f0; font-size: 12px; }
          td:first-child, th:first-child { text-align: center; width: 44px; }
                    @media print {
                        body { padding: 0; }
            .chart-card, tr { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
        <div class="report-header">
          <h1 class="report-title">Fuel Payment Summary</h1>
          <p class="report-subtitle">Detailed overview of summary of the fuel expenses</p>
          <p class="report-meta">Generated on: ${new Date().toLocaleString()}</p>
        </div>

        <div class="filter-summary">
       
          <span>Vehicle: <strong>${vehicleText}</strong></span>
          <span>Driver: <strong>${driverText}</strong></span>
             <span>Fuel Card: <strong>${fuelCardText}</strong></span>
          <span>Start Date: <strong>${startDate}</strong></span>
          <span>End Date: <strong>${endDate}</strong></span>
        </div>

        <div class="chart-card">
          <h4>Payment Trend</h4>
          <div class="chart-image-wrap">
            ${chartImage ? `<img src="${chartImage}" alt="Payment Trend Chart">` : "<span>Chart unavailable</span>"}
          </div>
        </div>

        <div class="table-title">Payment Details</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Booking No</th>
              <th>Vehicle No</th>
            <th>Driver</th>
              <th>Fuel Card No</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml || '<tr><td colspan="9" style="text-align:center;">No data available</td></tr>'}
          </tbody>
        </table>

        <div class="total-summary">Total Price: ${totalPriceText}</div>
            </body>
        </html>
    `);

    setTimeout(() => {
        printWindow.stop();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }, 500);
};