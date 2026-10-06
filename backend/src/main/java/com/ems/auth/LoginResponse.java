package com.ems.auth;

import com.ems.employee.EmployeeResponse;

public record LoginResponse(String token, EmployeeResponse employee) {
}
