import React from 'react';

export interface NavigationProps {
  items: Array<{
    label: string;
    href: string;
    active?: boolean;
  }>;
}

export const Navigation: React.FC<NavigationProps> = ({ items }) => {
  return (
    <nav className="flex gap-12 absolute left-1/2 -translate-x-1/2">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={`text-base font-medium transition-colors ${
            item.active
              ? 'text-blue-500 font-semibold'
              : 'text-gray-700 hover:text-blue-500'
          }`}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
};
