"use client";
import { trpc } from "@/lib/trpc/client";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useMemo } from "react";
import { getLoginUrl } from "@/lib/constants";

export function useAuth() {
  const utils = trpc.useUtils();
  const meQuery = trpc.auth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const logoutMutation = trpc.auth.logout.useMutation({ onSuccess: () => { utils.auth.me.setData(undefined, null); } });

  const logout = useCallback(async () => {
    try { await logoutMutation.mutateAsync(); }
    catch (error) { if (error instanceof TRPCClientError && error.data?.code === "UNAUTHORIZED") return; throw error; }
    finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
      document.cookie = "manus_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => ({
    user: meQuery.data ?? null,
    loading: meQuery.isLoading || logoutMutation.isPending,
    error: meQuery.error ?? logoutMutation.error ?? null,
    isAuthenticated: Boolean(meQuery.data),
  }), [meQuery.data, meQuery.error, meQuery.isLoading, logoutMutation.error, logoutMutation.isPending]);

  return { ...state, refresh: () => meQuery.refetch(), logout };
}
