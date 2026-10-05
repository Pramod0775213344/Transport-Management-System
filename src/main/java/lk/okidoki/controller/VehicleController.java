package lk.okidoki.controller;

import lk.okidoki.modal.Booking;
import lk.okidoki.modal.Privilage;
import lk.okidoki.modal.SupplierAgreement;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import lk.okidoki.modal.User;
import lk.okidoki.modal.Vehicle;
import lk.okidoki.repository.BookingRepository;
import lk.okidoki.repository.SupplierAgreementRepository;
import lk.okidoki.repository.UserRepository;
import lk.okidoki.repository.VehicleRepository;
import lk.okidoki.repository.VehicleStatusRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
public class VehicleController {

    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleStatusRepository vehicleStatusRepository;

    @Autowired // auto generate instance
    private UserPrivilageController userPrivilageController;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SupplierAgreementRepository supplierAgreementRepository;

    VehicleController(BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    // Request mapping for load vehicle Ui (url -->/vehicle)
    @RequestMapping(value = "/vehicle")
    public ModelAndView loadVehicleUI() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());
        // log wela inna userta Fleet Management module privilege eka gannawa
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Fleet Management");

        ModelAndView vehicleUI = new ModelAndView();
        vehicleUI.setViewName("vehicle.html");
        vehicleUI.addObject("logedusername", auth.getName());
        vehicleUI.addObject("loggeduserphoto", logeduser.getUser_photo());
        vehicleUI.addObject("logeduseremail", logeduser.getEmail());
        vehicleUI.addObject("logeduserfullname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getFullname() : null);
        vehicleUI.addObject("logeduserCallingname",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getCallingname() : null);
        vehicleUI.addObject("logeduserDesignation",
                logeduser.getEmployee_id() != null ? logeduser.getEmployee_id().getDesignation_id().getName() : null);
        // frontend ekata privilege object eka yawala button hide/show karaganna denna
        vehicleUI.addObject("userPrivilage", userPrivilage);

        vehicleUI.addObject("pageTitle", "Vehicle");
        return vehicleUI;
    }

    // Get mapping for get all vehicle data by (url -->/vehicle/alldata)
    @GetMapping(value = "/vehicle/alldata", produces = "application/json")
    public List<Vehicle> getAllVehicleData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Fleet Management");
        if (userPrivilage.getPrivi_select()) {

            return vehicleRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));

        } else {
            return new ArrayList<>();
        }
    }

    // Get mapping for get vehicle by supplier id (url
    // -->/vehicle/byvehicletype?vehicletypeid=1)
    @GetMapping(value = "/vehicle/byvehicletype", params = { "vehicletypeid" }, produces = "application/json")
    public List<Vehicle> getVehicleByVehicleType(@RequestParam("vehicletypeid") Integer vehicletypeid) {
        return vehicleRepository.getVehicleByVehicleType(vehicletypeid);
    }

    // Get mapping for get vehicle by supplier id (url
    // -->/vehicle/bysupplierid?supplierid=1)
    @GetMapping(value = "/vehicle/bysupplierid", params = { "supplierid" }, produces = "application/json")
    public List<Vehicle> getMethodName(@RequestParam("supplierid") Integer supplierid) {
        return vehicleRepository.getVehicleBySupplierId(supplierid);
    }

    // get mapping for insert vehicle into tha table(url -->/vehicle/insert)
    @PostMapping(value = "vehicle/insert")
    public String saveVehicleDtaa(@RequestBody Vehicle vehicle) {

        // authorization and authentication
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Fleet Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_insert()) {
            // check existing

            // chekc vehicle no
            Vehicle extVehicle = vehicleRepository.getByVehicleNo(vehicle.getVehicle_no());
            if (extVehicle != null) {
                return "Vehicle no already exist";
            }

            try {

                // set audit data
                vehicle.setAdded_datetime(LocalDateTime.now());
                vehicle.setAdded_user_id(logeduser.getId());
                vehicle.setVehicle_status_id(vehicleStatusRepository.getReferenceById(1)); // set vehicle status to
                                                                                           // active

                // save vehicle data
                vehicleRepository.save(vehicle);

                // return success message
                return "ok";

            } catch (Exception e) {

                return "Save not completed" + e.getMessage();
            }
        } else {

            return "Save Not Successed : You have not access";
        }
    }

    // get mapping for update vehicle into tha table(url -->/vehicle/update)
    @PutMapping(value = "vehicle/update")
    public String updateVehicleData(@RequestBody Vehicle vehicle) {

        // checek authorization and authentication
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Fleet Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_update()) {
            // check existing
            if (vehicle.getId() == null) {
                return "Vehicle id is null";
            }

            Vehicle extVehicle = vehicleRepository.getReferenceById(vehicle.getId());
            if (extVehicle == null) {
                return "Vehicle not exist";
            }

            // duplicate check
            // check vehicle no
            Vehicle extVehicleByVehicleNo = vehicleRepository.getByVehicleNo(vehicle.getVehicle_no());
            if (extVehicleByVehicleNo != null && extVehicleByVehicleNo.getId() != vehicle.getId()) {
                return "Vehicle no already exist";
            }

            try {

                // set audit data
                vehicle.setUpdated_datetime(LocalDateTime.now());
                vehicle.setUpdated_user_id(logeduser.getId());

                if (vehicle.getVehicle_status_id().equals(vehicleStatusRepository.getReferenceById(1))) {
                    vehicle.setIs_breakdown(false);

                }

                // save vehicle data
                vehicleRepository.save(vehicle);

                // return success message
                return "ok";

            } catch (Exception e) {
                return "Update not completed" + e.getMessage();
            }
        } else {

            return "Update Not Successed : You have not access";
        }

    }

    // delete mapping for delete vehicle into tha table(url -->/vehicle/delete)
    @DeleteMapping(value = "vehicle/delete")
    public String deleteVehicleData(@RequestBody Vehicle vehicle) {

        // checek authorization and authentication
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Fleet Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_delete()) {
            // check existing
            if (vehicle.getId() == null) {
                return "Vehicle not exist";
            }

            Vehicle extVehicle = vehicleRepository.getReferenceById(vehicle.getId());
            if (extVehicle == null) {
                return "Vehicle not exist";
            }

            // pending or active bookings thiyenawa nam delete karanna be
            List<Booking> pendingOrActiveBookings = bookingRepository
                    .getPendingOrActiveBookingsByVehicleId(vehicle.getId());
            if (!pendingOrActiveBookings.isEmpty()) {
                return "Delete Not Successed :There are " + pendingOrActiveBookings.size()
                        + " pending or active bookings for this vehicle";
            }

            // aprove or pending supplier agreements thiyenawa nam delete karanna be
            List<SupplierAgreement> pendingOrActiveSupplierAgreements = supplierAgreementRepository
                    .getPendingOrActiveSupplierAgreementsByVehicleId(vehicle.getId());
            if (!pendingOrActiveSupplierAgreements.isEmpty()) {
                return "Delete Not Successed :There are " + pendingOrActiveSupplierAgreements.size()
                        + " pending or active supplier agreements for this vehicle";
            }
            try {

                // set audit data
                vehicle.setDeleted_datetime(LocalDateTime.now());
                vehicle.setDeleted_user_id(logeduser.getId());
                vehicle.setVehicle_status_id(vehicleStatusRepository.getReferenceById(3));

                // save vehicle data
                vehicleRepository.save(vehicle);

                // return success message
                return "ok";

            } catch (Exception e) {
                return "Delete not completed" + e.getMessage();
            }
        } else {

            return "Delete Not Successed : You have not access";
        }

    }

    // put mapping for update vehicle revenue expense data into tha table(url
    // -->/vehicle/updatevehicleexpense)
    @PutMapping(value = "vehicle/updatevehiclereveneulicense")
    public String updateVehicleRevenueExpenseData(@RequestBody Vehicle vehicle) {

        // checek authorization and authentication
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Fleet Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_update()) {
            // check existing
            if (vehicle.getId() == null) {
                return "Vehicle id is null";
            }

            Vehicle extVehicle = vehicleRepository.getReferenceById(vehicle.getId());
            if (extVehicle == null) {
                return "Vehicle not exist";
            }

            try {

                // extVehicle eka witharai edit karanawa, vehicle (incoming) eka nemei
                extVehicle.setUpdated_datetime(LocalDateTime.now());
                extVehicle.setUpdated_user_id(logeduser.getId());

                extVehicle.setRevenu_license_expire_date(vehicle.getRevenu_license_expire_date());

                Boolean activated = activateVehicleIfAllValid(extVehicle); // check karanawa revenue license and
                                                                           // insurance valid nam vehicle
                // status eka active karanawa
                vehicleRepository.save(extVehicle); // extVehicle save karanawa - vehicle nemei

                // vehicle eka mulinma inactive tibba or vehciel insuarnce update karaddi revenu
                // eka expire thibune.e nisa active karanna ba
                if (!activated && extVehicle.getVehicle_status_id() != null
                        && extVehicle.getVehicle_status_id().getId().equals(2)) {
                    return "ok_not_activated"; // <-- wenama status code eka
                }
                // return success message
                return "ok";

            } catch (Exception e) {
                return "Update not completed" + e.getMessage();
            }
        } else {

            return "Update Not Successed : You have not access";
        }

    }

    @PutMapping(value = "vehicle/updatevehicleinsurance")
    public String updateVehicleInsuranceData(@RequestBody Vehicle vehicle) {

        // checek authorization and authentication
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(),
                "Fleet Management");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_update()) {
            // check existing
            if (vehicle.getId() == null) {
                return "Vehicle id is null";
            }

            Vehicle extVehicle = vehicleRepository.getReferenceById(vehicle.getId());
            if (extVehicle == null) {
                return "Vehicle not exist";
            }

            try {

                // extVehicle eka witharai edit karanawa, vehicle (incoming) eka nemei
                extVehicle.setUpdated_datetime(LocalDateTime.now());
                extVehicle.setUpdated_user_id(logeduser.getId());

                extVehicle.setInsurance_expire_date(vehicle.getInsurance_expire_date());

                Boolean activated = activateVehicleIfAllValid(extVehicle); // check karanawa revenue license and
                                                                           // insurance valid nam vehicle

                vehicleRepository.save(extVehicle); // extVehicle save karanawa - vehicle nemei

                // vehicle eka mulinma inactive tibba or vehciel insuarnce update karaddi revenu
                // eka expire thibune.e nisa active karanna ba
                if (!activated && extVehicle.getVehicle_status_id().getId().equals(2)) {
                    return "ok_not_activated"; // <-- wenama status code eka
                }

                // return success message
                return "ok";

            } catch (Exception e) {
                return "Update not completed" + e.getMessage();
            }
        } else {

            return "Update Not Successed : You have not access";
        }

    }

    // comman method eka handle karanawa vehicle status eka active karanna, revenue
    // license and insurance valid nam
    private boolean activateVehicleIfAllValid(Vehicle extVehicle) {

        if (extVehicle.getVehicle_status_id().getId().equals(2)) {

            LocalDate today = LocalDate.now();

            boolean revenueValid = extVehicle.getRevenu_license_expire_date() != null
                    && !extVehicle.getRevenu_license_expire_date().isBefore(today);

            boolean insuranceValid = extVehicle.getInsurance_expire_date() != null
                    && !extVehicle.getInsurance_expire_date().isBefore(today);

            // dekama valid nam witharak active karanawa
            if (revenueValid && insuranceValid) {
                extVehicle.setVehicle_status_id(vehicleStatusRepository.getReferenceById(1));
                return true; // activated
            }
            return false; // not activated
        }
        return false; // alraedy activate nam activate karanna ono na
    }

    // Get mapping for get vehicle by supplier id (url
    // -->/vehicle/vehiclebyselectedsupplier?supplierid=1)
    @GetMapping(value = "/vehicle/vehiclebyselectedsupplier", params = { "supplierid" }, produces = "application/json")
    public List<Vehicle> getVehicleBySupplierAgreementStatusId(@RequestParam("supplierid") Integer supplierid) {
        return vehicleRepository.getVehicleBySupplierAgreementStatusId(supplierid);
    }

    // Get mapping for get vehicle by supplier id (url
    // -->/vehicle/vehiclebyvehiclegroupandsupplieragreement?vehiclegroup_id=1)
    @GetMapping(value = "/vehicle/vehiclebyvehiclegroupandsupplieragreement", params = {
            "vehiclegroup_id" }, produces = "application/json")
    public List<Vehicle> getVehicleByVehicleGroupId(@RequestParam("vehiclegroup_id") Integer vehiclegroup_id) {
        return vehicleRepository.getVehicleByVehicleGroupIdAndSupplierAgreement(vehiclegroup_id);
    }

    @GetMapping(value = "/vehicle/vehiclebyvehiclegroupandsupplieragreementandnotinanygroup")
    public List<Vehicle> getVehicleByVehicleGroupIdAndSupplierAgreementAndNotInAnyGroup() {
        return vehicleRepository.getVehicleByVehicleGroupIdAndSupplierAgreementAndNotInAnyGroup();
    }

    // Get mapping for get vehicle by supplier id (url
    // -->/vehicle/vehiclebyvehiclegroup?vehiclegroup_id=1)
    @GetMapping(value = "/vehicle/vehiclebyvehiclegroup", params = { "vehiclegroup_id" }, produces = "application/json")
    public List<Vehicle> getVehicleByVehicleGroupIdForVehicleGroup(
            @RequestParam("vehiclegroup_id") Integer vehiclegroup_id) {
        return vehicleRepository.getVehicleByVehicleGroupIdForVehicleGroup(vehiclegroup_id);
    }

    // Get mapping for get vehicle by supplier id (url
    // -->/vehicle/vehiclebyvehiclegroupandvehicletype?customer_id=1&vehicletype_id=1)
    @GetMapping(value = "/vehicle/vehiclebyvehiclegroupandvehicletype", params = { "customer_id",
            "vehicletype_id" }, produces = "application/json")
    public List<Vehicle> getVehicleByVehicleGroupIdForCustomerVehicleGroup(
            @RequestParam("customer_id") Integer customer_id, @RequestParam("vehicletype_id") Integer vehicletype_id) {
        return vehicleRepository.getVehicleByVehicleGroupIdForCustomerVehicleGroup(customer_id, vehicletype_id);
    }

    // get mappin eka liynawa own vehicel list eka ganna select vehicle type ekat
    // adalwa
    @GetMapping(value = "/vehicle/companyvehiclebyvehicletype", params = {
            "vehicletype_id" }, produces = "application/json")
    public List<Vehicle> getCompnayVehicleByVehicleType(@RequestParam("vehicletype_id") Integer vehicletype_id) {
        return vehicleRepository.getCompnayVehicleByVehicleType(vehicletype_id);
    }

    // --------------------vehicle data search
    // Mappings--------------------------------------------------
    // -->/vehicle/bystatus?&vehicleStatusId=3)
    @GetMapping(value = "/vehicle/bystatus", params = { "vehicleStatusId" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Vehicle> getVehicleByStatus(@RequestParam("vehicleStatusId") Integer vehicleStatusId) {
        return vehicleRepository.getVehicleByStatus(vehicleStatusId);
    }

    // -->/vehicle/byvehicletypeid?vehicletypeid=3)
    @GetMapping(value = "/vehicle/byvehicletypeid", params = { "vehicletypeid" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Vehicle> getVehiclesByVehicleType(@RequestParam("vehicletypeid") Integer vehicletypeid) {
        return vehicleRepository.getVehiclesByVehicleType(vehicletypeid);
    }

    // -->/vehicle/bystatusidandvehicletypeid?vehicleStatusId=3&vehicletypeid=3)
    @GetMapping(value = "/vehicle/bystatusidandvehicletypeid", params = { "vehicleStatusId",
            "vehicletypeid" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Vehicle> getVehicleByStatusAndVehicleType(@RequestParam("vehicleStatusId") Integer vehicleStatusId,
            @RequestParam("vehicletypeid") Integer vehicletypeid) {
        return vehicleRepository.getVehicleByStatusAndVehicleType(vehicleStatusId, vehicletypeid);
    }
    // --------------------vehicle data search Mappings
    // end--------------------------------------------------

    // ----------------------for fuel request---------------------------
    // get all vehicles which has fuel card
    // url -->/vehicle/allvehicleswhichhasfuelcard
    @GetMapping(value = "/vehicle/allvehicleswhichhasfuelcard", produces = "application/json")
    public List<Vehicle> allVehiclesWhichHasFuelCard() {
        return vehicleRepository.allVehiclesWhichHasFuelCard();
    }

    // --------------for supplier payabale
    // select karan supplierta adalwa payament tiyena vehicles tika gnnawa
    // -->/vehicle/paymentAvailableVehicles?supplierId=2)
    @GetMapping(value = "/vehicle/paymentAvailableVehicles", params = { "supplierId" }, produces = "application/json")
    // param method eka haraha thama data ganne
    public List<Vehicle> allPaymentAvailableVehiclesBySupplier(@RequestParam("supplierId") Integer supplierId) {
        return vehicleRepository.allPaymentAvailableVehiclesBySupplier(supplierId);
    }

    @GetMapping(value = "/vehicle/paymentAvailableVehicles", produces = "application/json")
    public List<Vehicle> allPaymentAvailableVehicles() {
        return vehicleRepository.allPaymentAvailableVehicles();
    }

    // -----------------for supplier agreement-----------------------
    // pending or aprroved agreement nathi vehcle tika gannwa
    @GetMapping(value = "/vehicle/allvehicleswithoutpendingorapprovedsupplieragreement", produces = "application/json")
    public List<Vehicle> getAllVehiclesWithoutPendingOrApprovedSupplierAgreement() {
        return vehicleRepository.getAllVehiclesWithoutPendingOrApprovedSupplierAgreement();
    }
}
