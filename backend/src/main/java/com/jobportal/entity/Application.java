package com.jobportal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seeker_id", nullable = false)
    private User seeker;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    private String coverLetter;
    private String resumePath;
    private Double matchScore;
    private String employerNote;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ApplicationHistory> histories = new ArrayList<>();

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<RecruiterNote> notes = new ArrayList<>();

    @Column(updatable = false)
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { appliedAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum ApplicationStatus {
        APPLIED,
        VIEWED,
        SCREENING,
        SHORTLISTED,
        INTERVIEW_SCHEDULED,
        TECHNICAL_ROUND,
        HR_ROUND,
        SELECTED,
        REJECTED,
        HIRED
    }

    public Application() {}

    public Long getId() { return id; }
    public Job getJob() { return job; }
    public User getSeeker() { return seeker; }
    public ApplicationStatus getStatus() { return status; }
    public String getCoverLetter() { return coverLetter; }
    public String getResumePath() { return resumePath; }
    public Double getMatchScore() { return matchScore; }
    public String getEmployerNote() { return employerNote; }
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setId(Long v) { this.id = v; }
    public void setJob(Job v) { this.job = v; }
    public void setSeeker(User v) { this.seeker = v; }
    public void setStatus(ApplicationStatus v) { this.status = v; }
    public void setCoverLetter(String v) { this.coverLetter = v; }
    public void setResumePath(String v) { this.resumePath = v; }
    public void setMatchScore(Double v) { this.matchScore = v; }
    public void setEmployerNote(String v) { this.employerNote = v; }

    public List<ApplicationHistory> getHistories() { return histories; }
    public void setHistories(List<ApplicationHistory> histories) { this.histories = histories; }

    public List<RecruiterNote> getNotes() { return notes; }
    public void setNotes(List<RecruiterNote> notes) { this.notes = notes; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Application a = new Application();
        public Builder job(Job v) { a.job = v; return this; }
        public Builder seeker(User v) { a.seeker = v; return this; }
        public Builder coverLetter(String v) { a.coverLetter = v; return this; }
        public Builder resumePath(String v) { a.resumePath = v; return this; }
        public Builder matchScore(Double v) { a.matchScore = v; return this; }
        public Builder status(ApplicationStatus v) { a.status = v; return this; }
        public Application build() { return a; }
    }
}
