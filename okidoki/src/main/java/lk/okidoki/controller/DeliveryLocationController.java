package lk.okidoki.controller;

import lk.okidoki.modal.DeliveryLocation;
import lk.okidoki.modal.PickupLocation;
import lk.okidoki.modal.User;
import lk.okidoki.repository.DeliveryLocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class DeliveryLocationController {

    @Autowired
    private DeliveryLocationRepository deliveryLocationRepository;


    // Request mapping for load location all data (url
    // -->//location/alldata)
    @GetMapping(value = "/deliverylocation/alldata", produces = "application/json")
    public List<DeliveryLocation> findAllData() {

        return deliveryLocationRepository.findAll();
    }

    // request mapping for insert data into the database[]
    @PostMapping(value = "/deliverylocation/insert")
    public String saveloactionData(@RequestBody DeliveryLocation deliveryLocation) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // check existing

        try {

            // save operator
            deliveryLocationRepository.save(deliveryLocation);

            // return success
            return "ok";
        } catch (Exception e) {

            return "Save Not Complete : " + e.getMessage();
        }

    }

    // Get mapping for get locations by given customer (url
    // --> deliverylocation/bycustomerid?customer_id=1)
    @GetMapping(value = "/deliverylocation/bycustomerid",params = {"customer_id"}, produces = "application/json")
    public List<DeliveryLocation> findByDeliveryLocationByCustomer(@RequestParam("customer_id") Integer customer_id){
        return deliveryLocationRepository.getDeliveryLocationBySelectedCustomer(customer_id);
    }
}


