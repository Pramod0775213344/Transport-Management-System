package lk.okidoki.modal;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// mema class eka entity ekak widihata hasirila table eka ekka mapping ekak hadanna oni nisa enttity anotation eka use karnw
@Entity

// Table Mapping
@Table(name = "location")

@Data//Setter and getter auto generate karagnna meka gnnwa
@AllArgsConstructor//ALL construcorts generate wenawa
@NoArgsConstructor //all empty constructors generate wenawa
public class Location {

    @Id //primary key nisa use karanwa
    @GeneratedValue(strategy = GenerationType.IDENTITY)// auto increment nisa use karanawa
    private Integer id;

    private String name;

    private String address;

    @NotNull
    private Integer added_user_id;

    private Integer updated_user_id;

    private Integer deleted_user_id;

    @NotNull
    private LocalDateTime added_datetime;

    private LocalDateTime updated_datetime;

    private LocalDateTime deleted_datetime;

    @ManyToOne()
    @JoinColumn(name = "customer_id",referencedColumnName = "id")
    private Customer customer_id;


}
 