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
@Table(name = "fuel_cards")

@Data // setters and geeters auto genearte wenawa
@AllArgsConstructor // all arguemrnt constructor eka generate wenawa
@NoArgsConstructor // Empty constructor eka generate wenawa

public class FuelCards {

    @Id // Primary key eka nisa meka use karanawa
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto increment nisa meka danna oni
    private Integer id;

    @NotNull
    private String fuel_cards_no;

    private BigDecimal currunt_balance;

    @NotNull
    private LocalDateTime added_datetime;

    @NotNull
    private Integer added_user_id;

    private LocalDateTime update_datetime;

    private Integer update_user_id;

    @ManyToOne()
    @JoinColumn(name = "vehicle_id", referencedColumnName = "id")
    private Vehicle vehicle_id;

    @ManyToOne()
    @JoinColumn(name = "fuel_type_id", referencedColumnName = "id")
    private FuelType fuel_type_id;

    @ManyToOne()
    @JoinColumn(name = "fuel_card_status_id", referencedColumnName = "id")
    private FuelCardsStatus fuel_card_status_id;

}
