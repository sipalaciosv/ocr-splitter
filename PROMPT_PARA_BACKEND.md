# 📋 PROMPT PARA COPIAR/PEGAR EN LA NUEVA SESIÓN DEL AGENTE

---

## 🎯 COPIA ESTE PROMPT COMPLETO:

```
Hola! Necesito que me ayudes a crear el BACKEND para mi proyecto "OCR Splitter" - un sistema de división de gastos con reconocimiento óptico.

## 📁 Contexto del Proyecto

Tengo el FRONTEND ya implementado en:
`C:\Users\thexz\OneDrive\Documentos\OCR_System_Complete\ocr-splitter`

Stack del frontend:
- Vue 3 + Vite + TypeScript
- Firebase Firestore (base de datos)
- Firebase Auth (autenticación)
- PrimeVue + TailwindCSS

## 🎯 Objetivo

Crear el BACKEND en Node.js + Express + TypeScript que implemente:

1. **ENDPOINT DE OCR (PRIORIDAD 1)**
   - POST /api/ocr/process
   - Recibir imagen/PDF de boleta
   - Usar Google Cloud Vision API para extraer texto
   - Parsear items con nombre y precio
   - Devolver JSON con array de items

2. **Integración con Firebase Firestore**
   - Misma base de datos que usa el frontend
   - Estructura de datos:
     * groups/{groupId} → { title, ownerUid, createdAt }
     * groups/{groupId}/members/{userId} → { role, displayName, email }
     * groups/{groupId}/items/{itemId} → { name, price, qty, assignedUserIds[] }

3. **Configuración de Seguridad**
   - CORS para frontend (http://localhost:5173)
   - Validación de archivos (tipo, tamaño max 8MB)
   - Middleware de autenticación con Firebase
   - Variables de entorno para claves sensibles

## 📋 Requisitos Técnicos

Stack deseado:
- Node.js 20+
- Express
- TypeScript
- firebase-admin
- @google-cloud/vision
- multer (subida de archivos)
- cors, dotenv, zod

Estructura sugerida:
```
src/
  ├── config/
  │   ├── firebase.ts
  │   └── google-vision.ts
  ├── routes/
  │   └── ocr.routes.ts
  ├── services/
  │   └── ocr.service.ts
  ├── middleware/
  │   ├── auth.middleware.ts
  │   └── upload.middleware.ts
  └── server.ts
```

## 🚀 Paso a Paso

1. Inicializar proyecto Node.js + TypeScript
2. Instalar dependencias necesarias
3. Configurar Firebase Admin SDK
4. Configurar Google Cloud Vision API
5. Crear endpoint POST /api/ocr/process
6. Implementar parser de items de boleta
7. Agregar validaciones y error handling
8. Configurar CORS
9. Probar con Postman/Thunder Client

## 📄 Contexto Adicional

Lee el archivo BACKEND_CONTEXT.md que está en la carpeta del frontend (C:\Users\thexz\OneDrive\Documentos\OCR_System_Complete\ocr-splitter\BACKEND_CONTEXT.md) para más detalles sobre:
- Estructura de datos completa
- Integración con el frontend
- Referencias del proyecto académico
- Próximos sprints (pagos, notificaciones)

## ❓ Preguntas Iniciales

Antes de empezar, necesito saber:
1. ¿Ya tengo las credenciales de Google Cloud Vision API?
2. ¿Ya tengo las credenciales de Firebase Admin SDK?
3. ¿Quieres que empiece creando la estructura básica del proyecto?

Empecemos por lo más importante: el endpoint de OCR funcionando.
```

---

## 📝 NOTAS IMPORTANTES:

### Antes de usar el prompt:

1. **Crea la carpeta del backend**:
   ```powershell
   mkdir c:\Users\thexz\OneDrive\Documentos\ocr-splitter-backend
   ```

2. **Abre VS Code en esa carpeta**:
   ```powershell
   cd c:\Users\thexz\OneDrive\Documentos\ocr-splitter-backend
   code .
   ```

3. **Abre el agente en el nuevo workspace**

4. **Copia y pega el prompt de arriba**

### Archivos de referencia disponibles:

El nuevo agente podrá leer:
- ✅ `BACKEND_CONTEXT.md` (contexto completo)
- ✅ Tu frontend en `../ocr-splitter/` si necesita ver el código
- ✅ El informe PDF si lo copias a la carpeta del backend

---

## 🔑 Credenciales que Necesitarás

### Google Cloud Vision API:
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear proyecto o usar uno existente
3. Habilitar "Cloud Vision API"
4. Crear Service Account
5. Descargar JSON de credenciales
6. Guardar en: `ocr-splitter-backend/credentials/google-vision-key.json`

### Firebase Admin SDK:
1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Proyecto Settings → Service accounts
3. "Generate new private key"
4. Descargar JSON
5. Guardar en: `ocr-splitter-backend/credentials/firebase-admin-key.json`

---

## ✅ Checklist Pre-Agente:

- [ ] Carpeta `ocr-splitter-backend` creada
- [ ] VS Code abierto en esa carpeta
- [ ] Agente iniciado en el nuevo workspace
- [ ] Credenciales de Google Vision descargadas (opcional, se puede hacer después)
- [ ] Credenciales de Firebase Admin descargadas (opcional, se puede hacer después)
- [ ] Prompt copiado y listo para pegar

---

## 🎯 Resultado Esperado

Al final de la sesión con el nuevo agente deberías tener:

```
ocr-splitter-backend/
├── src/
│   ├── server.ts              ✅ Servidor Express funcionando
│   ├── config/
│   │   ├── firebase.ts        ✅ Firebase Admin inicializado
│   │   └── google-vision.ts   ✅ Vision API configurado
│   ├── routes/
│   │   └── ocr.routes.ts      ✅ POST /api/ocr/process
│   ├── services/
│   │   └── ocr.service.ts     ✅ Lógica OCR + parser
│   └── middleware/
│       └── upload.middleware.ts ✅ Multer configurado
├── .env                        ✅ Variables de entorno
├── .gitignore                  ✅ Ignorar .env y credentials/
├── package.json                ✅ Dependencias instaladas
└── tsconfig.json               ✅ TypeScript configurado

🚀 Backend corriendo en http://localhost:3000
✅ Endpoint /api/ocr/process funcionando
✅ Probado con Postman
✅ Listo para integrarse con el frontend
```

---

## 🔄 Volver al Frontend

Cuando termines con el backend, vuelve a abrir:
```powershell
cd c:\Users\thexz\OneDrive\Documentos\ocr-splitter
code .
```

Y modifica `src/services/mocks.ts` para reemplazar `ocrMock()` con llamadas reales al backend.

---

¡Éxito! 🚀
