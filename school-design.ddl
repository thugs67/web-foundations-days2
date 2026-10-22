-- Index to optimize querying enrollments by student (e.g., transcripts, class lists)
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);

-- 1. Attempting a duplicate enrollment (Fails due to UNIQUE constraint)
-- This will throw an error: UNIQUE constraint violation (unique_student_course)
INSERT INTO enrollments (student_id, course_id, grade) 
VALUES (1, 1, 'A');

-- 2. Querying a student's full transcript (Utilizes the idx_enrollments_student_id index)
SELECT 
    s.first_name,
    s.last_name,
    c.course_code,
    c.course_title,
    e.grade
FROM enrollments e
JOIN students s ON e.student_id = s.student_id
JOIN courses c ON e.course_id = c.course_id
WHERE e.student_id = 1;