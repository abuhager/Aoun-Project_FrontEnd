export interface LeaderboardEntry {
  rank: number;
  _id: string;
  name: string;
  avatar?: string;
  trustScore: number;
  totalDonations: number;
  level: number;
  title: string;
  badge: string;
  progress: number;
  pointsToNext: number | null;
}

export interface MyRank {
  eligible: true;
  rank: number;
  trustScore: number;
  totalDonations: number;
  level: number;
  title: string;
  badge: string;
  progress: number;
  pointsToNext: number | null;
}

interface IneligibleRank {
  eligible: false;
  reason: string;
}

export type MyRankResponse = MyRank | IneligibleRank;
