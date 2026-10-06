package com.ems;

import com.ems.employee.Employee;
import com.ems.employee.EmployeeRepository;
import com.ems.employee.Role;
import com.ems.task.TaskItem;
import com.ems.task.TaskRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class WorkspaceAuthorizationTest {
    private static final String ADMIN_PASSWORD = "Administrator-Pass-123";
    private static final String EMPLOYEE_PASSWORD = "Employee-Pass-123";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private Employee employee;
    private TaskItem employeeTask;

    @BeforeEach
    void setUp() {
        taskRepository.deleteAll();
        employeeRepository.deleteAll();
        employeeRepository.save(new Employee(
                "Workspace Admin",
                "admin@ems.test",
                passwordEncoder.encode(ADMIN_PASSWORD),
                Role.ADMIN,
                true
        ));
        employee = employeeRepository.save(new Employee(
                "Sam Rivera",
                "sam@ems.test",
                passwordEncoder.encode(EMPLOYEE_PASSWORD),
                Role.EMPLOYEE,
                true
        ));
        Employee otherEmployee = employeeRepository.save(new Employee(
                "Jules Chen",
                "jules@ems.test",
                passwordEncoder.encode(EMPLOYEE_PASSWORD),
                Role.EMPLOYEE,
                true
        ));
        employeeTask = taskRepository.save(new TaskItem(
                "Prepare release notes",
                "Gather the final release details.",
                LocalDate.now().plusDays(2),
                "Operations",
                employee
        ));
        taskRepository.save(new TaskItem(
                "Review onboarding",
                "Check the first-week plan.",
                LocalDate.now().plusDays(4),
                "People",
                otherEmployee
        ));
    }

    @Test
    void employeesCannotReadTheTeamDirectoryAndOnlyReadTheirOwnTasks() throws Exception {
        String token = login("sam@ems.test", EMPLOYEE_PASSWORD);

        mockMvc.perform(get("/api/employees").header("Authorization", bearer(token)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/tasks").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Prepare release notes"))
                .andExpect(jsonPath("$[0].title").value(not("Review onboarding")));
    }

    @Test
    void employeeCannotChangeAnotherEmployeesTask() throws Exception {
        String token = login("jules@ems.test", EMPLOYEE_PASSWORD);

        mockMvc.perform(patch("/api/tasks/{id}/status", employeeTask.getId())
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"COMPLETED\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void employeeCanAdvanceTheirOwnTaskThroughAllowedStates() throws Exception {
        String token = login("sam@ems.test", EMPLOYEE_PASSWORD);

        mockMvc.perform(patch("/api/tasks/{id}/status", employeeTask.getId())
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"ACTIVE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        mockMvc.perform(patch("/api/tasks/{id}/status", employeeTask.getId())
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"COMPLETED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        mockMvc.perform(patch("/api/tasks/{id}/status", employeeTask.getId())
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"ACTIVE\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void administratorCanReadDirectoryAndCreateEmployee() throws Exception {
        String token = login("admin@ems.test", ADMIN_PASSWORD);

        mockMvc.perform(get("/api/employees").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));

        mockMvc.perform(post("/api/employees")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Taylor Morgan",
                                  "email": "taylor@ems.test",
                                  "password": "Temporary-Pass-123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("taylor@ems.test"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }

    @Test
    void passwordChangeInvalidatesPreviouslyIssuedTokens() throws Exception {
        String oldToken = login("sam@ems.test", EMPLOYEE_PASSWORD);

        mockMvc.perform(post("/api/auth/change-password")
                        .header("Authorization", bearer(oldToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "currentPassword": "Employee-Pass-123",
                                  "newPassword": "Changed-Password-2026!"
                                }
                                """))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/tasks").header("Authorization", bearer(oldToken)))
                .andExpect(status().isUnauthorized());

        String newToken = login("sam@ems.test", "Changed-Password-2026!");
        mockMvc.perform(get("/api/tasks").header("Authorization", bearer(newToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new Credentials("sam@ems.test", EMPLOYEE_PASSWORD)
                        )))
                .andExpect(status().isUnauthorized());
    }

    private String login(String email, String password) throws Exception {
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new Credentials(email, password))))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("token").asText();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private record Credentials(String email, String password) {
    }
}
