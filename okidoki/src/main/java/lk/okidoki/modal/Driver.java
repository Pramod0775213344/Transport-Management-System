package lk.okidoki.modal;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
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

@Entity
@Table(name = "driver")

@Data
@NoArgsConstructor
@AllArgsConstructor

public class Driver {

    @Id//Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)//Auto increment
    private Integer id;

    @NotNull
    @Column(unique = true)
    private String driver_reg_no;

    @NotNull
    private String fullname;

    @NotNull
    private String callingname;

    @NotNull
    @Column(unique = true)
    private String nic;

    @NotNull
    @Column(unique = true)
    private String driving_license_no;

    @NotNull
    private LocalDate driving_license_expire_date;


    private String email;

    @NotNull
    @Column(unique = true)
    private String mobileno;

    @NotNull
    private LocalDateTime added_datetime;

    private LocalDateTime updated_datetime;

    private LocalDateTime deleted_datetime;

    @NotNull
    private Integer added_user_id;

    private Integer updated_user_id;

    private Integer deleted_user_id;

    @ManyToOne()
    @JoinColumn(name = "driver_status_id", referencedColumnName = "id")
    private DriverStatus driver_status_id;

    @ManyToOne(optional = true)
    @JoinColumn(name = "supplier_id", referencedColumnName = "id")
    private Supplier supplier_id;
}
