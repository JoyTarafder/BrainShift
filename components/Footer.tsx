import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0b2545] text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8 items-start">
          {/* Col 1: Brand */}
          <div className="md:col-span-6 space-y-4">
            <div className="bg-white/95 px-3 py-1.5 rounded-lg inline-flex items-center">
              <Image
                src="/images/brainshift-logo.png"
                alt="BrainShift Logo"
                width={180}
                height={54}
                style={{ height: "36px", width: "auto" }}
                className="object-contain"
                unoptimized
              />
            </div>
            <p className="text-slate-400 text-sm max-w-md">
              Empowering academic & computer science students
              through structured 1-on-1 tuition, AI-based mentorship, and
              specialized coaching by Joy Tarafder.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="md:col-span-3">
            <h2 className="text-white font-semibold mb-4 text-sm tracking-wider">
              Quick Links
            </h2>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link
                  href="/"
                  className="hover:text-amber-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="hover:text-amber-400 transition-colors"
                >
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-amber-400 transition-colors"
                >
                  About Joy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div className="md:col-span-3">
            <h2 className="text-white font-semibold mb-4 text-sm tracking-wider">
              Contact Joy
            </h2>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>CSE @ IUB</li>
              <li>Dhaka, Bangladesh</li>
              <li>
                <a
                  href="https://wa.me/8801714890199"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-2 font-medium"
                >
                  <Image
                    src="/images/whatsapp-clean-icon.png"
                    alt="WhatsApp"
                    width={20}
                    height={20}
                    className="w-5 h-5 object-contain inline-block"
                    unoptimized
                  />
                  <span>WhatsApp: 01714890199</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:joytarafder3@gmail.com"
                  className="hover:text-amber-400 transition-colors flex items-center gap-2 font-medium"
                >
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>joytarafder3@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center md:flex md:justify-between md:text-left text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} BrainShift — Joy Tarafder. All rights
            reserved.
          </p>
          <p className="mt-2 md:mt-0 font-medium text-slate-400">
            Developed by{" "}
            <span className="text-amber-400 font-bold hover:text-amber-300 transition-colors">
              Joy Tarafder
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
