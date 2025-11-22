// Script para verificar el perfil de Mona en la base de datos
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMonaProfile() {
  console.log('🔍 Buscando perfil de Mona...\n');

  // Buscar por email
  const monaByEmail = await prisma.user.findUnique({
    where: { email: 'monacaniqueo@gmail.com' },
    include: {
      plants: true,
      posts: true,
    },
  });

  if (monaByEmail) {
    console.log('✅ Encontrado por email:');
    console.log('  - ID:', monaByEmail.id);
    console.log('  - Name:', monaByEmail.name);
    console.log('  - Username:', monaByEmail.username || '❌ NO CONFIGURADO');
    console.log('  - Email:', monaByEmail.email);
    console.log('  - Bio:', monaByEmail.bio || '❌ NO CONFIGURADO');
    console.log('  - Tagline:', monaByEmail.tagline || '❌ NO CONFIGURADO');
    console.log('  - Profession:', monaByEmail.profession || '❌ NO CONFIGURADO');
    console.log('  - Location:', monaByEmail.location || '❌ NO CONFIGURADO');
    console.log('  - Public Profile:', monaByEmail.isPublicProfile ? '✅ SÍ' : '❌ NO');
    console.log('  - Image:', monaByEmail.image || '❌ NO CONFIGURADO');
    console.log('  - Cover Image:', monaByEmail.coverImageUrl || '❌ NO CONFIGURADO');
    console.log('\n📊 Contenido:');
    console.log('  - Plantas:', monaByEmail.plants?.length || 0);
    console.log('  - Posts:', monaByEmail.posts?.length || 0);

    if (monaByEmail.plants && monaByEmail.plants.length > 0) {
      console.log('\n🌱 Plantas:');
      monaByEmail.plants.forEach((plant, i) => {
        console.log(`  ${i + 1}. ${plant.name} (${plant.slug}) - Favorita: ${plant.isFavorite ? '❤️' : '🤍'}`);
      });
    }

    if (monaByEmail.posts && monaByEmail.posts.length > 0) {
      console.log('\n📝 Posts:');
      monaByEmail.posts.forEach((post, i) => {
        console.log(`  ${i + 1}. ${post.title} (${post.slug}) - Publicado: ${post.published ? '✅' : '❌'}`);
      });
    }
  } else {
    console.log('❌ No se encontró usuario con email monacaniqueo@gmail.com');
  }

  // Buscar por username "mona"
  const monaByUsername = await prisma.user.findUnique({
    where: { username: 'mona' },
  });

  if (monaByUsername && monaByUsername.email !== 'monacaniqueo@gmail.com') {
    console.log('\n⚠️ ADVERTENCIA: Existe otro usuario con username "mona":');
    console.log('  - Email:', monaByUsername.email);
    console.log('  - Name:', monaByUsername.name);
  }

  await prisma.$disconnect();
}

checkMonaProfile()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });
