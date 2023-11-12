import { ClerkProvider } from "@clerk/nextjs";
import { Sora } from "next/font/google";
import React from "react";

import '../globals.css';

export const metadata = {
    title: 'Screamer - Scream your thoughts',
    description: 'Scream your thoughts out to the world! - A next.js 14 Meta Screamer Application',
}

const sora = Sora({ subsets: ['latin'], weight: ['100', '200', '300', '400', '500', '600', '700', '800'] });

export default function RootLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body className={`${sora.className} bg-dark-1`}>
                    <div className="w-full flex justify-center items-center min-h-screen">
                        {children}
                    </div>
                </body>
            </html>
        </ClerkProvider>
    );
}