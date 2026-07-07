package lk.okidoki.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.okidoki.modal.Customer;
import lk.okidoki.modal.Vehicle;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {

  // next customer_reg_no eka create ganna query eka
  @Query(value = "SELECT concat('CUS', lpad(substring(max(e.customer_reg_no),4)+1,5,0)) FROM tms.customer as e", nativeQuery = true)
  public String getNextCustomerRegNo();

  // direct_telephone_no eke details database eken ganna query eka
  @Query(value = "select c from Customer c where c.direct_telephone_no = ?1")
  public Customer getByTelephoneNo(String direct_telephone_no);

  // direct_email_no eke details database eken ganna query eka
  @Query(value = "select c from Customer c where c.direct_email_no = ?1")
  public Customer getByEmail(String direct_email_no);

  // contact_person_mobileno eke details database eken ganna query eka
  @Query(value = "select c from Customer c where c.contact_person_mobileno = ?1")
  public Customer getByContactPersonTelephoneNo(String contact_person_mobileno);

  // contact_person_email eke details database eken ganna query eka
  @Query(value = "select c from Customer c where c.contact_person_email = ?1")
  public Customer getByContactPersonEmail(String contact_person_email);

  @Query(value = "select c from Customer  c where c.company_name=?1")
  Customer getByCompanyName(String companyName);

  // customer status id eke details database eken ganna query eka
  @Query(value = "SELECT c FROM Customer c where c.customer_status_id.id = 1")
  public List<Customer> getCustomerByCustomerStatus();

  @Query(value = "SELECT * FROM tms.customer as c where c.id in (SELECT ca.customer_id FROM tms.customer_agreement as ca where ca.customer_agreement_status_id = 2)", nativeQuery = true)
  public List<Customer> getCustomerByAgreement();

  @Query(value = "SELECT * FROM tms.customer as c where c.id in (SELECT ca.customer_id FROM tms.customer_agreement as ca where ca.customer_agreement_status_id = 2) and c.id not in(SELECT vg.customer_id FROM tms.vehicle_group as vg)", nativeQuery = true)
  public List<Customer> getCustomerByAgreementAndNotInVehicleGroup();

  // --------------------------------query's for Customer search
  // areas----------------------------------------------------

  @Query(value = "SELECT * FROM tms.customer as c where c.customer_status_id = ?1 ORDER BY c.id DESC", nativeQuery = true)
  List<Customer> getCustomersByStatus(Integer customerstatusId);

  @Query(value = "SELECT * FROM tms.customer as c where c.business_type_id=?1  ORDER BY c.id DESC", nativeQuery = true)
  List<Customer> getCustomersByBusinessType(Integer businesstypeid);

  @Query(value = "SELECT * FROM tms.customer as c where c.business_type_id=?1 and c.customer_status_id=?2 ORDER BY c.id DESC", nativeQuery = true)
  List<Customer> getCustomerByBusinessTypeAndStatus(Integer businesstypeid, Integer customerstatusId);

  // invoice ekata gnnawa payment availbale customer names tika ganna query eka
  // patyment available vehicle okkoma gnnawa
  @Query(value = "SELECT * FROM tms.customer as c where c.id in(SELECT b.customer_id FROM tms.booking as b where b.booking_status_id=6)", nativeQuery = true)
  List<Customer> allPaymentAvailableCustomers();

}
