package lk.okidoki.controller;

import lk.okidoki.modal.User;
import lk.okidoki.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@RestController
public class ReportUiController {

    @Autowired
    private UserRepository userRepository;

    @Autowired// auto generate instance
    private UserPrivilageController userPrivilageController;

    @GetMapping(value = "/report")
    public ModelAndView loadReportUi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView reportUI = new ModelAndView();
        reportUI.setViewName("report.html");
        reportUI.addObject("logedusername", auth.getName());
        reportUI.addObject("loggeduserphoto", logeduser.getUser_photo());
        reportUI.addObject("pageTitle", "Report Dashboard");
        return reportUI;

    }

//    load revenue ui
    @GetMapping(value = "/revenue")
    public ModelAndView loadRevenueUi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView revenueUi = new ModelAndView();
        revenueUi.setViewName("revenue.html");
        revenueUi.addObject("logedusername", auth.getName());
        revenueUi.addObject("loggeduserphoto", logeduser.getUser_photo());
        revenueUi.addObject("pageTitle", "Revenue Report");
        return revenueUi;

    }

    @GetMapping(value = "/bookingreport")
    public ModelAndView loadBookingReportUi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView bookingReportUi = new ModelAndView();
        bookingReportUi.setViewName("bookingReport.html");
        bookingReportUi.addObject("logedusername", auth.getName());
        bookingReportUi.addObject("loggeduserphoto", logeduser.getUser_photo());
        bookingReportUi.addObject("pageTitle", "Booking Performance Report");
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
        agreementDetailsReportUi.addObject("pageTitle", "Agreement Details Report");
        return agreementDetailsReportUi;

    }

//    load karanwa driver performance report ui
@GetMapping(value = "/driverperformancereport")
public ModelAndView loadDriverPerformanceReportUi() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    User logeduser = userRepository.getByUsername(auth.getName());

    ModelAndView agreementDetailsReportUi = new ModelAndView();
    agreementDetailsReportUi.setViewName("reportDriverPerfomance.html");
    agreementDetailsReportUi.addObject("logedusername", auth.getName());
    agreementDetailsReportUi.addObject("loggeduserphoto", logeduser.getUser_photo());
    agreementDetailsReportUi.addObject("pageTitle", "Driver Performance Report");
    return agreementDetailsReportUi;
}

//load karanwa income reprot ui
@GetMapping(value = "/incomeReport")
public ModelAndView loadIncomeReportUi() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    User logeduser = userRepository.getByUsername(auth.getName());

    ModelAndView incomeReportUi = new ModelAndView();
    incomeReportUi.setViewName("reportIncome.html");
    incomeReportUi.addObject("logedusername", auth.getName());
    incomeReportUi.addObject("loggeduserphoto", logeduser.getUser_photo());
    incomeReportUi.addObject("pageTitle", "Income Report");
    return incomeReportUi;
}

}
