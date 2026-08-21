import {
  Atom,
  Award,
  BookOpen,
  CheckCircle2,
  Code,
  GraduationCap,
  Laptop,
  Mail,
  MessageSquare,
} from "lucide-react";

export default function AboutPage() {
  const subjectsAndSkills = [
    "Class 5–8 All Subjects (সকল বিষয়)",
    "Class 9–10 Science (Physics, Chemistry, Higher Math, Biology)",
    "HSC / Inter ICT (Chapter 1–6)",
    "Data Structures & Algorithms",
    "C++ / C Programming",
    "Java & Object-Oriented Design",
    "JavaScript & TypeScript",
    "React.js & Next.js (App Router)",
    "Node.js & MongoDB",
    "Git & Cloud Deployment",
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-[#0b2545] via-[#13293d] to-[#1e3a8a] text-white rounded-3xl p-8 lg:p-14 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <GraduationCap className="w-4 h-4" />
              <span>Academic Tutor & Software Engineer</span>
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              About Joy Tarafder
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Academic Tutor, Software Engineer, Computer Science student at Independent
              University, Bangladesh (IUB), and founder of{" "}
              <strong className="text-amber-400 font-semibold">
                TutorNova
              </strong>
              .
            </p>
          </div>
        </div>

        {/* Specialized Tuition Breakdown Grid */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold text-[#0b2545]">
              Tuition Offerings & Coverage
            </h2>
            <p className="text-slate-600 text-sm">
              Customized 1-on-1 & small group tuition for school, college, and university students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Class 5-8 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Class 5 – 8 Tuition (All Subjects)
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Complete guidance in <strong>General Math, Science, English, Bangla, BGS, and ICT</strong> for class 5, 6, 7, and 8 students. Focus on conceptual foundation and exam readiness.
              </p>
            </div>

            {/* Class 9-10 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Atom className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Class 9 – 10 Tuition (Science Group Only)
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Specialized SSC preparation for <strong>Physics, Chemistry, Higher Mathematics, Biology, General Mathematics, General Science, and ICT</strong>. Thorough Creative Question (CQ) & MCQ practice.
              </p>
            </div>

            {/* HSC Inter ICT */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Laptop className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                HSC / Inter ICT (Class 11 – 12)
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                In-depth coverage of <strong>HSC ICT Chapter 1 to 6</strong>: C Programming, HTML Web Design, Database Systems, Logic Gates, and Board Exam question paper solving.
              </p>
            </div>
          </div>
        </div>

        {/* Bio & Philosophy Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Bio Details */}
          <div className="lg:col-span-7 space-y-8">
            {/* Background & Journey */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-2xl font-bold text-[#0b2545]">
                Background & Journey
              </h2>
              <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                Joy Tarafder is currently pursuing his Bachelor of Science in
                Computer Science and Engineering (CSE) at Independent
                University, Bangladesh (IUB). Having completed a practical
                software engineering internship at <strong>CloudCoder</strong>,
                Joy brings both real-world tech industry standards and rigorous academic expertise into his teaching methodology.
              </p>
              <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                Joy teaches school & college students for board exam success (Class 5–8 All subjects, Class 9–10 Science Group, and Inter ICT), as well as university Computer Science students in programming languages (C, C++, Java) and Web Development.
              </p>
            </div>

            {/* Education Profile Timeline */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#0b2545]">
                    Education Profile
                  </h2>
                  <p className="text-xs text-slate-500">
                    Academic qualifications & achievements
                  </p>
                </div>
              </div>

              <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {/* University */}
                <div className="relative group">
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-amber-500 border-4 border-white shadow-sm ring-2 ring-amber-500/20 group-hover:scale-125 transition-transform" />
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-xs mb-1">
                    (2020 – 2025)
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base tracking-tight uppercase">
                    Independent University, Bangladesh (IUB)
                  </h3>
                  <p className="text-slate-700 font-medium text-sm">
                    B.Sc. in Computer Science and Engineering
                  </p>
                </div>

                {/* College */}
                <div className="relative group">
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-400 border-4 border-white shadow-sm group-hover:scale-125 transition-transform" />
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-xs mb-1">
                    (2017 – 2019)
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base tracking-tight uppercase">
                    Ghatail Cantonment College, Tangail
                  </h3>
                  <p className="text-slate-700 font-medium text-sm">
                    Higher Secondary Certificate (Science)
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                    GPA – 5.00
                  </span>
                </div>

                {/* High School */}
                <div className="relative group">
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-400 border-4 border-white shadow-sm group-hover:scale-125 transition-transform" />
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-xs mb-1">
                    (2012 – 2017)
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base tracking-tight uppercase">
                    Kalihati R. S. Govt. Pilot High School
                  </h3>
                  <p className="text-slate-700 font-medium text-sm">
                    Secondary School Certificate (Science)
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                    GPA – 5.00
                  </span>
                </div>
              </div>
            </div>

            {/* Teaching Methodology */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-[#0b2545]">
                Teaching Philosophy
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      First-Principles & Problem Solving
                    </h3>
                    <p className="text-slate-600 text-sm mt-1">
                      Whether solving physics numerical problems, higher math equations, or C programming algorithms, concepts are broken down into intuitive mental models.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
                    <Code className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Board Question & CQ/MCQ Mastery
                    </h3>
                    <p className="text-slate-600 text-sm mt-1">
                      For SSC & HSC candidates, regular board question analysis, mock test exams, and step-by-step Creative Question (CQ) writing techniques are provided.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Credentials & Skills */}
          <div className="lg:col-span-5 space-y-6">
            {/* Credentials Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4">
              <h3 className="text-lg font-bold text-[#0b2545] border-b border-slate-100 pb-3">
                Key Credentials & Experience
              </h3>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>
                    <strong>Class 5 to 8 Tuition:</strong> All Subjects (সকল বিষয়)
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>
                    <strong>Class 9 to 10 Tuition:</strong> Science Group Only (বিজ্ঞান বিভাগ)
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>
                    <strong>HSC / Inter Tuition:</strong> ICT (Chapter 1 to 6)
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>
                    <strong>B.Sc. in CSE</strong> — Independent University, Bangladesh
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>
                    <strong>Software Engineering Intern</strong> — CloudCoder
                  </span>
                </li>
              </ul>
            </div>

            {/* Technical Skills & Subjects */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4">
              <h3 className="text-lg font-bold text-[#0b2545] border-b border-slate-100 pb-3">
                Subjects & Technical Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {subjectsAndSkills.map((item) => (
                  <span
                    key={item}
                    className="bg-slate-100 text-slate-800 font-semibold text-xs px-3 py-1.5 rounded-lg border border-slate-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Direct Contact Card */}
            <div className="bg-[#0b2545] text-white rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-amber-400">
                Interested in Private Tuition?
              </h3>
              <p className="text-xs text-slate-300">
                Inquire about tuition availability, class schedule, batch/1-on-1 options, and location details directly via WhatsApp or Email.
              </p>

              <div className="space-y-2 pt-2">
                <a
                  href="https://wa.me/8801714890199"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white text-sm transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Inquiry (01714890199)</span>
                </a>

                <a
                  href="mailto:joytarafder3@gmail.com"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Joy Directly</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

