// src/types/rating.types.ts
export type RatingValue = 1 | 2 | 3 | 4 | 5;

export interface RatingPayload {
  rating: RatingValue;
}

export interface RatingResponse {
  msg:        string;
  trustScore: number; // الـ trustScore الجديد للمتبرع
}

export interface RatingPrompt {
  itemId:    string;
  itemTitle: string;
  donorName: string;
  donorId:   string;
  show:      boolean;
}