package lk.okidoki.modal;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

//Mema class eka entity ekak widihata hasirila table ekath ekka mapping ekak hadanna Entity anotation eka use karanwa
@Entity

// Table mapping eka
@Table(name = "department")

@Data //generatet seeter and getters
@AllArgsConstructor// all arguments constratctor generate wenawa
@NoArgsConstructor//empty constructor generate wenawa
public class Deaprtment {

    @Id//Primary key eka nusa use karanne
    @GeneratedValue(strategy = GenerationType.IDENTITY) //Auto increment nisa use karanwa
    private Integer id;

    private String name;
}
