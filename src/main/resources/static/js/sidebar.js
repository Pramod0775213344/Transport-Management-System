document.addEventListener("DOMContentLoaded", function () {
  // sidebar eka collapese karan fuction eka
  sideBarCollapse();

  // load the module list for the user dom load ekedi call karanwa
  loadModuleWithoutUser();
  // naviate to the current page on dom load karaddi
  breadCrumbItemInTopBar();

  // profile dropdown funstion eka
  profileDropdownFunction();

  notificationDropdownFunction();

  loadNotifications();

  // dom load weddi loge userta adala module list eka search eke fill karanwa
  moduleListForUser = getServiceRequest("/moduleforuser");
  // dataFillIntoDataList(selectModuleList, moduleListForUser, "name");

  // Initialize common modules list
  renderCategorizedModules(moduleListForUser);
  initSearchShortcut();
});


// --------------------------------------------------------------------------------------------------------------
function renderCategorizedModules(modules) {
  const container = document.getElementById("moduleListContainer");
  if (!container) return;

  const groups = {
    OPERATIONS: ["Dashboard", "Booking", "Driver", "Vehicle", "Vehicle Assigning", "Location", "Driver Portal"],
    ADMINISTRATION: ["User", "Employee", "Privilege", "CustomerAgreementApproval", "SupplierAgreementApproval"],
    "REVENUE & ASSETS": ["Revenue", "Fuel", "Package", "Agreement", "CustomerAgreement", "SupplierAgreement", "Customer", "Supplier"],
    "FORMS & CHARTS": ["Report", "Payment", "Invoice", "CustomerPayment", "SupplierPayment"],
  };

  let html = '<div class="row pt-2 px-3">';

  Object.keys(groups).forEach((title) => {
    const sectionModules = modules.filter((m) => groups[title].some((k) => m.name.toLowerCase().includes(k.toLowerCase())));

    if (sectionModules.length > 0) {
      html += `
        <div class="col-md-6 mb-4 search-section">
          <h6 class="search-section-label">${title}</h6>
          <div class="search-items-list">
            ${sectionModules
          .map(
            (m) => `
              <div class="search-item" onclick="navigateModule('${m.name}')">
                <i class="fa-regular ${getIconForModule(m.name)}"></i>
                <span>${m.name}</span>
              </div>
            `,
          )
          .join("")}
          </div>
        </div>
      `;
    }
  });

  html += "</div>";
  container.innerHTML = html;
  initLiveSearch();
}

function getIconForModule(name) {
  const icons = {
    Dashboard: "fa-house",
    Customer: "fa-circle-user",
    Booking: "fa-calendar-check",
    Driver: "fa-id-badge",
    Fleet: "fa-truck-moving",
    Report: "fa-file-lines",
    User: "fa-user-gear",
    Payment: "fa-credit-card",
    Vehicle: "fa-truck-front",
  };
  return icons[name] || "fa-square";
}
// -------------------------------------------------------topbar js---------------------------------

// profile button dropdown eke id eka gnnwa
const profileDropdownFunction = () => {
  const profileBtn = document.querySelector(".profile-btn");
  // profile button click karaddi dropdown eka open karanawa
  const profileDropdown = document.querySelector(".profile-dropdown");
  profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    // Toggle the dropdown visibility
    profileDropdown.classList.toggle("active");
  });
  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!profileDropdown.contains(e.target)) {
      profileDropdown.classList.remove("active");
    }
  });
};

//   -------------------------------------------------------element hide karanwa user anuwa---------------------------------

const loadModuleWithoutUser = () => {

  logedUserDetails = getServiceRequest("/loggeduserdetails").username;

  // admingen nam log wenne mukuth hide karanne na
  if (logedUserDetails === "Admin") {
    return;
  }

  moduleList = getServiceRequest("/modulewithoutuser");
  console.log(moduleList);

  for (const module of moduleList) {
    // space ayin karanna onu
    let formattedName = module.name.toLowerCase().replace(/\s+/g, "-");
    // console.log(formattedName);

    $(`#${formattedName}`).css("display", "none");
    $(`.${formattedName}`).css("display", "none");
  }
  // "sub-menu" class eka thiyena hama div ekakma check karanawa
  $(".sub-menu").each(function () {
    const subMenuId = $(this).attr("id"); // e.g., 'sub-approval'

    // Sub-menu eka athule thiyena visual (visible) items gana balanawa
    // Oyaage sub-items wala thiyenne .sub-item kiyana class eka
    const visibleItems = $(this)
      .find(".sub-item")
      .filter(function () {
        return $(this).css("display") !== "none";
      }).length;

    // Ekama visible item ekakwath naththan main item eka hide karanawa
    if (visibleItems === 0) {
      // sub-menu ekata kalin thiyena a.nav-item eka hide karanawa
      $(this).prev(".nav-item").css("display", "none");
      // sub-menu div ekath hide karanawa
      $(this).css("display", "none");
    }
  });
};

// ------------------------------------------------------dynamically breadcrumb item in top bar-----------------------------
const breadCrumbItemInTopBar = () => {
  // cuurunt location path eka gnnw  / meken split karala first segment eka gnnw
  const currentPath = "/" + window.location.pathname.split("/")[1]; // Get the first segment of the path

  //class path enter as breadcum
  if (currentPath === "/dashboard") {
    document.querySelector("#dashobordPath").innerHTML = `<a style="text-decoration: none; color: #7c3aed" href="${currentPath}">Dashboard</a>`;
  } else {
    curruntPath.style.display = "block";
    document.querySelector("#dashobordPath").innerHTML = `<a class="opacity-5 text-dark" style="text-decoration: none;" href="/dashboard">Dashboard</a>`;
    document.querySelector("#curruntPath").innerHTML =
      `<a style="text-decoration: none; color: #7c3aed" href="${currentPath}">${currentPath.split("/")[1].charAt(0).toUpperCase() + currentPath.split("/")[1].slice(1)}</a>`;
  }
};

//    ----------------------------toggle button handler for sidebar collapse/expand-----------------------------

const sideBarCollapse = () => {
  // sidebar eka gnnw eke class name eken
  const sidebar = document.querySelector(".sidebar");
  // toggle btn eka gnnawa eke class name eken
  const toggleBtn = document.getElementById("menu-toggle");

  const collapsedInit = localStorage.getItem("sidebarCollapsed") === "true";

  if (sidebar) sidebar.classList.toggle("collapsed", collapsedInit);

  if (toggleBtn) toggleBtn.setAttribute("aria-expanded", String(!collapsedInit));

  function closeAllSubmenus() {
    document.querySelectorAll(".submenu.open, .menu-item.open").forEach((el) => el.classList.remove("open"));
  }

  if (collapsedInit) closeAllSubmenus();

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const nowCollapsed = sidebar ? sidebar.classList.toggle("collapsed") : false;
      toggleBtn.setAttribute("aria-expanded", String(!nowCollapsed));
      localStorage.setItem("sidebarCollapsed", String(nowCollapsed));
      if (nowCollapsed) closeAllSubmenus();
    });
  }

  document.querySelectorAll(".has-submenu").forEach((item) => {
    item.addEventListener("click", (e) => {
      if (sidebar && sidebar.classList.contains("collapsed")) {
        e.stopPropagation();
      }
    });
  });
};

//    ---------------------------------new sidebar--------------------------------------------
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("collapsed");
}

function toggleSub(el, id) {
  const sub = document.getElementById(id);
  const isOpen = sub.classList.contains("open");

  // Close all
  document.querySelectorAll(".sub-menu").forEach((m) => m.classList.remove("open"));
  document.querySelectorAll(".nav-item").forEach((i) => i.classList.remove("open"));

  if (!isOpen) {
    sub.classList.add("open");
    el.classList.add("open");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname;

  document.querySelectorAll(".nav-item").forEach((i) => i.classList.remove("active"));
  document.querySelectorAll(".sub-item").forEach((i) => i.classList.remove("active"));

  let matched = false;

  document.querySelectorAll(".sub-menu").forEach((subMenu) => {
    const links = subMenu.querySelectorAll("a[href]");

    links.forEach((link) => {
      const href = link.getAttribute("href");

      if (href && currentPath === href) {
        matched = true;

        const subItem = link.querySelector(".sub-item");
        if (subItem) subItem.classList.add("active");

        const parentNav = subMenu.previousElementSibling;
        if (parentNav && parentNav.classList.contains("nav-item")) {
          parentNav.classList.add("active");
          parentNav.classList.add("open");
        }

        subMenu.classList.add("open");
      }
    });
  });

  if (!matched) {
    document.querySelectorAll("a.nav-item[href]").forEach((navItem) => {
      const href = navItem.getAttribute("href");
      if (href && currentPath === href) {
        navItem.classList.add("active");
      }
    });
  }
});

function initLiveSearch() {
  const searchInput = document.getElementById("moduleSearch");
  if (!searchInput) return;

  searchInput.addEventListener("keyup", function () {
    const filter = this.value.toLowerCase();
    const items = document.querySelectorAll(".search-item");

    items.forEach((item) => {
      const text = item.querySelector("span").innerText.toLowerCase();
      item.style.display = text.includes(filter) ? "flex" : "none";
    });

    document.querySelectorAll(".search-section").forEach((section) => {
      const visibleItems = section.querySelectorAll(".search-item:not([style*='display: none'])");
      section.style.display = visibleItems.length === 0 ? "none" : "block";
    });
  });

  $("#searchModal").on("shown.bs.modal", function () {
    searchInput.focus();
  });
}

function initSearchShortcut() {
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      $("#searchModal").modal("show");
    }
  });
}

function navigateModule(moduleName) {
  const formatted = moduleName.toLowerCase().replace(/\s+/g, "");
  window.location.href = `/${formatted}`;
}

// -------------------top bar notification panale---------------------

// profile button dropdown eke id eka gnnwa
const notificationDropdownFunction = () => {
  const notificationBtn = document.getElementById("notificationBtn");
  // notidfication button click karaddi dropdown eka open karanawa
  const notificationDropdown = document.getElementById("notificationDropdown");

  notificationBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    // Toggle the dropdown visibility
    notificationDropdown.classList.toggle("active");
  });
  // Close dropdown when clicking outside
  // dropdown eka athule click karama close wenne na
  notificationDropdown.addEventListener("click", (e) => {
    e.stopPropagation();

  });

  // dropdown eken pitata click karama close wenawa
  document.addEventListener("click", (e) => {

    if (
      !notificationDropdown.contains(e.target) &&
      !notificationBtn.contains(e.target)
    ) {

      notificationDropdown.classList.remove("active");

    }

  });
};


// alert type eka anuwa bootstrap class eka
const getAlertClass = (alertType) => {
  switch (alertType) {
    case "CREATED": return "alert-primary";
    case "SUCCESS": return "alert-success";
    case "ERROR": return "alert-danger";
    case "WARNING": return "alert-warning";
    case "INFO": return "alert-info";
    default: return "alert-secondary";
  }
};

// alert type eka anuwa icon eka
const getAlertIcon = (alertType) => {
  switch (alertType) {
    case "CREATED": return "fa-circle-plus";
    case "SUCCESS": return "fa-circle-check";
    case "ERROR": return "fa-circle-exclamation";
    case "WARNING": return "fa-triangle-exclamation";
    case "INFO": return "fa-circle-info";
    default: return "fa-bell";
  }
};
//notification show karanwa
// notification show karanwa
const showUnreadNotifications = (notifications) => {
  const container = document.getElementById("notificationContainer");
  const emptyMessage = document.getElementById("emptyMessage");

  container.innerHTML = "";

  if (!notifications || notifications.length === 0) {
    emptyMessage.style.display = "block";
    return;
  }

  emptyMessage.style.display = "none";

  notifications.forEach(notification => {
    const notif = notification.notification || {};
    const alertClass = getAlertClass(notif.alert_type);
    const alertIcon = getAlertIcon(notif.alert_type);
    const timeAgo = notif.created_at ? getRelativeTime(notif.created_at) : "";

    const alertDiv = document.createElement("div");
    alertDiv.className = `notif-card alert ${alertClass} d-flex align-items-start`;
    alertDiv.setAttribute("data-id", notification.id);

    alertDiv.innerHTML = `
      <div class="notif-icon">
        <i class="fa-solid ${alertIcon}"></i>
      </div>
      <div class="notif-body">
        <div class="notif-header">
          <strong class="notif-title">${notif.title || "Notification"}</strong>
          ${timeAgo ? `<span class="notif-time">${timeAgo}</span>` : ""}
        </div>
        <span class="notif-message">${notif.message || ""}</span>
      </div>
      <button type="button" class="btn-close" aria-label="Close"></button>
    `;

    // close button eka click kalama, animate karala remove karanwa
    alertDiv.querySelector(".btn-close").addEventListener("click", () => {
      alertDiv.classList.add("notif-dismiss"); // fade+collapse animation ekak trigger karanwa
      alertDiv.addEventListener("transitionend", () => alertDiv.remove(), { once: true });
      markAsRead(notification.id, alertDiv);
    });

    container.appendChild(alertDiv);
  });
};

const markAsRead = (readStatusId, alertDiv) => {
  // ekaparama UI eken ain karanawa - user ta delay ekak dakinne naha
  alertDiv.remove();

  // backend update eka background ekedi karanawa
  const dataOb = {
    id: readStatusId
  };

  const updateResponse = httpServiceRequest("/notification/read?id=" + readStatusId, "PUT", dataOb);

  if (updateResponse !== "ok") {
    console.error("Failed to mark notification as read:", readStatusId);
    // optional: fail unoth alert eka apahu pennanna puluwan, but usually skip karanawa
  }
};

// mark all as read button eka click karaddi call wenawa
const markAllAsRead = () => {
  const container = document.getElementById("notificationContainer");
  const countNotification = document.getElementById('countNotification');
  countNotification.innerText = "0";
  container.innerHTML = "";
  const emptyMessage = document.getElementById("emptyMessage");
  emptyMessage.style.display = "block";
  const logedUserId = getServiceRequest("/loggeduserdetails").id;
  const updateResponse = httpServiceRequest("/notification/readAll?userId=" + logedUserId, "PUT", null);
  if (updateResponse !== "ok") {
    console.error("Failed to mark all notifications as read:", logedUserId);
  }
};

// notification lod karanwa
const loadNotifications = () => {
  const logedUserId = getServiceRequest("/loggeduserdetails").id;
  // console.log(logedUserId);

  const unreadNotifications = getServiceRequest("/notification/unread?userId=" + logedUserId);
  // console.log(unreadNotifications);
  const countNotification = unreadNotifications.length;
  count = document.getElementById('countNotification');
  count.innerText = countNotification;

  showUnreadNotifications(unreadNotifications);
};

setInterval(loadNotifications, 5000);


// logout karaddi confirmation modal eka pennanwa swal walin
const showLogoutConfirmation = () => {
  Swal.fire({
    title: 'Are you sure you want to logout?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, logout',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = '/logout';
    }
  });
}
