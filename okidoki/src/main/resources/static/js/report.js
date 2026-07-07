window.addEventListener("load", function() {

})


const ctx = document.getElementById('myChart');

new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
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
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

const openReportList =  (type) =>{

    if (type ==='operational'){
        operationalReportList.style.display='block';
        financialReportList.style.display='none';
        fleetManagementReportList.style.display='none';
        driverPerformanceReportList.style.display='none';
        customerOrderReportList.style.display='none';
        analyticsReportList.style.display = 'none';
        complianceReportList.style.display = 'none';
    }
    if (type ==='financial'){
        operationalReportList.style.display='none';
        financialReportList.style.display='block';
        fleetManagementReportList.style.display='none';
        driverPerformanceReportList.style.display='none';
        customerOrderReportList.style.display='none';
        analyticsReportList.style.display = 'none';
        complianceReportList.style.display = 'none';
    }
    if (type ==='fleet'){
        operationalReportList.style.display='none';
        financialReportList.style.display='none';
        fleetManagementReportList.style.display='block';
        driverPerformanceReportList.style.display='none';
        customerOrderReportList.style.display='none';
        analyticsReportList.style.display = 'none';
        complianceReportList.style.display = 'none';
    }
    if (type ==='driver'){
        operationalReportList.style.display='none';
        financialReportList.style.display='none';
        fleetManagementReportList.style.display='none';
        driverPerformanceReportList.style.display='block';
        customerOrderReportList.style.display='none';
        analyticsReportList.style.display = 'none';
        complianceReportList.style.display = 'none';
    }
    if (type ==='customer'){
        operationalReportList.style.display='none';
        financialReportList.style.display='none';
        fleetManagementReportList.style.display='none';
        driverPerformanceReportList.style.display='none';
        customerOrderReportList.style.display='block';
        analyticsReportList.style.display = 'none';
        complianceReportList.style.display = 'none';
    }
    if (type ==='analytics'){
        operationalReportList.style.display='none';
        financialReportList.style.display='none';
        fleetManagementReportList.style.display='none';
        driverPerformanceReportList.style.display='none';
        customerOrderReportList.style.display='none';
        analyticsReportList.style.display = 'block';
        complianceReportList.style.display = 'none';
    }
    if (type ==='compliance'){
        operationalReportList.style.display='none';
        financialReportList.style.display='none';
        fleetManagementReportList.style.display='none';
        driverPerformanceReportList.style.display='none';
        customerOrderReportList.style.display='none';
        analyticsReportList.style.display = 'none';
        complianceReportList.style.display = 'block';
    }

}