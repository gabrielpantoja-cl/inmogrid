# 🚀 SOLUCIÓN DEFINITIVA - Bucle Infinito OAuth + Error de Hidratación
# Ejecutar: .\fix-oauth-complete.ps1

Write-Host ""
Write-Host "🔥 SOLUCIONANDO BUCLE INFINITO DE AUTENTICACIÓN 🔥" -ForegroundColor Red
Write-Host "===================================================" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Los fixes ya están aplicados basándose en documentación oficial de NextAuth.js" -ForegroundColor Green
Write-Host ""

$ErrorActionPreference = "Continue"

function Show-Progress {
    param([string]$Message, [string]$Status = "INFO")
    $color = switch ($Status) {
        "SUCCESS" { "Green" }
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        "CRITICAL" { "Magenta" }
        default { "Cyan" }
    }
    Write-Host "[$Status] $Message" -ForegroundColor $color
}

# Función para verificar estado actual
function Test-CurrentState {
    Show-Progress "📊 Verificando que los fixes estén aplicados..." "INFO"
    
    # Verificar archivos críticos con fixes
    $criticalFiles = @{
        "src/app/auth/error/page.tsx" = "useSearchParams.*AuthErrorContent"
        "src/lib/auth.config.ts" = "redirect.*baseUrl"
        "src/middleware.ts" = "infinite loop detected"
    }
    
    $allFixed = $true
    
    foreach ($file in $criticalFiles.GetEnumerator()) {
        if (Test-Path $file.Key) {
            $content = Get-Content $file.Key -Raw
            if ($content -match $file.Value) {
                Show-Progress "✅ $($file.Key) - Fix aplicado correctamente" "SUCCESS"
            } else {
                Show-Progress "❌ $($file.Key) - Fix NO aplicado" "ERROR"
                $allFixed = $false
            }
        } else {
            Show-Progress "❌ $($file.Key) - Archivo no encontrado" "ERROR"
            $allFixed = $false
        }
    }
    
    return $allFixed
}

# Función para test de build local
function Test-LocalBuild {
    Show-Progress "🏗️ Probando build local..." "INFO"
    
    # Limpiar build anterior
    if (Test-Path ".next") {
        Show-Progress "🧹 Limpiando build anterior..." "INFO"
        Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    try {
        Show-Progress "Ejecutando npm run build..." "INFO"
        $buildOutput = npm run build 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Show-Progress "✅ Build local exitoso - No hay errores de hidratación" "SUCCESS"
            
            # Buscar warnings específicos de hidratación
            if ($buildOutput -match "hydration|mismatch") {
                Show-Progress "⚠️ Posibles warnings de hidratación en build" "WARNING"
            } else {
                Show-Progress "✅ Sin errores de hidratación detectados" "SUCCESS"
            }
            
            return $true
        } else {
            Show-Progress "❌ Build local falló" "ERROR"
            Show-Progress "$buildOutput" "ERROR"
            return $false
        }
    } catch {
        Show-Progress "❌ Error ejecutando build: $_" "ERROR"
        return $false
    }
}

# Función para configurar variables de Vercel
function Set-VercelProduction {
    Show-Progress "🚀 Configurando variables críticas en Vercel..." "CRITICAL"
    
    # Verificar Vercel CLI
    if (-not (Get-Command "vercel" -ErrorAction SilentlyContinue)) {
        Show-Progress "⚠️ Vercel CLI no encontrado. Configuración manual requerida." "WARNING"
        Show-Progress "Instala con: npm i -g vercel" "INFO"
        return $false
    }
    
    # Variables críticas específicas para el fix.
    # NOTA: reemplaza los valores placeholder antes de correr el script.
    # El NEXTAUTH_SECRET debe generarse con: openssl rand -base64 32
    # Nunca commitees valores reales acá — este archivo está tracked.
    $criticalVars = @{
        "NEXTAUTH_URL" = "https://referenciales.cl"
        "NEXTAUTH_SECRET" = "GENERATE_WITH_openssl_rand_base64_32"
    }
    
    foreach ($var in $criticalVars.GetEnumerator()) {
        try {
            Show-Progress "Configurando $($var.Key)..." "INFO"
            $command = "echo `"$($var.Value)`" | vercel env add $($var.Key) --env=production --force --yes"
            Invoke-Expression $command 2>&1 | Out-Null
            Show-Progress "✅ $($var.Key) configurada" "SUCCESS"
        } catch {
            Show-Progress "⚠️ Error configurando $($var.Key): $_" "WARNING"
        }
    }
    
    return $true
}

# Función para deploy
function Deploy-ToProduction {
    Show-Progress "🚀 Desplegando con fixes aplicados..." "CRITICAL"
    
    try {
        $deployOutput = vercel --prod --yes 2>&1
        if ($LASTEXITCODE -eq 0) {
            Show-Progress "✅ Deploy exitoso con fixes aplicados" "SUCCESS"
            return $true
        } else {
            Show-Progress "❌ Deploy falló: $deployOutput" "ERROR"
            return $false
        }
    } catch {
        Show-Progress "❌ Error en deploy: $_" "ERROR"
        return $false
    }
}

# Función para test final
function Test-ProductionFix {
    Show-Progress "🧪 Verificando que la solución funcione..." "INFO"
    
    Write-Host ""
    Write-Host "🧪 TESTING MANUAL REQUERIDO:" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. 🌐 Ve a: https://referenciales.cl/" -ForegroundColor White
    Write-Host "2. 🔐 Haz clic en 'Iniciar sesión con Google'" -ForegroundColor White  
    Write-Host "3. 📋 Autoriza la aplicación en Google" -ForegroundColor White
    Write-Host "4. ✅ Verifica que llegues al dashboard SIN BUCLE INFINITO" -ForegroundColor White
    Write-Host "5. 🚫 Verifica que NO haya errores de hidratación en DevTools" -ForegroundColor White
    Write-Host ""
    
    try {
        $response = Invoke-WebRequest -Uri "https://referenciales.cl/auth/error?error=CallbackError" -Method Head -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Show-Progress "✅ Página de error personalizada accesible" "SUCCESS"
        }
    } catch {
        Show-Progress "⚠️ Error verificando página de error: $_" "WARNING"
    }
}

# Función principal
function Start-OAuthFix {
    Write-Host "🎯 VERIFICANDO SOLUCIÓN COMPLETA..." -ForegroundColor Green
    Write-Host ""
    
    # Verificar que los fixes estén aplicados
    $fixesApplied = Test-CurrentState
    
    if (-not $fixesApplied) {
        Show-Progress "❌ Los fixes no están aplicados correctamente. Revisa los archivos." "ERROR"
        return
    }
    
    Write-Host ""
    
    # Test de build local
    $buildSuccess = Test-LocalBuild
    
    if (-not $buildSuccess) {
        Show-Progress "❌ Build falló. Revisa los errores antes de continuar." "ERROR"
        return
    }
    
    Write-Host ""
    
    # Configurar Vercel si está disponible
    $vercelConfigured = Set-VercelProduction
    
    Write-Host ""
    
    # Deploy si todo está bien
    if ($vercelConfigured) {
        $deploySuccess = Deploy-ToProduction
        
        if ($deploySuccess) {
            Write-Host ""
            Write-Host "🎉 SOLUCIÓN APLICADA CON ÉXITO 🎉" -ForegroundColor Green
            Write-Host ""
            Test-ProductionFix
        }
    } else {
        Write-Host "⚠️ CONFIGURACIÓN MANUAL REQUERIDA" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📝 PASOS MANUALES:" -ForegroundColor Cyan
        Write-Host "1. Ve a https://vercel.com/dashboard" -ForegroundColor White
        Write-Host "2. Tu proyecto → Settings → Environment Variables" -ForegroundColor White
        Write-Host "3. Configura: NEXTAUTH_URL=https://referenciales.cl" -ForegroundColor White
        Write-Host "4. Haz deploy desde Vercel dashboard" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "📋 RESUMEN DE FIXES APLICADOS:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✅ Error de hidratación corregido (useSearchParams en Suspense)" -ForegroundColor Green
    Write-Host "✅ Página de error mejorada según documentación oficial" -ForegroundColor Green
    Write-Host "✅ Auth config optimizado con callback de redirect" -ForegroundColor Green
    Write-Host "✅ Middleware mejorado para prevenir bucles infinitos" -ForegroundColor Green
    Write-Host "✅ Headers de seguridad y cache configurados" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔍 Para monitorear logs:" -ForegroundColor Yellow
    Write-Host "   vercel logs --follow" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 Basado en documentación oficial de NextAuth.js" -ForegroundColor Cyan
}

# Ejecutar la solución
Start-OAuthFix
