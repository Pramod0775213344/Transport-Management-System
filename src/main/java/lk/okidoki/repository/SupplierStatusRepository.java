package lk.okidoki.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import lk.okidoki.modal.SupplierStatus;

public interface SupplierStatusRepository extends JpaRepository<SupplierStatus,Integer> {

   //    get customer status without delete status
    @Query(value = "SELECT * FROM tms.supplier_status as ss where ss.id <> 3;",nativeQuery = true)
    public List<SupplierStatus> getSupplierStatusWithoutDelete();

}
