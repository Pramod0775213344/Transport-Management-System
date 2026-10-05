package lk.okidoki.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import lk.okidoki.modal.Booking;
import lk.okidoki.modal.BookingBreakdown;
import lk.okidoki.modal.Driver;
import lk.okidoki.modal.NotificationReadStatus;
import lk.okidoki.modal.Privilage;
import lk.okidoki.modal.User;
import lk.okidoki.modal.Vehicle;
import lk.okidoki.repository.BookingBreakdownRepository;
import lk.okidoki.repository.BookingRepository;
import lk.okidoki.repository.BookingStatusRepository;
import lk.okidoki.repository.DriverRepository;
import lk.okidoki.repository.UserRepository;
import lk.okidoki.repository.VehicleRepository;
import lk.okidoki.repository.VehicleStatusRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
public class BookingBreakdownController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingBreakdownRepository bookingBreakdownRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private VehicleStatusRepository vehicleStatusRepository;

    @Autowired
    private BookingStatusRepository bookingStatusRepository;

    // get mapping for get booking ui(url --->/booking)
    @GetMapping(value = "/bookingbreakdown")
    public ModelAndView loadBookingUi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Booking Breakdown Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView bookinBreakdownUI = new ModelAndView();
        bookinBreakdownUI.setViewName("bookingBreakdown.html");
        bookinBreakdownUI.addObject("logedusername", auth.getName());
        bookinBreakdownUI.addObject("loggeduserphoto", logeduser.getUser_photo());
        bookinBreakdownUI.addObject("logeduseremail", logeduser.getEmail());
        bookinBreakdownUI.addObject("logeduserfullname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
        bookinBreakdownUI.addObject("logeduserCallingname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname() : null);
        bookinBreakdownUI.addObject("logeduserDesignation",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getDesignation_id().getName() : null);
        bookinBreakdownUI.addObject("userPrivilage", userPrivilage);
        bookinBreakdownUI.addObject("pageTitle", "Booking Breakdown");
        return bookinBreakdownUI;
    }

    // booking eka breakdown eka true karala update karanawa
    // e wagema breakdown history eka update karanawa
    @PutMapping(value = "/bookingbreakdown/markAsBreakdown")
    public String updateBookingBreakdown(@RequestBody Integer bookingId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Booking Breakdown Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_insert()) {
            try {
                Booking booking = bookingRepository.getBookingById(bookingId);

                // booking eka null nam error message ekak return karanawa
                if (booking == null) {
                    return "Booking Not Found";
                }

                // new BookingBreakdown object ekak hadala save karanawa
                BookingBreakdown bookingBreakdown = new BookingBreakdown();
                // set the old values from the booking to the breakdown object
                bookingBreakdown.setOld_vehicle_id(booking.getVehicle_id().getId());
                bookingBreakdown.setOld_driver_id(booking.getDriver_id().getId());
                bookingBreakdown.setOld_arrived_at_pickup_datetime(booking.getArrived_at_pickup_datetime());
                bookingBreakdown.setOld_departed_from_pickup_datetime(booking.getDeparted_from_pickup_datetime());
                bookingBreakdown.setOld_arrived_at_delivery_datetime(booking.getArrived_at_delivery_datetime());
                bookingBreakdown.setOld_departed_from_delivery_datetime(booking.getDeparted_from_delivery_datetime());
                bookingBreakdown.setAdded_user_id(logeduser.getId());
                bookingBreakdown.setAdded_datetime(LocalDateTime.now());
                bookingBreakdown.setBooking_id(booking);
                bookingBreakdownRepository.save(bookingBreakdown);

                // vehicle eka update karanawa
                Vehicle vehicle = vehicleRepository.getVehicleById(booking.getVehicle_id().getId());
                vehicle.setVehicle_status_id(vehicleStatusRepository.getReferenceById(2)); // set vehicle status to
                                                                                           // inactive

                vehicle.setIs_breakdown(true);
                vehicleRepository.save(vehicle);

                // booking eke details tika update karanawa
                booking.setIs_breakdown(true);
                booking.setArrived_at_pickup_datetime(null);
                booking.setDeparted_from_pickup_datetime(null);
                booking.setArrived_at_delivery_datetime(null);
                booking.setDeparted_from_delivery_datetime(null);
                booking.setVehicle_id(null);
                booking.setDriver_id(null);
                booking.setBooking_status_id(bookingStatusRepository.getReferenceById(1)); // set booking status to
                                                                                           // inprocess
                bookingRepository.save(booking);

                return "ok";

            } catch (Exception e) {
                return "Save Not Completed :" + e.getMessage();
            }
        } else {
            return "Save Not Successed : You have not access";
        }
    }

    // booking eka breakdown eka false karala update karanawa
    @PutMapping(value = "/bookingbreakdown/unmarkAsBreakdown")
    public String unmarkBookingAsBreakdown(@RequestBody Integer bookingId) {

        Booking booking = bookingRepository.getBookingById(bookingId);
        booking.setIs_breakdown(false);
        bookingRepository.save(booking);
        return "ok";

    }

}
