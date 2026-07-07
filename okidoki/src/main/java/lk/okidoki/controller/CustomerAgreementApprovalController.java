package lk.okidoki.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lk.okidoki.modal.Privilage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import lk.okidoki.modal.CustomerAgreement;
import lk.okidoki.modal.User;
import lk.okidoki.repository.CustomerAgreementRepository;
import lk.okidoki.repository.CustomerAgreementStatusRepository;
import lk.okidoki.repository.UserRepository;


@RestController
public class CustomerAgreementApprovalController {

    @Autowired
    private CustomerAgreementRepository customerAgreementRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerAgreementStatusRepository customerAgreementStatusRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    // Request mapping for load customeragreement Ui (url
    // -->/customeragreement/approve)
    @RequestMapping(value = "/customeragreementapprove")
    public ModelAndView loadCustomerAgreementApprovalUI() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView customerAgreementApprovalUI = new ModelAndView();
        customerAgreementApprovalUI.setViewName("customerAgreementApproval.html");
        customerAgreementApprovalUI.addObject("logedusername", auth.getName());
        customerAgreementApprovalUI.addObject("loggeduserphoto", logeduser.getUser_photo());
        customerAgreementApprovalUI.addObject("pageTitle", "Customer Agreement Approval");
        return customerAgreementApprovalUI;
    }



    // Get mapping for get pending all customer agreement data by (url
    // -->/customeragreementapprove/bycustomeragreementstatusid?customeragreementstatusid=1)
    @RequestMapping(value="/customeragreementapprove/bycustomeragreementstatusid",produces = "application/json")
    public List<CustomerAgreement> getCustomerAgreementByStatus() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logedUser = userRepository.getByUsername(auth.getName());
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "CustomerAgreementApproval");

        // check user privilage
        if (userPrivilage.getPrivi_select()) {
            return customerAgreementRepository.getCustomerAgreementByStatus();
        }else {
            return new ArrayList<>();
        }

    }
    



    // Requset put mapping for approve customer agreement approve from the table(url
    // -->/customeragreementapprove/update)
    @PutMapping(value = "/customeragreementapprove/update")
    public String aprroveCustomerAgreement(@RequestBody CustomerAgreement customerAgreement) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "CustomerAgreementApproval");
        User logedUser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_insert()) {
        // check existing
        if (customerAgreement.getId() == null) {
            return "Approval Not Completed : Agreement No Found";
        }
        // database eke thiyenwd balanna oni
        CustomerAgreement extCustomerAgreement = customerAgreementRepository
                .getReferenceById(customerAgreement.getId());
        if (extCustomerAgreement == null) {
            return "Approval Not Completed : Agreement No Not Found";

        }

        try {
            // set default values
            customerAgreement.setApproved_datetime(LocalDateTime.now());
            customerAgreement.setApproved_user_id(logedUser.getId());
            // set status to deleted
            customerAgreement.setCustomer_agreement_status_id(customerAgreementStatusRepository.getReferenceById(2));

            // save data

            customerAgreementRepository.save(customerAgreement);

            // return success message
            return "ok";
        } catch (Exception e) {
            return "Approval Not Completed :" + e.getMessage();
        }

        } else {
            return "You don't have permission to approve customer agreement";
        }
    }



    
    // Requset put mapping for reject customer agreement approve from the table(url
    // -->/customeragreementapprove/reject)
    @PutMapping(value = "/customeragreementapprove/reject")
    public String rejectCustomerAgreement(@RequestBody CustomerAgreement customerAgreement) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "CustomerAgreementApproval");
        User logedUser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_update()) {
        // check existing
        if (customerAgreement.getId() == null) {
            return "Reject Not Completed : Agreement No Found";
        }
        // database eke thiyenwd balanna oni
        CustomerAgreement extCustomerAgreement = customerAgreementRepository
                .getReferenceById(customerAgreement.getId());
        if (extCustomerAgreement == null) {
            return "Reject Not Completed : Agreement No Not Found";

        }

        try {
            // set default values
            customerAgreement.setReject_datetime(LocalDateTime.now());
            customerAgreement.setReject_user_id(logedUser.getId());
            // set status to deleted
            customerAgreement.setCustomer_agreement_status_id(customerAgreementStatusRepository.getReferenceById(5));

            // save data

            customerAgreementRepository.save(customerAgreement);

            // return success message
            return "ok";

        } catch (Exception e) {

            return "Reject Not Completed :" + e.getMessage();
        }
        } else {
            return "You don't have permission to reject customer agreement";
        }

    }

}
