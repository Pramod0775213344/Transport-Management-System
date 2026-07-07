package lk.okidoki.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lk.okidoki.modal.ReportList;
import lk.okidoki.modal.ReportSummary;
import lk.okidoki.modal.User;
import lk.okidoki.repository.ReportListRepository;
import lk.okidoki.repository.ReportSummaryRepository;
import lk.okidoki.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
public class ReportSummaryController {
    @Autowired // auto generate instance
    private ReportSummaryRepository reportSummaryRepository;

    @Autowired
    private ReportListRepository reportListRepository;

    @Autowired
    private UserRepository userRepository;

    // Get mapping for get all module table data from the table (url
    // -->reportsummary/alldata)
    @RequestMapping(value = "/reportsummary/alldata", produces = "application/json")
    public List<ReportSummary> findAllData() {
        return reportSummaryRepository.findAll();
    }

    @RequestMapping(value = "/reportlist/alldata", produces = "application/json")
    public List<ReportList> findAllReportLists() {
        return reportListRepository.findAll();
    }

    // record ekak insert karanawa database ekata user report eka view kalama
    @PostMapping(value = "/reportsummary/insert", produces = "application/json")
    public ReportSummary createReportSummary(@RequestBody ReportSummary reportSummary) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        // Force creation: ignore any client-provided id to avoid merge (optimistic locking) issues
        reportSummary.setId(null);
        reportSummary.setUser_id(logeduser);
        reportSummary.setView_datetime(LocalDateTime.now());
        return reportSummaryRepository.save(reportSummary);
    }


    // log wena userta adlawa last view data eka ganna query eka report ekata adlawa
    @GetMapping(value = "reportsummary/lastviewbyuser", params = {"reportid"},produces = "application/json")
    public LocalDate getLastView(@RequestParam("reportid") Integer reportid) {
         Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User logeduser = userRepository.getByUsername(auth.getName());

        return reportSummaryRepository.lastViewByUser(reportid, logeduser.getId());

    }
    

}
