package lk.okidoki.modal;


import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.*;
import org.hibernate.validator.constraints.Length;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// mema class eka entity ekak widihata hasirila table eka ekka mapping ekak hadanna oni nisa enttity anotation eka use karnw
@Entity

@Table(name = "customer_agreement") // Table Mapping

@Data // Setter and getter auto generate karagnna meka gnnwa

@NoArgsConstructor // ALL construcorts generate wenawa

@AllArgsConstructor // all empty constructors generate wenawa

public class CustomerAgreement {

    @Id // primary key nisa use karanwa
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto increment nisa use karanwa
    private Integer id;

    @NotNull
    @Length(max = 8)
    @Column(name = "cus_agreement_no", unique = true)
    private String cus_agreement_no;

    @NotNull
    private String agreement_date;

    @NotNull
    private String agreement_period;

    @NotNull
    private String agreement_end_date;

    @NotNull
    private String delivery_frequency;

    @NotNull
    private LocalDateTime added_datetime;

    private LocalDateTime updated_datetime;

    private LocalDateTime deleted_datetime;

    @NotNull
    private Integer added_user_id;

    private Integer updated_user_id;

    private Integer deleted_user_id;

    private String approval_note;


    private LocalDateTime approved_datetime;

    private Integer approved_user_id;

    private LocalDateTime reject_datetime;

    private Integer reject_user_id;


    @ManyToOne()
    @JoinColumn(name = "customer_agreement_status_id", referencedColumnName = "id")
    private CustomerAgreementStatus customer_agreement_status_id;

    @ManyToOne()
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    private Customer customer_id;

    @ManyToOne()
    @JoinColumn(name = "vehicle_type_id", referencedColumnName = "id")
    private VehicleType vehicle_type_id;

    @ManyToOne()
    @JoinColumn(name = "package_id", referencedColumnName = "id")
    private Package package_id;

}
