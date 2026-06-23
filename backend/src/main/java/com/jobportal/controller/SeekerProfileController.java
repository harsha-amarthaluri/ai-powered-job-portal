package com.jobportal.controller;

import com.jobportal.dto.SeekerProfileDTO.*;
import com.jobportal.entity.*;
import com.jobportal.service.SeekerProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seeker")
public class SeekerProfileController {

    private final SeekerProfileService seekerProfileService;

    @Autowired
    public SeekerProfileController(SeekerProfileService seekerProfileService) {
        this.seekerProfileService = seekerProfileService;
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getFullProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(seekerProfileService.getFullProfile(userDetails.getUsername()));
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateSeekerProfile(@AuthenticationPrincipal UserDetails userDetails,
                                                    @RequestBody SeekerProfileRequest request) {
        return ResponseEntity.ok(seekerProfileService.updateSeekerProfile(userDetails.getUsername(), request));
    }

    @GetMapping("/profile-completion")
    public ResponseEntity<ProfileCompletionResponse> getProfileCompletion(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(seekerProfileService.calculateProfileCompletion(userDetails.getUsername()));
    }

    @GetMapping("/applications/analytics")
    public ResponseEntity<SeekerAnalyticsResponse> getSeekerAnalytics(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(seekerProfileService.getSeekerAnalytics(userDetails.getUsername()));
    }

    // Skills Management
    @PostMapping("/skills")
    public ResponseEntity<SeekerSkill> addSkill(@AuthenticationPrincipal UserDetails userDetails,
                                                 @RequestBody SeekerSkillRequest request) {
        return ResponseEntity.ok(seekerProfileService.addSkill(userDetails.getUsername(), request));
    }

    @DeleteMapping("/skills/{id}")
    public ResponseEntity<Void> deleteSkill(@AuthenticationPrincipal UserDetails userDetails,
                                            @PathVariable Long id) {
        seekerProfileService.deleteSkill(id, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    // Certifications
    @PostMapping("/certifications")
    public ResponseEntity<Certification> addCertification(@AuthenticationPrincipal UserDetails userDetails,
                                                           @RequestBody CertificationRequest request) {
        return ResponseEntity.ok(seekerProfileService.addCertification(userDetails.getUsername(), request));
    }

    @DeleteMapping("/certifications/{id}")
    public ResponseEntity<Void> deleteCertification(@AuthenticationPrincipal UserDetails userDetails,
                                                    @PathVariable Long id) {
        seekerProfileService.deleteCertification(id, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    // Projects
    @PostMapping("/projects")
    public ResponseEntity<Project> addProject(@AuthenticationPrincipal UserDetails userDetails,
                                               @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(seekerProfileService.addProject(userDetails.getUsername(), request));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(@AuthenticationPrincipal UserDetails userDetails,
                                              @PathVariable Long id) {
        seekerProfileService.deleteProject(id, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    // Work Experience
    @PostMapping("/experience")
    public ResponseEntity<WorkExperience> addWorkExperience(@AuthenticationPrincipal UserDetails userDetails,
                                                             @RequestBody WorkExperienceRequest request) {
        return ResponseEntity.ok(seekerProfileService.addWorkExperience(userDetails.getUsername(), request));
    }

    @DeleteMapping("/experience/{id}")
    public ResponseEntity<Void> deleteWorkExperience(@AuthenticationPrincipal UserDetails userDetails,
                                                     @PathVariable Long id) {
        seekerProfileService.deleteWorkExperience(id, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    // Internships
    @PostMapping("/internships")
    public ResponseEntity<Internship> addInternship(@AuthenticationPrincipal UserDetails userDetails,
                                                     @RequestBody InternshipRequest request) {
        return ResponseEntity.ok(seekerProfileService.addInternship(userDetails.getUsername(), request));
    }

    @DeleteMapping("/internships/{id}")
    public ResponseEntity<Void> deleteInternship(@AuthenticationPrincipal UserDetails userDetails,
                                                 @PathVariable Long id) {
        seekerProfileService.deleteInternship(id, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    // Saved Jobs Bookmarking
    @PostMapping("/saved-jobs/{jobId}")
    public ResponseEntity<Boolean> toggleSavedJob(@AuthenticationPrincipal UserDetails userDetails,
                                                   @PathVariable Long jobId) {
        return ResponseEntity.ok(seekerProfileService.toggleSavedJob(userDetails.getUsername(), jobId));
    }

    @GetMapping("/saved-jobs")
    public ResponseEntity<List<SavedJob>> getSavedJobs(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(seekerProfileService.getSavedJobs(userDetails.getUsername()));
    }
}
