package com.jobportal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String phone;
    private String location;
    private String profilePicture;

    private String skills;
    private String education;
    private String experience;
    private String resumePath;

    private Double cachedAtsScore;
    @Column(columnDefinition = "LONGTEXT")
    private String cachedAtsReport;
    @Column(columnDefinition = "LONGTEXT")
    private String cachedRoadmap;
    @Column(columnDefinition = "LONGTEXT")
    private String cachedGapAnalysis;

    private String companyName;
    private String companyDescription;
    private String companyWebsite;
    private String industry;

    @Column(nullable = false)
    private boolean enabled = true;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private SeekerProfile seekerProfile;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Certification> certifications = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Project> projects = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<WorkExperience> workExperiences = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Internship> internships = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SeekerSkill> seekerSkills = new ArrayList<>();

    @OneToMany(mappedBy = "seeker", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SavedJob> savedJobs = new ArrayList<>();

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum Role { ROLE_SEEKER, ROLE_EMPLOYER, ROLE_ADMIN }

    public User() {}

    // Getters
    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public Role getRole() { return role; }
    public String getPhone() { return phone; }
    public String getLocation() { return location; }
    public String getProfilePicture() { return profilePicture; }
    public String getSkills() { return skills; }
    public String getEducation() { return education; }
    public String getExperience() { return experience; }
    public String getResumePath() { return resumePath; }
    public Double getCachedAtsScore() { return cachedAtsScore; }
    public String getCachedAtsReport() { return cachedAtsReport; }
    public String getCachedRoadmap() { return cachedRoadmap; }
    public String getCachedGapAnalysis() { return cachedGapAnalysis; }
    public String getCompanyName() { return companyName; }
    public String getCompanyDescription() { return companyDescription; }
    public String getCompanyWebsite() { return companyWebsite; }
    public String getIndustry() { return industry; }
    public boolean isEnabled() { return enabled; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public SeekerProfile getSeekerProfile() { return seekerProfile; }
    public List<Certification> getCertifications() { return certifications; }
    public List<Project> getProjects() { return projects; }
    public List<WorkExperience> getWorkExperiences() { return workExperiences; }
    public List<Internship> getInternships() { return internships; }
    public List<SeekerSkill> getSeekerSkills() { return seekerSkills; }
    public List<SavedJob> getSavedJobs() { return savedJobs; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setFullName(String v) { this.fullName = v; }
    public void setEmail(String v) { this.email = v; }
    public void setPassword(String v) { this.password = v; }
    public void setRole(Role v) { this.role = v; }
    public void setPhone(String v) { this.phone = v; }
    public void setLocation(String v) { this.location = v; }
    public void setProfilePicture(String v) { this.profilePicture = v; }
    public void setSkills(String v) { this.skills = v; }
    public void setEducation(String v) { this.education = v; }
    public void setExperience(String v) { this.experience = v; }
    public void setResumePath(String v) { this.resumePath = v; }
    public void setCachedAtsScore(Double v) { this.cachedAtsScore = v; }
    public void setCachedAtsReport(String v) { this.cachedAtsReport = v; }
    public void setCachedRoadmap(String v) { this.cachedRoadmap = v; }
    public void setCachedGapAnalysis(String v) { this.cachedGapAnalysis = v; }
    public void setCompanyName(String v) { this.companyName = v; }
    public void setCompanyDescription(String v) { this.companyDescription = v; }
    public void setCompanyWebsite(String v) { this.companyWebsite = v; }
    public void setIndustry(String v) { this.industry = v; }
    public void setEnabled(boolean v) { this.enabled = v; }

    public void setSeekerProfile(SeekerProfile v) { this.seekerProfile = v; }
    public void setCertifications(List<Certification> v) { this.certifications = v; }
    public void setProjects(List<Project> v) { this.projects = v; }
    public void setWorkExperiences(List<WorkExperience> v) { this.workExperiences = v; }
    public void setInternships(List<Internship> v) { this.internships = v; }
    public void setSeekerSkills(List<SeekerSkill> v) { this.seekerSkills = v; }
    public void setSavedJobs(List<SavedJob> v) { this.savedJobs = v; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final User u = new User();
        public Builder fullName(String v) { u.fullName = v; return this; }
        public Builder email(String v) { u.email = v; return this; }
        public Builder password(String v) { u.password = v; return this; }
        public Builder role(Role v) { u.role = v; return this; }
        public Builder phone(String v) { u.phone = v; return this; }
        public Builder companyName(String v) { u.companyName = v; return this; }
        public Builder skills(String v) { u.skills = v; return this; }
        public Builder enabled(boolean v) { u.enabled = v; return this; }
        public User build() { return u; }
    }
}
