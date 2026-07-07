package lk.okidoki.repository;

import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import lk.okidoki.modal.ReportSummary;

public interface ReportSummaryRepository extends JpaRepository<ReportSummary, Integer> {

    @Query(value="SELECT date(rs.view_datetime) FROM tms.report_summary as rs where rs.report_id=?1 and rs.user_id =?2 order by id desc limit 1",nativeQuery = true)
    LocalDate lastViewByUser(Integer reportid, Integer id);

    
}
