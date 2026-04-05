package lk.okidoki.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lk.okidoki.modal.VehicleInspectionStatus;
import lk.okidoki.repository.VehicleInspectionStatusRepository;

@RestController
public class VehicleInspectionStatusController {

    @Autowired // genarate instance
    private VehicleInspectionStatusRepository inspectionStatusRepository;

    // Request mapping for load employeestatus all data (url
    // -->//employeestatus/alldata)
    @GetMapping(value = "/vehicleinspectiontatus/alldata", produces = "application/json")
    public List<VehicleInspectionStatus> findAllData() {
        return inspectionStatusRepository.findAll();
    }
}
