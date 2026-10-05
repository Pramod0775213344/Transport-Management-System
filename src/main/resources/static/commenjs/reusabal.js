const setDefault = (element) => {
  element.forEach((element) => {
    element.classList.remove("is-invalid");
    element.classList.remove("is-valid");
  });
};

// select 2 validation clear karanwa
const select2Default = (elementArray) => {
  elementArray.forEach((element) => {
    const s2Container = element.nextElementSibling;
    if (s2Container && s2Container.classList.contains("select2-container")) {
      const s2Selection = s2Container.querySelector(".select2-selection");
      if (s2Selection) {
        // Inline styles okkoma remove karanawa (setProperty eken dapu ewath athule)
        s2Selection.style.removeProperty("border-color");
        s2Selection.style.removeProperty("background-color");
        s2Selection.style.removeProperty("border");
        s2Selection.style.removeProperty("border-bottom");

        // Default border eka danna ona nam
        s2Selection.style.border = "1px solid #ced4da";

        // Okkoma validation classes remove karanawa  
        s2Selection.classList.remove("is-valid", "is-invalid", "select2-valid", "select2-invalid");
        // valid saha invalid feedback message eka hide karanawa
        const parent = element.parentElement;
        if (parent) {
          const feedback = parent.querySelector(".valid-feedback, .invalid-feedback");
          if (feedback) {
            feedback.style.display = "none";
          }
        }

      }
    }
  })
};

// define function for get service request
const getServiceRequest = (url) => {
  let getServiceResponse = []; //empty array eka intilaize karanwa

  $.ajax({
    url: url, //the url to which the request is sent
    type: "GET", //http method to use for the request(get or post)
    contentType: "json",//Content type of the request
    async: false,//Syncronouys Request false karala thiyenawa.Meka recomande na 
    success: function (response) {
      console.log("Success", response);
      getServiceResponse = response;
    },
    error: function (xhr, status, error) {
      console.log("Error", url, error);
    },
  });
  return getServiceResponse;
};


// define function for post put and delete servicers request
const httpServiceRequest = (url, method, dataOb) => {
  let httpServiceResponse = [];

  $.ajax({
    url: url, //the url to which the request is sent
    type: method, //http method to use for the request(put.delete or post)
    contentType: "application/json",
    data: JSON.stringify(dataOb), //dataob eka json format eke string ekak widihata backend ekata pass karanawa
    async: false, //data enkn bln inne na
    success: function (response) {
      // console.log("Success", response);
      httpServiceResponse = response;
    },
    error: function (xhr, status, error) {
      console.log("Error", url, error);
    },
  });
  return httpServiceResponse;
};


const removePhoto = (elementId, object, property, photoPreviewContainerId, previewId, uploadContainerId) => {
  console.log("Removing photo for", object, property);
  photoPreviewContainerId.style.display = "none"; // Hide the preview
  photoPreviewContainerId.classList.remove("d-flex", "flex-column", "align-items-center"); //class list  remove karanna oni
  previewId.src = "";
  uploadContainerId.style.display = "block"; // Show the upload container
  photoPreviewContainerId.style.display = "none"; // Hide the preview container
  // Optionally hide the preview container:
  // document.getElementById('photoPreview').style.display = 'none';
  // object eke property eka null karanna oni.
  object[property] = null;
};

// datetime format
// const datetimeformat = (selecttime) => {
//
//     let date = new Date(selecttime);
//
//     const hours = date.getHours().toString().padStart(2, "0");
//     const minutes = date.getMinutes().toString().padStart(2, "0");
//
//     // Get month name abbreviated
//     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//     const month = months[date.getMonth()];
//
//     // Format day and year
//     const day = date.getDate();
//     const year = date.getFullYear();
//
//     // Return the formatted string
//     return `${hours}:${minutes}\n ${month} ${day}, ${year}`;
//
// }

const dateformat = (selecttime) => {
  let date = new Date(selecttime);

  // Get month name abbreviated
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];

  // Format day and year
  const day = date.getDate();
  const year = date.getFullYear();

  // Return the formatted string
  return `${month} ${day}, ${year}`;
};

const datetimeformat = (selecttime) => {
  const date = new Date(selecttime);

  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${time} - ${datePart}`;
};

// modal colse karaddi form reset wena comman function eka
const formResetFunctionWhenClosingModal = (modalId, ModalFormId, RefreshFunction) => {
  // Modal element eka select kara ganna
  const myModal = document.getElementById(modalId);

  myModal.addEventListener("hidden.bs.modal", function () {
    // Modal eka athule thiyena form eka select karala reset karanna
    const form = document.getElementById(ModalFormId);
    if (form) {
      RefreshFunction();
    }
  });
};

// ==========details view karana comman overlay eka=================
const toggleView = (overlayId, show) => {
  const overlay = document.getElementById(overlayId);
  const container = document.querySelector("#main");

  if (!overlay || !container) return;

  if (show) {
    container.style.display = "none";
    overlay.style.display = "block";
    overlay.style.position = "relative";
    overlay.scrollTop = 0;
    requestAnimationFrame(() => {
      overlay.style.transform = "translateX(0)";
      // Clear transform after transition to fix blurry text in some browsers
      setTimeout(() => {
        if (overlay.style.transform === "translateX(0px)" || overlay.style.transform === "translateX(0)") {
          overlay.style.transform = "none";
        }
      }, 450);
    });
  } else {
    overlay.style.transform = "translateX(100%)";
    setTimeout(() => {
      overlay.style.display = "none";
      container.style.display = "block";
      overlay.style.transform = "translateX(100%)"; // Reset for next time
    }, 400);
  }
};

// Excel Export Function
function exportToExcel(tableID, filename = "Vehicle_Report") {
  let table = document.getElementById(tableID);
  let html = table.outerHTML;
  let blob = new Blob(["\ufeff", html], { type: "application/vnd.ms-excel" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = filename + ".xls";
  a.click();
}

// Simple File Upload Trigger Logic
document.querySelectorAll(".upload-box").forEach((box) => {
  box.addEventListener("click", () => box.querySelector("input").click());
});

/* --- Common Page Loading & Reveal Logic --- */
/**
 * Finishes the page loading sequence by hiding the preloader
 * and revealing the main content with a synchronized fade-in animation.
 */
const finishPageLoading = () => {
  // Supports both specific IDs and generic classes
  const preloader = document.getElementById("commonPreloader") || document.getElementById("preloader");
  const revealContent = document.getElementById("dashboardContent") || document.querySelector(".load-hidden");

  if (preloader || revealContent) {
    requestAnimationFrame(() => {
      if (preloader) preloader.classList.add("fade-out");
      if (revealContent) revealContent.classList.add("reveal");
    });
  }
};



// module name eken privilege object eka ganna
const getModulePrivilege = (moduleName) => {
  const defaultPrivilege = {
    privi_select: false,
    privi_insert: false,
    privi_update: false,
    privi_delete: false,
  };

  const modulePrivilege =
    (window.modulePrivileges && window.modulePrivileges[moduleName]) || {};

  return {
    privi_select: modulePrivilege.privi_select === true,
    privi_insert: modulePrivilege.privi_insert === true,
    privi_update: modulePrivilege.privi_update === true,
    privi_delete: modulePrivilege.privi_delete === true,
  };
};

// module name + direct button element dunnama hide/show karanawa
const applyPrivileges = (moduleName, tableId, btns = {}, elementIds = []) => {
  const p = getModulePrivilege(moduleName);

  // buttons
  if (btns.add) btns.add.style.display = p.privi_insert ? "" : "none";
  if (btns.update) btns.update.style.display = p.privi_update ? "" : "none";
  if (btns.submit) btns.submit.style.display = p.privi_insert ? "" : "none";

  // table row buttons
  if (tableId) {
    document.querySelectorAll(`#${tableId} .edit`)
      .forEach(btn => btn.style.display = p.privi_update ? "" : "none");

    document.querySelectorAll(`#${tableId} .delete`)
      .forEach(btn => btn.style.display = p.privi_delete ? "" : "none");

    document.querySelectorAll(`#${tableId} .share`)
      .forEach(btn => btn.style.display = p.privi_select ? "" : "none");
  }

  // extra elements
  elementIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = p.privi_insert ? "" : "none";
    }
  });

  // DataTable column control
  if (tableId && $.fn.dataTable.isDataTable(`#${tableId}`)) {
    const table = $(`#${tableId}`).DataTable();

    const showActionColumn =
      p.privi_update ||
      p.privi_delete ||
      p.privi_select;

    table.column(-1).visible(showActionColumn);
  }
};


// comman prinf function for report
const printReport = ({
  title = "Report",
  subtitle = "",
  charts = [],
  tableTitle = "Report Details",
  tableid = null,
  generatedDate = new Date().toLocaleString(),
}) => {

  const printWindow = window.open("", "_blank");

  const chartsHtml = charts.length ? `
      <div class="charts-grid">
        ${charts.map(chart => `
          <div class="chart-card">
            <h4>${chart.title}</h4>
            <div class="chart-image-wrap">
              ${chart.image ? `<img src="${chart.image}" alt="${chart.title}" />` : "<span>Chart unavailable</span>"}
            </div>

            ${chart.legend ? `<div class="legend-wrap">${chart.legend}</div>` : ""
    }
          </div>
        `).join("")}
      </div>
    ` : "";

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>

        <style>

          body {
            font-family: Arial, sans-serif;
            padding: 28px;
            color: #1e293b;
          }

          .report-header {
            margin-bottom: 16px;
            text-align: center;
          }

          .report-title {
            margin: 0;
            font-size: 22px;
            font-weight: 700;
          }

          .report-subtitle {
            margin: 6px 0 0 0;
            color: #64748b;
            font-size: 13px;
          }

          .report-meta {
            margin: 8px 0 0 0;
            color: #64748b;
            font-size: 12px;
          }

          .charts-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 20px 0 24px 0;
          }

          .chart-card {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 12px;
          }

          .chart-card h4 {
            margin: 0 0 10px 0;
            font-size: 14px;
            text-transform: uppercase;
            color: #334155;
          }

          .chart-image-wrap {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 220px;
          }

          .chart-image-wrap img {
            max-width: 100%;
            max-height: 230px;
          }

          .legend-wrap {
            margin-top: 12px;
          }

          .table-title {
            font-size: 14px;
            font-weight: 700;
            margin: 8px 0 10px 0;
            text-transform: uppercase;
            color: #334155;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th {
            background-color: #f8fafc;
            color: #64748b;
            text-transform: uppercase;
            font-size: 11px;
            padding: 10px;
            border: 1px solid #e2e8f0;
          }

          td {
            padding: 10px;
            border: 1px solid #e2e8f0;
            font-size: 12px;
          }

          td:first-child,
          th:first-child {
            text-align: center;
            width: 44px;
          }

          @media print {

            body {
              padding: 0;
            }

            .chart-card,
            tr {
              page-break-inside: avoid;
            }
          }

        </style>
      </head>

      <body>

        <div class="report-header">
          <h1 class="report-title">${title}</h1>

          <p class="report-subtitle">
            ${subtitle}
          </p>

          <p class="report-meta">
            Generated on: ${generatedDate}
          </p>
        </div>
        ${chartsHtml}
        <div class="table-title">
          ${tableTitle}
        </div>

        <div>
        ${tableid ? tableid.outerHTML : "<p>No table available</p>"}
        </div>

      </body>
    </html>
  `);

  printWindow.document.close();

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, 500);
};