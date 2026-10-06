CREATE TABLE employees (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(254) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    access_role VARCHAR(32) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    token_version INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_employees_email UNIQUE (email)
);

CREATE TABLE tasks (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(160) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    due_date DATE NOT NULL,
    category VARCHAR(80) NOT NULL,
    status VARCHAR(32) NOT NULL,
    employee_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_tasks_employee FOREIGN KEY (employee_id) REFERENCES employees (id),
    INDEX idx_tasks_employee_due_date (employee_id, due_date),
    INDEX idx_tasks_status (status)
);
