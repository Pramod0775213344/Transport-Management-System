package lk.okidoki.repository;

import lk.okidoki.modal.FuelCards;
import lk.okidoki.modal.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FuelCardsRepository extends JpaRepository<FuelCards, Integer> {

    // fuel card eka gnnawa select karana vehicle id eka anuwa
    @Query("SELECT fc FROM FuelCards fc WHERE fc.vehicle_id.id = ?1 AND fc.fuel_card_status_id.id = 3")
    FuelCards findActiveFuelCardsByVehicleId(Integer vehicleId);

    @Query(value = "select fc from FuelCards fc where fc.vehicle_id=?1")
    FuelCards getFuelCardsByVehicelId(Vehicle vehicleId);

    // JPQL query to get fuel card summary data
    // fuel card eke summaray eka gannawa
    @Query("SELECT fc.id, fc.fuel_cards_no, sa.package_id.package_type, sa.package_id.package_charge_sup," +
    // approve karala thiyena fuel total eke amount eka gannawa
            "(SELECT COALESCE(SUM(fr.request_fuel_cost_amount), 0) FROM FuelRequest fr WHERE fr.fuel_cards_id = fc AND fr.fuel_request_status_id.id = 5 AND MONTH(fr.added_datetime) = MONTH(CURRENT_DATE) AND YEAR(fr.added_datetime) = YEAR(CURRENT_DATE)), "
            +
            // complete karala thiyena bookings wala total distance eka gannawa (Distance is
            // String, so CAST is required)
            "(SELECT COALESCE(SUM(CAST(b.distance AS double)), 0) FROM Booking b WHERE b.vehicle_id = fc.vehicle_id AND b.booking_status_id.id = 6 AND MONTH(b.delivery_date_time) = MONTH(CURRENT_DATE) AND YEAR(b.delivery_date_time) = YEAR(CURRENT_DATE)) "
            +
            "FROM FuelCards fc, SupplierAgreement sa " +
            "WHERE sa.vehicle_id = fc.vehicle_id AND fc.fuel_card_status_id.id in (3,4) AND fc.vehicle_id.id = ?1")
    Object[] getFuelCardSummary(Integer vehicleId);

}
