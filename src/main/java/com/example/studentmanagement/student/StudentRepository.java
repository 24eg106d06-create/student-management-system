package com.example.studentmanagement.student;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    @Query("""
            select s from Student s where
            lower(s.name) like lower(concat('%', :query, '%')) or
            lower(s.email) like lower(concat('%', :query, '%')) or
            lower(s.phoneNumber) like lower(concat('%', :query, '%')) or
            lower(s.course) like lower(concat('%', :query, '%'))
            order by s.name asc
            """)
    List<Student> search(@Param("query") String query);
}
