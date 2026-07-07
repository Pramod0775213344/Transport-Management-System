package lk.okidoki.controller;

import lk.okidoki.modal.Privilage;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import lk.okidoki.modal.CustomerAgreement;
import lk.okidoki.modal.User;
import lk.okidoki.repository.CustomerAgreementRepository;
import lk.okidoki.repository.CustomerAgreementStatusRepository;
import lk.okidoki.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
public class CustomerAgreementController {

    @Autowired
    private CustomerAgreementRepository customerAgreementRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerAgreementStatusRepository customerAgreementStatusRepository;

    @Autowired// auto generate instance
    private UserPrivilageController userPrivilageController;

    // Request mapping for load customeragreement Ui (url -->/customeragreement)
    @RequestMapping(value = "/customeragreement")
    public ModelAndView loadCustomerAgreementUI() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView customerAgreementUI = new ModelAndView();
        customerAgreementUI.setViewName("customerAgreement.html");
        customerAgreementUI.addObject("logedusername", auth.getName());
        customerAgreementUI.addObject("loggeduserphoto", logeduser.getUser_photo());
        customerAgreementUI.addObject("pageTitle", "Customer Agreement");
        return customerAgreementUI;
    }


    // Request mapping for get all customeragreement data (url
    // -->/customeragreement/alldata)
    @RequestMapping(value = "/customeragreement/alldata", produces = "application/json")
    public List<CustomerAgreement> getCustomerAgreementAllData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "CustomerAgreement");

        if (userPrivilage.getPrivi_select()) {
        return customerAgreementRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        } else {
            return new ArrayList<>();
        }
    }


    // Requset post mapping for insert data in to the customer agreement table(url
    // -->/customeragreement/insert)
    @PostMapping(value = "/customeragreement/insert")
    public String saveCustomerAgreementData(@RequestBody CustomerAgreement customerAgreement) {

        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "CustomerAgreement");
        User logeduser = userRepository.getByUsername(auth.getName());


        if (userPrivilage.getPrivi_insert()) {
        // check existing
//            ekama vehicle type eken customer keneta  floating rate package  dekak gahanna ba
            if (customerAgreement.getPackage_id().getPackage_type().equals("Floating Rate")) {
                Integer vehicleTypeId = customerAgreement.getVehicle_type_id().getId(); // vehicle type eken id gannawa
                Integer  customerId = customerAgreement.getCustomer_id().getId(); // customer eken customer id gannawa
                CustomerAgreement extAgreementByVehicleType = customerAgreementRepository.findByVehicleTypeIdAndCustomerId(customerId,vehicleTypeId);
                if (extAgreementByVehicleType != null) {
                    return "Save Not Completed :Following customer already have this agreement";
                }
                // existing customer can not have same agreement
                CustomerAgreement extCustomerByVehicleTypeAndPackageType = customerAgreementRepository
                        .getByVehicleTypeAndPackageType(customerAgreement.getCustomer_id(),
                                customerAgreement.getVehicle_type_id(), customerAgreement.getPackage_id());
                if (extCustomerByVehicleTypeAndPackageType != null) {
                    return "Save Not Completed :Following customer already have this agreement";

                }
            }


        try {
            // set default values
            customerAgreement.setAdded_datetime(LocalDateTime.now());
            customerAgreement.setAdded_user_id(logeduser.getId());
            customerAgreement.setCus_agreement_no(customerAgreementRepository.getNextAgreementNo());
            // set status to pending
            customerAgreement.setCustomer_agreement_status_id(customerAgreementStatusRepository.getReferenceById(1));

            customerAgreementRepository.save(customerAgreement);

            // return success message
            return "ok";
        } catch (Exception e) {
            return "Save Not Completed :" + e.getMessage();
        }
    } else {

        return "Save Not Successed : You have not access";
    }
    }


    // Requset put mapping for update customer agreement from the table(url
    // -->/customeragreement/update)
    @PutMapping(value = "/customeragreement/update")
    public String updateCustomerAgreementData(@RequestBody CustomerAgreement customerAgreement) {

        // Check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "CustomerAgreement");
        User logedUser = userRepository.getByUsername(auth.getName());
        if (userPrivilage.getPrivi_update()) {
        // check duplicate
        CustomerAgreement extCustomerByVehicleTypeAndPackageType = customerAgreementRepository
                .getByVehicleTypeAndPackageType(customerAgreement.getCustomer_id(),
                        customerAgreement.getVehicle_type_id(), customerAgreement.getPackage_id());
        if (extCustomerByVehicleTypeAndPackageType != null && extCustomerByVehicleTypeAndPackageType.getId() != customerAgreement.getId()) {
            return "Update Not Completed :Following customer already have this agreement  Exists";

        }

        try {

            // set auto added value
            customerAgreement.setUpdated_datetime(LocalDateTime.now());
            customerAgreement.setUpdated_user_id(logedUser.getId());
            // set status to pending
            customerAgreement.setCustomer_agreement_status_id(customerAgreementStatusRepository.getReferenceById(1));

            customerAgreementRepository.save(customerAgreement);

            // return success message
            return "ok";

        } catch (Exception e) {
            return "Update Not Completed :" + e.getMessage();
        }
    } else {

        return "Update Not Successed : You have not access";
    }

    }

    
    // Requset delete mapping for delete customer agreement from the table(url
    // -->/customeragreement/delete)
    @DeleteMapping(value = "/customeragreement/delete")
    public String deleteCustomerAgreementData(@RequestBody CustomerAgreement customerAgreement) {

        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "CustomerAgreement");
        User logedUser = userRepository.getByUsername(auth.getName());
        if (userPrivilage.getPrivi_delete()) {
        // check existing
        if (customerAgreement.getId() == null) {
            return "Delete Not Completed : Agreement No Found";
        }
        // database eke thiyenwd balanna oni
        CustomerAgreement extCustomerAgreement = customerAgreementRepository
                .getReferenceById(customerAgreement.getId());
        if (extCustomerAgreement == null) {
            return "Delete Not Completed : Agreement No Not Found";

        }

        try {
            // set default values
            customerAgreement.setDeleted_datetime(LocalDateTime.now());
            customerAgreement.setDeleted_user_id(logedUser.getId());
            // set status to deleted
            customerAgreement.setCustomer_agreement_status_id(customerAgreementStatusRepository.getReferenceById(4));

            customerAgreementRepository.save(customerAgreement);

            // return success message
            return "ok";
        } catch (Exception e) {
            return "Delete Not Completed :" + e.getMessage();
        }
    } else {

        return "Delete Not Successed : You have not access";
    }
    }

    // Get mapping for get customer agreement  using cutomer id and vehicle type (url
    // -->/customeragreement/bycutomerandvehicletype?customerId=1&vehicleTypeId=)
    @GetMapping(value = "/customeragreement/bycutomerandvehicletype", params = { "customerId" ,"vehicleTypeId"})
    // param method eka haraha thama data ganne
    public CustomerAgreement getCustomerAgreementByCustomerAndVehicleType(@RequestParam("customerId") Integer customerId, @RequestParam("vehicleTypeId") Integer vehicleTypeId) {
        return customerAgreementRepository.findByVehicleTypeIdAndCustomerId(customerId,vehicleTypeId);
    }

    // Get mapping for get customer agreement  using cutomer id and vehicle type and date and booking status (url
    // -->/customeragreement/bycutomerandvehicletypeandgivendate?customerId=1&vehicleTypeId=2&date=2024-06-01)
    @GetMapping(value = "/customeragreement/bycutomerandvehicletypeandgivendate", params = { "customerId" ,"vehicleTypeId","date"})
    // param method eka haraha thama data ganne
    public List<CustomerAgreement> getCustomerAgreementByCustomerAndVehicleType(@RequestParam("customerId") Integer customerId, @RequestParam("vehicleTypeId") Integer vehicleTypeId, @RequestParam("date") String date) {
        return customerAgreementRepository.getByCustomerAndVehicleTypeAndDate(customerId,vehicleTypeId,date);
    }

    // Get mapping for get customer agreement  using cutomer id and vehicle type (url
    // -->/customeragreement/bylistcutomerandvehicletype?customerId=1&vehicleTypeId=)
    @GetMapping(value = "/customeragreement/bylistcutomerandvehicletype", params = { "customerId" ,"vehicleTypeId"}, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<CustomerAgreement> getByVehicleTypeIdAndCustomerId(@RequestParam("customerId") Integer customerId, @RequestParam("vehicleTypeId") Integer vehicleTypeId) {
        return customerAgreementRepository.getByVehicleTypeIdAndCustomerId(customerId,vehicleTypeId);
    }

    // Get mapping for get customer agreement  using cutomer id  (url
    // -->/customeragreement/bycutomer?customerId=1)
    @GetMapping(value = "/customeragreement/bycutomer", params = { "customerId" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<CustomerAgreement> getByVehicleTypeIdAndCustomerId(@RequestParam("customerId") Integer customerId) {
        return customerAgreementRepository.getByCustomer(customerId);
    }

//    ------------------------------------------filtering wala api tika------------------------------------------
    // Request mapping for get customer agreement using vehicle type (url
    // -->/customeragreement/filterbyvehicletype?vehicleTypeId=1)
    @GetMapping(value = "/customeragreement/filterbyvehicletype", params = { "vehicleTypeId" }, produces = "application/json")
    public List<CustomerAgreement> getCustomerAgreementByVehicleType(@RequestParam("vehicleTypeId") Integer vehicleTypeId) {
        return customerAgreementRepository.getByVehicleType(vehicleTypeId);
    }

    // Request mapping for get customer agreement using status (url
    // -->/customeragreement/filterbystatus?statusId=1)
    @GetMapping(value = "/customeragreement/filterbystatus", params = { "statusId" }, produces = "application/json")
    public List<CustomerAgreement> getCustomerAgreementByStatus(@RequestParam("statusId") Integer statusId) {
        return customerAgreementRepository.getByStatus(statusId);
    }

    // Request mapping for get customer agreement using customer id and vehicle type (url
    // -->/customeragreement/filterbycustomerandvehicletype?customerId=1&vehicleTypeId=1)
    @GetMapping(value = "/customeragreement/filterbycustomerandvehicletype", params = { "customerId", "vehicleTypeId" }, produces = "application/json")
    public List<CustomerAgreement> getAllCustomerAgreementByCustomerAndVehicleType(@RequestParam("customerId") Integer customerId, @RequestParam("vehicleTypeId") Integer vehicleTypeId) {
        return customerAgreementRepository.getByCustomerAndVehicleType(customerId, vehicleTypeId);
    }

    // Request mapping for get customer agreement using customer id and status (url
    // -->/customeragreement/filterbycustomerandstatus?customerId=1&statusId=1)
    @GetMapping(value = "/customeragreement/filterbycustomerandstatus", params = { "customerId", "statusId" }, produces = "application/json")
    public List<CustomerAgreement> getCustomerAgreementByCustomerAndStatus(@RequestParam("customerId") Integer customerId, @RequestParam("statusId") Integer statusId) {
        return customerAgreementRepository.getByCustomerAndStatus(customerId, statusId);
    }

    // Request mapping for get customer agreement using vehicle type and status (url
    // -->/customeragreement/filterbyvehicletypeandstatus?vehicleTypeId=1&statusId=1)
    @GetMapping(value = "/customeragreement/filterbyvehicletypeandstatus", params = { "vehicleTypeId", "statusId" }, produces = "application/json")
    public List<CustomerAgreement> getCustomerAgreementByVehicleTypeAndStatus(@RequestParam("vehicleTypeId") Integer vehicleTypeId, @RequestParam("statusId") Integer statusId) {
        return customerAgreementRepository.getByVehicleTypeAndStatus(vehicleTypeId, statusId);
    }
    // Request mapping for get customer agreement using customer id and vehicle type and status (url
    // -->/customeragreement/filterbycustomerandvehicletypeandstatus?customerId=1&vehicleTypeId=1&statusId=1)
    @GetMapping(value = "/customeragreement/filterbycustomerandvehicletypeandstatus", params = { "customerId", "vehicleTypeId", "statusId" }, produces = "application/json")
    public List<CustomerAgreement> getCustomerAgreementByCustomerAndVehicleTypeAndStatus(@RequestParam("customerId") Integer customerId, @RequestParam("vehicleTypeId") Integer vehicleTypeId, @RequestParam("statusId") Integer statusId) {
        return customerAgreementRepository.getByCustomerAndVehicleTypeAndStatus(customerId, vehicleTypeId, statusId);
    }

//    -----------------------------------------agreement count eka gannawa-----------------------------------------

    // Request mapping for get customer agreement count using all data (url
    // -->/customeragreement/countall)
    @GetMapping(value = "/customeragreement/countall", produces = "application/json")
    public Integer countAllCustomerAgreement() {
        return customerAgreementRepository.countAllBy();
    }

    // Request mapping for get active customer agreement count (url
    // -->/customeragreement/countactive)
    @GetMapping(value = "/customeragreement/countactive", produces = "application/json")
    public Integer countActiveCustomerAgreement() {
        return customerAgreementRepository.countByStatusActive();
    }

    // Request mapping for get pending customer agreement count (url
    // -->/customeragreement/countpending)
    @GetMapping(value = "/customeragreement/countpending", produces = "application/json")
    public Integer countPendingCustomerAgreement() {
        return customerAgreementRepository.countByStatusPending();
    }

    // Request mapping for get reject customer agreement count (url
    // -->/customeragreement/countreject)
    @GetMapping(value = "/customeragreement/countreject", produces = "application/json")
    public Integer countRejectCustomerAgreement() {
        return customerAgreementRepository.countByStatusRejected();
    }

}
