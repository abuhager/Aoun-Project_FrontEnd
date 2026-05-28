// src/types/gamification.types.ts

import type { BadgeType }   from './socket.types';
import type { Gamification } from './user.types'; 

export interface Badge {
  type:     BadgeType;
  label:    string;
  earnedAt: string;
  icon:     string;
}

export interface LeaderboardEntry {
  rank:         number;
  _id:          string;       // ✅ عدّل userId → _id (متوافق مع Backend)
  name:         string;
  avatar?:      string;
  badges:       Badge[];
  gamification: Gamification; // ✅ أضف
}

export interface MonthlyLeaderboard {
  month:     string;
  entries:   LeaderboardEntry[];
  updatedAt: string;
}