# TallerSeguro - Definición y Características del MVP

Este documento detalla en qué consiste el Producto Mínimo Viable (MVP) de **TallerSeguro**, diseñado con un enfoque "Mobile-First" para conectar a conductores sin conocimientos técnicos con talleres mecánicos de confianza, fomentando la transparencia en precios y procesos.

---

## 1. Visión General del MVP
El MVP es una plataforma web progresiva de doble cara (Two-Sided Marketplace). 
Por un lado, otorga a los **Conductores** herramientas para entender qué le pasa a su vehículo y encontrar el taller adecuado sin miedo a ser engañados. Por otro lado, provee a los **Dueños de Talleres** una vitrina digital estandarizada y una herramienta ultrarrápida para gestionar su flujo de trabajo diario.

---

## 2. Experiencia del Conductor (Usuario Final)

### 2.1. Asistente de Diagnóstico (Triaje Mecánico)
La funcionalidad estrella para reducir la fricción y la "ansiedad mecánica".
*   **Flujo Guiado:** Un chatbot interactivo que hace preguntas al usuario sobre los síntomas de su auto (ruidos, luces en el tablero, sensaciones al conducir).
*   **Ejemplos de Audio:** Integración de archivos de audio reales (ej. chirrido de frenos, golpeteo de motor) para que el conductor pueda confirmar si "suena así".
*   **Resultado Transparente:** La IA traduce el síntoma a un diagnóstico probable, estima un **rango de precios** justo y sugiere la especialidad requerida.
*   **Conexión Directa:** Recomienda inmediatamente el taller mejor evaluado (y con mayor volumen de reseñas) que se especializa en ese problema exacto.

### 2.2. Búsqueda Orientada al Servicio
Invierte el modelo tradicional de "buscar un taller para ver qué hace".
*   **Buscador Predictivo:** El usuario busca su necesidad exacta (ej. "Alineación", "Cambio de Aceite").
*   **Comparación Inmediata:** La plataforma filtra los talleres y muestra directamente el **precio estimado base** y el **tiempo de ejecución** que ofrece cada taller para ese servicio en particular.

### 2.3. Directorio y Filtros Globales
*   Visualización horizontal de tarjetas de talleres, optimizadas para no saturar la pantalla móvil.
*   Filtros dinámicos por **Sector** (ubicación) y **Especialidad**.
*   Ordenamiento por mejor calificación o precio.

### 2.4. Flujo de Reserva Simplificado
*   **Modal de Reserva:** Un formulario fluido donde el usuario ingresa sus datos y selecciona una fecha disponible.
*   **Transparencia:** Incluye un aviso claro: *"Precio estimado base. Sujeto a confirmación tras revisión técnica."*
*   **Auto-llenado:** Integración con la sección "Mi Auto" para pre-cargar la patente, marca y modelo del vehículo automáticamente.

### 2.5. Gestión Personal ("Mi Perfil" y "Mi Garage")
*   **Gestión de Vehículos:** Los usuarios pueden guardar múltiples vehículos en su "Garage" digital.
*   **Historial de Reservas:** Seguimiento del estado en el que se encuentra su auto en tiempo real (Pendiente, En Revisión, Entregado).
*   **Estados Vacíos Amigables:** Si no hay reservas o autos registrados, la plataforma guía al usuario con botones de llamada a la acción (Call to Action) en lugar de mostrar pantallas rotas o vacías.

---

## 3. Experiencia del Taller (Owner Dashboard)

### 3.1. Tablero Kanban Ultra-Compacto
Diseñado específicamente para ser operado con una sola mano por un mecánico con el teléfono o tablet en el taller.
*   **Tarjetas Minimalistas:** Muestran únicamente la información crítica a simple vista: Patente, Servicio Solicitado y Estado.
*   **Botones Maximizados:** Botones de avance y retroceso (flechas) que ocupan el 100% del ancho disponible en la tarjeta inferior para evitar toques erróneos.
*   **Modal de Profundidad:** Al tocar el cuerpo de la tarjeta, se abre un modal con la información exhaustiva (nombre del cliente, observaciones largas, valores).
*   **Flujo de Estados:** Mover vehículos fácilmente entre *Ingresados*, *En Revisión/Trabajando* y *Listos para Entrega*.

### 3.2. Configuración de Servicios y Vitrina
*   **Autogestión de Catálogo:** El dueño del taller puede dar de alta sus servicios estandarizados, asignando un precio referencial y un tiempo estimado para que los conductores puedan compararlo en la búsqueda.
*   **Perfil Público:** Gestión de datos de contacto, dirección y foto principal.

---

## 4. Características Técnicas y UI/UX Core
*   **Mobile-First Estricto:** La interfaz fue diseñada pensando primero en el celular. Se utiliza una "Bottom Tab Navigation" (Barra de pestañas inferior) estandarizada con recuadros dinámicos para indicar la sección activa.
*   **Arquitectura de Invitados (Guest Mode):** Permite a los usuarios entrar, usar el asistente, comparar precios e iniciar una reserva sin tener que crear una cuenta inicialmente. La cuenta se exige solo en el último paso para confirmar, reduciendo masivamente la tasa de rebote.
*   **Diseño Limpio y Confiable:** En pantallas de escritorio, el diseño se expande de manera responsiva, eliminando elementos informales (como emojis en los menús) para transmitir seguridad y seriedad a usuarios de todas las edades.
*   **Algoritmo de Destacados:** Sistema de ponderación "Bayesiana" para recomendar talleres, asegurando que el taller "Destacado" no sea uno con una sola calificación de 5 estrellas, sino el que tenga un balance real entre la mejor nota y el mayor volumen de clientes satisfechos.
