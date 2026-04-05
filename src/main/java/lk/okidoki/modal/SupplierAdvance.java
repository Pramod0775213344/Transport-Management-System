package lk.okidoki.modal;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "supplier_advance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierAdvance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    private String advance_no;

    @NotNull
    private BigDecimal amount;

    @NotNull
    private String description;

    @NotNull
    private LocalDateTime added_datetime;

    @NotNull
    private Integer added_user_id;

    @NotNull
    private String payment_method;

    private String reference_no;

    private LocalDateTime approved_datetime;

    private Integer approved_user_id;

    private LocalDateTime rejected_datetime;

    private Integer rejected_user_id;

    @ManyToOne(optional = true)
    @JoinColumn(name = "supplier_id", referencedColumnName = "id")
    private Supplier supplier_id;

    @ManyToOne(optional = true)
    @JoinColumn(name = "vehicle_id", referencedColumnName = "id")
    private Vehicle vehicle_id;

    @ManyToOne(optional = true)
    @JoinColumn(name = "supplier_advance_status_id", referencedColumnName = "id")
    private SupplierAdvanceStatus supplier_advance_status_id;

}
