package lk.okidoki.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lk.okidoki.modal.Privilage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import lk.okidoki.modal.Customer;
import lk.okidoki.modal.User;
import lk.okidoki.repository.CustomerRepository;
import lk.okidoki.repository.CustomerStatusRepository;
import lk.okidoki.repository.UserRepository;

@RestController
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CustomerStatusRepository customerStatusRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired// auto generate instance
    private UserPrivilageController userPrivilageController;
    // Request mapping for load customer Ui (url -->/customer)
    @RequestMapping(value = "/customer")
    public ModelAndView loadCustomerUI() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView customerUI = new ModelAndView();
        customerUI.setViewName("customer.html");
        customerUI.addObject("logedusername", auth.getName());
        customerUI.addObject("loggeduserphoto", logeduser.getUser_photo());
        customerUI.addObject("pageTitle", "Customer");
        return customerUI;
    }

    
    // Request mapping for load customer all data (url -->/customer/alldata)
    @GetMapping(value = "customer/alldata", produces = "application/json")
    public List<Customer> getCustomerAllData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Customer");

        if (userPrivilage.getPrivi_select()) {
        // Last added data eke Mulata ganna oni nisa thama find all eke sort attributr
        // eka use karanne
        return customerRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));

        } else {
            return new ArrayList<>();
        }
    }

    // Requset post mapping for insert data in to the customer table(url
    // -->/customer/insert)
    @PostMapping(value = "/customer/insert")
    public String saveCustomerData(@RequestBody Customer customer) {

        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Customer");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_insert()) {
        // duplicate check

        try {
            customer.setAdded_datetime(LocalDateTime.now());
            customer.setAdded_user_id(logeduser.getId());
            customer.setCustomer_reg_no(customerRepository.getNextCustomerRegNo());
            customer.setCustomer_status_id(customerStatusRepository.getReferenceById(1));

            customerRepository.save(customer);

            return "ok";
        } catch (Exception e) {
            return "Save Not Completed :" + e.getMessage();
        }
        } else {

            return "Save Not Successed : You have not access";
        }
    }

    // Requset Put mapping for update customer data(url -->/customer/update)
    @PutMapping(value = "/customer/update")
    public String updateCustomerData(@RequestBody Customer customer) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Customer");
        User logedUser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_update()) {
        // check ext
        if (customer.getId() == null) {
            return "Update Not Success: Customer not found";
        }

        Customer extCustomerById = customerRepository.getReferenceById(customer.getId());
        if (extCustomerById == null) {
            return "Update Not Success: Customer not Exist";
        }

        // duplicate check karann oni
        // direct telephone no check
        Customer extCustomerByTelephoneNo = customerRepository.getByTelephoneNo(customer.getDirect_telephone_no());
        if (extCustomerByTelephoneNo != null && extCustomerByTelephoneNo.getId() != customer.getId()) {
            return "Update Not Success: Customer Direct Telephone No already Exist";
        }

        // direct email check
        Customer extCustomerByEmail = customerRepository.getByEmail(customer.getDirect_email_no());
        if (extCustomerByEmail != null && extCustomerByEmail.getId() != customer.getId()) {
            return "Update Not Success: Customer Direct Email already Exist";
        }

        // contact person telephone no check
        Customer extCustomerByContactPersonTelephoneNo = customerRepository
                .getByContactPersonTelephoneNo(customer.getContact_person_mobileno());
        if (extCustomerByContactPersonTelephoneNo != null
                && extCustomerByContactPersonTelephoneNo.getId() != customer.getId()) {
            return "Update Not Success: Customer Contact Person Telephone No already Exist";
        }

        // contact person email check
        Customer extCustomerByContactPersonEmail = customerRepository
                .getByContactPersonEmail(customer.getContact_person_email());
        if (extCustomerByContactPersonEmail != null && extCustomerByContactPersonEmail.getId() != customer.getId()) {
            return "Update Not Success: Customer Contact Person Email already Exist";
        }
        try {

            // set auto added date
            customer.setUpdated_datetime(LocalDateTime.now());
            customer.setUpdated_user_id(logedUser.getId());

            customerRepository.save(customer);

            return "ok";

        } catch (Exception e) {

            return "Update Not Completed :" + e.getMessage();
        }
        } else {

            return "Update Not Successed : You have not access";
        }

    }

    // Requset delete mapping for delete customer from the table(url
    // -->/customer/delete)
    @DeleteMapping(value = "/customer/delete")
    public String deleteCustomerData(@RequestBody Customer customer) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Customer");
        User logeduser = userRepository.getByUsername(auth.getName());


        if (userPrivilage.getPrivi_delete()) {
        // check ext
        if (customer.getId() == null) {
            return "Delete Not Success: Customer not found";

        }

        // database eke customer innwd balanna oni
        Customer extCustomerById = customerRepository.getReferenceById(customer.getId());
        if (extCustomerById == null) {
            return "Delete Not Success: Customer not Exist";
        }

        try {

            // set auto deleted date
            customer.setDeleted_datetime(LocalDateTime.now());
            customer.setDeleted_user_id(logeduser.getId());
            // customer karanawa nam eke status deleted widihata auto maru wenawa
            customer.setCustomer_status_id(customerStatusRepository.getReferenceById(3));

            customerRepository.save(customer);

            // delete ekedi use karana response eka methana danna oni return eka widihata
            return "ok";

        } catch (Exception e) {
            return "Delete Not Completed :" + e.getMessage();
        }
    } else {

        return "Delete Not Successed : You have not access";
    }
    }

    // Get mapping for get all active customer data by given Status type (url
    // -->package/bycustomerctatus?customerstatusid=3)
    @GetMapping(value = "/customer/bycustomerstatus", produces = "application/json")
    public List<Customer> getCustomerByCustomerStatus() {
        return customerRepository.getCustomerByCustomerStatus();
    }

//    get customers if agreements available
    @GetMapping(value = "/customer/byactiveagreements", produces = "application/json")
    public List<Customer> getCustomerByActiveAgreements() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Customer");
        if (userPrivilage.getPrivi_select()) {
            return customerRepository.getCustomerByAgreement();
        } else {
            return new ArrayList<>();
        }
    }

    //    get customers if agreements available
    @GetMapping(value = "/customer/bynotinvehiclegroup", produces = "application/json")
    public List<Customer> getCustomerByAgreementAndNotInVehicleGroup() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Customer");
        if (userPrivilage.getPrivi_select()) {
            return customerRepository.getCustomerByAgreementAndNotInVehicleGroup();
        } else {
            return new ArrayList<>();
        }
    }


    //--------------------Customer data search Mappings--------------------------------------------------
// -->/customer/bystatus?&customerstatusId=3)
    @GetMapping(value = "/customer/bystatus", params = {"customerstatusId" }, produces = "application/json")
// param method eka haraha thama data ganne
    public List<Customer> getCustomersByStatus(@RequestParam("customerstatusId") Integer customerstatusId) {
        return customerRepository.getCustomersByStatus(customerstatusId);
    }

    // -->/customer/businesstypeid?businesstypeid=3)
    @GetMapping(value = "/customer/businesstypeid", params = {"businesstypeid" }, produces = "application/json")
// param method eka haraha thama data ganne
    public List<Customer> getCustomersByBusinessType(@RequestParam("businesstypeid") Integer businesstypeid) {
        return customerRepository.getCustomersByBusinessType(businesstypeid);
    }

    // -->/customer/bycustomerstatusandbusinesstype?businesstypeid=3&customerstatusId=3)
    @GetMapping(value = "/customer/bycustomerstatusandbusinesstype", params = {"businesstypeid","customerstatusId" }, produces = "application/json")
// param method eka haraha thama data ganne
    public List<Customer> getCustomerByBusinessTypeAndStatus(@RequestParam("businesstypeid") Integer businesstypeid, @RequestParam("customerstatusId") Integer customerstatusId) {
        return customerRepository.getCustomerByBusinessTypeAndStatus(businesstypeid,customerstatusId);
    }
    //--------------------vehicle data search Mappings end--------------------------------------------------
}
