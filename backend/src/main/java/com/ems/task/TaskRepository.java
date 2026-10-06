package com.ems.task;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<TaskItem, Long> {
    List<TaskItem> findAllByOrderByDueDateAsc();

    List<TaskItem> findAllByEmployeeIdOrderByDueDateAsc(Long employeeId);

    Optional<TaskItem> findByIdAndEmployeeId(Long id, Long employeeId);
}
