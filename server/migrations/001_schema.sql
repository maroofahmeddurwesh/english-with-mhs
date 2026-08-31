-- ============================================================
-- English With MHS — Complete MySQL Schema
-- Run: node scripts/migrate.js
-- ============================================================

-- Drop and recreate for a clean slate on every migration run
DROP DATABASE IF EXISTS english_portal;
CREATE DATABASE english_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE english_portal;

-- ─── Admin / Teacher Users ────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(254) NOT NULL,
  phone         VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin', 'teacher') NOT NULL DEFAULT 'teacher',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ─── Students (Separate from Admin Users) ────────────────────
CREATE TABLE IF NOT EXISTS students (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(254) NOT NULL,
  phone         VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_students_email (email)
) ENGINE=InnoDB;

-- ─── Courses ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  description  TEXT NOT NULL,
  fee          DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  duration     VARCHAR(100) NOT NULL,
  level        VARCHAR(100) DEFAULT 'All Levels',
  teacher_name VARCHAR(150) DEFAULT 'Sir Muhammad Huzaifa Siddiqui',
  image_url    VARCHAR(500),
  is_active    TINYINT(1) NOT NULL DEFAULT 1,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_courses_is_active (is_active)
) ENGINE=InnoDB;

-- ─── Slots ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS slots (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id        INT UNSIGNED NOT NULL,
  days_of_week     VARCHAR(100) NOT NULL COMMENT 'e.g. Mon, Wed, Fri',
  start_time       TIME NOT NULL,
  end_time         TIME NOT NULL,
  batch_start_date DATE,
  batch_end_date   DATE,
  max_capacity     SMALLINT UNSIGNED NOT NULL DEFAULT 10,
  booked_count     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  zoom_link        VARCHAR(500),
  is_active        TINYINT(1) NOT NULL DEFAULT 1,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_slots_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  KEY idx_slots_course_id (course_id),
  KEY idx_slots_is_active (is_active)
) ENGINE=InnoDB;

-- ─── Bookings ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_ref        VARCHAR(20) NOT NULL COMMENT 'e.g. MHS-849201',
  student_id         INT UNSIGNED,
  student_name       VARCHAR(200) NOT NULL,
  student_email      VARCHAR(254) NOT NULL,
  student_phone      VARCHAR(20) NOT NULL,
  course_id          INT UNSIGNED NOT NULL,
  slot_id            INT UNSIGNED NOT NULL,
  transaction_id     VARCHAR(100) NOT NULL,
  receipt_image_url  VARCHAR(500) NOT NULL,
  payment_method     VARCHAR(50) NOT NULL DEFAULT 'Easypaisa',
  status             ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  rejection_reason   TEXT,
  zoom_meeting_link  VARCHAR(500),
  approved_at        DATETIME,
  rejected_at        DATETIME,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_booking_ref (booking_ref),
  UNIQUE KEY uq_transaction_id (transaction_id),
  CONSTRAINT fk_bookings_course FOREIGN KEY (course_id) REFERENCES courses(id),
  CONSTRAINT fk_bookings_slot   FOREIGN KEY (slot_id)   REFERENCES slots(id),
  CONSTRAINT fk_bookings_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
  KEY idx_bookings_student_email (student_email),
  KEY idx_bookings_status (status),
  KEY idx_bookings_created_at (created_at)
) ENGINE=InnoDB;

-- ─── Payment Methods ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_methods (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(50) NOT NULL,
  account_title  VARCHAR(150),
  account_number VARCHAR(50),
  iban           VARCHAR(60),
  instructions   TEXT,
  is_active      TINYINT(1) NOT NULL DEFAULT 1,
  display_order  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─── Reviews ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_name  VARCHAR(150) NOT NULL,
  course_title  VARCHAR(255) NOT NULL,
  rating        TINYINT UNSIGNED NOT NULL DEFAULT 5 COMMENT '1 to 5',
  comment       TEXT NOT NULL,
  is_approved   TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Admin approves before going live',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_reviews_is_approved (is_approved)
) ENGINE=InnoDB;

-- ─── Contact Messages ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  email      VARCHAR(254) NOT NULL,
  phone      VARCHAR(20),
  subject    VARCHAR(255) NOT NULL,
  message    TEXT NOT NULL,
  is_read    TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_contact_is_read (is_read)
) ENGINE=InnoDB;

-- ─── Announcements ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id  INT UNSIGNED COMMENT 'NULL = global announcement',
  title      VARCHAR(255) NOT NULL,
  body       TEXT NOT NULL,
  is_active  TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_announce_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─── Chat Messages (Live Chat) ────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id   INT UNSIGNED NOT NULL,
  sender_role  ENUM('student', 'admin') NOT NULL,
  message_text TEXT NOT NULL,
  is_read      TINYINT(1) NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  KEY idx_chat_student_id (student_id),
  KEY idx_chat_created_at (created_at)
) ENGINE=InnoDB;

-- ─── Seed: Admin (Sir Huzaifa) ────────────────────────────────
-- Password: Admin@1234
INSERT IGNORE INTO users (name, email, password_hash, role)
VALUES (
  'Sir Muhammad Huzaifa Siddiqui',
  'huzaifa@englishwithmhs.com',
  '$2b$12$eIKMV7dbcCFeI6yuV4nRlu4YKMuSehrHRslqJB1GwxIxO0DWwhgJO',
  'admin'
);

-- ─── Seed: Payment Methods ────────────────────────────────────
INSERT IGNORE INTO payment_methods (id, name, account_title, account_number, iban, instructions, display_order)
VALUES
  (1, 'NayaPay',      'MUHAMMAD HUZAIFA SIDDIQUI', '03312304820',    NULL,                       'Transfer via IBFT / NayaPay App to the above account number.', 1),
  (2, 'Meezan Bank',  'MUHAMMAD HUZAIFA SIDDIQUI', '01110115094958', 'PK66MEZN0001110115094958', 'Transfer exact amount via IBFT / Internet Banking to the above IBAN.', 2);

-- ─── Seed: Sample Courses ─────────────────────────────────────
INSERT IGNORE INTO courses (id, title, description, fee, duration, level, teacher_name, is_active, image_url)
VALUES
  (1, 'Spoken English Fluency',       'Overcome hesitation, build confidence, and speak English naturally. Daily conversational practice, vocabulary drills, and real-world scenarios.', 10000.00, '4 Weeks', 'Beginner - Intermediate', 'Sir Muhammad Huzaifa Siddiqui', 1, '/course-1.jpg'),
  (2, 'IELTS Academic Masterclass',   'Complete preparation for IELTS Academic exam. Covers Reading, Listening, Writing (Task 1 & 2), and Speaking with official mock tests.', 15000.00,  '6 Weeks', 'Intermediate - Advanced',  'Sir Muhammad Huzaifa Siddiqui', 1, '/course-2.jpg'),
  (3, 'Business English & Communication', 'Professional email writing, interview preparation, presentation skills, and corporate communication for career growth.', 12000.00, '4 Weeks', 'Intermediate', 'Sir Muhammad Huzaifa Siddiqui', 1, '/course-3.jpg'),
  (4, 'Grammar & Writing Mechanics',  'Master English grammar rules, tenses, punctuation, and essay writing from scratch. Perfect for students and professionals alike.', 8000.00,  '4 Weeks', 'All Levels', 'Sir Muhammad Huzaifa Siddiqui', 1, '/course-4.jpg');

-- ─── Seed: Sample Slots ───────────────────────────────────────
INSERT IGNORE INTO slots (course_id, days_of_week, start_time, end_time, batch_start_date, batch_end_date, max_capacity, booked_count, is_active)
VALUES
  (1, 'Mon, Wed, Fri', '18:00:00', '19:30:00', '2026-09-01', '2026-09-30', 12, 4, 1),
  (1, 'Tue, Thu, Sat', '20:00:00', '21:30:00', '2026-09-02', '2026-09-30', 12, 2, 1),
  (2, 'Mon, Wed, Fri', '19:00:00', '20:30:00', '2026-09-01', '2026-10-15', 10, 7, 1),
  (3, 'Sat, Sun',      '16:00:00', '18:00:00', '2026-09-06', '2026-10-04', 15, 3, 1),
  (4, 'Mon, Wed, Fri', '17:00:00', '18:00:00', '2026-09-01', '2026-09-30', 15, 1, 1);

-- ─── Seed: Real Reviews ───────────────────────────
INSERT IGNORE INTO reviews (student_name, course_title, rating, comment, is_approved)
VALUES
  ('Sidra Siddiqui', 'Spoken English Fluency', 5, 'sir huzaifa has unique style of teaching, he makes lectures easy to understand and deliver it with practical example so that students can remember it easily. I appreciate his teaching style and recommend him 100%', 1),
  ('Syed Usman', 'Spoken English Fluency', 5, 'I learnt English language from sir huzaifa and his way of teaching is outstanding. i improved alot by taking his classes. fully recommended', 1),
  ('MJ Dev', 'Spoken English Fluency', 5, 'I have experienced the English level 1 course from Sir Huzaifa, it''s been very exciting 2 months we have learned beyond English language about some lessons of real life scenerios and some important islamic perspective which needs to be understood as a Muslim over all I highly recommend you to take some profit from the experience of Sir Huzaifa and I thank sir Huzaifa for being an awesome mentor', 1),
  ('Ali ImRan', 'Spoken English Fluency', 5, 'He''s English Teaching Skills are Amazing and Have Vast Vocabulary Knowledge ,, I highly Recommend if you want to make your English Spoken fluently you have to Join English with MHS', 1),
  ('Bushra Siraj', 'Spoken English Fluency', 5, 'I strongly recommend him as an excellent English trainer. His teaching style is interactive, and engaging. Anyone looking to improve the language will definitely benefit from this valuable page.', 1),
  ('Lodhi Sahab', 'Spoken English Fluency', 5, 'This really helps me understand the difference now! The teaching style is very effective and more informative👏👏', 1),
  ('Irfan Ali Abbasi', 'Spoken English Fluency', 5, 'As a parent, I highly recommend him as English language instructor for his dedication and professionalism. he creates a supportive and engaging learning environment where students feel confident to learn and grow. I have seen a clear improvement in my daughter''s English skills and confidence. His teaching style is effective, patient, and truly inspiring.', 1),
  ('Sabahar Irfan', 'Spoken English Fluency', 5, 'I highly recommend him as english language instructor for his excellent teaching skills and dedication. he explains concepts clearly, make lessons engaging in a very fun way and support students always.', 1),
  ('Syed Shabee', 'Spoken English Fluency', 5, 'The teachers are extremely supportive and explain concepts in a very clear and effective way. A great place for students to build strong academic foundations. Highly recommend 🌟👏', 1);

-- ─── Seed: Sample Announcement ────────────────────────────────
INSERT IGNORE INTO announcements (course_id, title, body, is_active)
VALUES
  (NULL, 'September Batches Now Open! 🎓', 'Assalam u Alaikum! September 2026 ke sabhi batches registration ke liye khul gaye hain. Jaldi enroll karein — seats limited hain!', 1);
