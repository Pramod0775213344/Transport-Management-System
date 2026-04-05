package lk.okidoki.repository;

import lk.okidoki.modal.SupplierAgreement;
import lk.okidoki.modal.SupplierPayable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Map;


public interface SupplierPayableRepository extends JpaRepository<SupplierPayable,Integer> {



//    slect karana month ekata adlawa select karana vehicleta adalwa seletd column details tikak
//    column(bookingno,bookingdate,distance,packagecagrge eka,) [floatingRate bookings walata]
    @Query(value = "SELECT b.booking_no as booking_no ,date(b.delivery_date_time) as date, b.distance as distance, p.package_charge_sup as supplier_Charge\n" +
            "from tms.booking as b join tms.supplier_agreement as sa on sa.vehicle_id = b.vehicle_id \n" +
            "join tms.package as p on p.id = sa.package_id\n" +
            "where b.booking_status_id = 8 and b.vehicle_id =?1 and DATE_FORMAT(b.delivery_date_time, '%Y-%b') = ?2",nativeQuery = true)
    List<Map<String,Object>> getAllByBookingStatusAndDate(Integer vehicleId,String month);

//   //    slect karana month ekata adlawa select karana vehicleta adalwa seletd column details tikak
// column(bookingno,bookingdate,distance,packagecagrge eka,)[fixrate packagers walata]

    @Query(value = "SELECT count(b.id) as booking_count, sum(b.distance) as total_distance,p.distance as package_distance,sa.sup_agreement_no as agreement_no, p.package_charge_sup as supplier_Charge,p.additinal_km_charge_sup as additional_km_charge\n" +
            "from tms.booking as b join tms.supplier_agreement as sa on sa.vehicle_id = b.vehicle_id \n" +
            "join tms.package as p on p.id = sa.package_id\n" +
            "where b.booking_status_id = 8 and b.vehicle_id =?1 and DATE_FORMAT(b.delivery_date_time, '%Y-%b')=?2 group by p.distance,p.package_charge_sup,p.additinal_km_charge_sup,sa.sup_agreement_no;",nativeQuery = true)
    List<Map<String,Object>> getAllFixedRateBookingPriceByVehicleAndMonth(Integer vehicleId,String month);


    @Query(value = "select sp from SupplierPayable sp where sp.supplier_agreement_id.id=?1 and sp.supplier_payable_status_id.id in (1,2)")
    public List<SupplierPayable> getSupplierAgreementById(Integer supplierAgreementId);

//    select karana supplierta adlawa supplier batch eka gnnawa
    @Query(value = "SELECT sp.* FROM tms.supplier_payable as sp join tms.supplier_agreement as sa on sa.id = sp.supplier_agreement_id where sa.supplier_id =?1",nativeQuery = true)
    public List<SupplierPayable> getSupplierPayableBySupplierId(Integer supplierId);
}
