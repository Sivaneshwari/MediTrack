# 🏥 MediTrack – Campus Healthcare Management System

> A full-stack mobile healthcare application built to digitize and streamline medical services within educational institutions.

![React Native](https://img.shields.io/badge/React_Native-Expo-blue) ![Node.js](https://img.shields.io/badge/Backend-Node.js-green) ![MySQL](https://img.shields.io/badge/Database-MySQL-orange) ![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)

---

## 📱 About the Project

MediTrack is a cross-platform mobile healthcare management app developed as an MCA final year project at Sacred Heart College, Tirupattur. It replaces traditional paper-based campus medical systems with a centralized digital platform for students, staff, and medical administrators.

Built from scratch during a 5-month internship at **Tecxy Inc.** (Dec 2025 – Mar 2026), the app was deployed in a production-like environment with real-world data handling.

---

## ✨ Key Features

- 🔐 **Role-Based Authentication** – Secure login for Students, Staff, and Admin (Nurse)
- 📅 **Appointment Booking** – Schedule casual or high-priority appointments with real-time status updates
- 🚨 **Emergency Booking** – One-tap emergency slot booking with immediate priority handling
- 📋 **Medical Records** – Digital storage and retrieval of diagnoses, prescriptions, and visit history
- 💊 **Pharmacy Inventory** – Track medicines, stock levels, expiry dates, and low-stock alerts
- 🩸 **Blood Bank Management** – Manage blood group availability and broadcast urgent donation requests
- 📊 **Admin Dashboard** – Overview of students, staff, appointments, inventory, and blood bank status
- 🔍 **Medicine Name Scanner** – Scan medicine names while adding inventory to reduce manual data entry errors
- 📄 **Report Generation** – Export medical and appointment reports in PDF format
- 🔔 **Real-Time Notifications** – Alerts for appointments, blood emergencies, and low stock

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React Native (Expo), TypeScript/TSX |
| Styling | CSS3, React Native StyleSheet |
| Backend | Node.js, Express.js (REST API) |
| Database | MySQL |
| Auth | JWT (JSON Web Tokens) |
| Tools | Postman, VS Code, Expo Camera (Medicine Scanner) |
| Architecture | Client–Server (3-Tier) |

---

## 👥 User Roles

### 🎓 Student
- Book and cancel appointments (casual/high priority)
- View medical history and prescriptions
- Receive blood bank and health notifications
- Edit profile (height, weight, blood group)

### 👨‍⚕️ Staff
- Book appointments for self or on behalf of students
- View and manage patient medical records
- Create diagnoses and prescriptions
- Monitor appointment history

### 🛡️ Admin (Nurse)
- Full control over student/staff appointments
- Manage medicine inventory and stock
- Handle blood bank and broadcast emergency requests
- Manage user accounts and system settings
- Generate and export reports

---

## 🗄️ Database Design

Key tables: `students`, `staff`, `admins`, `appointments`, `prescriptions`, `inventory`, `blood_donation_requests`, `notifications`, `visits`

- Normalized MySQL schema with foreign key relationships
- Role-based access enforced at API level
- Password hashing and OTP-based forgot password system

---

## 📸 Screenshots

| Home Screen | Login | Student Dashboard |
|-------------|-------|------------------|
| Welcome screen with app branding | Role-based login (Student/Staff/Admin) | Appointments, prescriptions, history |

| Admin Control | Inventory | Blood Bank |
|---------------|-----------|------------|
| MediTrack Control dashboard | Medicine stock with expiry tracking | Blood group management + broadcast |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MySQL 8.0+
- Expo CLI (`npm install -g expo-cli`)
- Android/iOS device or emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/Sivaneshwari/MediTrack.git
cd MediTrack

# Install frontend dependencies
npm install

# Start the Expo app
npx expo start
```

### Backend Setup

```bash
cd backend
npm install

# Configure your database in .env file
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=yourpassword
# DB_NAME=meditrack

# Start the backend server
node src/index.js
```

---

## 🧪 Testing

20 test cases were executed covering:
- Login validation (all 3 roles)
- Appointment booking and slot blocking
- Emergency booking flow
- Inventory management
- PDF report generation
- Mobile responsiveness

**All 20 test cases: ✅ Pass**

---



## 👩‍💻 Developer

**Sivaneshwari E**  
MCA Graduate – 2026 | Full Stack Developer  
📧 sivaneshwari13@gmail.com  
🔗 [LinkedIn](https://www.linkedin.com/in/sivaneshwari-elango)  
🐙 [GitHub](https://github.com/Sivaneshwari)

---

## 📚 References

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Framework](https://docs.expo.dev/)
- [Node.js Docs](https://nodejs.org/en/docs/)
- [MySQL Docs](https://dev.mysql.com/doc/)
- [JWT Docs](https://jwt.io/introduction)
