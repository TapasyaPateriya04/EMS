package com.ems.employee;

import java.time.Instant;

public record EmployeeResponse(
        Long id,
        String name,
        String email,
        Role role,
        boolean active,
        Instant createdAt
) {
    public static EmployeeResponse from(Employee employee) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getName(),
                employee.getEmail(),
                employee.getRole(),
                employee.isActive(),
                employee.getCreatedAt()
        );
    }
}
