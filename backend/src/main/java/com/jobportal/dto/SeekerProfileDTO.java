package com.jobportal.dto;

import java.util.Map;
import java.util.List;

public class SeekerProfileDTO {

    public static class SeekerProfileRequest {
        private String gender;
        private String dateOfBirth;
        private String currentAddress;
        private String preferredLocation;
        private String nationality;

        // Professional Links
        private String linkedinUrl;
        private String githubUrl;
        private String portfolioUrl;
        private String leetcodeUrl;
        private String hackerrankUrl;
        private String codechefUrl;
        private String otherProfessionalLinks;

        // 10th Details
        private String tenthSchoolName;
        private String tenthBoard;
        private Integer tenthYear;
        private Double tenthPercentage;

        // 12th / Diploma Details
        private String twelfthInstitution;
        private String twelfthBoard;
        private Integer twelfthYear;
        private Double twelfthPercentage;

        // Graduation Details
        private String gradCollege;
        private String gradUniversity;
        private String gradDegree;
        private String gradBranch;
        private String gradStartDate;
        private String gradEndDate;
        private Double gradCgpa;

        // Post Graduation Details
        private String pgCollege;
        private String pgUniversity;
        private String pgDegree;
        private String pgBranch;
        private String pgStartDate;
        private String pgEndDate;
        private Double pgCgpa;

        // Job Preferences
        private String preferredRole;
        private String preferredLocationPref;
        private Double expectedSalary;
        private String employmentType;
        private String workMode;

        // Profile Privacy
        private boolean resumeVisibility = true;
        private boolean contactVisibility = true;
        private boolean profileVisibility = true;

        public SeekerProfileRequest() {}

        public String getGender() { return gender; }
        public void setGender(String v) { this.gender = v; }

        public String getDateOfBirth() { return dateOfBirth; }
        public void setDateOfBirth(String v) { this.dateOfBirth = v; }

        public String getCurrentAddress() { return currentAddress; }
        public void setCurrentAddress(String v) { this.currentAddress = v; }

        public String getPreferredLocation() { return preferredLocation; }
        public void setPreferredLocation(String v) { this.preferredLocation = v; }

        public String getNationality() { return nationality; }
        public void setNationality(String v) { this.nationality = v; }

        public String getLinkedinUrl() { return linkedinUrl; }
        public void setLinkedinUrl(String v) { this.linkedinUrl = v; }

        public String getGithubUrl() { return githubUrl; }
        public void setGithubUrl(String v) { this.githubUrl = v; }

        public String getPortfolioUrl() { return portfolioUrl; }
        public void setPortfolioUrl(String v) { this.portfolioUrl = v; }

        public String getLeetcodeUrl() { return leetcodeUrl; }
        public void setLeetcodeUrl(String v) { this.leetcodeUrl = v; }

        public String getHackerrankUrl() { return hackerrankUrl; }
        public void setHackerrankUrl(String v) { this.hackerrankUrl = v; }

        public String getCodechefUrl() { return codechefUrl; }
        public void setCodechefUrl(String v) { this.codechefUrl = v; }

        public String getOtherProfessionalLinks() { return otherProfessionalLinks; }
        public void setOtherProfessionalLinks(String v) { this.otherProfessionalLinks = v; }

        public String getTenthSchoolName() { return tenthSchoolName; }
        public void setTenthSchoolName(String v) { this.tenthSchoolName = v; }

        public String getTenthBoard() { return tenthBoard; }
        public void setTenthBoard(String v) { this.tenthBoard = v; }

        public Integer getTenthYear() { return tenthYear; }
        public void setTenthYear(Integer v) { this.tenthYear = v; }

        public Double getTenthPercentage() { return tenthPercentage; }
        public void setTenthPercentage(Double v) { this.tenthPercentage = v; }

        public String getTwelfthInstitution() { return twelfthInstitution; }
        public void setTwelfthInstitution(String v) { this.twelfthInstitution = v; }

        public String getTwelfthBoard() { return twelfthBoard; }
        public void setTwelfthBoard(String v) { this.twelfthBoard = v; }

        public Integer getTwelfthYear() { return twelfthYear; }
        public void setTwelfthYear(Integer v) { this.twelfthYear = v; }

        public Double getTwelfthPercentage() { return twelfthPercentage; }
        public void setTwelfthPercentage(Double v) { this.twelfthPercentage = v; }

        public String getGradCollege() { return gradCollege; }
        public void setGradCollege(String v) { this.gradCollege = v; }

        public String getGradUniversity() { return gradUniversity; }
        public void setGradUniversity(String v) { this.gradUniversity = v; }

        public String getGradDegree() { return gradDegree; }
        public void setGradDegree(String v) { this.gradDegree = v; }

        public String getGradBranch() { return gradBranch; }
        public void setGradBranch(String v) { this.gradBranch = v; }

        public String getGradStartDate() { return gradStartDate; }
        public void setGradStartDate(String v) { this.gradStartDate = v; }

        public String getGradEndDate() { return gradEndDate; }
        public void setGradEndDate(String v) { this.gradEndDate = v; }

        public Double getGradCgpa() { return gradCgpa; }
        public void setGradCgpa(Double v) { this.gradCgpa = v; }

        public String getPgCollege() { return pgCollege; }
        public void setPgCollege(String v) { this.pgCollege = v; }

        public String getPgUniversity() { return pgUniversity; }
        public void setPgUniversity(String v) { this.pgUniversity = v; }

        public String getPgDegree() { return pgDegree; }
        public void setPgDegree(String v) { this.pgDegree = v; }

        public String getPgBranch() { return pgBranch; }
        public void setPgBranch(String v) { this.pgBranch = v; }

        public String getPgStartDate() { return pgStartDate; }
        public void setPgStartDate(String v) { this.pgStartDate = v; }

        public String getPgEndDate() { return pgEndDate; }
        public void setPgEndDate(String v) { this.pgEndDate = v; }

        public Double getPgCgpa() { return pgCgpa; }
        public void setPgCgpa(Double v) { this.pgCgpa = v; }

        public String getPreferredRole() { return preferredRole; }
        public void setPreferredRole(String v) { this.preferredRole = v; }

        public String getPreferredLocationPref() { return preferredLocationPref; }
        public void setPreferredLocationPref(String v) { this.preferredLocationPref = v; }

        public Double getExpectedSalary() { return expectedSalary; }
        public void setExpectedSalary(Double v) { this.expectedSalary = v; }

        public String getEmploymentType() { return employmentType; }
        public void setEmploymentType(String v) { this.employmentType = v; }

        public String getWorkMode() { return workMode; }
        public void setWorkMode(String v) { this.workMode = v; }

        public boolean isResumeVisibility() { return resumeVisibility; }
        public void setResumeVisibility(boolean v) { this.resumeVisibility = v; }

        public boolean isContactVisibility() { return contactVisibility; }
        public void setContactVisibility(boolean v) { this.contactVisibility = v; }

        public boolean isProfileVisibility() { return profileVisibility; }
        public void setProfileVisibility(boolean v) { this.profileVisibility = v; }
    }

    public static class SeekerSkillRequest {
        private String skillName;
        private String skillType;
        private String proficiencyLevel;

        public SeekerSkillRequest() {}

        public String getSkillName() { return skillName; }
        public void setSkillName(String v) { this.skillName = v; }

        public String getSkillType() { return skillType; }
        public void setSkillType(String v) { this.skillType = v; }

        public String getProficiencyLevel() { return proficiencyLevel; }
        public void setProficiencyLevel(String v) { this.proficiencyLevel = v; }
    }

    public static class CertificationRequest {
        private String certificateName;
        private String organization;
        private String issueDate;
        private String expiryDate;
        private String credentialId;
        private String verificationLink;

        public CertificationRequest() {}

        public String getCertificateName() { return certificateName; }
        public void setCertificateName(String v) { this.certificateName = v; }

        public String getOrganization() { return organization; }
        public void setOrganization(String v) { this.organization = v; }

        public String getIssueDate() { return issueDate; }
        public void setIssueDate(String v) { this.issueDate = v; }

        public String getExpiryDate() { return expiryDate; }
        public void setExpiryDate(String v) { this.expiryDate = v; }

        public String getCredentialId() { return credentialId; }
        public void setCredentialId(String v) { this.credentialId = v; }

        public String getVerificationLink() { return verificationLink; }
        public void setVerificationLink(String v) { this.verificationLink = v; }
    }

    public static class ProjectRequest {
        private String projectTitle;
        private String description;
        private String technologiesUsed;
        private String githubLink;
        private String liveDemoLink;
        private String duration;
        private Integer teamSize;
        private String role;

        public ProjectRequest() {}

        public String getProjectTitle() { return projectTitle; }
        public void setProjectTitle(String v) { this.projectTitle = v; }

        public String getDescription() { return description; }
        public void setDescription(String v) { this.description = v; }

        public String getTechnologiesUsed() { return technologiesUsed; }
        public void setTechnologiesUsed(String v) { this.technologiesUsed = v; }

        public String getGithubLink() { return githubLink; }
        public void setGithubLink(String v) { this.githubLink = v; }

        public String getLiveDemoLink() { return liveDemoLink; }
        public void setLiveDemoLink(String v) { this.liveDemoLink = v; }

        public String getDuration() { return duration; }
        public void setDuration(String v) { this.duration = v; }

        public Integer getTeamSize() { return teamSize; }
        public void setTeamSize(Integer v) { this.teamSize = v; }

        public String getRole() { return role; }
        public void setRole(String v) { this.role = v; }
    }

    public static class WorkExperienceRequest {
        private String companyName;
        private String designation;
        private String employmentType;
        private String startDate;
        private String endDate;
        private boolean currentWorkingStatus;
        private String responsibilities;
        private String technologiesUsed;

        public WorkExperienceRequest() {}

        public String getCompanyName() { return companyName; }
        public void setCompanyName(String v) { this.companyName = v; }

        public String getDesignation() { return designation; }
        public void setDesignation(String v) { this.designation = v; }

        public String getEmploymentType() { return employmentType; }
        public void setEmploymentType(String v) { this.employmentType = v; }

        public String getStartDate() { return startDate; }
        public void setStartDate(String v) { this.startDate = v; }

        public String getEndDate() { return endDate; }
        public void setEndDate(String v) { this.endDate = v; }

        public boolean isCurrentWorkingStatus() { return currentWorkingStatus; }
        public void setCurrentWorkingStatus(boolean v) { this.currentWorkingStatus = v; }

        public String getResponsibilities() { return responsibilities; }
        public void setResponsibilities(String v) { this.responsibilities = v; }

        public String getTechnologiesUsed() { return technologiesUsed; }
        public void setTechnologiesUsed(String v) { this.technologiesUsed = v; }
    }

    public static class InternshipRequest {
        private String organization;
        private String role;
        private String duration;
        private String skillsLearned;
        private String certificate;

        public InternshipRequest() {}

        public String getOrganization() { return organization; }
        public void setOrganization(String v) { this.organization = v; }

        public String getRole() { return role; }
        public void setRole(String v) { this.role = v; }

        public String getDuration() { return duration; }
        public void setDuration(String v) { this.duration = v; }

        public String getSkillsLearned() { return skillsLearned; }
        public void setSkillsLearned(String v) { this.skillsLearned = v; }

        public String getCertificate() { return certificate; }
        public void setCertificate(String v) { this.certificate = v; }
    }

    public static class ProfileCompletionResponse {
        private int percentage;
        private Map<String, Boolean> checklist;

        public ProfileCompletionResponse() {}
        public ProfileCompletionResponse(int percentage, Map<String, Boolean> checklist) {
            this.percentage = percentage;
            this.checklist = checklist;
        }

        public int getPercentage() { return percentage; }
        public void setPercentage(int v) { this.percentage = v; }

        public Map<String, Boolean> getChecklist() { return checklist; }
        public void setChecklist(Map<String, Boolean> v) { this.checklist = v; }
    }

    public static class SeekerAnalyticsResponse {
        private int submitted;
        private int shortlisted;
        private int rejected;
        private int interviews;
        private double successRate;

        public SeekerAnalyticsResponse() {}
        public SeekerAnalyticsResponse(int submitted, int shortlisted, int rejected, int interviews, double successRate) {
            this.submitted = submitted;
            this.shortlisted = shortlisted;
            this.rejected = rejected;
            this.interviews = interviews;
            this.successRate = successRate;
        }

        public int getSubmitted() { return submitted; }
        public void setSubmitted(int v) { this.submitted = v; }

        public int getShortlisted() { return shortlisted; }
        public void setShortlisted(int v) { this.shortlisted = v; }

        public int getRejected() { return rejected; }
        public void setRejected(int v) { this.rejected = v; }

        public int getInterviews() { return interviews; }
        public void setInterviews(int v) { this.interviews = v; }

        public double getSuccessRate() { return successRate; }
        public void setSuccessRate(double v) { this.successRate = v; }
    }
}
