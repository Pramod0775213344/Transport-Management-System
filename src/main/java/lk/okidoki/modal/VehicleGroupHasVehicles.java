package lk.okidoki.modal;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vehicle_group_has_vehicle")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VehicleGroupHasVehicles {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", referencedColumnName = "id", unique = true)
    private Vehicle vehicle_id;

    @ManyToOne
    @JoinColumn(name = "vehicle_group_id", referencedColumnName = "id")
    private VehicleGroup vehicle_group_id;

    @ManyToOne
    @JoinColumn(name = "home_group_id", referencedColumnName = "id")
    private VehicleGroup home_group_id;

    private Boolean is_temporary;
}
