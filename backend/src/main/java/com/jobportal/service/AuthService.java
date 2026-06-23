package com.jobportal.service;

import com.jobportal.dto.AuthDTO.*;
import com.jobportal.entity.User;
import com.jobportal.entity.ResumeVersion;
import com.jobportal.repository.UserRepository;
import com.jobportal.repository.ResumeVersionRepository;
import com.jobportal.security.JwtUtil;
import java.util.Map;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;

@Service

public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final ResumeParserService resumeParserService;

    @org.springframework.beans.factory.annotation.Autowired
    private AiService aiService;

    @org.springframework.beans.factory.annotation.Autowired
    private ResumeVersionRepository resumeVersionRepository;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @org.springframework.beans.factory.annotation.Autowired
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtUtil jwtUtil,
                       ResumeParserService resumeParserService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.resumeParserService = resumeParserService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new RuntimeException("Email already registered");

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .phone(request.getPhone())
                .companyName(request.getCompanyName())
                .build();

        userRepository.save(user);

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(),
                java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(user.getRole().name()))
        );

        return AuthResponse.builder()
                .token(jwtUtil.generateToken(userDetails))
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .userId(user.getId())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(),
                java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(user.getRole().name()))
        );

        return AuthResponse.builder()
                .token(jwtUtil.generateToken(userDetails))
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .userId(user.getId())
                .build();
    }

    public User updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getLocation() != null) user.setLocation(request.getLocation());
        if (request.getSkills() != null) user.setSkills(request.getSkills());
        if (request.getEducation() != null) user.setEducation(request.getEducation());
        if (request.getExperience() != null) user.setExperience(request.getExperience());
        if (request.getCompanyName() != null) user.setCompanyName(request.getCompanyName());
        if (request.getCompanyDescription() != null) user.setCompanyDescription(request.getCompanyDescription());
        if (request.getCompanyWebsite() != null) user.setCompanyWebsite(request.getCompanyWebsite());
        if (request.getIndustry() != null) user.setIndustry(request.getIndustry());
        User saved = userRepository.save(user);
        if (saved.getRole() == User.Role.ROLE_SEEKER) {
            aiService.recalculateSeekerAiCache(saved);
        }
        return saved;
    }

    public String uploadResume(String email, MultipartFile file) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Path uploadPath = Paths.get("./uploads/resumes");
        Files.createDirectories(uploadPath);
        String filename = user.getId() + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Auto-parse resume and extract skills
        String extractedText = resumeParserService.extractText(filePath.toFile());
        String extractedSkills = resumeParserService.extractSkills(extractedText);
        
        String skillsVal = !extractedSkills.isEmpty() ? extractedSkills : (user.getSkills() != null ? user.getSkills() : "");
        String expVal = user.getExperience() != null ? user.getExperience() : "Standard experience description.";
        String eduVal = user.getEducation() != null ? user.getEducation() : "Standard education credentials.";

        // Calculate dynamic AI reports for historical cache
        Double atsScoreVal = 0.0;
        String atsReportJsonVal = "{}";
        String roadmapJsonVal = "{}";
        
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            // Fetch ATS score and report JSON
            Map<String, String> atsPayload = Map.of("skills", skillsVal, "experience", expVal, "education", eduVal);
            com.jobportal.dto.AiDTO.AtsScoreResponse atsRes = restTemplate.postForObject(aiServiceUrl + "/ats-score", atsPayload, com.jobportal.dto.AiDTO.AtsScoreResponse.class);
            if (atsRes != null) atsScoreVal = atsRes.getAtsScore();
            atsReportJsonVal = restTemplate.postForObject(aiServiceUrl + "/ats-score", atsPayload, String.class);
            
            // Fetch Career Roadmap JSON
            Map<String, String> roadmapPayload = Map.of("candidate_skills", skillsVal);
            roadmapJsonVal = restTemplate.postForObject(aiServiceUrl + "/roadmap", roadmapPayload, String.class);
        } catch (Exception e) {
            System.err.println("Failed to fetch Flask AI calculations on resume upload: " + e.getMessage());
        }

        // Save ResumeVersion history
        int nextVersion = resumeVersionRepository.findByUserOrderByVersionDesc(user).size() + 1;
        com.jobportal.entity.ResumeVersion rv = new com.jobportal.entity.ResumeVersion(
                user,
                nextVersion,
                filename,
                file.getOriginalFilename(),
                skillsVal,
                eduVal,
                expVal,
                atsScoreVal,
                atsReportJsonVal,
                roadmapJsonVal
        );
        resumeVersionRepository.save(rv);

        // Update Seeker profile
        user.setResumePath(filename);
        if (!extractedSkills.isEmpty()) {
            user.setSkills(extractedSkills);
        }
        
        // Cache on User table
        user.setCachedAtsScore(atsScoreVal);
        user.setCachedAtsReport(atsReportJsonVal);
        user.setCachedRoadmap(roadmapJsonVal);
        
        User savedUser = userRepository.save(user);

        // Dynamic event trigger: Recalculate AI cache and match scores for all applications
        aiService.recalculateSeekerAiCache(savedUser);

        return filename;
    }

    public User getProfile(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
