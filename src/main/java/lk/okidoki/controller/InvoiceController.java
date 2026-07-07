package lk.okidoki.controller;

import lk.okidoki.modal.Booking;
import lk.okidoki.modal.Invoice;
import lk.okidoki.modal.Privilage;
import lk.okidoki.modal.User;
import lk.okidoki.repository.InvoiceRepository;
import lk.okidoki.repository.InvoiceStatusRepository;
import lk.okidoki.repository.UserRepository;
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


@RestController
public class InvoiceController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private InvoiceStatusRepository invoiceStatusRepository;

    @GetMapping(value = "/invoice")
    public ModelAndView loadCustomerPaymentTestInvoiceUi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Invoices Management");

        ModelAndView customerPaymentInvoiceUi = new ModelAndView();
        customerPaymentInvoiceUi.setViewName("invoice.html");
        customerPaymentInvoiceUi.addObject("logedusername", auth.getName());
        customerPaymentInvoiceUi.addObject("loggeduserphoto", logeduser.getUser_photo());
        customerPaymentInvoiceUi.addObject("logeduseremail", logeduser.getEmail());
        customerPaymentInvoiceUi.addObject("logeduserfullname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
        customerPaymentInvoiceUi.addObject("logeduserCallingname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname() : null);
        customerPaymentInvoiceUi.addObject("logeduserDesignation",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getDesignation_id().getName() : null);
        customerPaymentInvoiceUi.addObject("userPrivilage", userPrivilage);
        customerPaymentInvoiceUi.addObject("pageTitle", "Invoice");
        return customerPaymentInvoiceUi;

    }

    // get mapping for get all booking data (url -->/booking/alldata)
    @RequestMapping(value = "/invoice/alldata")
    public List<Invoice> getAllInvoice() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Invoices Management");

        if (userPrivilage.getPrivi_select()) {
            return invoiceRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        } else {
            return new ArrayList<>();
        }

    }

    @PostMapping(value = "/invoice/insert")
    public String saveInvoice(@RequestBody Invoice invoice) {
        // checek authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Invoices Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        // check existing
        if (userPrivilage.getPrivi_insert()) {
            try {
                invoice.setInvoice_status_id(invoiceStatusRepository.getReferenceById(1)); // default status pending
                invoice.setAdded_user_id(logeduser.getId());
                invoice.setAdded_datetime(LocalDateTime.now());
                // initaila state ekedi paid amount eka zero wenna oni
                invoice.setPaid_amount(BigDecimal.ZERO);

                invoiceRepository.save(invoice);

                return "ok";
            } catch (Exception e) {
                return "Save Not Complete : " + e.getMessage();
            }
        } else {
            return "Save Not Successed : You have not access";
        }

    }

    @GetMapping(value = "/invoice/unpaidinvoices", produces = "application/json")
    public List<Invoice> getUnpaidInvoices() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Invoices Management");

        if (userPrivilage.getPrivi_select()) {
            return invoiceRepository.getUnpaidInvoices();
        } else {
            return new ArrayList<>();
        }
    }

    // get invoice data for selected customer for customer portal
    @GetMapping(value = "/invoice/customerinvoices", produces = "application/json")
    public List<Invoice> getCustomerInvoices() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        

        return invoiceRepository.getByCustomer(logeduser.getCustomer_id().getId());
    }
    
}
