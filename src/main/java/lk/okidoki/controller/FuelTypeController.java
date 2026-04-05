package lk.okidoki.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lk.okidoki.modal.FuelType;
import lk.okidoki.repository.FuelTypeRepository;

@RestController
public class FuelTypeController {

    @Autowired
    private FuelTypeRepository fuelTypeRepository;

    @GetMapping(value = "/fueltype/alldata", produces = "application/json")
    public List<FuelType> getAllFuelTypes() {
        return fuelTypeRepository.findAll();
    }
}
