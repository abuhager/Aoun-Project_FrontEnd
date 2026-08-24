// src/lib/api/ratingApi.ts
import axiosInstance from './axiosInstance';
import type {
  SubmitRatingPayload,
  SubmitRatingResponse,
  UserRating,
  PendingRatingResponse, // ✅ أضف هذا النوع
} from '@/types/rating.types';


export const submitRating = async (
  payload: SubmitRatingPayload
): Promise<SubmitRatingResponse> => {
  const { data } = await axiosInstance.post<SubmitRatingResponse>(
    '/api/ratings',
    payload
  );
  return data;
};


export const getUserRatings = async (
  userId: string,
  signal?: AbortSignal
): Promise<UserRating[]> => {
  const { data } = await axiosInstance.get<{ ratings: UserRating[] }>(
    `/api/ratings/user/${userId}`,
    { signal }
  );
  return data.ratings;
};


// ✅ جديد
export const getPendingRating = async (
  signal?: AbortSignal
): Promise<PendingRatingResponse> => {
  const { data } = await axiosInstance.get<PendingRatingResponse>(
    '/api/ratings/pending',
    { signal }
  );
  return data;
};
