package lk.okidoki.repository;

import java.util.List;

import lk.okidoki.modal.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.okidoki.modal.Driver;

public interface DriverRepository extends JpaRepository<Driver, Integer> {

    
    // get next driver registration number
    @Query(value = "SELECT concat('DRV', lpad(substring(max(d.driver_reg_no),4)+1,5,0)) FROM tms.driver as d", nativeQuery = true)
    String getNextDriverRegNo();
    
    // get nic data from database
    @Query(value = "select d from Driver d where d.nic = ?1")
    Driver getByNic(String nic);

    // get driving license no data from database
    @Query(value = "select d from Driver d where d.driving_license_no = ?1")
    Driver getByDrivingLicenseNo(String driving_license_no);

    // get mobile no data from database
    @Query(value = "select d from Driver d where d.mobileno = ?1")
    Driver getByMobileNo(String mobileno);

    // get email data from database
    @Query(value = "select d from Driver d where d.email = ?1")
    Driver getByEmail(String email);


    // supplier id eken vehicle ganna query eka
    @Query(value = "SELECT * FROM tms.driver d WHERE d.supplier_id = ?1", nativeQuery = true)
    List<Driver> getDriverBySupplierId(Integer supplierid);

    @Query(value = "SELECT * FROM tms.driver d WHERE d.supplier_id is null", nativeQuery = true)
    List<Driver> getCompnayDrivers();

    // -------------------------for fuel request-----------------------------

    // supplier id eken driver ganna query eka
    @Query(value = "SELECT * FROM tms.driver d WHERE d.supplier_id = ?1", nativeQuery = true)
    List<Driver> getAllDriverBySupplierId(Integer supplierid);

    // user accont nathi employees witharak ganna query eka
    @Query(value = "SELECT * FROM tms.driver as d where d.id not in (SELECT u.driver_id FROM tms.user as u where u.driver_id is not null) and d.driver_status_id = 1", nativeQuery = true)
    List<Driver> getByDriverWithoutUserAccount();

    @Query(value = "SELECT d FROM Driver d where d.id = ?1")
    Driver getDriverById(Integer new_driver_id);

}
