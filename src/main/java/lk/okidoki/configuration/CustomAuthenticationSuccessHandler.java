package lk.okidoki.configuration;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lk.okidoki.controller.SupplierAgreementStatusController;
import lk.okidoki.modal.Booking;
import lk.okidoki.modal.CustomerAgreement;
import lk.okidoki.modal.Profile;
import lk.okidoki.modal.SupplierAgreement;
import lk.okidoki.modal.User;
import lk.okidoki.modal.Vehicle;
import lk.okidoki.repository.BookingRepository;
import lk.okidoki.repository.BookingStatusRepository;
import lk.okidoki.repository.CustomerAgreementRepository;
import lk.okidoki.repository.CustomerAgreementStatusRepository;
import lk.okidoki.repository.ProfileRepository;
import lk.okidoki.repository.SupplierAgreementRepository;
import lk.okidoki.repository.SupplierAgreementStatusRepository;
import lk.okidoki.repository.UserRepository;
import lk.okidoki.repository.VehicleRepository;
import lk.okidoki.repository.VehicleStatusRepository;

@Component // webconfiguration ekata autowired karann nam meka thiyenna oni
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private BookingStatusRepository bookingStatusRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private VehicleStatusRepository vehicleStatusRepository;

    @Autowired
    private CustomerAgreementRepository customerAgreementRepository;

    @Autowired
    private CustomerAgreementStatusRepository customerAgreementStatusRepository;

    @Autowired
    private SupplierAgreementRepository supplierAgreementRepository;

    @Autowired
    private SupplierAgreementStatusRepository supplierAgreementStatusRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        // 1. Scheduled Bookings Update Logic
        // Status ID 10 = Scheduled -> maru karanwa Status ID 2 = In-Process
        List<Booking> scheduledBookings = bookingRepository.getScheduleBooking();
        LocalDateTime now = LocalDateTime.now();

        for (Booking booking : scheduledBookings) {
            // Pickup date eka ada hari kalin ewa hari nam
            if (booking.getPickup_date_time().isBefore(now)
                    || booking.getPickup_date_time().toLocalDate().isEqual(now.toLocalDate())) {
                booking.setBooking_status_id(bookingStatusRepository.getReferenceById(1)); // Set to In-Process
                bookingRepository.save(booking);
                System.out.println("Booking " + booking.getBooking_no() + " automatically moved to In-Process");
            }
        }

        // 2.vehicel wala insurance saha revenu expire wenna hadanna oni

        // 3.Customer agreement expire wechcha ewa expired kiyala status eka maru
        // karanna oni
        List<CustomerAgreement> expirCustomerAgreements = customerAgreementRepository.getExpireCustomerAgreemntList();

        for (CustomerAgreement customerAgreement : expirCustomerAgreements) {
            customerAgreement.setCustomer_agreement_status_id(customerAgreementStatusRepository.getReferenceById(3));
            customerAgreementRepository.save(customerAgreement);
        }

        // 4.Customer agreement expire wechcha ewa expired kiyala status eka maru
        // karanna oni
        List<SupplierAgreement> expiredSupplierAgreements = supplierAgreementRepository.getExpireSupplierAgreemntList();

        for (SupplierAgreement supplierAgreement : expiredSupplierAgreements) {
            supplierAgreement.setSupplier_agreement_status_id(supplierAgreementStatusRepository.getReferenceById(3));
            supplierAgreementRepository.save(supplierAgreement);
        }

        // 5. Redirect users based on their roles
        // customer kenek hari user kenek log weddi eyata profile ekak nathanna ekak
        // hadal thama dashboard ekata redirect karanna oni.

        Set<String> roles = AuthorityUtils.authorityListToSet(authentication.getAuthorities());
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());
        Profile logedUserProfile = profileRepository.getByUserId(logeduser.getId());

        if (roles.contains("Driver")) {
            response.sendRedirect("/driverportal");

        } else if (roles.contains("Customer")) {
            if (logedUserProfile == null || logedUserProfile.getId() == null) {
                response.sendRedirect("/profile/create");
            } else {
                response.sendRedirect("/customerportal");
            }

        } else if (roles.contains("Admin")) {
            response.sendRedirect("/dashboard");

        } else {
            // logeduser profile eka nathnam profile create karanna redirect karanna oni,
            // nathnam dashboard ekata redirect karanna oni
            response.sendRedirect("/dashboard");
        }
    }
}
