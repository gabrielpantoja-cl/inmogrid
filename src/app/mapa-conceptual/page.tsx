'use client'

import { useEffect } from 'react'

const css = `
  .map-page {
    font-family: 'Segoe UI', system-ui, sans-serif;
    background: #0a0a10;
    color: #e8e8f0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 20px 60px;
  }
  .map-page h1 {
    font-size: 1.6rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 4px;
    letter-spacing: -.02em;
  }
  .map-page .subtitle {
    color: #555;
    font-size: 0.82rem;
    margin-bottom: 48px;
  }
  .map-wrap {
    width: 100%;
    max-width: 1000px;
    position: relative;
  }
  svg.map {
    width: 100%;
    height: auto;
    overflow: visible;
  }
  .legend {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 32px;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 0.75rem;
    color: #999;
  }
  .legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    flex-shrink: 0;
  }
  .map-tooltip {
    position: fixed;
    background: #1e1e2e;
    border: 1px solid #333;
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 0.78rem;
    color: #ccc;
    max-width: 240px;
    line-height: 1.55;
    pointer-events: none;
    opacity: 0;
    transition: opacity .15s;
    z-index: 100;
    box-shadow: 0 8px 30px rgba(0,0,0,.6);
  }
  .map-tooltip strong {
    color: #fff;
    display: block;
    margin-bottom: 4px;
  }
  .flow-path {
    stroke-dasharray: 6 4;
    animation: mapdash 18s linear infinite;
  }
  @keyframes mapdash {
    to { stroke-dashoffset: -200; }
  }
  .pulse {
    animation: mappulse 2.4s ease-in-out infinite;
  }
  @keyframes mappulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: .45; }
  }
  .map-node {
    cursor: pointer;
  }
`

const TIPS: Record<string, { title: string; text: string }> = {
  usuario:    { title: '👤 Persona Usuaria',    text: 'Abre el navegador y escribe inmogrid.cl. Ve perfiles, lee posts, inicia sesión. Todo arranca desde aquí.' },
  cloudflare: { title: '🛡️ Cloudflare',         text: 'El primer guardia. Recibe cada visita, bloquea ataques y redirige el tráfico a Vercel (el sitio real). Actúa como intermediario invisible.' },
  vercel:     { title: '▲ Vercel — Frontend',   text: 'Aquí vive la página web que la gente ve. Cada vez que Gabriel sube código a GitHub, Vercel lo detecta y actualiza el sitio en segundos automáticamente.' },
  supabase:   { title: '🗄️ Supabase',           text: 'La bodega central. Guarda todos los datos (perfiles, posts, conexiones) y también controla quién puede entrar (autenticación Google). Compartida con pantojapropiedades.cl durante la transición.' },
  google:     { title: '🔑 Google OAuth',       text: "Cuando haces clic en 'Iniciar sesión con Google', Supabase le pregunta a Google «¿es realmente esta persona?». Google confirma y devuelve una llave de acceso. Sin contraseñas propias." },
  vps:        { title: '⚙️ VPS Oracle',         text: 'Un servidor propio que nunca se apaga. Corre automatizaciones con N8N (como Zapier pero privado): envía correos, procesa datos, conecta servicios externos en segundo plano.' },
  github:     { title: '🐙 GitHub',             text: "El historial completo del código. Cada mejora queda registrada aquí. Cuando Gabriel hace 'push', Vercel lo detecta y publica los cambios automáticamente." },
  referenciales: { title: '🏠 referenciales.cl', text: 'Plataforma open-data con miles de compraventas inmobiliarias de Chile (CBR). inmogrid.cl consulta su API pública para mostrar datos de mercado a los usuarios. Tiene su propia base de datos Neon (PostgreSQL + PostGIS), separada de Supabase.' },
}

export default function MapaConceptualPage() {
  useEffect(() => {
    const tipEl = document.getElementById('map-tip')
    if (!tipEl) return

    const nodes = document.querySelectorAll('.map-node')
    nodes.forEach(node => {
      const key = (node as HTMLElement).dataset.tip
      if (!key || !TIPS[key]) return
      const t = TIPS[key]

      node.addEventListener('mouseenter', () => {
        tipEl.innerHTML = `<strong>${t.title}</strong>${t.text}`
        tipEl.style.opacity = '1'
      })
      node.addEventListener('mousemove', e => {
        const me = e as MouseEvent
        tipEl.style.left = me.clientX + 16 + 'px'
        tipEl.style.top  = me.clientY - 10 + 'px'
      })
      node.addEventListener('mouseleave', () => {
        tipEl.style.opacity = '0'
      })
    })
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="map-page">
        <h1>🗺️ Mapa Conceptual — INMOGRID</h1>
        <p className="subtitle">Pasa el cursor sobre cada pieza para saber qué hace</p>

        <div className="map-wrap">
          <svg className="map" viewBox="0 0 900 700" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {/* Flechas */}
              <marker id="arrow-white"  markerWidth={8} markerHeight={8} refX={6} refY={3} orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#555"/></marker>
              <marker id="arrow-green"  markerWidth={8} markerHeight={8} refX={6} refY={3} orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#3ecf8e"/></marker>
              <marker id="arrow-violet" markerWidth={8} markerHeight={8} refX={6} refY={3} orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#818cf8"/></marker>
              <marker id="arrow-amber"  markerWidth={8} markerHeight={8} refX={6} refY={3} orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#f59e0b"/></marker>
              <marker id="arrow-purple" markerWidth={8} markerHeight={8} refX={6} refY={3} orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#a855f7"/></marker>
              <marker id="arrow-cyan"   markerWidth={8} markerHeight={8} refX={6} refY={3} orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#06b6d4"/></marker>

              {/* Glow filters */}
              <filter id="glow-green">
                <feGaussianBlur stdDeviation={3} result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="glow-violet">
                <feGaussianBlur stdDeviation={3} result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>

              {/* Gradientes */}
              <linearGradient id="grad-user" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1e1b4b"/>
                <stop offset="100%" stopColor="#312e81"/>
              </linearGradient>
              <linearGradient id="grad-vercel" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#161616"/>
                <stop offset="100%" stopColor="#222"/>
              </linearGradient>
              <linearGradient id="grad-supabase" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#052e16"/>
                <stop offset="100%" stopColor="#064e3b"/>
              </linearGradient>
              <linearGradient id="grad-vps" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1c1003"/>
                <stop offset="100%" stopColor="#292000"/>
              </linearGradient>
              <linearGradient id="grad-google" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1e0938"/>
                <stop offset="100%" stopColor="#2d1065"/>
              </linearGradient>
              <linearGradient id="grad-github" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0d1117"/>
                <stop offset="100%" stopColor="#21262d"/>
              </linearGradient>
              <linearGradient id="grad-cf" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1a0e00"/>
                <stop offset="100%" stopColor="#271500"/>
              </linearGradient>
              <linearGradient id="grad-ref" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0a1f2e"/>
                <stop offset="100%" stopColor="#0c2d3f"/>
              </linearGradient>
            </defs>

            {/* ── CONEXIONES ── */}
            {/* Usuario → Cloudflare */}
            <path d="M 200,90 C 250,90 270,130 310,145"
              stroke="#555" strokeWidth={1.8} fill="none" strokeDasharray="5,4"
              markerEnd="url(#arrow-white)" className="flow-path"/>
            <text x={222} y={106} fill="#444" fontSize={9}>visita inmogrid.cl</text>

            {/* Cloudflare → Vercel */}
            <path d="M 410,165 L 480,165"
              stroke="#f97316" strokeWidth={1.8} fill="none"
              markerEnd="url(#arrow-white)"/>
            <text x={420} y={158} fill="#a16207" fontSize={9}>redirige tráfico</text>

            {/* Usuario → Google (login) */}
            <path d="M 170,115 C 160,200 160,350 220,390"
              stroke="#a855f7" strokeWidth={1.8} fill="none" strokeDasharray="5,4"
              markerEnd="url(#arrow-purple)" className="flow-path"/>
            <text x={122} y={270} fill="#7e22ce" fontSize={9} transform="rotate(-6,122,270)">inicia sesión</text>

            {/* Google → Supabase */}
            <path d="M 350,400 C 430,400 500,380 530,340"
              stroke="#a855f7" strokeWidth={1.8} fill="none"
              markerEnd="url(#arrow-green)"/>
            <text x={390} y={388} fill="#7e22ce" fontSize={9}>confirma identidad</text>

            {/* Vercel ↔ Supabase */}
            <path d="M 700,185 L 760,220"
              stroke="#3ecf8e" strokeWidth={2} fill="none"
              markerEnd="url(#arrow-green)"/>
            <path d="M 755,240 L 695,210"
              stroke="#3ecf8e" strokeWidth={2} fill="none"
              markerEnd="url(#arrow-violet)"/>
            <text x={705} y={208} fill="#059669" fontSize={9}>pide datos</text>
            <text x={705} y={222} fill="#4f46e5" fontSize={9}>devuelve datos</text>

            {/* Supabase → Vercel (sesión) */}
            <path d="M 770,260 C 720,260 700,240 700,215"
              stroke="#818cf8" strokeWidth={1.5} fill="none" strokeDasharray="4,4"
              markerEnd="url(#arrow-violet)"/>

            {/* GitHub → Vercel (auto-deploy) */}
            <path d="M 570,500 C 570,460 610,250 610,210"
              stroke="#555" strokeWidth={1.8} fill="none" strokeDasharray="5,4"
              markerEnd="url(#arrow-white)" className="flow-path"/>
            <text x={620} y={370} fill="#444" fontSize={9}>push → deploy</text>

            {/* VPS → Supabase */}
            <path d="M 220,500 C 350,530 600,530 760,450"
              stroke="#f59e0b" strokeWidth={1.8} fill="none" strokeDasharray="5,4"
              markerEnd="url(#arrow-amber)" className="flow-path"/>
            <text x={440} y={548} fill="#b45309" fontSize={9}>lee / escribe datos (workflows)</text>

            {/* VPS → Vercel (API) */}
            <path d="M 250,480 C 300,440 480,300 530,220"
              stroke="#f59e0b" strokeWidth={1.5} fill="none" strokeDasharray="4,4"
              markerEnd="url(#arrow-amber)"/>
            <text x={340} y={355} fill="#92400e" fontSize={9} transform="rotate(-45,340,355)">api.inmogrid.cl</text>

            {/* Vercel → referenciales.cl (consume API pública) */}
            <path d="M 600,255 C 610,330 660,390 700,430"
              stroke="#06b6d4" strokeWidth={1.8} fill="none" strokeDasharray="5,4"
              markerEnd="url(#arrow-cyan)" className="flow-path"/>
            <text x={648} y={348} fill="#0e7490" fontSize={9} transform="rotate(55,648,348)">API pública</text>

            {/* ── NODOS ── */}

            {/* Usuario */}
            <g className="map-node" data-tip="usuario">
              <rect x={80} y={55} width={140} height={72} rx={14} fill="url(#grad-user)" stroke="#6366f1" strokeWidth={1.8}/>
              <text x={150} y={82} textAnchor="middle" fill="#a5b4fc" fontSize={9} fontWeight={700} letterSpacing={1}>PERSONA USUARIA</text>
              <text x={150} y={97} textAnchor="middle" fontSize={18}>👤</text>
              <text x={150} y={115} textAnchor="middle" fill="#818cf8" fontSize={9}>Navegador / Celular</text>
            </g>

            {/* Cloudflare */}
            <g className="map-node" data-tip="cloudflare">
              <rect x={270} y={125} width={140} height={72} rx={14} fill="url(#grad-cf)" stroke="#f97316" strokeWidth={1.8}/>
              <text x={340} y={148} textAnchor="middle" fill="#fb923c" fontSize={9} fontWeight={700} letterSpacing={1}>CLOUDFLARE</text>
              <text x={340} y={163} textAnchor="middle" fontSize={18}>🛡️</text>
              <text x={340} y={183} textAnchor="middle" fill="#f97316" fontSize={9}>DNS + Seguridad</text>
            </g>

            {/* Vercel */}
            <g className="map-node" data-tip="vercel">
              <rect x={480} y={125} width={180} height={130} rx={14} fill="url(#grad-vercel)" stroke="#e5e5e5" strokeWidth={1.8} filter="url(#glow-violet)"/>
              <text x={570} y={150} textAnchor="middle" fill="#fff" fontSize={9} fontWeight={700} letterSpacing={1}>VERCEL — FRONTEND</text>
              <text x={570} y={170} textAnchor="middle" fontSize={24}>▲</text>
              <text x={570} y={196} textAnchor="middle" fill="#aaa" fontSize={9}>Next.js 15 · React 19</text>
              <text x={570} y={210} textAnchor="middle" fill="#aaa" fontSize={9}>Páginas · Dashboard · Feed</text>
              <text x={570} y={226} textAnchor="middle" fill="#666" fontSize={8}>inmogrid.cl</text>
              <text x={570} y={242} textAnchor="middle" fill="#666" fontSize={8}>Auto-deploy desde GitHub</text>
            </g>

            {/* Supabase */}
            <g className="map-node" data-tip="supabase">
              <rect x={730} y={195} width={155} height={165} rx={14} fill="url(#grad-supabase)" stroke="#3ecf8e" strokeWidth={1.8} filter="url(#glow-green)"/>
              <text x={807} y={220} textAnchor="middle" fill="#6ee7b7" fontSize={9} fontWeight={700} letterSpacing={1}>SUPABASE</text>
              <text x={807} y={242} textAnchor="middle" fontSize={22}>🗄️</text>
              <text x={807} y={265} textAnchor="middle" fill="#aaa" fontSize={9}>Base de datos PostgreSQL</text>
              <text x={807} y={280} textAnchor="middle" fill="#aaa" fontSize={9}>Perfiles · Posts · Conexiones</text>
              <line x1={748} y1={295} x2={876} y2={295} stroke="#1a4a35" strokeWidth={1}/>
              <text x={807} y={310} textAnchor="middle" fill="#6ee7b7" fontSize={8.5} fontWeight={600}>🔐 Autenticación</text>
              <text x={807} y={326} textAnchor="middle" fill="#888" fontSize={8}>Google OAuth · Sesiones</text>
              <text x={807} y={342} textAnchor="middle" fill="#888" fontSize={8}>Compartida con pantoja.cl</text>
              <circle cx={876} cy={207} r={5} fill="#3ecf8e" className="pulse"/>
            </g>

            {/* Google */}
            <g className="map-node" data-tip="google">
              <rect x={215} y={360} width={140} height={72} rx={14} fill="url(#grad-google)" stroke="#a855f7" strokeWidth={1.8}/>
              <text x={285} y={383} textAnchor="middle" fill="#d8b4fe" fontSize={9} fontWeight={700} letterSpacing={1}>GOOGLE OAuth</text>
              <text x={285} y={399} textAnchor="middle" fontSize={18}>🔑</text>
              <text x={285} y={418} textAnchor="middle" fill="#a78bfa" fontSize={9}>Verifica identidad</text>
            </g>

            {/* VPS Oracle */}
            <g className="map-node" data-tip="vps">
              <rect x={70} y={455} width={175} height={95} rx={14} fill="url(#grad-vps)" stroke="#f59e0b" strokeWidth={1.8}/>
              <text x={157} y={477} textAnchor="middle" fill="#fcd34d" fontSize={9} fontWeight={700} letterSpacing={1}>VPS ORACLE</text>
              <text x={157} y={494} textAnchor="middle" fontSize={18}>⚙️</text>
              <text x={157} y={515} textAnchor="middle" fill="#aaa" fontSize={9}>N8N · Automatizaciones</text>
              <text x={157} y={530} textAnchor="middle" fill="#666" fontSize={8}>api.inmogrid.cl</text>
            </g>

            {/* GitHub */}
            <g className="map-node" data-tip="github">
              <rect x={500} y={460} width={140} height={72} rx={14} fill="url(#grad-github)" stroke="#58a6ff" strokeWidth={1.8}/>
              <text x={570} y={483} textAnchor="middle" fill="#58a6ff" fontSize={9} fontWeight={700} letterSpacing={1}>GITHUB</text>
              <text x={570} y={499} textAnchor="middle" fontSize={18}>🐙</text>
              <text x={570} y={518} textAnchor="middle" fill="#aaa" fontSize={9}>Código fuente · Historial</text>
            </g>

            {/* referenciales.cl */}
            <g className="map-node" data-tip="referenciales">
              <rect x={660} y={430} width={225} height={120} rx={14} fill="url(#grad-ref)" stroke="#06b6d4" strokeWidth={1.8}/>
              <text x={772} y={455} textAnchor="middle" fill="#67e8f9" fontSize={9} fontWeight={700} letterSpacing={1}>REFERENCIALES.CL</text>
              <text x={772} y={474} textAnchor="middle" fontSize={20}>🏠</text>
              <text x={772} y={496} textAnchor="middle" fill="#aaa" fontSize={9}>API pública · Open Data</text>
              <text x={772} y={510} textAnchor="middle" fill="#aaa" fontSize={9}>Compraventas CBR de Chile</text>
              <line x1={678} y1={521} x2={876} y2={521} stroke="#0c3040" strokeWidth={1}/>
              <text x={772} y={535} textAnchor="middle" fill="#0e7490" fontSize={8}>Neon PostgreSQL + PostGIS</text>
              <circle cx={876} cy={442} r={5} fill="#06b6d4" className="pulse"/>
            </g>

            {/* Zona: Servicios Externos */}
            <rect x={648} y={418} width={242} height={145} rx={8} fill="none" stroke="#0c2a35" strokeWidth={1} strokeDasharray="6,4"/>
            <text x={656} y={432} fill="#0c3040" fontSize={8} fontWeight={600} letterSpacing={1}>PLATAFORMA EXTERNA</text>

            {/* Zonas */}
            <rect x={60} y={38} width={380} height={115} rx={8} fill="none" stroke="#222" strokeWidth={1} strokeDasharray="6,4"/>
            <text x={68} y={52} fill="#333" fontSize={8} fontWeight={600} letterSpacing={1}>INTERNET PÚBLICO</text>

            <rect x={455} y={108} width={455} height={300} rx={8} fill="none" stroke="#1a2a1a" strokeWidth={1} strokeDasharray="6,4"/>
            <text x={463} y={122} fill="#1a3a1a" fontSize={8} fontWeight={600} letterSpacing={1}>CLOUD INFRASTRUCTURE</text>
          </svg>
        </div>

        {/* Leyenda */}
        <div className="legend">
          {[
            { color: '#6366f1', label: 'Usuario / Entrada' },
            { color: '#f97316', label: 'Cloudflare — DNS / Seguridad' },
            { color: '#e5e5e5', label: 'Vercel — Frontend visible' },
            { color: '#3ecf8e', label: 'Supabase — Datos + Auth' },
            { color: '#a855f7', label: 'Google — Identidad' },
            { color: '#f59e0b', label: 'VPS Oracle — Automatizaciones' },
            { color: '#58a6ff', label: 'GitHub — Código fuente' },
            { color: '#06b6d4', label: 'referenciales.cl — API pública open-data' },
          ].map(({ color, label }) => (
            <div key={label} className="legend-item">
              <div className="legend-dot" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        <div className="map-tooltip" id="map-tip" />
      </div>
    </>
  )
}
