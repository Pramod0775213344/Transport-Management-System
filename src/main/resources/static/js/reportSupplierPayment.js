// reportSupplierPayment.js

window.addEventListener("load", () => {
    initializeCharts();
    loadTableData();
});

// Sample Data for Suppliers
const sampleSupplierPayments = [
    { id: 'SP-9921', supplier: 'Petro Energy Corp', avatar: 'PE', avatarClass: 'avatar-purple', date: 'Oct 28, 2023', total: 85000.00, paid: 85000.00, balance: 0.00, status: 'Paid' },
    { id: 'SP-9915', supplier: 'AutoParts Direct', avatar: 'AD', avatarClass: 'avatar-blue', date: 'Oct 25, 2023', total: 45000.00, paid: 15000.00, balance: 30000.00, status: 'Partial' },
    { id: 'SP-9892', supplier: 'TechFleet Solutions', avatar: 'TS', avatarClass: 'avatar-orange', date: 'Oct 20, 2023', total: 125000.00, paid: 0.00, balance: 125000.00, status: 'Overdue' },
    { id: 'SP-9884', supplier: 'RoadStar Logistics', avatar: 'RL', avatarClass: 'avatar-green', date: 'Oct 15, 2023', total: 60000.00, paid: 60000.00, balance: 0.00, status: 'Paid' }
];

let statusChart, trendChart;

function initializeCharts() {
    // Doughnut Chart for Status Distribution
    const ctxDoughnut = document.getElementById('statusDoughnutChart').getContext('2d');
    statusChart = new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
            labels: ['Paid', 'Partial', 'Overdue'],
            datasets: [{
                data: [72, 12, 16],
                backgroundColor: ['#7c3aed', '#f59e0b', '#ef4444'],
                borderWidth: 0,
                cutout: '75%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            elements: {
                arc: {
                    borderRadius: 10
                }
            }
        }
    });

    // Line Chart for Outstanding Balance Trend
    const ctxLine = document.getElementById('balanceTrendChart').getContext('2d');
    const gradient = ctxLine.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.2)');
    gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');

    trendChart = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June'],
            datasets: [{
                label: 'Payables Balance',
                data: [500000, 450000, 600000, 580000, 720000, 680000],
                borderColor: '#7c3aed',
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { display: false },
                y: { display: false }
            }
        }
    });

    // Update trend info
    document.getElementById('totalOutstanding').innerText = '$680,240.00';
    document.getElementById('trendPercentage').innerText = '8.2%';
}

function loadTableData() {
    const tableBody = document.getElementById('paymentTableBody');
    tableBody.innerHTML = '';

    // Destroy existing DataTable if it exists
    if ($.fn.dataTable.isDataTable("#paymentTable")) {
        $("#paymentTable").DataTable().destroy();
    }

    sampleSupplierPayments.forEach((pay, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-center">${pay.id}</td>
            <td>
                <div class="customer-name-cell">
                    <div class="customer-avatar ${pay.avatarClass}">${pay.avatar}</div>
                    <span>${pay.supplier}</span>
                </div>
            </td>
            <td class="text-center">${pay.date}</td>
            <td class="fw-bold text-center">$${pay.total.toLocaleString()}</td>
            <td class="text-center">$${pay.paid.toLocaleString()}</td>
            <td class="fw-bold text-center ${pay.balance > 0 ? 'text-warning' : 'text-success'}">$${pay.balance.toLocaleString()}</td>
            <td class="text-center">
                <span class="status-badge-pill ${getStatusClass(pay.status)}">${pay.status}</span>
            </td>
            <td class="text-end">
                <a href="#" class="view-invoice-btn">View Details</a>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    // Initialize DataTable with custom controls
    const table = $("#paymentTable").DataTable({
        dom: "rtip",
        pageLength: 10,
        createdRow: function (row, data, dataIndex) {
            $(row).find("td").css({
                "vertical-align": "middle",
                "padding": "1.25rem 1.5rem"
            });
        }
    });

    // Custom Search Control
    document.getElementById("tableSearch").addEventListener("keyup", function () {
        table.search(this.value).draw();
    });

    // Custom Length Control
    document.getElementById("tableLength").addEventListener("change", function () {
        table.page.len(this.value).draw();
    });
}

function getStatusClass(status) {
    switch (status) {
        case 'Paid': return 'status-paid';
        case 'Partial': return 'status-partial';
        case 'Overdue': return 'status-overdue';
        default: return '';
    }
}

function filterTable() {
    const searchValue = document.getElementById('supplierSearch').value.toLowerCase();
    const statusValue = document.getElementById('statusFilter').value;
    
    const filtered = sampleSupplierPayments.filter(pay => {
        const matchesSearch = pay.supplier.toLowerCase().includes(searchValue) || pay.id.toLowerCase().includes(searchValue);
        const matchesStatus = statusValue === 'all' || pay.status === statusValue;
        return matchesSearch && matchesStatus;
    });

    const tableBody = document.getElementById('paymentTableBody');
    tableBody.innerHTML = '';

    if (filtered.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted">No matching results found.</td></tr>';
        return;
    }

    filtered.forEach((pay, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${pay.id}</td>
            <td>
                <div class="customer-name-cell">
                    <div class="customer-avatar ${pay.avatarClass}">${pay.avatar}</div>
                    <span>${pay.supplier}</span>
                </div>
            </td>
            <td>${pay.date}</td>
            <td class="fw-bold">$${pay.total.toLocaleString()}</td>
            <td>$${pay.paid.toLocaleString()}</td>
            <td class="fw-bold ${pay.balance > 0 ? 'text-warning' : 'text-success'}">$${pay.balance.toLocaleString()}</td>
            <td>
                <span class="status-badge-pill ${getStatusClass(pay.status)}">${pay.status}</span>
            </td>
            <td class="text-end">
                <a href="#" class="view-invoice-btn">View Details</a>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function exportToPDF() {
    if (typeof window.jspdf === "undefined" || typeof window.jspdf.jsPDF === "undefined") {
        Swal.fire({ icon: 'error', title: 'Error', text: 'PDF library not loaded' });
        return;
    }
    exportTableToPdfWithJsPdf('#paymentTable', 'Supplier_Payment_Report', { title: 'Supplier Payment Summary' });
}
