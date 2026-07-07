package lk.okidoki.repository;

import lk.okidoki.modal.Booking;
import lk.okidoki.modal.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.sql.Date;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Integer> {

//    get booking by status(inprocess)
    @Query(value = "SELECT * FROM tms.booking as b where b.booking_status_id = 1 ORDER BY b.id DESC",nativeQuery = true)
    List<Booking> getByStatus();

//    get vehicl deatils
    @Query(value = "SELECT * FROM tms.booking as b where b.vehicle_id =?1",nativeQuery = true)
    Booking getByVehicleNo(Integer vehicleId);

//    get driver details
    @Query(value = "SELECT * FROM tms.booking as b where b.driver_id =?1",nativeQuery = true)
    Booking getDriver(Integer driverId);

    //    get booking by status(departed from delivery)
    @Query(value = "SELECT * FROM tms.booking as b where b.booking_status_id = 6",nativeQuery = true)
    List<Booking> getByDepartedFromDeliveryStatus();

//    get bookings by given customer id and and packagetype and vehicle type ids completed bookings(because calculate the payment vehicle type wise)
    @Query(value = "SELECT * FROM tms.booking as b where b.customer_id = ?1 and b.booking_status_id = 6 and b.vehicle_type_id=?3 and b.customer_agreement_id in( SELECT ca.id FROM tms.customer_agreement as ca where ca.package_id in (SELECT p.id FROM tms.package as p where p.package_type=?2)) and  b.id not in(SELECT cphb.booking_id FROM tms.customer_payment_has_booking as cphb)",nativeQuery = true)
    List<Booking> getBookingByCustomer(Integer customerid,String packageType,Integer vehicleTypeid);

//    get recent 5 bookings
    @Query(value = "SELECT * FROM tms.booking as b order by b.id desc limit 5",nativeQuery = true)
    List<Booking> getRecentFiveBookings();

//    get booking by given date range and selected customer id fo vehicle assigning
    @Query(value = "SELECT * FROM tms.booking as b where date(b.pickup_date_time) between ?1 and ?2 and b.customer_id =?3 and b.booking_status_id not in(7,8,6)",nativeQuery = true)
    List<Booking> getBookingByDateRangeAndCustomer(String startdate, String enddate, Integer customerId);

//    get all bookings for given vehicle No
//@Query("SELECT b.bookingNo, b.vehicle.id, b.distance FROM Booking b WHERE b.bookingStatus.id = 8 AND b.vehicle.id = ?1")
//List<Booking[]> getBookingByGivenVehicleNo(Integer vehicleid);

    @Query(value = "SELECT * FROM tms.booking as b where b.booking_status_id=8 and b.vehicle_id =?1",nativeQuery = true)
    List<Booking> getBookingByGivenVehicleNo(Integer vehicleid);

//--------------------------------querys for booking form search areas----------------------------------------------------
    @Query(value = "SELECT * FROM tms.booking as b where b.customer_id=?1 and b.booking_status_id = 1 ORDER BY b.id DESC",nativeQuery = true)
    List<Booking> getInproccessBookingByCustomer(Integer customerid);

    @Query(value = "SELECT * FROM tms.booking as b where b.vehicle_type_id=?1 and b.booking_status_id = 1 ORDER BY b.id DESC",nativeQuery = true)
    List<Booking> getInproccessBookingByVehicleType(Integer vehicletypeid);

    @Query(value = "SELECT * FROM tms.booking as b where  b.customer_id=?1 and b.vehicle_type_id=?2 and b.booking_status_id = 1 ORDER BY b.id DESC",nativeQuery = true)
    List<Booking> getInproccessBookingByCustomerAndVehicleType(Integer customerid, Integer vehicletypeid);
}
