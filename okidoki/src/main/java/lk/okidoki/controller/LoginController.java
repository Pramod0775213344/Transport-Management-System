package lk.okidoki.controller;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import lk.okidoki.modal.ChangedUser;
import lk.okidoki.modal.Module;
import lk.okidoki.modal.Privilage;
import lk.okidoki.repository.EmployeeRepository;
import lk.okidoki.repository.ModuleRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import lk.okidoki.modal.Role;
import lk.okidoki.modal.User;
import lk.okidoki.repository.RoleRepository;
import lk.okidoki.repository.UserRepository;


//@Slf4j
@RestController
public class LoginController {


    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    private ModuleRepository moduleRepository;
    @Autowired
    private EmployeeRepository employeeRepository;

    // get login ui (url -->/login)
    @RequestMapping(value = "/login")
    public ModelAndView getLoginUi() {
        ModelAndView loginUi = new ModelAndView();
        loginUi.setViewName("login.html");
        return loginUi;
    }


    // get dashboard ui (url -->/dashboard)
    @RequestMapping(value = "/dashboard")
    public ModelAndView getDashboardUi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView dashboardUi = new ModelAndView();
        dashboardUi.setViewName("dashboard.html");
        dashboardUi.addObject("logedusername", auth.getName());
        dashboardUi.addObject("loggeduserphoto", logeduser.getUser_photo());
        dashboardUi.addObject("logeduseremail", logeduser.getEmail());
        dashboardUi.addObject("logeduserfullname", logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);

        dashboardUi.addObject("pageTitle", "Dashboard");
        return dashboardUi;

    }


    // Request mapping for load vehicledashboard ui (url -->/vehicledashboard)
    @RequestMapping(value = "/vehicledashboard")
    public ModelAndView getVehicleDashboardUi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView vehicleDashboardUi = new ModelAndView();
        vehicleDashboardUi.setViewName("vehicleDashboard.html");
        vehicleDashboardUi.addObject("logedusername", auth.getName());
        vehicleDashboardUi.addObject("loggeduserphoto", logeduser.getUser_photo());
        vehicleDashboardUi.addObject("pageTitle", "Fleet Dashboard");

        return vehicleDashboardUi;
    }


    // get errorpage ui(url -->/errorpage)
    @RequestMapping(value = "/errorpage")
    public ModelAndView getErrorPageUi() {

        ModelAndView errorpageUi = new ModelAndView();
        errorpageUi.setViewName("errorpage.html");
        return errorpageUi;
    }

    // admin creation
    @RequestMapping(value = "/createadmin")
    public ModelAndView generateAdminAccount() {

        User extAdminUser = userRepository.getByUsername("Admin");
        if (extAdminUser == null) {
            User adminUser = new User();
            adminUser.setUsername("Admin");
            adminUser.setEmail("admin@okidoki.com");
            adminUser.setStatus(true);
            adminUser.setAdded_datetime(LocalDateTime.now());
            adminUser.setPassword(bCryptPasswordEncoder.encode("12345"));

            Set<Role> roles = new HashSet<>();
            Role adminRole = roleRepository.getReferenceById(1);
            roles.add(adminRole);
            adminUser.setRoles(roles);

            userRepository.save(adminUser);

        }
        ModelAndView loginUi = new ModelAndView();
        loginUi.setViewName("login.html");
        return loginUi;
    }

    // Request mapping for load vehicledashboard ui (url -->/vehicledashboard)
    @RequestMapping(value = "/userprofile")
    public ModelAndView getUserProfileUi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView userProfileUi = new ModelAndView();
        userProfileUi.setViewName("changeUserProfile.html");
        userProfileUi.addObject("logedusername", auth.getName());
        userProfileUi.addObject("loggeduserphoto", logeduser.getUser_photo());
        return userProfileUi;
    }

    // get dashboard ui (url -->/dashboard)
    @RequestMapping(value = "/loggeduserdetails")
    public ChangedUser getChangeUserDeatils() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ChangedUser changedUser = new ChangedUser();
        changedUser.setUsername(logeduser.getUsername());
        changedUser.setOldusername(logeduser.getUsername());
        changedUser.setEmail(logeduser.getEmail());
        changedUser.setUser_photo(logeduser.getUser_photo());
        changedUser.setEmployee_id(logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getId() : null);
        return changedUser;
    }

    // insert change user details ui (url -->/dashboard)
    @PostMapping(value = "/changeuserdetails/insert")
    public String insertLogUserDetails(@RequestBody ChangedUser changedUser) {
        // check loged user authorization


        // chehck existing
        User extUser = userRepository.getByUsername(changedUser.getOldusername());
        if (extUser == null) {
            return "Change Not Success: User not found ";
        }
        //check duplicate username
        User extUserByUserName = userRepository.getByUsername(changedUser.getUsername());
        if (extUserByUserName != null && extUser.getId() != extUserByUserName.getId()) {
            return "Change Not Success: User Already found ";
        }
        try {

//                change user ta old password ekak thiyenwd kiyala balanawa
            if (changedUser.getOldpassword() != null) {
                // check old password and password samana nam true return wenawa
                if (bCryptPasswordEncoder.matches(changedUser.getOldpassword(), extUser.getPassword())) {
//                        user ge kalin password ekai new password ekai samana nadda kiyala balanna oni
                    if (!bCryptPasswordEncoder.matches(changedUser.getNewpassword(), extUser.getPassword())) {
//                            kalin password ekai new password ekai samana nathnam set karanwa extuser object ekata
                        extUser.setPassword(bCryptPasswordEncoder.encode(changedUser.getNewpassword()));
                    }
                } else {
                    return "Change Not Success: Old Password is not correct";
                }
            }

            // user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
            extUser.setUsername(changedUser.getUsername());
            extUser.setEmail(changedUser.getEmail());
            extUser.setUser_photo(changedUser.getUser_photo());

            // save updated data
            userRepository.save(extUser);

            // return ok
            return "ok";

        } catch (Exception e) {

            return "change Not Completed :" + e.getMessage();

        }

    }

    //    load module with user
    @RequestMapping(value = "/modulewithoutuser")
    public List<Module> getModuleWithoutUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());
        return moduleRepository.getModuleIdByUserName(logeduser.getUsername());
    }

    //    load module with user
    @RequestMapping(value = "/moduleforuser")
    public List<Module> getModuleByUserName() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());
        return moduleRepository.getModuleByUserName(logeduser.getUsername());
    }


}

