package lk.okidoki.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import lk.okidoki.modal.VehicleStatus;

public interface VehicleStatusRepository extends JpaRepository<VehicleStatus,Integer> {

}
