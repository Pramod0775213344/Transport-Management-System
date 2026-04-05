package lk.okidoki.repository;

import lk.okidoki.modal.SupplierAdvance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface SupplierAdvanceRepository extends JpaRepository<SupplierAdvance, Integer> {

    @Query("SELECT sa FROM SupplierAdvance sa WHERE sa.supplier_id.id = ?1")
    List<SupplierAdvance> findBySupplier(Integer supplierId);

    @Query("SELECT sa FROM SupplierAdvance sa ORDER BY sa.id DESC")
    List<SupplierAdvance> findAllByOrderByIdDesc();

    @Query(value = "SELECT concat('ADV', lpad(substring(max(sa.advance_no),4)+1,5,0)) FROM tms.supplier_advance as sa", nativeQuery = true)
    public String getNextAdvanceNo();

    @Query(value = "SELECT COALESCE(SUM(sa.amount), 0) FROM tms.supplier_advance as sa WHERE sa.vehicle_id = ?1 AND sa.supplier_advance_status_id = 2 AND MONTH(sa.added_datetime) = MONTH(CURRENT_DATE()) AND YEAR(sa.added_datetime) = YEAR(CURRENT_DATE())", nativeQuery = true)
    public BigDecimal getTotalAdvanceByVehicle(Integer vehicleId);
}
