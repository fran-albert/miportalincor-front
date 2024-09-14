import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

const ClientWrapper = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ flex: 1 }}>{children}</div>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default ClientWrapper;
