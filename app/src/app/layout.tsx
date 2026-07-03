import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const mono = IBM_Plex_Mono({
  variable: '--font-ibm',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Model Distillery',
  description: 'An immersive platform for crafting, evaluating, and deploying specialized open-source AI models.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#0b0a09] text-[#f8f5f2]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
