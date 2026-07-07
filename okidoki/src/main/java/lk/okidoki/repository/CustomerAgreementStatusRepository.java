package lk.okidoki.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import lk.okidoki.modal.CustomerAgreementStatus;

public interface CustomerAgreementStatusRepository extends JpaRepository<CustomerAgreementStatus,Integer> {

}
