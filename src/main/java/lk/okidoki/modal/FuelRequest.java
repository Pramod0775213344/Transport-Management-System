package lk.okidoki.modal;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// mema class eka entity ekak widihata hasirila Table eka ekka mapping eka hadanne entity anotation eka dammoth witharai
@Entity
// Table Mapping eka
@Table(name = "fuel_request")

@Data // setters and geeters auto genearte wenawa
@AllArgsConstructor // all arguemrnt constructor eka generate wenawa
@NoArgsConstructor // Empty constructor eka generate wenawa

public class FuelRequest {

    @Id // Primary key eka nisa meka use karanawa
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto increment nisa meka danna oni
    private Integer id;

    @NotNull
    private String fuel_request_no;

    @NotNull
    private BigDecimal request_fuel_cost_amount;

    @NotNull
    private LocalDateTime added_datetime;

    @NotNull
    private Integer added_user_id;

    private LocalDateTime approved_datetime;

    private Integer approved_user_id;

    private LocalDateTime reject_datetime;

    private Integer reject_user_id;

    @ManyToOne()
    @JoinColumn(name = "booking_id", referencedColumnName = "id")
    private Booking booking_id;

    @ManyToOne()
    @JoinColumn(name = "fuel_cards_id", referencedColumnName = "id")
    private FuelCards fuel_cards_id;

    @ManyToOne()
    @JoinColumn(name = "vehicle_id", referencedColumnName = "id")
    private Vehicle vehicle_id;

    @ManyToOne()
    @JoinColumn(name = "driver_id", referencedColumnName = "id")
    private Driver driver_id;

    @ManyToOne()
    @JoinColumn(name = "fuel_price_id", referencedColumnName = "id")
    private FuelPrice fuel_price_id;

    @ManyToOne()
    @JoinColumn(name = "fuel_request_status_id", referencedColumnName = "id")
    private FuelRequestStatus fuel_request_status_id;
}
