package com.ems.employee;

import com.ems.shared.ConflictException;
import com.ems.shared.InvalidRequestException;
import com.ems.shared.NotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> listEmployees() {
        return employeeRepository.findAllByOrderByNameAsc().stream()
                .map(EmployeeResponse::from)
                .toList();
    }

    @Transactional
    public EmployeeResponse createEmployee(CreateEmployeeRequest request) {
        if (employeeRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ConflictException("An employee with this email already exists.");
        }
        Employee employee = new Employee(
                request.name(),
                request.email(),
                passwordEncoder.encode(request.password()),
                Role.EMPLOYEE,
                true
        );
        return EmployeeResponse.from(employeeRepository.save(employee));
    }

    @Transactional
    public EmployeeResponse setActive(Long id, boolean active) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Employee not found."));
        if (employee.getRole() == Role.ADMIN && !active) {
            throw new ConflictException("Administrator accounts cannot be deactivated here.");
        }
        employee.setActive(active);
        return EmployeeResponse.from(employee);
    }

    @Transactional
    public void changePassword(Long employeeId, String currentPassword, String newPassword) {
        Employee employee = employeeRepository.findById(employeeId)
                .filter(Employee::isActive)
                .orElseThrow(() -> new NotFoundException("Employee not found."));
        if (!passwordEncoder.matches(currentPassword, employee.getPasswordHash())) {
            throw new InvalidRequestException("The current password is incorrect.");
        }
        if (passwordEncoder.matches(newPassword, employee.getPasswordHash())) {
            throw new InvalidRequestException("Choose a password you have not used before.");
        }
        employee.setPasswordHash(passwordEncoder.encode(newPassword));
        employee.incrementTokenVersion();
    }
}
