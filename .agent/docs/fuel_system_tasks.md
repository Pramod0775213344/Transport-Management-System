# Fuel System Implementation Tasks

This task list tracks the necessary improvements for a robust Fuel Request system without GPS.

---

## 1. Backend Enhancements (Java)

- [ ] **Mileage Property**: Add a `mileage` field to the `Vehicle` or `VehicleType` entity to allow auto-calculation of fuel.
- [ ] **Status Validation**: Ensure `getActiveBookingByVehicle` strictly returns bookings that are "In-Process" (Status 1 or 5).
- [ ] **Balance Deduction Logic**: Implement a service method to subtract the fuel cost/amount from the `FuelCards` balance upon approval.

## 2. Frontend Logic (fuelRequest.js)

- [ ] **Distance Reference**: Update the UI to display the `booking.distance` as soon as a Booking is selected from the dropdown.
- [ ] **Auto-Calculator**: Implement a function to suggest `request_liters` based on `booking.distance`.
  - _Formula_: `suggested = distance / 5` (assuming average 5km/l for trucks).
- [ ] **Validation**: Add a check to prevent requesting fuel if no active booking is found for the vehicle.
- [ ] **Meter Reading**: Add an optional field for `current_meter_reading` to verify against the vehicle's last recorded reading.

## 3. UI/UX Refinements (fuelRequest.html)

- [ ] **Dynamic labels**: Show "Fuel Card No: XXXX" as a read-only text once the vehicle is selected.
- [ ] **Route Summary**: Show a small summary of the selected booking (Pickup -> Delivery) next to the fuel request form.
- [ ] **Alerts**: Use `Swal.fire` to warn if the requested liters are significantly higher than the estimated consumption for the distance.

---

## 4. Integration

- [ ] **Final Testing**: Simulate a full cycle:
  1. Create Booking.
  2. Start Trip.
  3. Request Fuel (Logic should fetch the current trip).
  4. Approve Fuel.
  5. Check if the Fuel Card balance/history is updated.
