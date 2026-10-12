package com.example.studentmanagement.student;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@Transactional
public class StudentService {
    private final StudentRepository repository;

    public StudentService(StudentRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public List<Student> findAll(String query) {
        if (query == null || query.isBlank()) return repository.findAll(org.springframework.data.domain.Sort.by("name").ascending());
        return repository.search(query.trim());
    }

    @Transactional(readOnly = true)
    public Student findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Student not found"));
    }

    public Student create(Student student) {
        ensureEmailAvailable(student.getEmail(), null);
        student.setEmail(student.getEmail().trim().toLowerCase());
        return repository.save(student);
    }

    public Student update(Long id, Student changes) {
        Student existing = findById(id);
        ensureEmailAvailable(changes.getEmail(), id);
        existing.setName(changes.getName());
        existing.setEmail(changes.getEmail().trim().toLowerCase());
        existing.setPhoneNumber(changes.getPhoneNumber());
        existing.setCourse(changes.getCourse());
        existing.setYearOfStudy(changes.getYearOfStudy());
        return repository.save(existing);
    }

    public void delete(Long id) { repository.delete(findById(id)); }

    private void ensureEmailAvailable(String email, Long id) {
        boolean exists = id == null ? repository.existsByEmailIgnoreCase(email.trim())
                : repository.existsByEmailIgnoreCaseAndIdNot(email.trim(), id);
        if (exists) throw new ResponseStatusException(CONFLICT, "A student with this email already exists");
    }
}
