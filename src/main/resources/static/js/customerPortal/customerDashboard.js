document.addEventListener('DOMContentLoaded', function () {
    // Initialize Dashboard
    initCustomerDashboard();
  
    // Hide the loading overlay
    if (typeof finishPageLoading === 'function') {
        finishPageLoading();
    }
});

const initCustomerDashboard = () => {
    loadCustomerKPIs();
    loadRecentBookings();
    initBookingStatusChart();
}

const loadCustomerKPIs = () => {
    
    const loggedInUser = getServiceRequest("/loggeduserdetails");
    console.log(loggedInUser);

    const totalBookings = getServiceRequest("/report/totalbookingsbycustomer?customerid=" + loggedInUser.customer_id);
    const activeBookings = getServiceRequest("/report/activebookingsbycustomer?customerid=" + loggedInUser.customer_id);
    const completedBookings = getServiceRequest("/report/completedbookingsbycustomer?customerid=" + loggedInUser.customer_id);
    const pendingInvoices = getServiceRequest("/report/pendinginvoicesbycustomer?customerid=" + loggedInUser.customer_id);

    document.getElementById('customerTotalBookings').innerText = totalBookings || '0';
    document.getElementById('customerActiveBookings').innerText = activeBookings || '0';
    document.getElementById('customerCompletedBookings').innerText = completedBookings || '0';
    document.getElementById('customerPendingInvoices').innerText = pendingInvoices || '0';

}

const loadRecentBookings = () => {
    //recent 5 bookings get in to the dashboeard

    loggedInUser = getServiceRequest("/loggeduserdetails");
  console.log("111");
  let recentBookings = getServiceRequest("/booking/recentbookingbycustomerid?customerid=" + loggedInUser.customer_id);
  console.log(recentBookings);

  let propertyList = [
    { propertyName: "booking_no", dataType: "string" },
    { propertyName: getCustomer, dataType: "function" },
    { propertyName: getVehicleNo, dataType: "function" },
    { propertyName: "pickup_date_time", dataType: "string" },
    { propertyName: "delivery_date_time", dataType: "string" },
    // {propertyName: getStatus, dataType: "function"}
  ];

  // Data Filling Function to Table
  dataFillIntoTheReportTable(recentBookingsTableBody, recentBookings, propertyList);

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


const initBookingStatusChart = () => {
      loggedInUser = getServiceRequest("/loggeduserdetails");
    console.log(loggedInUser);
    let datalist = getServiceRequest("/report/customerbookingsummarybystatus?customerid=" + loggedInUser.customer_id); // Expected: [Pending, On-going, Completed]
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
}
