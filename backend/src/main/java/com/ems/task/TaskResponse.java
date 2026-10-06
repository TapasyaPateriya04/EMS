package com.ems.task;

import java.time.Instant;
import java.time.LocalDate;

public record TaskResponse(
        Long id,
        String title,
        String description,
        LocalDate dueDate,
        String category,
        TaskStatus status,
        Long employeeId,
        String employeeName,
        Instant createdAt
) {
    public static TaskResponse from(TaskItem task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getDueDate(),
                task.getCategory(),
                task.getStatus(),
                task.getEmployee().getId(),
                task.getEmployee().getName(),
                task.getCreatedAt()
        );
    }
}
