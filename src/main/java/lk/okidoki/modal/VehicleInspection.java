package lk.okidoki.modal;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_inspection")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", referencedColumnName = "id")
    @NotNull
    private Vehicle vehicle_id;

    @ManyToOne
    @JoinColumn(name = "vehicle_inspection_status_id", referencedColumnName = "id")
    @NotNull
    private VehicleInspectionStatus vehicle_inspection_status_id;

    @NotNull
    private LocalDateTime inspection_datetime;

    @NotNull
    private String odometer_reading;

    @NotNull
    private String valid_period;

    @NotNull
    private LocalDateTime next_inspection_date;

    @NotNull
    private Boolean tires_ok;

    @NotNull
    private Boolean brakes_ok;

    @NotNull
    private Boolean lights_ok;

    @NotNull
    private Boolean engine_oil_ok;

    @NotNull
    private Boolean coolant_ok;

    @NotNull
    private Boolean battery_ok;

    @NotNull
    private Boolean body_condition_ok;

    private String remarks;

    @Column(columnDefinition = "LONGBLOB")
    private byte[] inspection_photo;

    @NotNull
    private LocalDateTime added_datetime;

    private LocalDateTime updated_datetime;

    private LocalDateTime deleted_datetime;

    @NotNull
    private Integer added_user_id;

    private Integer updated_user_id;

    private Integer deleted_user_id;
}
