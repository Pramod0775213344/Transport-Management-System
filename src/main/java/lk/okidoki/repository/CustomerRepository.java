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
  @Query(value = "SELECT c FROM Customer c where c.customer_status_id.id = 1 order by c.id desc")
  public List<Customer> getCustomerByCustomerStatus();

  @Query(value = "SELECT * FROM tms.customer as c where c.id in (SELECT ca.customer_id FROM tms.customer_agreement as ca where ca.customer_agreement_status_id = 2) order by c.id desc", nativeQuery = true)
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
  // flaoting rate nam currunt month eke complete booking available cutomersla
  // gannwa
  // fix rate nam currunt month eke complete booking available customer ganne
  // na,habai previous month ekak thibunoth gnnawa
  // patyment available vehicle okkoma gnnawa
  @Query(value = "SELECT DISTINCT c.*\n" + //
      "FROM tms.customer AS c\n" + //
      "JOIN tms.booking AS b ON b.customer_id = c.id\n" + //
      "JOIN tms.customer_agreement AS ca ON ca.id = b.customer_agreement_id\n" + //
      "JOIN tms.package AS p ON p.id = ca.package_id\n" + //
      "WHERE b.booking_status_id = 6\n" + //
      "AND (\n" + //
      "    p.package_type = 'Floating Rate'\n" + //
      "    OR\n" + //
      "    (\n" + //
      "        p.package_type = 'Fix Rate'\n" + //
      "        AND NOT (\n" + //
      "            YEAR(b.delivery_date_time) = YEAR(CURDATE())\n" + //
      "            AND MONTH(b.delivery_date_time) = MONTH(CURDATE())\n" + //
      "        )\n" + //
      "    )\n" + //
      ");", nativeQuery = true)
  List<Customer> allPaymentAvailableCustomers();

  // user adla customer list eka ganna user has vehicle group table eka haraha
  @Query(value = "SELECT c.* FROM tms.customer as c join tms.vehicle_group as vg on vg.customer_id = c.id join tms.user_has_vehicle_group as uhvg on uhvg.vehicle_group_id = vg.id where uhvg.user_id = ?1 and uhvg.status = true", nativeQuery = true)
  public List<Customer> getCustomerByUserId(Integer userid);

}
