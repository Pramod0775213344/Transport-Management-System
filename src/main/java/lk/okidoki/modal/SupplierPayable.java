package lk.okidoki.modal;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
// mema class eka entity ekak widihata hasirila Table eka ekka mapping eka
// hadanne entity anotation eka dammoth witharai
@Table(name = "supplier_payable") // Table Mapping eka

@Data // setters and getters create karaganna
@NoArgsConstructor // all arguemrnt constructor eka generate wenawa
@AllArgsConstructor // Empty constructor eka generate wenawa
public class SupplierPayable {

    @Id // primary key eka nisa
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto increment nisa
    private Integer id;

    @NotNull
    private String month;

    @NotNull
    private LocalDate date;

    @NotNull
    private String batch_no;

    @NotNull
    private BigDecimal total_distance;

    @NotNull
    private BigDecimal total_amount;


    private BigDecimal paid_amount;


    private BigDecimal pending_amount;

    @NotNull
    private LocalDateTime added_datetime;

    @NotNull
    private Integer added_user_id;

    @ManyToOne()
    @JoinColumn(name = "supplier_agreement_id", referencedColumnName = "id")
    private SupplierAgreement supplier_agreement_id;

    @ManyToOne()
    @JoinColumn(name = "supplier_payable_status_id", referencedColumnName = "id")
    private SupplierPayableStatus supplier_payable_status_id;

}
