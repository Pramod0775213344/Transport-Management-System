package lk.okidoki.modal;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity

@Table(name = "customer_payment_has_booking") // Table Mapping

@Data // Setter and getter auto generate karagnna meka gnnwa

@NoArgsConstructor // ALL construcorts generate wenawa

@AllArgsConstructor // all empty constructors generate wenawa

public class CustomerPaymentHasBookings {
    //    composite primary key ekak nisa id kiyana eka danna oni
    @Id
    @ManyToOne()
    @JoinColumn(name = "customer_payment_id",referencedColumnName = "id")
    private CustomerPayment customer_payment_id ;

    @Id
    @ManyToOne()
    @JoinColumn(name = "booking_id",referencedColumnName = "id")
    private Booking booking_id ;
}
