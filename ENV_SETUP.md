# 🔐 Configuración de Variables de Entorno

## Paso 1: Crear archivo `.env.local`

Crea un archivo llamado `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

## Paso 2: Obtener las credenciales de Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## ⚠️ Importante

- **NUNCA** subas el archivo `.env.local` a tu repositorio
- El archivo ya está incluido en `.gitignore`
- Las variables con prefijo `NEXT_PUBLIC_` son visibles en el cliente

