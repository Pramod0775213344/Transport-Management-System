package lk.okidoki.controller;

import lk.okidoki.modal.Profile;
import lk.okidoki.modal.User;
import lk.okidoki.repository.ProfileRepository;
import lk.okidoki.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@RestController
public class CustomerPortalController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @RequestMapping(value = "/customerportal")
    public ModelAndView loadCustomerDashboardUI() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());
        ModelAndView customerDashboardUI = new ModelAndView();
        customerDashboardUI.setViewName("customerPortal/customerDashboard.html");

        if (logeduser != null) {
            // find the profile details of the logged user and send to the UI
            Profile logedUserProfile = profileRepository.getByUserId(logeduser.getId());
            customerDashboardUI.addObject("logedUserProfile", logedUserProfile);

            if (logeduser.getCustomer_id() != null) {
                customerDashboardUI.addObject("logedusername", auth.getName());
                customerDashboardUI.addObject("loggeduserphoto", logeduser.getUser_photo());
                customerDashboardUI.addObject("logeduseremail", logeduser.getEmail());
                customerDashboardUI.addObject("logeduserfullname",
                        logedUserProfile.getFullname());
                customerDashboardUI.addObject("logeduserCallingname",
                        logedUserProfile.getCallingname());
                customerDashboardUI.addObject("logeduserDesignation",
                        logedUserProfile.getDesignation());
                customerDashboardUI.addObject("pageTitle", "Cusromer Dashboard");
            }
        }

        return customerDashboardUI;
    }

    @RequestMapping(value = "/customerportal/bookings")
    public ModelAndView loadCustomerBookingsUI() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());
        ModelAndView bookingsUI = new ModelAndView();
        bookingsUI.setViewName("customerPortal/customerBookings.html");

        if (logeduser != null && logeduser.getCustomer_id() != null) {
             // find the profile details of the logged user and send to the UI
            Profile logedUserProfile = profileRepository.getByUserId(logeduser.getId());
            bookingsUI.addObject("logedUserProfile", logedUserProfile);

            if (logeduser.getCustomer_id() != null) {
                bookingsUI.addObject("logedusername", auth.getName());
                bookingsUI.addObject("loggeduserphoto", logeduser.getUser_photo());
                bookingsUI.addObject("logeduseremail", logeduser.getEmail());
                bookingsUI.addObject("logeduserfullname",
                        logedUserProfile.getFullname());
                bookingsUI.addObject("logeduserCallingname",
                        logedUserProfile.getCallingname());
                bookingsUI.addObject("logeduserDesignation",
                        logedUserProfile.getDesignation());
                bookingsUI.addObject("pageTitle", "Customer Bookings");
                // expose logged customer's id and name for customer-portal JS
                if (logeduser.getCustomer_id() != null) {
                    bookingsUI.addObject("loggedCustomerId", logeduser.getCustomer_id().getId());
                    bookingsUI.addObject("loggedCustomerName", logeduser.getCustomer_id().getCompany_name());
                }
            }
        }
        return bookingsUI;
    }

    @RequestMapping(value = "/customerportal/reports")
    public ModelAndView loadCustomerReportsUI() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());
        ModelAndView reportsUI = new ModelAndView();
        reportsUI.setViewName("customerPortal/customerReports.html");

        if (logeduser != null && logeduser.getCustomer_id() != null) {
             // find the profile details of the logged user and send to the UI
            Profile logedUserProfile = profileRepository.getByUserId(logeduser.getId());
            reportsUI.addObject("logedUserProfile", logedUserProfile);

            if (logeduser.getCustomer_id() != null) {
                reportsUI.addObject("logedusername", auth.getName());
                reportsUI.addObject("loggeduserphoto", logeduser.getUser_photo());
                reportsUI.addObject("logeduseremail", logeduser.getEmail());
                reportsUI.addObject("logeduserfullname",
                        logedUserProfile.getFullname());
                reportsUI.addObject("logeduserCallingname",
                        logedUserProfile.getCallingname());
                reportsUI.addObject("logeduserDesignation",
                        logedUserProfile.getDesignation());
                reportsUI.addObject("pageTitle", "Customer Reports");
            }
        }
        return reportsUI;
    }

    @RequestMapping(value = "/customerportal/agreements")
    public ModelAndView loadCustomerAgreementsUI() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());
        ModelAndView agreementsUI = new ModelAndView();
        agreementsUI.setViewName("customerPortal/customerAgreements.html");

        if (logeduser != null && logeduser.getCustomer_id() != null) {
             // find the profile details of the logged user and send to the UI
            Profile logedUserProfile = profileRepository.getByUserId(logeduser.getId());
            agreementsUI.addObject("logedUserProfile", logedUserProfile);

            if (logeduser.getCustomer_id() != null) {
                agreementsUI.addObject("logedusername", auth.getName());
                agreementsUI.addObject("loggeduserphoto", logeduser.getUser_photo());
                agreementsUI.addObject("logeduseremail", logeduser.getEmail());
                agreementsUI.addObject("logeduserfullname",
                        logedUserProfile.getFullname());
                agreementsUI.addObject("logeduserCallingname",
                        logedUserProfile.getCallingname());
                agreementsUI.addObject("logeduserDesignation",
                        logedUserProfile.getDesignation());
                agreementsUI.addObject("pageTitle", "Customer Agreements");
            }
        }
        return agreementsUI;
    }

    @RequestMapping(value = "/customerportal/invoices")
    public ModelAndView loadCustomerInvoicesUI() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());
        ModelAndView invoicesUI = new ModelAndView();
        invoicesUI.setViewName("customerPortal/customerInvoices.html");

        if (logeduser != null && logeduser.getCustomer_id() != null) {
        }
         // find the profile details of the logged user and send to the UI
            Profile logedUserProfile = profileRepository.getByUserId(logeduser.getId());
            invoicesUI.addObject("logedUserProfile", logedUserProfile);

            if (logeduser.getCustomer_id() != null) {
                invoicesUI.addObject("logedusername", auth.getName());
                invoicesUI.addObject("loggeduserphoto", logeduser.getUser_photo());
                invoicesUI.addObject("logeduseremail", logeduser.getEmail());
                invoicesUI.addObject("logeduserfullname",
                        logedUserProfile.getFullname());
                invoicesUI.addObject("logeduserCallingname",
                        logedUserProfile.getCallingname());
                invoicesUI.addObject("logeduserDesignation",
                        logedUserProfile.getDesignation());
                invoicesUI.addObject("pageTitle", "Customer Invoices");
            }
        return invoicesUI;
    }

    @RequestMapping(value = "/customerportal/settings")
    public ModelAndView loadCustomerSettingsUI() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());
        ModelAndView settingsUI = new ModelAndView();
        settingsUI.setViewName("customerPortal/customerSettings.html");

        if (logeduser != null && logeduser.getCustomer_id() != null) {
             // find the profile details of the logged user and send to the UI
            Profile logedUserProfile = profileRepository.getByUserId(logeduser.getId());
            settingsUI.addObject("logedUserProfile", logedUserProfile);

            if (logeduser.getCustomer_id() != null) {
                settingsUI.addObject("logedusername", auth.getName());
                settingsUI.addObject("loggeduserphoto", logeduser.getUser_photo());
                settingsUI.addObject("logeduseremail", logeduser.getEmail());
                settingsUI.addObject("logeduserfullname",
                        logedUserProfile.getFullname());
                settingsUI.addObject("logeduserCallingname",
                        logedUserProfile.getCallingname());
                settingsUI.addObject("logeduserDesignation",
                        logedUserProfile.getDesignation());
                settingsUI.addObject("pageTitle", "Customer Settings");
            }
        }
        return settingsUI;
    }
}
