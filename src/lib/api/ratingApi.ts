// src/lib/api/ratingApi.ts
import axiosInstance from './axiosInstance';
import type {
  SubmitRatingPayload,
  SubmitRatingResponse,
  UserRating,
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

export const getUserRatings = async (userId: string): Promise<UserRating[]> => {
  const { data } = await axiosInstance.get<{ ratings: UserRating[] }>(
    `/api/ratings/user/${userId}`
  );
  return data.ratings;
};