package lk.okidoki.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import lk.okidoki.modal.VehicleGroupHasVehicles;

public interface VehicleGroupHasVehicleRepository extends JpaRepository<VehicleGroupHasVehicles, Integer> {

    @Query(value = "SELECT * FROM tms.vehicle_group_has_vehicle as vgv WHERE vgv.vehicle_id = :vehicleId ", nativeQuery = true)
    Optional<VehicleGroupHasVehicles> findByVehicleId(@Param("vehicleId") Integer vehicleId);

    @Query(value = "SELECT * FROM tms.vehicle_group_has_vehicle as vgv WHERE vgv.vehicle_id = :vehicleId and vgv.vehicle_group_id = vgv.original_group_id", nativeQuery = true)
    Optional<VehicleGroupHasVehicles> findPermanentAssignmentByVehicleId(@Param("vehicleId") Integer vehicleId);

    // booking eka save karaddi eka temporary vehicle ekakda permanent vehicle
    // ekakda kiyala check karanna
    @Query(value = "SELECT vgs.* FROM tms.vehicle_group_has_vehicle as vgs join tms.vehicle_group as vg on vg.id = vgs.vehicle_group_id where vg.customer_id = :customerId and vgs.vehicle_id = :vehicleId", nativeQuery = true)
    Optional<VehicleGroupHasVehicles> findVehicleGroupAndTemporaryStatus(@Param("vehicleId") Integer vehicleId,
            @Param("customerId") Integer customerId);

            // vehicle id eken vehicle group eke customer id eka ganna
    @Query(value = "SELECT vg.customer_id FROM tms.vehicle_group_has_vehicle as vgs join tms.vehicle_group as vg on vg.id = vgs.vehicle_group_id where vgs.vehicle_id = :vehicleId", nativeQuery = true)
    Optional<Integer> findCustomerIdByVehicleId(@Param("vehicleId") Integer vehicleId);

}
