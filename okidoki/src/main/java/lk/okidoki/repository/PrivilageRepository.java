package lk.okidoki.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.okidoki.modal.Privilage;

public interface PrivilageRepository extends JpaRepository<Privilage, Integer> {

    @Query(value = "select p from Privilage p where p.role_id.id =?1 and p.module_id.id = ?2")
    Privilage getPrivilageByRoleModule(Integer roleid, Integer moduleid);

    @Query(value = "SELECT bit_or(p.privi_select) as selectcol , bit_or(p.privi_insert) as insertcol, bit_or(p.privi_update) as updatecol, bit_or(p.privi_delete) as deletecol FROM tms.privilage as p where p.module_id in (SELECT m.id FROM tms.module as m where m.name=?2) and p.role_id in(SELECT uhr.role_id FROM tms.user_has_role as uhr where uhr.user_id in (SELECT u.id FROM tms.user as u where u.username = ?1));",nativeQuery = true)
    String getUserPrivilageByUserAndModule(String username, String modulename);

}
