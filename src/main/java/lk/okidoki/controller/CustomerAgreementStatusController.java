package lk.okidoki.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lk.okidoki.modal.CustomerAgreementStatus;
import lk.okidoki.repository.CustomerAgreementStatusRepository;

@RestController
public class CustomerAgreementStatusController {

    @Autowired // genarate instance
    private CustomerAgreementStatusRepository customerAgreementStatusRepository;

    // Request mapping for load employeestatus all data (url
    // -->//employeestatus/alldata)
    @GetMapping(value = "/customeragreementstatus/alldata", produces = "application/json")
    public List<CustomerAgreementStatus> findAllData() {
        return customerAgreementStatusRepository.findAll();
    }
}
