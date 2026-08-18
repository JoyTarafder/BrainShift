import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://joytarafder3_db_user:RjtIYMhrvpyIedqq@tutornovacluster.kvt11zd.mongodb.net/tutornova?retryWrites=true&w=majority&appName=TutorNovaCluster';

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    shortDescription: String,
    description: String,
    subject: String,
    level: String,
    price: Number,
    thumbnailUrl: String,
    duration: String,
    syllabus: [String],
    modules: Array,
    status: String,
  },
  { timestamps: true }
);

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

const hscIctData = {
  title: 'HSC ICT Complete Masterclass (HSC XI - XII)',
  slug: 'hsc-ict-complete-masterclass',
  shortDescription: 'Complete HSC ICT preparation covering Chapters 1 to 6 with C Programming, HTML Web Design, Logic Gates, and Board CQ/MCQ solving.',
  description: `Complete board exam & university admission preparation course for HSC XI-XII Information and Communication Technology (ICT). Master Chapter 1 (World & Bangladesh Perspective), Chapter 2 (Communication Systems & Networking), Chapter 3 (Number Systems & Digital Logic Devices), Chapter 4 (Web Design & HTML), Chapter 5 (C Programming Language), and Chapter 6 (Database Management Systems). Includes chapter-wise Creative Questions (CQ) & Board MCQ solving.`,
  subject: 'ICT (Information & Communication Technology)',
  level: 'HSC XI - XII / Admission',
  price: 2500,
  thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
  duration: '8 Weeks (24 Live Classes)',
  syllabus: [
    'Chapter 1: World & Bangladesh Perspective (Virtual Reality, AI, Biometrics, Robotics, Nanotechnology)',
    'Chapter 2: Communication Systems & Networking (Data Transmission, Media, Topologies, Cloud Computing)',
    'Chapter 3 Part 1: Number Systems (Binary, Octal, Hexadecimal conversions, 2\'s Complement Arithmetic)',
    'Chapter 3 Part 2: Digital Devices & Logic Gates (Basic & Universal Gates, Encoder, Decoder, Adder Circuits)',
    'Chapter 4: Web Design Foundation & HTML (Tags, Headings, Tables, Lists, Hyperlinks, Images, Form Structures)',
    'Chapter 5: Programming in C (Variables, Data Types, Control Flow, Loop Constructs, Arrays, Functions)',
    'Chapter 6: Database Management Systems (DBMS, Primary/Foreign Keys, Basic SQL Queries, ER Diagrams)',
    'Special Module: HSC Board Exam Creative Questions (CQ) & MCQ Solving with Live Mock Tests'
  ],
  modules: [
    { title: 'Chapter 3: Number System Conversions & 2\'s Complement', type: 'video', url: 'https://youtube.com', durationMinutes: 50 },
    { title: 'Chapter 3: Logic Gates, Boolean Algebra & Adder Circuits', type: 'video', url: 'https://youtube.com', durationMinutes: 60 },
    { title: 'Chapter 4: HTML Web Page Layout & Table Design', type: 'video', url: 'https://youtube.com', durationMinutes: 45 },
    { title: 'Chapter 5: C Programming Control Flow & Loops', type: 'video', url: 'https://youtube.com', durationMinutes: 55 },
    { title: 'Chapter 5: C Programming Arrays & Functions', type: 'video', url: 'https://youtube.com', durationMinutes: 50 },
    { title: 'Chapter 6: DBMS & Basic SQL Queries', type: 'video', url: 'https://youtube.com', durationMinutes: 40 },
    { title: 'HSC ICT Board CQ & MCQ Notes PDF Download', type: 'link', url: 'https://drive.google.com' }
  ],
  status: 'published'
};

async function updateCourse() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  // Check if old OOP course exists
  const oldCourse = await Course.findOne({
    $or: [
      { slug: 'oop-java-cpp-fundamentals' },
      { title: /Object-Oriented Programming/i }
    ]
  });

  if (oldCourse) {
    console.log(`Found existing course "${oldCourse.title}", updating to HSC ICT...`);
    Object.assign(oldCourse, hscIctData);
    await oldCourse.save();
    console.log('✅ Course successfully updated to HSC ICT!');
  } else {
    console.log('Old course not found, inserting HSC ICT course...');
    await Course.create(hscIctData);
    console.log('✅ HSC ICT course created successfully!');
  }

  await mongoose.disconnect();
}

updateCourse().catch((err) => {
  console.error('Update failed:', err);
  process.exit(1);
});
