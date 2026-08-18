import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'TutorNova — Personal Tutor & Computer Science Courses by Joy Tarafder',
  description:
    'Private tutoring, 1-on-1 coding mentorship, and computer science courses by Joy Tarafder (CSE @ IUB). Learn Data Structures, Full-Stack Web Development, and OOP.',
  keywords: [
    'TutorNova',
    'Joy Tarafder',
    'CSE Tutor Bangladesh',
    'IUB Tutor',
    'Data Structures C++',
    'Next.js Course',
    'Private Coding Tutor Dhaka',
  ],
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: 'TutorNova — Personal Tutor & Computer Science Courses by Joy Tarafder',
    description:
      'Master Data Structures, Full-Stack Web Development, and OOP with Joy Tarafder. 1-on-1 private tuition and structured online courses.',
    url: baseUrl,
    siteName: 'TutorNova',
    images: [
      {
        url: `${baseUrl}/images/logo.png`,
        width: 1200,
        height: 630,
        alt: 'TutorNova — Personal Tutor Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TutorNova — Personal Tutor & Computer Science Courses',
    description:
      'Private tutoring, 1-on-1 coding mentorship, and computer science courses by Joy Tarafder.',
    images: [`${baseUrl}/images/logo.png`],
  },
  icons: {
    icon: '/images/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <Providers>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
