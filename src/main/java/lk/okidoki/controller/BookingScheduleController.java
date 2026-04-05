package lk.okidoki.controller;

import lk.okidoki.modal.Booking;
import lk.okidoki.modal.BookingStatus;
import lk.okidoki.modal.Privilage;
import lk.okidoki.modal.User;
import lk.okidoki.repository.BookingRepository;
import lk.okidoki.repository.BookingStatusRepository;
import lk.okidoki.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
public class BookingScheduleController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    @Autowired
    private BookingStatusRepository bookingStatusRepository;

    @Autowired
    private BookingRepository bookingRepository;

    // get mapping for get booking ui(url --->/bookingshedule)
    @GetMapping(value = "/bookingschedule")
    public ModelAndView loadBookingUi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView bookingScheduleUI = new ModelAndView();
        bookingScheduleUI.setViewName("bookingschedule.html");
        bookingScheduleUI.addObject("logedusername", auth.getName());
        bookingScheduleUI.addObject("loggeduserphoto", logeduser.getUser_photo());
        bookingScheduleUI.addObject("logeduseremail", logeduser.getEmail());
        bookingScheduleUI.addObject("logeduserfullname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
        bookingScheduleUI.addObject("logeduserCallingname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname() : null);
        bookingScheduleUI.addObject("logeduserDesignation",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getDesignation_id().getName() : null);
        bookingScheduleUI.addObject("pageTitle", "Booking");
        return bookingScheduleUI;

    }

    // booking list ekak eka para insert karanwa
    @PostMapping(value = "/booking/insertBookingList")
    public String saveBookingList(@RequestBody List<Booking> bookingList) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Booking Management");

        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_insert()) {

            try {

                for (Booking booking : bookingList) {

                    booking.setAdded_datetime(LocalDateTime.now());
                    booking.setAdded_user_id(logeduser.getId());

                    // status → schedule
                    booking.setBooking_status_id(bookingStatusRepository.getReferenceById(10));

                    bookingRepository.save(booking);
                }

                return "ok";

            } catch (Exception e) {

                return "Save Not Completed : " + e.getMessage();
            }

        } else {

            return "Save Not Successed : You have not access";
        }
    }

    // get mapping for shedule booking lsit (url -->/booking/recentbooking)
    @GetMapping(value = "/booking/schedulebooking")
    public List<Booking> getScheduleBooking() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Booking Management");

        if (userPrivilage.getPrivi_select()) {
            return bookingRepository.getScheduleBooking();
        } else {
            return new ArrayList<>();
        }

    }
}
