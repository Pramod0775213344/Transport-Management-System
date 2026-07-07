package lk.okidoki.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.okidoki.modal.Package;

public interface PackageRepository extends JpaRepository<Package, Integer> {

    // jp query eka use karaddi methana
    // query for get package by vehicle type
    @Query(value = "SELECT p FROM Package  p where p.vehicle_type_id.id = ?1 and p.package_status_id.id = 1")
    public List<Package> getPackageByVehicleType(Integer vehicletypeid);

    // query for get package by package status
    @Query(value = "SELECT p FROM Package  p where p.package_status_id.id = 1")
    public List<Package> getPackageByPackageStatus();

    // query for get package by vehicles
    @Query(value = "SELECT * FROM tms.package as p where p.vehicle_type_id in (SELECT v.vehicle_type_id FROM tms.vehicle as v where v.id =?1) and p.package_status_id = 1;", nativeQuery = true)
    public List<Package> getPackageByVehicle(Integer vehicleid);

    @Query(value = "SELECT * FROM tms.package as p where p.id in (SELECT ca.package_id FROM tms.customer_agreement as ca where ca.customer_id =?1 and ca.vehicle_type_id=?2)", nativeQuery = true)
    public List<Package> getPackageTypeByCustomerAndVehicleType(Integer customerId, Integer vehicleTypeId);
}
