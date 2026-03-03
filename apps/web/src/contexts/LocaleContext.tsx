// src/contexts/LocaleContext.tsx
'use client';
import { createContext, useContext, ReactNode } from 'react';

interface LocaleContextType {
  locale: string;
  isRTL: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ 
  children, 
  locale 
}: { 
  children: ReactNode; 
  locale: string; 
}) {
  const isRTL = locale === 'ar';
  
  return (
    <LocaleContext.Provider value={{ locale, isRTL }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}