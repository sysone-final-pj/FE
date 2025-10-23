import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}

export const Modal = ({ isOpen, onClose, children, width = '560px' }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-30" onClick={onClose} />
      <div
        className="relative bg-white rounded-xl shadow-2xl overflow-hidden"
        style={{ width, maxHeight: '90vh' }}
      >
        {children}
      </div>
    </div>
  );
};
