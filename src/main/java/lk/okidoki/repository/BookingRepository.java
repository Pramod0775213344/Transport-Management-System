package lk.okidoki.repository;

import lk.okidoki.modal.Booking;
import lk.okidoki.modal.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.sql.Date;
import java.util.*;

public interface BookingRepository extends JpaRepository<Booking, Integer> {

    // get booking by status(inprocess)
    @Query(value = "SELECT * FROM tms.booking as b where b.booking_status_id = 1 ORDER BY b.id DESC", nativeQuery = true)
    List<Booking> getByStatus();

    // get vehicl deatils
    @Query(value = "SELECT * FROM tms.booking as b where b.vehicle_id =?1", nativeQuery = true)
    Booking getByVehicleNo(Integer vehicleId);

    // get driver details
    @Query(value = "SELECT * FROM tms.booking as b where b.driver_id =?1", nativeQuery = true)
    Booking getDriver(Integer driverId);

    // get bookings by customer id deatils
    @Query(value = "SELECT * FROM tms.booking as b where b.customer_id =?1", nativeQuery = true)
    List<Booking> getByCutomerId(Integer customerId);

    // get booking by status(departed from delivery)
    @Query(value = "SELECT * FROM tms.booking as b where b.booking_status_id = 6", nativeQuery = true)
    List<Booking> getByDepartedFromDeliveryStatus();

    // SCHEDULE KARALA THIYENA BOOKINGS TIKA GNNAWA
    @Query(value = "SELECT * FROM tms.booking as b where b.booking_status_id = 10", nativeQuery = true)
    List<Booking> getScheduleBooking();

    // get bookings by given customer id and and packagetype and vehicle type ids
    // completed bookings(because calculate the payment vehicle type wise)
    @Query(value = "SELECT * FROM tms.booking as b where b.customer_id = ?1 and b.booking_status_id = 6 and b.vehicle_type_id=?3 and b.customer_agreement_id in( SELECT ca.id FROM tms.customer_agreement as ca where ca.package_id in (SELECT p.id FROM tms.package as p where p.package_type=?2)) and  b.id not in(SELECT cphb.booking_id FROM tms.customer_payment_has_booking as cphb)", nativeQuery = true)
    List<Booking> getBookingByCustomer(Integer customerid, String packageType, Integer vehicleTypeid);

    // get recent 5 bookings
    @Query(value = "SELECT * FROM tms.booking as b order by b.id desc limit 10", nativeQuery = true)
    List<Booking> getRecentFiveBookings();

    @Query(value = "SELECT * FROM tms.booking as b where b.customer_id = ?1 order by b.id desc limit 5", nativeQuery = true)
    List<Booking> getRecentFiveBookingsByCustomer(Integer customerId);

    // get booking by given date range and selected customer id fo vehicle assigning
    @Query(value = "SELECT * FROM tms.booking as b where date(b.pickup_date_time) between ?1 and ?2 and b.customer_id =?3 and b.booking_status_id not in(7,8,6,9,10) order by b.id desc", nativeQuery = true)
    List<Booking> getBookingByDateRangeAndCustomer(String startdate, String enddate, Integer customerId);

    @Query(value = "SELECT * FROM tms.booking as b where date(b.pickup_date_time) = CURDATE() and b.booking_status_id not in(7,8,6,9,10) ORDER BY b.id DESC", nativeQuery = true)
    List<Booking> getCurrentdateBookings();

    // get all bookings for given vehicle No
    // @Query("SELECT b.bookingNo, b.vehicle.id, b.distance FROM Booking b WHERE
    // b.bookingStatus.id = 8 AND b.vehicle.id = ?1")
    // List<Booking[]> getBookingByGivenVehicleNo(Integer vehicleid);

    @Query(value = "SELECT * FROM tms.booking as b where b.booking_status_id=8 and b.vehicle_id =?1", nativeQuery = true)
    List<Booking> getBookingByGivenVehicleNo(Integer vehicleid);

    // --------------------------------querys for booking form search
    // areas----------------------------------------------------
    @Query(value = "SELECT * FROM tms.booking as b where b.customer_id=?1 and b.booking_status_id = 1 ORDER BY b.id DESC", nativeQuery = true)
    List<Booking> getInproccessBookingByCustomer(Integer customerid);

    @Query(value = "SELECT * FROM tms.booking as b where b.vehicle_type_id=?1 and b.booking_status_id = 1 ORDER BY b.id DESC", nativeQuery = true)
    List<Booking> getInproccessBookingByVehicleType(Integer vehicletypeid);

    @Query(value = "SELECT * FROM tms.booking as b where  b.customer_id=?1 and b.vehicle_type_id=?2 and b.booking_status_id = 1 ORDER BY b.id DESC", nativeQuery = true)
    List<Booking> getInproccessBookingByCustomerAndVehicleType(Integer customerid, Integer vehicletypeid);

    // ---------------------------------------invoice ui ekata oni query
    // ekak-----------------------------------------
    @Query(value = "SELECT b.* FROM tms.booking AS b JOIN tms.customer_agreement AS ca ON b.customer_agreement_id = ca.id JOIN tms.package AS p ON ca.package_id = p.id JOIN tms.vehicle_type AS vt ON b.vehicle_type_id = vt.id WHERE b.customer_id = ?1 AND b.booking_status_id NOT IN (7,8,9 ) AND p.package_type = ?2 AND b.id NOT IN (SELECT booking_id FROM tms.invoice_has_booking) AND date_format(b.delivery_date_time, '%Y-%b')=?3", nativeQuery = true)
    List<Booking> getBookingByCustomerAndPackageTypeAndMonth(Integer customerid, String packageType, String month);

    // customer payment karala thiyna bookings tiyena masa tika witharak gnnawa
    // selected supplierta adlawa
    // methanin apita enne [{"formatted_date": "2026-Jan"}] me format ekata
    @Query(value = "SELECT distinct(date_format(b.delivery_date_time, '%Y-%b')) as formatted_date from tms.booking as b where b.booking_status_id not in (7,8,9,10) and b.id not in (SELECT booking_id FROM tms.invoice_has_booking) and b.customer_id =?1 ", nativeQuery = true)
    List<Map<String, Object>> getCustomerPaymentMonths(Integer customerid);

    // ---------------------for the supplier
    // payments------------------------------------------------------
    @Query(value = "SELECT s.* FROM tms.booking as b join tms.vehicle as v on v.id = b.vehicle_id join tms.supplier as s on s.id = v.supplier_id where b.booking_status_id = 8", nativeQuery = true)
    List<Booking> getCompletedBookingsWithSuppliers();

    // ----------------for the fuel request
    // form-----------------------------------------------------------

    // vehicle id eka saha driver id eka anith paramiter widihata gannawa me query
    // ekata saha status 1,6,7,8 nathuwa thiyena booking tika gannawa
    @Query(value = "SELECT * FROM tms.booking as b where b.booking_status_id not in (1,6,7,8,9,10) and b.vehicle_id=?1 and b.driver_id=?2 AND MONTH(b.delivery_date_time) = MONTH(CURRENT_DATE) AND YEAR(b.delivery_date_time) = YEAR(CURRENT_DATE)", nativeQuery = true)
    List<Booking> getBookingsForFuelRequest(Integer vehicleId, Integer driverId);

    // vehicle id ekata adalawa total distance eka gnnawa
    @Query(value = "SELECT sum(b.distance) as total_distance FROM tms.booking as b where b.vehicle_id=?1 and b.booking_status_id=6 AND MONTH(b.delivery_date_time) = MONTH(CURRENT_DATE) AND YEAR(b.delivery_date_time) = YEAR(CURRENT_DATE)", nativeQuery = true)
    public BigDecimal getTotalDistance(Integer vehicleId);

    // -----------------for the vehicle
    // assigning---------------------------------------------
    // active currunt booking eka gannawa me vehicle thiyenawa nam wena ekaka assign
    // karala
    @Query(value = "SELECT * FROM tms.booking b WHERE b.vehicle_id = ?1 AND b.id != ?2 AND b.booking_status_id NOT IN (6,7,8,9,10) LIMIT 1", nativeQuery = true)
    Booking getActiveBookingByVehicleExcludingCurrent(Integer vehicleId, Integer currentBookingId);

    // active currunt booking eka gannawa me driver thiyenawa nam wena ekaka assign
    // karala
    @Query(value = "SELECT * FROM tms.booking b WHERE b.driver_id = ?1 AND b.id != ?2 AND b.booking_status_id NOT IN (6,7,8,9,10) LIMIT 1", nativeQuery = true)
    Booking getActiveBookingByDriverExcludingCurrent(Integer driverId, Integer currentBookingId);

    // ----------------for vehicle
    // group-----------------------------------------------
    // active booking ekak thiyena vehicle id gannawa (Busy vehicles)
    @Query(value = "SELECT DISTINCT b.vehicle_id FROM tms.booking as b WHERE b.booking_status_id NOT IN (6, 7, 8,9,10) AND b.vehicle_id IS NOT NULL", nativeQuery = true)
    List<Integer> getBusyVehicleIds();

    @Query(value = "SELECT DISTINCT b.driver_id FROM tms.booking as b WHERE b.booking_status_id NOT IN (6, 7, 8,9,10) AND b.driver_id IS NOT NULL", nativeQuery = true)
    List<Integer> getBusyDriverIds();

    // -------------------------for supplier payment module
    // ekata-----------------------------------
    // customer payment karala thiyna bookings tiyena masa tika witharak gnnawa
    // selected supplierta adlawa
    // methanin apita enne [{"formatted_date": "2026-Jan"}] me format ekata
    @Query(value = "SELECT distinct(date_format(b.delivery_date_time, '%Y-%b')) as formatted_date from tms.booking as b where b.booking_status_id = 8 and b.vehicle_id =?1", nativeQuery = true)
    List<Map<String, Object>> getSupplierPaymentMonths(Integer vehicleId);

    // supplier paybale eke thiyena period ekata adala select karapu batch eke
    // thiyena supplier agreement ekata adala booking status eka 8 wena booking list
    // eka gnnawa
    @Query(value = "SELECT b.* FROM tms.booking as b join tms.supplier_agreement as sa on sa.vehicle_id = b.vehicle_id where sa.id =?1 and date_format(b.delivery_date_time, '%Y-%b')=?2 and b.booking_status_id=8", nativeQuery = true)
    List<Booking> getBookingListWhichBatchisPaid(Integer supplierAgreementId, String date);

    // ----------------------------driver portal ekata oni bookings tika
    // gnnawa-------------------------------------
    @Query(value = "SELECT * FROM tms.booking as b where b.driver_id = ?1 and b.booking_status_id not in(6,7,8,10) and month(b.pickup_date_time) = month(current_date()) \n"
            +
            "  and year(b.pickup_date_time) = year(current_date())", nativeQuery = true)
    List<Booking> getBookingForDriverPortal(Integer driverid);

    // -------------for customer ui-----------------------
    @Query(value = "SELECT count(b.id) FROM tms.booking as b where b.customer_id=?1 and b.booking_status_id in(6,8,9)", nativeQuery = true)
    Integer getcompletedBookingCountByCustomer(Integer customerId);

    @Query(value = "SELECT count(b.id) FROM tms.booking as b where b.customer_id= ?1 and b.booking_status_id in(1,2,3,4,5)", nativeQuery = true)
    Integer getPendingBookingCountByCustomer(Integer customerId);

    @Query(value = "SELECT COALESCE(SUM(b.distance), 0) FROM tms.booking as b where b.customer_id=?1 and b.booking_status_id in(6,8,9);", nativeQuery = true)
    BigDecimal getTotalDistanceByCustomer(Integer customerId);

    @Query(value = "SELECT COUNT(b.id) FROM tms.booking as b where b.vehicle_id=?1 and b.booking_status_id=6 AND MONTH(b.delivery_date_time) = MONTH(CURRENT_DATE) AND YEAR(b.delivery_date_time) = YEAR(CURRENT_DATE)", nativeQuery = true)
    public Integer getCompletedBookingCountForCurrentMonth(Integer vehicleId);

    @Query(value = "SELECT bs.status, count(b.id) FROM tms.booking_status as bs left join tms.booking as b on b.booking_status_id = bs.id group by bs.id", nativeQuery = true)
    List<Object[]> getStatusCounts();

    // customer portal ekata adala inprocess booking tika gnnawa
    @Query(value = "SELECT * FROM tms.booking as b where b.booking_status_id = 1 and b.customer_id = ?1 ORDER BY b.id DESC", nativeQuery = true)
    List<Booking> getByStatusAndCustomerId(Integer customerId);

    @Query(value = "SELECT * FROM tms.booking as b where b.vehicle_id = ?1 ORDER BY b.id DESC limit 10", nativeQuery = true)
    List<Booking> getByVehicleId(Integer vehicleId);

}
