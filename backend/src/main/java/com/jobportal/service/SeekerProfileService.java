package com.jobportal.service;

import com.jobportal.dto.SeekerProfileDTO.*;
import com.jobportal.entity.*;
import com.jobportal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class SeekerProfileService {

    private final UserRepository userRepository;
    private final SeekerProfileRepository seekerProfileRepository;
    private final CertificationRepository certificationRepository;
    private final ProjectRepository projectRepository;
    private final WorkExperienceRepository workExperienceRepository;
    private final InternshipRepository internshipRepository;
    private final SeekerSkillRepository seekerSkillRepository;
    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    @Autowired
    public SeekerProfileService(UserRepository userRepository,
                                 SeekerProfileRepository seekerProfileRepository,
                                 CertificationRepository certificationRepository,
                                 ProjectRepository projectRepository,
                                 WorkExperienceRepository workExperienceRepository,
                                 InternshipRepository internshipRepository,
                                 SeekerSkillRepository seekerSkillRepository,
                                 SavedJobRepository savedJobRepository,
                                 JobRepository jobRepository,
                                 ApplicationRepository applicationRepository) {
        this.userRepository = userRepository;
        this.seekerProfileRepository = seekerProfileRepository;
        this.certificationRepository = certificationRepository;
        this.projectRepository = projectRepository;
        this.workExperienceRepository = workExperienceRepository;
        this.internshipRepository = internshipRepository;
        this.seekerSkillRepository = seekerSkillRepository;
        this.savedJobRepository = savedJobRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
    }

    public SeekerProfile getOrCreateProfile(User user) {
        return seekerProfileRepository.findByUser(user)
                .orElseGet(() -> {
                    SeekerProfile newProfile = new SeekerProfile();
                    newProfile.setUser(user);
                    return seekerProfileRepository.save(newProfile);
                });
    }

    public User getFullProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));
        // Eagerly fetch and link SeekerProfile
        getOrCreateProfile(user);
        return user;
    }

    public User updateSeekerProfile(String email, SeekerProfileRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));
        SeekerProfile profile = getOrCreateProfile(user);

        // Core Personal Info
        profile.setGender(req.getGender());
        profile.setDateOfBirth(req.getDateOfBirth());
        profile.setCurrentAddress(req.getCurrentAddress());
        profile.setPreferredLocation(req.getPreferredLocation());
        profile.setNationality(req.getNationality());

        // Links
        profile.setLinkedinUrl(req.getLinkedinUrl());
        profile.setGithubUrl(req.getGithubUrl());
        profile.setPortfolioUrl(req.getPortfolioUrl());
        profile.setLeetcodeUrl(req.getLeetcodeUrl());
        profile.setHackerrankUrl(req.getHackerrankUrl());
        profile.setCodechefUrl(req.getCodechefUrl());
        profile.setOtherProfessionalLinks(req.getOtherProfessionalLinks());

        // 10th
        profile.setTenthSchoolName(req.getTenthSchoolName());
        profile.setTenthBoard(req.getTenthBoard());
        profile.setTenthYear(req.getTenthYear());
        profile.setTenthPercentage(req.getTenthPercentage());

        // 12th
        profile.setTwelfthInstitution(req.getTwelfthInstitution());
        profile.setTwelfthBoard(req.getTwelfthBoard());
        profile.setTwelfthYear(req.getTwelfthYear());
        profile.setTwelfthPercentage(req.getTwelfthPercentage());

        // Graduation
        profile.setGradCollege(req.getGradCollege());
        profile.setGradUniversity(req.getGradUniversity());
        profile.setGradDegree(req.getGradDegree());
        profile.setGradBranch(req.getGradBranch());
        profile.setGradStartDate(req.getGradStartDate());
        profile.setGradEndDate(req.getGradEndDate());
        profile.setGradCgpa(req.getGradCgpa());

        // PG
        profile.setPgCollege(req.getPgCollege());
        profile.setPgUniversity(req.getPgUniversity());
        profile.setPgDegree(req.getPgDegree());
        profile.setPgBranch(req.getPgBranch());
        profile.setPgStartDate(req.getPgStartDate());
        profile.setPgEndDate(req.getPgEndDate());
        profile.setPgCgpa(req.getPgCgpa());

        // Preferences
        profile.setPreferredRole(req.getPreferredRole());
        profile.setPreferredLocationPref(req.getPreferredLocationPref());
        profile.setExpectedSalary(req.getExpectedSalary());
        profile.setEmploymentType(req.getEmploymentType());
        profile.setWorkMode(req.getWorkMode());

        // Privacy
        profile.setResumeVisibility(req.isResumeVisibility());
        profile.setContactVisibility(req.isContactVisibility());
        profile.setProfileVisibility(req.isProfileVisibility());

        seekerProfileRepository.save(profile);
        return user;
    }

    public SeekerSkill addSkill(String email, SeekerSkillRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));
        SeekerSkill skill = new SeekerSkill();
        skill.setUser(user);
        skill.setSkillName(req.getSkillName());
        skill.setSkillType(req.getSkillType());
        skill.setProficiencyLevel(req.getProficiencyLevel());

        SeekerSkill saved = seekerSkillRepository.save(skill);
        syncUserFlatSkillsField(user);
        return saved;
    }

    public void deleteSkill(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));
        SeekerSkill skill = seekerSkillRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Skill not found"));
        if (!skill.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        seekerSkillRepository.delete(skill);
        syncUserFlatSkillsField(user);
    }

    private void syncUserFlatSkillsField(User user) {
        List<SeekerSkill> list = seekerSkillRepository.findByUser(user);
        StringJoiner sj = new StringJoiner(", ");
        for (SeekerSkill s : list) {
            sj.add(s.getSkillName());
        }
        user.setSkills(sj.toString());
        userRepository.save(user);
    }

    public Certification addCertification(String email, CertificationRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));
        Certification cert = new Certification();
        cert.setUser(user);
        cert.setCertificateName(req.getCertificateName());
        cert.setOrganization(req.getOrganization());
        cert.setIssueDate(req.getIssueDate());
        cert.setExpiryDate(req.getExpiryDate());
        cert.setCredentialId(req.getCredentialId());
        cert.setVerificationLink(req.getVerificationLink());

        return certificationRepository.save(cert);
    }

    public void deleteCertification(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));
        Certification cert = certificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certification not found"));
        if (!cert.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        certificationRepository.delete(cert);
    }

    public Project addProject(String email, ProjectRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));
        Project p = new Project();
        p.setUser(user);
        p.setProjectTitle(req.getProjectTitle());
        p.setDescription(req.getDescription());
        p.setTechnologiesUsed(req.getTechnologiesUsed());
        p.setGithubLink(req.getGithubLink());
        p.setLiveDemoLink(req.getLiveDemoLink());
        p.setDuration(req.getDuration());
        p.setTeamSize(req.getTeamSize());
        p.setRole(req.getRole());

        return projectRepository.save(p);
    }

    public void deleteProject(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));
        Project p = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!p.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        projectRepository.delete(p);
    }

    public WorkExperience addWorkExperience(String email, WorkExperienceRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));
        WorkExperience exp = new WorkExperience();
        exp.setUser(user);
        exp.setCompanyName(req.getCompanyName());
        exp.setDesignation(req.getDesignation());
        exp.setEmploymentType(req.getEmploymentType());
        exp.setStartDate(req.getStartDate());
        exp.setEndDate(req.getEndDate());
        exp.setCurrentWorkingStatus(req.isCurrentWorkingStatus());
        exp.setResponsibilities(req.getResponsibilities());
        exp.setTechnologiesUsed(req.getTechnologiesUsed());

        return workExperienceRepository.save(exp);
    }

    public void deleteWorkExperience(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));
        WorkExperience exp = workExperienceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Experience not found"));
        if (!exp.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        workExperienceRepository.delete(exp);
    }

    public Internship addInternship(String email, InternshipRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));
        Internship intern = new Internship();
        intern.setUser(user);
        intern.setOrganization(req.getOrganization());
        intern.setRole(req.getRole());
        intern.setDuration(req.getDuration());
        intern.setSkillsLearned(req.getSkillsLearned());
        intern.setCertificate(req.getCertificate());

        return internshipRepository.save(intern);
    }

    public void deleteInternship(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));
        Internship intern = internshipRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Internship not found"));
        if (!intern.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        internshipRepository.delete(intern);
    }

    public boolean toggleSavedJob(String email, Long jobId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        Optional<SavedJob> opt = savedJobRepository.findBySeekerAndJob(user, job);
        if (opt.isPresent()) {
            savedJobRepository.delete(opt.get());
            return false; // Unsaved
        } else {
            SavedJob bookmark = new SavedJob();
            bookmark.setSeeker(user);
            bookmark.setJob(job);
            savedJobRepository.save(bookmark);
            return true; // Bookmarked
        }
    }

    public List<SavedJob> getSavedJobs(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));
        return savedJobRepository.findBySeeker(user);
    }

    public ProfileCompletionResponse calculateProfileCompletion(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));
        SeekerProfile p = getOrCreateProfile(user);

        int total = 0;
        Map<String, Boolean> checklist = new LinkedHashMap<>();

        // 1. Personal Information (15%) - Evaluates Gender, DOB, address, nationality
        boolean hasPersonal = p.getGender() != null && !p.getGender().isEmpty() &&
                p.getDateOfBirth() != null && !p.getDateOfBirth().isEmpty() &&
                p.getCurrentAddress() != null && !p.getCurrentAddress().isEmpty() &&
                p.getNationality() != null && !p.getNationality().isEmpty();
        checklist.put("Personal Details Filled", hasPersonal);
        if (hasPersonal) total += 15;

        // 2. Education details (20%) - 10th (5%), 12th (5%), Grad (10%)
        boolean hasTenth = p.getTenthSchoolName() != null && !p.getTenthSchoolName().isEmpty();
        boolean hasTwelfth = p.getTwelfthInstitution() != null && !p.getTwelfthInstitution().isEmpty();
        boolean hasGrad = p.getGradCollege() != null && !p.getGradCollege().isEmpty();
        checklist.put("School Education Added (10th/12th)", hasTenth && hasTwelfth);
        checklist.put("Higher Education Added (Graduation)", hasGrad);
        if (hasTenth) total += 5;
        if (hasTwelfth) total += 5;
        if (hasGrad) total += 10;

        // 3. Custom skills catalog in DB (15%) - at least 3 custom skills
        List<SeekerSkill> skills = seekerSkillRepository.findByUser(user);
        boolean hasSkills = skills.size() >= 3;
        checklist.put("At Least 3 Skills Registered", hasSkills);
        if (hasSkills) total += 15;
        else if (skills.size() > 0) total += 5; // Partial score

        // 4. Projects portfolio (15%) - at least 1 project in database
        List<Project> projs = projectRepository.findByUser(user);
        boolean hasProjects = projs.size() >= 1;
        checklist.put("Projects Portfolio Added", hasProjects);
        if (hasProjects) total += 15;

        // 5. Work experience or Internship catalog (15%) - at least 1 record in database
        List<WorkExperience> exps = workExperienceRepository.findByUser(user);
        List<Internship> interns = internshipRepository.findByUser(user);
        boolean hasExperience = exps.size() >= 1 || interns.size() >= 1;
        checklist.put("Work Experience or Internship Added", hasExperience);
        if (hasExperience) total += 15;

        // 6. Resume document upload on profile (10%)
        boolean hasResume = user.getResumePath() != null && !user.getResumePath().isEmpty();
        checklist.put("Resume Document Attached", hasResume);
        if (hasResume) total += 10;

        // 7. Social professional links (5%)
        boolean hasLinks = p.getLinkedinUrl() != null && !p.getLinkedinUrl().isEmpty() ||
                p.getGithubUrl() != null && !p.getGithubUrl().isEmpty();
        checklist.put("LinkedIn or GitHub Link Linked", hasLinks);
        if (hasLinks) total += 5;

        // 8. Career Preferences & Privacy set (5%)
        boolean hasPreferences = p.getPreferredRole() != null && !p.getPreferredRole().isEmpty() &&
                p.getWorkMode() != null && !p.getWorkMode().isEmpty();
        checklist.put("Job Preferences & Privacy Set", hasPreferences);
        if (hasPreferences) total += 5;

        return new ProfileCompletionResponse(total, checklist);
    }

    public SeekerAnalyticsResponse getSeekerAnalytics(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Seeker not found"));
        List<Application> list = applicationRepository.findBySeeker(user);

        int submitted = list.size();
        int shortlisted = 0;
        int rejected = 0;
        int interviews = 0;

        for (Application a : list) {
            Application.ApplicationStatus s = a.getStatus();
            if (s == Application.ApplicationStatus.SHORTLISTED || s == Application.ApplicationStatus.SELECTED || s == Application.ApplicationStatus.HIRED) {
                shortlisted++;
            }
            if (s == Application.ApplicationStatus.REJECTED) {
                rejected++;
            }
            if (s == Application.ApplicationStatus.INTERVIEW_SCHEDULED || s == Application.ApplicationStatus.TECHNICAL_ROUND || s == Application.ApplicationStatus.HR_ROUND) {
                interviews++;
            }
        }

        double success = 0.0;
        if (submitted > 0) {
            success = Math.round(((double) shortlisted / submitted) * 1000.0) / 10.0;
        }

        return new SeekerAnalyticsResponse(submitted, shortlisted, rejected, interviews, success);
    }
}
