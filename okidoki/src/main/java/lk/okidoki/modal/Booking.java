package lk.okidoki.modal;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Entity// mema class eka entity ekak widihata hasirila Table eka ekka mapping eka hadanne entity anotation eka dammoth witharai
@Table(name = "booking")// Table Mapping eka

@Data //setters and getters create karaganna
@NoArgsConstructor// all arguemrnt constructor eka generate wenawa
@AllArgsConstructor//Empty constructor eka generate wenawa

public class    Booking {

    @Id //primary key eka nisa
    @GeneratedValue(strategy = GenerationType.IDENTITY) //auto increment nisa
    private Integer id;

    private String booking_no;

    @NotNull
    private LocalDateTime pickup_date_time;

    @NotNull
    private LocalDateTime delivery_date_time;

    @NotNull
    private String distance ;

    private String note;

    @NotNull
    private LocalDateTime added_datetime;

    private LocalDateTime updated_datetime;

    private LocalDateTime deleted_datetime;

    @NotNull
    private Integer added_user_id;

    private Integer updated_user_id;

    private Integer deletd_user_id;

    private Integer assigned_user_id;

    private LocalDateTime assigned_date_time;

    private String strat_meter_reading;

    private String end_meter_reading;

    private String additional_km;

    @NotNull
    private String booking_contact_person_name;

    @NotNull
    private String booking_contact_person_mobileno ;

    @ManyToOne()
    @JoinColumn(name = "pickup_locations_id",referencedColumnName = "id")
    private PickupLocation pickup_locations_id;

    @ManyToOne()
    @JoinColumn(name = "delivery_locations_id",referencedColumnName = "id")
    private DeliveryLocation delivery_locations_id;

    @ManyToOne()
    @JoinColumn(name = "customer_id",referencedColumnName = "id")
  private Customer customer_id ;

    @ManyToOne()
    @JoinColumn(name = "vehicle_id",referencedColumnName = "id")
    private Vehicle vehicle_id ;

    @ManyToOne()
    @JoinColumn(name = "driver_id",referencedColumnName = "id")
  private Driver driver_id ;

    @ManyToOne()
    @JoinColumn(name = "vehicle_type_id",referencedColumnName = "id")
    private VehicleType vehicle_type_id;

    @ManyToOne()
    @JoinColumn(name = "booking_status_id",referencedColumnName = "id")
    private BookingStatus booking_status_id;

    @ManyToOne()
    @JoinColumn(name = "customer_agreement_id",referencedColumnName = "id")
    private CustomerAgreement customer_agreement_id;

    @ManyToMany(cascade = CascadeType.MERGE)
    // assosiaction table ekal nam me anotation eka use karanna oni
    @JoinTable(name = "booking_has_location", joinColumns = @JoinColumn(name = "booking_id"), inverseJoinColumns = @JoinColumn(name = "location_id"))
    private Set<Location> locations;

    private LocalDateTime arrived_at_pickup_datetime;

    private LocalDateTime departed_from_pickup_datetime;

    private LocalDateTime arrived_at_delivery_datetime;

    private LocalDateTime departed_from_delivery_datetime;

    public Booking(String booking_no, Vehicle vehicle_id, String distance) {
        this.booking_no = booking_no;
        this.vehicle_id = vehicle_id;
        this.distance = distance;
    }
}

