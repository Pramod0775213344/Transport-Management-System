package lk.okidoki.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


import lk.okidoki.modal.SupplierAgreementStatus;
import lk.okidoki.repository.SupplierAgreementStatusRepository;

@RestController
public class SupplierAgreementStatusController {

    @Autowired // genarate instance
    private  SupplierAgreementStatusRepository supplierAgreementStatusRepository;   

    // Request mapping for load employeestatus all data (url
    // -->//employeestatus/alldata)
    @GetMapping(value = "/supplieragreementstatus/alldata", produces = "application/json")
    public List<SupplierAgreementStatus> findAllData() {
        return supplierAgreementStatusRepository.findAll();
    }
}
