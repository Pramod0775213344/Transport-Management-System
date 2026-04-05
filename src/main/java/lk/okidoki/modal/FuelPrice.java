package lk.okidoki.modal;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
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

@Entity
@Table(name = "fuel_price")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FuelPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "fuel_type_id", referencedColumnName = "id")
    @NotNull
    private FuelType fuel_type_id;

    @NotNull
    @Column(precision = 10, scale = 2)
    private BigDecimal unit_price;

    @NotNull
    private LocalDateTime effective_date;

    @NotNull
    private Boolean is_current;

    @NotNull
    private LocalDateTime updated_datetime;

    @NotNull
    private Integer updated_user_id;

}
