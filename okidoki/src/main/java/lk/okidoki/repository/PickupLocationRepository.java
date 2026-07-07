package lk.okidoki.repository;




import lk.okidoki.modal.PickupLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PickupLocationRepository extends JpaRepository<PickupLocation,Integer> {

    @Query(value = "SELECT * FROM tms.pickup_locations as pl where pl.customer_id =?1",nativeQuery = true)
    List<PickupLocation> getPickupLocationBySelectedCustomer(Integer customerId);
}
