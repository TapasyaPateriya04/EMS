package com.ems.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateTaskRequest(
        @NotBlank @Size(max = 160) String title,
        @NotBlank @Size(max = 2000) String description,
        @NotNull LocalDate dueDate,
        @NotBlank @Size(max = 80) String category,
        @NotNull Long employeeId
) {
}
