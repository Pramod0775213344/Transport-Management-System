package lk.okidoki.controller;

import lk.okidoki.modal.FuelCardsStatus;
import lk.okidoki.modal.FuelRequestStatus;
import lk.okidoki.repository.FuelCardsStatusRepository;
import lk.okidoki.repository.FuelRequestStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class FuelRequestStatusController {

    @Autowired // genarate instance
    private FuelRequestStatusRepository fuelRequestStatusRepository;

    // Request mapping for load fuelcards all data (url
    // -->//fuelscards/alldata)
    @GetMapping(value = "/fuelrequeststatus/alldata", produces = "application/json")
    public List<FuelRequestStatus> findAllData() {
        return fuelRequestStatusRepository.findAll();
    }

}
