import Link from 'next/link';
import {
  DocumentDuplicateIcon,
  MapIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import type { ComponentType, SVGProps } from 'react';

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

interface Pillar {
  href: string;
  label: string;
  description: string;
  icon: Icon;
  comingSoon?: boolean;
}

const DEFAULT_PILLARS: Pillar[] = [
  {
    href: '/#publicaciones',
    label: 'Blog',
    description: 'Publicaciones de la comunidad y análisis del rubro.',
    icon: DocumentDuplicateIcon,
  },
  {
    href: '/referenciales',
    label: 'Mapa de referenciales',
    description: 'Transacciones verificadas del mercado inmobiliario chileno.',
    icon: MapIcon,
  },
  {
    href: '/sofia',
    label: 'Sofía · Chat IA',
    description: 'Asistente especializado en inmobiliario chileno.',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    href: '/eventos',
    label: 'Calendario de eventos',
    description: 'Talleres, cursos y encuentros del sector.',
    icon: CalendarIcon,
    comingSoon: true,
  },
  {
    href: '/foro',
    label: 'Foro',
    description: 'Hilos de discusión por especialidad.',
    icon: UserGroupIcon,
    comingSoon: true,
  },
];

export function EcosystemSidebar({ pillars = DEFAULT_PILLARS }: { pillars?: Pillar[] }) {
  return (
    <aside aria-label="Pilares del ecosistema" className="w-full">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 px-1 lg:px-0">
        Ecosistema
      </h2>

      <div className="flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:gap-3 lg:overflow-visible lg:pb-0 lg:sticky lg:top-20">
        {pillars.map((pillar) => (
          <PillarCard key={pillar.href} pillar={pillar} />
        ))}
      </div>
    </aside>
  );
}

function PillarCard({ pillar }: { pillar: Pillar }) {
  const { icon: Icon, label, description, href, comingSoon } = pillar;

  return (
    <Link
      href={href}
      className="group relative shrink-0 w-56 lg:w-auto bg-white rounded-xl border border-gray-200 p-4 hover:border-primary/40 hover:shadow-sm transition-all"
      aria-label={`${label}${comingSoon ? ' (próximamente)' : ''}`}
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0 w-9 h-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center group-hover:bg-primary/25 transition-colors">
          <Icon className="w-5 h-5" aria-hidden="true" />
        </span>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 leading-tight">
              {label}
            </span>
            {comingSoon && (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                Pronto
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500 leading-snug line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
