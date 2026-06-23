package com.jobportal.dto;

import java.util.List;
import java.util.Map;
import com.jobportal.entity.User;

public class AiDTO {

    // 1. Gap Analysis Response DTO
    public static class GapAnalysisResponse {
        private Double readinessScore;
        private List<String> missingSkills;
        private List<String> suggestions;

        public GapAnalysisResponse() {}
        public GapAnalysisResponse(Double readinessScore, List<String> missingSkills, List<String> suggestions) {
            this.readinessScore = readinessScore;
            this.missingSkills = missingSkills;
            this.suggestions = suggestions;
        }

        public Double getReadinessScore() { return readinessScore; }
        public void setReadinessScore(Double v) { this.readinessScore = v; }

        public List<String> getMissingSkills() { return missingSkills; }
        public void setMissingSkills(List<String> v) { this.missingSkills = v; }

        public List<String> getSuggestions() { return suggestions; }
        public void setSuggestions(List<String> v) { this.suggestions = v; }
    }

    // 2. ATS Score Response DTO
    public static class AtsScoreResponse {
        private Double atsScore;
        private Map<String, Boolean> structureAnalysis;
        private List<String> recommendations;

        public AtsScoreResponse() {}
        public AtsScoreResponse(Double atsScore, Map<String, Boolean> structureAnalysis, List<String> recommendations) {
            this.atsScore = atsScore;
            this.structureAnalysis = structureAnalysis;
            this.recommendations = recommendations;
        }

        public Double getAtsScore() { return atsScore; }
        public void setAtsScore(Double v) { this.atsScore = v; }

        public Map<String, Boolean> getStructureAnalysis() { return structureAnalysis; }
        public void setStructureAnalysis(Map<String, Boolean> v) { this.structureAnalysis = v; }

        public List<String> getRecommendations() { return recommendations; }
        public void setRecommendations(List<String> v) { this.recommendations = v; }
    }

    // 3. Interview Questions Response DTO
    public static class InterviewQuestionsResponse {
        private List<String> hrQuestions;
        private List<String> technicalQuestions;
        private List<String> projectQuestions;
        private List<String> roleQuestions;

        public InterviewQuestionsResponse() {}
        public InterviewQuestionsResponse(List<String> hrQuestions, List<String> technicalQuestions,
                                          List<String> projectQuestions, List<String> roleQuestions) {
            this.hrQuestions = hrQuestions;
            this.technicalQuestions = technicalQuestions;
            this.projectQuestions = projectQuestions;
            this.roleQuestions = roleQuestions;
        }

        public List<String> getHrQuestions() { return hrQuestions; }
        public void setHrQuestions(List<String> v) { this.hrQuestions = v; }

        public List<String> getTechnicalQuestions() { return technicalQuestions; }
        public void setTechnicalQuestions(List<String> v) { this.technicalQuestions = v; }

        public List<String> getProjectQuestions() { return projectQuestions; }
        public void setProjectQuestions(List<String> v) { this.projectQuestions = v; }

        public List<String> getRoleQuestions() { return roleQuestions; }
        public void setRoleQuestions(List<String> v) { this.roleQuestions = v; }
    }

    // 4. Personalized Career Roadmap DTOs
    public static class RoadmapStep {
        private String step;
        private String duration;
        private String topics;
        private String resources;
        private String project;

        public RoadmapStep() {}
        public RoadmapStep(String step, String duration, String topics, String resources, String project) {
            this.step = step;
            this.duration = duration;
            this.topics = topics;
            this.resources = resources;
            this.project = project;
        }

        public String getStep() { return step; }
        public void setStep(String v) { this.step = v; }

        public String getDuration() { return duration; }
        public void setDuration(String v) { this.duration = v; }

        public String getTopics() { return topics; }
        public void setTopics(String v) { this.topics = v; }

        public String getResources() { return resources; }
        public void setResources(String v) { this.resources = v; }

        public String getProject() { return project; }
        public void setProject(String v) { this.project = v; }
    }

    public static class RoadmapResponse {
        private List<String> currentSkills;
        private List<String> recommendedSkills;
        private List<RoadmapStep> learningPath;

        public RoadmapResponse() {}
        public RoadmapResponse(List<String> currentSkills, List<String> recommendedSkills, List<RoadmapStep> learningPath) {
            this.currentSkills = currentSkills;
            this.recommendedSkills = recommendedSkills;
            this.learningPath = learningPath;
        }

        public List<String> getCurrentSkills() { return currentSkills; }
        public void setCurrentSkills(List<String> v) { this.currentSkills = v; }

        public List<String> getRecommendedSkills() { return recommendedSkills; }
        public void setRecommendedSkills(List<String> v) { this.recommendedSkills = v; }

        public List<RoadmapStep> getLearningPath() { return learningPath; }
        public void setLearningPath(List<RoadmapStep> v) { this.learningPath = v; }
    }

    // 5. Recruiter Analytics DTO
    public static class EmployerAnalyticsResponse {
        private Integer totalApplicants;
        private Integer hiredCount;
        private Double averageScore;
        private Map<String, Long> applicantsByStatus;
        private Map<String, Long> scoreDistribution;
        private Map<String, Long> skillsDistribution;
        private List<String> hiringInsights;

        public EmployerAnalyticsResponse() {}
        public EmployerAnalyticsResponse(Integer totalApplicants, Integer hiredCount, Double averageScore,
                                         Map<String, Long> applicantsByStatus, Map<String, Long> scoreDistribution,
                                         Map<String, Long> skillsDistribution, List<String> hiringInsights) {
            this.totalApplicants = totalApplicants;
            this.hiredCount = hiredCount;
            this.averageScore = averageScore;
            this.applicantsByStatus = applicantsByStatus;
            this.scoreDistribution = scoreDistribution;
            this.skillsDistribution = skillsDistribution;
            this.hiringInsights = hiringInsights;
        }

        public Integer getTotalApplicants() { return totalApplicants; }
        public void setTotalApplicants(Integer v) { this.totalApplicants = v; }

        public Integer getHiredCount() { return hiredCount; }
        public void setHiredCount(Integer v) { this.hiredCount = v; }

        public Double getAverageScore() { return averageScore; }
        public void setAverageScore(Double v) { this.averageScore = v; }

        public Map<String, Long> getApplicantsByStatus() { return applicantsByStatus; }
        public void setApplicantsByStatus(Map<String, Long> v) { this.applicantsByStatus = v; }

        public Map<String, Long> getScoreDistribution() { return scoreDistribution; }
        public void setScoreDistribution(Map<String, Long> v) { this.scoreDistribution = v; }

        public Map<String, Long> getSkillsDistribution() { return skillsDistribution; }
        public void setSkillsDistribution(Map<String, Long> v) { this.skillsDistribution = v; }

        public List<String> getHiringInsights() { return hiringInsights; }
        public void setHiringInsights(List<String> v) { this.hiringInsights = v; }
    }

    // 6. Recruiter Candidate Insights Response DTO
    public static class CandidateInsightsResponse {
        private List<String> strengths;
        private List<String> weaknesses;
        private List<String> missingSkills;
        private Double matchScore;
        private String hiringRecommendation;
        private User candidate;
        private String careerLevelAssessment;
        private String hiringRecommendationCategory;
        private List<String> hiringRecommendationReasons;
        private List<String> learningRecommendations;

        public CandidateInsightsResponse() {}
        public CandidateInsightsResponse(List<String> strengths, List<String> weaknesses, List<String> missingSkills, Double matchScore, String hiringRecommendation) {
            this.strengths = strengths;
            this.weaknesses = weaknesses;
            this.missingSkills = missingSkills;
            this.matchScore = matchScore;
            this.hiringRecommendation = hiringRecommendation;
        }

        public List<String> getStrengths() { return strengths; }
        public void setStrengths(List<String> v) { this.strengths = v; }
        public List<String> getWeaknesses() { return weaknesses; }
        public void setWeaknesses(List<String> v) { this.weaknesses = v; }
        public List<String> getMissingSkills() { return missingSkills; }
        public void setMissingSkills(List<String> v) { this.missingSkills = v; }
        public Double getMatchScore() { return matchScore; }
        public void setMatchScore(Double v) { this.matchScore = v; }
        public String getHiringRecommendation() { return hiringRecommendation; }
        public void setHiringRecommendation(String v) { this.hiringRecommendation = v; }
        public User getCandidate() { return candidate; }
        public void setCandidate(User v) { this.candidate = v; }

        public String getCareerLevelAssessment() { return careerLevelAssessment; }
        public void setCareerLevelAssessment(String v) { this.careerLevelAssessment = v; }

        public String getHiringRecommendationCategory() { return hiringRecommendationCategory; }
        public void setHiringRecommendationCategory(String v) { this.hiringRecommendationCategory = v; }

        public List<String> getHiringRecommendationReasons() { return hiringRecommendationReasons; }
        public void setHiringRecommendationReasons(List<String> v) { this.hiringRecommendationReasons = v; }

        public List<String> getLearningRecommendations() { return learningRecommendations; }
        public void setLearningRecommendations(List<String> v) { this.learningRecommendations = v; }
    }

    // 7. Job Optimization Response DTO
    public static class JobOptimizationResponse {
        private String optimizedDescription;
        private List<String> suggestedSkills;

        public JobOptimizationResponse() {}
        public JobOptimizationResponse(String optimizedDescription, List<String> suggestedSkills) {
            this.optimizedDescription = optimizedDescription;
            this.suggestedSkills = suggestedSkills;
        }

        public String getOptimizedDescription() { return optimizedDescription; }
        public void setOptimizedDescription(String v) { this.optimizedDescription = v; }
        public List<String> getSuggestedSkills() { return suggestedSkills; }
        public void setSuggestedSkills(List<String> v) { this.suggestedSkills = v; }
    }

    // 8. Resume Version History DTO
    public static class ResumeVersionResponse {
        private Long id;
        private int version;
        private String fileName;
        private String resumePath;
        private String skills;
        private Double atsScore;
        private String atsReportJson;
        private String roadmapJson;
        private String uploadedAt;

        public ResumeVersionResponse() {}
        public ResumeVersionResponse(Long id, int version, String fileName, String resumePath, String skills, Double atsScore, String atsReportJson, String roadmapJson, String uploadedAt) {
            this.id = id;
            this.version = version;
            this.fileName = fileName;
            this.resumePath = resumePath;
            this.skills = skills;
            this.atsScore = atsScore;
            this.atsReportJson = atsReportJson;
            this.roadmapJson = roadmapJson;
            this.uploadedAt = uploadedAt;
        }

        public Long getId() { return id; }
        public void setId(Long v) { this.id = v; }
        public int getVersion() { return version; }
        public void setVersion(int v) { this.version = v; }
        public String getFileName() { return fileName; }
        public void setFileName(String v) { this.fileName = v; }
        public String getResumePath() { return resumePath; }
        public void setResumePath(String v) { this.resumePath = v; }
        public String getSkills() { return skills; }
        public void setSkills(String v) { this.skills = v; }
        public Double getAtsScore() { return atsScore; }
        public void setAtsScore(Double v) { this.atsScore = v; }
        public String getAtsReportJson() { return atsReportJson; }
        public void setAtsReportJson(String v) { this.atsReportJson = v; }
        public String getRoadmapJson() { return roadmapJson; }
        public void setRoadmapJson(String v) { this.roadmapJson = v; }
        public String getUploadedAt() { return uploadedAt; }
        public void setUploadedAt(String v) { this.uploadedAt = v; }
    }
}
