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

@Table(name = "cheque_payment") // Table Mapping

@Data // Setter and getter auto generate karagnna meka gnnwa

@NoArgsConstructor // ALL construcorts generate wenawa

@AllArgsConstructor // all empty constructors generate wenawa

public class ChequePayment {

    @Id // primary key nisa use karanwa
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto increment nisa use karanwa
    private Integer id;

    @NotNull
    private String cheque_no;

    @NotNull
    private BigDecimal cheque_amount;

    @NotNull
    private LocalDate cheque_date;

    @ManyToOne
    @JoinColumn(name = "customer_payment_id", referencedColumnName = "id")
    @JsonIgnore// me property eka read karana eka block karanawa
    private CustomerPayment customer_payment_id ;
}
