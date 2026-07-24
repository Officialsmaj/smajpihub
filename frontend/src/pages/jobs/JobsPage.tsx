import { useMemo, useState } from "react";
import { Link, NavLink, useParams, useSearchParams } from "react-router-dom";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import AppLayout from "../../layouts/AppLayout";
import JobsHeader from "./JobsHeader";
import "./JobsPage.css";

export type JobsPageKind =
  | "home" | "search" | "freelance" | "companies" | "saved"
  | "applications" | "profile" | "post" | "employer" | "job" | "company";

type Job = {
  id: string; title: string; company: string; location: string; type: string;
  mode: string; salary: string; category: string; featured?: boolean; freelance?: boolean;
  summary: string; skills: string[];
};

const jobs: Job[] = [
  { id: "product-designer", title: "Senior Product Designer", company: "Pioneer Labs", location: "Remote", type: "Full time", mode: "Remote", salary: "1,800–2,400 Pi / mo", category: "Design", featured: true, summary: "Shape trusted marketplace experiences used by a growing global Pi community.", skills: ["Figma", "Design systems", "Research"] },
  { id: "react-engineer", title: "React Frontend Engineer", company: "Orbit Commerce", location: "Lagos, Nigeria", type: "Full time", mode: "Hybrid", salary: "2,200–3,000 Pi / mo", category: "Engineering", featured: true, summary: "Build fast, accessible commerce tools for merchants and customers.", skills: ["React", "TypeScript", "APIs"] },
  { id: "community-lead", title: "Community Growth Lead", company: "PiWorks Africa", location: "Accra, Ghana", type: "Contract", mode: "Remote", salary: "900–1,200 Pi / mo", category: "Marketing", summary: "Grow a welcoming community through partnerships, events and content.", skills: ["Community", "Content", "Analytics"] },
  { id: "mobile-audit", title: "Mobile UX Audit", company: "Nova Health", location: "Remote", type: "Project", mode: "Remote", salary: "350 Pi fixed", category: "Design", freelance: true, summary: "Review an existing health app and deliver an actionable UX report.", skills: ["UX audit", "Mobile", "Accessibility"] },
  { id: "api-integration", title: "Payment API Integration", company: "Sahara Market", location: "Remote", type: "Project", mode: "Remote", salary: "600 Pi fixed", category: "Engineering", freelance: true, summary: "Connect a marketplace checkout to a documented payment API.", skills: ["Node.js", "REST", "Payments"] },
  { id: "support-specialist", title: "Customer Support Specialist", company: "SMAJ Services", location: "Dakar, Senegal", type: "Part time", mode: "Hybrid", salary: "650–850 Pi / mo", category: "Operations", summary: "Help customers and providers complete their service journeys.", skills: ["Support", "French", "English"] },
];

const companies = [
  { id: "pioneer-labs", name: "Pioneer Labs", field: "Product & technology", openings: 6, mark: "PL" },
  { id: "orbit-commerce", name: "Orbit Commerce", field: "E-commerce", openings: 4, mark: "OC" },
  { id: "piworks-africa", name: "PiWorks Africa", field: "Community", openings: 3, mark: "PA" },
  { id: "smaj-services", name: "SMAJ Services", field: "Digital services", openings: 8, mark: "SS" },
];

const JobCard = ({ job, saved, onSave }: { job: Job; saved: boolean; onSave: () => void }) => (
  <article className="job-card">
    <div className="job-company-mark">{job.company.split(" ").map(word => word[0]).join("").slice(0, 2)}</div>
    <div className="job-card-main">
      <div className="job-card-top">
        <span>{job.company} <CheckCircleRoundedIcon /></span>
        <small>{job.featured ? "Featured" : "Recently added"}</small>
      </div>
      <Link to={`/services/jobs/job/${job.id}`}>{job.title}</Link>
      <p><LocationOnOutlinedIcon /> {job.location} · {job.mode} · {job.type}</p>
      <div>{job.skills.map(skill => <span key={skill}>{skill}</span>)}</div>
      <strong>{job.salary}</strong>
    </div>
    <button className={saved ? "saved" : ""} type="button" onClick={onSave} aria-label={`Save ${job.title}`}>
      <BookmarkBorderRoundedIcon />
    </button>
  </article>
);

const JobsPage = ({ kind = "home" }: { kind?: JobsPageKind }) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const effectiveQuery = query || searchParams.get("q") || "";
  const visibleJobs = useMemo(() => jobs.filter(job => {
    const text = `${job.title} ${job.company} ${job.location} ${job.skills.join(" ")}`.toLowerCase();
    return text.includes(effectiveQuery.toLowerCase()) && (category === "All" || job.category === category);
  }), [effectiveQuery, category]);
  const toggleSaved = (jobId: string) => setSaved(current => {
    const next = new Set(current);
    if (next.has(jobId)) next.delete(jobId); else next.add(jobId);
    return next;
  });

  const listings = kind === "freelance" ? visibleJobs.filter(job => job.freelance)
    : kind === "saved" ? visibleJobs.filter(job => saved.has(job.id)) : visibleJobs;
  const selectedJob = jobs.find(job => job.id === id);
  const selectedCompany = companies.find(company => company.id === id);

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="jobs-page">
        <JobsHeader query={query} onQueryChange={setQuery} />
        {kind === "home" ? (
          <>
            <section className="jobs-hero">
              <div>
                <span className="jobs-kicker">VERIFIED TALENT. REAL OPPORTUNITIES.</span>
                <h1>Build your future in the <em>Pi economy.</em></h1>
                <p>Find trusted jobs and freelance projects, connect with verified employers, and get paid in Pi.</p>
                <form onSubmit={event => event.preventDefault()}>
                  <label><SearchRoundedIcon /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Job title, skill or company" /></label>
                  <label><LocationOnOutlinedIcon /><input placeholder="City or Remote" /></label>
                  <Link to={`/services/jobs/search${query ? `?q=${encodeURIComponent(query)}` : ""}`}>Search jobs</Link>
                </form>
                <small>Popular: React · Design · Marketing · Customer support</small>
              </div>
              <aside>
                <span>OPPORTUNITY SNAPSHOT</span>
                <strong>1,240+</strong><p>active opportunities</p>
                <div><b>420</b><small>Verified employers</small></div>
                <div><b>68%</b><small>Remote friendly</small></div>
                <div><b>100%</b><small>Pi-powered</small></div>
              </aside>
            </section>
            <section className="jobs-section">
              <header><div><span className="jobs-kicker">CURATED FOR YOU</span><h2>Featured opportunities</h2></div><Link to="/services/jobs/search">View all <ArrowForwardRoundedIcon /></Link></header>
              <div className="jobs-list">{jobs.filter(job => job.featured).map(job => <JobCard key={job.id} job={job} saved={saved.has(job.id)} onSave={() => toggleSaved(job.id)} />)}</div>
            </section>
            <section className="jobs-section jobs-categories">
              <header><div><span className="jobs-kicker">EXPLORE</span><h2>Find work by category</h2></div></header>
              <div>{["Engineering", "Design", "Marketing", "Operations"].map((name, index) => <Link key={name} to={`/services/jobs/search?q=${name}`}><span>{["⌘", "✦", "↗", "◎"][index]}</span><b>{name}</b><small>{18 + index * 11} open roles</small></Link>)}</div>
            </section>
            <section className="jobs-cta"><div><span className="jobs-kicker">FOR EMPLOYERS</span><h2>Meet talent that is ready to build.</h2><p>Publish a role, review verified profiles and manage candidates in one place.</p></div><Link to="/services/jobs/post">Post your first job <ArrowForwardRoundedIcon /></Link></section>
          </>
        ) : kind === "companies" ? (
          <section className="jobs-directory"><div className="jobs-page-heading"><span className="jobs-kicker">TRUSTED ORGANIZATIONS</span><h1>Explore companies</h1><p>Discover verified teams building products and services across the Pi ecosystem.</p></div><div className="company-grid">{companies.map(company => <Link to={`/services/jobs/company/${company.id}`} key={company.id}><span>{company.mark}</span><h2>{company.name} <CheckCircleRoundedIcon /></h2><p>{company.field}</p><b>{company.openings} open opportunities</b></Link>)}</div></section>
        ) : kind === "job" && selectedJob ? (
          <section className="job-detail"><Link to="/services/jobs/search">← Back to jobs</Link><div className="job-detail-grid"><article><span className="jobs-kicker">{selectedJob.company} · VERIFIED</span><h1>{selectedJob.title}</h1><p><LocationOnOutlinedIcon /> {selectedJob.location} · {selectedJob.mode} · {selectedJob.type}</p><div className="job-detail-actions"><button>Apply now</button><button onClick={() => toggleSaved(selectedJob.id)}>Save job</button></div><h2>About the role</h2><p>{selectedJob.summary} You will collaborate with a distributed team, own meaningful outcomes and help create reliable digital experiences.</p><h2>What you will bring</h2><ul><li>Strong practical experience in your discipline.</li><li>Clear communication and thoughtful collaboration.</li><li>A portfolio or examples of relevant work.</li></ul><h2>Skills</h2><div className="job-skills">{selectedJob.skills.map(skill => <span key={skill}>{skill}</span>)}</div></article><aside><b>{selectedJob.salary}</b><p>Paid through the Pi ecosystem</p><hr/><span>Category</span><strong>{selectedJob.category}</strong><span>Work type</span><strong>{selectedJob.type}</strong><span>Location</span><strong>{selectedJob.location}</strong></aside></div></section>
        ) : kind === "company" && selectedCompany ? (
          <section className="jobs-directory"><div className="company-hero"><span>{selectedCompany.mark}</span><div><small>VERIFIED EMPLOYER</small><h1>{selectedCompany.name}</h1><p>{selectedCompany.field} · Building useful products for the Pi community.</p></div></div><div className="jobs-page-heading"><h2>Open opportunities</h2></div><div className="jobs-list">{jobs.filter(job => job.company === selectedCompany.name).map(job => <JobCard key={job.id} job={job} saved={saved.has(job.id)} onSave={() => toggleSaved(job.id)} />)}</div></section>
        ) : kind === "post" || kind === "profile" || kind === "employer" || kind === "applications" ? (
          <section className="jobs-workspace"><div className="jobs-page-heading"><span className="jobs-kicker">{kind === "post" ? "EMPLOYER WORKSPACE" : "YOUR JOBS WORKSPACE"}</span><h1>{kind === "post" ? "Post a new opportunity" : kind === "profile" ? "Professional profile" : kind === "employer" ? "Employer dashboard" : "Applications"}</h1><p>Everything you need to manage your next step in the Pi economy.</p></div>{kind === "post" ? <form className="job-form"><label>Job title<input placeholder="e.g. Product Designer" /></label><label>Company<input placeholder="Your company" /></label><div><label>Location<input placeholder="Remote or city" /></label><label>Job type<select><option>Full time</option><option>Part time</option><option>Contract</option><option>Project</option></select></label></div><label>Description<textarea rows={6} placeholder="Describe the opportunity, responsibilities and requirements" /></label><label>Compensation in Pi<input placeholder="e.g. 1,200–1,600 Pi / month" /></label><button type="button">Preview job</button></form> : <div className="workspace-empty"><WorkOutlineRoundedIcon /><h2>{kind === "applications" ? "No active applications yet" : "Your workspace is ready"}</h2><p>Sign in with your Pi account to securely manage this area.</p><Link to="/services/jobs/search">Explore opportunities</Link></div>}</section>
        ) : (
          <section className="jobs-directory"><div className="jobs-page-heading"><span className="jobs-kicker">{kind === "freelance" ? "PROJECT-BASED WORK" : kind === "saved" ? "YOUR SHORTLIST" : "DISCOVER OPPORTUNITIES"}</span><h1>{kind === "freelance" ? "Freelance projects" : kind === "saved" ? "Saved jobs" : "Find your next role"}</h1><p>{listings.length} opportunities match your search.</p></div><div className="jobs-results-layout"><aside><b>Filter jobs</b>{["All", "Engineering", "Design", "Marketing", "Operations"].map(item => <button className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}</aside><div className="jobs-list">{listings.map(job => <JobCard key={job.id} job={job} saved={saved.has(job.id)} onSave={() => toggleSaved(job.id)} />)}{!listings.length ? <div className="workspace-empty"><SearchRoundedIcon /><h2>No opportunities found</h2><p>Try another search or category.</p></div> : null}</div></div></section>
        )}
        <nav className="jobs-mobile-nav"><NavLink end to="/services/jobs"><HomeRoundedIcon /><span>Home</span></NavLink><NavLink to="/services/jobs/search"><SearchRoundedIcon /><span>Jobs</span></NavLink><NavLink to="/services/jobs/saved"><BookmarkBorderRoundedIcon /><span>Saved</span></NavLink><NavLink to="/services/jobs/applications"><WorkOutlineRoundedIcon /><span>Applications</span></NavLink><NavLink to="/services/jobs/companies"><BusinessRoundedIcon /><span>Companies</span></NavLink></nav>
      </main>
    </AppLayout>
  );
};

export default JobsPage;
