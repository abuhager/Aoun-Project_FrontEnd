// src/types/gamification.types.ts
// Phase 5 — Badges, Leaderboard, Wall of Fame

import type { BadgeType } from './socket.types';

export interface Badge {
  type:      BadgeType;
  label:     string;
  earnedAt:  string;
  icon:      string; // emoji أو Lucide icon name
}

export interface LeaderboardEntry {
  rank:           number;
  userId:         string;
  name:           string;
  avatar?:        string;
  totalDonations: number;
  trustScore:     number;
  badges:         Badge[];
}

export interface MonthlyLeaderboard {
  month:     string; // 'YYYY-MM'
  entries:   LeaderboardEntry[];
  updatedAt: string;
}