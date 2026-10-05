package lk.okidoki.repository;

import java.util.List;

import lk.okidoki.modal.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.okidoki.modal.Vehicle;

public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {

    // data base eken vehicle no eka ganna query eka
    @Query(value = "select v from Vehicle v where v.vehicle_no = ?1")
    Vehicle getByVehicleNo(String vehicle_no);

    // supplier id eken vehicle ganna query eka
    @Query(value = "SELECT v FROM Vehicle v where v.supplier_id.id =?1")
    public List<Vehicle> getVehicleBySupplierId(Integer supplierid);

    // get vehicle by vehicle type and vehicle status
    @Query(value = "SELECT * FROM tms.vehicle as v where v.vehicle_type_id = ?1 and  v.vehicle_status_id = 1", nativeQuery = true)
    List<Vehicle> getVehicleByVehicleType(Integer vehicletypeid);

    // get vehicle by supplier agreement status id eka active saha e supplierta
    // adala vehicle ganna query eka
    @Query(value = "SELECT * FROM tms.vehicle as v where v.id in (SELECT sg.vehicle_id FROM tms.supplier_agreement as sg where sg.supplier_agreement_status_id = 2 and sg.supplier_id =?1)", nativeQuery = true)
    List<Vehicle> getVehicleBySupplierAgreementStatusId(Integer supplierid);

    // vehicle list eka gnnw vehicla group eke nathi supplier agreement ekak thiyena
    // saha status eka aprroved thiyen vehicle list eka.me select karana group ekata
    // adalawa kalin thiyenna ba
    @Query(value = "SELECT * FROM tms.vehicle as v " +
            "where v.id not in(SELECT vghv.vehicle_id FROM tms.vehicle_group_has_vehicle as vghv where  vghv.vehicle_group_id = ?1)"
            +
            " and v.id not in(SELECT vghv.vehicle_id FROM tms.vehicle_group_has_vehicle as vghv where vghv.is_temporary = true and vghv.vehicle_group_id <> ?1)"
            +
            " and v.id in(SELECT sg.vehicle_id FROM tms.supplier_agreement as sg where sg.supplier_agreement_status_id= 2) order by v.id desc", nativeQuery = true)
    List<Vehicle> getVehicleByVehicleGroupIdAndSupplierAgreement(Integer vehiclegroupid);

    // wena grop ekaka thiyennath ba
    @Query(value = "SELECT * FROM tms.vehicle as v where v.id not in(SELECT vghv.vehicle_id FROM tms.vehicle_group_has_vehicle as vghv) and v.id in(SELECT sg.vehicle_id FROM tms.supplier_agreement as sg where sg.supplier_agreement_status_id= 2) order by v.id desc", nativeQuery = true)
    List<Vehicle> getVehicleByVehicleGroupIdAndSupplierAgreementAndNotInAnyGroup();

    // get vehicle by vehicle group id
    @Query(value = "SELECT * FROM tms.vehicle AS v WHERE v.id IN (" +
            "SELECT vghv.vehicle_id FROM tms.vehicle_group_has_vehicle AS vghv " +
            "WHERE vghv.vehicle_group_id = ?1" +
            ")", nativeQuery = true)
    List<Vehicle> getVehicleByVehicleGroupIdForVehicleGroup(Integer vehiclegroupid);

    @Query(value = "SELECT * FROM tms.vehicle as v where v.supplier_id is null and v.vehicle_type_id = ?1", nativeQuery = true)
    List<Vehicle> getCompnayVehicleByVehicleType(Integer vehiceltype_id);

    // get vehicle by vehicle group id and customer id and vehicle type id and
    // supplier agreement status id
    // customerta adala vehicle group ekata add karala thiyena supplier agreemnts
    // statusa eka aorroved thiyen booking ekata adal vehicle tpe eke vehicle list
    // eka

    // @Query(value =
    // "SELECT * FROM tms.vehicle as v where v.id in\n" +
    // "(SELECT vghv.vehicle_id FROM tms.vehicle_group_has_vehicle as vghv where
    // vghv.vehicle_group_id in (SELECT vg.id FROM tms.vehicle_group as vg where
    // vg.customer_id=?1)\n" +
    // " ) and v.id in (SELECT sg.vehicle_id FROM tms.supplier_agreement as sg where
    // sg.supplier_agreement_status_id=2) and v.vehicle_type_id =?2;", nativeQuery =
    // true)
    // List<Vehicle> getVehicleByVehicleGroupIdForCustomerVehicleGroup(Integer
    // customerid, Integer vehicletypeid);

    @Query(value = "SELECT * FROM tms.vehicle as v where v.id in\n" +
            "(SELECT vghv.vehicle_id FROM tms.vehicle_group_has_vehicle as vghv where vghv.vehicle_group_id in (SELECT vg.id FROM tms.vehicle_group as vg where vg.customer_id=?1)\n"
            +
            " ) and v.id in (SELECT sg.vehicle_id FROM tms.supplier_agreement as sg where sg.supplier_agreement_status_id=2) and v.vehicle_type_id =?2 and v.vehicle_status_id = 1", nativeQuery = true)
    List<Vehicle> getVehicleByVehicleGroupIdForCustomerVehicleGroup(Integer customerid, Integer vehicletypeid);

    // --------------------------------querys for vehicle form search
    // areas----------------------------------------------------
    @Query(value = "SELECT * FROM tms.vehicle as v where v.vehicle_status_id = ?1 ORDER BY v.id DESC", nativeQuery = true)
    List<Vehicle> getVehicleByStatus(Integer vehicleStatusId);

    @Query(value = "SELECT * FROM tms.vehicle as v where v.vehicle_type_id=?1  ORDER BY v.id DESC", nativeQuery = true)
    List<Vehicle> getVehiclesByVehicleType(Integer vehicletypeid);

    @Query(value = "SELECT * FROM tms.vehicle as v where v.vehicle_status_id=?1 and v.vehicle_type_id=?2 ORDER BY v.id DESC", nativeQuery = true)
    List<Vehicle> getVehicleByStatusAndVehicleType(Integer vehicleStatusId, Integer vehicletypeid);

    // ---------------for fuel request-----------------------
    @Query(value = "SELECT * FROM tms.vehicle as v where v.id in(SELECT fc.vehicle_id FROM tms.fuel_cards as fc) and v.id in(SELeCT b.vehicle_id FROM tms.booking as b WHERE b.booking_status_id in (2, 3, 4))", nativeQuery = true)
    List<Vehicle> allVehiclesWhichHasFuelCard();

    // -----------------for supplier payable --------------------------

    // payemmt avalialbe vehicle tika gannawa seleted supplierts adlawa
    @Query(value = "SELECT * FROM tms.vehicle as v where v.id in(SELECT b.vehicle_id FROM tms.booking as b where b.booking_status_id=8) and v.supplier_id=?1", nativeQuery = true)
    List<Vehicle> allPaymentAvailableVehiclesBySupplier(Integer supplierid);

    // patyment available vehicle okkoma gnnawa
    @Query(value = "SELECT * FROM tms.vehicle as v where v.id in(SELECT b.vehicle_id FROM tms.booking as b where b.booking_status_id=8)", nativeQuery = true)
    List<Vehicle> allPaymentAvailableVehicles();

    // -----------------for supplier agreement-----------------------
    // pending or aprroved agreement nathi vehcle tika gannwa saha supplier id eka
    // null nathuwa thiyena vehicle tika gannawa
    @Query(value = "SELECT * FROM tms.vehicle as v where v.id not in(SELECT sg.vehicle_id FROM tms.supplier_agreement as sg where sg.supplier_agreement_status_id in(1,2)) and v.supplier_id is not null order by v.id desc", nativeQuery = true)
    List<Vehicle> getAllVehiclesWithoutPendingOrApprovedSupplierAgreement();

    @Query(value = "SELECT distinct b.vehicle_id FROM tms.booking as b WHERE YEAR(b.pickup_date_time) = YEAR(CURDATE()) AND MONTH(b.pickup_date_time) = MONTH(CURDATE()) and b.customer_agreement_id=?1", nativeQuery = true)
    List<Integer> getVehiclesByAgreementId(Integer agreementId);

    @Query(value = "SELECT v.id FROM tms.vehicle AS v WHERE NOT EXISTS (SELECT 1 FROM tms.booking AS b WHERE b.vehicle_id = v.id AND YEAR(b.pickup_date_time) = YEAR(CURDATE()) AND MONTH(b.pickup_date_time) = MONTH(CURDATE()) AND b.customer_agreement_id IS NOT NULL)", nativeQuery = true)
    List<Integer> getAllAvailableVehicles();

    @Query(value = "SELECT p.name FROM tms.supplier_agreement as sa join tms.vehicle as v on v.id= sa.vehicle_id join tms.package as p on p.id = sa.package_id where sa.vehicle_id=?1 and sa.supplier_agreement_status_id=2", nativeQuery = true)
    String[] getPackageTypeByVehicleId(Integer vehicleId);

    @Query(value = "SELECT v FROM Vehicle v where v.id = ?1")
    Vehicle getVehicleById(Integer new_vehicle_id);
}
