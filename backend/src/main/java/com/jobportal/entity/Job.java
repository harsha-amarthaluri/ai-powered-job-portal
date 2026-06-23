package com.jobportal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String location;

    private String salary;
    private String jobType;
    private String experience;
    private String skills;
    private String category;

    @Enumerated(EnumType.STRING)
    private JobStatus status = JobStatus.OPEN;

    private boolean approved = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    private User employer;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Application> applications;

    private int viewCount = 0;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum JobStatus { OPEN, CLOSED, DRAFT }

    public Job() {}

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
    public JobStatus getStatus() { return status; }
    public boolean isApproved() { return approved; }
    public User getEmployer() { return employer; }
    public List<Application> getApplications() { return applications; }
    public int getViewCount() { return viewCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setId(Long v) { this.id = v; }
    public void setTitle(String v) { this.title = v; }
    public void setDescription(String v) { this.description = v; }
    public void setCompany(String v) { this.company = v; }
    public void setLocation(String v) { this.location = v; }
    public void setSalary(String v) { this.salary = v; }
    public void setJobType(String v) { this.jobType = v; }
    public void setExperience(String v) { this.experience = v; }
    public void setSkills(String v) { this.skills = v; }
    public void setCategory(String v) { this.category = v; }
    public void setStatus(JobStatus v) { this.status = v; }
    public void setApproved(boolean v) { this.approved = v; }
    public void setEmployer(User v) { this.employer = v; }
    public void setApplications(List<Application> v) { this.applications = v; }
    public void setViewCount(int v) { this.viewCount = v; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Job j = new Job();
        public Builder title(String v) { j.title = v; return this; }
        public Builder description(String v) { j.description = v; return this; }
        public Builder company(String v) { j.company = v; return this; }
        public Builder location(String v) { j.location = v; return this; }
        public Builder salary(String v) { j.salary = v; return this; }
        public Builder jobType(String v) { j.jobType = v; return this; }
        public Builder experience(String v) { j.experience = v; return this; }
        public Builder skills(String v) { j.skills = v; return this; }
        public Builder category(String v) { j.category = v; return this; }
        public Builder employer(User v) { j.employer = v; return this; }
        public Builder approved(boolean v) { j.approved = v; return this; }
        public Builder status(JobStatus v) { j.status = v; return this; }
        public Job build() { return j; }
    }
}
