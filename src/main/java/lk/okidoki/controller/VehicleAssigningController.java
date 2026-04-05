package lk.okidoki.controller;

import jakarta.transaction.Transactional;
import lk.okidoki.modal.Booking;
import lk.okidoki.modal.Privilage;
import lk.okidoki.modal.User;
import lk.okidoki.modal.Vehicle;
import lk.okidoki.repository.BookingRepository;
import lk.okidoki.repository.BookingStatusRepository;
import lk.okidoki.repository.UserRepository;
import lk.okidoki.repository.VehicleRepository;
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

    @Autowired
    private VehicleRepository vehicleRepository;

    // get mapping for get booking ui(url --->/booking)
    @GetMapping(value = "/vehicleassigning")
    public ModelAndView loadVehicleAssigningUi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView VehicleAssigningUi = new ModelAndView();
        VehicleAssigningUi.setViewName("vehicleAssigning.html");
        VehicleAssigningUi.addObject("logedusername", auth.getName());
        VehicleAssigningUi.addObject("loggeduserphoto", logeduser.getUser_photo());
        VehicleAssigningUi.addObject("logeduserfullname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
        VehicleAssigningUi.addObject("logeduserCallingname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname() : null);
        VehicleAssigningUi.addObject("logeduserDesignation",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getDesignation_id().getName() : null);
        VehicleAssigningUi.addObject("pageTitle", "Vehicle Assigning");
        return VehicleAssigningUi;

    }

    // vehicle assigning save
    @Transactional
    @PutMapping(value = "/vehicleassigning/update")
    public String updateVehicleAssigning(@RequestBody Booking booking) {
        // checek authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Vehicle Assigning");
        User logeduser = userRepository.getByUsername(auth.getName());

        // check existing
        if (userPrivilage.getPrivi_update()) {
            // check existing
            if (booking.getId() == null) {
                return "Booking not found" + booking.getBooking_no();
            }
            Booking extBookingId = bookingRepository.getReferenceById(booking.getId());
            if (extBookingId == null) {
                return "Booking not Exist";
            }

            // Vehicle Validation
            if (booking.getVehicle_id() != null && booking.getVehicle_id().getId() != null) {
                Integer vehicleId = booking.getVehicle_id().getId();
                // currunt booking ekata amathawarawa wenath active bookings thiyeawada balanwa
                // me vehicle eka thiyena
                Booking activeBookingWithVehicle = bookingRepository
                        .getActiveBookingByVehicleExcludingCurrent(vehicleId, booking.getId());

                if (activeBookingWithVehicle != null) {
                    return "Can't assign the vehicle; Vehicle already assigned to Booking: "
                            + activeBookingWithVehicle.getBooking_no();
                }
            }

            // Driver Validation
            if (booking.getDriver_id() != null && booking.getDriver_id().getId() != null) {
                Integer driverId = booking.getDriver_id().getId();
                // currunt booking ekata amathawarawa wenath active bookings thiyeawada balanwa
                // me driver inna
                Booking activeBookingWithDriver = bookingRepository.getActiveBookingByDriverExcludingCurrent(driverId,
                        booking.getId());

                if (activeBookingWithDriver != null) {
                    return "Can't assign the Driver; Driver already assigned to Booking: "
                            + activeBookingWithDriver.getBooking_no();
                }
            }

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

            return "Save Not Successes : You have not access";
        }

    }

    // vehicele assigning dates update
    @PutMapping(value = "/vehicleassigning/arrivedatpickupdatetime")
    public String updateArrivedAtPickupDateTime(@RequestBody Booking booking) {
        // checek authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Vehicle Assigning");

        if (userPrivilage.getPrivi_update()) {
            // check existing
            if (booking.getId() == null) {
                return "Booking not found" + booking.getBooking_no();
            }
            Booking extBookingId = bookingRepository.findById(booking.getId()).orElse(null);
            if (extBookingId == null) {
                return "Booking not Exist";
            }
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

                    // booking eka complete wunata passe thama currunt meter reding eka update wenne
                    if (booking.getVehicle_id() != null && booking.getEnd_meter_reading() != null
                            && !booking.getEnd_meter_reading().isEmpty()) {
                        Vehicle extVehicle = vehicleRepository.getReferenceById(booking.getVehicle_id().getId());
                        extVehicle.setCurrent_meter_reading(booking.getEnd_meter_reading());
                        vehicleRepository.save(extVehicle);
                    }

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
