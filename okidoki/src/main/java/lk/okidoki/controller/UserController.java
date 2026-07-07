package lk.okidoki.controller;

import lk.okidoki.modal.Employee;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import lk.okidoki.modal.Privilage;
import lk.okidoki.modal.User;
import lk.okidoki.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

// servelet container implement karapu service update wenna restcontroller aniwaren use karanna oni
@RestController
public class UserController {

  @Autowired // auto generate instance
  private UserRepository userRepository;

  @Autowired// auto generate instance
  private BCryptPasswordEncoder bCryptPasswordEncoder;

  @Autowired// auto generate instance
  private UserPrivilageController userPrivilageController;

  // Request mapping for load user Ui (url -->/user)
  @RequestMapping("/user")
  public ModelAndView getUserUi() {

    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    User logeduser = userRepository.getByUsername(auth.getName());

    ModelAndView userUi = new ModelAndView();
    userUi.setViewName("user.html");
    userUi.addObject("logedusername", auth.getName());
    userUi.addObject("loggeduserphoto", logeduser.getUser_photo());
    userUi.addObject("pageTitle", "User");
    return userUi;
  }

  // Request mapping for get all user data (url -->/user/alldata)
  @GetMapping(value = "/user/alldata", produces = "application/json")
  public List<User> findAllUserData() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "User");
    if (userPrivilage.getPrivi_select()) {
      // Last added data eke Mulata ganna oni nisa thama find all eke sort attributr
      // eka use karanne
      return userRepository.findAll(auth.getName());
    } else {
      return new ArrayList<>();
    }

  }

  // Requset post mapping for insert data in to the user table(url
  // -->/user/insert)
  @PostMapping(value = "/user/insert")
  public String saveUserData(@RequestBody User user) {
    // check loged user authorization
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "User");

    if (userPrivilage.getPrivi_insert()) {

      // dupplicate check

      // email eken duplicate check karanna

      try {

        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        user.setAdded_datetime(LocalDateTime.now());

        System.out.println(user);
        userRepository.save(user);
        return "ok";

      } catch (Exception e) {

        return "Submit Not Completed :" + e.getMessage();

      }

    } else {

      return "Save Not Successed : You have not access";
    }

  }

  // Requset post mapping for insert data in to the user table(url
  // -->/user/insert)
  @PutMapping(value = "/user/update")
  public String updateUserData(@RequestBody User user) {
    // check loged user authorization
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "User");

    if (userPrivilage.getPrivi_update()) {

      // chehck existing
      User extUser = userRepository.getReferenceById(user.getId());
      if (extUser == null) {
        return "Update Not Success: User not found ";
      }

      try {

        // user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        user.setUpdated_datetime(LocalDateTime.now());

        // save updated data
        userRepository.save(user);

        // return ok
        return "ok";

      } catch (Exception e) {

        return "Update Not Completed :" + e.getMessage();

      }

    } else {

      return "Update Not Successed : You have not access";
    }

  }

  // Requset delete mapping for delete employee from the table(url
  // -->/employee/delete)
  @DeleteMapping(value = "user/delete")
  public String DeleteUserData(@RequestBody User user) {
    // check loged user authorization
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "User");

    if (userPrivilage.getPrivi_delete()) {

      // chehck existing
      User extUser = userRepository.getReferenceById(user.getId());
      if (extUser == null) {
        return "Delete Not Success: User not found ";
      }

      try {
        extUser.setStatus(false);
        extUser.setDeleted_datetime(LocalDateTime.now());

        userRepository.save(extUser);
        return "ok";

      } catch (Exception e) {
        return "Delete Not Completed :" + e.getMessage();
      }

    } else {
      return "User delete not completed: You haven't permission.....!";
    }

  }

}
