package lk.okidoki.controller;

import jakarta.transaction.Transactional;
import lk.okidoki.modal.Booking;
import lk.okidoki.modal.FuelRequest;
import lk.okidoki.modal.Notification;
import lk.okidoki.modal.NotificationReadStatus;
import lk.okidoki.modal.Privilage;
import lk.okidoki.modal.User;
import lk.okidoki.modal.Vehicle;
import lk.okidoki.modal.VehicleGroupHasVehicles;
import lk.okidoki.repository.BookingRepository;
import lk.okidoki.repository.BookingStatusRepository;
import lk.okidoki.repository.FuelRequestRepository;
import lk.okidoki.repository.FuelRequestStatusRepository;
import lk.okidoki.repository.NotificationReadStatusRepository;
import lk.okidoki.repository.NotificationRepository;
import lk.okidoki.repository.UserRepository;
import lk.okidoki.repository.VehicleGroupHasVehicleRepository;
import lk.okidoki.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController

public class VehicleAssigningController {

    @Autowired
    private UserPrivilageController userPrivilageController;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private FuelRequestRepository fuelRequestRepository;

    @Autowired
    private FuelRequestStatusRepository fuelRequestStatusRepository;

    @Autowired
    private BookingStatusRepository bookingStatusRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationReadStatusRepository notificationReadStatusRepository;

    @Autowired
    private VehicleGroupHasVehicleRepository vehicleGroupHasVehicleRepository;

    // get mapping for get booking ui(url --->/booking)
    @GetMapping(value = "/vehicleassigning")
    public ModelAndView loadVehicleAssigningUi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Vehicle Assigning");
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView VehicleAssigningUi = new ModelAndView();
        VehicleAssigningUi.setViewName("vehicleAssigning.html");
        VehicleAssigningUi.addObject("logedusername", auth.getName());
        VehicleAssigningUi.addObject("logeduseremail", logeduser.getEmail());
        VehicleAssigningUi.addObject("loggeduserphoto", logeduser.getUser_photo());
        VehicleAssigningUi.addObject("logeduserfullname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
        VehicleAssigningUi.addObject("logeduserCallingname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname() : null);
        VehicleAssigningUi.addObject("logeduserDesignation",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getDesignation_id().getName() : null);
        VehicleAssigningUi.addObject("userPrivilage", userPrivilage);
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

            // me vehicle eka breakdown widihata mark karala thiyenawa nam picup time eka
            // considerd kranne na
            if (booking.getPickup_date_time() != null
                    && booking.getPickup_date_time().isBefore(LocalDateTime.now())
                    && !Boolean.TRUE.equals(booking.getIs_breakdown())) {
                return "Cannot assign vehicle. Pickup date time has already passed.";
            }

            try {

                // auto updated date and time
                booking.setAssigned_date_time(LocalDateTime.now());
                booking.setAssigned_user_id(logeduser.getId());

                // set user status into inproccess
                booking.setBooking_status_id(bookingStatusRepository.getReferenceById(2));

                // save operator
                bookingRepository.save(booking);

                // me assign karana vehicle eka me customerge vehicle group eke temporary
                // vehicle ekak nam assign kalata passe tempory eka flase karanwa
                Optional<VehicleGroupHasVehicles> vehicleGroupHasVehicleOpt = vehicleGroupHasVehicleRepository
                        .findVehicleGroupAndTemporaryStatus(booking.getVehicle_id().getId(),
                                booking.getCustomer_id().getId());
                if (vehicleGroupHasVehicleOpt.isPresent()) {
                    VehicleGroupHasVehicles vehicleGroupHasVehicle = vehicleGroupHasVehicleOpt.get();

                    if (Boolean.TRUE.equals(vehicleGroupHasVehicle.getIs_temporary())) {
                        // dæn tiyena (temporary) group ekama, home group ekat widihata set karanawa
                        // meken meka permanent widihata "lock" wenawa
                        vehicleGroupHasVehicle.setVehicle_group_id(vehicleGroupHasVehicle.getHome_group_id());
                        vehicleGroupHasVehicle.setIs_temporary(false);
                        vehicleGroupHasVehicleRepository.save(vehicleGroupHasVehicle);
                    }
                }

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
                    // notification okkoma users lata send karanwa
                    try {
                        Notification notification = new Notification();
                        notification.setTitle("Booking Arrived at Pickup");
                        notification
                                .setMessage("Booking #" + booking.getBooking_no() + " has arrived at pickup location");
                        notification.setReferenceType("BOOKING");
                        notification.setReferenceId(booking.getId());
                        notification.setAddedDatetime(
                                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

                        Notification savedNotification = notificationRepository.save(notification);

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

                }

                if (booking.getDeparted_from_pickup_datetime() != null) {
                    // set user status into inproccess
                    booking.setBooking_status_id(bookingStatusRepository.getReferenceById(4));

                    // save operator
                    bookingRepository.save(booking);
                    // notification okkoma users lata send karanwa
                    try {
                        Notification notification = new Notification();
                        notification.setTitle("Booking Departed from Pickup");
                        notification.setMessage(
                                "Booking #" + booking.getBooking_no() + " has departed from pickup location");
                        notification.setReferenceType("BOOKING");
                        notification.setReferenceId(booking.getId());
                        notification.setAddedDatetime(
                                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

                        Notification savedNotification = notificationRepository.save(notification);

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
                }
                if (booking.getArrived_at_delivery_datetime() != null) {

                    booking.setBooking_status_id(bookingStatusRepository.getReferenceById(5));

                    bookingRepository.save(booking);
                    // notification okkoma users lata send karanwa
                    try {
                        Notification notification = new Notification();
                        notification.setTitle("Booking Arrived at Delivery");
                        notification.setMessage(
                                "Booking #" + booking.getBooking_no() + " has arrived at delivery location");
                        notification.setReferenceType("BOOKING");
                        notification.setReferenceId(booking.getId());
                        notification.setAddedDatetime(
                                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

                        Notification savedNotification = notificationRepository.save(notification);

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

                    // notification okkoma users lata send karanwa
                    try {
                        Notification notification = new Notification();
                        notification.setTitle("Booking Completed");
                        notification
                                .setMessage("Booking #" + booking.getBooking_no() + " has been completed successfully");
                        notification.setReferenceType("BOOKING");
                        notification.setReferenceId(booking.getId());
                        notification.setAddedDatetime(
                                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

                        Notification savedNotification = notificationRepository.save(notification);

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

                    // me booking eka adalawa fuel request thiyenaw nam pending ewa auto reject
                    // wenna oni.bookin eka complete karaddi.
                    FuelRequest pendinFuelRequest = fuelRequestRepository.getFuelRequestById(booking.getId());
                    if (pendinFuelRequest != null) {
                        pendinFuelRequest.setFuel_request_status_id(fuelRequestStatusRepository.getReferenceById(7));

                        fuelRequestRepository.save(pendinFuelRequest);
                    }

                }

                // return ok
                return "ok";
            } catch (Exception e) {
                return "Save Not Completed :" + e.getMessage();
            }
        } else

        {

            return "Save Not Successed : You have not access";
        }
    }

    // agreement id ekata adala currunt month bookings walal thiyena vehicle tika
    // gnnawa
    @GetMapping(value = "/vehicleassigning/getvehiclesbyagreementid", params = {
            "agreementId" }, produces = "application/json")
    public List<Integer> getVehiclesByAgreementId(@RequestParam(value = "agreementId") Integer agreementId) {
        return vehicleRepository.getVehiclesByAgreementId(agreementId);
    }

    // currunt month fix rate wena agreement eka nathi nam all available vehicle
    // list eka gnnawa
    @GetMapping(value = "/vehicleassigning/getavailablevehiclesbyagreementid", produces = "application/json")
    public List<Integer> getAllAvailableVehicles() {
        return vehicleRepository.getAllAvailableVehicles();
    }

    // get package type by vehicle id
    @GetMapping(value = "/vehicleassigning/getpackagetypebyvehicleid", params = {
            "vehicleId" }, produces = "application/json")
    public String[] getPackageTypeByVehicleId(@RequestParam(value = "vehicleId") Integer vehicleId) {
        return vehicleRepository.getPackageTypeByVehicleId(vehicleId);
    }

}
