import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { appConfig } from '../config/app.config.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: appConfig.queryClient.defaultStaleTimeMs,
      gcTime: appConfig.queryClient.defaultGcTimeMs,
      retry: appConfig.api.retryCount,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export const QueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
