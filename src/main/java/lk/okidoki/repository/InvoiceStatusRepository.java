package lk.okidoki.repository;

import lk.okidoki.modal.BookingStatus;
import lk.okidoki.modal.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceStatusRepository extends JpaRepository<InvoiceStatus,Integer> {

}
