#!/bin/bash

# 🧪 Test de Autenticación Local - inmogrid.cl
# Este script prueba la configuración de autenticación localmente

set -e

echo "🔍 Test de Autenticación - inmogrid.cl"
echo "===================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar resultado
show_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Test 1: Verificar variables de entorno
echo "📋 Test 1: Variables de Entorno"
echo "--------------------------------"

if [ -f .env.local ]; then
    echo -e "${GREEN}✅ Archivo .env.local existe${NC}"

    # Verificar cada variable (sin mostrar valores sensibles)
    if grep -q "POSTGRES_PRISMA_URL=" .env.local; then
        echo -e "${GREEN}✅ POSTGRES_PRISMA_URL configurado${NC}"
    else
        echo -e "${RED}❌ POSTGRES_PRISMA_URL faltante${NC}"
    fi

    if grep -q "NEXTAUTH_SECRET=" .env.local; then
        echo -e "${GREEN}✅ NEXTAUTH_SECRET configurado${NC}"
    else
        echo -e "${RED}❌ NEXTAUTH_SECRET faltante${NC}"
    fi

    if grep -q "GOOGLE_CLIENT_ID=" .env.local; then
        echo -e "${GREEN}✅ GOOGLE_CLIENT_ID configurado${NC}"
    else
        echo -e "${RED}❌ GOOGLE_CLIENT_ID faltante${NC}"
    fi

    if grep -q "GOOGLE_CLIENT_SECRET=" .env.local; then
        echo -e "${GREEN}✅ GOOGLE_CLIENT_SECRET configurado${NC}"
    else
        echo -e "${RED}❌ GOOGLE_CLIENT_SECRET faltante${NC}"
    fi
else
    echo -e "${RED}❌ Archivo .env.local no existe${NC}"
    exit 1
fi

echo ""

# Test 2: Verificar archivos de configuración
echo "📁 Test 2: Archivos de Configuración"
echo "------------------------------------"

if [ -f "src/lib/auth.config.ts" ]; then
    echo -e "${GREEN}✅ src/lib/auth.config.ts existe${NC}"
else
    echo -e "${RED}❌ src/lib/auth.config.ts faltante${NC}"
fi

if [ -f "prisma/schema.prisma" ]; then
    echo -e "${GREEN}✅ prisma/schema.prisma existe${NC}"
else
    echo -e "${RED}❌ prisma/schema.prisma faltante${NC}"
fi

if [ -f "src/middleware.ts" ]; then
    echo -e "${GREEN}✅ src/middleware.ts existe${NC}"
else
    echo -e "${RED}❌ src/middleware.ts faltante${NC}"
fi

echo ""

# Test 3: Verificar schema de Prisma
echo "🗄️ Test 3: Schema de Prisma"
echo "---------------------------"

if grep -q "model User" prisma/schema.prisma; then
    echo -e "${GREEN}✅ Modelo User definido${NC}"
else
    echo -e "${RED}❌ Modelo User faltante${NC}"
fi

if grep -q "model Account" prisma/schema.prisma; then
    echo -e "${GREEN}✅ Modelo Account definido${NC}"
else
    echo -e "${RED}❌ Modelo Account faltante${NC}"
fi

if grep -q "model Session" prisma/schema.prisma; then
    echo -e "${GREEN}✅ Modelo Session definido${NC}"
else
    echo -e "${RED}❌ Modelo Session faltante${NC}"
fi

echo ""

# Test 4: Verificar rutas de autenticación
echo "🔐 Test 4: Rutas de Autenticación"
echo "---------------------------------"

if [ -d "src/app/api/auth/[...nextauth]" ]; then
    echo -e "${GREEN}✅ Ruta API auth existe${NC}"
else
    echo -e "${RED}❌ Ruta API auth faltante${NC}"
fi

if [ -f "src/app/api/auth/[...nextauth]/route.ts" ]; then
    echo -e "${GREEN}✅ Route handler configurado${NC}"
else
    echo -e "${RED}❌ Route handler faltante${NC}"
fi

echo ""

# Test 5: Verificar dependencias
echo "📦 Test 5: Dependencias"
echo "----------------------"

if grep -q "next-auth" package.json; then
    echo -e "${GREEN}✅ next-auth instalado${NC}"
else
    echo -e "${RED}❌ next-auth faltante${NC}"
fi

if grep -q "@next-auth/prisma-adapter" package.json; then
    echo -e "${GREEN}✅ @next-auth/prisma-adapter instalado${NC}"
else
    echo -e "${RED}❌ @next-auth/prisma-adapter faltante${NC}"
fi

if grep -q "@prisma/client" package.json; then
    echo -e "${GREEN}✅ @prisma/client instalado${NC}"
else
    echo -e "${RED}❌ @prisma/client faltante${NC}"
fi

echo ""

# Test 6: TypeScript types
echo "📘 Test 6: TypeScript Types"
echo "--------------------------"

if [ -f "src/types/next-auth.d.ts" ]; then
    echo -e "${GREEN}✅ Tipos de NextAuth extendidos${NC}"
else
    echo -e "${YELLOW}⚠️  Tipos de NextAuth no extendidos (opcional)${NC}"
fi

echo ""
echo "=================================="
echo "✅ Tests de configuración completados"
echo ""
echo "💡 Próximos pasos:"
echo "  1. Ejecutar 'npm run dev' para iniciar servidor local"
echo "  2. Visitar http://localhost:3000/auth/signin"
echo "  3. Probar login con Google"
echo ""