package lk.okidoki.controller;

import lk.okidoki.modal.*;
import lk.okidoki.repository.ReportRepository;
import lk.okidoki.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
public class ReportDataController {

    @Autowired
    private UserRepository userRepository;

    @Autowired // auto generate instance
    private UserPrivilageController userPrivilageController;

    @Autowired
    private ReportRepository reportRepository;

    // report summary eka database eka save karagannawa

    // Get mapping for get vehicle conut by vehicle type (url
    // -->/report/countbyvehicletype)
    @GetMapping(value = "/report/countbyvehicletype")
    public String[][] getCountByVehicleType() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getCountByVehicleType();
    }

    // Get mapping for get current month booking count by booking status (url
    // -->/report/countbybookingstatus)
    @GetMapping(value = "/report/countbybookingstatus")
    public String[][] getCountByBookingStatus() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getCountByBookingStatus();
    }

    // Get mapping for get current month booking count by customer (url
    // -->/report/bookingcountbycustomer)
    @GetMapping(value = "/report/bookingcountbycustomer")
    public String[][] getBookingCountByCustomer() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getBookingCountByCustomer();
    }

    // Get mapping for get booking distance monthly wise (url
    // -->/report/totalbookingdistancebymonthlybookings)
    @GetMapping(value = "/report/totalbookingdistancebymonthlybookings")
    public String[][] getBookingDistanceByMonthlyBookings() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.gettotalDistanceByMonthlyBookings();
    }

    // (url -->/report/revenuelicenseexpirevehicle)
    @GetMapping(value = "/report/revenuelicenseexpirevehicle")
    public List<Vehicle> getRevenueLicenseExpireList() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getRevenueLicenseExpireList();
    }

    // Get mapping for get booking distance monthly wise (url
    // -->/report/totalbookingdistancebymonthlybookings)
    @GetMapping(value = "/report/upcomingexpiredinsurancecount")
    public String[][] upcomnigExpiredInsuanceCountWithMonth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.upcomnigExpiredInsuanceCountWithMonth();
    }

    @GetMapping(value = "/report/upcomingexpiredrevenuelicensecount")
    public String[][] upcomnigExpiredRevenueLicenseCountWithMonth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.upcomnigExpiredRevenueLicenseCountWithMonth();
    }

    // (url -->/report/revenuelicenseexpirevehicle)
    @GetMapping(value = "/report/insuranceexpirevehicle")
    public List<Vehicle> getInsuranceExpireList() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getInsuranceExpireList();
    }

    // (url -->/report/countofactivevehicles)
    @GetMapping(value = "/report/countofactivevehicles")
    public Integer getCountOfActiveVehicles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getCountOfActiveVehicles();
    }

    // (url -->/report/countofallvehicles)
    @GetMapping(value = "/report/countofallvehicles")
    public Integer getCountOfAllVehicles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getCountOfAllVehicles();
    }

    // (url -->/report/countofrevenuelicenseexpirevehicles)
    @GetMapping(value = "/report/countofrevenuelicenseexpirevehicles")
    public Integer getCountOfRevenueLicenseExpireVehicles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getCountOfRevenueLicenseExpireVehicles();
    }

    // (url -->/report/countofinsuranceexpirevehicles)
    @GetMapping(value = "/report/countofinsuranceexpirevehicles")
    public Integer getCountOfInsuranceExpireVehicles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getCountOfInsuranceExpireVehicles();
    }

    // (url -->/report/recentlyupdatedrevenuelicenseexpirevehicles)
    @GetMapping(value = "/report/recentlyupdatedrevenuelicenseexpirevehicles")
    public List<Vehicle> getRecentlyUpdatedRevenueLicenseExpireVehicles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getRecentlyUpdatedRevenueLicenseExpireVehicles();
    }

    // (url -->/report/recentlyupdatedinsuranceexpirevehicles)
    @GetMapping(value = "/report/recentlyupdatedinsuranceexpirevehicles")
    public List<Vehicle> getRecentlyUpdatedInsuranceExpireVehicles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getRecentlyUpdatedInsuranceExpireVehicles();
    }

    // Get mapping for get vehicles revenue by customer id and vehicle type id and
    // group by current month and year
    // URL ( "/report/vehicleRevenueByVehicleType?customerId=1&vehicleTypeId=1")
    @GetMapping(value = "/report/vehicleRevenueByVehicleType", params = { "customerId",
            "vehicleTypeId" }, produces = "application/json")
    public List<Object[]> getVehiclesRevenueByCustomerIdAndVehicleTypeAndGroupByCurrantMonthAndYear(
            @RequestParam("customerId") Integer customerId, @RequestParam("vehicleTypeId") Integer vehicleTypeId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getVehiclesRevenueByCustomerIdAndVehicleTypeAndGroupByCurrantMonthAndYear(customerId,
                vehicleTypeId);
    }

    // (url -->/report/countofpendingbookings)
    @GetMapping(value = "/report/countofpendingbookings")
    public Integer getPendingBookingCount() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getPendingBookingCount();
    }

    // (url -->/report/countofactivecustomers)
    @GetMapping(value = "/report/countofactivecustomers")
    public Integer getActiveCustomerCount() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getActiveCustomerCount();
    }

    // (url -->/report/countofactivedrivers)
    @GetMapping(value = "/report/countofactivedrivers")
    public Integer getActiveDriverCount() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getActiveDriverCount();
    }

    // Request mapping for get all employee data (url -->/employee/alldata)
    @GetMapping(value = "/report/useralldata", produces = "application/json")
    public List<User> findAllData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Employee");
        // Last added data eke Mulata ganna oni nisa thama find all eke sort attributr
        // eka use karanne
        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));

    }

    // --------------------------------booking report
    // ekata---------------------------------

    // url -->
    // (report/bookinglist?statusid=9&customerid=3&vehicleid=2&driverid=&startdate=2026-07-01&enddate=2026-07-21)
    // required false dala thiyena nisa eka parameter ewana parameter tika fill wela
    // anith automatically null wenawa
    @GetMapping(value = "/report/bookinglist", produces = "application/json")
    public String[][] getBookingReport(
            @RequestParam(value = "customerid", required = false) Integer customerId,
            @RequestParam(value = "vehicleid", required = false) Integer vehicleId,
            @RequestParam(value = "driverid", required = false) Integer driverId,
            @RequestParam(value = "statusid", required = false) Integer statusId,
            @RequestParam(value = "startdate", required = false) String startDate,
            @RequestParam(value = "enddate", required = false) String endDate) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getBookingsForReport(customerId, vehicleId, driverId, statusId, startDate, endDate);
    }

    // --------------------supplier agreement report---------------------------

    // Get mapping for get all supplier agreements by date range (url
    // -->/report/supplieragreement/bydaterangeandsupplierid?startdate=1&endtdate=2&supplierid=3)
    @GetMapping(value = "/report/supplieragreement/bydaterangeandsupplierid", params = { "startdate", "endtdate",
            "supplierid" }, produces = "application/json")
    public List<SupplierAgreement> getSupplierAgreementByDateRangeAndSupplier(@RequestParam("startdate") Date startdate,
            @RequestParam("endtdate") Date endtdate, @RequestParam("supplierid") Integer supplierid) {
        return reportRepository.getSupplierAgreementByDateRangeAndSupplier(startdate, endtdate, supplierid);

    }

    // Get mapping for get all supplier agreements by date range (url
    // -->/report/supplieragreement/bydaterange?startdate=1&endtdate=2)
    @GetMapping(value = "/report/supplieragreement/bydaterange", params = { "startdate",
            "endtdate" }, produces = "application/json")
    public List<SupplierAgreement> getSupplierAgreementReport(@RequestParam("startdate") Date startdate,
            @RequestParam("endtdate") Date endtdate) {
        return reportRepository.getSupplierAgreementByDateRange(startdate, endtdate);

    }

    // -------------------------------------------------------------- customer
    // agreement report
    // --------------------------------------------------------------
    // Get mapping for get all customer agreements by date range (url
    // -->/report/customeragreement/bydaterangeandcustomerid?startdate=1&endtdate=2&customerid=3)
    @GetMapping(value = "/report/customeragreement/bydaterangeandcustomerid", params = { "startdate", "endtdate",
            "customerid" }, produces = "application/json")
    public List<CustomerAgreement> getCustomerAgreementByDateRangeAndCustomer(@RequestParam("startdate") Date startdate,
            @RequestParam("endtdate") Date endtdate, @RequestParam("customerid") Integer customerid) {
        return reportRepository.getCustomerAgreementByDateRangeAndCustomer(startdate, endtdate, customerid);

    }

    // Get mapping for get all customer agreements by date range (url
    // -->/report/customeragreement/bydaterange?startdate=1&endtdate=2)
    @GetMapping(value = "/report/customeragreement/bydaterange", params = { "startdate",
            "endtdate" }, produces = "application/json")
    public List<CustomerAgreement> getCustomerAgreementReport(@RequestParam("startdate") Date startdate,
            @RequestParam("endtdate") Date endtdate) {
        return reportRepository.getCustomerAgreementByDateRange(startdate, endtdate);
    }

    // ----------------------------------------------------------daily booking
    // summary report---------------------------------------------------------------

    // bookings tika gnnw hourly in current day
    @GetMapping(value = "/report/dailyhourlybooking")
    public String[][] getBookingByHourly() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getHourlyBookings();
    }

    // bookings tika gnnw status wise in current day
    @GetMapping(value = "/report/bookingbystatusdaily")
    public List<Object[]> getBookingByStatusDaily() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getBookingCountByStatus();
    }

    // bookings details gnnw in current day
    @GetMapping(value = "/report/alldailybookings", produces = "application/json")
    public String[][] getAllBookingsForDaily(
            @RequestParam(value = "customerId", required = false) Integer customerId,
            @RequestParam(value = "bookingStatusId", required = false) Integer bookingStatusId,
            @RequestParam(value = "vehicleId", required = false) Integer vehicleId,
            @RequestParam(value = "driverId", required = false) Integer driverId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getAllBookingsForDaily(customerId, bookingStatusId, vehicleId, driverId);
    }

    // bookings details gnnw in current day by customer id and booking status id(url
    // -->/report/alldailybookingsbycustomerandstatus?customerId=1&bookingStatusId=1)
    @GetMapping(value = "/report/alldailybookingsbycustomerandstatus", params = { "customerId",
            "bookingStatusId" }, produces = "application/json")
    public List<Booking> getAllBookingsForDailyByCustomerAndStatus(@RequestParam("customerId") Integer customerId,
            @RequestParam("bookingStatusId") Integer bookingStatusId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getAllBookingsForDailyByCustomerAndStatus(customerId, bookingStatusId);
    }

    // --------------------------------------------------------------delay booking
    // report---------------------------------------------------------------

    // get mapping for delay bookings tika ganna
    // get mapping for delay bookings tika ganna
    @GetMapping(value = "/report/alldelaybookins", produces = "application/json")
    public String[][] getAllDelayBookings(
            @RequestParam(value = "customerId", required = false) Integer customerId,
            @RequestParam(value = "vehicleId", required = false) Integer vehicleId,
            @RequestParam(value = "driverId", required = false) Integer driverId,
            @RequestParam(value = "delayType", required = false) String delayType,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");

        return reportRepository.getAllDelayBookings(customerId, vehicleId, driverId, delayType, startDate, endDate);
    }

    // ---------------------------------------------------driver performance
    // report---------------------------------------------------------------

    // ---------------------------------------------------end of driver performance
    // report---------------------------------------------------------------
    @GetMapping(value = "report/driverperformance", produces = "application/json")
    public String[][] gerDriverPerfomance(
            @RequestParam(value = "driverid", required = false) Integer driverId,
            @RequestParam(value = "supplierid", required = false) Integer supplierId,
            @RequestParam(value = "statusid", required = false) Integer statusId,
            @RequestParam(value = "startdate", required = false) String startDate,
            @RequestParam(value = "enddate", required = false) String endDate) {
        return reportRepository.gerDriverPerfomance(driverId, supplierId, statusId, startDate, endDate);
    }

    // ---------------------------------------------------pnl
    // report---------------------------------------------------------------

    // get mapping for get income report this month (url -->/report/profit)
    @GetMapping(value = "/report/profit", produces = "application/json")
    public String[][] getProfitReport(
            @RequestParam(value = "customerid", required = false) Integer customerId,
            @RequestParam(value = "startdate", required = false) String startDate,
            @RequestParam(value = "enddate", required = false) String endDate) {
        return reportRepository.getProfitReport(customerId, startDate, endDate);
    }

    // -----------------------pending bookings report API-----------------------
    // Get mapping for get all pending bookings (url -->/report/allpendingbookings)
    @GetMapping(value = "/report/allpendingbookings", produces = "application/json")
    public String[][] getAllPendingBookings() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getAllPendingBookings();
    }

    @GetMapping(value = "/report/allpendingbookingsWithVechicletype", produces = "application/json")
    public String[][] getPendingBookingByVehicleType() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getPendingBookingByVehicleType();

    }

    // ---------------------revenu report------------------------------------
    // Get mapping for get booking distance monthly wise (url
    // -->/report/vehiclerevenuecurrentmonth)
    @GetMapping(value = "/report/vehiclerevenuecurrentmonth")
    public String[][] getCurrentMonthVehicleRevenue(@RequestParam("customerid") Integer customerid,
            @RequestParam("vehicletypeid") Integer vehicletypeid) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getCurrentMonthVehicleRevenue(customerid, vehicletypeid);
    }

    // Get Mappning For get booking distance currunt month uisng vehicle Id
    @GetMapping(value = "/report/vehiclecurrentmonthkm", params = { "vehicleid" }, produces = "application/json")
    public Integer getVehicelTotaDisatnceCurruetMonth(@RequestParam("vehicleid") Integer vehicleid) {
        return reportRepository.getVehicelTotaDisatnceCurruetMonth(vehicleid);
    }

    // get mapping for get vehicle revenue report date type (url -->/report/revenue)
    @GetMapping(value = "/report/revenue", produces = "application/json")
    public String[][] getRevenueReport(
            @RequestParam(value = "customerid", required = false) Integer customerId,
            @RequestParam(value = "vehicletypeid", required = false) Integer vehicletypeId,
            @RequestParam(value = "startdate", required = false) String startDate,
            @RequestParam(value = "enddate", required = false) String endDate) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getVehicleRevenueReport(customerId, vehicletypeId, startDate, endDate);
    }

    // ---------------------supplier payment
    // report------------------------------------
    // url
    // -->(report/supplierpaymentlist?supplierid=5&vehicleid=2&driverid=&customerid=&startdate=2026-07-01&enddate=2026-07-21)
    // required false dala thiyena nisa eka parameter ewana parameter tika fill wela
    // anith automatically null wenawa
    @GetMapping(value = "/report/supplierpaymentlist", produces = "application/json")
    public String[][] getSupplierPaymentReport(
            @RequestParam(value = "supplierid", required = false) Integer supplierId,
            @RequestParam(value = "vehicleid", required = false) Integer vehicleId,
            @RequestParam(value = "driverid", required = false) Integer driverId,
            @RequestParam(value = "startdate", required = false) String startDate,
            @RequestParam(value = "enddate", required = false) String endDate) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getSupplierPayments(supplierId, vehicleId, driverId, startDate, endDate);

    }

    // ----------------customer payment report----------------------------

    @GetMapping(value = "/report/customerpaymentlist", produces = "application/json")
    public String[][] getCustomerPaymentReport(
            @RequestParam(value = "customerid", required = false) Integer customerId,
            @RequestParam(value = "vehicleid", required = false) Integer vehicleId,
            @RequestParam(value = "driverid", required = false) Integer driverId,
            @RequestParam(value = "startdate", required = false) String startDate,
            @RequestParam(value = "enddate", required = false) String endDate) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getCustomerPayments(customerId, vehicleId, driverId, startDate, endDate);
    }

    // -----------------fuel summary report------------------------------------
    @GetMapping(value = "/report/fuelsummaryreport", produces = "application/json")
    public String[][] getFuelSummaryReport(
            @RequestParam(value = "vehicleid", required = false) Integer vehicleId,
            @RequestParam(value = "driverid", required = false) Integer driverId,
            @RequestParam(value = "fuelCardid", required = false) Integer fuelCardId,
            @RequestParam(value = "startdate", required = false) String startDate,
            @RequestParam(value = "enddate", required = false) String endDate) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getFuelSummaryReport(vehicleId, driverId, fuelCardId, startDate, endDate);
    }

    // ================ dashboard cards data-===========================

    // get mapping for last assign two vehicle (url
    // -->/report/lastassignedtwovehicles)
    @GetMapping(value = "/report/lastassignedtwovehicles", produces = "application/json")
    public List<Object[]> getLastAssignedTwoVehicles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getLastAssignedVehicles();
    }

    // get mappling for last assign two drivers(url
    // -->/report/lastassignedtwoDrivers)
    @GetMapping(value = "/report/lastassignedtwoDrivers", produces = "application/json")
    public List<Object[]> getLastAssignedTwoDrivers() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getLastAssignedDrivers();
    }

    // (url -->/report/countofinsuranceexpirevehicles)
    @GetMapping(value = "/report/countofdutydrivers")
    public Integer getCountOfDutyDrivers() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDutyDriversCount();
    }

    // get mapping for get booking activity message (url
    // -->/report/bookingactivitymessage)
    @GetMapping(value = "/report/bookingactivitymessage", produces = "application/json")
    public List<Object[]> getBookingActivityMessage() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getBookingActivityForDashboard();
    }

    // get mapping get alla active bookings count
    @GetMapping(value = "/report/activebookingscount", produces = "application/json")
    public Integer getAllActiveBookingsList() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getTotalActiveBookingList();
    }

    // get mapping get all the time on time rate
    @GetMapping(value = "/report/ontimerate", produces = "application/json")
    public Double getOnTimeRate() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getAllTimeOnTimeRatePercentage();
    }

    // get mapping for get all bookings in current day (url
    // -->/report/allbookingsincurrentday)
    @GetMapping(value = "/report/allbookingsincurrentday", produces = "application/json")
    public Integer getAllBookingsInCurrentDay() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getCurrentDateTotalBookings();
    }

    // get mapping for get current date delay bookings precentage (url
    // -->/report/currentdatedelaybookingpercentage)
    @GetMapping(value = "/report/currentdatedelaybookingpercentage", produces = "application/json")
    public Double getCurrentDateDelayBookingPercentage() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getCurrentDateBookingsDelayRatePercentage();
    }

    // get mapping for bookinoverview eka gnnawa status eke magin (url
    // -->/report/bookingoverview)
    @GetMapping(value = "/report/bookingoverview", produces = "application/json")
    public Object getBookingOverview() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getBookingOverview();
    }

    // get mapping for fleet utilization (url -->/report/fleetutilization)
    @GetMapping(value = "/report/fleetutilization", produces = "application/json")
    public Object getFleetUtilization() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getFleetUtilization();
    }

    // revenue eka gnnawa
    @GetMapping(value = "/report/revenuandexpense", produces = "application/json")
    public List<Object[]> getRevenueAndExpense() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getRevenueAndExpense();
    }
    // ============================end dashboard ==============================

    // ======================= customer portal dashboard ======================
    // get mapping for get customer booking summary (url
    // -->/report/customerbookingsummarybystatus?customerid=1)
    @GetMapping(value = "/report/customerbookingsummarybystatus", produces = "application/json")
    public Object getCustomerBookingSummary(@RequestParam("customerid") Integer customerId) {
        return reportRepository.getBookingOverviewByCustomer(customerId);
    }

    // customerTotalBookings
    // (url -->/report/totalbookingsbycustomer?customerid=1)
    @GetMapping(value = "/report/totalbookingsbycustomer", params = { "customerid" }, produces = "application/json")
    public Integer getTotalBookingsByCustomer(@RequestParam("customerid") Integer customerId) {
        return reportRepository.getTotalBookingsByCustomer(customerId);
    }

    // customerActiveBookings
    // (url -->/report/activebookingsbycustomer?customerid=1)
    @GetMapping(value = "/report/activebookingsbycustomer", params = { "customerid" }, produces = "application/json")
    public Integer getActiveBookingsByCustomer(@RequestParam("customerid") Integer customerId) {
        return reportRepository.getActiveBookingsByCustomer(customerId);
    }

    // customerCompletedBookings
    // (url -->/report/completedbookingsbycustomer?customerid=1)
    @GetMapping(value = "/report/completedbookingsbycustomer", params = { "customerid" }, produces = "application/json")
    public Integer getCompletedBookingsByCustomer(@RequestParam("customerid") Integer customerId) {
        return reportRepository.getCompletedBookingsByCustomer(customerId);
    }

    // customerPendingInvoices
    // (url -->/report/pendinginvoicesbycustomer?customerid=1)
    @GetMapping(value = "/report/pendinginvoicesbycustomer", params = { "customerid" }, produces = "application/json")
    public Integer getPendingInvoicesByCustomer(@RequestParam("customerid") Integer customerId) {
        return reportRepository.getPendingInvoicesByCustomer(customerId);
    }
    // =====================customer portal dashboard=========================

    // ======== vehicle assihnin js ekata use karala thiyenne ===============

    // Get vehicle current month distance by vehicle id
    // URL ( "/report/vehiclecurrentmonthkm?vehicleid=1")
    @GetMapping(value = "/report/vehiclecurrentmonthkm")
    public Double getVehicleTotalDistanceInCurrentMonth(@RequestParam("vehicleid") Integer vehicleid) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getVehicleTotalDistanceInCurrentMonth(vehicleid);
    }

    // Get vehicle last trip delivery date time
    @GetMapping(value = "/report/vehiclelasttripcompletion")
    public java.time.LocalDateTime getLastTripDeliveryTime(@RequestParam("vehicleid") Integer vehicleid) {
        return reportRepository.getLastTripDeliveryTime(vehicleid);
    }

    // get vehicle last assigned driver by vehicle id
    @GetMapping(value = "/report/getlastassigneddriver", params = { "vehicleid" }, produces = "application/json")
    public Map<String, Object> getLastAssignedDriver(@RequestParam("vehicleid") Integer vehicleid) {
        List<Map<String, Object>> result = reportRepository.getLastAssignedDriver(vehicleid); 
        return (result == null || result.isEmpty()) ? null : result.get(0);
    }
}
