package lk.okidoki.controller;

import lk.okidoki.modal.Privilage;
import lk.okidoki.modal.Role;
import lk.okidoki.modal.User;
import lk.okidoki.repository.RoleRepository;
import lk.okidoki.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;
import lk.okidoki.modal.Employee;
import lk.okidoki.repository.EmployeeRepository;
import lk.okidoki.repository.EmployeeStatusRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;

// servalet container implement karapu service update karaganna thamai @RestCntroller anotation eka use karanne
@RestController
public class EmployeeControler {

    @Autowired // auto generate instance
    private EmployeeRepository employeeRepository;

    @Autowired
    EmployeeStatusRepository employeeStatusRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserPrivilageController userPrivilageController;


    // Request mapping for load employee Ui (url -->/employee)
    @RequestMapping(value = "/employee")
    public ModelAndView loadEmployeeUI() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        ModelAndView emploueeUI = new ModelAndView();
        emploueeUI.setViewName("employee.html");
        emploueeUI.addObject("logedusername", auth.getName());
        emploueeUI.addObject("loggeduserphoto", logeduser.getUser_photo());
        emploueeUI.addObject("pageTitle", "Employee");

        return emploueeUI;
    }

    // Request mapping for get all employee data (url -->/employee/alldata)
    @GetMapping(value = "/employee/alldata", produces = "application/json")
    public List<Employee> findAllData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Employee");

        if (userPrivilage.getPrivi_select()) {
        // Last added data eke Mulata ganna oni nisa thama find all eke sort attributr
        // eka use karanne
        return employeeRepository.findAll(Sort.by(Direction.DESC, "id"));
    } else {
        return new ArrayList<>();
    }
    }


    // Requset post mapping for insert data in to the employee table(url
    // -->/employee/insert)
    @PostMapping(value = "/employee/insert")
    // @RequsetBody --> Front end eken ewana requsetboy eke object eka access
    // karannawa
    public String saveEmployeeData(@RequestBody Employee employee) {
        // checked user authentication and authorization
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Employee");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_insert()) {

        // unique attributes wala duplicate check karanna oni

        // nic check
        Employee extEmployeeByNic = employeeRepository.getByNic(employee.getNic());
        if (extEmployeeByNic != null) {
            return "Save Not success ; Nic Already Exists";
        }
        // mobile no check
        Employee extEmployeeByMobileNo = employeeRepository.getByMobileNo(employee.getMobileno());
        if (extEmployeeByMobileNo != null) {
            return "Save Not success ; Mobile No Already Exists";
        }
        try {

            // set auto added date
            employee.setAdded_datetime(LocalDateTime.now());
            employee.setAdded_user_id(logeduser.getId());
            employee.setEmp_no(employeeRepository.getNextEmpNo());

//            employee kenek submit kalama status eka active kiyla auto wadinawa
            employee.setEmployee_status_id(employeeStatusRepository.getReferenceById(2));

            // save operator
            employeeRepository.save(employee);

            // employee kene register karaddi auto user account ekak create karanwa
            if (employee.getDesignation_id().getUseraccount()) {
                User user = new User();
                user.setUsername(employee.getEmail());
                user.setEmail(employee.getEmail());
                if (employee.getEmp_photo() != null){
                    user.setUser_photo(employee.getEmp_photo());
                }
                user.setStatus(true);
                user.setAdded_datetime(LocalDateTime.now());
                user.setPassword(bCryptPasswordEncoder.encode(employee.getNic()));
                user.setEmployee_id(employeeRepository.getByNic(employee.getNic())); //(employeeRepository.getByNic(employee.getNic()));

                Set<Role> roles = new HashSet<>();
                Role role = roleRepository.getReferenceById(employee.getDesignation_id().getRoleid());
                roles.add(role);
                user.setRoles(roles);

                userRepository.save(user);
            }

            // front end eke respinse eka return karanawa
            return "ok";

        } catch (Exception e) {

            return "Save Not Completed :" + e.getMessage();
        }
        } else {

            return "Save Not Successed : You have not access";
        }
    }



    // Requset Put mapping for update employee data(url -->/employee/update)
    @PutMapping(value = "/employee/update")
    // @RequsetBody --> Front end eken ewana requsetboy eke object eka access
    // karannawa
    public String updateEmployeeData(@RequestBody Employee employee) {
        // check loged user authentication
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Employee");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_update()) {
        // check existing
        if (employee.getId() == null) {
            return "Update Not Success :Employee Not found";
        }
        Employee extById = employeeRepository.getReferenceById(employee.getId());
        if (extById == null) {
            return "Update Not Success : Employee Not found";
        }
        // duplicate check karanna oni
        // nic check
        Employee extEmployeeByNic = employeeRepository.getByNic(employee.getNic());
        if (extEmployeeByNic != null && extEmployeeByNic.getId() != employee.getId()) {
            return "Update Not success ; Nic Already Exists";
        }
        // mobile no check
        Employee extEmployeeByMobileNo = employeeRepository.getByMobileNo(employee.getMobileno());
        if (extEmployeeByMobileNo != null && extEmployeeByMobileNo.getId() != employee.getId()) {
            return "Update Not success ; Mobile No Already Exists";
        }
        try {
            // Set auto updated date
            employee.setUpdated_datetime(LocalDateTime.now());
            employee.setUpdated_user_id(logeduser.getId());

            // save operator
            employeeRepository.save(employee);

            // update ekedi dana response eka thama methan return karannaoni
            return "ok";

        } catch (Exception e) {

            return "Updated Not completed :" + e.getMessage();
        }
    } else {

        return "Save Not Successed : You have not access";
    }

    }



    // Requset delete mapping for delete employee from the table(url
    // -->/employee/delete)
    @DeleteMapping(value = "/employee/delete")
    public String deleteEmployeeData(@RequestBody Employee employee) {
        // check loged user authentication
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Privilage userPrivilage = userPrivilageController.getUserPrivilageByUserModule(auth.getName(), "Employee");
        User logeduser = userRepository.getByUsername(auth.getName());

        if (userPrivilage.getPrivi_delete()) {
        // check ext
        if (employee.getId() == null) {
            return "Delete Not Success: Employee not found ";
        }

        // database eke employee innwd balann oni
        Employee extEmployeeById = employeeRepository.getReferenceById(employee.getId());
        if (extEmployeeById == null) {
            return "Delete Not Success ; Employee Not Exists";
        }
        try {
            // set auto deleted date
            employee.setDeleted_datetime(LocalDateTime.now());
            employee.setDeleted_user_id(logeduser.getId());
            // employee delete karanawa nam eke status deleted widihata auto maru wenawa
            employee.setEmployee_status_id(employeeStatusRepository.getReferenceById(4));

            // delete operator
            employeeRepository.save(employee);

            // delete ekedi use karana response eka methana danna oni return eka widihata
            return "ok";
        } catch (Exception e) {
            return "Delete Not Completed :" + e.getMessage();
        }
    } else {

        return "Save Not Successed : You have not access";
        }
    }

    // Request mapping for get all employee data without user account (url -->/employee/alldata)
    @GetMapping(value = "/employee/alldatawithoutuseracconut", produces = "application/json")
    public List<Employee> findAllDataWithOutUserAccount() {
        // Last added data eke Mulata ganna oni nisa thama find all eke sort attributr
        // eka use karanne
        return employeeRepository.getByEmloyeeWthoutUserAccount();

    }

}
