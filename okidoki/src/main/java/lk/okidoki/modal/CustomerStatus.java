package lk.okidoki.modal;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


// mema class eka entity ekak widihata hasirila Table eka ekka mapping eka hadanne entity anotation eka dammoth witharai
@Entity
// Table Mapping eka
@Table(name = "customer_status")

@Data //setters and geeters auto genearte wenawa
@AllArgsConstructor// all arguemrnt constructor eka generate wenawa
@NoArgsConstructor//Empty constructor eka generate wenawa

public class CustomerStatus {

    @Id//Primary key eka nisa meka use karanawa
    @GeneratedValue(strategy = GenerationType.IDENTITY)//Auto increment nisa meka danna oni
    private Integer id;

  
    private String status;

}
