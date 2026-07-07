package lk.okidoki.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.okidoki.modal.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Integer> {

    @Query(value = "SELECT lpad(max(e.emp_no) + 1 ,8,0 ) FROM tms.employee as e;", nativeQuery = true)
    // @Query anotation eke thiyena output eka me function eke body ekata
    // automaticaly assigning wenawa
    String getNextEmpNo();

    // nic eka details database eken ganna query eka
    @Query(value = "select e from Employee  e where e.nic =?1")
    Employee getByNic(String nic);

    // mobile no details database ganna query eka
    @Query(value = "select e from Employee e where e.mobileno = ?1")
    Employee getByMobileNo(String mobileno);

    // user accont nathi employees witharak ganna query eka
    @Query(value = "SELECT * FROM tms.employee as e where e.id not in (SELECT u.employee_id FROM tms.user as u where u.employee_id is not null);", nativeQuery = true)
    List<Employee> getByEmloyeeWthoutUserAccount();

    
}
