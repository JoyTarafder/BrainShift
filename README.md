# BrainShift — Academic Tuition & AI Mentorship Platform

> **Expert 1-on-1 and Group Tuition & Mentorship by Joy Tarafder (CSE @ IUB)**  
> Specializing in Class 5–8 (All Subjects), Class 9–10 (Science Only), Inter ICT, University Computer Science & AI-Based Internship Programs.

<p align="center">
  <img src="./public/images/brainshift-logo.png" alt="BrainShift Logo" width="360" />
</p>

---

## 🎓 Tuition & Program Coverage

| Level / Category | Subjects & Focus Areas |
|---|---|
| **Class 5 – 8** | All Subjects (সকল বিষয়) — General Math, Science, English, Bangla, BGS, ICT |
| **Class 9 – 10 (SSC)** | Science Group Only (বিজ্ঞান বিভাগ) — Physics, Chemistry, Higher Math, Biology, General Math, ICT |
| **HSC / Inter (11–12)** | ICT (Chapter 1–6) — C Programming, HTML, Database Systems, Logic Gates, CQ & MCQ Solving |
| **AI Mentorship & CSE** | **AI-Based Internship & Mentorship Program**, Full-stack Web Development (Next.js, React, Node.js), C/C++, Java, Data Structures & Algorithms |

---

## ✨ Key Features & Capabilities

- 🤖 **AI-Based Internship & Mentorship** — Real-world project building, 1-on-1 coding mentorship, and tech industry career preparation.
- 🔐 **Comprehensive Authentication & Recovery** — NextAuth with direct MongoDB Atlas support, account creation, and interactive self-service `/forgot-password` recovery.
- 👥 **Admin Student Directory & Action Suite** — Full control to View student profiles, Edit details, Reset passwords, Block/Unblock accounts, and Delete records with live search filtering.
- 💳 **Automated Tuition & Payment Processing** — Integrated SSLCommerz, bKash, Nagad, and Rocket support with instant order tracking and verification.
- 🔒 **Piracy & Video Content Protection**:
  - **Dynamic Student Email Watermark** — Floats dynamically across video playback to deter screen recording and piracy.
  - **Google Drive Popout Shield** — Blocks the external popout button on embedded video lessons.
- 📅 **Tuition Batch & Live Schedule Manager** — Manage small-group tuition batches, live Google Meet class schedules, and student seat limits.
- 📝 **Assignments, Exams & Marks Evaluation** — Issue quizzes/exams, submit homework, and publish grading records for enrolled students.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 / 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons, TypeScript |
| **Backend & API** | Next.js API Routes + Node.js / Express.js REST API |
| **Database & ODM** | MongoDB Atlas with Mongoose |
| **Authentication** | NextAuth.js (JWT Strategy) + bcryptjs |
| **Video Player** | Custom Plyr.js with Dynamic Anti-Piracy Watermark & Shield |
| **Payment Gateway** | SSLCommerz, bKash, Nagad, Rocket |
| **Deployment** | Vercel (Frontend) + Render / Railway (Backend) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- MongoDB Atlas cluster connection string
- Git

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/JoyTarafder/TutorNova.git
cd TutorNova

# Install Next.js frontend dependencies
npm install

# Install Express backend dependencies (optional/microservice)
cd backend && npm install && cd ..
```

### 2. Configure Environment Variables

Create `.env.local` in the root directory:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
NEXTAUTH_SECRET=your_jwt_secret_key
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Create `backend/.env` for Express API:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### 3. Run Development Server

```bash
# Run Next.js App
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Directory Structure

```
tuitionBd/
├── app/                        # Next.js App Router
│   ├── (student)/              # Student dashboard, video lessons & exam portals
│   ├── about/                  # Academic profile & Joy Tarafder credentials
│   ├── adminpanel/             # Admin portal (batches, courses, students, payments, marks)
│   ├── api/                    # Next.js REST API endpoints (auth, admin, payment, student)
│   ├── courses/                # Course & tuition catalog
│   ├── forgot-password/        # Self-service password recovery flow
│   ├── login/                  # Student login portal
│   ├── register/               # Student registration portal
│   ├── layout.tsx              # Root layout & global metadata
│   └── page.tsx                # BrainShift landing page
├── components/                 # Reusable UI components (Navbar, Footer, Modals, Cards)
├── models/                     # Mongoose database schemas (User, Course, Batch, Order, Exam)
├── lib/                        # Database connector (db.ts) & API utilities
├── backend/                    # Express.js backend services & seed scripts
└── public/                     # Static media & BrainShift branding assets
```

---

## 👨‍🏫 Instructor & Developer Profile

**Joy Tarafder**  
Academic Tutor & Software Engineer  
*B.Sc. in Computer Science & Engineering — Independent University, Bangladesh (IUB)*

- 🎓 **HSC (Science):** Ghatail Cantonment College — GPA 5.00
- 🎓 **SSC (Science):** Kalihati R.S. Govt. Pilot High School — GPA 5.00
- 💼 **Industry Experience:** Software Engineering Intern at CloudCoder

---

## 📄 License & Intellectual Property

This project and its educational content are private and proprietary.  
© 2026 **BrainShift** — Joy Tarafder. All rights reserved.
