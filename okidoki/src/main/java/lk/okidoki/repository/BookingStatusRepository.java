package lk.okidoki.repository;

import lk.okidoki.modal.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingStatusRepository extends JpaRepository<BookingStatus,Integer> {

}
