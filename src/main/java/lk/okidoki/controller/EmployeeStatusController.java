package lk.okidoki.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lk.okidoki.modal.EmployeeStatus;
import lk.okidoki.repository.EmployeeStatusRepository;

@RestController
public class EmployeeStatusController {

    @Autowired // genarate instance
    private EmployeeStatusRepository employeeStatusRepository;

    // Request mapping for load employeestatus all data (url
    // -->//employeestatus/alldata)
    @GetMapping(value = "/employeestatus/alldata", produces = "application/json")
    public List<EmployeeStatus> findAllData() {
        return employeeStatusRepository.findAll();
    }

    @GetMapping(value = "/employeestatus/getstatuswithoutdelete", produces = "application/json")
    public List<EmployeeStatus> getEmployeeStatusWthoutDelete() {
        return employeeStatusRepository.employeeStatusWthoutDelete();
    }
}
