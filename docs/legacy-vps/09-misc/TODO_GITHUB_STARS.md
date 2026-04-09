# TODO: Reactivar GitHub Stars

## Contexto
El contador de estrellas de GitHub está temporalmente deshabilitado porque el repositorio `gabrielpantoja-cl/inmogrid.cl` es privado y genera errores 404 en la API de GitHub.

## Archivos Modificados
- `src/app/page.tsx` (líneas 14 y 32-38)

## Pasos para Reactivar

### 1. Hacer el repositorio público en GitHub
1. Ir a https://github.com/gabrielpantoja-cl/inmogrid.cl/settings
2. Scroll hasta "Danger Zone"
3. Click en "Change visibility" → "Make public"
4. Confirmar el cambio

### 2. Descomentar el código en `src/app/page.tsx`

**Línea 14:**
```typescript
// Cambiar esto:
// import { fetchGithubStars } from '../lib/githubStars';

// Por esto:
import { fetchGithubStars } from '../lib/githubStars';
```

**Líneas 32-38:**
```typescript
// Cambiar esto:
  // TEMPORAL: Comentado hasta que el repositorio sea público
  // useEffect(() => {
  //   console.log('🏠 [HomePage] useEffect - Fetching GitHub stars...');
  //   fetchGithubStars(GITHUB_REPO_FULL).then((stars) => {
  //     console.log('🏠 [HomePage] GitHub stars fetched:', stars);
  //     setGithubStars(stars);
  //   });
  // }, []);

// Por esto:
  useEffect(() => {
    console.log('🏠 [HomePage] useEffect - Fetching GitHub stars...');
    fetchGithubStars(GITHUB_REPO_FULL).then((stars) => {
      console.log('🏠 [HomePage] GitHub stars fetched:', stars);
      setGithubStars(stars);
    });
  }, []);
```

### 3. Verificar que funciona
1. Hacer commit y push de los cambios
2. Esperar el despliegue automático (GitHub Actions)
3. Verificar en https://inmogrid.cl que no hay errores 404 en la consola
4. El contador de estrellas debería aparecer en la página de inicio

### 4. Opcional: Configurar GitHub Token para mayor rate limit

Si tienes muchas visitas y te quedas sin rate limit de GitHub API (60 requests/hora sin autenticación), puedes:

1. Crear un GitHub Personal Access Token (PAT):
   - Ir a https://github.com/settings/tokens
   - "Generate new token (classic)"
   - Permisos: Solo `public_repo` (read access)
   - Copiar el token

2. Agregar el token como variable de entorno en el VPS:
   ```bash
   # En .env.production
   GITHUB_API_TOKEN=ghp_your_token_here
   ```

3. Actualizar el código para usar el token:
   ```typescript
   const token = process.env.GITHUB_API_TOKEN;
   const result = await fetchGithubStarsEnhanced(GITHUB_REPO_FULL, { token });
   ```

## Error Actual
```
GET https://api.github.com/repos/gabrielpantoja-cl/inmogrid.cl 404 (Not Found)
```

## Funcionalidad del Contador
El contador de estrellas:
- Muestra el número de estrellas del repositorio en la página de inicio
- Usa caché para evitar exceder el rate limit de GitHub
- Maneja errores gracefully (no rompe la página si falla)
- Implementa ETag para optimizar requests

## Archivos Relacionados
- `src/lib/githubStars.ts` - Implementación del fetcher
- `src/components/features/github/GitHubStarsDisplay.tsx` - Componente visual
- `src/hooks/useGitHubStars.ts` - Hook de React
- `examples/github-stars-usage.tsx` - Ejemplos de uso

## Fecha de Deshabilitación
2025-11-22
