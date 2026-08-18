import { Star, Quote, GraduationCap } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  institution: string;
  courseTaken: string;
  content: string;
  rating: number;
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Tanvir Hossain',
      role: 'CSE Student',
      institution: 'Independent University, Bangladesh (IUB)',
      courseTaken: 'Data Structures & Algorithms in C++',
      content:
        'Joy bro explained Pointers, Linked Lists, and Trees with such clear visual mental models! My DSA course grade jumped from a C to an A-. The 1-on-1 code reviews made all the difference.',
      rating: 5,
    },
    {
      id: 2,
      name: 'Nusrat Jahan',
      role: 'Junior Web Developer',
      institution: 'BRAC University Alumni',
      courseTaken: 'Full-Stack Web Development with Next.js',
      content:
        'I built 3 full-stack projects during the tuition sessions with Joy. He taught me how to connect React App Router with MongoDB and deploy on Vercel. Highly recommended!',
      rating: 5,
    },
    {
      id: 3,
      name: 'Siam Rahman',
      role: 'Software Engineering Aspirant',
      institution: 'IUB CSE Dept',
      courseTaken: 'OOP in Java & C++',
      content:
        'Understanding Encapsulation, Polymorphism, and SOLID principles used to be confusing. Joy broke them down into real-world software examples. Best tutor for CSE students in BD.',
      rating: 5,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 text-xs font-semibold">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Student Testimonials</span>
        </div>
        <h2 className="text-3xl font-extrabold text-[#0b2545]">What Students Say About TutorNova</h2>
        <p className="text-slate-600 text-sm sm:text-base">
          Read feedback from university computer science students and tuition alumni mentored by Joy Tarafder.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed italic">
                "{item.content}"
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-1">
              <h4 className="font-bold text-slate-900 text-base">{item.name}</h4>
              <p className="text-xs font-medium text-amber-600">{item.role} • {item.institution}</p>
              <p className="text-[11px] text-slate-400 font-mono">Course: {item.courseTaken}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
