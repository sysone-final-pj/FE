import { useState } from 'react';
import type { ReactNode } from 'react';
import { Spinner } from '@/shared/ui/Spinner/Spinner';
import { SpinnerContext } from './SpinnerContext';

interface SpinnerProviderProps {
  children: ReactNode;
}

export const SpinnerProvider: React.FC<SpinnerProviderProps> = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);

  const showSpinner = () => setLoadingCount((prev) => prev + 1);
  const hideSpinner = () => setLoadingCount((prev) => Math.max(0, prev - 1));

  const isLoading = loadingCount > 0;

  return (
    <SpinnerContext.Provider value={{ isLoading, showSpinner, hideSpinner }}>
      {children}
      {isLoading && <Spinner fullScreen />}
    </SpinnerContext.Provider>
  );
};
