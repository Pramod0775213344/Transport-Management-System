package lk.okidoki.repository;

import lk.okidoki.modal.VehicleInspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleInspectionRepository extends JpaRepository<VehicleInspection, Integer> {

    @Query("SELECT vi FROM VehicleInspection vi WHERE vi.deleted_datetime IS NULL ORDER BY vi.id DESC")
    List<VehicleInspection> findAllActive();

    @Query("SELECT vi FROM VehicleInspection vi WHERE vi.vehicle_id.id = :vehicleId AND vi.deleted_datetime IS NULL ORDER BY vi.id DESC")
    List<VehicleInspection> findByVehicleId(@Param("vehicleId") Integer vehicleId);
}
