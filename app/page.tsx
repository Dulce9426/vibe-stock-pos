'use client';

import Link from 'next/link';
import { 
  ShoppingCart, 
  LayoutDashboard, 
  Package, 
  TrendingUp,
  Zap,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// -----------------------------------------------------------------------------
// Feature Card Component
// -----------------------------------------------------------------------------

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <div 
      className={`glass-card p-6 animate-slide-up opacity-0 ${delay}`}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 text-violet-400">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-slate-100 mb-1">{title}</h3>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Main Landing Page
// -----------------------------------------------------------------------------

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl mx-auto text-center">
          {/* Logo & Title */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-2xl shadow-violet-500/30">
              <Package className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              <span className="gradient-text">Vibe Stock</span>
              <span className="text-slate-400"> & </span>
              <span className="text-white">POS</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Sistema de Punto de Venta e Inventario híbrido. 
              Gestiona tu negocio con estilo y eficiencia.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up opacity-0 animation-delay-200">
            <Link href="/login?role=cashier" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="primary"
                leftIcon={<ShoppingCart className="w-5 h-5" />}
                className="w-full sm:w-auto min-w-[240px] animate-pulse-glow"
              >
                Iniciar como Cajero
              </Button>
            </Link>
            
            <Link href="/login?role=admin" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="secondary"
                leftIcon={<LayoutDashboard className="w-5 h-5" />}
                className="w-full sm:w-auto min-w-[240px]"
              >
                Panel de Administración
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Rápido y Eficiente"
              description="Procesa ventas en segundos con nuestra interfaz optimizada."
              delay="animation-delay-300"
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Reportes en Tiempo Real"
              description="Visualiza tus ventas y estadísticas al instante."
              delay="animation-delay-400"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Seguro y Confiable"
              description="Datos protegidos con autenticación robusta."
              delay="animation-delay-500"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-500 text-sm">
        <p>
          © {new Date().getFullYear()} Vibe Stock & POS v1.0 
          Hecho con <span className="text-violet-400">♥</span> para tu negocio.
        </p>
      </footer>
    </div>
  );
}

