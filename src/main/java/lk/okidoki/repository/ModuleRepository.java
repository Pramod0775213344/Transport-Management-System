package lk.okidoki.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import lk.okidoki.modal.Module;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ModuleRepository extends JpaRepository<Module,Integer>{

    @Query(value = "SELECT * FROM tms.module as m where m.id not in(SELECT p.module_id FROM tms.privilage as p where p.privi_select=true and p.role_id in(SELECT uhr.role_id FROM tms.user_has_role as uhr where uhr.user_id in(SELECT u.id FROM tms.user as u where u.username =?1)))",nativeQuery = true)
    List<Module> getModuleIdByUserName(String username);

//    log userta adala modules gannawa
    @Query(value = "SELECT * FROM tms.module as m where m.id in(SELECT p.module_id FROM tms.privilage as p where p.privi_select=true and p.role_id in(SELECT uhr.role_id FROM tms.user_has_role as uhr where uhr.user_id in(SELECT u.id FROM tms.user as u where u.username =?1)))",nativeQuery = true)
    List<Module> getModuleByUserName(String username);
}
