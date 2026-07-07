package lk.okidoki.controller;

import lk.okidoki.modal.*;
import lk.okidoki.repository.UserRepository;
import lk.okidoki.repository.VehicleGroupRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Slf4j
@RestController
public class VehicleGroupController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    @Autowired
    private VehicleGroupRepository vehicleGroupRepository;


    // get mapping for get booking ui(url --->/booking)
    @GetMapping(value = "/vehiclegroup")
    public ModelAndView loadVehicleGroupUi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView vehicleGroupUI = new ModelAndView();
        vehicleGroupUI.setViewName("vehicleGroup.html");
        vehicleGroupUI.addObject("logedusername", auth.getName());
        vehicleGroupUI.addObject("loggeduserphoto", logeduser.getUser_photo());
        vehicleGroupUI.addObject("pageTitle", "Vehicle Groups");
        return vehicleGroupUI;

    }

    // get mapping for get all Vehicle Group (url -->/vehiclegroup/alldata)
    @RequestMapping(value = "/vehiclegroup/alldata")
    public List<VehicleGroup> getAllVehicleGroup() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "VehicleGroup");

        if (userPrivilage.getPrivi_select()) {
            return vehicleGroupRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        }else {
            return new ArrayList<>();
        }

    }

    // get mapping  for Group insert into database(url -->/vehiclegroup/insert)
    @PostMapping(value = "/vehiclegroup/insert")
    public String insertVehicleGroup(@RequestBody VehicleGroup vehicleGroup) {
        // checek authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Booking");
        User logeduser = userRepository.getByUsername(auth.getName());

        // check existing
        if (userPrivilage.getPrivi_insert()) {
            try {

                // auto updated date and time
                vehicleGroup.setAdded_datetime(LocalDateTime.now());
                vehicleGroup.setAdded_user_id(logeduser.getId());

                // save operator
                vehicleGroupRepository.save(vehicleGroup);

                // return ok
                return "ok";
            } catch (Exception e) {
                return "Save Not Completed :" + e.getMessage();
            }
        } else {

            return "Save Not Successed : You have not access";
        }


    }

    // get mapping  for Group insert into database(url -->/vehiclegroup/insert)
    @PutMapping(value = "/vehiclegroup/addvehicle")
    public String addVehicleToGroup(@RequestBody VehicleGroup vehicleGroup) {
        System.out.println("Add Vehicle to Group : " + vehicleGroup);
        // checek authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "VehicleGroup");
        User logeduser = userRepository.getByUsername(auth.getName());

        // check existing
        if (userPrivilage.getPrivi_insert()) {
            if (vehicleGroup.getId() == null) {
                return "Add Not Success: Vehicle Group not found";
            }

            VehicleGroup extVehicleGroup = vehicleGroupRepository.getReferenceById(vehicleGroup.getId());
            if (extVehicleGroup == null) {
                return "Add Not Success: Vehicle Group not found";
            }
                try {

                    // save operator
                    vehicleGroupRepository.save(extVehicleGroup);

//                    // add vehicle to group
                    if (extVehicleGroup.getVehicles() == null) {

                        extVehicleGroup.setVehicles(new HashSet<>());
                    }
                    if (vehicleGroup.getVehicles() != null) {

                        for (Vehicle vehicle : vehicleGroup.getVehicles()) {
                            extVehicleGroup.getVehicles().add(vehicle);
                        }
                    }
                    // save operator
                    vehicleGroupRepository.save(extVehicleGroup);


                    // return ok
                    return "ok";
                } catch (Exception e) {
                    return "Save Not Completed :" + e.getMessage();
                }

        } else {

            return "Save Not Successed : You have not access";
        }


    }
}
