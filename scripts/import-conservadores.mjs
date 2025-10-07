#!/usr/bin/env node

/**
 * Script para importar conservadores desde CSV a la base de datos N8N
 * Uso: node scripts/import-conservadores.mjs
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando importación de conservadores...\n');

  // Leer CSV
  const csvContent = fs.readFileSync('./docs/conservadores.csv', 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    cast: true,
  });

  console.log(`📊 Total de conservadores en CSV: ${records.length}\n`);

  // Verificar conservadores existentes
  const existingConservadores = await prisma.conservadores.findMany({
    select: { id: true, nombre: true }
  });

  console.log(`🗄️  Conservadores existentes en BD: ${existingConservadores.length}`);

  const existingIds = new Set(existingConservadores.map(c => c.id));

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  // Procesar cada registro
  for (const record of records) {
    try {
      if (existingIds.has(record.id)) {
        console.log(`⏭️  Conservador "${record.nombre}" ya existe (${record.id})`);
        skipped++;
        continue;
      }

      await prisma.conservadores.create({
        data: {
          id: record.id,
          nombre: record.nombre,
          direccion: record.direccion || 'Por definir',
          comuna: record.comuna || 'Por definir',
          region: record.region || 'Por definir',
          telefono: record.telefono || null,
          email: record.email || null,
          sitioWeb: record.sitioWeb || null,
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
        },
      });

      console.log(`✅ Insertado: ${record.nombre} (${record.comuna})`);
      inserted++;
    } catch (error) {
      console.error(`❌ Error insertando ${record.nombre}:`, error.message);
      errors++;
    }
  }

  console.log('\n📈 Resumen de importación:');
  console.log(`   ✅ Insertados: ${inserted}`);
  console.log(`   ⏭️  Omitidos (ya existían): ${skipped}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log(`   📊 Total procesados: ${records.length}`);

  // Verificar total final
  const totalFinal = await prisma.conservadores.count();
  console.log(`\n🎯 Total de conservadores en BD ahora: ${totalFinal}`);
}

main()
  .catch((e) => {
    console.error('💥 Error fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
