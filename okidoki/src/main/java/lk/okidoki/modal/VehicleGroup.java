package lk.okidoki.modal;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;


@Entity
// mema class eka entity ekak widihata hasirila Table eka ekka mapping eka hadanne entity anotation eka dammoth witharai
@Table(name = "vehicle_group")// Table Mapping eka

@Data //setters and getters create karaganna
@NoArgsConstructor// all arguemrnt constructor eka generate wenawa
@AllArgsConstructor//Empty constructor eka generate wenawa

public class VehicleGroup {

    @Id //primary key eka nisa
    @GeneratedValue(strategy = GenerationType.IDENTITY) //auto increment nisa
    private Integer id;

    @NotNull
    private String name;

    @NotNull
    private Integer added_user_id;

    @NotNull
    private LocalDateTime added_datetime;

    @ManyToOne()
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    private Customer customer_id;

    @ManyToMany(cascade = CascadeType.MERGE)
    // assosiaction table ekal nam me anotation eka use karanna oni
    @JoinTable(name = "vehicle_group_has_vehicle", joinColumns = @JoinColumn(name = "vehicle_group_id"), inverseJoinColumns = @JoinColumn(name = "vehicle_id"))
    private Set<Vehicle> vehicles;
}
