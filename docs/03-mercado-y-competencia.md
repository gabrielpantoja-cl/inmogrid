# Mercado y Competencia
### Mapa completo del PropTech chileno — dónde estamos parados (actualizado abril 2026)

---

## Mapa por capas

| Actor | Transaccional | Analítica / AVM | Datos / CBR | Herramientas Prof. | Comunidad / Conocimiento | Fintech |
|-------|:---:|:---:|:---:|:---:|:---:|:---:|
| Portal Inmobiliario | ✅ principal | parcial | — | — | — | — |
| TocToc | ✅ principal | parcial | — | — | blog/tendencias | hipotecario |
| Propiteq | — | ✅ central | SII + CBR | tasadores/empresas | parcial | — |
| HousePricing | agregador | ✅ central | SII + CBR | bancos/tasadores | — | — |
| Descubro Data | — | — | ✅ CBR georref. | tasadores | — | — |
| Databam | — | — | ✅ CBR + herencias | tasadores/fintechs | — | — |
| HomeSpotter | — | riesgo + AVM | multi-fuente | B2B enterprise | — | — |
| BIEE.ai | — | AVM + simulación | parcial | inversores retail | educación financiera | simulación crédito |
| Dataprop | via portales | avalúo básico | — | CRM corredores | — | — |
| GlobalBrokers | red canje | — | — | CRM + red corredores | ✅ (solo corredores) | — |
| Cliperty | proyectos nuevos | — | — | corredores/proyectos | — | — |
| Tasando.cl | meta-buscador | AVM básico | — | parcial | — | — |
| Tinsa Chile | — | AVM enterprise | peritos esp. | bancos/institucional | — | — |
| CLAPES UC | — | índice hedónico | — | académico | académica | — |
| Creditú | — | — | — | — | — | ✅ hipotecario |
| Comunidad Feliz | — | — | — | admin edificios | comunidades | cobros/GC |
| PropTech Chile AG | — | — | — | — | gremio startups | — |

---

## Análisis individual

### Portales de listings (capa transaccional)

#### Portal Inmobiliario
Propiedad de MercadoLibre (adquirido 2014, USD 40M). Domina con 56% del tráfico web del sector y 4,5M visitas mensuales. Modelo: freemium para publicaciones + planes pagos para corredores + estudios de mercado para desarrolladoras.

**Gap:** Plataforma corporativa sin foco en comunidad profesional ni datos abiertos. Percibido como caro por corredores independientes.

#### TocToc
Portal chileno que evolucionó de buscador a ecosistema transaccional (búsqueda + financiamiento + datos de mercado). El CEO proyecta crecimiento 6-8% en ventas nuevas para 2025. Ingresos: 80% publicidad/inteligencia de mercado, 20% comisiones por venta.

**Gap:** No profundiza en datos abiertos ni comunidad profesional. Fuertemente orientado a retail, menos B2B puro.

#### Cliperty
Marketplace B2B entre desarrolladoras y corredores independientes para proyectos de obra nueva. En menos de 1 año: crecimiento mensual 48%, 200+ agentes activos, transacciones > UF 120.000. Clientes: Almagro, Deisa, Ingevec, Fundamenta.

**Gap:** Sin datos, sin comunidad, sin educación. Puramente transaccional.

---

### Plataformas de datos y AVM (capa analítica)

#### Propiteq
Fundada 2022 por Transsa. Se autodefine como "Google Maps inmobiliario." Métricas 2025: 67.000 usuarios registrados, 12.000 tasaciones mensuales, 470 suscripciones activas. Fuentes: SII + CBR + portales. Modelo freemium — plataforma gratuita + planes B2B enterprise.

**Gap:** Joven (2022). El componente B2B de 470 suscripciones es aún pequeño. Sin comunidad profesional.

#### HousePricing
SaaS de AVM fundado 2020, orientado primariamente a bancos y fondos. Precisión declarada 98%. Reduce el tiempo de cierre hipotecario de semanas a horas con un costo 70% menor al proceso manual. Plan de expansión a UK en 2025.

**Gap:** Sin datos abiertos, sin comunidad. Posicionamiento corporativo frío para el ecosistema de tasadores independientes.

#### Descubro Data
La plataforma con el listado georreferenciado de compraventas de todos los CBR de Chile. Herramienta crítica para tasadores que necesitan comparables reales. Planes de suscripción profesionales.

**Esta es la fuente de datos que alimenta referenciales.cl vía scraper.** Acceso pagado para plataformas comerciales; el scraper extrae los datos para exponerlos en abierto.

**Gap:** Acceso pagado cierra la democratización. Sin comunidad, sin educación, sin foro profesional.

#### Databam
Base de datos con 8 millones de propiedades, 10+ años de historia. Diferenciador clave: incluye **herencias y adjudicaciones** (no solo compraventas). Cobertura CBR: 26 comunas Santiago. Datos de propietarios y construcciones: cobertura nacional. Enfoque API-first para integración.

**Gap:** Menor notoriedad pública que Propiteq o HousePricing. Sin capa de comunidad ni educación.

#### HomeSpotter
Inteligencia B2B enterprise: 30M registros de personas y empresas, 9M propiedades, 60.000 polígonos de permisología. Clientes reportan 70% menos tiempo en prospecting, 45% más conversiones. Fuentes: MINVU, SII, CBR, Registro Civil, portales, catastros.

**Gap:** Solo grandes empresas. Sin acceso ciudadano, sin tasadores independientes, sin comunidad.

#### BIEE.ai
IA conversacional para inversión inmobiliaria retail. Asistente "TIM." Combina AVM, simulación de crédito y educación financiera. Lanzado 2024-2025.

**Gap:** Orientado a inversores, no a tasadores ni ciudadanos en proceso de arrendamiento/valuación.

#### Tasando.cl
Meta-buscador que agrega oferta de todos los portales principales con valorización adjunta. Iniciativa de Lares (inversión y tecnología inmobiliaria). Informe de tasación con confirmación en 3 horas hábiles.

**Gap:** AVM menos sofisticado. Sin comunidad ni herramientas profesionales avanzadas.

#### CLAPES UC
Centro académico de la PUC. Publica el Índice de Precios Inmobiliario Residencial basado en modelos hedónicos sobre transacciones reales del CBR. Datos desde Q1 2007. Fuente más citada por medios y política pública para medir evolución del precio de la vivienda en Santiago.

**Gap:** Solo RM, frecuencia baja (trimestral), sin herramientas interactivas, sin cobertura regional.

---

### Herramientas profesionales

#### Dataprop
CRM SaaS para agencias y corredores. No es una fuente de datos: es software de gestión. Republica propiedades en TocToc, Portal Inmobiliario, MercadoLibre, Yapo. Red de canje de 3.000+ propiedades entre corredores.

**Gap:** Sin datos reales, sin comunidad educativa, sin foco en tasadores.

#### Tinsa Chile
Filial de Tinsa by Accumin (global). 25.000+ tasaciones anuales en Chile, 450.000+ globales. Sirve a casi la totalidad de instituciones financieras del país. Productos 2025: STIMA (tasación online automatizada) e IncoinPlus (inteligencia de mercado institucional).

**Gap:** No democratiza datos, sin comunidad, modelo completamente cerrado y corporativo.

---

### Redes profesionales (comunidades cerradas)

#### GlobalBrokers
Plataforma "por corredores, para corredores." Red de canje + directorio + herramientas + red social interna. Score de reputación profesional. El actor con componente más explícito de comunidad — pero dentro del gremio de corredores solamente.

**Gap crítico:** Walled garden. No cubre tasadores, académicos, ciudadanos. El conocimiento que circula adentro no sale.

---

### Fintech y administración

#### Creditú
Fintech hipotecaria fundada 2017. USD 800M+ en créditos originados, 12.000+ familias, rentable desde 2023. Serie A de USD 6M cerrada en 2025 para expansión a Brasil y Perú.

#### Comunidad Feliz
SaaS líder de administración de condominios. Adquirida por Visma (Noruega) en ~USD 70M en diciembre 2025. +1 millón de propiedades gestionadas. Opera en 7 países.

---

### El gremio

#### PropTech Chile AG
Asociación gremial con 75+ startups miembro. Academia PropTech + DataLab. Rol de articulación del ecosistema, no producto. Es el actor que organiza y visibiliza — no compite.

---

## Actores emergentes (2024-2026)

| Actor | Qué hace | Estado |
|-------|---------|--------|
| **BIEE.ai** | IA conversacional para inversión retail + educación financiera | Lanzado 2024 |
| **Huella Estructural** | Monitoreo estructural de edificios con IoT. Premio Best UrbanTech 2025. Contratos con hospitales públicos. | Serie temprana |
| **Swappi** | SaaS admin de condominios, competidor de Comunidad Feliz. Expansión Colombia/Perú. | Crecimiento regional |
| **Propers** | Plataforma multi-vertical, 8.000+ propiedades con grandes inmobiliarias | Early stage |

---

## Los 6 gaps estratégicos — el espacio libre

### Gap 1 — Comunidad de conocimiento para tasadores
**El espacio más vacío del ecosistema.**

Descubro Data y Databam les entregan datos. Tinsa les da trabajo institucional. Pero nadie crea un espacio donde los tasadores discutan metodología, compartan criterios, actualicen conocimiento regulatorio (SII, CBR, MINVU) y hagan peer review entre pares.

### Gap 2 — Datos abiertos colaborativos
CLAPES UC es académico y trimestral. Descubro/Databam son pagados y privados. El SII y CBR son públicos pero sin interfaz útil. Nadie está construyendo una base de referenciales colaborativa, verificada por la comunidad, con metodología abierta.

**referenciales.cl ataca directamente este gap.**

### Gap 3 — Educación abierta para profesionales de tasación
GlobalBrokers tiene capacitación para corredores. PropTech Chile AG tiene Academia PropTech. Para el perito tasador — metodología, normativa actualizada, modelos hedónicos, valuación de activos especiales — nada sistematizado y de libre acceso en Chile.

### Gap 4 — Inteligencia de mercado regional (fuera de Santiago)
CLAPES UC solo cubre RM. Propiteq tiene cobertura nacional sin profundidad regional. HousePricing es menos preciso en regiones por menor densidad de datos. Nadie hace análisis sistematizado para Valparaíso, Biobío, Araucanía, Los Ríos.

**Gabriel tiene 15 años de trabajo en regiones — este gap es una ventaja competitiva directa.**

### Gap 5 — Peritajes judiciales y periciales
Tinsa sirve al mercado bancario. El perito judicial — que trabaja para tribunales, particiones, herencias, embargos — no tiene ninguna herramienta digital. Su trabajo es completamente manual. Sin acceso a datos integrados, sin flujos digitales, sin firma digital.

### Gap 6 — Directorio verificado de profesionales
En Chile cualquiera puede llamarse corredor de propiedades sin requisito alguno. No existe ningún directorio con criterios de verificación para tasadores independientes ni corredores con trayectoria comprobable. GlobalBrokers tiene scores para sus miembros, pero es un club cerrado.

---

## La crisis de confianza de Portal Inmobiliario — evidencia concreta

Portal Inmobiliario (Mercado Libre) es el portal dominante en Chile: 56% del tráfico web del sector, 4,5 millones de visitas mensuales. Pero está perdiendo la confianza de los dos actores que lo sostienen.

### El conflicto con las corredoras (La Tercera, 2021 — con consecuencias activas hoy)

En 2021, Mercado Libre lanzó **Arriendo Online** en exclusiva con Assetplan, la corredora más grande del país. El efecto inmediato: los listings de otras corredoras que pagaban el plan "Oro Premium" cayeron de la primera página a las páginas 4-8.

> *"Si antes con $100 conseguía leads de Portal Inmobiliario, ahora con esos mismos $100 no puedo conseguirlos — necesitaría gastar $300."*
> — Administradora de corredora afectada

El click-through entre páginas 1-3 versus páginas posteriores puede diferir en un 50%. Para los administradores pequeños, el 80% de sus ventas proviene de leads de Portal — la pérdida de visibilidad es existencialmente amenazante.

Las corredoras afectadas descubrieron el acuerdo de exclusividad **por accidente**. Se consultaron abogados por posible abuso de posición dominante, citando paralelos con las sanciones de la UE contra Google Shopping.

**El patrón:** el portal le hizo a las corredoras lo que Google les hace a los publishers — las usó para construir tráfico y luego las desplazó con su propio producto.

### Los reclamos de usuarios (Reclamos.cl, 2025)
- Cobros indebidos en publicaciones "Oro Premium" — enero y marzo 2025
- Bloqueo de cuentas sin previo aviso
- Dificultad para dar de baja el servicio
- Solo resuelven el 35% de los problemas semanales
- Acusaciones de borrar opiniones negativas

### El patrón estructural irresoluble

Portal Inmobiliario necesita cobrarle a las corredoras para funcionar, Y quiere competir con ellas con sus propios productos. No puede ser neutral para ambos lados simultáneamente.

**Este es exactamente el espacio que nosotros no vamos a ocupar** — porque no vendemos propiedades y no cobramos por aparecer primero.

---

## Nuestra posición

No competimos con ninguno de estos players en su espacio. El ecosistema completo está densamente cubierto en dos zonas:

1. **Listings transaccionales** — mercado maduro y dominado (Portal Inmobiliario, TocToc)
2. **AVM y datos institucionales** — en expansión pero B2B o detrás de muro de pago (Propiteq, HousePricing, Descubro, Databam)

Las zonas **prácticamente vacías**:
- Comunidad de conocimiento abierto para tasadores y peritos
- Datos colaborativos verificados con metodología transparente
- Educación abierta con contexto normativo chileno
- Herramientas para el perito independiente (no el banco, no el corredor — el perito mismo)
- Inteligencia de mercado regional fuera de Santiago

**Ocupamos el espacio que ninguno puede ocupar sin cambiar su modelo de negocio: la capa de comunidad, conocimiento y confianza.**

---

## Competidores que más respetamos — referentes de ejecución

De todo el ecosistema PropTech chileno, dos players destacan por su ejecución técnica y su capacidad de resolver el problema de datos:

### Descubro Data
La fuente más completa de compraventas georreferenciadas de todos los CBR de Chile. Su fortaleza no es la tecnología — es la cobertura y la consistencia. Llevan años recopilando datos que nadie más tiene sistematizados. Su modelo de negocio (acceso pagado) es exactamente lo que nosotros queremos abrir — pero su ejecución de ingesta de datos es una referencia directa. **Lo que nos diferencia:** nosotros abrimos esos datos vía referenciales.cl en lugar de venderlos.

### HousePricing
Precisión y velocidad aplicadas a AVM. Su capacidad de reducir el tiempo de tasación bancaria de semanas a horas con 98% de precisión declarada es técnicamente notable. Su fortaleza es el rigor estadístico. **Lo que nos diferencia:** ellos sirven a bancos y fondos; nosotros servimos al perito independiente y al ciudadano.

**La pregunta que guía nuestro producto:** ¿qué haría Descubro Data si fuera open source? ¿Qué haría HousePricing si no necesitara recuperar inversión en 3 años?

---

## Referencias internacionales

| Referencia | Por qué importa |
|-----------|----------------|
| **UK Land Registry** | Datos de transacciones como infraestructura pública gratuita — 24M+ registros desde 1995 |
| **Stack Overflow** | Conocimiento técnico como bien común. Monetiza herramientas premium para empresas, nunca el conocimiento base |
| **Nextdoor** | Red social verificada y territorial. 100M usuarios en 345.000 barrios |
| **Meetup.com** | Directorio de eventos de comunidad. Gratis para grupos pequeños, pagado para comerciales |
| **Wikipedia** | Confianza a escala sin modelo transaccional. La comunidad verifica, nadie paga por aparecer |
