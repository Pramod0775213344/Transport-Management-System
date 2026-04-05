package lk.okidoki.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lk.okidoki.modal.CustomerStatus;
import lk.okidoki.modal.DelayReason;
import lk.okidoki.repository.CustomerStatusRepository;
import lk.okidoki.repository.DelayReasonsRepository;

@RestController
public class DelayReasonController {

    @Autowired // genarate instance
    private DelayReasonsRepository delayReasonsRepository;

    // Request mapping for load employeestatus all data (url
    // -->//employeestatus/alldata)
    @GetMapping(value = "/delayreasons/forpickup", produces = "application/json")
    public List<DelayReason> findAllData() {
        return delayReasonsRepository.getReasonsForPickupDelay();
    }

    // get mapping for get status without delete
    // -->//employeestatus/statuswithoutdelete)
    @GetMapping(value = "/delayreasons/fordelivery", produces = "application/json")
    public List<DelayReason> getCustomerStatusWithoutDelete() {
        return delayReasonsRepository.getReasonsForDeliveryDelay();
    }
}
