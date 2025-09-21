
# Club_Management-Web_System
The Club Management System is a web-based application developed to make it easier for both the BRAC University Office of Co-curricular Activities (OCA) and students to manage clubs. It brings together the main tasks of club management into one platform, where students can apply to join clubs, receive updates, while club leaders and OCA staff can oversee requests, share notices, and organize membership records.
The system uses a Node.js backend with REST APIs to handle the database, file uploads, and email notifications. On the other side, the frontend is designed to be responsive and role-based, so that different users, students, leaders, and OCA see and use the features that are only relevant to them. With a well-structured database, the application runs smoothly, keeps records accurate, and ensures faster access to information.
Overall, this project aims to solve everyday problems faced in club management at BRACU by reducing manual work, improving communication, and making the process more transparent for everyone involved.


  

## Dependencies

Install required packages with npm:
```
npm install express mysql2 nodemailer multer
```

  

## Quick start
- Configure database and email in `config_files/config.json` (see `config_files/club_management.sql` for DB schema hints).

- **Start server:** `node  main.js`

  

The server will start on http://localhost:3000 and serves the frontend files under `scripts/` (e.g. `scripts/login.html`).

  

## Features (implemented)

The functionality implemented across backend and frontend scripts includes:

1. **OTP Generator**

	- Backend: `main.js`

		-  `otp_storage` (in-memory map email -> otp)

		-  `otp_generator(email)` — returns an existing OTP for an email or generates a new 6-digit OTP and stores it in `otp_storage`.

		-  `otp_verify(email, otp)` — validates OTP and removes it from storage on success.

		- Endpoint: `POST /otp` — accepts `{ email, otp }` and returns boolean result of `otp_verify`.

		- Email trigger: `POST /email` checks if `subject` contains "OTP"; if so it calls `otp_generator(receiver)` and sets the email body to `Your OTP is: <otp>` before sending.

	- Frontend: `scripts/login.js`

		-  `sendOTP()` — calls `send_email({ receiver: email, subject: 'OTP' })` to request an OTP email.

		-  `verify_otp()` — calls `verify({ email, otp })` which POSTs to `/otp` to confirm.

		- DB: none (OTP is kept in-memory).

  

2. **Email Notifications**

	- Backend: `main.js`

		-  `transporter` — created using `nodemailer.createTransport(...)` with credentials from `config_files/config.json`.

		-  `POST /email` — main email-sending route. Accepts `{ receiver, subject, body }` and uses `transporter.sendMail` to send. Returns `{ success: true/false }`.

	- Usage in code:

		- Account activation email (in `scripts/ocaDashboard.js` at `approveUser`) — server `POST /email` is called via frontend wrapper `send_email()`.

		- Room/bill/position-update notifications: after approval actions the frontend calls the email endpoint to notify clubs/users.

	- Frontend helper (used across scripts): `send_email(email)` — wrapper that POSTs to `/email`.

  

3. **Manage Club Member Roles**

	- Backend: database changes are executed via `POST /query` (the client issues SQL through the generic query endpoint).
	- Frontend: `scripts/studentDashboard.js`

		-  `club_member_list(clubId)` — shows modal with member list (data queried via `get_data`).

		-  `edit_member(member_uid, club_id)` — shows modal to change a member's position.

		-  `confirm_edit_member(member_uid, club_id)` — updates DB via `get_data({ sql: 'UPDATE members SET position = ? WHERE student_uid = ? AND cid = ?', params: [...] })` and then sends notification email via `send_email()`.

	- DB tables: `members` (fields include `student_uid`, `cid`, `position`).

  

4. **Student Account Approvals**

	- Backend: actual SQL executed through `POST /query`.
	- Frontend: `scripts/ocaDashboard.js`

		-  `showAccountVerification()` — loads UI and calls `loadPendingVerifications()`.

		-  `loadPendingVerifications()` — queries `user` table for `status = 'pending'` and renders the list.

		-  `approveUser(userId)` — calls `get_data({ sql: 'UPDATE user SET status = "active" WHERE uid = ?', params: [userId] })`, refreshes the list and triggers `send_email()` to notify the student.

		-  `rejectUser(userId)` — updates `user.status = 'rejected'` and notifies the student by email.

	- DB tables: `user` (fields `uid`, `status`, `name`, `email`, etc.).

  

5. **OCA Room Requisitions**

	- Backend: queries executed via `POST /query`.
	- Frontend: `scripts/ocaDashboard.js`

		-  `showRoomApprovalWindow()` — opens the room approval UI.

		-  `loadRoomApprovalTable()` — queries pending `requisition` joined with `room` and lists requests with `Assign` and `Reject` buttons.

		-  `showAssignRoomModal(rid)` — modal to input assigned room number. On confirm:

		-  `UPDATE room SET room_assigned = ? WHERE rid = ?`

		-  `UPDATE requisition SET status = 'approved' WHERE rid = ?`

		- Sends notification email to the club (`send_email()`).

		- Reject handler: sets `requisition.status = 'rejected'` and refreshes table.

	- DB tables: `requisition`, `room`, `club`.

  

6. **Bill Upload and Approval**

	- Uploading documents:

		- Backend: `POST /upload_pdf` in `main.js` uses `multer` to accept a single file field named `pdf`, stores the file in `uploads/`, and returns the stored path.

		- Frontend: `dashboard.js` helper `upload(upload_pdf)` posts multipart form data to `/upload_pdf` and receives `{ path }`.

		- Bills reference uploaded document paths in the `bill.documents` column.

	- Approval flow (OCA): `scripts/ocaDashboard.js`
	
		-  `showBillApprovalWindow()` and `loadBillApprovalTable()` — list pending bills, show `Download PDF`, `Approve`, `Reject` controls.

		- Approve handler: `UPDATE requisition SET status = 'approved'` for the bill's `rid`, then send email to the club.

		- Reject handler: updates status to `rejected` and notifies the club.

	- DB tables: `bill` (fields `rid`, `amount`, `documents`), `requisition`, `club`.

  

7. **Club Leaders Announcement**

	- Creating announcements (leader or OCA):

		- OCA system announcements: `scripts/ocaDashboard.js`  `create_system_announcement()` shows modal and inserts into `announcement` table using `get_data({ sql: 'INSERT INTO announcement (subject, body, date_time, cid, uid) VALUES (?, ?, NOW(), ?, ?)', params: [...] })`.

		- Club-specific announcements also use the same `announcement` table with `cid` set to the club id.

		- Deleting announcements: `loadAllAnnouncements()` renders delete buttons which call `deleteAnnouncement(aid)` that issues `DELETE FROM announcement WHERE aid = ?`.

	- DB table: `announcement` (fields include `aid`, `subject`, `body`, `date_time`, `cid`, `uid`).

8. **Receive all announcements (Public)**
	- Backend: 
		- Announcements are read via `POST /query` queries (examples in JS code selecting from `announcement` joined with `user`/`oca`/`members`).
		- This provides a public/role-filtered announcement feed.
	- Frontend common: `scripts/dashboard.js`

		-  `loadRecentAnnouncements()` — fetches top 3 announcements for display on home.
		-  `viewAllAnnouncements()` — opens modal and loads all announcements (role-specific filtering: OCA sees all, students see system and their clubs).

  

9. **Apply for clubs**
	- Backend: SQL executed via `POST /query`.
	- Frontend: `scripts/studentDashboard.js`

		-  `showJoinClubs(userId)` and `loadAvailableClubs(userId)` — show clubs not yet joined.

		-  `apply_to_club(userId, clubId)` — inserts into `applied` table via `get_data({ sql: 'INSERT INTO applied (uid, cid) VALUES (?, ?)', params: [...] })`.

	- DB tables: `applied` (fields `uid`, `cid`), `club`.
  
## Important files
-  `main.js` — Express server with routes and email/OTP/upload logic (see function map above).

-  `database.js` — MySQL connection wrapper using `mysql2`.

-  `config_files/config.json` — credentials: DB host/user/password/name and Gmail address/app password (do not commit secrets).

-  `scripts/` — client-side pages and logic:

-  `login.html`, `login.js` — login/registration and OTP.

-  `dashboard.html`, `dashboard.js` — landing and common dashboard features.

-  `ocaDashboard.js`, `studentDashboard.js` — role-specific dashboards and actions.

## How to test
1. Populate the database using `config_files/club_management.sql`.

2. Update `config_files/config.json` with DB and Gmail app password.

3. Run `node main.js` and open `http://localhost:3000/scripts/login.html`.
