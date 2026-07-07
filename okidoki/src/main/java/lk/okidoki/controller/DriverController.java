package lk.okidoki.controller;

import lk.okidoki.modal.Privilage;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import lk.okidoki.modal.Driver;
import lk.okidoki.modal.User;
import lk.okidoki.repository.DriverRepository;
import lk.okidoki.repository.DriverStatusRepository;
import lk.okidoki.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;


@RestController
public class DriverController {

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverStatusRepository driverStatusRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    // Request mapping for load Driver Ui (url -->/driver)
    @RequestMapping(value = "/driver")
    public ModelAndView loadDriverUI() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView driverUI = new ModelAndView();
        driverUI.setViewName("driver.html");
        driverUI.addObject("logedusername", auth.getName());
        driverUI.addObject("loggeduserphoto", logeduser.getUser_photo());
        driverUI.addObject("pageTitle", "Driver");

        return driverUI;
    }

    // Request mapping for load all Driver data (url -->/driver/alldata)
    @GetMapping(value = "/driver/alldata", produces = "application/json")
    public List<Driver> getAllDriverData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Driver");
        // Last added data eke Mulata ganna oni nisa thama find all eke sort attributr
        // eka use karanne
        if (userPrivilage.getPrivi_select()) {
            return driverRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        }else {
            return new ArrayList<>();
        }

    }

     // Get mapping for get driver by supplier id (url -->/driver/bysupplierid?supplierid=1)
    @GetMapping(value = "/driver/bysupplierid",params = {"supplierid"}, produces = "application/json")
    public List<Driver> getMethodName(@RequestParam("supplierid") Integer supplierid) {

        return driverRepository.getDriverBySupplierId(supplierid);
    }

    // Request mapping for save Driver data (url -->/driver/insert)
    @PostMapping(value = "/driver/insert")
    public String saveDriverData(@RequestBody Driver driver) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Driver");

        // check existing
        if (userPrivilage.getPrivi_insert()) {
        // nic
        Driver extDriverByNic = driverRepository.getByNic(driver.getNic());
        if (extDriverByNic != null) {
            return "Save Not Success : NIC already exists";
        }

        // driving license no
        Driver extDriverByDrivingLicenseNo = driverRepository.getByDrivingLicenseNo(driver.getDriving_license_no());
        if (extDriverByDrivingLicenseNo != null) {
            return "Save Not Success : Driving License No already exists";           
        }

        // mobile no
        Driver extDriverByMobileNo = driverRepository.getByMobileNo(driver.getMobileno());
        if (extDriverByMobileNo != null) {
            return "Save Not Success : Mobile No already exists";  
        }

        try {
            // set auto data
            driver.setAdded_datetime(LocalDateTime.now());
            driver.setAdded_user_id(logeduser.getId());
            driver.setDriver_reg_no(driverRepository.getNextDriverRegNo());

            // save operator
            driverRepository.save(driver);

            // return success
            return "ok";
        } catch (Exception e) {
            
            return "Save Not Complete : " + e.getMessage();
        }
        } else {

            return "Save Not Successed : You have not access";
        }
     
    }

    // Requset mapping for upadate driver data (url--> /driver/update)
    @PutMapping(value = "/driver/update")
    public String updateDriverData(@RequestBody Driver driver) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Driver");

        if (userPrivilage.getPrivi_update()) {
        // check existing
        if (driver.getId() == null) {
            return "Update Not Success :Driver Not found";
        }

        Driver extById= driverRepository.getReferenceById(driver.getId());
        if (extById == null) {
            return "Update Not Success : Driver Not found";
        }

        // duplicate check
        //nic
        Driver extDriverByNic = driverRepository.getByNic(driver.getNic());
        if(extDriverByNic !=null && extDriverByNic.getId() != driver.getId()){
            return "Update Not Success : NIC already exists";
        }

        // driving license no
        Driver extDriverByDrivingLicenseNo = driverRepository.getByDrivingLicenseNo(driver.getDriving_license_no());
        if(extDriverByDrivingLicenseNo !=null && extDriverByDrivingLicenseNo.getId() != driver.getId()){
            return "Update Not Success : Driving License No already exists";
        }

        // mobile no
        Driver extDriverByMobileNo = driverRepository.getByMobileNo(driver.getMobileno());
        if(extDriverByMobileNo !=null && extDriverByMobileNo.getId() != driver.getId()){
            return "Update Not Success : Mobile No already exists";
        }

      
        try {
            // set auto update data
            driver.setUpdated_datetime(LocalDateTime.now());
            driver.setUpdated_user_id(logeduser.getId());

            // save operator
            driverRepository.save(driver);

            // return success
            return "ok";

        } catch (Exception e) {
            return "Update Not Complete : " + e.getMessage();
        }
        } else {

            return "Save Not Successed : You have not access";
        }

    }

    // Delete Mapping For delete driver data(url -->/driver/delete)
    @DeleteMapping(value = "/driver/delete")
    public String deleteDriverData(@RequestBody Driver driver){
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Driver");

        if (userPrivilage.getPrivi_delete()) {
        // check existing
        if (driver.getId() == null) {
            return "Delete Not Success: Driver not found ";
        }

        Driver extDriver = driverRepository.getReferenceById(driver.getId());
        if (extDriver == null) {
            return "Delete Not Success: Driver not found ";
        }

        try {
            
            // set auto delete date time
            driver.setDeleted_datetime(LocalDateTime.now());
            driver.setDeleted_user_id(logeduser.getId());
            driver.setDriver_status_id(driverStatusRepository.getReferenceById(3));

            // save opertator
            driverRepository.save(driver);

            // return ok
            return "ok";

        } catch (Exception e) {
            return   "Delete Not Completed :" + e.getMessage();
        }
        }  else {

            return "Save Not Successed : You have not access";
        }
    }
}
