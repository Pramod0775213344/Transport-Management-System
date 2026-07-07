package lk.okidoki.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.okidoki.modal.SupplierAgreement;
import lk.okidoki.modal.Vehicle;

import java.util.List;

public interface SupplierAgreementRepository extends JpaRepository<SupplierAgreement, Integer> {

    @Query("SELECT s FROM SupplierAgreement s WHERE s.vehicle_id = ?1")
    SupplierAgreement getByVehicelNo(Vehicle vehicle_id);

    // next supplier agrement_reg_no eka create ganna query eka
    @Query(value = "SELECT concat('SUP', lpad(substring(max(sa.sup_agreement_no),4)+1,5,0)) FROM tms.supplier_agreement as sa", nativeQuery = true)
    String getNextSupplierAgreementNo();

    // supplier agreement eka status eka pending thiyen ewa  select karanna query eka
    @Query(value = "SELECT * FROM tms.supplier_agreement as sa where sa.supplier_agreement_status_id = 1 order by sa.id desc", nativeQuery = true)
    public List<SupplierAgreement> getSupplierAgreementByStatus();

//    get supplier by supplier agreement
    @Query(value = "SELECT sg.supplier_id FROM tms.supplier_agreement as sg where sg.supplier_agreement_status_id = 2 ",nativeQuery = true)
    public String getSupplierBySupplierAgreementStatus();

    //    ------------------------------------------filtering wala query tika------------------------------------------

//    supplier agreement eka gnnawa supplier id eka anuwa
    @Query(value = "SELECT * FROM tms.supplier_agreement as sa where sa.supplier_id = ?1 ",nativeQuery = true)
    List<SupplierAgreement> getBySupplierId(Integer supplierId);

//    supplier agreement eka gnnawa vehicle type eka anuwa
    @Query(value = "SELECT sa.* FROM tms.supplier_agreement as sa JOIN tms.vehicle AS v ON sa.vehicle_id = v.id WHERE v.vehicle_type_id = ?1 ",nativeQuery = true)
    List<SupplierAgreement> getByVehicleType(Integer vehicleTypeId);

//    supplier agreement eka gnnaw status eka anuwa
    @Query(value = "SELECT * FROM tms.supplier_agreement as sa where sa.supplier_agreement_status_id = ?1",nativeQuery = true)
    List<SupplierAgreement> getByStatus(Integer statusId);

//    supplier agreement eka gnnawa supplier id eka saha vehicle type eka anuwa
    @Query(value = "SELECT sa.* FROM tms.supplier_agreement as sa JOIN tms.vehicle AS v ON sa.vehicle_id = v.id where sa.supplier_id = ?1 and v.vehicle_type_id = ?2",nativeQuery = true)
    List<SupplierAgreement> getBySupplierIdAndVehicleType(Integer supplierId, Integer vehicleTypeId);

//    supplier agreement eka gnnawa supplier id eka saha status eka anuwa
    @Query(value = "SELECT * FROM tms.supplier_agreement as sa where sa.supplier_id = ?1 and sa.supplier_agreement_status_id = ?2",nativeQuery = true)
    List<SupplierAgreement> getBySupplierIdAndStatus(Integer supplierId, Integer statusId);

//    supplier agreement eka gnnawa vehicle type eka saha status eka anuwa
    @Query(value = "SELECT sa.* FROM tms.supplier_agreement as sa JOIN tms.vehicle AS v ON sa.vehicle_id = v.id where v.vehicle_type_id = ?1 and sa.supplier_agreement_status_id = ?2",nativeQuery = true)
    List<SupplierAgreement> getByVehicleTypeAndStatus(Integer vehicleTypeId, Integer statusId);

//    supplier agreement eka gnnawa supplier id eka saha vehicle type eka saha status eka anuwa
    @Query(value = "SELECT sa.* FROM tms.supplier_agreement as sa JOIN tms.vehicle AS v ON sa.vehicle_id = v.id where sa.supplier_id = ?1 and v.vehicle_type_id = ?2 and sa.supplier_agreement_status_id = ?3",nativeQuery = true)
    List<SupplierAgreement> getBySupplierIdAndVehicleTypeAndStatus(Integer supplierId, Integer vehicleTypeId, Integer statusId);

//    -----------------------------------------agreement count eka gannawa-----------------------------------------

//    supplier agreement count eka gnnawa all data
    @Query(value = "SELECT count(*) FROM tms.supplier_agreement as sa",nativeQuery = true)
    Integer countAllSupplierAgreements();

//    active supplier agreement count eka gnnawa
    @Query(value = "SELECT count(*) FROM tms.supplier_agreement as sa where sa.supplier_agreement_status_id = 2",nativeQuery = true)
    Integer countActiveSupplierAgreements();

//    pending supplier agreement count eka gnnawa
    @Query(value = "SELECT count(*) FROM tms.supplier_agreement as sa where sa.supplier_agreement_status_id = 1",nativeQuery = true)
    Integer countPendingSupplierAgreements();

//    rejected supplier agreement count eka gnnawa
    @Query(value = "SELECT count(*) FROM tms.supplier_agreement as sa where sa.supplier_agreement_status_id = 3",nativeQuery = true)
    Integer countRejectedSupplierAgreements();
}
