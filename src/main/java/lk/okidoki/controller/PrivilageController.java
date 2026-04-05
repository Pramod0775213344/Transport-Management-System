package lk.okidoki.controller;

import lk.okidoki.modal.User;
import lk.okidoki.repository.UserRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import lk.okidoki.modal.Privilage;
import lk.okidoki.repository.PrivilageRepository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;

// servalet container implement karapu service update karaganna thamai @RestCntroller anotation eka use karanne
@RestController
public class PrivilageController {

    @Autowired
    PrivilageRepository privilageRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    @Autowired
    private UserRepository userRepository;

    // Request mapping for load privilage Ui (url -->/privilage)
    @RequestMapping("/privilage")
    public ModelAndView getPrivilage() {

        // log wechcha kena balaganna authentication object thiyaganna oni
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView privilgeUi = new ModelAndView();
        privilgeUi.setViewName("privilage.html");
        privilgeUi.addObject("logedusername", auth.getName());
        privilgeUi.addObject("loggeduserphoto", logeduser.getUser_photo());
        privilgeUi.addObject("logeduseremail", logeduser.getEmail());
        privilgeUi.addObject("logeduserfullname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
        privilgeUi.addObject("logeduserCallingname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname() : null);
        privilgeUi.addObject("logeduserDesignation",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getDesignation_id().getName() : null);
        privilgeUi.addObject("pageTitle", "Privilage");
        return privilgeUi;
    }

    // Get mapping for get all privilage data from database(url
    // -->/privilage/alldata)
    @GetMapping(value = "/privilage/alldata", produces = "application/json")
    public List<Privilage> getPrivilageAllData() {

        // log wechcha kena balaganna authentication object thiyaganna oni
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Access Control");

        if (userPrivilage.getPrivi_select()) {
            return privilageRepository.findAll(Sort.by(Direction.DESC, "id"));
        } else {

            return new ArrayList<>();
        }

    }

    // requset mapping for insert data in to the table(url -->/privilage/insert)
    @PostMapping("/privilage/insert")
    public String savePrivilageData(@RequestBody Privilage privilage) {
        // check authentication and authorization

        // log wechcha kena balaganna authentication object thiyaganna oni
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Access Control");

        if (userPrivilage.getPrivi_insert()) {
            // duplicate check
            Privilage extPrivilage = privilageRepository.getPrivilageByRoleModule(privilage.getRole_id().getId(),
                    privilage.getModule_id().getId());

            if (extPrivilage != null) {
                return "Save not completed : User access already Existing...!";
            }

            try {

                privilageRepository.save(privilage);

                // front end eke respinse eka return karanawa
                return "ok";
            } catch (Exception e) {
                return "Save not Completed" + e.getMessage();
            }
        } else {

            return "Save Not Successed : You have not access";
        }

    }

    // requset mapping for update data from the table(url -->/privilage/update)
    @PutMapping("/privilage/update")
    public String updatePrivilageData(@RequestBody Privilage privilage) {
        // check authentication and authorization

        // log wechcha kena balaganna authentication object thiyaganna oni
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Access Control");

        if (userPrivilage.getPrivi_update()) {
            // duplicate check
            // existing check
            Privilage extPrivilage = privilageRepository.getPrivilageByRoleModule(privilage.getRole_id().getId(),
                    privilage.getModule_id().getId());

            if (extPrivilage != null && extPrivilage.getId() != privilage.getId()) {
                return "Upadte not completed : User access already Existing...!";
            }

            try {

                privilageRepository.save(privilage);

                // front end eke respinse eka return karanawa
                return "ok";
            } catch (Exception e) {
                return "Update not Completed" + e.getMessage();
            }
        } else {

            return "Update not successed : You have not access";
        }

    }

    // requset mapping for delete data from the table(url -->/privilage/delete)
    @DeleteMapping("/privilage/delete")
    public String deletePrivilageData(@RequestBody Privilage privilage) {
        // check authentication and authorizattion

        // log wechcha kena balaganna authentication object thiyaganna oni
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Access Control");

        if (userPrivilage.getPrivi_delete()) {
            // check
            try {

                privilage.setPrivi_select(false);
                privilage.setPrivi_insert(false);
                privilage.setPrivi_update(false);
                privilage.setPrivi_delete(false);

                privilageRepository.save(privilage);
                // front end eke respinse eka return karanawa

                return "ok";

            } catch (Exception e) {
                return "Delete Not Complted" + e.getMessage();
            }
        } else {

            return "Delete not succeed : You have not access";
        }

    }

    // request mapping for get privilage by role id(url -->/privilage/byrole)
    @GetMapping(value = "/privilage/byrole", params = { "roleid" }, produces = "application/json")
    public List<Privilage> getPrivilageByRole(@RequestParam("roleid") Integer roleid) {
        // check authentication and authorization

        // log wechcha kena balaganna authentication object thiyaganna oni
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Access Control");

        if (userPrivilage.getPrivi_select()) {
            return privilageRepository.getPrivilageByRole(roleid);
        } else {

            return new ArrayList<>();
        }

    }

    // request mapping for save all privilage data(url -->/privilage/saveall)
    @PostMapping("/privilage/saveall")
    public String saveAllPrivilageData(@RequestBody List<Privilage> privilageList) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Access Control");

        if (userPrivilage.getPrivi_insert() && userPrivilage.getPrivi_update()) {
            try {
                for (Privilage privilage : privilageList) {
                    privilageRepository.save(privilage);
                }
                return "ok";
            } catch (Exception e) {
                return "Bulk Save not Completed: " + e.getMessage();
            }
        } else {
            return "Bulk Save Not Successed: You have not permission";
        }
    }

}
