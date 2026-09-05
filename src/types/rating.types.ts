// src/types/rating.types.ts
export type RatingScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10; // ✅ 1-10

export interface SubmitRatingPayload {
  itemId:   string;
  score:    RatingScore;
  comment?: string;
}

export interface SubmitRatingResponse {
  msg:    string;
  rating: {
    _id:        string;
    score:      RatingScore;
    comment:    string;
    trustDelta: number;
    createdAt:  string;
  };
}

export interface UserRating {
  _id:       string;
  score:     RatingScore;
  comment:   string;
  createdAt: string;
  item:      { _id: string; title: string | null } | null;
  rater:     { _id: string; name: string | null; avatar: string | null } | null;
}

export interface PendingRatingResponse {
  pendingRating: {
    _id: string;
    title: string;
    status: string;
    isRated: boolean;
    donor: { _id: string; name: string | null; avatar: string | null } | null;
    bookedBy: { _id: string; name: string | null; avatar: string | null } | null;
  } | null;
}
