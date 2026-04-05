package lk.okidoki.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lk.okidoki.modal.VehicleType;
import lk.okidoki.repository.VehicleTypeRepository;



@RestController
public class VehicleTypeController {

    @Autowired
    private VehicleTypeRepository vehicleTypeRepository;

    @GetMapping(value = "/vehicletype/alldata",produces = "application/json")
    public List<VehicleType> findAllData(){
        return vehicleTypeRepository.findAll();
    }
    // Get mapping for get vehicle type given customer and and active agreements (url
    // --> vehicletype/bycustomeragreementsandcustomerid?customer_id=1)
  @GetMapping(value = "/vehicletype/bycustomeragreementsandcustomerid",params = {"customer_id"}, produces = "application/json")
    public List<VehicleType> findByCustomerAgreements(@RequestParam("customer_id") Integer customer_id){
        return vehicleTypeRepository.getVehicleTypeByCustomeragreementAndCustomer(customer_id);
  }
    
}