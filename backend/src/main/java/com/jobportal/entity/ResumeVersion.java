package com.jobportal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resume_versions")
public class ResumeVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private int version;
    private String resumePath;
    private String fileName;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(columnDefinition = "TEXT")
    private String education;

    @Column(columnDefinition = "TEXT")
    private String experience;

    private Double atsScore;

    @Column(columnDefinition = "LONGTEXT")
    private String atsReportJson;

    @Column(columnDefinition = "LONGTEXT")
    private String roadmapJson;

    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() { uploadedAt = LocalDateTime.now(); }

    public ResumeVersion() {}

    public ResumeVersion(User user, int version, String resumePath, String fileName, String skills, String education, String experience, Double atsScore, String atsReportJson, String roadmapJson) {
        this.user = user;
        this.version = version;
        this.resumePath = resumePath;
        this.fileName = fileName;
        this.skills = skills;
        this.education = education;
        this.experience = experience;
        this.atsScore = atsScore;
        this.atsReportJson = atsReportJson;
        this.roadmapJson = roadmapJson;
    }

    // Getters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public int getVersion() { return version; }
    public String getResumePath() { return resumePath; }
    public String getFileName() { return fileName; }
    public String getSkills() { return skills; }
    public String getEducation() { return education; }
    public String getExperience() { return experience; }
    public Double getAtsScore() { return atsScore; }
    public String getAtsReportJson() { return atsReportJson; }
    public String getRoadmapJson() { return roadmapJson; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setVersion(int version) { this.version = version; }
    public void setResumePath(String resumePath) { this.resumePath = resumePath; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public void setSkills(String skills) { this.skills = skills; }
    public void setEducation(String education) { this.education = education; }
    public void setExperience(String experience) { this.experience = experience; }
    public void setAtsScore(Double atsScore) { this.atsScore = atsScore; }
    public void setAtsReportJson(String atsReportJson) { this.atsReportJson = atsReportJson; }
    public void setRoadmapJson(String roadmapJson) { this.roadmapJson = roadmapJson; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
