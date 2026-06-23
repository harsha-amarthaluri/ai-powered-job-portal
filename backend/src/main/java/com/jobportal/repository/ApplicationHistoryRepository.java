package com.jobportal.repository;

import com.jobportal.entity.Application;
import com.jobportal.entity.ApplicationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ApplicationHistoryRepository extends JpaRepository<ApplicationHistory, Long> {
    List<ApplicationHistory> findByApplicationOrderByUpdatedAtDesc(Application application);
    List<ApplicationHistory> findByApplicationOrderByUpdatedAtAsc(Application application);
}
