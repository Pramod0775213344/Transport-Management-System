package lk.okidoki.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lk.okidoki.modal.DriverStatus;
import lk.okidoki.repository.DriverStatusRepository;

@RestController
public class DriverStatusController {

    @Autowired // genarate instance
    private DriverStatusRepository driverStatusRepository;

    // Request mapping for load employeestatus all data (url
    // -->//employeestatus/alldata)
    @GetMapping(value = "/driverstatus/alldata", produces = "application/json")
    public List<DriverStatus> findAllData() {
        return driverStatusRepository.findAll();
    }
}
