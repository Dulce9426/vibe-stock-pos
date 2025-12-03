import { Suspense } from 'react';

// -----------------------------------------------------------------------------
// Auth Layout
// Envuelve las páginas de autenticación con Suspense para useSearchParams
// -----------------------------------------------------------------------------

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

