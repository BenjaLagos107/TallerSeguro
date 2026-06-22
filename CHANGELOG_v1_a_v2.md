# Changelog: Transición de Versión 1 a Versión 2

Este documento detalla todos los cambios y mejoras implementadas durante la actualización de TallerSeguro a su Versión 2 (mobile-first), junto con los motivos técnicos y de diseño detrás de cada decisión.

## 1. Diseño Mobile-First y Experiencia de Usuario (UX)
*   **Rediseño de Tarjetas de Talleres:**
    *   **Cambio:** Las tarjetas pasaron de ser apiladas (verticales) a tener una disposición horizontal (imagen a la izquierda, detalles a la derecha).
    *   **Motivo:** Ahorrar espacio vertical en pantallas pequeñas, permitiendo al usuario ver más opciones de talleres sin tener que hacer tanto scroll.
*   **Barra de Navegación Inferior (Bottom Tab Navigator):**
    *   **Cambio:** Estandarización de la barra inferior para móviles, añadiendo recuadros de fondo dinámicos que indican claramente qué pestaña está activa.
    *   **Motivo:** Mejorar la orientación del usuario dentro de la app, adaptándose a los estándares de diseño de aplicaciones nativas.
*   **Limpieza de la Versión de Escritorio:**
    *   **Cambio:** Eliminación de los emojis en los textos de las pestañas principales de navegación (Inicio, Reservas, Mi Perfil).
    *   **Motivo:** Lograr un aspecto más limpio, formal y profesional para los usuarios que acceden desde un computador.
*   **Simplificación del Perfil de Usuario:**
    *   **Cambio:** Se eliminó el botón "Inscribir / Administrar mi Taller" del perfil de usuario general.
    *   **Motivo:** Reducir el desorden visual (clutter) en la versión móvil para los conductores regulares. El acceso para dueños de talleres ahora se maneja desde la landing page inicial ("Quiero probarlo" vs "Soy taller").

## 2. Nuevas Funcionalidades Core: Búsqueda y Asistente
*   **Búsqueda por Servicios Específicos:**
    *   **Cambio:** Se implementó un buscador predictivo que permite a los usuarios buscar directamente por el tipo de servicio que necesitan (ej. "Cambio de aceite", "Alineación"), filtrando automáticamente la lista para mostrar solo los talleres que lo ofrecen, junto con el precio estimado y tiempo de ese servicio.
    *   **Motivo:** Los usuarios generalmente saben qué reparación necesitan, pero desconocen qué talleres la realizan. Este cambio invierte la experiencia, haciéndola centrada en la necesidad inmediata del cliente y agilizando la decisión de reserva.
*   **Asistente de Diagnóstico con IA:**
    *   **Cambio:** Se creó un chat interactivo donde el usuario puede describir los síntomas de su auto en lenguaje natural (ej. "el volante vibra al frenar"). La IA analiza el texto, sugiere posibles diagnósticos, calcula un rango de precios estimado y detecta la especialidad mecánica requerida, conectando estos resultados para recomendar instantáneamente los talleres más adecuados.
    *   **Motivo:** Reducir la fricción y la "ansiedad mecánica" de los usuarios sin conocimientos técnicos. El asistente actúa como un traductor que convierte un síntoma ambiguo en una solución concreta y un taller de confianza, democratizando el acceso a las reparaciones.

## 3. Lógica de Negocio y Algoritmos
*   **Algoritmo de Taller Destacado:**
    *   **Cambio:** Se modificó la lógica que elige al taller destacado. Antes solo miraba la calificación promedio (pudiendo recomendar un taller con una sola reseña de 5 estrellas). Ahora considera tanto el promedio como el volumen de reseñas.
    *   **Motivo:** Evitar sesgos y ofrecer recomendaciones reales y confiables. Un taller con calificación 4.8 y 50 reseñas es más confiable que uno con 5.0 y 1 reseña.
*   **Consistencia del Taller Destacado:**
    *   **Cambio:** Se forzó a que el taller destacado siempre aparezca en el `index 0` (primer lugar) no solo en la búsqueda general, sino también en la búsqueda por servicios y en las recomendaciones del Asistente IA.
    *   **Motivo:** Mantener coherencia en toda la plataforma y asegurar que la mejor opción sea siempre lo primero que vea el usuario, independientemente de cómo busque.
*   **Filtros Globales:**
    *   **Cambio:** Los filtros de Sector y Ordenamiento se integraron para funcionar de manera transversal entre las distintas vistas.
    *   **Motivo:** Que el usuario no pierda sus preferencias de búsqueda al cambiar entre la vista de todos los talleres y las recomendaciones del asistente.

## 4. Estados Vacíos (Empty States) y Manejo de Errores
*   **Diseño de Estados Vacíos:**
    *   **Cambio:** Si el usuario no tiene reservas activas o vehículos, la UI ya no muestra listas en blanco. En su lugar, muestra mensajes amigables como "Aún no tienes reservas activas" y botones de Call-To-Action ("Buscar Servicios" o "+ Añadir mi primer vehículo").
    *   **Motivo:** Guiar al usuario hacia su próxima acción y evitar confusión de si la plataforma está fallando o simplemente no hay datos.
*   **Solución de Bloqueos de Carga Silenciosos:**
    *   **Cambio:** Se reparó un error crítico donde los usuarios sin vehículos, o los usuarios invitados (Guest), provocaban que el sistema lanzara un error `TypeError` en Supabase que bloqueaba la interfaz, dejando el texto "Cargando vehículos..." congelado en pantalla.
    *   **Motivo:** El sistema intentaba leer un `id` de usuario inexistente o usar consultas mal estructuradas. Se independizó la carga de reservas y vehículos en bloques `try/catch` separados para garantizar que el fallo de uno no congele la aplicación entera.

## 5. Panel de Administración para Dueños (Owner Dashboard)
*   **Optimización del Kanban de Órdenes:**
    *   **Cambio:** Se rediseñaron las tarjetas de los trabajos pendientes. Ahora son ultracompactas, mostrando solo el servicio a realizar, la patente del vehículo y el estado.
    *   **Motivo:** Permitir una lectura rápida y directa (escaneo visual) del trabajo pendiente sin distraer al mecánico con información financiera o textos largos irrelevantes para la operación.
*   **Botones de Transición Maximizados:**
    *   **Cambio:** Los botones de flechas (Avanzar/Retroceder de estado) pasaron a ocupar el 100% del ancho de la tarjeta inferior (50% cada uno), desplazando la etiqueta de estado hacia abajo.
    *   **Motivo:** Facilitar la interacción en pantallas táctiles (dedos grandes o con guantes en el taller) para mover órdenes entre "Pendiente", "En revisión" y "Entregado" con máxima rapidez.
*   **Modal de Detalles de Orden:**
    *   **Cambio:** Al presionar sobre el cuerpo de la tarjeta Kanban compacta, se abre un modal con la información financiera completa, datos del cliente, fecha de ingreso y todas las observaciones.
    *   **Motivo:** Mantener el tablero Kanban limpio y ágil, pero permitir acceso instantáneo a los detalles profundos cuando el mecánico o dueño realmente lo requiere.
