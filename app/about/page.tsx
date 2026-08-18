import Image from 'next/image';
import Link from 'next/link';
import { GraduationCap, Award, Code, CheckCircle2, Mail, MessageSquare, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const skills = [
    'Data Structures & Algorithms',
    'C++ / C Programming',
    'Java & Object-Oriented Design',
    'JavaScript (ES6+) & TypeScript',
    'React.js & Next.js (App Router)',
    'Node.js & REST API Architecture',
    'MongoDB & Database Design',
    'Tailwind CSS & Web UI Design',
    'Git, GitHub & Cloud Deployment'
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-[#0b2545] via-[#13293d] to-[#1e3a8a] text-white rounded-3xl p-8 lg:p-14 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <GraduationCap className="w-4 h-4" />
              <span>Engineer & Educator</span>
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              About Joy Tarafder
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Software Engineer, Computer Science student at Independent University, Bangladesh (IUB), and founder of <strong className="text-amber-400 font-semibold">TutorNova</strong>.
            </p>
          </div>
        </div>

        {/* Bio & Philosophy Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Bio Details */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-2xl font-bold text-[#0b2545]">Background & Journey</h2>
              <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                Joy Tarafder is currently pursuing his Bachelor of Science in Computer Science and Engineering (CSE) at Independent University, Bangladesh (IUB). Having completed a practical software engineering internship at <strong>CloudCoder</strong>, Joy brings real-world industry experience into his teaching methodology.
              </p>
              <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                Through 1-on-1 private tuition and structured courses on TutorNova, Joy helps students bridge the gap between abstract academic theory and practical, production-ready coding skills.
              </p>
            </div>

            {/* Teaching Methodology */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-[#0b2545]">Teaching Philosophy</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                    <Code className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Hands-On Code Reviews</h3>
                    <p className="text-slate-600 text-sm mt-1">
                      Instead of dry lectures, every tuition session revolves around writing real code, debugging errors line-by-line, and receiving direct feedback on code quality.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">First-Principles Understanding</h3>
                    <p className="text-slate-600 text-sm mt-1">
                      We break down complex algorithm concepts (pointers, recursion, trees, dynamic programming) into intuitive, visual mental models.
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
                Key Credentials
              </h3>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                  <span><strong>B.Sc. in CSE</strong> — Independent University, Bangladesh</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                  <span><strong>Software Engineering Intern</strong> — CloudCoder</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                  <span><strong>Experienced Private Tutor</strong> — 1-on-1 & Group Sessions</span>
                </li>
              </ul>
            </div>

            {/* Technical Skills */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4">
              <h3 className="text-lg font-bold text-[#0b2545] border-b border-slate-100 pb-3">
                Technical Stack & Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-slate-100 text-slate-800 font-semibold text-xs px-3 py-1.5 rounded-lg border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Direct Contact Card */}
            <div className="bg-[#0b2545] text-white rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-amber-400">Interested in 1-on-1 Tuition?</h3>
              <p className="text-xs text-slate-300">
                Have specific course requirements, exam preparation needs, or project mentorship requests?
              </p>

              <div className="space-y-2 pt-2">
                <a
                  href="https://wa.me/qr/LS75PV3LDE5SI1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white text-sm transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Inquiry</span>
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
