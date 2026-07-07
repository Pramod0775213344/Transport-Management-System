package lk.okidoki.repository;

import lk.okidoki.modal.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.awt.print.Book;
import java.sql.Date;
import java.util.List;

public interface ReportRepository extends JpaRepository<Vehicle,Integer> {

//   vehicle count eka gnnw vehicle type eka anuwa
    @Query(value = "SELECT count(v.vehicle_type_id),(SELECT vt.name FROM tms.vehicle_type as vt where vt.id = v.vehicle_type_id) FROM tms.vehicle as v group by v.vehicle_type_id",nativeQuery = true)
    String[][] getCountByVehicleType();

//    booking count eka gnnw booking status eken
    @Query(value = "SELECT count(b.booking_status_id),(SELECT bs.status FROM tms.booking_status as bs where bs.id = b.booking_status_id) FROM tms.booking as b where month(b.pickup_date_time) = month(current_date()) group by b.booking_status_id ",nativeQuery = true)
    String[][] getCountByBookingStatus();

    //    booking count eka gnnw booking status eken
    @Query(value = "SELECT count(b.customer_id),(SELECT c.company_name FROM tms.customer as c where c.id = b.customer_id) FROM tms.booking as b where month(b.pickup_date_time) = month(current_date()) group by b.customer_id; ",nativeQuery = true)
    String[][] getBookingCountByCustomer();

    //    booking count eka gnnw booking status eken
    @Query(value = "SELECT round(sum(b.distance),2), monthname(delivery_date_time) FROM tms.booking as b group by monthname(b.delivery_date_time); ",nativeQuery = true)
    String[][] gettotalDistanceByMonthlyBookings();

    //    currenet monthvehicle revenue current month without attend/inprocess/cancel bookings
    @Query(value = "SELECT round(sum(b.distance),2),(SELECT v.vehicle_no FROM tms.vehicle as v where v.id=b.vehicle_id) FROM tms.booking as b  where b.booking_status_id not in (1,2,7) and month(b.pickup_date_time) = month(current_date()) and b.customer_id=?1 and b.vehicle_type_id=?2 group by b.vehicle_id; ",nativeQuery = true)
    String[][] getCurrentMonthVehicleRevenue(Integer customerId, Integer vehicleTypeId);

//    -------------------------------------booking Report-------------------------------------------------------------------------------

//    given date range
    @Query(value = "SELECT b FROM Booking b WHERE DATE(b.delivery_date_time) BETWEEN ?1 AND ?2")
    List<Booking> getBookingByDateRange(Date startdate, Date enddate);

//    ---------------------------------revenue license expire list report-------------------------------------------------------------------
    @Query(value = "SELECT * FROM tms.vehicle as v where v.revenu_license_expire_date< current_date() and v.vehicle_status_id=1",nativeQuery = true)
    List<Vehicle> getRevenueLicenseExpireList();

//    ---------------------------------insurance expire list report--------------------------------------------------------------------------

    @Query(value = "SELECT * FROM tms.vehicle as v where v.insurance_expire_date< current_date() and v.vehicle_status_id=1",nativeQuery = true)
    List<Vehicle> getInsuranceExpireList();

//    ______________________________count for vehicle dashboard report___________________________________________________________

    @Query(value = "SELECT count(v.id) FROM tms.vehicle as v where v.vehicle_status_id=1",nativeQuery = true)
    Integer getCountOfActiveVehicles();

    @Query(value = "SELECT count(v.id) FROM tms.vehicle as v ",nativeQuery = true)
    Integer getCountOfAllVehicles();

    @Query(value = "SELECT count(v.id) FROM tms.vehicle as v where v.revenu_license_expire_date< current_date() and v.vehicle_status_id=1",nativeQuery = true)
    Integer getCountOfRevenueLicenseExpireVehicles();

    @Query(value = "SELECT count(v.id) FROM tms.vehicle as v where v.insurance_expire_date< current_date() and v.vehicle_status_id=1",nativeQuery = true)
    Integer getCountOfInsuranceExpireVehicles();

//    ---------------------------------recently updated data for vehicle dashboard report---------------------------------------------------

    @Query(value = "SELECT * FROM tms.vehicle as v where v.revenu_license_expire_date< current_date() and v.vehicle_status_id=1 order by v.id desc limit 5", nativeQuery = true)
    List<Vehicle> getRecentlyUpdatedRevenueLicenseExpireVehicles();

    @Query(value = "SELECT * FROM tms.vehicle as v where v.insurance_expire_date< current_date() and v.vehicle_status_id=1 order by v.id desc limit 5", nativeQuery = true)
    List<Vehicle> getRecentlyUpdatedInsuranceExpireVehicles();

//    -------------------------------get vehicles revenue by customer id and vehicle type and group by currant month and currant year---------------------------
    @Query(value = "SELECT v.vehicle_no,sum(b.distance) as distance FROM tms.booking as b, tms.vehicle as v,tms.vehicle_type as vt where b.vehicle_id=v.id and v.vehicle_type_id=vt.id and b.customer_id=?1 and b.vehicle_type_id=?2 and v.id in (SELECT vghv.vehicle_id FROM tms.vehicle_group_has_vehicle as vghv where vghv.vehicle_group_id in(SELECT vg.id FROM tms.vehicle_group as vg where vg.customer_id =?1))and MONTH(b.pickup_date_time) = MONTH(CURDATE()) AND YEAR(b.pickup_date_time) = YEAR(CURDATE()) group by v.id", nativeQuery = true)
    List<Object[]> getVehiclesRevenueByCustomerIdAndVehicleTypeAndGroupByCurrantMonthAndYear(Integer customerId, Integer vehicleTypeId);

    //    ______________________________count for vehicle dashboard report___________________________________________________________

    @Query(value = "SELECT count(b.id) FROM tms.booking as b where b.booking_status_id=1",nativeQuery = true)
    Integer getPendingBookingCount();

    @Query(value = "SELECT count(c.id) FROM tms.customer as c where c.customer_status_id=1",nativeQuery = true)
    Integer getActiveCustomerCount();

    @Query(value = "SELECT count(d.id) FROM tms.driver as d where d.driver_status_id=1",nativeQuery = true)
    Integer getActiveDriverCount();


//    ----------------------------------supplier agreement report--------------------------------------------------------------------------
//    date range ekata adalawa agreements details gnnw
@Query(value = "SELECT sa FROM SupplierAgreement sa WHERE DATE(sa.added_datetime) BETWEEN ?1 AND ?2 and sa.supplier_id.id=?3 order by sa.id desc")
List<SupplierAgreement> getSupplierAgreementByDateRangeAndSupplier(Date startdate, Date enddate, Integer supplierid);

@Query(value = "SELECT sa FROM SupplierAgreement sa WHERE DATE(sa.added_datetime) BETWEEN ?1 AND ?2 order by sa.id desc")
List<SupplierAgreement> getSupplierAgreementByDateRange(Date startdate, Date endtdate);

//-----------------------------------customer agreement report--------------------------------------------------------------------------
//    date range ekata adalawa agreements details gnnw
@Query(value = "SELECT ca FROM CustomerAgreement ca WHERE DATE(ca.added_datetime) BETWEEN ?1 AND ?2 and ca.customer_id.id=?3 order by ca.id desc")
List<CustomerAgreement> getCustomerAgreementByDateRangeAndCustomer(Date startdate, Date enddate, Integer customerid);

@Query(value = "SELECT ca FROM CustomerAgreement ca WHERE DATE(ca.added_datetime) BETWEEN ?1 AND ?2 order by  ca.id desc")
List<CustomerAgreement> getCustomerAgreementByDateRange(Date startdate, Date endtdate);

//--------------------------------daily booking summary report-------------------------------------------------------------------------

//    currunt day eke hour wise booking count eka gnnw
    @Query(value = "SELECT HOUR(b.pickup_date_time) as hour, COUNT(*) as booking_count FROM tms.booking as b WHERE DATE(b.pickup_date_time) = CURDATE() GROUP BY HOUR(b.pickup_date_time) ORDER BY hour",nativeQuery = true)
    String[][] getHourlyBookings();

//    booking status anuwa count eka gnnw
@Query(value = "SELECT bs.status as status, count(*) as count FROM tms.booking as b JOIN tms.booking_status as bs ON b.booking_status_id = bs.id WHERE Date(b.pickup_date_time) = current_date() GROUP BY b.booking_status_id, bs.status ORDER BY b.booking_status_id", nativeQuery = true)
List<Object[]> getBookingCountByStatus();

//    currunt day eke bookings details gnnw
@Query("SELECT b FROM Booking b WHERE DATE(b.pickup_date_time) = CURRENT_DATE ORDER BY b.id")
List<Booking> getAllBookingsForDaily();

//    currunt day eke bookings details gnnw customer id anuwa
@Query("SELECT b FROM Booking b WHERE DATE(b.pickup_date_time) = CURRENT_DATE AND b.customer_id.id = ?1 ORDER BY b.id")
List<Booking> getAllBookingsForDailyByCustomer(Integer customerId);

//    currunt day eke bookings details gnnw booking status id anuwa
@Query("SELECT b FROM Booking b WHERE DATE(b.pickup_date_time) = CURRENT_DATE AND b.booking_status_id.id = ?1 ORDER BY b.id")
List<Booking> getAllBookingsForDailyByBookingStatus(Integer bookingStatusId);

//    currunt day eke bookings details gnnw customer id and booking status id anuwa
@Query("SELECT b FROM Booking b WHERE DATE(b.pickup_date_time) = CURRENT_DATE AND b.customer_id.id = ?1 AND b.booking_status_id.id = ?2 ORDER BY b.id")
List<Booking> getAllBookingsForDailyByCustomerAndStatus(Integer customerId, Integer bookingStatusId);

//vehicel utilization summary ganna query eka
@Query("SELECT b.vehicle_type_id as vehicleType, COUNT(b.id) as totalBookings, COUNT(DISTINCT b.vehicle_id) as totalVehicles, round (SUM(b.distance)) as distance FROM Booking b WHERE DATE(b.pickup_date_time) = CURRENT_DATE GROUP BY b.vehicle_type_id")
List<Object[]> getDailyBookingSummaryByVehicleType();

//vehicel utilization summary ganna query eka selected customer id ekata anuwa
@Query("SELECT b.vehicle_type_id as vehicleType, COUNT(b.id) as totalBookings, COUNT(DISTINCT b.vehicle_id) as totalVehicles, round (SUM(b.distance)) as distance FROM Booking b WHERE DATE(b.pickup_date_time) = CURRENT_DATE AND b.customer_id.id=?1 GROUP BY b.vehicle_type_id")
List<Object[]> getDailyVehicleUtilizationSummaryByCustomer(Integer customerId);

//vehicel utilization summary ganna query eka selected booking status id ekata anuwa
@Query("SELECT b.vehicle_type_id as vehicleType, COUNT(b.id) as totalBookings, COUNT(DISTINCT b.vehicle_id) as totalVehicles, round (SUM(b.distance)) as distance FROM Booking b WHERE DATE(b.pickup_date_time) = CURRENT_DATE AND b.booking_status_id.id=?1 GROUP BY b.vehicle_type_id")
List<Object[]> getDailyVehicleUtilizationSummaryByBookingStatus(Integer bookingStatusId);

//vehicel utilization summary ganna query eka selected booking status id ekata anuwa saha customer id ekata anuwa
@Query("SELECT b.vehicle_type_id as vehicleType, COUNT(b.id) as totalBookings, COUNT(DISTINCT b.vehicle_id) as totalVehicles, round (SUM(b.distance)) as distance FROM Booking b WHERE DATE(b.pickup_date_time) = CURRENT_DATE AND b.customer_id.id=?1 AND b.booking_status_id.id=?2 GROUP BY b.vehicle_type_id")
List<Object[]> getDailyVehicleUtilizationSummaryByCustomerAndBookingStatus(Integer customerId, Integer bookingStatusId);

//--------------------------------------------------------------delay booking report---------------------------------------------------------------

//    currunt week delay bookings  count gnnw
    @Query(value = "SELECT DAYNAME(b.pickup_date_time) as day_of_week,count(*) as total_bookings,sum(case when b.delivery_date_time < b.arrived_at_delivery_datetime then 1 else 0 end) as delay_delivery,round(((sum(case when b.delivery_date_time < b.arrived_at_delivery_datetime then 1 else 0 end)/ count(*))*100 ),2) as delay_precentage,sum(case when b.delivery_date_time >= b.arrived_at_delivery_datetime then 1 else 0 end) as ontime_delivery FROM tms.booking as b where b.arrived_at_delivery_datetime is not null and WEEK(CURDATE()) group by DAYNAME(b.pickup_date_time)",nativeQuery = true)
    String[][] getDelayBookingThisWeek();


//    delay booking tika ganna query eka pickup ekata wada actual pickup eka wadi saha dilevry ekata wada actual delivery eka wadi ewa
    @Query(value = "SELECT b.booking_no as booking_no,c.company_name,pl.name,dl.name,DATE_FORMAT(b.pickup_date_time, '%Y-%m-%d %H:%i:%s'),DATE_FORMAT(b.delivery_date_time, '%Y-%m-%d %H:%i:%s'),\n" +
            "s.transportname as supplier,v.vehicle_no,d.fullname,DATE_FORMAT(b.arrived_at_pickup_datetime, '%Y-%m-%d %H:%i:%s'),(case when TIMEDIFF(b.arrived_at_pickup_datetime,b.pickup_date_time)< '00:00:00' then '-' else TIMEDIFF(b.arrived_at_pickup_datetime,b.pickup_date_time) end) as Delay_Pickup_Time,DATE_FORMAT(b.arrived_at_delivery_datetime, '%Y-%m-%d %H:%i:%s'),\n" +
            "(case when TIMEDIFF(b.arrived_at_delivery_datetime,b.delivery_date_time)<'00:00:00' then '-' else TIMEDIFF(b.arrived_at_delivery_datetime,b.delivery_date_time) end) as Delay_Delivery_Time\n" +
            " FROM tms.booking as b, tms.customer as c,tms.pickup_locations as pl,tms.delivery_locations as dl,tms.vehicle as v,tms.driver as d,tms.supplier as s\n" +
            " where c.id = b.customer_id and pl.id = b.pickup_locations_id and dl.id = b.delivery_locations_id and v.id = b.vehicle_id and d.id = b.driver_id and v.supplier_id = s.id and b.arrived_at_pickup_datetime is not null and b.arrived_at_delivery_datetime is not null and (b.pickup_date_time<b.arrived_at_pickup_datetime or b.delivery_date_time<b.arrived_at_delivery_datetime)",nativeQuery = true)
    List<Object[]> getAllDelayBookings();

//    overall perfomance ganna query eka this Month
    @Query(value = "SELECT count(*) as total_bookings,\n" +
            "(sum(case when (b.pickup_date_time<b.arrived_at_pickup_datetime or b.delivery_date_time<b.arrived_at_delivery_datetime) then 1 else 0 end)) as late_bookings \n" +
            "FROM tms.booking as b where b.arrived_at_delivery_datetime is not null and MONTH(b.pickup_date_time) = MONTH(CURDATE());",nativeQuery = true)
    Object[] getOverallPerfomance();

//    overall perfomance ganna query eka last Month
    @Query(value = "SELECT count(*) as total_bookings,\n" +
            "(sum(case when (b.pickup_date_time<b.arrived_at_pickup_datetime or b.delivery_date_time<b.arrived_at_delivery_datetime) then 1 else 0 end)) as late_bookings \n" +
            "FROM tms.booking as b where b.arrived_at_delivery_datetime is not null and MONTH(b.pickup_date_time) = MONTH(CURDATE())-1;",nativeQuery = true)
    Object[] getOverallPerfomanceLastMonth();

//    overall perfomance ganna query eka last 6 month
    @Query(value = "SELECT count(*) as total_bookings,\n" +
            "(sum(case when (b.pickup_date_time<b.arrived_at_pickup_datetime or b.delivery_date_time<b.arrived_at_delivery_datetime) then 1 else 0 end)) as late_bookings \n" +
            "FROM tms.booking as b where b.arrived_at_delivery_datetime is not null and MONTH(b.pickup_date_time) >= MONTH(CURDATE())-6;",nativeQuery = true)
    Object[] getOverallPerfomanceLast6Month();

//    overall perfomance ganna query eka this Year
    @Query(value = "SELECT count(*) as total_bookings,\n" +
            "(sum(case when (b.pickup_date_time<b.arrived_at_pickup_datetime or b.delivery_date_time<b.arrived_at_delivery_datetime) then 1 else 0 end)) as late_bookings \n" +
            "FROM tms.booking as b where b.arrived_at_delivery_datetime is not null and YEAR(b.pickup_date_time) = YEAR(CURDATE());",nativeQuery = true)
    Object[] getOverallPerfomanceThisYear();

//    overall perfomance ganna eka last Year
    @Query(value = "SELECT count(*) as total_bookings,\n" +
            "(sum(case when (b.pickup_date_time<b.arrived_at_pickup_datetime or b.delivery_date_time<b.arrived_at_delivery_datetime) then 1 else 0 end)) as late_bookings \n" +
            "FROM tms.booking as b where b.arrived_at_delivery_datetime is not null and YEAR(b.pickup_date_time) = YEAR(CURDATE())-1;",nativeQuery = true)
    Object[] getOverallPerfomanceLastYear();

//  --------------------------------------------driver performance report-------------------------------------------------------------
//   get all driver performance details
    @Query(value = "SELECT d.fullname AS driver_name,COUNT(DISTINCT b.id) AS total_trips, SUM(b.arrived_at_delivery_datetime <= b.delivery_date_time) AS on_time_deliveries,SUM(b.arrived_at_delivery_datetime > b.delivery_date_time) AS late_deliveries,\n" +
            "ROUND(SUM(b.arrived_at_delivery_datetime <= b.delivery_date_time) * 100.0 / COUNT(DISTINCT b.id), 2) AS on_time_rate_percent\n" +
            "FROM tms.driver d JOIN tms.booking b ON b.driver_id = d.id and  b.arrived_at_delivery_datetime is not null GROUP BY d.id ORDER BY on_time_rate_percent DESC;", nativeQuery = true)
    List<Object[]> getDriverPerformanceReport();

//    get all drivers count which is completed at least one trip
    @Query(value = "SELECT COUNT(DISTINCT d.id) FROM tms.driver d JOIN tms.booking b ON b.driver_id = d.id and  b.arrived_at_delivery_datetime is not null;", nativeQuery = true)
    Integer getDriverCountWithAtLeastOneTrip();



//    get all driver performance details by date range
    @Query(value = "SELECT d.fullname AS driver_name,COUNT(DISTINCT b.id) AS total_trips, SUM(b.arrived_at_delivery_datetime <= b.delivery_date_time) AS on_time_deliveries,SUM(b.arrived_at_delivery_datetime > b.delivery_date_time) AS late_deliveries,\n" +
            "ROUND(SUM(b.arrived_at_delivery_datetime <= b.delivery_date_time) * 100.0 / COUNT(DISTINCT b.id), 2) AS on_time_rate_percent\n" +
            "FROM tms.driver d JOIN tms.booking b ON b.driver_id = d.id WHERE DATE(b.pickup_date_time) BETWEEN ?1 AND ?2 and  b.arrived_at_delivery_datetime is not null GROUP BY d.id ORDER BY on_time_rate_percent DESC;", nativeQuery = true)
    List<Object[]> getDriverPerformanceReportByDateRange(String startdate, String enddate);

//    get selected driver performance details
    @Query(value = "SELECT d.fullname AS driver_name,COUNT(DISTINCT b.id) AS total_trips, SUM(b.arrived_at_delivery_datetime <= b.delivery_date_time) AS on_time_deliveries,SUM(b.arrived_at_delivery_datetime > b.delivery_date_time) AS late_deliveries,\n" +
            "ROUND(SUM(b.arrived_at_delivery_datetime <= b.delivery_date_time) * 100.0 / COUNT(DISTINCT b.id), 2) AS on_time_rate_percent\n" +
            "FROM tms.driver d JOIN tms.booking b ON b.driver_id = d.id WHERE d.id = ?1 and  b.arrived_at_delivery_datetime is not null GROUP BY d.id ORDER BY on_time_rate_percent DESC;", nativeQuery = true)
    String[][] getSelectedDriverPerformanceReport(Integer driverId);

//    get selected driver performance details by date range
    @Query(value = "SELECT d.fullname AS driver_name,COUNT(DISTINCT b.id) AS total_trips, SUM(b.arrived_at_delivery_datetime <= b.delivery_date_time) AS on_time_deliveries,SUM(b.arrived_at_delivery_datetime > b.delivery_date_time) AS late_deliveries,\n" +
            "ROUND(SUM(b.arrived_at_delivery_datetime <= b.delivery_date_time) * 100.0 / COUNT(DISTINCT b.id), 2) AS on_time_rate_percent\n" +
            "FROM tms.driver d JOIN tms.booking b ON b.driver_id = d.id WHERE d.id = ?1 AND DATE(b.pickup_date_time) BETWEEN ?2 AND ?3 and b.arrived_at_delivery_datetime is not null GROUP BY d.id ORDER BY on_time_rate_percent DESC;", nativeQuery = true)
    String[][] getSelectedDriverPerformanceReportByDateRange(Integer driverId, String startdate, String enddate);

//    get driver ranking
    @Query(value = "SELECT * from \n" +
            "(SELECT b.driver_id as id, d.driver_reg_no as driver_reg_no, d.fullname as driver_name,round(SUM(b.arrived_at_delivery_datetime <= b.delivery_date_time) * 100.0 / COUNT(DISTINCT b.id),2) AS on_time_rate_percent ,\n" +
            "rank() over (order by sum(b.arrived_at_delivery_datetime <= b.delivery_date_time) * 100.0 / count(distinct b.id) desc) as driver_rank\n" +
            "FROM tms.driver as d join tms.booking as b on b.driver_id = d.id and  b.arrived_at_delivery_datetime is not null group by b.driver_id, d.driver_reg_no, d.fullname) as ranking  where id =?1;", nativeQuery = true)
    String[][] getDriverRanking(Integer driverId);

    //    get bookings add karala thiyen drivers la list eka witharak gnnawa
    @Query("SELECT d FROM Driver d WHERE d.id IN (SELECT DISTINCT b.driver_id.id FROM Booking b WHERE b.driver_id.id = d.id)")
    List<Driver> getDriverList();

//    ---------------------------------------Income Report-------------------------------------------------------------
//    get income report by This month
@Query(value = "SELECT " +
        "DATE(b.pickup_date_time) AS date, " +
        "ROUND(SUM( " +
        "    CASE " +
        "        WHEN p.package_type = 'Floating Rate' THEN b.distance * p.package_charge_cus " +
        "        WHEN p.package_type = 'Fix Rate' THEN p.package_charge_cus / 25 " +
        "        ELSE 0 " +
        "    END " +
        "), 2) AS total_daily_income " +
        "FROM tms.booking AS b " +
        "JOIN tms.customer_agreement AS ca ON ca.id = b.customer_agreement_id " +
        "JOIN tms.package AS p ON p.id = ca.package_id " +
        "GROUP BY DATE(b.pickup_date_time) " +
        "ORDER BY DATE(b.pickup_date_time)", nativeQuery = true)
String[][] getIncomeReportByThisMonth();

//get data for income cards
    @Query(value = "SELECT \n" +
            "        Month(b.pickup_date_time) AS Month,\n" +
            "        ROUND(SUM(\n" +
            "            CASE \n" +
            "                WHEN p.package_type = 'Floating Rate' THEN b.distance * p.package_charge_cus\n" +
            "                WHEN p.package_type = 'Fix Rate' THEN p.package_charge_cus / 25\n" +
            "                ELSE 0\n" +
            "            END\n" +
            "        ), 2) AS total_daily_income,\n" +
            "        ROUND(SUM(\n" +
            "            CASE \n" +
            "                WHEN b.booking_status_id IN (6,8) THEN \n" +
            "                    CASE \n" +
            "                        WHEN p.package_type = 'Floating Rate' THEN b.distance * p.package_charge_cus\n" +
            "                        WHEN p.package_type = 'Fix Rate' THEN p.package_charge_cus / 25\n" +
            "                        ELSE 0\n" +
            "                    END\n" +
            "                ELSE 0\n" +
            "            END\n" +
            "        ), 2) AS completed_income,\n" +
            "        ROUND(SUM(\n" +
            "            CASE \n" +
            "                WHEN b.booking_status_id IN (1,2,3,4,5) THEN \n" +
            "                    CASE \n" +
            "                        WHEN p.package_type = 'Floating Rate' THEN b.distance * p.package_charge_cus\n" +
            "                        WHEN p.package_type = 'Fix Rate' THEN p.package_charge_cus / 25\n" +
            "                        ELSE 0\n" +
            "                    END\n" +
            "                ELSE 0\n" +
            "            END\n" +
            "        ), 2) AS pending_income,\n" +
            "        ROUND(SUM(\n" +
            "            CASE \n" +
            "                WHEN b.booking_status_id = 7 THEN \n" +
            "                    CASE \n" +
            "                        WHEN p.package_type = 'Floating Rate' THEN b.distance * p.package_charge_cus\n" +
            "                        WHEN p.package_type = 'Fix Rate' THEN p.package_charge_cus / 25\n" +
            "                        ELSE 0\n" +
            "                    END\n" +
            "                ELSE 0\n" +
            "            END\n" +
            "        ), 2) AS cancelled_income\n" +
            "    FROM tms.booking AS b\n" +
            "    JOIN tms.customer_agreement AS ca ON ca.id = b.customer_agreement_id\n" +
            "    JOIN tms.package AS p ON p.id = ca.package_id WHERE b.pickup_date_time BETWEEN ?1 AND ?2\n" +
            "    GROUP BY MONTH(b.pickup_date_time);",nativeQuery = true)
    String[][] getDataForIncomeCards(String straDate,String enddate);

//    get income by all customers wise this month
@Query(value = "SELECT\n" +
        "    DATE(b.pickup_date_time) AS date, c.company_name ,\n" +
        "    ROUND(\n" +
        "        SUM(\n" +
        "            CASE\n" +
        "                WHEN p.package_type = 'Floating Rate' THEN b.distance * p.package_charge_cus\n" +
        "                WHEN p.package_type = 'Fix Rate' THEN p.package_charge_cus / 25\n" +
        "                ELSE 0\n" +
        "            END\n" +
        "        ), 2\n" +
        "    ) AS total_daily_income\n" +
        "FROM tms.booking AS b\n" +
        "JOIN tms.customer_agreement AS ca ON ca.id = b.customer_agreement_id\n" +
        "JOIN tms.package AS p ON p.id = ca.package_id\n" +
        "JOIN tms.customer as c on c.id = b.customer_id\n" +
        "GROUP BY DATE(b.pickup_date_time),b.customer_id\n" +
        "ORDER BY DATE(b.pickup_date_time)",nativeQuery = true)
String[][] getIncomeByAllCustomersWiseThisMonth();


//get income report last month
@Query(value = "SELECT " +
        "DATE(b.pickup_date_time) AS date, " +
        "ROUND(SUM( " +
        "    CASE " +
        "        WHEN p.package_type = 'Floating Rate' THEN b.distance * p.package_charge_cus " +
        "        WHEN p.package_type = 'Fix Rate' THEN p.package_charge_cus / 25 " +
        "        ELSE 0 " +
        "    END " +
        "), 2) AS total_daily_income " +
        "FROM tms.booking AS b " +
        "JOIN tms.customer_agreement AS ca ON ca.id = b.customer_agreement_id " +
        "JOIN tms.package AS p ON p.id = ca.package_id " +
        "WHERE MONTH(b.pickup_date_time) = MONTH(CURDATE())-1 AND YEAR(b.pickup_date_time) = YEAR(CURDATE())" +
        "GROUP BY DATE(b.pickup_date_time) " +
        "ORDER BY DATE(b.pickup_date_time)", nativeQuery = true)
String[][] getIncomeReportByLastMonth();

    //    get income by all customers wise last month
    @Query(value = "SELECT\n" +
            "    DATE(b.pickup_date_time) AS date, c.company_name ,\n" +
            "    ROUND(\n" +
            "        SUM(\n" +
            "            CASE\n" +
            "                WHEN p.package_type = 'Floating Rate' THEN b.distance * p.package_charge_cus\n" +
            "                WHEN p.package_type = 'Fix Rate' THEN p.package_charge_cus / 25\n" +
            "                ELSE 0\n" +
            "            END\n" +
            "        ), 2\n" +
            "    ) AS total_daily_income\n" +
            "FROM tms.booking AS b\n" +
            "JOIN tms.customer_agreement AS ca ON ca.id = b.customer_agreement_id\n" +
            "JOIN tms.package AS p ON p.id = ca.package_id\n" +
            "JOIN tms.customer as c on c.id = b.customer_id\n" +
            "WHERE MONTH(b.pickup_date_time) = MONTH(CURDATE())-1 AND YEAR(b.pickup_date_time) = YEAR(CURDATE())" +
            "GROUP BY DATE(b.pickup_date_time),b.customer_id\n" +
            "ORDER BY DATE(b.pickup_date_time)",nativeQuery = true)
    String[][] getIncomeByAllCustomersWiseLastMonth();

//get income report by last 3 months
@Query(value = "SELECT " +
        "MONTHNAME(b.pickup_date_time) AS month, " +
        "ROUND(SUM( " +
        "    CASE " +
        "        WHEN p.package_type = 'Floating Rate' THEN b.distance * p.package_charge_cus " +
        "        WHEN p.package_type = 'Fix Rate' THEN p.package_charge_cus / 25 " +
        "        ELSE 0 " +
        "    END " +
        "), 2) AS total_daily_income " +
        "FROM tms.booking AS b " +
        "JOIN tms.customer_agreement AS ca ON ca.id = b.customer_agreement_id " +
        "JOIN tms.package AS p ON p.id = ca.package_id " +
        "WHERE b.pickup_date_time >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH) AND YEAR(b.pickup_date_time) = YEAR(CURDATE())" +
        "GROUP BY MONTHNAME(b.pickup_date_time) " +
        "ORDER BY MONTHNAME(b.pickup_date_time)", nativeQuery = true)
String[][] getIncomeReportByLast3Months();

    //    get income by all customers wise last 3 month
    @Query(value = "SELECT\n" +
            "    MONTHNAME(b.pickup_date_time) AS month, c.company_name ,\n" +
            "    ROUND(\n" +
            "        SUM(\n" +
            "            CASE\n" +
            "                WHEN p.package_type = 'Floating Rate' THEN b.distance * p.package_charge_cus\n" +
            "                WHEN p.package_type = 'Fix Rate' THEN p.package_charge_cus / 25\n" +
            "                ELSE 0\n" +
            "            END\n" +
            "        ), 2\n" +
            "    ) AS total_daily_income\n" +
            "FROM tms.booking AS b\n" +
            "JOIN tms.customer_agreement AS ca ON ca.id = b.customer_agreement_id\n" +
            "JOIN tms.package AS p ON p.id = ca.package_id\n" +
            "JOIN tms.customer as c on c.id = b.customer_id\n" +
            "WHERE b.pickup_date_time >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH) AND YEAR(b.pickup_date_time) = YEAR(CURDATE())" +
            "GROUP BY MONTHNAME(b.pickup_date_time),b.customer_id\n" +
            "ORDER BY MONTHNAME(b.pickup_date_time)",nativeQuery = true)
    String[][] getIncomeByAllCustomersWiseLast3Month();

//get income report by last 6 months
@Query(value = "SELECT " +
        "MONTHNAME(b.pickup_date_time) AS month, " +
        "ROUND(SUM( " +
        "    CASE " +
        "        WHEN p.package_type = 'Floating Rate' THEN b.distance * p.package_charge_cus " +
        "        WHEN p.package_type = 'Fix Rate' THEN p.package_charge_cus / 25 " +
        "        ELSE 0 " +
        "    END " +
        "), 2) AS total_daily_income " +
        "FROM tms.booking AS b " +
        "JOIN tms.customer_agreement AS ca ON ca.id = b.customer_agreement_id " +
        "JOIN tms.package AS p ON p.id = ca.package_id " +
        "WHERE b.pickup_date_time >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND YEAR(b.pickup_date_time) = YEAR(CURDATE())" +
        "GROUP BY MONTHNAME(b.pickup_date_time) " +
        "ORDER BY MONTHNAME(b.pickup_date_time)", nativeQuery = true)
    String[][] getIncomeReportByLast6Months();

    //    get income by all customers wise last 6 month
    @Query(value = "SELECT\n" +
            "   MONTHNAME(b.pickup_date_time) AS month, c.company_name ,\n" +
            "    ROUND(\n" +
            "        SUM(\n" +
            "            CASE\n" +
            "                WHEN p.package_type = 'Floating Rate' THEN b.distance * p.package_charge_cus\n" +
            "                WHEN p.package_type = 'Fix Rate' THEN p.package_charge_cus / 25\n" +
            "                ELSE 0\n" +
            "            END\n" +
            "        ), 2\n" +
            "    ) AS total_daily_income\n" +
            "FROM tms.booking AS b\n" +
            "JOIN tms.customer_agreement AS ca ON ca.id = b.customer_agreement_id\n" +
            "JOIN tms.package AS p ON p.id = ca.package_id\n" +
            "JOIN tms.customer as c on c.id = b.customer_id\n" +
            "WHERE b.pickup_date_time >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND YEAR(b.pickup_date_time) = YEAR(CURDATE())" +
            "GROUP BY MONTHNAME(b.pickup_date_time),b.customer_id\n" +
            "ORDER BY MONTHNAME(b.pickup_date_time)",nativeQuery = true)
    String[][] getIncomeByAllCustomersWiseLast6Month();

//get income report by this year
@Query(value = "SELECT " +
        "MONTHNAME(b.pickup_date_time) AS month, " +
        "ROUND(SUM( " +
        "    CASE " +
        "        WHEN p.package_type = 'Floating Rate' THEN b.distance * p.package_charge_cus " +
        "        WHEN p.package_type = 'Fix Rate' THEN p.package_charge_cus / 25 " +
        "        ELSE 0 " +
        "    END " +
        "), 2) AS total_daily_income " +
        "FROM tms.booking AS b " +
        "JOIN tms.customer_agreement AS ca ON ca.id = b.customer_agreement_id " +
        "JOIN tms.package AS p ON p.id = ca.package_id " +
        "WHERE YEAR(b.pickup_date_time) = YEAR(CURDATE())" +
        "GROUP BY MONTHNAME(b.pickup_date_time) " +
        "ORDER BY MONTHNAME(b.pickup_date_time)", nativeQuery = true)
String[][] getIncomeReportByThisYear();

    //    get income by all customers wise this year
    @Query(value = "SELECT\n" +
            "    MONTHNAME(b.pickup_date_time) AS month, c.company_name ,\n" +
            "    ROUND(\n" +
            "        SUM(\n" +
            "            CASE\n" +
            "                WHEN p.package_type = 'Floating Rate' THEN b.distance * p.package_charge_cus\n" +
            "                WHEN p.package_type = 'Fix Rate' THEN p.package_charge_cus / 25\n" +
            "                ELSE 0\n" +
            "            END\n" +
            "        ), 2\n" +
            "    ) AS total_daily_income\n" +
            "FROM tms.booking AS b\n" +
            "JOIN tms.customer_agreement AS ca ON ca.id = b.customer_agreement_id\n" +
            "JOIN tms.package AS p ON p.id = ca.package_id\n" +
            "JOIN tms.customer as c on c.id = b.customer_id\n" +
            "WHERE YEAR(b.pickup_date_time) = YEAR(CURDATE())" +
            "GROUP BY MONTHNAME(b.pickup_date_time),b.customer_id\n" +
            "ORDER BY MONTHNAME(b.pickup_date_time)",nativeQuery = true)
    String[][] getIncomeByAllCustomersWiseThisYear();

//get income report by last year
@Query(value = "SELECT " +
        "MONTHNAME(b.pickup_date_time) AS month, " +
        "ROUND(SUM( " +
        "    CASE " +
        "        WHEN p.package_type = 'Floating Rate' THEN b.distance * p.package_charge_cus " +
        "        WHEN p.package_type = 'Fix Rate' THEN p.package_charge_cus / 25 " +
        "        ELSE 0 " +
        "    END " +
        "), 2) AS total_daily_income " +
        "FROM tms.booking AS b " +
        "JOIN tms.customer_agreement AS ca ON ca.id = b.customer_agreement_id " +
        "JOIN tms.package AS p ON p.id = ca.package_id " +
        "WHERE YEAR(b.pickup_date_time) = YEAR(CURDATE())-1" +
        "GROUP BY MONTHNAME(b.pickup_date_time) " +
        "ORDER BY MONTHNAME(b.pickup_date_time)", nativeQuery = true)
String[][] getIncomeReportByLastYear();

    //    get income by all customers wise last year
    @Query(value = "SELECT\n" +
            "    MONTHNAME(b.pickup_date_time) AS month, c.company_name ,\n" +
            "    ROUND(\n" +
            "        SUM(\n" +
            "            CASE\n" +
            "                WHEN p.package_type = 'Floating Rate' THEN b.distance * p.package_charge_cus\n" +
            "                WHEN p.package_type = 'Fix Rate' THEN p.package_charge_cus / 25\n" +
            "                ELSE 0\n" +
            "            END\n" +
            "        ), 2\n" +
            "    ) AS total_daily_income\n" +
            "FROM tms.booking AS b\n" +
            "JOIN tms.customer_agreement AS ca ON ca.id = b.customer_agreement_id\n" +
            "JOIN tms.package AS p ON p.id = ca.package_id\n" +
            "JOIN tms.customer as c on c.id = b.customer_id\n" +
            "WHERE YEAR(b.pickup_date_time) = YEAR(CURDATE())-1" +
            "GROUP BY MONTHNAME(b.pickup_date_time),b.customer_id\n" +
            "ORDER BY MONTHNAME(b.pickup_date_time)",nativeQuery = true)
    String[][] getIncomeByAllCustomersWiseLastYear();
}