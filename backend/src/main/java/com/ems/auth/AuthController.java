package com.ems.auth;

import com.ems.employee.Employee;
import com.ems.employee.EmployeeService;
import com.ems.employee.EmployeeResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final EmployeeService employeeService;

    public AuthController(AuthService authService, EmployeeService employeeService) {
        this.authService = authService;
        this.employeeService = employeeService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public EmployeeResponse currentUser(Authentication authentication) {
        return EmployeeResponse.from((Employee) authentication.getPrincipal());
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication
    ) {
        Employee employee = (Employee) authentication.getPrincipal();
        employeeService.changePassword(employee.getId(), request.currentPassword(), request.newPassword());
        return ResponseEntity.noContent().build();
    }
}
