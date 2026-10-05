package lk.okidoki.controller;

import lk.okidoki.modal.*;
import lk.okidoki.repository.UserHasVehicleGroupRepository;
import lk.okidoki.repository.UserRepository;
import lk.okidoki.repository.VehicleGroupHasVehicleRepository;
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
import java.util.Optional;

@Slf4j
@RestController
public class VehicleGroupController {

    @Autowired
    private UserHasVehicleGroupRepository userHasVehicleGroupRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    @Autowired
    private VehicleGroupRepository vehicleGroupRepository;

    @Autowired
    private VehicleGroupHasVehicleRepository vehicleGroupHasVehicleRepository;

    // get mapping for get booking ui(url --->/booking)
    @GetMapping(value = "/vehiclegroup")
    public ModelAndView loadVehicleGroupUi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Vehicle Group Management");

        ModelAndView vehicleGroupUI = new ModelAndView();
        vehicleGroupUI.setViewName("vehicleGroup.html");
        vehicleGroupUI.addObject("logedusername", auth.getName());
        vehicleGroupUI.addObject("loggeduserphoto", logeduser.getUser_photo());
        vehicleGroupUI.addObject("logeduseremail", logeduser.getEmail());
        vehicleGroupUI.addObject("logeduserfullname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
        vehicleGroupUI.addObject("logeduserCallingname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname() : null);
        vehicleGroupUI.addObject("logeduserDesignation",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getDesignation_id().getName() : null);
        vehicleGroupUI.addObject("userPrivilage", userPrivilage);
        vehicleGroupUI.addObject("pageTitle", "Vehicle Groups");
        return vehicleGroupUI;

    }

    // get mapping for get all Vehicle Group (url -->/vehiclegroup/alldata)
    @RequestMapping(value = "/vehiclegroup/alldata")
    public List<VehicleGroup> getAllVehicleGroup() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Vehicle Group Management");

        if (userPrivilage.getPrivi_select()) {
            return vehicleGroupRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        } else {
            return new ArrayList<>();
        }

    }

    // get mapping for Group insert into database(url -->/vehiclegroup/insert)
    @PostMapping(value = "/vehiclegroup/insert")
    public String insertVehicleGroup(@RequestBody VehicleGroup vehicleGroup) {
        // checek authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Vehicle Group Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        // check existing
        if (userPrivilage.getPrivi_insert()) {
            try {

                // auto updated date and time
                vehicleGroup.setAdded_datetime(LocalDateTime.now());
                vehicleGroup.setAdded_user_id(logeduser.getId());

                // save operator
                vehicleGroupRepository.save(vehicleGroup);

                // user has vehicle group table eka save karanna oni nisa
                if (vehicleGroup.getUser_id() != null) {
                    UserHasVehicleGroup userHasVehicleGroup = new UserHasVehicleGroup();
                    userHasVehicleGroup.setUser_id(vehicleGroup.getUser_id());
                    userHasVehicleGroup.setVehicle_group_id(vehicleGroup);
                    userHasVehicleGroup.setAdded_user_id(logeduser.getId());
                    userHasVehicleGroup.setAdded_datetime(LocalDateTime.now());
                    userHasVehicleGroup.setStatus(true);
                    userHasVehicleGroupRepository.save(userHasVehicleGroup);
                }

                // return ok
                return "ok";

            } catch (Exception e) {
                return "Save Not Completed :" + e.getMessage();
            }
        } else {

            return "Save Not Successed : You have not access";
        }

    }

    // get mapping for Group insert into database(url -->/vehiclegroup/insert)
    @PutMapping(value = "/vehiclegroup/addvehicle")
    public String addVehicleToGroup(@RequestBody VehicleGroupHasVehicles vehicelGroupHasVehicles) {

        // checek authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Vehicle Group Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        // check existing
        if (userPrivilage.getPrivi_update()) {

            // vehicel group eka thiyenawa balanwa
            if (vehicelGroupHasVehicles.getVehicle_group_id().getId() == null) {
                return "Add Not Success: Vehicle Group not found";
            }

            try {

                // vehcle eka adala assign ment eka gnnawa thiyena
                Optional<VehicleGroupHasVehicles> existingAssignement = vehicleGroupHasVehicleRepository
                        .findByVehicleId(vehicelGroupHasVehicles.getVehicle_id().getId());

                // aluthin add karan vehicle eka api group eka add karanne tempory ekak wdihata
                // nam
                if (Boolean.TRUE.equals(vehicelGroupHasVehicles.getIs_temporary())) {
                    // permanat vehicle ekak neme nam nathtan eka tempory widihata add karann ba
                    if (existingAssignement.isEmpty()) {
                        return "Add Not Success: Vehicle has no Permanent group to assign temporarily from";
                    }
                    // exsting thiyenawa nama eke group id eka wenas karanwa home group id wenas nokara
                    VehicleGroupHasVehicles existingAssignmentEntity = existingAssignement.get();
                    existingAssignmentEntity.setVehicle_group_id(vehicelGroupHasVehicles.getVehicle_group_id());
                    existingAssignmentEntity.setIs_temporary(true);
                    vehicleGroupHasVehicleRepository.save(existingAssignmentEntity);

                }else{
                    if (existingAssignement.isPresent()) {
                        return "Add Not Success: Vehicle already assigned to a group";
                    }else{
                        // alutthinma vehicle eka first time add karanwa nam eka permanat widihata add karanwa
                        vehicelGroupHasVehicles.setIs_temporary(false);
                        vehicelGroupHasVehicles.setHome_group_id(vehicelGroupHasVehicles.getVehicle_group_id());
                        vehicleGroupHasVehicleRepository.save(vehicelGroupHasVehicles);
                    }
                }
                return "ok";
            } catch (Exception e) {
                return "Save Not Completed :" + e.getMessage();
            }

        } else {

            return "Save Not Successed : You have not access";
        }

    }

    @GetMapping(value = "/vehiclegroup/vehiclecountbycustomer", params = {
            "customerId" }, produces = "application/json")
    public Integer getPendingBookingCountByCustomer(@RequestParam("customerId") Integer customerId) {
        return vehicleGroupRepository.getTotalFleetByCustomer(customerId);
    }

    // vehicle group ekata adala customer id eka ganna
    @GetMapping(value = "/vehiclegroup/customeridbyvehicle", params = {
            "vehicleId" }, produces = "application/json")
    public Integer getCustomerIdByVehicleId(@RequestParam("vehicleId") Integer vehicleId) {
        Optional<Integer> customerId = vehicleGroupHasVehicleRepository.findCustomerIdByVehicleId(vehicleId);
        return customerId.orElse(null);
    }
}
