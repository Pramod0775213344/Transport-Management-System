package lk.okidoki.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import lk.okidoki.modal.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {

}
