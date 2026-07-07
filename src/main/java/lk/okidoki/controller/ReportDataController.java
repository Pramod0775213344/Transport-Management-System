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

    // --------------------------------booking perfomance report
    // ekata---------------------------------
    // Get mapping for get bookings by date range (url
    // -->/reportbooking/bydaterangeandtype?startdate=1&endtdate=2)
    @GetMapping(value = "/report/bydaterangeandtype", params = { "startdate",
            "endtdate" }, produces = "application/json")
    public List<Booking> getBookingReport(@RequestParam("startdate") Date startdate,
            @RequestParam("endtdate") Date endtdate) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getBookingByDateRange(startdate, endtdate);

    }

    // Get mapping for get bookings by date range (url
    // -->/reportbooking/chartdata?startdate=1&endtdate=2)
    @GetMapping(value = "/report/chartdata", params = { "dateType", }, produces = "application/json")
    public String[][] getBookingReport(@RequestParam("dateType") String dateType) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");

        if (dateType.equals("this_month")) {
            return reportRepository.getThisMonthActualVsSchedule();
        } else if (dateType.equals("this_year")) {
            return reportRepository.getThisYearActualVsSchedule();
        } else if (dateType.equals("last_month")) {
            return reportRepository.getLastMonthActualVsSchedule();
        } else if (dateType.equals("last_3_months")) {
            return reportRepository.getLast3MonthsActualVsSchedule();
        } else if (dateType.equals("last_6_months")) {
            return reportRepository.getLast6MonthsActualVsSchedule();
        } else if (dateType.equals("this_year")) {
            return reportRepository.getThisYearActualVsSchedule();
        }

        return null;
    }

    // Load supplier payment report data with filters
    @GetMapping(value = "/report/supplierpayment", produces = "application/json")
    public List<SupplierPayment> getSupplierPaymentReport(
            @RequestParam(value = "startdate", required = false) Date startdate,
            @RequestParam(value = "enddate", required = false) Date enddate,
            @RequestParam(value = "supplierid", required = false) Integer supplierid) {

        List<SupplierPayment> results;

        if (startdate != null && enddate != null && supplierid != null) {
            results = reportRepository.getSupplierPaymentByDateRangeAndSupplier(startdate, enddate, supplierid);
        } else if (startdate != null && enddate != null) {
            results = reportRepository.getSupplierPaymentByDateRange(startdate, enddate);
        } else if (supplierid != null) {
            results = reportRepository.getSupplierPaymentBySupplier(supplierid);
        } else {
            results = reportRepository.getSupplierPaymentReport();
        }

        return results;
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
    public List<Booking> getAllBookingsForDaily() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getAllBookingsForDaily();
    }

    // bookings details gnnw in current day by customer id (url
    // -->/report/alldailybookingsbycustomer?customerId=1)
    @GetMapping(value = "/report/alldailybookingsbycustomer", params = { "customerId" }, produces = "application/json")
    public List<Booking> getAllBookingsForDailyByCustomer(@RequestParam("customerId") Integer customerId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getAllBookingsForDailyByCustomer(customerId);
    }

    // bookings details gnnw in current day by booking status id(url
    // -->/report/alldailybookingsbystatus?bookingStatusId=1)
    @GetMapping(value = "/report/alldailybookingsbystatus", params = {
            "bookingStatusId" }, produces = "application/json")
    public List<Booking> getAllBookingsForDailyByBookingStatus(
            @RequestParam("bookingStatusId") Integer bookingStatusId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getAllBookingsForDailyByBookingStatus(bookingStatusId);
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

    // daily booking summary by vehicle type
    @GetMapping(value = "/report/dailybookingsummarybyvehicletype")
    public List<Object[]> getDailyBookingSummaryByVehicleType() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDailyBookingSummaryByVehicleType();
    }

    // vehicel utilization summary ganna query eka selected customer id ekata anuwa
    // (url -->/report/vehicleutilizationsummarybycustomer?customerId=1)
    @GetMapping(value = "/report/vehicleutilizationsummarybycustomer", params = {
            "customerId" }, produces = "application/json")
    public List<Object[]> getVehicleUtilizationSummaryByCustomer(@RequestParam("customerId") Integer customerId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDailyVehicleUtilizationSummaryByCustomer(customerId);
    }

    // vehicel utilization summary ganna query eka selected booking status id ekata
    // anuwa
    // (url -->/report/vehicleutilizationsummarybystatus?bookingStatusId=1)
    @GetMapping(value = "/report/vehicleutilizationsummarybystatus", params = {
            "bookingStatusId" }, produces = "application/json")
    public List<Object[]> getVehicleUtilizationSummaryByBookingStatus(
            @RequestParam("bookingStatusId") Integer bookingStatusId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDailyVehicleUtilizationSummaryByBookingStatus(bookingStatusId);
    }

    // vehicel utilization summary ganna query eka selected booking status id ekata
    // saha customer id anuwa
    // (url
    // -->/report/vehicleutilizationsummarybycustomerandstatus?customerId=1&bookingStatusId=1)
    @GetMapping(value = "/report/vehicleutilizationsummarybycustomerandstatus", params = { "customerId",
            "bookingStatusId" }, produces = "application/json")
    public List<Object[]> getVehicleUtilizationSummaryByCustomerAndBookingStatus(
            @RequestParam("customerId") Integer customerId, @RequestParam("bookingStatusId") Integer bookingStatusId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDailyVehicleUtilizationSummaryByCustomerAndBookingStatus(customerId,
                bookingStatusId);
    }

    // --------------------------------------------------------------delay booking
    // report---------------------------------------------------------------

    // Get mapping for get all delay bookings by date range (url
    // -->/report/delaybookingthisweek)
    @GetMapping(value = "/report/delaybookingthisweek", produces = "application/json")
    public String[][] getDelayBookingThisWeek() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDelayBookingThisWeek();

    }

    // get mapping for delay bookings tika ganna
    @GetMapping(value = "/report/alldelaybookins", produces = "application/json")
    public String[][] getAllDelayBookings() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getAllDelayBookings();

    }

    // get mapping for get overall performance this month report (url
    // -->/report/overallperformancethismonth)
    @GetMapping(value = "/report/overallperformancethismonth", produces = "application/json")
    public Object[] getOverallPerformanceReport() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getOverallPerfomance();
    }

    // get mapping for get overall perfomance last month (url
    // -->/report/overallperformancelastmonth)
    @GetMapping(value = "/report/overallperformancelastmonth", produces = "application/json")
    public Object[] getOverallPerformanceLastMonth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getOverallPerfomanceLastMonth();
    }

    // get mapping for get overall perfomance last 6 month (url
    // -->/report/overallperformancelastsixmonth)
    @GetMapping(value = "/report/overallperformancelastsixmonth", produces = "application/json")
    public Object[] getOverallPerformanceLastSixMonth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getOverallPerfomanceLast6Month();
    }

    // get mapping for get overall perfomance this year (url
    // -->/report/overallperformancethisyear)
    @GetMapping(value = "/report/overallperformancethisyear", produces = "application/json")
    public Object[] getOverallPerformanceThisYear() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getOverallPerfomanceThisYear();
    }

    // get mapping for get overall perfomance last year (url
    // -->/report/overallperformancelastyear)
    @GetMapping(value = "/report/overallperformancelastyear", produces = "application/json")
    public Object[] getOverallPerformanceLastYear() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getOverallPerfomanceLastYear();
    }

    // get mapping for get ontime and delay precenatge over month
    @GetMapping(value = "/report/ontimedelaypredentage", produces = "application/json")
    public String[][] getDelayAndOnTimePrecentageWithMonth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDelayAndOnTimePrecentageWithMonth();
    }

    // get mapping for delay wela thiyena reason eka anuwa booking count eka saha
    // precentage eka
    // gnnawa currnt month eke adlawa with reason wise
    @GetMapping(value = "/report/delayprecenategbyreason", produces = "application/json")
    public String[][] getDelaPrecentageByReasinWiseCurruntYear() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDelaPrecentageByReasinWiseCurruntYear();
    }

    // get mapping for customerta adalwa delay details ganna
    @GetMapping(value = "/report/delaydetailsbycustomer", produces = "application/json")
    public String[][] getDelayDetailsByCustomerWise() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDelayDetailsByCustomerWise();
    }

    // get mapping for vehicle ta adalwa delay details ganna
    @GetMapping(value = "/report/delaydetailsbyvehicle", produces = "application/json")
    public String[][] getDelayDetailsByVehicleTypeWise() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDelayDetailsByVehicleTypeWise();
    }

    // ---------------------------------------------------driver performance
    // report---------------------------------------------------------------

    // get mapping for get driver performance by date range (url
    // -->/report/driverperformancebydaterange?startdate=1&endtdate=2)
    @GetMapping(value = "/report/driverperformancebydaterange", params = { "startdate",
            "endtdate" }, produces = "application/json")
    public List<Object[]> getDriverPerformanceByDateRange(@RequestParam("startdate") String startdate,
            @RequestParam("endtdate") String endtdate) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDriverPerformanceReportByDateRange(startdate, endtdate);

    }

    // get mapping for get all driver performance (url
    // -->/report/alldriverperformance)
    @GetMapping(value = "/report/alldriverperformance", produces = "application/json")
    public List<Object[]> getAllDriverPerformance() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDriverPerformanceReport();

    }

    // get mapping for get selectd driver performance by driver id (url
    // -->/report/driverperformancebydriverid?driverid=1)
    @GetMapping(value = "/report/driverperformancebydriverid", params = { "driverid" }, produces = "application/json")
    public String[][] getDriverPerformanceByDriverId(@RequestParam("driverid") Integer driverid) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getSelectedDriverPerformanceReport(driverid);
    }

    // get mapping for get driver performance by driver id and date range (url
    // -->/report/driverperformancebydriveridanddaterange?driverid=1&startdate=1&endtdate=2)
    @GetMapping(value = "/report/driverperformancebydriveridanddaterange", params = { "driverid", "startdate",
            "endtdate" }, produces = "application/json")
    public String[][] getDriverPerformanceByDriverIdAndDateRange(@RequestParam("driverid") Integer driverid,
            @RequestParam("startdate") String startdate, @RequestParam("endtdate") String endtdate) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getSelectedDriverPerformanceReportByDateRange(driverid, startdate, endtdate);
    }

    // get mapping for get driver rankings by driver id (url
    // -->/report/driverrankings?driverid=1
    @GetMapping(value = "/report/driverrankings", params = { "driverid" }, produces = "application/json")
    public String[][] getDriverRankings(@RequestParam("driverid") Integer driverid) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDriverRanking(driverid);
    }

    // get all drivers count (url -->/report/countofallactiveandinactiveDrivers)
    @GetMapping(value = "/report/countofallactiveandinactiveDrivers")
    public Integer getDriverCountWithAtLeastOneTrip() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDriverCountWithAtLeastOneTrip();
    }

    // get mapping for get only bookings completed driver list (url
    // -->/report/driverlistwithatleastonetrip)
    @GetMapping(value = "/report/driverlistwithatleastonetrip", produces = "application/json")
    public List<Driver> getDriverListWithAtLeastOneTrip() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getDriverList();
    }

    // ---------------------------------------------------end of driver performance
    // report---------------------------------------------------------------

    // ---------------------------------------------------income
    // report---------------------------------------------------------------

    // get mapping for get income report this month (url -->/report/profit)
    @GetMapping(value = "/report/profit", params = { "dateType", }, produces = "application/json")
    public List<Object[]> getProfitReport(@RequestParam("dateType") String dateType) {
        if (dateType == null) {
            return new ArrayList<>();
        }

        switch (dateType.trim().toLowerCase()) {
            case "this_month":
                return reportRepository.getProfitThisMonth();
            case "last_month":
                return reportRepository.getProfitLastMonth();
            case "last_3_months":
                return reportRepository.getProfitLast3Months();
            case "last_6_months":
                return reportRepository.getProfitLast6Months();
            case "this_year":
                return reportRepository.getProfitThisYear();
            case "last_year":
                return reportRepository.getProfitLastYear();
            default:
                return new ArrayList<>();
        }
    }

    // ---------------------------dashboard cards data---------------------------

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

    // -----------------------pending bookings report API-----------------------
    // Get mapping for get all pending bookings (url -->/report/allpendingbookings)
    @GetMapping(value = "/report/allpendingbookings", produces = "application/json")
    public List<Booking> getAllPendingBookings() {
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

    // ---------------------customer payment report API-----------------------
    @GetMapping(value = "/report/customerpayment", produces = "application/json")
    public List<Object[]> getCustomerPaymentReport() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getCustomerPayments();
       
    }

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
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Report");
        return reportRepository.getLastTripDeliveryTime(vehicleid);
    }

    // ------------------------for customer portal------------------------------
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

    // get mapping for get vehicle revenue report date type (url -->/report/revenue)
    @GetMapping(value = "/report/revenue", params = {"customerid", "vehicletypeid", "dateType"}, produces = "application/json")
    public String[][] getRevenueReport(@RequestParam("customerid") Integer customerid,
            @RequestParam("vehicletypeid") Integer vehicletypeid, @RequestParam("dateType") String dateType) {
         if (dateType == null) {
                return new String[][] {};
          }

        switch (dateType.trim().toLowerCase()) {
            case "this_month":
                return reportRepository.getRevenueReportThisMonth(customerid, vehicletypeid);
            case "last_month":
                return reportRepository.getRevenueReportLastMonth(customerid, vehicletypeid);
            case "last_3_months":
                return reportRepository.getRevenueReportLast3Month(customerid, vehicletypeid);
            case "last_6_months":
                return reportRepository.getRevenueReportLast6Month(customerid, vehicletypeid);
            case "this_year":
                return reportRepository.getRevenueReportThisYear(customerid, vehicletypeid);
            case "last_year":
                return reportRepository.getRevenueReportLastYear(customerid, vehicletypeid);
            default:
                return new String[][] {};
        }
    }

}
