// src/lib/api/reportApi.ts
import axiosInstance from './axiosInstance';
import type {
  CreateReportPayload,
  AppealPayload,
  Report,
} from '@/types/report.types';

export const createReport = async (
  payload: CreateReportPayload
): Promise<{ msg: string; report: Report }> => {
  const { data } = await axiosInstance.post<{ msg: string; report: Report }>(
    '/api/reports',
    payload
  );
  return data;
};

export const submitAppeal = async (
  reportId: string,
  payload: AppealPayload
): Promise<{ msg: string; report: Report }> => {
  const { data } = await axiosInstance.post<{ msg: string; report: Report }>(
    `/api/reports/${reportId}/appeal`,
    payload
  );
  return data;
};