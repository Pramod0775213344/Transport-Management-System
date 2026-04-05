package lk.okidoki.controller;

import lk.okidoki.modal.SupplierPayable;
import lk.okidoki.modal.SupplierPayableStatus;
import lk.okidoki.modal.SupplierStatus;
import lk.okidoki.repository.SupplierPayableStatusRepository;
import lk.okidoki.repository.SupplierStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class SupplierPayableStatusController {

    @Autowired // genarate instance
    private SupplierPayableStatusRepository supplierPayableStatusRepository;

    // Request mapping for load employeestatus all data (url
    // -->//employeestatus/alldata)
    @GetMapping(value = "/supplierpayablestatus/alldata", produces = "application/json")
    public List<SupplierPayableStatus> findAllData() {
        return supplierPayableStatusRepository.findAll();
    }
}
