package lk.okidoki.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import lk.okidoki.modal.NotificationReadStatus;

public interface NotificationReadStatusRepository extends JpaRepository<NotificationReadStatus, Integer> {

    @Query(value = "SELECT nrs.* FROM tms.notification as n join tms.notification_read_status as nrs on nrs.notification_id = n.id where nrs.user_id =?1 and nrs.is_read ='0' order by nrs.id DESC",nativeQuery = true)
    List<NotificationReadStatus> findNotificationByUserIdAndReadStatus(Integer userId);

    @Query(value = "SELECT * FROM tms.notification_read_status as nrs where nrs.id=?1",nativeQuery = true)
    NotificationReadStatus findNotificationReadStatusById(Integer id);

}
