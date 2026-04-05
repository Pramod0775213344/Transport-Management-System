package lk.okidoki.controller;

import lk.okidoki.modal.FuelPrice;
import lk.okidoki.modal.FuelType;
import lk.okidoki.modal.Privilage;
import lk.okidoki.modal.User;
import lk.okidoki.repository.FuelPriceRepository;
import lk.okidoki.repository.FuelTypeRepository;
import lk.okidoki.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
public class FuelPriceController {

    @Autowired
    private FuelPriceRepository fuelPriceRepository;

    @Autowired
    private FuelTypeRepository fuelTypeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    @RequestMapping(value = "/fuelprice")
    public ModelAndView loadFuelPriceUI() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView fuelpriceUI = new ModelAndView();
        fuelpriceUI.setViewName("fuel_price.html");
        fuelpriceUI.addObject("logedusername", auth.getName());
        fuelpriceUI.addObject("loggeduserphoto", logeduser.getUser_photo());
        fuelpriceUI.addObject("logeduseremail", logeduser.getEmail());
        fuelpriceUI.addObject("logeduserfullname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
        fuelpriceUI.addObject("logeduserCallingname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname() : null);
        fuelpriceUI.addObject("logeduserDesignation",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getDesignation_id().getName() : null);

        fuelpriceUI.addObject("pageTitle", "Fuel Price Management");
        return fuelpriceUI;
    }

    @GetMapping(value = "/fuelprice/alldata", produces = "application/json")
    public List<FuelPrice> getAllFuelPrices() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Fuel Price Management");
        if (userPrivilage != null && userPrivilage.getPrivi_select()) {
            return fuelPriceRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        } else {
            return new ArrayList<>();
        }
    }

    @PostMapping(value = "/fuelprice/insert")
    public String saveFuelPrice(@RequestBody FuelPrice fuelPrice) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Fuel Price Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage != null && userPrivilage.getPrivi_insert()) {
            try {
                // Find existing current price for this fuel type
                FuelPrice existingCurrent = fuelPriceRepository
                        .getCurrentPriceByFuelType(fuelPrice.getFuel_type_id().getId());

                if (existingCurrent != null) {
                    existingCurrent.setIs_current(false);
                    existingCurrent.setUpdated_user_id(logeduser.getId());
                    fuelPriceRepository.save(existingCurrent);
                }

                fuelPrice.setIs_current(true);
                fuelPrice.setEffective_date(LocalDateTime.now());
                fuelPrice.setUpdated_datetime(LocalDateTime.now());
                fuelPrice.setUpdated_user_id(logeduser.getId());

                fuelPriceRepository.save(fuelPrice);
                return "ok";
            } catch (Exception e) {
                return "Save not completed : " + e.getMessage();
            }
        } else {
            return "Save Not Successed : You have no access";
        }
    }

    // slecte karan wahane adal fuel type currunt fuel price eka ganna api eka
    @GetMapping(value = "/fuelprice/byvehicle", params = { "vehicleId" }, produces = "application/json")
    public BigDecimal getFuelPriceForRuelRequest(@RequestParam("vehicleId") Integer vehicleId) {
        return fuelPriceRepository.getFuelPriceForRuelRequest(vehicleId);
    }

    // vehicel ekata adala fuel object eka gnna api eka
    @GetMapping(value = "fuelprice/fuelobjectbyvehicle", params = { "vehicleId" })
    public FuelPrice getFuelPriceObjectForRuelRequest(@RequestParam("vehicleId") Integer vehicleId) {
        return fuelPriceRepository.getFuelPriceObjectForRuelRequest(vehicleId);
    }

}
