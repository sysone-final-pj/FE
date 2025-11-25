import { useState, useEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { Spinner } from '@/shared/ui/Spinner/Spinner';
import { SpinnerContext } from './SpinnerContext';
import { setSpinnerContext } from '@/shared/api/axiosInstance';

interface SpinnerProviderProps {
  children: ReactNode;
}

export const SpinnerProvider = ({ children }: SpinnerProviderProps) => {
  const [loadingCount, setLoadingCount] = useState(0);
  const [shouldShowSpinner, setShouldShowSpinner] = useState(false);
  const spinnerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ctx = useMemo(() => ({
    isLoading: loadingCount > 0,
    showSpinner: () => setLoadingCount((p) => p + 1),
    hideSpinner: () => setLoadingCount((p) => Math.max(0, p - 1)),
  }), [loadingCount]);

  useEffect(() => {
    setSpinnerContext(ctx);
  }, [ctx]);

  // 0.5초 지연 후 스피너 표시 로직
  useEffect(() => {
    if (loadingCount > 0) {
      // 로딩 시작: 0.5초 후 스피너 표시
      if (!spinnerTimerRef.current) {
        spinnerTimerRef.current = setTimeout(() => {
          setShouldShowSpinner(true);
        }, 1000);
      }
    } else {
      // 로딩 종료: 타이머 취소 및 스피너 숨김
      if (spinnerTimerRef.current) {
        clearTimeout(spinnerTimerRef.current);
        spinnerTimerRef.current = null;
      }
      setShouldShowSpinner(false);
    }

    // Cleanup
    return () => {
      if (spinnerTimerRef.current) {
        clearTimeout(spinnerTimerRef.current);
        spinnerTimerRef.current = null;
      }
    };
  }, [loadingCount]);

  return (
    <SpinnerContext.Provider value={ctx}>
      {children}
      {shouldShowSpinner && <Spinner fullScreen />}
    </SpinnerContext.Provider>
  );
};
