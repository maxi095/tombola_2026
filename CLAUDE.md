# Constitución del Proyecto: Gestión Tómbola 🚀

Este archivo define las reglas técnicas, el stack de tecnologías y los comandos de ejecución del proyecto **Gestión Tómbola**, sirviendo como fuente de verdad para el flujo de desarrollo y las automatizaciones.

---

## 🛠️ Tecnologías y Stack
*   **Backend (Servidor Raíz):**
    *   Node.js (tipo ES Modules: `"type": "module"`) con Express.
    *   Base de datos: MongoDB con Mongoose (`mongodb://localhost/tomboladb`).
    *   Validación de datos: Zod.
    *   Variables de entorno: `.env` en la raíz.
*   **Frontend (`client/`):**
    *   React 18 con Vite como empaquetador.
    *   Estilos: TailwindCSS + Bootstrap + CSS personalizado.
    *   Navegación: React Router DOM v6.
    *   Peticiones: Axios.

---

## 📂 Estructura del Repositorio
*   `src/`: Código fuente del Backend.
    *   `controllers/`: Controladores de lógica de negocio (asociados, balances, etc.).
    *   `models/`: Esquemas y modelos de Mongoose.
    *   `routes/`: Definición de endpoints de Express.
    *   `schemas/`: Esquemas de validación Zod.
    *   `db.js` y `app.js`: Configuración de base de datos y Express.
*   `client/`: Código fuente del Frontend.
    *   `src/components/ui/`: Componentes atómicos de interfaz de usuario.
    *   `src/pages/`: Páginas y paneles de la aplicación.
    *   `src/context/`: Contextos de estado global (React Context).
*   `docs/`: Documentación técnica y especificaciones de negocio.
    *   `docs/legacy/`: Historial, glosarios y estándares antiguos/actuales de diseño.
    *   `docs/specs/`: Especificaciones funcionales y planes de cambio del flujo SDD.
*   `.agents/`: Personalizaciones del asistente de IA.
    *   `skills/`: Skills de desarrollo paso a paso del flujo SDD.

---

## ⚙️ Comandos del Proyecto

### Backend (Raíz)
*   **Desarrollo:** `npm run dev` (levanta con `nodemon src/index.js`)
*   **Producción:** `npm start`
*   **Script de reporte:** `npm run generate-report`

### Frontend (`client/`)
*   **Desarrollo:** `npm run dev` (Vite)
*   **Build de Producción:** `npm run build`
*   **Linter:** `npm run lint`

---

## 💡 Reglas Clave de Desarrollo
1.  **Código Sin Omitir:** Está prohibido usar comentarios de resumen (`// ... resto del código`). Todo el código modificado debe escribirse de forma completa.
2.  **DNA Estético:** Todo cambio en la interfaz de usuario debe alinearse estrictamente a las reglas de [`AGENTS.md`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/AGENTS.md) (Wording semántico, Zero-Air density, Componentes Atómicos y layouts h-screen para TV).
3.  **Flujo de Especificación (SDD):** Todo desarrollo no trivial debe realizarse bajo las fases del flujo en `.agents/skills/` (Specify -> Plan -> Slice -> Implement -> Test -> Document).
