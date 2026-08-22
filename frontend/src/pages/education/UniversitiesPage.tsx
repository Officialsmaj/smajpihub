import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AppLayout from "../../layouts/AppLayout";
import UniversityCard from "../../components/education/UniversityCard";
import { getUniversities } from "../../lib/educationApi";
import type { University } from "../../types/education";
import EducationHeader from "./EducationHeader";
import "../../components/education/education.css";

type UniversityFilters = { q: string; country: string; city: string; institution_type: string; partnership: string };

const UniversitiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  const applied: UniversityFilters = {
    q: searchParams.get("q") || "",
    country: searchParams.get("country") || "",
    city: searchParams.get("city") || "",
    institution_type: searchParams.get("institution_type") || "",
    partnership: searchParams.get("partnership") || "",
  };
  const [draft, setDraft] = useState<UniversityFilters>(applied);

  useEffect(
    () => setDraft(applied),
    [applied.q, applied.country, applied.city, applied.institution_type, applied.partnership]
  );
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getUniversities({
      q: applied.q || undefined,
      country: applied.country || undefined,
      city: applied.city || undefined,
      institution_type: applied.institution_type || undefined,
      partnership: applied.partnership || undefined,
      page,
      limit: pageSize,
    })
      .then(data => {
        if (!cancelled) {
          setUniversities(data.universities);
          setTotal(data.total);
          setTotalPages(data.totalPages);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applied.q, applied.country, applied.city, applied.institution_type, applied.partnership, page]);

  const activeFilterCount = [
    applied.q,
    applied.country,
    applied.city,
    applied.institution_type,
    applied.partnership,
  ].filter(Boolean).length;
  const visibleUniversities = useMemo(() => universities, [universities]);
  const applyFilters = () => {
    const next = new URLSearchParams();
    Object.entries(draft).forEach(([key, value]) => {
      if (value.trim()) next.set(key, value.trim());
    });
    setPage(1);
    setSearchParams(next);
    setFiltersOpen(false);
  };
  const resetFilters = () => {
    const empty = { q: "", country: "", city: "", institution_type: "", partnership: "" };
    setDraft(empty);
    setPage(1);
    setSearchParams(new URLSearchParams());
    setFiltersOpen(false);
  };

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="universities-page">
        <EducationHeader
          query={applied.q}
          onQueryChange={value => {
            setDraft(current => ({ ...current, q: value }));
            const next = new URLSearchParams(searchParams);
            value.trim() ? next.set("q", value) : next.delete("q");
            setPage(1);
            setSearchParams(next);
          }}
          searchPath="/services/education/universities"
        />
        <section className="universities-hero">
          <span className="universities-kicker">GLOBAL DISCOVERY</span>
          <h1>Universities</h1>
          <p>Explore institutions worldwide and continue to official sources for current programs and admissions.</p>
        </section>

        <section className="universities-catalog-layout">
          <button className="universities-filter-toggle" type="button" onClick={() => setFiltersOpen(true)}>
            <FilterListOutlinedIcon /> Filters {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
          </button>
          {filtersOpen && (
            <button
              className="universities-filter-backdrop"
              aria-label="Close filters"
              onClick={() => setFiltersOpen(false)}
            />
          )}
          <aside
            className={`universities-catalog-filters${filtersOpen ? " open" : ""}`}
            aria-label="University filters"
          >
            <div className="universities-filter-heading">
              <div>
                <span>REFINE RESULTS</span>
                <h2>Filter universities</h2>
              </div>
              <button type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)}>
                <CloseOutlinedIcon />
              </button>
            </div>
            <label>
              Search
              <span className="universities-filter-search">
                <SearchOutlinedIcon />
                <input
                  value={draft.q}
                  onChange={event => setDraft(current => ({ ...current, q: event.target.value }))}
                  placeholder="University name"
                />
              </span>
            </label>
            <label>
              Country
              <input
                value={draft.country}
                onChange={event => setDraft(current => ({ ...current, country: event.target.value }))}
                placeholder="Country name or code"
              />
            </label>
            <label>
              City / region
              <input
                value={draft.city}
                onChange={event => setDraft(current => ({ ...current, city: event.target.value }))}
                placeholder="City or region"
              />
            </label>
            <label>
              Directory type
              <select
                value={draft.institution_type}
                onChange={event => setDraft(current => ({ ...current, institution_type: event.target.value }))}
              >
                <option value="">All institution types</option>
                <option value="education">Higher education</option>
                <option value="other">Other institutions</option>
              </select>
            </label>
            <label>
              Partnership
              <select
                value={draft.partnership}
                onChange={event => setDraft(current => ({ ...current, partnership: event.target.value }))}
              >
                <option value="">All listings</option>
                <option value="smaj_verified_partner">SMAJ Verified Partners</option>
                <option value="directory">Global directory</option>
              </select>
            </label>
            <div className="universities-filter-actions">
              <button className="universities-clear-filters" type="button" onClick={resetFilters}>
                Reset
              </button>
              <button className="universities-apply-filters" type="button" onClick={applyFilters}>
                Show results
              </button>
            </div>
          </aside>

          <div className="universities-catalog-results">
            <div className="universities-results-toolbar">
              <p>
                <strong>{total.toLocaleString()}</strong> {total === 1 ? "university" : "universities"}
              </p>
              {activeFilterCount > 0 && <button onClick={resetFilters}>Clear filters</button>}
            </div>
            {loading ? (
              <div className="universities-loading">Loading universities...</div>
            ) : visibleUniversities.length ? (
              <>
                <div className="universities-grid">
                  {visibleUniversities.map(university => (
                    <UniversityCard key={university.id} university={university} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="universities-pagination">
                    <button disabled={page <= 1} onClick={() => setPage(value => value - 1)}>
                      Previous
                    </button>
                    <span>
                      Page {page} of {totalPages}
                    </span>
                    <button disabled={page >= totalPages} onClick={() => setPage(value => value + 1)}>
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="universities-empty">
                <h2>No universities found</h2>
                <p>Try another search or remove some filters.</p>
                <button className="universities-primary-btn" onClick={resetFilters}>
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </AppLayout>
  );
};

export default UniversitiesPage;
