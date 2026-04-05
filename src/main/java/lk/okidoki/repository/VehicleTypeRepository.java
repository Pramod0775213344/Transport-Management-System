package lk.okidoki.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import lk.okidoki.modal.VehicleType;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface VehicleTypeRepository extends JpaRepository<VehicleType,Integer> {

//select vehicle type by given customer id and customer agreement
    @Query(value = "SELECT * FROM tms.vehicle_type as vt where vt.id in (SELECT ca.vehicle_type_id FROM tms.customer_agreement as ca where ca.customer_id = ?1 and ca.customer_agreement_status_id = 2)",nativeQuery = true)
    List<VehicleType> getVehicleTypeByCustomeragreementAndCustomer(Integer cutomer_id);
}
