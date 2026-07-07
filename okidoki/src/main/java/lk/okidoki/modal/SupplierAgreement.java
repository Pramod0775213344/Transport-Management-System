package lk.okidoki.modal;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.validator.constraints.Length;

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

// mema class eka entity ekak widihata hasirila table eka ekka mapping ekak hadanna oni nisa enttity anotation eka use karnw
@Entity

@Table(name = "supplier_agreement") // Table Mapping

@Data // Setter and getter auto generate karagnna meka gnnwa

@NoArgsConstructor // ALL construcorts generate wenawa

@AllArgsConstructor // all empty constructors generate wenawa

public class SupplierAgreement {
    @Id // primary key nisa use karanwa
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto increment nisa use karanwa
    private Integer id;

    @NotNull
    @Length(max = 8)
    @Column(name = "sup_agreement_no", unique = true)
    private String sup_agreement_no;

    @NotNull
    private String agreement_date;

    @NotNull
    private String agreement_period;

    @NotNull
    private String agreement_end_date;


    @NotNull
    private LocalDateTime added_datetime;

    private LocalDateTime updated_datetime;

    private LocalDateTime deleted_datetime;

    @NotNull
    private Integer added_user_id;

    private Integer updated_user_id;

    private Integer deleted_user_id;

    private BigDecimal agreement_charge;

    private BigDecimal additional_charge;

    private BigDecimal total_amount;

    private String special_note;

    private String approval_note;

    private LocalDateTime approved_datetime;

    private Integer approved_user_id;

    private LocalDateTime reject_datetime;

    private Integer reject_user_id;

    @ManyToOne()
    @JoinColumn(name = "supplier_agreement_status_id", referencedColumnName = "id")
    private SupplierAgreementStatus supplier_agreement_status_id;

    @ManyToOne()
    @JoinColumn(name = "supplier_id", referencedColumnName = "id")
    private Supplier supplier_id;

    @ManyToOne()
    @JoinColumn(name = "vehicle_id", referencedColumnName = "id")
    private Vehicle vehicle_id;

    @ManyToOne()
    @JoinColumn(name = "package_id", referencedColumnName = "id")
    private Package package_id;
}
