package lk.okidoki.controller;

import lk.okidoki.modal.BookingStatus;
import lk.okidoki.repository.BookingStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class BookingStatusController {

    @Autowired // genarate instance
    private BookingStatusRepository bookingStatusRepository;

    // Request mapping for load bookingstatus all data (url
    // -->//bookingstatus/alldata)
    @GetMapping(value = "/bookingstatus/alldata", produces = "application/json")
    public List<BookingStatus> findAllData() {

        return bookingStatusRepository.findAll();
    }
}
