package com.jobportal.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class RecruiterDTO {

    public static class RecruiterNoteRequest {
        private String stage;
        private String content;
        private Integer rating;
        private String interviewComments;

        public RecruiterNoteRequest() {}

        public String getStage() { return stage; }
        public void setStage(String stage) { this.stage = stage; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }

        public String getInterviewComments() { return interviewComments; }
        public void setInterviewComments(String interviewComments) { this.interviewComments = interviewComments; }
    }

    public static class RecruiterNoteResponse {
        private Long id;
        private String authorEmail;
        private String stage;
        private String content;
        private Integer rating;
        private String interviewComments;
        private LocalDateTime createdAt;

        public RecruiterNoteResponse() {}

        public RecruiterNoteResponse(Long id, String authorEmail, String stage, String content, Integer rating, String interviewComments, LocalDateTime createdAt) {
            this.id = id;
            this.authorEmail = authorEmail;
            this.stage = stage;
            this.content = content;
            this.rating = rating;
            this.interviewComments = interviewComments;
            this.createdAt = createdAt;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getAuthorEmail() { return authorEmail; }
        public void setAuthorEmail(String authorEmail) { this.authorEmail = authorEmail; }

        public String getStage() { return stage; }
        public void setStage(String stage) { this.stage = stage; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }

        public String getInterviewComments() { return interviewComments; }
        public void setInterviewComments(String interviewComments) { this.interviewComments = interviewComments; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class ApplicationHistoryResponse {
        private Long id;
        private String status;
        private String note;
        private String updatedBy;
        private LocalDateTime updatedAt;

        public ApplicationHistoryResponse() {}

        public ApplicationHistoryResponse(Long id, String status, String note, String updatedBy, LocalDateTime updatedAt) {
            this.id = id;
            this.status = status;
            this.note = note;
            this.updatedBy = updatedBy;
            this.updatedAt = updatedAt;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }

        public String getUpdatedBy() { return updatedBy; }
        public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }

        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class TimelineNode {
        private String type; // PROFILE_CREATED, RESUME_UPLOADED, RESUME_UPDATED, APPLICATION_SUBMITTED, STATUS_CHANGED, INTERVIEW_SCHEDULED
        private String title;
        private String description;
        private LocalDateTime timestamp;

        public TimelineNode() {}

        public TimelineNode(String type, String title, String description, LocalDateTime timestamp) {
            this.type = type;
            this.title = title;
            this.description = description;
            this.timestamp = timestamp;
        }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    }

    public static class ComparisonRequest {
        private List<Long> applicantIds;

        public ComparisonRequest() {}

        public List<Long> getApplicantIds() { return applicantIds; }
        public void setApplicantIds(List<Long> applicantIds) { this.applicantIds = applicantIds; }
    }

    public static class ComparisonResponse {
        private Long applicantId;
        private String name;
        private String email;
        private String skills;
        private Double matchScore;
        private Double atsScore;
        private String experienceSummary;
        private String educationSummary;
        private List<String> strengths;
        private List<String> weaknesses;

        public ComparisonResponse() {}

        public Long getApplicantId() { return applicantId; }
        public void setApplicantId(Long applicantId) { this.applicantId = applicantId; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getSkills() { return skills; }
        public void setSkills(String skills) { this.skills = skills; }

        public Double getMatchScore() { return matchScore; }
        public void setMatchScore(Double matchScore) { this.matchScore = matchScore; }

        public Double getAtsScore() { return atsScore; }
        public void setAtsScore(Double atsScore) { this.atsScore = atsScore; }

        public String getExperienceSummary() { return experienceSummary; }
        public void setExperienceSummary(String experienceSummary) { this.experienceSummary = experienceSummary; }

        public String getEducationSummary() { return educationSummary; }
        public void setEducationSummary(String educationSummary) { this.educationSummary = educationSummary; }

        public List<String> getStrengths() { return strengths; }
        public void setStrengths(List<String> strengths) { this.strengths = strengths; }

        public List<String> getWeaknesses() { return weaknesses; }
        public void setWeaknesses(List<String> weaknesses) { this.weaknesses = weaknesses; }
    }

    public static class JobPerformanceResponse {
        private int views;
        private int applications;
        private double conversionRate;
        private double averageMatchScore;
        private Map<String, Long> scoreDistribution;
        private List<String> topSkills;
        private Map<String, Long> candidateDistribution;

        public JobPerformanceResponse() {}

        public JobPerformanceResponse(int views, int applications, double conversionRate, double averageMatchScore, Map<String, Long> scoreDistribution, List<String> topSkills, Map<String, Long> candidateDistribution) {
            this.views = views;
            this.applications = applications;
            this.conversionRate = conversionRate;
            this.averageMatchScore = averageMatchScore;
            this.scoreDistribution = scoreDistribution;
            this.topSkills = topSkills;
            this.candidateDistribution = candidateDistribution;
        }

        public int getViews() { return views; }
        public void setViews(int views) { this.views = views; }

        public int getApplications() { return applications; }
        public void setApplications(int applications) { this.applications = applications; }

        public double getConversionRate() { return conversionRate; }
        public void setConversionRate(double conversionRate) { this.conversionRate = conversionRate; }

        public double getAverageMatchScore() { return averageMatchScore; }
        public void setAverageMatchScore(double averageMatchScore) { this.averageMatchScore = averageMatchScore; }

        public Map<String, Long> getScoreDistribution() { return scoreDistribution; }
        public void setScoreDistribution(Map<String, Long> scoreDistribution) { this.scoreDistribution = scoreDistribution; }

        public List<String> getTopSkills() { return topSkills; }
        public void setTopSkills(List<String> topSkills) { this.topSkills = topSkills; }

        public Map<String, Long> getCandidateDistribution() { return candidateDistribution; }
        public void setCandidateDistribution(Map<String, Long> candidateDistribution) { this.candidateDistribution = candidateDistribution; }
    }
}
