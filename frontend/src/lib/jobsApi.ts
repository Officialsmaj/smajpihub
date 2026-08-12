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
  verificationStatus?: "unclaimed" | "claimed" | "pending" | "verified" | "pi_kyb" | "rejected";
  ownerId?: string;
  website?: string;
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
  updatedAt?: string;
  verificationStatus?: "unverified" | "pending" | "verified" | "rejected";
  avatarConfirmationStatus?: "confirmed" | "deferred";
  avatarConfirmationValue?: string;
  cv?: {
    url: string;
    name: string;
    size: number;
    visibility: "applications" | "verified_employers" | "private";
    updatedAt: string;
  };
  employment?: Array<{
    id: string;
    position: string;
    employer: string;
    current: boolean;
    location: string;
    country: string;
    startMonth: string;
    startYear: string;
    endMonth: string;
    endYear: string;
    description: string;
  }>;
} & Partial<JobsPreferences>;
export type JobsPreferences = {
  jobsMode: "candidate" | "employer" | "both";
  minimumPayUsdt: number;
  payPeriod: "hour" | "day" | "week" | "month" | "year";
  preferredLocations: string[];
  remotePreference: "all" | "remote" | "onsite";
  openToAnywhere: boolean;
  preferredTitles: string[];
  preferredCategories: string[];
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
export const saveJobsPreferences = async (preferences: JobsPreferences) =>
  (await axiosClient.patch<{ preferences: JobsPreferences }>("/jobs/preferences", preferences)).data.preferences;
export const confirmJobsProfileAvatar = async (avatar: string, status: "confirmed" | "deferred") =>
  (await axiosClient.patch("/jobs/profile/avatar-confirmation", { avatar, status })).data;
export const uploadJobsCv = async (document: string, name: string) =>
  (await axiosClient.post<{ url: string }>("/uploads/document", { document, name, purpose: "jobs-private-cv" })).data;
export const saveJobsCv = async (cv: { url: string; name: string; size: number; visibility: string }) =>
  (await axiosClient.put<{ cv: JobsProfile["cv"] }>("/jobs/profile/cv", cv)).data.cv;
export const deleteJobsCv = async () => axiosClient.delete("/jobs/profile/cv");
export const saveJobsProfileSection = async (section: string, values: Record<string, unknown>) =>
  (await axiosClient.patch("/jobs/profile/section", { section, ...values })).data;
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
export const claimJobCompany = async (id: string, evidence: { website: string; evidence: string }) =>
  (await axiosClient.post(`/jobs/companies/${encodeURIComponent(id)}/claim`, evidence)).data;
export const requestCompanyVerification = async (
  id: string,
  evidence: { registrationNumber: string; businessEmail: string; representativeRole: string; notes: string }
) => (await axiosClient.post(`/jobs/companies/${encodeURIComponent(id)}/verification-request`, evidence)).data;
export const requestCandidateVerification = async (evidence: {
  portfolio: string;
  credential: string;
  notes: string;
}) => (await axiosClient.post("/jobs/profile/verification-request", evidence)).data;
export type JobsBillingPlan = { id: string; name: string; priceUsdt: number; pricePi: number; piRateUsed: number };
export const getJobsBillingPlans = async () =>
  (await axiosClient.get<{ plans: JobsBillingPlan[] }>("/jobs/billing/plans")).data.plans;
export const createJobsBillingIntent = async (planId: string) =>
  (await axiosClient.post("/jobs/billing/intents", { planId })).data;
