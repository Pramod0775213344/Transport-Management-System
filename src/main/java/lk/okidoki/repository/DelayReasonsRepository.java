package lk.okidoki.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.okidoki.modal.DelayReason;

public interface DelayReasonsRepository extends JpaRepository<DelayReason, Integer> {

    @Query(value = "SELECT * FROM tms.delay_reasons as dr WHERE dr.type='PICKUP' OR dr.type='BOTH'", nativeQuery = true)
    List<DelayReason> getReasonsForPickupDelay();

    @Query(value = "SELECT * FROM tms.delay_reasons as dr WHERE dr.type='Delivery' OR dr.type='BOTH'", nativeQuery = true)
    List<DelayReason> getReasonsForDeliveryDelay();

}
