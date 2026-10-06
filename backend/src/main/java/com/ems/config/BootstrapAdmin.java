package com.ems.config;

import com.ems.employee.Employee;
import com.ems.employee.EmployeeRepository;
import com.ems.employee.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class BootstrapAdmin {
    @Bean
    CommandLineRunner createConfiguredAdmin(
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            @Value("${ems.bootstrap.admin-email:}") String email,
            @Value("${ems.bootstrap.admin-password:}") String password
    ) {
        return args -> {
            if (email.isBlank() && password.isBlank()) {
                return;
            }
            if (email.isBlank() || password.isBlank() || password.length() < 12) {
                throw new IllegalStateException(
                        "Configure both EMS_BOOTSTRAP_ADMIN_EMAIL and a 12+ character EMS_BOOTSTRAP_ADMIN_PASSWORD."
                );
            }
            if (!employeeRepository.existsByEmailIgnoreCase(email)) {
                employeeRepository.save(new Employee(
                        "EMS Administrator",
                        email,
                        passwordEncoder.encode(password),
                        Role.ADMIN,
                        true
                ));
            }
        };
    }
}
