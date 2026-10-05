package lk.okidoki.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import lk.okidoki.modal.BookingBreakdown;

public interface BookingBreakdownRepository extends JpaRepository<BookingBreakdown, Integer> {

}
