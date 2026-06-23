package com.jobportal.service;


import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service

public class EmailService {

    private final JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendApplicationConfirmation(String toEmail, String seekerName, String jobTitle, String company) {
        String subject = "Application Submitted — " + jobTitle + " at " + company;
        String body = "<h2>Hi " + seekerName + ",</h2>" +
            "<p>Your application for <strong>" + jobTitle + "</strong> at <strong>" + company + "</strong> has been successfully submitted.</p>" +
            "<p>You can track your application status on your dashboard.</p>" +
            "<br/><p>Best of luck!<br/>Job Portal Team</p>";
        sendHtmlEmail(toEmail, subject, body);
    }

    @Async
    public void sendStatusUpdate(String toEmail, String seekerName, String jobTitle, String company, String status, String note) {
        String subject = "Application Update — " + jobTitle + " at " + company;
        String statusMsg = switch (status) {
            case "SHORTLISTED" -> "Congratulations! You have been <strong>shortlisted</strong> for an interview.";
            case "INTERVIEW"   -> "You have been selected for an <strong>interview</strong>. Expect to hear from the employer soon.";
            case "HIRED"       -> "Congratulations! You have been <strong>hired</strong>!";
            case "REJECTED"    -> "Unfortunately, your application was not selected this time. Keep applying!";
            default            -> "Your application status has been updated to <strong>" + status + "</strong>.";
        };
        String body = "<h2>Hi " + seekerName + ",</h2>" +
            "<p>Update on your application for <strong>" + jobTitle + "</strong> at <strong>" + company + "</strong>:</p>" +
            "<p>" + statusMsg + "</p>" +
            (note != null && !note.isEmpty() ? "<p><em>Employer note: " + note + "</em></p>" : "") +
            "<br/><p>Job Portal Team</p>";
        sendHtmlEmail(toEmail, subject, body);
    }

    @Async
    public void sendNewApplicantAlert(String toEmail, String employerName, String seekerName, String jobTitle, double matchScore) {
        String subject = "New Applicant for " + jobTitle;
        String body = "<h2>Hi " + employerName + ",</h2>" +
            "<p><strong>" + seekerName + "</strong> has applied for your job posting: <strong>" + jobTitle + "</strong>.</p>" +
            "<p>AI Match Score: <strong>" + String.format("%.1f", matchScore) + "%</strong></p>" +
            "<p>Log in to your employer dashboard to review the application.</p>" +
            "<br/><p>Job Portal Team</p>";
        sendHtmlEmail(toEmail, subject, body);
    }

    @Async
    public void sendJobApprovalNotification(String toEmail, String employerName, String jobTitle) {
        String subject = "Your job post has been approved — " + jobTitle;
        String body = "<h2>Hi " + employerName + ",</h2>" +
            "<p>Your job posting <strong>" + jobTitle + "</strong> has been approved and is now live on Job Portal.</p>" +
            "<br/><p>Job Portal Team</p>";
        sendHtmlEmail(toEmail, subject, body);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Email send failed: " + e.getMessage());
        }
    }
}
