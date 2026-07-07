package lk.okidoki.repository;

import lk.okidoki.modal.Booking;
import lk.okidoki.modal.FuelCards;
import lk.okidoki.modal.FuelRequest;

import org.antlr.v4.runtime.atn.SemanticContext.AND;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface FuelRequestRepository extends JpaRepository<FuelRequest, Integer> {

    @Query(value = "SELECT fr FROM FuelRequest fr WHERE fr.booking_id = ?1")
    List<FuelRequest> getByBooking(Booking bookingId);

    // pending fuel request list eka
    @Query(value = "SELECT fr FROM FuelRequest fr WHERE fr.fuel_request_status_id.id = 4")
    List<FuelRequest> getPendingFuelRequestList();

    // approved fuel request list eka
    @Query(value = "SELECT fr FROM FuelRequest fr WHERE fr.fuel_request_status_id.id = 5 order by fr.id desc")
    List<FuelRequest> getApprovedFuelRequestList();

    // get total fuel cost(Aprroved) of currunt month for selected vehicle using
    // fuel card id
    @Query(value = "select SUM(fr.request_fuel_cost_amount) from FuelRequest fr where fr.fuel_cards_id.id=?1 and fr.fuel_request_status_id.id=5 AND MONTH(fr.added_datetime) = MONTH(CURRENT_DATE) AND YEAR(fr.added_datetime) = YEAR(CURRENT_DATE)")
    public BigDecimal getFuelCost(Integer fuelCardId);

    // currunt month ekata adala fuel request tika gnnawa
    @Query(value = "select fr from FuelRequest fr where MONTH(fr.added_datetime) = MONTH(CURRENT_DATE) and YEAR(fr.added_datetime) = YEAR(CURRENT_DATE) and fr.fuel_cards_id.id=?1 ORDER BY fr.added_datetime DESC ")
    public List<FuelRequest> getFuelRequestListCurrentMonth(Integer fuelCardId);

    // pending fuel request list eka select karana fuel card ekata adalwa fuel card
    // pbject eka thama pass karala thiyenne meke
    @Query(value = "SELECT fr FROM FuelRequest fr WHERE fr.fuel_request_status_id.id = 4 and fr.fuel_cards_id =?1")
    List<FuelRequest> findByFuelCardAndFuelRequestStatus(@Param("fuelCard") FuelCards fuelCards);

    // --------------------for supplier
    // payable--------------------------------------

    @Query(value = "SELECT COALESCE(sum(fr.request_fuel_cost_amount),0) as fuel_cost FROM tms.fuel_request as fr where fr.fuel_request_status_id=5 and fr.vehicle_id=?1 and date_format(fr.approved_datetime,'%Y-%b')=?2", nativeQuery = true)
    Map<String, Object> getTotalFuelRequestAmount(Integer vehicleId, String month);

    @Query(value = "SELECT COALESCE(SUM(fr.request_fuel_cost_amount), 0) AS total_cost FROM tms.fuel_request as fr where fr.vehicle_id =?1 and  MONTH(fr.approved_datetime) = MONTH(CURRENT_DATE()) AND YEAR(fr.approved_datetime) = YEAR(CURRENT_DATE());", nativeQuery = true)
    BigDecimal getCurrentMonthTotalFuelCostSelectdVehicle(Integer vehicle_id);

    // --------------for vehicle ui-----------------------------

    @Query(value = "SELECT * FROM tms.fuel_request as fr where fr.vehicle_id =?1 and fr.fuel_request_status_id = 5 limit 5", nativeQuery = true)
    List<FuelRequest> getFuelRequestByVehicle(Integer vehicleId);
}
