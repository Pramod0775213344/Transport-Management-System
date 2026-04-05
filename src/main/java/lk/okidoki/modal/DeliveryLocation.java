package lk.okidoki.modal;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// mema class eka entity ekak widihata hasirila table eka ekka mapping ekak hadanna oni nisa enttity anotation eka use karnw
@Entity

// Table Mapping
@Table(name = "delivery_locations")

@Data // Setter and getter auto generate karagnna meka gnnwa
@AllArgsConstructor // ALL construcorts generate wenawa
@NoArgsConstructor // all empty constructors generate wenawa
public class DeliveryLocation {

    @Id // primary key nisa use karanwa
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto increment nisa use karanawa
    private Integer id;

    private String name;

    private String address;

    @ManyToOne()
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    private Customer customer_id;

    private Double latitude;
    private Double longitude;

    private Integer added_user_id;

    private Integer deleted_user_id;

    private LocalDateTime added_datetime;

    private LocalDateTime deleted_datetime;

    @ManyToOne()
    @JoinColumn(name = "delivery_locations_status_id", referencedColumnName = "id")
    private DeliveryLocationStatus delivery_locations_status_id;
}
