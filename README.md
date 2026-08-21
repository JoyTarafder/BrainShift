# TutorNova — Private Tuition Platform

> **Expert 1-on-1 and group tuition by Joy Tarafder (CSE @ IUB)**  
> Specializing in Class 5–8 (All Subjects), Class 9–10 (Science Only), Inter ICT, and University Computer Science & Coding.

![TutorNova Homepage Preview](<img width="1655" height="853" alt="image" src="https://github.com/user-attachments/assets/97137c57-c4c2-4478-98ca-e60524662985" />
)

---


## 🎓 Tuition Coverage

| Level | Subjects |
|---|---|
| **Class 5 – 8** | All Subjects (সকল বিষয়) |
| **Class 9 – 10** | Science Group — Physics, Chemistry, Higher Math, Biology, ICT |
| **HSC / Inter (11–12)** | ICT (Chapter 1–6) |
| **University / CSE & Coding** | C/C++, Java, Web Dev, DSA, Software Engineering & Industry Internship Guidance |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), Tailwind CSS, TypeScript |
| **Backend API** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **Video Player** | Plyr.js (YouTube & Google Drive) |
| **Auth** | JWT-based Authentication |
| **Deployment** | Vercel (Frontend) + Render/Railway (Backend) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas URI
- Google Drive / YouTube video links for lessons

### Frontend

```bash
cd tuitionBd
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend API

```bash
cd backend
npm install
npm run dev
```

Backend runs at [http://localhost:5000](http://localhost:5000).

---

## ⚙️ Environment Variables

### Frontend — `.env.local`

```env
MONGODB_URI=your_mongodb_atlas_uri
NEXTAUTH_SECRET=your_secret
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend — `backend/.env`

```env
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

---

## 📁 Project Structure

```
tuitionBd/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home / Landing page
│   ├── about/              # About Joy Tarafder
│   ├── courses/            # Course catalog & filters
│   ├── adminpanel/         # Admin dashboard
│   └── (student)/learn/    # Student video lesson player
├── components/             # Shared UI components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── PlyrVideoPlayer.tsx # Video player with watermark protection
├── backend/                # Express.js REST API
│   └── routes/             # API routes
└── public/                 # Static assets
```

---

## 🔒 Content Protection Features

- **Dynamic Email Watermark** — Logged-in student's email floats over video to deter piracy.
- **Google Drive Popout Shield** — Transparent overlay blocks the external popout button on Google Drive embeds.

---

## 👨‍💻 Developer

**Joy Tarafder**  
B.Sc. in Computer Science & Engineering — Independent University, Bangladesh (IUB), 2020–2025

- 🏫 Ghatail Cantonment College — HSC (Science) GPA 5.00 (2017–2019)
- 🏫 Kalihati R.S. Govt. Pilot High School — SSC (Science) GPA 5.00 (2012–2017)

---

## 📄 License

This project is private and proprietary. All rights reserved © Joy Tarafder.
