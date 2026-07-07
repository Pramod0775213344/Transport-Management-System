package lk.okidoki.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.okidoki.modal.Driver;

public interface DriverRepository extends JpaRepository<Driver,Integer>{

    // get nic data from database
    @Query(value = "select d from Driver d where d.nic = ?1")
    Driver getByNic(String nic);

    // get driving license no data from database
    @Query(value = "select d from Driver d where d.driving_license_no = ?1")
    Driver getByDrivingLicenseNo(String driving_license_no);

    // get mobile no data from database
    @Query(value = "select d from Driver d where d.mobileno = ?1")
    Driver getByMobileNo(String mobileno);

    // get next driver registration number
    @Query(value = "SELECT lpad(max(d.driver_reg_no)+1,8,0) FROM tms.driver as d;", nativeQuery = true)
    String getNextDriverRegNo();

     // supplier id eken vehicle ganna query eka
    @Query(value = "SELECT * FROM tms.driver d WHERE d.supplier_id = ?1 AND d.id NOT IN (SELECT b.driver_id FROM tms.booking b WHERE b.booking_status_id IN (2,3,4,5))", nativeQuery = true)
    List<Driver> getDriverBySupplierId(Integer supplierid);




}
