'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import { ThemeProvider } from '@/contexts/ThemeContext';
import WeldPakApp from '@/components/WeldPakApp';

export default function Home() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <WeldPakApp />
      </ThemeProvider>
    </Provider>
  );
}
