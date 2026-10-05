package lk.okidoki.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import lk.okidoki.modal.ChequePayment;

public interface chequePaymentsRepository extends JpaRepository<ChequePayment, Integer> {

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM ChequePayment c WHERE c.cheque_no = :cheque_no")
    boolean existsByChequeNo(@Param("cheque_no") String cheque_no);

}
