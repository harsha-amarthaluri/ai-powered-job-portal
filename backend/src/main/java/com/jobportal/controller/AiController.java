package com.jobportal.controller;

import com.jobportal.dto.AiDTO.*;
import com.jobportal.service.AiService;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AiController {

    private final AiService aiService;

    @org.springframework.beans.factory.annotation.Autowired
    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    // 1. AI Resume Gap Analysis
    @GetMapping("/seeker/jobs/{jobId}/gap-analysis")
    public ResponseEntity<GapAnalysisResponse> getGapAnalysis(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long jobId) {
        return ResponseEntity.ok(aiService.getGapAnalysis(userDetails.getUsername(), jobId));
    }

    // 2. ATS Resume Score
    @GetMapping("/seeker/ats-score")
    public ResponseEntity<AtsScoreResponse> getAtsScore(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(aiService.getAtsScore(userDetails.getUsername()));
    }

    // 3. AI Interview Question Generator
    @GetMapping("/seeker/jobs/{jobId}/interview-questions")
    public ResponseEntity<InterviewQuestionsResponse> getInterviewQuestions(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long jobId) {
        return ResponseEntity.ok(aiService.getInterviewQuestions(userDetails.getUsername(), jobId));
    }

    // 4. Personalized Career Roadmap
    @GetMapping("/seeker/roadmap")
    public ResponseEntity<RoadmapResponse> getRoadmap(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(aiService.getRoadmap(userDetails.getUsername()));
    }

    // 5. Recruiter Analytics Dashboard
    @GetMapping("/employer/jobs/{jobId}/analytics")
    public ResponseEntity<EmployerAnalyticsResponse> getEmployerAnalytics(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long jobId) {
        return ResponseEntity.ok(aiService.getEmployerAnalytics(userDetails.getUsername(), jobId));
    }

    // 6. Get Resume Versions List
    @GetMapping("/seeker/resumes")
    public ResponseEntity<List<ResumeVersionResponse>> getResumeVersions(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(aiService.getResumeVersions(userDetails.getUsername()));
    }

    // 7. Restore Resume Version
    @PostMapping("/seeker/resumes/restore/{version}")
    public ResponseEntity<Void> restoreResumeVersion(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable int version) {
        aiService.restoreResumeVersion(userDetails.getUsername(), version);
        return ResponseEntity.ok().build();
    }

    // 8. Recruiter Candidate Insights
    @GetMapping("/employer/applications/{applicationId}/insights")
    public ResponseEntity<CandidateInsightsResponse> getCandidateInsights(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(aiService.getCandidateInsights(applicationId));
    }

    // 9. Job Description Optimizer
    @PostMapping("/employer/jobs/optimize-jd")
    public ResponseEntity<JobOptimizationResponse> optimizeJobDescription(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody com.jobportal.dto.JobDTO.JobRequest request) {
        return ResponseEntity.ok(aiService.optimizeJobDescription(request));
    }
}
