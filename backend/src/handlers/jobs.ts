import type { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";
import { resolveCurrentUser } from "../services/auth";
import { PI_USDT_RATE, piFromUsdt } from "../services/piPricing";

const ACTIVE = {
  status: "active",
  moderationStatus: "approved",
  expiresAt: { $gt: new Date().toISOString() },
};
const APPLICATION_STATUSES = [
  "submitted",
  "reviewing",
  "shortlisted",
  "rejected",
  "hired",
  "withdrawn",
];

const seedJobs = [
  {
    slug: "product-designer",
    title: "Senior Product Designer",
    companyId: "pioneer-labs",
    company: "Pioneer Labs",
    location: "Remote",
    type: "Full time",
    mode: "Remote",
    salary: "1,800–2,400 Pi / mo",
    category: "Design",
    featured: true,
    freelance: false,
    summary:
      "Shape trusted marketplace experiences used by a growing global Pi community.",
    skills: ["Figma", "Design systems", "Research"],
  },
  {
    slug: "react-engineer",
    title: "React Frontend Engineer",
    companyId: "orbit-commerce",
    company: "Orbit Commerce",
    location: "Lagos, Nigeria",
    type: "Full time",
    mode: "Hybrid",
    salary: "2,200–3,000 Pi / mo",
    category: "Engineering",
    featured: true,
    freelance: false,
    summary:
      "Build fast, accessible commerce tools for merchants and customers.",
    skills: ["React", "TypeScript", "APIs"],
  },
  {
    slug: "community-lead",
    title: "Community Growth Lead",
    companyId: "piworks-africa",
    company: "PiWorks Africa",
    location: "Accra, Ghana",
    type: "Contract",
    mode: "Remote",
    salary: "900–1,200 Pi / mo",
    category: "Marketing",
    featured: false,
    freelance: false,
    summary:
      "Grow a welcoming community through partnerships, events and content.",
    skills: ["Community", "Content", "Analytics"],
  },
  {
    slug: "mobile-audit",
    title: "Mobile UX Audit",
    companyId: "nova-health",
    company: "Nova Health",
    location: "Remote",
    type: "Project",
    mode: "Remote",
    salary: "350 Pi fixed",
    category: "Design",
    featured: false,
    freelance: true,
    summary:
      "Review an existing health app and deliver an actionable UX report.",
    skills: ["UX audit", "Mobile", "Accessibility"],
  },
];

const ecosystemCompanyNames = [
  "SMAJ PI HUB",
  "Map of Pi",
  "PyNook",
  "City for Pi",
  "EasyGoods",
  "Bharat Shopping Mart",
  "Country of Pi",
  "Daabia",
  "Polls for Pi",
  "Connect Social",
  "Pi Workforce Pool",
  "World of Pi Championships",
  "Watugot",
  "Pi Game Platform",
  "Pi Barter Mall",
  "PitoGo",
  "Pi Webinars",
  "Pi Games from Latin America",
  "Blind_Lounge",
  "Starmax",
  "RUN FOR PI",
  "Kindrek",
  "Workflet for Pi",
  "PallyPay",
  "SimpleJoy",
  "Agora Pulse",
];
const companySlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const seedCompanies = ecosystemCompanyNames.map((name, priority) => ({
  slug: companySlug(name),
  name,
  field: "Pi application",
  mark: name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase(),
  verified: false,
  directoryPriority: priority,
}));

export const serializeJobDocument = (document: any) =>
  document
    ? {
        ...document,
        _id: undefined,
        id: document.slug || document._id?.toString(),
      }
    : null;
export const clampPage = (value: unknown) =>
  Math.max(1, Math.min(10_000, Number.parseInt(String(value ?? "1"), 10) || 1));
export const clampPageSize = (value: unknown) =>
  Math.max(
    1,
    Math.min(
      50,
      Number.parseInt(String(value ?? "20"), 10) ||
        (String(value) === "0" ? 0 : 20),
    ),
  );
export const cleanJobInput = (body: any) => {
  const compensationMinUsdt = Number(body?.compensationMinUsdt);
  const compensationMaxUsdt =
    Number(body?.compensationMaxUsdt) || compensationMinUsdt;
  const compensationPeriod = [
    "hour",
    "day",
    "week",
    "month",
    "year",
    "project",
  ].includes(body?.compensationPeriod)
    ? body.compensationPeriod
    : "month";
  return {
    title: String(body?.title || "")
      .trim()
      .slice(0, 120),
    companyId: String(body?.companyId || "")
      .trim()
      .slice(0, 120),
    location: String(body?.location || "")
      .trim()
      .slice(0, 120),
    type: ["Full time", "Part time", "Contract", "Project"].includes(body?.type)
      ? body.type
      : "Full time",
    mode: ["Remote", "Hybrid", "On-site"].includes(body?.mode)
      ? body.mode
      : "Remote",
    salary: String(body?.salary || "")
      .trim()
      .slice(0, 120),
    compensationMinUsdt,
    compensationMaxUsdt,
    compensationMinPi: piFromUsdt(compensationMinUsdt),
    compensationMaxPi: piFromUsdt(compensationMaxUsdt),
    compensationPeriod,
    piRateUsed: PI_USDT_RATE,
    category: String(body?.category || "Other")
      .trim()
      .slice(0, 80),
    summary: String(body?.summary || "")
      .trim()
      .slice(0, 4000),
    skills: Array.isArray(body?.skills)
      ? body.skills
          .map((skill: unknown) => String(skill).trim().slice(0, 50))
          .filter(Boolean)
          .slice(0, 20)
      : [],
    freelance: body?.type === "Project" || Boolean(body?.freelance),
    expiresAt: new Date(
      Date.now() +
        Math.max(1, Math.min(90, Number(body?.durationDays) || 30)) *
          86_400_000,
    ).toISOString(),
  };
};

const userId = (user: any) => user._id?.toString() || user.uid;
const isAdmin = (user: any) => user.role === "admin";
const isEmployer = (user: any) =>
  isAdmin(user) || user.role === "seller" || user.jobsRole === "employer";
const requireUser = async (req: Request, res: Response) => {
  const user = await resolveCurrentUser(req);
  if (!user)
    res.status(401).json({
      error: "unauthorized",
      message: "Sign in to use this Jobs feature.",
    });
  return user;
};
const requireEmployer = async (req: Request, res: Response) => {
  const user = await requireUser(req, res);
  if (user && !isEmployer(user)) {
    res.status(403).json({
      error: "employer_required",
      message: "Activate an employer account before managing opportunities.",
    });
    return null;
  }
  return user;
};
const audit = (
  req: Request,
  actor: any,
  action: string,
  targetId: string,
  details: Record<string, unknown> = {},
) =>
  req.app.locals.jobAuditCollection?.insertOne({
    actorId: userId(actor),
    action,
    targetId,
    details,
    createdAt: new Date().toISOString(),
  });
const safeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 80);
const documentId = (value: string) =>
  ObjectId.isValid(value) ? new ObjectId(value) : value;

const ensureSeedData = async (req: Request) => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 365 * 86_400_000).toISOString();
  if ((await req.app.locals.jobCollection.countDocuments({})) === 0)
    await req.app.locals.jobCollection.insertMany(
      seedJobs.map((job) => ({
        ...job,
        status: "active",
        moderationStatus: "approved",
        expiresAt,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      })),
    );
  const seededSlugs = seedCompanies.map((company) => company.slug);
  const existingSeedCompanies = await req.app.locals.jobCompanyCollection
    .find({ slug: { $in: seededSlugs } })
    .toArray();
  const existingSlugs = new Set(
    existingSeedCompanies.map((company: any) => company.slug),
  );
  const missingCompanies = seedCompanies.filter(
    (company) => !existingSlugs.has(company.slug),
  );
  if (missingCompanies.length)
    await req.app.locals.jobCompanyCollection.insertMany(
      missingCompanies.map((company) => ({
        ...company,
        moderationStatus: "approved",
        createdAt: now.toISOString(),
      })),
    );
  await req.app.locals.jobCollection.updateMany(
    { moderationStatus: { $exists: false } },
    { $set: { moderationStatus: "approved", expiresAt } },
  );
  await req.app.locals.jobCompanyCollection.updateMany(
    { moderationStatus: { $exists: false } },
    { $set: { moderationStatus: "approved" } },
  );
};

export default function mountJobsEndpoints(router: Router) {
  router.get("/metrics", async (req, res) => {
    await ensureSeedData(req);
    const [opportunities, employers, remote] = await Promise.all([
      req.app.locals.jobCollection.countDocuments(ACTIVE),
      req.app.locals.jobCompanyCollection.countDocuments({
        verified: true,
        moderationStatus: "approved",
      }),
      req.app.locals.jobCollection.countDocuments({
        ...ACTIVE,
        mode: "Remote",
      }),
    ]);
    res.json({
      metrics: {
        opportunities,
        verifiedEmployers: employers,
        remotePercent: opportunities
          ? Math.round((remote / opportunities) * 100)
          : 0,
      },
    });
  });
  router.get("/jobs", async (req, res) => {
    await ensureSeedData(req);
    const page = clampPage(req.query.page);
    const pageSize = clampPageSize(req.query.pageSize);
    const query: Record<string, any> = { ...ACTIVE };
    const search = String(req.query.search || "").trim();
    const location = String(req.query.location || "").trim();
    const category = String(req.query.category || "").trim();
    if (category && category !== "All") query.category = category;
    if (req.query.freelance === "true") query.freelance = true;
    if (location)
      query.location = { $regex: safeRegex(location), $options: "i" };
    if (search)
      query.$or = ["title", "company", "location", "category", "skills"].map(
        (field) => ({ [field]: { $regex: safeRegex(search), $options: "i" } }),
      );
    const [documents, total] = await Promise.all([
      req.app.locals.jobCollection
        .find(query)
        .sort({ featured: -1, createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray(),
      req.app.locals.jobCollection.countDocuments(query),
    ]);
    res.json({
      jobs: documents.map(serializeJobDocument),
      pagination: { page, pageSize, total, pages: Math.ceil(total / pageSize) },
    });
  });
  router.get("/jobs/:id", async (req, res) => {
    await ensureSeedData(req);
    const document = await req.app.locals.jobCollection.findOne({
      slug: req.params.id,
      ...ACTIVE,
    });
    if (!document)
      return res
        .status(404)
        .json({ error: "not_found", message: "Job not found." });
    res.json({ job: serializeJobDocument(document) });
  });
  router.post("/employer/enroll", async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    await req.app.locals.userCollection.updateOne(
      { _id: user._id },
      { $set: { jobsRole: "employer", updatedAt: new Date().toISOString() } },
    );
    await audit(req, user, "employer.enrolled", userId(user));
    res.json({ role: "employer" });
  });
  router.post("/companies", async (req, res) => {
    const user = await requireEmployer(req, res);
    if (!user) return;
    const name = String(req.body?.name || "")
      .trim()
      .slice(0, 120);
    if (name.length < 2)
      return res.status(400).json({
        error: "invalid_company",
        message: "Company name is required.",
      });
    const ownerId = userId(user);
    const existing = await req.app.locals.jobCompanyCollection.findOne({
      ownerId,
    });
    if (existing)
      return res.status(409).json({
        error: "company_exists",
        company: serializeJobDocument(existing),
      });
    const slug = `${name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70)}-${Date.now().toString(36)}`;
    const company = {
      slug,
      name,
      field: String(req.body?.field || "Other")
        .trim()
        .slice(0, 100),
      mark: name
        .split(/\s+/)
        .map((word: string) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      ownerId,
      verified: false,
      moderationStatus: "pending",
      createdAt: new Date().toISOString(),
    };
    await req.app.locals.jobCompanyCollection.insertOne(company);
    await audit(req, user, "company.created", slug);
    res.status(201).json({ company: serializeJobDocument(company) });
  });
  router.post("/jobs", async (req, res) => {
    const user = await requireEmployer(req, res);
    if (!user) return;
    const job = cleanJobInput(req.body);
    const company = await req.app.locals.jobCompanyCollection.findOne({
      slug: job.companyId,
    });
    if (!company || (!isAdmin(user) && company.ownerId !== userId(user)))
      return res.status(403).json({
        error: "company_forbidden",
        message: "You may only post for a company you own.",
      });
    if (
      !job.title ||
      !job.location ||
      !job.salary ||
      !Number.isFinite(job.compensationMinUsdt) ||
      job.compensationMinUsdt <= 0 ||
      job.compensationMaxUsdt < job.compensationMinUsdt ||
      job.summary.length < 30
    )
      return res.status(400).json({
        error: "invalid_job",
        message:
          "Title, location, compensation, and a detailed description are required.",
      });
    const slug = `${job.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80)}-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const document = {
      ...job,
      slug,
      company: company.name,
      employerId: userId(user),
      status: "draft",
      moderationStatus: "pending",
      featured: false,
      createdAt: now,
      updatedAt: now,
    };
    await req.app.locals.jobCollection.insertOne(document);
    await audit(req, user, "job.created", slug, { companyId: company.slug });
    res.status(201).json({ job: serializeJobDocument(document) });
  });
  router.get("/companies", async (req, res) => {
    await ensureSeedData(req);
    const companies = await req.app.locals.jobCompanyCollection
      .find({ moderationStatus: "approved", $or: [{ slug: { $in: seedCompanies.map(company => company.slug) } }, { ownerId: { $exists: true } }] })
      .sort({ directoryPriority: 1, name: 1 })
      .toArray();
    const results = await Promise.all(
      companies.map(async (company: any) => ({
        ...serializeJobDocument(company),
        openings: await req.app.locals.jobCollection.countDocuments({
          companyId: company.slug,
          ...ACTIVE,
        }),
      })),
    );
    res.json({ companies: results });
  });
  router.get("/companies/:id", async (req, res) => {
    await ensureSeedData(req);
    const company = await req.app.locals.jobCompanyCollection.findOne({
      slug: req.params.id,
      moderationStatus: "approved",
    });
    if (!company)
      return res
        .status(404)
        .json({ error: "not_found", message: "Company not found." });
    const openings = await req.app.locals.jobCollection
      .find({ companyId: company.slug, ...ACTIVE })
      .toArray();
    res.json({
      company: serializeJobDocument(company),
      jobs: openings.map(serializeJobDocument),
    });
  });
  router.get("/profile", async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    const profile = await req.app.locals.jobProfileCollection.findOne({
      userId: userId(user),
    });
    res.json({ profile: serializeJobDocument(profile) });
  });
  router.patch("/preferences", async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    const jobsMode = ["candidate", "employer", "both"].includes(req.body?.jobsMode) ? req.body.jobsMode : "candidate";
    const preferences = {
      jobsMode,
      minimumPayUsdt: Math.max(0, Number(req.body?.minimumPayUsdt) || 0),
      payPeriod: ["hour", "day", "week", "month", "year"].includes(req.body?.payPeriod) ? req.body.payPeriod : "hour",
      preferredLocations: Array.isArray(req.body?.preferredLocations) ? req.body.preferredLocations.map((value: unknown) => String(value).trim().slice(0, 120)).filter(Boolean).slice(0, 5) : [],
      remotePreference: ["all", "remote", "onsite"].includes(req.body?.remotePreference) ? req.body.remotePreference : "all",
      openToAnywhere: Boolean(req.body?.openToAnywhere),
      preferredTitles: Array.isArray(req.body?.preferredTitles) ? req.body.preferredTitles.map((value: unknown) => String(value).trim().slice(0, 120)).filter(Boolean).slice(0, 10) : [],
      preferredCategories: Array.isArray(req.body?.preferredCategories) ? req.body.preferredCategories.map((value: unknown) => String(value).trim().slice(0, 80)).filter(Boolean).slice(0, 10) : [],
      updatedAt: new Date().toISOString(),
    };
    await req.app.locals.jobProfileCollection.updateOne({ userId: userId(user) }, { $set: preferences, $setOnInsert: { userId: userId(user), createdAt: new Date().toISOString() } }, { upsert: true });
    if (jobsMode === "employer" || jobsMode === "both") await req.app.locals.userCollection.updateOne({ _id: user._id }, { $set: { jobsRole: "employer" } });
    await audit(req, user, "preferences.updated", userId(user), { jobsMode });
    res.json({ preferences });
  });
  router.put("/profile", async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    const profile = {
      title: String(req.body?.title || "")
        .trim()
        .slice(0, 120),
      skills: String(req.body?.skills || "")
        .split(",")
        .map((x: string) => x.trim())
        .filter(Boolean)
        .slice(0, 30),
      location: String(req.body?.location || "")
        .trim()
        .slice(0, 120),
      availability: String(req.body?.availability || "Open to offers").slice(
        0,
        40,
      ),
      portfolio: String(req.body?.portfolio || "")
        .trim()
        .slice(0, 500),
      summary: String(req.body?.summary || "")
        .trim()
        .slice(0, 3000),
      updatedAt: new Date().toISOString(),
    };
    if (!profile.title || profile.summary.length < 30)
      return res.status(400).json({
        error: "invalid_profile",
        message: "A title and professional summary are required.",
      });
    await req.app.locals.jobProfileCollection.updateOne(
      { userId: userId(user) },
      {
        $set: profile,
        $setOnInsert: {
          userId: userId(user),
          createdAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    );
    await audit(req, user, "profile.updated", userId(user));
    res.json({ profile: { ...profile, id: userId(user) } });
  });
  router.get("/saved", async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    const records = await req.app.locals.jobSavedCollection
      .find({ userId: userId(user) })
      .toArray();
    const slugs = records.map((r: any) => r.jobId);
    const jobs = slugs.length
      ? await req.app.locals.jobCollection
          .find({ slug: { $in: slugs }, ...ACTIVE })
          .toArray()
      : [];
    res.json({ jobs: jobs.map(serializeJobDocument) });
  });
  router.put("/saved/:jobId", async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    const key = { userId: userId(user), jobId: req.params.jobId };
    const existing = await req.app.locals.jobSavedCollection.findOne(key);
    if (existing) {
      await req.app.locals.jobSavedCollection.deleteOne(key);
      return res.json({ saved: false });
    }
    await req.app.locals.jobSavedCollection.insertOne({
      ...key,
      createdAt: new Date().toISOString(),
    });
    res.json({ saved: true });
  });
  router.get("/applications", async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    const applications = await req.app.locals.jobApplicationCollection
      .find({ candidateId: userId(user) })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ applications: applications.map(serializeJobDocument) });
  });
  router.post("/jobs/:jobId/apply", async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    const job = await req.app.locals.jobCollection.findOne({
      slug: req.params.jobId,
      ...ACTIVE,
    });
    if (!job)
      return res
        .status(404)
        .json({ error: "not_found", message: "Job not found." });
    const key = { candidateId: userId(user), jobId: req.params.jobId };
    if (await req.app.locals.jobApplicationCollection.findOne(key))
      return res
        .status(409)
        .json({ error: "already_applied", message: "You already applied." });
    const profile = await req.app.locals.jobProfileCollection.findOne({
      userId: userId(user),
    });
    if (!profile)
      return res.status(400).json({
        error: "profile_required",
        message: "Complete your professional profile before applying.",
      });
    const now = new Date().toISOString();
    const application = {
      ...key,
      employerId: job.employerId,
      jobTitle: job.title,
      company: job.company,
      coverNote: String(req.body?.coverNote || "")
        .trim()
        .slice(0, 2000),
      profileSnapshot: {
        title: profile.title,
        skills: profile.skills,
        location: profile.location,
        portfolio: profile.portfolio,
        summary: profile.summary,
      },
      status: "submitted",
      statusHistory: [{ status: "submitted", at: now, actorId: userId(user) }],
      createdAt: now,
      updatedAt: now,
    };
    const result =
      await req.app.locals.jobApplicationCollection.insertOne(application);
    await audit(req, user, "application.created", req.params.jobId);
    res.status(201).json({
      application: serializeJobDocument({
        ...application,
        _id: result.insertedId,
      }),
    });
  });
  router.patch("/applications/:id/withdraw", async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    const application = await req.app.locals.jobApplicationCollection.findOne({
      _id: documentId(req.params.id),
      candidateId: userId(user),
    });
    if (!application) return res.status(404).json({ error: "not_found" });
    const now = new Date().toISOString();
    await req.app.locals.jobApplicationCollection.updateOne(
      { _id: application._id },
      {
        $set: { status: "withdrawn", updatedAt: now },
        $push: {
          statusHistory: {
            status: "withdrawn",
            at: now,
            actorId: userId(user),
          },
        },
      },
    );
    await audit(req, user, "application.withdrawn", req.params.id);
    res.json({ status: "withdrawn" });
  });
  router.get("/employer/dashboard", async (req, res) => {
    const user = await requireEmployer(req, res);
    if (!user) return;
    const owner = userId(user);
    const jobs = await req.app.locals.jobCollection
      .find(isAdmin(user) ? {} : { employerId: owner })
      .sort({ createdAt: -1 })
      .toArray();
    const applications = await req.app.locals.jobApplicationCollection
      .find(isAdmin(user) ? {} : { employerId: owner })
      .sort({ createdAt: -1 })
      .toArray();
    const companies = await req.app.locals.jobCompanyCollection
      .find(isAdmin(user) ? {} : { ownerId: owner })
      .toArray();
    res.json({
      jobs: jobs.map(serializeJobDocument),
      applications: applications.map(serializeJobDocument),
      companies: companies.map(serializeJobDocument),
    });
  });
  router.patch("/employer/applications/:id", async (req, res) => {
    const user = await requireEmployer(req, res);
    if (!user) return;
    const status = String(req.body?.status || "");
    if (!APPLICATION_STATUSES.includes(status) || status === "withdrawn")
      return res.status(400).json({ error: "invalid_status" });
    const application = await req.app.locals.jobApplicationCollection.findOne({
      _id: documentId(req.params.id),
    });
    if (
      !application ||
      (!isAdmin(user) && application.employerId !== userId(user))
    )
      return res.status(404).json({ error: "not_found" });
    const now = new Date().toISOString();
    await req.app.locals.jobApplicationCollection.updateOne(
      { _id: application._id },
      {
        $set: { status, updatedAt: now },
        $push: { statusHistory: { status, at: now, actorId: userId(user) } },
      },
    );
    await audit(req, user, "application.status_changed", req.params.id, {
      status,
    });
    res.json({ status });
  });
  router.patch("/admin/jobs/:id/moderate", async (req, res) => {
    const user = await requireEmployer(req, res);
    if (!user || !isAdmin(user))
      return user
        ? res.status(403).json({ error: "admin_required" })
        : undefined;
    const moderationStatus = ["approved", "rejected"].includes(req.body?.status)
      ? req.body.status
      : "pending";
    const status = moderationStatus === "approved" ? "active" : "draft";
    await req.app.locals.jobCollection.updateOne(
      { slug: req.params.id },
      {
        $set: {
          moderationStatus,
          status,
          moderatedAt: new Date().toISOString(),
          moderatorId: userId(user),
        },
      },
    );
    await audit(req, user, "job.moderated", req.params.id, {
      moderationStatus,
    });
    res.json({ moderationStatus, status });
  });
  router.patch("/admin/companies/:id/moderate", async (req, res) => {
    const user = await requireEmployer(req, res);
    if (!user || !isAdmin(user))
      return user
        ? res.status(403).json({ error: "admin_required" })
        : undefined;
    const moderationStatus = ["approved", "rejected"].includes(req.body?.status)
      ? req.body.status
      : "pending";
    await req.app.locals.jobCompanyCollection.updateOne(
      { slug: req.params.id },
      {
        $set: {
          moderationStatus,
          verified: moderationStatus === "approved",
          moderatedAt: new Date().toISOString(),
          moderatorId: userId(user),
        },
      },
    );
    await audit(req, user, "company.moderated", req.params.id, {
      moderationStatus,
    });
    res.json({ moderationStatus });
  });
}
