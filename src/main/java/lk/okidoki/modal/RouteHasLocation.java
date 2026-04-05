package lk.okidoki.modal;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "route_has_location")

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RouteHasLocation {

//    composite primary key ekak nisa id kiyana eka danna oni
    @Id
    @ManyToOne()
    @JoinColumn(name = "route_id",referencedColumnName = "id")
    private Route route_id ;

    @Id
    @ManyToOne()
    @JoinColumn(name = "location_id",referencedColumnName = "id")
    private Location location_id ;

}
