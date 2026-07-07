package lk.okidoki.modal;

import java.math.BigDecimal;
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
@Table(name = "package")

@Data//Setter and getter auto generate karagnna meka gnnwa
@AllArgsConstructor//ALL construcorts generate wenawa
@NoArgsConstructor //all empty constructors generate wenawa
public class Package {

    @Id //primary key nisa use karanwa
    @GeneratedValue(strategy = GenerationType.IDENTITY)// auto increment nisa use karanawa
    private Integer id;

    @NotNull
    private String name; 

    @NotNull
    private BigDecimal distance;

    @NotNull
    private BigDecimal additinal_km_charge_cus;
    
    @NotNull
    private BigDecimal additinal_km_charge_sup;

    @NotNull
    private BigDecimal package_charge_cus;

    @NotNull
    private BigDecimal package_charge_sup;

    @NotNull
    private String package_type;
   
    @NotNull
    private LocalDateTime added_datetime;

    private LocalDateTime updated_datetime;

    private LocalDateTime deleted_datetime;
  
    @NotNull
    private Integer added_user_id;

    private Integer updated_user_id;

    private Integer deleted_user_id;
   
    @ManyToOne
    @JoinColumn(name = "vehicle_type_id", referencedColumnName = "id")
    private VehicleType vehicle_type_id;

    @ManyToOne
    @JoinColumn(name = "package_status_id", referencedColumnName = "id")
    private PackageStatus package_status_id;

}
 