package lk.okidoki.modal;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "booking_has_location")

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingHasLocation {

//    composite primary key ekak nisa id kiyana eka danna oni
    @Id
    @ManyToOne()
    @JoinColumn(name = "booking_id",referencedColumnName = "id")
    private Booking booking_id ;

    @Id
    @ManyToOne()
    @JoinColumn(name = "location_id",referencedColumnName = "id")
    private Location location_id ;

}
