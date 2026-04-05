package lk.okidoki.controller;

import lk.okidoki.modal.*;
import lk.okidoki.repository.FuelCardsRepository;
import lk.okidoki.repository.FuelRequestRepository;
import lk.okidoki.repository.FuelRequestStatusRepository;
import lk.okidoki.repository.SupplierAdvanceRepository;
import lk.okidoki.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class FuelRequestController {

    @Autowired
    private UserRepository userRepository;

    @Autowired // genarate instance
    private FuelRequestRepository fuelRequestRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;

    @Autowired
    private FuelRequestStatusRepository fuelRequestStatusRepository;

    @Autowired
    private FuelCardsRepository fuelCardsRepository;

    @Autowired
    private SupplierAdvanceRepository supplierAdvanceRepository;

    // get mapping for get booking ui(url --->/fuelrequest)
    @GetMapping(value = "/fuelrequest")
    public ModelAndView loadFuelRequestUi() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView fuelRequestUI = new ModelAndView();
        fuelRequestUI.setViewName("fuelRequest.html");
        fuelRequestUI.addObject("logedusername", auth.getName());
        fuelRequestUI.addObject("loggeduserphoto", logeduser.getUser_photo());
        fuelRequestUI.addObject("logeduseremail", logeduser.getEmail());
        fuelRequestUI.addObject("logeduserfullname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
        fuelRequestUI.addObject("logeduserCallingname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname() : null);
        fuelRequestUI.addObject("logeduserDesignation",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getDesignation_id().getName() : null);
        fuelRequestUI.addObject("pageTitle", "Fuel Request");
        return fuelRequestUI;

    }

    // Request mapping for load fuelcards all data (url
    // -->//fuelscards/alldata)
    @GetMapping(value = "/fuelrequest/alldata", produces = "application/json")
    public List<FuelRequest> findAllData() {
        return fuelRequestRepository.findAll();
    }

    // post mapping for save fuel request data (url --->/fuelrequest/insert)
    @PostMapping(value = "/fuelrequest/insert")
    public String saveFuelRequestData(@RequestBody FuelRequest fuelRequest) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Fuel Management");

        // check existing
        if (userPrivilage.getPrivi_insert()) {
            // booking id eken balanwa e booking ekatama thawa ewa dalada thiyenw kiyala
            List<FuelRequest> extByBookingList = fuelRequestRepository.getByBooking(fuelRequest.getBooking_id());
            if (!extByBookingList.isEmpty()) {
                for (FuelRequest extByBooking : extByBookingList) {
                    Integer currentStatus = extByBooking.getFuel_request_status_id().getId();
                    // 4 = Pending, 5 = Approved, 6 = Rejected
                    // If any request is Pending (4) or Approved (5), don't allow a new one
                    if (currentStatus == 4 || currentStatus == 5) {
                        return "Save Not Success : Already has a Pending or Approved Fuel request for this Booking No";
                    }
                }
            }

            try {
                // set auto data
                fuelRequest.setAdded_datetime(LocalDateTime.now());
                fuelRequest.setAdded_user_id(logeduser.getId());
                fuelRequest.setFuel_request_status_id(fuelRequestStatusRepository.getReferenceById(4));
                // save operator
                fuelRequestRepository.save(fuelRequest);

                // return success
                return "ok";
            } catch (Exception e) {

                return "Save Not Complete : " + e.getMessage();
            }
        } else {

            return "Save Not Successed : You have not access";
        }

    }

    // put mapping for approve fuel request data (url --->/fuelrequest/approve)
    @PutMapping(value = "/fuelrequest/approve")
    public String approveFuelRequestData(@RequestBody FuelRequest fuelRequest) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Fuel Request Approvals");

        if (userPrivilage.getPrivi_update()) {
            // check existing
            if (fuelRequest.getId() == null) {
                return "Approve Not Success: Fuel Request not found ";
            }

            FuelRequest extFuelRequest = fuelRequestRepository.getReferenceById(fuelRequest.getId());
            if (extFuelRequest == null) {
                return "Approve Not Success: Fuel Request not found here";
            }
            // fuel card eka active thiyennath oni
            FuelCards fuelCardCheck = fuelRequest.getFuel_cards_id();
            if (fuelCardCheck.getFuel_card_status_id().getId() != 3) {
                return "Approve Not Success: Fuel Card is not Active";
            }

            try {

                // set auto approve date time
                extFuelRequest.setApproved_datetime(LocalDateTime.now());
                extFuelRequest.setApproved_user_id(logeduser.getId());
                extFuelRequest.setFuel_request_status_id(fuelRequestStatusRepository.getReferenceById(5));

                // save opertator
                fuelRequestRepository.save(extFuelRequest);

                // fuel card eke currunt balance ekata add wenna oni aluthe request karapu
                // amount ekata
                FuelCards fuelCard = extFuelRequest.getFuel_cards_id();
                BigDecimal currentBalance = fuelCard.getCurrunt_balance();
                if (currentBalance == null) {
                    currentBalance = BigDecimal.ZERO;
                }

                BigDecimal requestLiters = extFuelRequest.getRequest_fuel_cost_amount();
                if (requestLiters == null) {
                    requestLiters = BigDecimal.ZERO;
                }

                fuelCard.setCurrunt_balance(currentBalance.add(requestLiters));

                // save karanwa fuel card update eka
                fuelCard.setUpdate_datetime(LocalDateTime.now());
                fuelCard.setUpdate_user_id(logeduser.getId());
                fuelRequest.setFuel_cards_id(fuelCard);
                // save fuel card update
                fuelCardsRepository.save(fuelCard);

                // return ok
                return "ok";

            } catch (Exception e) {
                return "Approve Not Completed :" + e.getMessage();
            }
        } else {

            return "Approve Not Successed : You have not access";
        }
    }

    // put mapping for reject fuel request data (url --->/fuelrequest/reject)
    @PutMapping(value = "/fuelrequest/reject")
    public String rejectFuelRequestData(@RequestBody FuelRequest fuelRequest) {
        // check authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Fuel Request Approvals");

        if (userPrivilage.getPrivi_update()) {
            // check existing
            if (fuelRequest.getId() == null) {
                return "Reject Not Success: Fuel Request not found ";
            }

            FuelRequest extFuelRequest = fuelRequestRepository.getReferenceById(fuelRequest.getId());
            if (extFuelRequest == null) {
                return "Reject Not Success: Fuel Request not found ";
            }

            try {

                // set auto approve date time
                extFuelRequest.setApproved_datetime(LocalDateTime.now());
                extFuelRequest.setApproved_user_id(logeduser.getId());
                extFuelRequest.setFuel_request_status_id(fuelRequestStatusRepository.getReferenceById(6));

                // save opertator
                fuelRequestRepository.save(extFuelRequest);

                // return ok
                return "ok";

            } catch (Exception e) {
                return "Reject Not Completed :" + e.getMessage();
            }
        } else {

            return "Reject Not Successed : You have not access";
        }
    }

    // get pending fuel request list eka (url --->/fuelrequest/pendinglist)
    @GetMapping(value = "/fuelrequest/pendinglist", produces = "application/json")
    public List<FuelRequest> getPendingFuelRequestList() {
        return fuelRequestRepository.getPendingFuelRequestList();
    }

    // get approved fuel request list eka (url --->/fuelrequest/approvedlist)
    @GetMapping(value = "/fuelrequest/approvedlist", produces = "application/json")
    public List<FuelRequest> getApprovedFuelRequestList() {
        return fuelRequestRepository.getApprovedFuelRequestList();
    }

    // get total fuel cost of currunt month for selected vehicle using fuel card id
    // (url --->/fuelrequest/fuelcostbyfuelcard?fuelCardId=1)
    @GetMapping(value = "/fuelrequest/fuelcostbyfuelcard", params = { "fuelCardId" }, produces = "application/json")
    public BigDecimal getFuelCost(@RequestParam("fuelCardId") Integer fuelCardId) {
        BigDecimal total = fuelRequestRepository.getFuelCost(fuelCardId);
        // total eka null nam zero retutn karanwa
        return (total != null) ? total : BigDecimal.ZERO;
    }

    // get current month fuel request
    // list(url-->fuelrequest/currentmonthfuelrequest?fuelCardId=1)
    @GetMapping(value = "/fuelrequest/currentmonthfuelrequest", params = {
            "fuelCardId" }, produces = "application/json")
    public List<FuelRequest> getCurrentMonthFuelRequest(@RequestParam("fuelCardId") Integer fuelCardId) {
        return fuelRequestRepository.getFuelRequestListCurrentMonth(fuelCardId);
    }

    // -------------------for supplier payable---------------------------

    // selecte karana month ekata saha vehicle ekata adala toatl fuel cost eka
    // (url
    // --->/fuelrequest/fuelcostbyvehicleandselectedmonth?vehicleId=31&month=2026-Feb)
    @GetMapping(value = "/fuelrequest/fuelcostbyvehicleandselectedmonth", params = { "vehicleId",
            "month" }, produces = "application/json")
    public Map<String, Object> get(@RequestParam("vehicleId") Integer vehicleId, @RequestParam("month") String month) {
        return fuelRequestRepository.getTotalFuelRequestAmount(vehicleId, month);
        // total eka null nam zero retutn karanwa
    }

    // API to fetch current month deductions for the selected vehicle (fuel cost +
    // advance)
    @GetMapping(value = "/fuelrequest/getDeductions", params = { "vehicleId" }, produces = "application/json")
    public Map<String, BigDecimal> getDeductionsSelectiveVehicle(@RequestParam("vehicleId") Integer vehicleId) {
        BigDecimal totalFuelCost = fuelRequestRepository.getCurrentMonthTotalFuelCostSelectdVehicle(vehicleId);
        BigDecimal totalAdvance = supplierAdvanceRepository.getTotalAdvanceByVehicle(vehicleId);

        BigDecimal fuel = (totalFuelCost != null) ? totalFuelCost : BigDecimal.ZERO;
        BigDecimal advance = (totalAdvance != null) ? totalAdvance : BigDecimal.ZERO;
        BigDecimal totalDeduction = fuel.add(advance);

        // object ekak create karagannawa response kiyala
        Map<String, BigDecimal> response = new HashMap<>();
        response.put("totalFuelCost", fuel);
        response.put("totalAdvance", advance);
        response.put("totalDeduction", totalDeduction);

        return response;
    }
}
