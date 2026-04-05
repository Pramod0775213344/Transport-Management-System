package lk.okidoki.repository;

import lk.okidoki.modal.FuelPrice;

import java.math.BigDecimal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface FuelPriceRepository extends JpaRepository<FuelPrice, Integer> {

    @Query("SELECT fp FROM FuelPrice fp WHERE fp.fuel_type_id.id = ?1 AND fp.is_current = true")
    FuelPrice getCurrentPriceByFuelType(Integer fuelTypeId);

    // get currunt fuel price by sleceted fueltype by vehicle id
    @Query(value = "SELECT fp.unit_price FROM tms.fuel_price as fp where fp.fuel_type_id in (SELECT fc.fuel_type_id FROM tms.fuel_cards as fc where fc.vehicle_id = ?1) and fp.is_current is true", nativeQuery = true)
    BigDecimal getFuelPriceForRuelRequest(Integer vehicleId);

    @Query(value = "SELECT * FROM tms.fuel_price as fp where fp.fuel_type_id in (SELECT fc.fuel_type_id FROM tms.fuel_cards as fc where fc.vehicle_id = ?1) and fp.is_current is true", nativeQuery = true)
    FuelPrice getFuelPriceObjectForRuelRequest(Integer vehicleId);

}
