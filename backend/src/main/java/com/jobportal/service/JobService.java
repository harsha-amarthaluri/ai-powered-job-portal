package com.jobportal.service;

import com.jobportal.dto.JobDTO.*;
import com.jobportal.entity.*;
import com.jobportal.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import java.util.*;
import java.util.stream.Collectors;

@Service

public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final ApplicationHistoryRepository applicationHistoryRepository;

    @org.springframework.beans.factory.annotation.Autowired
    public JobService(JobRepository jobRepository, UserRepository userRepository,
                      ApplicationRepository applicationRepository,
                      NotificationService notificationService, EmailService emailService,
                      ApplicationHistoryRepository applicationHistoryRepository) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.applicationHistoryRepository = applicationHistoryRepository;
    }

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    public JobResponse createJob(String employerEmail, JobRequest request) {
        User employer = userRepository.findByEmail(employerEmail)
                .orElseThrow(() -> new RuntimeException("Employer not found"));

        Job job = Job.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .company(employer.getCompanyName() != null ? employer.getCompanyName() : employer.getFullName())
                .location(request.getLocation())
                .salary(request.getSalary())
                .jobType(request.getJobType())
                .experience(request.getExperience())
                .skills(request.getSkills())
                .category(request.getCategory())
                .employer(employer)
                .approved(true)
                .status(Job.JobStatus.OPEN)
                .build();

        Job saved = jobRepository.save(job);
        return toResponse(saved, null);
    }

    public List<JobResponse> getEmployerJobs(String employerEmail) {
        User employer = userRepository.findByEmail(employerEmail)
                .orElseThrow(() -> new RuntimeException("Employer not found"));
        return jobRepository.findByEmployer(employer).stream()
                .map(j -> toResponse(j, null)).collect(Collectors.toList());
    }

    public List<JobResponse> searchJobs(String keyword, String location, String category, String jobType) {
        return jobRepository.searchJobs(
                keyword == null || keyword.isEmpty() ? null : keyword,
                location == null || location.isEmpty() ? null : location,
                category == null || category.isEmpty() ? null : category,
                jobType == null || jobType.isEmpty() ? null : jobType
        ).stream().map(j -> toResponse(j, null)).collect(Collectors.toList());
    }

    public List<JobResponse> getRecommendedJobs(String seekerEmail) {
        User seeker = userRepository.findByEmail(seekerEmail)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));
        String skills = seeker.getSkills();
        if (skills == null || skills.isEmpty()) {
            return jobRepository.findByApprovedTrueAndStatus(Job.JobStatus.OPEN)
                    .stream().map(j -> toResponse(j, null)).collect(Collectors.toList());
        }
        // Get AI scores for each job
        List<Job> jobs = jobRepository.findByApprovedTrueAndStatus(Job.JobStatus.OPEN);
        return jobs.stream().map(job -> {
            double score = getAiMatchScore(skills, job.getDescription() + " " + job.getSkills());
            JobResponse resp = toResponse(job, score);
            return resp;
        }).sorted(Comparator.comparingDouble(r -> -(r.getMatchScore() != null ? r.getMatchScore() : 0)))
          .limit(10).collect(Collectors.toList());
    }

    public ApplicationResponse applyToJob(String seekerEmail, Long jobId, ApplicationRequest request, String resumePath) {
        User seeker = userRepository.findByEmail(seekerEmail)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (applicationRepository.existsBySeekerAndJob(seeker, job))
            throw new RuntimeException("Already applied to this job");

        // Get AI match score
        double matchScore = getAiMatchScore(
                seeker.getSkills() != null ? seeker.getSkills() : "",
                job.getDescription() + " " + job.getSkills()
        );

        Application application = Application.builder()
                .seeker(seeker)
                .job(job)
                .coverLetter(request.getCoverLetter())
                .resumePath(resumePath != null ? resumePath : seeker.getResumePath())
                .matchScore(matchScore)
                .status(Application.ApplicationStatus.APPLIED)
                .build();

        Application saved = applicationRepository.save(application);

        // Record initial history log
        ApplicationHistory history = new ApplicationHistory(
                saved, Application.ApplicationStatus.APPLIED,
                "Applied to job opening.",
                seekerEmail
        );
        applicationHistoryRepository.save(history);

        // Notifications & Email
        emailService.sendApplicationConfirmation(seeker.getEmail(), seeker.getFullName(), job.getTitle(), job.getCompany());
        emailService.sendNewApplicantAlert(job.getEmployer().getEmail(), job.getEmployer().getFullName(), seeker.getFullName(), job.getTitle(), matchScore);
        notificationService.createAndSend(seeker, "Application Submitted",
                "You applied for " + job.getTitle() + " at " + job.getCompany(), "APPLICATION", "/seeker/applications");
        notificationService.createAndSend(job.getEmployer(), "New Applicant",
                seeker.getFullName() + " applied for " + job.getTitle(), "APPLICATION", "/employer/applications/" + jobId);

        return toApplicationResponse(saved);
    }

    public ApplicationResponse updateApplicationStatus(String employerEmail, Long applicationId, StatusUpdateRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(request.getStatus());
        if (request.getEmployerNote() != null) application.setEmployerNote(request.getEmployerNote());
        Application saved = applicationRepository.save(application);

        // Record status change history log
        ApplicationHistory history = new ApplicationHistory(
                saved, request.getStatus(),
                request.getEmployerNote() != null ? request.getEmployerNote() : "Status updated by recruiter.",
                employerEmail
        );
        applicationHistoryRepository.save(history);

        User seeker = application.getSeeker();
        Job job = application.getJob();

        emailService.sendStatusUpdate(seeker.getEmail(), seeker.getFullName(),
                job.getTitle(), job.getCompany(), request.getStatus().name(), request.getEmployerNote());
        notificationService.createAndSend(seeker, "Application Status Updated",
                "Your application for " + job.getTitle() + " is now " + request.getStatus().name(),
                "STATUS_UPDATE", "/seeker/applications");

        return toApplicationResponse(saved);
    }

    public List<ApplicationResponse> getJobApplications(Long jobId) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        return applicationRepository.findByJobOrderByMatchScoreDesc(job)
                .stream().map(this::toApplicationResponse).collect(Collectors.toList());
    }

    public List<ApplicationResponse> getSeekerApplications(String seekerEmail) {
        User seeker = userRepository.findByEmail(seekerEmail).orElseThrow();
        return applicationRepository.findBySeeker(seeker)
                .stream().map(this::toApplicationResponse).collect(Collectors.toList());
    }

    public JobResponse getJobById(Long id) {
        Job job = jobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
        job.setViewCount(job.getViewCount() + 1);
        jobRepository.save(job);
        return toResponse(job, null);
    }

    public JobResponse updateJob(String employerEmail, Long jobId, JobRequest request) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setLocation(request.getLocation());
        job.setSalary(request.getSalary());
        job.setJobType(request.getJobType());
        job.setExperience(request.getExperience());
        job.setSkills(request.getSkills());
        job.setCategory(request.getCategory());
        job.setApproved(true);
        job.setStatus(Job.JobStatus.OPEN);
        return toResponse(jobRepository.save(job), null);
    }

    public void deleteJob(Long jobId) {
        jobRepository.deleteById(jobId);
    }

    private double getAiMatchScore(String candidateSkills, String jobText) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            Map<String, String> payload = Map.of(
                    "candidate_skills", candidateSkills,
                    "job_description", jobText
            );
            Map response = restTemplate.postForObject(aiServiceUrl + "/match", payload, Map.class);
            if (response != null && response.containsKey("score")) {
                return ((Number) response.get("score")).doubleValue();
            }
        } catch (Exception e) {
            System.err.println("AI service unavailable, using fallback score: " + e.getMessage());
            return calculateFallbackScore(candidateSkills, jobText);
        }
        return 0.0;
    }

    private double calculateFallbackScore(String candidateSkills, String jobText) {
        if (candidateSkills == null || candidateSkills.isEmpty()) return 0.0;
        String[] skills = candidateSkills.toLowerCase().split(",");
        String lowerJob = jobText.toLowerCase();
        long matches = Arrays.stream(skills).filter(s -> lowerJob.contains(s.trim())).count();
        return Math.min(100.0, (matches * 100.0) / Math.max(skills.length, 1));
    }

    private JobResponse toResponse(Job job, Double matchScore) {
        return JobResponse.builder()
                .id(job.getId()).title(job.getTitle()).description(job.getDescription())
                .company(job.getCompany()).location(job.getLocation()).salary(job.getSalary())
                .jobType(job.getJobType()).experience(job.getExperience()).skills(job.getSkills())
                .category(job.getCategory()).status(job.getStatus().name()).approved(job.isApproved())
                .employerId(job.getEmployer().getId()).employerName(job.getEmployer().getFullName())
                .applicationCount(job.getApplications() != null ? job.getApplications().size() : 0)
                .viewCount(job.getViewCount()).createdAt(job.getCreatedAt()).matchScore(matchScore)
                .build();
    }

    private ApplicationResponse toApplicationResponse(Application app) {
        return ApplicationResponse.builder()
                .id(app.getId()).jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle()).company(app.getJob().getCompany())
                .location(app.getJob().getLocation()).seekerId(app.getSeeker().getId())
                .seekerName(app.getSeeker().getFullName()).seekerEmail(app.getSeeker().getEmail())
                .seekerSkills(app.getSeeker().getSkills()).resumePath(app.getResumePath())
                .coverLetter(app.getCoverLetter()).status(app.getStatus().name())
                .matchScore(app.getMatchScore()).employerNote(app.getEmployerNote())
                .appliedAt(app.getAppliedAt()).build();
    }
}
