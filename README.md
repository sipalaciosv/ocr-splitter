# OCR Splitter

Aplicación web para **dividir boletas entre amigos** usando OCR, Firebase y una interfaz en tiempo real.  
La idea es simple: **tú pagas la boleta, el sistema reparte cada ítem entre los participantes.**

---

## ✨ Características principales

- 🧾 **Subir boleta**  
  - Carga de imágenes o PDF de boletas.
  - Simulación de OCR (mock) para extraer ítems, montos y categorías.
  - Edición directa de montos y eliminación de filas antes de continuar.

- 👥 **Grupos y boletas compartidas**
  - Creación de un **grupo por boleta** en Firestore.
  - Enlace de invitación `/join/:id` para compartir con otras personas.
  - Vista de tablero de grupo con los ítems en tiempo real.

- 🔐 **Autenticación con Firebase**
  - Registro e inicio de sesión con correo y contraseña.
  - Manejo de errores de auth traducidos a mensajes amigables.
  - Redirecciones automáticas:
    - Si entras por un link `/join/:id`, al autenticarte se te añade al grupo y se abre el tablero.
    - Cierre de sesión redirige al login y limpia el contexto.

- 🤝 **Asignación de ítems en tiempo real**
  - Cada ítem puede estar asignado a una o varias personas.
  - Modo **admin**:
    - MultiSelect para asignar usuarios a cada ítem.
    - Botón para reiniciar todas las asignaciones.
    - Seed inicial de ítems desde la boleta mock si el grupo está vacío.
  - Modo **miembro**:
    - Botones “Tomar” / “Quitarme” para auto-asignarse.
    - Cálculo de **total por persona** en base a su participación en cada ítem.

- 🎨 **UI / UX**
  - Layout con navbar + footer y separación dinámica.
  - Modo oscuro / claro sincronizado entre:
    - Tailwind (`.dark`).
    - PrimeVue (Aura theme con `darkModeSelector: '.dark'`).
    - Variables CSS globales (`--surface-*`, `--text-*`, etc.).
  - Componentes reutilizables (`AppCard`, `AppNavbar`, `AppFooter`).

---

## 🧱 Stack tecnológico

- **Frontend**
  - [Vue 3](https://vuejs.org/) + Composition API + TypeScript
  - [Vite](https://vitejs.dev/)
  - [Vue Router](https://router.vuejs.org/)
  - [Pinia](https://pinia.vuejs.org/)

- **UI / Estilos**
  - [PrimeVue 4](https://primevue.org/) + tema Aura
  - [PrimeIcons](https://primefaces.org/primeicons/)
  - [Tailwind CSS 4](https://tailwindcss.com/)
  - Fuente [Montserrat](https://fonts.google.com/specimen/Montserrat)

- **Backend as a Service**
  - [Firebase](https://firebase.google.com/):
    - Auth (correo/contraseña)
    - Firestore (grupos, miembros, items)
    - Storage (listo para almacenar imágenes de boleta)

---

## 📁 Estructura de carpetas (resumen)

```text
src/
├─ components/
│  ├─ AppCard.vue
│  ├─ AppNavbar.vue
│  ├─ AppFooter.vue
│  └─ OCRSplitter/
│     └─ GroupBoard.vue
├─ layouts/
│  └─ LayoutDefault.vue
├─ lib/
│  └─ firebase.ts
├─ services/
│  ├─ db.ts        # helpers Firestore (groups, members, items)
│  └─ mocks.ts     # datos mock (grupo demo, receipt demo, OCR simulado)
├─ stores/
│  ├─ auth.ts      # estado de autenticación Firebase
│  └─ ui.ts        # modo oscuro / claro
├─ styles/
│  ├─ tailwind.css
│  └─ variables.css
├─ views/
│  ├─ HomeView.vue
│  ├─ UploadView.vue
│  ├─ LoginView.vue
│  ├─ JoinGroupView.vue
│  └─ GroupView.vue
└─ router/
   └─ index.ts
```

---

## 🚀 Puesta en marcha

### Requisitos

- Node.js `^20.19.0` o `>=22.12.0`
- npm o pnpm/yarn (ejemplos con npm)

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/sipalaciosv/ocr-splitter.git
cd ocr-splitter
npm install
```

### 2. Configurar variables de entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
VITE_FB_API_KEY=xxxxxxxxxxxxxxxxxxxx
VITE_FB_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FB_PROJECT_ID=tu-proyecto
VITE_FB_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FB_MESSAGING_SENDER_ID=000000000000
VITE_FB_APP_ID=1:000000000000:web:xxxxxxxxxxxxxxxx
```

> El archivo **no se debe commitear**; está ignorado en `.gitignore`.

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

La app se levantará en `http://localhost:5173` (o el puerto que indique Vite).


## 🔄 Flujo principal de uso

1. Entras a la **Home** (`/`) y presionas _“Usar app · subir boleta”_.
2. En `/app`:
   - Subes una imagen o PDF.
   - Se ejecuta un **mock OCR** que genera ítems de ejemplo.
   - Puedes ajustar montos, eliminar filas y ver el total de la boleta.
3. Al presionar **“Continuar”**:
   - Se crea un **grupo** en Firestore (si no existe).
   - Si no estás logueado, vas a la pantalla de login/registro.
4. Compartes el enlace `/join/:id` con tus amigos.
5. En el **tablero de grupo**:
   - El admin asigna personas a cada ítem (MultiSelect) o reinicia asignaciones.
   - Cada miembro puede **tomar/quitar** sus ítems.
   - El panel lateral muestra el total que debe pagar cada persona.

---

## 🔐 Notas sobre seguridad (Firestore)

El proyecto asume que vas a definir reglas de Firestore para:

- Restringir lectura/escritura de `groups/{groupId}` a miembros del grupo.
- Permitir que:
  - Solo el admin cambie la lista completa de `assignedUserIds`.
  - Cada usuario solo pueda agregarse o quitarse a sí mismo en `claimItem` / `unclaimItem`.

Las funciones de `db.ts` ya contemplan errores como `permission-denied` y muestran mensajes adecuados en la interfaz.

---


