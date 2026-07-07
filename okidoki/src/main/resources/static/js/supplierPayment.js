window.addEventListener('load',()=>{

    refreshSupplierPaymentForm();
    loadSupplierPaymentTable();
})

// customer Payment table eka load karanawa
const loadSupplierPaymentTable = () => {

    let supplierPaymentList = getServiceRequest('/supplierpayment/alldata');

    const propertyList = [
        { propertyName: "bill_no", dataType: "string" },
        { propertyName: getSupplier, dataType: "function" },
        { propertyName: "due_amount", dataType: "decimal" },
        { propertyName: "total_amount", dataType: "decimal" },
        { propertyName: "current_payment", dataType: "decimal" },
        { propertyName: "balance_amount", dataType: "decimal" }
    ];


    // table data fill function
    dataFillIntoTheReportTableWithRowClick(supplierPaymentTableBody, supplierPaymentList, propertyList, supplierPaymentView, false);


    $("#supplierPaymentTable").dataTable({
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

// get customer name for table
const getSupplier = (dataOb) => {
    return dataOb.booking_id.vehicle_id.supplier_id.transportname;
}

const supplierPaymentView = (dataOb) => {
    console.log(dataOb)
    $("#supplierPaymentviewModal").modal('show');
}

// supplier payment form refresh karanawa
const refreshSupplierPaymentForm = () => {

     supplierPayment = new Object();

    // approved agreement thiyena active supplier set eka gnnw
    let supplierList = getServiceRequest('/supplier/alldatabystatuswithagreementapproved');
    dataFillIntoSelectWithTwoNames(selectSupplierName, "Select Transport Name ", supplierList, "transportname","fullname");

    // vehicle no select eka clean karanwa
    selectVehicleNo.value=" ";
    // supplier payment table body clean karanawa
    supplierPaymentBookingTableBody.innerHTML = "";

}

//supplier ta adala agreement thiyen vehicle tika gnnwa
const supplierElement = document.getElementById('selectSupplierName');
supplierElement.addEventListener('change',()=>{
    const selectSuppllier = JSON.parse(supplierElement.value);

    let vehicleListBySupplier = getServiceRequest('/vehicle/vehiclebyselectedsupplier?supplierid=' + selectSuppllier.id);
    dataFilIntoSelect(selectVehicleNo, "Select Vehicle ", vehicleListBySupplier, "vehicle_no")
})

const vehicleElement = document.getElementById('selectVehicleNo');
// vehicle select karama booking list eka load karanawa
const loadSupplierBookingListTable = ()=>{
    let selectedVehicle = JSON.parse(vehicleElement.value)
    BookingListByVehicle = getServiceRequest('/booking/byvehicleid?vehicleid=' + selectedVehicle.id);

    const propertyList = [
        { propertyName: "booking_no", dataType: "string" },
        { propertyName: getVehicleNo, dataType: "function" },
        { propertyName: "distance", dataType: "decimal" },
        { propertyName: getAmount, dataType: "function" },
    ];
    dataFillIntoTheReportTable(supplierPaymentBookingTableBody, BookingListByVehicle, propertyList);

//     calculate total amount function eka call karanwa
    totalAmountCalculation();

//balance amount ekai paid amount ekai clean karanawa
    textSupplierBalanceAmount.value = "";
    textSupplierPaidAmount.value = "";

//     style clean karanawa
    setDefault([textSupplierBalanceAmount, textSupplierPaidAmount])
}

// get vehicle no for table
const getVehicleNo = (dataOb)=>{
    return dataOb.vehicle_id.vehicle_no;
}

// get amount for table
const getAmount = (dataOb) =>{
    if (dataOb.customer_agreement_id.package_id.name == "Floating Rate") {
        return (dataOb.customer_agreement_id.package_id.package_charge_sup * dataOb.distance).toLocaleString('en-US', { style: 'currency', currency: 'LKR' });
    } else {
        return (dataOb.customer_agreement_id.package_id.package_charge_sup / 30).toLocaleString('en-US', { style: 'currency', currency: 'LKR' });
    }
    console.log(dataOb);
}

//total amount calculation
const totalAmountCalculation = (paidValue) => {
   let totalAmount = 0;
    let currentPayment = 0;
    let balanceAmount = 0;

    const bookingList = BookingListByVehicle;

    bookingList.forEach(booking => {
        if (booking.customer_agreement_id.package_id.name == "Floating Rate") {
            totalAmount += booking.customer_agreement_id.package_id.package_charge_sup * booking.distance;
        } else {
            totalAmount += booking.customer_agreement_id.package_id.package_charge_sup / 30;
        }
    });

    // currentPayment = parseFloat(document.getElementById('currentPayment').value);
    // balanceAmount = totalAmount - currentPayment;

    // value eka set karanawa supplier total amount input ekata
    document.getElementById('textSupplierTotalAmount').value = totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'LKR' });
    // supplier payamnet object ekata bind karanawa
    supplierPayment.total_amount = totalAmount;
    // value eka set karanawa supplier due amount ekata input ekata
    document.getElementById('textSupplierDueAmount').value = totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'LKR' });
    // supplier payamnet object ekata bind karanawa
    supplierPayment.due_amount = totalAmount;


}

//Calculate the balance
const supplierTotalElement = document.getElementById('textSupplierTotalAmount');
const calculateBalance = (paidValue) =>{
    let balanceAmount = 0;
    // type karana paid amount eka number valata convert karanwa
    let typePaidAmount = Number(paidValue.value);
    // total amount eke currancy format eka ayin karanawa
    let totalAmountWithoutCurrancy = textSupplierTotalAmount.value.replace(/[^0-9.-]+/g, "");
    console.log(supplierTotalElement.value)
    // total amount eka null naththan if eka true wela total amount eken paid amount eka adu wela balance eka calculate karanwa
    if (textSupplierTotalAmount.value){
        // if paid amount is greater than total amount
        if (typePaidAmount > Number(totalAmountWithoutCurrancy)) {
         balanceAmount = Number(totalAmountWithoutCurrancy) - typePaidAmount;
         supplierPayment.balance_amount =null;
         // alert box ekak display karanawa
            Swal.fire({
                title: "Paid amount is greater than total amount....",
                text: "Please check the amount.!",
                icon: "error",
                customClass :{
                    confirmButton :'btn-3d btn-3d-other'
                }
            });
            // set the balance amount to 0
            balanceAmount = 0;
            textSupplierPaidAmount.value = "";
            supplierPayment.paid_amount =null;

        // if paid amount is less than or equal to total amount
        } else if (typePaidAmount <= Number(totalAmountWithoutCurrancy)) {
            balanceAmount = Number(totalAmountWithoutCurrancy) - typePaidAmount;
            supplierPayment.balance_amount =(balanceAmount).toFixed(2);

        }
    }else{

         supplierPayment.balance_amount =balanceAmount;
    }
    textSupplierBalanceAmount.value = balanceAmount.toLocaleString('en-US', { style: 'currency', currency: 'LKR' });

}

// check errors
const checkFormError = ()=>{
    let errors = "";

    if(supplierPayment.balance_amount == null){
        errors += "Balance Amount is not calculated....";
    }
    if(!supplierPayment.paid_amount){
        errors += "Paid Amount is not Entered.........";
    }
    if(!supplierPayment.total_amount){
        errors += "Total Amount is not calculated...........";
    }
    if(!supplierPayment.due_amount){
        errors += "Due Amount is not calculated............";
    }

    return errors;
}

// form submit function
const supplierPaymentFormSubmit = () => {
    console.log(supplierPayment);
    // check form error for required element
    // check form error for required element
    let errors = checkFormError();
    if (errors == "") {
        // errors not exit
        //need to get user confirmation

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
                let postResponse = httpServiceRequest("/supplierpayment/insert", "POST", supplierPayment);
                console.log(supplierPayment);

                if (postResponse == "ok") {
                    Swal.fire({
                        title: "Saved!",
                        text: "Saved Successfully",
                        icon: "success",
                        customClass :{
                            confirmButton :'btn-3d btn-3d-other'
                        }
                    });
                    loadCustomerTable();
                    refreshCustomerForm();
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
    } else {
        Swal.fire({
            title: 'Error!',
            text: errors,
            icon: 'error',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            customClass :{
                confirmButton :'btn-3d btn-3d-other'
            }
        });
    }
    console.log(supplierPayment);

}