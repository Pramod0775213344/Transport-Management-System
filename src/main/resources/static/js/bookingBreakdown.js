// ================= load =========================================
document.addEventListener("DOMContentLoaded", function () {


    setTimeout(() => {
        try {
            loadBookingCardList();
            refresh();
        } catch (e) {
            console.error("Error during supplier page initialization:", e);
        } finally {
            // Reveal the content after all synchronous data is fetched
            finishPageLoading();
        }
    }, 100);

});

// ================= end load ========================================


// =============== boking card list load =============================

// booking List eka gnnawa pending
// pending booking ekak nam witharai eka breakdwon widihata flag karanna puluwan

const loadBookingCardList = () => {

    pendingBookingList = getServiceRequest("/booking/activeBookings");
    console.log(pendingBookingList);
    createBookingCard(pendingBookingList);
}

const createBookingCard = (bookingList) => {

    const cardContainer = document.getElementById("bookingListContainer");
    cardContainer.innerHTML = ""; // Clear existing cards


    bookingList.forEach(booking => {

        if (booking.is_breakdown) {
            statusbar = "status-inactive";
            status = "Breakdown";

        } else {
            statusbar = "status-pending";
            status = "On Going";
        }

        const card = document.createElement("div");
        card.className = "pendingBookingcard";
        card.innerHTML = `
       <div class="card-header">
        <span class="card-title">#${booking.booking_no}</span>
        <span class="status-badge ${statusbar}">${status}</span>
      </div>
      <div class="route-details"><span>${booking.pickup_locations_id.name}</span> → <span>${booking.delivery_locations_id.name}</span></div>
      <div class="vehicle-details"><span>${booking.vehicle_id.vehicle_no}</span> → <span>${booking.driver_id.fullname}</span></div>
    `;
        cardContainer.appendChild(card);

        card.addEventListener("click", () => {
            viewBookingDetails(booking);
        });
    });
}
// ================= end booking card list ================================


// =================== type and serach =====================================
// type and serach eka
document.getElementById("searchBookingInput")?.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = pendingBookingList.filter(b => {
        const bookingNo = (b.booking_no || "").toLowerCase();
        const vehicle = (b.vehicle_id?.vehicle_no || "").toLowerCase();
        const driverName = (b.employee_id?.fullname || "").toLowerCase();
        const pickupLocation = (b.pickup_locations_id?.name || "").toLowerCase();
        const deliveryLocation = (b.delivery_locations_id?.name || "").toLowerCase();
        return bookingNo.includes(query) || vehicle.includes(query) || driverName.includes(query) || pickupLocation.includes(query) || deliveryLocation.includes(query);
    });
    createBookingCard(filtered);
});
// ================= end type and serach ====================================



// ================= booking details view ===================================
const viewBookingDetails = (booking) => {

    // active card eka color karanwa
    const activeCard = document.querySelector(".pendingBookingcard.active");
    if (activeCard) {
        activeCard.classList.remove("active");
    }

    // click kala eka active karanwa
    event.currentTarget.classList.add("active");

    emptyState.style.display = "none";
    bookingDetails.style.display = "block";
    is_breakdown = booking.is_breakdown;

    if (is_breakdown) {

        viewBookingStatus.textContent = "Breakdown";
        viewBookingStatus.classList.remove("status-attend");
        viewBookingStatus.classList.add("status-inactive");
        reportBreakdownBtn.disabled = true;
    } else {
        viewBookingStatus.textContent = "On Going";
        viewBookingStatus.classList.remove("status-inactive");
        viewBookingStatus.classList.add("status-pending");
        reportBreakdownBtn.disabled = false;
    }
    viewBookingNo.textContent = booking.booking_no;
    viewPickupLocation.textContent = booking.pickup_locations_id.name;
    viewDeliveryLocation.textContent = booking.delivery_locations_id.name;

    viewArrivedAtPickupTime.innerText = booking.arrived_at_pickup_datetime ? datetimeformat(booking.arrived_at_pickup_datetime) : "Not yet updated";
    viewDepartedFromPickupTime.innerText = booking.departed_from_pickup_datetime ? datetimeformat(booking.departed_from_pickup_datetime) : "Not yet updated";
    viewArrivedAtDelivery.innerText = booking.arrived_at_delivery_datetime ? datetimeformat(booking.arrived_at_delivery_datetime) : "Not yet updated";
    viewDepartedFromDelivery.innerText = booking.departed_from_delivery_datetime ? datetimeformat(booking.departed_from_delivery_datetime) : "Not yet updated";


    viewCurrentVehicle.textContent = booking.vehicle_id.vehicle_no;
    viewCurrentDriver.textContent = booking.driver_id.fullname;

    bookingId = booking.id

    // breadown object ekara data bid karanwa
    bookingBreakdown.booking_id = booking;

    bookingBreakdown.old_vehicle_id = booking.vehicle_id.id;
    bookingBreakdown.old_driver_id = booking.driver_id.id;
    bookingBreakdown.old_arrived_at_pickup_datetime = booking.arrived_at_pickup_datetime;
    bookingBreakdown.old_departed_from_pickup_datetime = booking.departed_from_pickup_datetime;
    bookingBreakdown.old_arrived_at_delivery_datetime = booking.arrived_at_delivery_datetime;
    bookingBreakdown.old_departed_from_delivery_datetime = booking.departed_from_delivery_datetime;

}

// ================= end booking details view ================================



// ================= brakdwon mark and unmark functioms ======================
// braedown eka mark karanwa
const markBookingAsBreakdown = () => {

    // confirmation ekak display karanwa
    // swal walin
    let userConfirm = Swal.fire({
        title: "Confirm Breakdown",
        text: "Are you sure you want to mark this booking as a breakdown?",
        icon: "warning",
        iconColor: "#ef4444",
        showCancelButton: true,
        confirmButtonText: "Yes, Mark as Breakdown",
        cancelButtonText: "No, Keep it",
        allowOutsideClick: false,
        customClass: {
            cancelButton: "btn-cancel",
            confirmButton: "btn-submit", // Keeping consistent with  system
            popup: "swal2-border-radius",
        },
    }).then((userConfirm) => {
        if (userConfirm.isConfirmed) {
            //call post service
            let postResponse = httpServiceRequest("/bookingbreakdown/markAsBreakdown", "PUT", bookingId);
            if (postResponse == "ok") {
                Swal.fire({
                    title: "Breakdown Marked!",
                    text: "The booking has been successfully marked as a breakdown.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: {
                        popup: "swal2-border-radius",
                    },
                });
                // cuurrent booking list eka refresh karanwa
                refresh();
                // empty state eka display karanwa
                emptyState.style.display = "block";
                bookingDetails.style.display = "none";
            } else {
                Swal.fire({
                    title: "Breakdown Marking Failed",
                    text: postResponse,
                    icon: "error",
                    allowOutsideClick: false,
                    customClass: {
                        confirmButton: "btn-submit",
                        popup: "swal2-border-radius",
                    },
                });
            }
        } else if (userConfirm.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: "Cancelled",
                text: "Details not marked as breakdown!",
                icon: "error",
                customClass: {
                    confirmButton: "btn btn-1",
                    popup: "swal2-border-radius",
                },
            });
        }
    });
};

// breakdown eka false karanna
const unmarkBookingAsBreakdown = () => {

    Swal.fire({
        title: "Confirm Unmark",
        text: "Are you sure you want to unmark this booking as a breakdown?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Unmark as Breakdown",
        cancelButtonText: "Cancel",
        allowOutsideClick: false,
        customClass: {
            cancelButton: "btn-cancel",
            confirmButton: "btn-submit",
            popup: "swal2-border-radius",
        },
    }).then((result) => {
        if (result.isConfirmed) {
            httpServiceRequest("/bookingbreakdown/unmarkAsBreakdown", "PUT", bookingId);
        }
    });
}
// ================= end breakdown mark and unmark functions ==================


// ================= refresh function ==========================================
// refresh karanwa booking list eka
const refresh = () => {
    bookingBreakdown = new Object();
    loadBookingCardList();

    // clear vehicle and driver select fields
    newVehicle.innerHTML = "";
    newDriver.innerHTML = "";
    // date fields clear karanwa
    newArrivedAtPickuptime.value = "";
    newDepartedFromPickupTime.value = "";
    newArrivedAtDelivery.value = "";
    newDepartedFromDelivery.value = "";

}
// ================= end refresh function =====================================