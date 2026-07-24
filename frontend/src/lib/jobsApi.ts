import { axiosClient } from "./axiosClient";

export type JobsApiJob = {
  id: string;
  title: string;
  company: string;
  companyId?: string;
  location: string;
  type: string;
  mode: string;
  salary: string;
  category: string;
  featured?: boolean;
  freelance?: boolean;
  summary: string;
  skills: string[];
};

export type JobsApiCompany = {
  id: string;
  name: string;
  field: string;
  openings: number;
  mark: string;
};

export const getJobs = async () => {
  const response = await axiosClient.get<{ jobs: JobsApiJob[] }>("/jobs/jobs");
  return response.data.jobs;
};

export const getJobCompanies = async () => {
  const response = await axiosClient.get<{ companies: JobsApiCompany[] }>("/jobs/companies");
  return response.data.companies;
};

export const toggleSavedJob = async (jobId: string) => {
  const response = await axiosClient.put<{ saved: boolean }>(`/jobs/saved/${encodeURIComponent(jobId)}`);
  return response.data.saved;
};

export const applyToJob = async (jobId: string) => {
  await axiosClient.post(`/jobs/jobs/${encodeURIComponent(jobId)}/apply`, {});
};

export const createJob = async (job: {
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  summary: string;
}) => {
  const response = await axiosClient.post<{ job: JobsApiJob }>("/jobs/jobs", job);
  return response.data.job;
};
