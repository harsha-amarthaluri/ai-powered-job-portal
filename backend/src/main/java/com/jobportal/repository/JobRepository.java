package com.jobportal.repository;

import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByEmployer(User employer);

    List<Job> findByApprovedTrueAndStatus(Job.JobStatus status);

    @Query("SELECT j FROM Job j WHERE j.approved = true AND j.status = 'OPEN' AND " +
           "(:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.skills) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:category IS NULL OR LOWER(j.category) = LOWER(:category)) AND " +
           "(:jobType IS NULL OR LOWER(j.jobType) = LOWER(:jobType))")
    List<Job> searchJobs(@Param("keyword") String keyword,
                         @Param("location") String location,
                         @Param("category") String category,
                         @Param("jobType") String jobType);

    @Query("SELECT j FROM Job j WHERE j.approved = true AND j.status = 'OPEN' AND " +
           "(:skills IS NULL OR LOWER(j.skills) LIKE LOWER(CONCAT('%', :skills, '%')))")
    List<Job> findRecommendedJobs(@Param("skills") String skills);

    List<Job> findByApprovedFalse();

    long countByStatus(Job.JobStatus status);
}
