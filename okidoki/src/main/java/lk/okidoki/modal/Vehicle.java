package lk.okidoki.modal;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// mema class eka entity ekak widihata hasirila Table eka ekka mapping eka hadanne entity anotation eka dammoth witharai
@Entity

// Table Mapping eka
@Table(name = "vehicle")

@Data // setters and geeters auto genearte wenawa

@NoArgsConstructor // all arguemrnt constructor eka generate wenawa
@AllArgsConstructor // Empty constructor eka generate wenawa

public class Vehicle {

    @Id // Primary key eka nisa meka use karanawa
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto increment nisa meka danna oni
    private Integer id;

    @NotNull
    private String vehicle_no;

    @NotNull
    private String model;

    @NotNull
    private LocalDate make_year;

    @NotNull
    private LocalDate insurance_expire_date;

    @NotNull
    private LocalDate revenu_license_expire_date;

    private byte[] vehicle_photo;

    private byte[] cr_photo;

    private byte[] revenue_license_photo;

    private byte[] insurance_card_photo;

    private byte[] inspection_report_photo;

    private Integer startup_meter_reading;

    private Integer current_meter_reading;

    @NotNull
    private LocalDateTime added_datetime;

    private LocalDateTime updated_datetime;

    private LocalDateTime deleted_datetime;

    @NotNull
    private Integer added_user_id;

    private Integer updated_user_id;

    private Integer deleted_user_id;    

    @NotNull
    private String category;

    @ManyToOne()
    @JoinColumn(name = "supplier_id", referencedColumnName = "id")
    private Supplier supplier_id;

    @ManyToOne()
    @JoinColumn(name = "vehicle_type_id", referencedColumnName = "id")
    private VehicleType vehicle_type_id;

    @ManyToOne()
    @JoinColumn(name = "vehicle_status_id", referencedColumnName = "id")
    private VehicleStatus vehicle_status_id;

    @ManyToOne()
    @JoinColumn(name = "vehicle_make_id", referencedColumnName = "id")
    private VehicleMake vehicle_make_id;


}

