package lk.okidoki.controller;

import lk.okidoki.modal.User;
import lk.okidoki.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class ReportUiController {

        @Autowired
        private UserRepository userRepository;

        @Autowired // auto generate instance
        private UserPrivilageController userPrivilageController;

        @GetMapping(value = "/report")
        public ModelAndView loadReportUi() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                User logeduser = userRepository.getByUsername(auth.getName());

                ModelAndView reportUI = new ModelAndView();
                reportUI.setViewName("report.html");
                reportUI.addObject("logedusername", auth.getName());
                reportUI.addObject("loggeduserphoto", logeduser.getUser_photo());
                reportUI.addObject("logeduseremail", logeduser.getEmail());
                reportUI.addObject("logeduserfullname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
                reportUI.addObject("logeduserCallingname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname()
                                                : null);
                reportUI.addObject("logeduserDesignation",
                                logeduser.getEmployee_id() != null
                                                ? logeduser.getEmployee_id().getDesignation_id().getName()
                                                : null);
                reportUI.addObject("pageTitle", "Report Center");
                return reportUI;

        }

        // load revenue ui
        @GetMapping(value = "/revenue")
        public ModelAndView loadRevenueUi() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                User logeduser = userRepository.getByUsername(auth.getName());

                ModelAndView revenueUi = new ModelAndView();
                revenueUi.setViewName("revenue.html");
                revenueUi.addObject("logedusername", auth.getName());
                revenueUi.addObject("loggeduserphoto", logeduser.getUser_photo());
                revenueUi.addObject("logeduseremail", logeduser.getEmail());
                revenueUi.addObject("logeduserfullname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
                revenueUi.addObject("logeduserCallingname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname()
                                                : null);
                revenueUi.addObject("logeduserDesignation",
                                logeduser.getEmployee_id() != null
                                                ? logeduser.getEmployee_id().getDesignation_id().getName()
                                                : null);
                revenueUi.addObject("pageTitle", "Revenue Report");
                return revenueUi;
    }

    @GetMapping(value = "/supplierpaymentreport")
    public ModelAndView supplierPaymentReport() {
        ModelAndView modelAndView = new ModelAndView();

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.getByUsername(auth.getName()); // Changed from userService to userRepository for consistency
        modelAndView.addObject("loggedUserName", user.getEmployee_id() != null ? user.getEmployee_id().getCallingname() : null); // Added null check
        // Assuming User object has getRoles() and Role object has getName()
        modelAndView.addObject("loggedUserRol", user.getRoles() != null && !user.getRoles().isEmpty() ? user.getRoles().iterator().next().getName() : null); // Added null/empty checks
        modelAndView.addObject("title", "Supplier Payment Report");

        modelAndView.setViewName("reportSupplierPayment.html");
        return modelAndView;
    }

        @GetMapping(value = "/bookingreport")
        public ModelAndView loadBookingReportUi() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                User logeduser = userRepository.getByUsername(auth.getName());

                ModelAndView bookingReportUi = new ModelAndView();
                bookingReportUi.setViewName("bookingReport.html");
                bookingReportUi.addObject("logedusername", auth.getName());
                bookingReportUi.addObject("loggeduserphoto", logeduser.getUser_photo());
                bookingReportUi.addObject("logeduseremail", logeduser.getEmail());
                bookingReportUi.addObject("logeduserfullname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
                bookingReportUi.addObject("logeduserCallingname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname()
                                                : null);
                bookingReportUi.addObject("logeduserDesignation",
                                logeduser.getEmployee_id() != null
                                                ? logeduser.getEmployee_id().getDesignation_id().getName()
                                                : null);
                bookingReportUi.addObject("pageTitle", "Booking Report");
                return bookingReportUi;

        }

        @GetMapping(value = "/reportpendingbookings")
        public ModelAndView loadPendingBookingReportUi() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                User logeduser = userRepository.getByUsername(auth.getName());

                ModelAndView bookingReportUi = new ModelAndView();
                bookingReportUi.setViewName("reportPendingBookings.html");
                bookingReportUi.addObject("logedusername", auth.getName());
                bookingReportUi.addObject("loggeduserphoto", logeduser.getUser_photo());
                bookingReportUi.addObject("logeduseremail", logeduser.getEmail());
                bookingReportUi.addObject("logeduserfullname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
                bookingReportUi.addObject("logeduserCallingname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname()
                                                : null);
                bookingReportUi.addObject("logeduserDesignation",
                                logeduser.getEmployee_id() != null
                                                ? logeduser.getEmployee_id().getDesignation_id().getName()
                                                : null);
                bookingReportUi.addObject("pageTitle", "Pending Booking Report");
                return bookingReportUi;

        }

        @GetMapping(value = "/bookingdelayreport")
        public ModelAndView loadBookingDelayReportUi() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                User logeduser = userRepository.getByUsername(auth.getName());

                ModelAndView bookingDelayReportUi = new ModelAndView();
                bookingDelayReportUi.setViewName("reportBookingDelay.html");
                bookingDelayReportUi.addObject("logedusername", auth.getName());
                bookingDelayReportUi.addObject("loggeduserphoto", logeduser.getUser_photo());
                bookingDelayReportUi.addObject("logeduseremail", logeduser.getEmail());
                bookingDelayReportUi.addObject("logeduserfullname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
                bookingDelayReportUi.addObject("logeduserCallingname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname()
                                                : null);
                bookingDelayReportUi.addObject("logeduserDesignation",
                                logeduser.getEmployee_id() != null
                                                ? logeduser.getEmployee_id().getDesignation_id().getName()
                                                : null);
                bookingDelayReportUi.addObject("pageTitle", "Booking Delay Report");
                return bookingDelayReportUi;

        }

        @GetMapping(value = "/dailybookingsummury")
        public ModelAndView loadDailyBookingReportUi() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                User logeduser = userRepository.getByUsername(auth.getName());

                ModelAndView reportDailyBookingUi = new ModelAndView();
                reportDailyBookingUi.setViewName("reportDailyBooking.html");
                reportDailyBookingUi.addObject("logedusername", auth.getName());
                reportDailyBookingUi.addObject("loggeduserphoto", logeduser.getUser_photo());
                reportDailyBookingUi.addObject("logeduseremail", logeduser.getEmail());
                reportDailyBookingUi.addObject("logeduserfullname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
                reportDailyBookingUi.addObject("logeduserCallingname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname()
                                                : null);
                reportDailyBookingUi.addObject("logeduserDesignation",
                                logeduser.getEmployee_id() != null
                                                ? logeduser.getEmployee_id().getDesignation_id().getName()
                                                : null);
                reportDailyBookingUi.addObject("pageTitle", "Daily Booking Summary Report");
                return reportDailyBookingUi;

        }

        @GetMapping(value = "/revenuelicenseexpirereport")
        public ModelAndView loadRevenueLicenseExpireReportUi() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                User logeduser = userRepository.getByUsername(auth.getName());

                ModelAndView revenueLicenseExpireReportUi = new ModelAndView();
                revenueLicenseExpireReportUi.setViewName("reportRevenueLicenseExpire.html");
                revenueLicenseExpireReportUi.addObject("logedusername", auth.getName());
                revenueLicenseExpireReportUi.addObject("loggeduserphoto", logeduser.getUser_photo());
                revenueLicenseExpireReportUi.addObject("logeduseremail", logeduser.getEmail());
                revenueLicenseExpireReportUi.addObject("logeduserfullname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
                revenueLicenseExpireReportUi.addObject("logeduserCallingname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname()
                                                : null);
                revenueLicenseExpireReportUi.addObject("logeduserDesignation",
                                logeduser.getEmployee_id() != null
                                                ? logeduser.getEmployee_id().getDesignation_id().getName()
                                                : null);
                revenueLicenseExpireReportUi.addObject("pageTitle", "Revenue License Expire Report");
                return revenueLicenseExpireReportUi;

        }

        @GetMapping(value = "/insuranceexpirereport")
        public ModelAndView loadInsuranceExpireReportUi() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                User logeduser = userRepository.getByUsername(auth.getName());

                ModelAndView insuranceExpireReportUi = new ModelAndView();
                insuranceExpireReportUi.setViewName("reportInsuranceExpire.html");
                insuranceExpireReportUi.addObject("logedusername", auth.getName());
                insuranceExpireReportUi.addObject("loggeduserphoto", logeduser.getUser_photo());
                insuranceExpireReportUi.addObject("logeduseremail", logeduser.getEmail());
                insuranceExpireReportUi.addObject("logeduserfullname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
                insuranceExpireReportUi.addObject("logeduserCallingname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname()
                                                : null);
                insuranceExpireReportUi.addObject("logeduserDesignation",
                                logeduser.getEmployee_id() != null
                                                ? logeduser.getEmployee_id().getDesignation_id().getName()
                                                : null);
                insuranceExpireReportUi.addObject("pageTitle", "Insurance Expire Report");
                return insuranceExpireReportUi;

        }

        @GetMapping(value = "/agreementdeatilsreport")
        public ModelAndView loadAgreementDetailsUi() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                User logeduser = userRepository.getByUsername(auth.getName());

                ModelAndView agreementDetailsReportUi = new ModelAndView();
                agreementDetailsReportUi.setViewName("reportAgreementDetails.html");
                agreementDetailsReportUi.addObject("logedusername", auth.getName());
                agreementDetailsReportUi.addObject("loggeduserphoto", logeduser.getUser_photo());
                agreementDetailsReportUi.addObject("logeduseremail", logeduser.getEmail());
                agreementDetailsReportUi.addObject("logeduserfullname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
                agreementDetailsReportUi.addObject("logeduserCallingname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname()
                                                : null);
                agreementDetailsReportUi.addObject("logeduserDesignation",
                                logeduser.getEmployee_id() != null
                                                ? logeduser.getEmployee_id().getDesignation_id().getName()
                                                : null);
                agreementDetailsReportUi.addObject("pageTitle", "Agreement Details Report");
                return agreementDetailsReportUi;

        }

        @GetMapping(value = "/agreementexpirereport")
        public ModelAndView loadAgreementExpireUi() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                User logeduser = userRepository.getByUsername(auth.getName());

                ModelAndView agreementExpireReportUi = new ModelAndView();
                agreementExpireReportUi.setViewName("reportAgreementExpire.html");
                agreementExpireReportUi.addObject("logedusername", auth.getName());
                agreementExpireReportUi.addObject("loggeduserphoto", logeduser.getUser_photo());
                agreementExpireReportUi.addObject("logeduseremail", logeduser.getEmail());
                agreementExpireReportUi.addObject("logeduserfullname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
                agreementExpireReportUi.addObject("logeduserCallingname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname()
                                                : null);
                agreementExpireReportUi.addObject("logeduserDesignation",
                                logeduser.getEmployee_id() != null
                                                ? logeduser.getEmployee_id().getDesignation_id().getName()
                                                : null);
                agreementExpireReportUi.addObject("pageTitle", "Agreement Expire Report");
                return agreementExpireReportUi;

        }

        // load karanwa driver performance report ui
        @GetMapping(value = "/driverperformancereport")
        public ModelAndView loadDriverPerformanceReportUi() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                User logeduser = userRepository.getByUsername(auth.getName());

                ModelAndView driverPerformanceReportUi = new ModelAndView();
                driverPerformanceReportUi.setViewName("reportDriverPerfomance.html");
                driverPerformanceReportUi.addObject("logedusername", auth.getName());
                driverPerformanceReportUi.addObject("loggeduserphoto", logeduser.getUser_photo());
                driverPerformanceReportUi.addObject("logeduseremail", logeduser.getEmail());
                driverPerformanceReportUi.addObject("logeduserfullname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
                driverPerformanceReportUi.addObject("logeduserCallingname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname()
                                                : null);
                driverPerformanceReportUi.addObject("logeduserDesignation",
                                logeduser.getEmployee_id() != null
                                                ? logeduser.getEmployee_id().getDesignation_id().getName()
                                                : null);
                driverPerformanceReportUi.addObject("pageTitle", "Driver Performance Report");
                return driverPerformanceReportUi;
        }

        // load karanwa income reprot ui
        @GetMapping(value = "/incomeReport")
        public ModelAndView loadIncomeReportUi() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                User logeduser = userRepository.getByUsername(auth.getName());

                ModelAndView incomeReportUi = new ModelAndView();
                incomeReportUi.setViewName("reportIncome.html");
                incomeReportUi.addObject("logedusername", auth.getName());
                incomeReportUi.addObject("loggeduserphoto", logeduser.getUser_photo());
                incomeReportUi.addObject("logeduseremail", logeduser.getEmail());
                incomeReportUi.addObject("logeduserfullname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
                incomeReportUi.addObject("logeduserCallingname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname()
                                                : null);
                incomeReportUi.addObject("logeduserDesignation",
                                logeduser.getEmployee_id() != null
                                                ? logeduser.getEmployee_id().getDesignation_id().getName()
                                                : null);
                incomeReportUi.addObject("pageTitle", "Income Report");
                return incomeReportUi;
        }

        // load karanwa customer payment report ui
        @GetMapping(value = "/customerpaymentreport")
        public ModelAndView loadCustomerPaymentReportUi() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                User logeduser = userRepository.getByUsername(auth.getName());

                ModelAndView customerPaymentReportUi = new ModelAndView();
                customerPaymentReportUi.setViewName("reportCustomerPayment.html");
                customerPaymentReportUi.addObject("logedusername", auth.getName());
                customerPaymentReportUi.addObject("loggeduserphoto", logeduser.getUser_photo());
                customerPaymentReportUi.addObject("logeduseremail", logeduser.getEmail());
                customerPaymentReportUi.addObject("logeduserfullname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
                customerPaymentReportUi.addObject("logeduserCallingname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname()
                                                : null);
                customerPaymentReportUi.addObject("logeduserDesignation",
                                logeduser.getEmployee_id() != null
                                                ? logeduser.getEmployee_id().getDesignation_id().getName()
                                                : null);
                customerPaymentReportUi.addObject("pageTitle", "Customer Payment Report");
                return customerPaymentReportUi;
        }

}
