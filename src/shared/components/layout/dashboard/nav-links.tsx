'use client'

import {
  HomeIcon,
  UserCircleIcon,
  DocumentTextIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { name: 'Inicio', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Mi Perfil',
    href: '/dashboard/perfil',
    icon: UserCircleIcon,
  },
  {
    name: 'Mis Publicaciones',
    href: '/dashboard/notas',
    icon: DocumentTextIcon,
  },
  {
    name: 'Conexiones',
    href: '/dashboard/networking',
    icon: UsersIcon,
  },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-primary/10 hover:text-primary md:flex-none md:justify-start md:p-2 md:px-3
            ${pathname === link.href ? 'bg-primary/10 text-primary' : ''}
            `}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}