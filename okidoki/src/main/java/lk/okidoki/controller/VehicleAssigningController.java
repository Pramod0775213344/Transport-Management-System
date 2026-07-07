package lk.okidoki.controller;

import lk.okidoki.modal.Booking;
import lk.okidoki.modal.Privilage;
import lk.okidoki.modal.User;
import lk.okidoki.repository.BookingRepository;
import lk.okidoki.repository.BookingStatusRepository;
import lk.okidoki.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDateTime;

@RestController
public class VehicleAssigningController {

    @Autowired
    private UserPrivilageController userPrivilageController;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingStatusRepository bookingStatusRepository;

    // get mapping for get booking ui(url --->/booking)
    @GetMapping(value = "/vehicleassigning")
    public ModelAndView loadVehicleAssigningUi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView VehicleAssigningUi = new ModelAndView();
        VehicleAssigningUi.setViewName("vehicleAssigning.html");
        VehicleAssigningUi.addObject("logedusername", auth.getName());
        VehicleAssigningUi.addObject("loggeduserphoto", logeduser.getUser_photo());
        VehicleAssigningUi.addObject("pageTitle", "Vehicle Assigning");
        return VehicleAssigningUi;

    }

    // vehicle assigning save
    @PutMapping(value = "/vehicleassigning/update")
    public String updateVehicleAssigning(@RequestBody Booking booking) {
        // checek authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Vehicle Assigning");
        User logeduser = userRepository.getByUsername(auth.getName());

        // check existing
        if (userPrivilage.getPrivi_update()) {


//            if (booking.getVehicle_id() != null && booking.getVehicle_id().getId() != null) {
//                Integer vehicleId = booking.getVehicle_id().getId(); // Extract the vehicle ID
//                Booking extVehicleNo = bookingRepository.getByVehicleNo(vehicleId);
//                Booking extBooking = bookingRepository.getReferenceById(booking.getId());
//                if (extBooking !=null && extBooking.getBooking_status_id()!= bookingStatusRepository.getReferenceById(6)) {
//                    if (extVehicleNo != null && extVehicleNo.getVehicle_id() != null
//                            && extVehicleNo.getVehicle_id().getId().equals(vehicleId)) {
//                        return " can't assigning the vehicle ; Vehicle already assigned";
//                    }
//                }
//            }

//            if (booking.getDriver_id() != null && booking.getDriver_id().getId() != null) {
//                Integer driverId = booking.getDriver_id().getId(); // Extract the driver ID
//                Booking extDriver = bookingRepository.getDriver(driverId);
//                if (extDriver != null && extDriver.getDriver_id() != null
//                        && extDriver.getDriver_id().getId().equals(driverId)) {
//                    return " can't assigning the Driver ; Driver already assigned";
//                }
//            }

            try {

                // auto updated date and time
                booking.setAssigned_date_time(LocalDateTime.now());
                booking.setAssigned_user_id(logeduser.getId());

                // set user status into inproccess
                booking.setBooking_status_id(bookingStatusRepository.getReferenceById(2));

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

    // vehicele assigning dates update
    @PutMapping(value = "/vehicleassigning/arrivedatpickupdatetime")
    public String updateArrivedAtPickupDateTime(@RequestBody Booking booking) {
        // checek authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Vehicle Assigning");

        // check existing
        if (userPrivilage.getPrivi_update()) {
            try {
                if (booking.getArrived_at_pickup_datetime() != null) {
                    // set user status into inproccess
                    booking.setBooking_status_id(bookingStatusRepository.getReferenceById(3));

                    // save operator
                    bookingRepository.save(booking);
                }

                if (booking.getDeparted_from_pickup_datetime() != null) {
                    // set user status into inproccess
                    booking.setBooking_status_id(bookingStatusRepository.getReferenceById(4));

                    // save operator
                    bookingRepository.save(booking);
                }
                if (booking.getArrived_at_delivery_datetime() != null) {

                    booking.setBooking_status_id(bookingStatusRepository.getReferenceById(5));

                    bookingRepository.save(booking);
                }
                if (booking.getDeparted_from_delivery_datetime() != null) {

                    booking.setBooking_status_id(bookingStatusRepository.getReferenceById(6));

                    bookingRepository.save(booking);
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

}
