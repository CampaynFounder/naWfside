"use client";
import { usePathname } from 'next/navigation';

const ROUTE_TITLES: Record<string, string> = {
  '/about': 'About',
  '/marketplace': 'Marketplace',
  '/dashboard': 'Producer',
  '/blog': 'Blog',
  '/terms': 'Terms',
  '/privacy': 'Privacy',
  '/login': 'Sign in',
  '/producers': 'Producers',
};

function getTitle(pathname: string): string {
  if (pathname in ROUTE_TITLES) return ROUTE_TITLES[pathname];
  if (pathname.startsWith('/producer/')) return 'Producer';
  return '';
}

export default function HeaderTitle() {
  const pathname = usePathname();
  const title = getTitle(pathname);
  if (!title) return null;
  return <span className="text-sm font-medium text-gray-200 sm:text-base">{title}</span>;
}
