package lk.okidoki.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lk.okidoki.modal.Deaprtment;
import lk.okidoki.repository.DepartmentRepository;

@RestController
public class DepartmentController {

    @Autowired
private DepartmentRepository departmentRepository;

    @GetMapping(value = "/department/alldata")
    public List<Deaprtment> findAllData(){
return departmentRepository.findAll();
    }
}
