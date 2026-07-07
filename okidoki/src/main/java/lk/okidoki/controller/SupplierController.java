package lk.okidoki.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lk.okidoki.modal.Privilage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import lk.okidoki.modal.Driver;
import lk.okidoki.modal.Supplier;
import lk.okidoki.modal.User;
import lk.okidoki.repository.DriverRepository;
import lk.okidoki.repository.DriverStatusRepository;
import lk.okidoki.repository.SupplierRepository;
import lk.okidoki.repository.SupplierStatusRepository;
import lk.okidoki.repository.UserRepository;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
public class SupplierController {

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SupplierStatusRepository supplierStatusRepository;

   @Autowired
   private DriverStatusRepository driverStatusRepository;

   @Autowired
   private DriverRepository driverRepository;

    @Autowired// auto generate instance
    private UserPrivilageController userPrivilageController;

    // Request mapping for load Supplier Ui (url -->/supplier)
    @RequestMapping(value = "/supplier")
    public ModelAndView loadSupplierUi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView supplierUi = new ModelAndView();
        supplierUi.setViewName("supplier.html");
        supplierUi.addObject("logedusername", auth.getName());
        supplierUi.addObject("loggeduserphoto", logeduser.getUser_photo());
        return supplierUi;

    }

    // Request mapping for load supplier all data (url -->/supplier/alldata)
    @GetMapping(value = "/supplier/alldata", produces = "application/json")
    public List<Supplier> getSupplierAllData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Supplier");

        if (userPrivilage.getPrivi_select()) {
        return supplierRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        } else {
            return new ArrayList<>();
        }
    }

//    get company suppliers
    @GetMapping(value = "/supplier/company", produces = "application/json")
    public List<Supplier> getCompanySuppliers() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Supplier");

        if (userPrivilage.getPrivi_select()) {
            return supplierRepository.getByCompany("Company");
        } else {
            return new ArrayList<>();
        }
    }

//    get individual suppliers
    @GetMapping(value = "/supplier/individual", produces = "application/json")
    public List<Supplier> getIndividualSuppliers() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Supplier");

        if (userPrivilage.getPrivi_select()) {
            return supplierRepository.getByIndividual("Individual");
        } else {
            return new ArrayList<>();
        }
    }
     
    // Requset post mapping for insert data in to the supplier table(url
    // -->/supplier/insert)
    @PostMapping(value = "/supplier/insert")
    public String saveSupplierData(@RequestBody Supplier supplier) {
        // check user authentication and authorozation
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Supplier");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_insert()) {
        // driver status eka true wunoth auto driver kenek register karanna oni system
        // eke
        if (supplier.getDriving_status()) {
            Driver driver = new Driver();
            driver.setFullname(supplier.getFullname());
            driver.setCallingname(supplier.getCallingname());
            driver.setNic(supplier.getNic());
            driver.setDriving_license_no(supplier.getDriving_licence_no());
            driver.setDriving_license_expire_date(supplier.getDriving_licencen_expiredate());
            driver.setEmail(supplier.getEmail());
            driver.setMobileno(supplier.getMobileno());
            driver.setAdded_datetime(LocalDateTime.now());
            driver.setAdded_user_id(logeduser.getId());
            driver.setDriver_status_id(driverStatusRepository.getReferenceById(1));
            driver.setSupplier_id(supplierRepository.getByDL(supplier.getDriving_licence_no()));// supplier id not set automaticaly shoul be fix

            driver.setDriver_reg_no(driverRepository.getNextDriverRegNo());

            driverRepository.save(driver);
            

        }

        // unique attritibute wala duplicate check karanna oni
        // nic eka check karanna oni
        Supplier extSupplierByNic = supplierRepository.getByNic(supplier.getNic());
        if (extSupplierByNic != null) {
            return "Save Not Completed: NIC already exists";
        }

        // driving license eka check karanna oni
        Supplier extSupplierByDL = supplierRepository.getByDL(supplier.getDriving_licence_no());
        if (extSupplierByDL != null) {
            return "Save Not Completed: Driving license No already exists";
        }

        // email eka check karanna oni
        Supplier extSupplierByEmail = supplierRepository.getByEmail(supplier.getEmail());
        if (extSupplierByEmail != null) {
            return "Save Not Completed: Email already exists";
        }

        // mobile no eka check karanna oni
        Supplier extSupplierByMobileNo = supplierRepository.getByMobileNo(supplier.getMobileno());
        if (extSupplierByMobileNo != null) {
            return "Save Not Completed: Mobile No already exists";
        }

        // transport name eka check Karanna oni
        Supplier extSupplierByTransportName = supplierRepository.getByTransportName(supplier.getTransportname());
        if (extSupplierByTransportName != null) {
            return "Save Not Completed: Transport Name already exists";

        }
        try {

            // set auto date
            supplier.setAdded_datetime(LocalDateTime.now());
            supplier.setAdded_user_id(logeduser.getId());
            supplier.setSupplier_status_id(supplierStatusRepository.getReferenceById(1));// default active status

            // save operator
            supplierRepository.save(supplier);

            // front end eke respinse eka return karanawa
            return "ok";

        } catch (Exception e) {

            return "Save not completed" + e.getMessage();
        }

    } else {

        return "Save Not Successed : You have not access";
    }
    }


    // Requset put mapping for insert data in to the supplier table(url
    // -->/supplier/insert)
    @PutMapping(value = "/supplier/update")
    public String updateSupplierData(@RequestBody Supplier supplier) {
        // check Authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Supplier");
        User logedUser = userRepository.getByUsername(auth.getName());
        if (userPrivilage.getPrivi_update()) {
        // check existing
        if (supplier.getId() == null) {
            return "Update Not Success: Supplier not found";
        }

        Supplier extSupplier = supplierRepository.getReferenceById(supplier.getId());
        if (extSupplier == null) {
            return "Update Not Success: Supplier not found";

        }

        // dupicate check karanna oni

        // nic check
        Supplier extSupplierByNic = supplierRepository.getByNic(supplier.getNic());
        if (extSupplierByNic != null && extSupplierByNic.getId() != supplier.getId()) {
            return "Update Not Success: NIC already exists";
        }

        // driving license check
        Supplier extSupplierByDL = supplierRepository.getByDL(supplier.getDriving_licence_no());
        if (extSupplierByDL != null && extSupplierByDL.getId() != supplier.getId()) {
            return "Update Not Success: Driving license No already exists";
        }

        // email check
        Supplier extSupplierByEmail = supplierRepository.getByEmail(supplier.getEmail());
        if (extSupplierByEmail != null && extSupplierByEmail.getId() != supplier.getId()) {
            return "Update Not Success: Email already exists";

        }

        // mobile no check
        Supplier extSupplierByMobileNo = supplierRepository.getByMobileNo(supplier.getMobileno());
        if (extSupplierByMobileNo != null && extSupplierByMobileNo.getId() != supplier.getId()) {
            return "Update Not Success: Mobile No already exists";

        }

        // transportname check
        Supplier extSupplierByTransportName = supplierRepository.getByTransportName(supplier.getTransportname());
        if (extSupplierByTransportName != null && extSupplierByTransportName.getId() != supplier.getId()) {
            return "Update Not Success: Transport Name already exists";

        }

        try {
            // set auto update date
            supplier.setUpdated_datetime(LocalDateTime.now());
            supplier.setUpdated_user_id(logedUser.getId());

            // update operator
            supplierRepository.save(supplier);

            // front end eke response eka return karanawa
            return "ok";

        } catch (Exception e) {

            return "Update Not Completed: " + e.getMessage();
        }

    } else {

        return "Save Not Successed : You have not access";
        }

    }

    // Request mapping for delete supplier data (url -->/supplier/delete)
    @DeleteMapping(value = "/supplier/delete")
    public String deleteSupplierData(@RequestBody Supplier supplier) {

        // checked user authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Supplier");
        User logeduser = userRepository.getByUsername(auth.getName());
        if (userPrivilage.getPrivi_delete()) {
        // check existing
        if (supplier.getId() == null) {
            return "Delete Not Success: Supplier not found ";
        }

        // databse eken supplier innwd balann oni
        Supplier extSupplier = supplierRepository.getReferenceById(supplier.getId());
        if (extSupplier == null) {
            return "Delete Not Success: Supplier not found ";
        }

        try {
            // set auto delete date
            supplier.setDeleted_datetime(LocalDateTime.now());
            supplier.setDeleted_user_id(logeduser.getId());
            // supplier delete karanawa nam eke status deleted widihata auto maru wenawa

            supplier.setSupplier_status_id(supplierStatusRepository.getReferenceById(3));

            // delete operator
            supplierRepository.save(supplier);

            // delete ekedi use karana response eka methana danna oni return eka widihata
            return "ok";

        } catch (Exception e) {
            return "Delete Not Completed :" + e.getMessage();
        }

    } else {

        return "Save Not Successed : You have not access";
        }

    }

    // Request mapping for load activesupplier all data (url -->/supplier/alldata)
    @GetMapping(value = "/supplier/alldatabystatus", produces = "application/json")
    public List<Supplier> getActiveSupplierAllData() {

        return supplierRepository.getAllActiveSupplier();
    }

    // Request mapping for load activesupplier with agreement approved all data (url-->/supplier/alldatawithagreementapproved)
    @GetMapping(value = "/supplier/alldatabystatuswithagreementapproved", produces = "application/json")
    public List<Supplier> getActiveSupplierWithAgreementApprovedAllData() {

        return supplierRepository.getAllActiveSupplierWithAgreementApproved();
    }
}
