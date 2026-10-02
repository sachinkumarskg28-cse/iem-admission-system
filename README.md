# Institute of Engineering & Management (IEM) - Admission Management System

A production-ready, full-stack **MEAN Stack (MongoDB, Express.js, Angular, Node.js)** Admission Management System tailored for the **Institute of Engineering & Management (IEM), Kolkata**.

---

## 🏛️ System Overview

The **IEM Admission Management System** automates and streamlines the entire student admission lifecycle: from online inquiry, eligibility verification, course selection, multi-step application form submission, and document upload to scrutiny by Admission Officers, fee payment processing, automated PDF acknowledgment generation, seat allocation, and executive analytics for Administrators.

### Key Highlights
- **Role-Based Access Control (RBAC):** `student`, `admission_officer`, and `admin` with protected route guards and JWT authentication.
- **Resilient Data Architecture:** Dual-mode persistence supporting direct **MongoDB / Mongoose** connections alongside an automatic **In-Memory Store fallback** for zero-dependency local evaluation.
- **6-Step Application Wizard:** Personal details, academic scores (10th/12th/Entrance), course selection, document uploads, fee payment, and final review.
- **Live Document Verification:** Admission Officers review uploaded Aadhaar, 10th/12th marksheets, and rank cards with instant Approve/Reject workflows and seat count decrement.
- **Official PDF Slip Generation:** High-resolution PDF admission acknowledgment with IEM branding, candidate details, QR verification token, and transaction receipt using `PDFKit`.
- **Comprehensive Analytics & Audit Trail:** Real-time dashboards with seat occupancy metrics, conversion rates, monthly trends, and immutable audit logs.

---

## 📂 Complete Folder Structure

```
iem-admission-system/
├── backend/
│   ├── config/
│   │   ├── db.js                   # Mongoose connection & MongoDB config
│   │   └── inMemoryDB.js           # Resilient in-memory database fallback
│   ├── controllers/
│   │   ├── adminController.js      # System analytics, course/officer management
│   │   ├── applicationController.js# Application submission, tracking & PDF generation
│   │   ├── authController.js       # JWT signup, login, password reset & refresh
│   │   ├── courseController.js     # Course catalog, seat matrix & eligibility
│   │   ├── documentController.js   # File upload, verification & status update
│   │   ├── notificationController.js# System & student broadcast alerts
│   │   ├── officerController.js    # Application scrutiny, search/filter & reports
│   │   ├── paymentController.js    # Mock ₹2000 payment gateway & receipt generator
│   │   └── studentController.js    # Student profile, academic record & dashboard
│   ├── middleware/
│   │   ├── auditMiddleware.js      # Automated activity logging
│   │   ├── authMiddleware.js       # JWT token verification
│   │   ├── errorHandler.js         # Centralized error handler
│   │   ├── roleMiddleware.js       # RBAC role verification
│   │   ├── uploadMiddleware.js     # Multer file storage & MIME validator
│   │   └── validationMiddleware.js # Express-validator rules
│   ├── models/
│   │   ├── AdmissionCycle.js       # Academic cycle schedule & status
│   │   ├── Application.js          # Admission application lifecycle model
│   │   ├── AuditLog.js             # Security and action log collection
│   │   ├── Course.js               # Degree programs, fees & seat matrix
│   │   ├── Document.js             # Uploaded student credentials & verification
│   │   ├── Notification.js         # Alerts and messages collection
│   │   ├── Payment.js              # Fee transactions & receipts
│   │   ├── Student.js              # Student extended demographic profile
│   │   └── User.js                 # Authentication credentials & roles
│   ├── public/                     # Standalone live interactive web client
│   │   ├── app.js                  # Frontend interactive client script
│   │   └── index.html              # Responsive Bootstrap 5 UI
│   ├── routes/                     # Express REST API route definitions
│   │   ├── adminRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── documentRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── officerRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── studentRoutes.js
│   ├── services/
│   │   └── dataService.js          # Unified Mongo/Memory data abstraction layer
│   ├── uploads/                    # Local storage for documents & photos
│   ├── utils/
│   │   ├── emailService.js         # Automated notification & email dispatcher
│   │   ├── pdfGenerator.js         # PDFKit IEM Admission slip generator
│   │   └── seeder.js               # Database seeder with sample data
│   ├── .env                        # Environment configuration
│   ├── package.json
│   └── server.js                   # Main Express application entry point
├── frontend/                       # Angular 18 Single Page Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── guards/         # AuthGuard, RoleGuard
│   │   │   │   ├── interceptors/   # AuthInterceptor, ErrorInterceptor
│   │   │   │   ├── models/         # TypeScript interfaces & models
│   │   │   │   └── services/       # AuthService, ApplicationService, AdminService, etc.
│   │   │   ├── features/
│   │   │   │   ├── admin/          # Admin dashboard, course/officer management, audit
│   │   │   │   ├── auth/           # Login, Register, Forgot Password
│   │   │   │   ├── home/           # Public landing page & course explorer
│   │   │   │   ├── officer/        # Officer scrutiny queue, verification, reports
│   │   │   │   ├── student/        # 6-Step Apply Wizard, profile, status, docs
│   │   │   │   └── track/          # Public application status lookup
│   │   │   ├── shared/             # Navbar, Footer, Status Badge components
│   │   │   ├── app.component.ts
│   │   │   ├── app.config.ts
│   │   │   └── app.routes.ts
│   │   ├── environments/           # Environment config (API URL)
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.scss             # IEM Navy & Gold design system & dark mode
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## 🗄️ Database Design (MongoDB Schemas)

### 1. `Users`
- `email` (String, Unique, Required)
- `password` (String, Hashed with bcrypt)
- `name` (String)
- `phone` (String)
- `role` (`student` | `admission_officer` | `admin`)
- `isActive` (Boolean)
- `lastLogin` (Date)

### 2. `Students`
- `userId` (Ref: User)
- `personalInfo` (dob, gender, category, bloodGroup, aadhaarNumber, nationality)
- `address` (permanent & correspondence: line1, city, state, pincode)
- `guardian` (fatherName, fatherOccupation, motherName, motherOccupation, phone)
- `academicRecords` (10th Board, %, Year; 12th Board, %, Stream; Entrance Exam: WBJEE/JEE Main rank & roll number)
- `profileCompletion` (Number, 0-100%)

### 3. `Courses`
- `courseCode` (String, Unique, e.g. `BTECH-CSE`)
- `name` (String, e.g. `B.Tech in Computer Science & Engineering`)
- `department` (Engineering | Management | Computer Applications)
- `duration` (String, e.g. `4 Years (8 Semesters)`)
- `eligibility` (Min 60% in PCM, Valid WBJEE / JEE Main Rank)
- `totalSeats` (Number, e.g. `180`)
- `availableSeats` (Number, e.g. `42`)
- `fees` (admissionFee, semesterFee, totalFee, hostelFeePerSem)
- `isActive` (Boolean)

### 4. `Applications`
- `applicationNumber` (String, Unique, e.g. `IEM2026BTECH-CSE001`)
- `studentId` (Ref: User / Student)
- `courseId` (Ref: Course)
- `admissionCycleId` (Ref: AdmissionCycle)
- `personalSnapshot` & `academicSnapshot` (Immutable snapshot at submission)
- `status` (`DRAFT` | `SUBMITTED` | `UNDER_REVIEW` | `DOCUMENTS_VERIFIED` | `APPROVED` | `REJECTED` | `SEAT_ALLOCATED`)
- `paymentStatus` (`PENDING` | `COMPLETED` | `FAILED`)
- `officerRemarks` (String)
- `verifiedBy` (Ref: User)
- `verifiedAt` (Date)
- `allocatedSeatNumber` (String)

### 5. `Documents`
- `applicationId` (Ref: Application)
- `studentId` (Ref: User)
- `documentType` (`PASSPORT_PHOTO` | `SIGNATURE` | `CLASS_10_MARKSHEET` | `CLASS_12_MARKSHEET` | `ENTRANCE_RANK_CARD` | `AADHAAR_CARD` | `CATEGORY_CERTIFICATE`)
- `filePath` (String)
- `fileName` (String)
- `mimeType` (String)
- `fileSize` (Number)
- `verificationStatus` (`PENDING` | `VERIFIED` | `REJECTED`)
- `remarks` (String)

### 6. `Payments`
- `transactionId` (String, Unique, e.g. `TXN-IEM-1775150997120`)
- `applicationId` (Ref: Application)
- `studentId` (Ref: User)
- `amount` (Number, e.g. `2000`)
- `currency` (String: `INR`)
- `paymentMethod` (`UPI` | `NET_BANKING` | `CREDIT_CARD` | `DEBIT_CARD`)
- `status` (`SUCCESS` | `FAILED` | `PENDING`)
- `paymentDate` (Date)
- `receiptUrl` (String)

### 7. `Notifications`
- `recipientId` (Ref: User or `ALL`)
- `title` (String)
- `message` (String)
- `type` (`ADMISSION_UPDATE` | `DOCUMENT_VERIFICATION` | `FEE_RECEIPT` | `SYSTEM_ALERT`)
- `isRead` (Boolean)
- `createdAt` (Date)

### 8. `AuditLogs`
- `userId` (Ref: User)
- `userRole` (String)
- `action` (String: `APPLICATION_SUBMITTED`, `DOCUMENT_VERIFIED`, `APPLICATION_APPROVED`, etc.)
- `ipAddress` (String)
- `metadata` (Object)
- `timestamp` (Date)

---

## 🚀 API Endpoints Documentation

| Module | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Public | Register new candidate user |
| | `POST` | `/api/auth/login` | Public | Authenticate and return JWT token |
| | `GET` | `/api/auth/me` | Authenticated | Fetch current authenticated user profile |
| | `POST` | `/api/auth/forgot-password` | Public | Request password reset instructions |
| **Courses** | `GET` | `/api/courses` | Public | Get all active degree programs & seat matrix |
| | `GET` | `/api/courses/:id` | Public | Get specific course details and fee breakdown |
| | `POST` | `/api/courses` | Admin | Create a new course offering |
| | `PUT` | `/api/courses/:id` | Admin | Update course metadata, fees, or seats |
| **Applications** | `POST` | `/api/applications` | Student | Create or submit new admission application |
| | `GET` | `/api/applications/my-applications` | Student | List applications submitted by logged-in student |
| | `GET` | `/api/applications/:id` | Student/Officer/Admin | Get detailed application with uploaded docs |
| | `GET` | `/api/applications/:id/download-pdf`| Student/Officer/Admin | Stream official PDF admission slip |
| | `GET` | `/api/applications/track/:appNo` | Public | Quick tracking by application number |
| **Student** | `GET` | `/api/students/profile` | Student | Get student profile & completion score |
| | `PUT` | `/api/students/profile` | Student | Update personal, guardian, and academic info |
| | `GET` | `/api/students/dashboard` | Student | Fetch student dashboard overview & active alerts |
| **Documents** | `POST` | `/api/documents/upload` | Student | Upload candidate documents via Multer |
| | `GET` | `/api/documents/application/:id` | Authenticated | Retrieve uploaded documents for an application |
| | `PUT` | `/api/documents/:id/verify` | Officer/Admin | Verify or reject an individual document |
| **Payments** | `POST` | `/api/payments/create-order` | Student | Initialize mock payment order for ₹2,000 fee |
| | `POST` | `/api/payments/verify` | Student | Process mock payment and generate receipt |
| **Officer** | `GET` | `/api/officer/applications` | Officer/Admin | Query applications with filters (status, course, search) |
| | `PUT` | `/api/officer/applications/:id/status` | Officer/Admin | Approve / Reject application with remarks & seat decrement |
| | `GET` | `/api/officer/reports` | Officer/Admin | Generate conversion and verification reports |
| **Admin** | `GET` | `/api/admin/dashboard` | Admin | Aggregate KPIs, monthly trends, and seat analytics |
| | `GET` | `/api/admin/officers` | Admin | List all admission scrutiny officers |
| | `POST` | `/api/admin/officers` | Admin | Create new Admission Officer account |
| | `GET` | `/api/admin/audit-logs` | Admin | View immutable system audit logs |
| **Notifications**| `GET` | `/api/notifications` | Authenticated | Fetch alerts for current user |
| | `POST` | `/api/notifications/broadcast` | Admin | Send announcement to all students/officers |

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Node.js**: v18.x or v20.x installed
- **MongoDB**: Optional (If MongoDB is not running locally at `mongodb://localhost:27017/iem_admission_db`, the system automatically loads its comprehensive in-memory pre-seeded store).

### 1. Backend Setup & Launch

```powershell
# Navigate to backend directory
cd C:\Users\nandk\.gemini\antigravity\scratch\iem-admission-system\backend

# Install dependencies
npm install

# Run database seeder (seeds Admin, Officers, Students, 7 IEM Courses & Applications)
npm run seed

# Start Express Backend Server
npm start
```

Backend will start at: `http://localhost:5000`

---

### 2. Live Web Interface

The Express backend serves a complete, responsive client out of the box at:
👉 **`http://localhost:5000`**

Open `http://localhost:5000` in any modern web browser to access:
- Public Course Explorer and Application Tracker
- 1-Click Quick Demo Login buttons for all 3 roles
- 6-Step Interactive Application Wizard with drag-and-drop file upload
- Mock Payment Gateway with instant confirmation and PDF slip download
- Officer Scrutiny Console & Document Verification Modals
- Admin KPI Command Center with responsive charts and seat matrix editors

---

### 3. Angular 18 Frontend Setup (Optional for Development)

```powershell
# Navigate to frontend directory
cd C:\Users\nandk\.gemini\antigravity\scratch\iem-admission-system\frontend

# Install Angular CLI & dependencies
npm install

# Start Angular Development Server
npm start
```

Angular application will be available at: `http://localhost:4200`

---

## 🔑 Pre-seeded Demo Credentials

| Role | Email | Password | Pre-loaded Data |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@iem.edu.in` | `Admin@123` | Full KPI dashboards, audit logs, course & officer management |
| **Admission Officer (Engg)** | `officer.engg@iem.edu.in` | `Officer@123` | Assigned to Engineering queue with pending verification files |
| **Admission Officer (Mgmt)** | `officer.mgmt@iem.edu.in` | `Officer@123` | Assigned to Management & BCA/MCA queue |
| **Student (Rahul Sharma)** | `student.rahul@gmail.com` | `Student@123` | B.Tech CSE (Application: `IEM2026BTECH-CSE001`, Status: `APPROVED`) |
| **Student (Priya Ghosh)** | `student.priya@gmail.com` | `Student@123` | B.Tech IT (Application: `IEM2026BTECH-IT002`, Status: `UNDER_REVIEW`) |
| **Student (Sneha Sen)** | `student.sneha@gmail.com` | `Student@123` | MBA Finance (Application: `IEM2026MBA003`, Status: `DOCUMENTS_VERIFIED`) |

---

## 🛡️ Security Features

1. **Password Hashing:** `bcryptjs` salted hashing (10 salt rounds).
2. **JWT Authentication:** Stateless, signed JSON Web Tokens with 24-hour expiration.
3. **HTTP Security Headers:** `helmet` for XSS protection, MIME sniffing mitigation, and clickjacking prevention.
4. **CORS:** Configured cross-origin resource sharing for frontend endpoints.
5. **MIME & File Size Validation:** Multer filters restrict uploads to PDF, JPG, and PNG up to 5MB.
6. **Input Sanitization:** `express-validator` schema validation on all POST/PUT routes.
7. **Audit Logging:** Every critical status update, seat change, and login is recorded in `AuditLogs`.

---

## 🎓 Institute of Engineering & Management (IEM), Kolkata
- **Campus:** Sector V, Salt Lake Electronics Complex, Kolkata, West Bengal 700091
- **Accreditation:** NAAC 'A' Grade, NBA Accredited, Approved by AICTE & Affiliated to MAKAUT.
