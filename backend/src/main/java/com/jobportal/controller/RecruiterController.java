package com.jobportal.controller;

import com.jobportal.dto.RecruiterDTO.*;
import com.jobportal.dto.JobDTO.ApplicationResponse;
import com.jobportal.service.RecruiterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employer")
public class RecruiterController {

    private final RecruiterService recruiterService;

    @Autowired
    public RecruiterController(RecruiterService recruiterService) {
        this.recruiterService = recruiterService;
    }

    // 1. Pipeline History
    @GetMapping("/applications/{applicationId}/history")
    public ResponseEntity<List<ApplicationHistoryResponse>> getApplicationHistory(
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(recruiterService.getApplicationHistory(applicationId));
    }

    // 2. Stage Notes & Evaluations
    @PostMapping("/applications/{applicationId}/notes")
    public ResponseEntity<RecruiterNoteResponse> addRecruiterNote(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long applicationId,
            @RequestBody RecruiterNoteRequest request) {
        return ResponseEntity.ok(recruiterService.addRecruiterNote(userDetails.getUsername(), applicationId, request));
    }

    @GetMapping("/applications/{applicationId}/notes")
    public ResponseEntity<List<RecruiterNoteResponse>> getRecruiterNotes(
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(recruiterService.getRecruiterNotes(applicationId));
    }

    // 3. Dynamic Unified Candidate Timeline
    @GetMapping("/applications/{applicationId}/timeline")
    public ResponseEntity<List<TimelineNode>> getCandidateTimeline(
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(recruiterService.getCandidateTimeline(applicationId));
    }

    // 4. Side-by-Side Candidates Comparison
    @PostMapping("/applications/compare")
    public ResponseEntity<List<ComparisonResponse>> compareCandidates(
            @RequestBody ComparisonRequest request) {
        return ResponseEntity.ok(recruiterService.compareCandidates(request.getApplicantIds()));
    }

    // 5. Job Performance Metrics
    @GetMapping("/jobs/{jobId}/performance")
    public ResponseEntity<JobPerformanceResponse> getJobPerformance(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long jobId) {
        return ResponseEntity.ok(recruiterService.getJobPerformance(userDetails.getUsername(), jobId));
    }

    // 6. Advanced Candidate Search
    @GetMapping("/candidates/search")
    public ResponseEntity<List<ApplicationResponse>> searchCandidates(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String experience,
            @RequestParam(required = false) String education,
            @RequestParam(required = false) Double minAtsScore,
            @RequestParam(required = false) Double minMatchScore,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String certification,
            @RequestParam(required = false) String project) {
        return ResponseEntity.ok(recruiterService.searchCandidates(
                userDetails.getUsername(), skill, experience, education,
                minAtsScore, minMatchScore, location, certification, project
        ));
    }

    // 7. Job AI Insights Optimizations
    @GetMapping("/jobs/{jobId}/ai-insights")
    public ResponseEntity<Map<String, Object>> getJobAiInsights(
            @PathVariable Long jobId) {
        return ResponseEntity.ok(recruiterService.getJobAiInsights(jobId));
    }
}
