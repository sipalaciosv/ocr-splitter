# 🚀 Guía Rápida: Crear Backend OCR-Splitter

## 📦 Archivos de Referencia Creados

✅ **BACKEND_CONTEXT.md** → Contexto completo del proyecto (arquitectura, datos, tecnologías)  
✅ **PROMPT_PARA_BACKEND.md** → Prompt listo para copiar/pegar en nueva sesión del agente

---

## 🔄 Pasos para Crear el Backend

### 1️⃣ Crear carpeta del backend
```powershell
mkdir c:\Users\thexz\OneDrive\Documentos\ocr-splitter-backend
cd c:\Users\thexz\OneDrive\Documentos\ocr-splitter-backend
```

### 2️⃣ Abrir VS Code en la nueva carpeta
```powershell
code .
```

### 3️⃣ Abrir el agente (Gemini) en el nuevo workspace

### 4️⃣ Copiar el contenido de `PROMPT_PARA_BACKEND.md` y pegarlo en el chat

### 5️⃣ Seguir las instrucciones del agente

---

## 📁 Estructura Final Esperada

```
📁 Documentos/
├── 📁 ocr-splitter/              ← FRONTEND (actual)
│   ├── src/
│   ├── package.json
│   ├── BACKEND_CONTEXT.md        ← Contexto para el backend
│   ├── PROMPT_PARA_BACKEND.md    ← Prompt para copiar
│   └── README_BACKEND_SETUP.md   ← Esta guía
│
└── 📁 ocr-splitter-backend/      ← BACKEND (nuevo)
    ├── src/
    │   ├── server.ts
    │   ├── config/
    │   ├── routes/
    │   ├── services/
    │   └── middleware/
    ├── credentials/               ← Claves Google/Firebase
    ├── .env
    ├── package.json
    └── tsconfig.json
```

---

## 🔑 Credenciales Necesarias

### Google Cloud Vision API
1. [Google Cloud Console](https://console.cloud.google.com/)
2. Crear proyecto → Habilitar "Cloud Vision API"
3. Service Account → Descargar JSON
4. Guardar en `credentials/google-vision-key.json`

### Firebase Admin SDK
1. [Firebase Console](https://console.firebase.google.com/)
2. Settings → Service accounts
3. "Generate new private key"
4. Guardar en `credentials/firebase-admin-key.json`

---

## ✅ Checklist Rápido

- [ ] Carpeta backend creada
- [ ] VS Code abierto en backend
- [ ] Agente abierto
- [ ] Prompt copiado de `PROMPT_PARA_BACKEND.md`
- [ ] Prompt pegado en el chat
- [ ] Backend implementado
- [ ] Endpoint `/api/ocr/process` funcionando
- [ ] Probado con Postman
- [ ] Frontend actualizado para usar backend real

---

## 🆘 Si Tienes Problemas

Vuelve a este workspace (frontend) y:
1. Lee `BACKEND_CONTEXT.md` para entender la arquitectura
2. Revisa `PROMPT_PARA_BACKEND.md` para ver el prompt completo
3. Abre un nuevo chat y pregunta lo que necesites

---

## 🎯 Próximos Pasos Después del Backend

1. Integrar backend con frontend (reemplazar `ocrMock()`)
2. Implementar pasarelas de pago (Webpay/Flow)
3. Configurar notificaciones push (FCM)
4. Testing end-to-end
5. Deploy (Railway/Render para backend, Vercel/Netlify para frontend)

---

**¡Éxito con el backend!** 🚀
