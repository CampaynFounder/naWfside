import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'naWfside',
  description: 'AI Record Label & Marketplace',
};

export const viewport = {
  width: 'device-width' as const,
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0a0f',
  viewportFit: 'cover' as const, // safe-area insets for notched devices
};

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
            </Script>
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}

