package com.jobportal.repository;

import com.jobportal.entity.ResumeVersion;
import com.jobportal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeVersionRepository extends JpaRepository<ResumeVersion, Long> {
    List<ResumeVersion> findByUserOrderByVersionDesc(User user);
    Optional<ResumeVersion> findByUserAndVersion(User user, int version);
    Optional<ResumeVersion> findFirstByUserOrderByVersionDesc(User user);
}
