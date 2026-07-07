window.addEventListener("load", function () {
    // load this month data by default
    let incomeBarChartData = getServiceRequest("report/incomethismonth" )
    loadIncomeBarChart(incomeBarChartData);

    // income card area eke data load karanwa this month eke
    let incomeCards = getServiceRequest("report/incomecardsthismonth?period="+ selectGroup.value )
    loadIncomeChartWithAllCustomers(incomeCards);

    // load income chart with all customers
    let incomeCustomerWise  = getServiceRequest("report/customerwiseincomethismonth" )
    loadIncomeChartWithCustomers(incomeCustomerWise);
});

let selectGroup = document.getElementById("selectGroup");
let selectCustomer = document.getElementById("selectCustomer");
let incomelineChart = null;
let customerBarChart = null;

// report eka generate karanwa functtion eake
const reportGenarate = () =>{
    // destroy karanwa line chart eka
    if (incomelineChart){
        incomelineChart.destroy();
        incomelineChart = null;
    }
    if (customerBarChart){
        customerBarChart.destroy();
        customerBarChart = null;
    }
    // -----------------------------this month-----------------------------
    if (selectGroup.value === "thismonth" &&  selectCustomer.value ==" ") {
        // income barchart data load karanwa this month eke
        let incomeBarChartData = getServiceRequest("report/incomethismonth" )
        loadIncomeBarChart(incomeBarChartData);

        // income card area eke data load karanwa this month eke
        let incomeCards = getServiceRequest("report/incomecardsthismonth?period="+ selectGroup.value )
        loadIncomeChartWithAllCustomers(incomeCards);

        //income report all customer wise data this month
        let incomeCustomerWise  = getServiceRequest("report/customerwiseincomethismonth" )
        loadIncomeChartWithCustomers(incomeCustomerWise);

        fromDateTextDiv.style.display = "none";
        toDateTextDiv.style.display = "none";

    }else if (selectGroup.value === "thismonth" &&  selectCustomer.value !==" ") {
        fromDateTextDiv.style.display = "none";
        toDateTextDiv.style.display = "none";

    //     -----------------------------last month-----------------------------
    }else if (selectGroup.value === "lastmonth" &&  selectCustomer.value ==" ") {
        // income barchart data load karanwa last month eke
        let incomeBarChartData = getServiceRequest("report/incomelastmonth" )
        loadIncomeBarChart(incomeBarChartData);


        // income card area eke data load karanwa last month eke
        let incomeCards = getServiceRequest("report/incomecardsthismonth?period="+ selectGroup.value )
        loadIncomeChartWithAllCustomers(incomeCards);
        if (incomeCards.length === 0){
            incomeLineChartDiv.style.display = "none"
        }

        //income report all customer wise data last month
        let incomeCustomerWise  = getServiceRequest("report/customerwiseincomelastmonth" )
        loadIncomeChartWithCustomers(incomeCustomerWise);
        if (incomeCustomerWise.length === 0){
            incomeBarChatDiv.style.display = "none"
        }


        fromDateTextDiv.style.display = "none";
        toDateTextDiv.style.display = "none";

    }else if (selectGroup.value === "lastmonth" &&  selectCustomer.value !==" ") {
        fromDateTextDiv.style.display = "none";
        toDateTextDiv.style.display = "none";

    //     -----------------------------last 3 month-----------------------------
    }else if (selectGroup.value === "last3month" &&  selectCustomer.value ==" ") {
        // income barchart data load karanwa last 3 month wala
        let incomeBarChartData = getServiceRequest("report/incomelast3month" )
        loadIncomeBarChart(incomeBarChartData);

        // income card area eke data load karanawa last 3 month wala
        let incomeCards = getServiceRequest("report/incomecardsthismonth?period="+ selectGroup.value )
        loadIncomeChartWithAllCustomers(incomeCards);

        //income report all customer wise data last 3 month
        let incomeCustomerWise  = getServiceRequest("report/customerwiseincomelast3month" )
        loadIncomeChartWithCustomers(incomeCustomerWise);

        fromDateTextDiv.style.display = "none";
        toDateTextDiv.style.display = "none";

    }else if (selectGroup.value === "last3month" &&  selectCustomer.value !==" ") {
        fromDateTextDiv.style.display = "none";
        toDateTextDiv.style.display = "none";

    //     -----------------------------last 6 month----------------------------------------
    }else if (selectGroup.value === "last6month" &&  selectCustomer.value ==" ") {
        // income barchart data load karanwa last 6 month wala
        let incomeBarChartData = getServiceRequest("report/incomelast6month" )
        loadIncomeBarChart(incomeBarChartData);
        if (incomeBarChartData.length ===0){
            incomeCardDiv.style.display = "none"
        }

        // income card area eke data load karanawa last 6 month wala
        let incomeCards = getServiceRequest("report/incomecardsthismonth?period="+ selectGroup.value )
        loadIncomeChartWithAllCustomers(incomeCards);
        if (incomeCards.length === 0){
            incomeLineChartDiv.style.display = "none"
        }

        //income report all customer wise data last 6 month
        let incomeCustomerWise  = getServiceRequest("report/customerwiseincomelast6month" )
        loadIncomeChartWithCustomers(incomeCustomerWise);
        if (incomeCustomerWise.length === 0){
            incomeBarChatDiv.style.display = "none"
        }

        fromDateTextDiv.style.display = "none";
        toDateTextDiv.style.display = "none";

    }else if (selectGroup.value === "last6month" &&  selectCustomer.value !==" ") {
        fromDateTextDiv.style.display = "none";
        toDateTextDiv.style.display = "none";

    //     -----------------------------this year----------------------------------------
    }else if (selectGroup.value === "thisyear" &&  selectCustomer.value ==" ") {
        // income barchart data load karanwa this year eke
        let incomeBarChartData = getServiceRequest("report/incomethisyear" )
        loadIncomeBarChart(incomeBarChartData);

        // income card area eke data load karanwa this yaer eke
        let incomeCards = getServiceRequest("report/incomecardsthismonth?period="+ selectGroup.value )
        loadIncomeChartWithAllCustomers(incomeCards);

        //income report all customer wise data this year
        let incomeCustomerWise  = getServiceRequest("report/customerwiseincomethisyear" )
        loadIncomeChartWithCustomers(incomeCustomerWise);

        fromDateTextDiv.style.display = "none";
        toDateTextDiv.style.display = "none";

    }else if (selectGroup.value === "thisyear" &&  selectCustomer.value !==" ") {
        fromDateTextDiv.style.display = "none";
        toDateTextDiv.style.display = "none";

    //     -----------------------------last year----------------------------------------
    }else if (selectGroup.value === "lastyear" &&  selectCustomer.value ==" ") {
        // income barchart data load karanwa last year eke
        let incomeBarChartData = getServiceRequest("report/incomelastyear" )
        loadIncomeBarChart(incomeBarChartData);

        // income card area eke data load karanwa last year eke
        let incomeCards = getServiceRequest("report/incomecardsthismonth?period="+ selectGroup.value )
        loadIncomeChartWithAllCustomers(incomeCards);

        //income report all customer wise data last year
        let incomeCustomerWise  = getServiceRequest("report/customerwiseincomelastyear" )
        loadIncomeChartWithCustomers(incomeCustomerWise);

        fromDateTextDiv.style.display = "none";
        toDateTextDiv.style.display = "none";

    }else if (selectGroup.value === "lastyear" &&  selectCustomer.value !==" ") {
        fromDateTextDiv.style.display = "none";
        toDateTextDiv.style.display = "none";

    //     -----------------------------custom date range----------------------------------------
    }else if (selectGroup.value === "Custom Date Range" &&  selectCustomer.value !==" ") {
        fromDateTextDiv.style.display = "";
        toDateTextDiv.style.display = "";

    }else if (selectGroup.value === "Custom Date Range" &&  selectCustomer.value ==" ") {
    fromDateTextDiv.style.display = "none";
    toDateTextDiv.style.display = "none";
    }


}

// loadIncome Bar chart
const loadIncomeBarChart = (incomeBarChartData) => {
    if (incomelineChart){
        incomelineChart.destroy();
        incomelineChart = null;
    }

    let reportDatalist = new Array();
    let data = new Array();
    let label = new Array();

    for (const index in incomeBarChartData) {
        let object = new Object();
        object.date = incomeBarChartData[index][0];
        object.totalprice = (parseFloat(incomeBarChartData[index][1] * 18/100) + parseFloat(incomeBarChartData[index][1]));

        reportDatalist.push(object);

        label.push(incomeBarChartData[index][0]);
        data.push(parseFloat(incomeBarChartData[index][1] * 18/100) + parseFloat(incomeBarChartData[index][1]));

    }

    // chart generate
    const ctx = document.getElementById('incomelineChart');
    ctx.height = 400; // Set the height to 400 pixels
    ctx.width = ctx.parentElement.offsetWidth; // Set the width to the container's width

    incomelineChart =  new Chart(ctx, {
        type: 'line',
        data: {
            labels: label,
            datasets: [{
                label: 'Income(LKR)',
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
return incomelineChart;
}

// load income chart with all customers
const loadIncomeChartWithAllCustomers = (incomeCards) => {

    totalincome.innerText = (parseFloat(incomeCards[0][1] * 18/100) + parseFloat(incomeCards[0][1])).toLocaleString('en-US', { style: 'currency', currency: 'LKR' });
    completedIncome.innerText =(parseFloat(incomeCards[0][2] * 18/100) + parseFloat(incomeCards[0][2])).toLocaleString('en-US', { style: 'currency', currency: 'LKR' });
    pendingIncome.innerText =(parseFloat(incomeCards[0][3] * 18/100) + parseFloat(incomeCards[0][3])).toLocaleString('en-US', { style: 'currency', currency: 'LKR' });
    cancellation.innerText =(parseFloat(incomeCards[0][4] * 18/100) + parseFloat(incomeCards[0][4])).toLocaleString('en-US', { style: 'currency', currency: 'LKR' });
}

//load income chart with all customers
const loadIncomeChartWithCustomers = (incomeCustomerWise) => {
    if (customerBarChart){
        customerBarChart.destroy();
        customerBarChart = null;
    }

    // Get unique dates
    const dates = [...new Set(incomeCustomerWise.map(row => row[0]))];

// Get unique customers
    const customers = [...new Set(incomeCustomerWise.map(row => row[1]))];

// Some colors for customers
    const colors = [
        '#cc0000',
        '#ff3333',
        '#ff6666',
        '#ff9999',
        '#ffcccc',
        '#800000'
    ];

    // datasets tika hadagannawa
    // Make datasets for each customer
    const datasets = customers.map((cust, i) => ({
        label: cust,
        backgroundColor: colors[i % colors.length],
        borderColor: '#ffffff',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        data: dates.map(date => {
            const match = incomeCustomerWise.find(r => r[0] === date && r[1] === cust);
            return match ? parseFloat(match[2]) : 0;
        })
    }));

    const ctx = document.getElementById('incomeBarChartCustomer');
    ctx.height = 400; // Set the height to 400 pixels
    ctx.width = ctx.parentElement.offsetWidth; // Set the width to the container's width
    customerBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: datasets,
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

   return customerBarChart;
}

//load income chart with selected customers
const loadIncomeChartWithSelectedCustomers = (customerId) => {


}