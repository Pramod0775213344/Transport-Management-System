package lk.okidoki.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.okidoki.modal.User;

public interface UserRepository extends JpaRepository<User, Integer> {

    @Query(value = "select u from User u where u.username = ?1")
    User getByUsername(String username);

    @Query(value = "select u from User u where u.username <> ?1 and u.username <> 'Admin' order by u.id desc")
    List<User> findAll(String username);

    @Query(value = "select u from User u where u.email = ?1")
    User getByEmail(String email);

    // get user list
    @Query(value = "select u from User u where u.username <> 'Admin' order by u.id desc")
    List<User> getAllUsersExcludingAdmin();

    @Query(value = "SELECT * FROM tms.user as u where u.otp =?1", nativeQuery = true)
    User getUserByOtp(String otp);

    // user list eka gnnawa role id ekata anuwa
    @Query(value = "SELECT u.* FROM tms.user as u join tms.user_has_role as uhr on uhr.user_id = u.id where uhr.role_id = ?1", nativeQuery = true)
    List<User> getUserListByRole(Integer roleId);

}
