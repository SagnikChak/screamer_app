import type { Metadata } from 'next';
import { Sora } from 'next/font/google';
import '../globals.css';
import { ClerkProvider } from '@clerk/nextjs';

import Topbar from '@/components/shared/Topbar';
import LeftSidebar from '@/components/shared/LeftSidebar';
import RightSidebar from '@/components/shared/RightSidebar';
import Bottombar from '@/components/shared/Bottombar';

const sora = Sora({ subsets: ['latin'], weight: ['100', '200', '300', '400', '500', '600', '700', '800'] });

export const metadata: Metadata = {
  title: 'Screamer - Scream your thoughts',
  description: 'Scream your thoughts out to the world!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={sora.className}>
          <Topbar />

          <main className='flex flex-row'>
            <LeftSidebar />
            
            <section className="main-container">
              <div className='w-full max-w-4xl'>
                {children}
              </div>
            </section>

            <RightSidebar />
          </main>

          <Bottombar />
        </body>
      </html>
    </ClerkProvider>
  )
}
