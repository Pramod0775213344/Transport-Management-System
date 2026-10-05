// ==================== load functions =========================
window.addEventListener("load", function () {
  // A tiny delay to allow the preloader to render before synchronous blocking calls
  setTimeout(() => {
    try {


      refresh();
    } catch (e) {
      console.error("Error during report page initialization:", e);
    } finally {
      // Reveal the content after all synchronous data is fetched
      finishPageLoading();
    }
  }, 100);
});

// =================== end load functions =========================


// ================== card load functions =========================
// reneder cards

// card tika load karanwa saha report summary table eka update karanwa
const createReportCards = (list) => {
  const container = document.getElementById('reportsGrid');
  if (!container) return;
  container.innerHTML = '';

  list.forEach((r) => {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-md-4 col-lg-3 col-xl-3';
    col.innerHTML = createReportCardHTML(r);
    container.appendChild(col);
  });

  // attach basic handlers
  document.querySelectorAll('.btn-report-minimal').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const href = btn.getAttribute('data-href');
      if (href) window.open(href, "_blank");
      // onclick ekedi report summary ekata record ekak insert karanawa database ekata user report eka view kalama
      let r = reportList.find(rep => rep.link === href);
      // object ekata bind karanwa
      reportSummary.report_id = r;
      let postResponse = httpServiceRequest("/reportsummary/insert", "POST", reportSummary);
      refresh();
    });
  });
}

// card creay karana functione eka
const createReportCardHTML = (r) => {
  const type = r.category;
  const typeHTML = `<div class="report-badge-minimal badge-active">${type}</div>`;

  const lastUpdated = getServiceRequest("reportsummary/lastviewbyuser?reportid=" + r.id) || "Never";

  return `
    <div class="report-card-minimal">
      <div>
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px;">
          <div class="report-icon-minimal">
            <i class="fa-solid ${r.icon || 'fa-building-columns'}"></i>
          </div>
          <div>
            ${typeHTML}
          </div>
        </div>

        <div class="report-title-minimal">${r.title}</div>
        <p class="report-desc-minimal">${r.description}</p>
      </div>

      <div class="border-top-subtle" style="margin-top:18px; padding-top:14px; display:flex; align-items:flex-end; justify-content:space-between; gap:12px;">
        <div>
          <div class="report-foot-label">Last view</div>
          <div class="report-foot-date">${lastUpdated}</div>
        </div>
        <a href="#" data-href="${r.link || '#'}" class="btn-report-minimal" role="button">View Report</a>
      </div>
    </div>
  `;
}
// ================= end card load functions =========================



// ================= refresh function =========================
// refresh karan function eka
const refresh = () => {
  reportList = getServiceRequest("/reportlist/alldata");
  reportSummary = new Object();
  createReportCards(reportList);
}
// ================= end refresh function =========================


// document.getElementById("searchInput")?.addEventListener("input", (e) => {
//   const query = e.target.value.toLowerCase();
//   // reportList eka filter karanwa query ekata adala report tika ganna
//   const filtered = reportList.filter(r => {
//     const reportTitle = (r.title || "").toLowerCase();
//     const reportDescription = (r.description || "").toLowerCase();
//     return reportTitle.includes(query) || reportDescription.includes(query);
//   });
//   createReportCards(filtered);
// });


// chip set anuwa report tika filter karanwa
document.querySelectorAll('input[name="reporttype"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    currentViewMode = "chipFilter";//curun view eka
    const filterOptionValue = e.target.value;
    const type = reportList.filter(r => r.category === filterOptionValue);
    createReportCards(type);
    // selected type eka all nam reportList eka render karanwa
    if (filterOptionValue === "All") {
      createReportCards(reportList);
    }

  });
});
