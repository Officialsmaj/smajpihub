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

export type JobsApiApplication = {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  coverNote?: string;
  status: string;
  createdAt: string;
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

export const getSavedJobs = async () => {
  const response = await axiosClient.get<{ jobs: JobsApiJob[] }>("/jobs/saved");
  return response.data.jobs;
};

export const getJobApplications = async () => {
  const response = await axiosClient.get<{ applications: JobsApiApplication[] }>("/jobs/applications");
  return response.data.applications;
};

export const applyToJob = async (jobId: string, coverNote = "") => {
  const response = await axiosClient.post<{ application: JobsApiApplication }>(
    `/jobs/jobs/${encodeURIComponent(jobId)}/apply`,
    { coverNote }
  );
  return response.data.application;
};

export const createJob = async (job: {
  title: string;
  company: string;
  location: string;
  type: string;
  mode: string;
  category: string;
  skills: string[];
  salary: string;
  summary: string;
}) => {
  const response = await axiosClient.post<{ job: JobsApiJob }>("/jobs/jobs", job);
  return response.data.job;
};
