package lk.okidoki.modal;

import java.time.LocalDateTime;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// mema class eka entity ekak widihata hasirila table eka ekka mapping ekak hadanna oni nisa enttity anotation eka use karnw
@Entity
// Table Mapping
@Table(name = "user")

@Data // Setter and getter auto generate karagnna meka gnnwa
@AllArgsConstructor // ALL construcorts generate wenawa
@NoArgsConstructor // all empty constructors generate wenawa
public class User {

    @Id // primary key nisa use karanwa
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto increment nisa use karanwa
    private Integer id;

    @NotNull
    @Column(name = "username", unique = true)
    private String username;

    @NotNull
    @Column(name = "email", unique = true)
    private String email;

    @NotNull
    @Column(name = "password", unique = true)
    private String password;

    @NotNull
    private Boolean status;

    private byte[] user_photo;

    @NotNull
    private LocalDateTime added_datetime;

    private LocalDateTime updated_datetime;

    private LocalDateTime deleted_datetime;

    private String note;


    private String otp;

    // optinal nam me widihata optinal true karann oni
    @ManyToOne(optional = true)
    @JoinColumn(name = "employee_id", referencedColumnName = "id")
    private Employee employee_id;

    @ManyToMany(cascade = CascadeType.MERGE)
    // assosiaction table ekal nam me anotation eka use karanna oni
    @JoinTable(name = "user_has_role", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles;

}
 
