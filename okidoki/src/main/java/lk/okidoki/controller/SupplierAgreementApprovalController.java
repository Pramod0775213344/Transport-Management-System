package lk.okidoki.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lk.okidoki.modal.Privilage;
import lk.okidoki.modal.SupplierAgreement;
import lk.okidoki.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import lk.okidoki.modal.User;


@RestController
public class SupplierAgreementApprovalController {

    @Autowired
    private SupplierAgreementRepository supplierAgreementRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SupplierAgreementStatusRepository supplierAgreementStatusRepository ;

    @Autowired
    private UserPrivilageController userPrivilageController;

    // Request mapping for load customeragreement Ui (url
    // -->/supplierragreementapprove)
    @RequestMapping(value = "/supplierragreementapprove")
    public ModelAndView loadCustomerAgreementApprovalUI() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView supplierAgreementApprovalUI = new ModelAndView();
        supplierAgreementApprovalUI.setViewName("supplierAgreementApproval.html");
        supplierAgreementApprovalUI.addObject("logedusername", auth.getName());
        supplierAgreementApprovalUI.addObject("loggeduserphoto", logeduser.getUser_photo());
        supplierAgreementApprovalUI.addObject("pageTitle", "Supplier Agreement Approval");
        return supplierAgreementApprovalUI;
    }



    // Get mapping for get pending all customer agreement data by (url
    // -->/supplieragreementapprove/bysupplieragreementstatusid)
    @RequestMapping(value="/supplieragreementapprove/bysupplieragreementstatusid",produces = "application/json")
    public List<SupplierAgreement> getSupplierAgreementByStatus() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logedUser = userRepository.getByUsername(auth.getName());
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "CustomerAgreementApproval");
        // check user privilage
        if (userPrivilage.getPrivi_select()) {
            return supplierAgreementRepository.getSupplierAgreementByStatus();
        }else {
            return new ArrayList<>();
        }

    }
    



    // Requset put mapping for approve supplier agreement approve from the table(url
    // -->/supplieragreementapprove/update)
    @PutMapping(value = "/supplieragreementapprove/update")
    public String aprroveCustomerAgreement(@RequestBody SupplierAgreement supplierAgreement) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logedUser = userRepository.getByUsername(auth.getName());
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "SupplierAgreementApproval");

        if (userPrivilage.getPrivi_insert()) {
        // check existing
        if (supplierAgreement.getId() == null) {
            return "Approval Not Completed : Agreement No Found";
        }
        // database eke thiyenwd balanna oni
        SupplierAgreement extSupplierAgreement = supplierAgreementRepository
                .getReferenceById(supplierAgreement.getId());
        if (extSupplierAgreement == null) {
            return "Approval Not Completed : Agreement No Not Found";

        }

        try {
            // set default values
            supplierAgreement.setApproved_datetime(LocalDateTime.now());
            supplierAgreement.setApproved_user_id(logedUser.getId());
            // set status to deleted
            supplierAgreement.setSupplier_agreement_status_id(supplierAgreementStatusRepository.getReferenceById(2));

            // save data
            supplierAgreementRepository.save(supplierAgreement);

            // return success message
            return "ok";
        } catch (Exception e) {
            return "Approval Not Completed :" + e.getMessage();
        }

        } else {
            return "You don't have permission to approve Supplier agreement";
        }

    }



    
    // Request put mapping for reject supplier agreement approve from the table(url
    // -->/supplieragreementapprove/reject)
    @PutMapping(value = "/supplieragreementapprove/reject")
    public String rejectSupplierAgreement(@RequestBody SupplierAgreement supplierAgreement) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logedUser = userRepository.getByUsername(auth.getName());
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "SupplierAgreementApproval");

        // check existing
        if (userPrivilage.getPrivi_update()) {
        if (supplierAgreement.getId() == null) {
            return "Reject Not Completed : Agreement No Found";
        }
        // database eke thiyenwd balanna oni
        SupplierAgreement extSupplierAgreement = supplierAgreementRepository
                .getReferenceById(supplierAgreement.getId());
        if (extSupplierAgreement == null) {
            return "Reject Not Completed : Agreement No Not Found";

        }

        try {
            // set default values
            supplierAgreement.setReject_datetime(LocalDateTime.now());
            supplierAgreement.setReject_user_id(logedUser.getId());
            // set status to deleted
            supplierAgreement.setSupplier_agreement_status_id(supplierAgreementStatusRepository.getReferenceById(5));

            // save data
            supplierAgreementRepository.save(supplierAgreement);

            // return success message
            return "ok";

        } catch (Exception e) {

            return "Reject Not Completed :" + e.getMessage();
        }
        } else {
            return "You don't have permission to reject supplier agreement";
        }

    }

}
