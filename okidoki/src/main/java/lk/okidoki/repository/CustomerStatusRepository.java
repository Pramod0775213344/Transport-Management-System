package lk.okidoki.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import lk.okidoki.modal.CustomerStatus;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CustomerStatusRepository extends JpaRepository<CustomerStatus,Integer> {

//    get customer status without delete status
    @Query(value = "SELECT * FROM tms.customer_status as cs where cs.id <> 3;",nativeQuery = true)
    public List<CustomerStatus> getCustomerStatusWithoutDelete();
}
