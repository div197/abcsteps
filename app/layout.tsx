import './globals.css';
import 'katex/dist/katex.min.css';
import 'mapbox-gl/dist/mapbox-gl.css';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, Geist } from 'next/font/google';

import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from 'sonner';

import { Providers } from './providers';

export const metadata: Metadata = {
  metadataBase: new URL('https://abcsteps.com'),
  title: {
    default: 'ABCSteps Vivek - AI Educational Companion',
    template: '%s | ABCSteps Vivek',
    absolute: 'ABCSteps Vivek - AI Educational Companion',
  },
  description: 'An AI-powered educational companion that guides students through Socratic questioning, personalized memory tracking, and multilingual support for Indian languages.',
  openGraph: {
    url: 'https://abcsteps.com',
    siteName: 'ABCSteps Vivek',
  },
  keywords: [
    'abcsteps',
    'vivek',
    'ai education',
    'educational companion',
    'socratic method',
    'guru protocol',
    'indian education',
    'multilingual learning',
    'ai tutor',
    'personalized learning',
    'memory tracking',
    'smriti protocol',
    'trimurti routing',
    'hindi education',
    'tamil education',
    'bengali education',
    'indian languages',
    'ai learning assistant',
    'educational technology',
    'edtech india',
    'div197',
    'orange network foundation',
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
  ],
};

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  preload: true,
  display: 'swap',
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin'],
  variable: '--font-be-vietnam-pro',
  preload: true,
  display: 'swap',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${beVietnamPro.variable} font-sans antialiased`} suppressHydrationWarning>
        <NuqsAdapter>
          <Providers>
            <Toaster position="top-center" />
            {children}
          </Providers>
        </NuqsAdapter>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
