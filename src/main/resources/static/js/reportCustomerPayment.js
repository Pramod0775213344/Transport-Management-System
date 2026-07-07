
window.addEventListener("load", () => {
    refresh();
    loadPaymentTable();
});


// table ekata data load karanawaa function eka
const loadPaymentTable = () => {

    const data = getServiceRequest("/report/customerpayment");

    const result = [];

    data.forEach(row => {

        // current invoice number
        const invoiceNo = row[0];

        // check invoice already exists
        let invoice = result.find(
            item => item.invoice_no === invoiceNo
        );

        // if not exists create object
        if (!invoice) {

            invoice = {
                invoice_no: row[0],
                invoice_month: row[1],
                invoice_total: row[2],
                paid_amount: row[3],
                balance_amount: row[4],

                payments: []
            };

            result.push(invoice);
        }

        // add payment details
        invoice.payments.push({
            bill_no: row[5],
            current_payment: row[6]
        });

    });



    if ($.fn.dataTable.isDataTable("#paymentTable")) {
        $("#paymentTable").DataTable().clear().destroy();
    }

    let propertyList = [
        { propertyName: "invoice_no", dataType: "string" },
        { propertyName: "invoice_month", dataType: "string" },
        { propertyName: getPayments, dataType: "function" },
        { propertyName: getTotalAmount, dataType: "function" },
        { propertyName: getPaidAmount, dataType: "function" },
        { propertyName: getBalance, dataType: "function" },
    ];

    dataFillIntoTheReportTable(paymentTableBody, result, propertyList);
}

const getPayments = (row) => {
    if (!row.payments || row.payments.length === 0) {
        return `<span class="text-muted">No payments</span>`;
    }

    return row.payments
        .map((payment) => {
            const amount = formatAmount(payment.current_payment);
            return `<div class="p-3 text-center">Bill No: <strong>${payment.bill_no}</strong> | Payment: <strong>${amount}</strong></div>`;
        })
        .join("");
}

const getTotalAmount = (row) => {
    const totalAmount = formatAmount(row.invoice_total);
    return `<span>${totalAmount}</span>`;

}

const getPaidAmount = (row) => {
    const paidAmount = formatAmount(row.paid_amount)
    return `<span class="text-success">${paidAmount}</span>`;

}

const getBalance = (row) => {
    const balance = formatAmount(row.balance_amount);

    if (!Number.isFinite(balance)) {
        return `<span class="text-danger"> - </span>`;
    } else {
        return `<span class="text-success">${balance}</span>`;
    }
}

const formatAmount = (value) => {
    const amount = Number(value);
    return amount.toLocaleString("en-US", { style: "currency", currency: "LKR" });
};


// refresh function eka
const refresh = () => {

    let customers = getServiceRequest("/customer/alldata");
    dataFilIntoSelect(selectCustomerName, "Select Customer", customers, "company_name");



}