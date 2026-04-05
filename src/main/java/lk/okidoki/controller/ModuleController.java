package lk.okidoki.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import lk.okidoki.modal.Module;
import lk.okidoki.repository.ModuleRepository;
import org.springframework.web.bind.annotation.GetMapping;


// servalet container implement karapu service update karaganna thamai @RestCntroller anotation eka use karanne
@RestController
public class ModuleController {

    @Autowired //auto generate instance
    private ModuleRepository moduleRepository;

    // Get mapping for get all module table data from the table (url -->module/alldata)
    @GetMapping(value = "/module/alldata",produces = "application/json")
    public List<Module> findAllData() {
        return moduleRepository.findAll();
    }
    
}
