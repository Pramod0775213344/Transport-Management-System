package lk.okidoki.modal;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// mema class eka entity ekak widihata hasirila table eka ekka mapping ekak hadanna oni nisa enttity anotation eka use karnw
@Entity

// Table Mapping
@Table(name = "report_summary")

@Data // Setter and getter auto generate karagnna meka gnnwa
@AllArgsConstructor // ALL construcorts generate wenawa
@NoArgsConstructor // all empty constructors generate wenawa
public class ReportSummary {

    @Id // primary key nisa use karanwa
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto increment nisa use karanawa
    private Integer id;

    private LocalDateTime view_datetime;

    @ManyToOne()
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user_id;

    @ManyToOne()
    @JoinColumn(name = "report_id", referencedColumnName = "id")
    private ReportList report_id;

}
