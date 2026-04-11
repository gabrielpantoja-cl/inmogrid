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
  active: 'bg-primary/20 text-primary border-b-2 border-primary',
  inactive: 'text-gray-600 hover:text-primary hover:bg-primary/10',
  base: 'inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
};

const MOBILE_CLASSES = {
  active: 'bg-primary/20 text-primary',
  inactive: 'text-gray-600 hover:text-primary hover:bg-primary/10',
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
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary border border-primary/30">
            {link.badge}
          </span>
        )}
      </span>
    </Link>
  );
}
