package lk.okidoki.modal;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

// mema class eka entity ekak widihata hasirila table eka ekka mapping ekak hadanna oni nisa enttity anotation eka use karnw
@Entity

@Table(name = "inter_bank_transfer_payment") // Table Mapping

@Data // Setter and getter auto generate karagnna meka gnnwa

@NoArgsConstructor // ALL construcorts generate wenawa

@AllArgsConstructor // all empty constructors generate wenawa

public class InterBankTransferPayment {

    @Id // primary key nisa use karanwa
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto increment nisa use karanwa
    private Integer id;

    @NotNull
    private String reference_no;

    @NotNull
    private BigDecimal amount;

    @NotNull
    private LocalDate ibt_date;

    @ManyToOne
    @JoinColumn(name = "customer_payment_id", referencedColumnName = "id")
    @JsonIgnore// me property eka read karana eka block karanawa
    private CustomerPayment customer_payment_id ;
}
