import { useMemo, useState, type FormEvent } from "react";
import { JOB_CATEGORIES, JOB_COUNTRIES } from "../../content/jobOptions";
import { piFromUsdt } from "../../lib/piPricing";
import { saveJobsPreferences, type JobsApiJob, type JobsPreferences, type JobsProfile } from "../../lib/jobsApi";

type Editor = "pay" | "locations" | "titles" | "";
const defaults: JobsPreferences = {
  jobsMode: "candidate",
  minimumPayUsdt: 0,
  payPeriod: "hour",
  preferredLocations: [],
  remotePreference: "all",
  openToAnywhere: false,
  preferredTitles: [],
  preferredCategories: [],
};
const formatPreferencePi = (value: number) => `π ${value.toFixed(5).replace(/\.?0+$/, "")}`;

const JobPreferencesPanel = ({
  userName,
  profile,
  jobs,
  onSaved,
}: {
  userName: string;
  profile: JobsProfile | null;
  jobs: JobsApiJob[];
  onSaved: (preferences: JobsPreferences) => void;
}) => {
  const hydratedProfile = profile ? { ...defaults, ...profile } : { ...defaults, jobsMode: "candidate" };
  const [editor, setEditor] = useState<Editor>("");
  const [preferences, setPreferences] = useState<JobsPreferences>(hydratedProfile);
  const recommendations = useMemo(
    () =>
      jobs.filter(job => {
        const titleMatch =
          !preferences.preferredTitles.length ||
          preferences.preferredTitles.some(title =>
            `${job.title} ${job.skills.join(" ")}`.toLowerCase().includes(title.toLowerCase())
          );
        const locationMatch =
          preferences.openToAnywhere ||
          !preferences.preferredLocations.length ||
          preferences.preferredLocations.some(location =>
            job.location.toLowerCase().includes(location.toLowerCase())
          ) ||
          (preferences.remotePreference !== "onsite" && job.mode === "Remote");
        return titleMatch && locationMatch;
      }),
    [jobs, preferences]
  );
  const persist = async (next: JobsPreferences) => {
    const saved = await saveJobsPreferences(next);
    setPreferences(saved);
    onSaved(saved);
  };
  const chooseRole = (jobsMode: JobsPreferences["jobsMode"]) => void persist({ ...preferences, jobsMode });
  const saveEditor = (event: FormEvent) => {
    event.preventDefault();
    void persist(preferences).then(() => setEditor(""));
  };
  const titles = preferences.preferredTitles.length ? preferences.preferredTitles : [""];
  const locations = preferences.preferredLocations.length ? preferences.preferredLocations : [""];

  if (profile && !profile.jobsMode)
    return (
      <section className="jobs-role-onboarding">
        <h2>How do you want to use SMAJ PI Jobs?</h2>
        <div>
          <button onClick={() => chooseRole("candidate")}>
            <b>Find work</b>
            <span>Search jobs, build a profile and apply.</span>
          </button>
          <button onClick={() => chooseRole("employer")}>
            <b>Hire talent</b>
            <span>Publish jobs and manage candidates.</span>
          </button>
          <button onClick={() => chooseRole("both")}>
            <b>Both</b>
            <span>Switch between candidate and employer tools.</span>
          </button>
        </div>
      </section>
    );

  return (
    <section className="jobs-preferences">
      <header>
        <h2>Welcome, {userName}</h2>
      </header>
      {preferences.jobsMode !== "employer" ? (
        <>
          <div className="jobs-preference-chips">
            <button onClick={() => setEditor("pay")}>
              ▣{" "}
              {preferences.minimumPayUsdt
                ? `${formatPreferencePi(piFromUsdt(preferences.minimumPayUsdt))}/${preferences.payPeriod}`
                : "Add pay"}
            </button>
            <button onClick={() => setEditor("locations")}>
              ⌖ {preferences.preferredLocations.length || 0} locations
            </button>
            <button onClick={() => setEditor("titles")}>▰ {preferences.preferredTitles.length || 0} job titles</button>
          </div>
          <div className="jobs-recommendation-note">
            ⓘ{" "}
            {recommendations.length
              ? `${recommendations.length} opportunities match your preferences.`
              : preferences.preferredTitles.length || preferences.preferredLocations.length
                ? "No current jobs match all your preferences."
                : "Add your preferences to get personalized job recommendations."}
          </div>
        </>
      ) : (
        <div className="jobs-recommendation-note">
          Your employer workspace is ready for company and candidate management.
        </div>
      )}
      {editor ? (
        <div
          className="jobs-sheet-backdrop"
          onPointerDown={event => {
            if (event.target === event.currentTarget) setEditor("");
          }}
        >
          <form className="jobs-preference-sheet" onSubmit={saveEditor}>
            <button className="jobs-sheet-close" type="button" onClick={() => setEditor("")} aria-label="Close">
              ×
            </button>
            {editor === "pay" ? (
              <>
                <h2>Edit pay preference</h2>
                <label>
                  Minimum real-world pay (USDT)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={preferences.minimumPayUsdt}
                    onChange={event =>
                      setPreferences(current => ({ ...current, minimumPayUsdt: Number(event.target.value) }))
                    }
                  />
                </label>
                <label>
                  Pay period
                  <select
                    value={preferences.payPeriod}
                    onChange={event =>
                      setPreferences(current => ({
                        ...current,
                        payPeriod: event.target.value as JobsPreferences["payPeriod"],
                      }))
                    }
                  >
                    <option value="hour">Per hour</option>
                    <option value="day">Per day</option>
                    <option value="week">Per week</option>
                    <option value="month">Per month</option>
                    <option value="year">Per year</option>
                  </select>
                </label>
                <output>
                  {preferences.minimumPayUsdt
                    ? `${formatPreferencePi(piFromUsdt(preferences.minimumPayUsdt))} per ${preferences.payPeriod}`
                    : "No minimum set"}
                </output>
              </>
            ) : null}
            {editor === "locations" ? (
              <>
                <h2>Edit location preferences</h2>
                {locations.map((location, index) => (
                  <label key={index}>
                    Preferred location
                    <input
                      list="preference-countries"
                      value={location}
                      onChange={event =>
                        setPreferences(current => ({
                          ...current,
                          preferredLocations: locations
                            .map((item, itemIndex) => (itemIndex === index ? event.target.value : item))
                            .filter(Boolean),
                        }))
                      }
                    />
                  </label>
                ))}
                <datalist id="preference-countries">
                  {JOB_COUNTRIES.map(country => (
                    <option value={country.label} key={country.code} />
                  ))}
                </datalist>
                {locations.length < 5 ? (
                  <button
                    type="button"
                    className="jobs-sheet-link"
                    onClick={() => setPreferences(current => ({ ...current, preferredLocations: [...locations, ""] }))}
                  >
                    ＋ Add another location
                  </button>
                ) : null}
                <label className="jobs-check">
                  <input
                    type="checkbox"
                    checked={preferences.openToAnywhere}
                    onChange={event =>
                      setPreferences(current => ({ ...current, openToAnywhere: event.target.checked }))
                    }
                  />{" "}
                  Open to anywhere
                </label>
                <label>
                  Remote preference
                  <select
                    value={preferences.remotePreference}
                    onChange={event =>
                      setPreferences(current => ({
                        ...current,
                        remotePreference: event.target.value as JobsPreferences["remotePreference"],
                      }))
                    }
                  >
                    <option value="all">Open to all jobs</option>
                    <option value="remote">Remote preferred</option>
                    <option value="onsite">On-site preferred</option>
                  </select>
                </label>
              </>
            ) : null}
            {editor === "titles" ? (
              <>
                <h2>Job title and work-area preferences</h2>
                {titles.map((title, index) => (
                  <label key={index}>
                    Preferred job title
                    <input
                      value={title}
                      onChange={event =>
                        setPreferences(current => ({
                          ...current,
                          preferredTitles: titles
                            .map((item, itemIndex) => (itemIndex === index ? event.target.value : item))
                            .filter(Boolean),
                        }))
                      }
                    />
                  </label>
                ))}
                {titles.length < 10 ? (
                  <button
                    type="button"
                    className="jobs-sheet-link"
                    onClick={() => setPreferences(current => ({ ...current, preferredTitles: [...titles, ""] }))}
                  >
                    ＋ Add another title
                  </button>
                ) : null}
                <label>
                  Work area
                  <input
                    list="preference-categories"
                    value={preferences.preferredCategories[0] || ""}
                    onChange={event =>
                      setPreferences(current => ({
                        ...current,
                        preferredCategories: event.target.value ? [event.target.value] : [],
                      }))
                    }
                  />
                </label>
                <datalist id="preference-categories">
                  {JOB_CATEGORIES.map(category => (
                    <option value={category} key={category} />
                  ))}
                </datalist>
              </>
            ) : null}
            <button className="jobs-sheet-save" type="submit">
              Save to profile
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
};
export default JobPreferencesPanel;
