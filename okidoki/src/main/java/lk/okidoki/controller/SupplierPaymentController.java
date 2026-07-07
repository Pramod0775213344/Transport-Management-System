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
import java.util.List;

@Slf4j
@RestController
public class SupplierPaymentController {

    @Autowired
    private SupplierPaymentRepository  supplierPaymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    @Autowired
    private BookingStatusRepository bookingStatusRepository;

    @Autowired
    private BookingRepository  bookingRepository;

// get mapping for get customer payment ui(url --->/customerpayment)
@GetMapping(value = "/supplierpayment")
public ModelAndView loadCustomerPayment() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    User logeduser = userRepository.getByUsername(auth.getName());

    ModelAndView supplerPaymentUi = new ModelAndView();
    supplerPaymentUi.setViewName("supplierPayment.html");
    supplerPaymentUi.addObject("logedusername", auth.getName());
    supplerPaymentUi.addObject("loggeduserphoto", logeduser.getUser_photo());
    supplerPaymentUi.addObject("pageTitle", "Supplier Payment");
    return supplerPaymentUi;

}

    // Request mapping for load all supplierpayment data (url -->/supplierpayment/alldata)
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
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "SupplierPayment");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_insert()) {
            // duplicate check

            try {
                supplierPayment.setAdded_datetime(LocalDateTime.now());
                supplierPayment.setAdded_user_id(logeduser.getId());
                // save data
                supplierPaymentRepository.save(supplierPayment);

                return "ok";
            } catch (Exception e) {
                return "Save Not Completed :" + e.getMessage();
            }
        } else {

            return "Save Not Successed : You have not access";
        }
    }
}
