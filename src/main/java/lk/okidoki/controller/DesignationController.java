package lk.okidoki.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lk.okidoki.modal.Designation;
import lk.okidoki.repository.DesignationRepository;

@RestController
public class DesignationController {

    @Autowired
    private DesignationRepository designationRepository;

    @GetMapping(value = "/designation/alldata",produces = "application/json")
    public List<Designation> findAllData(){
        return designationRepository.findAll();
    }
}
