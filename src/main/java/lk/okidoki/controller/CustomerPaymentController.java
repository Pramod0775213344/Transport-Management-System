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
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Slf4j
@RestController
public class CustomerPaymentController {

    @Autowired
    private CustomerPaymentRepository customerPaymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private InvoiceStatusRepository invoiceStatusRepository;

    @Autowired
    private BookingStatusRepository bookingStatusRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private chequePaymentsRepository chequePaymentsRepository;

    // get mapping for get customer payment ui(url --->/customerpayment)
    @GetMapping(value = "/customerpayment")
    public ModelAndView loadCustomerPayment() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Customer Payment");
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView customerPaymentUi = new ModelAndView();
        customerPaymentUi.setViewName("customerPayment.html");
        customerPaymentUi.addObject("logedusername", auth.getName());
        customerPaymentUi.addObject("loggeduserphoto", logeduser.getUser_photo());
        customerPaymentUi.addObject("logeduseremail", logeduser.getEmail());
        customerPaymentUi.addObject("logeduserfullname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
        customerPaymentUi.addObject("logeduserCallingname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname() : null);
        customerPaymentUi.addObject("logeduserDesignation",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getDesignation_id().getName() : null);
        customerPaymentUi.addObject("userPrivilage", userPrivilage);
        customerPaymentUi.addObject("pageTitle", "Customer Payment");
        return customerPaymentUi;

    }

    // get mapping for get invoice ui(url --->/invoice)
    @GetMapping(value = "/testinvoice")
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
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Customer Payment");
        // Last added data eke Mulata ganna oni nisa thama find all eke sort attributr
        // eka use karanne
        if (userPrivilage.getPrivi_select()) {
            return customerPaymentRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        } else {
            return new ArrayList<>();
        }
    }

    // Requset post mapping for insert data in to the customerpayamnet table(url
    // -->/customerpayment/insert)
    @PostMapping(value = "/customerpayment/insert")
    public String saveCustomerData(@RequestBody CustomerPayment customerPayment) {

        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Customer Payment");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_insert()) {
            // duplicate check

            try {

                customerPayment.setAdded_datetime(LocalDateTime.now());
                customerPayment.setAdded_user_id(logeduser.getId());

                // check payment eka save karanna one nam save karanna
                // cheque list ekak enne
                if (customerPayment.getMethod().equals("Cheque")) {
                    // cheque no eka duplicate check karanna one nisa meka use karanwa
                    List<ChequePayment> chequePaymentList = customerPayment.getChequePaymentList();

                    for (ChequePayment chequePayment : chequePaymentList) {

                        // duplicate cheque no check
                        if (chequePaymentsRepository.existsByChequeNo(chequePayment.getCheque_no())) {
                            return "Duplicate cheque number found: " + chequePayment.getCheque_no();
                        }

                        chequePayment.setCustomer_payment_id(customerPayment);
                    }
                }

                // inter bank transfer list ekak enne nam save karanna
                if (customerPayment.getMethod().equals("Inter Bank Transfer(IBT)")) {
                    List<InterBankTransferPayment> interBankTransferPaymentList = customerPayment
                            .getInterBankTransferPaymentList();
                    for (InterBankTransferPayment interBankTransferPayment : interBankTransferPaymentList) {
                        interBankTransferPayment.setCustomer_payment_id(customerPayment);
                    }
                }

                // save data
                customerPaymentRepository.save(customerPayment);
                // customer payment eka save weddi invoice eke paid amount eka update karanna
                // one
                // paid amount eka null nam add karanna bari wenawa nisa eka handle karanna one

                Invoice invoice = invoiceRepository.getReferenceById(customerPayment.getInvoice_id().getId());
                BigDecimal paidAmount = invoice.getPaid_amount();

                if (paidAmount == null) {
                    paidAmount = customerPayment.getCurrent_payment();
                } else {
                    paidAmount = invoice.getPaid_amount().add(customerPayment.getCurrent_payment());
                }
                invoice.setPaid_amount(paidAmount);

                // invoice status eka update karanna one
                if (Objects.equals(paidAmount, invoice.getInvoice_total())) {
                    invoice.setInvoice_status_id(invoiceStatusRepository.getReferenceById(2)); // fully paid
                } else {
                    invoice.setInvoice_status_id(invoiceStatusRepository.getReferenceById(3)); // partially paid
                }
                invoiceRepository.save(invoice);

                // invoice eke status eka paid nam booking status eka update karanna one
                Set<Booking> bookingSet = invoice.getBookings();
                for (Booking booking : bookingSet) {
                    if (Objects.equals(invoice.getInvoice_status_id().getId(), 2)) {
                        booking.setBooking_status_id(bookingStatusRepository.getReferenceById(8)); // completed
                    }
                }
                bookingRepository.saveAll(bookingSet);

                return "ok";
            } catch (Exception e) {
                return "Save Not Completed :" + e.getMessage();
            }
        } else {

            return "Save Not Successed : You have not access";
        }
    }

    // customer payment details get by type and package
    // -->/customerpayment/bycustomer?customerid=1&packageType=FloatingRate&month=October
    @GetMapping(value = "/customerpayment/bycustomer", params = { "customerid", "packageType",
            "month" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<String[][]> getInvoiceDetails(@RequestParam("customerid") Integer customerid,
            @RequestParam("packageType") String packageType, @RequestParam("month") String month) {
        return customerPaymentRepository.getInvoiceDetails(customerid, packageType, month);
    }
}
