package com.jobportal.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Entity
@Table(name = "recruiter_notes")
public class RecruiterNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    @JsonIgnore
    private Application application;

    @Column(nullable = false)
    private String authorEmail;

    private String stage;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Integer rating; // 1-5 stars

    @Column(columnDefinition = "TEXT")
    private String interviewComments;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public RecruiterNote() {}

    public RecruiterNote(Application application, String authorEmail, String stage, String content, Integer rating, String interviewComments) {
        this.application = application;
        this.authorEmail = authorEmail;
        this.stage = stage;
        this.content = content;
        this.rating = rating;
        this.interviewComments = interviewComments;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Application getApplication() { return application; }
    public void setApplication(Application application) { this.application = application; }

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
