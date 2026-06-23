package com.jobportal.repository;

import com.jobportal.entity.SavedJob;
import com.jobportal.entity.User;
import com.jobportal.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {
    List<SavedJob> findBySeeker(User seeker);
    Optional<SavedJob> findBySeekerAndJob(User seeker, Job job);
    boolean existsBySeekerAndJob(User seeker, Job job);
}
