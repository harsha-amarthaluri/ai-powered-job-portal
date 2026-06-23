package com.jobportal.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "seeker_profiles")
public class SeekerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

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

    // Post Graduation Details (Optional)
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
    private String workMode = "Onsite"; // Remote, Hybrid, Onsite

    // Profile Privacy
    private boolean resumeVisibility = true;
    private boolean contactVisibility = true;
    private boolean profileVisibility = true;

    public SeekerProfile() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getCurrentAddress() { return currentAddress; }
    public void setCurrentAddress(String currentAddress) { this.currentAddress = currentAddress; }

    public String getPreferredLocation() { return preferredLocation; }
    public void setPreferredLocation(String preferredLocation) { this.preferredLocation = preferredLocation; }

    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }

    public String getLeetcodeUrl() { return leetcodeUrl; }
    public void setLeetcodeUrl(String leetcodeUrl) { this.leetcodeUrl = leetcodeUrl; }

    public String getHackerrankUrl() { return hackerrankUrl; }
    public void setHackerrankUrl(String hackerrankUrl) { this.hackerrankUrl = hackerrankUrl; }

    public String getCodechefUrl() { return codechefUrl; }
    public void setCodechefUrl(String codechefUrl) { this.codechefUrl = codechefUrl; }

    public String getOtherProfessionalLinks() { return otherProfessionalLinks; }
    public void setOtherProfessionalLinks(String otherProfessionalLinks) { this.otherProfessionalLinks = otherProfessionalLinks; }

    public String getTenthSchoolName() { return tenthSchoolName; }
    public void setTenthSchoolName(String tenthSchoolName) { this.tenthSchoolName = tenthSchoolName; }

    public String getTenthBoard() { return tenthBoard; }
    public void setTenthBoard(String tenthBoard) { this.tenthBoard = tenthBoard; }

    public Integer getTenthYear() { return tenthYear; }
    public void setTenthYear(Integer tenthYear) { this.tenthYear = tenthYear; }

    public Double getTenthPercentage() { return tenthPercentage; }
    public void setTenthPercentage(Double tenthPercentage) { this.tenthPercentage = tenthPercentage; }

    public String getTwelfthInstitution() { return twelfthInstitution; }
    public void setTwelfthInstitution(String twelfthInstitution) { this.twelfthInstitution = twelfthInstitution; }

    public String getTwelfthBoard() { return twelfthBoard; }
    public void setTwelfthBoard(String twelfthBoard) { this.twelfthBoard = twelfthBoard; }

    public Integer getTwelfthYear() { return twelfthYear; }
    public void setTwelfthYear(Integer twelfthYear) { this.twelfthYear = twelfthYear; }

    public Double getTwelfthPercentage() { return twelfthPercentage; }
    public void setTwelfthPercentage(Double twelfthPercentage) { this.twelfthPercentage = twelfthPercentage; }

    public String getGradCollege() { return gradCollege; }
    public void setGradCollege(String gradCollege) { this.gradCollege = gradCollege; }

    public String getGradUniversity() { return gradUniversity; }
    public void setGradUniversity(String gradUniversity) { this.gradUniversity = gradUniversity; }

    public String getGradDegree() { return gradDegree; }
    public void setGradDegree(String gradDegree) { this.gradDegree = gradDegree; }

    public String getGradBranch() { return gradBranch; }
    public void setGradBranch(String gradBranch) { this.gradBranch = gradBranch; }

    public String getGradStartDate() { return gradStartDate; }
    public void setGradStartDate(String gradStartDate) { this.gradStartDate = gradStartDate; }

    public String getGradEndDate() { return gradEndDate; }
    public void setGradEndDate(String gradEndDate) { this.gradEndDate = gradEndDate; }

    public Double getGradCgpa() { return gradCgpa; }
    public void setGradCgpa(Double gradCgpa) { this.gradCgpa = gradCgpa; }

    public String getPgCollege() { return pgCollege; }
    public void setPgCollege(String pgCollege) { this.pgCollege = pgCollege; }

    public String getPgUniversity() { return pgUniversity; }
    public void setPgUniversity(String pgUniversity) { this.pgUniversity = pgUniversity; }

    public String getPgDegree() { return pgDegree; }
    public void setPgDegree(String pgDegree) { this.pgDegree = pgDegree; }

    public String getPgBranch() { return pgBranch; }
    public void setPgBranch(String pgBranch) { this.pgBranch = pgBranch; }

    public String getPgStartDate() { return pgStartDate; }
    public void setPgStartDate(String pgStartDate) { this.pgStartDate = pgStartDate; }

    public String getPgEndDate() { return pgEndDate; }
    public void setPgEndDate(String pgEndDate) { this.pgEndDate = pgEndDate; }

    public Double getPgCgpa() { return pgCgpa; }
    public void setPgCgpa(Double pgCgpa) { this.pgCgpa = pgCgpa; }

    public String getPreferredRole() { return preferredRole; }
    public void setPreferredRole(String preferredRole) { this.preferredRole = preferredRole; }

    public String getPreferredLocationPref() { return preferredLocationPref; }
    public void setPreferredLocationPref(String preferredLocationPref) { this.preferredLocationPref = preferredLocationPref; }

    public Double getExpectedSalary() { return expectedSalary; }
    public void setExpectedSalary(Double expectedSalary) { this.expectedSalary = expectedSalary; }

    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }

    public String getWorkMode() { return workMode; }
    public void setWorkMode(String workMode) { this.workMode = workMode; }

    public boolean isResumeVisibility() { return resumeVisibility; }
    public void setResumeVisibility(boolean resumeVisibility) { this.resumeVisibility = resumeVisibility; }

    public boolean isContactVisibility() { return contactVisibility; }
    public void setContactVisibility(boolean contactVisibility) { this.contactVisibility = contactVisibility; }

    public boolean isProfileVisibility() { return profileVisibility; }
    public void setProfileVisibility(boolean profileVisibility) { this.profileVisibility = profileVisibility; }
}
