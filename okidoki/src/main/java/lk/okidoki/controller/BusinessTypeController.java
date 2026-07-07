package lk.okidoki.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lk.okidoki.modal.BusinessType;
import lk.okidoki.repository.BusinessTypeRepository;

@RestController
public class BusinessTypeController {

    @Autowired
    private BusinessTypeRepository businessTypeRepository;

    @GetMapping(value = "/businesstype/alldata",produces = "application/json")
    public List<BusinessType> findAllData(){
        return businessTypeRepository.findAll();
    }
}
