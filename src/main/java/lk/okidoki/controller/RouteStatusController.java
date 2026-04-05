package lk.okidoki.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lk.okidoki.modal.RouteStatus;
import lk.okidoki.repository.RouteStatusRepository;

@RestController
public class RouteStatusController {

    @Autowired // genarate instance
    private RouteStatusRepository routeStatusRepository;

    // Request mapping for load employeestatus all data (url
    // -->//employeestatus/alldata)
    @GetMapping(value = "/routestatus/alldata", produces = "application/json")
    public List<RouteStatus> findAllData() {
        return routeStatusRepository.findAll();
    }
}
