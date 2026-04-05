package lk.okidoki.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lk.okidoki.modal.CustomerStatus;
import lk.okidoki.repository.CustomerStatusRepository;

@RestController
public class CustomerStatusController {

    @Autowired // genarate instance
    private CustomerStatusRepository customerStatusRepository;

    // Request mapping for load employeestatus all data (url
    // -->//employeestatus/alldata)
    @GetMapping(value = "/customerstatus/alldata", produces = "application/json")
    public List<CustomerStatus> findAllData() {
        return customerStatusRepository.findAll();
    }

//    get mapping for get status without delete
// -->//employeestatus/statuswithoutdelete)
    @GetMapping(value = "/customerstatus/statuswithoutdelete", produces = "application/json")
    public List<CustomerStatus> getCustomerStatusWithoutDelete() {
        return customerStatusRepository.getCustomerStatusWithoutDelete();
    }
}
