

# **Extracción de Datos de Portal Inmobiliario con n8n: Un Informe Técnico para la Automatización a Escala**

## **Sección 1: Análisis Fundacional del Objetivo: Portal Inmobiliario**

Antes de construir cualquier flujo de trabajo de extracción de datos, es imperativo realizar un análisis exhaustivo del sitio objetivo. Este proceso de reconocimiento dicta la estrategia completa, revelando los obstáculos técnicos y las defensas que deben superarse. En el caso de Portal Inmobiliario, su estrecha integración con la infraestructura de Mercado Libre presenta un conjunto de desafíos que hacen que los enfoques de scraping simplistas sean ineficaces. Esta sección desglosa la arquitectura técnica del sitio, evalúa sus mecanismos anti-scraping y considera la API oficial como una alternativa, sentando las bases para una solución robusta y escalable.

### **1.1. Reconocimiento Técnico de Portal Inmobiliario**

Un examen inicial revela que Portal Inmobiliario no es una plataforma independiente, sino el brazo inmobiliario de Mercado Libre, el gigante del comercio electrónico en América Latina.1 Esta afiliación es el primer indicador de un alto grado de sofisticación técnica. Las grandes plataformas de comercio electrónico invierten masivamente en infraestructura, rendimiento y, de manera crucial para este análisis, en sistemas de seguridad y anti-abuso.

El principal desafío técnico es el método de carga de contenido del sitio. Los listados de propiedades y los resultados de búsqueda no se entregan en la carga inicial de HTML estático. En su lugar, la página utiliza JavaScript para ejecutar llamadas asíncronas (AJAX/XHR) a servicios de backend que devuelven los datos de las propiedades y luego los insertan dinámicamente en la página.3 Este comportamiento invalida inmediatamente el método de scraping más básico, que consiste en una única solicitud

GET seguida de un análisis de HTML. El nodo HTTP Request nativo de n8n, por defecto, solo recuperará la plantilla HTML inicial, que carecerá de los datos inmobiliarios esenciales, devolviendo un documento estructuralmente correcto pero vacío de contenido útil.3

Además del contenido dinámico, la navegación a través de los resultados de búsqueda está paginada. Un scraper eficaz debe ser capaz de navegar secuencialmente a través de todas las páginas de resultados para recopilar un conjunto de datos completo.7 El análisis de la estructura de la URL durante la navegación manual revela el patrón de paginación. Típicamente, esto se implementa a través de parámetros de consulta (por ejemplo,

?page=2) o como parte de la ruta del directorio (por ejemplo, /page/2).10 Identificar este patrón es fundamental para construir un bucle de paginación dentro de n8n que pueda solicitar sistemáticamente cada página de resultados hasta que se agote el conjunto de datos.

### **1.2. Modelo de Amenazas: Anticipando Defensas Anti-Scraping**

Dada su asociación con Mercado Libre, se debe asumir que Portal Inmobiliario emplea un conjunto de defensas anti-scraping de nivel empresarial. Ignorar estas defensas resultará en un fracaso rápido y consistente del flujo de trabajo.

* **Limitación de Tasa y Bloqueo de IP:** La defensa más fundamental es el bloqueo de direcciones IP que exhiben un comportamiento similar al de un bot, como realizar un número excesivo de solicitudes en un corto período de tiempo.13 Cualquier intento de scraping a gran escala desde una única dirección IP estática será detectado y bloqueado casi instantáneamente. Los servicios comerciales que se especializan en la extracción de datos de Mercado Libre anuncian explícitamente la rotación de IP a través de grandes pools de proxies como una característica central, lo que subraya su necesidad.16  
* **Huella Digital del Navegador y TLS:** Los sistemas anti-bot modernos van más allá del simple seguimiento de IP. Analizan el protocolo de enlace TLS (Transport Layer Security) y las cabeceras de la solicitud HTTP para crear una "huella digital" única del cliente que realiza la solicitud. La biblioteca axios de Node.js, que es la base del nodo HTTP Request de n8n, tiene una huella digital TLS bien conocida y fácilmente identificable que difiere significativamente de la de un navegador web estándar. Sistemas sofisticados como Cloudflare pueden detectar esta huella y bloquear la solicitud con un error 403 Forbidden, incluso si la dirección IP es válida y el User-Agent parece legítimo.13  
* **CAPTCHAs:** Como medida secundaria para el tráfico sospechoso que no se bloquea de inmediato, la plataforma presentará un CAPTCHA (Prueba de Turing Pública Completamente Automatizada para Diferenciar Computadoras y Humanos). Los flujos de trabajo nativos de n8n no tienen la capacidad de resolver estos desafíos visuales o interactivos, lo que detiene por completo el proceso de extracción.16  
* **Programa de Protección de Marcas:** Mercado Libre opera un "Brand Protection Program" formal para combatir la infracción de la propiedad intelectual.19 Si bien su enfoque principal no es el anti-scraping, su existencia demuestra una cultura de monitoreo proactivo y aplicación de políticas en la plataforma. Es lógico extender esta postura a la protección contra la extracción de datos no autorizada, que puede afectar el rendimiento del servidor y la propiedad de los datos.

### **1.3. La Alternativa de la API: Una Vía Superior pero Defectuosa**

Siempre que sea posible, utilizar una API oficial es preferible al web scraping. Las APIs proporcionan datos estructurados directamente, son más estables ante cambios en el diseño de la interfaz de usuario y representan un método de acceso a los datos sancionado por la plataforma. Mercado Libre ofrece una API oficial extensa y bien documentada para que los desarrolladores accedan a los datos de la plataforma, incluyendo productos, pedidos e información de usuario.20

Sin embargo, existe un obstáculo crítico específico para la integración con n8n. La API de Mercado Libre requiere autenticación a través del flujo OAuth2 con PKCE (Proof Key for Code Exchange). Se ha identificado un error en la implementación de n8n (específicamente en la versión 1.86.0 y relacionadas) que impide que el client\_secret se envíe correctamente durante el paso final de intercambio de tokens. Esto hace que la solicitud de autenticación falle, ya que la API de Mercado Libre rechaza la solicitud por falta de un parámetro requerido.26

Este error de integración tiene implicaciones estratégicas significativas. Aunque la API es la solución correcta y más robusta a largo plazo, actualmente es inviable utilizarla directamente desde n8n. Esta situación obliga a recurrir al web scraping como una solución alternativa necesaria. Por lo tanto, cualquier solución de scraping debe ser diseñada con el entendimiento de que es una solución táctica para un problema de integración temporal, no una base estratégica permanente.

La confluencia de estos tres factores —el uso de contenido dinámico por parte de Portal Inmobiliario, la sofisticada infraestructura anti-bot de Mercado Libre y el actual error de integración de la API en n8n— crea un escenario en el que los métodos de scraping nativos y básicos de n8n están casi garantizados a fallar para cualquier extracción de datos fiable y a escala. La discusión debe evolucionar de "¿cómo hacer scraping?" a "¿qué infraestructura externa se requiere para permitir que n8n realice el scraping con éxito?". La solución no reside únicamente dentro de n8n, sino en cómo n8n puede orquestar herramientas más especializadas. Además, la dependencia de una solución de scraping es inherentemente frágil; un cambio en la estructura del sitio web o una mejora en las defensas anti-bot puede romper el flujo de trabajo en cualquier momento.13 La estrategia a largo plazo debe ser monitorear la resolución del error de OAuth2 en n8n 26 y planificar una migración a la API oficial tan pronto como sea viable, ya que las APIs versionadas ofrecen una estabilidad muy superior a la del análisis de HTML.27

## **Sección 2: Estrategia Central de Scraping con Nodos Nativos de n8n**

Aunque los nodos nativos de n8n son insuficientes para una solución de producción completa contra un objetivo como Portal Inmobiliario, su uso es un paso esencial en la fase de análisis y desarrollo. Permiten realizar un reconocimiento inicial, comprender la estructura del sitio y, lo más importante, desarrollar y validar la lógica de extracción de datos (selectores CSS) que se reutilizará más adelante con métodos de obtención de datos más avanzados. Esta sección detalla el uso de las herramientas fundamentales de n8n para este propósito.

### **2.1. Configuración del Nodo HTTP Request para Reconocimiento**

El nodo HTTP Request es la herramienta fundamental para cualquier interacción web en n8n, actuando como una "navaja suiza" para las solicitudes HTTP.13 La configuración predeterminada de este nodo es inadecuada para el scraping, ya que se identifica claramente como un script automatizado.

El primer paso es modificar el User-Agent. El User-Agent predeterminado de axios es una señal de alerta inmediata para cualquier sistema anti-bot. Para simular una solicitud de navegador legítima, se debe establecer una cabecera User-Agent que coincida con la de un navegador moderno. Este valor se puede obtener fácilmente desde las herramientas de desarrollador del navegador (accesibles con F12 o Ctrl+Shift+I) en la pestaña "Network", seleccionando una solicitud y buscando la cabecera User-Agent en la sección de cabeceras de la solicitud.13

Una característica aún más potente para replicar con precisión una solicitud del navegador es la función "Import cURL".13 El proceso es el siguiente:

1. Navegar a la página de resultados de búsqueda de Portal Inmobiliario en un navegador web.  
2. Abrir las Herramientas de Desarrollador y seleccionar la pestaña "Network".  
3. Recargar la página para capturar todas las solicitudes de red.  
4. Hacer clic derecho en la solicitud principal del documento (generalmente la primera en la lista).  
5. En el menú contextual, seleccionar "Copy" y luego "Copy as cURL".  
6. En n8n, agregar un nodo HTTP Request, hacer clic en "Import cURL" y pegar el contenido del portapapeles.

Esta acción configura automáticamente la URL, el método de solicitud, todas las cabeceras (incluyendo User-Agent, Accept-Language, etc.) y las cookies, creando una réplica casi perfecta de la solicitud inicial del navegador. Esto es invaluable para el reconocimiento inicial, aunque no resolverá el problema del contenido dinámico.

### **2.2. Dominando el Nodo HTML Extract con Selectores CSS**

Una vez que se obtiene el contenido HTML (incluso si es solo la plantilla inicial), el nodo HTML Extract es la herramienta principal de n8n para analizar este código y extraer puntos de datos específicos.32 La eficacia de este nodo depende completamente de la calidad y precisión de los selectores CSS proporcionados.

La identificación de selectores CSS robustos es una habilidad crítica para el web scraping. El proceso se realiza utilizando la función "Inspect Element" del navegador 30:

1. En la página web, hacer clic derecho sobre un elemento de interés (por ejemplo, el precio de una propiedad) y seleccionar "Inspect".  
2. Esto abrirá el panel de Herramientas de Desarrollador, resaltando el elemento HTML correspondiente en el árbol DOM.  
3. Analizar las etiquetas, clases (.class-name) e IDs (\#id-name) del elemento y de sus elementos padres.37 Se deben buscar nombres de clase semánticos y que parezcan estables (ej.  
   .ui-search-price\_\_part, .ui-search-item\_\_title) en lugar de clases ofuscadas o generadas dinámicamente (ej. .sc-1a2b3c, .css-xyz123), ya que estas últimas son propensas a cambiar y romper el scraper.27  
4. Para validar un selector, se puede utilizar la consola de las Herramientas de Desarrollador. Escribir $$('.nombre-de-la-clase') ejecutará el selector en la página actual y devolverá un array de todos los elementos que coinciden. Esto permite verificar rápidamente si el selector es lo suficientemente específico para el dato deseado pero lo suficientemente general para capturar todos los listados en la página.38

Una vez identificados los selectores, el nodo HTML Extract se configura con múltiples "Extraction Values" para capturar toda la información necesaria en un solo paso.32 Por ejemplo:

* **Para el título:**  
  * Key: title  
  * CSS Selector: .ui-search-item\_\_title  
  * Return Value: Text  
* **Para el precio:**  
  * Key: price  
  * CSS Selector: .andes-money-amount\_\_fraction  
  * Return Value: Text  
* **Para la ubicación:**  
  * Key: location  
  * CSS Selector: .ui-search-item\_\_location-body  
  * Return Value: Text  
* **Para la URL del listado:**  
  * Key: url  
  * CSS Selector: .ui-search-link  
  * Return Value: Attribute  
  * Attribute Name: href

### **2.3. Estructuración del Flujo de Trabajo Inicial para una Sola Página**

El flujo de trabajo básico para este análisis inicial es lineal y simple:

Start → HTTP Request (Obtener HTML) → HTML Extract (Extraer detalles) → End

Al ejecutar este flujo, el resultado esperado es que el nodo HTTP Request obtenga con éxito la plantilla de la página, pero el nodo HTML Extract no devuelva datos o devuelva datos incompletos, ya que la información de las propiedades no está presente en el HTML inicial. Sin embargo, este ejercicio no es inútil; confirma la naturaleza dinámica del sitio y valida que la lógica de los selectores CSS es correcta para cuando se obtenga el HTML completo a través de un método más avanzado. El resultado final del flujo, cuando funcione, será un objeto JSON limpio para cada listado, como: {"title": "Departamento en Las Condes", "price": "15000",...}.32

El proceso de identificar manualmente los selectores CSS, aunque fundamental, expone una debilidad clave del scraping: la fragilidad. El nodo HTML Extract depende de selectores fijos, y un rediseño menor del front-end por parte de Mercado Libre puede cambiar los nombres de las clases o la estructura del DOM, rompiendo el flujo de trabajo sin previo aviso.39 Las prácticas modernas de desarrollo web a menudo utilizan clases generadas dinámicamente que cambian con cada despliegue, lo que agrava este riesgo. Esta fragilidad inherente motiva la exploración de métodos de extracción más resilientes, como los extractores basados en IA que utilizan lenguaje natural (como se ve en ScrapingBee 40) o los extractores de JavaScript personalizables (como los que ofrece ScrapeNinja 13), que se discutirán en secciones posteriores. Este enfoque inicial con nodos nativos sirve para diagnosticar el problema de los selectores frágiles, que las estrategias avanzadas resolverán.

## **Sección 3: Técnicas Avanzadas para Contenido Dinámico y Paginación**

Habiendo establecido que una simple solicitud HTTP es insuficiente, esta sección aborda los dos principales desafíos técnicos: la carga de contenido dinámico y la navegación a través de la paginación. Se presentan dos métodos distintos para superar estos obstáculos, siendo el primero el técnicamente preferible si es factible.

### **3.1. Método 1: Ingeniería Inversa de APIs Internas (El Método Preferido)**

En lugar de intentar renderizar la página web completa en un navegador headless (un proceso que consume muchos recursos), un enfoque más eficiente es interceptar las solicitudes de fondo que la propia página realiza para obtener sus datos.3 A menudo, las aplicaciones de una sola página (SPA) se comunican con APIs internas que devuelven los datos en un formato estructurado y limpio, como JSON. Identificar y replicar estas llamadas a la API puede eliminar por completo la necesidad de analizar HTML.

El proceso para descubrir estas APIs internas es el siguiente:

1. Navegar a una página de resultados de búsqueda en Portal Inmobiliario.  
2. Abrir las Herramientas de Desarrollador del navegador y seleccionar la pestaña "Network".  
3. Aplicar un filtro para mostrar solo las solicitudes de tipo "Fetch/XHR". Estas son las solicitudes de datos asíncronas.  
4. Realizar una acción en la página que cargue nuevos datos, como hacer scroll o hacer clic en el botón de la página siguiente.  
5. Observar las nuevas solicitudes que aparecen en la pestaña "Network". Inspeccionar las respuestas de estas solicitudes hasta encontrar una que contenga un array de objetos JSON con los datos de las propiedades.  
6. Una vez identificada la solicitud correcta, hacer clic derecho sobre ella y seleccionar "Copy" \> "Copy as cURL".  
7. En n8n, importar este comando cURL en un nuevo nodo HTTP Request.3

Este nodo HTTP Request ahora se convierte en la fuente de datos principal. La respuesta ya estará en formato JSON estructurado, lo que hace innecesario el uso del nodo HTML Extract. Este método es significativamente más rápido y eficiente que el renderizado completo de la página.

### **3.2. Método 2: Implementación de Bucles de Paginación Robustos**

Independientemente de si los datos se obtienen de una API interna o mediante el scraping de la página completa, es necesario iterar a través de todas las páginas de resultados. n8n ofrece mecanismos para manejar la paginación, ya sea de forma nativa o mediante la construcción de un bucle manual.

#### **3.2.1. Paginación Integrada (Para Comportamiento Similar a una API)**

Si la API interna descubierta en el método anterior utiliza un mecanismo de paginación estándar, se puede aprovechar la función de paginación incorporada del nodo HTTP Request.8

* **Modo "Response Contains Next URL":** Si la respuesta de la API incluye una URL directa a la siguiente página de resultados (por ejemplo, en un campo pagination.next\_url), se puede configurar el nodo para que utilice esta URL. La expresión en el campo "Next URL" sería algo como {{ $response.body.pagination.next\_url }}.  
* **Modo "Update a Parameter in Each Request":** Si la API utiliza un parámetro de consulta para el número de página (por ejemplo, ?page=2), se puede usar la variable interna $pageCount de n8n. $pageCount es un contador de las páginas obtenidas que comienza en cero. Si la API numera las páginas a partir de 1, la expresión para el valor del parámetro de página sería {{ $pageCount \+ 1 }}.9

#### **3.2.2. Bucle Manual (Para Paginación Basada en Parámetros de URL)**

Si la función de paginación integrada no es adecuada, o si se está haciendo scraping de URLs donde el número de página es simplemente un parámetro, se puede construir un bucle manual. Este es un patrón de diseño común y robusto en n8n.

El flujo de trabajo es el siguiente:  
Start → Set (Inicializar page=1) → HTTP Request (Obtener página) → IF (¿Existen resultados?)

* **Rama Verdadera (True):** Procesar Datos → Set (Incrementar page) → \*\*  
* **Rama Falsa (False):** Merge Data (Opcional) → End

Este patrón utiliza un nodo Set para inicializar y mantener el número de página actual. El nodo HTTP Request utiliza este número para construir la URL de la página a solicitar. Un nodo IF evalúa la respuesta; si contiene datos, el flujo continúa hacia otro nodo Set que incrementa el contador de página y luego se conecta de nuevo al HTTP Request, creando el bucle. Si la respuesta está vacía, significa que se ha llegado al final de los resultados, y el flujo sale del bucle a través de la rama falsa del nodo IF.14

### **3.3. Tabla Comparativa de Métodos de Manejo de Contenido Dinámico**

La elección entre la ingeniería inversa de la API y el renderizado con un navegador headless (que se detalla en la siguiente sección) implica un compromiso fundamental entre eficiencia y robustez. La siguiente tabla resume estas compensaciones para facilitar una decisión informada.

| Característica | Método 1: Ingeniería Inversa de API Interna | Método 2: Renderizado con Navegador Headless (Servicio de Terceros) |
| :---- | :---- | :---- |
| **Cómo Funciona** | Intercepta y replica las llamadas XHR/AJAX que la página utiliza para obtener datos JSON estructurados. | Utiliza un navegador real (sin interfaz gráfica) para cargar y ejecutar todo el JavaScript de la página, devolviendo el HTML final renderizado. |
| **Pros** | \- Extremadamente rápido y eficiente. \- Consume un mínimo de ancho de banda y recursos. \- Devuelve datos limpios y estructurados (JSON), eliminando la necesidad de análisis de HTML. \- Menos propenso a activar defensas anti-bot básicas. | \- Altamente robusto y resistente a cambios en el backend. \- Simula el comportamiento real del usuario, interactuando con la versión final de la página. \- Capaz de manejar cualquier tipo de lógica de JavaScript, sin importar su complejidad. |
| **Contras** | \- Muy frágil; las APIs internas no están documentadas y pueden cambiar o ser eliminadas sin previo aviso. \- Requiere un análisis técnico más profundo para identificar los endpoints y parámetros correctos. \- Puede romperse por completo si el sitio web realiza una refactorización importante del front-end. | \- Lento y consume muchos más recursos (CPU, memoria, ancho de banda). \- Generalmente más costoso debido a la infraestructura requerida. \- Aún requiere el análisis de HTML (selectores CSS) para extraer los datos del HTML renderizado. |
| **Ideal Para...** | Proyectos que requieren alta velocidad y eficiencia, donde el desarrollador está dispuesto a asumir un mayor riesgo de mantenimiento. Extracciones de datos a gran escala donde el costo por solicitud es crítico. | Proyectos que priorizan la estabilidad y la fiabilidad a largo plazo sobre la velocidad. Sitios web extremadamente complejos donde la lógica de la API interna es difícil o imposible de descifrar. |

La ingeniería inversa de la API interna es técnicamente superior en términos de rendimiento. Una solicitud de API descarga solo los datos brutos, mientras que un navegador headless debe descargar y procesar HTML, CSS, JavaScript, fuentes e imágenes, un proceso órdenes de magnitud más lento y costoso.47 Sin embargo, esta eficiencia tiene un costo en fragilidad. Dado que la API no es pública, no hay garantía de estabilidad. Un rediseño del sitio podría llevar a una reestructuración completa de la API interna, rompiendo el flujo de trabajo de manera irreparable. La elección depende de la tolerancia del proyecto al mantenimiento frente a sus requisitos de rendimiento.

## **Sección 4: Fortalecimiento del Scraper Contra Detección y Bloqueos**

Habiendo establecido las limitaciones de los nodos nativos de n8n para un objetivo tan sofisticado, esta sección detalla la solución de nivel de producción. Esta implica la integración de infraestructura externa especializada para construir un scraper que sea resiliente, escalable y capaz de eludir las defensas avanzadas de Portal Inmobiliario.

### **4.1. El Imperativo de los Servicios de Scraping de Terceros**

El problema central es que n8n, por sí mismo, no puede resolver los desafíos fundamentales del scraping moderno: la huella digital TLS, la rotación de proxies a gran escala y el renderizado de JavaScript del lado del cliente.13 Intentar replicar esta funcionalidad dentro de n8n sería impráctico y, en última instancia, ineficaz.

La solución estratégica es delegar la fase de "solicitud" del flujo de trabajo a un servicio de terceros especializado. El flujo de trabajo se transforma: en lugar de que n8n realice la solicitud directamente al sitio objetivo, n8n orquesta una llamada a una API de scraping. El flujo se convierte en: n8n (Orquestación) → API de Terceros (Solicitud, Renderizado y Evasión) → Sitio Web Objetivo. El rol de n8n cambia de ser el scraper a ser el cerebro que dirige un servicio de scraping profesional, procesando los datos limpios que este le devuelve.48

### **4.2. Análisis Profundo: Integración de Servicios Especializados**

Existen varios servicios de scraping de nivel empresarial, cada uno con diferentes métodos de integración y características.

* **ScrapeNinja (Enfoque de Nodo Comunitario):** Este servicio es particularmente relevante porque ofrece un nodo comunitario dedicado para n8n (n8n-nodes-scrapeninja), lo que simplifica enormemente la integración.13 Sus características abordan directamente los problemas identificados:  
  * **Características Clave:** Ofrece explícitamente una huella digital TLS similar a la de Chrome, rotación automática de proxies y renderizado de JavaScript, que son las soluciones exactas necesarias para eludir las defensas de Portal Inmobiliario.13 También incluye funcionalidades adicionales como la limpieza de HTML y una herramienta asistida por IA para generar extractores de datos.41  
  * **Implementación:** La implementación implica instalar el nodo comunitario en la instancia de n8n (disponible para versiones autoalojadas), y luego configurar el nodo ScrapeNinja con una clave de API, reemplazando el nodo HTTP Request estándar en el flujo de trabajo.  
* **Apify, ScrapingBee, Crawlbase (Enfoque API-First):** Estas son plataformas robustas que proporcionan scraping como un servicio a través de una API REST.40  
  * **Características Clave:** Proporcionan navegadores headless, proxies residenciales de alta calidad y gestionan de forma transparente los bloqueos y los CAPTCHAs. Muchas de estas plataformas ofrecen "actores" o scrapers preconstruidos para sitios importantes, lo que podría incluir a Mercado Libre, simplificando aún más el proceso.2  
  * **Implementación:** La integración se realiza utilizando el nodo HTTP Request estándar de n8n para llamar al endpoint de la API del servicio. La solicitud a la API incluiría la URL objetivo (ej. https://www.portalinmobiliario.com/...) y la clave de API como parámetros. Por ejemplo, una llamada a ScrapingBee se dirigiría a https://app.scrapingbee.com/api/v1/ con los parámetros apropiados.40

### **4.3. Implementación de Límites de Tasa y Retardos**

Incluso cuando se utilizan proxies rotativos, es una práctica crucial y ética evitar sobrecargar el servidor del sitio objetivo. Un bombardeo de solicitudes, incluso desde diferentes IPs, puede ser detectado como un ataque de denegación de servicio y desencadenar defensas más agresivas.5

Para implementar una limitación de tasa en n8n, se debe insertar un nodo Wait dentro de cualquier bucle de paginación. Este nodo pausará la ejecución del flujo de trabajo durante un período de tiempo especificado (por ejemplo, entre 1 y 3 segundos) entre cada solicitud de página. El uso de un retardo aleatorio dentro de este rango puede simular de manera más efectiva el comportamiento humano, reduciendo aún más la probabilidad de detección.8

### **4.4. Tabla Comparativa de Servicios de Scraping Recomendados**

La elección de un servicio de terceros es una decisión crítica. La siguiente tabla compara varias opciones populares para ayudar a seleccionar la más adecuada según las necesidades del proyecto.

| Servicio | Método de Integración en n8n | Características Clave | Modelo de Precios | Ideal Para... |
| :---- | :---- | :---- | :---- | :---- |
| **ScrapeNinja** | Nodo Comunitario (n8n-nodes-scrapeninja) | \- Huella digital TLS de Chrome \- Renderizado de JS \- Rotación de proxies \- Extractor de JS con Cheerio \- Asistente de IA para extractores | Basado en créditos, con un generoso plan gratuito. | Usuarios de n8n autoalojado que buscan una integración profunda y herramientas de extracción avanzadas directamente dentro del ecosistema de n8n. |
| **Apify** | Nodo HTTP Request a la API de Apify | \- Plataforma de "Actores" (scrapers preconstruidos y personalizados) \- Proxies residenciales y de centro de datos \- Almacenamiento de datos integrado \- Programación de ejecuciones | Basado en el uso de la plataforma (cómputo, proxies, almacenamiento), con un plan gratuito. | Proyectos complejos que pueden beneficiarse de scrapers preconstruidos o que requieren una infraestructura de scraping completa, incluyendo almacenamiento y gestión de ejecuciones. |
| **ScrapingBee** | Nodo HTTP Request a la API de ScrapingBee | \- Renderizado de JS \- Rotación de proxies premium \- Extracción de datos basada en IA con lenguaje natural \- Capturas de pantalla | Basado en créditos de API, con un plan gratuito. | Flujos de trabajo que buscan simplificar la extracción de datos utilizando prompts de lenguaje natural en lugar de selectores CSS, y para aquellos que necesitan una API simple y directa. |
| **Crawlbase / ZenRows / Oxylabs** | Nodo HTTP Request a sus respectivas APIs | \- Grandes pools de proxies (residenciales y móviles) \- Evasión de CAPTCHA \- Renderizado de JS \- APIs especializadas para e-commerce | Basado en el volumen de solicitudes exitosas, con diferentes precios para JS renderizado y proxies residenciales. | Extracciones a gran escala que requieren una alta tasa de éxito y acceso a pools de proxies masivos y geográficamente diversos para evitar bloqueos a toda costa. |

El enfoque más efectivo para el scraping web con plataformas de bajo código como n8n es un modelo híbrido. n8n sobresale en la lógica de flujo de trabajo, la orquestación de tareas y la transformación de datos.14 Sin embargo, el trabajo especializado de realizar solicitudes HTTP indetectables, renderizar JavaScript complejo y navegar por redes de proxies es mejor externalizarlo a un microservicio o API dedicado.16 En esta arquitectura, n8n actúa como el "cerebro" que dirige de manera inteligente a estos servicios "musculares" especializados. El usuario no está simplemente construyendo un scraper, sino integrando un servicio de scraping profesional en un flujo de trabajo de automatización más amplio.

## **Sección 5: Procesamiento de Datos, Almacenamiento y Marco Ético**

La extracción exitosa de los datos brutos es solo la mitad del proceso. Para que los datos sean útiles, deben ser limpiados, estructurados, almacenados adecuadamente y todo el proceso debe llevarse a cabo dentro de un marco ético y legal responsable.

### **5.1. Manejo de Datos Post-Extracción**

Los datos extraídos de una página web rara vez están en un formato listo para el análisis. A menudo contienen caracteres no deseados, formatos inconsistentes o información combinada que necesita ser separada.

* **Limpieza de Datos:** El nodo Code de n8n es una herramienta poderosa para realizar transformaciones de datos personalizadas utilizando JavaScript. Se puede utilizar para:  
  * Convertir cadenas de precios (ej. "$15.000.000") en valores numéricos eliminando símbolos de moneda y separadores de miles.  
  * Dividir una cadena de ubicación completa en sus componentes (calle, comuna, ciudad) utilizando métodos de cadena como .split().  
  * Eliminar espacios en blanco al principio y al final de las cadenas de texto con .trim() para estandarizar los datos.39  
* **Validación de Datos:** Es crucial asegurarse de que los campos de datos críticos (como el precio o la URL) no estén vacíos o mal formados. Se puede usar un nodo IF después del paso de extracción para verificar la existencia y el formato de estos campos. Los elementos que no pasen la validación pueden ser desviados a una rama de manejo de errores, donde se pueden registrar para una revisión manual o intentar un nuevo procesamiento, asegurando la integridad del conjunto de datos final.13

### **5.2. Flujo de Trabajo para la Persistencia de Datos**

Una vez que los datos están limpios y validados, el paso final es almacenarlos en un destino persistente para su uso futuro. n8n ofrece nodos de integración para una amplia variedad de destinos.

* **Google Sheets:** Para conjuntos de datos más pequeños o para una visualización y colaboración rápidas, el nodo Google Sheets se puede utilizar para agregar cada propiedad extraída como una nueva fila en una hoja de cálculo.  
* **Base de Datos (PostgreSQL, MySQL, etc.):** Para aplicaciones a gran escala, una base de datos relacional es la solución más adecuada. El nodo Postgres (o el correspondiente a otra base de datos) permite insertar los datos estructurados en una tabla, lo que facilita consultas complejas y un almacenamiento eficiente.32  
* **Archivo CSV:** Para una portabilidad simple, el nodo Convert to File se puede configurar para convertir la salida JSON en un archivo CSV. Este archivo puede ser descargado, enviado por correo electrónico o transferido a otro sistema de almacenamiento de archivos.32

### **5.3. Marco Legal y Ético**

Realizar web scraping conlleva responsabilidades. Operar sin tener en cuenta las reglas y la ética puede tener consecuencias que van desde el bloqueo de la IP hasta acciones legales.

* **Términos de Servicio:** Es fundamental revisar los Términos de Servicio de Portal Inmobiliario y Mercado Libre. La mayoría de los grandes sitios web prohíben explícita o implícitamente la extracción de datos automatizada. Varias fuentes advierten que el scraping de sitios inmobiliarios puede violar sus términos de servicio.5 Por ejemplo, un sitio similar como Rightmove prohíbe explícitamente el scraping de su contenido.59 Proceder con el scraping se hace bajo el propio riesgo del usuario.  
* **Robots.txt:** El archivo robots.txt (accesible en https://www.portalinmobiliario.com/robots.txt) es un estándar de exclusión de robots. Proporciona directivas a los bots sobre qué partes del sitio no deben ser rastreadas. Aunque no es legalmente vinculante, ignorar este archivo se considera una mala práctica y una falta de ética en la comunidad de scraping.5  
* **Privacidad de los Datos:** Aunque los datos de los listados son públicos, se debe tener cuidado con el uso de cualquier información de identificación personal de los vendedores. El enfoque de la extracción debe estar en los datos de la propiedad (precio, características, ubicación) y no en la recopilación de información personal.18  
* **Limitación de Tasa:** Como se mencionó anteriormente, ser un "buen ciudadano" de la web es crucial. Esto implica no sobrecargar los servidores del sitio. La implementación de retardos adecuados entre solicitudes no es solo una técnica para evitar bloqueos, sino también una consideración ética fundamental.13

## **Sección 6: Síntesis y Recomendaciones Finales**

Este informe ha analizado en profundidad los desafíos y soluciones para la extracción de datos de Portal Inmobiliario utilizando n8n. La estrategia exitosa requiere una comprensión de las defensas del sitio, el uso de herramientas especializadas y un enfoque en la robustez y la ética. Esta sección final sintetiza el análisis en un marco de decisión claro y propone una arquitectura de flujo de trabajo de producción.

### **6.1. Matriz de Decisión para la Estrategia de Scraping**

La elección del método de extracción de datos depende del estado actual de las herramientas y de los requisitos específicos del proyecto. La siguiente matriz proporciona una guía para seleccionar el enfoque más apropiado:

* **Si el error de la API de n8n se resuelve:**  
  * **Acción Recomendada:** Migrar inmediatamente al uso de la **API oficial de Mercado Libre**.  
  * **Justificación:** Es el método más estable, fiable y legítimo. Proporciona datos estructurados directamente y está sancionado por la plataforma, eliminando los riesgos y la fragilidad asociados con el scraping.26  
* **Para una tarea rápida, a pequeña escala o de una sola vez:**  
  * **Acción Recomendada:** Considerar el método de **ingeniería inversa de la API interna** (Sección 3.1).  
  * **Justificación:** Es extremadamente rápido y eficiente en recursos. Sin embargo, conlleva un alto riesgo de mantenimiento, ya que las APIs internas pueden cambiar sin previo aviso, rompiendo el flujo de trabajo.3  
* **Para cualquier recopilación de datos fiable, escalable o a largo plazo (el escenario actual):**  
  * **Acción Recomendada:** Utilizar un **servicio de scraping de terceros** (Sección 4).  
  * **Justificación:** Esta es la única solución de nivel de producción que aborda de manera fiable todos los desafíos: contenido dinámico, huellas digitales TLS, rotación de proxies y CAPTCHAs. Aunque implica un costo, garantiza una alta tasa de éxito y reduce drásticamente la carga de mantenimiento.13

### **6.2. Flujo de Trabajo Propuesto para Producción**

Basado en el análisis exhaustivo, la siguiente arquitectura representa el flujo de trabajo más robusto y recomendable para la extracción de datos de Portal Inmobiliario en el entorno actual.

**Diagrama de Arquitectura Final:**

Disparador (Manual/Programado) → Set (Inicializar Paginación) → Bucle Manual → HTTP Request (Llamada a API de ScrapeNinja/Apify) → Wait (Limitación de Tasa) → IF (¿Existen Datos?) → Code (Limpiar y Transformar Datos) → Nodo de Destino (Google Sheets/Postgres)

**Justificación de la Arquitectura:**

Este diseño de flujo de trabajo se recomienda por las siguientes razones:

* **Resiliente:** Delega las tareas más complejas y propensas a fallos del scraping (renderizado de JS, evasión de anti-bots) a un servicio externo especializado, cuya única función es superar estos obstáculos.  
* **Escalable:** El patrón de bucle manual, combinado con un servicio de terceros, puede manejar eficientemente la paginación y procesar grandes volúmenes de datos sin agotar los recursos de la instancia de n8n.  
* **Responsable:** La inclusión explícita de un nodo Wait para la limitación de tasa asegura que el proceso de scraping no cause un impacto negativo en la infraestructura del sitio objetivo.  
* **Mantenible:** La lógica está claramente compartimentada. La obtención de datos, la limpieza y el almacenamiento son pasos distintos. Si la fuente de datos cambia en el futuro (por ejemplo, cuando se solucione el error de la API de n8n), solo será necesario reconfigurar el nodo HTTP Request para que apunte a la API oficial. El resto de la lógica de procesamiento y almacenamiento de datos permanecerá intacta, lo que demuestra un diseño modular y preparado para el futuro, abordando directamente la naturaleza táctica de la solución de scraping.

#### **Obras citadas**

1. LLMOps in Production: 457 Case Studies of What Actually Works \- ZenML Blog, fecha de acceso: septiembre 29, 2025, [https://www.zenml.io/blog/llmops-in-production-457-case-studies-of-what-actually-works](https://www.zenml.io/blog/llmops-in-production-457-case-studies-of-what-actually-works)  
2. Portal Inmobiliario Property Search Scraper · Apify, fecha de acceso: septiembre 29, 2025, [https://apify.com/ecomscrape/portalinmobiliario-property-search-scraper](https://apify.com/ecomscrape/portalinmobiliario-property-search-scraper)  
3. HTTP Extract \- Dynamic Content \- Questions \- n8n Community, fecha de acceso: septiembre 29, 2025, [https://community.n8n.io/t/http-extract-dynamic-content/88668](https://community.n8n.io/t/http-extract-dynamic-content/88668)  
4. Scraping Dynamic Website Which uses AJAX to Load Content \- Questions \- n8n Community, fecha de acceso: septiembre 29, 2025, [https://community.n8n.io/t/scraping-dynamic-website-which-uses-ajax-to-load-content/141580](https://community.n8n.io/t/scraping-dynamic-website-which-uses-ajax-to-load-content/141580)  
5. Elevate Your E-commerce Game: MercadoLibre Data Scraping Unleashed \- Alnusoft, fecha de acceso: septiembre 29, 2025, [https://www.alnusoft.com/mercadolibre-data-scraping/](https://www.alnusoft.com/mercadolibre-data-scraping/)  
6. Tracking Hurricane Humberto and soon-to-be Imelda in the tropics, fecha de acceso: septiembre 29, 2025, [https://selflovebeautysalon.nl/annonce/ag835076-490979375](https://selflovebeautysalon.nl/annonce/ag835076-490979375)  
7. Scrape and store data from multiple website pages | n8n workflow template, fecha de acceso: septiembre 29, 2025, [https://n8n.io/workflows/1073-scrape-and-store-data-from-multiple-website-pages/](https://n8n.io/workflows/1073-scrape-and-store-data-from-multiple-website-pages/)  
8. Handle pagination in HTTP Requests | n8n workflow template, fecha de acceso: septiembre 29, 2025, [https://n8n.io/workflows/1169-handle-pagination-in-http-requests/](https://n8n.io/workflows/1169-handle-pagination-in-http-requests/)  
9. Pagination \- n8n Docs, fecha de acceso: septiembre 29, 2025, [https://docs.n8n.io/code/cookbook/http-node/pagination/](https://docs.n8n.io/code/cookbook/http-node/pagination/)  
10. Pagination Best Practices for Google | Google Search Central | Documentation, fecha de acceso: septiembre 29, 2025, [https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)  
11. Pagination and SEO: A Complete Guide to Best Practices \- Semrush, fecha de acceso: septiembre 29, 2025, [https://www.semrush.com/blog/pagination-seo/](https://www.semrush.com/blog/pagination-seo/)  
12. What Is Pagination in SEO and Best Practices \- SE Ranking, fecha de acceso: septiembre 29, 2025, [https://seranking.com/blog/pagination/](https://seranking.com/blog/pagination/)  
13. Web scraping in n8n, fecha de acceso: septiembre 29, 2025, [https://pixeljets.com/blog/web-scraping-in-n8n/](https://pixeljets.com/blog/web-scraping-in-n8n/)  
14. N8N HTTP Request \- Reddit, fecha de acceso: septiembre 29, 2025, [https://www.reddit.com/r/n8n/comments/1jmusqb/n8n\_http\_request/](https://www.reddit.com/r/n8n/comments/1jmusqb/n8n_http_request/)  
15. Bypassing anti-scraping measures: questions and concerns : r/learnpython \- Reddit, fecha de acceso: septiembre 29, 2025, [https://www.reddit.com/r/learnpython/comments/hwx28y/bypassing\_antiscraping\_measures\_questions\_and/](https://www.reddit.com/r/learnpython/comments/hwx28y/bypassing_antiscraping_measures_questions_and/)  
16. Best Mercadolibre Scraper \- ZenRows, fecha de acceso: septiembre 29, 2025, [https://www.zenrows.com/products/scraper-api/ecommerce/mercadolibre](https://www.zenrows.com/products/scraper-api/ecommerce/mercadolibre)  
17. Mercadolibre Scraper API \- Free Trial \- Oxylabs, fecha de acceso: septiembre 29, 2025, [https://oxylabs.io/products/scraper-api/ecommerce/mercadolibre](https://oxylabs.io/products/scraper-api/ecommerce/mercadolibre)  
18. How to Bypass Cloudflare When Web Scraping in 2025 \- Scrapfly, fecha de acceso: septiembre 29, 2025, [https://scrapfly.io/blog/posts/how-to-bypass-cloudflare-anti-scraping](https://scrapfly.io/blog/posts/how-to-bypass-cloudflare-anti-scraping)  
19. Brand Protection Program \- Mercado Libre United States of America, fecha de acceso: septiembre 29, 2025, [https://global-selling.mercadolibre.com/brandprotection/enforcement](https://global-selling.mercadolibre.com/brandprotection/enforcement)  
20. API Docs \- Developers \- Mercado Libre, fecha de acceso: septiembre 29, 2025, [https://developers.mercadolibre.com.ar/en\_us/api-docs](https://developers.mercadolibre.com.ar/en_us/api-docs)  
21. API Docs \- Developers, fecha de acceso: septiembre 29, 2025, [https://global-selling.mercadolibre.com/devsite/api-docs](https://global-selling.mercadolibre.com/devsite/api-docs)  
22. Mercadolibre API \- PublicAPI, fecha de acceso: septiembre 29, 2025, [https://publicapi.dev/mercadolibre-api](https://publicapi.dev/mercadolibre-api)  
23. Developers \- Mercado Libre International Selling, fecha de acceso: septiembre 29, 2025, [https://global-selling.mercadolibre.com/devsite](https://global-selling.mercadolibre.com/devsite)  
24. Mercado Libre API Connector \- MovingLake Documentation, fecha de acceso: septiembre 29, 2025, [https://movinglake.com/docs/connectors/mercado-libre/](https://movinglake.com/docs/connectors/mercado-libre/)  
25. API Docs \- Developers \- Mercado Libre, fecha de acceso: septiembre 29, 2025, [https://developers.mercadolibre.cl/es\_ar/api-docs-es](https://developers.mercadolibre.cl/es_ar/api-docs-es)  
26. Bug Report: OAuth2 PKCE flow ignores client\_secret in final token exchange · Issue \#14497, fecha de acceso: septiembre 29, 2025, [https://github.com/n8n-io/n8n/issues/14497](https://github.com/n8n-io/n8n/issues/14497)  
27. Extract an text element from an HTTP request using set or HTML extract \- n8n Community, fecha de acceso: septiembre 29, 2025, [https://community.n8n.io/t/extract-an-text-element-from-an-http-request-using-set-or-html-extract/23028](https://community.n8n.io/t/extract-an-text-element-from-an-http-request-using-set-or-html-extract/23028)  
28. Examples using n8n's HTTP Request node \- n8n Docs, fecha de acceso: septiembre 29, 2025, [https://docs.n8n.io/code/cookbook/http-node/](https://docs.n8n.io/code/cookbook/http-node/)  
29. HTTP Request integrations | Workflow automation with n8n, fecha de acceso: septiembre 29, 2025, [https://n8n.io/integrations/http-request/](https://n8n.io/integrations/http-request/)  
30. How to Use Inspect Element for Web Scraping \- Proxyway, fecha de acceso: septiembre 29, 2025, [https://proxyway.com/guides/how-to-inspect-element](https://proxyway.com/guides/how-to-inspect-element)  
31. Ultimate Guide to the HTTP Request Node in n8n (NO CODE) \- YouTube, fecha de acceso: septiembre 29, 2025, [https://www.youtube.com/watch?v=hkLaTtE0PSU](https://www.youtube.com/watch?v=hkLaTtE0PSU)  
32. How to scrape data from a website (JavaScript vs low-code) – n8n ..., fecha de acceso: septiembre 29, 2025, [https://blog.n8n.io/how-to-scrape-data-from-a-website/](https://blog.n8n.io/how-to-scrape-data-from-a-website/)  
33. HTML \- n8n Docs, fecha de acceso: septiembre 29, 2025, [https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.html/](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.html/)  
34. ubc-library-rc.github.io, fecha de acceso: septiembre 29, 2025, [https://ubc-library-rc.github.io/intro-web-scraping/content/understanding-a-website.html\#:\~:text=Most%20browsers%20have%20built%2Din,is%20represented%20in%20the%20HTML.](https://ubc-library-rc.github.io/intro-web-scraping/content/understanding-a-website.html#:~:text=Most%20browsers%20have%20built%2Din,is%20represented%20in%20the%20HTML.)  
35. Using your browser's Developer Tools for scraping \- Scrapy Docs, fecha de acceso: septiembre 29, 2025, [https://docs.scrapy.org/en/latest/topics/developer-tools.html](https://docs.scrapy.org/en/latest/topics/developer-tools.html)  
36. Scraping a Web Page Part 1- Inspecting the HTML \- The Data School, fecha de acceso: septiembre 29, 2025, [https://www.thedataschool.co.uk/conrad-wilson/scraping-a-web-page-part-1-inspecting-the-html/](https://www.thedataschool.co.uk/conrad-wilson/scraping-a-web-page-part-1-inspecting-the-html/)  
37. CSS Selectors Cheat Sheet for Web Scraping: Master HTML Parsing in 2025 \- ScraperAPI, fecha de acceso: septiembre 29, 2025, [https://www.scraperapi.com/blog/css-selectors-cheat-sheet/](https://www.scraperapi.com/blog/css-selectors-cheat-sheet/)  
38. A Guide to CSS Selectors for Web Scraping \- DataGrab, fecha de acceso: septiembre 29, 2025, [https://datagrab.io/blog/guide-to-css-selectors-for-web-scraping](https://datagrab.io/blog/guide-to-css-selectors-for-web-scraping)  
39. How to parse HTML in n8n's Code node (or Node.js in general)? Looking for better alternatives too : r/n8n \- Reddit, fecha de acceso: septiembre 29, 2025, [https://www.reddit.com/r/n8n/comments/1lxezsr/how\_to\_parse\_html\_in\_n8ns\_code\_node\_or\_nodejs\_in/](https://www.reddit.com/r/n8n/comments/1lxezsr/how_to_parse_html_in_n8ns_code_node_or_nodejs_in/)  
40. N8N No-Code Web Scraping Made Simple with AI-Powered Data Extraction | ScrapingBee, fecha de acceso: septiembre 29, 2025, [https://www.scrapingbee.com/blog/n8n-no-code-web-scraping/](https://www.scrapingbee.com/blog/n8n-no-code-web-scraping/)  
41. Web scraping: extracting primary text content from any HTML page : r/n8n \- Reddit, fecha de acceso: septiembre 29, 2025, [https://www.reddit.com/r/n8n/comments/1icrbdo/web\_scraping\_extracting\_primary\_text\_content\_from/](https://www.reddit.com/r/n8n/comments/1icrbdo/web_scraping_extracting_primary_text_content_from/)  
42. How can I make pagination loop in n8n? \- Reddit, fecha de acceso: septiembre 29, 2025, [https://www.reddit.com/r/n8n/comments/1j43mrs/how\_can\_i\_make\_pagination\_loop\_in\_n8n/](https://www.reddit.com/r/n8n/comments/1j43mrs/how_can_i_make_pagination_loop_in_n8n/)  
43. Pagination Loop HELP \- Questions \- n8n Community, fecha de acceso: septiembre 29, 2025, [https://community.n8n.io/t/pagination-loop-help/79030](https://community.n8n.io/t/pagination-loop-help/79030)  
44. How to Create a Loop to Get All Records from an API that Paginates Without a Cursor, fecha de acceso: septiembre 29, 2025, [https://community.n8n.io/t/how-to-create-a-loop-to-get-all-records-from-an-api-that-paginates-without-a-cursor/21628](https://community.n8n.io/t/how-to-create-a-loop-to-get-all-records-from-an-api-that-paginates-without-a-cursor/21628)  
45. How to paginate through data in HTTP requests? \- Questions \- n8n Community, fecha de acceso: septiembre 29, 2025, [https://community.n8n.io/t/how-to-paginate-through-data-in-http-requests/28103](https://community.n8n.io/t/how-to-paginate-through-data-in-http-requests/28103)  
46. Pagination looping and the IF node \- Questions \- n8n Community, fecha de acceso: septiembre 29, 2025, [https://community.n8n.io/t/pagination-looping-and-the-if-node/29742](https://community.n8n.io/t/pagination-looping-and-the-if-node/29742)  
47. What's the best way to scrape dynamic website data using n8n? · AI Automation Society, fecha de acceso: septiembre 29, 2025, [https://www.skool.com/ai-automation-society/whats-the-best-way-to-scrape-dynamic-website-data-using-n8n](https://www.skool.com/ai-automation-society/whats-the-best-way-to-scrape-dynamic-website-data-using-n8n)  
48. Web scraping in n8n \- Reddit, fecha de acceso: septiembre 29, 2025, [https://www.reddit.com/r/n8n/comments/1i9r6si/web\_scraping\_in\_n8n/](https://www.reddit.com/r/n8n/comments/1i9r6si/web_scraping_in_n8n/)  
49. The Simplest Way to Automate Scraping Anything with No Code (Apify \+ n8n tutorial), fecha de acceso: septiembre 29, 2025, [https://www.youtube.com/watch?v=gZ\_RLC25gCw](https://www.youtube.com/watch?v=gZ_RLC25gCw)  
50. The 9 Best Ways to Scrape Any Website in N8N \- YouTube, fecha de acceso: septiembre 29, 2025, [https://www.youtube.com/watch?v=y-eEbmNeFZo](https://www.youtube.com/watch?v=y-eEbmNeFZo)  
51. Portal Inmobiliario Property Search Scraper API \- Apify, fecha de acceso: septiembre 29, 2025, [https://apify.com/ecomscrape/portalinmobiliario-property-search-scraper/api](https://apify.com/ecomscrape/portalinmobiliario-property-search-scraper/api)  
52. Mercadolibre Scraper (español castellano) \- Apify, fecha de acceso: septiembre 29, 2025, [https://apify.com/karamelo/mercadolibre-scraper-espanol-castellano](https://apify.com/karamelo/mercadolibre-scraper-espanol-castellano)  
53. Mercado Libre \[DEPRECATED\] \- Apify, fecha de acceso: septiembre 29, 2025, [https://apify.com/lucas\_rodrigues/apify-meli](https://apify.com/lucas_rodrigues/apify-meli)  
54. Mercado Libre Scraper \- Apify, fecha de acceso: septiembre 29, 2025, [https://apify.com/trudax/mercadolibre-scraper](https://apify.com/trudax/mercadolibre-scraper)  
55. Is web scraping e-commerce legal? : r/programare \- Reddit, fecha de acceso: septiembre 29, 2025, [https://www.reddit.com/r/programare/comments/1ivotoz/scrapper\_pe\_ecommerce\_este\_legal/?tl=en](https://www.reddit.com/r/programare/comments/1ivotoz/scrapper_pe_ecommerce_este_legal/?tl=en)  
56. Essential Multipage Website Scraper with Jina.ai | n8n workflow template, fecha de acceso: septiembre 29, 2025, [https://n8n.io/workflows/2957-essential-multipage-website-scraper-with-jinaai/](https://n8n.io/workflows/2957-essential-multipage-website-scraper-with-jinaai/)  
57. N8N No-Code Web Scraping Made Simple with AI-Powered Data Extraction \- Medium, fecha de acceso: septiembre 29, 2025, [https://medium.com/@datajournal/n8n-no-code-web-scraping-17c0570801ef](https://medium.com/@datajournal/n8n-no-code-web-scraping-17c0570801ef)  
58. Web Scraping Portal Inmobiliario API \- Real Data API, fecha de acceso: septiembre 29, 2025, [https://www.realdataapi.com/portal-inmobiliario-real-estate-data-scraping.php](https://www.realdataapi.com/portal-inmobiliario-real-estate-data-scraping.php)  
59. Find Overseas Property For Sale \- Rightmove, fecha de acceso: septiembre 29, 2025, [https://www.rightmove.co.uk/overseas-property.html](https://www.rightmove.co.uk/overseas-property.html)