package lk.okidoki.repository;


import lk.okidoki.modal.DeliveryLocation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DeliveryLocationRepository extends JpaRepository<DeliveryLocation,Integer> {

    @Query(value = "SELECT * FROM tms.delivery_locations as dl where dl.customer_id=?1",nativeQuery = true)
    List<DeliveryLocation> getDeliveryLocationBySelectedCustomer(Integer customerId);
}
