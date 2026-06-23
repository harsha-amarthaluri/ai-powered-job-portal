package com.jobportal.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import java.io.File;
import java.io.IOException;
import java.util.*;

@Service
public class ResumeParserService {

    private static final List<String> KNOWN_SKILLS = Arrays.asList(
        "java", "python", "javascript", "typescript", "react", "angular", "vue",
        "spring", "spring boot", "hibernate", "mysql", "postgresql", "mongodb",
        "html", "css", "node.js", "express", "rest api", "docker", "kubernetes",
        "aws", "azure", "git", "jenkins", "maven", "gradle", "linux", "sql",
        "machine learning", "deep learning", "tensorflow", "pytorch", "pandas",
        "numpy", "flask", "django", "c++", "c#", ".net", "php", "ruby", "swift",
        "kotlin", "android", "ios", "flutter", "react native", "graphql", "redis",
        "elasticsearch", "kafka", "microservices", "agile", "scrum", "jira"
    );

    public String extractText(File pdfFile) throws IOException {
        try (PDDocument document = Loader.loadPDF(pdfFile)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    public String extractSkills(String resumeText) {
        String lowerText = resumeText.toLowerCase();
        List<String> foundSkills = new ArrayList<>();
        for (String skill : KNOWN_SKILLS) {
            if (lowerText.contains(skill)) {
                foundSkills.add(skill);
            }
        }
        return String.join(", ", foundSkills);
    }

    public Map<String, String> extractDetails(String resumeText) {
        Map<String, String> details = new HashMap<>();
        details.put("skills", extractSkills(resumeText));
        java.util.regex.Matcher emailMatcher = java.util.regex.Pattern
            .compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}")
            .matcher(resumeText);
        if (emailMatcher.find()) details.put("email", emailMatcher.group());
        java.util.regex.Matcher phoneMatcher = java.util.regex.Pattern
            .compile("(\\+?\\d[\\d\\s\\-]{8,}\\d)")
            .matcher(resumeText);
        if (phoneMatcher.find()) details.put("phone", phoneMatcher.group().trim());
        return details;
    }
}
