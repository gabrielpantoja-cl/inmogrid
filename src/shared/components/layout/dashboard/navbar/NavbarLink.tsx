'use client';

import Link from 'next/link';
import type { NavLinkItem } from './constants';

interface NavbarLinkProps {
  link: NavLinkItem;
  isActive: boolean;
  variant: 'desktop' | 'mobile';
  onClick?: () => void;
}

const DESKTOP_CLASSES = {
  active: 'bg-blue-100 text-blue-700 border-b-2 border-blue-500',
  inactive: 'text-gray-600 hover:text-blue-600 hover:bg-blue-50',
  base: 'inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
};

const MOBILE_CLASSES = {
  active: 'bg-blue-100 text-blue-700',
  inactive: 'text-gray-600 hover:text-blue-600 hover:bg-blue-50',
  base: 'flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200',
};

export function NavbarLink({ link, isActive, variant, onClick }: NavbarLinkProps) {
  const LinkIcon = link.icon;
  const classes = variant === 'desktop' ? DESKTOP_CLASSES : MOBILE_CLASSES;
  const iconClass = variant === 'desktop' ? 'w-5 h-5 mr-2' : 'w-5 h-5 mr-3';

  return (
    <Link
      href={link.href}
      onClick={onClick}
      className={`${classes.base} ${isActive ? classes.active : classes.inactive}`}
    >
      <LinkIcon className={iconClass} />
      <span className="flex items-center">
        {link.name}
        {link.badge && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            {link.badge}
          </span>
        )}
      </span>
    </Link>
  );
}
