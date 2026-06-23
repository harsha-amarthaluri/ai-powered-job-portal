package com.jobportal.service;

import com.jobportal.dto.RecruiterDTO.*;
import com.jobportal.dto.JobDTO.ApplicationResponse;
import com.jobportal.dto.AiDTO.CandidateInsightsResponse;
import com.jobportal.entity.*;
import com.jobportal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class RecruiterService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationHistoryRepository applicationHistoryRepository;
    private final RecruiterNoteRepository recruiterNoteRepository;
    private final SeekerProfileRepository seekerProfileRepository;
    private final ResumeVersionRepository resumeVersionRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final AiService aiService;

    @org.springframework.beans.factory.annotation.Value("${ai.service.url}")
    private String aiServiceUrl;

    @Autowired
    public RecruiterService(UserRepository userRepository, JobRepository jobRepository,
                            ApplicationRepository applicationRepository,
                            ApplicationHistoryRepository applicationHistoryRepository,
                            RecruiterNoteRepository recruiterNoteRepository,
                            SeekerProfileRepository seekerProfileRepository,
                            ResumeVersionRepository resumeVersionRepository,
                            EmailService emailService,
                            NotificationService notificationService,
                            AiService aiService) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.applicationHistoryRepository = applicationHistoryRepository;
        this.recruiterNoteRepository = recruiterNoteRepository;
        this.seekerProfileRepository = seekerProfileRepository;
        this.resumeVersionRepository = resumeVersionRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
        this.aiService = aiService;
    }

    // 1. Pipeline History
    public List<ApplicationHistoryResponse> getApplicationHistory(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        return applicationHistoryRepository.findByApplicationOrderByUpdatedAtAsc(application)
                .stream().map(h -> new ApplicationHistoryResponse(
                        h.getId(), h.getStatus().name(), h.getNote(), h.getUpdatedBy(), h.getUpdatedAt()
                )).collect(Collectors.toList());
    }

    public void saveApplicationHistory(Application application, Application.ApplicationStatus status, String note, String updatedBy) {
        ApplicationHistory history = new ApplicationHistory(application, status, note, updatedBy);
        applicationHistoryRepository.save(history);
    }

    // 2. Recruiter Notes & Evaluations
    public RecruiterNoteResponse addRecruiterNote(String recruiterEmail, Long applicationId, RecruiterNoteRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        RecruiterNote note = new RecruiterNote(
                application, recruiterEmail, request.getStage(), request.getContent(),
                request.getRating(), request.getInterviewComments()
        );
        RecruiterNote saved = recruiterNoteRepository.save(note);

        // Record history log for note addition
        saveApplicationHistory(
                application, application.getStatus(),
                "Added evaluation feedback note at " + request.getStage() + " stage. Rating: " + request.getRating() + " stars.",
                recruiterEmail
        );

        return toNoteResponse(saved);
    }

    public List<RecruiterNoteResponse> getRecruiterNotes(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        return recruiterNoteRepository.findByApplicationOrderByCreatedAtDesc(application)
                .stream().map(this::toNoteResponse).collect(Collectors.toList());
    }

    // 3. Dynamic Candidate Timeline
    public List<TimelineNode> getCandidateTimeline(Long applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        User seeker = app.getSeeker();
        List<TimelineNode> timeline = new ArrayList<>();

        // A. Profile Created
        if (seeker.getCreatedAt() != null) {
            timeline.add(new TimelineNode(
                    "PROFILE_CREATED", "Candidate Profile Created",
                    "Seeker successfully registered account on AI Job Portal.", seeker.getCreatedAt()
            ));
        }

        // B. Resume Uploaded & Versions Upload/Update logs
        List<ResumeVersion> versions = resumeVersionRepository.findByUserOrderByVersionDesc(seeker);
        for (ResumeVersion ver : versions) {
            String action = ver.getVersion() == 1 ? "Resume Uploaded" : "Resume Updated";
            String desc = ver.getVersion() == 1 
                    ? "Initial resume file '" + ver.getFileName() + "' uploaded to profile."
                    : "Updated resume version " + ver.getVersion() + " ('" + ver.getFileName() + "') published to active cache.";
            timeline.add(new TimelineNode(
                    ver.getVersion() == 1 ? "RESUME_UPLOADED" : "RESUME_UPDATED",
                    action, desc, ver.getUploadedAt()
            ));
        }

        // C. Applications Submitted
        timeline.add(new TimelineNode(
                "APPLICATION_SUBMITTED", "Job Application Submitted",
                "Applied to position '" + app.getJob().getTitle() + "' at " + app.getJob().getCompany() + ".",
                app.getAppliedAt()
        ));

        // D. Pipeline status movements history
        List<ApplicationHistory> histories = applicationHistoryRepository.findByApplicationOrderByUpdatedAtAsc(app);
        for (ApplicationHistory hist : histories) {
            String title = "Status Advanced: " + hist.getStatus().name();
            String desc = hist.getNote() != null ? hist.getNote() : "Recruiter updated status to " + hist.getStatus().name() + ".";
            timeline.add(new TimelineNode(
                    hist.getStatus() == Application.ApplicationStatus.INTERVIEW_SCHEDULED ? "INTERVIEW_SCHEDULED" : "STATUS_CHANGED",
                    title, desc, hist.getUpdatedAt()
            ));
        }

        // Sort chronologically ascending
        timeline.sort(Comparator.comparing(TimelineNode::getTimestamp));
        return timeline;
    }

    // 4. Candidate side-by-side comparisons
    public List<ComparisonResponse> compareCandidates(List<Long> applicantIds) {
        List<ComparisonResponse> responses = new ArrayList<>();
        for (Long appId : applicantIds) {
            try {
                Application app = applicationRepository.findById(appId).orElse(null);
                if (app == null) continue;
                User seeker = app.getSeeker();
                SeekerProfile profile = seeker.getSeekerProfile();

                ComparisonResponse res = new ComparisonResponse();
                res.setApplicantId(appId);
                res.setName(seeker.getFullName());
                res.setEmail(seeker.getEmail());
                res.setSkills(seeker.getSkills());
                res.setMatchScore(app.getMatchScore());
                res.setAtsScore(seeker.getCachedAtsScore() != null ? seeker.getCachedAtsScore() : 0.0);

                // Experience summary
                String expSummary = "Fresher";
                if (seeker.getWorkExperiences() != null && !seeker.getWorkExperiences().isEmpty()) {
                    expSummary = seeker.getWorkExperiences().size() + " positions: " + 
                            seeker.getWorkExperiences().stream().map(WorkExperience::getDesignation).collect(Collectors.joining(", "));
                } else if (seeker.getExperience() != null && !seeker.getExperience().trim().isEmpty()) {
                    expSummary = seeker.getExperience().length() > 60 ? seeker.getExperience().substring(0, 60) + "..." : seeker.getExperience();
                }
                res.setExperienceSummary(expSummary);

                // Education summary
                String eduSummary = "Not Specified";
                if (profile != null && profile.getGradDegree() != null) {
                    eduSummary = profile.getGradDegree() + " in " + profile.getGradBranch() + " (CGPA: " + (profile.getGradCgpa() != null ? profile.getGradCgpa() : "N/A") + ")";
                } else if (seeker.getEducation() != null && !seeker.getEducation().trim().isEmpty()) {
                    eduSummary = seeker.getEducation().length() > 60 ? seeker.getEducation().substring(0, 60) + "..." : seeker.getEducation();
                }
                res.setEducationSummary(eduSummary);

                // Call insights for strengths/weaknesses fallback
                try {
                    CandidateInsightsResponse insights = aiService.getCandidateInsights(appId);
                    res.setStrengths(insights.getStrengths());
                    res.setWeaknesses(insights.getWeaknesses());
                } catch (Exception e) {
                    res.setStrengths(List.of("Flexible developer core stack."));
                    res.setWeaknesses(List.of("Details require validation."));
                }

                responses.add(res);
            } catch (Exception ignored) {}
        }
        return responses;
    }

    // 5. Advanced Candidate Search Filters
    public List<ApplicationResponse> searchCandidates(
            String recruiterEmail, String skill, String experience, String education,
            Double minAtsScore, Double minMatchScore, String location, String certification, String project) {

        // Retrieve recruiter user to enforce permissions / scope
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> new RuntimeException("Recruiter account not found"));

        // Match all applications posted by this recruiter
        List<Job> jobs = jobRepository.findByEmployer(recruiter);
        List<Application> apps = new ArrayList<>();
        for (Job job : jobs) {
            apps.addAll(applicationRepository.findByJobOrderByMatchScoreDesc(job));
        }

        // Apply filters in Java Stream for high-performance cross-relational logic
        return apps.stream().filter(app -> {
            User seeker = app.getSeeker();
            SeekerProfile profile = seeker.getSeekerProfile();

            // A. Skill Filter
            if (skill != null && !skill.trim().isEmpty()) {
                String target = skill.toLowerCase().strip();
                boolean skillMatch = (seeker.getSkills() != null && seeker.getSkills().toLowerCase().contains(target))
                        || (seeker.getSeekerSkills() != null && seeker.getSeekerSkills().stream().anyMatch(s -> s.getSkillName().toLowerCase().contains(target)));
                if (!skillMatch) return false;
            }

            // B. Experience Keywords Filter
            if (experience != null && !experience.trim().isEmpty()) {
                String target = experience.toLowerCase().strip();
                boolean expMatch = (seeker.getExperience() != null && seeker.getExperience().toLowerCase().contains(target))
                        || (seeker.getWorkExperiences() != null && seeker.getWorkExperiences().stream().anyMatch(w -> w.getDesignation().toLowerCase().contains(target) || w.getCompanyName().toLowerCase().contains(target)));
                if (!expMatch) return false;
            }

            // C. Education Filter
            if (education != null && !education.trim().isEmpty()) {
                String target = education.toLowerCase().strip();
                boolean eduMatch = (seeker.getEducation() != null && seeker.getEducation().toLowerCase().contains(target))
                        || (profile != null && ((profile.getGradDegree() != null && profile.getGradDegree().toLowerCase().contains(target))
                                             || (profile.getGradCollege() != null && profile.getGradCollege().toLowerCase().contains(target))));
                if (!eduMatch) return false;
            }

            // D. ATS Score Filter
            if (minAtsScore != null) {
                double ats = seeker.getCachedAtsScore() != null ? seeker.getCachedAtsScore() : 0.0;
                if (ats < minAtsScore) return false;
            }

            // E. Match Score Filter
            if (minMatchScore != null) {
                double match = app.getMatchScore() != null ? app.getMatchScore() : 0.0;
                if (match < minMatchScore) return false;
            }

            // F. Location Filter
            if (location != null && !location.trim().isEmpty()) {
                String target = location.toLowerCase().strip();
                boolean locMatch = (seeker.getLocation() != null && seeker.getLocation().toLowerCase().contains(target))
                        || (profile != null && ((profile.getCurrentAddress() != null && profile.getCurrentAddress().toLowerCase().contains(target))
                                             || (profile.getPreferredLocationPref() != null && profile.getPreferredLocationPref().toLowerCase().contains(target))));
                if (!locMatch) return false;
            }

            // G. Certifications Filter
            if (certification != null && !certification.trim().isEmpty()) {
                String target = certification.toLowerCase().strip();
                boolean certMatch = seeker.getCertifications() != null && seeker.getCertifications().stream().anyMatch(c -> c.getCertificateName().toLowerCase().contains(target) || c.getOrganization().toLowerCase().contains(target));
                if (!certMatch) return false;
            }

            // H. Projects Filter
            if (project != null && !project.trim().isEmpty()) {
                String target = project.toLowerCase().strip();
                boolean projMatch = seeker.getProjects() != null && seeker.getProjects().stream().anyMatch(p -> p.getProjectTitle().toLowerCase().contains(target) || p.getDescription().toLowerCase().contains(target));
                if (!projMatch) return false;
            }

            return true;
        }).map(this::toApplicationResponse).collect(Collectors.toList());
    }

    // 6. Job Performance Analytics Dashboard
    public JobPerformanceResponse getJobPerformance(String recruiterEmail, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job opening not found"));

        if (!job.getEmployer().getEmail().equals(recruiterEmail)) {
            throw new RuntimeException("Unauthorized: You do not own this job listing");
        }

        List<Application> apps = applicationRepository.findByJobOrderByMatchScoreDesc(job);
        int views = job.getViewCount();
        int applications = apps.size();
        
        // Conversion rate (apps / views)
        double conversion = views == 0 ? 0.0 : Math.round(((double) applications / views) * 1000.0) / 10.0;
        conversion = Math.min(100.0, conversion);

        // Average match score
        double avgMatch = apps.stream().filter(a -> a.getMatchScore() != null)
                .mapToDouble(Application::getMatchScore).average().orElse(0.0);
        avgMatch = Math.round(avgMatch * 10.0) / 10.0;

        // Score Distribution
        Map<String, Long> scoreDist = new HashMap<>();
        scoreDist.put("80-100", 0L);
        scoreDist.put("60-80", 0L);
        scoreDist.put("40-60", 0L);
        scoreDist.put("0-40", 0L);

        Map<String, Long> skillCloud = new HashMap<>();
        Map<String, Long> candidateDist = new HashMap<>();

        for (Application app : apps) {
            // Count status distribution
            String stat = app.getStatus().name();
            candidateDist.put(stat, candidateDist.getOrDefault(stat, 0L) + 1);

            // Match score distribution
            if (app.getMatchScore() != null) {
                double score = app.getMatchScore();
                if (score >= 80.0) scoreDist.put("80-100", scoreDist.get("80-100") + 1);
                else if (score >= 60.0) scoreDist.put("60-80", scoreDist.get("60-80") + 1);
                else if (score >= 40.0) scoreDist.put("40-60", scoreDist.get("40-60") + 1);
                else scoreDist.put("0-40", scoreDist.get("0-40") + 1);
            }

            // Top skills extraction
            User seeker = app.getSeeker();
            if (seeker.getSkills() != null) {
                String[] skills = seeker.getSkills().split(",");
                for (String sk : skills) {
                    String clean = sk.trim().toLowerCase();
                    if (!clean.isEmpty()) {
                        skillCloud.put(clean, skillCloud.getOrDefault(clean, 0L) + 1);
                    }
                }
            }
        }

        // Extract top 5 skills
        List<String> topSkills = skillCloud.entrySet().stream()
                .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder()))
                .limit(5).map(Map.Entry::getKey).collect(Collectors.toList());

        return new JobPerformanceResponse(
                views, applications, conversion, avgMatch, scoreDist, topSkills, candidateDist
        );
    }

    private RecruiterNoteResponse toNoteResponse(RecruiterNote n) {
        return new RecruiterNoteResponse(
                n.getId(), n.getAuthorEmail(), n.getStage(), n.getContent(), n.getRating(), n.getInterviewComments(), n.getCreatedAt()
        );
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

    public Map<String, Object> getJobAiInsights(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job posting not found"));
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            Map<String, String> payload = Map.of(
                    "title", job.getTitle(),
                    "skills", job.getSkills() != null ? job.getSkills() : "",
                    "description", job.getDescription() != null ? job.getDescription() : ""
            );
            return restTemplate.postForObject(aiServiceUrl + "/job-insights", payload, Map.class);
        } catch (Exception e) {
            System.err.println("Failed calling Flask job-insights: " + e.getMessage());
            return Map.of(
                    "missingRequirements", List.of("Docker", "System design details", "Automated pipelines"),
                    "keywordsSuggested", List.of("git", "testing", "rest api"),
                    "descriptionTips", List.of("Expand job descriptions to highlight testing guidelines and environment parameters."),
                    "skillRecommendations", List.of("docker", "system design", "rest api")
            );
        }
    }
}
