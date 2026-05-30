import { useQuery } from "@tanstack/react-query";
import { api } from "./client";

export type CurrentUser = {
  id: string;
};

async function fetchMe(): Promise<CurrentUser> {
  const response = await api.get<CurrentUser>("/me");

  return response.data;
}

export function useMeQuery() {
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    staleTime: Infinity,
  });
}
