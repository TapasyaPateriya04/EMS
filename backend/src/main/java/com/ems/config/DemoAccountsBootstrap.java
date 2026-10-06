package com.ems.config;

import com.ems.employee.Employee;
import com.ems.employee.EmployeeRepository;
import com.ems.employee.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Locale;

@Configuration
public class DemoAccountsBootstrap {
    @Bean
    CommandLineRunner createConfiguredDemoAccounts(
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            @Value("${ems.demo.accounts-enabled:false}") boolean enabled,
            @Value("${ems.demo.admin-email:}") String adminEmail,
            @Value("${ems.demo.admin-password:}") String adminPassword,
            @Value("${ems.demo.employee-email:}") String employeeEmail,
            @Value("${ems.demo.employee-password:}") String employeePassword,
            @Value("${ems.demo.employee-name:Demo Employee}") String employeeName
    ) {
        return args -> {
            if (!enabled) {
                return;
            }
            validateConfiguration(adminEmail, adminPassword, employeeEmail, employeePassword, employeeName);
            ensureDemoAccount(
                    employeeRepository,
                    passwordEncoder,
                    adminEmail,
                    adminPassword,
                    "EMS Demo Administrator",
                    Role.ADMIN
            );
            ensureDemoAccount(
                    employeeRepository,
                    passwordEncoder,
                    employeeEmail,
                    employeePassword,
                    employeeName,
                    Role.EMPLOYEE
            );
        };
    }

    private static void validateConfiguration(
            String adminEmail,
            String adminPassword,
            String employeeEmail,
            String employeePassword,
            String employeeName
    ) {
        if (adminEmail.isBlank()
                || adminPassword.length() < 12
                || employeeEmail.isBlank()
                || employeePassword.length() < 12
                || employeeName.isBlank()) {
            throw new IllegalStateException(
                    "Demo accounts require both emails, both passwords of at least 12 characters, and a non-empty employee name."
            );
        }
        if (adminEmail.trim().equalsIgnoreCase(employeeEmail.trim())) {
            throw new IllegalStateException("The demo administrator and employee must use different email addresses.");
        }
    }

    private static void ensureDemoAccount(
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            String email,
            String password,
            String name,
            Role role
    ) {
        employeeRepository.findByEmailIgnoreCase(email).ifPresentOrElse(existing -> {
            if (existing.getRole() != role) {
                throw new IllegalStateException(
                        "The configured demo account " + email + " already exists with a different role."
                );
            }
            if (!existing.isActive() || !passwordEncoder.matches(password, existing.getPasswordHash())) {
                existing.setActive(true);
                existing.setPasswordHash(passwordEncoder.encode(password));
                existing.incrementTokenVersion();
                employeeRepository.save(existing);
            }
        }, () -> employeeRepository.save(new Employee(
                name,
                email,
                passwordEncoder.encode(password),
                role,
                true
        )));
    }
}
