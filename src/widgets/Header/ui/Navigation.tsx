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
    <nav className="flex gap-[50px] absolute left-[214px] top-[27px]">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={`text-text-primary font-pretendard font-medium text-base ${item.active
              ? 'text-state-running font-semibold'
              : 'text-text-primary hover:text-state-running'
            } style={{ letterSpacing: '-0.025em', lineHeight: '140%' }}`
          }
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
};
