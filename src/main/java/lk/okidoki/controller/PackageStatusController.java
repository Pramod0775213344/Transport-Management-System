package lk.okidoki.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lk.okidoki.modal.PackageStatus;
import lk.okidoki.repository.PackageStatusRepository;

@RestController
public class PackageStatusController {

     @Autowired // genarate instance
    private PackageStatusRepository packageStatusRepository;

    // Request mapping for load employeestatus all data (url
    // -->//employeestatus/alldata)
    @GetMapping(value = "/packagestatus/alldata", produces = "application/json")
    public List<PackageStatus> findAllData() {
        return packageStatusRepository.findAll();
    }
}
