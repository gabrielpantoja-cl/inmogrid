import {
  HomeIcon,
  DocumentDuplicateIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  UserIcon,
  MapIcon,
} from '@heroicons/react/24/outline';

export interface NavLinkItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export const navigationLinks: NavLinkItem[] = [
  { name: 'Feed', href: '/dashboard', icon: HomeIcon },
  { name: 'Mi Perfil', href: '/dashboard/perfil', icon: UserIcon },
  { name: 'Mapa', href: '/dashboard/referenciales', icon: MapIcon },
  { name: 'Mis Publicaciones', href: '/dashboard/notas', icon: DocumentDuplicateIcon },
  { name: 'Explorar', href: '/dashboard/explorar', icon: MagnifyingGlassIcon },
  { name: 'Comunidad', href: '/dashboard/comunidad', icon: UserGroupIcon },
];
