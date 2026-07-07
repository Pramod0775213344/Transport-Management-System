package lk.okidoki.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.okidoki.modal.Supplier;

public interface SupplierRepository extends JpaRepository<Supplier, Integer> {

    // nic eka database eken ganna query eka
    @Query(value = "select s from Supplier s where s.nic = ?1")
    Supplier getByNic(String nic);

    // email eka database eken ganna query eka
    @Query(value = "select s from Supplier s where s.email = ?1")
    Supplier getByEmail(String email);

    // Mobile no eka database eken ganna query eka
    @Query(value = "select s from Supplier s where s.mobileno = ?1")
    Supplier getByMobileNo(String mobileno);

    // driving license no eka database eken ganna quey eka
    @Query(value = "select  s from Supplier  s where s.driving_licence_no =?1")
    Supplier getByDL(String drivingLicenceNo);

    // transport name eka database eken ganna query eka
    @Query(value = "select s from Supplier s where s.transportname = ?1")
    Supplier getByTransportName(String transportname);

    @Query(value = "select s from Supplier s where s.supplier_status_id.id = 1")
    List<Supplier> getAllActiveSupplier();

//    compnay tika  database eken ganna query eka
    @Query(value = "SELECT * FROM tms.supplier as s where s.category_type ='Company' order by s.id desc", nativeQuery = true)
    List<Supplier>  getByCompany(String companyName);

    @Query(value = "SELECT * FROM tms.supplier as s where s.category_type ='Individual' order by s.id desc", nativeQuery = true)
    List<Supplier>  getByIndividual(String companyName);


//    supplier agreement ekak thiyena saha supplier agreement staus eka acpprove thiyena active suppliers ganna query eka
    @Query(value = "SELECT * FROM tms.supplier as s where s.id in(SELECT sg.supplier_id FROM tms.supplier_agreement as sg where sg.supplier_agreement_status_id = 2) and s.supplier_status_id=1", nativeQuery = true)
    List<Supplier> getAllActiveSupplierWithAgreementApproved();
}
