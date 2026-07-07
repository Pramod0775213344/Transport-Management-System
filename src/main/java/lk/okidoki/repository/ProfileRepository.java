package lk.okidoki.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.okidoki.modal.Profile;

public interface ProfileRepository extends JpaRepository<Profile, Integer> {

    @Query(value = "SELECT P FROM Profile P WHERE P.user_id.id = ?1")
    Profile getByUserId(Integer user_id);

}
