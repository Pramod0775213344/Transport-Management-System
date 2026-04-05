package lk.okidoki.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import lk.okidoki.modal.RouteStatus;

public interface RouteStatusRepository extends JpaRepository<RouteStatus, Integer> {

}
