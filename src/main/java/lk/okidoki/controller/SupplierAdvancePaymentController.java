package lk.okidoki.controller;

import lk.okidoki.modal.Privilage;
import lk.okidoki.modal.SupplierAdvance;
import lk.okidoki.modal.User;
import lk.okidoki.repository.FuelRequestRepository;
import lk.okidoki.repository.SupplierAdvanceRepository;
import lk.okidoki.repository.SupplierAdvanceStatusRepository;
import lk.okidoki.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class SupplierAdvancePaymentController {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private SupplierAdvanceRepository supplierAdvanceRepository;

        @Autowired
        private SupplierAdvanceStatusRepository supplierAdvanceStatusRepository;

        @Autowired
        private UserPrivilageController userPrivilageController;

        @Autowired
        private FuelRequestRepository fuelRequestRepository;

        @GetMapping(value = "/advancepayment")
        public ModelAndView loadAdvancePaymentUI() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                User logeduser = userRepository.getByUsername(auth.getName());
                Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                                "Advance Payment Management");

                ModelAndView advancePaymentUI = new ModelAndView();
                advancePaymentUI.setViewName("advancePayment.html");
                advancePaymentUI.addObject("logedusername", auth.getName());
                advancePaymentUI.addObject("loggeduserphoto", logeduser.getUser_photo());
                advancePaymentUI.addObject("logeduseremail", logeduser.getEmail());
                advancePaymentUI.addObject("logeduserfullname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
                advancePaymentUI.addObject("logeduserCallingname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname()
                                                : null);
                advancePaymentUI.addObject("logeduserDesignation",
                                logeduser.getEmployee_id() != null
                                                ? logeduser.getEmployee_id().getDesignation_id().getName()
                                                : null);
                advancePaymentUI.addObject("userPrivilage", userPrivilage);
                advancePaymentUI.addObject("pageTitle", "Supplier Advance");
                return advancePaymentUI;
        }

        @GetMapping(value = "/advancepayment/alldata", produces = "application/json")
        public List<SupplierAdvance> getAllData() {
                return supplierAdvanceRepository.findAllByOrderByIdDesc();
        }

        // post mapping foe advance payment ekak inserta karana system ekata
        @PostMapping(value = "/advancepayment/insert")
        public String saveAdvance(@RequestBody SupplierAdvance supplierAdvance) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                                "Advance Payment Management");
                User logeduser = userRepository.getByUsername(auth.getName());

                if (userPrivilage.getPrivi_insert()) {
                        try {
                                supplierAdvance.setAdded_datetime(LocalDateTime.now());
                                supplierAdvance.setAdded_user_id(logeduser.getId());

                                String nextNo = supplierAdvanceRepository.getNextAdvanceNo();
                                if (nextNo == null || nextNo.contains("null")) {
                                        supplierAdvance.setAdvance_no("ADV00001");
                                } else {
                                        supplierAdvance.setAdvance_no(nextNo);
                                }

                                supplierAdvance.setSupplier_advance_status_id(
                                                supplierAdvanceStatusRepository.getReferenceById(1));
                                supplierAdvanceRepository.save(supplierAdvance);
                                return "ok";
                        } catch (Exception e) {
                                return "Save Failed: " + e.getMessage();
                        }
                } else {
                        return "Save Failed: You do not have permission";
                }
        }

        // supplier adavacnce approve karana api eka
        @PutMapping(value = "/advancepayment/approve")
        public String approveAdvance(@RequestBody SupplierAdvance supplierAdvance) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                                "Advance Payment Management");
                User logeduser = userRepository.getByUsername(auth.getName());

                if (userPrivilage.getPrivi_update()) {
                        try {
                                supplierAdvance.setApproved_datetime(LocalDateTime.now());
                                supplierAdvance.setApproved_user_id(logeduser.getId());
                                supplierAdvance.setSupplier_advance_status_id(
                                                supplierAdvanceStatusRepository.getReferenceById(2));
                                supplierAdvanceRepository.save(supplierAdvance);
                                return "ok";
                        } catch (Exception e) {
                                return "Approve Failed: " + e.getMessage();
                        }
                } else {
                        return "Approve Failed: You do not have permission";
                }
        }

        // supplier adavance reject karana api eka
        @PutMapping(value = "/advancepayment/reject")
        public String rejectAdvance(@RequestBody SupplierAdvance supplierAdvance) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                                "Advance Payment Management");
                User logeduser = userRepository.getByUsername(auth.getName());

                if (userPrivilage.getPrivi_update()) {
                        try {
                                supplierAdvance.setRejected_datetime(LocalDateTime.now());
                                supplierAdvance.setRejected_user_id(logeduser.getId());
                                supplierAdvance.setSupplier_advance_status_id(
                                                supplierAdvanceStatusRepository.getReferenceById(3));
                                supplierAdvanceRepository.save(supplierAdvance);
                                return "ok";
                        } catch (Exception e) {
                                return "Reject Failed: " + e.getMessage();
                        }
                } else {
                        return "Reject Failed: You do not have permission";
                }
        }

        // get mapping ekak liyanna oni available balance eka calculate karana currunt
        // month ekata adalawa
        // API to fetch current month deductions for the selected vehicle
        @GetMapping(value = "/advancepayment/getDeductions", params = {
                        "vehicle_id" }, produces = "application/json")
        public Map<String, BigDecimal> getDeductionsSelectiveVehicle(
                        @RequestParam("vehicle_id") Integer vehicle_id) {

                BigDecimal totalFuelCost = fuelRequestRepository.getCurrentMonthTotalFuelCostSelectdVehicle(vehicle_id);
                BigDecimal totalAdvance = supplierAdvanceRepository.getTotalAdvanceByVehicle(vehicle_id);

                BigDecimal fuel = (totalFuelCost != null) ? totalFuelCost : BigDecimal.ZERO;
                BigDecimal advance = (totalAdvance != null) ? totalAdvance : BigDecimal.ZERO;
                BigDecimal totalDeduction = fuel.add(advance);

                Map<String, BigDecimal> response = new HashMap<>();
                response.put("totalFuelCost", fuel);
                response.put("totalAdvance", advance);
                response.put("totalDeduction", totalDeduction);

                return response;
        }

}
