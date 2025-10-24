import { createContext } from 'react';

export interface SpinnerContextType {
  isLoading: boolean;
  showSpinner: () => void;
  hideSpinner: () => void;
}

export const SpinnerContext = createContext<SpinnerContextType | undefined>(undefined);
