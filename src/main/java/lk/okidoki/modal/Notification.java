package lk.okidoki.modal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// mema class eka entity ekak widihata hasirila table eka ekka mapping ekak hadanna oni nisa enttity anotation eka use karnw
@Entity

// Table Mapping
@Table(name = "notification")

@Data // Setter and getter auto generate karagnna meka gnnwa
@AllArgsConstructor // ALL construcorts generate wenawa
@NoArgsConstructor // all empty constructors generate wenawa
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String title;

    private String message;

    private String referenceType;

    private Integer referenceId;

    private String alert_type;

    private String addedDatetime;

}
