# PRD.md — Personal Tutor Website (Joy's Platform)

## 1. Overview

A personal website for Joy — engineer and tutor — that serves two purposes at once:

1. A **personal brand / portfolio site** showcasing Joy's background (engineering + tutoring credentials, experience, testimonials).
2. A **tuition marketplace** where Joy can create, update, and delete courses, and students can browse, purchase, and access those courses.

**Assumption (please confirm):** This PRD treats the platform as a lightweight course-hosting product — students buy access to a course and get materials/content unlocked, not just a "contact me" booking form. If you actually want a simpler booking + payment layer (no content hosting, tuition still happens live/offline), several sections below (Content Delivery, Course Player) shrink significantly — flag this and I'll adjust.

## 2. Goals

- Give Joy a professional, single place to be discovered as a tutor.
- Let Joy manage course listings without touching code (CRUD via admin dashboard).
- Let students discover, pay for, and access courses with minimal friction.
- Support Bangladesh-first payment methods (bKash, Nagad, cards) from day one.
- Ship an MVP fast, then iterate (see phases.md).

## 3. Non-Goals (for MVP)

- Live video conferencing / scheduling system (out of scope initially — assume live tuition happens outside the platform, e.g. Zoom link shared after purchase).
- Multi-tutor marketplace (this is single-tutor: Joy only).
- Mobile app (web-only, responsive).
- Complex quiz/assignment grading engine.

## 4. User Roles

| Role | Description |
|---|---|
| **Admin (Joy)** | Full CRUD on courses, view enrollments/orders, view basic analytics |
| **Student (Guest)** | Browse courses, view details, without login |
| **Student (Registered)** | Sign up/login, purchase courses, access "My Courses" |

## 5. Core Features

### 5.1 Public Site
- Homepage: intro, tagline, subjects taught, credentials (CSE @ IUB, CloudCoder internship, etc.)
- Course catalog page: filter/search by subject, price, level
- Course detail page: syllabus, price, duration, what's included, reviews
- About page: bio, experience, skills
- Testimonials section
- Contact section (fallback for non-course inquiries)

### 5.2 Admin Dashboard (Joy only, auth-protected)
- Create course (title, description, price, subject, thumbnail, syllabus, materials)
- Edit course
- Delete / archive course
- View list of enrolled students per course
- View orders/payments (status: paid, pending, failed)
- Basic revenue summary

### 5.3 Student Flow
- Sign up / login (email + password, or Google OAuth)
- Browse & view course details
- Buy course → payment (SSLCommerz: supports bKash, Nagad, cards)
- On successful payment → auto-enrollment
- "My Courses" dashboard → access purchased course materials
- Order history

### 5.4 Content Delivery (per Assumption above)
- Each course has one or more modules with: video links / PDF notes / links
- Access gated behind purchase (no access without payment record)

## 6. Payment Requirements

- Must support Bangladeshi payment rails: **bKash, Nagad, Rocket, cards** via a gateway like **SSLCommerz** (Stripe/PayPal don't natively support local mobile banking in BD).
- Payment must create an `Order` record with status tracking (`pending → paid → failed/refunded`).
- On `paid`, auto-create an `Enrollment` record linking student ↔ course.

## 7. Tech Stack (proposed)

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind | Matches Joy's current stack; TS practice goal |
| Backend | Next.js API routes (or separate Express service if it grows) | Single deployable unit for MVP |
| Database | MongoDB (Atlas free tier) | Joy already has exposure |
| Auth | NextAuth.js (Credentials + Google provider) | Fast, well-documented |
| Payment | SSLCommerz | Local BD payment method support |
| Hosting | Vercel (frontend/API), MongoDB Atlas (DB) | Free-tier friendly, Joy already uses Vercel |
| File/Media storage | Cloudinary or Uploadthing (free tier) | Course thumbnails, PDFs |

## 8. Success Metrics (post-launch)

- # of courses listed
- # of registered students
- # of completed purchases
- Conversion rate: course-view → purchase
- Site uptime / load time (< 2s target for course catalog page)

## 9. Risks / Open Questions

- **Payment gateway KYC**: SSLCommerz merchant account requires business verification — confirm Joy has (or can get) a merchant account, or plan to start with a "manual payment / send money then confirm" flow for MVP.
- **Content hosting cost**: Video hosting can get expensive at scale — MVP should use external links (YouTube unlisted, Google Drive) rather than self-hosted video.
- Decide: is this single-tutor only, or should the DB schema anticipate multi-tutor in future (affects `Course.tutorId` design now vs. later)?

## 10. Reference Docs
- See `architecture.md` for system design
- See `design.md` for UI/UX direction
- See `phases.md` for build roadmap
