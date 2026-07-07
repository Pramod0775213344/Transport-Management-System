package lk.okidoki.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lk.okidoki.modal.SupplierStatus;
import lk.okidoki.repository.SupplierStatusRepository;

@RestController
public class SupplierStatusController {

    @Autowired // genarate instance
    private SupplierStatusRepository supplierStatusRepository;

    // Request mapping for load employeestatus all data (url
    // -->//employeestatus/alldata)
    @GetMapping(value = "/supplierstatus/alldata", produces = "application/json")
    public List<SupplierStatus> findAllData() {
        return supplierStatusRepository.findAll();
    }
}
