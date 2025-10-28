import { useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Spinner } from '@/shared/ui/Spinner/Spinner';
import { SpinnerContext } from './SpinnerContext';
import { setSpinnerContext } from '@/shared/api/axiosInstance';

interface SpinnerProviderProps {
  children: ReactNode;
}

export const SpinnerProvider = ({ children }: SpinnerProviderProps) => {
  const [loadingCount, setLoadingCount] = useState(0);
  
  const ctx = useMemo(() => ({
    isLoading: loadingCount > 0,
    showSpinner: () => setLoadingCount((p) => p + 1),
    hideSpinner: () => setLoadingCount((p) => Math.max(0, p - 1)),
  }), [loadingCount]);

  useEffect(() => {
    setSpinnerContext(ctx);
  }, [ctx]);

  return (
    <SpinnerContext.Provider value={ctx}>
      {children}
      {ctx.isLoading && <Spinner fullScreen />}
    </SpinnerContext.Provider>
  );
};
