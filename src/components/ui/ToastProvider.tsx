'use client';

import React from 'react';
import { Toaster } from './sonner';
import { useTheme } from 'next-themes';

export const ToastProvider: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme as 'light' | 'dark' | 'system'}
      position="top-right"
      richColors
      closeButton
      expand
      duration={4000}
    />
  );
};
