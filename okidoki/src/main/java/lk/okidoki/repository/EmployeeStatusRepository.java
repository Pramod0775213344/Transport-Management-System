package lk.okidoki.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import lk.okidoki.modal.EmployeeStatus;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface EmployeeStatusRepository extends JpaRepository<EmployeeStatus,Integer> {

//    get employee status without delete status
    @Query(value = "SELECT * FROM tms.employee_status as es where es.id <> 4",nativeQuery = true)
    public List<EmployeeStatus> employeeStatusWthoutDelete();
}
