package lk.okidoki.modal;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
// mema class eka entity ekak widihata hasirila Table eka ekka mapping eka
// hadanne entity anotation eka dammoth witharai
@Table(name = "customer_payment") // Table Mapping eka

@Data // setters and getters create karaganna
@NoArgsConstructor // all arguemrnt constructor eka generate wenawa
@AllArgsConstructor // Empty constructor eka generate wenawa
public class CustomerPayment {

    @Id // primary key eka nisa
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto increment nisa
    private Integer id;

    @NotNull
    private String bill_no;

    private BigDecimal current_payment;

    private String method;

    @NotNull
    private LocalDateTime added_datetime;

    @NotNull
    private Integer added_user_id;

    @ManyToOne()
    @JoinColumn(name = "invoice_id", referencedColumnName = "id")
    private Invoice invoice_id;

    // (orphanRemoval = true) karanne inner side eke thiyena data remove karanna
    // puluwan nisa
    @OneToMany(mappedBy = "customer_payment_id", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChequePayment> chequePaymentList;

    // (orphanRemoval = true) karanne inner side eke thiyena data remove karanna
    // puluwan nisa
    @OneToMany(mappedBy = "customer_payment_id", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InterBankTransferPayment> interBankTransferPaymentList;
}
