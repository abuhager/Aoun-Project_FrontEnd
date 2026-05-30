// src/types/gamification.types.ts

import type { Gamification } from './user.types';

export type BadgeType = string;

export interface Badge {
  type: BadgeType;
  label: string;
  earnedAt: string;
  icon: string;
}

export interface LeaderboardEntry {
  rank: number;
  _id: string; // ✅ متوافق مع Backend
  name: string;
  avatar?: string;
  badges: Badge[];
  gamification: Gamification;
}

export interface MonthlyLeaderboard {
  month: string;
  entries: LeaderboardEntry[];
  updatedAt: string;
}