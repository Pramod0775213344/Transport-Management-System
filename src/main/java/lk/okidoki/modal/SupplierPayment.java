package lk.okidoki.modal;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
// mema class eka entity ekak widihata hasirila Table eka ekka mapping eka
// hadanne entity anotation eka dammoth witharai
@Table(name = "supplier_payment") // Table Mapping eka

@Data // setters and getters create karaganna
@NoArgsConstructor // all arguemrnt constructor eka generate wenawa
@AllArgsConstructor // Empty constructor eka generate wenawa
public class SupplierPayment {

    @Id // primary key eka nisa
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto increment nisa
    private Integer id;

    @NotNull
    private String bill_no;

    @NotNull
    private BigDecimal amount_paid;

    @NotNull
    private String method;

    @NotNull
    private LocalDateTime added_datetime;

    @NotNull
    private Integer added_user_id;

    private String reference_no;

    @ManyToOne()
    @JoinColumn(name = "supplier_payable_id", referencedColumnName = "id")
    private SupplierPayable supplier_payable_id;

}
