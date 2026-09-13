"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { api } from "@/trpc/client";

export default function TRPCProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 60s 内视为新鲜：避免组件挂载/窗口聚焦时重复请求，
            // 也让服务端直出的 initialData 不会立刻被 refetch 覆盖。
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
        }),
      ],
    })
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
}
