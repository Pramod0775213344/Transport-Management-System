package lk.okidoki.controller;

import lk.okidoki.modal.User;
import lk.okidoki.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

@RestController
public class DriverPortalController {

    @Autowired
    private UserRepository userRepository;
    // Request mapping for load Driver Ui (url -->/driver)
    @RequestMapping(value = "/driverportal")
    public ModelAndView loadDriverPortalUI() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());
        ModelAndView driverPortalUI = new ModelAndView();
        driverPortalUI.setViewName("driverPortal/driverPortal.html");
        driverPortalUI.addObject("logeduseremail", logeduser.getEmail());
        driverPortalUI.addObject("logeduserfullname", logeduser.getDriver_id() != null ? logeduser.getDriver_id().getFullname() : null);
        driverPortalUI.addObject("logeduserCallingname", logeduser.getDriver_id() != null ? logeduser.getDriver_id().getCallingname() : null);
        driverPortalUI.addObject("logeduserDriverRegNo", logeduser.getDriver_id() != null ? logeduser.getDriver_id().getDriver_reg_no()  : null);

        return driverPortalUI;
    }

    @RequestMapping(value = "/driverportal/trips")
    public ModelAndView loadTripsUI() {
        ModelAndView tripsUI = new ModelAndView();
        tripsUI.setViewName("driverPortal/trips.html");
        return tripsUI;
    }

    @RequestMapping(value = "/driverportal/alerts")
    public ModelAndView loadAlertsUI() {
        ModelAndView alertsUI = new ModelAndView();
        alertsUI.setViewName("driverPortal/alerts.html");
        return alertsUI;
    }

    @RequestMapping(value = "/driverportal/settings")
    public ModelAndView loadSettingsUI() {
        ModelAndView settingsUI = new ModelAndView();
        settingsUI.setViewName("driverPortal/settings.html");
        return settingsUI;
    }
}
