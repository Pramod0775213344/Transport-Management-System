package lk.okidoki.controller;

import lk.okidoki.modal.Booking;
import lk.okidoki.modal.Notification;
import lk.okidoki.modal.NotificationReadStatus;
import lk.okidoki.modal.Privilage;
import lk.okidoki.modal.User;
import lk.okidoki.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
// servalet container implement karapu service update karaganna thamai
// @RestCntroller anotation eka use karanne
public class BookingController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingStatusRepository bookingStatusRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationReadStatusRepository notificationReadStatusRepository;

    // @Autowired
    // private LocationRepository locationRepository;

    // get mapping for get booking ui(url --->/booking)
    @GetMapping(value = "/booking")
    public ModelAndView loadBookingUi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Booking Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView bookinUI = new ModelAndView();
        bookinUI.setViewName("booking.html");
        bookinUI.addObject("logedusername", auth.getName());
        bookinUI.addObject("loggeduserphoto", logeduser.getUser_photo());
        bookinUI.addObject("logeduseremail", logeduser.getEmail());
        bookinUI.addObject("logeduserfullname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
        bookinUI.addObject("logeduserCallingname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname() : null);
        bookinUI.addObject("logeduserDesignation",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getDesignation_id().getName() : null);
        bookinUI.addObject("userPrivilage", userPrivilage);
        bookinUI.addObject("pageTitle", "Booking");
        return bookinUI;

    }

    // get mapping for get all booking ui(url --->/allbooking)
    @GetMapping(value = "/allbooking")
    public ModelAndView loadAllBookingUi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView bookinUI = new ModelAndView();
        bookinUI.setViewName("allbooking.html");
        bookinUI.addObject("logedusername", auth.getName());
        bookinUI.addObject("loggeduserphoto", logeduser.getUser_photo());
        bookinUI.addObject("logeduseremail", logeduser.getEmail());
        bookinUI.addObject("logeduserfullname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
        bookinUI.addObject("logeduserCallingname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname() : null);
        bookinUI.addObject("logeduserDesignation",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getDesignation_id().getName() : null);
        bookinUI.addObject("pageTitle", "All Bookings");
        return bookinUI;

    }

    // get mapping for get all booking data (url -->/booking/alldata)
    @RequestMapping(value = "/booking/alldata")
    public List<Booking> getAllBookingData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Booking Management");

        if (userPrivilage.getPrivi_select()) {
            return bookingRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        } else {
            return new ArrayList<>();
        }

    }

    // get mapping for booking insert into table(url -->/booking/insert)
    @PostMapping(value = "/booking/insert")
    public String saveBooking(@RequestBody Booking booking) {
        // checek authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Booking Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        // check existing
        if (userPrivilage.getPrivi_insert()) {
            try {

                // auto updated date and time
                booking.setAdded_datetime(LocalDateTime.now());
                booking.setAdded_user_id(logeduser.getId());

                // set user status into inproccess
                booking.setBooking_status_id(bookingStatusRepository.getReferenceById(1));

                // save operator
                bookingRepository.save(booking);

                // notification okkoma users lata send karanwa
                try {
                    Notification notification = new Notification();
                    notification.setTitle("Booking Confirmed");
                    notification.setMessage("Booking #" + booking.getBooking_no() + " has been placed successfully");
                    notification.setReferenceType("BOOKING");
                    notification.setAlert_type("CREATED");
                    notification.setReferenceId(booking.getId());
                    notification.setAddedDatetime(
                            LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

                    Notification savedNotification = notificationRepository.save(notification);

                    // okkoma users lata read_status row ekak hadanawa
                    List<User> allUsers = userRepository.findAll();
                    List<NotificationReadStatus> readStatusList = new ArrayList<>();

                    for (User user : allUsers) {
                        NotificationReadStatus readStatus = new NotificationReadStatus();
                        readStatus.setNotification(savedNotification);
                        readStatus.setUserId(user.getId());
                        readStatus.setIsRead("0");
                        readStatusList.add(readStatus);
                    }

                    notificationReadStatusRepository.saveAll(readStatusList);

                } catch (Exception notifEx) {
                    System.out.println("Notification failed: " + notifEx.getMessage());
                }

                // return ok
                return "ok";
            } catch (Exception e) {
                return "Save Not Completed :" + e.getMessage();
            }
        } else {

            return "Save Not Successed : You have not access";
        }

    }

    // get mapping for booking upadate into table(url -->/booking/update)
    @PutMapping(value = "/booking/update")
    public String updateBooking(@RequestBody Booking booking) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Booking Management");

        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_update()) {
            // check ext
            if (booking.getId() == null) {
                return "Update Not Success: Booking not found";
            }

            Booking extBookingId = bookingRepository.getReferenceById(booking.getId());
            if (extBookingId == null) {
                return "Update Not Success: Booking not Exist";
            }
            // save auto added data
            try {
                booking.setUpdated_datetime(LocalDateTime.now());
                booking.setUpdated_user_id(logeduser.getId());

                bookingRepository.save(booking);

                // notification okkoma users lata send karanwa
                try {
                    Notification notification = new Notification();
                    notification.setTitle("Booking Updated");
                    notification.setMessage("Booking #" + booking.getBooking_no() + " has been placed Updated");
                    notification.setReferenceType("BOOKING");
                    notification.setAlert_type("WARNING");
                    notification.setReferenceId(booking.getId());
                    notification.setAddedDatetime(
                            LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

                    Notification savedNotification = notificationRepository.save(notification);

                    // okkoma users lata read_status row ekak hadanawa
                    List<User> allUsers = userRepository.findAll();
                    List<NotificationReadStatus> readStatusList = new ArrayList<>();

                    for (User user : allUsers) {
                        NotificationReadStatus readStatus = new NotificationReadStatus();
                        readStatus.setNotification(savedNotification);
                        readStatus.setUserId(user.getId());
                        readStatus.setIsRead("0");
                        readStatusList.add(readStatus);
                    }

                    notificationReadStatusRepository.saveAll(readStatusList);

                } catch (Exception notifEx) {
                    System.out.println("Notification failed: " + notifEx.getMessage());
                }

                return "ok";
            } catch (Exception e) {
                return "Update Not Completed :" + e.getMessage();
            }
        } else

        {

            return "Save Not Successed : You have not access";
        }
    }

    // get mapping for booking delete into table(url -->/booking/delete)
    @DeleteMapping(value = "/booking/delete")
    public String deleteBooking(@RequestBody Booking booking) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Booking Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        // check existing
        if (userPrivilage.getPrivi_delete()) {
            if (booking.getId() == null) {
                return "Delete Not Success: Booking not found" + booking.getBooking_no();
            }

            Booking extBookingId = bookingRepository.getReferenceById(booking.getId());
            if (extBookingId == null) {
                return "Delete Not Success: Booking not Exist";
            }

            try {
                // set auto added data
                booking.setDeleted_datetime(LocalDateTime.now());
                booking.setDeletd_user_id(logeduser.getId());
                booking.setBooking_status_id(bookingStatusRepository.getReferenceById(7));

                // save operator
                bookingRepository.save(booking);

                // return msg
                return "ok";
            } catch (Exception e) {
                return "Delete Not Completed :" + e.getMessage();
            }
        } else {

            return "Delete Not Successed : You have not access";
        }

    }

    // get mapping for get inprocess booking data (url -->/booking/bystatus)
    @RequestMapping(value = "/booking/bystatus")
    public List<Booking> getAllBookingDataByStatus() {
        return bookingRepository.getByStatus();
    }

    // get mapping for get inprocess booking data (url -->/booking/bystatus)
    @RequestMapping(value = "/booking/bystatusdepartedfromdeliverystatus")
    public List<Booking> getAllBookingDataByDepartedFromDeliveryStatus() {
        return bookingRepository.getByDepartedFromDeliveryStatus();

    }

    // Get mapping for get all booking data by given customer id (url
    // -->/booking/bycustomerid?customerid=1&packagesType=2&vehicleTypeid=3)
    @GetMapping(value = "/booking/bycustomerid", params = { "customerid", "packagesType",
            "vehicleTypeid" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Booking> getPackageByVehicleType(@RequestParam("customerid") Integer customerid,
            @RequestParam("packagesType") String packagesType, @RequestParam("vehicleTypeid") Integer vehicleTypeid) {
        return bookingRepository.getBookingByCustomer(customerid, packagesType, vehicleTypeid);
    }

    // get mapping for get recent 5 booking data (url -->/booking/recentbooking)
    @GetMapping(value = "/booking/recentbooking")
    public List<Booking> getRecentFiveBookings() {
        return bookingRepository.getRecentFiveBookings();
    }

    // get mapping for get all booking data by given customer id (url
    // -->/booking/bycustomerid?customerid=1)
    // get mapping for get recent 5 booking data (url -->/booking/recentbooking)
    @GetMapping(value = "/booking/recentbookingbycustomerid", params = { "customerid" }, produces = "application/json")
    public List<Booking> getRecentFiveBookingsByCustomer(@RequestParam("customerid") Integer customerid) {
        return bookingRepository.getRecentFiveBookingsByCustomer(customerid);
    }

    // Get mapping for get all booking data by given vehicle id (url
    // -->/booking/byvehicleid?vehicleid=1)
    @GetMapping(value = "/booking/byvehicleid", params = { "vehicleid" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Booking> getBookingByGivenVehicleNo(@RequestParam("vehicleid") Integer vehicleid) {
        return bookingRepository.getBookingByGivenVehicleNo(vehicleid);
    }

    // Get mapping for get all booking data by given customer id and given date
    // range(url
    // -->/booking/bydaterangeandcustomerid?startdate=1&enddate=2&customerid=3)
    @GetMapping(value = "/booking/bydaterangeandcustomerid", params = { "startdate", "enddate",
            "customerid" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Booking> getBookingByDateRangeAndCustomer(@RequestParam("startdate") String startdate,
            @RequestParam("enddate") String enddate, @RequestParam("customerid") Integer customerid) {
        return bookingRepository.getBookingByDateRangeAndCustomer(startdate, enddate, customerid);
    }

    // Get mapping for get all booking data by given date range(url
    // -->/booking/bydaterange?startdate=1&enddate=2)
    @GetMapping(value = "/booking/bydaterange", params = { "startdate", "enddate" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Booking> getBookingByDateRange(@RequestParam("startdate") String startdate,
            @RequestParam("enddate") String enddate) {
        return bookingRepository.getBookingByDateRange(startdate, enddate);
    }

    // currunt date ekata adalawa bookings tika witharak load karan api eka
    @GetMapping(value = "/booking/bycurruntdate", produces = "application/json")
    public List<Booking> getCurrentdateBookings() {
        return bookingRepository.getCurrentdateBookings();
    }

    // --------------------inproccess data search
    // Mappings--------------------------------------------------

    // -->/booking/inproccessbookingbycustomerid?&customerid=3)
    @GetMapping(value = "/booking/inproccessbookingbycustomerid", params = {
            "customerid" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Booking> getInproccessBookingByCustomer(@RequestParam("customerid") Integer customerid) {
        return bookingRepository.getInproccessBookingByCustomer(customerid);
    }

    // -->/booking/inproccessbookingbyvehicletypeid?vehicletypeid=3)
    @GetMapping(value = "/booking/inproccessbookingbyvehicletypeid", params = {
            "vehicletypeid" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Booking> getInproccessBookingByVehicleType(@RequestParam("vehicletypeid") Integer vehicletypeid) {
        return bookingRepository.getInproccessBookingByVehicleType(vehicletypeid);
    }

    // -->/booking/inproccessbookingbycustomeridandvehicletypeid?customerid=3&vehicletypeid=3)
    @GetMapping(value = "/booking/inproccessbookingbycustomeridandvehicletypeid", params = { "customerid",
            "vehicletypeid" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Booking> getInproccessBookingByCustomerAndVehicleType(@RequestParam("customerid") Integer customerid,
            @RequestParam("vehicletypeid") Integer vehicletypeid) {
        return bookingRepository.getInproccessBookingByCustomerAndVehicleType(customerid, vehicletypeid);
    }
    // --------------------inproccess data search Mappings
    // end--------------------------------------------------

    // ----------------invoice ui eka athulata oni booking data ganne query
    // eka-----------------------------

    // -->/booking/forinvoiceui?customerid=1&packageType=FloatingRate&month=October
    @GetMapping(value = "/booking/forinvoiceui", params = { "customerid", "packageType",
            "month" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Booking> getBookingForInvoiceUi(@RequestParam("customerid") Integer customerid,
            @RequestParam("packageType") String packageType, @RequestParam("month") String month) {
        return bookingRepository.getBookingByCustomerAndPackageTypeAndMonth(customerid, packageType, month);
    }

    @GetMapping(value = "/booking/customerpaymentmonth", params = { "customerid" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Map<String, Object>> getCustomerPaymentMonths(@RequestParam("customerid") Integer customerid) {
        return bookingRepository.getCustomerPaymentMonths(customerid);
    }

    // -------------------SUPPLIER PAYMENT BOOKINGS-----------------------------

    // get mapping for get all completed booking data with suppliers (url
    // -->/booking/completedbookingswithsuppliers)
    @RequestMapping(value = "/booking/completedbookingswithsuppliers")
    public List<Booking> getCompletedBookingsWithSuppliers() {
        return bookingRepository.getCompletedBookingsWithSuppliers();

    }

    // ------------------for fuel request
    // form----------------------------------------

    // get mapping for get all ongoni bookings suing vehicle id and driver id (url
    // -->/booking/ongonibookingbyvehicleiddriverid?vehicleid=27&driverid=15)
    @GetMapping(value = "/booking/ongonibookingbyvehicleiddriverid", params = { "vehicleid",
            "driverid" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Booking> getOngoingBookingByVehicleIdDriverId(@RequestParam("vehicleid") Integer vehicleid,
            @RequestParam("driverid") Integer driverid) {
        return bookingRepository.getBookingsForFuelRequest(vehicleid, driverid);
    }

    // get mapping for get total distance vehicle id
    // (url-->/booking/totaldistanceforselectedvehicle?vehicleid=27)
    @GetMapping(value = "/booking/totaldistanceforselectedvehicle", params = {
            "vehicleid" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public BigDecimal getTotalDistance(@RequestParam("vehicleid") Integer vehicleid) {
        return bookingRepository.getTotalDistance(vehicleid);
    }

    // ----------------for vehicle
    // group-----------------------------------------------
    // active booking ekak thiyena (Busy) vehicle IDs gnnwa
    @GetMapping(value = "/booking/busyvehicleids", produces = "application/json")
    public List<Integer> getBusyVehicleIds() {
        return bookingRepository.getBusyVehicleIds();
    }

    // dena lada datetime period ekak athulata thiyena (Busy) vehicle IDs gnnwa
    // @GetMapping(value = "/booking/busyvehicleidsbydatetime", params = { "pickupdatetime", "deliverydatetime" }, produces = "application/json")
    // public List<Integer> getBusyVehicleIdsByDateTime(@RequestParam("pickupdatetime") String pickupdatetime, @RequestParam("deliverydatetime") String deliverydatetime) {
    //     return bookingRepository.getBusyVehicleIdsByDateTime(pickupdatetime, deliverydatetime);
    // }

    @GetMapping(value = "/booking/busydriversId", produces = "application/json")
    public List<Integer> getBusyDriverIds() {
        return bookingRepository.getBusyDriverIds();
    }

    // ------------------for supplier payable ekata----------------------------
    @GetMapping(value = "/booking/supplierpaymentmonth", params = { "vehicleid" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Map<String, Object>> getSupplierPaymentMonths(@RequestParam("vehicleid") Integer vehicleid) {
        return bookingRepository.getSupplierPaymentMonths(vehicleid);
    }

    // ---------------------fro driver portal--------------------------------
    @GetMapping(value = "/booking/frodriverportal", params = { "driverid" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Booking> getBookingForDriverPortal(@RequestParam("driverid") Integer driverid) {
        return bookingRepository.getBookingForDriverPortal(driverid);
    }

    // -------------------for customer portal ui--------------
    // (url -->/booking/completecountbycustomer)
    @GetMapping(value = "/booking/completecountbycustomer", params = { "customerId" }, produces = "application/json")
    public Integer getcompletedBookingCountByCustomer(@RequestParam("customerId") Integer customerId) {
        return bookingRepository.getcompletedBookingCountByCustomer(customerId);
    }

    // (url -->/booking/totaldistancecountbycustomer)
    @GetMapping(value = "/booking/totaldistancecountbycustomer", params = {
            "customerId" }, produces = "application/json")
    public BigDecimal getTotalDistanceByCustomer(@RequestParam("customerId") Integer customerId) {
        return bookingRepository.getTotalDistanceByCustomer(customerId);
    }

    // (url -->/booking/pendingcountbycustomer)
    @GetMapping(value = "/booking/pendingcountbycustomer", params = { "customerId" }, produces = "application/json")
    public Integer getPendingBookingCountByCustomer(@RequestParam("customerId") Integer customerId) {
        return bookingRepository.getPendingBookingCountByCustomer(customerId);
    }

    // (url -->/booking/completedbookingcountbyvehicle)
    @GetMapping(value = "/booking/completedbookingcountbyvehicle", params = {
            "vehicleId" }, produces = "application/json")
    public Integer getCompletedBookingCountForCurrentMonthByVehicle(@RequestParam("vehicleId") Integer vehicleId) {
        return bookingRepository.getCompletedBookingCountForCurrentMonth(vehicleId);
    }

    // get mapping for get inprocess booking data (url
    // -->/booking/bystatus?customerid=1)
    @RequestMapping(value = "/booking/bystatus", params = {
            "customerId" }, produces = "application/json")
    public List<Booking> getAllBookingDataByStatus(@RequestParam("customerId") Integer customerId) {
        return bookingRepository.getByStatusAndCustomerId(customerId);
    }

    // ----------------for vrhicle ui -----------------------
    @RequestMapping(value = "/booking/byvehicleid", params = {
            "vehicleId" }, produces = "application/json")
    public List<Booking> getAllBookingDataByVehicleId(@RequestParam("vehicleId") Integer vehicleId) {
        return bookingRepository.getByVehicleId(vehicleId);
    }

    // anthimata add karapu eke bookinNo eka witharak gnnawa
    @RequestMapping(value = "/booking/lastBookingNo")
    public String getLastBookinNo() {
        return bookingRepository.getLastBookinNo();
    }

//   // pendingBookings genna gannawa vehicle eka assign karala thiyna bookings tika gnnawa
    @RequestMapping(value = "/booking/activeBookings")
    public List<Booking> getAllActiveBookings() {
        return bookingRepository.getAllActiveBookings();
    }

}