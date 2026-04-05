let bookingListForContainer = [];

window.addEventListener("load", () => {
  realoadCard();

  // Use Event Delegation to handle clicks on dynamically generated buttons
  const cardContainer = document.querySelector("#cardContainer");
  if (cardContainer) {
    cardContainer.addEventListener("click", (e) => {
      const btn = e.target;
      const index = btn.getAttribute("data-index");

      const now = new Date();
      const tzoffset = new Date().getTimezoneOffset() * 60000; // milliseconds walin hadagannawa
      const localISOTime = new Date(Date.now() - tzoffset)
        .toISOString()
        .split(".")[0];

      // 1. Reached Pickup
      if (btn.classList.contains("btn-Reached-Pickup")) {
        const booking = bookingListForContainer[index];

        // object ekata bind karanwa
        booking.arrived_at_pickup_datetime = localISOTime;
        console.log(booking);

        DriverAlert.confirm(
          "Reached Pickup?",
          "Confirm that you have arrived at the terminal and ready to load.",
        ).then((result) => {
          if (result === "confirm") {
            let putResponse = httpServiceRequest(
              "/vehicleassigning/arrivedatpickupdatetime",
              "PUT",
              booking,
            );

            if (putResponse == "ok") {
              DriverAlert.success(
                "Status Updated",
                "You have successfully reached the pickup point.",
              );
              realoadCard();
            }
          }
        });
      }

      // 2. Loaded & Start
      if (btn.classList.contains("btn-Loaded")) {
        const booking = bookingListForContainer[index];

        const startTrip = (meterReading = null) => {
          // object ekata bind karanwa
          booking.departed_from_pickup_datetime = localISOTime;
          if (meterReading) {
            booking.strat_meter_reading = meterReading;
          }

          let putResponse = httpServiceRequest(
            "/vehicleassigning/arrivedatpickupdatetime",
            "PUT",
            booking,
          );

          if (putResponse == "ok") {
            DriverAlert.success(
              "Trip Started",
              "Safe journey! Status updated to On Route.",
            );
            realoadCard();
          }
        };

        const packageType =
          booking.customer_agreement_id.package_id.package_type;

        if (packageType == "Fix Rate") {
          DriverAlert.inputPrompt(
            "Start Meter Reading",
            "This is a Fix Rate package. Please enter the current vehicle meter reading to start the journey.",
            "Enter meter reading (e.g. 12500)",
            "number",
          ).then((result) => {
            if (result.id === "confirm") {
              const enteredValue = parseFloat(result.value);
              const currentVehicleMeter = parseFloat(
                booking.vehicle_id?.current_meter_reading || 0,
              );

              if (!result.value || result.value.trim() === "") {
                DriverAlert.warning(
                  "Required",
                  "Meter reading is mandatory for Fix Rate packages.",
                );
              } else if (enteredValue < currentVehicleMeter) {
                DriverAlert.warning(
                  "Invalid Reading",
                  `Start reading cannot be less than the current vehicle meter reading (${currentVehicleMeter}).`,
                );
              } else {
                startTrip(result.value);
              }
            }
          });
        } else {
          DriverAlert.confirm(
            "Confirm Loading",
            "Are the items loaded and are you starting the journey?",
          ).then((result) => {
            if (result === "confirm") {
              startTrip();
            }
          });
        }
      }

      // 3. Reached Destination
      if (btn.classList.contains("btn-Reached-Destination")) {
        const booking = bookingListForContainer[index];
        // object ekata bind karanwa
        booking.arrived_at_delivery_datetime = localISOTime;

        DriverAlert.confirm(
          "Arrived at Destination?",
          "Confirm that you have reached the delivery location.",
        ).then((result) => {
          if (result === "confirm") {
            let putResponse = httpServiceRequest(
              "/vehicleassigning/arrivedatpickupdatetime",
              "PUT",
              booking,
            );

            if (putResponse == "ok") {
              DriverAlert.success(
                "Arrival Confirmed",
                "Status updated: Reached Destination.",
              );
              realoadCard();
            }
          }
        });
      }

      // 4. Finish Job
      if (btn.classList.contains("btn-Finish")) {
        const booking = bookingListForContainer[index];

        const finishJob = (endMeter = null) => {
          // object ekata bind karanwa
          booking.departed_from_delivery_datetime = localISOTime;
          if (endMeter) {
            booking.end_meter_reading = endMeter;

            // Calculate distance (diff between end and start)
            const startMeter = parseFloat(booking.strat_meter_reading || 0);
            const distanceDiff = parseFloat(endMeter) - startMeter;

            // object ekata bind karanwa (distance eka String ekak widihata thiyenne modal eke)
            booking.distance = distanceDiff.toString();
            console.log("Calculated Distance:", booking.distance);
          }

          let putResponse = httpServiceRequest(
            "/vehicleassigning/arrivedatpickupdatetime",
            "PUT",
            booking,
          );

          if (putResponse == "ok") {
            DriverAlert.success(
              "Job Completed!",
              "Great work! Revenue has been added to your wallet.",
            );
            realoadCard();
          }
        };

        DriverAlert.inputPrompt(
          "Finish Trip?",
          "Enter the final vehicle meter reading to complete this assignment. This will finalize your earnings.",
          "Final meter reading (e.g. 12650)",
          "number",
        ).then((result) => {
          if (result.id === "confirm") {
            const enteredEndValue = parseFloat(result.value);
            const startValue = parseFloat(booking.strat_meter_reading || 0);

            if (!result.value || result.value.trim() === "") {
              DriverAlert.warning(
                "Required",
                "Final meter reading is required to complete the trip.",
              );
            } else if (enteredEndValue < startValue) {
              DriverAlert.warning(
                "Invalid Reading",
                `End reading cannot be less than the start meter reading (${startValue}).`,
              );
            } else {
              finishJob(result.value);
            }
          }
        });
      }
    });
  }
});

const realoadCard = () => {
  let loggedUser = getServiceRequest("/loggeduserdetails");
  if (loggedUser && loggedUser.driver_id) {
    bookingListForContainer = getServiceRequest(
      "/booking/frodriverportal?driverid=" + loggedUser.driver_id,
    );
    if (bookingListForContainer) {
      fillDataIntoCard(bookingListForContainer);
    }
  }
};

// Helper to clean up ISO date strings (remove 'T' and refine format for drivers)
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return "";
  // Replace 'T' with ' | ' and remove seconds if present
  return dateTimeStr.replace("T", " | ").split(".")[0];
};

// Load bookings into cards
const fillDataIntoCard = (bookingList) => {
  const cardContainer = document.querySelector("#cardContainer");
  if (!cardContainer) return;

  cardContainer.innerHTML = "";

  if (!bookingList || bookingList.length === 0) {
    cardContainer.innerHTML = `
      <div class="glass-card animate" style="text-align: center; padding: 40px;">
        <i class="fa-solid fa-calendar-xmark" style="font-size: 48px; color: var(--ios-gray-3); margin-bottom: 16px;"></i>
        <h6 style="color: var(--text-secondary);">No active assignments found.</h6>
      </div>
    `;
    return;
  }

  bookingList.forEach((booking, index) => {
    let status = booking.booking_status_id.status;

    // Logic to determine which button to show
    let btnHtml = "";
    if (status == "Attend") {
      btnHtml = `<button data-index="${index}" class="btn-driver-app btn-Reached-Pickup">Reached Pickup</button>`;
    } else if (status == "Arrived At Pickup") {
      btnHtml = `<button data-index="${index}" class="btn-driver-app btn-Loaded">Loaded & Start</button>`;
    } else if (status == "Departed From Pickup") {
      btnHtml = `<button data-index="${index}" class="btn-driver-app btn-Reached-Destination">Reached Destination</button>`;
    } else if (status == "Arrived At Delivery") {
      btnHtml = `<button data-index="${index}" class="btn-driver-app btn-Finish">Finish Job</button>`;
    }

    cardContainer.innerHTML += `
      <div class="glass-card trip-card animate">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
          <div>
            <span class="label-sm">TRIP ID</span>
            <h6 style="margin: 0; font-size: 16px; font-weight: 800; letter-spacing: -0.5px;">${booking.booking_no}</h6>
          </div>
          <div style="text-align: right;">
            <span class="label-sm">VEHICLE</span>
            <h6 style="margin: 0; font-size: 15px; font-weight: 700; color: var(--primary);">${booking.vehicle_id ? booking.vehicle_id.vehicle_no : "N/A"}</h6>
          </div>
        </div>

        <div class="loc-line">
          <div class="loc-point">
            <p>PICKUP</p>
            <h6 style="margin: 4px 0;">${booking.pickup_locations_id ? booking.pickup_locations_id.name : "Unknown"}</h6>
            <p style="font-size: 12px; color: var(--text-secondary); font-weight: 600;">${formatDateTime(booking.pickup_date_time)}</p>
          </div>
          <div class="loc-point dest">
            <p>DELIVERY</p>
            <h6 style="margin: 4px 0;">${booking.delivery_locations_id ? booking.delivery_locations_id.name : "Unknown"}</h6>
            <p style="font-size: 12px; color: var(--text-secondary); font-weight: 600;">${formatDateTime(booking.delivery_date_time)}</p>
          </div>
        </div>

        <div class="action-buttons-group" style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
          ${btnHtml}
        </div>
      </div>
    `;
  });
};
