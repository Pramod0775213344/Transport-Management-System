//  ----------------------------------------------------------------------------------------------------------------------------------------
// All Booking Operations Center Logic
let bookings = [];
let allBookingStatuses = [];
let currentFilter = "all";
let dataTable;

window.addEventListener("load", () => {
  loadInitialData();

  // Search bar bridge
  $("#allTableSearch").on("keyup", function () {
    if (dataTable) {
      dataTable.search(this.value).draw();
      refreshCountsOnly();
    }
  });

  // Dropdown filters logic
  $(".filter-select").on("change", () => {
    applyAllFilters();
  });
});

const loadInitialData = () => {
  const overlay = document.querySelector(".table-overlay");
  if (overlay) overlay.style.display = "flex";

  // 1. Fetch data
  allBookingStatuses = getServiceRequest("/bookingstatus/alldata");
  const customers = getServiceRequest("/customer/alldata");
  const vehicles = getServiceRequest("/vehicle/alldata");
  bookings = getServiceRequest("/booking/alldata");

  // 2. Populate filters
  fillFilterDropdown("filterStatus", allBookingStatuses, "status");
  fillFilterDropdown("filterCustomer", customers, "company_name");
  fillFilterDropdown("filterVehicle", vehicles, "vehicle_no");

  // 3. Populate status tabs
  const wrapper = document.getElementById("statusTabsWrapper");
  const allBtn = wrapper.querySelector('[data-status-id="all"]');
  wrapper.innerHTML = "";
  wrapper.appendChild(allBtn);

  allBookingStatuses.forEach((status) => {
    const btn = document.createElement("button");
    btn.className = "premium-tab";
    btn.setAttribute("data-status-id", status.id);
    btn.onclick = () => filterByStatus(status.id, btn);
    btn.innerHTML = `${status.status} <span class="tab-badge" id="count-${status.id}">(0)</span>`;
    wrapper.appendChild(btn);
  });

  loadAllBookingTable(bookings);
  refreshStatusCounts();

  if (overlay) overlay.style.display = "none";
};

const fillFilterDropdown = (elementId, data, property) => {
  const select = document.getElementById(elementId);
  data.forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.text = item[property];
    select.appendChild(opt);
  });
};

const refreshStatusCounts = (currentData = bookings) => {
  document.getElementById("count-all").innerText = `(${bookings.length})`;
  allBookingStatuses.forEach((status) => {
    const count = bookings.filter((b) => b.booking_status_id.id === status.id).length;
    const badge = document.getElementById(`count-${status.id}`);
    if (badge) badge.innerText = `(${count})`;
  });

  document.getElementById("totalCount").innerText = bookings.length;
  refreshCountsOnly();
};

const refreshCountsOnly = () => {
  // Small delay to let DataTable finish redrawing if called from event
  setTimeout(() => {
    const visibleRows = document.querySelectorAll("#allBookingTableBody tr").length;
    document.getElementById("showingCount").innerText = visibleRows;
  }, 50);
};

const loadAllBookingTable = (data) => {
  if ($.fn.dataTable.isDataTable("#allBookingTable")) {
    $("#allBookingTable").DataTable().clear().destroy();
  }

  const tableBody = document.getElementById("allBookingTableBody");
  tableBody.innerHTML = "";

  data.forEach((item) => {
    const tr = document.createElement("tr");

    // Column 1: Booking ID + Copy
    const tdID = document.createElement("td");
    tdID.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="fw-bold text-dark">${item.booking_no}</span>
                <i class="fa-regular fa-copy copy-icon" onclick="copyToClipboard('${item.booking_no}')" title="Copy ID"></i>
            </div>
        `;
    tr.appendChild(tdID);

    // Column 2: Customer (Avatar + Name)
    const tdCust = document.createElement("td");
    const initial = item.customer_id.company_name.charAt(0).toUpperCase();
    tdCust.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <div class="customer-avatar">${initial}</div>
                <div>
                    <div class="fw-bold color-dark-800">${item.customer_id.company_name}</div>
                    <div class="text-muted small">${item.booking_contact_person_mobileno || "No Mobile"}</div>
                </div>
            </div>
        `;
    tr.appendChild(tdCust);

    // Column 3: Route & Vehicle
    const tdRoute = document.createElement("td");
    tdRoute.innerHTML = `
            <div>
                <div class="d-flex align-items-center gap-2 mb-1">
                    <span class="small text-muted text-truncate" style="max-width: 120px;">${item.pickup_locations_id.name}</span>
                    <i class="fa-solid fa-arrow-right-long text-muted" style="font-size: 0.7rem;"></i>
                    <span class="small text-muted text-truncate" style="max-width: 120px;">${item.delivery_locations_id.name}</span>
                </div>
                <div class="small fw-bold text-primary">${item.vehicle_type_id.name}</div>
            </div>
        `;
    tr.appendChild(tdRoute);

    // Column 4: Distance
    const tdDist = document.createElement("td");
    tdDist.innerHTML = `<span class="fw-bold">${item.distance} KM</span>`;
    tr.appendChild(tdDist);

    // Column 5: Status (Interative Pill)
    const tdStatus = document.createElement("td");
    const statusName = item.booking_status_id.status;
    let pillClass = "sp-processing";
    if (statusName === "Completed") pillClass = "sp-delivered";
    if (statusName === "Cancelled") pillClass = "sp-cancelled";
    if (statusName.includes("way") || statusName === "Departed" || statusName === "On the way") pillClass = "sp-intransit";
    if (statusName === "Delayed") pillClass = "sp-delayed";

    tdStatus.innerHTML = `
            <div class="dropdown">
                <button class="status-pill-modern ${pillClass} border-0 dropdown-toggle w-100" data-bs-toggle="dropdown" aria-expanded="false">
                    ${statusName}
                </button>
                <ul class="dropdown-menu shadow-sm border-0 animated-dropdown">
                    ${allBookingStatuses.map((s) => `<li><a class="dropdown-item small py-2" href="#" onclick="updateStatus(${item.id}, ${s.id})">${s.status}</a></li>`).join("")}
                </ul>
            </div>
        `;
    tr.appendChild(tdStatus);

    // Column 6: Delivery Date
    const tdDate = document.createElement("td");
    const dDate = new Date(item.delivery_date_time);
    tdDate.innerHTML = `<div class="text-dark fw-500">${dDate.toLocaleDateString("en-CA")}</div>`;
    tr.appendChild(tdDate);

    // Column 7: Actions Menu
    const tdActions = document.createElement("td");
    tdActions.className = "text-end";
    tdActions.innerHTML = `
            <button class="action-dot-btn" data-bs-toggle="dropdown">
                <i class="fa-solid fa-ellipsis"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0">
                <li><a class="dropdown-item py-2" href="#" onclick="viewDetailsById(${item.id})"><i class="fa-solid fa-eye me-2"></i>View Details</a></li>
                <li><a class="dropdown-item py-2" href="#" onclick="editBooking(${item.id})"><i class="fa-solid fa-pen me-2"></i>Edit Shipment</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item py-2 text-danger" href="#"><i class="fa-solid fa-ban me-2"></i>Cancel Trip</a></li>
            </ul>
        `;
    tr.appendChild(tdActions);

    tableBody.appendChild(tr);
  });

  dataTable = $("#allBookingTable").DataTable({
    dom: "rtip",
    pageLength: 10,
    ordering: true,
    language: {
      paginate: {
        previous: '<i class="fa-solid fa-chevron-left"></i>',
        next: '<i class="fa-solid fa-chevron-right"></i>',
      },
    },
  });
};

const applyAllFilters = () => {
  const statusVal = document.getElementById("filterStatus").value;
  const customerVal = document.getElementById("filterCustomer").value;
  const vehicleVal = document.getElementById("filterVehicle").value;

  let filtered = bookings;

  if (statusVal) filtered = filtered.filter((b) => b.booking_status_id.id == statusVal);
  if (customerVal) filtered = filtered.filter((b) => b.customer_id.id == customerVal);
  if (vehicleVal) filtered = filtered.filter((b) => b.vehicle_id && b.vehicle_id.id == vehicleVal);

  loadAllBookingTable(filtered);
  refreshCountsOnly();
};

const filterByStatus = (statusId, el) => {
  currentFilter = statusId;
  document.querySelectorAll(".premium-tab").forEach((tab) => tab.classList.remove("active"));
  el.classList.add("active");

  // Sync the status filter dropdown
  document.getElementById("filterStatus").value = statusId === "all" ? "" : statusId;

  let filtered = statusId === "all" ? bookings : bookings.filter((b) => b.booking_status_id.id == statusId);
  loadAllBookingTable(filtered);
  refreshCountsOnly();
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: "Booking ID copied to clipboard",
    showConfirmButton: false,
    timer: 1500,
  });
};

const updateStatus = (bookingId, newStatusId) => {
  const booking = bookings.find((b) => b.id === bookingId);
  const status = allBookingStatuses.find((s) => s.id === newStatusId);

  Swal.fire({
    title: "Change Shipment Status?",
    text: `Update ${booking.booking_no} to "${status.status}"?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#7c3aed",
    confirmButtonText: "Confirm Update",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      let updatePayload = JSON.parse(JSON.stringify(booking));
      updatePayload.booking_status_id = status;

      let response = httpServiceRequest("/booking/update", "PUT", updatePayload);
      if (response === "ok") {
        Swal.fire({
          icon: "success",
          title: "Status Updated",
          showConfirmButton: false,
          timer: 1500,
        });
        loadInitialData(); // Full refresh to sync counts and filters
      } else {
        Swal.fire("Update Failed", response, "error");
      }
    }
  });
};

const viewDetailsById = (id) => {
  const data = bookings.find((b) => b.id === id);
  if (!data) return;

  document.getElementById("viewBookingNoHead").innerText = data.booking_no;
  document.getElementById("viewBookingRefHead").innerText = `System ID: ${data.id} | Tracked by TMS`;

  document.getElementById("viewBookingNo").innerText = data.booking_no;
  document.getElementById("viewBookingStatus").innerText = data.booking_status_id.status;
  document.getElementById("viewCustomerName").innerText = data.customer_id.company_name;
  document.getElementById("viewVehicleType").innerText = data.vehicle_type_id.name;
  document.getElementById("viewContactPersonName").innerText = data.booking_contact_person_name;
  document.getElementById("viewContactPersonPhone").innerText = data.booking_contact_person_mobileno;

  document.getElementById("dataPickupLocation").innerText = data.pickup_locations_id.name;
  document.getElementById("dataPickupDateAndTime").innerText = new Date(data.pickup_date_time).toLocaleString();
  document.getElementById("dataDeliveryLocation").innerText = data.delivery_locations_id.name;
  document.getElementById("dataDeliveryDateAndTime").innerText = new Date(data.delivery_date_time).toLocaleString();
  document.getElementById("dataDistance").innerText = data.distance + " km";

  $("#bookingViewForm").modal("show");
};

const editBooking = (id) => {
  window.location.href = `/booking?edit_id=${id}`;
};
