# Diagnóstico de Error de Autenticación de Google: `401 invalid_client`

**Fecha:** 2025-11-21

## 1. Problema

Al intentar iniciar sesión con Google en la aplicación `degux.cl`, se produce el siguiente error de autorización:

```
Error 401: invalid_client
The OAuth client was not found.
```

Este error indica que el ID de cliente OAuth (`GOOGLE_CLIENT_ID`) que la aplicación está enviando a Google no es válido o no se encuentra en el proyecto de Google Cloud Console asociado.

## 2. Análisis Realizado

Se ha llevado a cabo una revisión de la configuración de `next-auth` en el proyecto y de la documentación oficial.

- **Archivo de Configuración (`src/lib/auth.config.ts`):**
  La configuración utiliza correctamente las variables de entorno `process.env.GOOGLE_CLIENT_ID` y `process.env.GOOGLE_CLIENT_SECRET` para configurar el proveedor de Google. El código en sí es correcto.

- **Documentación de NextAuth.js y Google:**
  El error `invalid_client` es un error conocido y documentado que apunta inequívocamente a una de las siguientes causas:
    1.  El `GOOGLE_CLIENT_ID` en el archivo `.env.local` del entorno de ejecución es incorrecto, está mal copiado o no existe.
    2.  El cliente OAuth 2.0 ha sido eliminado del proyecto de Google Cloud.
    3.  Se está utilizando el proyecto o las credenciales incorrectas en Google Cloud Console.

## 3. Causa Raíz Más Probable

La causa más probable es una **discrepancia entre la configuración del proyecto en Google Cloud Console y las variables de entorno** utilizadas por la aplicación. El código de la aplicación está configurado correctamente, pero las "llaves" que le está pasando a Google no son las correctas.

## 4. Pasos para la Solución

Para resolver este problema, sigue estos pasos para verificar y sincronizar tus credenciales.

### Paso 1: Acceder a Google Cloud Console

1.  Ve a [Google Cloud Console](https://console.cloud.google.com/).
2.  Asegúrate de haber iniciado sesión con la cuenta de Google correcta: **peritajes@gabrielpantoja.cl**.
3.  En la parte superior, selecciona el proyecto de Google Cloud correcto asociado a `degux.cl`.

### Paso 2: Verificar Credenciales de OAuth

1.  En el menú de navegación, ve a **APIs y servicios > Credenciales**.
2.  Busca en la sección **"IDs de cliente de OAuth 2.0"** el cliente que estás utilizando para `degux.cl`. Debería ser de tipo "Aplicación web".

    -   **Si no existe un cliente OAuth:** Deberás crear uno nuevo. Haz clic en **"Crear credenciales" > "ID de cliente de OAuth"**, selecciona "Aplicación web" y configúralo.
    -   **Si existe el cliente OAuth:** Haz clic en el nombre para ver los detalles.

### Paso 3: Validar la Configuración del Cliente OAuth

Dentro de los detalles del cliente OAuth, verifica dos secciones cruciales:

1.  **URIs de origen de JavaScript autorizados:**
    Asegúrate de que estas dos URLs estén presentes:
    -   `https://degux.cl`
    -   `http://localhost:3000`

2.  **URIs de redireccionamiento autorizados:**
    Verifica que estas dos URLs existan *exactamente* como se muestra a continuación:
    -   `https://degux.cl/api/auth/callback/google`
    -   `http://localhost:3000/api/auth/callback/google`

    *Cualquier discrepancia (una `/` extra, `http` en lugar de `https`, etc.) causará un error.*

### Paso 4: Sincronizar Variables de Entorno

1.  En la misma página de detalles de credenciales, copia el **"ID de cliente"** y el **"Secreto de cliente"**.
2.  Abre tu archivo `.env.local` en el proyecto `degux.cl`.
3.  Compara y, si es necesario, reemplaza los valores de `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` con los que acabas de copiar.

    ```env
    # .env.local

    # Google OAuth
    GOOGLE_CLIENT_ID="AQUÍ_VA_EL_ID_DE_CLIENTE_COPIADO_DE_GOOGLE_CLOUD"
    GOOGLE_CLIENT_SECRET="AQUÍ_VA_EL_SECRETO_DE_CLIENTE_COPIADO"

    # ... otras variables
    ```

### Paso 5: Reiniciar la Aplicación

Después de guardar los cambios en `.env.local`, detén tu servidor de desarrollo y vuelve a iniciarlo (`npm run dev`). Las variables de entorno solo se cargan al iniciar la aplicación.

## 5. Verificación

Una vez completados los pasos anteriores, intenta iniciar sesión con Google de nuevo. El error `401 invalid_client` debería estar resuelto.
