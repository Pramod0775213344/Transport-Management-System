package lk.okidoki.modal;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// mema class eka entity ekak widihata hasirila table eka ekka mapping ekak hadanna oni nisa enttity anotation eka use karnw
@Entity
// Table Mapping
@Table(name = "user_has_vehicle_group")

@Data // Setter and getter auto generate karagnna meka gnnwa
@AllArgsConstructor // ALL construcorts generate wenawa
@NoArgsConstructor // all empty constructors generate wenawa
public class UserHasVehicleGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto increment nisa use karanawa
    private Integer id;

    @ManyToOne()
    @JoinColumn(name = "user_id")
    private User user_id;

    @ManyToOne()
    @JoinColumn(name = "vehicle_group_id")
    private VehicleGroup vehicle_group_id;

    @NotNull
    private Integer added_user_id;

    @NotNull
    private LocalDateTime added_datetime;

    private Boolean status;

}
