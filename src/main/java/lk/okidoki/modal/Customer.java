package lk.okidoki.modal;

import java.time.LocalDateTime;


import jakarta.persistence.*;
import org.hibernate.validator.constraints.Length;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "customer")

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Customer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id ;


    @Column(name = "customer_reg_no",unique = true)
    @Length(max = 8)
    @NotNull
    private String customer_reg_no ;

    @NotNull
    private String company_name ;

    @NotNull
    private String direct_telephone_no; 
    
    @NotNull
    private String direct_email_no;

   
    @NotNull
    private String contact_person_fullname;

    @NotNull
    private String contact_person_email;

    @NotNull
    private String contact_person_mobileno;

    @NotNull
    private String company_address;

   
    @NotNull
    private LocalDateTime added_datetime;

    private LocalDateTime updated_datetime;

    private LocalDateTime deleted_datetime;

    @NotNull
    private Integer added_user_id; 

    private Integer updated_user_id ; 

    private Integer deleted_user_id ; 

    @ManyToOne()
    @JoinColumn(name = "customer_status_id",referencedColumnName = "id")
    private CustomerStatus customer_status_id ;

    @ManyToOne()
    @JoinColumn(name = "business_type_id",referencedColumnName = "id")
    private BusinessType business_type_id ;

}
 
