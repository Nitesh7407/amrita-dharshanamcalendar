import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Amrita Dharma Calendar — Hindu Festival Calendar & Slokha Library',
  description:
    'Discover sacred occasions. Explore ancient wisdom. Celebrate with devotion. An authentic repository of Hindu festivals, Amrita Darshanam occasions, and multilingual slokhas with genuine PDF downloads.',
  keywords: [
    'Amrita Darshanam',
    'Amrita Dharma Calendar',
    'Hindu Festival Calendar',
    'Slokha Library',
    'Amma Dhyanam',
    'Sri Mahaganapathi Homam',
    'Sanskrit Slokhas',
    'Tamil Slokhas',
    'Telugu Slokhas',
    'Amrita Vishwa Vidyapeetham',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FAF6EF] text-[#2D241E] antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
