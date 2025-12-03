import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// -----------------------------------------------------------------------------
// Font Configuration
// -----------------------------------------------------------------------------

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Vibe Stock & POS',
  description: 'Sistema de Punto de Venta e Inventario Híbrido',
  keywords: ['POS', 'Inventario', 'Ventas', 'Stock', 'Punto de Venta'],
  authors: [{ name: 'Vibe Stock' }],
};

// -----------------------------------------------------------------------------
// Root Layout
// -----------------------------------------------------------------------------

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen bg-slate-950 text-white antialiased">
        {/* Background Pattern */}
        <div className="fixed inset-0 -z-10">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          
          {/* Subtle Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          {/* Glow Effects */}
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        {/* Main Content */}
        <main className="relative">
          {children}
        </main>
      </body>
    </html>
  );
}

