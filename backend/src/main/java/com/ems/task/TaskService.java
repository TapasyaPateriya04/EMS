package com.ems.task;

import com.ems.employee.Employee;
import com.ems.employee.EmployeeRepository;
import com.ems.employee.Role;
import com.ems.shared.ConflictException;
import com.ems.shared.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;

    public TaskService(TaskRepository taskRepository, EmployeeRepository employeeRepository) {
        this.taskRepository = taskRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> listTasks(Employee currentUser) {
        List<TaskItem> tasks = currentUser.getRole() == Role.ADMIN
                ? taskRepository.findAllByOrderByDueDateAsc()
                : taskRepository.findAllByEmployeeIdOrderByDueDateAsc(currentUser.getId());
        return tasks.stream().map(TaskResponse::from).toList();
    }

    @Transactional
    public TaskResponse createTask(CreateTaskRequest request) {
        Employee employee = employeeRepository.findById(request.employeeId())
                .filter(Employee::isActive)
                .orElseThrow(() -> new NotFoundException("Active employee not found."));
        TaskItem task = new TaskItem(
                request.title(),
                request.description(),
                request.dueDate(),
                request.category(),
                employee
        );
        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateStatus(Long taskId, TaskStatus requestedStatus, Employee currentUser) {
        TaskItem task = currentUser.getRole() == Role.ADMIN
                ? taskRepository.findById(taskId).orElseThrow(() -> new NotFoundException("Task not found."))
                : taskRepository.findByIdAndEmployeeId(taskId, currentUser.getId())
                        .orElseThrow(() -> new NotFoundException("Task not found."));

        if (currentUser.getRole() == Role.EMPLOYEE && !isAllowedEmployeeTransition(task.getStatus(), requestedStatus)) {
            throw new ConflictException("This task status transition is not allowed.");
        }
        task.setStatus(requestedStatus);
        return TaskResponse.from(task);
    }

    private boolean isAllowedEmployeeTransition(TaskStatus current, TaskStatus requested) {
        return (current == TaskStatus.NEW && requested == TaskStatus.ACTIVE)
                || (current == TaskStatus.ACTIVE
                && (requested == TaskStatus.COMPLETED || requested == TaskStatus.FAILED));
    }
}
