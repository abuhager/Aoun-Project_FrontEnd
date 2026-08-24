import axiosInstance from '@/lib/api/axiosInstance';
import type {
  LeaderboardEntry,
  MyRankResponse,
} from '@/types/leaderboard.types';

export async function getLeaderboard(
  signal?: AbortSignal
): Promise<LeaderboardEntry[]> {
  const { data } = await axiosInstance.get<{ leaderboard: LeaderboardEntry[] }>(
    '/api/leaderboard',
    { signal }
  );
  return data.leaderboard;
}

export async function getMyLeaderboardRank(
  signal?: AbortSignal
): Promise<MyRankResponse> {
  const { data } = await axiosInstance.get<MyRankResponse>(
    '/api/leaderboard/me',
    { signal }
  );
  return data;
}
