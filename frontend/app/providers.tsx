"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  // ✅ QueryClient instance create kar rahe hain
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // ✅ Data 5 minute tak fresh rahega (API call nahi hogi)
        staleTime: 5 * 60 * 1000,
        // ✅ Cache memory me 10 minute tak rahega
        gcTime: 10 * 60 * 1000,
        // ✅ Tab switch karne par auto-refetch band
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}