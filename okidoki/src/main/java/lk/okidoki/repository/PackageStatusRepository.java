package lk.okidoki.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import lk.okidoki.modal.PackageStatus;

public interface PackageStatusRepository extends JpaRepository<PackageStatus,Integer> {

}
