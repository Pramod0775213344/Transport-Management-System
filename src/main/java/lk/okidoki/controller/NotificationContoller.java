package lk.okidoki.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lk.okidoki.modal.Notification;
import lk.okidoki.modal.NotificationReadStatus;
import lk.okidoki.repository.NotificationReadStatusRepository;
import lk.okidoki.repository.NotificationRepository;

@RestController
public class NotificationContoller {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationReadStatusRepository notificationReadStatusRepository;

 
    // get mapping for unread notifications witharak ganna (url -->
    // /notification/unread?userId=5)
    @GetMapping(value = "/notification/unread", params = { "userId" }, produces = "application/json")
    public List<NotificationReadStatus> getUnreadNotifications(@RequestParam(value = "userId") Integer userId) {
        return notificationReadStatusRepository.findNotificationByUserIdAndReadStatus(userId);
    }

    // put mapping for notification eka read kiyala mark karanna
    // url --> /notification/read?id=12 (meke id eka notification_read_status table
    // eke id eka)
    @PutMapping(value = "/notification/read", params = { "id" }, produces = "application/json")
    public String markAsRead(@RequestParam(value = "id") Integer id) {
        try {
            NotificationReadStatus readStatus = notificationReadStatusRepository.findNotificationReadStatusById(id);
            if (readStatus != null) {
                readStatus.setIsRead("1");
                notificationReadStatusRepository.save(readStatus);
                return "ok";
            } else {
                return "Notification not found";
            }
        } catch (Exception e) {
            return "Update Not Completed :" + e.getMessage();
        }
    }

    // get mapping for mark all notifications as read (url --> /notification/readAll?userId=5)
    @PutMapping(value = "/notification/readAll", params = { "userId" }, produces = "application/json")
    public String markAllAsRead(@RequestParam(value = "userId") Integer userId) {
        try {
            List<NotificationReadStatus> readStatuses = notificationReadStatusRepository.findNotificationByUserIdAndReadStatus(userId);
            for (NotificationReadStatus readStatus : readStatuses) {
                readStatus.setIsRead("1");
                notificationReadStatusRepository.save(readStatus);
            }
            return "ok";
        } catch (Exception e) {
            return "Update Not Completed :" + e.getMessage();
        }
    }

    // delete mapping for read_status row eka delete karanna (url -->
    // /notification/delete?id=3)
    @DeleteMapping(value = "/notification/delete", params = { "id" })
    public String deleteNotification(@RequestParam Integer id) {
        try {
            notificationReadStatusRepository.deleteById(id);
            return "ok";
        } catch (Exception e) {
            return "Delete Not Completed :" + e.getMessage();
        }
    }
}
