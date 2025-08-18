'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AxiosError } from 'axios';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: (failureCount, error) => {
              // Don't retry on server errors (5xx) or network errors
              if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as AxiosError;
                if (
                  axiosError.response?.status &&
                  axiosError.response?.status >= 500
                ) {
                  console.error('Server error detected, not retrying');
                  return false;
                }
              }

              // Only retry once for other errors
              return failureCount < 1;
            },
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff with max 10s
            refetchOnWindowFocus: false, // Prevent refetch on window focus
            refetchOnReconnect: true, // Only refetch when network reconnects
          },
          mutations: {
            retry: (failureCount, error) => {
              // Don't retry mutations on server errors
              if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as AxiosError;
                if (
                  axiosError.response?.status &&
                  axiosError.response?.status >= 500
                ) {
                  return false;
                }
              }

              return failureCount < 1;
            },
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 5000), // Shorter delay for mutations
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
