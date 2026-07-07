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


@Entity // mema class eka entity ekak widihata hasirila Table eka ekka mapping eka
// hadanne entity anotation eka dammoth witharai
@Table(name = "employee")// Table Mapping eka

@Data // setters and getters create karaganna 
@AllArgsConstructor // all arguemrnt constructor eka generate wenawa
@NoArgsConstructor//default constructor hadanawa
public class Employee {
    
    @Id//primary key eka nisa danawa
    @GeneratedValue(strategy = GenerationType.IDENTITY)//auto increment nisa meka danwa
    private Integer id ;


    @Column(name = "emp_no",unique = true) //database eke coloumn name ekath ekka map karanwa
    @Length(max = 8) //max lenghth eka chracters 8 
    @NotNull//me filed eka null wenna ba
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

    private byte[] emp_photo; //phtot save karanne byte format eken

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
