package lk.okidoki.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import lk.okidoki.modal.Privilage;
import lk.okidoki.repository.PrivilageRepository;

@Controller
public class UserPrivilageController {

    @Autowired
    private PrivilageRepository privilageRepository;

    // create function for get privilage by given username and module name
    public Privilage getUserPrivilageByUserModule(String username, String modulename){

        Privilage userPrivilage = new Privilage();
        if (username.equals("Admin")) {
            
            String userPrivString = privilageRepository.getUserPrivilageByUserAndModule(username,modulename);
            String[] userPrivilageArray = userPrivString.split(",");
            System.out.println(userPrivilageArray);

            userPrivilage.setPrivi_select(true);
            userPrivilage.setPrivi_insert(true);
            userPrivilage.setPrivi_update(true);
            userPrivilage.setPrivi_delete(true);
        } else {
            
            String userPrivString = privilageRepository.getUserPrivilageByUserAndModule(username,modulename);
            String[] userPrivilageArray = userPrivString.split(",");
            System.out.println(userPrivilageArray);

            userPrivilage.setPrivi_select(userPrivilageArray[0].equals("1"));
            userPrivilage.setPrivi_insert(userPrivilageArray[1].equals("1"));
            userPrivilage.setPrivi_update(userPrivilageArray[2].equals("1"));
            userPrivilage.setPrivi_delete(userPrivilageArray[3].equals("1"));
        }

        return userPrivilage;

    }

}
