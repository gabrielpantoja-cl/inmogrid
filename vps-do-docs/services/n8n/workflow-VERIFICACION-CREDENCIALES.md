# 🔍 Verificación de Credenciales n8n

## ✅ Credenciales Requeridas para el Workflow

### 1. **PostgreSQL** (✅ Ya existe)
```
Name: "Postgres account"
ID: "8IEFKqtq6BIee0S0"
Status: Configurada
```

### 2. **ScrapeNinja** (⚠️ Verificar)
```
Name: "scrapeninja"
Type: HTTP Header Auth
Header: X-RapidAPI-Key
Value: [TU_API_KEY_SCRAPENINJA]
```

### 3. **Resend API** (✅ Hardcoded)
```
Método: Direct API call
Token: re_Lpe777A2_5Grya828eugL5EN1KbZKhWVp
Status: Ya incluido en workflow
```

## 🔧 Comandos de Verificación

### En n8n Interface:
1. `Credentials` → Ver lista
2. Buscar "scrapeninja"
3. Si no existe → Create New

### Test de Conexión:
1. Abrir nodo "HTTP Request - Scrape Properties"
2. Click "Test" → Debe mostrar datos
3. Si falla → Revisar credential

## 🚨 Posibles Problemas

### Error: "Credential not found"
```bash
Solución: Crear credencial con nombre exacto "scrapeninja"
```

### Error: "Invalid API key"
```bash
Solución: Verificar API key de ScrapeNinja
```

### Error: PostgreSQL connection
```bash
Solución: Verificar credencial "Postgres account"
```

## 📋 Checklist Pre-Import

- [ ] PostgreSQL credential existe y funciona
- [ ] ScrapeNinja credential configurada
- [ ] Webhook URL actualizada (opcional)
- [ ] Resend API key válido (fallback)
- [ ] Import workflow mejorado
- [ ] Test workflow completo