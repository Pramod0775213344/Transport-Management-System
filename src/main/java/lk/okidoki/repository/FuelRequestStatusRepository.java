package lk.okidoki.repository;

import lk.okidoki.modal.FuelCardsStatus;
import lk.okidoki.modal.FuelRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FuelRequestStatusRepository extends JpaRepository<FuelRequestStatus,Integer> {


}
