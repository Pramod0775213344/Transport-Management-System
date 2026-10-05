package lk.okidoki.repository;

import lk.okidoki.modal.*;

import org.antlr.v4.runtime.atn.SemanticContext.AND;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Date;
import java.util.List;
import java.util.Map;

public interface ReportRepository extends JpaRepository<Vehicle, Integer> {

        // vehicle count eka gnnw vehicle type eka anuwa
        @Query(value = "SELECT count(v.vehicle_type_id),(SELECT vt.name FROM tms.vehicle_type as vt where vt.id = v.vehicle_type_id) FROM tms.vehicle as v group by v.vehicle_type_id", nativeQuery = true)
        String[][] getCountByVehicleType();

        // booking count eka gnnw booking status eken
        @Query(value = "SELECT count(b.booking_status_id),(SELECT bs.status FROM tms.booking_status as bs where bs.id = b.booking_status_id) FROM tms.booking as b where month(b.pickup_date_time) = month(current_date()) group by b.booking_status_id ", nativeQuery = true)
        String[][] getCountByBookingStatus();

        // booking count eka gnnw booking status eken
        @Query(value = "SELECT count(b.customer_id),(SELECT c.company_name FROM tms.customer as c where c.id = b.customer_id) FROM tms.booking as b where month(b.pickup_date_time) = month(current_date()) group by b.customer_id; ", nativeQuery = true)
        String[][] getBookingCountByCustomer();

        // booking count eka gnnw booking status eken
        @Query(value = "SELECT round(sum(b.distance),2), monthname(delivery_date_time) FROM tms.booking as b group by monthname(b.delivery_date_time); ", nativeQuery = true)
        String[][] gettotalDistanceByMonthlyBookings();

        // -------------------------------------booking
        // Report-------------------------------------------------------------------------------
        @Query(value = "SELECT b.booking_no as bookingno, " +
                        "b.pickup_date_time as bookingdate, " +
                        "c.company_name as customer, " +
                        "s.transportname as supplier, " +
                        "d.fullname as driver, " +
                        "v.vehicle_no as vehicleNo, " +
                        "b.distance, " +
                        "bs.status as status " +
                        "FROM tms.booking as b " +
                        "JOIN tms.booking_status as bs ON bs.id = b.booking_status_id " +
                        "LEFT JOIN tms.vehicle as v ON v.id = b.vehicle_id " + // left jin nisa null wunath data sho
                                                                               // wenawa
                        "LEFT JOIN tms.supplier as s ON s.id = v.supplier_id " +
                        "LEFT JOIN tms.driver as d ON d.id = b.driver_id " +
                        "JOIN tms.customer as c ON c.id = b.customer_id " +
                        "WHERE(:customerId IS NULL OR c.id = :customerId) " +
                        "AND (:vehicleId IS NULL OR v.id = :vehicleId) " +
                        "AND (:driverId IS NULL OR d.id = :driverId) " +
                        "AND (:statusId IS NULL OR bs.id = :statusId) " +
                        "AND (:startDate IS NULL OR b.pickup_date_time >= :startDate) " +
                        "AND (:endDate IS NULL OR b.pickup_date_time <= :endDate) order by b.id desc", nativeQuery = true)
        String[][] getBookingsForReport(
                        @Param("customerId") Integer customerId,
                        @Param("vehicleId") Integer vehicleId,
                        @Param("driverId") Integer driverId,
                        @Param("statusId") Integer statusId,
                        @Param("startDate") String startDate,
                        @Param("endDate") String endDate);

        // ---------------------------------revenue license expire list
        // report-------------------------------------------------------------------
        @Query(value = "SELECT *,\n" + //
                        "       CASE\n" + // meken revenue license status eka anuwa wena karala thiyenawa
                        "         WHEN v.revenu_license_expire_date < CURRENT_DATE() THEN 'Expired'\n" + //
                        "         WHEN v.revenu_license_expire_date BETWEEN CURRENT_DATE() AND CURRENT_DATE() + INTERVAL 30 DAY THEN 'Expiring Soon'\n"
                        + //
                        "       END AS revenu_status FROM tms.vehicle as v where v.vehicle_status_id in (1,2) and (v.revenu_license_expire_date < current_date() or v.revenu_license_expire_date between current_date() and current_date() + interval 30 day)", nativeQuery = true)
        List<Vehicle> getRevenueLicenseExpireList();

        @Query(value = "SELECT m.month_name, COUNT(v.id) AS total FROM\n" + //
                        " ( SELECT 0 AS m, DATE_FORMAT(CURDATE(),'%M') AS month_name UNION \n" + //
                        " SELECT 1, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH),'%M') UNION \n" + //
                        " SELECT 2, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 2 MONTH),'%M') UNION \n" + //
                        " SELECT 3, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 3 MONTH),'%M') UNION \n" + //
                        " SELECT 4, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 4 MONTH),'%M') ) m \n" + //
                        " LEFT JOIN tms.vehicle v ON \n" + //
                        " MONTH(v.revenu_license_expire_date) = MONTH(DATE_ADD(CURDATE(), INTERVAL m.m MONTH)) \n" + //
                        " AND YEAR(v.revenu_license_expire_date) = YEAR(DATE_ADD(CURDATE(), INTERVAL m.m MONTH)) \n" + //
                        " AND v.vehicle_status_id = 1 \n" + //
                        " GROUP BY m.m, m.month_name \n" + //
                        " ORDER BY m.m", nativeQuery = true)
        String[][] upcomnigExpiredRevenueLicenseCountWithMonth();

        // ---------------------------------insurance expire list
        // report--------------------------------------------------------------------------

        @Query(value = "SELECT *,\n" + //
                        "       CASE\n" + // meken insurance status eka anuwa wena karala thiyenawa
                        "         WHEN v.insurance_expire_date < CURRENT_DATE() THEN 'Expired'\n" + //
                        "         WHEN v.insurance_expire_date BETWEEN CURRENT_DATE() AND CURRENT_DATE() + INTERVAL 30 DAY THEN 'Expiring Soon'\n"
                        + //
                        "       END AS insurance_status FROM tms.vehicle as v where  v.vehicle_status_id in (1,2) and (v.insurance_expire_date < current_date() or v.insurance_expire_date between current_date() and current_date() + interval 30 day)", nativeQuery = true)
        List<Vehicle> getInsuranceExpireList();

        // upcoming trend eka ganna query eka
        @Query(value = "SELECT m.month_name, COUNT(v.id) AS total FROM\n" + //
                        " ( SELECT 0 AS m, DATE_FORMAT(CURDATE(),'%M') AS month_name UNION \n" + //
                        " SELECT 1, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH),'%M') UNION \n" + //
                        " SELECT 2, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 2 MONTH),'%M') UNION \n" + //
                        " SELECT 3, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 3 MONTH),'%M') UNION \n" + //
                        " SELECT 4, DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 4 MONTH),'%M') ) m \n" + //
                        " LEFT JOIN tms.vehicle v ON \n" + //
                        " MONTH(v.insurance_expire_date) = MONTH(DATE_ADD(CURDATE(), INTERVAL m.m MONTH)) \n" + //
                        " AND YEAR(v.insurance_expire_date) = YEAR(DATE_ADD(CURDATE(), INTERVAL m.m MONTH)) \n" + //
                        " AND v.vehicle_status_id = 1 \n" + //
                        " GROUP BY m.m, m.month_name \n" + //
                        " ORDER BY m.m", nativeQuery = true)
        String[][] upcomnigExpiredInsuanceCountWithMonth();

        // ______________________________count for vehicle dashboard
        // report___________________________________________________________

        @Query(value = "SELECT count(v.id) FROM tms.vehicle as v where v.vehicle_status_id=1", nativeQuery = true)
        Integer getCountOfActiveVehicles();

        @Query(value = "SELECT count(v.id) FROM tms.vehicle as v ", nativeQuery = true)
        Integer getCountOfAllVehicles();

        @Query(value = "SELECT count(v.id) FROM tms.vehicle as v where v.revenu_license_expire_date< current_date() and v.vehicle_status_id=1", nativeQuery = true)
        Integer getCountOfRevenueLicenseExpireVehicles();

        @Query(value = "SELECT count(v.id) FROM tms.vehicle as v where v.insurance_expire_date< current_date() and v.vehicle_status_id=1", nativeQuery = true)
        Integer getCountOfInsuranceExpireVehicles();

        // ---------------------------------recently updated data for vehicle dashboard
        // report---------------------------------------------------

        @Query(value = "SELECT * FROM tms.vehicle as v where v.revenu_license_expire_date< current_date() and v.vehicle_status_id=1 order by v.id desc limit 5", nativeQuery = true)
        List<Vehicle> getRecentlyUpdatedRevenueLicenseExpireVehicles();

        @Query(value = "SELECT * FROM tms.vehicle as v where v.insurance_expire_date< current_date() and v.vehicle_status_id=1 order by v.id desc limit 5", nativeQuery = true)
        List<Vehicle> getRecentlyUpdatedInsuranceExpireVehicles();

        // -------------------------------get vehicles revenue by customer id and
        // vehicle type and group by currant month and currant
        // year---------------------------
        @Query(value = "SELECT v.vehicle_no,sum(b.distance) as distance FROM tms.booking as b, tms.vehicle as v,tms.vehicle_type as vt where b.vehicle_id=v.id and v.vehicle_type_id=vt.id and b.customer_id=?1 and b.vehicle_type_id=?2 and v.id in (SELECT vghv.vehicle_id FROM tms.vehicle_group_has_vehicle as vghv where vghv.vehicle_group_id in(SELECT vg.id FROM tms.vehicle_group as vg where vg.customer_id =?1))and MONTH(b.pickup_date_time) = MONTH(CURDATE()) AND YEAR(b.pickup_date_time) = YEAR(CURDATE()) group by v.id", nativeQuery = true)
        List<Object[]> getVehiclesRevenueByCustomerIdAndVehicleTypeAndGroupByCurrantMonthAndYear(Integer customerId,
                        Integer vehicleTypeId);

        // ______________________________count for vehicle dashboard
        // report___________________________________________________________

        @Query(value = "SELECT count(b.id) FROM tms.booking as b where b.booking_status_id=1", nativeQuery = true)
        Integer getPendingBookingCount();

        @Query(value = "SELECT count(c.id) FROM tms.customer as c where c.customer_status_id=1", nativeQuery = true)
        Integer getActiveCustomerCount();

        @Query(value = "SELECT count(d.id) FROM tms.driver as d where d.driver_status_id=1", nativeQuery = true)
        Integer getActiveDriverCount();

        // ----------------------------------supplier agreement
        // report--------------------------------------------------------------------------
        // date range ekata adalawa agreements details gnnw
        @Query(value = "SELECT sa FROM SupplierAgreement sa WHERE DATE(sa.added_datetime) BETWEEN ?1 AND ?2 and sa.supplier_id.id=?3 order by sa.id desc")
        List<SupplierAgreement> getSupplierAgreementByDateRangeAndSupplier(Date startdate, Date enddate,
                        Integer supplierid);

        @Query(value = "SELECT sa FROM SupplierAgreement sa WHERE DATE(sa.added_datetime) BETWEEN ?1 AND ?2 order by sa.id desc")
        List<SupplierAgreement> getSupplierAgreementByDateRange(Date startdate, Date endtdate);

        // -----------------------------------customer agreement
        // report--------------------------------------------------------------------------
        // date range ekata adalawa agreements details gnnw
        @Query(value = "SELECT ca FROM CustomerAgreement ca WHERE DATE(ca.added_datetime) BETWEEN ?1 AND ?2 and ca.customer_id.id=?3 order by ca.id desc")
        List<CustomerAgreement> getCustomerAgreementByDateRangeAndCustomer(Date startdate, Date enddate,
                        Integer customerid);

        @Query(value = "SELECT ca FROM CustomerAgreement ca WHERE DATE(ca.added_datetime) BETWEEN ?1 AND ?2 order by  ca.id desc")
        List<CustomerAgreement> getCustomerAgreementByDateRange(Date startdate, Date endtdate);

        // --------------------------------daily booking summary
        // report-------------------------------------------------------------------------

        // currunt day eke hour wise booking count eka gnnw
        @Query(value = "SELECT HOUR(b.pickup_date_time) as hour, COUNT(*) as booking_count FROM tms.booking as b WHERE DATE(b.pickup_date_time) = CURDATE() GROUP BY HOUR(b.pickup_date_time) ORDER BY hour", nativeQuery = true)
        String[][] getHourlyBookings();

        // booking status anuwa count eka gnnw
        @Query(value = "SELECT bs.status as status, count(*) as count FROM tms.booking as b JOIN tms.booking_status as bs ON b.booking_status_id = bs.id WHERE Date(b.pickup_date_time) = current_date() GROUP BY b.booking_status_id, bs.status ORDER BY b.booking_status_id", nativeQuery = true)
        List<Object[]> getBookingCountByStatus();

        // currunt day eke bookings details gnnw
        @Query(value = "SELECT b.booking_no,c.company_name,v.vehicle_no,d.fullname,b.distance,bs.status FROM tms.booking as b "
                        +
                        "join tms.customer as c on c.id= b.customer_id " +
                        "left join tms.vehicle as v on v.id = b.vehicle_id " +
                        "left join tms.driver as d on d.id = b.driver_id " +
                        "join tms.booking_status as bs on bs.id = b.booking_status_id " +
                        "where date(b.pickup_date_time) = curdate()" +
                        "AND (:customerId IS NULL OR c.id = :customerId) " +
                        "AND (:bookingStatusId IS NULL OR b.booking_status_id = :bookingStatusId) " +
                        "AND (:vehicleId IS NULL OR v.id = :vehicleId) " +
                        "AND (:driverId IS NULL OR d.id = :driverId) ", nativeQuery = true)
        String[][] getAllBookingsForDaily(
                        @Param("customerId") Integer customerId,
                        @Param("bookingStatusId") Integer bookingStatusId,
                        @Param("vehicleId") Integer vehicleId,
                        @Param("driverId") Integer driverId);

        // currunt day eke bookings details gnnw customer id anuwa
        @Query("SELECT b FROM Booking b WHERE DATE(b.pickup_date_time) = CURRENT_DATE AND b.customer_id.id = ?1 ORDER BY b.id")
        List<Booking> getAllBookingsForDailyByCustomer(Integer customerId);

        // currunt day eke bookings details gnnw booking status id anuwa
        @Query("SELECT b FROM Booking b WHERE DATE(b.pickup_date_time) = CURRENT_DATE AND b.booking_status_id.id = ?1 ORDER BY b.id")
        List<Booking> getAllBookingsForDailyByBookingStatus(Integer bookingStatusId);

        // currunt day eke bookings details gnnw customer id and booking status id anuwa
        @Query("SELECT b FROM Booking b WHERE DATE(b.pickup_date_time) = CURRENT_DATE AND b.customer_id.id = ?1 AND b.booking_status_id.id = ?2 ORDER BY b.id")
        List<Booking> getAllBookingsForDailyByCustomerAndStatus(Integer customerId, Integer bookingStatusId);

        // vehicel utilization summary ganna query eka
        @Query("SELECT b.vehicle_type_id as vehicleType, COUNT(b.id) as totalBookings, COUNT(DISTINCT b.vehicle_id) as totalVehicles, round (SUM(b.distance)) as distance FROM Booking b WHERE DATE(b.pickup_date_time) = CURRENT_DATE GROUP BY b.vehicle_type_id")
        List<Object[]> getDailyBookingSummaryByVehicleType();

        // vehicel utilization summary ganna query eka selected customer id ekata anuwa
        @Query("SELECT b.vehicle_type_id as vehicleType, COUNT(b.id) as totalBookings, COUNT(DISTINCT b.vehicle_id) as totalVehicles, round (SUM(b.distance)) as distance FROM Booking b WHERE DATE(b.pickup_date_time) = CURRENT_DATE AND b.customer_id.id=?1 GROUP BY b.vehicle_type_id")
        List<Object[]> getDailyVehicleUtilizationSummaryByCustomer(Integer customerId);

        // vehicel utilization summary ganna query eka selected booking status id ekata
        // anuwa
        @Query("SELECT b.vehicle_type_id as vehicleType, COUNT(b.id) as totalBookings, COUNT(DISTINCT b.vehicle_id) as totalVehicles, round (SUM(b.distance)) as distance FROM Booking b WHERE DATE(b.pickup_date_time) = CURRENT_DATE AND b.booking_status_id.id=?1 GROUP BY b.vehicle_type_id")
        List<Object[]> getDailyVehicleUtilizationSummaryByBookingStatus(Integer bookingStatusId);

        // vehicel utilization summary ganna query eka selected booking status id ekata
        // anuwa saha customer id ekata anuwa
        @Query("SELECT b.vehicle_type_id as vehicleType, COUNT(b.id) as totalBookings, COUNT(DISTINCT b.vehicle_id) as totalVehicles, round (SUM(b.distance)) as distance FROM Booking b WHERE DATE(b.pickup_date_time) = CURRENT_DATE AND b.customer_id.id=?1 AND b.booking_status_id.id=?2 GROUP BY b.vehicle_type_id")
        List<Object[]> getDailyVehicleUtilizationSummaryByCustomerAndBookingStatus(Integer customerId,
                        Integer bookingStatusId);

        // --------------------------------------------------------------delay booking
        // report---------------------------------------------------------------

        // delay booking tika ganna query eka pickup ekata wada actual pickup eka wadi
        // saha dilevry ekata wada actual delivery eka wadi ewa
        @Query(value = "SELECT b.booking_no, c.company_name, v.vehicle_no, \n" +
                        "pl.name as pickup, dl.name as destination, \n" +
                        "b.pickup_date_time, b.delivery_date_time, b.arrived_at_pickup_datetime, b.arrived_at_delivery_datetime, \n"
                        +
                        "greatest(timestampdiff(Minute,b.pickup_date_time,b.arrived_at_pickup_datetime),0) as pickupdelay, \n"
                        +
                        "greatest(timestampdiff(Minute,b.delivery_date_time,b.arrived_at_delivery_datetime),0) as deliverydelay, \n"
                        +
                        "drp.delay_reasons as pickup_reason, drd.delay_reasons as delivery_reason \n" +
                        "FROM tms.booking as b \n" +
                        "join tms.customer as c on c.id = b.customer_id \n" +
                        "join tms.pickup_locations as pl on pl.id = b.pickup_locations_id \n" +
                        "join tms.delivery_locations as dl on dl.id = b.delivery_locations_id \n" +
                        "join tms.vehicle as v on v.id = b.vehicle_id \n" +
                        "join tms.driver as d on d.id = b.driver_id \n" +
                        "left join tms.delay_reasons as drp on drp.id = b.pickup_delay_reason_id \n" +
                        "left join tms.delay_reasons as drd on drd.id = b.delivery_delay_reasons_id \n" +
                        "where b.booking_status_id != 7 " +
                        "and (b.delivery_delay_reasons_id is not null or b.pickup_delay_reason_id is not null) \n" +
                        "AND (:customerId IS NULL OR c.id = :customerId) " +
                        "AND (:vehicleId IS NULL OR v.id = :vehicleId) " +
                        "AND (:driverId IS NULL OR d.id = :driverId) " +
                        "AND (:delayType IS NULL " +
                        "     OR (:delayType = 'pickup' AND b.pickup_delay_reason_id IS NOT NULL) " +
                        "     OR (:delayType = 'delivery' AND b.delivery_delay_reasons_id IS NOT NULL)) " +
                        "AND (:startDate IS NULL OR b.pickup_date_time >= :startDate) " +
                        "AND (:endDate IS NULL OR b.pickup_date_time <= :endDate)", nativeQuery = true)
        String[][] getAllDelayBookings(
                        @Param("customerId") Integer customerId,
                        @Param("vehicleId") Integer vehicleId,
                        @Param("driverId") Integer driverId,
                        @Param("delayType") String delayType,
                        @Param("startDate") String startDate,
                        @Param("endDate") String endDate);

        // --------------------------------------------driver performance
        // report-------------------------------------------------------------
        @Query(value = "SELECT " +
                        "    d.fullname, " +
                        "    s.transportname, " +
                        "    COUNT(b.id) AS total_booking_count, " +
                        "    SUM(b.distance) AS total_distance, " +
                        "    SUM(CASE WHEN b.pickup_delay_reason_id IS NOT NULL OR b.delivery_delay_reasons_id IS NOT NULL THEN 1 ELSE 0 END) AS delay_count, "
                        +
                        "    SUM(GREATEST(TIMESTAMPDIFF(MINUTE, b.pickup_date_time, b.arrived_at_pickup_datetime), 0)) AS total_pickup_delay, "
                        +
                        "    SUM(GREATEST(TIMESTAMPDIFF(MINUTE, b.delivery_date_time, b.arrived_at_delivery_datetime), 0)) AS total_delivery_delay "
                        +
                        "FROM tms.driver AS d " +
                        "JOIN tms.supplier AS s ON s.id = d.supplier_id " +
                        "JOIN tms.booking AS b ON b.driver_id = d.id " +
                        "WHERE b.booking_status_id IN (6,8,9) " +
                        "AND (:supplierId IS NULL OR d.supplier_id = :supplierId) " +
                        "AND (:driverId IS NULL OR d.id = :driverId) " +
                        "AND (:statusId IS NULL OR d.driver_status_id = :statusId) " +
                        "AND (:startDate IS NULL OR b.pickup_date_time >= :startDate) " +
                        "AND (:endDate IS NULL OR b.pickup_date_time <= :endDate) " +
                        "GROUP BY d.fullname, s.transportname", nativeQuery = true)
        String[][] gerDriverPerfomance(
                        @Param("driverId") Integer driverId,
                        @Param("supplierId") Integer supplierId,
                        @Param("statusId") Integer statusId,
                        @Param("startDate") String startDate,
                        @Param("endDate") String endDate);

        // ---------------------------------------Income
        // Report-------------------------------------------------------------

        @Query(value = "SELECT m.month AS month, " +
                        "COALESCE(i.income, 0) AS total_revenue, " +
                        "COALESCE(sp.cost, 0) AS total_cost, " +
                        "COALESCE(i.income, 0) - COALESCE(sp.cost, 0) AS profit, " +
                        "COALESCE(i.tax, 0) AS total_tax " +
                        // month eka anuwa revenue, cost, profit saha tax details gnnw
                        "FROM (" +
                        "  SELECT DATE_FORMAT(inv.invoice_date, '%Y-%m') AS month " +
                        "  FROM tms.invoice AS inv " +
                        "  WHERE inv.invoice_status_id = 2 " +
                        "  AND (:customerId IS NULL OR inv.customer_id = :customerId) " +
                        "  AND (:startDate IS NULL OR inv.invoice_date >= :startDate) " +
                        "  AND (:endDate IS NULL OR inv.invoice_date <= :endDate) " +
                        "  UNION " +
                        "  SELECT DATE_FORMAT(sp.date, '%Y-%m') AS month " +
                        "  FROM tms.supplier_payable AS sp " +
                        "  JOIN tms.booking AS b ON b.supplier_payable_id = sp.id " +
                        "  WHERE sp.supplier_payable_status_id = 3 " +
                        "  AND (:customerId IS NULL OR b.customer_id = :customerId) " +
                        "  AND (:startDate IS NULL OR sp.date >= :startDate) " +
                        "  AND (:endDate IS NULL OR sp.date <= :endDate) " +
                        ") m " +
                        // month eka anuwa income eka saha tax eka gnnw
                        "LEFT JOIN (" +
                        "  SELECT DATE_FORMAT(inv.invoice_date, '%Y-%m') AS month, SUM(inv.invoice_subtotal) AS income , SUM(inv.invoice_tax) AS tax "
                        +
                        "  FROM tms.invoice AS inv " +
                        "  WHERE inv.invoice_status_id = 2 " +
                        "  AND (:customerId IS NULL OR inv.customer_id = :customerId) " +
                        "  AND (:startDate IS NULL OR inv.invoice_date >= :startDate) " +
                        "  AND (:endDate IS NULL OR inv.invoice_date <= :endDate) " +
                        "  GROUP BY DATE_FORMAT(inv.invoice_date, '%Y-%m')" +
                        ") i ON m.month = i.month " +
                        // month eka anuwa expense eka gnnw
                        "LEFT JOIN (" +
                        "  SELECT DATE_FORMAT(x.date, '%Y-%m') AS month, SUM(x.gross_amount) AS cost " +
                        "  FROM (" +
                        "    SELECT DISTINCT sp.id, sp.date, sp.gross_amount " + // supplier payable table eke id, date
                                                                                 // saha gross amount gnnw. booking
                                                                                 // table eke supplier payable id ekata
                                                                                 // anuwa join karala thiyenawa.
                                                                                 // supplier payable status eka 3 (paid)
                                                                                 // unoth gnnw. customer id, start date
                                                                                 // saha end date filter karala
                                                                                 // thiyenawa
                        "    FROM tms.supplier_payable AS sp " +
                        "    JOIN tms.booking AS b ON b.supplier_payable_id = sp.id " +
                        "    WHERE sp.supplier_payable_status_id = 3 " +
                        "    AND (:customerId IS NULL OR b.customer_id = :customerId) " +
                        "    AND (:startDate IS NULL OR sp.date >= :startDate) " +
                        "    AND (:endDate IS NULL OR sp.date <= :endDate)" +
                        "  ) x " +
                        "  GROUP BY DATE_FORMAT(x.date, '%Y-%m')" +
                        ") sp ON m.month = sp.month " +
                        "ORDER BY m.month DESC;", nativeQuery = true)
        String[][] getProfitReport(
                        @Param("customerId") Integer customerId,
                        @Param("startDate") String startDate,
                        @Param("endDate") String endDate);

        // ---------------------------dashboard eke
        // query---------------------------------------------

        // get last assign vehicles
        @Query(value = "SELECT v.vehicle_no,vt.name,dl.name,bs.status FROM tms.booking as b join tms.vehicle as v on b.vehicle_id = v.id join tms.vehicle_type as vt on v.vehicle_type_id = vt.id \n"
                        +
                        "join tms.delivery_locations as dl on b.delivery_locations_id = dl.id join tms.booking_status as bs on b.booking_status_id=bs.id order by b.assigned_date_time desc limit 5;", nativeQuery = true)
        List<Object[]> getLastAssignedVehicles();

        // get last assign duty drivers
        @Query(value = "SELECT d.fullname,vt.name,dl.name,pl.name,b.delivery_date_time FROM tms.booking as b join tms.driver as d on b.driver_id = d.id join tms.vehicle_type as vt on b.vehicle_type_id = vt.id \n"
                        +
                        "join tms.delivery_locations as dl on b.delivery_locations_id = dl.id join tms.pickup_locations as pl on b.pickup_locations_id=pl.id order by b.assigned_date_time desc limit 5;", nativeQuery = true)
        List<Object[]> getLastAssignedDrivers();

        // get duty drivers count eka
        @Query(value = "SELECT count( b.driver_id) FROM tms.booking as b where b.booking_status_id  NOT IN (6, 7, 8)", nativeQuery = true)
        Integer getDutyDriversCount();

        // get booking avtivity for dashborad
        @Query(value = "SELECT '1' as id, b.booking_no AS bookingNo,'Booking created' AS message,b.added_datetime AS time FROM tms.booking as b WHERE b.added_datetime IS NOT NULL\n"
                        +
                        "UNION ALL\n" +
                        "SELECT '2' as id, b.booking_no,'Vehicle Assigned Succesfully',b.assigned_date_time FROM tms.booking as b WHERE b.assigned_date_time IS NOT NULL\n"
                        +
                        "UNION ALL\n" +
                        "SELECT'3' as id, b.booking_no,'vehicle arrived from the pickup location',b.assigned_date_time FROM tms.booking as b WHERE b.assigned_date_time IS NOT NULL\n"
                        +
                        "UNION ALL\n" +
                        "SELECT'4' as id, b.booking_no,'vehicle left from the pickup location',b.assigned_date_time FROM tms.booking as b WHERE b.assigned_date_time IS NOT NULL\n"
                        +
                        "UNION ALL\n" +
                        "SELECT '5' as id, b.booking_no,'vehicle arrived the delivery location',b.departed_from_delivery_datetime FROM tms.booking as b WHERE b.departed_from_delivery_datetime IS NOT NULL\n"
                        +
                        "UNION ALL\n" +
                        "SELECT'6' as id, b.booking_no,'Delivered successfully',b.departed_from_delivery_datetime FROM tms.booking as b WHERE b.departed_from_delivery_datetime IS NOT NULL\n"
                        +
                        "ORDER BY time DESC LIMIT 3", nativeQuery = true)
        List<Object[]> getBookingActivityForDashboard();

        // get total active booking list
        @Query(value = "SELECT count(b.id) FROM tms.booking as b where b.booking_status_id not in (6,7,8,9)", nativeQuery = true)
        Integer getTotalActiveBookingList();

        // get all the time on time rate percentage
        @Query(value = "SELECT ROUND(SUM(b.arrived_at_delivery_datetime <= b.delivery_date_time) * 100.0 / COUNT(DISTINCT b.id), 2) AS on_time_rate_percent FROM tms.booking as b where b.arrived_at_delivery_datetime is not null;", nativeQuery = true)
        Double getAllTimeOnTimeRatePercentage();

        // get current date total bookings
        @Query(value = "SELECT count(b.id) FROM tms.booking as b where Date(b.added_datetime) = current_date();", nativeQuery = true)
        Integer getCurrentDateTotalBookings();

        // get current date bookings delay rate precentage
        // delivery date time eka arrived at delivery date time ekata wada wadi nam meka
        // delay wenawa
        // add current date eken gannawa arrived at pickup date time eken
        // e wagema arrived at delivery date time eka null wenna ba
        // if eken karanne(example eka) count eka 0 nam 0 return karanawa naththam
        // formula eka run karanawa
        // ex.If(count=0,0,calculation eka)
        @Query(value = "SELECT IF(COUNT(b.id) = 0,0,ROUND((SUM(b.delivery_date_time < b.arrived_at_delivery_datetime) / COUNT(b.id)) * 100,2)) AS delay_rate_percentage FROM tms.booking b\n"
                        +
                        "WHERE DATE(b.arrived_at_pickup_datetime) = CURRENT_DATE AND b.arrived_at_delivery_datetime IS NOT NULL;\n", nativeQuery = true)
        Double getCurrentDateBookingsDelayRatePercentage();

        // bookings status overview eka gnn query eka
        @Query(value = "SELECT sum(b.booking_status_id=1) as pending_booking, sum(b.booking_status_id in(2,3,4,5)) as ongonig_booking, sum(b.booking_status_id in(6,8,9)) as complete_booking\n"
                        +
                        "FROM tms.booking as b where b.booking_status_id not in (7)", nativeQuery = true)
        Object getBookingOverview();

        // meken ganne busy vehicel count ekai free vehicel count ekai
        @Query(value = "SELECT (SELECT COUNT(DISTINCT b.vehicle_id) FROM tms.booking AS b WHERE b.booking_status_id IN (2,3,4,5)) AS busy_vehicle,\n"
                        +
                        "(SELECT COUNT(v.id) FROM tms.vehicle AS v WHERE v.vehicle_status_id = 1 AND v.id NOT IN (SELECT DISTINCT b.vehicle_id FROM tms.booking AS b WHERE b.booking_status_id IN (2,3,4,5))) AS free_vehicle;", nativeQuery = true)
        Object getFleetUtilization();

        // revenu eka saha expense eka gnnawa
        @Query(value = "SELECT t.month_name, sum(t.revenue) as revenu, sum(t.expense) as expense " +
                        "FROM (" +
                        "  SELECT i.invoice_month as month_name, sum(i.invoice_subtotal) as revenue, 0 as expense, min(i.invoice_date) AS sort_date "
                        +
                        "  FROM tms.invoice as i " +
                        "  WHERE i.invoice_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) " +
                        "  AND i.invoice_status_id = 2 " + // <-- add karanawa
                        "  group by i.invoice_month " +
                        "  union all " +
                        "  SELECT sp.month as month_name, 0 as revenue, sum(sp.gross_amount) as expense, MIN(sp.date) AS sort_date "
                        +
                        "  FROM tms.supplier_payable as sp " +
                        "  WHERE sp.date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) " +
                        "  AND sp.supplier_payable_status_id = 3 " + // <-- add karanawa
                        "  group by sp.month" +
                        ") as t " +
                        "group by t.month_name order by min(t.sort_date) asc;", nativeQuery = true)
        List<Object[]> getRevenueAndExpense();

        // ---------------------pending bookings report----------------------------
        // get all pending bookings
        @Query(value = "SELECT b.booking_no as bookingno, " +
                        "b.pickup_date_time as bookingdate, " +
                        "c.company_name as customer, " +
                        "v.vehicle_no as vehicle, " +
                        "d.fullname as driver, " +
                        "bs.status as status " +
                        "FROM tms.booking as b " +
                        "JOIN tms.customer as c ON c.id = b.customer_id " +
                        "LEFT JOIN tms.vehicle as v ON v.id = b.vehicle_id " +
                        "LEFT JOIN tms.driver as d ON d.id = b.driver_id " +
                        "JOIN tms.booking_status as bs ON bs.id = b.booking_status_id " +
                        "WHERE bs.id NOT IN (6,7,8,9) " +
                        "ORDER BY b.id DESC", nativeQuery = true)
        String[][] getAllPendingBookings();

        // pending bookings tika ganna vehicle type eka anuwa
        @Query(value = "SELECT vt.name as vehicleType, count(b.id) FROM tms.booking as b join tms.vehicle_type as vt on vt.id = b.vehicle_type_id where b.booking_status_id not in (6,7,8,9,10) group by vt.name", nativeQuery = true)
        String[][] getPendingBookingByVehicleType();

        // pending bookings wala assigned time ekai pickup time ekai athara diffrenece
        // eka gnnawa
        @Query(value = "SELECT GREATEST(TIMESTAMPDIFF(MINUTE,b.pickup_date_time,COALESCE(b.assigned_date_time, NOW())),0) AS duration_minutes FROM tms.booking AS b WHERE b.booking_status_id NOT IN (6, 7, 8, 9, 10)", nativeQuery = true)
        String[][] getPendingBookingDuration();

        // -----------------vehcle assigni js eka use karanna---------------------------
        // get vehicle's total distance in current month
        @Query(value = "SELECT COALESCE(SUM(b.distance), 0) FROM tms.booking AS b WHERE b.vehicle_id = ?1 AND MONTH(b.pickup_date_time) = MONTH(CURRENT_DATE()) AND YEAR(b.pickup_date_time) = YEAR(CURRENT_DATE()) AND b.booking_status_id NOT IN (7)", nativeQuery = true)
        Double getVehicleTotalDistanceInCurrentMonth(Integer vehicleId);

        // get vehicle's last trip delivery date time
        @Query(value = "SELECT b.delivery_date_time FROM tms.booking AS b WHERE b.vehicle_id = ?1 AND b.booking_status_id IN (6, 8, 9) ORDER BY b.delivery_date_time DESC LIMIT 1", nativeQuery = true)
        java.time.LocalDateTime getLastTripDeliveryTime(Integer vehicleId);

        // gete vehicle last assigned driver
        @Query(value = "SELECT d.* FROM tms.driver AS d JOIN tms.booking AS b ON d.id = b.driver_id WHERE b.vehicle_id = ?1 and b.booking_status_id IN (6, 8, 9) ORDER BY b.delivery_date_time DESC LIMIT 1", nativeQuery = true)
        List<Map<String, Object>> getLastAssignedDriver(Integer vehicleid);

        // --------------for customer
        // dashboard-----------------------------------------------
        // bookings status overview eka gnn query eka
        @Query(value = "SELECT sum(b.booking_status_id=1) as pending_booking, sum(b.booking_status_id in(2,3,4,5)) as ongonig_booking, sum(b.booking_status_id in(6,8,9)) as complete_booking\n"
                        +
                        "FROM tms.booking as b where b.booking_status_id not in (7) and b.customer_id = ?1", nativeQuery = true)
        Object getBookingOverviewByCustomer(Integer customerId);

        @Query(value = "SELECT count(b.id) FROM tms.booking as b where b.booking_status_id not in (6,7,8,9) and b.customer_id = ?1", nativeQuery = true)
        Integer getTotalActiveBookingListByCustomer(Integer customerId);

        @Query(value = "SELECT count(b.id) FROM tms.booking as b where b.customer_id = ?1", nativeQuery = true)
        Integer getTotalBookingsByCustomer(Integer customerId);

        @Query(value = "SELECT count(b.id) FROM tms.booking as b where b.booking_status_id not in (6,7,8,9) and b.customer_id = ?1", nativeQuery = true)
        Integer getActiveBookingsByCustomer(Integer customerId);

        @Query(value = "SELECT count(b.id) FROM tms.booking as b where b.booking_status_id in (6,8,9) and b.customer_id = ?1", nativeQuery = true)
        Integer getCompletedBookingsByCustomer(Integer customerId);

        @Query(value = "SELECT count(i.id) FROM tms.invoice as i where i.customer_id = ?1 and i.invoice_status_id = 1", nativeQuery = true)
        Integer getPendingInvoicesByCustomer(Integer customerId);

        // ------------------for vehicle revenue report (total
        // disatnce)----------------------------------------------------------------------

        // currenet monthvehicle revenue current month without attend/inprocess/cancel
        // bookings
        @Query(value = "SELECT round(sum(b.distance),2),(SELECT v.vehicle_no FROM tms.vehicle as v where v.id=b.vehicle_id) FROM tms.booking as b  where b.booking_status_id not in (1,2,7) and b.customer_id=?1 and b.vehicle_type_id=?2 group by b.vehicle_id; ", nativeQuery = true)
        String[][] getCurrentMonthVehicleRevenue(Integer customerId, Integer vehicleTypeId);

        @Query(value = "SELECT COALESCE(SUM(b.distance), 0) FROM tms.booking AS b WHERE b.vehicle_id = ?1 AND MONTH(b.pickup_date_time) = MONTH(CURRENT_DATE()) AND YEAR(b.pickup_date_time) = YEAR(CURRENT_DATE()) AND b.booking_status_id NOT IN (1, 7 ,10)", nativeQuery = true)
        Integer getVehicelTotaDisatnceCurruetMonth(Integer vehicleid);

        // currunt month eke vehicel revenue ekea gnnawa
        @Query(value = "SELECT round(sum(b.distance),2) as total_distance, " +
                        "(SELECT v.vehicle_no FROM tms.vehicle as v where v.id = b.vehicle_id) as vehicleNo " +
                        "FROM tms.booking as b " +
                        "WHERE b.booking_status_id not in (1,2,7) " +
                        "AND (:customerId IS NULL OR b.customer_id = :customerId) " +
                        "AND (:vehicleTypeId IS NULL OR b.vehicle_type_id = :vehicleTypeId) " +
                        "AND (:startDate IS NULL OR b.pickup_date_time >= :startDate) " +
                        "AND (:endDate IS NULL OR b.pickup_date_time <= :endDate) " +
                        "GROUP BY b.vehicle_id " +
                        "ORDER BY total_distance desc", nativeQuery = true)
        String[][] getVehicleRevenueReport(
                        @Param("customerId") Integer customerId,
                        @Param("vehicleTypeId") Integer vehicleTypeId,
                        @Param("startDate") String startDate,
                        @Param("endDate") String endDate);

        // ------------------------supplier payment report----------------------------
        @Query(value = "SELECT b.booking_no as bookingno, " +
                        "b.pickup_date_time as bookingdate, " +
                        "s.fullname as supplier, " +
                        "d.fullname as driver, " +
                        "v.vehicle_no as vehicleNo, " +
                        "p.package_type as packageType, " +
                        "b.distance, " +
                        "p.package_charge_sup as supplierCharge, " +
                        "p.id as pacakageId, " +
                        "(SELECT COUNT(*) " +
                        "FROM tms.booking as b2 " +
                        " WHERE b2.vehicle_id = v.id " +
                        "AND b2.customer_agreement_id = b.customer_agreement_id " +
                        "AND YEAR(b2.pickup_date_time) = YEAR(b.pickup_date_time) " +
                        "AND MONTH(b2.pickup_date_time) = MONTH(b.pickup_date_time) " +
                        "AND b2.booking_status_id IN (6, 8, 9)) as monthlyBookingCount " +
                        "FROM tms.booking as b " +
                        "JOIN tms.vehicle as v ON v.id = b.vehicle_id " +
                        "JOIN tms.supplier as s ON s.id = v.supplier_id " +
                        "JOIN tms.customer_agreement as ca ON ca.id = b.customer_agreement_id " +
                        "JOIN tms.package as p ON p.id = ca.package_id " +
                        "JOIN tms.supplier_agreement as sa ON sa.package_id = ca.package_id " +
                        "    AND sa.vehicle_id = v.id " +
                        "    AND b.pickup_date_time BETWEEN sa.agreement_date AND sa.agreement_end_date " + // ===
                                                                                                            // methana
                                                                                                            // add
                                                                                                            // karannawa
                                                                                                            // -
                                                                                                            // booking
                                                                                                            // date eka
                                                                                                            // agreement
                                                                                                            // validity
                                                                                                            // period
                                                                                                            // ekata
                                                                                                            // match
                                                                                                            // karanawa
                                                                                                            // ===
                        "JOIN tms.driver as d ON d.id = b.driver_id " +
                        "WHERE b.booking_status_id = 9 " +
                        "AND (:supplierId IS NULL OR s.id = :supplierId) " +
                        "AND (:vehicleId IS NULL OR v.id = :vehicleId) " +
                        "AND (:driverId IS NULL OR d.id = :driverId) " +
                        "AND (:startDate IS NULL OR b.pickup_date_time >= :startDate) " +
                        "AND (:endDate IS NULL OR b.pickup_date_time <= :endDate)", nativeQuery = true)
        String[][] getSupplierPayments(
                        @Param("supplierId") Integer supplierId,
                        @Param("vehicleId") Integer vehicleId,
                        @Param("driverId") Integer driverId,
                        @Param("startDate") String startDate,
                        @Param("endDate") String endDate);
        // -----------------customer payemnt report--------------------------------

        @Query(value = "SELECT b.booking_no as bookingno, " +
                        "b.pickup_date_time as bookingdate, " +
                        "c.company_name as customer, " +
                        "pl.name as pickupLocation, " +
                        "dl.name as deliveryLocation, " +
                        "p.package_type as packageType, " +
                        "b.distance, " +
                        "p.package_charge_cus as customerCharge, " +
                        "p.id as pacakageId, " +
                        "(SELECT COUNT(*) " +
                        " FROM tms.booking as b2 " +
                        " WHERE b2.customer_id = c.id " +
                        " AND b2.customer_agreement_id = ca.id " +
                        " AND YEAR(b2.pickup_date_time) = YEAR(b.pickup_date_time) " +
                        " AND MONTH(b2.pickup_date_time) = MONTH(b.pickup_date_time) " +
                        " AND b2.booking_status_id IN (6, 8, 9)) as monthlyBookingCount " +
                        "FROM tms.booking as b " +
                        "JOIN tms.pickup_locations as pl ON pl.id = b.pickup_locations_id " +
                        "JOIN tms.delivery_locations as dl ON dl.id = b.delivery_locations_id " +
                        "JOIN tms.customer_agreement as ca ON ca.id = b.customer_agreement_id " +
                        "JOIN tms.package as p ON p.id = ca.package_id " +
                        "JOIN tms.customer as c ON c.id = b.customer_id " +
                        "JOIN tms.vehicle as v ON v.id = b.vehicle_id " +
                        "JOIN tms.supplier as s ON s.id = v.supplier_id " +
                        "JOIN tms.driver as d ON d.id = b.driver_id " +
                        "WHERE b.booking_status_id in ( 8,9 ) " +
                        "AND (:customerId IS NULL OR c.id = :customerId) " +
                        "AND (:vehicleId IS NULL OR v.id = :vehicleId) " +
                        "AND (:driverId IS NULL OR d.id = :driverId) " +
                        "AND (:startDate IS NULL OR b.pickup_date_time >= :startDate) " +
                        "AND (:endDate IS NULL OR b.pickup_date_time <= :endDate)", nativeQuery = true)
        String[][] getCustomerPayments(
                        @Param("customerId") Integer customerId,
                        @Param("vehicleId") Integer vehicleId,
                        @Param("driverId") Integer driverId,
                        @Param("startDate") String startDate,
                        @Param("endDate") String endDate);

        // ---------------------- fuel summary report
        // -----------------------------------------------------
        @Query(value = "SELECT b.booking_no as bookingNo, " +
                        "v.vehicle_no as vehicleNo, " +
                        "d.fullname as driverName, " +
                        "fr.request_fuel_cost_amount as requestAmount, " +
                        "fc.fuel_cards_no as fuelCardNo, " +
                        "fr.added_datetime as addedDate " +
                        "FROM tms.fuel_request as fr " +
                        "join tms.vehicle as v on v.id = fr.vehicle_id " +
                        "join tms.driver as d on d.id = fr.driver_id " +
                        "join tms.booking as b on b.id = fr.booking_id " +
                        "join tms.fuel_cards as fc on fc.id = fr.fuel_cards_id " +
                        "where (:vehicleId is null or v.id = :vehicleId) " +
                        "and (:driverId is null or d.id = :driverId) " +
                        "and (:fuelCardId is null or fc.id = :fuelCardId) " +
                        "and (:startDate is null or fr.added_datetime >= :startDate) " +
                        "and (:endDate is null or fr.added_datetime <= :endDate) and fr.fuel_request_status_id not in (7, 8)", nativeQuery = true)
        String[][] getFuelSummaryReport(
                        @Param("vehicleId") Integer vehicleId,
                        @Param("driverId") Integer driverId,
                        @Param("fuelCardId") Integer fuelCardId,
                        @Param("startDate") String startDate,
                        @Param("endDate") String endDate);

}
