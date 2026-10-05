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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Slf4j
@RestController
public class SupplierPaymentController {

    @Autowired
    private SupplierPaymentRepository supplierPaymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    @Autowired
    private BookingStatusRepository bookingStatusRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SupplierPayableRepository supplierPayableRepository;

    @Autowired
    private SupplierPayableStatusRepository supplierPayableStatusRepository;

    // get mapping for get customer payment ui(url --->/customerpayment)
    @GetMapping(value = "/supplierpayment")
    public ModelAndView loadCustomerPayment() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Supplier Payment");
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView supplerPaymentUi = new ModelAndView();
        supplerPaymentUi.setViewName("supplierPayment.html");
        supplerPaymentUi.addObject("logedusername", auth.getName());
        supplerPaymentUi.addObject("loggeduserphoto", logeduser.getUser_photo());
        supplerPaymentUi.addObject("logeduseremail", logeduser.getEmail());
        supplerPaymentUi.addObject("logeduserfullname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
        supplerPaymentUi.addObject("logeduserCallingname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname() : null);
        supplerPaymentUi.addObject("logeduserDesignation",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getDesignation_id().getName() : null);
        supplerPaymentUi.addObject("userPrivilage", userPrivilage);
        supplerPaymentUi.addObject("pageTitle", "Supplier Payment");
        return supplerPaymentUi;

    }

    // Request mapping for load all supplierpayment data (url
    // -->/supplierpayment/alldata)
    @GetMapping(value = "/supplierpayment/alldata", produces = "application/json")
    public List<SupplierPayment> getAllSupplierPaymentData() {
        // Last added data eke Mulata ganna oni nisa thama find all eke sort attributr
        // eka use karanne
        return supplierPaymentRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    // Requset post mapping for insert data in to the supplierpayment table(url
    // -->/supplierpayment/insert)
    @PostMapping(value = "/supplierpayment/insert")
    public String saveCustomerData(@RequestBody SupplierPayment supplierPayment) {

        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Supplier Payment");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_insert()) {
            // duplicate check

            try {

                supplierPayment.setAdded_datetime(LocalDateTime.now());
                supplierPayment.setAdded_user_id(logeduser.getId());

                // save data
                supplierPaymentRepository.save(supplierPayment);

                // batch ekata adalawa fill wenna oni data tiaka thiyenawa
                SupplierPayable exitBatch = supplierPayment.getSupplier_payable_id();
                // danata thiyena paid amount eka gannaw.null nam 0 kiyala denawa
                BigDecimal currentPaid = (exitBatch.getPaid_amount() == null) ? BigDecimal.ZERO
                        : exitBatch.getPaid_amount();

                // curunt paid ekata aluth gana ekathu karanwa
                BigDecimal newPaidAmount = currentPaid.add(supplierPayment.getAmount_paid());

                // total eken pending eka calculate karanwa
                BigDecimal pendingAmount = exitBatch.getNet_amount().subtract(newPaidAmount);

                // data tika set karanwa
                exitBatch.setPaid_amount(newPaidAmount);
                exitBatch.setPending_amount(pendingAmount);

                // batch eke status eka update karanna one
                if (exitBatch.getPaid_amount() != null &&
                        exitBatch.getNet_amount() != null &&
                        exitBatch.getPaid_amount().compareTo(exitBatch.getNet_amount()) == 0) {

                    exitBatch.setSupplier_payable_status_id(
                            supplierPayableStatusRepository.getReferenceById(3));

                } else {

                    exitBatch.setSupplier_payable_status_id(
                            supplierPayableStatusRepository.getReferenceById(2));
                }
                supplierPayableRepository.save(exitBatch);

                // payable eke den period ekata adala okkom bookings tika settle wenna oni.e
                // agreement ekata adlawa
                List<Booking> bookingList = bookingRepository.getBookingListWhichBatchisPaid(
                        exitBatch.getSupplier_agreement_id().getId(), exitBatch.getMonth());
                for (Booking booking : bookingList) {
                    if (Objects.equals(exitBatch.getSupplier_payable_status_id().getId(), 3)) {
                        booking.setBooking_status_id(bookingStatusRepository.getReferenceById(9)); // settled
                    }
                }
                bookingRepository.saveAll(bookingList);
                return "ok";
            } catch (Exception e) {
                return "Save Not Completed :" + e.getMessage();
            }
        } else {

            return "Save Not Successed : You have not access";
        }
    }
}
