package lk.okidoki.controller;

import lk.okidoki.modal.BookingStatus;
import lk.okidoki.modal.InvoiceStatus;
import lk.okidoki.repository.BookingStatusRepository;
import lk.okidoki.repository.InvoiceStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class InvoiceStatusController {

    @Autowired // genarate instance
    private InvoiceStatusRepository invoiceStatusRepository;

    // Request mapping for load bookingstatus all data (url
    // -->//bookingstatus/alldata)
    @GetMapping(value = "/invoicetatus/alldata", produces = "application/json")
    public List<InvoiceStatus> findAllData() {

        return invoiceStatusRepository.findAll();
    }
}
