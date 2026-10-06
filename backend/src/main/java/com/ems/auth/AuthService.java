package com.ems.auth;

import com.ems.employee.Employee;
import com.ems.employee.EmployeeRepository;
import com.ems.employee.EmployeeResponse;
import com.ems.shared.UnauthorizedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final EmployeeRepository employeeRepository;
    private final JwtService jwtService;

    public AuthService(
            AuthenticationManager authenticationManager,
            EmployeeRepository employeeRepository,
            JwtService jwtService
    ) {
        this.authenticationManager = authenticationManager;
        this.employeeRepository = employeeRepository;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password())
        );
        Employee employee = employeeRepository.findByEmailIgnoreCase(email)
                .filter(Employee::isActive)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));
        return new LoginResponse(jwtService.issueToken(employee), EmployeeResponse.from(employee));
    }
}
