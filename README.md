# Student Management System

A Java full stack application for keeping student records in one place. The Spring Boot application serves a browser interface and a JSON REST API; MySQL stores the records.

## Features

- Create, view, edit, and delete student records
- Search by name, email, phone number, or course
- Validate required fields, email addresses, phone numbers, and study years
- Prevent duplicate email addresses
- Dashboard totals for students, courses, and study years
- Responsive interface for desktop and mobile screens

## Requirements

- Java 25 (latest LTS)
- Maven 3.9+
- Docker Desktop or a local MySQL 8 server

## Run with Docker

Start the database from the project directory:

```bash
docker compose up -d mysql
```

The default local credentials are `student_app` / `change-me`. To change them, copy `.env.example` to `.env` and update the values before starting the database. Set matching `DB_USERNAME` and `DB_PASSWORD` environment variables for Spring Boot as well. Keep `.env` out of version control.

Run Maven with Java 25. For a Homebrew installation on macOS:

```bash
export JAVA_HOME="$(brew --prefix openjdk@25)/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
mvn -version
mvn spring-boot:run
```

Confirm `mvn -version` reports Java 25; running with an older JDK (such as Java 21) causes a class-file version error.

Open [http://localhost:8080](http://localhost:8080). To connect to a database with different settings, set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and optionally `SERVER_PORT` in the environment before starting Spring Boot.

## REST API

Base path: `/api/students`

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/students` | List all students, sorted by name |
| `GET` | `/api/students?search=lee` | Search name, email, phone, or course |
| `GET` | `/api/students/{id}` | Get a student |
| `POST` | `/api/students` | Create a student |
| `PUT` | `/api/students/{id}` | Update a student |
| `DELETE` | `/api/students/{id}` | Delete a student |

Create and update requests use JSON:

```json
{
  "name": "Jordan Lee",
  "email": "jordan.lee@example.edu",
  "phoneNumber": "+1 555 010 2040",
  "course": "Computer Science",
  "yearOfStudy": 2
}
```

Invalid input returns HTTP `400` with field details. Duplicate email addresses return HTTP `409`; requests for missing IDs return HTTP `404`.

## Project structure

```text
src/main/java/com/example/studentmanagement/
  student/    Student entity, repository, service, and REST controller
  web/        Browser route and API error handling
src/main/resources/
  static/     CSS and browser JavaScript
  templates/  Thymeleaf page
```
