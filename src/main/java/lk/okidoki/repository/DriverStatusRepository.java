package lk.okidoki.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.okidoki.modal.DriverStatus;

public interface DriverStatusRepository extends JpaRepository<DriverStatus,Integer> {

   @Query(value = "SELECT * FROM tms.driver_status as ds where ds.id <> 3;",nativeQuery = true)
    List<DriverStatus> getDriverStatusWithoutDelete();

}
