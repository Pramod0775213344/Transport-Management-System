package lk.okidoki.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import lk.okidoki.modal.Role;
import lk.okidoki.repository.RoleRepository;
import org.springframework.web.bind.annotation.GetMapping;


// servalet container implement karapu service update karaganna thamai @RestCntroller anotation eka use karanne
@RestController
public class RoleController {

    @Autowired//auto generate instance
    private RoleRepository roleRepository;

    
    // Get mapping for get all role table data from the table (url -->role/alldata)
    @GetMapping(value = "/role/alldata",produces = "application/json")
    public List<Role> findAllData() {
        return roleRepository.findAll();
    }

      // Get mapping for get all role  data from the table without admin (url -->role/alldatawithoutadmin)
      @GetMapping(value = "/role/alldatawithoutadmin",produces = "application/json")
      public List<Role> findAllDataWthoytAdmin() {
          return roleRepository.getByRoleWithouAdmin();
      }
      
    
}
