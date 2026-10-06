package com.ems.auth;

import com.ems.employee.Employee;
import com.ems.employee.Role;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {
    private static final String SECRET = "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=";

    @Test
    void issuesTokensForTheEmployeeEmail() {
        JwtService service = new JwtService(SECRET, 60_000);
        Employee employee = new Employee("Sam Lee", "sam@example.com", "hash", Role.EMPLOYEE, true);

        String token = service.issueToken(employee);

        assertThat(service.extractEmail(token)).isEqualTo("sam@example.com");
    }

    @Test
    void rejectsSigningKeysShorterThanThirtyTwoBytes() {
        assertThatThrownBy(() -> new JwtService("c2hvcnQ=", 60_000))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("at least 32 bytes");
    }
}
