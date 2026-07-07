package lk.okidoki.controller;

import lk.okidoki.modal.VehicleInspectionStatus;
import lk.okidoki.modal.Privilage;
import lk.okidoki.modal.User;
import lk.okidoki.modal.VehicleInspection;
import lk.okidoki.repository.VehicleInspectionStatusRepository;
import lk.okidoki.repository.UserRepository;
import lk.okidoki.repository.VehicleInspectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
public class VehicleInspectionController {

    @Autowired
    private VehicleInspectionRepository vehicleInspectionRepository;

    @Autowired
    private VehicleInspectionStatusRepository inspectionStatusRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    @RequestMapping(value = "/vehicleinspection")
    public ModelAndView loadInspectionUI() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Vehicle Inspection");

        ModelAndView inspectionUI = new ModelAndView();
        inspectionUI.setViewName("vehicle_inspection.html");
        inspectionUI.addObject("logedusername", auth.getName());
        inspectionUI.addObject("loggeduserphoto", logeduser.getUser_photo());
        inspectionUI.addObject("logeduseremail", logeduser.getEmail());
        inspectionUI.addObject("logeduserfullname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
        inspectionUI.addObject("logeduserCallingname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname() : null);
        inspectionUI.addObject("logeduserDesignation",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getDesignation_id().getName() : null);
        inspectionUI.addObject("userPrivilage", userPrivilage);
        inspectionUI.addObject("pageTitle", "Vehicle Inspection");
        return inspectionUI;
    }

    @GetMapping(value = "/vehicleinspection/alldata", produces = "application/json")
    public List<VehicleInspection> getAllInspectionData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Vehicle Inspection");
        if (userPrivilage != null && userPrivilage.getPrivi_select()) {
            return vehicleInspectionRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        } else {
            return new ArrayList<>();
        }
    }

    @PostMapping(value = "/vehicleinspection/insert")
    public String saveInspection(@RequestBody VehicleInspection inspection) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Vehicle Inspection Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage != null && userPrivilage.getPrivi_insert()) {
            try {
                inspection.setAdded_datetime(LocalDateTime.now());
                inspection.setAdded_user_id(logeduser.getId());
                vehicleInspectionRepository.save(inspection);
                return "ok";
            } catch (Exception e) {
                return "Save not completed: " + e.getMessage();
            }
        } else {
            return "Save Not Successed: You have no access";
        }
    }

    @DeleteMapping(value = "/vehicleinspection/delete")
    public String deleteInspection(@RequestBody VehicleInspection inspection) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Vehicle Inspection Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage != null && userPrivilage.getPrivi_delete()) {
            VehicleInspection extInspection = vehicleInspectionRepository.getReferenceById(inspection.getId());
            if (extInspection != null) {
                try {
                    extInspection.setDeleted_datetime(LocalDateTime.now());
                    extInspection.setDeleted_user_id(logeduser.getId());
                    vehicleInspectionRepository.save(extInspection);
                    return "ok";
                } catch (Exception e) {
                    return "Delete not completed: " + e.getMessage();
                }
            } else {
                return "Inspection record not found";
            }
        } else {
            return "Delete Not Successed: You have no access";
        }
    }
}
