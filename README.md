# 🚚 Transport Management System (TMS)

[![Java](https://img.shields.io/badge/Java-21-orange.svg?logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.0-brightgreen.svg?logo=springboot)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring%20Security-6.x-green.svg?logo=springsecurity)](https://spring.io/projects/spring-security)
[![Database](https://img.shields.io/badge/Database-MySQL-blue.svg?logo=mysql)](https://www.mysql.com/)
[![Build](https://img.shields.io/badge/Build-Gradle-02303A.svg?logo=gradle)](https://gradle.org/)
[![License](https://img.shields.io/badge/License-Academic-lightgrey.svg)](#)

A comprehensive, enterprise-grade **Transport Management System (TMS)** designed to streamline and automate logistics, fleet operations, driver management, client contracts, and financial analytics. Developed as a Final Year Project for modern transport and logistics service providers.

---

## 📌 Table of Contents
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Application Configuration](#-application-configuration)
- [Project Structure](#-project-structure)
- [Modules Overview](#-modules-overview)
- [Author & Acknowledgments](#-author--acknowledgments)

---

## 🌟 Key Features

### 1. 📋 Booking & Dispatch Management
- **End-to-End Booking Lifecycle:** Create, schedule, track, and complete transport bookings.
- **Booking Breakdown & Allocation:** Detailed package, weight, volume, and route assignments.
- **Delay Analytics:** Real-time delay reporting with categorized delay reasons.
- **Route & Location Tracking:** Manage multi-point pickup and delivery destinations.

### 2. 🚛 Fleet & Vehicle Management
- **Vehicle Registry:** Comprehensive database of vehicle makes, types, registration, and status.
- **Vehicle Grouping & Access Control:** Restrict vehicle allocation based on custom vehicle groups.
- **Vehicle Inspection:** Pre-trip and post-trip vehicle safety inspection checklists.
- **License & Insurance Tracking:** Automated alerts for revenue license and insurance renewal deadlines.

### 3. 👨‍✈️ Driver & Employee Operations
- **Driver Profiles & Management:** Complete records of driving licenses, medical clearances, and performance records.
- **Driver Portal:** Dedicated interface for drivers to view schedules and active trips.
- **Staff Administration:** Full employee lifecycle tracking with department and designation hierarchies.

### 4. 🏢 Customer & Supplier Collaboration
- **Customer Portal:** Self-service portal for clients to place requests, review agreements, and track invoices.
- **Contract & Agreement Workflows:** Draft, review, and approve customer and supplier agreements.
- **Supplier & Third-Party Management:** Manage external transport contractors, payables, and advance payments.

### 5. ⛽ Fuel Management System
- **Fuel Card Allocation:** Register and assign digital fuel cards to vehicles.
- **Fuel Price Master:** Real-time fuel price monitoring and historical price tracking.
- **Fuel Requisition:** Request, approve, and track fuel consumption per vehicle/journey.

### 6. 💰 Billing, Invoicing & Financials
- **Automated Invoicing:** Invoice generation based on completed trips and rate agreements.
- **Payment Processing:** Customer payment receipts, supplier payable disbursements, and cheque management.
- **Profit & Loss Analysis:** Trip-by-trip and periodic financial performance tracking.

### 7. 🔐 Security, Notifications & Access Control
- **Spring Security Integration:** Role-Based Access Control (RBAC) with granular user privileges.
- **Notification Engine:** In-app real-time notification alerts with read/unread tracking.
- **Audit Trails:** Traceability for sensitive actions and approvals.

### 8. 📊 Reports & Business Intelligence
- Daily Booking Reports & Delay Analyses
- Driver Performance Analytics
- Fuel Consumption & Cost Summaries
- Revenue, Payables, and Profitability Dashboards

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend Framework** | [Spring Boot 3.4.0](https://spring.io/projects/spring-boot) |
| **Language** | Java 21 (LTS) |
| **Security** | Spring Security 3.4.1 (RBAC, BCrypt hashing) |
| **Persistence / ORM** | Spring Data JPA / Hibernate |
| **Database** | MySQL 8.x |
| **View Template Engine** | Thymeleaf |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), Bootstrap 5, Bootstrap Icons, TomSelect |
| **Build & Dependency Tool** | Gradle Wrapper |

---

## 💻 Prerequisites

Ensure you have the following installed on your machine:
- **Java Development Kit (JDK):** Version 21 or later ([Download JDK 21](https://adoptium.net/))
- **MySQL Server:** Version 8.0+ ([Download MySQL](https://dev.mysql.com/downloads/installer/))
- **Git:** Version 2.x+ ([Download Git](https://git-scm.com/))
- **IDE (Optional):** IntelliJ IDEA / Eclipse STS / VS Code

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Pramod0775213344/Transport-Management-System.git
cd Transport-Management-System
```

### 2. Configure Database
1. Open MySQL Workbench or MySQL CLI:
   ```sql
   CREATE DATABASE tms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Import the initial database schema and seed data if available (`tms.sql` / backup script).

### 3. Configure Database Credentials
Open `src/main/resources/application.properties` and update your MySQL credentials:
```properties
spring.application.name=okidoki

spring.datasource.url=jdbc:mysql://localhost:3306/tms?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

# JPA Configuration
# spring.jpa.hibernate.ddl-auto=update
# spring.jpa.show-sql=true
```

### 4. Build and Run the Application

#### On Windows (PowerShell / Command Prompt):
```cmd
.\gradlew.bat bootRun
```

#### On Linux / macOS:
```bash
chmod +x gradlew
./gradlew bootRun
```

### 5. Access the Web Application
Open your web browser and navigate to:
```
http://localhost:8080
```

---

## 📂 Project Structure

```text
Transport-Management-System/
├── gradle/wrapper/                 # Gradle wrapper files
├── src/
│   ├── main/
│   │   ├── java/lk/okidoki/
│   │   │   ├── configuration/     # Spring Security & App configuration
│   │   │   ├── controller/        # REST & MVC Web Controllers
│   │   │   ├── modal/             # JPA Entity Models
│   │   │   ├── repository/        # Spring Data JPA Repositories
│   │   │   ├── services/          # Business logic services
│   │   │   └── OkidokiApplication.java
│   │   └── resources/
│   │       ├── static/            # Static assets (CSS, JS, Images, TomSelect)
│   │       ├── templates/         # Thymeleaf HTML Templates
│   │       └── application.properties
│   └── test/                      # Unit and integration test suites
├── build.gradle                   # Gradle dependencies and build script
├── settings.gradle                # Gradle project settings
└── README.md                      # Project documentation
```

---

## 📑 Modules Overview

| Module | Description | Primary Templates / Endpoints |
|---|---|---|
| **Authentication & User Admin** | User registration, login, role management, password reset | `/login`, `/user`, `/privilage` |
| **Booking Operations** | Booking creation, tracking, breakdown, status updates | `/booking`, `/bookingBreakdown` |
| **Fleet Management** | Vehicle information, group access control, inspections | `/vehicle`, `/vehicleGroup`, `/vehicleAssigning` |
| **Driver & Employee** | Drivers registry, assignments, HR records | `/driver`, `/employee` |
| **Customer Portal** | Customer bookings, contracts, self-service dashboard | `/customerPortal/customerBookings`, etc. |
| **Supplier Portal** | Supplier agreements, payable records, disbursements | `/supplier`, `/supplierAgreement`, `/supplierPayable` |
| **Fuel Administration** | Fuel card issuance, fuel logs, price master | `/fuelCards`, `/fuelRequest`, `/fuel_price` |
| **Reports & BI** | Delay analytics, profit statements, license expiries | `/report`, `/bookingReport`, `/reportFuelSummary` |

---

## 👨‍💻 Author

- **Developer:** Pramod Ravishanka
- **GitHub:** [@Pramod0775213344](https://github.com/Pramod0775213344)
- **Email:** pramodravishanka3344@gmail.com

---

## 📄 License
This project is developed for educational and academic assessment purposes as a **Final Year Project**. All rights reserved.
