package com.jobportal.repository;

import com.jobportal.entity.SeekerSkill;
import com.jobportal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SeekerSkillRepository extends JpaRepository<SeekerSkill, Long> {
    List<SeekerSkill> findByUser(User user);
}
