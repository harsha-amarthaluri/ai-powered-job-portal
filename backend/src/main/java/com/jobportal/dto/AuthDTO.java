package com.jobportal.dto;

import com.jobportal.entity.User;
import jakarta.validation.constraints.*;

public class AuthDTO {

    public static class RegisterRequest {
        @NotBlank private String fullName;
        @Email @NotBlank private String email;
        @NotBlank @Size(min = 6) private String password;
        @NotNull private User.Role role;
        private String companyName;
        private String phone;

        public String getFullName() { return fullName; }
        public String getEmail() { return email; }
        public String getPassword() { return password; }
        public User.Role getRole() { return role; }
        public String getCompanyName() { return companyName; }
        public String getPhone() { return phone; }
        public void setFullName(String v) { this.fullName = v; }
        public void setEmail(String v) { this.email = v; }
        public void setPassword(String v) { this.password = v; }
        public void setRole(User.Role v) { this.role = v; }
        public void setCompanyName(String v) { this.companyName = v; }
        public void setPhone(String v) { this.phone = v; }
    }

    public static class LoginRequest {
        @Email @NotBlank private String email;
        @NotBlank private String password;

        public String getEmail() { return email; }
        public String getPassword() { return password; }
        public void setEmail(String v) { this.email = v; }
        public void setPassword(String v) { this.password = v; }
    }

    public static class AuthResponse {
        private String token;
        private String email;
        private String fullName;
        private String role;
        private Long userId;

        public AuthResponse() {}
        public AuthResponse(String token, String email, String fullName, String role, Long userId) {
            this.token = token; this.email = email; this.fullName = fullName;
            this.role = role; this.userId = userId;
        }

        public String getToken() { return token; }
        public String getEmail() { return email; }
        public String getFullName() { return fullName; }
        public String getRole() { return role; }
        public Long getUserId() { return userId; }
        public void setToken(String v) { this.token = v; }
        public void setEmail(String v) { this.email = v; }
        public void setFullName(String v) { this.fullName = v; }
        public void setRole(String v) { this.role = v; }
        public void setUserId(Long v) { this.userId = v; }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private final AuthResponse r = new AuthResponse();
            public Builder token(String v) { r.token = v; return this; }
            public Builder email(String v) { r.email = v; return this; }
            public Builder fullName(String v) { r.fullName = v; return this; }
            public Builder role(String v) { r.role = v; return this; }
            public Builder userId(Long v) { r.userId = v; return this; }
            public AuthResponse build() { return r; }
        }
    }

    public static class UpdateProfileRequest {
        private String fullName, phone, location, skills, education, experience;
        private String companyName, companyDescription, companyWebsite, industry;

        public String getFullName() { return fullName; }
        public String getPhone() { return phone; }
        public String getLocation() { return location; }
        public String getSkills() { return skills; }
        public String getEducation() { return education; }
        public String getExperience() { return experience; }
        public String getCompanyName() { return companyName; }
        public String getCompanyDescription() { return companyDescription; }
        public String getCompanyWebsite() { return companyWebsite; }
        public String getIndustry() { return industry; }
        public void setFullName(String v) { this.fullName = v; }
        public void setPhone(String v) { this.phone = v; }
        public void setLocation(String v) { this.location = v; }
        public void setSkills(String v) { this.skills = v; }
        public void setEducation(String v) { this.education = v; }
        public void setExperience(String v) { this.experience = v; }
        public void setCompanyName(String v) { this.companyName = v; }
        public void setCompanyDescription(String v) { this.companyDescription = v; }
        public void setCompanyWebsite(String v) { this.companyWebsite = v; }
        public void setIndustry(String v) { this.industry = v; }
    }
}
