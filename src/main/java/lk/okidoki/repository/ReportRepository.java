package lk.okidoki.repository;

import lk.okidoki.modal.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.sql.Date;
import java.util.List;

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

    // currenet monthvehicle revenue current month without attend/inprocess/cancel
    // bookings
    @Query(value = "SELECT round(sum(b.distance),2),(SELECT v.vehicle_no FROM tms.vehicle as v where v.id=b.vehicle_id) FROM tms.booking as b  where b.booking_status_id not in (1,2,7) and month(b.pickup_date_time) = month(current_date()) and b.customer_id=?1 and b.vehicle_type_id=?2 group by b.vehicle_id; ", nativeQuery = true)
    String[][] getCurrentMonthVehicleRevenue(Integer customerId, Integer vehicleTypeId);

    // -------------------------------------booking
    // Report-------------------------------------------------------------------------------

    // given date range
    @Query(value = "SELECT b FROM Booking b WHERE DATE(b.delivery_date_time) BETWEEN ?1 AND ?2")
    List<Booking> getBookingByDateRange(Date startdate, Date enddate);

    // this month actual vs shedule eka gnnawa
    @Query(value = "SELECT \n" + //
            "  DATE(b.pickup_date_time) AS day,\n" + //
            "  SUM(TIMESTAMPDIFF(MINUTE,b.pickup_date_time,b.delivery_date_time)) AS idletime,\n" + //
            "  SUM(TIMESTAMPDIFF(MINUTE,b.arrived_at_pickup_datetime,b.arrived_at_delivery_datetime)) AS actualtime\n"
            + //
            "FROM tms.booking AS b\n" + //
            "WHERE \n" + //
            "  b.arrived_at_pickup_datetime IS NOT NULL \n" + //
            "  AND b.arrived_at_delivery_datetime IS NOT NULL\n" + //
            "  AND b.pickup_date_time >= DATE_FORMAT(CURDATE(),'%Y-%m-01')\n" + //
            "GROUP BY DATE(b.pickup_date_time)\n" + //
            "ORDER BY DATE(b.pickup_date_time)", nativeQuery = true)
    String[][] getThisMonthActualVsSchedule();

    @Query(value = "SELECT \n" + //
            "  DATE(b.pickup_date_time) AS day,\n" + //
            "  SUM(TIMESTAMPDIFF(MINUTE,b.pickup_date_time,b.delivery_date_time)) AS idletime,\n" + //
            "  SUM(TIMESTAMPDIFF(MINUTE,b.arrived_at_pickup_datetime,b.arrived_at_delivery_datetime)) AS actualtime\n"
            + //
            "FROM tms.booking AS b\n" + //
            "WHERE \n" + //
            "  b.arrived_at_pickup_datetime IS NOT NULL \n" + //
            "  AND b.arrived_at_delivery_datetime IS NOT NULL\n" + //
            "  AND b.pickup_date_time >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01')\n" + //
            "AND b.pickup_date_time < DATE_FORMAT(CURDATE(), '%Y-%m-01')\n" + //
            "GROUP BY DATE(b.pickup_date_time)\n" + //
            "ORDER BY DATE(b.pickup_date_time)", nativeQuery = true)
    String[][] getLastMonthActualVsSchedule();

    @Query(value = "SELECT \n" + //
            "  DATE_FORMAT(b.pickup_date_time,'%Y-%m') AS month,\n" + // year-month format
            "  SUM(TIMESTAMPDIFF(MINUTE,b.pickup_date_time,b.delivery_date_time)) AS idletime,\n" + //
            "  SUM(TIMESTAMPDIFF(MINUTE,b.arrived_at_pickup_datetime,b.arrived_at_delivery_datetime)) AS actualtime\n"
            + //
            "FROM tms.booking AS b\n" + //
            "WHERE \n" + //
            "  b.arrived_at_pickup_datetime IS NOT NULL \n" + //
            "  AND b.arrived_at_delivery_datetime IS NOT NULL\n" + //
            "  AND b.pickup_date_time >= DATE_FORMAT(CURDATE() - INTERVAL 3 MONTH, '%Y-%m-01')\n" + //
            "AND b.pickup_date_time < DATE_FORMAT(CURDATE(), '%Y-%m-01')\n" + //
            "GROUP BY DATE_FORMAT(b.pickup_date_time,'%Y-%m')\n" + //
            "ORDER BY DATE_FORMAT(b.pickup_date_time,'%Y-%m')", nativeQuery = true)
    String[][] getLast3MonthsActualVsSchedule();

    @Query(value = "SELECT \n" + //
            "  DATE_FORMAT(b.pickup_date_time,'%Y-%m') AS month,\n" + // year-month format
            "  SUM(TIMESTAMPDIFF(MINUTE,b.pickup_date_time,b.delivery_date_time)) AS idletime,\n" + //
            "  SUM(TIMESTAMPDIFF(MINUTE,b.arrived_at_pickup_datetime,b.arrived_at_delivery_datetime)) AS actualtime\n"
            + //
            "FROM tms.booking AS b\n" + //
            "WHERE \n" + //
            "  b.arrived_at_pickup_datetime IS NOT NULL \n" + //
            "  AND b.arrived_at_delivery_datetime IS NOT NULL\n" + //
            "  AND b.pickup_date_time >= DATE_FORMAT(CURDATE() - INTERVAL 6 MONTH, '%Y-%m-01')\n" + //
            "AND b.pickup_date_time < DATE_FORMAT(CURDATE(), '%Y-%m-01')\n" + //
            "GROUP BY DATE_FORMAT(b.pickup_date_time,'%Y-%m')\n" + //
            "ORDER BY DATE_FORMAT(b.pickup_date_time,'%Y-%m')", nativeQuery = true)
    String[][] getLast6MonthsActualVsSchedule();

    @Query(value = "SELECT \n" + //
            "  DATE_FORMAT(b.pickup_date_time,'%Y-%m') AS month,\n" + // year-month format
            "  SUM(TIMESTAMPDIFF(MINUTE,b.pickup_date_time,b.delivery_date_time)) AS idletime,\n" + //
            "  SUM(TIMESTAMPDIFF(MINUTE,b.arrived_at_pickup_datetime,b.arrived_at_delivery_datetime)) AS actualtime\n"
            + //
            "FROM tms.booking AS b\n" + //
            "WHERE \n" + //
            "  b.arrived_at_pickup_datetime IS NOT NULL \n" + //
            "  AND b.arrived_at_delivery_datetime IS NOT NULL\n" + //
            "  AND b.pickup_date_time >= DATE_FORMAT(CURDATE() - INTERVAL 12 MONTH, '%Y-%m-01')\n" + //
            "AND b.pickup_date_time < DATE_FORMAT(CURDATE(), '%Y-%m-01')\n" + //
            "GROUP BY DATE_FORMAT(b.pickup_date_time,'%Y-%m')\n" + //
            "ORDER BY DATE_FORMAT(b.pickup_date_time,'%Y-%m')", nativeQuery = true)
    String[][] getThisYearActualVsSchedule();

    // ---------------------------------revenue license expire list
    // report-------------------------------------------------------------------
    @Query(value = "SELECT *,\n" + //
            "       CASE\n" + // meken revenue license status eka anuwa wena karala thiyenawa
            "         WHEN v.revenu_license_expire_date < CURRENT_DATE() THEN 'Expired'\n" + //
            "         WHEN v.revenu_license_expire_date BETWEEN CURRENT_DATE() AND CURRENT_DATE() + INTERVAL 30 DAY THEN 'Expiring Soon'\n"
            + //
            "       END AS revenu_status FROM tms.vehicle as v where v.vehicle_status_id=1 and (v.revenu_license_expire_date < current_date() or v.revenu_license_expire_date between current_date() and current_date() + interval 30 day)", nativeQuery = true)
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
            "       END AS insurance_status FROM tms.vehicle as v where  v.vehicle_status_id=1 and (v.insurance_expire_date < current_date() or v.insurance_expire_date between current_date() and current_date() + interval 30 day)", nativeQuery = true)
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
    @Query("SELECT b FROM Booking b WHERE DATE(b.pickup_date_time) = CURRENT_DATE ORDER BY b.id")
    List<Booking> getAllBookingsForDaily();

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

    // currunt week delay bookings count gnnw
    @Query(value = "SELECT DAYNAME(b.pickup_date_time) as day_of_week,count(*) as total_bookings,sum(case when b.delivery_date_time < b.arrived_at_delivery_datetime then 1 else 0 end) as delay_delivery,round(((sum(case when b.delivery_date_time < b.arrived_at_delivery_datetime then 1 else 0 end)/ count(*))*100 ),2) as delay_precentage,sum(case when b.delivery_date_time >= b.arrived_at_delivery_datetime then 1 else 0 end) as ontime_delivery FROM tms.booking as b where b.arrived_at_delivery_datetime is not null and WEEK(CURDATE()) group by DAYNAME(b.pickup_date_time)", nativeQuery = true)
    String[][] getDelayBookingThisWeek();

    // delay booking tika ganna query eka pickup ekata wada actual pickup eka wadi
    // saha dilevry ekata wada actual delivery eka wadi ewa
    @Query(value = "SELECT b.booking_no, c.company_name, v.vehicle_no, \n" + //
            "pl.name as pickup, dl.name as destination, \n" + //
            "b.pickup_date_time, b.delivery_date_time, b.arrived_at_pickup_datetime, b.arrived_at_delivery_datetime, \n"
            + //
            "greatest(timestampdiff(Minute,b.pickup_date_time,b.arrived_at_pickup_datetime),0) as pickupdelay, \n"
            + //
            "greatest(timestampdiff(Minute,b.delivery_date_time,b.arrived_at_delivery_datetime),0) as deliverydelay, \n"
            + //
            "drp.delay_reasons as pickup_reason, drd.delay_reasons as delivery_reason \n" + //
            "FROM tms.booking as b \n" + //
            "join tms.customer as c on c.id = b.customer_id \n" + //
            "join tms.pickup_locations as pl on pl.id = b.pickup_locations_id \n" + //
            "join tms.delivery_locations as dl on dl.id = b.delivery_locations_id \n" + //
            "join tms.vehicle as v on v.id = b.vehicle_id \n" + //
            "left join tms.delay_reasons as drp on drp.id = b.pickup_delay_reason_id \n" + //
            "left join tms.delay_reasons as drd on drd.id = b.delivery_delay_reasons_id \n" + //
            "where b.booking_status_id != 7 and (b.delivery_delay_reasons_id is not null or b.pickup_delay_reason_id is not null)", nativeQuery = true)
    String[][] getAllDelayBookings();

    // overall perfomance ganna query eka this Month
    @Query(value = "SELECT count(*) as total_bookings,\n" +
            "(sum(case when (b.pickup_date_time<b.arrived_at_pickup_datetime or b.delivery_date_time<b.arrived_at_delivery_datetime) then 1 else 0 end)) as late_bookings \n"
            +
            "FROM tms.booking as b where b.arrived_at_delivery_datetime is not null and MONTH(b.pickup_date_time) = MONTH(CURDATE());", nativeQuery = true)
    Object[] getOverallPerfomance();

    // overall perfomance ganna query eka last Month
    @Query(value = "SELECT count(*) as total_bookings,\n" +
            "(sum(case when (b.pickup_date_time<b.arrived_at_pickup_datetime or b.delivery_date_time<b.arrived_at_delivery_datetime) then 1 else 0 end)) as late_bookings \n"
            +
            "FROM tms.booking as b where b.arrived_at_delivery_datetime is not null and MONTH(b.pickup_date_time) = MONTH(CURDATE())-1;", nativeQuery = true)
    Object[] getOverallPerfomanceLastMonth();

    // overall perfomance ganna query eka last 6 month
    @Query(value = "SELECT count(*) as total_bookings,\n" +
            "(sum(case when (b.pickup_date_time<b.arrived_at_pickup_datetime or b.delivery_date_time<b.arrived_at_delivery_datetime) then 1 else 0 end)) as late_bookings \n"
            +
            "FROM tms.booking as b where b.arrived_at_delivery_datetime is not null and MONTH(b.pickup_date_time) >= MONTH(CURDATE())-6;", nativeQuery = true)
    Object[] getOverallPerfomanceLast6Month();

    // overall perfomance ganna query eka this Year
    @Query(value = "SELECT count(*) as total_bookings,\n" +
            "(sum(case when (b.pickup_date_time<b.arrived_at_pickup_datetime or b.delivery_date_time<b.arrived_at_delivery_datetime) then 1 else 0 end)) as late_bookings \n"
            +
            "FROM tms.booking as b where b.arrived_at_delivery_datetime is not null and YEAR(b.pickup_date_time) = YEAR(CURDATE());", nativeQuery = true)
    Object[] getOverallPerfomanceThisYear();

    // overall perfomance ganna eka last Year
    @Query(value = "SELECT count(*) as total_bookings,\n" +
            "(sum(case when (b.pickup_date_time<b.arrived_at_pickup_datetime or b.delivery_date_time<b.arrived_at_delivery_datetime) then 1 else 0 end)) as late_bookings \n"
            +
            "FROM tms.booking as b where b.arrived_at_delivery_datetime is not null and YEAR(b.pickup_date_time) = YEAR(CURDATE())-1;", nativeQuery = true)
    Object[] getOverallPerfomanceLastYear();

    // ontime and delay precentage gannawa month eka anuwa
    @Query(value = "SELECT month(b.pickup_date_time) as month, \n" + //
            "Round(Sum(case when b.pickup_delay_reason_id is null and b.delivery_delay_reasons_id is null then 1 else 0 end ) * 100.0 /count(*),2) as ontime,\n"
            + //
            "Round(Sum(case when b.pickup_delay_reason_id is not null or b.delivery_delay_reasons_id is not null then 1 else 0 end ) * 100.0 /count(*),2) as delay\n"
            + //
            " FROM tms.booking as b\n" + //
            " WHERE YEAR(b.pickup_date_time) = YEAR(CURDATE()) and\n" + //
            " b.booking_status_id !=7\n" + //
            "GROUP BY MONTH(b.pickup_date_time)\n" + //
            "ORDER BY MONTH(b.pickup_date_time)", nativeQuery = true)
    String[][] getDelayAndOnTimePrecentageWithMonth();

    // delay wela thiyena reason eka anuwa booking count eka saha precentage eka
    // gnnawa currnt month eke adlawa with reason wise

    @Query(value = "SELECT d.delay_reasons as reason, COUNT(*) AS total,\n" + //
            "    ROUND(\n" + //
            "        COUNT(*) * 100.0 / \n" + //
            "        (SELECT COUNT(*) \n" + //
            "         FROM tms.booking \n" + //
            "         WHERE YEAR(pickup_date_time) = YEAR(CURDATE()) \n" + //
            "         AND booking_status_id != 7),\n" + //
            "    2) AS percentage \n" + //
            "FROM tms.booking as b join tms.delay_reasons as d ON d.id IN (b.pickup_delay_reason_id, b.delivery_delay_reasons_id)\n"
            + //
            "WHERE YEAR(b.pickup_date_time) = YEAR(CURDATE()) and\n" + //
            "b.booking_status_id != 7\n" + //
            "GROUP BY d.delay_reasons\n" + //
            "ORDER BY total DESC", nativeQuery = true)
    String[][] getDelaPrecentageByReasinWiseCurruntYear();

    // customer ta adalwa delaya anlitic eka gannawa
    @Query(value = "SELECT c.company_name ,\n" + // comapany name
            "Round(Sum(case when b.pickup_delay_reason_id is null and b.delivery_delay_reasons_id is null then 1 else 0 end ) * 100.0 /count(*),2) as ontime,\n"
            + // precenatge eka gnnawa
            "Round(Sum(case when b.pickup_delay_reason_id is not null or b.delivery_delay_reasons_id is not null then 1 else 0 end ) * 100.0 /count(*),2) as delay,\n"
            + //
            "count(*) as total,\n" + //
            "avg(GREATEST(timestampdiff(MINUTE,b.arrived_at_pickup_datetime,b.pickup_date_time),0)) as pickupDelayTime,\n"
            + // time diffrenece eka negative nowa ewage sum eka araganna
            "avg(GREATEST(timestampdiff(MINUTE,b.arrived_at_delivery_datetime,b.delivery_date_time),0)) as deliveryDelayTime\n"
            + //
            "FROM tms.booking as b join tms.customer as c ON c.id = b.customer_id\n" + //
            "WHERE YEAR(b.pickup_date_time) = YEAR(CURDATE()) and\n" + //
            "b.booking_status_id != 7\n" + //
            "GROUP BY c.company_name\n" + //
            "ORDER BY c.company_name DESC", nativeQuery = true)
    String[][] getDelayDetailsByCustomerWise();

    // vehicle type ta adalwa delay details gannawa currunt yaer eke
    @Query(value = "SELECT vt.name,\n" +
            "Round(Sum(case when b.pickup_delay_reason_id is null and b.delivery_delay_reasons_id is null then 1 else 0 end ) * 100.0 /count(*),2) as ontime,\n"
            +
            "Round(Sum(case when b.pickup_delay_reason_id is not null or b.delivery_delay_reasons_id is not null then 1 else 0 end ) * 100.0 /count(*),2) as delay,\n"
            +
            "count(*) as total,\n" +
            "avg(GREATEST(timestampdiff(MINUTE,b.arrived_at_pickup_datetime,b.pickup_date_time),0)) as pickupDelayTime,\n"
            +
            "avg(GREATEST(timestampdiff(MINUTE,b.arrived_at_delivery_datetime,b.delivery_date_time),0)) as deliveryDelayTime\n"
            +
            "FROM tms.booking as b\n" +
            "JOIN tms.vehicle as v ON v.id = b.vehicle_id\n" +
            "JOIN tms.vehicle_type as vt ON vt.id = v.vehicle_type_id\n" +
            "WHERE YEAR(b.pickup_date_time) = YEAR(CURDATE()) and\n" +
            "b.booking_status_id != 7\n" +
            "GROUP BY vt.name\n" +
            "ORDER BY total DESC", nativeQuery = true)
    String[][] getDelayDetailsByVehicleTypeWise();

    // --------------------------------------------driver performance
    // report-------------------------------------------------------------
    // get all driver performance details
    @Query(value = "SELECT d.fullname AS driver_name,COUNT(DISTINCT b.id) AS total_trips, SUM(b.arrived_at_delivery_datetime <= b.delivery_date_time) AS on_time_deliveries,SUM(b.arrived_at_delivery_datetime > b.delivery_date_time) AS late_deliveries,\n"
            +
            "ROUND(SUM(b.arrived_at_delivery_datetime <= b.delivery_date_time) * 100.0 / COUNT(DISTINCT b.id), 2) AS on_time_rate_percent\n"
            +
            "FROM tms.driver d JOIN tms.booking b ON b.driver_id = d.id and  b.arrived_at_delivery_datetime is not null GROUP BY d.id ORDER BY on_time_rate_percent DESC;", nativeQuery = true)
    List<Object[]> getDriverPerformanceReport();

    // get all drivers count which is completed at least one trip
    @Query(value = "SELECT COUNT(DISTINCT d.id) FROM tms.driver d JOIN tms.booking b ON b.driver_id = d.id and  b.arrived_at_delivery_datetime is not null;", nativeQuery = true)
    Integer getDriverCountWithAtLeastOneTrip();

    // get all driver performance details by date range
    @Query(value = "SELECT d.fullname AS driver_name,COUNT(DISTINCT b.id) AS total_trips, SUM(b.arrived_at_delivery_datetime <= b.delivery_date_time) AS on_time_deliveries,SUM(b.arrived_at_delivery_datetime > b.delivery_date_time) AS late_deliveries,\n"
            +
            "ROUND(SUM(b.arrived_at_delivery_datetime <= b.delivery_date_time) * 100.0 / COUNT(DISTINCT b.id), 2) AS on_time_rate_percent\n"
            +
            "FROM tms.driver d JOIN tms.booking b ON b.driver_id = d.id WHERE DATE(b.pickup_date_time) BETWEEN ?1 AND ?2 and  b.arrived_at_delivery_datetime is not null GROUP BY d.id ORDER BY on_time_rate_percent DESC;", nativeQuery = true)
    List<Object[]> getDriverPerformanceReportByDateRange(String startdate, String enddate);

    // get selected driver performance details
    @Query(value = "SELECT d.fullname AS driver_name,COUNT(DISTINCT b.id) AS total_trips, SUM(b.arrived_at_delivery_datetime <= b.delivery_date_time) AS on_time_deliveries,SUM(b.arrived_at_delivery_datetime > b.delivery_date_time) AS late_deliveries,\n"
            +
            "ROUND(SUM(b.arrived_at_delivery_datetime <= b.delivery_date_time) * 100.0 / COUNT(DISTINCT b.id), 2) AS on_time_rate_percent\n"
            +
            "FROM tms.driver d JOIN tms.booking b ON b.driver_id = d.id WHERE d.id = ?1 and  b.arrived_at_delivery_datetime is not null GROUP BY d.id ORDER BY on_time_rate_percent DESC;", nativeQuery = true)
    String[][] getSelectedDriverPerformanceReport(Integer driverId);

    // get selected driver performance details by date range
    @Query(value = "SELECT d.fullname AS driver_name,COUNT(DISTINCT b.id) AS total_trips, SUM(b.arrived_at_delivery_datetime <= b.delivery_date_time) AS on_time_deliveries,SUM(b.arrived_at_delivery_datetime > b.delivery_date_time) AS late_deliveries,\n"
            +
            "ROUND(SUM(b.arrived_at_delivery_datetime <= b.delivery_date_time) * 100.0 / COUNT(DISTINCT b.id), 2) AS on_time_rate_percent\n"
            +
            "FROM tms.driver d JOIN tms.booking b ON b.driver_id = d.id WHERE d.id = ?1 AND DATE(b.pickup_date_time) BETWEEN ?2 AND ?3 and b.arrived_at_delivery_datetime is not null GROUP BY d.id ORDER BY on_time_rate_percent DESC;", nativeQuery = true)
    String[][] getSelectedDriverPerformanceReportByDateRange(Integer driverId, String startdate, String enddate);

    // get driver ranking
    @Query(value = "SELECT * from \n" +
            "(SELECT b.driver_id as id, d.driver_reg_no as driver_reg_no, d.fullname as driver_name,round(SUM(b.arrived_at_delivery_datetime <= b.delivery_date_time) * 100.0 / COUNT(DISTINCT b.id),2) AS on_time_rate_percent ,\n"
            +
            "rank() over (order by sum(b.arrived_at_delivery_datetime <= b.delivery_date_time) * 100.0 / count(distinct b.id) desc) as driver_rank\n"
            +
            "FROM tms.driver as d join tms.booking as b on b.driver_id = d.id and  b.arrived_at_delivery_datetime is not null group by b.driver_id, d.driver_reg_no, d.fullname) as ranking  where id =?1;", nativeQuery = true)
    String[][] getDriverRanking(Integer driverId);

    // get bookings add karala thiyen drivers la list eka witharak gnnawa
    @Query("SELECT d FROM Driver d WHERE d.id IN (SELECT DISTINCT b.driver_id.id FROM Booking b WHERE b.driver_id.id = d.id)")
    List<Driver> getDriverList();

    // ---------------------------------------Income
    // Report-------------------------------------------------------------
    @Query(value = "SELECT monthname(i.invoice_date) as month, count(ihb.booking_id), sum(i.invoice_total) as gross_amount,sum(i.invoice_tax) as tax_amount, sum(i.invoice_subtotal) as net_amount FROM tms.invoice as i \n"
            +
            "join tms.invoice_has_booking as ihb on ihb.invoice_id = i.id group by i.invoice_date,i.invoice_month order by year(i.invoice_date) asc, month(i.invoice_date) asc", nativeQuery = true)
    List<Object[]> getIncomeSummary();

    @Query(value = "SELECT c.company_name, sum(i.invoice_subtotal) as net_amount FROM tms.invoice as i join tms.customer as c on c.id = i.customer_id group by i.customer_id", nativeQuery = true)
    List<Object[]> getIncomeSummaryCustomerWise();

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
    @Query(value = "SELECT t.month_name,sum(t.revenue) as revenu,sum(t.expense) as expense FROM (SELECT i.invoice_month as month_name, sum(i.invoice_subtotal) as revenue,0 as expense, min(i.invoice_date) AS sort_date FROM tms.invoice as i WHERE i.invoice_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) group by i.invoice_month union all\n"
            +
            "SELECT sp.month as month_name,0 as revenu, sum(sp.total_amount) as expense,MIN(sp.date) AS sort_date FROM tms.supplier_payable as sp WHERE sp.date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) group by sp.month) as t\n"
            +
            "group by t.month_name order by min(t.sort_date) asc;", nativeQuery = true)
    List<Object[]> getRevenueAndExpense();

    // ---------------------pending bookings report----------------------------
    // get all pending bookings
    @Query(value = "SELECT b FROM Booking b where b.booking_status_id.id not in (6,7,8,9) order by b.id DESC")
    List<Booking> getAllPendingBookings();

    // pending bookings tika ganna vehicle type eka anuwa
    @Query(value = "SELECT vt.name as vehicleType, count(b.id) FROM tms.booking as b join tms.vehicle_type as vt on vt.id = b.vehicle_type_id where b.booking_status_id not in (6,7,8,9,10) group by vt.name", nativeQuery = true)
    String[][] getPendingBookingByVehicleType();

    // pending bookings wala assigned time ekai pickup time ekai athara diffrenece
    // eka gnnawa
    @Query(value = "SELECT GREATEST(TIMESTAMPDIFF(MINUTE,b.pickup_date_time,COALESCE(b.assigned_date_time, NOW())),0) AS duration_minutes FROM tms.booking AS b WHERE b.booking_status_id NOT IN (6, 7, 8, 9, 10)", nativeQuery = true)
    String[][] getPendingBookingDuration();

    // ---------------------customer payment report----------------------------
    @Query("SELECT cp FROM CustomerPayment cp ORDER BY cp.id DESC")
    List<CustomerPayment> getCustomerPaymentReport();

    @Query("SELECT cp FROM CustomerPayment cp WHERE cp.invoice_id.customer_id.id = ?1 ORDER BY cp.id DESC")
    List<CustomerPayment> getCustomerPaymentByCustomer(Integer customerId);

    @Query("SELECT cp FROM CustomerPayment cp WHERE DATE(cp.added_datetime) BETWEEN ?1 AND ?2 ORDER BY cp.id DESC")
    List<CustomerPayment> getCustomerPaymentByDateRange(Date startDate, Date endDate);

    @Query("SELECT cp FROM CustomerPayment cp WHERE cp.invoice_id.customer_id.id = ?1 AND DATE(cp.added_datetime) BETWEEN ?2 AND ?3 ORDER BY cp.id DESC")
    List<CustomerPayment> getCustomerPaymentByCustomerAndDateRange(Integer customerId, Date startDate, Date endDate);

    // Supplier Payment Report
    @Query("SELECT sp FROM SupplierPayment sp ORDER BY sp.id DESC")
    List<SupplierPayment> getSupplierPaymentReport();

    @Query("SELECT sp FROM SupplierPayment sp WHERE DATE(sp.added_datetime) BETWEEN ?1 AND ?2 ORDER BY sp.id DESC")
    List<SupplierPayment> getSupplierPaymentByDateRange(Date startdate, Date enddate);

    @Query("SELECT sp FROM SupplierPayment sp WHERE sp.supplier_payable_id.supplier_agreement_id.supplier_id.id = ?1 ORDER BY sp.id DESC")
    List<SupplierPayment> getSupplierPaymentBySupplier(Integer supplierid);

    @Query("SELECT sp FROM SupplierPayment sp WHERE DATE(sp.added_datetime) BETWEEN ?1 AND ?2 AND sp.supplier_payable_id.supplier_agreement_id.supplier_id.id = ?3 ORDER BY sp.id DESC")
    List<SupplierPayment> getSupplierPaymentByDateRangeAndSupplier(Date startdate, Date enddate, Integer supplierid);

    // get vehicle's total distance in current month
    @Query(value = "SELECT COALESCE(SUM(b.distance), 0) FROM tms.booking AS b WHERE b.vehicle_id = ?1 AND MONTH(b.pickup_date_time) = MONTH(CURRENT_DATE()) AND YEAR(b.pickup_date_time) = YEAR(CURRENT_DATE()) AND b.booking_status_id NOT IN (7)", nativeQuery = true)
    Double getVehicleTotalDistanceInCurrentMonth(Integer vehicleId);

    // get vehicle's last trip delivery date time
    @Query(value = "SELECT b.delivery_date_time FROM tms.booking AS b WHERE b.vehicle_id = ?1 AND b.booking_status_id IN (6, 8) ORDER BY b.delivery_date_time DESC LIMIT 1", nativeQuery = true)
    java.time.LocalDateTime getLastTripDeliveryTime(Integer vehicleId);
}
