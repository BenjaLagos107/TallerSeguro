-- ==========================================
-- SCRIPT DE BASE DE DATOS TALLERSEGURO
-- Cópialo y pégalo en el "SQL Editor" de Supabase y ejecútalo
-- ==========================================

-- 1. Tabla de Usuarios (Se asume que el ID coincidirá con auth.users si usas Supabase Auth)
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY, -- Debe ser insertado coincidiendo con auth.users(id)
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    telefono TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Talleres
CREATE TABLE public.talleres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dueno_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    direccion TEXT NOT NULL,
    latitud NUMERIC,
    longitud NUMERIC,
    rango_precios TEXT,
    especialidades TEXT, -- Puede ser un JSONB o TEXT separado por comas
    telefono TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Vehículos
CREATE TABLE public.vehiculos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    patente TEXT UNIQUE NOT NULL,
    kilometraje INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de Órdenes de Trabajo (Reservas)
CREATE TABLE public.ordenes_trabajo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    taller_id UUID NOT NULL REFERENCES public.talleres(id) ON DELETE CASCADE,
    vehiculo_id UUID NOT NULL REFERENCES public.vehiculos(id) ON DELETE CASCADE,
    estado TEXT NOT NULL DEFAULT 'Pendiente', -- Ej: Pendiente, En Revisión, Aprobado, Listo, Entregado
    presupuesto_estimado NUMERIC,
    fecha_ingreso TIMESTAMP WITH TIME ZONE,
    fecha_entrega_estimada TIMESTAMP WITH TIME ZONE,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla de Reseñas
CREATE TABLE public.resenas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_id UUID NOT NULL REFERENCES public.ordenes_trabajo(id) ON DELETE CASCADE,
    taller_id UUID NOT NULL REFERENCES public.talleres(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT,
    criterios TEXT, -- Puede ser JSONB para detallar (ej. rapidez, precio, calidad)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- CONFIGURACIÓN DE SEGURIDAD (RLS)
-- Para simplificar el MVP, habilitamos RLS y creamos políticas públicas 
-- (ADVERTENCIA: En producción esto debe ser más restrictivo)
-- ==========================================

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talleres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordenes_trabajo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resenas ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para el MVP (Permite lectura y escritura a cualquier usuario logueado o anónimo)
-- NOTA: Ajusta esto para mayor seguridad más adelante.
CREATE POLICY "Permitir todo a usuarios" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a talleres" ON public.talleres FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a vehiculos" ON public.vehiculos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a ordenes" ON public.ordenes_trabajo FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a resenas" ON public.resenas FOR ALL USING (true) WITH CHECK (true);
