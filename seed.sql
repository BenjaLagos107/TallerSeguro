-- ==========================================
-- SCRIPT DE DATOS DE PRUEBA MASIVOS (SEED DINÁMICO) - TALLERSEGURO
-- ==========================================
-- Instrucciones: Copia y pega todo este código en el "SQL Editor" de Supabase y ejecútalo.

-- 1. Crear la tabla taller_servicios para la Búsqueda por Servicios
DROP TABLE IF EXISTS public.taller_servicios CASCADE;

CREATE TABLE public.taller_servicios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    taller_id UUID NOT NULL REFERENCES public.talleres(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    precio_estimado NUMERIC,
    tiempo_estimado_valor INTEGER,
    tiempo_estimado_unidad TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.taller_servicios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo a taller_servicios" ON public.taller_servicios;
CREATE POLICY "Permitir todo a taller_servicios" ON public.taller_servicios FOR ALL USING (true) WITH CHECK (true);

-- 2. Asegurar que la tabla talleres tiene la columna 'sector' y ya NO tiene latitud/longitud
DO $BODY$
BEGIN
    ALTER TABLE public.talleres ADD COLUMN IF NOT EXISTS sector TEXT;
    ALTER TABLE public.talleres DROP COLUMN IF EXISTS latitud;
    ALTER TABLE public.talleres DROP COLUMN IF EXISTS longitud;
EXCEPTION WHEN others THEN
    -- Ignorar si hay problemas
END;
$BODY$;


DO $BODY$
DECLARE
    -- Arreglos de Sectores (18)
    sectores TEXT[] := ARRAY['Estación Central', 'Huechuraba', 'Independencia', 'La Florida', 'La Reina', 'Las Condes', 'Lo Barnechea', 'Macul', 'Maipú', 'Peñalolén', 'Providencia', 'Puente Alto', 'Quilicura', 'Recoleta', 'San Miguel', 'Santiago Centro', 'Vitacura', 'Ñuñoa'];
    
    -- Especialidades
    especialidades TEXT[] := ARRAY['Mecánica General', 'Frenos', 'Suspensión y Dirección', 'Electromecánica', 'Desabolladura y Pintura', 'Transmisión', 'Cambio de Aceite y Filtros'];
    
    -- Nombres de talleres base
    nombres_talleres TEXT[] := ARRAY['Auto Fix', 'Motorsport', 'Clínica Automotriz', 'Taller Express', 'Mecánica Premium', 'Frenos y Más', 'Servicio Total', 'Pro Auto', 'Garage 54', 'Master Mechanic'];
    
    -- Comentarios de reseñas
    comentarios TEXT[] := ARRAY[
        'Excelente servicio, muy rápidos y transparentes.',
        'Buen precio, pero se demoraron un poco más de lo acordado.',
        'Me explicaron todo con peras y manzanas. Muy recomendado.',
        'El mecánico fue muy amable. El auto quedó impecable.',
        'Pésima experiencia, me cobraron de más. No vuelvo.',
        'Todo bien, servicio estándar. Cumplen con lo que dicen.',
        'Increíble la rapidez con la que encontraron el problema.',
        'Revisión muy detallada. Me dieron confianza desde el día uno.',
        'Tuve que volver por un ruido nuevo, pero me lo solucionaron por garantía.',
        'El mejor taller de la comuna por lejos.'
    ];

    -- Marcas y Modelos
    marcas TEXT[] := ARRAY['Toyota', 'Chevrolet', 'Ford', 'Nissan', 'Hyundai', 'Kia', 'Suzuki', 'Peugeot'];
    modelos TEXT[] := ARRAY['Yaris', 'Sail', 'EcoSport', 'Versa', 'Accent', 'Rio', 'Swift', '208'];

    -- Variables temporales
    taller_id UUID;
    vehiculo_id UUID;
    orden_id UUID;
    usuario_id UUID;
    
    -- Colecciones temporales
    talleres_creados UUID[] := '{}';
    vehiculos_creados UUID[] := '{}';
    clientes_creados UUID[] := '{}';
    
    -- Loops
    i INT;
    j INT;
    num_servicios INT;
    random_idx INT;
    random_calificacion INT;
    random_precio NUMERIC;
    
    dueno_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
    -- ==========================================
    -- 0. LIMPIEZA DE DATOS ANTERIORES
    -- ==========================================
    DELETE FROM public.talleres;
    DELETE FROM public.vehiculos;
    DELETE FROM public.ordenes_trabajo;
    DELETE FROM public.resenas;
    DELETE FROM public.usuarios WHERE email LIKE '%.demo@tallerseguro.cl';

    -- Insertar un dueño genérico
    INSERT INTO public.usuarios (id, nombre, email, telefono) VALUES 
    (dueno_id, 'Dueño Sistema', 'dueno.demo@tallerseguro.cl', '+56900000000')
    ON CONFLICT (id) DO NOTHING;

    -- ==========================================
    -- 1. CREAR 40 TALLERES (Aleatorios en los 18 sectores)
    -- ==========================================
    FOR i IN 1..40 LOOP
        taller_id := gen_random_uuid();
        
        -- Sector aleatorio (1 a 18)
        random_idx := floor(random() * 18 + 1)::int;
        
        INSERT INTO public.talleres (id, dueno_id, nombre, direccion, sector, rango_precios, especialidades, telefono)
        VALUES (
            taller_id,
            dueno_id,
            nombres_talleres[floor(random() * 10 + 1)::int] || ' ' || sectores[random_idx], -- Ej: Auto Fix Las Condes
            'Av. Principal ' || floor(random() * 9000 + 100)::text,
            sectores[random_idx],
            (ARRAY['$', '$$', '$$$', '$$$$'])[floor(random() * 4 + 1)::int],
            ('["' || especialidades[floor(random() * 7 + 1)::int] || '", "' || especialidades[floor(random() * 7 + 1)::int] || '"]')::jsonb,
            '+569' || floor(random() * 89999999 + 10000000)::text
        );
        
        talleres_creados := array_append(talleres_creados, taller_id);
        
        -- Crear de 2 a 4 servicios por taller
        FOR j IN 1..(floor(random() * 3 + 2)::int) LOOP
            random_precio := floor(random() * 150 + 15)::numeric * 1000;
            INSERT INTO public.taller_servicios (taller_id, nombre, precio_estimado, tiempo_estimado_valor, tiempo_estimado_unidad)
            VALUES (
                taller_id,
                especialidades[floor(random() * 7 + 1)::int],
                random_precio,
                floor(random() * 5 + 1)::int,
                'horas'
            );
        END LOOP;
    END LOOP;

    -- ==========================================
    -- 2. CREAR 20 CLIENTES Y SUS VEHÍCULOS
    -- ==========================================
    FOR i IN 1..20 LOOP
        usuario_id := gen_random_uuid();
        INSERT INTO public.usuarios (id, nombre, email, telefono)
        VALUES (
            usuario_id,
            'Cliente Demo ' || i,
            'cliente' || i || '.demo@tallerseguro.cl',
            '+569' || floor(random() * 89999999 + 10000000)::text
        );
        clientes_creados := array_append(clientes_creados, usuario_id);
        
        -- Cada cliente tiene 1 o 2 vehículos
        num_servicios := floor(random() * 2 + 1)::int;
        FOR j IN 1..num_servicios LOOP
            vehiculo_id := gen_random_uuid();
            random_idx := floor(random() * 8 + 1)::int;
            
            INSERT INTO public.vehiculos (id, usuario_id, marca, modelo, patente, kilometraje)
            VALUES (
                vehiculo_id,
                usuario_id,
                marcas[random_idx],
                modelos[random_idx],
                chr(floor(random() * 26 + 65)::int) || chr(floor(random() * 26 + 65)::int) || chr(floor(random() * 26 + 65)::int) || chr(floor(random() * 26 + 65)::int) || floor(random() * 90 + 10)::text,
                floor(random() * 150000 + 10000)::int
            );
            vehiculos_creados := array_append(vehiculos_creados, vehiculo_id);
        END LOOP;
    END LOOP;

    -- ==========================================
    -- 3. CREAR 140 ÓRDENES Y RESEÑAS
    -- ==========================================
    FOR i IN 1..140 LOOP
        orden_id := gen_random_uuid();
        taller_id := talleres_creados[floor(random() * 40 + 1)::int];
        vehiculo_id := vehiculos_creados[floor(random() * array_length(vehiculos_creados, 1) + 1)::int];
        
        INSERT INTO public.ordenes_trabajo (id, taller_id, vehiculo_id, estado, presupuesto_estimado)
        VALUES (
            orden_id,
            taller_id,
            vehiculo_id,
            'Entregado',
            floor(random() * 200 + 20)::numeric * 1000
        );
        
        SELECT v.usuario_id INTO usuario_id FROM public.vehiculos v WHERE v.id = vehiculo_id LIMIT 1;
        
        -- Sesgar calificación hacia 4 y 5
        random_calificacion := floor(random() * 10 + 1)::int;
        IF random_calificacion > 8 THEN random_calificacion := 5;
        ELSIF random_calificacion > 5 THEN random_calificacion := 4;
        ELSIF random_calificacion > 3 THEN random_calificacion := 3;
        ELSIF random_calificacion > 1 THEN random_calificacion := 2;
        ELSE random_calificacion := 1;
        END IF;

        INSERT INTO public.resenas (orden_id, taller_id, usuario_id, calificacion, comentario)
        VALUES (
            orden_id,
            taller_id,
            usuario_id,
            random_calificacion,
            comentarios[floor(random() * 10 + 1)::int]
        );
    END LOOP;
END;
$BODY$;
