import React from 'react';
// import '../styles/globals.css'; // Uncomment this once you have Tailwind CSS configured

export const metadata = {
  title: 'Chess Coach AI',
  description: 'A web-based chess training platform with real-time LLM coaching',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        {/* The 'children' prop represents your app/page.tsx content */}
        {children}
      </body>
    </html>
  );
}