package lk.okidoki.modal;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
// mema class eka entity ekak widihata hasirila Table eka ekka mapping eka hadanne entity anotation eka dammoth witharai
@Table(name = "invoice")// Table Mapping eka

@Data //setters and getters create karaganna
@NoArgsConstructor// all arguemrnt constructor eka generate wenawa
@AllArgsConstructor//Empty constructor eka generate wenawa
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) //auto increment nisa
    private Integer id;

    @NotNull
    private String invoice_no;

    @NotNull
    private String invoice_month;

    @NotNull
    private LocalDate invoice_date;

    @NotNull
    private BigDecimal invoice_subtotal;

    @NotNull
    private BigDecimal invoice_tax;

    @NotNull
    private BigDecimal invoice_total;

    @NotNull
    private String incoice_issue_date;

    @NotNull
    private String invoice_due_date;

    @NotNull
    private Integer added_user_id;

    @NotNull
    private LocalDateTime added_datetime;

    private Integer updated_user_id ;

    private LocalDateTime updated_datetime;

    private LocalDateTime deleted_datetime ;

    private Integer deleted_user_id;

    private BigDecimal paid_amount;

    private BigDecimal balance_amount;

    private Integer additional_amount;

    @ManyToOne()
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    private Customer customer_id;
    
    @ManyToOne()
    @JoinColumn(name = "invoice_status_id", referencedColumnName = "id")
    private InvoiceStatus invoice_status_id;


    @ManyToMany(cascade = CascadeType.MERGE)
    // assosiaction table ekal nam me anotation eka use karanna oni
    @JoinTable(name = "invoice_has_booking", joinColumns = @JoinColumn(name = "invoice_id"), inverseJoinColumns = @JoinColumn(name = "booking_id"))
    private Set<Booking> bookings;
}
