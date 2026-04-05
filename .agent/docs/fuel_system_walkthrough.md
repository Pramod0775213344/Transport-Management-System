# Fuel Management System Walkthrough (V-Card Logic)

This document outlines the logic and workflow for the Fuel Management System, specifically focusing on handling Fuel Cards and Fuel Requests without GPS integration.

## 1. Conceptual Overview

The fuel system is designed to provide drivers with fuel based on their active assignments. Since GPS is not available, the system relies on **Booking Distance** and **Manual Verification**.

### Key Entities:

- **Fuel Card (V-Card)**: Assigned to a specific vehicle. It acts as the "wallet" for fuel transactions.
- **Fuel Request**: A request made by a driver or manager for a specific trip (Booking).

---

## 2. Business Logic Workflow

### Step A: Fuel Card Assignment

- Every vehicle in the system must be linked to a physical Fuel Card number.
- The `FuelCards` table stores the card number and the `current_balance`.
- _Logic_: A vehicle can only request fuel if it has an "Active" fuel card.

### Step B: The Fuel Request Process

1.  **Vehicle Selection**: The user selects a Vehicle No.
2.  **Card Identification**: The system automatically fetches the `FuelCard` linked to that vehicle (`/fuelscards/byvehicle`).
3.  **Driver & Booking Binding**:
    - The system identifies the driver assigned to the vehicle.
    - It fetches the **Ongoing Booking** for this specific Vehicle + Driver combination.
4.  **Distance-Based Estimation**:
    - Because GPS is absent, we use the `distance` field from the selected `Booking`.
    - _Calculation (Proposed)_: `Requested Liters = (Trip Distance / Vehicle Mileage) + Buffer`.
    - Currently, the system allows manual entry of Liters, but display the Trip Distance as a reference for the approver.

### Step C: Approval & Transaction

1.  **Review**: Manager sees the request, the driver, the vehicle, and the **Route/Distance**.
2.  **Verification**: Manager checks if the Liters requested match the expected consumption for that distance.
3.  **Approval**: Once approved, the `FuelRequest` status changes to "Approved".
4.  **Balance Update**: In a real-world scenario, the `current_balance` of the Fuel Card should be updated (or tracked against the invoice).

---

## 3. UI Implementation Logic (fuelRequest.js)

- **Datalist Validator**: Validates the vehicle number and fetches the object.
- **Event Listeners**:
  - `selectVehicleNo -> change`: Fetches Driver list and Fuel Card.
  - `selectDriver -> change`: Fetches the `ongoing` booking for that driver+vehicle.
  - `selectBooking -> change`: (Add this) Should display the trip distance on the UI so the user knows how much fuel to ask for.

---

## 4. Handling "No GPS" Limitations

- **Trust but Verify**: Since you can't track real-time location, the **Odometer readings** are your best friend.
- **Reading Checks**: Before a fuel request is finalized, you can ask for the "Current Meter Reading". This helps track consumption between two fuelings.
