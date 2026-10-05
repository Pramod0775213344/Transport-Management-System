package lk.okidoki.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import lk.okidoki.modal.Invoice;
import lk.okidoki.modal.Privilage;
import lk.okidoki.modal.User;
import lk.okidoki.modal.UserHasVehicleGroup;
import lk.okidoki.repository.UserHasVehicleGroupRepository;
import lk.okidoki.repository.UserRepository;

@RestController
public class VehicleGroupAccessController {

        @Autowired
        private UserPrivilageController userPrivilageController;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private UserHasVehicleGroupRepository userHasVehicleGroupRepository;

        // Request mapping for load vehicle Ui (url -->/vehicle)
        @RequestMapping(value = "/uservehiclegroup")
        public ModelAndView loadVehicleUI() {

                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                User logeduser = userRepository.getByUsername(auth.getName());
                // log wela inna userta Fleet Management module privilege eka gannawa
                Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                                "Vehicle Group Access Control");

                ModelAndView vehicelGroupAccessControlUI = new ModelAndView();
                vehicelGroupAccessControlUI.setViewName("vehicleGroupAccessControl.html");
                vehicelGroupAccessControlUI.addObject("logedusername", auth.getName());
                vehicelGroupAccessControlUI.addObject("loggeduserphoto", logeduser.getUser_photo());
                vehicelGroupAccessControlUI.addObject("logeduseremail", logeduser.getEmail());
                vehicelGroupAccessControlUI.addObject("logeduserfullname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
                vehicelGroupAccessControlUI.addObject("logeduserCallingname",
                                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname()
                                                : null);
                vehicelGroupAccessControlUI.addObject("logeduserDesignation",
                                logeduser.getEmployee_id() != null
                                                ? logeduser.getEmployee_id().getDesignation_id().getName()
                                                : null);
                // frontend ekata privilege object eka yawala button hide/show karaganna denna
                vehicelGroupAccessControlUI.addObject("userPrivilage", userPrivilage);

                vehicelGroupAccessControlUI.addObject("pageTitle", "Vehicle Group Access Control");
                return vehicelGroupAccessControlUI;
        }

        // GET USER BY USER ID
        // user id ekata adala vehicle group list eka ganna
        // user id ekata adala vehicle group list eka ganna (active association tika
        // witharak)
        @RequestMapping(value = "/vehiclegroup/getbyuserid", params = { "userid" }, produces = "application/json")
        public List<Integer> getByUserId(@RequestParam("userid") Integer userid) {
                return userHasVehicleGroupRepository.getVehicleGroupIdListByUserId(userid);
        }

        

        // post mapping for vehicle group insert karanawa userta adalawa
        // post mapping for vehicle group insert karanawa userta adalawa
        @PostMapping(value = "/uservehiclegroup/insert")
        public String saveUserVehicleGroup(@RequestBody UserHasVehicleGroup userhasVehicleGroup) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                                "Vehicle Group Access Control");
                User logeduser = userRepository.getByUsername(auth.getName());

                if (userPrivilage.getPrivi_insert()) {
                        try {
                                // status ekak baladdi nemei, association row ekak thiyenwada kiyala witharak
                                // check karanwa
                                UserHasVehicleGroup existingRecord = userHasVehicleGroupRepository
                                                .findByUserIdAndVehicleGroupId(userhasVehicleGroup.getUser_id(),
                                                                userhasVehicleGroup.getVehicle_group_id());

                                if (existingRecord != null) {
                                        if (existingRecord.getStatus()) {
                                                // ehema newei, dan active association ekak thiyenawa
                                                return "Save Not Complete : This vehicle group is already assigned to the user";
                                        }
                                        // idiriyedi remove karapu row ekma reactivate karanwa (aluth row ekak hadanne
                                        // na)
                                        existingRecord.setStatus(true);
                                        existingRecord.setAdded_user_id(logeduser.getId());
                                        existingRecord.setAdded_datetime(LocalDateTime.now());
                                        userHasVehicleGroupRepository.save(existingRecord);
                                        return "ok";
                                }

                                // record ekak nathi nam aluthin hadanwa
                                userhasVehicleGroup.setStatus(true);
                                userhasVehicleGroup.setAdded_user_id(logeduser.getId());
                                userhasVehicleGroup.setAdded_datetime(LocalDateTime.now());
                                userHasVehicleGroupRepository.save(userhasVehicleGroup);

                                return "ok";
                        } catch (Exception e) {
                                return "Save Not Complete : " + e.getMessage();
                        }
                } else {
                        return "Save Not Successed : You have not access";
                }
        }

        // put mapping for vehicle group access eka update karanawa userta adalawa
        // put mapping for vehicle group access eka remove karanawa (status false
        // karanwa)
        @PutMapping(value = "/uservehiclegroup/update")
        public String updateUserVehicleGroup(@RequestBody UserHasVehicleGroup userhasVehicleGroup) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                                "Vehicle Group Access Control");

                if (userPrivilage.getPrivi_update()) {
                        try {
                                UserHasVehicleGroup existingRecord = userHasVehicleGroupRepository
                                                .findByUserIdAndVehicleGroupId(userhasVehicleGroup.getUser_id(),
                                                                userhasVehicleGroup.getVehicle_group_id());

                                if (existingRecord == null) {
                                        return "Update Not Complete : Association record not found";
                                }

                                existingRecord.setStatus(userhasVehicleGroup.getStatus());
                                userHasVehicleGroupRepository.save(existingRecord);

                                return "ok";
                        } catch (Exception e) {
                                return "Update Not Complete : " + e.getMessage();
                        }
                } else {
                        return "Update Not Successed : You have not access";
                }
        }
}
