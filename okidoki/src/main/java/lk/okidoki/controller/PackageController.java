package lk.okidoki.controller;

import lk.okidoki.modal.Booking;
import lk.okidoki.modal.Privilage;
import lk.okidoki.modal.User;
import lk.okidoki.repository.PackageStatusRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import lk.okidoki.modal.Package;
import lk.okidoki.repository.PackageRepository;
import lk.okidoki.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

// servalet container implement karapu service update karaganna thamai @RestCntroller anotation eka use karanne
@RestController
public class PackageController {

    @Autowired // auto generate instance
    private PackageRepository packageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PackageStatusRepository packageStatusRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    // get mapping for load package ui
    @GetMapping(value = "/package")
    public ModelAndView loadPackAgeUI() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        // load package.html file
        ModelAndView packageUI = new ModelAndView();
        packageUI.setViewName("package.html");
        packageUI.addObject("logedusername", auth.getName());
        packageUI.addObject("loggeduserphoto", logeduser.getUser_photo());
        packageUI.addObject("pageTitle", "Package");
        return packageUI;

    }

    // Get mapping for get all package data from the table (url -->package/alldata)
    @GetMapping(value = "/package/alldata", produces = "application/json")
    public List<Package> getPackageAllData() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Package");

        if (userPrivilage.getPrivi_select()) {
        return packageRepository.findAll();
        } else {
            return new ArrayList<>();
        }
    }

    // mapping for insert package data into table (url ---->package/insert)
    @PostMapping(value = "/package/insert")
    public String savePackageData(@RequestBody Package packageData) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Package");
        User logedUser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_insert()) {

        try {
            packageData.setAdded_datetime(LocalDateTime.now());
            packageData.setAdded_user_id(logedUser.getId());
            packageData.setPackage_status_id(packageStatusRepository.getReferenceById(1)); // set

            // save operator
            packageRepository.save(packageData);

            // return success message
            return "ok";

        } catch (Exception e) {

            return "Save Not Complete : " + e.getMessage();
        }
    } else {

        return "Save Not Successed : You have not access";
    }
    }

    // mapping for update package data into table (url ---->package/update)
    @PutMapping(value = "/package/update")
    public String updatePackageData(@RequestBody Package packageData) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Package");
        User logedUser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_update()) {
        // duplicate check

        try {

            packageData.setUpdated_datetime(LocalDateTime.now());
            packageData.setUpdated_user_id(logedUser.getId());

            // save operator
            packageRepository.save(packageData);

            // return success message
            return "ok";

        } catch (Exception e) {

            return "Save Not Complete : " + e.getMessage();
        }
    } else {

        return "Save Not Successed : You have not access";
        }
    }

    // mapping for delete package data into table(change status) (url ---->ce)
    @DeleteMapping(value = "/package/delete")
    public String deletePackageData(@RequestBody Package packageData) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Package");
        User logedUser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_delete()) {
        // check existing
        if (packageData.getId() == null) {
            return "Delete Not Success: Package not found ";
        }

        Package extPackage = packageRepository.getReferenceById(packageData.getId());
        if (extPackage == null) {
            return "Delete Not Success: Package not found ";
        }

        try {
            packageData.setDeleted_datetime(LocalDateTime.now());
            packageData.setDeleted_user_id(logedUser.getId());
            packageData.setPackage_status_id(packageStatusRepository.getReferenceById(3)); // set

            // save operator
            packageRepository.save(packageData);

            // return success message
            return "ok";

        } catch (Exception e) {

            return "Delete Not Complete : " + e.getMessage();
        }
    } else {

        return "Save Not Successed : You have not access";
        }

    }

    // Get mapping for get all active customer data by given Status type (url
    // -->package/bycustomerctatus?customerstatusid=3)
    @GetMapping(value = "/package/bypackagestatus", produces = "application/json")
    public List<Package> getPackageByPackageStatus() {
        return packageRepository.getPackageByPackageStatus();

    }

    // Get mapping for get all package data by given vehicle type (url
    // -->package/byvehicletype?vehicletypeid=1)
    @GetMapping(value = "/package/byvehicletype", params = { "vehicletypeid" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Package> getPackageByVehicleType(@RequestParam("vehicletypeid") Integer vehicletypeid) {
        return packageRepository.getPackageByVehicleType(vehicletypeid);
    }

    // Get mapping for get all package data by given vehicle type (url
    // --> package/byvehicle?vehicleid=1)
    @GetMapping(value = "/package/byvehicleid",params = {"vehicleid"}, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Package> getPackageByVehicle(@RequestParam("vehicleid") Integer vehicleid) {
        return packageRepository.getPackageByVehicle(vehicleid);
    }

    // Get mapping for get package type using cutomer id and vehicle type (url
    // -->/package/bycutomerandvehicletype?customerid=1&packageType=packageType)
    @GetMapping(value = "/package/bycutomerandvehicletype", params = { "customerId" ,"vehicleTypeId"}, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Package> getPackageByVehicleType(@RequestParam("customerId") Integer customerId, @RequestParam("vehicleTypeId") Integer vehicleTypeId) {
        return packageRepository.getPackageTypeByCustomerAndVehicleType(customerId,vehicleTypeId);
    }
}
