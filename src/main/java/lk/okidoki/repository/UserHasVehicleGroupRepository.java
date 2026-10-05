package lk.okidoki.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.okidoki.modal.User;
import lk.okidoki.modal.UserHasVehicleGroup;
import lk.okidoki.modal.VehicleGroup;

public interface UserHasVehicleGroupRepository extends JpaRepository<UserHasVehicleGroup, Integer> {

    // Check if a user has a specific vehicle group assigned
    @Query(value = "SELECT CASE WHEN COUNT(uhvg) > 0 THEN true ELSE false END FROM UserHasVehicleGroup uhvg WHERE uhvg.user_id = ?1 AND uhvg.vehicle_group_id = ?2")
    boolean existsByUserIdAndVehicleGroupId(User user_id, VehicleGroup vehicle_group_id);

    // Get UserHasVehicleGroup by user_id and vehicle_group_id
    @Query(value = "SELECT uhvg FROM UserHasVehicleGroup uhvg WHERE uhvg.user_id = ?1 AND uhvg.vehicle_group_id = ?2")
    UserHasVehicleGroup findByUserIdAndVehicleGroupId(User user_id, VehicleGroup vehicle_group_id);

    @Query("SELECT uhvg.vehicle_group_id.id FROM UserHasVehicleGroup uhvg " +
            "WHERE uhvg.user_id.id = ?1 AND uhvg.status = true")
    List<Integer> getVehicleGroupIdListByUserId(Integer userId);

}
