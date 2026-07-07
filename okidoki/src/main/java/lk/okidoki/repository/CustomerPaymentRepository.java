package lk.okidoki.repository;

import lk.okidoki.modal.CustomerPayment;
import org.springframework.data.jpa.repository.JpaRepository;


public interface CustomerPaymentRepository extends JpaRepository<CustomerPayment,Integer> {

}
