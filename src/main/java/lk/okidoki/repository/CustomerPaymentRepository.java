package lk.okidoki.repository;

import lk.okidoki.modal.CustomerPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;


public interface CustomerPaymentRepository extends JpaRepository<CustomerPayment,Integer> {



    //    invoice ekata adala data ganna quer eka total distance ekai vehicle type ekai month ekata adalawa
    @Query(value = "SELECT vt.name AS vehicle_type_name, SUM(b.distance) AS total_distance,ca.cus_agreement_no,p.package_type,p.package_charge_cus,p.additinal_km_charge_cus,p.distance  FROM tms.booking AS b\n" +
            "JOIN tms.customer_agreement AS ca ON b.customer_agreement_id = ca.id\n" +
            "JOIN tms.package AS p ON ca.package_id = p.id\n" +
            "JOIN tms.vehicle_type AS vt ON b.vehicle_type_id = vt.id\n" +
            "WHERE \n" +
            "    b.customer_id = ?1\n" +
            "    AND b.booking_status_id = 6\n" +
            "    AND p.package_type =?2\n" +
            "    AND b.id NOT IN (\n" +
            "        SELECT booking_id \n" +
            "        FROM tms.customer_payment_has_booking\n" +
            "    )\n" +
            "    AND MONTHNAME(b.delivery_date_time) = ?3  -- selected month name\n" +
            "    AND YEAR(b.delivery_date_time) = YEAR(CURDATE())  -- current year dynamically\n" +
            "GROUP BY vt.name, ca.cus_agreement_no,p.package_charge_cus,p.additinal_km_charge_cus,p.distance \n" +
            "ORDER BY vt.name DESC",nativeQuery = true)
    List<String[][]> getInvoiceDetails(Integer customerid, String packageType, String month);

}
