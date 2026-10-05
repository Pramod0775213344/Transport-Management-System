package lk.okidoki.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import lk.okidoki.modal.Profile;
import lk.okidoki.modal.User;
import lk.okidoki.repository.ProfileRepository;
import lk.okidoki.repository.UserRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

// servalet container implement karapu service update karaganna thamai @RestCntroller anotation eka use karanne
@RestController
public class ProfileController {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    @RequestMapping(value = "/profile")
    public ModelAndView loadProfileUI() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView profileUI = new ModelAndView();
        profileUI.setViewName("profile.html");
        profileUI.addObject("logedusername", auth.getName());
        profileUI.addObject("loggeduserphoto", logeduser.getUser_photo());
        profileUI.addObject("logeduseremail", logeduser.getEmail());
        profileUI.addObject("logeduserfullname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
        profileUI.addObject("logeduserCallingname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname() : null);
        profileUI.addObject("logeduserDesignation",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getDesignation_id().getName() : null);
        profileUI.addObject("pageTitle", "Profile");

        return profileUI;
    }

    // get profile detaisl using useid
    @RequestMapping(value = "/profile/buyuser", params = "userid", produces = "application/json")
    public Profile getLoggedUserDetails(@RequestParam("userid") Integer userid) {
        return profileRepository.getByUserId(userid);

    }

    // Load profile creation form
    @RequestMapping(value = "/profile/create")
    public ModelAndView loadProfileCreateUI() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView profileCreateUI = new ModelAndView();
        profileCreateUI.setViewName("profileCreate.html");
        profileCreateUI.addObject("logedusername", auth.getName());
        profileCreateUI.addObject("logeduseremail", logeduser.getEmail());
        profileCreateUI.addObject("logeduserid", logeduser.getId());

        return profileCreateUI;
    }

    // profile ekka create karana api eka
    @PostMapping("/profile/create")
    public String createProfile(@RequestBody Profile profile) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User logeduser = userRepository.getByUsername(auth.getName());

            if (logeduser == null) {
                return "Error: User not found";
            }

            profile.setUser_id(logeduser);
            profileRepository.save(profile);

            return "ok";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    // profile update api eka
    @PutMapping("/profile/update")
    public String updateProfile(@RequestBody Profile profile) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        if (logeduser == null) {
            return "Error: User not found";
        }
        try {

            profile.setUser_id(logeduser);
            profileRepository.save(profile);

            logeduser.setUser_photo(profile.getProfile_photo());
            userRepository.save(logeduser);
            
            return "ok";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

}
