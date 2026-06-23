package com.jobportal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String type;
    private boolean isRead = false;
    private String link;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public Notification() {}

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getType() { return type; }
    public boolean isRead() { return isRead; }
    public String getLink() { return link; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long v) { this.id = v; }
    public void setUser(User v) { this.user = v; }
    public void setTitle(String v) { this.title = v; }
    public void setMessage(String v) { this.message = v; }
    public void setType(String v) { this.type = v; }
    public void setRead(boolean v) { this.isRead = v; }
    public void setLink(String v) { this.link = v; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Notification n = new Notification();
        public Builder user(User v) { n.user = v; return this; }
        public Builder title(String v) { n.title = v; return this; }
        public Builder message(String v) { n.message = v; return this; }
        public Builder type(String v) { n.type = v; return this; }
        public Builder isRead(boolean v) { n.isRead = v; return this; }
        public Builder link(String v) { n.link = v; return this; }
        public Notification build() { return n; }
    }
}
