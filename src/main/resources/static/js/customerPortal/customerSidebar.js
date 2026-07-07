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
