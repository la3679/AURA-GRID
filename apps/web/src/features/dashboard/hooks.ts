import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpdateProfileInput } from '@aura-grid/shared';
import { queryKeys, STALE } from '../../lib/queryClient.js';
import { getProfile, getStats, updateProfile } from '../profile/profileService.js';
import { listMatches } from '../matches/matchService.js';
import { getLeaderboard } from '../leaderboard/leaderboardService.js';
import { useAuth } from '../auth/useAuth.js';

export const useProfileQuery = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
    enabled: isAuthenticated,
    staleTime: STALE.profile,
  });
};

export const useStatsQuery = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: getStats,
    enabled: isAuthenticated,
    staleTime: STALE.profile,
  });
};

export const useMatchesQuery = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.matches,
    queryFn: listMatches,
    enabled: isAuthenticated,
    staleTime: STALE.matches,
  });
};

export const useLeaderboardQuery = () =>
  useQuery({
    queryKey: queryKeys.leaderboard,
    queryFn: getLeaderboard,
    staleTime: STALE.leaderboard,
  });

export const useUpdateProfileMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: UpdateProfileInput) => updateProfile(patch),
    onSuccess: (profile) => {
      qc.setQueryData(queryKeys.profile, profile);
      qc.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
};
