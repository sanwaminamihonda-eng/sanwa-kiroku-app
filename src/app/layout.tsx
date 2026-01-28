import type { Metadata, Viewport } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { UpdateNotifier } from '@/components/pwa/UpdateNotifier';

const notoSansJP = Noto_Sans_JP({
  variable: '--font-noto-sans-jp',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: '介護記録アプリ',
  description: '施設サービス記録システム - バイタル、排泄、食事、水分量の記録管理',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '介護記録',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${notoSansJP.variable} font-sans antialiased bg-gray-50`}>
        <AuthProvider>
          <UpdateNotifier />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
