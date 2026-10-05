package lk.okidoki.modal;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity // mema class eka entity ekak widihata hasirila Table eka ekka mapping eka
// hadanne entity anotation eka dammoth witharai
@Table(name = "booking_breakdown") // Table Mapping eka

@Data // setters and getters create karaganna
@NoArgsConstructor // all arguemrnt constructor eka generate wenawa
@AllArgsConstructor // Empty constructor eka generate wenawa
public class BookingBreakdown {

    @Id // primary key eka nisa
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto increment nisa
    private Integer id;

    private Integer old_vehicle_id;
    private Integer old_driver_id;

    private LocalDateTime old_arrived_at_pickup_datetime;
    private LocalDateTime old_departed_from_pickup_datetime;
    private LocalDateTime old_arrived_at_delivery_datetime;
    private LocalDateTime old_departed_from_delivery_datetime;

    private Integer added_user_id;
    private LocalDateTime added_datetime;

    @ManyToOne()
    @JoinColumn(name = "booking_id", referencedColumnName = "id")
    private Booking booking_id;
}
