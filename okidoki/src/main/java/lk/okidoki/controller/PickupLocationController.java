package lk.okidoki.controller;

import lk.okidoki.modal.Location;
import lk.okidoki.modal.PickupLocation;
import lk.okidoki.modal.Privilage;
import lk.okidoki.modal.User;
import lk.okidoki.repository.PickupLocationRepository;
import lk.okidoki.repository.UserRepository;
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
    private PickupLocationRepository pickupLocationRepository ;

    @Autowired
    private UserRepository userRepository ;

    // Request mapping for load location all data (url
    // -->//location/alldata)
    @GetMapping(value = "/pickuplocation/alldata", produces = "application/json")
    public List<PickupLocation> findAllData() {
        return pickupLocationRepository.findAll();
    }

    // request mapping for insert data into the database[]
    @PostMapping(value = "/pickuplocation/insert")
    public String saveloactionData(@RequestBody PickupLocation pickupLocation) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

            // check existing

        try {

            // save operator
            pickupLocationRepository.save(pickupLocation);

            // return success
            return "ok";
        } catch (Exception e) {

            return "Save Not Complete : " + e.getMessage();
        }

    }

    // Get mapping for get locations by given customer (url
    // --> pickuplocation/bycustomerid?customer_id=1)
    @GetMapping(value = "/pickuplocation/bycustomerid",params = {"customer_id"}, produces = "application/json")
    public List<PickupLocation> findByPickupLocationByCustomer(@RequestParam("customer_id") Integer customer_id){
        return pickupLocationRepository.getPickupLocationBySelectedCustomer(customer_id);

    }
}


