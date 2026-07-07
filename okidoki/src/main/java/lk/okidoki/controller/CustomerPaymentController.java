package lk.okidoki.controller;

import lk.okidoki.modal.*;
import lk.okidoki.repository.BookingRepository;
import lk.okidoki.repository.BookingStatusRepository;
import lk.okidoki.repository.CustomerPaymentRepository;
import lk.okidoki.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Slf4j
@RestController
public class CustomerPaymentController{

    @Autowired
    private CustomerPaymentRepository customerPaymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    @Autowired
    private BookingStatusRepository bookingStatusRepository;

    @Autowired
    private BookingRepository  bookingRepository;

// get mapping for get customer payment ui(url --->/customerpayment)
@GetMapping(value = "/customerpayment")
public ModelAndView loadCustomerPayment() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    User logeduser = userRepository.getByUsername(auth.getName());

    ModelAndView customerPaymentUi = new ModelAndView();
    customerPaymentUi.setViewName("customerPayment.html");
    customerPaymentUi.addObject("logedusername", auth.getName());
    customerPaymentUi.addObject("loggeduserphoto", logeduser.getUser_photo());
    customerPaymentUi.addObject("pageTitle", "Customer Payment");
    return customerPaymentUi;

}
    // get mapping for get invoice ui(url --->/invoice)
    @GetMapping(value = "/invoice")
    public ModelAndView loadCustomerPaymentInvoiceUi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView customerPaymentInvoiceUi = new ModelAndView();
        customerPaymentInvoiceUi.setViewName("customerInvoice.html");
        customerPaymentInvoiceUi.addObject("logedusername", auth.getName());
        customerPaymentInvoiceUi.addObject("loggeduserphoto", logeduser.getUser_photo());
        customerPaymentInvoiceUi.addObject("pageTitle", "Invoice");
        return customerPaymentInvoiceUi;

    }

    // Request mapping for load all Driver data (url -->/driver/alldata)
    @GetMapping(value = "/customerpayment/alldata", produces = "application/json")
    public List<CustomerPayment> getAllCustomerPaymentData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "CustomerPayment");
        // Last added data eke Mulata ganna oni nisa thama find all eke sort attributr
        // eka use karanne
        if (userPrivilage.getPrivi_select()) {
            return customerPaymentRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        }else {
            return new ArrayList<>();
        }
    }

    // Requset post mapping for insert data in to the customerpayamnet table(url
    // -->/customerpayment/insert)
    @PostMapping(value = "/customerpayment/insert")
    public String saveCustomerData(@RequestBody CustomerPayment customerPayment) {

        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "CustomerPayment");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_insert()) {
            // duplicate check

            try {
                customerPayment.setAdded_datetime(LocalDateTime.now());
                customerPayment.setAdded_user_id(logeduser.getId());
                // save data
                customerPaymentRepository.save(customerPayment);

                return "ok";
            } catch (Exception e) {
                return "Save Not Completed :" + e.getMessage();
            }
        } else {

            return "Save Not Successed : You have not access";
        }
    }

    @PutMapping(value = "/customerpayment/update")
    public String saveCustomerPaidAmount(@RequestBody CustomerPayment customerPayment) {

        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "CustomerPayment");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_update()) {
            // check existing
            if (customerPayment.getId() == null) {
                return "Update Not Success : Customer Payment Not found";
            }
            CustomerPayment extCustomerPayment = customerPaymentRepository.getReferenceById(customerPayment.getId());
            if (extCustomerPayment == null) {
                return "Update Not Success : Customer Payment Not found here";
            }
            // duplicate check

            try {

                for (ChequePayment chequePayment : customerPayment.getChequePaymentList()) {
                    chequePayment.setCustomer_payment_id(customerPayment);
                }

                for (InterBankTransferPayment interBankTransferPayment : customerPayment.getInterBankTransferPaymentList()) {
                    interBankTransferPayment.setCustomer_payment_id(customerPayment);
                }

//                currunt payment eka null nathtan kalin thiyena payment ekata add karanna
                // Check for nulls to avoid NullPointerException
                if (customerPayment.getCurrent_payment() != null && extCustomerPayment.getCurrent_payment() != null) {
                    customerPayment.setCurrent_payment(customerPayment.getCurrent_payment().add(extCustomerPayment.getCurrent_payment()));
                } else if (customerPayment.getCurrent_payment() == null && extCustomerPayment.getCurrent_payment() != null) {
                    customerPayment.setCurrent_payment(extCustomerPayment.getCurrent_payment());
                } // else keep as is (both are null or only ext is null)
                // save data
                customerPaymentRepository.save(customerPayment);

//                customer payment eke paid amount ekai total amount ekai samana wunoth booking eke status eka auto maru wenna oni operation confirmed widihata
                if (customerPayment.getBalance_amount() != null && customerPayment.getBalance_amount().compareTo(BigDecimal.ZERO) == 0) {
                    // get all bookings from customer payment
                    Set<Booking> bookings = customerPayment.getBookings();
                    System.out.println(bookings);
                    if (bookings != null) {
                        for (Booking extBooking : bookings) {
                            if (extBooking != null) {
                                Booking bookingToUpdate = bookingRepository.getReferenceById(extBooking.getId());
                                bookingToUpdate.setBooking_status_id(bookingStatusRepository.getReferenceById(8));
                                bookingRepository.save(bookingToUpdate);
                            }
                        }
                    }else{
                        return "Update Not Success : No bookings found in customer payment";
                    }
                }else{
                    return "Update Not Success : Balance amount is not zero, booking status will not be updated";
                }

                return "ok";
            } catch (Exception e) {
                return "Save Not Completed :" + e.getMessage();
            }
        } else {

            return "Save Not Successed : You have not access";
        }
    }
}
