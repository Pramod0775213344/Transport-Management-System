package lk.okidoki.controller;

import lk.okidoki.modal.*;
import lk.okidoki.repository.*;

import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
public class PickupLocationController {

    @Autowired
    private PickupLocationRepository pickupLocationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PickupLocationStatusRepository pickupLocationStatusRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    // Request mapping for load location all data (url
    // -->//location/alldata)
    @GetMapping(value = "/pickuplocation/alldata", produces = "application/json")
    public List<PickupLocation> findAllData() {
        return pickupLocationRepository.findAll();
    }

    @GetMapping(value = "/pickuplocation/active", produces = "application/json")
    public List<PickupLocation> findActiveData() {
        return pickupLocationRepository.getActivePickups();
    }

    // request mapping for insert data into the database[]
    @PostMapping(value = "/pickuplocation/insert")
    public String saveloactionData(@RequestBody PickupLocation pickupLocation) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        // check existing

        try {
            // set auto data
            pickupLocation.setAdded_datetime(LocalDateTime.now());
            pickupLocation.setAdded_user_id(logeduser.getId());
            pickupLocation.setPickup_locations_status_id(pickupLocationStatusRepository.getReferenceById(1));

            // save operator
            pickupLocationRepository.save(pickupLocation);

            // return success
            return "ok";
        } catch (Exception e) {

            return "Save Not Complete : " + e.getMessage();
        }

    }

    // request mapping for update data in the database
    @PutMapping(value = "/pickuplocation/update")
    public String updateloactionData(@RequestBody PickupLocation pickupLocation) {
        try {
            pickupLocationRepository.save(pickupLocation);
            return "ok";
        } catch (Exception e) {
            return "Update Not Complete : " + e.getMessage();
        }
    }

    // request mapping for delete data in the database
    @DeleteMapping(value = "/pickuplocation/delete")
    public String deleteloactionData(@RequestBody PickupLocation pickupLocation) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Location Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_delete()) {
            try {
                PickupLocation extPickupLocation = pickupLocationRepository.getReferenceById(pickupLocation.getId());
                if (extPickupLocation != null) {
                    extPickupLocation.setDeleted_datetime(LocalDateTime.now());
                    extPickupLocation.setDeleted_user_id(logeduser != null ? logeduser.getId() : 0);
                    extPickupLocation.setPickup_locations_status_id(pickupLocationStatusRepository.getReferenceById(2));
                    pickupLocationRepository.save(extPickupLocation);
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
    // --> pickuplocation/bycustomerid?customer_id=1)
    @GetMapping(value = "/pickuplocation/bycustomerid", params = { "customer_id" }, produces = "application/json")
    public List<PickupLocation> findByPickupLocationByCustomer(@RequestParam("customer_id") Integer customer_id) {
        return pickupLocationRepository.getPickupLocationBySelectedCustomer(customer_id);

    }

}
