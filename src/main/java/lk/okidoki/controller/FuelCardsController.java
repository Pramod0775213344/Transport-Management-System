package lk.okidoki.controller;

import lk.okidoki.modal.*;
import lk.okidoki.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.time.LocalDateTime;
import java.util.List;

@RestController
public class FuelCardsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired // genarate instance
    private FuelCardsRepository fuelCardsRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    @Autowired
    private FuelCardsStatusRepository fuelCardsStatusRepository;

    @Autowired
    private FuelRequestRepository fuelRequestRepository;

    @Autowired
    private FuelRequestStatusRepository fuelRequestStatusRepository;

    @Autowired
    private SupplierAgreementRepository supplierAgreementRepository;

    // get mapping for get booking ui(url --->/fuelrequest)
    @GetMapping(value = "/fuelscards")
    public ModelAndView loadFuelCardsUi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView fuelCardsUi = new ModelAndView();
        fuelCardsUi.setViewName("fuelCards.html");
        fuelCardsUi.addObject("logedusername", auth.getName());
        fuelCardsUi.addObject("loggeduserphoto", logeduser.getUser_photo());
        fuelCardsUi.addObject("logeduseremail", logeduser.getEmail());
        fuelCardsUi.addObject("logeduserfullname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
        fuelCardsUi.addObject("logeduserCallingname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname() : null);
        fuelCardsUi.addObject("logeduserDesignation",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getDesignation_id().getName() : null);
        fuelCardsUi.addObject("pageTitle", "Fuel Cards");
        return fuelCardsUi;

    }

    // Request mapping for load fuelcards all data (url
    // -->//fuelscards/alldata)
    @GetMapping(value = "/fuelscards/alldata", produces = "application/json")
    public List<FuelCards> findAllData() {
        return fuelCardsRepository.findAll();
    }

    // Requset post mapping for insert data in to the Fuel table(url
    // -->/fuelscards/insert)
    @PostMapping(value = "/fuelscards/insert")
    public String saveFuelCardData(@RequestBody FuelCards fuelCards) {

        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Fuel Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_insert()) {

            // ekama vehicle ekata fuel card dekak thiyenna ba
            FuelCards existVehicle = fuelCardsRepository.getFuelCardsByVehicelId((fuelCards.getVehicle_id()));
            if (existVehicle != null) {
                return "This Vehicle Already have a fuel card";
            }

            // supplier agreement ekak nathi wahanekata card eka apply karanna bari wenna
            // oni
            SupplierAgreement activeAgreement = supplierAgreementRepository
                    .findActiveAgreementByVehicle(fuelCards.getVehicle_id());
            if (activeAgreement == null) {
                return "This vehicle does not have an Active Supplier Agreement. Please activate it first.";
            }

            try {
                // for the first catrs
                // fuelCards.setFuel_cards_no("FC-25-000001");
                fuelCards.setAdded_datetime(LocalDateTime.now());
                fuelCards.setAdded_user_id(logeduser.getId());
                fuelCards.setFuel_card_status_id(fuelCardsStatusRepository.getReferenceById(3));

                fuelCardsRepository.save(fuelCards);

                return "ok";
            } catch (Exception e) {
                return "Save Not Completed :" + e.getMessage();
            }
        } else {

            return "Save Not Successed : You have not access";
        }
    }

    // Requset Put mapping for update fuel card status eka active karanawa (url
    // -->/fuelscards/update)
    @PutMapping(value = "/fuelscards/updatestatusactive")
    public String activeFuelCardData(@RequestBody FuelCards fuelCards) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Fuel Management");
        User logedUser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_update()) {
            // check ext
            if (fuelCards.getId() == null) {
                return "Update Not Success: Fuel Card not found";
            }

            FuelCards extFuelCardId = fuelCardsRepository.getReferenceById(fuelCards.getId());
            if (extFuelCardId == null) {
                return "Update Not Success: Fuel card not exists not Exist";
            }

            try {

                fuelCards.setFuel_card_status_id(fuelCardsStatusRepository.getReferenceById(3)); // set active status
                fuelCardsRepository.save(fuelCards);

                return "ok";

            } catch (Exception e) {

                return "Update Not Completed :" + e.getMessage();
            }
        } else {

            return "Update Not Successed : You have not access";
        }

    }

    // Requset Put mapping for update fuel card status eka inactive karanawa (url
    // -->/fuelscards/update)
    @PutMapping(value = "/fuelscards/updatestatusinactive")
    public String inactiveFuelCard(@RequestBody FuelCards fuelCards) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Fuel Management");
        User logedUser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_update()) {
            // check ext
            if (fuelCards.getId() == null) {
                return "Inactivate Not Success: Fuel Card not found";
            }

            FuelCards extFuelCardId = fuelCardsRepository.getReferenceById(fuelCards.getId());
            if (extFuelCardId == null) {
                return "Inactivate Not Success: Fuel card not exists not Exist";
            }
            // pending fuel request thiyneawa nam me card ekata card eka active karanna bari
            // wenna oni
            List<FuelRequest> pendingFuelRequest = fuelRequestRepository.findByFuelCardAndFuelRequestStatus(fuelCards);
            if (!pendingFuelRequest.isEmpty()) {
                return "Can't inactive this Fuel Card.Because Already Exist pending Fuel Request";
            }

            try {

                fuelCards.setFuel_card_status_id(fuelCardsStatusRepository.getReferenceById(4)); // set inactive status
                fuelCardsRepository.save(fuelCards);

                return "ok";

            } catch (Exception e) {

                return "Update Not Completed :" + e.getMessage();
            }
        } else {

            return "Update Not Successed : You have not access";
        }

    }

    // fuel card eka gnnnwa select karana vehicle id eka anuwa
    // url -->/fuelscards/byvehicle?vehicleId=1
    @GetMapping(value = "/fuelscards/byvehicle", params = { "vehicleId" }, produces = "application/json")
    public FuelCards findActiveFuelCardsByVehicleId(@RequestParam("vehicleId") Integer vehicleId) {
        return fuelCardsRepository.findActiveFuelCardsByVehicleId(vehicleId);
    }

    // selected details object ekak gnnawa select karana vehicle ekata adlawa
    // url -->/fuelscards/summary?vehicleId=1
    @GetMapping(value = "/fuelscards/summary", params = { "vehicleId" }, produces = "application/json")
    public Object[] getFuelCardSummary(@RequestParam("vehicleId") Integer vehicleId) {
        return fuelCardsRepository.getFuelCardSummary(vehicleId);
    }

}
