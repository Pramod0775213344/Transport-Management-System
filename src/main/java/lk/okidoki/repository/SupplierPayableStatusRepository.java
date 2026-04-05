package lk.okidoki.repository;

import lk.okidoki.modal.SupplierPayable;
import lk.okidoki.modal.SupplierPayableStatus;
import lk.okidoki.modal.SupplierStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierPayableStatusRepository extends JpaRepository<SupplierPayableStatus,Integer> {

}
