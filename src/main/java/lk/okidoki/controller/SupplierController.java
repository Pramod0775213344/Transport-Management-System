package lk.okidoki.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lk.okidoki.modal.Privilage;

import org.hibernate.engine.jdbc.batch.spi.Batch;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import lk.okidoki.modal.Booking;
import lk.okidoki.modal.Driver;
import lk.okidoki.modal.Invoice;
import lk.okidoki.modal.Supplier;
import lk.okidoki.modal.SupplierAgreement;
import lk.okidoki.modal.SupplierPayable;
import lk.okidoki.modal.User;
import lk.okidoki.repository.BookingRepository;
import lk.okidoki.repository.DriverRepository;
import lk.okidoki.repository.DriverStatusRepository;
import lk.okidoki.repository.SupplierAgreementRepository;
import lk.okidoki.repository.SupplierPayableRepository;
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
    private SupplierAgreementRepository supplierAgreementRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SupplierPayableRepository supplierPayableRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SupplierStatusRepository supplierStatusRepository;

    @Autowired
    private DriverStatusRepository driverStatusRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired // auto generate instance
    private UserPrivilageController userPrivilageController;

    // Request mapping for load Supplier Ui (url -->/supplier)
    @RequestMapping(value = "/supplier")
    public ModelAndView loadSupplierUi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Supplier Management");

        ModelAndView supplierUi = new ModelAndView();
        supplierUi.setViewName("supplier.html");
        supplierUi.addObject("logedusername", auth.getName());
        supplierUi.addObject("loggeduserphoto", logeduser.getUser_photo());
        supplierUi.addObject("logeduseremail", logeduser.getEmail());
        supplierUi.addObject("logeduserfullname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
        supplierUi.addObject("logeduserCallingname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname() : null);
        supplierUi.addObject("logeduserDesignation",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getDesignation_id().getName() : null);
        supplierUi.addObject("userPrivilage", userPrivilage);
        supplierUi.addObject("pageTitle", "Supplier");
        return supplierUi;

    }

    // Request mapping for load supplier all data (url -->/supplier/alldata)
    @GetMapping(value = "/supplier/alldata", produces = "application/json")
    public List<Supplier> getSupplierAllData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Supplier Management");

        if (userPrivilage.getPrivi_select()) {
            return supplierRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        } else {
            return new ArrayList<>();
        }
    }

    // get company suppliers
    @GetMapping(value = "/supplier/company", produces = "application/json")
    public List<Supplier> getCompanySuppliers() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Supplier Management");

        if (userPrivilage.getPrivi_select()) {
            return supplierRepository.getByCompany("Company");
        } else {
            return new ArrayList<>();
        }
    }

    // get individual suppliers
    @GetMapping(value = "/supplier/individual", produces = "application/json")
    public List<Supplier> getIndividualSuppliers() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Supplier Management");

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
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Supplier Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_insert()) {

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

            // company registration no eka check karanna oni
            Supplier extSupplierByCompanyRegNo = supplierRepository.getByCompanyRegNo(supplier.getCompany_reg_no());
            if (extSupplierByCompanyRegNo != null) {
                return "Save Not Completed: Business Registration No already exists";
            }

            // company conatc no eka check karanna oni
            Supplier extSupplierByCompanyContactNo = supplierRepository
                    .getByCompanyMobileNo(supplier.getCompany_contact_no());
            if (extSupplierByCompanyContactNo != null) {
                return "Save Not Completed: Company Contact No already exists";
            }

            // company direct email eka check karana oni
            Supplier extSupplierByCompanyDirectEmail = supplierRepository
                    .getByCompanyEmail(supplier.getCompany_email());
            if (extSupplierByCompanyDirectEmail != null) {
                return "Save Not Completed: Company Direct Email already exists";
            }

            // company contact peroson mobile no eka chekc kranna oni
            Supplier extSupplierByCompanyContactPersonMobileNo = supplierRepository
                    .getByContactPersonMobileNo(supplier.getCompany_contact_person_mobileno());
            if (extSupplierByCompanyContactPersonMobileNo != null) {
                return "Save Not Completed: Company Contact Person Mobile No already exists";
            }

            // company contact person email eka chekc kranna oni
            Supplier extSupplierByCompanyContactPersonEmail = supplierRepository
                    .getByContactPersonEmail(supplier.getCompany_contact_person_email());
            if (extSupplierByCompanyContactPersonEmail != null) {
                return "Save Not Completed: Company Contact Person Email already exists";
            }

            try {

                // set auto date
                supplier.setAdded_datetime(LocalDateTime.now());
                supplier.setAdded_user_id(logeduser.getId());
                supplier.setSup_reg_no(supplierRepository.getNextSupplierRegNo());
                supplier.setSupplier_status_id(supplierStatusRepository.getReferenceById(1));// default active status

                // save operator
                supplierRepository.save(supplier);

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
                    driver.setSupplier_id(supplierRepository.getByNic(supplier.getNic()));// supplier id not
                                                    // set automaticaly
                                                    // shoul be fi
                    driver.setDriver_reg_no(driverRepository.getNextDriverRegNo());

                    driverRepository.save(driver);

                }

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
            // company registration no check
            Supplier extSupplierByCompanyRegNo = supplierRepository.getByCompanyRegNo(supplier.getCompany_reg_no());
            if (extSupplierByCompanyRegNo != null && extSupplierByCompanyRegNo.getId() != supplier.getId()) {
                return "Update Not Success: Business Registration No already exists";

            }

            // company conatc no eka check karanna oni
            Supplier extSupplierByCompanyContactNo = supplierRepository
                    .getByCompanyMobileNo(supplier.getCompany_contact_no());
            if (extSupplierByCompanyContactNo != null && extSupplierByCompanyContactNo.getId() != supplier.getId()) {
                return "Update Not Success: Company Contact No already exists";

            }

            // company direct email eka check karana oni
            Supplier extSupplierByCompanyDirectEmail = supplierRepository
                    .getByCompanyEmail(supplier.getCompany_email());
            if (extSupplierByCompanyDirectEmail != null
                    && extSupplierByCompanyDirectEmail.getId() != supplier.getId()) {
                return "Update Not Success: Company Direct Email already exists";
            }

            // company contact peroson mobile no eka chekc kranna oni
            Supplier extSupplierByCompanyContactPersonMobileNo = supplierRepository
                    .getByContactPersonMobileNo(supplier.getCompany_contact_person_mobileno());
            if (extSupplierByCompanyContactPersonMobileNo != null
                    && extSupplierByCompanyContactPersonMobileNo.getId() != supplier.getId()) {
                return "Update Not Success: Company Contact Person Mobile No already exists";
            }

            // company contact person email eka chekc kranna oni
            Supplier extSupplierByCompanyContactPersonEmail = supplierRepository
                    .getByContactPersonEmail(supplier.getCompany_contact_person_email());
            if (extSupplierByCompanyContactPersonEmail != null
                    && extSupplierByCompanyContactPersonEmail.getId() != supplier.getId()) {
                return "Update Not Success: Company Contact Person Email already exists";
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

            // supplier ta eka active agreement ekak hari thyiyenawa nam delete karanna ba
            // check karanawa
            List<SupplierAgreement> extSupplierWithActiveAgreement = supplierAgreementRepository
                    .getSupplierWithActiveAgreement(supplier.getId());
            if (!extSupplierWithActiveAgreement.isEmpty()) {
                return "Delete Not Success: There are " + extSupplierWithActiveAgreement.size()
                        + " active agreements associated with this Supplier.";
            }

            // pending booking thiyenawa nam delete karanna bari wenna oni
            List<Booking> pendingBookings = bookingRepository.getBySupplierId(supplier.getId());
            if (!pendingBookings.isEmpty()) {
                return "Delete Not Success: There are " + pendingBookings.size()
                        + " Pending bookings associated with this Supplier.";
            }

            // pending batch thiyemawa nam delete karanna bari wenna oni
            List<SupplierPayable> pendingInvoices = supplierPayableRepository.getBySupplierId(supplier.getId());
            if (!pendingInvoices.isEmpty()) {
                return "Delete Not Success: There are " + pendingInvoices.size()
                        + " Pending Invoices associated with this Supplier.";
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

    // Request mapping for load activesupplier with agreement approved all data
    // (url-->/supplier/alldatawithagreementapproved)
    @GetMapping(value = "/supplier/alldatabystatuswithagreementapproved", produces = "application/json")
    public List<Supplier> getActiveSupplierWithAgreementApprovedAllData() {

        return supplierRepository.getAllActiveSupplierWithAgreementApproved();
    }

    // payment available suppliers la list eka gnnawa
    @GetMapping(value = "/supplier/paymentavailable", produces = "application/json")
    public List<Supplier> getPaymentAvailableSupplier() {
        return supplierRepository.getSupplierWithPaymentAvailable();
    }

    // -----------------for supplier payment------------------
    @GetMapping(value = "/supplier/supplierpayableavailable", produces = "application/json")
    public List<Supplier> getAllSupplierPayableAvailableSuppliers() {
        return supplierRepository.getAllSupplierPayableAvailableSuppliers();
    }

    // vehicle id ekata anuwa supplier eka gnnawa
    @GetMapping(value = "/supplier/byvehicleid", params = "vehicleid", produces = "application/json")
    public Supplier getSupplierByVehicleId(@RequestParam("vehicleid") Long vehicleId) {
        return supplierRepository.getSupplierByVehicleId(vehicleId);
    }
}
