import type { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";
import { resolveCurrentUser } from "../services/auth";

const seedJobs = [
  { slug: "product-designer", title: "Senior Product Designer", companyId: "pioneer-labs", company: "Pioneer Labs", location: "Remote", type: "Full time", mode: "Remote", salary: "1,800–2,400 Pi / mo", category: "Design", featured: true, freelance: false, summary: "Shape trusted marketplace experiences used by a growing global Pi community.", skills: ["Figma", "Design systems", "Research"] },
  { slug: "react-engineer", title: "React Frontend Engineer", companyId: "orbit-commerce", company: "Orbit Commerce", location: "Lagos, Nigeria", type: "Full time", mode: "Hybrid", salary: "2,200–3,000 Pi / mo", category: "Engineering", featured: true, freelance: false, summary: "Build fast, accessible commerce tools for merchants and customers.", skills: ["React", "TypeScript", "APIs"] },
  { slug: "community-lead", title: "Community Growth Lead", companyId: "piworks-africa", company: "PiWorks Africa", location: "Accra, Ghana", type: "Contract", mode: "Remote", salary: "900–1,200 Pi / mo", category: "Marketing", featured: false, freelance: false, summary: "Grow a welcoming community through partnerships, events and content.", skills: ["Community", "Content", "Analytics"] },
  { slug: "mobile-audit", title: "Mobile UX Audit", companyId: "nova-health", company: "Nova Health", location: "Remote", type: "Project", mode: "Remote", salary: "350 Pi fixed", category: "Design", featured: false, freelance: true, summary: "Review an existing health app and deliver an actionable UX report.", skills: ["UX audit", "Mobile", "Accessibility"] },
  { slug: "api-integration", title: "Payment API Integration", companyId: "sahara-market", company: "Sahara Market", location: "Remote", type: "Project", mode: "Remote", salary: "600 Pi fixed", category: "Engineering", featured: false, freelance: true, summary: "Connect a marketplace checkout to a documented payment API.", skills: ["Node.js", "REST", "Payments"] },
  { slug: "support-specialist", title: "Customer Support Specialist", companyId: "smaj-services", company: "SMAJ Services", location: "Dakar, Senegal", type: "Part time", mode: "Hybrid", salary: "650–850 Pi / mo", category: "Operations", featured: false, freelance: false, summary: "Help customers and providers complete their service journeys.", skills: ["Support", "French", "English"] },
];

const seedCompanies = [
  { slug: "pioneer-labs", name: "Pioneer Labs", field: "Product & technology", mark: "PL", verified: true },
  { slug: "orbit-commerce", name: "Orbit Commerce", field: "E-commerce", mark: "OC", verified: true },
  { slug: "piworks-africa", name: "PiWorks Africa", field: "Community", mark: "PA", verified: true },
  { slug: "smaj-services", name: "SMAJ Services", field: "Digital services", mark: "SS", verified: true },
  { slug: "nova-health", name: "Nova Health", field: "Health technology", mark: "NH", verified: true },
  { slug: "sahara-market", name: "Sahara Market", field: "Commerce", mark: "SM", verified: true },
];

const serialize = (document: any) => document ? {
  ...document,
  _id: undefined,
  id: document.slug || document._id?.toString(),
} : null;

const requireUser = async (req: Request, res: Response) => {
  const user = await resolveCurrentUser(req);
  if (!user) res.status(401).json({ error: "unauthorized", message: "Sign in to use this Jobs feature." });
  return user;
};

const ensureSeedData = async (req: Request) => {
  const jobs = req.app.locals.jobCollection;
  const companies = req.app.locals.jobCompanyCollection;
  if (await jobs.countDocuments({}) === 0) {
    const now = new Date().toISOString();
    await jobs.insertMany(seedJobs.map(job => ({ ...job, status: "active", createdAt: now, updatedAt: now })));
  }
  if (await companies.countDocuments({}) === 0) {
    await companies.insertMany(seedCompanies.map(company => ({ ...company, createdAt: new Date().toISOString() })));
  }
};

const cleanJob = (body: any) => ({
  title: String(body?.title || "").trim().slice(0, 120),
  company: String(body?.company || "").trim().slice(0, 120),
  companyId: String(body?.companyId || "").trim().slice(0, 120),
  location: String(body?.location || "").trim().slice(0, 120),
  type: ["Full time", "Part time", "Contract", "Project"].includes(body?.type) ? body.type : "Full time",
  mode: ["Remote", "Hybrid", "On-site"].includes(body?.mode) ? body.mode : "Remote",
  salary: String(body?.salary || "").trim().slice(0, 120),
  category: String(body?.category || "Other").trim().slice(0, 80),
  summary: String(body?.summary || "").trim().slice(0, 4000),
  skills: Array.isArray(body?.skills) ? body.skills.map((skill: unknown) => String(skill).trim().slice(0, 50)).filter(Boolean).slice(0, 20) : [],
  freelance: body?.type === "Project" || Boolean(body?.freelance),
});

export default function mountJobsEndpoints(router: Router) {
  router.get("/jobs", async (req, res) => {
    await ensureSeedData(req);
    const query: Record<string, any> = { status: "active" };
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();
    if (category && category !== "All") query.category = category;
    if (String(req.query.freelance || "") === "true") query.freelance = true;
    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 80);
      query.$or = ["title", "company", "location", "category"].map(field => ({ [field]: { $regex: safe, $options: "i" } }));
    }
    const documents = await req.app.locals.jobCollection.find(query).sort({ featured: -1, createdAt: -1 }).limit(100).toArray();
    res.json({ jobs: documents.map(serialize) });
  });

  router.get("/jobs/:id", async (req, res) => {
    await ensureSeedData(req);
    const document = await req.app.locals.jobCollection.findOne({ slug: req.params.id, status: "active" });
    if (!document) return res.status(404).json({ error: "not_found", message: "Job not found." });
    res.json({ job: serialize(document) });
  });

  router.post("/jobs", async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    const job = cleanJob(req.body);
    if (!job.title || !job.company || !job.location || !job.salary || job.summary.length < 30) {
      return res.status(400).json({ error: "invalid_job", message: "Title, company, location, compensation, and a detailed description are required." });
    }
    const baseSlug = job.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;
    const document = { ...job, slug, employerId: user._id.toString(), status: "active", featured: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await req.app.locals.jobCollection.insertOne(document);
    res.status(201).json({ job: serialize(document) });
  });

  router.get("/companies", async (req, res) => {
    await ensureSeedData(req);
    const companies = await req.app.locals.jobCompanyCollection.find({}).sort({ name: 1 }).toArray();
    const results = await Promise.all(companies.map(async (company: any) => ({
      ...serialize(company),
      openings: await req.app.locals.jobCollection.countDocuments({ companyId: company.slug, status: "active" }),
    })));
    res.json({ companies: results });
  });

  router.get("/companies/:id", async (req, res) => {
    await ensureSeedData(req);
    const company = await req.app.locals.jobCompanyCollection.findOne({ slug: req.params.id });
    if (!company) return res.status(404).json({ error: "not_found", message: "Company not found." });
    const openings = await req.app.locals.jobCollection.find({ companyId: company.slug, status: "active" }).toArray();
    res.json({ company: serialize(company), jobs: openings.map(serialize) });
  });

  router.get("/saved", async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    const records = await req.app.locals.jobSavedCollection.find({ userId: user._id.toString() }).toArray();
    const slugs = records.map((record: any) => record.jobId);
    const jobs = slugs.length ? await req.app.locals.jobCollection.find({ slug: { $in: slugs }, status: "active" }).toArray() : [];
    res.json({ jobs: jobs.map(serialize) });
  });

  router.put("/saved/:jobId", async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    const key = { userId: user._id.toString(), jobId: req.params.jobId };
    const existing = await req.app.locals.jobSavedCollection.findOne(key);
    if (existing) {
      await req.app.locals.jobSavedCollection.deleteOne(key);
      return res.json({ saved: false });
    }
    await req.app.locals.jobSavedCollection.insertOne({ ...key, createdAt: new Date().toISOString() });
    res.json({ saved: true });
  });

  router.get("/applications", async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    const applications = await req.app.locals.jobApplicationCollection.find({ candidateId: user._id.toString() }).sort({ createdAt: -1 }).toArray();
    res.json({ applications: applications.map(serialize) });
  });

  router.post("/jobs/:jobId/apply", async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    const job = await req.app.locals.jobCollection.findOne({ slug: req.params.jobId, status: "active" });
    if (!job) return res.status(404).json({ error: "not_found", message: "Job not found." });
    const key = { candidateId: user._id.toString(), jobId: req.params.jobId };
    if (await req.app.locals.jobApplicationCollection.findOne(key)) {
      return res.status(409).json({ error: "already_applied", message: "You already applied for this opportunity." });
    }
    const application = { ...key, jobTitle: job.title, company: job.company, coverNote: String(req.body?.coverNote || "").trim().slice(0, 2000), status: "submitted", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const result = await req.app.locals.jobApplicationCollection.insertOne(application);
    res.status(201).json({ application: serialize({ ...application, _id: result.insertedId }) });
  });
}
