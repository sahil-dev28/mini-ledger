import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api-error";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // no point retrying when the server can't be reached at all
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status === 0) && failureCount < 1,
    },
  },
});
