import { useContext } from 'react';
import { SpinnerContext } from '@/shared/providers/SpinnerContext';

export const useSpinner = () => {
  const context = useContext(SpinnerContext);
  if (!context) {
    throw new Error('useSpinner must be used within SpinnerProvider');
  }
  return context;
};
