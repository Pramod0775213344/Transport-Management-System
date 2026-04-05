package lk.okidoki.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.okidoki.modal.Route;

public interface RouteRepository extends JpaRepository<Route, Integer> {

    @Query(value = "SELECT * FROM tms.route as r where r.customer_id=?1 and r.route_status_id=1", nativeQuery = true)
    public List<Route> getRouteByCustomer(Integer customerid);

}
