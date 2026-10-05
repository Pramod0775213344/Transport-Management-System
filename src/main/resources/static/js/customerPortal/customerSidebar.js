document.addEventListener("DOMContentLoaded", function () {
    // 1. Handle Sidebar Collapse State from LocalStorage
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("menu-toggle");
    
    if (localStorage.getItem("customerSidebarCollapsed") === "true") {
        sidebar.classList.add("collapsed");
    }

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const isCollapsed = sidebar.classList.toggle("collapsed");
            localStorage.setItem("customerSidebarCollapsed", isCollapsed);
        });
    }

    // 2. Active Link Highlighting & Breadcrumbs
    updateNavigationState();
    
    // 3. Profile Dropdown Logic
    initProfileDropdown();
});

/** 
 * Updates the active state of navigation links and sets breadcrumbs
 */
function updateNavigationState() {
    const currentPath = window.location.pathname;
    const breadcrumbCurrent = document.getElementById("curruntPath");
    const breadcrumbDash = document.getElementById("dashobordPath");

    // Clear previous active states
    document.querySelectorAll(".nav-item, .sub-item").forEach(el => el.classList.remove("active", "open"));
    document.querySelectorAll(".sub-menu").forEach(el => el.classList.remove("open"));

    let matched = false;

    // Check sub-items
    document.querySelectorAll(".sub-menu a").forEach(link => {
        if (link.getAttribute("href") === currentPath) {
            const subItem = link.querySelector(".sub-item");
            if (subItem) subItem.classList.add("active");
            
            const subMenu = link.closest(".sub-menu");
            if (subMenu) {
                subMenu.classList.add("open");
                const parentNav = subMenu.previousElementSibling;
                if (parentNav) parentNav.classList.add("active", "open");
            }
            matched = true;
        }
    });

    // Check main items
    if (!matched) {
        document.querySelectorAll("a.nav-item").forEach(link => {
            if (link.getAttribute("href") === currentPath) {
                link.classList.add("active");
            }
        });
    }

    // Update Breadcrumbs
    if (breadcrumbDash) {
        if (currentPath === "/customerdashboard") {
            breadcrumbDash.innerHTML = `<span style="color: #7c3aed">Dashboard</span>`;
            if (breadcrumbCurrent) breadcrumbCurrent.style.display = "none";
        } else {
            breadcrumbDash.innerHTML = `<a href="/customerdashboard" class="text-muted" style="text-decoration: none">Dashboard</a>`;
            if (breadcrumbCurrent) {
                breadcrumbCurrent.style.display = "block";
                const pageName = currentPath.split("/").pop();
                const formattedName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
                breadcrumbCurrent.innerHTML = `<span style="color: #7c3aed">${formattedName}</span>`;
            }
        }
    }
}

/**
 * Toggle Sub-menu visibility
 */
function toggleSub(el, id) {
    const sub = document.getElementById(id);
    const isOpen = sub.classList.contains("open");

    document.querySelectorAll(".sub-menu.open").forEach(m => {
        if (m.id !== id) {
            m.classList.remove("open");
            m.previousElementSibling.classList.remove("open");
        }
    });

    if (isOpen) {
        sub.classList.remove("open");
        el.classList.remove("open");
    } else {
        sub.classList.add("open");
        el.classList.add("open");
    }
}

/**
 * Initialize Profile Dropdown
 */
function initProfileDropdown() {
    const profileBtn = document.querySelector(".profile-btn");
    const profileDropdown = document.querySelector(".profile-dropdown");

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle("active");
        });

        document.addEventListener("click", (e) => {
            if (!profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove("active");
            }
        });
    }
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
  console.log(logedUserId);

  const unreadNotifications = getServiceRequest("/notification/unread?userId=" + logedUserId);
  console.log(unreadNotifications);
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