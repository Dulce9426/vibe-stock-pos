/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de imágenes para Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Optimizaciones experimentales
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

module.exports = nextConfig;

