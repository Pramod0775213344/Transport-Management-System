package lk.okidoki.modal;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.validator.constraints.Length;

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
@Table(name = "supplier")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Supplier {

    @Id // primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto increment
    private Integer id;

    private String fullname;

    private String callingname;

    private String address;

    @Column(name = "nic", unique = true)
    private String nic;

    private String driving_licence_no;

    private LocalDate driving_licencen_expiredate;

    @Length(max = 10)
    @Column(name = "mobileno", unique = true)
    private String mobileno;

    @Column(name = "email", unique = true)
    private String email;

    private String category_type;

    private String company_name;

    private String company_reg_no;

    private String company_address;

    private String company_email;

    private String company_contact_no;

    private String company_contact_person_mobileno;

    private String company_contact_person_email;

    @NotNull
    private LocalDateTime added_datetime;

    private LocalDateTime updated_datetime;

    private LocalDateTime deleted_datetime;

    @NotNull
    private Integer added_user_id;

    private Integer updated_user_id;

    private Integer deleted_user_id;

    @NotNull
    private String bank_name;

    @NotNull
    private String branch_name;

    @NotNull
    private String account_no;

    @NotNull
    private String account_holder_name;

    @NotNull
    private Boolean driving_status;

    @NotNull
    private String transportname;

    @ManyToOne()
    @JoinColumn(name = "supplier_status_id", referencedColumnName = "id")
    public SupplierStatus supplier_status_id;

}
