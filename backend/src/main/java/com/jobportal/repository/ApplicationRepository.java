package com.jobportal.repository;

import com.jobportal.entity.Application;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findBySeeker(User seeker);
    List<Application> findByJob(Job job);
    List<Application> findByJobOrderByMatchScoreDesc(Job job);
    Optional<Application> findBySeekerAndJob(User seeker, Job job);
    boolean existsBySeekerAndJob(User seeker, Job job);
    long countByStatus(Application.ApplicationStatus status);
}
