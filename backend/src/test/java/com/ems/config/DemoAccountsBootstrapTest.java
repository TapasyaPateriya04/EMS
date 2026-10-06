package com.ems.config;

import com.ems.employee.Employee;
import com.ems.employee.EmployeeRepository;
import com.ems.employee.Role;
import org.junit.jupiter.api.Test;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DemoAccountsBootstrapTest {
    private static final String ADMIN_EMAIL = "admin.demo@ems.test";
    private static final String ADMIN_PASSWORD = "DemoAdmin-2026!";
    private static final String EMPLOYEE_EMAIL = "employee.demo@ems.test";
    private static final String EMPLOYEE_PASSWORD = "DemoEmployee-2026!";

    private final EmployeeRepository employeeRepository = mock(EmployeeRepository.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final DemoAccountsBootstrap bootstrap = new DemoAccountsBootstrap();

    @Test
    void createsBothConfiguredDemoRolesWithEncodedPasswords() throws Exception {
        when(employeeRepository.findByEmailIgnoreCase(ADMIN_EMAIL)).thenReturn(Optional.empty());
        when(employeeRepository.findByEmailIgnoreCase(EMPLOYEE_EMAIL)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(ADMIN_PASSWORD)).thenReturn("admin-hash");
        when(passwordEncoder.encode(EMPLOYEE_PASSWORD)).thenReturn("employee-hash");
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CommandLineRunner runner = runner(true, ADMIN_EMAIL, ADMIN_PASSWORD, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD);
        runner.run();

        var captor = org.mockito.ArgumentCaptor.forClass(Employee.class);
        verify(employeeRepository, times(2)).save(captor.capture());
        assertEquals(Role.ADMIN, captor.getAllValues().get(0).getRole());
        assertEquals("admin-hash", captor.getAllValues().get(0).getPasswordHash());
        assertEquals(Role.EMPLOYEE, captor.getAllValues().get(1).getRole());
        assertEquals("employee-hash", captor.getAllValues().get(1).getPasswordHash());
    }

    @Test
    void restoresChangedOrDeactivatedDemoCredentialsOnStartup() throws Exception {
        Employee admin = new Employee("Demo Admin", ADMIN_EMAIL, "admin-hash", Role.ADMIN, true);
        Employee employee = new Employee("Demo Employee", EMPLOYEE_EMAIL, "old-hash", Role.EMPLOYEE, false);
        when(employeeRepository.findByEmailIgnoreCase(ADMIN_EMAIL)).thenReturn(Optional.of(admin));
        when(employeeRepository.findByEmailIgnoreCase(EMPLOYEE_EMAIL)).thenReturn(Optional.of(employee));
        when(passwordEncoder.matches(ADMIN_PASSWORD, "admin-hash")).thenReturn(true);
        when(passwordEncoder.matches(EMPLOYEE_PASSWORD, "old-hash")).thenReturn(false);
        when(passwordEncoder.encode(EMPLOYEE_PASSWORD)).thenReturn("employee-hash");

        runner(true, ADMIN_EMAIL, ADMIN_PASSWORD, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD).run();

        verify(employeeRepository).save(employee);
        assertEquals(true, employee.isActive());
        assertEquals("employee-hash", employee.getPasswordHash());
        assertEquals(1, employee.getTokenVersion());
    }

    @Test
    void disabledDemoAccountsDoNotCreateUsersOrRequireCredentials() throws Exception {
        runner(false, "", "", "", "").run();

        verify(employeeRepository, never()).save(any(Employee.class));
    }

    @Test
    void rejectsIncompleteEnabledConfiguration() {
        CommandLineRunner runner = runner(true, ADMIN_EMAIL, "short", EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD);

        assertThrows(IllegalStateException.class, runner::run);
        verify(employeeRepository, never()).save(any(Employee.class));
    }

    private CommandLineRunner runner(
            boolean enabled,
            String adminEmail,
            String adminPassword,
            String employeeEmail,
            String employeePassword
    ) {
        return bootstrap.createConfiguredDemoAccounts(
                employeeRepository,
                passwordEncoder,
                enabled,
                adminEmail,
                adminPassword,
                employeeEmail,
                employeePassword,
                "Demo Employee"
        );
    }
}
