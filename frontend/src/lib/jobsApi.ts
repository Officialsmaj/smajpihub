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
  profileSnapshot?: JobsProfile;
};

export type JobsProfile = {
  title: string;
  skills: string[] | string;
  location: string;
  availability: string;
  portfolio: string;
  summary: string;
};
export type JobsMetrics = { opportunities: number; verifiedEmployers: number; remotePercent: number };
export type JobsPagination = { page: number; pageSize: number; total: number; pages: number };

export const getJobs = async (
  params: {
    search?: string;
    location?: string;
    category?: string;
    freelance?: boolean;
    page?: number;
    pageSize?: number;
  } = {}
) => {
  const response = await axiosClient.get<{ jobs: JobsApiJob[]; pagination: JobsPagination }>("/jobs/jobs", { params });
  return response.data;
};

export const getJobsMetrics = async () =>
  (await axiosClient.get<{ metrics: JobsMetrics }>("/jobs/metrics")).data.metrics;

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
  companyId: string;
  location: string;
  type: string;
  mode: string;
  category: string;
  skills: string[];
  salary: string;
  summary: string;
  durationDays?: number;
  compensationMinUsdt: number;
  compensationMaxUsdt: number;
  compensationPeriod: string;
}) => {
  const response = await axiosClient.post<{ job: JobsApiJob }>("/jobs/jobs", job);
  return response.data.job;
};

export const getJobsProfile = async () =>
  (await axiosClient.get<{ profile: JobsProfile | null }>("/jobs/profile")).data.profile;
export const saveJobsProfile = async (profile: JobsProfile) =>
  (await axiosClient.put<{ profile: JobsProfile }>("/jobs/profile", profile)).data.profile;
export const enrollEmployer = async () => (await axiosClient.post<{ role: string }>("/jobs/employer/enroll")).data;
export const createJobCompany = async (company: { name: string; field: string }) =>
  (await axiosClient.post<{ company: JobsApiCompany }>("/jobs/companies", company)).data.company;
export const getEmployerDashboard = async () =>
  (
    await axiosClient.get<{ jobs: JobsApiJob[]; applications: JobsApiApplication[]; companies: JobsApiCompany[] }>(
      "/jobs/employer/dashboard"
    )
  ).data;
export const updateEmployerApplication = async (id: string, status: string) =>
  (await axiosClient.patch<{ status: string }>(`/jobs/employer/applications/${encodeURIComponent(id)}`, { status }))
    .data.status;
export const withdrawJobApplication = async (id: string) =>
  (await axiosClient.patch<{ status: string }>(`/jobs/applications/${encodeURIComponent(id)}/withdraw`)).data.status;
