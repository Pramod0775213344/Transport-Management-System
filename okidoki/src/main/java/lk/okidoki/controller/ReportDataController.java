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

@RestController
public class ReportDataController {

    @Autowired
    private UserRepository userRepository;

    @Autowired// auto generate instance
    private UserPrivilageController userPrivilageController;

    @Autowired
    private ReportRepository reportRepository;


    // Get mapping for get vehicle conut  by vehicle type  (url -->/report/countbyvehicletype)
    @GetMapping(value = "/report/countbyvehicletype")
    public String[][] getCountByVehicleType() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getCountByVehicleType();
    }

    // Get mapping for get current month booking count  by booking status (url -->/report/countbybookingstatus)
    @GetMapping(value = "/report/countbybookingstatus")
    public String[][] getCountByBookingStatus() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getCountByBookingStatus();
    }

    // Get mapping for get current month booking count  by customer  (url -->/report/bookingcountbycustomer)
    @GetMapping(value = "/report/bookingcountbycustomer")
    public String[][] getBookingCountByCustomer() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getBookingCountByCustomer();
    }

    // Get mapping for get booking distance monthly wise  (url -->/report/totalbookingdistancebymonthlybookings)
    @GetMapping(value = "/report/totalbookingdistancebymonthlybookings")
    public String[][] getBookingDistanceByMonthlyBookings() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.gettotalDistanceByMonthlyBookings();
    }

    // Get mapping for get booking distance monthly wise  (url -->/report/vehiclerevenuecurrentmonth)
    @GetMapping(value = "/report/vehiclerevenuecurrentmonth")
    public String[][] getCurrentMonthVehicleRevenue(@RequestParam("customerid") Integer customerid, @RequestParam("vehicletypeid") Integer vehicletypeid) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getCurrentMonthVehicleRevenue(customerid, vehicletypeid);
    }

    // Get mapping for get bookings by date range (url -->/reportbooking/bydaterangeandtype?startdate=1&endtdate=2)
    @GetMapping(value = "/reportbooking/bydaterangeandtype", params = {"startdate", "endtdate"}, produces = "application/json")
    public List<Booking> getBookingReport(@RequestParam("startdate") Date startdate, @RequestParam("endtdate") Date endtdate) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getBookingByDateRange(startdate, endtdate);

    }

    // (url -->/report/revenuelicenseexpirevehicle)
    @GetMapping(value = "/report/revenuelicenseexpirevehicle")
    public List<Vehicle> getRevenueLicenseExpireList() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getRevenueLicenseExpireList();
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

    // Get mapping for get vehicles revenue by customer id and vehicle type id and group by current month and year
//    URL ( "/report/vehicleRevenueByVehicleType?customerId=1&vehicleTypeId=1")
    @GetMapping(value = "/report/vehicleRevenueByVehicleType", params = {"customerId", "vehicleTypeId"}, produces = "application/json")
    public List<Object[]> getVehiclesRevenueByCustomerIdAndVehicleTypeAndGroupByCurrantMonthAndYear(@RequestParam("customerId") Integer customerId, @RequestParam("vehicleTypeId") Integer vehicleTypeId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getVehiclesRevenueByCustomerIdAndVehicleTypeAndGroupByCurrantMonthAndYear(customerId, vehicleTypeId);
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
    @GetMapping(value = "report/useralldata", produces = "application/json")
    public List<User> findAllData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Employee");

        if (userPrivilage.getPrivi_select()) {
            // Last added data eke Mulata ganna oni nisa thama find all eke sort attributr
            // eka use karanne
            return userRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        } else {
            return new ArrayList<>();
        }
    }

//    --------------------supplier agreement report---------------------------

    // Get mapping for get all supplier agreements by date range (url -->/report/supplieragreement/bydaterangeandsupplierid?startdate=1&endtdate=2&supplierid=3)
    @GetMapping(value = "/report/supplieragreement/bydaterangeandsupplierid", params = {"startdate", "endtdate", "supplierid"}, produces = "application/json")
    public List<SupplierAgreement> getSupplierAgreementByDateRangeAndSupplier(@RequestParam("startdate") Date startdate, @RequestParam("endtdate") Date endtdate, @RequestParam("supplierid") Integer supplierid) {
        return reportRepository.getSupplierAgreementByDateRangeAndSupplier(startdate, endtdate, supplierid);

    }

    // Get mapping for get all supplier agreements by date range (url -->/report/supplieragreement/bydaterange?startdate=1&endtdate=2)
    @GetMapping(value = "/report/supplieragreement/bydaterange", params = {"startdate", "endtdate"}, produces = "application/json")
    public List<SupplierAgreement> getSupplierAgreementReport(@RequestParam("startdate") Date startdate, @RequestParam("endtdate") Date endtdate) {
        return reportRepository.getSupplierAgreementByDateRange(startdate, endtdate);

    }

    //    -------------------------------------------------------------- customer agreement report --------------------------------------------------------------
    // Get mapping for get all customer agreements by date range (url -->/report/customeragreement/bydaterangeandcustomerid?startdate=1&endtdate=2&customerid=3)
    @GetMapping(value = "/report/customeragreement/bydaterangeandcustomerid", params = {"startdate", "endtdate", "customerid"}, produces = "application/json")
    public List<CustomerAgreement> getCustomerAgreementByDateRangeAndCustomer(@RequestParam("startdate") Date startdate, @RequestParam("endtdate") Date endtdate, @RequestParam("customerid") Integer customerid) {
        return reportRepository.getCustomerAgreementByDateRangeAndCustomer(startdate, endtdate, customerid);

    }

    // Get mapping for get all customer agreements by date range (url -->/report/customeragreement/bydaterange?startdate=1&endtdate=2)
    @GetMapping(value = "/report/customeragreement/bydaterange", params = {"startdate", "endtdate"}, produces = "application/json")
    public List<CustomerAgreement> getCustomerAgreementReport(@RequestParam("startdate") Date startdate, @RequestParam("endtdate") Date endtdate) {
        return reportRepository.getCustomerAgreementByDateRange(startdate, endtdate);
    }

//    ----------------------------------------------------------daily booking summary report---------------------------------------------------------------

    //    bookings tika gnnw hourly in current day
    @GetMapping(value = "/report/dailyhourlybooking")
    public String[][] getBookingByHourly() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getHourlyBookings();
    }

    //    bookings tika gnnw status wise in current day
    @GetMapping(value = "/report/bookingbystatusdaily")
    public List<Object[]> getBookingByStatusDaily() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getBookingCountByStatus();
    }

    //    bookings details gnnw in current day
    @GetMapping(value = "/report/alldailybookings", produces = "application/json")
    public List<Booking> getAllBookingsForDaily() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getAllBookingsForDaily();
    }

    //    bookings details gnnw in current day by customer id (url -->/report/alldailybookingsbycustomer?customerId=1)
    @GetMapping(value = "/report/alldailybookingsbycustomer", params = {"customerId"}, produces = "application/json")
    public List<Booking> getAllBookingsForDailyByCustomer(@RequestParam("customerId") Integer customerId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getAllBookingsForDailyByCustomer(customerId);
    }

    //    bookings details gnnw in current day by booking status id(url -->/report/alldailybookingsbystatus?bookingStatusId=1)
    @GetMapping(value = "/report/alldailybookingsbystatus", params = {"bookingStatusId"}, produces = "application/json")
    public List<Booking> getAllBookingsForDailyByBookingStatus(@RequestParam("bookingStatusId") Integer bookingStatusId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getAllBookingsForDailyByBookingStatus(bookingStatusId);
    }

    //    bookings details gnnw in current day by customer id and booking status id(url -->/report/alldailybookingsbycustomerandstatus?customerId=1&bookingStatusId=1)
    @GetMapping(value = "/report/alldailybookingsbycustomerandstatus", params = {"customerId", "bookingStatusId"}, produces = "application/json")
    public List<Booking> getAllBookingsForDailyByCustomerAndStatus(@RequestParam("customerId") Integer customerId, @RequestParam("bookingStatusId") Integer bookingStatusId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getAllBookingsForDailyByCustomerAndStatus(customerId, bookingStatusId);
    }

    //    daily booking summary by vehicle type
    @GetMapping(value = "/report/dailybookingsummarybyvehicletype")
    public List<Object[]> getDailyBookingSummaryByVehicleType() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDailyBookingSummaryByVehicleType();
    }

    //vehicel utilization summary ganna query eka selected customer id ekata anuwa
//    (url -->/report/vehicleutilizationsummarybycustomer?customerId=1)
    @GetMapping(value = "/report/vehicleutilizationsummarybycustomer", params = {"customerId"}, produces = "application/json")
    public List<Object[]> getVehicleUtilizationSummaryByCustomer(@RequestParam("customerId") Integer customerId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDailyVehicleUtilizationSummaryByCustomer(customerId);
    }

    //vehicel utilization summary ganna query eka selected booking status id ekata anuwa
//    (url -->/report/vehicleutilizationsummarybystatus?bookingStatusId=1)
    @GetMapping(value = "/report/vehicleutilizationsummarybystatus", params = {"bookingStatusId"}, produces = "application/json")
    public List<Object[]> getVehicleUtilizationSummaryByBookingStatus(@RequestParam("bookingStatusId") Integer bookingStatusId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDailyVehicleUtilizationSummaryByBookingStatus(bookingStatusId);
    }

    //vehicel utilization summary ganna query eka selected booking status id ekata saha customer id anuwa
//    (url -->/report/vehicleutilizationsummarybycustomerandstatus?customerId=1&bookingStatusId=1)
    @GetMapping(value = "/report/vehicleutilizationsummarybycustomerandstatus", params = {"customerId", "bookingStatusId"}, produces = "application/json")
    public List<Object[]> getVehicleUtilizationSummaryByCustomerAndBookingStatus(@RequestParam("customerId") Integer customerId, @RequestParam("bookingStatusId") Integer bookingStatusId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDailyVehicleUtilizationSummaryByCustomerAndBookingStatus(customerId, bookingStatusId);
    }

    //--------------------------------------------------------------delay booking report---------------------------------------------------------------

    //    Get mapping for get all delay bookings by date range (url -->/report/delaybookingthisweek)
    @GetMapping(value = "/report/delaybookingthisweek", produces = "application/json")
    public String[][] getDelayBookingThisWeek() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDelayBookingThisWeek();

    }

    //    get mapping for delay bookings tika ganna
    @GetMapping(value = "/report/alldelaybookins", produces = "application/json")
    public List<Object[]> getAllDelayBookings() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getAllDelayBookings();

    }

    //get mapping for get overall performance this month report (url -->/report/overallperformancethismonth)
    @GetMapping(value = "/report/overallperformancethismonth", produces = "application/json")
    public Object[] getOverallPerformanceReport() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getOverallPerfomance();
    }

//    get mapping for get overall perfomance last month (url -->/report/overallperformancelastmonth)
    @GetMapping(value = "/report/overallperformancelastmonth", produces = "application/json")
    public Object[] getOverallPerformanceLastMonth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getOverallPerfomanceLastMonth();
    }

//    get mapping for get overall perfomance last 6 month (url -->/report/overallperformancelastsixmonth)
    @GetMapping(value = "/report/overallperformancelastsixmonth", produces = "application/json")
    public Object[] getOverallPerformanceLastSixMonth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getOverallPerfomanceLast6Month();
    }

//     get mapping for get overall perfomance this year (url -->/report/overallperformancethisyear)
    @GetMapping(value = "/report/overallperformancethisyear", produces = "application/json")
    public Object[] getOverallPerformanceThisYear() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getOverallPerfomanceThisYear();
    }

//    get mapping for get overall perfomance last year (url -->/report/overallperformancelastyear)
    @GetMapping(value = "/report/overallperformancelastyear", produces = "application/json")
    public Object[] getOverallPerformanceLastYear() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getOverallPerfomanceLastYear();
    }

//    ---------------------------------------------------driver performance report---------------------------------------------------------------

//    get mapping for get driver performance by date range (url -->/report/driverperformancebydaterange?startdate=1&endtdate=2)
    @GetMapping(value = "/report/driverperformancebydaterange", params = {"startdate", "endtdate"}, produces = "application/json")
    public List<Object[]> getDriverPerformanceByDateRange(@RequestParam("startdate") String startdate, @RequestParam("endtdate") String endtdate) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDriverPerformanceReportByDateRange(startdate, endtdate);

    }

//    get mapping for get all driver performance (url -->/report/alldriverperformance)
    @GetMapping(value = "/report/alldriverperformance", produces = "application/json")
    public List<Object[]> getAllDriverPerformance() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDriverPerformanceReport();

    }

//    get mapping for get selectd driver performance by driver id (url -->/report/driverperformancebydriverid?driverid=1)
    @GetMapping(value = "/report/driverperformancebydriverid", params = {"driverid"}, produces = "application/json")
    public String[][] getDriverPerformanceByDriverId(@RequestParam("driverid") Integer driverid) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getSelectedDriverPerformanceReport(driverid);
    }

//    get mapping for get driver performance by driver id and date range (url -->/report/driverperformancebydriveridanddaterange?driverid=1&startdate=1&endtdate=2)
    @GetMapping(value = "/report/driverperformancebydriveridanddaterange", params = {"driverid", "startdate", "endtdate"}, produces = "application/json")
    public String[][] getDriverPerformanceByDriverIdAndDateRange(@RequestParam("driverid") Integer driverid, @RequestParam("startdate") String startdate, @RequestParam("endtdate") String endtdate) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getSelectedDriverPerformanceReportByDateRange(driverid, startdate, endtdate);
    }

//    get mapping for get driver rankings by driver id (url -->/report/driverrankings?driverid=1
    @GetMapping(value = "/report/driverrankings",params = {"driverid"}, produces = "application/json")
    public String[][] getDriverRankings(@RequestParam("driverid") Integer driverid) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDriverRanking(driverid);
    }

//    get all drivers count (url -->/report/countofallactiveandinactiveDrivers)
    @GetMapping(value = "/report/countofallactiveandinactiveDrivers")
    public Integer getDriverCountWithAtLeastOneTrip() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDriverCountWithAtLeastOneTrip();
    }

//    get mapping for get only bookings completed driver list (url -->/report/driverlistwithatleastonetrip)
    @GetMapping(value = "/report/driverlistwithatleastonetrip", produces = "application/json")
    public List<Driver> getDriverListWithAtLeastOneTrip() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDriverList();
    }

//    ---------------------------------------------------end of driver performance report---------------------------------------------------------------

//    ---------------------------------------------------income report---------------------------------------------------------------

//    get mapping for get income report this month (url -->/report/incomethismonth)
    @GetMapping(value = "/report/incomethismonth", produces = "application/json")
    public String[][] getIncomeThisMonth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getIncomeReportByThisMonth();
    }
//    get mapping for get income date to card  (url -->/report/incomecardsthismonth)
@GetMapping(value = "/report/incomecardsthismonth", produces = "application/json")
public String[][] getIncomeCards(@RequestParam("period") String period) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    Privilage userPrivilage = userPrivilageController
            .getUserPrivilageByUserModule(auth.getName(), "Report");

    LocalDate today = LocalDate.now();
    LocalDate startDate;
    LocalDate endDate = today;

    switch (period.toLowerCase()) {
        case "thismonth":
            startDate = today.withDayOfMonth(1);
            endDate = today.withDayOfMonth(today.lengthOfMonth());
            break;
        case "lastmonth":
            startDate = today.minusMonths(1).withDayOfMonth(1);
            endDate = today.minusMonths(1).withDayOfMonth(today.minusMonths(1).lengthOfMonth());
            break;
        case "last6month":
            startDate = today.minusMonths(6).withDayOfMonth(1);
            endDate = today.withDayOfMonth(today.lengthOfMonth());
            break;
        case "thisyear":
            startDate = today.withDayOfYear(1);
            endDate = today.withDayOfYear(today.lengthOfYear());
            break;
        case "lastyear":
            startDate = today.minusYears(1).withDayOfYear(1);
            endDate = today.minusYears(1).withDayOfYear(today.minusYears(1).lengthOfYear());
            break;
        default:
            startDate = today.withDayOfMonth(1);
            endDate = today.withDayOfMonth(today.lengthOfMonth());
            break;
    }

    // Convert LocalDate → String before sending to repository
    return reportRepository.getDataForIncomeCards(startDate.toString(), endDate.toString());
}


    //    get mapping for get all customer wise income report (url -->/report/customerwiseincomethismonth)
    @GetMapping(value = "/report/customerwiseincomethismonth", produces = "application/json")
    public String[][] getCustomerWiseIncome() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getIncomeByAllCustomersWiseThisMonth();
    }

//    get mapping for get last month income report (url -->/report/incomelastmonth)
    @GetMapping(value = "/report/incomelastmonth", produces = "application/json")
    public String[][] getIncomeLastMonth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getIncomeReportByLastMonth();
    }

    //    get mapping for get all customer wise income report (url -->/report/customerwiseincomelastmonth)
    @GetMapping(value = "/report/customerwiseincomelastmonth", produces = "application/json")
    public String[][] getIncomeByAllCustomersWiseLastMonth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getIncomeByAllCustomersWiseLastMonth();
    }

//    get mapping for get last 3 month income report (url -->/report/incomelast3month)
    @GetMapping(value = "/report/incomelast3month", produces = "application/json")
    public String[][] getIncomeLast3Month() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getIncomeReportByLast3Months();
    }

    //    get mapping for get all customer wise income report last 3 month (url -->/report/customerwiseincomelast3month)
    @GetMapping(value = "/report/customerwiseincomelast3month", produces = "application/json")
    public String[][] getIncomeByAllCustomersWiseLast3Month() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getIncomeByAllCustomersWiseLast3Month();
    }

    //    get mapping for get last 6 month income report (url -->/report/incomelast6month)
    @GetMapping(value = "/report/incomelast6month", produces = "application/json")
    public String[][] getIncomeLast6Month() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getIncomeReportByLast6Months();
    }

    //    get mapping for get all customer wise income report last 6 month (url -->/report/customerwiseincomelast6month)
    @GetMapping(value = "/report/customerwiseincomelast6month", produces = "application/json")
    public String[][] getIncomeByAllCustomersWiseLast6Month() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getIncomeByAllCustomersWiseLast6Month();
    }

    //    get mapping for get this year income report (url -->/report/incomethisyear)
    @GetMapping(value = "/report/incomethisyear", produces = "application/json")
    public String[][] getIncomeThisYear() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getIncomeReportByThisYear();
    }

    //    get mapping for get all customer wise income report this year (url -->/report/customerwiseincomethisyear)
    @GetMapping(value = "/report/customerwiseincomethisyear", produces = "application/json")
    public String[][] getIncomeByAllCustomersWiseThisYear() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getIncomeByAllCustomersWiseThisYear();
    }

    //    get mapping for get last year income report (url -->/report/incomelastyear)
    @GetMapping(value = "/report/incomelastyear", produces = "application/json")
    public String[][] getIncomeLastYear() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getIncomeReportByLastYear();
    }

    //    get mapping for get all customer wise income report last year (url -->/report/customerwiseincomelastyear)
    @GetMapping(value = "/report/customerwiseincomelastyear", produces = "application/json")
    public String[][] getIncomeByAllCustomersWiseLastYear() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getIncomeByAllCustomersWiseLastYear();
    }
}

