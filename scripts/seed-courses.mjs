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
    modules: [
      {
        title: String,
        type: { type: String, enum: ['video', 'pdf', 'link'], default: 'video' },
        url: String,
        durationMinutes: Number,
      },
    ],
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
  },
  { timestamps: true }
);

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

const sampleCourses = [
  {
    title: 'Data Structures & Algorithms in C++',
    slug: 'data-structures-algorithms-cpp',
    shortDescription: 'Master Arrays, Linked Lists, Trees, Graphs, Sorting Algorithms, Dynamic Programming, and Competitive Programming techniques.',
    description: `Comprehensive 8-week intensive course designed to build solid algorithmic foundations for university students and technical interview preparation. Covers Big-O analysis, linear & non-linear data structures, graph algorithms (BFS, DFS, Dijkstra), dynamic programming patterns, and live coding exercises.`,
    subject: 'Computer Science',
    level: 'Intermediate',
    price: 3000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    duration: '8 Weeks (16 Live Classes)',
    syllabus: [
      'Big-O Notation & Time Complexity Analysis',
      'Arrays, Vectors, and Memory Management',
      'Singly & Doubly Linked Lists',
      'Stacks, Queues, and Deques',
      'Recursion & Backtracking Fundamentals',
      'Binary Trees & Binary Search Trees (BST)',
      'Heap, Priority Queue, and Hashing Techniques',
      'Graph Representations, BFS, DFS, and Shortest Paths',
      'Sorting Algorithms & Divide and Conquer',
      'Dynamic Programming & Greedy Strategies'
    ],
    modules: [
      { title: 'Module 1: Big-O & Complexity Analysis', type: 'video', url: 'https://youtube.com', durationMinutes: 45 },
      { title: 'Module 2: Arrays & Memory Allocation Notes', type: 'pdf', url: 'https://example.com/notes.pdf' }
    ],
    status: 'published'
  },
  {
    title: 'Full-Stack Web Development with React & Next.js',
    slug: 'fullstack-react-nextjs-mastery',
    shortDescription: 'Build modern responsive web applications with TypeScript, Next.js 14 App Router, Tailwind CSS, Node.js, Express, and MongoDB Atlas.',
    description: `Everything you need to become a production-ready Full-Stack Web Developer. From modern ES6 JavaScript syntax to Next.js App Router, SSR/SSG rendering strategies, MongoDB database design, JWT authentication, and SSLCommerz payment integration.`,
    subject: 'Web Development',
    level: 'Advanced',
    price: 3500,
    thumbnailUrl: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&q=80',
    duration: '10 Weeks (20 Live Classes)',
    syllabus: [
      'HTML5, Modern CSS, and Tailwind CSS Layouts',
      'JavaScript ES6+, Promises, and Async/Await',
      'React Fundamentals: Components, Hooks, State Management',
      'Next.js 14 App Router Architecture & Routing',
      'REST API Design in Next.js Server Routes',
      'MongoDB Atlas Connection & Mongoose Schemas',
      'Authentication with NextAuth.js',
      'Deploying Web Apps to Vercel'
    ],
    modules: [
      { title: 'Module 1: React & Next.js Foundation', type: 'video', url: 'https://youtube.com', durationMinutes: 50 },
      { title: 'Module 2: Tailwind CSS Starter Template', type: 'link', url: 'https://github.com' }
    ],
    status: 'published'
  },
  {
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
  }
];

async function seedDatabase() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  console.log('Clearing existing courses...');
  await Course.deleteMany({});

  console.log('Inserting sample courses...');
  const inserted = await Course.insertMany(sampleCourses);
  console.log(`✅ Successfully seeded ${inserted.length} courses!`);

  await mongoose.disconnect();
}

seedDatabase().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
