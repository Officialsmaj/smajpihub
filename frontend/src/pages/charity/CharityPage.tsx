import { useMemo, useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate, useParams, useSearchParams } from "react-router-dom";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import AppLayout from "../../layouts/AppLayout";
import ServiceMobileMenu from "../../components/ServiceMobileMenu";
import { formatServicePrice, piFromUsdt, PI_USDT_RATE, usdtFromPi } from "../../lib/piPricing";
import "./CharityPage.css";

export type CharityPageKind =
  | "home"
  | "discover"
  | "saved"
  | "donations"
  | "fundraise"
  | "dashboard"
  | "campaign"
  | "checkout"
  | "receipt"
  | "organization";

type Campaign = {
  id: string;
  title: string;
  category: string;
  raised: number;
  goal: number;
  donors: number;
  days: number;
  location: string;
  image: string;
  organization: string;
  organizationId: string;
  summary: string;
  updates: string[];
};

const campaigns: Campaign[] = [
  {
    id: "clean-water-kibera",
    title: "Clean water for 2,000 families",
    category: "Water",
    raised: 18420,
    goal: 25000,
    donors: 864,
    days: 18,
    location: "Nairobi, Kenya",
    image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&q=85",
    organization: "Water Forward Africa",
    organizationId: "water-forward",
    summary: "Install community water points, filtration systems, and train local maintenance teams.",
    updates: ["First borehole survey completed", "Local water committee formed", "Filtration equipment ordered"],
  },
  {
    id: "school-supplies",
    title: "Back-to-school kits for rural learners",
    category: "Education",
    raised: 6720,
    goal: 10000,
    donors: 412,
    days: 25,
    location: "Kumasi, Ghana",
    image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=1200&q=85",
    organization: "Learning Bridge",
    organizationId: "learning-bridge",
    summary: "Provide books, uniforms, solar study lamps, and learning materials to 500 students.",
    updates: ["Three schools confirmed", "First 200 kits assembled", "Volunteer delivery team ready"],
  },
  {
    id: "mobile-health-clinic",
    title: "Mobile maternal health clinic",
    category: "Health",
    raised: 29800,
    goal: 42000,
    donors: 1205,
    days: 12,
    location: "Kaduna, Nigeria",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=85",
    organization: "Care Routes Initiative",
    organizationId: "care-routes",
    summary: "Equip a mobile clinic to deliver prenatal care and essential screening in remote communities.",
    updates: ["Vehicle secured", "Medical team recruited", "Equipment procurement is 60% complete"],
  },
  {
    id: "community-food-bank",
    title: "Stock a community food bank",
    category: "Food",
    raised: 4100,
    goal: 8500,
    donors: 286,
    days: 31,
    location: "Dakar, Senegal",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=85",
    organization: "Neighbourhood Table",
    organizationId: "neighbourhood-table",
    summary: "Support 350 households with staple food and locally sourced fresh produce.",
    updates: ["Warehouse donated for six months", "Local farmers joined the supply network"],
  },
];

const SAVED = "smaj_charity_saved";
const DONATIONS = "smaj_charity_donations";
const FUNDRAISERS = "smaj_charity_fundraisers";
type Stored = Record<string, string | number | boolean>;

const readSaved = () => {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(SAVED) || "[]"));
  } catch {
    return new Set<string>();
  }
};
const readRecords = (key: string) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as Stored[];
  } catch {
    return [];
  }
};
const saveRecord = (key: string, record: Stored) =>
  localStorage.setItem(key, JSON.stringify([record, ...readRecords(key)]));

const CharityHeader = () => (
  <header className="charity-header">
    <Link className="charity-back" to="/app/services">
      ← Hub
    </Link>
    <Link className="charity-brand" to="/services/charity">
      <VolunteerActivismOutlinedIcon /> SMAJ Charity
    </Link>
    <nav>
      <NavLink end to="/services/charity">
        Home
      </NavLink>
      <NavLink to="/services/charity/discover">Discover</NavLink>
      <NavLink to="/services/charity/donations">My donations</NavLink>
      <NavLink to="/services/charity/fundraise">Start a fundraiser</NavLink>
    </nav>
    <ServiceMobileMenu
      title="SMAJ Charity"
      accent="#e5414f"
      items={[
        { label: "Home", to: "/services/charity" },
        { label: "Discover campaigns", to: "/services/charity/discover" },
        { label: "Saved campaigns", to: "/services/charity/saved" },
        { label: "My donations", to: "/services/charity/donations" },
        { label: "Start a fundraiser", to: "/services/charity/fundraise" },
        { label: "Organizer dashboard", to: "/services/charity/dashboard" },
      ]}
    />
  </header>
);

const Progress = ({ raised, goal }: { raised: number; goal: number }) => {
  const value = Math.min(100, Math.round((raised / goal) * 100));
  return (
    <div className="charity-progress">
      <div>
        <span style={{ width: `${value}%` }} />
      </div>
      <p>
        <strong>{formatServicePrice(raised)}</strong> raised of {formatServicePrice(goal)} <b>{value}%</b>
      </p>
    </div>
  );
};

const CampaignCard = ({ item, saved, toggle }: { item: Campaign; saved: boolean; toggle: () => void }) => (
  <article className="charity-card">
    <Link to={`/services/charity/campaign/${item.id}`}>
      <img src={item.image} alt={item.title} />
      <div>
        <small>
          {item.category} · {item.location}
        </small>
        <h2>{item.title}</h2>
        <p>
          <VerifiedOutlinedIcon /> {item.organization}
        </p>
        <Progress raised={item.raised} goal={item.goal} />
        <span>
          {item.donors.toLocaleString()} donors · {item.days} days left
        </span>
      </div>
    </Link>
    <button aria-label="Save campaign" className={saved ? "saved" : ""} onClick={toggle}>
      <BookmarkBorderOutlinedIcon />
    </button>
  </article>
);

const Empty = ({ title, text }: { title: string; text: string }) => (
  <div className="charity-empty">
    <FavoriteBorderOutlinedIcon />
    <h2>{title}</h2>
    <p>{text}</p>
    <Link to="/services/charity/discover">Discover campaigns</Link>
  </div>
);

const CharityPage = ({ kind = "home" }: { kind?: CharityPageKind }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState("All");
  const [saved, setSaved] = useState(readSaved);
  const [amount, setAmount] = useState(25);
  const campaign = campaigns.find(item => item.id === id);
  const organizationCampaigns = campaigns.filter(item => item.organizationId === id);
  const donations = useMemo(() => readRecords(DONATIONS), [kind]);
  const fundraisers = useMemo(() => readRecords(FUNDRAISERS), [kind]);
  const visible = useMemo(
    () =>
      campaigns.filter(
        item =>
          (category === "All" || item.category === category) &&
          `${item.title} ${item.organization} ${item.location}`.toLowerCase().includes(query.toLowerCase())
      ),
    [category, query]
  );
  const toggleSaved = (campaignId: string) =>
    setSaved(current => {
      const next = new Set(current);
      if (next.has(campaignId)) next.delete(campaignId);
      else next.add(campaignId);
      localStorage.setItem(SAVED, JSON.stringify([...next]));
      return next;
    });
  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(`/services/charity/discover?q=${encodeURIComponent(query)}`);
  };
  const donate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!campaign) return;
    const form = Object.fromEntries(new FormData(event.currentTarget)) as Stored;
    const donationId = `DON-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    saveRecord(DONATIONS, {
      id: donationId,
      campaignId: campaign.id,
      campaign: campaign.title,
      organization: campaign.organization,
      amount: piFromUsdt(amount),
      amountUsdt: amount,
      piRateUsed: PI_USDT_RATE,
      date: new Date().toLocaleDateString(),
      status: "Completed",
      ...form,
    });
    navigate(`/services/charity/receipt/${donationId}`);
  };
  const createFundraiser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget)) as Stored;
    saveRecord(FUNDRAISERS, {
      id: `FUN-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      raised: 0,
      status: "Draft review",
      ...form,
    });
    navigate("/services/charity/dashboard");
  };

  let content;
  if (kind === "home") {
    content = (
      <>
        <section className="charity-hero">
          <div>
            <small>GIVE WITH PURPOSE</small>
            <h1>Small acts create lasting change.</h1>
            <p>Support verified community projects with Pi and follow every milestone from donation to impact.</p>
            <form onSubmit={search}>
              <SearchOutlinedIcon />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search causes, places, or organizations"
              />
              <button>Find a cause</button>
            </form>
          </div>
        </section>
        <main className="charity-inner">
          <div className="charity-impact">
            <div>
              <strong>{formatServicePrice(245000)}+</strong>
              <span>Raised by the community</span>
            </div>
            <div>
              <strong>18,400+</strong>
              <span>People supported</span>
            </div>
            <div>
              <strong>96</strong>
              <span>Verified projects</span>
            </div>
            <div>
              <strong>31</strong>
              <span>Communities reached</span>
            </div>
          </div>
          <div className="charity-heading">
            <div>
              <small>URGENT & TRUSTED</small>
              <h1>Campaigns making an impact</h1>
            </div>
            <Link to="/services/charity/discover">View all campaigns</Link>
          </div>
          <div className="charity-grid">
            {campaigns.map(item => (
              <CampaignCard key={item.id} item={item} saved={saved.has(item.id)} toggle={() => toggleSaved(item.id)} />
            ))}
          </div>
          <section className="charity-callout">
            <PublicOutlinedIcon />
            <div>
              <small>TURN YOUR IDEA INTO IMPACT</small>
              <h2>Start a transparent fundraiser</h2>
              <p>Create your campaign, share verified updates, and receive support from the global Pi community.</p>
            </div>
            <Link to="/services/charity/fundraise">Start fundraising</Link>
          </section>
        </main>
      </>
    );
  } else if (kind === "discover") {
    content = (
      <>
        <section className="charity-search">
          <div>
            <small>DISCOVER GOOD</small>
            <h1>Find a cause you care about</h1>
            <form onSubmit={search}>
              <SearchOutlinedIcon />
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search campaigns..." />
              <button>Search</button>
            </form>
          </div>
        </section>
        <main className="charity-inner">
          <div className="charity-filters">
            {["All", "Water", "Education", "Health", "Food"].map(item => (
              <button className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>
                {item}
              </button>
            ))}
          </div>
          <div className="charity-heading">
            <div>
              <small>{visible.length} CAMPAIGNS</small>
              <h1>{query ? `Results for “${query}”` : "All campaigns"}</h1>
            </div>
          </div>
          {visible.length ? (
            <div className="charity-grid">
              {visible.map(item => (
                <CampaignCard
                  key={item.id}
                  item={item}
                  saved={saved.has(item.id)}
                  toggle={() => toggleSaved(item.id)}
                />
              ))}
            </div>
          ) : (
            <Empty title="No campaigns found" text="Try another search or category." />
          )}
        </main>
      </>
    );
  } else if (kind === "campaign" && campaign) {
    content = (
      <main className="charity-detail">
        <div className="charity-detail-grid">
          <div>
            <img src={campaign.image} alt={campaign.title} />
            <section className="charity-story">
              <small>THE STORY</small>
              <h2>Why this campaign matters</h2>
              <p>{campaign.summary}</p>
              <h2>Latest impact updates</h2>
              {campaign.updates.map((update, index) => (
                <article key={update}>
                  <b>{index + 1}</b>
                  <span>
                    <strong>{update}</strong>
                    <small>Verified by {campaign.organization}</small>
                  </span>
                </article>
              ))}
            </section>
          </div>
          <aside>
            <small>
              {campaign.category} · {campaign.location}
            </small>
            <h1>{campaign.title}</h1>
            <Link to={`/services/charity/organization/${campaign.organizationId}`}>
              <VerifiedOutlinedIcon /> {campaign.organization}
            </Link>
            <Progress raised={campaign.raised} goal={campaign.goal} />
            <p>
              {campaign.donors.toLocaleString()} people donated · {campaign.days} days left
            </p>
            <Link className="charity-donate" to={`/services/charity/checkout/${campaign.id}`}>
              Donate with Pi
            </Link>
            <button className={saved.has(campaign.id) ? "saved" : ""} onClick={() => toggleSaved(campaign.id)}>
              <BookmarkBorderOutlinedIcon /> {saved.has(campaign.id) ? "Campaign saved" : "Save campaign"}
            </button>
            <div className="charity-trust">
              <VerifiedOutlinedIcon />
              <span>
                <strong>Verified fundraiser</strong>
                <small>Identity and project information reviewed by SMAJ Charity.</small>
              </span>
            </div>
          </aside>
        </div>
      </main>
    );
  } else if (kind === "checkout" && campaign) {
    content = (
      <main className="charity-inner charity-checkout">
        <section>
          <small>SECURE PI DONATION</small>
          <h1>Support {campaign.title}</h1>
          <div className="charity-campaign-mini">
            <img src={campaign.image} alt="" />
            <span>
              <strong>{campaign.title}</strong>
              <small>{campaign.organization}</small>
            </span>
          </div>
          <form className="charity-form" onSubmit={donate}>
            <label>Choose amount</label>
            <div className="charity-amounts">
              {[10, 25, 50, 100].map(value => (
                <button
                  type="button"
                  className={amount === value ? "active" : ""}
                  onClick={() => setAmount(value)}
                  key={value}
                >
                  ${value}
                </button>
              ))}
            </div>
            <label>
              Custom amount in USDT
              <input type="number" min="1" value={amount} onChange={event => setAmount(Number(event.target.value))} />
            </label>
            <label>
              Display name
              <input name="name" placeholder="Anonymous donor" />
            </label>
            <label className="charity-check">
              <input type="checkbox" name="recurring" /> Make this a monthly donation
            </label>
            <label className="charity-check">
              <input type="checkbox" name="anonymous" /> Hide my name publicly
            </label>
            <button>Donate {formatServicePrice(amount)}</button>
          </form>
        </section>
        <aside>
          <h2>Your donation</h2>
          <p>
            Campaign <strong>{campaign.title}</strong>
          </p>
          <p>
            Donation <strong>{formatServicePrice(amount)}</strong>
          </p>
          <hr />
          <p>
            Total <strong>{formatServicePrice(amount)}</strong>
          </p>
          <small>Demo checkout: no real Pi will be transferred.</small>
        </aside>
      </main>
    );
  } else if (kind === "receipt") {
    const donation = donations.find(item => item.id === id);
    content = donation ? (
      <main className="charity-receipt">
        <div>
          <VolunteerActivismOutlinedIcon />
          <small>DONATION COMPLETE</small>
          <h1>Thank you for making a difference.</h1>
          <p>Your support has been recorded and the organizer can now put it to work.</p>
          <dl>
            <div>
              <dt>Receipt</dt>
              <dd>{donation.id}</dd>
            </div>
            <div>
              <dt>Campaign</dt>
              <dd>{donation.campaign}</dd>
            </div>
            <div>
              <dt>Organization</dt>
              <dd>{donation.organization}</dd>
            </div>
            <div>
              <dt>Amount</dt>
              <dd>{formatServicePrice(Number(donation.amountUsdt ?? usdtFromPi(Number(donation.amount))))}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{donation.date}</dd>
            </div>
          </dl>
          <Link to="/services/charity/donations">View donation history</Link>
        </div>
      </main>
    ) : (
      <Empty title="Receipt not found" text="View your donation history to find completed gifts." />
    );
  } else if (kind === "saved") {
    const items = campaigns.filter(item => saved.has(item.id));
    content = (
      <main className="charity-inner">
        <div className="charity-heading">
          <div>
            <small>YOUR CAUSES</small>
            <h1>Saved campaigns</h1>
          </div>
        </div>
        {items.length ? (
          <div className="charity-grid">
            {items.map(item => (
              <CampaignCard key={item.id} item={item} saved toggle={() => toggleSaved(item.id)} />
            ))}
          </div>
        ) : (
          <Empty title="No saved campaigns" text="Save causes you want to follow or support later." />
        )}
      </main>
    );
  } else if (kind === "donations") {
    content = (
      <main className="charity-inner">
        <div className="charity-heading">
          <div>
            <small>YOUR IMPACT</small>
            <h1>Donation history</h1>
            <p>Track one-time and recurring donations and access receipts.</p>
          </div>
        </div>
        {donations.length ? (
          <div className="charity-records">
            {donations.map(item => (
              <article key={String(item.id)}>
                <div>
                  <small>{item.date}</small>
                  <h2>{item.campaign}</h2>
                  <p>{item.organization}</p>
                </div>
                <div>
                  <strong>{formatServicePrice(Number(item.amountUsdt ?? usdtFromPi(Number(item.amount))))}</strong>
                  <span>
                    {item.recurring ? "Monthly" : "One-time"} · {item.status}
                  </span>
                  <Link to={`/services/charity/receipt/${item.id}`}>Receipt</Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <Empty
            title="No donations yet"
            text="When you support a campaign, your donation and receipt will appear here."
          />
        )}
      </main>
    );
  } else if (kind === "fundraise") {
    content = (
      <main className="charity-inner charity-create">
        <div>
          <small>START A FUNDRAISER</small>
          <h1>Tell the community what you want to change.</h1>
          <p>Strong campaigns explain the need, set a clear goal, and publish regular evidence-backed updates.</p>
          <ul>
            <li>Use a specific, measurable goal</li>
            <li>Explain who benefits and how</li>
            <li>Provide accurate organization details</li>
            <li>Share progress transparently</li>
          </ul>
        </div>
        <form className="charity-form" onSubmit={createFundraiser}>
          <label>
            Campaign title
            <input name="title" required placeholder="What are you raising funds for?" />
          </label>
          <label>
            Category
            <select name="category">
              <option>Community</option>
              <option>Health</option>
              <option>Education</option>
              <option>Water</option>
              <option>Food</option>
              <option>Environment</option>
            </select>
          </label>
          <label>
            Funding goal in USDT
            <input name="goal" type="number" min="10" required />
          </label>
          <label>
            Location
            <input name="location" required placeholder="City, country" />
          </label>
          <label>
            Organization or organizer
            <input name="organization" required />
          </label>
          <label>
            Campaign story
            <textarea name="story" rows={6} required placeholder="Explain the need, plan, and expected impact" />
          </label>
          <button>Save and submit for review</button>
        </form>
      </main>
    );
  } else if (kind === "dashboard") {
    content = (
      <main className="charity-inner">
        <div className="charity-heading">
          <div>
            <small>ORGANIZER HUB</small>
            <h1>Fundraiser dashboard</h1>
          </div>
          <Link to="/services/charity/fundraise">Create fundraiser</Link>
        </div>
        <div className="charity-stats">
          <article>
            <small>CAMPAIGNS</small>
            <strong>{fundraisers.length}</strong>
            <span>Created fundraisers</span>
          </article>
          <article>
            <small>TOTAL RAISED</small>
            <strong>{formatServicePrice(0)}</strong>
            <span>Across your campaigns</span>
          </article>
          <article>
            <small>SUPPORTERS</small>
            <strong>0</strong>
            <span>Unique donors</span>
          </article>
          <article>
            <small>UPDATES</small>
            <strong>0</strong>
            <span>Published impact reports</span>
          </article>
        </div>
        {fundraisers.length ? (
          <div className="charity-records">
            {fundraisers.map(item => (
              <article key={String(item.id)}>
                <div>
                  <small>{item.id}</small>
                  <h2>{item.title}</h2>
                  <p>
                    {item.category} · {item.location}
                  </p>
                </div>
                <div>
                  <strong>
                    {formatServicePrice(Number(item.raised))} / {formatServicePrice(Number(item.goal))}
                  </strong>
                  <span>{item.status}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <Empty title="No fundraisers yet" text="Create your first campaign and submit it for verification." />
        )}
      </main>
    );
  } else if (kind === "organization") {
    const name = organizationCampaigns[0]?.organization || "Verified Charity";
    content = (
      <main className="charity-inner">
        <section className="charity-organization">
          <div>
            <VolunteerActivismOutlinedIcon />
          </div>
          <span>
            <small>VERIFIED ORGANIZATION</small>
            <h1>{name}</h1>
            <p>Transparent community programs with regular project and financial updates.</p>
          </span>
          <VerifiedOutlinedIcon />
        </section>
        <div className="charity-heading">
          <div>
            <small>ACTIVE WORK</small>
            <h1>Campaigns by {name}</h1>
          </div>
        </div>
        {organizationCampaigns.length ? (
          <div className="charity-grid">
            {organizationCampaigns.map(item => (
              <CampaignCard key={item.id} item={item} saved={saved.has(item.id)} toggle={() => toggleSaved(item.id)} />
            ))}
          </div>
        ) : (
          <Empty title="Organization profile" text="No active campaigns are available right now." />
        )}
      </main>
    );
  } else {
    content = <Empty title="Page not found" text="Return to campaign discovery to continue." />;
  }

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <div className="charity-page">
        <CharityHeader />
        {content}
        <footer className="charity-footer">
          <strong>SMAJ Charity</strong>
          <span>Transparent giving, measurable impact.</span>
          <div>
            <Link to="/services/charity/discover">Campaigns</Link>
            <Link to="/services/charity/saved">Saved</Link>
            <Link to="/services/charity/donations">Donations</Link>
            <Link to="/services/charity/dashboard">Organizer</Link>
          </div>
        </footer>
      </div>
    </AppLayout>
  );
};

export default CharityPage;
