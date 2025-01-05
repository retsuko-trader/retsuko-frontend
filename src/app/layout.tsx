import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from '@/components/layout/NavBar';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'yuno',
  description: "Yuno's here to protect you",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sans antialiased relative flex overflow-hidden w-screen h-screen flex-col sm:flex-row bg-h-background text-h-text`}
      >
        <NavBar />

        <div className='w-full'>
          <Header />

          <main className='max-h-full h-[calc(100vh - 44px)] overflow-y-auto px-3 text-h-text/80'>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
