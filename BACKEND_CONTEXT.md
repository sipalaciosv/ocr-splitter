# 🚀 Contexto para Backend - OCR Splitter

## 📋 Resumen del Proyecto

**Sistema de División de Gastos con Reconocimiento Óptico y Pagos Digitales**

Este es un proyecto académico de Ingeniería Informática que permite dividir cuentas en reuniones sociales de forma automática mediante OCR, asignación de items y pagos digitales.

---

## 🏗️ Arquitectura Actual

### Frontend (YA IMPLEMENTADO)
- **Ubicación**: `C:\Users\thexz\OneDrive\Documentos\OCR_System_Complete\ocr-splitter`
- **Stack**: Vue 3 + Vite + TypeScript + PrimeVue + TailwindCSS
- **Base de datos**: Firebase Firestore
- **Autenticación**: Firebase Auth

### Backend (POR IMPLEMENTAR)
- **Stack deseado**: Node.js + Express + TypeScript
- **Base de datos**: Firebase Firestore (misma que frontend)
- **Servicios externos**:
  - Google Cloud Vision API (OCR)
  - Firebase Cloud Messaging (notificaciones)
  - Webpay/Flow/Khipu (pagos)

---

## 📊 Estructura de Datos en Firestore

### Colección `groups`
```typescript
groups/{groupId}
  - title: string
  - ownerUid: string
  - createdAt: timestamp
  
  /members/{userId}
    - role: 'admin' | 'member'
    - joinedAt: timestamp
    - displayName: string | null
    - email: string | null
    - photoURL: string | null
  
  /items/{itemId}
    - name: string
    - price: number
    - qty: number
    - assignedUserIds: string[]
```

---

## ✅ Funcionalidades del Frontend Actual

1. **Autenticación**
   - Login/logout con Firebase Auth
   - Guards en rutas protegidas

2. **Upload de Boletas** (`UploadView.vue`)
   - Actualmente usa `ocrMock()` - **NECESITA SER REEMPLAZADO**
   - Interfaz para cargar imagen/PDF
   - Muestra tabla con items extraídos

3. **Gestión de Grupos** (`GroupView.vue`)
   - Ver items del grupo
   - Asignar items a usuarios
   - Cálculo automático de montos

4. **Unirse a Grupos** (`JoinGroupView.vue`)
   - Link compartido `/join/:id`
   - Auto-registro como miembro

---

## 🎯 Requisitos del Backend

### 1. **Endpoint de OCR** (PRIORIDAD ALTA)
```
POST /api/ocr/process
Content-Type: multipart/form-data

Body:
  - file: imagen o PDF de la boleta

Response:
{
  "success": true,
  "items": [
    {
      "id": "uuid",
      "name": "Producto",
      "price": 5000,
      "qty": 1
    }
  ]
}
```

**Implementación**:
- Usar **Google Cloud Vision API**
- Procesar imagen/PDF
- Extraer texto
- Parsear items con precio (regex o IA)
- Devolver array de items

### 2. **Integración con Firestore**
- Reutilizar la misma instancia de Firestore
- CRUD de groups, items, members
- Validaciones de permisos

### 3. **Pasarelas de Pago** (PRIORIDAD MEDIA)
Endpoints para:
- Generar link de pago (Webpay/Flow/Khipu)
- Webhooks de confirmación
- Actualizar estado de pagos

### 4. **Notificaciones Push** (PRIORIDAD MEDIA)
- Firebase Cloud Messaging
- Notificar cuando items son asignados
- Recordatorios de pago pendiente

### 5. **Validaciones y Seguridad**
- CORS configurado para el frontend
- Validación de tokens Firebase
- Rate limiting
- Validación de archivos (tipo, tamaño)

---

## 🔧 Stack Tecnológico Recomendado

```json
{
  "runtime": "Node.js 20+",
  "framework": "Express",
  "lenguaje": "TypeScript",
  "dependencias": {
    "express": "^4.18.0",
    "firebase-admin": "^12.0.0",
    "multer": "^1.4.5-lts.1",
    "@google-cloud/vision": "^4.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "zod": "^3.22.0"
  }
}
```

---

## 🔑 Variables de Entorno Necesarias

```env
# Puerto del servidor
PORT=3000

# Firebase Admin (descargar desde Firebase Console)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Google Cloud Vision
GOOGLE_CLOUD_PROJECT=
GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account.json

# Pasarelas de pago
WEBPAY_COMMERCE_CODE=
WEBPAY_API_KEY=
FLOW_API_KEY=
FLOW_SECRET_KEY=

# CORS
FRONTEND_URL=http://localhost:5173
```

---

## 📁 Estructura de Carpetas Sugerida

```
ocr-splitter-backend/
├── src/
│   ├── config/
│   │   ├── firebase.ts          # Inicializar Firebase Admin
│   │   └── google-vision.ts     # Cliente de Vision API
│   ├── routes/
│   │   ├── ocr.routes.ts        # POST /api/ocr/process
│   │   ├── groups.routes.ts     # CRUD grupos
│   │   ├── items.routes.ts      # CRUD items
│   │   └── payments.routes.ts   # Pasarelas de pago
│   ├── services/
│   │   ├── ocr.service.ts       # Lógica OCR
│   │   ├── firebase.service.ts  # Firestore operations
│   │   ├── payment.service.ts   # Integración pagos
│   │   └── notification.service.ts # FCM
│   ├── middleware/
│   │   ├── auth.middleware.ts   # Validar token Firebase
│   │   ├── upload.middleware.ts # Multer config
│   │   └── error.middleware.ts  # Error handling
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   └── server.ts                # Entry point
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## 🔗 Integración Frontend → Backend

El frontend actualmente llama:
```typescript
// src/services/mocks.ts - LÍNEA 105
export async function ocrMock(fileName: string): Promise<{
  grupoId: string;
  items: OcrItem[];
}>
```

**Reemplazar con**:
```typescript
export async function processOCR(file: File): Promise<{
  grupoId: string;
  items: OcrItem[];
}> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:3000/api/ocr/process', {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
}
```

---

## 📝 Información del Informe Académico

Según el documento oficial del proyecto:

### Objetivos Específicos:
1. ✅ Implementar sistema OCR con Google Cloud Vision API
2. ✅ Diseñar interfaz eficiente (YA HECHO en frontend)
3. ⏳ Incorporar notificaciones automáticas
4. ⏳ Integrar métodos de pago digitales
5. ⏳ Realizar pruebas funcionales

### Tecnologías Justificadas:
- **Node.js**: Por arquitectura basada en eventos no bloqueantes
- **MongoDB**: Flexibilidad (aunque usamos Firestore)
- **Google Cloud Vision**: Alta precisión en OCR

---

## 🎯 Prioridades de Implementación

### Sprint 1 - MVP Funcional
1. Setup del proyecto (Express + TypeScript)
2. Configurar Firebase Admin
3. Endpoint OCR básico con Google Vision
4. Parser de items (regex simple)
5. CORS configurado
6. Pruebas con el frontend

### Sprint 2 - Mejoras
1. Parser de items mejorado (mejor detección)
2. Endpoints CRUD para grupos/items
3. Middleware de autenticación
4. Validaciones con Zod

### Sprint 3 - Features Avanzadas
1. Integración pasarelas de pago
2. Notificaciones push (FCM)
3. Webhooks de pago
4. Rate limiting

---

## 📚 Referencias Útiles

### Google Cloud Vision
- [Quickstart Node.js](https://cloud.google.com/vision/docs/quickstart-client-libraries)
- [Detect text in images](https://cloud.google.com/vision/docs/ocr)

### Firebase Admin
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Verify ID Tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens)

### Pasarelas de Pago Chile
- [Webpay (Transbank)](https://www.transbankdevelopers.cl/)
- [Flow](https://www.flow.cl/docs/)
- [Khipu](https://docs.khipu.com/)

---

## 🚀 Comando Inicial Sugerido

```bash
mkdir ocr-splitter-backend
cd ocr-splitter-backend
npm init -y
npm install express cors dotenv firebase-admin @google-cloud/vision multer zod
npm install -D typescript @types/express @types/cors @types/multer tsx nodemon
npx tsc --init
```

---

## ✅ Checklist de Implementación

- [ ] Setup proyecto Node.js + TypeScript
- [ ] Configurar Firebase Admin SDK
- [ ] Configurar Google Cloud Vision API
- [ ] Crear endpoint POST /api/ocr/process
- [ ] Implementar parser de items de boleta
- [ ] Configurar CORS para el frontend
- [ ] Middleware de autenticación (Firebase)
- [ ] Validación de archivos subidos
- [ ] Error handling global
- [ ] Testing con Postman/Thunder Client
- [ ] Integrar con frontend (reemplazar mock)
- [ ] Documentar API con Swagger (opcional)

---

## 🎓 Notas del Proyecto Académico

- **Alumno**: Sebastian Palacios Vera
- **Profesor**: Carlos Vergara Ramirez
- **Institución**: Ingeniería Informática
- **Fecha**: Diciembre 2024
- **Metodología**: Scrum (sprints de 2 semanas)

Este backend es la pieza faltante para completar el proyecto descrito en el informe académico.
