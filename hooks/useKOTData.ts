import { fetchKOTData } from "@/app/lib/utils";
import { useQuery } from "@tanstack/react-query";

export const useKOTData = (userId: string) => {
  return useQuery({
    queryKey: ["kot-data", userId],
    queryFn: () => fetchKOTData(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 60 * 2, // Cache for 1 hour
  });
};
