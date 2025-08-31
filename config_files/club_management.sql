DROP DATABASE IF EXISTS club_management;
CREATE DATABASE club_management;
USE club_management;

CREATE TABLE user (
  uid INT NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  pass VARCHAR(255) NOT NULL,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(11) NOT NULL,
  status VARCHAR(32) DEFAULT 'pending',
  PRIMARY KEY (uid)
);

CREATE TABLE student (
  uid INT NOT NULL,
  department VARCHAR(5) NOT NULL,
  admission_sem VARCHAR(15) NOT NULL,
  PRIMARY KEY (uid),
  CONSTRAINT fk_student_user
    FOREIGN KEY (uid) REFERENCES user(uid)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE advisor (
  uid INT NOT NULL,
  department VARCHAR(120) NOT NULL,
  initial VARCHAR(16) NOT NULL,
  designation VARCHAR(120) NOT NULL,
  room VARCHAR(32),
  PRIMARY KEY (uid),
  CONSTRAINT fk_advisor_user
    FOREIGN KEY (uid) REFERENCES user(uid)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE oca (
  uid  INT  NOT NULL,
  PRIMARY KEY (uid),
  CONSTRAINT fk_oca_user
    FOREIGN KEY (uid) REFERENCES user(uid)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE club (
  cid VARCHAR(10) NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(160) NOT NULL,
  status VARCHAR(32) DEFAULT 'active',
  advisor_uid  INT,
  PRIMARY KEY (cid),
  CONSTRAINT fk_club_advisor
    FOREIGN KEY (advisor_uid) REFERENCES advisor(uid)
    ON UPDATE CASCADE
);

CREATE TABLE page (
  pid INT NOT NULL AUTO_INCREMENT,
  cid VARCHAR(10) NOT NULL,
  PRIMARY KEY (pid),
  CONSTRAINT fk_page_club
    FOREIGN KEY (cid) REFERENCES club(cid)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE announcement (
  aid INT NOT NULL AUTO_INCREMENT,
  type VARCHAR(10) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  date_time DATETIME NOT NULL,
  pid INT NOT NULL,
  uid INT NOT NULL,
  PRIMARY KEY (aid),
  CONSTRAINT fk_ann_page
    FOREIGN KEY (pid) REFERENCES page(pid)
    ON UPDATE CASCADE,
  CONSTRAINT fk_ann_user
    FOREIGN KEY (uid) REFERENCES user(uid)
    ON UPDATE CASCADE
);

CREATE TABLE requisition (
  rid INT NOT NULL AUTO_INCREMENT,
  cid VARCHAR(10) NOT NULL,
  date_time DATETIME NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  PRIMARY KEY (rid),
  CONSTRAINT fk_req_club
    FOREIGN KEY (cid) REFERENCES club(cid)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE applied (
  uid INT NOT NULL,
  cid VARCHAR(10) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'applied',
  PRIMARY KEY (uid, cid),
  CONSTRAINT fk_applied_user
    FOREIGN KEY (uid) REFERENCES user(uid)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_applied_club
    FOREIGN KEY (cid) REFERENCES club(cid)
    ON UPDATE CASCADE
);

CREATE TABLE members (
  cid VARCHAR(10) NOT NULL,
  student_uid INT NOT NULL,
  position VARCHAR(15),
  joining_sem VARCHAR(15),
  PRIMARY KEY (cid, student_uid),
  CONSTRAINT fk_members_club
    FOREIGN KEY (cid) REFERENCES club(cid)
    ON UPDATE CASCADE,
  CONSTRAINT fk_members_student
    FOREIGN KEY (student_uid) REFERENCES student(uid)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE bill (
  rid INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  documents MEDIUMBLOB NOT NULL,
  PRIMARY KEY (rid),
  CONSTRAINT fk_bill_req
    FOREIGN KEY (rid) REFERENCES requisition(rid)
    ON UPDATE CASCADE
);

CREATE TABLE room (
  rid INT NOT NULL,
  room_type VARCHAR(32),
  date_requested  DATE,
  time_requested_from  TIME,
  time_requested_to  TIME,
  room_assigned VARCHAR(7) DEFAULT "Pending",
  PRIMARY KEY (rid),
  CONSTRAINT fk_room_req
    FOREIGN KEY (rid) REFERENCES requisition(rid)
    ON UPDATE CASCADE
);

CREATE TABLE approval (
  oca_uid INT  NOT NULL,
  rid INT NOT NULL,
  PRIMARY KEY (oca_uid, rid),
  CONSTRAINT fk_approval_oca
    FOREIGN KEY (oca_uid) REFERENCES oca(uid)
    ON UPDATE CASCADE,
  CONSTRAINT fk_approval_req
    FOREIGN KEY (rid) REFERENCES requisition(rid)
    ON UPDATE CASCADE
);

-- Populating

INSERT INTO user (uid, email, pass, name, phone) VALUES
(24341269, 'md.mahathir.alam@g.bracu.ac.bd', '12345', 'Md. Mahathir Alam', '01854943188'),
(24241289, 'mahinul.islam.mahin@g.bracu.ac.bd', '12345', 'Mahinul Islam', '01518918916'),
(23301451, 'arunima.das1@bracu.ac.bd','12345', 'Arunima Das', '01782345678'),
(24241235, 'tahmidul.islam.tanmoy@bracu.ac.bd', '12345', 'Syed Tahmidul Islam Tanmoy', '01912876543'),
(23311234, 'tahsin.haque.fake@g.bracu.ac.bd', '12345', 'Tahsin Haque', '01693452781'),
(24302345, 'farhan.kabir.fake@g.bracu.ac.bd', '12345', 'Farhan Kabir', '01578234961'),
(24305678, 'nabila.rahman.fake@g.bracu.ac.bd', '12345', 'Nabila Rahman', '01309283746'),
(24308912, 'arif.uzzaman.fake@g.bracu.ac.bd', '12345', 'Arif Uzzaman', '01873649250'),
(25301234, 'maliha.khan.fake@g.bracu.ac.bd', '12345', 'Maliha Khan', '01756982341'),
(25304567, 'rifat.chowdhury.fake@g.bracu.ac.bd', '12345', 'Rifat Chowdhury', '01934567821'),
(25307891, 'mehnaz.sultana.fake@g.bracu.ac.bd', '12345', 'Mehnaz Sultana', '01401726394'),
(25310123, 'tawsif.ahmed.fake@g.bracu.ac.bd', '12345', 'Tawsif Ahmed', '01682397456'),
(25313456, 'tanvir.hasan.fake@g.bracu.ac.bd', '12345', 'Tanvir Hasan', '01890543217'),
(25316789, 'reshmi.akter.fake@g.bracu.ac.bd', '12345', 'Reshmi Akter', '01769012345'),
(25319012, 'raiyan.islam.fake@g.bracu.ac.bd', '12345', 'Raiyan Islam', '01501928374'),
(25322334, 'nishat.tasnim.fake@g.bracu.ac.bd', '12345', 'Nishat Tasnim', '01307596824'),

(623781, 'sadia.afrin.fake@g.bracu.ac.bd', '12345', 'Sadia Afrin', '01754356288'), -- Advisors
(623782, 'tasnim.rahman.fake@bracu.ac.bd', '12345', 'Tasnim Rahman', '01782345671'),
(623783, 'sakib.karim.fake@bracu.ac.bd', '12345', 'Sakib Karim', '01923874652'),
(623784, 'nayeem.hassan.fake@bracu.ac.bd', '12345', 'Nayeem Hassan', '01692837465'),
(623785, 'mehnaz.akter.fake@bracu.ac.bd', '12345', 'Mehnaz Akter', '01589237461'),

(538741, 'mas.rafi.islam.fake@bracu.ac.bd', '12345', 'Mas Rafi Islam', '01521266159'),
(538742, 'abdullah.al.noman.fake@g.bracu.ac.bd', '12345', 'Abdullah Al Noman', '01521766134'),
(538743, 'shahriar.tanvir.fake@bracu.ac.bd', '12345', 'Shahriar Tanvir', '01763849205'),
(538744, 'fahim.rezwan.fake@bracu.ac.bd', '12345', 'Fahim Rezwan', '01892735641'),
(538745, 'arafat.hoque.fake@bracu.ac.bd', '12345', 'Arafat Hoque', '01938472659');


INSERT INTO student VALUES
(23301451, 'CSE', 'Summer 2023'),
(24241289, 'CSE', 'Summer 2023'),
(24241235, 'MNS', 'Fall 2023'),
(23311234, 'PHR', 'Spring 2024'),
(24302345, 'LLB', 'Summer 2024'),
(24305678, 'ARC', 'Fall 2024'),
(24308912, 'CSE', 'Spring 2025'),
(25301234, 'BBS', 'Summer 2025'),
(25304567, 'MNS', 'Fall 2024'),
(25307891, 'PHR', 'Spring 2023'),
(25310123, 'LLB', 'Summer 2023'),
(25313456, 'ARC', 'Spring 2024'),
(25316789, 'CSE', 'Summer 2024'),
(25319012, 'BBS', 'Spring 2025'),
(25322334, 'MNS', 'Summer 2025'),
(24341269, 'CSE', 'Fall 2024');

INSERT INTO advisor VALUES
(623781, 'CSE', 'AHS', 'Professor', '4G-10D'),
(623782, 'CSE', 'TRH', 'Associate Professor', '4G-11D'),
(623783, 'CSE', 'SKK', 'Assistant Professor', '4G-12D'),
(623784, 'MNS', 'NHS', 'Professor', '4F-5D'),
(623785, 'EEE', 'MAA', 'Associate Professor', '3E-7B');

INSERT INTO oca VALUES
(538741),
(538742),
(538743),
(538744),
(538745);

INSERT INTO club (cid, email, name, advisor_uid) VALUES
('ROBU', 'roboticsclub@bracu.ac.bd', 'Robotics Club', 623781),
('BUCUC', 'culturalclub@bracu.ac.bd', 'Cultural Club', 623785),
('BUDC', 'debateclub@bracu.ac.bd', 'Debate Club', 623784),
('BUCC', 'computerclub@bracu.ac.bd', 'Computer Club', 623782),
('BUESC', 'esportsclub@bracu.ac.bd', 'Esports Club', 623783);

INSERT INTO requisition (cid, date_time) VALUES
('ROBU', '2025-09-20 10:00:00'),
('BUCUC', '2025-09-21 14:30:00'),
('BUESC', '2025-09-22 09:15:00'),
('BUDC', '2025-09-22 16:45:00'),
('BUCC', '2025-09-23 11:00:00'),
('ROBU', '2025-09-23 15:30:00');

INSERT INTO room (rid, room_type, date_requested, time_requested_from, time_requested_to) VALUES
(1, 'Class Room', '2025-09-20', '10:00:00', '12:00:00'),
(2, 'Conference Room', '2025-09-21', '14:30:00', '16:00:00'),
(3, 'Auditorium','2025-09-22', '09:15:00', '11:15:00'),
(4, 'Theatre', '2025-09-22', '16:45:00', '18:30:00');

INSERT INTO members (cid, student_uid, position, joining_sem) VALUES
('ROBU', 23301451, 'President', 'Summer 2023'),
('ROBU', 25316789, 'Vice President', 'Summer 2024'),
('BUCUC', 24305678, 'President', 'Spring 2023'),
('BUCUC', 25313456, 'Member', 'Spring 2024'),
('BUDC', 24241289, 'President', 'Fall 2023'),
('BUDC', 25310123, 'Member', 'Summer 2023'),
('BUCC', 24302345, 'President', 'Summer 2024'),
('BUCC', 25301234, 'Member', 'Summer 2025'),
('BUESC', 23311234, 'President', 'Spring 2024'),
('BUESC', 25307891, 'Member', 'Spring 2023');

INSERT INTO page (pid, cid) VALUES
(1, 'ROBU'),
(2, 'BUCUC'),
(3, 'BUDC'),
(4, 'BUCC'),
(5, 'BUESC')
ON DUPLICATE KEY UPDATE cid = VALUES(cid);

INSERT INTO announcement (`type`, subject, body, date_time, pid, uid) VALUES
('notice', 'Welcome', 'Semester starts soon',   '2025-08-24 09:00:00', 1, 24341269),
('event', 'Club Fair', 'UB3, 11am', '2025-08-26 11:00:00', 1, 24341269),
('update', 'Room Change', 'R212 -> R210', '2025-08-27 10:30:00', 2, 623785),
('event', 'Workshop', 'Git basics', '2025-08-28 15:00:00', 4, 623782),
('notice', 'Recruitment', 'Apply online', '2025-08-29 12:00:00', 5, 24308912),
('event', 'Debate', 'Tryouts Fri', '2025-08-30 17:00:00', 3, 24241289),
('update', 'Agenda', 'Check mail', '2025-08-31 10:00:00', 1, 25316789),
('notice', 'Budget', 'Submit forms', '2025-09-01 09:30:00', 2, 538741);

INSERT INTO approval (oca_uid, rid) VALUES
(538741, 1),
(538742, 2);

UPDATE user SET status='active' WHERE uid IN (538741, 538742, 538743, 538744, 538745, 23301451, 25316789);
