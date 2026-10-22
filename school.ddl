-- ============================================================
-- 1. TABLE CREATION (DDL)
-- ============================================================

CREATE TABLE students (
    student_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    enrollment_date DATE DEFAULT CURRENT_DATE NOT NULL
);

CREATE TABLE courses (
    course_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL UNIQUE,
    course_title VARCHAR(100) NOT NULL,
    credits INT NOT NULL
);

CREATE TABLE enrollments (
    enrollment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    grade VARCHAR(5),
    enrolled_at DATE DEFAULT CURRENT_DATE NOT NULL,
    
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_course FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    
    -- Prevents the same student from enrolling in the same course twice
    CONSTRAINT unique_student_course UNIQUE (student_id, course_id)
);

-- ============================================================
-- 2. DATA INSERTION (DML)
-- ============================================================

-- Insert 4 Students (1 student left without enrollments for Query 4)
INSERT INTO students (first_name, last_name, email) VALUES
('Alice', 'Smith', 'alice.smith@example.com'),
('Bob', 'Jones', 'bob.jones@example.com'),
('Charlie', 'Brown', 'charlie.brown@example.com'),
('Diana', 'Prince', 'diana.prince@example.com');

-- Insert 3 Courses
INSERT INTO courses (course_code, course_title, credits) VALUES
('CS101', 'Introduction to Computer Science', 3),
('MATH201', 'Calculus II', 4),
('ENG102', 'English Composition', 3);

-- Insert 5 Enrollments
INSERT INTO enrollments (student_id, course_id, grade) VALUES
(1, 1, 'A'),   -- Alice in CS101
(1, 2, 'B+'),  -- Alice in MATH201
(2, 1, 'B'),   -- Bob in CS101
(2, 3, 'A-'),  -- Bob in ENG102
(3, 2, 'C');   -- Charlie in MATH201

-- ============================================================
-- 3. THE FIVE QUERIES
-- ============================================================

-- Query 1: All courses for one student (by name)
SELECT 
    s.first_name,
    s.last_name,
    c.course_code,
    c.course_title,
    e.grade
FROM students s
JOIN enrollments e ON s.student_id = e.student_id
JOIN courses c ON e.course_id = c.course_id
WHERE s.first_name = 'Alice' AND s.last_name = 'Smith';

-- Query 2: All students on one course (by course title or code)
SELECT 
    c.course_code,
    c.course_title,
    s.first_name,
    s.last_name,
    s.email,
    e.grade
FROM courses c
JOIN enrollments e ON c.course_id = e.course_id
JOIN students s ON e.student_id = s.student_id
WHERE c.course_code = 'CS101';

-- Query 3: The number of students per course
SELECT 
    c.course_code,
    c.course_title,
    COUNT(e.student_id) AS student_count
FROM courses c
LEFT JOIN enrollments e ON c.course_id = e.course_id
GROUP BY c.course_id, c.course_code, c.course_title;

-- Query 4: Students who have no enrollments
SELECT 
    s.student_id,
    s.first_name,
    s.last_name,
    s.email
FROM students s
LEFT JOIN enrollments e ON s.student_id = e.student_id
WHERE e.enrollment_id IS NULL;

-- Query 5: Update of one enrollment's grade (e.g., updating Charlie's grade in MATH201)
UPDATE enrollments
SET grade = 'B'
WHERE student_id = (SELECT student_id FROM students WHERE first_name = 'Charlie' AND last_name = 'Brown')
  AND course_id = (SELECT course_id FROM courses WHERE course_code = 'MATH201');