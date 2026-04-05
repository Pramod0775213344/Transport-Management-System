package lk.okidoki.repository;

import lk.okidoki.modal.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;


public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {


    //get invoice staus eka paid wune nathi ewa
    @Query("SELECT i FROM Invoice i WHERE i.invoice_status_id.id IN (1, 3)")
    public List<Invoice> getUnpaidInvoices();

    @Query(value = "select i from Invoice  i where i.customer_id.id=?1")
    public List<Invoice> getByCustomer(Integer customerId);
}
