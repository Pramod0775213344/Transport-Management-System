package lk.okidoki.repository;

import lk.okidoki.modal.VehicleInspectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleInspectionStatusRepository extends JpaRepository<VehicleInspectionStatus, Integer> {
}
