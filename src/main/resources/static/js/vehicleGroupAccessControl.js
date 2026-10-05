window.addEventListener("load", () => {
    setTimeout(() => {
        try {
            loadCoordinatorsCardList();     // Load coordinators, then auto-select the first one
            refreshVehicleGroupsForm();     // Clear the form
        } catch (e) {
            console.error("Error during vehicle group page initialization:", e);
        } finally {
            finishPageLoading();
        }
    }, 100);
});

// all coordinator la tika store karagannawa globally
let allCoordinators = [];

// coardinators la list eka load karanwa
const loadCoordinatorsCardList = () => {
    // get coordinator list eka backend eken gnnawa
    const coordinatorList = getServiceRequest("/user/coordinatorlist");
    console.log(coordinatorList);

    if (coordinatorList && coordinatorList.length > 0) {
        allCoordinators = coordinatorList;
        createCardForCoordinatorList(coordinatorList);
        selectCoordinator(coordinatorList[0].id);
    } else {
        showVehicleGroupsEmptyState();
    }
};

const createCardForCoordinatorList = (list) => {

    // clear karanwa coordinator list eka
    const container = document.getElementById("coordinatorCardListContainer");
    container.innerHTML = "";

    // lenght eka 0 nam "no coordinators found" message eka display karanwa
    if (list.length === 0) {
        container.innerHTML = `<div class="coord-empty">No coordinators found.</div>`;
        return;
    }

    // cordinator card eka create karanwa
    list.forEach(coordinator => {
        // emplyee object eka gnnawa
        const employee = coordinator.employee_id || {};
        // emplyee full name eka variable ekaakata asiign karagnnawa
        const fullname = employee.fullname || coordinator.username;
        // employeege department eka variable ekaakata assign karagnnawa
        const department = employee.department_id?.name || "-";

        // name eke initials gnnawa
        const initials = fullname ? fullname.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase() : "NA";

        // row ekaka create karanwa
        const row = document.createElement("div");
        row.className = "coordRow";
        // coordinator id eka row ekata assign karanwa
        // ethkota click karaddi id eka gnna puluwan
        row.dataset.userId = coordinator.id;

        // row ekata innerHTML eka assign karanwa
        row.innerHTML = `
            <div class="coordAvatar">${initials}</div>
            <div class="coordInfo">
                <div class="coordName">${fullname}</div>
                <div class="coordRegion">${department}</div>
            </div>
            <div class="coordCount" id="groupCount-${coordinator.id}">&hellip;</div>
        `;

        // row ekata click event ekak add karanwa
        row.onclick = () => {
            selectCoordinator(coordinator.id);
        }

        container.appendChild(row);

        // meka comment karala thibba nisa count badge eka ekkath render wenne na thibbe
        loadAssignedGroupCount(coordinator.id);
    });
};

// coordinator select karaddi, vehicle group list eka load karanwa
const selectCoordinator = (userId) => {
    loadVehicleGroupsForUser(userId);
};

// search karana function eka
document.getElementById("coordSearchInput")?.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allCoordinators.filter(c => {
        const fullname = (c.employee_id?.fullname || c.username || "").toLowerCase();
        const department = (c.employee_id?.department_id?.name || "").toLowerCase();
        return fullname.includes(query) || department.includes(query);
    });
    createCardForCoordinatorList(filtered);
});

// vehicle group list eka load karanwa
let allVehicleGroups = [];
let assignedGroupIds = [];
let currentCoordinatorId = null;

// vehicle group list eka load karanwa
const loadVehicleGroupsForUser = (userId) => {
    // user id eka null nam return karanwa
    if (!userId) return;

    currentCoordinatorId = userId;

    const groupList = getServiceRequest("/vehiclegroup/alldata");
    // meka backend eken active (status=true) association tikama witharak enna oni
    const assignedIds = getServiceRequest("/vehiclegroup/getbyuserid?userid=" + userId);

    // gruop list eka assign karanwa allVehicleGroups variable ekata
    allVehicleGroups = Array.isArray(groupList) ? groupList : [];

    // assigned group ids eka assign karanwa assignedGroupIds variable ekata
    assignedGroupIds = Array.isArray(assignedIds) ? assignedIds : [];

    renderVehicleGroupCards(allVehicleGroups);

    detailAvatar.innerText = allCoordinators.find(c => c.id === userId)?.employee_id?.fullname?.split(" ").map(n => n[0]).join("").toUpperCase() || "NA";
    detailName.innerText = allCoordinators.find(c => c.id === userId)?.employee_id?.fullname || "Unknown";
    detailEmail.innerText = allCoordinators.find(c => c.id === userId)?.email || "Unknown";
};

// gropu mukuth naththan show karanwa meka
const showVehicleGroupsEmptyState = () => {
    const container = document.getElementById("vehicleGroupCardListContainer");
    if (container) {
        container.innerHTML = `<div class="empty">No coordinators available.</div>`;
    }
};

// card eka creat karanwa vehicle group list eka display karanwa
const renderVehicleGroupCards = (groups) => {
    // clear karanwa vehicle group list eka
    const container = document.getElementById("vehicleGroupCardListContainer");
    container.innerHTML = "";

    // length eka 0 nam "no vehicle groups found" message eka display karanwa
    if (groups.length === 0) {
        container.innerHTML = `<div class="empty">No vehicle groups found.</div>`;
        return;
    }

    // vehicel grop list eken ekin eka group card ekak create karanwa
    groups.forEach(group => {
        // assigned group ids list ekata group id eka thiyenawada kiyala check karanwa
        const assignedGroup = assignedGroupIds.includes(group.id);
        const companyName = group.customer_id?.company_name || "No customer linked";

        const groupName = group.name;

        // const groupName = "Linuka Fleet";
        // groupName.split(" ") → ["Linuka", "Fleet"]  space eka nam split karanwa
        // .map(word => word[0]) → ["L", "F"]   hama word ekatama adal palwena akura gnnawa
        // .join("") → "LF"         arraye eka thiyena tring aluru tika ekata ekathu karanawa
        //.toUpperCase() → "LF"  akuru tika upper case karanwa   
        const plateCode = groupName.split(" ").map(word => word[0]).join("").toUpperCase();

        const card = document.createElement("div");
        card.className = `groupCard ${assignedGroup ? "on" : ""}`;
        card.dataset.vehicleGroupId = group.id;

        card.innerHTML = `
            <span class="plate">${plateCode}</span>
            <div class="info">
                <div class="name">${group.name}</div>
                <div class="meta">${companyName}</div>
            </div>
            <button class="switch ${assignedGroup ? "on" : ""}" data-group-id="${group.id}">
                <span class="switch-knob"></span>
            </button>
        `;

        card.querySelector(".switch").addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent card click event
            editVehicleGroupAccess(group.id, assignedGroup);
        });

        container.appendChild(card);
    });
};

const editVehicleGroupAccess = (vehicleGroupId, isCurrentlyAssigned) => {
    if (!currentCoordinatorId) return;

    // user id ekata adala user object eka gnnawa
    const user = allCoordinators.find(c => c.id === currentCoordinatorId);
    if (!user) {
        console.error("User not found");
        return;
    }
    // grop id ekata adala group object eka gnnawa
    const group = allVehicleGroups.find(g => g.id === vehicleGroupId);
    if (!group) {
        console.error("Vehicle group not found");
        return;
    }
    // group access eka object ekakata assign karanwa
    const userhasVehicleGroup = {
        user_id: user,
        vehicle_group_id: group,
    };

    let response;

    if (isCurrentlyAssigned) {
        // access eka aya gannawa - status false karanwa (row delete karanne na)
        userhasVehicleGroup.status = false;
        response = httpServiceRequest("/uservehiclegroup/update", "PUT", userhasVehicleGroup);
    } else {
        // aluthin assign karanwa - status true (backend eke thiyena row ekma reactivate wenna puluwan)
        userhasVehicleGroup.status = true;
        response = httpServiceRequest("/uservehiclegroup/insert", "POST", userhasVehicleGroup);
    }

    if (response == "ok") {
        Swal.fire({
            title: "Access Updated!",
            text: "The coordinator's vehicle group access has been updated.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            customClass: { popup: "swal2-border-radius" },
        });
        // meka witharai wena oni - passe pitatama ayeth call karanna ona na
        loadVehicleGroupsForUser(currentCoordinatorId);
        loadAssignedGroupCount(currentCoordinatorId);
    } else {
        Swal.fire({
            title: "Update Failed",
            text: response,
            icon: "error",
            customClass: { confirmButton: "btn btn-1", popup: "swal2-border-radius" },
        });
    }
};

// coordinator card eke group count badge eka update karanwa
const loadAssignedGroupCount = (userId) => {
    const countEl = document.getElementById(`groupCount-${userId}`);
    if (!countEl) return;

    // backend active (status=true) association tika witharak return karanawa kiyala assume karanwa
    const assignedIds = getServiceRequest("/vehiclegroup/getbyuserid?userid=" + userId);
    countEl.innerText = Array.isArray(assignedIds) ? assignedIds.length : 0;
};

// gropu serach karan eka
document.getElementById("vehicleGroupSearchInput")?.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allVehicleGroups.filter(g =>
        (g.name ?? "").toLowerCase().includes(query) ||
        (g.customer_id?.company_name ?? "").toLowerCase().includes(query)
    );
    renderVehicleGroupCards(filtered);
});

const refreshVehicleGroupsForm = () => {
    currentCoordinatorId = null;
    assignedGroupIds = [];
};