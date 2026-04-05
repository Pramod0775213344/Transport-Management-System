window.addEventListener("load", function () {
  // loading effect eka pennanna thama meka danne
  showSkeletons();
  setTimeout(() => {
    generateReportRows(reportList);
  }, 1000);
});

// skeleton loader generate කරනවා (loading animation ekata)
const showSkeletons = () => {
  const container = document.getElementById("reportsContainer");
  container.innerHTML = "";
  // Change to grid for cards
  container.className = "row g-4";

  for (let i = 0; i < 6; i++) {
    const col = document.createElement("div");
    col.className = "col-md-3 col-sm-6";
    col.innerHTML = `
      <div class="skeleton-card" style="height: 380px;">
        <div class="skeleton" style="height: 180px; width: 100%; border-radius: 16px;"></div>
        <div class="skeleton mt-3" style="height: 24px; width: 60%;"></div>
        <div class="skeleton mt-2" style="height: 14px; width: 90%;"></div>
        <div class="skeleton mt-auto" style="height: 45px; width: 100%; border-radius: 12px;"></div>
      </div>
    `;
    container.appendChild(col);
  }
};

// report list eka - modern structure with image and badges
const reportList = [
  {
    id: 1,
    title: "Bookings Performance Report",
    desc: "Analytics on booking efficiency, conversion rates, and seasonal volume trends.",
    cat: "operations",
    badge: "LIVE",
    badgeClass: "badge-live",
    img: "images/reports/booking_performance.jpg",
    link: "/bookingreport",
  },
  {
    id: 2,
    title: "Pending Booking Report",
    desc: "Tracking and managing bookings that are yet to be processed or assigned to carriers.",
    cat: "operations",
    badge: "URGENT",
    badgeClass: "badge-urgent",
    img: "images/reports/pending_booking.jpg",
    link: "/reportpendingbookings",
  },
  {
    id: 3,
    title: "Bookings Delay Analyze",
    desc: "Deep dive into bottleneck reasons, carrier performance, and recurring patterns for transit delays.",
    cat: "operations",
    img: "images/reports/delay_analyze.jpg",
    link: "/bookingdelayreport",
  },
  {
    id: 4,
    title: "Daily Bookings Summary",
    desc: "A comprehensive snapshot of today's logistics activity and total shipment volume.",
    cat: "operations",
    img: "images/reports/daily_summary.jpg",
    link: "/dailybookingsummury",
  },
  {
    id: 5,
    title: "Agreement Compliance",
    desc: "Monitoring adherence to service level agreements (SLAs) and contractual obligations.",
    cat: "fleet",
    img: "images/reports/agreement_compliance.jpg",
    link: "/agreementdeatilsreport",
  },
  {
    id: 6,
    title: "Income Analytics Report",
    desc: "Detailed view of revenue streams, cost per mile, and overall route profitability.",
    cat: "finance",
    badge: "PREMIUM",
    badgeClass: "badge-premium",
    img: "images/reports/income_analytics.jpg",
    link: "/incomeReport",
  },
  {
    id: 7,
    title: "Insurance Expiry Report",
    desc: "Critical tracking of vehicle and cargo insurance dates for fleet-wide risk management.",
    cat: "fleet",
    badge: "EXPIRED SOON",
    badgeClass: "badge-expired",
    img: "images/reports/insurance_expiry.jpg",
    link: "/insuranceexpirereport",
  },
  {
    id: 8,
    title: "Revenue License Expiry",
    desc: "Compliance monitoring for vehicle licensing and legal registration documentation.",
    cat: "fleet",
    img: "images/reports/revenue_license.jpg",
    link: "/revenuelicenseexpirereport",
  },
  {
    id: 9,
    title: "Agreement Expiry Report",
    desc: "Identify agreements nearing expiration to ensure business continuity and compliance.",
    cat: "fleet",
    img: "images/reports/agreement_expiry.jpg",
    link: "/agreementexpirereport",
  },
  {
    id: 10,
    title: "Driver Performance KPI",
    desc: "Evaluation of driver safety scores, fuel efficiency, and delivery time reliability.",
    cat: "fleet",
    img: "images/reports/driver_performance.jpg",
    link: "/driverperformancereport",
    isActive: true, // For the purple button variation in screenshot
  },
  {
    id: 11,
    title: "Customer Payment Summary",
    desc: "Analyze individual customer payment histories, pending balances, and total collections for a specific period.",
    cat: "finance",
    badge: "NEW",
    badgeClass: "badge-live",
    img: "images/reports/customer_payment.jpg",
    link: "/customerpaymentreport",
  },
  {
    id: 12,
    title: "Supplier Payment Summary",
    desc: "Track payments made to fleet providers, batch settlements, and outstanding liabilities in one place.",
    cat: "finance",
    badge: "NEW",
    badgeClass: "badge-live",
    img: "images/reports/supplier_payment.jpg",
    link: "/supplierpaymentreport",
  },
];

// list view ekata rows generate kalla table ekata inject karanwa
const generateReportRows = (reports) => {
  const container = document.getElementById("reportsContainer");
  container.className = "row g-4";
  container.innerHTML = "";

  if (reports.length === 0) {
    container.innerHTML = `
            <div class="col-12" style="text-align: center; padding: 60px 20px;">
                <h3 style="color: #64748b; font-weight: 600;">No reports found</h3>
                <p style="color: #94a3b8;">Try adjusting your search or filters.</p>
            </div>
        `;
    document.getElementById("statPagination").innerText = "Showing 0 reports";
    return;
  }

  // dynamically cards generate karanwa
  reports.forEach((report) => {
    const col = document.createElement("div");
    col.className = "col-lg-3 col-md-6";

    // Badge kella
    const badgeHtml = report.badge ? `<span class="report-badge ${report.badgeClass}">${report.badge}</span>` : "";
    const activeClass = report.isActive ? "active-btn" : "";

    col.innerHTML = `
        <div class="report-card-modern h-100">
            <div class="report-banner-wrapper">
                ${badgeHtml}
                <img src="${report.img}" class="report-banner-img" alt="${report.title}" onerror="this.src='https://placehold.co/600x400/f1f5f9/64748b?text=Report+Hub+Image'">
            </div>
            
            <div class="report-content-modern">
                <h5 class="report-title-modern">${report.title}</h5>
                <p class="report-desc-modern">${report.desc}</p>
                
                <a href="${report.link}" class="btn-report-action ${activeClass}">
                    <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.9rem;"></i> Open Report
                </a>
            </div>
        </div>
    `;
    container.appendChild(col);
  });

  document.getElementById("statPagination").innerText = `Showing 1-${reports.length} of ${reportList.length} reports`;
};

// category click karaddi filter wenna hadanna ona
const filterByCategory = (category) => {
  // active tab eka update karanwa
  let tabs = document.querySelectorAll("#filterTabs .nav-link");
  tabs.forEach((tab) => tab.classList.remove("active"));

  // click karapu ekata active class eka danwa
  event.target.classList.add("active");

  if (category === "all") {
    generateReportRows(reportList);
  } else {
    const filtered = reportList.filter((r) => r.cat.toLowerCase() === category.toLowerCase());
    generateReportRows(filtered);
  }
};

// search kalla report hoyaganna
const searchReports = () => {
  const val = document.getElementById("searchInput").value.toLowerCase();
  const filtered = reportList.filter((r) => r.title.toLowerCase().includes(val) || r.desc.toLowerCase().includes(val) || r.cat.toLowerCase().includes(val));
  generateReportRows(filtered);
};
