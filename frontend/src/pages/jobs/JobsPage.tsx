import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, NavLink, useNavigate, useParams, useSearchParams } from "react-router-dom";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import AppLayout from "../../layouts/AppLayout";
import {
  applyToJob,
  createJobCompany,
  createJob,
  createJobsBillingIntent,
  confirmJobsProfileAvatar,
  deleteJobsCv,
  enrollEmployer,
  getEmployerDashboard,
  getJobApplications,
  getJobCompanies,
  getJobs,
  getJobsMetrics,
  getJobsProfile,
  getJobsBillingPlans,
  getSavedJobs,
  saveJobsProfile,
  saveJobsProfileSection,
  requestCandidateVerification,
  requestCompanyVerification,
  saveJobsCv,
  toggleSavedJob,
  uploadJobsCv,
  updateEmployerApplication,
  type JobsApiApplication,
  type JobsApiCompany,
  type JobsApiJob,
  type JobsMetrics,
  type JobsProfile,
  type JobsBillingPlan,
} from "../../lib/jobsApi";
import JobsHeader from "./JobsHeader";
import "./JobsPage.css";
import { JOB_CATEGORIES, JOB_COUNTRIES } from "../../content/jobOptions";
import { formatPiAmount, formatUsdAmount } from "../../lib/formatters";
import { PI_USDT_RATE, piFromUsdt } from "../../lib/piPricing";
import { useAuthContext } from "../../contexts/AuthContext";
import JobPreferencesPanel from "./JobPreferencesPanel";

export type JobsPageKind =
  | "home"
  | "search"
  | "freelance"
  | "companies"
  | "saved"
  | "applications"
  | "profile"
  | "post"
  | "employer"
  | "job"
  | "company";

type Job = JobsApiJob;

const formatJobsPi = (value: number) => `π ${value.toFixed(5).replace(/\.?0+$/, "")}`;
const salaryFromUsdt = (minimum: number, maximum: number, period: string) =>
  `${formatJobsPi(piFromUsdt(minimum))}${maximum > minimum ? `–${formatJobsPi(piFromUsdt(maximum)).replace("π ", "")}` : ""} / ${period}`;
const normalizeJobLocation = (value: string) =>
  JOB_COUNTRIES.find(country => country.label === value)?.name || value.trim();

const fallbackJobs: Job[] = [
  {
    id: "product-designer",
    title: "Senior Product Designer",
    company: "Pioneer Labs",
    location: "Remote",
    type: "Full time",
    mode: "Remote",
    salary: salaryFromUsdt(1800, 2400, "mo"),
    category: "Design",
    featured: true,
    summary: "Shape trusted marketplace experiences used by a growing global Pi community.",
    skills: ["Figma", "Design systems", "Research"],
  },
  {
    id: "react-engineer",
    title: "React Frontend Engineer",
    company: "Orbit Commerce",
    location: "Lagos, Nigeria",
    type: "Full time",
    mode: "Hybrid",
    salary: salaryFromUsdt(2200, 3000, "mo"),
    category: "Engineering",
    featured: true,
    summary: "Build fast, accessible commerce tools for merchants and customers.",
    skills: ["React", "TypeScript", "APIs"],
  },
  {
    id: "community-lead",
    title: "Community Growth Lead",
    company: "PiWorks Africa",
    location: "Accra, Ghana",
    type: "Contract",
    mode: "Remote",
    salary: salaryFromUsdt(900, 1200, "mo"),
    category: "Marketing",
    summary: "Grow a welcoming community through partnerships, events and content.",
    skills: ["Community", "Content", "Analytics"],
  },
  {
    id: "mobile-audit",
    title: "Mobile UX Audit",
    company: "Nova Health",
    location: "Remote",
    type: "Project",
    mode: "Remote",
    salary: salaryFromUsdt(350, 350, "project"),
    category: "Design",
    freelance: true,
    summary: "Review an existing health app and deliver an actionable UX report.",
    skills: ["UX audit", "Mobile", "Accessibility"],
  },
  {
    id: "api-integration",
    title: "Payment API Integration",
    company: "Sahara Market",
    location: "Remote",
    type: "Project",
    mode: "Remote",
    salary: salaryFromUsdt(600, 600, "project"),
    category: "Engineering",
    freelance: true,
    summary: "Connect a marketplace checkout to a documented payment API.",
    skills: ["Node.js", "REST", "Payments"],
  },
  {
    id: "support-specialist",
    title: "Customer Support Specialist",
    company: "SMAJ Services",
    location: "Dakar, Senegal",
    type: "Part time",
    mode: "Hybrid",
    salary: salaryFromUsdt(650, 850, "mo"),
    category: "Operations",
    summary: "Help customers and providers complete their service journeys.",
    skills: ["Support", "French", "English"],
  },
];

const fallbackCompanies: JobsApiCompany[] = [
  { id: "pioneer-labs", name: "Pioneer Labs", field: "Product & technology", openings: 6, mark: "PL" },
  { id: "orbit-commerce", name: "Orbit Commerce", field: "E-commerce", openings: 4, mark: "OC" },
  { id: "piworks-africa", name: "PiWorks Africa", field: "Community", openings: 3, mark: "PA" },
  { id: "smaj-services", name: "SMAJ Services", field: "Digital services", openings: 8, mark: "SS" },
];

const formatJobCompensation = (salary: string) =>
  salary
    .replace(/^([\d,.]+(?:–[\d,.]+)?)\s*Pi\b/i, "π $1")
    .replace(/\bPi\b/gi, "π")
    .replace(/π\s([^–]+)–π\s/, "π $1–")
    .replace(
      /\s*\/\s*(hour|day|week|month|year)\b/gi,
      (_match, period: string) =>
        ` / ${{ hour: "hr", day: "day", week: "wk", month: "mo", year: "yr" }[period.toLowerCase()]}`
    )
    .replace(/\s+fixed$/i, " / project");

const JobCard = ({ job, saved, onSave }: { job: Job; saved: boolean; onSave: () => void }) => (
  <article className="job-card">
    <div className="job-company-mark">
      {job.company
        .split(" ")
        .map(word => word[0])
        .join("")
        .slice(0, 2)}
    </div>
    <div className="job-card-main">
      <div className="job-card-top">
        <span>{job.company}</span>
        <small>{job.featured ? "Featured" : "Recently added"}</small>
      </div>
      <Link to={`/services/jobs/job/${job.id}`}>{job.title}</Link>
      <p>
        <LocationOnOutlinedIcon /> {job.location} · {job.mode} · {job.type}
      </p>
      <div>
        {job.skills.map(skill => (
          <span key={skill}>{skill}</span>
        ))}
      </div>
      <strong>{formatJobCompensation(job.salary)}</strong>
    </div>
    <button className={saved ? "saved" : ""} type="button" onClick={onSave} aria-label={`Save ${job.title}`}>
      <BookmarkBorderRoundedIcon />
    </button>
  </article>
);

const JobsPage = ({ kind = "home" }: { kind?: JobsPageKind }) => {
  const { user } = useAuthContext();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("All");
  const [jobs, setJobs] = useState<Job[]>(fallbackJobs);
  const [companies, setCompanies] = useState<JobsApiCompany[]>(fallbackCompanies);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [applications, setApplications] = useState<JobsApiApplication[]>([]);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyNote, setApplyNote] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [cvSaving, setCvSaving] = useState(false);
  const [cvMessage, setCvMessage] = useState("");
  const [profileEditor, setProfileEditor] = useState<"basic" | "headline" | "skills" | "employment" | "">("");
  const [avatarPromptDismissed, setAvatarPromptDismissed] = useState(false);
  const [profile, setProfile] = useState<JobsProfile | null>(null);
  const [metrics, setMetrics] = useState<JobsMetrics>({ opportunities: 0, verifiedEmployers: 0, remotePercent: 0 });
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState("");
  const [employerApplications, setEmployerApplications] = useState<JobsApiApplication[]>([]);
  const [employerCompanies, setEmployerCompanies] = useState<JobsApiCompany[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [resultsTotal, setResultsTotal] = useState(0);
  const [postCategory, setPostCategory] = useState("");
  const [payMin, setPayMin] = useState("");
  const [payMax, setPayMax] = useState("");
  const [postCompanyId, setPostCompanyId] = useState("");
  const [billingPlans, setBillingPlans] = useState<JobsBillingPlan[]>([]);
  const [searchSheetOpen, setSearchSheetOpen] = useState(false);
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
  const [recentJobSearches, setRecentJobSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(window.localStorage.getItem("smaj_jobs_recent_searches") || "[]");
    } catch {
      return [];
    }
  });
  const [workspaceMode, setWorkspaceMode] = useState<"candidate" | "employer">(
    kind === "employer" || kind === "post" ? "employer" : "candidate"
  );
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const navigate = useNavigate();
  const activeWorkspaceMode =
    kind === "employer" || kind === "post"
      ? "employer"
      : ["search", "freelance", "saved", "applications", "profile"].includes(kind)
        ? "candidate"
        : workspaceMode;
  const currentAvatar = user?.avatar || "";
  const showAvatarConfirmation =
    kind === "profile" && Boolean(user) && !avatarPromptDismissed && profile?.avatarConfirmationValue !== currentAvatar;
  const updateAvatarConfirmation = async (status: "confirmed" | "deferred") => {
    await confirmJobsProfileAvatar(currentAvatar, status);
    setProfile(current =>
      current ? { ...current, avatarConfirmationStatus: status, avatarConfirmationValue: currentAvatar } : current
    );
    setAvatarPromptDismissed(true);
  };
  const profileChecks = [
    Boolean(currentAvatar),
    Boolean(profile?.title),
    Boolean(Array.isArray(profile?.skills) ? profile.skills.length : profile?.skills),
    Boolean(profile?.location),
    Boolean(profile?.summary),
    Boolean(profile?.cv),
  ];
  const profileCompletion = Math.round((profileChecks.filter(Boolean).length / profileChecks.length) * 100);
  const missingProfileItems = profileChecks.filter(item => !item).length;
  const uploadCv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf" || file.size > 5_000_000) {
      setCvMessage("Choose a PDF CV that is 5 MB or smaller.");
      return;
    }
    setCvSaving(true);
    setCvMessage("");
    try {
      const document = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("read_failed"));
        reader.readAsDataURL(file);
      });
      const upload = await uploadJobsCv(document, file.name);
      const cv = await saveJobsCv({ url: upload.url, name: file.name, size: file.size, visibility: "applications" });
      setProfile(current => (current ? { ...current, cv } : current));
      setCvMessage("CV updated successfully.");
    } catch {
      setCvMessage("CV could not be uploaded. Try again.");
    } finally {
      setCvSaving(false);
    }
  };
  const removeCv = async () => {
    await deleteJobsCv();
    setProfile(current => (current ? { ...current, cv: undefined } : current));
    setCvMessage("CV removed.");
  };
  const changeCvVisibility = async (visibility: "applications" | "verified_employers" | "private") => {
    if (!profile?.cv) return;
    const cv = await saveJobsCv({ ...profile.cv, visibility });
    setProfile(current => (current ? { ...current, cv } : current));
    setCvMessage("CV visibility updated.");
  };
  const saveProfileEditor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    let values: Record<string, unknown> = {};
    if (profileEditor === "headline") values = { title: data.get("title") };
    else if (profileEditor === "skills")
      values = {
        skills: String(data.get("skills") || "")
          .split(",")
          .map(item => item.trim())
          .filter(Boolean),
      };
    else if (profileEditor === "basic")
      values = {
        location: data.get("location"),
        availability: data.get("availability"),
        portfolio: data.get("portfolio"),
        summary: data.get("summary"),
      };
    else
      values = {
        employment: [
          {
            id: String(data.get("id") || Date.now()),
            position: data.get("position"),
            employer: data.get("employer"),
            current: data.get("current") === "on",
            location: data.get("employerLocation"),
            country: data.get("country"),
            startMonth: data.get("startMonth"),
            startYear: data.get("startYear"),
            endMonth: data.get("endMonth"),
            endYear: data.get("endYear"),
            description: data.get("description"),
          },
        ],
      };
    const result = await saveJobsProfileSection(profileEditor, values);
    setProfile(current => (current ? { ...current, ...result.values } : current));
    setProfileEditor("");
  };
  const jobSearchSuggestions = useMemo(() => {
    const available = [
      ...recentJobSearches,
      ...jobs.map(job => job.title),
      ...jobs.flatMap(job => job.skills),
      ...jobs.map(job => job.category),
    ];
    const term = query.trim().toLowerCase();
    return [...new Set(available)].filter(item => !term || item.toLowerCase().includes(term)).slice(0, 10);
  }, [jobs, query, recentJobSearches]);
  const locationSuggestions = useMemo(() => {
    const accountLocation = user?.country?.trim();
    const available = ["Remote", ...jobs.map(job => job.location), ...JOB_COUNTRIES.map(country => country.label)];
    const term = location.trim().toLowerCase();
    return {
      accountLocation,
      results: [...new Set(available)].filter(item => !term || item.toLowerCase().includes(term)).slice(0, 14),
    };
  }, [jobs, location, user?.country]);
  const runJobSearch = (term = query) => {
    const cleanTerm = term.trim();
    const params = new URLSearchParams({
      ...(cleanTerm ? { q: cleanTerm } : {}),
      ...(location ? { location: normalizeJobLocation(location) } : {}),
    });
    if (cleanTerm) {
      const nextRecent = [cleanTerm, ...recentJobSearches.filter(item => item !== cleanTerm)].slice(0, 6);
      setRecentJobSearches(nextRecent);
      window.localStorage.setItem("smaj_jobs_recent_searches", JSON.stringify(nextRecent));
    }
    setSearchSheetOpen(false);
    setLocationSheetOpen(false);
    navigate(`/services/jobs/search${params.size ? `?${params.toString()}` : ""}`);
  };
  const selectLocation = (nextLocation: string) => {
    setLocation(nextLocation);
    setLocationSheetOpen(false);
  };
  useEffect(() => {
    if (!searchSheetOpen && !locationSheetOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchSheetOpen(false);
        setLocationSheetOpen(false);
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [searchSheetOpen, locationSheetOpen]);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      getJobs({
        search: searchParams.get("q") || undefined,
        location: searchParams.get("location") || undefined,
        category,
        freelance: kind === "freelance",
        page,
      }),
      getJobCompanies(),
      getJobsMetrics(),
      getSavedJobs().catch(() => []),
      getJobApplications().catch(() => []),
      getJobsProfile().catch(() => null),
      getEmployerDashboard().catch(() => null),
    ])
      .then(([jobsResponse, nextCompanies, nextMetrics, savedJobs, nextApplications, nextProfile, dashboard]) => {
        if (controller.signal.aborted) return;
        if (jobsResponse.jobs.length) setJobs(jobsResponse.jobs);
        else setJobs([]);
        setPages(Math.max(1, jobsResponse.pagination.pages));
        setResultsTotal(jobsResponse.pagination.total);
        if (nextCompanies.length) setCompanies(nextCompanies);
        setMetrics(nextMetrics);
        setSaved(new Set(savedJobs.map(job => job.id)));
        setApplications(nextApplications);
        setProfile(nextProfile);
        if (kind === "home" && nextProfile?.jobsMode === "employer") setWorkspaceMode("employer");
        if (dashboard) {
          setEmployerApplications(dashboard.applications);
          setEmployerCompanies(dashboard.companies);
        }
        setLoading(false);
      })
      .catch(() => {
        setOffline(true);
        setLoading(false);
        setError(
          "Live Jobs data is temporarily unavailable. Showing a limited offline catalog; account actions may not work."
        );
      });
    return () => controller.abort();
  }, [searchParams, category, kind, page]);
  useEffect(() => {
    void getJobsBillingPlans()
      .then(setBillingPlans)
      .catch(() => setBillingPlans([]));
  }, []);
  const effectiveQuery = query || searchParams.get("q") || "";
  const effectiveLocation = searchParams.get("location") || "";
  const visibleJobs = useMemo(
    () =>
      jobs.filter(job => {
        const text = `${job.title} ${job.company} ${job.location} ${job.skills.join(" ")}`.toLowerCase();
        const locationMatch =
          !effectiveLocation || job.location.toLowerCase().includes(effectiveLocation.toLowerCase());
        return (
          text.includes(effectiveQuery.toLowerCase()) &&
          locationMatch &&
          (category === "All" || job.category === category)
        );
      }),
    [jobs, effectiveQuery, effectiveLocation, category]
  );
  const toggleSaved = (jobId: string) =>
    setSaved(current => {
      const next = new Set(current);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  const saveJob = (jobId: string) => {
    toggleSaved(jobId);
    void toggleSavedJob(jobId).catch(() => toggleSaved(jobId));
  };

  const listings =
    kind === "freelance"
      ? visibleJobs.filter(job => job.freelance)
      : kind === "saved"
        ? visibleJobs.filter(job => saved.has(job.id))
        : visibleJobs;
  const recommendedJobs = useMemo(() => {
    const titles = profile?.preferredTitles || [];
    const locations = profile?.preferredLocations || [];
    const categories = profile?.preferredCategories || [];
    if (!titles.length && !locations.length && !categories.length) return [];
    return jobs
      .filter(job => {
        const titleMatch =
          !titles.length ||
          titles.some(title => `${job.title} ${job.skills.join(" ")}`.toLowerCase().includes(title.toLowerCase()));
        const locationMatch =
          profile?.openToAnywhere ||
          !locations.length ||
          locations.some(item => job.location.toLowerCase().includes(item.toLowerCase())) ||
          (profile?.remotePreference !== "onsite" && job.mode === "Remote");
        const categoryMatch = !categories.length || categories.includes(job.category);
        return titleMatch && locationMatch && categoryMatch;
      })
      .slice(0, 3);
  }, [jobs, profile]);
  const selectedJob = jobs.find(job => job.id === id);
  const selectedCompany = companies.find(company => company.id === id);
  const submitJob = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      let companyId = String(data.get("companyId") || "");
      if (companyId === "__add__") {
        await enrollEmployer();
        const company = await createJobCompany({
          name: String(data.get("newCompanyName") || ""),
          field: String(data.get("newCompanyField") || ""),
        });
        setEmployerCompanies(current => [...current, company]);
        setCompanies(current => [...current, company]);
        setPostCompanyId(company.id);
        companyId = company.id;
      }
      const created = await createJob({
        title: String(data.get("title") || ""),
        companyId,
        location: String(data.get("country") || ""),
        type: String(data.get("type") || ""),
        mode: String(data.get("mode") || "Remote"),
        category: String(
          data.get("category") === "Other" ? data.get("customCategory") : data.get("category") || "Other"
        ),
        skills: String(data.get("skills") || "")
          .split(",")
          .map(skill => skill.trim())
          .filter(Boolean),
        salary: `${formatPiAmount(piFromUsdt(Number(data.get("compensationMin"))))}${Number(data.get("compensationMax")) > Number(data.get("compensationMin")) ? `–${formatPiAmount(piFromUsdt(Number(data.get("compensationMax"))))}` : ""} / ${String(data.get("compensationPeriod") || "month")}`,
        compensationMinUsdt: Number(data.get("compensationMin")),
        compensationMaxUsdt: Number(data.get("compensationMax")) || Number(data.get("compensationMin")),
        compensationPeriod: String(data.get("compensationPeriod") || "month"),
        summary: String(data.get("summary") || ""),
      });
      setJobs(current => [created, ...current]);
      setActionMessage("Job submitted for moderation.");
      navigate(`/services/jobs/employer`);
    } catch {
      setActionMessage("The job could not be submitted. Confirm your employer account and company ownership.");
    }
  };
  const submitApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedJob) return;
    try {
      const application = await applyToJob(selectedJob.id, applyNote);
      setApplications(current => [application, ...current]);
      setApplyOpen(false);
      setApplyNote("");
      setActionMessage("Application submitted successfully.");
    } catch {
      setActionMessage("This application could not be submitted. Check whether you already applied and try again.");
    }
  };
  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const next = await saveJobsProfile({
        title: String(data.title || ""),
        skills: String(data.skills || ""),
        location: String(data.location || ""),
        availability: String(data.availability || ""),
        portfolio: String(data.portfolio || ""),
        summary: String(data.summary || ""),
      });
      setProfile(next);
      setProfileSaved(true);
      setError("");
    } catch {
      setError("Your profile could not be saved. Please try again from your SMAJ account.");
    }
  };
  const createCompany = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await enrollEmployer();
      const company = await createJobCompany({
        name: String(data.get("name") || ""),
        field: String(data.get("field") || ""),
      });
      setEmployerCompanies(current => [...current, company]);
      setActionMessage("Company submitted for moderation.");
      event.currentTarget.reset();
    } catch {
      setActionMessage("Employer enrollment or company creation failed. Please try again from your SMAJ account.");
    }
  };
  const changeApplicationStatus = async (applicationId: string, status: string) => {
    try {
      await updateEmployerApplication(applicationId, status);
      setEmployerApplications(current => current.map(item => (item.id === applicationId ? { ...item, status } : item)));
    } catch {
      setActionMessage("Application status could not be updated.");
    }
  };
  const submitCompanyVerification = async (event: FormEvent<HTMLFormElement>, companyId: string) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await requestCompanyVerification(companyId, {
        registrationNumber: String(data.get("registrationNumber") || ""),
        businessEmail: String(data.get("businessEmail") || ""),
        representativeRole: String(data.get("representativeRole") || ""),
        notes: String(data.get("notes") || ""),
      });
      setEmployerCompanies(current =>
        current.map(company => (company.id === companyId ? { ...company, verificationStatus: "pending" } : company))
      );
      setActionMessage("Company verification submitted for review.");
    } catch {
      setActionMessage("Company verification request could not be submitted.");
    }
  };
  const submitCandidateVerification = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await requestCandidateVerification({
        portfolio: String(data.get("verificationPortfolio") || ""),
        credential: String(data.get("credential") || ""),
        notes: String(data.get("verificationNotes") || ""),
      });
      setProfile(current => (current ? { ...current, verificationStatus: "pending" } : current));
      setActionMessage("Professional verification submitted for review.");
    } catch {
      setActionMessage("Complete your professional profile before requesting verification.");
    }
  };
  const startBilling = async (planId: string) => {
    try {
      const result = await createJobsBillingIntent(planId);
      setActionMessage(result.message || "Billing request created.");
    } catch {
      setActionMessage("Billing request could not be created.");
    }
  };

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="jobs-page">
        <JobsHeader
          query={query}
          onQueryChange={setQuery}
          workspaceMode={activeWorkspaceMode}
          onWorkspaceModeChange={mode => {
            setWorkspaceMode(mode);
            navigate(mode === "candidate" ? "/services/jobs" : "/services/jobs/employer");
          }}
        />
        {showAvatarConfirmation ? (
          <div className="jobs-avatar-confirm-layer" role="dialog" aria-modal="true" aria-label="Confirm profile photo">
            <button
              className="jobs-avatar-confirm-overlay"
              type="button"
              aria-label="Not now"
              onClick={() => void updateAvatarConfirmation("deferred")}
            />
            <section className="jobs-avatar-confirm-sheet">
              <button
                className="jobs-avatar-confirm-close"
                type="button"
                aria-label="Not now"
                onClick={() => void updateAvatarConfirmation("deferred")}
              >
                ×
              </button>
              <span className="jobs-profile-avatar jobs-avatar-confirm-preview">
                {currentAvatar ? <img src={currentAvatar} alt="Your SMAJ profile" /> : (user?.displayName || "P")[0]}
              </span>
              <h2>{currentAvatar ? "Is this your current profile photo?" : "Add a profile photo"}</h2>
              <p>Jobs uses the same photo as your SMAJ PI HUB account.</p>
              <div>
                {currentAvatar ? (
                  <button type="button" onClick={() => void updateAvatarConfirmation("confirmed")}>
                    Yes
                  </button>
                ) : null}
                <Link to="/profile?edit=1&returnTo=%2Fservices%2Fjobs%2Fprofile">
                  {currentAvatar ? "Edit" : "Add photo"}
                </Link>
              </div>
            </section>
          </div>
        ) : null}
        {loading ? (
          <p className="jobs-status" role="status">
            Loading live opportunities…
          </p>
        ) : null}
        {error ? (
          <p className={`jobs-status ${offline ? "offline" : "error"}`} role="alert">
            {error}
          </p>
        ) : null}
        {kind === "home" ? (
          <>
            <section className="jobs-home-dashboard">
              <form
                className="jobs-quick-search"
                role="search"
                onSubmit={event => {
                  event.preventDefault();
                  runJobSearch();
                }}
              >
                <label>
                  <SearchRoundedIcon />
                  <input
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="Job title, skill or company"
                    aria-label="Job title, skill or company"
                    onFocus={() => setSearchSheetOpen(true)}
                  />
                </label>
                <label>
                  <LocationOnOutlinedIcon />
                  <input
                    value={location}
                    onChange={event => setLocation(event.target.value)}
                    placeholder="Country, city or remote"
                    aria-label="Country, city or remote"
                    onFocus={() => setLocationSheetOpen(true)}
                  />
                </label>
                <button type="submit">Search</button>
              </form>
              {searchSheetOpen ? (
                <div className="jobs-search-sheet-layer">
                  <button
                    className="jobs-search-sheet-overlay"
                    type="button"
                    aria-label="Close job search"
                    onClick={() => setSearchSheetOpen(false)}
                  />
                  <section className="jobs-search-sheet" role="dialog" aria-modal="true" aria-label="Search jobs">
                    <header>
                      <button type="button" onClick={() => setSearchSheetOpen(false)} aria-label="Back">
                        <ArrowBackRoundedIcon />
                      </button>
                      <label>
                        <SearchRoundedIcon />
                        <input
                          autoFocus
                          value={query}
                          onChange={event => setQuery(event.target.value)}
                          onKeyDown={event => {
                            if (event.key === "Enter") runJobSearch();
                          }}
                          placeholder="Job title, keywords, or company"
                          aria-label="Search job title, keywords, or company"
                        />
                      </label>
                    </header>
                    <div className="jobs-search-suggestions">
                      <b>Search suggestions</b>
                      {jobSearchSuggestions.map(suggestion => (
                        <button
                          type="button"
                          key={suggestion}
                          onClick={() => {
                            setQuery(suggestion);
                            runJobSearch(suggestion);
                          }}
                        >
                          <SearchRoundedIcon /> <span>{suggestion}</span>
                        </button>
                      ))}
                      {!jobSearchSuggestions.length ? <p>No matching suggestions. Search for “{query}”.</p> : null}
                    </div>
                    <footer>
                      <button type="button" onClick={() => runJobSearch()}>
                        Search
                      </button>
                    </footer>
                  </section>
                </div>
              ) : null}
              {locationSheetOpen ? (
                <div className="jobs-search-sheet-layer">
                  <button
                    className="jobs-search-sheet-overlay"
                    type="button"
                    aria-label="Close location search"
                    onClick={() => setLocationSheetOpen(false)}
                  />
                  <section className="jobs-search-sheet" role="dialog" aria-modal="true" aria-label="Search location">
                    <header>
                      <button type="button" onClick={() => setLocationSheetOpen(false)} aria-label="Back">
                        <ArrowBackRoundedIcon />
                      </button>
                      <label>
                        <LocationOnOutlinedIcon />
                        <input
                          autoFocus
                          value={location}
                          onChange={event => setLocation(event.target.value)}
                          onKeyDown={event => {
                            if (event.key === "Enter") runJobSearch();
                          }}
                          placeholder='City, country, or "remote"'
                          aria-label="Search city, country, or remote"
                        />
                      </label>
                    </header>
                    <div className="jobs-search-suggestions jobs-location-suggestions">
                      {locationSuggestions.accountLocation ? (
                        <button type="button" onClick={() => selectLocation(locationSuggestions.accountLocation || "")}>
                          <HomeRoundedIcon />
                          <span>
                            <b>Your location</b>
                            <small>{locationSuggestions.accountLocation}</small>
                          </span>
                        </button>
                      ) : null}
                      {locationSuggestions.results.map(suggestion => (
                        <button type="button" key={suggestion} onClick={() => selectLocation(suggestion)}>
                          <LocationOnOutlinedIcon /> <span>{suggestion}</span>
                        </button>
                      ))}
                      {!locationSuggestions.results.length ? <p>No matching locations found.</p> : null}
                    </div>
                    <footer>
                      <button type="button" onClick={() => runJobSearch()}>
                        Search
                      </button>
                    </footer>
                  </section>
                </div>
              ) : null}
              {user && !loading && activeWorkspaceMode === "candidate" ? (
                <JobPreferencesPanel
                  key={profile?.updatedAt || profile?.jobsMode || "new"}
                  userName={user.displayName || user.piUsername || user.username || "Pioneer"}
                  profile={profile}
                  jobs={jobs}
                  onSaved={preferences => {
                    setProfile(current => ({
                      ...(current || {
                        title: "",
                        skills: [],
                        location: "",
                        availability: "",
                        portfolio: "",
                        summary: "",
                      }),
                      ...preferences,
                    }));
                    if (preferences.jobsMode === "employer") {
                      setWorkspaceMode("employer");
                      navigate("/services/jobs/employer");
                    }
                  }}
                />
              ) : null}
              {user && profile?.jobsMode && activeWorkspaceMode === "candidate" ? (
                <section className="jobs-recommended">
                  <h2>Recommended jobs</h2>
                  {recommendedJobs.length ? (
                    <div className="jobs-list">
                      {recommendedJobs.map(job => (
                        <JobCard key={job.id} job={job} saved={saved.has(job.id)} onSave={() => saveJob(job.id)} />
                      ))}
                    </div>
                  ) : (
                    <p className="jobs-recommendation-note">
                      ⓘ We can’t find any job recommendations for you at the moment.
                    </p>
                  )}
                </section>
              ) : null}
            </section>
            <section className="jobs-hero">
              <div>
                <span className="jobs-kicker">VERIFIED TALENT. REAL OPPORTUNITIES.</span>
                <h1>
                  Build your future in the <em>Pi economy.</em>
                </h1>
                <p>Find trusted jobs and freelance projects, connect with verified employers, and get paid in Pi.</p>
                <small>Popular: React · Design · Marketing · Customer support</small>
              </div>
              <aside>
                <span>OPPORTUNITY SNAPSHOT</span>
                <strong>{metrics.opportunities}</strong>
                <p>active opportunities</p>
                <div>
                  <b>{metrics.verifiedEmployers}</b>
                  <small>Verified employers</small>
                </div>
                <div>
                  <b>{metrics.remotePercent}%</b>
                  <small>Remote friendly</small>
                </div>
                <div>
                  <b>100%</b>
                  <small>Pi-powered</small>
                </div>
              </aside>
            </section>
            <section className="jobs-section">
              <header>
                <div>
                  <span className="jobs-kicker">CURATED FOR YOU</span>
                  <h2>Featured opportunities</h2>
                </div>
                <Link to="/services/jobs/search">
                  View all <ArrowForwardRoundedIcon />
                </Link>
              </header>
              <div className="jobs-list">
                {jobs
                  .filter(job => job.featured)
                  .map(job => (
                    <JobCard key={job.id} job={job} saved={saved.has(job.id)} onSave={() => saveJob(job.id)} />
                  ))}
              </div>
            </section>
            <section className="jobs-section jobs-categories">
              <header>
                <div>
                  <span className="jobs-kicker">EXPLORE</span>
                  <h2>Find work by category</h2>
                </div>
              </header>
              <div>
                {["Engineering", "Design", "Marketing", "Operations"].map((name, index) => (
                  <Link key={name} to={`/services/jobs/search?q=${name}`}>
                    <span>{["⌘", "✦", "↗", "◎"][index]}</span>
                    <b>{name}</b>
                    <small>{18 + index * 11} open roles</small>
                  </Link>
                ))}
              </div>
            </section>
            <section className="jobs-cta">
              <div>
                <span className="jobs-kicker">FOR EMPLOYERS</span>
                <h2>Meet talent that is ready to build.</h2>
                <p>Publish a role, review verified profiles and manage candidates in one place.</p>
              </div>
              <Link to="/services/jobs/post">
                Post your first job <ArrowForwardRoundedIcon />
              </Link>
            </section>
          </>
        ) : kind === "companies" ? (
          <section className="jobs-directory">
            <div className="jobs-page-heading">
              <span className="jobs-kicker">TRUSTED ORGANIZATIONS</span>
              <h1>Explore companies</h1>
              <p>Discover verified teams building products and services across the Pi ecosystem.</p>
            </div>
            <div className="company-grid">
              {companies.map(company => (
                <Link to={`/services/jobs/company/${company.id}`} key={company.id}>
                  <span>{company.mark}</span>
                  <h2>
                    {company.name}{" "}
                    {company.verificationStatus === "verified" || company.verificationStatus === "pi_kyb" ? (
                      <CheckCircleRoundedIcon aria-label="Verified company" />
                    ) : null}
                  </h2>
                  <p>{company.field}</p>
                  <b>{company.openings} open opportunities</b>
                </Link>
              ))}
            </div>
          </section>
        ) : kind === "job" && selectedJob ? (
          <section className="job-detail">
            <Link to="/services/jobs/search">← Back to jobs</Link>
            <div className="job-detail-grid">
              <article>
                <span className="jobs-kicker">{selectedJob.company} · VERIFIED</span>
                <h1>{selectedJob.title}</h1>
                <p>
                  <LocationOnOutlinedIcon /> {selectedJob.location} · {selectedJob.mode} · {selectedJob.type}
                </p>
                <div className="job-detail-actions">
                  <button onClick={() => setApplyOpen(value => !value)}>Apply now</button>
                  <button onClick={() => saveJob(selectedJob.id)}>Save job</button>
                </div>
                {actionMessage ? <p className="jobs-action-message">{actionMessage}</p> : null}
                {applyOpen ? (
                  <form className="job-application-form" onSubmit={submitApplication}>
                    <h2>Apply for this role</h2>
                    <label>
                      Cover note
                      <textarea
                        value={applyNote}
                        onChange={event => setApplyNote(event.target.value)}
                        rows={5}
                        minLength={20}
                        required
                        placeholder="Introduce yourself and explain why you are a strong match."
                      />
                    </label>
                    <button type="submit">Submit application</button>
                  </form>
                ) : null}
                <h2>About the role</h2>
                <p>
                  {selectedJob.summary} You will collaborate with a distributed team, own meaningful outcomes and help
                  create reliable digital experiences.
                </p>
                <h2>What you will bring</h2>
                <ul>
                  <li>Strong practical experience in your discipline.</li>
                  <li>Clear communication and thoughtful collaboration.</li>
                  <li>A portfolio or examples of relevant work.</li>
                </ul>
                <h2>Skills</h2>
                <div className="job-skills">
                  {selectedJob.skills.map(skill => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </article>
              <aside>
                <b>{selectedJob.salary}</b>
                <p>Paid through the Pi ecosystem</p>
                <hr />
                <span>Category</span>
                <strong>{selectedJob.category}</strong>
                <span>Work type</span>
                <strong>{selectedJob.type}</strong>
                <span>Location</span>
                <strong>{selectedJob.location}</strong>
              </aside>
            </div>
          </section>
        ) : kind === "company" && selectedCompany ? (
          <section className="jobs-directory">
            <div className="company-hero">
              <span>{selectedCompany.mark}</span>
              <div>
                <small>
                  {selectedCompany.verificationStatus === "pi_kyb"
                    ? "PI KYB VERIFIED"
                    : selectedCompany.verificationStatus === "verified"
                      ? "VERIFIED EMPLOYER"
                      : selectedCompany.verificationStatus === "pending"
                        ? "VERIFICATION PENDING"
                        : selectedCompany.verificationStatus === "claimed"
                          ? "CLAIMED COMPANY"
                          : "COMPANY PROFILE"}
                </small>
                <h1>{selectedCompany.name}</h1>
                <p>{selectedCompany.field} · Building useful products for the Pi community.</p>
              </div>
            </div>
            <div className="jobs-page-heading">
              <h2>Open opportunities</h2>
            </div>
            <div className="jobs-list">
              {jobs
                .filter(job => job.company === selectedCompany.name)
                .map(job => (
                  <JobCard key={job.id} job={job} saved={saved.has(job.id)} onSave={() => saveJob(job.id)} />
                ))}
            </div>
          </section>
        ) : kind === "post" || kind === "profile" || kind === "employer" || kind === "applications" ? (
          <section className="jobs-workspace">
            <div className="jobs-page-heading">
              <span className="jobs-kicker">{kind === "post" ? "EMPLOYER WORKSPACE" : "YOUR JOBS WORKSPACE"}</span>
              <h1>
                {kind === "post"
                  ? "Post a new opportunity"
                  : kind === "profile"
                    ? "Professional profile"
                    : kind === "employer"
                      ? "Employer dashboard"
                      : "Applications"}
              </h1>
              <p>Everything you need to manage your next step in the Pi economy.</p>
            </div>
            {kind === "post" ? (
              <form className="job-form" onSubmit={event => void submitJob(event)}>
                <label>
                  Job title
                  <input name="title" required placeholder="e.g. Product Designer" />
                </label>
                <label>
                  Company
                  <select
                    name="companyId"
                    required
                    value={postCompanyId}
                    onChange={event => setPostCompanyId(event.target.value)}
                  >
                    <option value="" disabled>
                      Select your approved company
                    </option>
                    {[...companies]
                      .sort((left, right) =>
                        left.name === "SMAJ PI HUB"
                          ? -1
                          : right.name === "SMAJ PI HUB"
                            ? 1
                            : left.name.localeCompare(right.name)
                      )
                      .map(company => (
                        <option
                          value={company.id}
                          key={company.id}
                          disabled={!employerCompanies.some(owned => owned.id === company.id)}
                        >
                          {company.name}
                        </option>
                      ))}
                    <option value="__add__">＋ Add another company</option>
                  </select>
                </label>
                {postCompanyId === "__add__" ? (
                  <div className="job-add-company">
                    <label>
                      Company name
                      <input name="newCompanyName" required minLength={2} maxLength={120} />
                    </label>
                    <label>
                      Industry
                      <input name="newCompanyField" required maxLength={100} />
                    </label>
                    <small>
                      Your company is saved immediately and added to this dropdown. Jobs remain under moderation.
                    </small>
                  </div>
                ) : null}
                <div>
                  <label>
                    Country or work location
                    <input
                      name="country"
                      required
                      list="job-country-options"
                      placeholder="Search country"
                      autoComplete="off"
                    />
                    <datalist id="job-country-options">
                      <option value="🌐 Worldwide" />
                      <option value="🏠 Remote" />
                      {JOB_COUNTRIES.map(country => (
                        <option key={country.code} value={country.label} />
                      ))}
                    </datalist>
                  </label>
                  <label>
                    Job type
                    <select name="type">
                      <option>Full time</option>
                      <option>Part time</option>
                      <option>Contract</option>
                      <option>Project</option>
                    </select>
                  </label>
                  <label>
                    Work mode
                    <select name="mode">
                      <option>Remote</option>
                      <option>Hybrid</option>
                      <option>On-site</option>
                    </select>
                  </label>
                </div>
                <div>
                  <label>
                    Category
                    <input
                      name="category"
                      required
                      list="job-category-options"
                      value={postCategory}
                      onChange={event => setPostCategory(event.target.value)}
                      placeholder="Search 100+ categories"
                      autoComplete="off"
                    />
                    <datalist id="job-category-options">
                      {JOB_CATEGORIES.map(item => (
                        <option value={item} key={item} />
                      ))}
                    </datalist>
                  </label>
                  <label>
                    Skills
                    <input name="skills" required placeholder="React, Research, Communication" />
                  </label>
                </div>
                {postCategory === "Other" ? (
                  <label>
                    Custom category
                    <input
                      name="customCategory"
                      required
                      minLength={2}
                      maxLength={80}
                      placeholder="Type the job category"
                    />
                  </label>
                ) : null}
                <label>
                  Description
                  <textarea
                    name="summary"
                    required
                    minLength={30}
                    rows={6}
                    placeholder="Describe the opportunity, responsibilities and requirements"
                  />
                </label>
                <fieldset className="job-compensation">
                  <legend>Compensation</legend>
                  <p>
                    Enter the genuine real-world amount. Store conversion: 1 Pi = {PI_USDT_RATE.toLocaleString()} USDT.
                  </p>
                  <div>
                    <label>
                      Minimum (USDT)
                      <input
                        name="compensationMin"
                        type="number"
                        min="1"
                        step="0.01"
                        required
                        value={payMin}
                        onChange={event => setPayMin(event.target.value)}
                        placeholder="e.g. 3000"
                      />
                    </label>
                    <label>
                      Maximum (USDT)
                      <input
                        name="compensationMax"
                        type="number"
                        min={payMin || "1"}
                        step="0.01"
                        value={payMax}
                        onChange={event => setPayMax(event.target.value)}
                        placeholder="e.g. 4500"
                      />
                    </label>
                    <label>
                      Pay period
                      <select name="compensationPeriod">
                        <option value="hour">Per hour</option>
                        <option value="day">Per day</option>
                        <option value="week">Per week</option>
                        <option value="month">Per month</option>
                        <option value="year">Per year</option>
                        <option value="project">Fixed project</option>
                      </select>
                    </label>
                  </div>
                  {Number(payMin) > 0 ? (
                    <output>
                      {formatUsdAmount(Number(payMin))}
                      {Number(payMax) > Number(payMin) ? `–${formatUsdAmount(Number(payMax))}` : ""} ={" "}
                      {formatPiAmount(piFromUsdt(Number(payMin)))}
                      {Number(payMax) > Number(payMin) ? `–${formatPiAmount(piFromUsdt(Number(payMax)))}` : ""}
                    </output>
                  ) : null}
                  <label className="job-pay-confirm">
                    <input name="compensationConfirmed" type="checkbox" required /> I confirm this compensation is
                    genuine and can be honored.
                  </label>
                </fieldset>
                <button type="submit">Publish job</button>
              </form>
            ) : kind === "applications" && applications.length ? (
              <div className="jobs-application-list">
                {applications.map(application => (
                  <article key={application.id}>
                    <CheckCircleRoundedIcon />
                    <div>
                      <h2>{application.jobTitle}</h2>
                      <p>{application.company}</p>
                      <small>{new Date(application.createdAt).toLocaleDateString()}</small>
                    </div>
                    <b>{application.status}</b>
                  </article>
                ))}
              </div>
            ) : kind === "profile" ? (
              <div className="jobs-profile-workspace">
                <section className="jobs-profile-overview">
                  <div className="jobs-profile-summary-card">
                    <span className="jobs-profile-avatar">
                      {currentAvatar ? <img src={currentAvatar} alt="" /> : (user?.displayName || "P")[0]}
                    </span>
                    <div>
                      <h2>{user?.displayName || user?.piUsername || user?.username || "Pioneer"}</h2>
                      <p>{profile?.title || "Add your professional title"}</p>
                      <small>{profile?.location || user?.country || "Add your country"}</small>
                    </div>
                    <strong>{profileCompletion}%</strong>
                    <progress value={profileCompletion} max="100">
                      {profileCompletion}%
                    </progress>
                  </div>
                  {missingProfileItems ? (
                    <div className="jobs-profile-pending-card">
                      <div>
                        <b>{missingProfileItems} pending actions</b>
                        <p>Add the missing information to complete your professional profile.</p>
                      </div>
                      <a href="#jobs-profile-details">Complete now</a>
                    </div>
                  ) : null}
                  <div className="jobs-profile-card-grid">
                    <article>
                      <h3>CV Headline</h3>
                      <p>{profile?.title || "Not added"}</p>
                      <button type="button" onClick={() => setProfileEditor("headline")}>
                        Edit
                      </button>
                    </article>
                    <article>
                      <h3>Key Skills</h3>
                      <p>
                        {Array.isArray(profile?.skills) ? profile.skills.join(", ") : profile?.skills || "Not added"}
                      </p>
                      <button type="button" onClick={() => setProfileEditor("skills")}>
                        Edit
                      </button>
                    </article>
                    <article>
                      <h3>Basic Details</h3>
                      <p>{profile?.location || user?.country || "Not added"}</p>
                      <button type="button" onClick={() => setProfileEditor("basic")}>
                        Edit
                      </button>
                    </article>
                    <article>
                      <h3>Employment Details</h3>
                      <p>
                        {profile?.employment?.[0]
                          ? `${profile.employment[0].position} at ${profile.employment[0].employer}`
                          : "Not added"}
                      </p>
                      <button type="button" onClick={() => setProfileEditor("employment")}>
                        Edit
                      </button>
                    </article>
                    <article className="jobs-cv-card">
                      <h3>CV</h3>
                      {profile?.cv ? (
                        <>
                          <div className="jobs-cv-preview">
                            <b>PDF</b>
                            <span>{profile.cv.name}</span>
                          </div>
                          <small>Last updated {new Date(profile.cv.updatedAt).toLocaleDateString()}</small>
                          <div>
                            <a href={profile.cv.url} target="_blank" rel="noreferrer">
                              View
                            </a>
                            <label>
                              {cvSaving ? "Uploading…" : "Update"}
                              <input
                                type="file"
                                accept="application/pdf,.pdf"
                                onChange={event => void uploadCv(event)}
                                disabled={cvSaving}
                              />
                            </label>
                            <button type="button" onClick={() => void removeCv()}>
                              Delete
                            </button>
                          </div>
                          <label className="jobs-cv-visibility">
                            CV visibility
                            <select
                              value={profile.cv.visibility}
                              onChange={event =>
                                void changeCvVisibility(
                                  event.target.value as "applications" | "verified_employers" | "private"
                                )
                              }
                            >
                              <option value="applications">Share when I apply</option>
                              <option value="verified_employers">Verified employers</option>
                              <option value="private">Private</option>
                            </select>
                          </label>
                        </>
                      ) : (
                        <label className="jobs-cv-upload">
                          {cvSaving ? "Uploading…" : "Upload PDF CV"}
                          <input
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={event => void uploadCv(event)}
                            disabled={cvSaving}
                          />
                        </label>
                      )}
                      <p className="jobs-cv-privacy">Shared only with applications by default.</p>
                      {cvMessage ? <small>{cvMessage}</small> : null}
                    </article>
                  </div>
                </section>
                {profileEditor ? (
                  <div className="jobs-profile-editor">
                    <form onSubmit={event => void saveProfileEditor(event)}>
                      <header>
                        <button type="button" onClick={() => setProfileEditor("")}>
                          ←
                        </button>
                        <div>
                          <h1>
                            {profileEditor === "headline"
                              ? "CV Headline"
                              : profileEditor === "skills"
                                ? "Key Skills"
                                : profileEditor === "employment"
                                  ? "Employment Details"
                                  : "Basic Details"}
                          </h1>
                          <p>Keep this information current for suitable job opportunities.</p>
                        </div>
                      </header>
                      {profileEditor === "headline" ? (
                        <label>
                          Professional headline
                          <input name="title" maxLength={80} required defaultValue={profile?.title} />
                          <small>Maximum 80 characters</small>
                        </label>
                      ) : null}
                      {profileEditor === "skills" ? (
                        <label>
                          Skills
                          <input
                            name="skills"
                            required
                            defaultValue={Array.isArray(profile?.skills) ? profile.skills.join(", ") : profile?.skills}
                            placeholder="Add skills separated by commas"
                          />
                        </label>
                      ) : null}
                      {profileEditor === "basic" ? (
                        <>
                          <label>
                            Full name
                            <input value={user?.displayName || user?.username || ""} disabled />
                          </label>
                          <label>
                            Country or city
                            <input
                              name="location"
                              list="profile-country-options"
                              defaultValue={profile?.location || user?.country}
                            />
                          </label>
                          <label>
                            Availability
                            <select name="availability" defaultValue={profile?.availability}>
                              <option>Available now</option>
                              <option>Open to offers</option>
                              <option>Not available</option>
                            </select>
                          </label>
                          <label>
                            Portfolio URL
                            <input name="portfolio" type="url" defaultValue={profile?.portfolio} />
                          </label>
                          <label>
                            Professional summary
                            <textarea name="summary" maxLength={3000} rows={7} defaultValue={profile?.summary} />
                          </label>
                        </>
                      ) : null}
                      {profileEditor === "employment" ? (
                        <>
                          <input type="hidden" name="id" defaultValue={profile?.employment?.[0]?.id} />
                          <label>
                            Designation / Position
                            <input name="position" required defaultValue={profile?.employment?.[0]?.position} />
                          </label>
                          <label>
                            Employer Name
                            <input name="employer" required defaultValue={profile?.employment?.[0]?.employer} />
                          </label>
                          <label className="jobs-editor-check">
                            <input name="current" type="checkbox" defaultChecked={profile?.employment?.[0]?.current} />{" "}
                            I currently work here
                          </label>
                          <label>
                            Employer location
                            <input name="employerLocation" defaultValue={profile?.employment?.[0]?.location} />
                          </label>
                          <label>
                            Employer Country
                            <input
                              name="country"
                              list="profile-country-options"
                              defaultValue={profile?.employment?.[0]?.country}
                            />
                          </label>
                          <div>
                            <label>
                              Started month
                              <input name="startMonth" defaultValue={profile?.employment?.[0]?.startMonth} />
                            </label>
                            <label>
                              Started year
                              <input
                                name="startYear"
                                inputMode="numeric"
                                defaultValue={profile?.employment?.[0]?.startYear}
                              />
                            </label>
                          </div>
                          <div>
                            <label>
                              Ended month
                              <input name="endMonth" defaultValue={profile?.employment?.[0]?.endMonth} />
                            </label>
                            <label>
                              Ended year
                              <input
                                name="endYear"
                                inputMode="numeric"
                                defaultValue={profile?.employment?.[0]?.endYear}
                              />
                            </label>
                          </div>
                          <label>
                            Describe your job profile
                            <textarea
                              name="description"
                              maxLength={1000}
                              rows={8}
                              defaultValue={profile?.employment?.[0]?.description}
                            />
                            <small>Maximum 1000 characters</small>
                          </label>
                        </>
                      ) : null}
                      <button className="jobs-editor-save" type="submit">
                        Save
                      </button>
                    </form>
                  </div>
                ) : null}
                <form className="job-form" id="jobs-profile-details" onSubmit={saveProfile}>
                  <div className="jobs-profile-identity">
                    <span className="jobs-profile-avatar">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="" />
                      ) : (
                        (user?.displayName || user?.piUsername || user?.username || "P").slice(0, 1).toUpperCase()
                      )}
                    </span>
                    <div>
                      <strong>{user?.displayName || user?.piUsername || user?.username || "Pioneer"}</strong>
                      <small>Your SMAJ PI HUB photo and identity</small>
                    </div>
                  </div>
                  <label>
                    Professional title
                    <input name="title" defaultValue={profile?.title} required placeholder="e.g. Frontend Engineer" />
                  </label>
                  <label>
                    Skills
                    <input
                      name="skills"
                      defaultValue={Array.isArray(profile?.skills) ? profile.skills.join(", ") : profile?.skills}
                      required
                      placeholder="React, TypeScript, product design"
                    />
                  </label>
                  <div>
                    <label>
                      Country
                      <input
                        name="location"
                        required
                        list="profile-country-options"
                        defaultValue={profile?.location || user?.country}
                        placeholder="Search for your country"
                        autoComplete="country-name"
                      />
                      <datalist id="profile-country-options">
                        {JOB_COUNTRIES.map(country => (
                          <option key={country.code} value={country.label} />
                        ))}
                      </datalist>
                    </label>
                    <label>
                      Availability
                      <select name="availability" defaultValue={profile?.availability || "Open to offers"}>
                        <option>Available now</option>
                        <option>Open to offers</option>
                        <option>Not available</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    Portfolio URL
                    <input name="portfolio" defaultValue={profile?.portfolio} type="url" placeholder="https://..." />
                  </label>
                  <label>
                    Professional summary
                    <textarea name="summary" defaultValue={profile?.summary} required minLength={30} rows={6} />
                  </label>
                  <button type="submit">Save profile</button>
                  {profileSaved ? <p className="jobs-action-message">Profile saved to your SMAJ account.</p> : null}
                </form>
                <form className="job-form jobs-verification-form" onSubmit={submitCandidateVerification}>
                  <h2>Professional verification</h2>
                  <p>
                    Status: <b>{profile?.verificationStatus || "unverified"}</b>. Verification reviews evidence; it does
                    not guarantee a candidate's work.
                  </p>
                  <label>
                    Portfolio or work URL
                    <input
                      name="verificationPortfolio"
                      type="url"
                      defaultValue={profile?.portfolio}
                      placeholder="https://..."
                    />
                  </label>
                  <label>
                    Credential URL
                    <input name="credential" type="url" placeholder="https://..." />
                  </label>
                  <label>
                    Review notes
                    <textarea
                      name="verificationNotes"
                      rows={3}
                      placeholder="Explain what the reviewer should confirm"
                    />
                  </label>
                  <button type="submit">Request professional verification</button>
                </form>
                {actionMessage ? <p className="jobs-action-message">{actionMessage}</p> : null}
              </div>
            ) : kind === "employer" ? (
              <div className="jobs-employer-dashboard">
                <article>
                  <strong>
                    {jobs.filter(job => employerCompanies.some(company => company.id === job.companyId)).length}
                  </strong>
                  <span>Your opportunities</span>
                </article>
                <article>
                  <strong>{employerApplications.length}</strong>
                  <span>Candidate applications</span>
                </article>
                <article>
                  <strong>{employerCompanies.length}</strong>
                  <span>Your companies</span>
                </article>
                <Link to="/services/jobs/post">Post another job</Link>
                <form className="job-form" onSubmit={createCompany}>
                  <h2>Register an employer company</h2>
                  <label>
                    Company name
                    <input name="name" required />
                  </label>
                  <label>
                    Industry
                    <input name="field" required />
                  </label>
                  <button type="submit">Submit company for review</button>
                </form>
                <section className="jobs-trust-section">
                  <h2>Company verification</h2>
                  <p>Submit business identity and representative evidence. A badge appears only after review.</p>
                  {employerCompanies.map(company => (
                    <form
                      className="job-form jobs-verification-form"
                      key={company.id}
                      onSubmit={event => void submitCompanyVerification(event, company.id)}
                    >
                      <h3>
                        {company.name} <small>{company.verificationStatus || "unverified"}</small>
                      </h3>
                      <label>
                        Registration number
                        <input name="registrationNumber" />
                      </label>
                      <label>
                        Business email
                        <input name="businessEmail" type="email" required />
                      </label>
                      <label>
                        Your role
                        <input name="representativeRole" required placeholder="Owner, director, recruiter..." />
                      </label>
                      <label>
                        Evidence notes
                        <textarea name="notes" rows={3} />
                      </label>
                      <button
                        type="submit"
                        disabled={company.verificationStatus === "verified" || company.verificationStatus === "pi_kyb"}
                      >
                        Request company verification
                      </button>
                    </form>
                  ))}
                </section>
                <section className="jobs-trust-section jobs-billing-plans">
                  <h2>Employer plans</h2>
                  <p>
                    Candidate profiles and applications stay free. Employer promotion and posting plans fund SMAJ PI
                    HUB; salaries remain between employer and worker.
                  </p>
                  {billingPlans.map(plan => (
                    <article key={plan.id}>
                      <h3>{plan.name}</h3>
                      <strong>{formatPiAmount(plan.pricePi)}</strong>
                      <small>{formatUsdAmount(plan.priceUsdt)} at the configured store rate</small>
                      <button type="button" onClick={() => void startBilling(plan.id)}>
                        Create billing request
                      </button>
                    </article>
                  ))}
                </section>
                {actionMessage ? <p className="jobs-action-message">{actionMessage}</p> : null}
                <div className="jobs-application-list">
                  {employerApplications.map(application => (
                    <article key={application.id}>
                      <div>
                        <h2>{application.jobTitle}</h2>
                        <p>
                          {application.profileSnapshot?.title || "Candidate"} · {application.company}
                        </p>
                      </div>
                      <select
                        aria-label={`Status for ${application.jobTitle}`}
                        value={application.status}
                        onChange={event => void changeApplicationStatus(application.id, event.target.value)}
                      >
                        <option>submitted</option>
                        <option>reviewing</option>
                        <option>shortlisted</option>
                        <option>rejected</option>
                        <option>hired</option>
                      </select>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div className="workspace-empty">
                <WorkOutlineRoundedIcon />
                <h2>{kind === "applications" ? "No active applications yet" : "Your workspace is ready"}</h2>
                <p>Your existing SMAJ PI HUB account securely manages this area—no separate Jobs login is needed.</p>
                <Link to="/services/jobs/search">Explore opportunities</Link>
              </div>
            )}
          </section>
        ) : (
          <section className="jobs-directory">
            <div className="jobs-page-heading">
              <span className="jobs-kicker">
                {kind === "freelance"
                  ? "PROJECT-BASED WORK"
                  : kind === "saved"
                    ? "YOUR SHORTLIST"
                    : "DISCOVER OPPORTUNITIES"}
              </span>
              <h1>
                {kind === "freelance"
                  ? "Freelance projects"
                  : kind === "saved"
                    ? "Saved jobs"
                    : effectiveLocation
                      ? `Jobs in ${effectiveLocation}`
                      : "Find your next role"}
              </h1>
              <p>
                {kind === "search" ? resultsTotal : listings.length} available{" "}
                {kind === "search" && effectiveLocation ? `in ${effectiveLocation}` : "opportunities"}.
              </p>
            </div>
            <div className="jobs-results-layout">
              <aside>
                <b>Filter jobs</b>
                {["All", "Engineering", "Design", "Marketing", "Operations"].map(item => (
                  <button
                    className={category === item ? "active" : ""}
                    onClick={() => {
                      setCategory(item);
                      setPage(1);
                    }}
                    key={item}
                  >
                    {item}
                  </button>
                ))}
              </aside>
              <div className="jobs-list">
                {listings.map(job => (
                  <JobCard key={job.id} job={job} saved={saved.has(job.id)} onSave={() => saveJob(job.id)} />
                ))}
                {!listings.length ? (
                  <div className="workspace-empty">
                    <SearchRoundedIcon />
                    <h2>
                      {effectiveLocation ? `No jobs available in ${effectiveLocation}` : "No opportunities found"}
                    </h2>
                    <p>
                      {effectiveLocation
                        ? "Try another nearby location, choose Remote, or broaden your search."
                        : "Try another search or category."}
                    </p>
                  </div>
                ) : null}
                {pages > 1 ? (
                  <nav className="jobs-pagination" aria-label="Jobs pages">
                    <button type="button" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>
                      Previous
                    </button>
                    <span>
                      Page {page} of {pages}
                    </span>
                    <button type="button" disabled={page >= pages} onClick={() => setPage(value => value + 1)}>
                      Next
                    </button>
                  </nav>
                ) : null}
              </div>
            </div>
            {kind === "search" ? (
              <section className="jobs-cta jobs-search-employer-cta">
                <div>
                  <span className="jobs-kicker">FOR EMPLOYERS</span>
                  <h2>Meet talent that is ready to build.</h2>
                  <p>Publish a role, review verified profiles and manage candidates in one place.</p>
                </div>
                <Link to="/services/jobs/post">
                  Post your first job <ArrowForwardRoundedIcon />
                </Link>
              </section>
            ) : null}
          </section>
        )}
        <nav className="jobs-mobile-nav">
          <NavLink end to="/services/jobs">
            <HomeRoundedIcon />
            <span>Home</span>
          </NavLink>
          {activeWorkspaceMode === "candidate" ? (
            <>
              <NavLink to="/services/jobs/search">
                <SearchRoundedIcon />
                <span>Jobs</span>
              </NavLink>
              <NavLink to="/services/jobs/saved">
                <BookmarkBorderRoundedIcon />
                <span>Saved</span>
              </NavLink>
              <NavLink to="/services/jobs/applications">
                <WorkOutlineRoundedIcon />
                <span>Applications</span>
              </NavLink>
              <NavLink to="/services/jobs/profile">
                <BusinessRoundedIcon />
                <span>Profile</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/services/jobs/employer">
                <BusinessRoundedIcon />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/services/jobs/companies">
                <BusinessRoundedIcon />
                <span>Companies</span>
              </NavLink>
              <NavLink to="/services/jobs/post">
                <WorkOutlineRoundedIcon />
                <span>Post job</span>
              </NavLink>
              <NavLink to="/services/jobs/employer">
                <SearchRoundedIcon />
                <span>Candidates</span>
              </NavLink>
            </>
          )}
        </nav>
      </main>
    </AppLayout>
  );
};

export default JobsPage;
