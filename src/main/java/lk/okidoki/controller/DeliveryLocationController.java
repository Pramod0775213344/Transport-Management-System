package lk.okidoki.controller;

import lk.okidoki.modal.*;
import lk.okidoki.repository.*;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class DeliveryLocationController {

    @Autowired
    private DeliveryLocationRepository deliveryLocationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DeliveryLocationStatusRepository deliveryLocationStatusRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    // Request mapping for load location all data (url
    // -->//location/alldata)
    @GetMapping(value = "/deliverylocation/alldata", produces = "application/json")
    public List<DeliveryLocation> findAllData() {

        return deliveryLocationRepository.findAll();
    }

    @GetMapping(value = "/deliverylocation/active", produces = "application/json")
    public List<DeliveryLocation> findActiveData() {
        return deliveryLocationRepository.getActiveDeliveries();
    }

    // request mapping for insert data into the database[]
    @PostMapping(value = "/deliverylocation/insert")
    public String saveloactionData(@RequestBody DeliveryLocation deliveryLocation) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Location Managemnt");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_insert()) {
            try {
                // set auto data
                deliveryLocation.setAdded_datetime(LocalDateTime.now());
                deliveryLocation.setAdded_user_id(logeduser.getId());
                deliveryLocation.setDelivery_locations_status_id(deliveryLocationStatusRepository.getReferenceById(1));

                // save operator
                deliveryLocationRepository.save(deliveryLocation);

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
    @PutMapping(value = "/deliverylocation/update")
    public String updateloactionData(@RequestBody DeliveryLocation deliveryLocation) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Location Managemnt");

        if (userPrivilage.getPrivi_update()) {
            try {
                // save operator
                deliveryLocationRepository.save(deliveryLocation);

                // return success
                return "ok";
            } catch (Exception e) {
                return "Update Not Complete : " + e.getMessage();
            }
        } else {
            return "Update Not Successed : You have not access";
        }
    }

    // request mapping for location delet karanna oni ewa
    @DeleteMapping(value = "/deliverylocation/delete")
    public String deleteloactionData(@RequestBody DeliveryLocation deliveryLocation) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Location Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_delete()) {
            try {
                DeliveryLocation extDeliveryLocation = deliveryLocationRepository
                        .getReferenceById(deliveryLocation.getId());
                if (extDeliveryLocation != null) {
                    extDeliveryLocation.setDeleted_datetime(LocalDateTime.now());
                    extDeliveryLocation.setDeleted_user_id(logeduser != null ? logeduser.getId() : 0);
                    extDeliveryLocation
                            .setDelivery_locations_status_id(deliveryLocationStatusRepository.getReferenceById(2));
                    deliveryLocationRepository.save(extDeliveryLocation);
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
    // --> deliverylocation/bycustomerid?customer_id=1)
    @GetMapping(value = "/deliverylocation/bycustomerid", params = { "customer_id" }, produces = "application/json")
    public List<DeliveryLocation> findByDeliveryLocationByCustomer(@RequestParam("customer_id") Integer customer_id) {
        return deliveryLocationRepository.getDeliveryLocationBySelectedCustomer(customer_id);
    }

}
