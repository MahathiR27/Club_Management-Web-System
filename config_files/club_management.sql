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
  room_assigned VARCHAR(7),
  room_type VARCHAR(32),
  date_requested  DATE,
  time_requested_from  TIME,
  time_requested_to  TIME,
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