import { LayoutGrid } from 'lucide-react';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types/navigation';

export const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: dashboard(),
    icon: LayoutGrid,
  },
];

export const visibilityOptions = [
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone can view this mod',
  },
  {
    value: 'unlisted',
    label: 'Unlisted',
    description: 'Only people with the link can view',
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only you and collaborators can view',
  },
];

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getRoleColor = (role: string) => {
  switch (role) {
    case 'owner':
      return 'bg-transparent text-red-400 border border-red-400 font-bold';
    case 'admin':
      return 'bg-transparent text-blue-400 border border-blue-400 font-bold';
    case 'editor':
      return 'bg-transparent text-green-400 border border-green-400 font-bold';
    case 'viewer':
      return 'bg-transparent text-gray-400 border border-gray-400 font-bold';
    default:
      return 'bg-transparent text-gray-400 border border-gray-400 font-bold';
  }
};
