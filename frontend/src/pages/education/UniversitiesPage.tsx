import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AppLayout from "../../layouts/AppLayout";
import UniversityCard from "../../components/education/UniversityCard";
import { getUniversities } from "../../lib/educationApi";
import type { University } from "../../types/education";
import EducationHeader from "./EducationHeader";
import "../../components/education/education.css";

const UniversitiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  const query = searchParams.get("q") || "";
  const country = searchParams.get("country") || "";
  const city = searchParams.get("city") || "";
  const institutionType = searchParams.get("institution_type") || "";
  const partnership = searchParams.get("partnership") || "";

  const updateFilter = (key: string, value: string, defaultValue = "") => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === defaultValue) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  useEffect(() => {
    let cancelled = false;
    getUniversities({
      q: query || undefined,
      country: country || undefined,
      city: city || undefined,
      institution_type: institutionType || undefined,
      partnership: partnership || undefined,
      page,
      limit: pageSize,
    }).then((data) => {
      if (!cancelled) {
        setUniversities(data.universities);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [query, country, city, institutionType, partnership, page]);

  const visibleUniversities = useMemo(() => universities, [universities]);

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="universities-page">
        <EducationHeader query={query} onQueryChange={(value) => { setPage(1); updateFilter("q", value); }} searchPath="/services/education/universities" />
        <section className="universities-hero">
          <span className="universities-kicker">GLOBAL DISCOVERY</span>
          <h1>Universities</h1>
          <p>Search universities, programs, and locations worldwide.</p>
        </section>

        <section className="universities-catalog-layout">
          <button className="universities-filter-toggle" type="button" onClick={() => setFiltersOpen(open => !open)}>
            <FilterListOutlinedIcon /> Filters
          </button>
          <aside className={`universities-catalog-filters${filtersOpen ? " open" : ""}`} aria-label="University filters">
            <h2>Filter universities</h2>
            <label>
              Search
              <span className="universities-filter-search">
                <SearchOutlinedIcon />
                <input
                  value={query}
                  onChange={(event) => { setPage(1); updateFilter("q", event.target.value); }}
                  placeholder="University, city, country"
                />
              </span>
            </label>
            <label>
              Country
              <input
                value={country}
                onChange={(event) => { setPage(1); updateFilter("country", event.target.value); }}
                placeholder="Country"
              />
            </label>
            <label>
              City/Region
              <input
                value={city}
                onChange={(event) => { setPage(1); updateFilter("city", event.target.value); }}
                placeholder="City"
              />
            </label>
            <label>
              Institution type
              <select value={institutionType} onChange={(event) => { setPage(1); updateFilter("institution_type", event.target.value, ""); }}>
                <option value="">All types</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="research">Research</option>
                <option value="polytechnic">Polytechnic</option>
                <option value="college">College</option>
                <option value="institute">Institute</option>
                <option value="academy">Academy</option>
              </select>
            </label>
            <label>
              Partnership
              <select value={partnership} onChange={(event) => { setPage(1); updateFilter("partnership", event.target.value, ""); }}>
                <option value="">All</option>
                <option value="smaj_verified_partner">SMAJ Verified Partner</option>
                <option value="directory">Not yet a SMAJ Partner</option>
              </select>
            </label>
            <button className="universities-clear-filters" type="button" onClick={() => { setPage(1); setSearchParams(new URLSearchParams()); }}>
              Clear all filters
            </button>
          </aside>

          <div className="universities-catalog-results">
            <div className="universities-results-toolbar">
              <p><strong>{total}</strong> {total === 1 ? "university" : "universities"}</p>
            </div>
            {loading ? (
              <div className="universities-loading">Loading universities...</div>
            ) : visibleUniversities.length ? (
              <>
                <div className="universities-grid">
                  {visibleUniversities.map((university) => (
                    <UniversityCard key={university.id} university={university} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="universities-pagination">
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                    <span>Page {page} of {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                  </div>
                )}
              </>
            ) : (
              <div className="universities-empty">
                <h2>No universities found</h2>
                <p>Try another search or remove some filters.</p>
                <Link className="universities-primary-btn" to="/services/education/universities">
                  Clear search
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </AppLayout>
  );
};

export default UniversitiesPage;
