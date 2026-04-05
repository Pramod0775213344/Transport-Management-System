package lk.okidoki.modal;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity

@Table(name = "invoice_has_booking") // Table Mapping

@Data // Setter and getter auto generate karagnna meka gnnwa

@NoArgsConstructor // ALL construcorts generate wenawa

@AllArgsConstructor // all empty constructors generate wenawa

public class InvoiceHasBookings {

    //    composite primary key ekak nisa id kiyana eka danna oni
    @Id
    @ManyToOne()
    @JoinColumn(name = "invoice_id",referencedColumnName = "id")
    private Invoice invoice_id ;

    @Id
    @ManyToOne()
    @JoinColumn(name = "booking_id",referencedColumnName = "id")
    private Booking booking_id ;
}
