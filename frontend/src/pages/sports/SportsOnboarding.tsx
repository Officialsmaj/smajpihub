import { useEffect, useMemo, useState } from "react";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import type { SportsCatalog, SportsCompetition, SportsTeam } from "../../types/sports";
import { saveSportsPreferences, searchSportsTeams, type SportsPreferences } from "../../lib/sportsApi";
import { enablePushNotifications } from "../../lib/pushNotifications";
import { enableNativePushNotifications, supportsNativePushNotifications } from "../../lib/nativePushNotifications";

export const SPORTS_ONBOARDING_KEY = "smaj_sports_onboarding_complete";
export const SPORTS_PREFERENCES_KEY = "smaj_sports_preferences";

const defaultNotifications = { breakingNews: true, matchStart: true, matchEnd: true, scoreUpdates: false };

type Props = {
  catalog: SportsCatalog;
  onComplete: (preferences: SportsPreferences) => void;
};

const Logo = ({ team, label }: { team?: SportsTeam; label: string }) => team?.logoUrl ? (
  <img src={team.logoUrl} alt="" loading="lazy" />
) : <span className="sports-onboarding-fallback" aria-hidden="true">{label.slice(0, 2).toUpperCase()}</span>;

const SportsOnboarding = ({ catalog, onComplete }: Props) => {
  const saved = useMemo(() => {
    try { return JSON.parse(localStorage.getItem(SPORTS_PREFERENCES_KEY) || "null") as SportsPreferences | null; }
    catch { return null; }
  }, []);
  const [step, setStep] = useState(0);
  const [notifications, setNotifications] = useState(saved?.notifications || defaultNotifications);
  const [teamIds, setTeamIds] = useState(new Set(saved?.favoriteTeamIds || []));
  const [competitionIds, setCompetitionIds] = useState(new Set(saved?.favoriteCompetitionIds || []));
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [remoteTeams, setRemoteTeams] = useState<SportsTeam[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (step !== 1 || query.trim().length < 2) { setRemoteTeams([]); setSearching(false); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearching(true);
      searchSportsTeams(query.trim(), controller.signal)
        .then(({ items }) => setRemoteTeams(items))
        .catch(() => setRemoteTeams([]))
        .finally(() => setSearching(false));
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, step]);

  const competitionByTeam = useMemo(() => {
    const map = new Map<string, Set<string>>();
    catalog.matches.forEach(match => [match.home.id, match.away.id].forEach(id => {
      const current = map.get(id) || new Set<string>(); current.add(match.competition); map.set(id, current);
    }));
    return map;
  }, [catalog.matches]);
  const competitionLogo = (competition: SportsCompetition) => {
    if (competition.logoUrl) return { id: competition.id, name: competition.name, shortName: competition.name, city: "", color: "#2563eb", form: [], logoUrl: competition.logoUrl };
    const match = catalog.matches.find(item => item.competition === competition.name);
    return match?.home;
  };
  const searchableTeams = query.trim().length >= 2 ? [...new Map([...remoteTeams, ...catalog.teams].map(team => [team.id, team])).values()] : catalog.teams;
  const visibleTeams = searchableTeams.filter(team => `${team.name} ${team.city} ${[...(competitionByTeam.get(team.id) || [])].join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  const visibleCompetitions = catalog.competitions.filter(item => `${item.name} ${item.sport}`.toLowerCase().includes(query.toLowerCase()));
  const selectedTeams = catalog.teams.filter(team => teamIds.has(team.id));

  const toggle = (set: Set<string>, value: string, update: (next: Set<string>) => void) => {
    const next = new Set(set); if (next.has(value)) next.delete(value); else next.add(value); update(next);
  };
  const continueNotifications = async () => {
    if (Object.values(notifications).some(Boolean)) {
      try {
        if (supportsNativePushNotifications()) await enableNativePushNotifications();
        else await enablePushNotifications();
      } catch { setNotice("You can enable phone notifications later from Settings."); }
    }
    setQuery(""); setStep(1);
  };
  const finish = async () => {
    const preferences: SportsPreferences = { completed: true, favoriteTeamIds: [...teamIds], favoriteCompetitionIds: [...competitionIds], notifications };
    localStorage.setItem(SPORTS_ONBOARDING_KEY, "true");
    localStorage.setItem(SPORTS_PREFERENCES_KEY, JSON.stringify(preferences));
    localStorage.setItem("smaj_sports_favorite_teams", JSON.stringify([...teamIds]));
    setSaving(true);
    try { await saveSportsPreferences(preferences); } catch { setNotice("Saved on this device. Account sync will retry when you are online."); }
    finally { setSaving(false); onComplete(preferences); }
  };

  return <div className={`sports-onboarding sports-onboarding-step-${step}`}>
    {step > 0 ? <button className="sports-onboarding-back" type="button" aria-label="Previous step" onClick={() => { setQuery(""); setStep(step - 1); }}><ArrowBackRoundedIcon /></button> : null}
    <div className="sports-onboarding-progress"><span className={step >= 0 ? "active" : ""} /><span className={step >= 1 ? "active" : ""} /><span className={step >= 2 ? "active" : ""} /></div>
    {step === 0 ? <>
      <section className="sports-onboarding-visual" aria-hidden="true">
        {catalog.teams.filter(team => team.logoUrl).slice(0, 5).map(team => <span key={team.id}><Logo team={team} label={team.name} /></span>)}
        <div><NotificationsActiveRoundedIcon /><small>Match starting soon</small></div>
      </section>
      <header><span>PERSONALIZE SMAJ SPORTS</span><h1>Never miss a game</h1><p>Choose the alerts you want for your favorite teams and competitions.</p></header>
      <section className="sports-onboarding-options">
        {([['breakingNews','Breaking news'],['matchStart','Match starting'],['matchEnd','Match finished'],['scoreUpdates','Score updates']] as const).map(([key,label]) => <label key={key}><span>{label}</span><input type="checkbox" checked={notifications[key]} onChange={() => setNotifications(current => ({ ...current, [key]: !current[key] }))} /></label>)}
      </section>
      {notice ? <p className="sports-onboarding-notice">{notice}</p> : null}
      <div className="sports-onboarding-actions"><button type="button" onClick={() => void continueNotifications()}>Continue</button><button type="button" className="secondary" onClick={() => { setNotifications({ breakingNews:false, matchStart:false, matchEnd:false, scoreUpdates:false }); setStep(1); }}>Not now</button></div>
    </> : <>
      <section className="sports-selected-strip">
        <span className="all"><StarRoundedIcon /></span>
        {selectedTeams.slice(0, 8).map(team => <span key={team.id}><Logo team={team} label={team.name} /><small>{team.shortName || team.name}</small></span>)}
      </section>
      <header><span>STEP {step + 1} OF 3</span><h1>{step === 1 ? "Choose your favorite teams" : "Choose your favorite leagues"}</h1><p>{step === 1 ? "Follow teams for scores, fixtures, and updates." : "Select competitions to shape your Sports home."}</p></header>
      <label className="sports-onboarding-search"><SearchRoundedIcon /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={step === 1 ? "Search teams" : "Search leagues"} /></label>
      <section className="sports-onboarding-list">
        {step === 1 ? visibleTeams.map(team => <button type="button" onClick={() => toggle(teamIds, team.id, setTeamIds)} className={teamIds.has(team.id) ? "selected" : ""} key={team.id}><Logo team={team} label={team.name} /><span><b>{team.name}</b><small>{team.city || [...(competitionByTeam.get(team.id) || [])][0] || "Sports team"}</small></span>{teamIds.has(team.id) ? <StarRoundedIcon /> : <StarBorderRoundedIcon />}</button>) : visibleCompetitions.map(competition => <button type="button" onClick={() => toggle(competitionIds, competition.id, setCompetitionIds)} className={competitionIds.has(competition.id) ? "selected" : ""} key={competition.id}><Logo team={competitionLogo(competition)} label={competition.name} /><span><b>{competition.name}</b><small>{competition.sport} · {competition.teamCount} teams</small></span>{competitionIds.has(competition.id) ? <StarRoundedIcon /> : <StarBorderRoundedIcon />}</button>)}
        {searching ? <p className="sports-onboarding-empty">Searching teams...</p> : !(step === 1 ? visibleTeams.length : visibleCompetitions.length) ? <p className="sports-onboarding-empty">No results found.</p> : null}
      </section>
      <div className="sports-onboarding-actions sticky"><button type="button" disabled={saving} onClick={() => step === 1 ? (setQuery(""), setStep(2)) : void finish()}>{step === 1 ? "Continue" : saving ? "Saving..." : "Save preferences"}</button>{notice ? <small>{notice}</small> : null}</div>
    </>}
  </div>;
};

export default SportsOnboarding;