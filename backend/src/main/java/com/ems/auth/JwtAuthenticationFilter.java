package com.ems.auth;

import com.ems.employee.Employee;
import com.ems.employee.EmployeeRepository;
import com.ems.shared.ApiError;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Locale;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final EmployeeRepository employeeRepository;
    private final ObjectMapper objectMapper;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            EmployeeRepository employeeRepository,
            ObjectMapper objectMapper
    ) {
        this.jwtService = jwtService;
        this.employeeRepository = employeeRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String email = jwtService.extractEmail(authorization.substring(7))
                    .trim()
                    .toLowerCase(Locale.ROOT);
            Employee employee = employeeRepository.findByEmailIgnoreCase(email)
                    .filter(candidate -> candidate.isActive()
                            && candidate.getTokenVersion() == jwtService.extractTokenVersion(authorization.substring(7)))
                    .orElse(null);
            if (employee == null) {
                writeUnauthorized(response);
                return;
            }
            var authentication = new UsernamePasswordAuthenticationToken(
                    employee,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + employee.getRole().name()))
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (JwtException | IllegalArgumentException exception) {
            SecurityContextHolder.clearContext();
            writeUnauthorized(response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void writeUnauthorized(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getOutputStream(), new ApiError("Invalid or expired access token."));
    }
}
