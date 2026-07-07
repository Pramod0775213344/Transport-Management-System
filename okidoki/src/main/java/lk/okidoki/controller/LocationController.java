package lk.okidoki.controller;

import lk.okidoki.modal.Location;
import lk.okidoki.modal.Module;
import lk.okidoki.modal.Privilage;
import lk.okidoki.modal.User;
import lk.okidoki.modal.VehicleType;
import lk.okidoki.repository.LocationRepository;
import lk.okidoki.repository.ModuleRepository;
import lk.okidoki.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
public class LocationController {

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired // auto generate instance
    private UserPrivilageController userPrivilageController;

    @Autowired
    private ModuleRepository moduleRepository;

    // get mapping for load package ui
    @GetMapping(value = "/location")
    public ModelAndView loadLocationUI() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        // load package.html file
        ModelAndView locationUI = new ModelAndView();
        locationUI.setViewName("location.html");
        locationUI.addObject("logedusername", auth.getName());
        locationUI.addObject("loggeduserphoto", logeduser.getUser_photo());
        locationUI.addObject("pageTitle", "Location");
        return locationUI;

    }

    // Request mapping for load location all data (url
    // -->//location/alldata)
    @GetMapping(value = "/location/alldata", produces = "application/json")
    public List<Location> findAllData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Location");

        if (userPrivilage.getPrivi_select()) {
        return locationRepository.findAll();
        } else {
            return new ArrayList<>();
        }
    }

    // Get mapping for get all Locations data by without select locations(url
    // -->/location/withoutselectlocation?bookingid=1)
    @GetMapping(value = "/location/withoutselectlocation", produces = "application/json")
    public List<Location> getLocationsWithoutSelectLocations(@RequestParam Integer bookingid) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Location");

            return locationRepository.getLocationsWithoutSelectLocations(bookingid);

    }

    // request mapping for insert data into the database[]
    @PostMapping(value = "/location/insert")
    public String saveloactionData(@RequestBody Location location) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Location");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_insert()) {
        // check existing

        try {
            // set auto data
            location.setAdded_datetime(LocalDateTime.now());
            location.setAdded_user_id(logeduser.getId());

            // save operator
            locationRepository.save(location);

            // return success
            return "ok";
        } catch (Exception e) {

            return "Save Not Complete : " + e.getMessage();
        }
        } else {

            return "Save Not Successed : You have not access";
        }

    }

    // Get mapping for get locations by given customer (url
    // --> location/bycustomerid?customer_id=1)
    @GetMapping(value = "/location/bycustomerid",params = {"customer_id"}, produces = "application/json")
    public List<Location> findByLocationByCustomer(@RequestParam("customer_id") Integer customer_id){
        return locationRepository.getLocationsBySelectedCustomer(customer_id);
    }



}
