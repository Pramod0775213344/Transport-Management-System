package lk.okidoki.modal;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "route")
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    private String route_name;

    @NotNull
    private String route_distance;

    @NotNull
    private LocalDateTime added_datetime;

    @NotNull
    private Integer added_user_id;

    private LocalDateTime updated_datetime;

    private Integer updated_user_id;

    private LocalDateTime deleted_datetime;

    private Integer deleted_user_id;

    @ManyToOne()
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    public Customer customer_id;

    @ManyToOne()
    @JoinColumn(name = "pickup_locations_id", referencedColumnName = "id")
    public PickupLocation pickup_locations_id;

    @ManyToOne()
    @JoinColumn(name = "delivery_locations_id", referencedColumnName = "id")
    public DeliveryLocation delivery_locations_id;

    @ManyToOne()
    @JoinColumn(name = "route_status_id", referencedColumnName = "id")
    public RouteStatus route_status_id;

    @ManyToMany(cascade = CascadeType.MERGE)
    // assosiaction table ekal nam me anotation eka use karanna oni
    @JoinTable(name = "route_has_location", joinColumns = @JoinColumn(name = "route_id"), inverseJoinColumns = @JoinColumn(name = "location_id"))
    private Set<Location> locations;

}
