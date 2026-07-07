window.addEventListener('load',()=>{

    refreshCustomerPaymentForm();
    loadCustomerPaymentTable();
})

// customer Payment table eka load karanawa
const loadCustomerPaymentTable = () => {

    let customerPaymentList = getServiceRequest('/customerpayment/alldata');

    const propertyList = [
        { propertyName: "bill_no", dataType: "string" },
        { propertyName: "due_amount", dataType: "decimal" },
        { propertyName: "total_amount", dataType: "decimal" },
        { propertyName: "current_payment", dataType: "decimal" },
        { propertyName: "balance_amount", dataType: "decimal" },
        { propertyName: "bill_date", dataType: "string" }
    ];


    // table data fill function
    dataFillIntoTheReportTableWithRowClick(paymentTableBody, customerPaymentList, propertyList, customerPaymentAdd, false);


    $("#paymentTable").dataTable({
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

// payment form eke modal eka open karala properties input walata assigning karanawa
const customerPaymentAdd = (dataOb) => {
    $("#paymentModal").modal('show');
    textInvoiceNo.value = dataOb.bill_no ;
    textInvoiceDate.value = dataOb.bill_date ;
    textTotalAmount.value =(dataOb.total_amount).toLocaleString('en-US', { style: 'currency', currency: 'LKR' }) ;

    // currunt payment null name nam due payment eka enna oni kali  due eken curruntpaymnent eka adu wela
    if (dataOb.current_payment != null) {
        customerPayment.current_payment = parseFloat(dataOb.current_payment);

        // due amount eka hadenna oni total amount eken current payment eka adu wela
        textDueAmount.value = (parseFloat(dataOb.due_amount)-parseFloat(dataOb.current_payment)).toLocaleString('en-US', { style: 'currency', currency: 'LKR' });
    }else{
        textCurrentAmount.value = "";
        customerPayment.current_payment = null;
        textDueAmount.value = (dataOb.due_amount).toLocaleString('en-US', { style: 'currency', currency: 'LKR' });
    }

    customerPayment = JSON.parse(JSON.stringify(dataOb));
    oldcustomerPayment = JSON.parse(JSON.stringify(dataOb));

    console.log("Update", customerPayment);
    console.log("Old Update", oldcustomerPayment);


}

// check form update
const formUpdateCheck = () => {
    let updates = "";
    if (customerPayment != null && oldcustomerPayment != null) {
        if (customerPayment.current_payment != oldcustomerPayment.current_payment) {
            updates += "Total amount is changed..... ";
        }
        if (customerPayment.method != oldcustomerPayment.method) {
            updates += "Due amount is changed..... ";
        }
        if (customerPayment.balance_amount != oldcustomerPayment.balance_amount) {
            updates += "balance amount is changed..... ";
        }
        if (customerPayment.chequePaymentList.length != oldcustomerPayment.chequePaymentList.length) {
            updates += "Cheque Payment List is changed..... ";
        }
        if (customerPayment.interBankTransferPaymentList.length != oldcustomerPayment.interBankTransferPaymentList.length) {
            updates += "Inter Bank Transfer Payment List is changed..... ";
        }
    }

    return updates;
}

// customer payment submit button
const customerPaymentPaidButton = () => {
    console.log(customerPayment)
    let updates = formUpdateCheck();
    // updates not exit
    if (updates == "") {

    }else{
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
                let postResponse = httpServiceRequest("/customerpayment/update", "PUT", customerPayment);
                if (postResponse == "ok") {
                    Swal.fire({
                        title: "Saved!",
                        text: "Saved Successfully",
                        icon: "success",
                        customClass :{
                            confirmButton :'btn-3d btn-3d-other'
                        }
                    });
                    loadCustomerPaymentTable();
                    refreshCustomerPaymentForm();

                //     modal eka hide karanawa
                    $("#paymentModal").modal('hide');

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




}

// payment method select karana element eka
const paymentMethodSelect = (ElementValue)=>{

    if (ElementValue.value === "Cash"){
        methodOfCash.style.display = "block";
        methodOfCheque.style.display = "none";
        methodOfIbt.style.display = "none"

    } else if(ElementValue.value ==="Cheque"){
        methodOfCash.style.display = "none";
        methodOfCheque.style.display = "block";
        methodOfIbt.style.display = "none"

    }else if(ElementValue.value === "Inter Bank Transfer(IBT)") {
        methodOfCash.style.display = "none";
        methodOfCheque.style.display = "none";
        methodOfIbt.style.display = "block"
    }else{
        methodOfCash.style.display = "none";
        methodOfCheque.style.display = "none";
        methodOfIbt.style.display = "none"
    }
};

// refresh karanawa form eka
const refreshCustomerPaymentForm = () => {

    customerPayment = new Object();

    customerPayment.chequePaymentList = new Array();
    customerPayment.interBankTransferPaymentList = new Array();

    setDefault([selectPaymentMethod,textBalanceAmount,textCurrentAmount]);

    selectPaymentMethod.value = "";
    textCurrentAmount.value = "";
    textBalanceAmount.value = "";
    textCurrentTypeAmount.value = "";
    customerPayment.current_payment = null;
    customerPayment.balance_amount = null;

    // refresh weddi payment method hide karala thiyanna oni
    methodOfCash.style.display = "none";
    methodOfCheque.style.display = "none";
    methodOfIbt.style.display = "none"

    refreshChequePaymentInnerForm();
    refreshIbtPaymentInnerForm();
}

// inner form table body eka saha input clear karanawa payment method change karaddi
const innerFormTableBodyClear = ( ) =>{
    refreshChequePaymentInnerForm();
    refreshIbtPaymentInnerForm();
    // inner form table body eka clear karanawa
    innerChequeTableBody.innerHTML = "";
    innerIbtTableBody.innerHTML = "";
    textCurrentAmount.value = "";
    textBalanceAmount.value = "";

    // type eka change weedi validation color remove wenna oni
    textCurrentAmount.classList.remove("is-invalid");
    textCurrentAmount.classList.remove("is-valid");
    textBalanceAmount.classList.remove("is-invalid");
    textBalanceAmount.classList.remove("is-valid");



}

// -------------------------------------cash Payment Method ---------------------------------------------------------

// payment method eka cash kiyala select karala type karaddi paid amount eka auto fill wenawa
const paymentMethodCash = (input) => {
    const paidAmount = parseFloat(input.value);

    const dueAmount = parseFloat(document.getElementById('textDueAmount').value.replace(/[^0-9.-]+/g, ""));

    // currancy fromat ekata change karanwa
    textCurrentAmount.value = paidAmount.toLocaleString('en-US', { style: 'currency', currency: 'LKR' });
    customerPayment.current_payment = paidAmount.toFixed(2);

    // Calculate and set balance
    const balance = dueAmount - paidAmount;
    textBalanceAmount.value = balance.toLocaleString('en-US', { style: 'currency', currency: 'LKR' }) ;
    customerPayment.balance_amount = balance.toFixed(2);
    if (paidAmount > dueAmount) {
        // If paid amount is greater than due amount wennath ba
        Swal.fire({
            title: "Error!",
            text: "Paid amount cannot be greater than due amount.",
            icon: "error",
            confirmButtonText: "OK",
            allowOutsideClick: false,
            customClass: {
                confirmButton: 'btn-3d btn-3d-other'
            }
        });
        textCurrentAmount.value = "";
        textBalanceAmount.value = "";
        textCurrentTypeAmount.value = "";

    } else if (paidAmount < 0) {
        // paid amount eka negative num ekak wenna ba
        Swal.fire({
            title: "Error!",
            text: "Paid amount cannot be negative.",
            icon: "error",
            confirmButtonText: "OK",
            allowOutsideClick: false,
            customClass: {
                confirmButton: 'btn-3d btn-3d-other'
            }
        });
    }


    if (input.value === "" || parseFloat(input.value) === 0) {
        // Clear paid and balance amounts if input is empty or zero
        textBalanceAmount.value = "";
        textCurrentAmount.value = "";

        // null pass karanaw
        customerPayment.current_payment =null;
        customerPayment.balance_amount = null;

        // Remove validation classes
        setDefault([textCurrentAmount,textBalanceAmount]);
    }

}

//----------------------------------------Cheque Payment Method inner Form---------------------------------------------

const refreshChequePaymentInnerForm = () => {

    chequePayment = new Object();

    // input clean wenna oni
    textChequeAmount.value ="";
    textChequeNo.value ="";
    textChequeDate.value="";

    // validation deafult value ekata gnnw
    setDefault([textChequeAmount,textChequeNo,textChequeDate]);

//     referesh Inner Table
    const propertyList = [
        { propertyName: "cheque_no", dataType: "string" },
        { propertyName: "cheque_amount", dataType: "decimal" },
        { propertyName: "cheque_date", dataType: "string" }
    ];

    dataFillIntoTheInnerTable(innerChequeTableBody, customerPayment.chequePaymentList , propertyList, chequePaymentEdit, chequePaymentDelete, true);

    // cheque inner form eke button handling
    updateButtonChequeInnerForm.style.display = "none";
    submitButtonChequeInnerForm.style.display = "";
}

// cheque payment edit karanna ona inner form eka fill karanna
const chequePaymentEdit = (dataOb,index) => {

    innerFormIndex = index;
    chequePayment = JSON.parse(JSON.stringify(dataOb));
    oldChequePayment = JSON.parse(JSON.stringify(dataOb));

    textChequeNo.value = dataOb.cheque_no;
    textChequeAmount.value = dataOb.cheque_amount;
    textChequeDate.value = dataOb.cheque_date;

    updateButtonChequeInnerForm.style.display = "";
    submitButtonChequeInnerForm.style.display = "none";
    }

// inner form data delete function
const chequePaymentDelete = (dataOb,index) =>{
    let userConfirm = Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Yes, Delete it!",
        allowOutsideClick: false,
        customClass :{
            cancelButton :'btn-3d btn-3d-cancel',
            confirmButton :'btn-3d btn-3d-delete'
        }
    }).then((userConfirm) => {
        if (userConfirm.isConfirmed) {
            //call post service
            let existIndex =  customerPayment.chequePaymentList.map(chequePayment => chequePayment.id).indexOf(dataOb.id);
            if (existIndex !== -1) {
                customerPayment.chequePaymentList.splice(existIndex, 1);
            }
            Swal.fire({
                title: "Removed!",
                text: "Removed Successfully",
                icon: "success",
                iconColor: "#d33",
                timer: 1000,
                showConfirmButton: false,
                customClass: {
                    confirmButton: 'btn-3d btn-3d-other'
                }
            });
            refreshChequePaymentInnerForm();
            updateTotalAmountUsingCheque();
        } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: "Cancelled",
                text: "Details not Deleted!",
                icon: "error",
                customClass: {
                    confirmButton: 'btn-3d btn-3d-other'
                }
            });
        }
    });
}

// cheque inner form error check karanawa
const checkChequeInnerFormError = () => {
    let errors = "";
    // cheque no eka check karanawa
    if (chequePayment.cheque_no == null ) {
        errors += "Cheque No is required.\n";
    }
    if (chequePayment.cheque_amount == null){
        errors += "Cheque Amount is required.\n";
    }
    // currunt payemnt eka null  nam balanawa chewue amount ekath ekka due amount eka
    if (customerPayment.current_payment == null){
        if (chequePayment.cheque_amount > customerPayment.due_amount) {
            errors += "Cheque Amount cannot be greater than due Payment.\n";
        }
    }
//     meka wada karanna oni object deka null nam witharai.naththan update ekedi error ekak enw
if (chequePayment == null && oldChequePayment == null) {
    if (customerPayment.current_payment != null && chequePayment.cheque_amount > customerPayment.current_payment) {
        errors += "Cheque Amount cannot be greater than Current Payment.\n";
    }
}
    if (chequePayment.cheque_date == null){
        errors += "Cheque Date is required.\n";
    }
    return errors;
}

// cheque inner form eka submit karana button eke function ea
const chequeInnerFormSubmit = () =>{
    console.log(chequePayment)
    let errors = checkChequeInnerFormError();
    if (errors == "" ) {
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

            // check form error for required element
            customerPayment.chequePaymentList.push(chequePayment);
            if (userConfirm.isConfirmed) {
                Swal.fire({
                    title: "Saved!",
                    text: "Saved Successfully",
                    icon: "success",
                    customClass :{
                        confirmButton :'btn-3d btn-3d-other'
                    }
                });
                updateTotalAmountUsingCheque();
                refreshChequePaymentInnerForm();

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
            customClass: {
                confirmButton: 'btn-3d btn-3d-other'
            }
        });
    }

}

// check inner form updates
const checkChequeInnerFormUpdate = () =>{
    let updates = "";
    if (chequePayment != null && oldChequePayment != null) {
        if (chequePayment.cheque_no != oldChequePayment.cheque_no) {
            updates += "Cheque no is changed..... ";
        }

        if (chequePayment.cheque_amount != oldChequePayment.cheque_amount) {
            updates += "Cheque amount is changed..... ";
            if (chequePayment.cheque_amount >chequePayment.due_amount){
                updates +="cant update"
            }
        }
        if (chequePayment.cheque_date != oldChequePayment.cheque_date) {
            updates += "Cheque date is changed..... ";
        }
    }

    return updates;
}

// customer agreement inner form update function
const chequeInnerFormUpdate = () =>{

    // check form error for required element
    let errors = checkChequeInnerFormError();
    if (errors == "") {
        let updates = checkChequeInnerFormUpdate();
        // updates not exit
        if (updates == "") {
            Swal.fire({
                title: "Opps?",
                text: "Nothing To Update?",
                icon: "question",
                allowOutsideClick: false,
                customClass: {
                    confirmButton: 'btn-3d btn-3d-other'
                }
            });
        } else {
            let userConfirm = Swal.fire({
                title: "Are you sure?",
                text: "You want to update this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, Update it!",
                allowOutsideClick: false,
                customClass: {
                    cancelButton: 'btn-3d btn-3d-cancel',
                    confirmButton: 'btn-3d btn-3d-submit'
                }
            }).then((userConfirm) => {
                if (userConfirm.isConfirmed) {
                    // user confirm kaloth update wenawa
                    customerPayment.chequePaymentList[innerFormIndex] =chequePayment;
                    Swal.fire({
                        title: "Update!",
                        text: "Updated Successfully",
                        icon: "success",
                        customClass: {
                            confirmButton: 'btn-3d btn-3d-other'
                        }
                    });
                    updateTotalAmountUsingCheque();
                    refreshChequePaymentInnerForm();

                } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
                    Swal.fire({
                        title: "Cancelled",
                        text: "Details not Updated!",
                        icon: "error",
                        allowOutsideClick: false,
                        customClass: {
                            confirmButton: 'btn-3d btn-3d-other'
                        }
                    });
                }
            });
        }
    } else {
        Swal.fire({
            title: 'Error!',
            text: errors,
            icon: 'error',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            customClass: {
                confirmButton: 'btn-3d btn-3d-other'
            }
        });
    }
}

// define function check existing cheque no
const checkExtChequeNo = () =>{

    let chequeNo = document.getElementById('textChequeNo').value;

    let extIndex = customerPayment.chequePaymentList.map(cheque =>cheque.cheque_no).indexOf(chequeNo);

    if (extIndex >-1){
        window.alert("already exist")
            refreshChequePaymentInnerForm();
    }
}

// cheque no eka enter karaddi digits enter karanna puluwan 16
const formatInput =(input) => {
    // Remove all non-digits
    let value = input.value.replace(/\D/g, '');

    // Limit to 16 digits
    value = value.slice(0, 16);

    // Insert '-' every 4 digits
    let formatted = value.match(/.{1,4}/g)?.join('-') || '';

    input.value = formatted;
    chequePayment.cheque_no = formatted; // bind the chequePayment object
}

// update paid amount if add mutiple cheques
const updateTotalAmountUsingCheque = () =>{
    let paidAmount = 0.00;

    // total amount eka gannwa eke thiyen currancy format eka remove karala
    const totalAmount = parseFloat(document.getElementById('textTotalAmount').value.replace(/[^0-9.-]+/g, ""));
    const dueAmount = parseFloat(document.getElementById('textDueAmount').value.replace(/[^0-9.-]+/g, ""));

    // for loop eken paid amount eke total eka gnnw
    for (const cheque of customerPayment.chequePaymentList) {
        paidAmount = parseFloat(paidAmount) + parseFloat(cheque.cheque_amount);
    }
    // type karana paid amount eka due amount ekaatas samana nam ho adu nam meka wada karanwa
    if (paidAmount <= dueAmount) {
        //currancy format ekata change karanawa
        textCurrentAmount.value = paidAmount.toLocaleString('en-US', { style: 'currency', currency: 'LKR' }) ;
        customerPayment.current_payment = paidAmount;

        // balnance eka auto calculate wenna hadanna oni
        const balanceAmount = totalAmount - paidAmount;
        // balance amount eka curaancy format ekata change karanawa
        textBalanceAmount.value = balanceAmount.toLocaleString('en-US', { style: 'currency', currency: 'LKR' }) ;
        // customerPayment object ekata bind karanawa
        customerPayment.balance_amount = balanceAmount
        // balance amount eka hadenna oni total amount eken paid amount eka adu wela

        // validation
        textCurrentAmount.classList.remove("is-invalid");
        textCurrentAmount.classList.add("is-valid");

        textBalanceAmount.classList.remove("is-invalid");
        textBalanceAmount.classList.add("is-valid");
    }else{
        //paid amount amount eka due amount ekata wada wadi nam error msg ekak ewanwa
        Swal.fire({
            title: "Error!",
            text: "Paid amount cannot be greater than due amount.",
            icon: "error",
            confirmButtonText: "OK",
            allowOutsideClick: false,
            customClass: {
                confirmButton: 'btn-3d btn-3d-other'
            }
        });

        // add karana cheque eka list eken remove karanwa
        const currantladdcheque = customerPayment.chequePaymentList.length - 1;
        customerPayment.chequePaymentList.splice(currantladdcheque, 1);

        // type karana amount 0 hari empty hari wunoth validation ayin wenawa
        setDefault([textCurrentAmount,textBalanceAmount]);
    }
}


//-----------------------------------------Inter Bank Transfer Payment Method inner Form---------------------------------------------


// refresh ibt form
const refreshIbtPaymentInnerForm = () => {

    // ibt inner object hadagannw
    ibtPayment = new Object();

    // input clean wenna oni
    textReferenceNo.value ="";
    textIbtAmount.value ="";
    textIbtDate.value="";

    // validation deafult value ekata gnnw
    setDefault([textReferenceNo,textIbtAmount,textIbtDate]);

//     referesh Inner Table
    const propertyList = [
        { propertyName: "reference_no", dataType: "string" },
        { propertyName: "amount", dataType: "decimal" },
        { propertyName: "ibt_date", dataType: "string" }
    ];

    dataFillIntoTheInnerTable(innerIbtTableBody, customerPayment.interBankTransferPaymentList , propertyList, ibtPaymentEdit, ibtPaymentDelete, true);

    // cheque inner form eke button handling
    updateButtonIbtInnerForm.style.display = "none";
    submitButtonIbtInnerForm.style.display = "";
}


// ibt payment edit karanna ona inner form eka fill karanna
const ibtPaymentEdit = (dataOb,index) => {

    // innerform index eka gnnw.mkd update karaddi index eka balanna oni
    innerFormIndex = index;
    ibtPayment = JSON.parse(JSON.stringify(dataOb));
    oldIbtPayment = JSON.parse(JSON.stringify(dataOb));

    textReferenceNo.value = dataOb.reference_no;
    textIbtAmount.value = dataOb.amount;
    textIbtDate.value = dataOb.ibt_date;

    updateButtonIbtInnerForm.style.display = "";
    submitButtonIbtInnerForm.style.display = "none";
}

// inner form data delete function
const ibtPaymentDelete = (dataOb,index) =>{
    let userConfirm = Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Yes, Delete it!",
        allowOutsideClick: false,
        customClass :{
            cancelButton :'btn-3d btn-3d-cancel',
            confirmButton :'btn-3d btn-3d-delete'
        }
    }).then((userConfirm) => {
        if (userConfirm.isConfirmed) {
            //call post service
            let existIndex =  customerPayment.interBankTransferPaymentList.map(ibtPayment => ibtPayment.id).indexOf(dataOb.id);
            if (existIndex !== -1) {
                customerPayment.interBankTransferPaymentList.splice(existIndex, 1);
            }
            Swal.fire({
                title: "Removed!",
                text: "Removed Successfully",
                icon: "success",
                iconColor: "#d33",
                timer: 1000,
                showConfirmButton: false,
                customClass: {
                    confirmButton: 'btn-3d btn-3d-other'
                }
            });
            refreshIbtPaymentInnerForm();
            updateTotalAmountUsingIbt();
        } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: "Cancelled",
                text: "Details not Deleted!",
                icon: "error",
                customClass: {
                    confirmButton: 'btn-3d btn-3d-other'
                }
            });
        }
    });
}

// ibt inner form error check karanawa
const checkIbtInnerFormError = () => {
    let errors = "";
    // cheque no eka check karanawa
    if (ibtPayment.reference_no == null ) {
        errors += "Reference No is required.\n";
    }
    if (ibtPayment.amount == null){
        errors += "Amount is required.\n";
    }
    if (ibtPayment.ibt_date == null){
        errors += "Ibt Date is required.\n";
    }
    // currunt payemnt eka null  nam balanawa ibt amount eka  due amount ekata wda wishalada kiyala
    if (ibtPayment.current_payment == null){
        if (ibtPayment.amount > ibtPayment.due_amount) {
            errors += "Ibt Amount cannot be greater than due Payment.\n";
        }
    }
//     meka wada karanna oni object deka null nam witharai.naththan update ekedi error ekak enw
    if (ibtPayment == null && oldIbtPayment == null) {
        if (customerPayment.ibtPayment != null && ibtPayment.amount > ibtPayment.current_payment) {
            errors += "Ibt Amount cannot be greater than Current Payment.\n";
        }
    }
    return errors;
}

// ibt inner form eka submit karana button eke function ea
const ibtInnerFormSubmit = () =>{

    // check form error for required element
    // check form error for required element
    let errors = checkIbtInnerFormError();
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
                customerPayment.interBankTransferPaymentList.push(ibtPayment);
                Swal.fire({
                    title: "Saved!",
                    text: "Saved Successfully",
                    icon: "success",
                    customClass :{
                        confirmButton :'btn-3d btn-3d-other'
                    }
                });
                updateTotalAmountUsingIbt();
                refreshIbtPaymentInnerForm();

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
            customClass: {
                confirmButton: 'btn-3d btn-3d-other'
            }
        });
    }

}

// check inner form updates
const checkIbtInnerFormUpdate = () =>{
    let updates = "";
    if (ibtPayment != null && oldIbtPayment != null) {
        if (ibtPayment.reference_no != oldIbtPayment.reference_no) {
            updates += "Reference no is changed..... ";
        }
        if (ibtPayment.amount != oldIbtPayment.amount) {
            updates += "Amount is changed..... ";
        }
        if (ibtPayment.ibt_date != oldIbtPayment.ibt_date) {
            updates += "Ibt date is changed..... ";
        }
    }

    return updates;
}

// ibt inner form update function
const ibtInnerFormUpdate = () =>{

    // check form error for required element
    let errors = checkIbtInnerFormError();
    if (errors == "") {
        let updates = checkIbtInnerFormUpdate();
        // updates not exit
        if (updates == "") {
            Swal.fire({
                title: "Opps?",
                text: "Nothing To Update?",
                icon: "question",
                allowOutsideClick: false,
                customClass: {
                    confirmButton: 'btn-3d btn-3d-other'
                }
            });
        } else {
            let userConfirm = Swal.fire({
                title: "Are you sure?",
                text: "You want to update this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, Update it!",
                allowOutsideClick: false,
                customClass: {
                    cancelButton: 'btn-3d btn-3d-cancel',
                    confirmButton: 'btn-3d btn-3d-submit'
                }
            }).then((userConfirm) => {
                if (userConfirm.isConfirmed) {
                    // user confirm kaloth update wenawa
                    customerPayment.interBankTransferPaymentList[innerFormIndex] =ibtPayment;
                    Swal.fire({
                        title: "Update!",
                        text: "Updated Successfully",
                        icon: "success",
                        customClass: {
                            confirmButton: 'btn-3d btn-3d-other'
                        }
                    });
                    updateTotalAmountUsingIbt();
                    refreshIbtPaymentInnerForm();

                } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
                    Swal.fire({
                        title: "Cancelled",
                        text: "Details not Updated!",
                        icon: "error",
                        allowOutsideClick: false,
                        customClass: {
                            confirmButton: 'btn-3d btn-3d-other'
                        }
                    });
                }
            });
        }
    } else {
        Swal.fire({
            title: 'Error!',
            text: errors,
            icon: 'error',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            customClass: {
                confirmButton: 'btn-3d btn-3d-other'
            }
        });
    }
}

// define function check existing chargers
const checkExtReferenceNo = () =>{

    let referenceNo = document.getElementById('textReferenceNo').value;

    let extIndex = customerPayment.interBankTransferPaymentList.map(ibt =>ibt.reference_no).indexOf(referenceNo);

    if (extIndex >-1){
        window.alert("already exist")
        refreshIbtPaymentInnerForm();
    }
}

// update paid amount if add mutiple cheques
const updateTotalAmountUsingIbt = () =>{
    // empty varibale ekak hadagannw
    let paidAmount = 0.00;
    // total amount ekai due amount ekai gnnw currancy ayin karala
    const totalAmount = parseFloat(document.getElementById('textTotalAmount').value.replace(/[^0-9.-]+/g, ""));
    const dueAmount = parseFloat(document.getElementById('textDueAmount').value.replace(/[^0-9.-]+/g, ""));

    // for loop eken paid amount eke total eka gnnw
    for (const ibt of customerPayment.interBankTransferPaymentList) {
        paidAmount = parseFloat(paidAmount) + parseFloat(ibt.amount);
    }

    // type karana paid amount eka due amount ekata samana nam ho adu nam meka wada karanwa
    if (paidAmount <= dueAmount) {
        //currancy format ekata change karanawa
        textCurrentAmount.value = paidAmount.toLocaleString('en-US', { style: 'currency', currency: 'LKR' }) ;
        customerPayment.current_payment = paidAmount;

        // balnance eka auto calculate wenna hadanna oni
        const balanceAmount = totalAmount - paidAmount;

        // balance amount eka curaancy format ekata change karanawa
        textBalanceAmount.value = balanceAmount.toLocaleString('en-US', { style: 'currency', currency: 'LKR' }) ;
        // customerPayment object ekata bind karanawa
        customerPayment.balance_amount = balanceAmount
        // balance amount eka hadenna oni total amount eken paid amount eka adu wela

        // validation
        textCurrentAmount.classList.remove("is-invalid");
        textCurrentAmount.classList.add("is-valid");

        textBalanceAmount.classList.remove("is-invalid");
        textBalanceAmount.classList.add("is-valid");
    }else{
        //paid amount amount eka due amount ekata wada wadi nam error msg ekak ewanwa
        Swal.fire({
            title: "Error!",
            text: "Paid amount cannot be greater than due amount.",
            icon: "error",
            confirmButtonText: "OK",
            allowOutsideClick: false,
            customClass: {
                confirmButton: 'btn-3d btn-3d-other'
            }
        });
        // add karana cheque eka list eken remove karanwa
        const currantladdIbt = customerPayment.interBankTransferPaymentList.length - 1;

        customerPayment.interBankTransferPaymentList.splice(currantladdIbt, 1);

        // type karana amount 0 hari empty hari wunoth validation ayin wenawa
        setDefault([textCurrentAmount,textBalanceAmount]);
    }
}

