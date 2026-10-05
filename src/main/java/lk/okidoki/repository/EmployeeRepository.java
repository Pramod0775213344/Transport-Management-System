package lk.okidoki.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.okidoki.modal.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Integer> {

    // Me query eken karanne employee table eke thiyena wadima 'emp_no' eka aragena,
    // eke numeric part ekata 1k ekathu karala, digit 5kak wena widihata zeros pad
    // karala (lpad),
    // aluth auto-generated 'EMP' number ekak hadana eka.
    @Query(value = "SELECT concat('EMP', lpad(substring(max(e.emp_no),4)+1,5,0)) FROM tms.employee as e;", nativeQuery = true)
    // @Query anotation eke thiyena output eka me function eke body ekata
    // automaticaly assigning wenawa
    String getNextEmpNo();

    // nic eka details database eken ganna query eka
    @Query(value = "select e from Employee  e where e.nic =?1")
    Employee getByNic(String nic);

    @Query(value = "select e from Employee e where e.email = ?1")
    Employee getByEmail(String email);

    // mobile no details database ganna query eka
    @Query(value = "select e from Employee e where e.mobileno = ?1")
    Employee getByMobileNo(String mobileno);

    // user accont nathi employees witharak ganna query eka
    @Query(value = "SELECT * FROM tms.employee as e where e.id not in (SELECT u.employee_id FROM tms.user as u where u.employee_id is not null) and e.employee_status_id = 2;", nativeQuery = true)
    List<Employee> getByEmloyeeWthoutUserAccount();

}
