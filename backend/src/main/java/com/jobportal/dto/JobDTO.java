package com.jobportal.dto;

import com.jobportal.entity.Application;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class JobDTO {

    public static class JobRequest {
        @NotBlank private String title;
        @NotBlank private String description;
        @NotBlank private String location;
        private String salary, jobType, experience, skills, category;

        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public String getLocation() { return location; }
        public String getSalary() { return salary; }
        public String getJobType() { return jobType; }
        public String getExperience() { return experience; }
        public String getSkills() { return skills; }
        public String getCategory() { return category; }
        public void setTitle(String v) { this.title = v; }
        public void setDescription(String v) { this.description = v; }
        public void setLocation(String v) { this.location = v; }
        public void setSalary(String v) { this.salary = v; }
        public void setJobType(String v) { this.jobType = v; }
        public void setExperience(String v) { this.experience = v; }
        public void setSkills(String v) { this.skills = v; }
        public void setCategory(String v) { this.category = v; }
    }

    public static class JobResponse {
        private Long id;
        private String title, description, company, location, salary, jobType, experience, skills, category, status, employerName;
        private boolean approved;
        private Long employerId;
        private int applicationCount, viewCount;
        private LocalDateTime createdAt;
        private Double matchScore;

        public JobResponse() {}

        public Long getId() { return id; }
        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public String getCompany() { return company; }
        public String getLocation() { return location; }
        public String getSalary() { return salary; }
        public String getJobType() { return jobType; }
        public String getExperience() { return experience; }
        public String getSkills() { return skills; }
        public String getCategory() { return category; }
        public String getStatus() { return status; }
        public boolean isApproved() { return approved; }
        public Long getEmployerId() { return employerId; }
        public String getEmployerName() { return employerName; }
        public int getApplicationCount() { return applicationCount; }
        public int getViewCount() { return viewCount; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public Double getMatchScore() { return matchScore; }
        public void setMatchScore(Double v) { this.matchScore = v; }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private final JobResponse r = new JobResponse();
            public Builder id(Long v) { r.id = v; return this; }
            public Builder title(String v) { r.title = v; return this; }
            public Builder description(String v) { r.description = v; return this; }
            public Builder company(String v) { r.company = v; return this; }
            public Builder location(String v) { r.location = v; return this; }
            public Builder salary(String v) { r.salary = v; return this; }
            public Builder jobType(String v) { r.jobType = v; return this; }
            public Builder experience(String v) { r.experience = v; return this; }
            public Builder skills(String v) { r.skills = v; return this; }
            public Builder category(String v) { r.category = v; return this; }
            public Builder status(String v) { r.status = v; return this; }
            public Builder approved(boolean v) { r.approved = v; return this; }
            public Builder employerId(Long v) { r.employerId = v; return this; }
            public Builder employerName(String v) { r.employerName = v; return this; }
            public Builder applicationCount(int v) { r.applicationCount = v; return this; }
            public Builder viewCount(int v) { r.viewCount = v; return this; }
            public Builder createdAt(LocalDateTime v) { r.createdAt = v; return this; }
            public Builder matchScore(Double v) { r.matchScore = v; return this; }
            public JobResponse build() { return r; }
        }
    }

    public static class ApplicationRequest {
        private String coverLetter;
        public String getCoverLetter() { return coverLetter; }
        public void setCoverLetter(String v) { this.coverLetter = v; }
    }

    public static class ApplicationResponse {
        private Long id, jobId, seekerId;
        private String jobTitle, company, location, seekerName, seekerEmail, seekerSkills;
        private String resumePath, coverLetter, status, employerNote;
        private Double matchScore;
        private LocalDateTime appliedAt;

        public ApplicationResponse() {}

        public Long getId() { return id; }
        public Long getJobId() { return jobId; }
        public String getJobTitle() { return jobTitle; }
        public String getCompany() { return company; }
        public String getLocation() { return location; }
        public Long getSeekerId() { return seekerId; }
        public String getSeekerName() { return seekerName; }
        public String getSeekerEmail() { return seekerEmail; }
        public String getSeekerSkills() { return seekerSkills; }
        public String getResumePath() { return resumePath; }
        public String getCoverLetter() { return coverLetter; }
        public String getStatus() { return status; }
        public Double getMatchScore() { return matchScore; }
        public String getEmployerNote() { return employerNote; }
        public LocalDateTime getAppliedAt() { return appliedAt; }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private final ApplicationResponse r = new ApplicationResponse();
            public Builder id(Long v) { r.id = v; return this; }
            public Builder jobId(Long v) { r.jobId = v; return this; }
            public Builder jobTitle(String v) { r.jobTitle = v; return this; }
            public Builder company(String v) { r.company = v; return this; }
            public Builder location(String v) { r.location = v; return this; }
            public Builder seekerId(Long v) { r.seekerId = v; return this; }
            public Builder seekerName(String v) { r.seekerName = v; return this; }
            public Builder seekerEmail(String v) { r.seekerEmail = v; return this; }
            public Builder seekerSkills(String v) { r.seekerSkills = v; return this; }
            public Builder resumePath(String v) { r.resumePath = v; return this; }
            public Builder coverLetter(String v) { r.coverLetter = v; return this; }
            public Builder status(String v) { r.status = v; return this; }
            public Builder matchScore(Double v) { r.matchScore = v; return this; }
            public Builder employerNote(String v) { r.employerNote = v; return this; }
            public Builder appliedAt(LocalDateTime v) { r.appliedAt = v; return this; }
            public ApplicationResponse build() { return r; }
        }
    }

    public static class StatusUpdateRequest {
        private Application.ApplicationStatus status;
        private String employerNote;
        public Application.ApplicationStatus getStatus() { return status; }
        public String getEmployerNote() { return employerNote; }
        public void setStatus(Application.ApplicationStatus v) { this.status = v; }
        public void setEmployerNote(String v) { this.employerNote = v; }
    }
}
