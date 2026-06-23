package com.jobportal.controller;

import com.jobportal.dto.JobDTO.*;
import com.jobportal.service.JobService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")

public class JobController {

    private final JobService jobService;

    @org.springframework.beans.factory.annotation.Autowired
    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    // Public endpoints
    @GetMapping("/jobs/search")
    public ResponseEntity<List<JobResponse>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String jobType) {
        return ResponseEntity.ok(jobService.searchJobs(keyword, location, category, jobType));
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<JobResponse> getJob(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @GetMapping("/jobs/all")
    public ResponseEntity<List<JobResponse>> getAllApprovedJobs() {
        return ResponseEntity.ok(jobService.searchJobs(null, null, null, null));
    }

    // Employer endpoints
    @PostMapping("/employer/jobs")
    public ResponseEntity<JobResponse> createJob(@AuthenticationPrincipal UserDetails userDetails,
                                                  @RequestBody JobRequest request) {
        return ResponseEntity.ok(jobService.createJob(userDetails.getUsername(), request));
    }

    @GetMapping("/employer/jobs")
    public ResponseEntity<List<JobResponse>> getMyJobs(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobService.getEmployerJobs(userDetails.getUsername()));
    }

    @PutMapping("/employer/jobs/{id}")
    public ResponseEntity<JobResponse> updateJob(@AuthenticationPrincipal UserDetails userDetails,
                                                  @PathVariable Long id,
                                                  @RequestBody JobRequest request) {
        return ResponseEntity.ok(jobService.updateJob(userDetails.getUsername(), id, request));
    }

    @DeleteMapping("/employer/jobs/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/employer/jobs/{jobId}/applications")
    public ResponseEntity<List<ApplicationResponse>> getJobApplications(@PathVariable Long jobId) {
        return ResponseEntity.ok(jobService.getJobApplications(jobId));
    }

    @PutMapping("/employer/applications/{applicationId}/status")
    public ResponseEntity<ApplicationResponse> updateApplicationStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long applicationId,
            @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(jobService.updateApplicationStatus(userDetails.getUsername(), applicationId, request));
    }

    // Seeker endpoints
    @PostMapping("/seeker/jobs/{jobId}/apply")
    public ResponseEntity<ApplicationResponse> applyToJob(@AuthenticationPrincipal UserDetails userDetails,
                                                           @PathVariable Long jobId,
                                                           @RequestBody ApplicationRequest request) {
        return ResponseEntity.ok(jobService.applyToJob(userDetails.getUsername(), jobId, request, null));
    }

    @GetMapping("/seeker/applications")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobService.getSeekerApplications(userDetails.getUsername()));
    }

    @GetMapping("/seeker/recommended-jobs")
    public ResponseEntity<List<JobResponse>> getRecommendedJobs(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(jobService.getRecommendedJobs(userDetails.getUsername()));
    }
}
