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
@Table(name = "employee")

@Data
@AllArgsConstructor
@NoArgsConstructor//default constructor hadanawa
public class Employee {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id ;


    @Column(name = "emp_no",unique = true)
    @Length(max = 8)
    @NotNull
    private String emp_no ;

    @NotNull
    private String fullname ;

    @NotNull
    private String callingname; 
    
    @NotNull
    private String address;

    @NotNull
    @Column(name = "nic",unique = true)
    @Length(max = 12)
    private String nic;

    @NotNull
    private String civil_status;

    @NotNull
    private LocalDate dateofbirth ;

    @NotNull
    private String gender;

    @NotNull
    private String email;

    @NotNull
    @Length(max = 10)
    private String mobileno;

    @NotNull
    private LocalDate join_date;

    private byte[] emp_photo;

    @NotNull
    private LocalDateTime added_datetime;

    private LocalDateTime updated_datetime;

    private LocalDateTime deleted_datetime;

    @NotNull
    private Integer added_user_id; 

    private Integer updated_user_id ; 

    private Integer deleted_user_id ; 

    @ManyToOne()
    @JoinColumn(name = "employee_status_id",referencedColumnName = "id")
    private EmployeeStatus employee_status_id ;

    @ManyToOne()
    @JoinColumn(name = "department_id",referencedColumnName = "id")
    private Deaprtment department_id ;

    @ManyToOne()
    @JoinColumn(name = "designation_id",referencedColumnName = "id")
    private Designation designation_id ;

//    ******************************************** @AllArgsConstructor annotaion eken  auto generate karnawa******************************************************
//    public Employee(Integer id, String emp_no, String fullname, String callingname, String address, String nic, String civil_status, LocalDate dateofbirth, String gender, String email, String mobileno, LocalDate join_date, LocalDateTime added_datetime, LocalDateTime updated_datetime, LocalDateTime deleted_datetime, Integer added_user_id, Integer updated_user_id, Integer deleted_user_id, EmployeeStatus employee_status_id, Deaprtment department_id, Designation designation_id) {
//        this.id = id;
//        this.emp_no = emp_no;
//        this.fullname = fullname;
//        this.callingname = callingname;
//        this.address = address;
//        this.nic = nic;
//        this.civil_status = civil_status;
//        this.dateofbirth = dateofbirth;
//        this.gender = gender;
//        this.email = email;
//        this.mobileno = mobileno;
//        this.join_date = join_date;
//        this.added_datetime = added_datetime;
//        this.updated_datetime = updated_datetime;
//        this.deleted_datetime = deleted_datetime;
//        this.added_user_id = added_user_id;
//        this.updated_user_id = updated_user_id;
//        this.deleted_user_id = deleted_user_id;
//        this.employee_status_id = employee_status_id;
//        this.department_id = department_id;
//        this.designation_id = designation_id;
//    }
}
