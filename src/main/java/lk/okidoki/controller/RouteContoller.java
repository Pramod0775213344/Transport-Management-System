package lk.okidoki.controller;

import java.time.LocalDateTime;
import java.util.List;

import lk.okidoki.modal.Booking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import lk.okidoki.modal.Privilage;
import lk.okidoki.modal.Route;
import lk.okidoki.modal.User;
import lk.okidoki.repository.RouteRepository;
import lk.okidoki.repository.RouteStatusRepository;
import lk.okidoki.repository.UserRepository;

@RestController
public class RouteContoller {

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    @Autowired
    private RouteStatusRepository routeStatusRepository;

    // get mapping for get booking ui(url --->/booking)
    @GetMapping(value = "/route")
    public ModelAndView loadRouteUi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView routeUI = new ModelAndView();
        routeUI.setViewName("route.html");
        routeUI.addObject("logedusername", auth.getName());
        routeUI.addObject("loggeduserphoto", logeduser.getUser_photo());
        routeUI.addObject("logeduseremail", logeduser.getEmail());
        routeUI.addObject("logeduserfullname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
        routeUI.addObject("logeduserCallingname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname() : null);
        routeUI.addObject("logeduserDesignation",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getDesignation_id().getName() : null);
        routeUI.addObject("pageTitle", "Route");
        return routeUI;

    }

    // get all route tika gannaw adatabase eken
    @GetMapping(value = "/route/alldata", produces = "application/json")
    public List<Route> findAllData() {
        return routeRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    // cusomerta ta adala route tika gannawa(url -->/route/bycutomerid?customerid=2)
    @GetMapping(value = "/route/bycutomerid", params = { "customerid" }, produces = "application/json")
    public List<Route> getMethodName(@RequestParam("customerid") Integer customerid) {

        return routeRepository.getRouteByCustomer(customerid);
    }

    // route add karanawa(url -->/route/insert)
    @PostMapping(value = "/route/insert")
    public String saveRoute(@RequestBody Route route) {

        // checek authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Location Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        // existing check karanna oni
        if (userPrivilage.getPrivi_insert()) {

            try {

                route.setAdded_datetime(LocalDateTime.now());
                route.setAdded_user_id(logeduser.getId());
                route.setRoute_status_id(routeStatusRepository.getReferenceById(1));

                routeRepository.save(route);

                return "ok";

            } catch (Exception e) {
                return "Save Not Completed :" + e.getMessage();
            }

        } else {
            return "Save Not Successed : You have not access";
        }

    }

    // put mapping for route update(url -->/route/update)
    @PutMapping(value = "/route/update")
    public String updateRoute(@RequestBody Route route) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Location Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_update()) {
            // check ext
            if (route.getId() == null) {
                return "Update Not Success: Route not found";
            }

            Route extRouteId = routeRepository.getReferenceById(route.getId());
            if (extRouteId == null) {
                return "Update Not Success: Route not Exist";
            }
            // save auto added data
            try {
                route.setUpdated_datetime(LocalDateTime.now());
                route.setUpdated_user_id(logeduser.getId());

                routeRepository.save(route);

                return "ok";
            } catch (Exception e) {
                return "Update Not Completed :" + e.getMessage();
            }
        } else {

            return "Save Not Successed : You have not access";
        }
    }

    // delete mapping for route delete into table(url -->/route/delete)
    @DeleteMapping(value = "/route/delete")
    public String deleteRoute(@RequestBody Route route) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Location Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        // check existing
        if (userPrivilage.getPrivi_delete()) {
            if (route.getId() == null) {
                return "Delete Not Success: Customer not found";
            }
            Route extRouteId = routeRepository.getReferenceById(route.getId());
            if (extRouteId == null) {
                return "Delete Not Success: Customer not Exist";
            }

            try {
                // set auto added data
                route.setDeleted_datetime(LocalDateTime.now());
                route.setDeleted_user_id(logeduser.getId());
                route.setRoute_status_id(routeStatusRepository.getReferenceById(2));

                // save operator
                routeRepository.save(route);

                // return msg
                return "ok";
            } catch (Exception e) {
                return "Delete Not Completed :" + e.getMessage();
            }
        } else {

            return "Save Not Successed : You have not access";
        }

    }

}
