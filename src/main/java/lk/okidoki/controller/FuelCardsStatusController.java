package lk.okidoki.controller;

import lk.okidoki.modal.FuelCards;
import lk.okidoki.modal.FuelCardsStatus;
import lk.okidoki.repository.FuelCardsRepository;
import lk.okidoki.repository.FuelCardsStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class FuelCardsStatusController {

    @Autowired // genarate instance
    private FuelCardsStatusRepository fuelCardsStatusRepository;

    // Request mapping for load fuelcards all data (url
    // -->//fuelscards/alldata)
    @GetMapping(value = "/fuelscardsstatus/alldata", produces = "application/json")
    public List<FuelCardsStatus> findAllData() {
        return fuelCardsStatusRepository.findAll();
    }

}
