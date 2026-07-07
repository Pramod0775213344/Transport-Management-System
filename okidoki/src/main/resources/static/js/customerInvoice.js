window.addEventListener("load", function () {

    refresh();

    // company name tika drop down ekata fill karanawa
    let compnayNames = getServiceRequest('/customer/bycustomerstatus');
    dataFilIntoSelect(selectCustomerForInvoice, "Select Company Name", compnayNames, "company_name")
// vehicle type tika drop down ekata fill karanawa
    let vehicleTypes = getServiceRequest('/vehicletype/alldata');
    dataFilIntoSelect(selectVehicleTypeForInvoice, "Select Vehicle Type", vehicleTypes, "name")
})

// load invoice table
const loadInvoiceTable = () =>{
    const customerNameElement = document.getElementById("selectCustomerForInvoice");
    const packageTypeElement = document.getElementById("selectPackageTypeForInvoice");
    const vehicleTypeElement = document.getElementById("selectVehicleTypeForInvoice");

    customer = JSON.parse(customerNameElement.value);
    vehicleType = JSON.parse(vehicleTypeElement.value)
    packageType = packageTypeElement.value;

    // booking list eka gnnw select karana customer saha package type eka saha vehicle type eka matha
    bookinglist = getServiceRequest("/booking/bycustomerid?customerid=" + customer.id+ "&packagesType=" +packageType + "&vehicleTypeid=" + vehicleType.id);
    console.log("1", bookinglist);

    const propertyList = [
        { propertyName: "booking_no", dataType: "string" },
        { propertyName: getCustomer, dataType: "function" },
        { propertyName: "distance", dataType: "string" },
        { propertyName: getAmount, dataType: "function" },
    ];

//     floating rate booking invoice table body
if (packageType === "Floating Rate") {
    // table ekata data fill karana function eka
    fillDataIntoInvoiceTable(customerPaymentTableInvoiceBody, bookinglist, propertyList, invoiceForm);
    floatingRateBookingInvoiceGenerateButton.style.display = "";
    fixRateBookingInvoiceGenerateButton.style.display = "none";

}else{
    // table ekata data fill karana function eka
    dataFillIntoTheReportTable(customerPaymentTableInvoiceBodyFixedRate, bookinglist, propertyList);
    fixRateBookingInvoiceGenerateButton.style.display = "";
    floatingRateBookingInvoiceGenerateButton.style.display = "none";
}

    // table eka initialize karanawa
    $("#customerPaymentInvoiceTable").dataTable({
        "createdRow": function(row, data, dataIndex) {
            $(row).find("td").css({
                "text-align": "center",
                "height": "80px"
            });
        },
        "headerCallback": function(thead, data, start, end, display) {
            $(thead).find("th").css({
                "text-align": "center",
                "padding": "20px"
            });
        }
    });
    $("#customerPaymentInvoiceTableFixedRate").dataTable({
        "createdRow": function(row, data, dataIndex) {
            $(row).find("td").css({
                "text-align": "center",
                "height": "80px"
            });
        },
        "headerCallback": function(thead, data, start, end, display) {
            $(thead).find("th").css({
                "text-align": "center",
                "padding": "20px"
            });
        }
    });

}

// customer change karaddi data table eka clear karanawa
selectCustomerForInvoice.addEventListener("change", function () {

});

// package type change karaddi data table eka clear karanawa
selectPackageTypeForInvoice.addEventListener("change", function () {
    $('#customerPaymentInvoiceTable').DataTable().clear().destroy();
    $('#customerPaymentInvoiceTableFixedRate').DataTable().clear().destroy();
    //  clear the customer payment object
    customerPayment = {};
    customerPayment.bookings = [];

    loadInvoiceTable();
})

// vehicle type change karaddi data table eka clear karanawa
selectVehicleTypeForInvoice.addEventListener("change", function () {
    $('#customerPaymentInvoiceTable').DataTable().clear().destroy();
    $('#customerPaymentInvoiceTableFixedRate').DataTable().clear().destroy();

    //  clear the customer payment object
    customerPayment = {};
    customerPayment.bookings = [];

    loadInvoiceTable();
})

// get cutomer name
const getCustomer = (dataOb) => {
    return dataOb.customer_id.company_name;
}

// get total amount
const getAmount = (dataOb) => {

    if (dataOb.customer_agreement_id.package_id.name == "Floating Rate") {
        return (dataOb.customer_agreement_id.package_id.package_charge_cus * dataOb.distance).toLocaleString('en-US', { style: 'currency', currency: 'LKR' });
    } else {
        return (dataOb.customer_agreement_id.package_id.package_charge_cus / 30).toLocaleString('en-US', { style: 'currency', currency: 'LKR' });
    }

}

// all bookings list eke payment generate karanawa
const inovoicGenearteButtonForFloatingRate = () => {
    console.log(customerPayment);
    let userConfirm = Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, save it!",
        allowOutsideClick: false,
        customClass :{
            cancelButton :'btn-3d btn-3d-cancel',
            confirmButton :'btn-3d btn-3d-submit'
        }

    }).then((userConfirm) => {
        if (userConfirm.isConfirmed) {
            //call post service
            let postResponse = httpServiceRequest("/customerpayment/insert", "POST", customerPayment);
            if (postResponse == "ok") {
                Swal.fire({
                    title: "Saved!",
                    text: "Saved Successfully",
                    icon: "success",
                    customClass :{
                        confirmButton :'btn-3d btn-3d-other'
                    }
                });
                // booking array list eka cutomer payamnet objet ekata push karanwa

                // load invoice table
                loadInvoiceTable();
                printInvoice();
                refresh();
                //    modal eka close karanawa
                $("#invoiceviewform").modal('hide');

            } else {
                Swal.fire({
                    title: "Failed to Submit....?",
                    text: postResponse,
                    icon: "question",
                    customClass :{
                        confirmButton :'btn-3d btn-3d-other'
                    }
                });
            }
        } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: "Cancelled",
                text: "Details not Saved!",
                icon: "error",
                customClass :{
                    confirmButton :'btn-3d btn-3d-other'
                }
            });
        }
    });

}

// invoice generate button for fixrate packages
const inovoiceGenearteButtonForFixRate = () => {
    console.log(customerPayment);

        let userConfirm = Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, save it!",
            allowOutsideClick: false,
            customClass :{
                cancelButton :'btn-3d btn-3d-cancel',
                confirmButton :'btn-3d btn-3d-submit'
            }

        }).then((userConfirm) => {
            if (userConfirm.isConfirmed) {
                //call post service
                let postResponse = httpServiceRequest("/customerpayment/insert", "POST", customerPayment);
                if (postResponse == "ok") {
                    Swal.fire({
                        title: "Saved!",
                        text: "Saved Successfully",
                        icon: "success",
                        customClass :{
                            confirmButton :'btn-3d btn-3d-other'
                        }
                    });
                    loadInvoiceTable();
                    printInvoiceFixRate();
                    refresh();
                //    modal eka open nam close karanawa
                    if ($("#invoiceviewform").hasClass('show')) {
                    $("#invoiceviewform").modal('hide');
                    }if($("#allInvoicemodal").hasClass('show')) {
                    $("#allInvoicemodal").modal('hide');
                    }
                } else {
                    Swal.fire({
                        title: "Failed to Submit....?",
                        text: postResponse,
                        icon: "question",
                        customClass :{
                            confirmButton :'btn-3d btn-3d-other'
                        }
                    });
                }
            } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
                Swal.fire({
                    title: "Cancelled",
                    text: "Details not Saved!",
                    icon: "error",
                    customClass :{
                        confirmButton :'btn-3d btn-3d-other'
                    }
                });
            }
        });

}

// print view eka floating rate booking invoice ekata
const printInvoice = () =>{
    let newWindow = window.open();
    let preview = "<html><head><title>TMS</title><link rel='stylesheet' href='/css/customerInvoice.css'><link rel='stylesheet' href='/bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'><script src='/bootstrap/bootstrap-5.2.3/js/bootstrap.bundle.min.js'></script></head><body>" +
        "<div class='row'><div class='col-12'>" + singleBookingInvoice.outerHTML + "</div></div></body></html>";

    newWindow.document.write(preview);

    setTimeout(()=>{
        newWindow.stop();
        newWindow.print();
        newWindow.close();
    },500)
}

// print view eka fix rate booking invoice ekata
const printInvoiceFixRate = () =>{
    let newWindow = window.open();
    let preview = "<html><head><title>TMS</title><link rel='stylesheet' href='/css/customerInvoice.css'><link rel='stylesheet' href='/bootstrap/bootstrap-5.2.3/css/bootstrap.min.css'><script src='/bootstrap/bootstrap-5.2.3/js/bootstrap.bundle.min.js'></script></head><body>" +
        "<div class='row'><div class='col-12'>" + fixrateBookingInvoice.outerHTML + "</div></div></body></html>";

    newWindow.document.write(preview);

    setTimeout(()=>{
        newWindow.stop();
        newWindow.print();
        newWindow.close();
    },500)
}

//single  invoice form view function for floating rate
const invoiceForm = (dataOb) => {
    $("#invoiceviewform").modal('show');
    console.log(dataOb);
    // booking data object eka customerPayment object eke arraye list ekata bind karanawa
    customerPayment.bookings = [dataOb];

    viewBookingNo.innerText = dataOb.booking_no;

    // booking date eka display karanawa
    let bookingDate = new Date(dataOb.pickup_date_time);
    viewBookingDate.innerText = bookingDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    // current date eka display karanawa
    let currentDate = new Date();
     // yyyy-mm-dd
    customerPayment.bill_date = currentDate.toISOString().slice(0, 10);
    // current date eka display karanawa
    viewCurrentDate.innerText = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });


    viewCustomername.innerText = dataOb.customer_id.company_name;
    viewCustomerAddress.innerText = dataOb.customer_id.company_address;
    viewCustomerEmail.innerText = dataOb.customer_id.direct_email_no;
    viewCustomerMobile.innerText = dataOb.customer_id.direct_telephone_no;

    viewDistanceQuantity.innerText = dataOb.distance
    viewDistanceRate.innerText = dataOb.customer_agreement_id.package_id.package_charge_cus;

    console.log(dataOb.customer_agreement_id.package_id.package_type)

    // package type eka floatong rate nam meka wada karanawa
    if (dataOb.customer_agreement_id.package_id.package_type === 'Floating Rate') {
        // package type is floating rate
        const pkg = dataOb.customer_agreement_id.package_id;
        // ditance eka gnnw
        const distance = dataOb.distance;

        // customer charge eka gnnw distance ekata adalawa
        const distanceTotal = pkg.package_charge_cus * distance;

        // lkr ekata convert karala display karannawa
        viewDistanceTotal.innerText = distanceTotal.toLocaleString('en-US', { style: 'currency', currency: 'LKR' });

        // invoice total ekata distance eke total eka add karanawa
        let invoiceTotal = distanceTotal;
        //  tax total eka already 0 kiyala gnnw
        let taxTotal = 0;

        // distance total ekama sub total eka widihata display karanawa
            subtotalValue.innerText = distanceTotal.toLocaleString('en-US', { style: 'currency', currency: 'LKR' });
            // tax total eka calculate karanawa
            taxTotal = distanceTotal * 0.18;
        // tax total eka display karanawa
        taxValue.innerText = taxTotal.toLocaleString('en-US', { style: 'currency', currency: 'LKR' });
        // invoice total ekata tax total eka add karanawa
        const fullTotalWithTax = invoiceTotal + taxTotal;
        lastTotalValue.innerText = fullTotalWithTax.toLocaleString('en-US', { style: 'currency', currency: 'LKR' });
        customerPayment.total_amount = fullTotalWithTax;
        customerPayment.due_amount = fullTotalWithTax;
    }

    // package type eka not Fix rate nam meka wada karanawa
    if (dataOb.customer_agreement_id.package_id.package_type === 'Fix Rate') {

        // package type is fix rate
        const pkg = dataOb.customer_agreement_id.package_id;

        // customer charge eka gnnw
        const customerCharge = pkg.package_charge_cus;

        // lkr ekata convert karala display karannawa
        viewDistanceTotal.innerText = customerCharge.toLocaleString('en-US', { style: 'currency', currency: 'LKR' });

        // invoice total ekata customer charge eka add karanawa
        let invoiceTotal = customerCharge;
        //  tax total eka already 0 kiyala gnnw
        let taxTotal = 0;

        // customer charge ekama sub total eka widihata display karanawa
            subtotalValue.innerText = customerCharge.toLocaleString('en-US', { style: 'currency', currency: 'LKR' });
            // tax total eka calculate karanawa
            taxTotal = customerCharge * 0.18;
        // tax total eka display karanawa
        taxValue.innerText = taxTotal.toLocaleString('en-US', { style: 'currency', currency: 'LKR' });
        // invoice total ekata tax total eka add karanawa
        const fullTotalWithTax = invoiceTotal + taxTotal;
        lastTotalValue.innerText = fullTotalWithTax.toLocaleString('en-US', { style: 'currency', currency: 'LKR' });
        customerPayment.total_amount = fullTotalWithTax;
        customerPayment.due_amount = fullTotalWithTax;

    }

    // modal eka open weddi invoice no eka auto generate karanawa
    createInvoiceNo();
    // invoice no eka display karanawa
    viewInvoiceNo.innerText = customerPayment.bill_no;
}

// form refresh function eka
const refresh = () => {

    customerPayment = new Object();
    customerPayment.bookings = new Array();


    fixRateBookingInvoiceGenerateButton.style.display = "none";
    floatingRateBookingInvoiceGenerateButton.style.display = "none";

    // invoice no eka generate karan function eka
     paymentsList = getServiceRequest("customerpayment/alldata")

    $('#customerPaymentInvoiceTable').DataTable().clear();
    $('#customerPaymentInvoiceTableFixedRate').DataTable().clear();


}

// me table ekata data fill karana function eka
const fillDataIntoInvoiceTable = (tableBodyId, dataList, propertyList, editFunction, buttonVisibility = true) => {

    tableBodyId.innerHTML = "";

    dataList.forEach((dataob, index) => {
        let tr = document.createElement("tr");

        let tdIndex = document.createElement("td");
        tdIndex.innerHTML = parseInt(index) + 1;
        tr.appendChild(tdIndex);

        for (const property of propertyList) {
            let td = document.createElement("td");

            if (property.dataType == "string") {
                td.innerText = dataob[property.propertyName];
            }
            if (property.dataType == "function") {
                td.innerHTML = property.propertyName(dataob);
            }
            tr.appendChild(td);
        }
        //Button list

        let tdButton = document.createElement("td");

        let button = document.createElement("button");
        button.className = "btn-3d btn-3d-submit";
        button.innerHTML = "<i class='fa-solid fa-file-invoice me-2'></i> Generate Invoice"
        // if you want to open button with clicking the row.you should change the button.onclick to tr.onclick
        button.onclick = () => {
            editFunction(dataob, index);
            window['editOb'] = dataob;
            window['editRowIndex'] = index;
        };

        tdButton.appendChild(button);

        if (buttonVisibility) {
            tr.appendChild(tdButton)
        }

        tableBodyId.appendChild(tr);

    });
}

const createInvoiceNo = () =>{
    // get the last invoice from the payments list
    // Ex:- INV-2025-0000001
    console.log(paymentsList)
    if (paymentsList.length === 0) {
        // if there is no payments, set the invoice number to INV-2025-0000001
        customerPayment.bill_no = `INV-${new Date().getFullYear()}-000001`;
        console.log(customerPayment.bill_no);
        return customerPayment.bill_no;

    }else {
        // paymentsList eka front end ekata enne desinding widihata.eka nisa previous invoice number eka thiyenne 0 index eke
        let previousInvoice = paymentsList[0];
        console.log(previousInvoice);
        const previousInvoiceNo = previousInvoice.bill_no;
        console.log(previousInvoiceNo);

        let numberPartOfInvoiceNo = parseInt(previousInvoiceNo.slice(-6))
        console.log(numberPartOfInvoiceNo);
        // increment the number part by 1
        numberPartOfInvoiceNo += 1;
        // create the new invoice number
        const newInvoiceNo = `INV-${new Date().getFullYear()}-${numberPartOfInvoiceNo.toString().padStart(6, '0')}`;
        // set the new invoice number to the payment object
        customerPayment.bill_no = newInvoiceNo;
        console.log(newInvoiceNo);
        return newInvoiceNo;
    }


}


//all the payment invoice load
const bookingSummary = document.getElementById("bookingsSumary");

//-----------------------------------------------floating Rate--------------------------------------------------------------
// floating rate booking invoice form view function and bind the data to the object
const allBookingInvoice = () => {
    bookingSummary.innerHTML = "";
    bookinglist.forEach((booking) => {
        const div = document.createElement("div");
        div.innerHTML =
            `<div class="d-flex justify-content-between align-items-center mb-4 mt-2 border-bottom">
                <p class="mb-1">Booking No: <strong>${booking.booking_no}</strong></p>
                <p class="mb-1">Booking Date: <strong>${new Date(booking.pickup_date_time).toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            })}</strong></p>
            </div>
            <!-- Table -->
            <div class="table-responsive mb-4">
                <table class="table table-bordered text-center align-middle">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Distance</th>
                            <th>Rate/km</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Booking Distance</td>
                            <td>${booking.distance}</td>
                            <td>${booking.customer_agreement_id.package_id.package_charge_cus}</td>
                            <td>${(booking.customer_agreement_id.package_id.package_type === 'Floating Rate'
                    ? (booking.customer_agreement_id.package_id.package_charge_cus * booking.distance)
                    : (booking.customer_agreement_id.package_id.package_charge_cus / 30)
            ).toLocaleString('en-US', { style: 'currency', currency: 'LKR' })}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- Summary -->
            <div class="row">
                <div class="col-md-6">
                </div>
                <div class="col-md-6">
                    <div class="total-box">
                        <p>Subtotal: <span class="ms-4">${(booking.customer_agreement_id.package_id.package_type === 'Floating Rate'
                    ? (booking.customer_agreement_id.package_id.package_charge_cus * booking.distance)
                    : (booking.customer_agreement_id.package_id.package_charge_cus / 30)
            ).toLocaleString('en-US', { style: 'currency', currency: 'LKR' })}</span></p>
                        <p>Tax (18%): <span class="ms-4">${(
                (booking.customer_agreement_id.package_id.package_type === 'Floating Rate'
                        ? (booking.customer_agreement_id.package_id.package_charge_cus * booking.distance)
                        : (booking.customer_agreement_id.package_id.package_charge_cus / 30)
                ) * 0.18
            ).toLocaleString('en-US', { style: 'currency', currency: 'LKR' })}</span></p>
                        <p><strong>Total: <span class="ms-4">${(
                (booking.customer_agreement_id.package_id.package_type === 'Floating Rate'
                        ? (booking.customer_agreement_id.package_id.package_charge_cus * booking.distance)
                        : (booking.customer_agreement_id.package_id.package_charge_cus / 30)
                ) * 1.18
            ).toLocaleString('en-US', { style: 'currency', currency: 'LKR' })}</span></strong></p>
                    </div>
                </div>
            </div>`;
        bookingSummary.appendChild(div);

        // add the booking to the customer payment object eke bookings array ekata
        customerPayment.bookings.push(booking);
    });

    // total invoice amount eka saha tax amount eka calculate karanawa
    let totalAmount = 0;
    let totalTax = 0;
    bookinglist.forEach((booking) => {
        if (booking.customer_agreement_id.package_id.package_type === 'Floating Rate') {
            totalAmount += booking.customer_agreement_id.package_id.package_charge_cus * booking.distance;
            totalTax += (booking.customer_agreement_id.package_id.package_charge_cus * booking.distance) * 0.18;
        } else {
            totalAmount += booking.customer_agreement_id.package_id.package_charge_cus / 30;
            totalTax += (booking.customer_agreement_id.package_id.package_charge_cus / 30) * 0.18;
        }

    });


//     display total amount and tax amount
    const summaryDiv = document.createElement("div");
    summaryDiv.className = "row mt-4 border-top pt-3";
    const paymentSummaryCol = document.createElement("div");
    paymentSummaryCol.className = "col-md-6";
    paymentSummaryCol.innerHTML = `
        <div class="section-title">Bank Account Details</div>
         <p class="mb-1">Bank Name: <strong id="viewPaymentMethod">People's Bank</strong></p>
         <p class="mb-1">Branch No: <strong >Ward Place</strong></p>
         <p class="mb-1">Account No: <strong id="viewPaymentStatus">239-2-451-89121-1215</strong></p>
         <p class="mb-1">When are you making payment through the bank please enter Invoice No as Reference</p>
    `;
    const totalDivCol = document.createElement("div");
    totalDivCol.className = "col-md-6 text-end total-box mt-5";
    totalDivCol.innerHTML = `
        <h5 ><span class="fw-bold mt-4">Total Tax (18%):</span> <span class="text-danger">${totalTax.toLocaleString('en-US', { style: 'currency', currency: 'LKR' })}</span></h5>
        <h5 ><span class="fw-bold">Total Amount: </span> <span class="text-success ">${totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'LKR' })}</span></h5>
    `;
    summaryDiv.appendChild(paymentSummaryCol);
    summaryDiv.appendChild(totalDivCol);
    bookingSummary.appendChild(summaryDiv);

//     object ekata bind karanwa total value eka
    customerPayment.total_amount = totalAmount + totalTax;
    customerPayment.due_amount = totalAmount + totalTax;

    // modal eka open weddi invoice no eka auto generate karanawa
    createInvoiceNo();
    // invoice no eka display karanawa
    viewAllBookingInvoiceNo.innerText = customerPayment.bill_no;
    viewAllBookingCurrentDate.innerText = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
//     date eka object ekata bind karanwa
    customerPayment.bill_date = new Date().toISOString().slice(0, 10);

}

//-----------------------------------------------fixrate--------------------------------------------------------------
// fixed rate booking invoice form view function and bind the data to the object
const invoiceFixedRateTableBodyElememt = document.getElementById("invoiceFixedRateTableBody");
const allBookingInvoiceFixRate = () => {

    invoiceFixedRateTableBodyElememt.innerHTML = "";

    // total booking distance variable
    let totalDistance = 0;

    bookinglist.forEach((booking, index) => {
        // Set the customer details in the view of the invoice
        viewCustomernameFixedRate.innerText = booking.customer_id.company_name;
        viewCustomerAddressFixedRate.innerText = booking.customer_id.company_address;
        viewCustomerEmailFixedRate.innerText = booking.customer_id.direct_email_no;
        viewCustomerMobileFixedRate.innerText = booking.customer_id.direct_telephone_no;

        // -----------------------------------------------------------------------------
        // Create a new table row
        const tr = document.createElement("tr");
        // Index cell
        const tdIndex = document.createElement("td");
        tdIndex.innerText = index + 1;
        tr.appendChild(tdIndex);

        // Booking No
        const tdBookingNo = document.createElement("td");
        tdBookingNo.innerText = booking.booking_no;
        tr.appendChild(tdBookingNo);

        // Booking Date
        const tdBookingDate = document.createElement("td");
        tdBookingDate.innerText = new Date(booking.pickup_date_time).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        tr.appendChild(tdBookingDate);

        // Company Name
        const tdCompanyName = document.createElement("td");
        tdCompanyName.innerText = booking.distance + " km";
        tr.appendChild(tdCompanyName);

        invoiceFixedRateTableBodyElememt.appendChild(tr);

        // add the booking to the customer payment object eke bookings array ekata
        customerPayment.bookings.push(booking);
    //     ---------------------------------------------------------------------

        totalDistance += parseFloat(booking.distance).toFixed(2)*1;
        console.log(parseFloat(totalDistance));
        console.log(booking.customer_agreement_id.package_id.distance);

        packageAmount = booking.customer_agreement_id.package_id.package_charge_cus;


        if (totalDistance > booking.customer_agreement_id.package_id.distance) {
            // add text to summary and remove border line
            const summaryNameRow = document.createElement("tr");
            summaryNameRow.innerHTML = `<td colspan="4" class="text-center fw-bold mt-4 mb-3" style="border: none;">Summary</td>`;
            invoiceFixedRateTableBodyElememt.appendChild(summaryNameRow);

            // addtional km ganan calculate karanawa
            let additionalDistance = totalDistance - booking.customer_agreement_id.package_id.distance;
            console.log("additional distance", additionalDistance);


            //amount eka calculate karanawa
             additionalDistanceAmount = Number(additionalDistance) * Number(booking.customer_agreement_id.package_id.additinal_km_charge_cus);
            console.log(additionalDistanceAmount)
            // additional distance amount eka display karanawa thiyenw nam


            // package distance eka view karanwa
            const packageDistanceRow = document.createElement("tr");
            packageDistanceRow.innerHTML = `<td colspan="3" class="text-center fw-bold">
                Package Distance:</td>
                <td colspan="1">${booking.customer_agreement_id.package_id.distance} km</td>`;
            invoiceFixedRateTableBodyElememt.appendChild(packageDistanceRow);


            // row eka create karala view karanwa additional km
            const additionalDistanceRow = document.createElement("tr");
            additionalDistanceRow.innerHTML = `<td colspan="3" class="text-center fw-bold">Additional Distance:</td>
                <td colspan="1">${additionalDistance} km</td>`;
            invoiceFixedRateTableBodyElememt.appendChild(additionalDistanceRow);

        }else{

        }


    });

    // total distance row eka create karala view karanwa
    const totalDistanceRow = document.createElement("tr");
    totalDistanceRow.innerHTML = `<td colspan="3" class="text-center fw-bold">Total Distance:</td>
            <td colspan="1" class="fw-bold">${totalDistance} km</td>`;
    invoiceFixedRateTableBodyElememt.appendChild(totalDistanceRow);

    if (totalDistance > bookinglist[bookinglist.length - 1].customer_agreement_id.package_id.distance) {
        // additional km chargers saha total amount eka calculate karanawa
        // add text to summary and remove border
        const paymentSummaryNameRow = document.createElement("tr");
        paymentSummaryNameRow.innerHTML = `<td colspan="4" class="text-center fw-bold mt-4 mb-3" style="border: none;">Payment Summary</td>`;
        invoiceFixedRateTableBodyElememt.appendChild(paymentSummaryNameRow);

        // Additonal Distance distance row eka create karala view karanwa
        const totaladditionalDistanceAmount = document.createElement("tr");
        totaladditionalDistanceAmount.innerHTML = `<td colspan="3" class="text-center fw-bold" id="additionalDistanceRowAmount">Additional Distance Amount :</td>
            <td colspan="1" class="fw-bold">${additionalDistanceAmount.toLocaleString('en-US', { style: 'currency', currency: 'LKR' })} </td>`;
        invoiceFixedRateTableBodyElememt.appendChild(totaladditionalDistanceAmount);

        // package distance Row eka
        const totalPackageAmount = document.createElement("tr");
        totalPackageAmount.innerHTML = `<td colspan="3" class="text-center fw-bold">Package Amount :</td>
            <td colspan="1" class="fw-bold">${packageAmount.toLocaleString('en-US', { style: 'currency', currency: 'LKR' })} </td>`;
        invoiceFixedRateTableBodyElememt.appendChild(totalPackageAmount);

        //     subtotal eka calculate karanawa
        const subtotalAmount = additionalDistanceAmount + packageAmount;
        // subtotal eka display karanawa
        subtotalValueFixedRate.innerText = subtotalAmount.toLocaleString('en-US', { style: 'currency', currency: 'LKR' });


        // tax total eka calculate karanawa
        const taxTotal = subtotalAmount * 0.18;
        // tax total eka display karanawa
        taxValueFixedRate.innerText = taxTotal.toLocaleString('en-US', { style: 'currency', currency: 'LKR' });


        // final total eka calculate karanawa
        const finalTotal = subtotalAmount + taxTotal;
        // final total eka display karanawa
        lastTotalValueFixedRate.innerText = finalTotal.toLocaleString('en-US', { style: 'currency', currency: 'LKR' });

        // object ekata bind karanawa total value eka
        customerPayment.total_amount = finalTotal;
        customerPayment.due_amount = finalTotal;

    } else {
        // add text to summary and remove border
        const paymentSummaryNameRow = document.createElement("tr");
        paymentSummaryNameRow.innerHTML = `<td colspan="4" class="text-center fw-bold mt-4 mb-3" style="border: none;">Payment Summary</td>`;
        invoiceFixedRateTableBodyElememt.appendChild(paymentSummaryNameRow);

        // package distance Row eka
        const totalPackageAmount = document.createElement("tr");
        totalPackageAmount.innerHTML = `<td colspan="3" class="text-center fw-bold">Package Amount :</td>
            <td colspan="1" class="fw-bold">${packageAmount.toLocaleString('en-US', { style: 'currency', currency: 'LKR' })} </td>`;
        invoiceFixedRateTableBodyElememt.appendChild(totalPackageAmount);

        //     subtotal eka calculate karanawa
        const subtotalAmount =  packageAmount;
        // subtotal eka display karanawa
        subtotalValueFixedRate.innerText = subtotalAmount.toLocaleString('en-US', { style: 'currency', currency: 'LKR' });

        // tax total eka calculate karanawa
        const taxTotal = subtotalAmount * 0.18;
        // tax total eka display karanawa
        taxValueFixedRate.innerText = taxTotal.toLocaleString('en-US', { style: 'currency', currency: 'LKR' });

        // final total eka calculate karanawa
        const finalTotal = subtotalAmount + taxTotal;
        // final total eka display karanawa
        lastTotalValueFixedRate.innerText = finalTotal.toLocaleString('en-US', { style: 'currency', currency: 'LKR' });

        // object ekata bind karanawa total value eka
        customerPayment.total_amount = finalTotal;
        customerPayment.due_amount = finalTotal;

        // modal eka open weddi invoice no eka auto generate karanawa
        createInvoiceNo();
        // invoice no eka display karanawa
        viewInvoiceNoFixedRate.innerText = customerPayment.bill_no;
        viewCurrentDateFixedRate.innerText = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        //     date eka object ekata bind karanwa
        customerPayment.bill_date = new Date().toISOString().slice(0, 10);
    }
}

// function for clear the objects
const clearCustomerPaymentObject = () => {
    customerPayment = {};
    customerPayment.bookings = [];
}
