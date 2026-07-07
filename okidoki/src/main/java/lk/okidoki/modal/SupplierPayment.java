package lk.okidoki.modal;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
// mema class eka entity ekak widihata hasirila Table eka ekka mapping eka hadanne entity anotation eka dammoth witharai
@Table(name = "supplier_payment")// Table Mapping eka

@Data //setters and getters create karaganna
@NoArgsConstructor// all arguemrnt constructor eka generate wenawa
@AllArgsConstructor//Empty constructor eka generate wenawa
public class SupplierPayment {

    @Id //primary key eka nisa
    @GeneratedValue(strategy = GenerationType.IDENTITY) //auto increment nisa
    private Integer id;

    @NotNull
    private String bill_no;

    @NotNull
   private BigDecimal total_amount;

    @NotNull
    private BigDecimal due_amount ;

    @NotNull
    private BigDecimal current_payment;

    @NotNull
    private String method ;

    @NotNull
    private BigDecimal balance_amount ;

    @NotNull
    private LocalDateTime added_datetime;

    @NotNull
    private Integer added_user_id ;

    @ManyToOne()
    @JoinColumn(name = "booking_id",referencedColumnName = "id")
    private Booking booking_id;

}

