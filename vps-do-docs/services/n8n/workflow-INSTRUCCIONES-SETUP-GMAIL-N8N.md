# 🔧 Instrucciones de Configuración: Gmail OAuth2 en n8n

## Problema Resuelto ✅

**Error original**: `"Unable to sign without access token (item 0)"` en el nodo Gmail.

**Solución implementada**: Sistema de notificaciones multi-nivel con fallback automático.

## Opciones de Configuración

### 🚀 Opción 1: Webhook + Zapier (RECOMENDADO - Más Simple)

**Ventajas:**
- ✅ Sin configuración OAuth2 compleja
- ✅ Más rápido de implementar
- ✅ Más confiable
- ✅ Fallback automático con Resend

**Pasos:**
1. Crear Webhook en Zapier que envíe emails
2. Reemplazar `YOUR_WEBHOOK_ID/YOUR_HOOK_KEY` en el workflow
3. ¡Listo!

### 🔐 Opción 2: Gmail OAuth2 (Más Complejo)

**Reutiliza tus credenciales existentes:**
- **Client ID**: `324646027912-b6b8hb549ps2g71liduamm8179fl2t23.apps.googleusercontent.com`
- **Client Secret**: `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`

**Pasos:**

#### 1. Configurar Google OAuth2 Consent Screen
```bash
# Ir a Google Cloud Console
# https://console.cloud.google.com/apis/credentials/consent
```

1. **OAuth consent screen** → External
2. **App name**: "Portal Inmobiliario n8n Monitor"
3. **User support email**: gabrielpantojarivera@gmail.com
4. **Scopes**: Agregar `../auth/gmail.send`
5. **Test users**: Agregar gabrielpantojarivera@gmail.com

#### 2. Crear Credenciales en n8n

1. **n8n Dashboard** → Credentials → Add Credential
2. **Tipo**: Gmail OAuth2
3. **Client ID**: `324646027912-b6b8hb549ps2g71liduamm8179fl2t23.apps.googleusercontent.com`
4. **Client Secret**: `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`
5. **Authorized redirect URIs** en Google Console:
   ```
   https://tu-n8n-domain.com/rest/oauth2-credential/callback
   ```

#### 3. Autorizar y Conectar

1. **Connect my account** en n8n
2. Autorizar en Google (usar tu email gabrielpantojarivera@gmail.com)
3. Asignar credencial al nodo Gmail

## 🔄 Mejoras Implementadas en el Nuevo Workflow

### ⚡ Sistema de Notificaciones Multi-Nivel

1. **Nivel 1**: Webhook primario (Zapier)
2. **Nivel 2**: Fallback email (Resend API) si webhook falla
3. **Logs**: Todas las notificaciones se registran en PostgreSQL

### 🛡️ Manejo de Errores Robusto

```javascript
// Error handling mejorado con clasificación de severidad
const severity = statusCode >= 500 ? 'HIGH' : 'MEDIUM';
```

### 📊 Métricas Mejoradas

- **Tiempo de ejecución**
- **Tasa de éxito por página**
- **Conteo de errores por tipo**
- **Summaries automáticos**

### 🔍 Transformación de Datos Mejorada

```javascript
// Validación y limpieza más robusta
const cleanProperty = {
  // ... validaciones mejoradas
  metadata: {
    source: 'portal_inmobiliario',
    processing_version: '2.0',
    raw_data_keys: Object.keys(rawData)
  }
};
```

## 🚀 Pasos de Implementación Inmediata

### Para Webhook (RÁPIDO - 5 minutos)

1. **Crear Zapier Webhook**:
   - Trigger: Catch Hook
   - Action: Send Email (Gmail)

2. **Configurar en n8n**:
   ```javascript
   // Reemplazar en nodos webhook
   "url": "https://hooks.zapier.com/hooks/catch/[TU_ID]/[TU_KEY]/"
   ```

3. **Importar nuevo workflow**:
   - Copiar contenido de `My workflow Nacho - Improved.json`
   - Import en n8n Dashboard

### Para Gmail OAuth2 (COMPLETO - 30 minutos)

1. **Google Cloud Console**: Configurar OAuth2 consent
2. **n8n**: Crear credencial Gmail OAuth2
3. **Autorizar**: Conectar cuenta Gmail
4. **Reemplazar**: Cambiar webhook por nodo Gmail en el workflow

## 📝 Configuraciones de API Keys

### Resend API (Para Fallback)
```javascript
// Ya incluido en el workflow mejorado
"Authorization": "Bearer re_Lpe777A2_5Grya828eugL5EN1KbZKhWVp"
```

### ScrapeNinja API
```javascript
// Mantener configuración existente
"X-RapidAPI-Key": "={{ $credentials.scrapeninja.apikey }}"
```

## 🔍 Testing

### Test Webhook
```bash
curl -X POST "https://hooks.zapier.com/hooks/catch/YOUR_ID/YOUR_KEY/" \
  -H "Content-Type: application/json" \
  -d '{
    "alert_type": "test",
    "message": "Testing notification system"
  }'
```

### Test Fallback Email
```bash
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer re_Lpe777A2_5Grya828eugL5EN1KbZKhWVp" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@pantojapropiedades.cl",
    "to": ["gabrielpantojarivera@gmail.com"],
    "subject": "🧪 Test Fallback",
    "html": "<h2>Fallback funcionando!</h2>"
  }'
```

## 🎯 Recomendación Final

**Usa la Opción 1 (Webhook)** para resolver el problema inmediatamente. Es:
- ✅ Más simple
- ✅ Más confiable
- ✅ Más rápido de configurar
- ✅ Tiene fallback automático

El nuevo workflow ya incluye todas las mejoras y está listo para importar en n8n.