// src/lib/api/reportApi.ts
import axiosInstance from './axiosInstance';
import type {
  CreateReportPayload,
  AppealPayload,
  AdminReportsResponse,
  Report,
  ReportDecision,
  ResolveReportPayload,
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

export const getAdminReports = async ({
  page = 1,
  status = 'all',
}: {
  page?: number;
  status?: ReportDecision | 'pending' | 'all';
} = {}): Promise<AdminReportsResponse> => {
  const { data } = await axiosInstance.get<AdminReportsResponse>(
    '/api/admin/reports',
    { params: { page, status: status === 'all' ? undefined : status } }
  );
  return data;
};

export const resolveAdminReport = async (
  reportId: string,
  payload: ResolveReportPayload
): Promise<{ msg: string; report: Report }> => {
  const { data } = await axiosInstance.post<{ msg: string; report: Report }>(
    `/api/admin/reports/${reportId}/resolve`,
    payload
  );
  return data;
};
