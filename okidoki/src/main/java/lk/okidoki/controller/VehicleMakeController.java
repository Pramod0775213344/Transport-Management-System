package lk.okidoki.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lk.okidoki.modal.VehicleMake;
import lk.okidoki.repository.VehicleMakeRepository;

@RestController
public class VehicleMakeController {

    @Autowired // genarate instance
    private VehicleMakeRepository vehicleMakeRepository;

    // Request mapping for load employeestatus all data (url
    // -->//employeestatus/alldata)
    @GetMapping(value = "/vehiclemake/alldata", produces = "application/json")
    public List<VehicleMake> findAllData() {
        return vehicleMakeRepository.findAll();
    }
}
