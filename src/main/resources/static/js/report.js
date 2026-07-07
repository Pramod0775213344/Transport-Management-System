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


reportList = getServiceRequest("/reportlist/alldata");
console.log(reportList);


// Render functions
function generateReportRows(list) {
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

// refresh karan function eka
const refresh = () => {

  reportSummary = new Object();
  generateReportRows(reportList);
}

function createReportCardHTML(r) {
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

function formatSampleDate(seed) {
  // create a pseudo-random recent date for visual variety
  const base = new Date();
  const daysBack = (seed * 7) % 60; // deterministic per id
  const d = new Date(base.getTime() - daysBack * 24 * 60 * 60 * 1000);
  const opts = { month: 'short', day: 'numeric', year: 'numeric' };
  return d.toLocaleDateString('en-US', opts);
}

// initialize filters for first render
document.addEventListener('DOMContentLoaded', () => {
  // ensure button states reflect default
  const firstTab = document.querySelector('#filterTabs .nav-link.active');
  if (firstTab) applyFilter(firstTab.getAttribute('data-filter'));
});


