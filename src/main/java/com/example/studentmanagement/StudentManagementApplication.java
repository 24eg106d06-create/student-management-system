package com.example.studentmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.event.EventListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
public class StudentManagementApplication {
    private static final Logger log = LoggerFactory.getLogger(StudentManagementApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(StudentManagementApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void showApplicationUrl(ApplicationReadyEvent event) {
        String port = event.getApplicationContext().getEnvironment().getProperty("local.server.port", "8080");
        log.info("Student Management System is ready. Open http://localhost:{}", port);
    }
}
