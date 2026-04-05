package lk.okidoki.controller;

import lk.okidoki.modal.Privilage;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import lk.okidoki.modal.SupplierAgreement;
import lk.okidoki.modal.User;
import lk.okidoki.repository.SupplierAgreementRepository;
import lk.okidoki.repository.SupplierAgreementStatusRepository;

import lk.okidoki.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
public class SupplierAgreementController {

    @Autowired
    private SupplierAgreementRepository supplierAgreementRepository;

    @Autowired
    private SupplierAgreementStatusRepository supplierAgreementStatusRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    // Request mapping for load supplier agreement Ui (url -->/supplieragreement)
    @RequestMapping("/supplieragreement")
    public ModelAndView loadSupplierAgreementUI() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView supplierAgreementUI = new ModelAndView();
        supplierAgreementUI.setViewName("supplieragreement.html");
        supplierAgreementUI.addObject("logedusername", auth.getName());
        supplierAgreementUI.addObject("loggeduserphoto", logeduser.getUser_photo());
        supplierAgreementUI.addObject("logeduseremail", logeduser.getEmail());
        supplierAgreementUI.addObject("logeduserfullname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
        supplierAgreementUI.addObject("logeduserCallingname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname() : null);
        supplierAgreementUI.addObject("logeduserDesignation",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getDesignation_id().getName() : null);
        supplierAgreementUI.addObject("pageTitle", "Supplier Agreement");
        return supplierAgreementUI;

    }

    // Get mapping for get all supplier agreement data by (url
    // -->/supplieragreement/alldata)
    @GetMapping(value = "/supplieragreement/alldata", produces = "application/json")
    public List<SupplierAgreement> getAllSupplierAgreementData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Supplier Agreement Management");

        if (userPrivilage.getPrivi_select()) {
            return supplierAgreementRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        } else {
            return new ArrayList<>();
        }
    }

    // post mapping for save supplier agreement data (url
    // -->/supplieragreement/save)
    @PostMapping(value = "/supplieragreement/insert")
    public String saveSupplierAgreementData(@RequestBody SupplierAgreement supplierAgreement) {

        // check autheentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Supplier Agreement Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_insert()) {
            // expire nowuna agreemnt ekak thiyenaw nam vehicle No alreday existing wenawa
            SupplierAgreement exSupplierAgreementByVehicleNo = supplierAgreementRepository
                    .getByVehicelNo(supplierAgreement.getVehicle_id());
            if (exSupplierAgreementByVehicleNo != null
                    && !exSupplierAgreementByVehicleNo.getSupplier_agreement_status_id()
                            .equals(supplierAgreementStatusRepository.getReferenceById(3))) {
                // expired naththan return karanwa exite msg ekak
                return "Vehicle No already exists with an active/pending agreement";
            }

            try {

                // exisying agreemnt eka expired nam eka
                if (exSupplierAgreementByVehicleNo != null
                        && exSupplierAgreementByVehicleNo.getSupplier_agreement_status_id()
                                .equals(supplierAgreementStatusRepository.getReferenceById(3))) {

                    // expired nam eka renew karawa
                    exSupplierAgreementByVehicleNo
                            .setSupplier_agreement_status_id(supplierAgreementStatusRepository.getReferenceById(6));
                    supplierAgreementRepository.save(exSupplierAgreementByVehicleNo);
                }

                // set added by and added date time
                supplierAgreement.setAdded_datetime(LocalDateTime.now());
                supplierAgreement.setAdded_user_id(logeduser.getId());
                supplierAgreement.setSup_agreement_no(supplierAgreementRepository.getNextSupplierAgreementNo());

                // set supplier agreement status to pending
                supplierAgreement
                        .setSupplier_agreement_status_id(supplierAgreementStatusRepository.getReferenceById(1));
                System.out.println(supplierAgreement);

                // save save operator
                supplierAgreementRepository.save(supplierAgreement);
                System.out.println(supplierAgreement);
                // return ok
                return "ok";

            } catch (Exception e) {

                return "Save Not Completed :" + e.getMessage();
            }
        } else {

            return "Save Not Successed : You have not access";
        }
    }

    // Requset update mapping for update supplier agreement from the table(url
    // -->/supplieragreement/update)
    @PutMapping(value = "/supplieragreement/update")
    public String updateCustomerAgreementData(@RequestBody SupplierAgreement supplierAgreement) {

        // Check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Supplier Agreement Management");
        User logedUser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_update()) {

            // check duplicate
            SupplierAgreement extByVehicleNo = supplierAgreementRepository
                    .getByVehicelNo(supplierAgreement.getVehicle_id());
            if (extByVehicleNo != null && extByVehicleNo.getId() != supplierAgreement.getId()) {
                return "Vehicle No already exists";
            }

            try {

                // set auto added value
                supplierAgreement.setUpdated_datetime(LocalDateTime.now());
                supplierAgreement.setUpdated_user_id(logedUser.getId());
                // set status to pending
                supplierAgreement
                        .setSupplier_agreement_status_id(supplierAgreementStatusRepository.getReferenceById(1));

                // save data
                supplierAgreementRepository.save(supplierAgreement);

                // return success message
                return "ok";

            } catch (Exception e) {
                return "Update Not Completed :" + e.getMessage();
            }
        } else {

            return "Save Not Successed : You have not access";
        }

    }

    // Requset delete mapping for delete supplier agreement from the table(url
    // -->/customeragreement/delete)
    @DeleteMapping(value = "/supplieragreement/delete")
    public String deleteCustomerAgreementData(@RequestBody SupplierAgreement supplierAgreement) {

        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Supplier Agreement Management");
        User logedUser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_delete()) {
            // check existing
            if (supplierAgreement.getId() == null) {
                return "Delete Not Completed : Agreement No Found";
            }
            // database eke thiyenwd balanna oni
            SupplierAgreement extSupplierAgreement = supplierAgreementRepository
                    .getReferenceById(supplierAgreement.getId());
            if (extSupplierAgreement == null) {
                return "Delete Not Completed : Agreement No Not Found";

            }

            try {
                // set default values
                supplierAgreement.setDeleted_datetime(LocalDateTime.now());
                supplierAgreement.setDeleted_user_id(logedUser.getId());
                // set status to deleted
                supplierAgreement
                        .setSupplier_agreement_status_id(supplierAgreementStatusRepository.getReferenceById(4));

                // save data
                supplierAgreementRepository.save(supplierAgreement);

                // return success message
                return "ok";
            } catch (Exception e) {
                return "Delete Not Completed :" + e.getMessage();
            }
        } else {

            return "Save Not Successed : You have not access";
        }
    }

    // ------------------------------------------filtering wala api
    // tika------------------------------------------
    // Request mapping for get supplier agreement using vehicle type (url
    // -->/supplieragreement/filterbyvehicletype?vehicleTypeId=1)
    @GetMapping(value = "/supplieragreement/filterbyvehicletype", produces = "application/json")
    public List<SupplierAgreement> getSupplierAgreementByVehicleType(Integer vehicleTypeId) {
        return supplierAgreementRepository.getByVehicleType(vehicleTypeId);
    }

    // Request mapping for get supplier agreement using status (url
    // -->/supplieragreement/filterbystatus?statusId=1)
    @GetMapping(value = "/supplieragreement/filterbystatus", produces = "application/json")
    public List<SupplierAgreement> getSupplierAgreementByStatus(Integer statusId) {
        return supplierAgreementRepository.getByStatus(statusId);
    }

    // Request mapping for get supplier agreement using supplier id (url
    // -->/supplieragreement/filterbysupplierid?supplierId=1)
    @GetMapping(value = "/supplieragreement/filterbysupplierid", params = {
            "supplierId" }, produces = "application/json")
    public List<SupplierAgreement> getSupplierAgreementBySupplierId(@RequestParam("supplierId") Integer supplierId) {
        return supplierAgreementRepository.getBySupplierId(supplierId);
    }

    // Request mapping for get supplier agreement using supplier id and vehicle type
    // (url
    // -->/supplieragreement/filterbysupplieridandvehicletype?supplierId=1&vehicleTypeId=1)
    @GetMapping(value = "/supplieragreement/filterbysupplieridandvehicletype", params = { "supplierId",
            "vehicleTypeId" }, produces = "application/json")
    public List<SupplierAgreement> getSupplierAgreementBySupplierIdAndVehicleType(
            @RequestParam("supplierId") Integer supplierId, @RequestParam("vehicleTypeId") Integer vehicleTypeId) {
        return supplierAgreementRepository.getBySupplierIdAndVehicleType(supplierId, vehicleTypeId);
    }

    // Request mapping for get supplier agreement using supplier id and status (url
    // -->/supplieragreement/filterbysupplieridandstatus?supplierId=1&statusId=1)
    @GetMapping(value = "/supplieragreement/filterbysupplieridandstatus", params = { "supplierId",
            "statusId" }, produces = "application/json")
    public List<SupplierAgreement> getSupplierAgreementBySupplierIdAndStatus(
            @RequestParam("supplierId") Integer supplierId, @RequestParam("statusId") Integer statusId) {
        return supplierAgreementRepository.getBySupplierIdAndStatus(supplierId, statusId);
    }

    // Request mapping for get supplier agreement using vehicle type and status (url
    // -->/supplieragreement/filterbyvehicletypeandstatus?vehicleTypeId=1&statusId=1)
    @GetMapping(value = "/supplieragreement/filterbyvehicletypeandstatus", params = { "vehicleTypeId",
            "statusId" }, produces = "application/json")
    public List<SupplierAgreement> getSupplierAgreementByVehicleTypeAndStatus(
            @RequestParam("vehicleTypeId") Integer vehicleTypeId, @RequestParam("statusId") Integer statusId) {
        return supplierAgreementRepository.getByVehicleTypeAndStatus(vehicleTypeId, statusId);
    }

    // Request mapping for get supplier agreement using supplier id and vehicle type
    // and status (url
    // -->/supplieragreement/filterbysupplieridandvehicletypeandstatus?supplierId=1&vehicleTypeId=1&statusId=1)
    @GetMapping(value = "/supplieragreement/filterbysupplieridandvehicletypeandstatus", params = { "supplierId",
            "vehicleTypeId", "statusId" }, produces = "application/json")
    public List<SupplierAgreement> getSupplierAgreementBySupplierIdAndVehicleTypeAndStatus(
            @RequestParam("supplierId") Integer supplierId, @RequestParam("vehicleTypeId") Integer vehicleTypeId,
            @RequestParam("statusId") Integer statusId) {
        return supplierAgreementRepository.getBySupplierIdAndVehicleTypeAndStatus(supplierId, vehicleTypeId, statusId);
    }

    // -----------------------------------------agreement count eka
    // gannawa-----------------------------------------
    // Request mapping for get all supplier agreement count (url
    // -->/supplieragreement/countallsupplieragreements)
    @GetMapping(value = "/supplieragreement/countall", produces = "application/json")
    public Integer countAllSupplierAgreements() {
        return supplierAgreementRepository.countAllSupplierAgreements();
    }

    // Request mapping for get active supplier agreement count (url
    // -->/supplieragreement/countactivesupplieragreements)
    @GetMapping(value = "/supplieragreement/countactive", produces = "application/json")
    public Integer countActiveSupplierAgreements() {
        return supplierAgreementRepository.countActiveSupplierAgreements();
    }

    // Request mapping for get pending supplier agreement count (url
    // -->/supplieragreement/countpendingsupplieragreements)
    @GetMapping(value = "/supplieragreement/countpending", produces = "application/json")
    public Integer countPendingSupplierAgreements() {
        return supplierAgreementRepository.countPendingSupplierAgreements();
    }

    // Request mapping for get rejected supplier agreement count (url
    // -->/supplieragreement/countrejectedsupplieragreements)
    @GetMapping(value = "/supplieragreement/countreject", produces = "application/json")
    public Integer countRejectedSupplierAgreements() {
        return supplierAgreementRepository.countRejectedSupplierAgreements();
    }

}
