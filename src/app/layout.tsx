import './globals.css';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import AuthProvider from '@/components/providers/SessionProvider';
import { authOptions } from './api/auth/[...nextauth]/options';

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider session={session}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
