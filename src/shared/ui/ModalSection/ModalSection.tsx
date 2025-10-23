import React from 'react';

interface ModalSectionProps {
  title: string;
  children: React.ReactNode;
}

export const ModalSection = ({ title, children }: ModalSectionProps) => {
  return (
    <div className="border-b border-gray-200 px-8">
      <div className="py-5 flex items-start gap-4">
        <h3 className="w-32 text-sm font-semibold text-gray-600">{title}</h3>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};
