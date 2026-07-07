package lk.okidoki.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.okidoki.modal.Customer;
import lk.okidoki.modal.CustomerAgreement;
import lk.okidoki.modal.Package;
import lk.okidoki.modal.VehicleType;

public interface CustomerAgreementRepository extends JpaRepository<CustomerAgreement, Integer> {

    // next customer agrement_reg_no eka create ganna query eka
    @Query(value = "SELECT concat('AGR', lpad(substring(max(ca.cus_agreement_no),4)+1,5,0)) FROM tms.customer_agreement as ca", nativeQuery = true)
    public String getNextAgreementNo();

    // customer agreement eka vehicle type eka package eka select karanna query eka
    @Query(value = "SELECT ca FROM CustomerAgreement ca where  ca.customer_id =?1 and ca.vehicle_type_id =?2 and ca.package_id =?3")
    public CustomerAgreement getByVehicleTypeAndPackageType(Customer customer_id, VehicleType vehicle_type_id,
            Package package_id);

    // customer agreement eka status eka pending thiyen ewa  select karanna query eka
    @Query(value = "SELECT * FROM tms.customer_agreement as ca where ca.customer_agreement_status_id = 1 order by ca.id desc", nativeQuery = true)
    public List<CustomerAgreement> getCustomerAgreementByStatus();

//    vehicle type id ekai customer id ekai use karala customer agreement eka ganna query eka
    @Query(value = "SELECT * FROM tms.customer_agreement as ca where ca.customer_id = ?1 and ca.vehicle_type_id = ?2",nativeQuery = true)
    public CustomerAgreement findByVehicleTypeIdAndCustomerId(Integer customer_id, Integer VejicleType_id);

    @Query(value = "SELECT count(*) FROM tms.customer_agreement as ca where ca.vehicle_type_id = ?1 and ca.customer_id = ?2",nativeQuery = true)
    Integer countByVehicleTypeIdAndCustomerId(Integer id, Integer id1);


//    @Query(value = "SELECT * FROM tms.customer_agreement as ca where ca.vehicle_type_id = ?1 and ca.",nativeQuery = true)
//    CustomerAgreement getByVehicleType(Integer vehicleTypeId);

//    customer agreement eka gnnwa customer id eken saha vehicle type id eken booking eka dana date ekata available booking status eka complete wuna ewa
    @Query(value = "SELECT * FROM tms.customer_agreement as ca where ca.customer_id =?1 and ca.vehicle_type_id =?2 and ca.id not in(SELECT b.customer_agreement_id FROM tms.booking as b where DATE( b.pickup_date_time) =?3 and b.customer_agreement_id IS NOT NULL)",nativeQuery = true)
    public List<CustomerAgreement> getByCustomerAndVehicleTypeAndDate(Integer customerId, Integer vehicleTypeId, String date);

    //    vehicle type id ekai customer id ekai use karala customer agreement list ekak ganna query eka
    @Query(value = "SELECT * FROM tms.customer_agreement as ca where ca.customer_id = ?1 and ca.vehicle_type_id = ?2",nativeQuery = true)
    public List<CustomerAgreement> getByVehicleTypeIdAndCustomerId(Integer customer_id, Integer vehicleType_id);

//    customert adala approved agreement tika genna ganna query eka
    @Query(value = "SELECT * FROM tms.customer_agreement as ca where ca.customer_id = ?1 and  ca.customer_agreement_status_id = 2",nativeQuery = true)
    public List<CustomerAgreement> getByCustomer(Integer customer_id);

//    ------------------------------------------filtering wala query tika------------------------------------------
//    customer agreement eka gnnawa vehicle type eka anuwa
    @Query(value = "SELECT * FROM tms.customer_agreement as ca where ca.vehicle_type_id = ?1 ",nativeQuery = true)
    List<CustomerAgreement> getByVehicleType(Integer vehicleTypeId);

//    customer agreement eka gnnaw status eka anuwa
    @Query(value = "SELECT * FROM tms.customer_agreement as ca where ca.customer_agreement_status_id = ?1",nativeQuery = true)
    List<CustomerAgreement> getByStatus(Integer statusId);

//    customer agreement eka gnnawa customer id eka saha vehicle type eka anuwa
    @Query(value = "SELECT * FROM tms.customer_agreement as ca where ca.customer_id = ?1 and ca.vehicle_type_id = ?2 ",nativeQuery = true)
    List<CustomerAgreement> getByCustomerAndVehicleType(Integer customerId, Integer vehicleTypeId);

//    customer agreement eka gnnawa customer id eka saha status eka anuwa
    @Query(value = "SELECT * FROM tms.customer_agreement as ca where ca.customer_id = ?1 and ca.customer_agreement_status_id = ?2 ",nativeQuery = true)
    List<CustomerAgreement> getByCustomerAndStatus(Integer customerId, Integer statusId);

//    customer agreement eka gnnawa vehicle type eka saha status eka anuwa
    @Query(value = "SELECT * FROM tms.customer_agreement as ca where ca.vehicle_type_id = ?1 and ca.customer_agreement_status_id = ?2 ",nativeQuery = true)
    List<CustomerAgreement> getByVehicleTypeAndStatus(Integer vehicleTypeId, Integer statusId);

//    customer agreement eka gnnawa customer id eka saha vehicle type eka saha status eka anuwa
    @Query(value = "SELECT * FROM tms.customer_agreement as ca where ca.customer_id = ?1 and ca.vehicle_type_id = ?2 and ca.customer_agreement_status_id = ?3",nativeQuery = true)
    List<CustomerAgreement> getByCustomerAndVehicleTypeAndStatus(Integer customerId, Integer vehicleTypeId, Integer statusId);

//    -----------------------------------------agreement count eka gannawa-----------------------------------------

//    customer agreement count eka gnnawa all data
    @Query(value = "SELECT count(*) FROM tms.customer_agreement as ca",nativeQuery = true)
    Integer countAllBy();

//    active customer agreement count eka gnnawa
    @Query(value = "SELECT count(*) FROM tms.customer_agreement as ca where ca.customer_agreement_status_id = 2",nativeQuery = true)
    Integer countByStatusActive();

//    pending customer agreement count eka gnnawa
    @Query(value = "SELECT count(*) FROM tms.customer_agreement as ca where ca.customer_agreement_status_id = 1",nativeQuery = true)
    Integer countByStatusPending();

//    rejected customer agreement count eka gnnawa
    @Query(value = "SELECT count(*) FROM tms.customer_agreement as ca where ca.customer_agreement_status_id = 3",nativeQuery = true)
    Integer countByStatusRejected();

}
