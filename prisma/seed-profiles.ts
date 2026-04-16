// Script para poblar la base de datos con perfiles de ejemplo
// Ejecutar con: npx tsx prisma/seed-profiles.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de perfiles...\n');

  // ========================================
  // 1. PERFIL DE MONA
  // ========================================
  console.log('👤 Creando perfil de Mona...');

  const monaUser = await prisma.user.upsert({
    where: { email: 'mona@inmogrid.cl' },
    update: {},
    create: {
      id: 'user-mona-001',
      email: 'mona@inmogrid.cl',
      name: 'Mona',
      username: 'mona',
      image: 'https://ui-avatars.com/api/?name=Mona&size=200&background=7ab56f&color=fff&bold=true',

      // Perfil público
      isPublicProfile: true,
      tagline: 'Amante de las plantas, la ecología y la vida simple.',
      bio: `Soy Mona, y mi vida gira en torno a las plantas y la conexión con la naturaleza.

Desde pequeña sentí fascinación por el mundo verde, y esa pasión se transformó en mi proyecto personal donde cultivo y comparto plantas con cariño y dedicación.

Creo en la vida simple, en el consumo consciente y en el respeto por la tierra. Cada planta que cultivo lleva una historia, y me encanta compartir esas historias contigo.`,

      coverImageUrl: 'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=1600&h=400&fit=crop',
      location: 'Sur de Chile',
      identityTags: ['🌱 Plantas', '♻️ Ecología', '🌿 Vida Simple', '🇨🇱 Sur de Chile'],

      externalLinks: {
        whatsapp: '56944362760',
        website: 'https://inmogrid.cl',
      },

      role: 'user',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Perfil de Mona creado\n');

  // Plantas de Mona
  console.log('🌿 Creando plantas de Mona...');

  const monaPlants = [
    {
      id: 'plant-mona-001',
      userId: monaUser.id,
      name: 'Echeveria Elegans',
      slug: 'echeveria-elegans',
      scientificName: 'Echeveria elegans',
      description: 'Hermosa suculenta de fácil cuidado que me acompaña desde hace años. Su forma de roseta plateada es perfecta para comenzar en el mundo de las suculentas.',
      careInstructions: 'Requiere sol directo y riego moderado (cada 10-15 días). Dejar secar completamente el sustrato entre riegos. Sustrato bien drenado.',
      mainImageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400&h=300&fit=crop',
      category: 'Suculenta',
      difficulty: 'Fácil',
      sunlight: 'Sol directo',
      watering: 'Poco',
      origin: 'México',
      isFavorite: true,
      featured: true,
    },
    {
      id: 'plant-mona-002',
      userId: monaUser.id,
      name: 'Cactus San Pedro',
      slug: 'cactus-san-pedro',
      scientificName: 'Echinopsis pachanoi',
      description: 'Este cactus columnar de crecimiento rápido ha sido mi maestro de paciencia. Lo cultivo desde hace 5 años y cada centímetro de crecimiento es un logro.',
      careInstructions: 'Muy resistente. Sol directo. Riego escaso en invierno, moderado en verano. Perfecto para jardines o macetas grandes.',
      mainImageUrl: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?w=400&h=300&fit=crop',
      category: 'Cactus',
      difficulty: 'Fácil',
      sunlight: 'Sol directo',
      watering: 'Poco',
      origin: 'Andes',
      isFavorite: true,
      featured: true,
    },
    {
      id: 'plant-mona-003',
      userId: monaUser.id,
      name: 'Monstera Deliciosa',
      slug: 'monstera-deliciosa',
      scientificName: 'Monstera deliciosa',
      description: 'Mi planta de interior favorita. Sus hojas perforadas me recuerdan que la imperfección es hermosa. Crece rápido y llena de vida cualquier espacio.',
      careInstructions: 'Semi-sombra o luz indirecta brillante. Regar cuando la tierra esté seca al tacto. Limpiar las hojas regularmente.',
      mainImageUrl: 'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=400&h=300&fit=crop',
      category: 'Ornamental',
      difficulty: 'Media',
      sunlight: 'Semi-sombra',
      watering: 'Moderado',
      origin: 'América Central',
      isFavorite: true,
      featured: true,
    },
    {
      id: 'plant-mona-004',
      userId: monaUser.id,
      name: 'Pothos Dorado',
      slug: 'pothos-dorado',
      scientificName: 'Epipremnum aureum',
      description: 'La planta perfecta para comenzar. Purifica el aire y es casi indestructible. Tengo varias en diferentes rincones de la casa.',
      careInstructions: 'Muy adaptable. Tolera poca luz pero crece mejor con luz indirecta. Regar cuando el sustrato esté seco.',
      mainImageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=300&fit=crop',
      category: 'Trepadora',
      difficulty: 'Fácil',
      sunlight: 'Semi-sombra',
      watering: 'Moderado',
      origin: 'Polinesia',
      isFavorite: false,
      featured: false,
    },
    {
      id: 'plant-mona-005',
      userId: monaUser.id,
      name: 'Lavanda',
      slug: 'lavanda',
      scientificName: 'Lavandula angustifolia',
      description: 'El aroma de la lavanda me transporta a campos de verano. Atrae polinizadores y tiene propiedades relajantes maravillosas.',
      careInstructions: 'Sol directo. Riego moderado. Podar después de la floración para mantener forma compacta.',
      mainImageUrl: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=400&h=300&fit=crop',
      category: 'Aromática',
      difficulty: 'Media',
      sunlight: 'Sol directo',
      watering: 'Moderado',
      origin: 'Mediterráneo',
      isFavorite: false,
      featured: false,
    },
    {
      id: 'plant-mona-006',
      userId: monaUser.id,
      name: 'Aloe Vera',
      slug: 'aloe-vera',
      scientificName: 'Aloe barbadensis',
      description: 'Mi planta medicinal de cabecera. Su gel es milagroso para quemaduras y heridas. Fácil de cuidar y de multiplicar.',
      careInstructions: 'Sol directo. Riego escaso (cada 2-3 semanas). Sustrato muy bien drenado. Proteger de heladas.',
      mainImageUrl: 'https://images.unsplash.com/photo-1565011523534-747a8601f10a?w=400&h=300&fit=crop',
      category: 'Medicinal',
      difficulty: 'Fácil',
      sunlight: 'Sol directo',
      watering: 'Poco',
      origin: 'África',
      isFavorite: false,
      featured: false,
    },
  ];

  for (const plantData of monaPlants) {
    await prisma.plant.upsert({
      where: { id: plantData.id },
      update: {},
      create: plantData,
    });
  }

  console.log(`✅ ${monaPlants.length} plantas de Mona creadas\n`);

  // Post de Mona
  console.log('📝 Creando post de Mona...');

  await prisma.post.upsert({
    where: { id: 'post-mona-001' },
    update: {},
    create: {
      id: 'post-mona-001',
      userId: monaUser.id,
      title: 'Cómo empecé con las plantas',
      slug: 'como-empece-con-las-plantas',
      content: `# Mi viaje verde

Hace algunos años, no sabía nada de plantas. De hecho, había matado varios cactus por exceso de riego (sí, es posible).

Pero todo cambió cuando una amiga me regaló una pequeña suculenta. Era una Echeveria, y algo en su forma perfecta me cautivó.

Empecé a investigar: ¿cuánta luz necesita? ¿cada cuánto riego? ¿qué sustrato usar?

Y así comenzó mi pasión. Cada planta nueva era un desafío, un aprendizaje.

Hoy tengo más de 30 plantas en casa, y cada una tiene su historia.

Lo más hermoso de cultivar plantas es que te enseñan paciencia, observación y respeto por los ciclos naturales.

**Consejo para principiantes**: Empieza con pocas plantas, conoce sus necesidades, obsérvalas diariamente. No las riegues por rutina, riégalas cuando lo necesiten.

¡Y disfruta el proceso!`,
      excerpt: 'La historia de cómo una simple suculenta cambió mi vida y me conectó con el mundo verde.',
      coverImageUrl: 'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=800&h=400&fit=crop',
      published: true,
      publishedAt: new Date(),
      tags: ['plantas', 'historia-personal', 'consejos'],
      readTime: 3,
    },
  });

  console.log('✅ Post de Mona creado\n');

  // ========================================
  // 2. PERFIL DE GABRIEL
  // ========================================
  console.log('👤 Creando perfil de Gabriel...');

  const gabrielUser = await prisma.user.upsert({
    where: { email: 'gabriel@inmogrid.cl' },
    update: {},
    create: {
      id: 'user-gabriel-001',
      email: 'gabriel@inmogrid.cl',
      name: 'Gabriel Pantoja',
      username: 'gabrielpantoja',
      image: 'https://ui-avatars.com/api/?name=Gabriel+Pantoja&size=200&background=2d5016&color=fff&bold=true',

      // Perfil público
      isPublicProfile: true,
      tagline: 'Perito Tasador Inmobiliario & Full Stack Developer en transición',
      bio: `Perito Tasador Inmobiliario con 14+ años de experiencia, especializado en expropiaciones del MOP y peritajes judiciales de topografía.

Actualmente en transición hacia el desarrollo web full stack, combinando mi profundo conocimiento del mercado inmobiliario chileno con tecnologías modernas para crear soluciones PropTech.

Fundador de inmogrid.cl, un ecosistema digital colaborativo que democratiza el acceso a datos inmobiliarios públicos en Chile.`,

      coverImageUrl: 'https://images.unsplash.com/photo-1507149677481-d85e20f7da5e?w=1600&h=400&fit=crop',
      location: 'Chile',
      identityTags: ['🏢 Perito Tasador', '💻 Full Stack Dev', '🗺️ Topografía', '🇨🇱 PropTech Chile'],

      externalLinks: {
        whatsapp: '56944362760',
        website: 'https://inmogrid.cl',
        linkedin: 'https://linkedin.com/in/gabrielpantoja',
        github: 'gabrielpantoja-cl',
      },

      profession: 'TASADOR',
      company: 'Pantoja Propiedades',
      website: 'https://inmogrid.cl',
      linkedin: 'https://linkedin.com/in/gabrielpantoja',

      role: 'admin',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Perfil de Gabriel creado\n');

  // Post de Gabriel
  console.log('📝 Creando post de Gabriel...');

  await prisma.post.upsert({
    where: { id: 'post-gabriel-001' },
    update: {},
    create: {
      id: 'post-gabriel-001',
      userId: gabrielUser.id,
      title: 'De perito tasador a developer: mi transición profesional',
      slug: 'de-perito-tasador-a-developer',
      content: `# Mi historia de transición profesional

Después de 14 años como Perito Tasador Inmobiliario, tomé una decisión que cambió mi vida: aprender a programar.

## ¿Por qué?

Durante años trabajé con datos del Conservador de Bienes Raíces, elaborando informes, analizando transacciones, tasando propiedades para expropiaciones del MOP.

Pero siempre me frustraba lo difícil que era acceder a estos datos públicos. Había que ir físicamente al CBR, solicitar certificados, pagar por cada consulta.

Y pensé: **¿por qué no democratizar esta información?**

## El camino

Empecé con HTML y CSS en YouTube. Luego JavaScript. Después React. Finalmente Next.js, Node.js, PostgreSQL...

Cada tecnología era un mundo nuevo, pero mi conocimiento del dominio inmobiliario me daba una ventaja: **sabía exactamente qué problema quería resolver**.

## inmogrid.cl

Así nació inmogrid.cl: una plataforma que centraliza datos públicos inmobiliarios de Chile y los hace accesibles para todos.

Combina mi experiencia de 14 años en el rubro con stack moderno de desarrollo web.

## Lecciones aprendidas

1. **El conocimiento del dominio es invaluable**: No compites con developers con 10 años de experiencia. Compites resolviendo problemas que solo tú entiendes profundamente.

2. **Empieza resolviendo TU problema**: Si te frustra algo en tu industria, probablemente frustre a otros también.

3. **No necesitas ser experto para empezar**: Empecé sabiendo apenas HTML, pero tenía claro el problema que quería resolver.

¿Estás pensando en hacer una transición similar? **Hazlo**. Tu experiencia en tu campo es tu superpoder.`,
      excerpt: 'Cómo pasé de elaborar informes periciales a construir plataformas web que democratizan datos inmobiliarios.',
      coverImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
      published: true,
      publishedAt: new Date(),
      tags: ['transición-profesional', 'proptech', 'desarrollo-web'],
      readTime: 5,
    },
  });

  console.log('✅ Post de Gabriel creado\n');

  console.log('🎉 Seed de perfiles completado exitosamente!\n');
  console.log('📍 Puedes ver los perfiles en:');
  console.log('   - http://localhost:3000/mona');
  console.log('   - http://localhost:3000/gabrielpantoja');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
