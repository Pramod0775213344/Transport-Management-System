package lk.okidoki.repository;


import lk.okidoki.modal.VehicleGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface VehicleGroupRepository extends JpaRepository<VehicleGroup,Integer> {

    @Query(value = "SELECT COALESCE(COUNT(vghs.vehicle_id), 0)  FROM tms.vehicle_group as vg join tms.vehicle_group_has_vehicle as vghs on vghs.vehicle_group_id = vg.id where vg.customer_id =?1",nativeQuery = true)
    Integer getTotalFleetByCustomer(Integer customerId);

}
