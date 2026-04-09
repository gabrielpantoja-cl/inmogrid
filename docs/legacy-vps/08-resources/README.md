# 🤖 AI Prompts - inmogrid.cl

Archivos de configuración para asistentes de IA (Claude, Gemini, etc.).

---

## 📋 Archivos de Prompts

### CLAUDE.md
**Propósito**: Configuración principal para Claude Code y Claude AI

**Ubicaciones**:
- `CLAUDE.md` (raíz) - Archivo principal usado por Claude Code CLI
- `docs/08-resources/claude-code-prompt-guide.md` - Copia de referencia

**Contenido**:
- Descripción del proyecto
- Arquitectura y stack tecnológico
- Comandos de desarrollo
- Fases de desarrollo
- Mejores prácticas
- Referencias a documentación

**Cuándo actualizar**:
- Cambios mayores en arquitectura
- Nuevas fases de desarrollo completadas
- Nuevos comandos o scripts importantes
- Cambios en stack tecnológico

---

### GEMINI.md
**Propósito**: Configuración para Google Gemini AI

**Ubicaciones**:
- `GEMINI.md` (raíz) - Archivo principal
- `docs/08-resources/gemini-prompt-guide.md` - Copia de referencia

**Contenido**:
- Configuración específica de Gemini
- Contexto del proyecto
- Instrucciones de uso

**Cuándo actualizar**:
- Cambios en integración con Gemini
- Nuevas features de Gemini utilizadas

---

## 🎯 Mejores Prácticas

### Para CLAUDE.md:

**Estructura recomendada**:
1. **Project Overview** - Descripción concisa
2. **Development Phases** - Estado actual y fases
3. **Development Commands** - Comandos esenciales
4. **Architecture Overview** - Stack y estructura
5. **Specialized Agents** - Agentes de Claude Code
6. **Troubleshooting** - Problemas comunes
7. **References** - Links a documentación

**Actualización**:
- Mantener sincronizado con estado real del proyecto
- Actualizar después de milestones importantes
- Revisar cada fase completada
- Agregar nuevos comandos útiles

---

### Para Archivos de Prompts en General:

**DO's** ✅:
- Mantener información actualizada
- Ser conciso pero completo
- Incluir comandos exactos
- Referenciar documentación detallada
- Documentar mejores prácticas
- Incluir troubleshooting común

**DON'Ts** ❌:
- No duplicar documentación completa (usar referencias)
- No incluir información que cambia frecuentemente
- No exponer secretos o credenciales
- No hacer el archivo muy largo (max 500 líneas)

---

## 🔄 Sincronización

**Archivos en raíz** (usados por AI):
- `CLAUDE.md` - Usado por Claude Code CLI
- `GEMINI.md` - Usado por Gemini

**Copias de referencia** (este folder):
- `docs/08-resources/claude-code-prompt-guide.md` - Referencia/backup
- `docs/08-resources/gemini-prompt-guide.md` - Referencia/backup

**Recomendación**: Mantener archivos en raíz como fuente de verdad. Copias aquí son solo referencia.

---

## 📚 Documentación Relacionada

**Para información detallada, consultar**:
- `docs/01-introduccion/` - Visión general del proyecto
- `docs/02-desarrollo/` - Guías de desarrollo
- `docs/03-arquitectura/` - Arquitectura detallada
- `docs/06-deployment/` - Guías de deployment

**Agentes especializados**:
- `.claude/agents/` - Configuración de agentes Claude Code

---

## ✅ Checklist de Actualización

### Después de Cambios Mayores:
- [ ] Actualizar CLAUDE.md con nueva fase/feature
- [ ] Actualizar comandos si hubo cambios
- [ ] Actualizar arquitectura si cambió stack
- [ ] Actualizar referencias a docs
- [ ] Copiar a docs/08-resources/ (backup)

### Cada Milestone:
- [ ] Revisar que info esté actualizada
- [ ] Agregar troubleshooting nuevo si aplica
- [ ] Actualizar estado de fases
- [ ] Revisar comandos esenciales

---

## 🎨 Ejemplo de Prompt Bien Estructurado

```markdown
# Project Name

## Project Overview
Brief description (2-3 sentences)

## Development Phases
- Current: Phase X
- Status: Y% complete

## Essential Commands
```bash
npm run dev
npm run build
npm run test
```

## Architecture
- Framework: Next.js 15
- Database: PostgreSQL + PostGIS
- ... (stack resumido)

## Troubleshooting
Common issues and solutions

## References
Links to detailed docs
```

---

**Nota Importante**: Los archivos en la raíz (`CLAUDE.md`, `GEMINI.md`) son los que realmente usan las AIs. Este folder es solo para referencia y documentación.

---

**Última actualización**: 2026-01-03
**Mantenedor**: Gabriel (gabriel@inmogrid.cl)
