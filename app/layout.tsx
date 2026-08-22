import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'BrainShift — Academic Tuition, AI Mentorship & CS Courses by Joy Tarafder',
  description:
    'Private tutoring for Class 5–10, Inter ICT, 1-on-1 coding mentorship, AI-based internship programs and computer science courses by Joy Tarafder (CSE @ IUB).',
  keywords: [
    'BrainShift',
    'Joy Tarafder',
    'CSE Tutor Bangladesh',
    'IUB Tutor',
    'Class 5-10 Tuition',
    'Inter ICT Coaching',
    'AI Mentorship Dhaka',
    'Data Structures C++',
    'Next.js Course',
    'Private Coding Tutor Dhaka',
  ],
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: 'BrainShift — Academic Tuition, AI Mentorship & CS Courses by Joy Tarafder',
    description:
      'Master School Science, Inter ICT, Full-Stack Web Development, and AI Mentorship with Joy Tarafder. 1-on-1 private tuition and structured online courses.',
    url: baseUrl,
    siteName: 'BrainShift',
    images: [
      {
        url: `${baseUrl}/images/brainshift-logo.png`,
        width: 1200,
        height: 630,
        alt: 'BrainShift — Personal Tutor & Mentorship Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BrainShift — Academic Tuition & AI Mentorship by Joy Tarafder',
    description:
      'Private tutoring, 1-on-1 coding mentorship, and computer science courses by Joy Tarafder.',
    images: [`${baseUrl}/images/brainshift-logo.png`],
  },
  icons: {
    icon: '/images/brain-icon.png',
    shortcut: '/images/brain-icon.png',
    apple: '/images/brain-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/brain-icon.png" type="image/png" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased" suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
