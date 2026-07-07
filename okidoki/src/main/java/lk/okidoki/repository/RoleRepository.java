package lk.okidoki.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.okidoki.modal.Role;

public interface RoleRepository extends JpaRepository<Role,Integer>{

    @Query(value = "SELECT r FROM Role  r WHERE r.name != 'admin'")
    List<Role> getByRoleWithouAdmin();

}
