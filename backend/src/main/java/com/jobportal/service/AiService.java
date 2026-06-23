package com.jobportal.service;

import com.jobportal.dto.AiDTO.*;
import com.jobportal.entity.*;
import com.jobportal.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    @Autowired
    private ResumeVersionRepository resumeVersionRepository;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Autowired
    public AiService(UserRepository userRepository, JobRepository jobRepository,
                     ApplicationRepository applicationRepository) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
    }

    // 1. AI Resume Gap Analysis
    public GapAnalysisResponse getGapAnalysis(String seekerEmail, Long jobId) {
        User seeker = userRepository.findByEmail(seekerEmail)
                .orElseThrow(() -> new RuntimeException("Seeker profile not found"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job posting not found"));

        try {
            RestTemplate restTemplate = new RestTemplate();
            Map<String, String> payload = Map.of(
                    "candidate_skills", seeker.getSkills() != null ? seeker.getSkills() : "",
                    "job_skills", job.getSkills() != null ? job.getSkills() : "",
                    "job_description", job.getDescription() != null ? job.getDescription() : ""
            );
            return restTemplate.postForObject(aiServiceUrl + "/gap-analysis", payload, GapAnalysisResponse.class);
        } catch (Exception e) {
            System.err.println("Failed calling Flask gap-analysis, triggering java fallback: " + e.getMessage());
            return getGapAnalysisFallback(seeker, job);
        }
    }

    private GapAnalysisResponse getGapAnalysisFallback(User seeker, Job job) {
        String sSkills = seeker.getSkills() != null ? seeker.getSkills().toLowerCase() : "";
        String jSkills = job.getSkills() != null ? job.getSkills().toLowerCase() : "";
        String[] jobSkills = jSkills.split(",");
        
        List<String> missing = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();
        int overlap = 0;
        
        for (String skill : jobSkills) {
            String clean = skill.trim();
            if (clean.isEmpty()) continue;
            if (sSkills.contains(clean)) {
                overlap++;
            } else {
                missing.add(skill.trim());
                suggestions.add("Study " + skill.trim().toUpperCase() + ": build a mini portfolio module and review developer manuals.");
            }
        }
        
        double score = jobSkills.length == 0 ? 0.0 : ((double) overlap / jobSkills.length) * 100.0;
        if (missing.isEmpty()) {
            suggestions.add("Outstanding fit! Your skillset covers all listed core job skills.");
        }
        
        return new GapAnalysisResponse(score, missing, suggestions);
    }

    public AtsScoreResponse getAtsScore(String seekerEmail) {
        User seeker = userRepository.findByEmail(seekerEmail)
                .orElseThrow(() -> new RuntimeException("Seeker profile not found"));

        if (seeker.getCachedAtsReport() != null && !seeker.getCachedAtsReport().trim().isEmpty() && !seeker.getCachedAtsReport().equals("{}")) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                return mapper.readValue(seeker.getCachedAtsReport(), AtsScoreResponse.class);
            } catch (Exception e) {
                System.err.println("Failed to read cached ATS report, querying Flask: " + e.getMessage());
            }
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            Map<String, String> payload = Map.of(
                    "skills", seeker.getSkills() != null ? seeker.getSkills() : "",
                    "experience", seeker.getExperience() != null ? seeker.getExperience() : "",
                    "education", seeker.getEducation() != null ? seeker.getEducation() : ""
            );
            return restTemplate.postForObject(aiServiceUrl + "/ats-score", payload, AtsScoreResponse.class);
        } catch (Exception e) {
            System.err.println("Failed calling Flask ats-score, triggering java fallback: " + e.getMessage());
            return getAtsScoreFallback(seeker);
        }
    }

    private AtsScoreResponse getAtsScoreFallback(User seeker) {
        double score = 0.0;
        Map<String, Boolean> analysis = new HashMap<>();
        List<String> recommendations = new ArrayList<>();

        boolean hasSkills = seeker.getSkills() != null && !seeker.getSkills().trim().isEmpty();
        analysis.put("skillsSection", hasSkills);
        if (hasSkills) score += 25.0;
        else recommendations.add("Create a detailed skills keyword listing.");

        boolean hasExp = seeker.getExperience() != null && seeker.getExperience().trim().length() > 30;
        analysis.put("experienceSection", hasExp);
        if (hasExp) score += 25.0;
        else recommendations.add("List impact-driven details in your work history.");

        boolean hasEdu = seeker.getEducation() != null && seeker.getEducation().trim().length() > 15;
        analysis.put("educationSection", hasEdu);
        if (hasEdu) score += 25.0;
        else recommendations.add("Add academic degrees and major descriptions.");

        boolean hasContact = seeker.getPhone() != null && !seeker.getPhone().trim().isEmpty();
        analysis.put("contactDetails", hasContact);
        if (hasContact) score += 25.0;
        else recommendations.add("Complete phone/location details in profile.");

        recommendations.add("Keep layout single-column to help scanners parse formatting.");
        return new AtsScoreResponse(score, analysis, recommendations);
    }

    // 3. AI Interview Question Generator
    public InterviewQuestionsResponse getInterviewQuestions(String seekerEmail, Long jobId) {
        User seeker = userRepository.findByEmail(seekerEmail)
                .orElseThrow(() -> new RuntimeException("Seeker profile not found"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job posting not found"));

        try {
            RestTemplate restTemplate = new RestTemplate();
            Map<String, String> payload = Map.of(
                    "candidate_skills", seeker.getSkills() != null ? seeker.getSkills() : "",
                    "job_title", job.getTitle() != null ? job.getTitle() : "Software Engineer",
                    "job_description", job.getDescription() != null ? job.getDescription() : ""
            );
            return restTemplate.postForObject(aiServiceUrl + "/interview-questions", payload, InterviewQuestionsResponse.class);
        } catch (Exception e) {
            System.err.println("Failed calling Flask interview-questions, triggering java fallback: " + e.getMessage());
            return getInterviewQuestionsFallback(job);
        }
    }

    private InterviewQuestionsResponse getInterviewQuestionsFallback(Job job) {
        List<String> hr = List.of(
                "Why do you want to join us as a " + job.getTitle() + "?",
                "Describe a project you coordinated under highly constrained release schedules."
        );
        List<String> tech = List.of(
                "Describe secure REST API design. How do you implement OAuth2 or throttling limits?",
                "What is the difference between monolithic structures and microservices? Highlight trade-offs."
        );
        List<String> project = List.of(
                "How do you address legacy code debt when tasked with implementing new micro-features?"
        );
        List<String> role = List.of(
                "How do you organize Git branches and automated pipelines to coordinate production deployments?"
        );
        return new InterviewQuestionsResponse(hr, tech, project, role);
    }

    public RoadmapResponse getRoadmap(String seekerEmail) {
        User seeker = userRepository.findByEmail(seekerEmail)
                .orElseThrow(() -> new RuntimeException("Seeker profile not found"));

        if (seeker.getCachedRoadmap() != null && !seeker.getCachedRoadmap().trim().isEmpty() && !seeker.getCachedRoadmap().equals("{}")) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                return mapper.readValue(seeker.getCachedRoadmap(), RoadmapResponse.class);
            } catch (Exception e) {
                System.err.println("Failed to read cached Roadmap, querying Flask: " + e.getMessage());
            }
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            Map<String, String> payload = Map.of(
                    "candidate_skills", seeker.getSkills() != null ? seeker.getSkills() : ""
            );
            return restTemplate.postForObject(aiServiceUrl + "/roadmap", payload, RoadmapResponse.class);
        } catch (Exception e) {
            System.err.println("Failed calling Flask roadmap, triggering java fallback: " + e.getMessage());
            return getRoadmapFallback(seeker);
        }
    }

    private RoadmapResponse getRoadmapFallback(User seeker) {
        List<String> curr = new ArrayList<>();
        if (seeker.getSkills() != null) {
            for (String s : seeker.getSkills().split(",")) {
                if (!s.trim().isEmpty()) curr.add(s.trim());
            }
        }
        
        List<String> recs = List.of("docker", "kubernetes", "system design", "ci/cd");
        
        List<RoadmapStep> steps = List.of(
                new RoadmapStep("Phase 1: Deep Containerization", "2-4 Weeks", 
                        "Docker, docker-compose, multi-stage builds", "Docker documentation guides", 
                        "Containerize your existing Spring Boot app."),
                new RoadmapStep("Phase 2: Automated Actions", "4-8 Weeks", 
                        "GitHub Actions, test workflows, deployments", "GitHub documentation tutorials", 
                        "Build an automated pipeline that checks compilation on push events.")
        );
        
        return new RoadmapResponse(curr, recs, steps);
    }

    // 5. Recruiter Analytics Dashboard
    public EmployerAnalyticsResponse getEmployerAnalytics(String employerEmail, Long jobId) {
        User employer = userRepository.findByEmail(employerEmail)
                .orElseThrow(() -> new RuntimeException("Employer not found"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getEmployer().getId().equals(employer.getId())) {
            throw new RuntimeException("Unauthorized: You do not own this job listing");
        }

        List<Application> apps = applicationRepository.findByJobOrderByMatchScoreDesc(job);

        int total = apps.size();
        int hired = 0;
        double sumScore = 0.0;
        int scoreCount = 0;

        Map<String, Long> statusMap = new HashMap<>();
        Map<String, Long> scoreDist = new HashMap<>();
        scoreDist.put("80-100", 0L);
        scoreDist.put("60-80", 0L);
        scoreDist.put("40-60", 0L);
        scoreDist.put("0-40", 0L);

        Map<String, Long> skillFreq = new HashMap<>();

        for (Application app : apps) {
            // Count status
            String status = app.getStatus().name();
            statusMap.put(status, statusMap.getOrDefault(status, 0L) + 1);
            if (app.getStatus() == Application.ApplicationStatus.HIRED) {
                hired++;
            }

            // Match score averages
            if (app.getMatchScore() != null) {
                double score = app.getMatchScore();
                sumScore += score;
                scoreCount++;

                // Score distributions
                if (score >= 80.0) scoreDist.put("80-100", scoreDist.get("80-100") + 1);
                else if (score >= 60.0) scoreDist.put("60-80", scoreDist.get("60-80") + 1);
                else if (score >= 40.0) scoreDist.put("40-60", scoreDist.get("40-60") + 1);
                else scoreDist.put("0-40", scoreDist.get("0-40") + 1);
            }

            // Skills frequencies
            User seeker = app.getSeeker();
            if (seeker.getSkills() != null) {
                String[] skills = seeker.getSkills().split(",");
                for (String sk : skills) {
                    String clean = sk.trim().toLowerCase();
                    if (!clean.isEmpty()) {
                        skillFreq.put(clean, skillFreq.getOrDefault(clean, 0L) + 1);
                    }
                }
            }
        }

        double avgScore = scoreCount == 0 ? 0.0 : Math.round((sumScore / scoreCount) * 10.0) / 10.0;

        // Custom Hiring Insights
        List<String> insights = new ArrayList<>();
        insights.add("Job post has attracted a total pool of " + total + " verified candidates.");
        if (total > 0) {
            insights.add("Hiring funnel status pipeline: " + statusMap.entrySet().stream()
                    .map(e -> e.getKey() + ": " + e.getValue()).collect(Collectors.joining(", ")));
            insights.add("Candidate pool average AI match score ranks at: " + avgScore + "%.");
            
            // Extract top skill
            Optional<Map.Entry<String, Long>> topSkill = skillFreq.entrySet().stream()
                    .max(Map.Entry.comparingByValue());
            if (topSkill.isPresent()) {
                insights.add("Most common technology keyword among applicant pools is: '" + topSkill.get().getKey().toUpperCase() + "' (" + topSkill.get().getValue() + " candidates).");
            }
            
            long highMatches = scoreDist.get("80-100");
            if (highMatches > 0) {
                insights.add("High relevance: There are " + highMatches + " candidates matching over 80% of job requirements.");
            } else {
                insights.add("Relevance status: No candidates currently exceed an 80% AI match rating. Consider reviewing skill modifiers.");
            }
        } else {
            insights.add("Await candidates applying to gather detailed structural recruitment audits.");
        }

        return new EmployerAnalyticsResponse(
                total, hired, avgScore, statusMap, scoreDist, skillFreq, insights
        );
    }

    // 6. Recalculate Seeker AI Cache
    public void recalculateSeekerAiCache(User seeker) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String skills = seeker.getSkills() != null ? seeker.getSkills() : "";
            String experience = seeker.getExperience() != null ? seeker.getExperience() : "";
            String education = seeker.getEducation() != null ? seeker.getEducation() : "";
            
            // 1. Recalculate ATS Score & Report
            Map<String, String> atsPayload = Map.of("skills", skills, "experience", experience, "education", education);
            AtsScoreResponse atsRes = restTemplate.postForObject(aiServiceUrl + "/ats-score", atsPayload, AtsScoreResponse.class);
            String atsReportJson = restTemplate.postForObject(aiServiceUrl + "/ats-score", atsPayload, String.class);
            
            // 2. Recalculate Career Roadmap
            Map<String, String> roadmapPayload = Map.of("candidate_skills", skills);
            String roadmapJson = restTemplate.postForObject(aiServiceUrl + "/roadmap", roadmapPayload, String.class);
            
            // Cache on seeker record
            seeker.setCachedAtsScore(atsRes != null ? atsRes.getAtsScore() : 0.0);
            seeker.setCachedAtsReport(atsReportJson);
            seeker.setCachedRoadmap(roadmapJson);
            userRepository.save(seeker);
            
            // 3. Recalculate application match scores in background
            List<Application> apps = applicationRepository.findBySeeker(seeker);
            for (Application app : apps) {
                Job job = app.getJob();
                Map<String, String> matchPayload = Map.of(
                        "candidate_skills", skills,
                        "job_description", job.getDescription() + " " + job.getSkills()
                );
                try {
                    Map matchRes = restTemplate.postForObject(aiServiceUrl + "/match", matchPayload, Map.class);
                    if (matchRes != null && matchRes.containsKey("score")) {
                        app.setMatchScore(((Number) matchRes.get("score")).doubleValue());
                        applicationRepository.save(app);
                    }
                } catch (Exception e) {
                    System.err.println("Failed recalculating match score for app: " + app.getId());
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to trigger dynamic AI recalculation: " + e.getMessage());
        }
    }

    // 7. Get Resume Versions List
    public List<ResumeVersionResponse> getResumeVersions(String seekerEmail) {
        User seeker = userRepository.findByEmail(seekerEmail).orElseThrow();
        List<ResumeVersion> versions = resumeVersionRepository.findByUserOrderByVersionDesc(seeker);
        return versions.stream().map(v -> new ResumeVersionResponse(
                v.getId(),
                v.getVersion(),
                v.getFileName(),
                v.getResumePath(),
                v.getSkills(),
                v.getAtsScore(),
                v.getAtsReportJson(),
                v.getRoadmapJson(),
                v.getUploadedAt() != null ? v.getUploadedAt().toString() : ""
        )).collect(Collectors.toList());
    }

    // 8. Restore Resume Version
    public void restoreResumeVersion(String seekerEmail, int versionVal) {
        User seeker = userRepository.findByEmail(seekerEmail).orElseThrow();
        ResumeVersion ver = resumeVersionRepository.findByUserAndVersion(seeker, versionVal)
                .orElseThrow(() -> new RuntimeException("Version not found"));
        
        seeker.setSkills(ver.getSkills());
        seeker.setExperience(ver.getExperience());
        seeker.setEducation(ver.getEducation());
        seeker.setResumePath(ver.getResumePath());
        
        // Cache these versioned AI results directly on Seeker profile
        seeker.setCachedAtsScore(ver.getAtsScore());
        seeker.setCachedAtsReport(ver.getAtsReportJson());
        seeker.setCachedRoadmap(ver.getRoadmapJson());
        
        userRepository.save(seeker);
        
        // Recalculate job matching scores for all applications using this restored version
        try {
            RestTemplate restTemplate = new RestTemplate();
            List<Application> apps = applicationRepository.findBySeeker(seeker);
            for (Application app : apps) {
                Job job = app.getJob();
                Map<String, String> matchPayload = Map.of(
                        "candidate_skills", seeker.getSkills() != null ? seeker.getSkills() : "",
                        "job_description", job.getDescription() + " " + job.getSkills()
                );
                Map matchRes = restTemplate.postForObject(aiServiceUrl + "/match", matchPayload, Map.class);
                if (matchRes != null && matchRes.containsKey("score")) {
                    app.setMatchScore(((Number) matchRes.get("score")).doubleValue());
                    applicationRepository.save(app);
                }
            }
        } catch (Exception e) {
            System.err.println("Restored match scores update failed: " + e.getMessage());
        }
    }

    // 9. Recruiter Candidate Insights
    public CandidateInsightsResponse getCandidateInsights(Long applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        User seeker = app.getSeeker();
        Job job = app.getJob();
        
        try {
            RestTemplate restTemplate = new RestTemplate();
            Map<String, String> payload = Map.of(
                    "candidate_skills", seeker.getSkills() != null ? seeker.getSkills() : "",
                    "experience", seeker.getExperience() != null ? seeker.getExperience() : "",
                    "job_skills", job.getSkills() != null ? job.getSkills() : "",
                    "job_description", job.getDescription() != null ? job.getDescription() : ""
            );
            CandidateInsightsResponse response = restTemplate.postForObject(aiServiceUrl + "/candidate-insights", payload, CandidateInsightsResponse.class);
            if (response != null) {
                if (seeker.getSeekerProfile() != null) {
                    seeker.getSeekerProfile().getId();
                }
                seeker.getCertifications().size();
                seeker.getProjects().size();
                seeker.getWorkExperiences().size();
                seeker.getInternships().size();
                seeker.getSeekerSkills().size();
                response.setCandidate(seeker);
            }
            return response;
        } catch (Exception e) {
            System.err.println("Failed calling Flask candidate-insights: " + e.getMessage());
            CandidateInsightsResponse response = new CandidateInsightsResponse(
                    List.of("Possesses technical skills in " + (seeker.getSkills() != null ? seeker.getSkills() : "development")),
                    List.of("Experience level in target stack requires validation"),
                    List.of("redis"),
                    app.getMatchScore() != null ? app.getMatchScore() : 50.0,
                    "Recommended: Standard applicant profile fits base job parameters."
            );
            if (seeker.getSeekerProfile() != null) {
                seeker.getSeekerProfile().getId();
            }
            seeker.getCertifications().size();
            seeker.getProjects().size();
            seeker.getWorkExperiences().size();
            seeker.getInternships().size();
            seeker.getSeekerSkills().size();
            response.setCandidate(seeker);
            return response;
        }
    }

    // 10. Job Description Optimizer
    public JobOptimizationResponse optimizeJobDescription(com.jobportal.dto.JobDTO.JobRequest request) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            Map<String, String> payload = Map.of(
                    "title", request.getTitle() != null ? request.getTitle() : "Software Engineer",
                    "skills", request.getSkills() != null ? request.getSkills() : "",
                    "description", request.getDescription() != null ? request.getDescription() : ""
            );
            return restTemplate.postForObject(aiServiceUrl + "/optimize-jd", payload, JobOptimizationResponse.class);
        } catch (Exception e) {
            System.err.println("Failed calling Flask optimize-jd: " + e.getMessage());
            return new JobOptimizationResponse(
                    "Role Overview:\nWe are seeking a candidate with: " + (request.getSkills() != null ? request.getSkills() : "modern frameworks"),
                    List.of("git", "testing")
            );
        }
    }
}
