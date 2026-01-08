import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SwipeEats - Discover Your Next Favorite Restaurant",
  description: "A Tinder-like restaurant discovery app. Swipe right on restaurants you love, and let our ML-powered recommendations help you find the perfect place to eat.",
  keywords: ["restaurant", "food", "discovery", "swipe", "recommendations", "dining"],
  authors: [{ name: "SwipeEats" }],
  openGraph: {
    title: "SwipeEats",
    description: "Swipe to discover amazing restaurants near you",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SwipeEats",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Inline styles for instant splash screen */}
        <style dangerouslySetInnerHTML={{
          __html: `
          #splash-screen {
            position: fixed;
            inset: 0;
            background-color: #09090b;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            transition: opacity 0.3s ease-out;
          }
          #splash-screen.hidden {
            opacity: 0;
            pointer-events: none;
          }
          #splash-logo {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            box-shadow: 0 0 60px rgba(16, 185, 129, 0.4);
            animation: pulse-logo 2s ease-in-out infinite;
          }
          #splash-text {
            margin-top: 24px;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: -0.02em;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
          }
          #splash-text span { color: #10b981; }
          #splash-tagline {
            margin-top: 8px;
            font-size: 14px;
            color: #71717a;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
          }
          #splash-dots {
            display: flex;
            gap: 8px;
            margin-top: 32px;
          }
          .splash-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: #10b981;
            animation: bounce-dot 0.8s ease-in-out infinite;
          }
          .splash-dot:nth-child(2) { animation-delay: 0.15s; }
          .splash-dot:nth-child(3) { animation-delay: 0.3s; }
          @keyframes pulse-logo {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes bounce-dot {
            0%, 100% { transform: translateY(0); opacity: 0.4; }
            50% { transform: translateY(-12px); opacity: 1; }
          }
        `}} />
      </head>
      <body className="antialiased bg-black text-white min-h-screen">
        {/* Static splash screen - shows instantly before React hydrates */}
        <div id="splash-screen">
          <div id="splash-logo">🍽️</div>
          <div id="splash-text">Swipe<span>Eats</span></div>
          <div id="splash-tagline">Find your next meal</div>
          <div id="splash-dots">
            <div className="splash-dot"></div>
            <div className="splash-dot"></div>
            <div className="splash-dot"></div>
          </div>
        </div>
        {children}
        {/* Script to hide splash once React is ready */}
        <script dangerouslySetInnerHTML={{
          __html: `
          // Hide splash screen once page is interactive
          if (document.readyState === 'complete') {
            document.getElementById('splash-screen')?.classList.add('hidden');
            setTimeout(() => document.getElementById('splash-screen')?.remove(), 300);
          } else {
            window.addEventListener('load', function() {
              setTimeout(function() {
                document.getElementById('splash-screen')?.classList.add('hidden');
                setTimeout(() => document.getElementById('splash-screen')?.remove(), 300);
              }, 100);
            });
          }
        `}} />
      </body>
    </html>
  );
}
