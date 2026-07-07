package lk.okidoki.controller;

import lk.okidoki.modal.Booking;
import lk.okidoki.modal.Package;
import lk.okidoki.modal.Privilage;
import lk.okidoki.modal.User;
import lk.okidoki.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;


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
    private CustomerAgreementRepository customerAgreementRepository;

   
    // @Autowired
    // private LocationRepository locationRepository;

    // get mapping for get booking ui(url --->/booking)
    @GetMapping(value = "/booking")
    public ModelAndView loadBookingUi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView bookinUI = new ModelAndView();
        bookinUI.setViewName("booking.html");
        bookinUI.addObject("logedusername", auth.getName());
        bookinUI.addObject("loggeduserphoto", logeduser.getUser_photo());
        bookinUI.addObject("pageTitle", "Booking");
        return bookinUI;

    }

    // get mapping for get all booking data (url -->/booking/alldata)
    @RequestMapping(value = "/booking/alldata")
    public List<Booking> getAllBookingData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Booking");

        if (userPrivilage.getPrivi_select()) {
            return bookingRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        }else {
            return new ArrayList<>();
        }

    }

    // get mapping for booking insert into table(url -->/booking/insert)
    @PostMapping(value = "/booking/insert")
    public String saveBooking(@RequestBody Booking booking) {
        // checek authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Booking");
        User logeduser = userRepository.getByUsername(auth.getName());

        // check existing
        if (userPrivilage.getPrivi_insert()) {
            try {

                // auto updated date and time
                booking.setAdded_datetime(LocalDateTime.now());
                booking.setAdded_user_id(logeduser.getId());


//                booking eka daddi customer agreement eka auto select wenna oni vehic type ekata saha customert adala agreement eka fix rate new nam
//                var agreement = customerAgreementRepository.findByVehicleTypeIdAndCustomerId(
//                        booking.getCustomer_id().getId(),
//                        booking.getVehicle_type_id().getId()
//                );
//
//                if (agreement != null && agreement.getPackage_id() != null) {
//                    String packageType = agreement.getPackage_id().getPackage_type();
//                    System.out.println(packageType);
//                    if ("Floating Rate".equals(packageType)) {
//                        booking.setCustomer_agreement_id(agreement);
//                    } else if ("Fix Rate".equals(packageType)) {
//                        // If there are multiple supplier agreements for Fix Rate, set to null
//                        if (customerAgreementRepository.countByVehicleTypeIdAndCustomerId(
//                                booking.getCustomer_id().getId(),
//                                booking.getVehicle_type_id().getId()) > 1) {
//                            booking.setCustomer_agreement_id(null);
//                            System.out.println("Multiple Fix Rate agreements found. Setting to null.");
//                        } else {
//                            booking.setCustomer_agreement_id(agreement);
//                            System.out.println("one agreement have");
//                        }
//                    }
//                } else {
//                    booking.setCustomer_agreement_id(null);
//                }



                // set user status into inproccess
                booking.setBooking_status_id(bookingStatusRepository.getReferenceById(1));


                // save operator
                bookingRepository.save(booking);

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
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Booking");

        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_update()) {
        // check ext
        if (booking.getId() == null) {
            return "Update Not Success: Booking not found";
        }

        Booking extBookingId = bookingRepository.getReferenceById(booking.getId());
        if (extBookingId == null) {
            return "Update Not Success: Vooking not Exist";
        }
//        save auto added data
        try{
            booking.setUpdated_datetime(LocalDateTime.now());
            booking.setUpdated_user_id(logeduser.getId());

            bookingRepository.save(booking);

            return "ok";
        }catch (Exception e){
            return "Update Not Completed :" + e.getMessage();
        }
        } else {

            return "Save Not Successed : You have not access";
        }
    }

    // get mapping for booking delete into table(url -->/booking/delete)
    @DeleteMapping(value = "/booking/delete")
    public String deleteBooking(@RequestBody Booking booking) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Booking");
        User logeduser = userRepository.getByUsername(auth.getName());

//        check existing
        if (userPrivilage.getPrivi_delete()) {
            if (booking.getId() == null) {
                return "Delete Not Completed :" + booking.getBooking_no();
            }
            Booking extBookingId = bookingRepository.getReferenceById(booking.getId());
            if (extBookingId == null) {
                return "Update Not Success: Vooking not Exist";
            }

            try {
//            set auto added data
                booking.setDeleted_datetime(LocalDateTime.now());
                booking.setDeletd_user_id(logeduser.getId());
                booking.setBooking_status_id(bookingStatusRepository.getReferenceById(7));

//            save operator
                bookingRepository.save(booking);

//            return msg
                return "ok";
            }catch (Exception e){
                return "Delete Not Completed :" + e.getMessage();
            }
        }  else {

        return "Save Not Successed : You have not access";
    }

    }

    // get mapping for get inprocess booking data (url -->/booking/bystatus)
    @RequestMapping(value = "/booking/bystatus")
    public List<Booking> getAllBookingDataByStatus() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Booking");

        if (userPrivilage.getPrivi_select()) {
            return bookingRepository.getByStatus();
        }else {
            return new ArrayList<>();
        }

    }

    // get mapping for get inprocess booking data (url -->/booking/bystatus)
    @RequestMapping(value = "/booking/bystatusdepartedfromdeliverystatus")
    public List<Booking> getAllBookingDataByDepartedFromDeliveryStatus() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Booking");

            return bookingRepository.getByDepartedFromDeliveryStatus();


    }


    // Get mapping for get all booking data by given customer id (url
    // -->/booking/bycustomerid?customerid=1&packagesType=2&vehicleTypeid=3)
    @GetMapping(value = "/booking/bycustomerid", params = { "customerid" ,"packagesType","vehicleTypeid"}, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Booking> getPackageByVehicleType(@RequestParam("customerid") Integer customerid, @RequestParam("packagesType") String packagesType,@RequestParam("vehicleTypeid") Integer vehicleTypeid) {
        return bookingRepository.getBookingByCustomer(customerid,packagesType,vehicleTypeid);
    }

    // get mapping for get recent 5 booking data (url -->/booking/recentbooking)
    @GetMapping(value = "/booking/recentbooking")
    public List<Booking> getRecentFiveBookings() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Booking");

        if (userPrivilage.getPrivi_select()) {
            return bookingRepository.getRecentFiveBookings();
        }else {
            return new ArrayList<>();
        }

    }


    // Get mapping for get all booking data by given vehicle id (url
    // -->/booking/byvehicleid?vehicleid=1)
    @GetMapping(value = "/booking/byvehicleid", params = { "vehicleid" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Booking> getBookingByGivenVehicleNo(@RequestParam("vehicleid") Integer vehicleid) {
        return bookingRepository.getBookingByGivenVehicleNo(vehicleid);
    }


    // Get mapping for get all booking data by given customer id and given date range(url
    // -->/booking/bydaterangeandcustomerid?startdate=1&enddate=2&customerid=3)
    @GetMapping(value = "/booking/bydaterangeandcustomerid", params = {"startdate","enddate", "customerid" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Booking> getBookingByDateRangeAndCustomer( @RequestParam("startdate") String startdate, @RequestParam("enddate") String enddate, @RequestParam("customerid") Integer customerid) {
        return bookingRepository.getBookingByDateRangeAndCustomer(startdate, enddate, customerid);
    }

//--------------------inproccess data search Mappings--------------------------------------------------
// -->/booking/inproccessbookingbycustomerid?&customerid=3)
@GetMapping(value = "/booking/inproccessbookingbycustomerid", params = {"customerid" }, produces = "application/json")
// param method eka haraha thama data ganne
public List<Booking> getInproccessBookingByCustomer(@RequestParam("customerid") Integer customerid) {
    return bookingRepository.getInproccessBookingByCustomer(customerid);
}

    // -->/booking/inproccessbookingbyvehicletypeid?vehicletypeid=3)
    @GetMapping(value = "/booking/inproccessbookingbyvehicletypeid", params = {"vehicletypeid" }, produces = "application/json")
// param method eka haraha thama data ganne
    public List<Booking> getInproccessBookingByVehicleType(@RequestParam("vehicletypeid") Integer vehicletypeid) {
        return bookingRepository.getInproccessBookingByVehicleType(vehicletypeid);
    }

    // -->/booking/inproccessbookingbycustomeridandvehicletypeid?customerid=3&vehicletypeid=3)
    @GetMapping(value = "/booking/inproccessbookingbycustomeridandvehicletypeid", params = {"customerid","vehicletypeid" }, produces = "application/json")
// param method eka haraha thama data ganne
    public List<Booking> getInproccessBookingByCustomerAndVehicleType(@RequestParam("customerid") Integer customerid,@RequestParam("vehicletypeid") Integer vehicletypeid) {
        return bookingRepository.getInproccessBookingByCustomerAndVehicleType(customerid,vehicletypeid);
    }
    //--------------------inproccess data search Mappings end--------------------------------------------------
}
