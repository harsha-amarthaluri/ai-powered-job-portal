package com.jobportal.controller;

import com.jobportal.dto.JobDTO.JobResponse;
import com.jobportal.entity.*;
import com.jobportal.repository.*;
import com.jobportal.service.EmailService;
import com.jobportal.service.NotificationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin")

public class AdminController {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @org.springframework.beans.factory.annotation.Autowired
    public AdminController(UserRepository userRepository, JobRepository jobRepository,
                           ApplicationRepository applicationRepository, EmailService emailService,
                           NotificationService notificationService) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalSeekers", userRepository.countByRole(User.Role.ROLE_SEEKER));
        stats.put("totalEmployers", userRepository.countByRole(User.Role.ROLE_EMPLOYER));
        stats.put("totalJobs", jobRepository.count());
        stats.put("openJobs", jobRepository.countByStatus(Job.JobStatus.OPEN));
        stats.put("totalApplications", applicationRepository.count());
        stats.put("pendingApprovals", jobRepository.findByApprovedFalse().size());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/{id}/toggle")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow();
        user.setEnabled(!user.isEnabled());
        return ResponseEntity.ok(userRepository.save(user));
    }

    @GetMapping("/jobs/pending")
    public ResponseEntity<List<Job>> getPendingJobs() {
        return ResponseEntity.ok(jobRepository.findByApprovedFalse());
    }

    @PutMapping("/jobs/{id}/approve")
    public ResponseEntity<Job> approveJob(@PathVariable Long id) {
        Job job = jobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
        job.setApproved(true);
        Job saved = jobRepository.save(job);
        emailService.sendJobApprovalNotification(job.getEmployer().getEmail(), job.getEmployer().getFullName(), job.getTitle());
        notificationService.createAndSend(job.getEmployer(), "Job Approved",
                "Your job post '" + job.getTitle() + "' is now live!", "SYSTEM", "/employer/jobs");
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
