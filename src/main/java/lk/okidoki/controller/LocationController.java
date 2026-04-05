package lk.okidoki.controller;

import lk.okidoki.modal.*;
import lk.okidoki.repository.*;

import java.time.LocalDateTime;
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

    @Autowired
    private LocationStatusRepository locationStatusRepository;

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
        locationUI.addObject("logeduseremail", logeduser.getEmail());
        locationUI.addObject("logeduserfullname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
        locationUI.addObject("logeduserCallingname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname() : null);
        locationUI.addObject("logeduserDesignation",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getDesignation_id().getName() : null);
        locationUI.addObject("pageTitle", "Location");
        return locationUI;

    }

    // Request mapping for load location all data (url
    // -->//location/alldata)
    // Request mapping for load location all data (url
    // -->//location/alldata)
    @GetMapping(value = "/location/alldata", produces = "application/json")
    public List<Location> findAllData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Location Management");

        if (userPrivilage.getPrivi_select()) {
            return locationRepository.findAll();
        } else {
            return new ArrayList<>();
        }
    }

    @GetMapping(value = "/location/active", produces = "application/json")
    public List<Location> findActiveData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Location Management");

        if (userPrivilage.getPrivi_select()) {
            return locationRepository.getActiveLocations();
        } else {
            return new ArrayList<>();
        }
    }

    // Get mapping for get all Locations data by without select locations(url
    // -->/location/withoutselectlocation?bookingid=1)
    @GetMapping(value = "/location/withoutselectlocation", produces = "application/json")
    public List<Location> getLocationsWithoutSelectLocations(@RequestParam Integer bookingid) {
        return locationRepository.getLocationsWithoutSelectLocations(bookingid);

    }

    // Get mapping for get all Locations data by without select locations(url
    // -->/location/withoutselectlocation?bookingid=1)
    @GetMapping(value = "/location/withoutselectlocationforroutes", params = { "routeId",
            "customerId" }, produces = "application/json")
    public List<Location> getLocationsWithoutAddRoutes(@RequestParam("routeId") Integer routeId,
            @RequestParam("customerId") Integer customerId) {
        return locationRepository.getLocationsWithoutAddRoutes(routeId, customerId);

    }

    // request mapping for insert data into the database[]
    @PostMapping(value = "/location/insert")
    public String saveloactionData(@RequestBody Location location) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Location Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_insert()) {
            // check existing

            try {
                // set auto data
                location.setAdded_datetime(LocalDateTime.now());
                location.setAdded_user_id(logeduser.getId());
                location.setLocation_status_id(locationStatusRepository.getReferenceById(1));

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

    // request mapping for update data in the database
    @PutMapping(value = "/location/update")
    public String updateloactionData(@RequestBody Location location) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Location Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_update()) {
            try {
                // set auto data
                location.setUpdated_datetime(LocalDateTime.now());
                location.setUpdated_user_id(logeduser.getId());

                // save operator
                locationRepository.save(location);

                // return success
                return "ok";
            } catch (Exception e) {
                return "Update Not Complete : " + e.getMessage();
            }
        } else {
            return "Update Not Successed : You have not access";
        }
    }

    // request mapping for delete data from the database
    @DeleteMapping(value = "/location/delete")
    public String deleteloactionData(@RequestBody Location location) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Location Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_delete()) {
            try {
                Location extLocation = locationRepository.getReferenceById(location.getId());
                if (extLocation != null) {
                    extLocation.setDeleted_datetime(LocalDateTime.now());
                    extLocation.setDeleted_user_id(logeduser != null ? logeduser.getId() : 0);
                    extLocation.setLocation_status_id(locationStatusRepository.getReferenceById(2)); // Assuming 2 is
                                                                                                     // deleted status
                    locationRepository.save(extLocation);
                    return "ok";
                } else {
                    return "Delete Not Successed : Location not found";
                }
            } catch (Exception e) {
                return "Delete Not Complete : " + e.getMessage();
            }
        } else {
            return "Delete Not Successed : You have not access";
        }
    }

    // Get mapping for get locations by given customer (url
    // --> location/bycustomerid?customer_id=1)
    @GetMapping(value = "/location/bycustomerid", params = { "customer_id" }, produces = "application/json")
    public List<Location> findByLocationByCustomer(@RequestParam("customer_id") Integer customer_id) {
        return locationRepository.getLocationsBySelectedCustomer(customer_id);
    }

}
