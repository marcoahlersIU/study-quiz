import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AppRouter } from './Router';
import { Toaster } from './components/ui/toaster';

import i18n from './i18n';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from './components/theme-provider';

const queryClient = new QueryClient();

export function App() {
  return (
    <ThemeProvider>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <AppRouter />
          <Toaster />
        </QueryClientProvider>
      </I18nextProvider>
    </ThemeProvider>
  );
}
