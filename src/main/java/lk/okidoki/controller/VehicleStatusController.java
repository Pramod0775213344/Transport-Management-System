package lk.okidoki.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lk.okidoki.modal.VehicleStatus;
import lk.okidoki.repository.VehicleStatusRepository;

@RestController
public class VehicleStatusController {

    @Autowired // genarate instance
    private VehicleStatusRepository vehicleStatusRepository;

    // Request mapping for load employeestatus all data (url
    // -->//employeestatus/alldata)
    @GetMapping(value = "/vehiclestatus/alldata", produces = "application/json")
    public List<VehicleStatus> findAllData() {
        return vehicleStatusRepository.findAll();
    }
}
