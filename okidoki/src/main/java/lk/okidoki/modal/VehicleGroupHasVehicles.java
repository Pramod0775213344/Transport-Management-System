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

//    composite primary key ekak nisa id kiyana eka danna oni
    @Id
    @ManyToOne()
    @JoinColumn(name = "vehicle_group_id",referencedColumnName = "id")
    private VehicleGroup vehicle_group_id ;

    @Id
    @ManyToOne()
    @JoinColumn(name = "vehicle_id",referencedColumnName = "id")
    private Vehicle vehicle_id ;


    @Id
    @ManyToOne()
    @JoinColumn(name = "vehicle_group_customer_id",referencedColumnName = "id")
    private Customer vehicle_group_customer_id ;

}
