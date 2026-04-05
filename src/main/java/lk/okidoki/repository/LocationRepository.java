package lk.okidoki.repository;

import lk.okidoki.modal.Location;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface LocationRepository extends JpaRepository<Location, Integer> {

    @Query(value = "select l from Location l where l.id not in (select bhl.location_id.id from BookingHasLocation bhl where bhl.booking_id.id = ?1) and l.location_status_id.id = 1")
    // @Query(value = "SELECT * FROM tms.location as l where l.id not in (SELECT
    // bhl.location_id FROM tms.booking_has_location as bhl where bhl.booking_id =
    // ?1)",nativeQuery = true)
    List<Location> getLocationsWithoutSelectLocations(Integer bookingid);

    @Query(value = "SELECT * FROM tms.location as l where l.customer_id = ?1 and l.location_status_id = 1", nativeQuery = true)
    List<Location> getLocationsBySelectedCustomer(Integer customerId);

    // loacion set eka gnnwa acustomerta adalawa route ekata add wela nathi
    // loactions tika
    @Query(value = "SELECT l FROM Location l where l.id not in(SELECT rhl.location_id.id FROM RouteHasLocation rhl where rhl.route_id.id=?1) and l.customer_id.id=?2 and l.location_status_id.id = 1")
    List<Location> getLocationsWithoutAddRoutes(Integer routeId, Integer customerId);

    @Query(value = "SELECT l FROM Location l WHERE l.location_status_id.id = 1")
    List<Location> getActiveLocations();
}
