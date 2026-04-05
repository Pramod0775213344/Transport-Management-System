package lk.okidoki.controller;

import lk.okidoki.modal.*;
import lk.okidoki.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
public class SupplierPayableController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    @Autowired
    private SupplierPayableRepository supplierPayableRepository;

    @Autowired
    private SupplierPayableStatusRepository supplierPayableStatusRepository;

    // get mapping for get customer payment ui(url --->/customerpayment)
    @GetMapping(value = "/supplierpayable")
    public ModelAndView loadCustomerPayment() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView supplerPayableUi = new ModelAndView();
        supplerPayableUi.setViewName("supplierPayable.html");
        supplerPayableUi.addObject("logedusername", auth.getName());
        supplerPayableUi.addObject("loggeduserphoto", logeduser.getUser_photo());
        supplerPayableUi.addObject("logeduseremail", logeduser.getEmail());
        supplerPayableUi.addObject("logeduserfullname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
        supplerPayableUi.addObject("logeduserCallingname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname() : null);
        supplerPayableUi.addObject("logeduserDesignation",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getDesignation_id().getName() : null);
        supplerPayableUi.addObject("pageTitle", "Supplier Bills");
        return supplerPayableUi;

    }

    // get all data
    @GetMapping(value = "/supplierpayable/alldata")
    public List<SupplierPayable> getAllData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Batch Management");

        if (userPrivilage.getPrivi_select()) {
            // Last added data eke Mulata ganna oni nisa thama find all eke sort attributr
            // eka use karanne
            return supplierPayableRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));

        } else {
            return new ArrayList<>();
        }
    }

    // Requset post mapping for insert data in to the supplierPayable table(url
    // -->/supplierpayable/insert)
    @PostMapping(value = "/supplierpayable/insert")
    public String saveSupplierPayable(@RequestBody SupplierPayable supplierPayable) {

        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Batch Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_insert()) {
            // duplicate check
            // pending batch ekak thiyeddi thawa batch ekak danna bari wenna oni e vehicle
            // ekata
            List<SupplierPayable> pendingList = supplierPayableRepository
                    .getSupplierAgreementById(supplierPayable.getSupplier_agreement_id().getId());
            if (!pendingList.isEmpty()) {
                return "This vehicle already have a pending batch payment for this month.pLease Clear The pending Batch Payment Before Create new Batch Payment";
            }
            // batch ekata adala bookings walata create karana batch id eka update wenna oni

            try {
                supplierPayable.setAdded_datetime(LocalDateTime.now());
                supplierPayable.setAdded_user_id(logeduser.getId());
                supplierPayable.setSupplier_payable_status_id(supplierPayableStatusRepository.getReferenceById(1));
                // save data
                supplierPayableRepository.save(supplierPayable);

                return "ok";

            } catch (Exception e) {
                return "Save Not Completed :" + e.getMessage();
            }
        } else {

            return "Save Not Successed : You have not access";
        }
    }

    // selete karana vehicel ekata adala seleted month eke bookings tiak gannwa
    // -->/supplierpayable/seletedvehicleandmonth?vehicleId=3&month=3)
    @GetMapping(value = "/supplierpayable/seletedvehicleandmonth", params = { "vehicleId",
            "month" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Map<String, Object>> getCustomerByBusinessTypeAndStatus(@RequestParam("vehicleId") Integer vehicleId,
            @RequestParam("month") String month) {
        return supplierPayableRepository.getAllByBookingStatusAndDate(vehicleId, month);
    }

    // selete karana vehicel ekata adala seleted month eke bookings tiak gannwa
    // -->/supplierpayable/seletedvehicleandmonthforfixrate?vehicleId=17&month=2026-jan)
    @GetMapping(value = "/supplierpayable/seletedvehicleandmonthforfixrate", params = { "vehicleId",
            "month" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Map<String, Object>> getAllFixedRateBookingPriceByVehicleAndMonth(
            @RequestParam("vehicleId") Integer vehicleId, @RequestParam("month") String month) {
        return supplierPayableRepository.getAllFixedRateBookingPriceByVehicleAndMonth(vehicleId, month);
    }

    // slect karana supplierta adlawa supplier batch tika gannawa
    @GetMapping(value = "/supplierpayable/seletedsupplier", params = { "supplierId" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<SupplierPayable> getSupplierPayableBySupplierId(@RequestParam("supplierId") Integer supplierId) {
        return supplierPayableRepository.getSupplierPayableBySupplierId(supplierId);
    }

}
