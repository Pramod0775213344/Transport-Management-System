package lk.okidoki.modal;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


// mema class eka entity ekak widihata hasirila Table eka ekka mapping eka hadanne entity anotation eka dammoth witharai
@Entity
// Table Mapping eka
@Table(name = "booking_status")

@Data //setters and geeters auto genearte wenawa
@AllArgsConstructor// all arguemrnt constructor eka generate wenawa
@NoArgsConstructor//Empty constructor eka generate wenawa

public class BookingStatus {

    @Id//Primary key eka nisa meka use karanawa
    @GeneratedValue(strategy = GenerationType.IDENTITY)//Auto increment nisa meka danna oni
    private Integer id;

  
    private String status;

}
