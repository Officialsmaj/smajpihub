import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AppLayout from "../../layouts/AppLayout";
import OnlineCourseCard from "../../components/education/OnlineCourseCard";
import { getCourses } from "../../lib/coursesApi";
import type { Course, CourseType, CourseLevel } from "../../types/courses";
import EducationHeader from "./EducationHeader";
import EducationBackBar from "../../components/education/EducationBackBar";
import "../../components/education/courses.css";

const FALLBACK_CATEGORIES = [
  "Technology",
  "Business",
  "Design",
  "AI",
  "Cybersecurity",
  "Marketing",
  "Languages",
  "Career Development",
  "Finance",
  "Entrepreneurship",
  "Other",
] as const;

const CourseCenterPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const level = searchParams.get("level") || "";
  const courseType = searchParams.get("type") || "";
  const certificate = searchParams.get("certificate") || "";
  const sort = searchParams.get("sort") || "newest";

  const updateFilter = (key: string, value: string, defaultValue = "") => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === defaultValue) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  useEffect(() => {
    let cancelled = false;
    getCourses({
      q: query || undefined,
      category: category || undefined,
      level: (level || undefined) as CourseLevel | undefined,
      type: (courseType || undefined) as CourseType | undefined,
      certificate: certificate || undefined,
      sort,
      page,
      limit: pageSize,
    }).then((data) => {
      if (!cancelled) {
        setCourses(data.courses);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [query, category, level, courseType, certificate, sort, page]);

  const visibleCourses = useMemo(() => courses, [courses]);

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="courses-page">
        <EducationHeader query={query} onQueryChange={(value) => { setPage(1); updateFilter("q", value); }} searchPath="/services/education/courses" />
        <EducationBackBar current="Online Courses" />
        <section className="courses-hero">
          <span className="courses-kicker">ONLINE COURSES</span>
          <h1>Learn from verified instructors</h1>
          <p>Search free and paid courses. Enroll, learn, and earn verified certificates.</p>
        </section>

        <section className="courses-catalog-layout">
          <button className="courses-filter-toggle" type="button" onClick={() => setFiltersOpen(open => !open)}>
            <FilterListOutlinedIcon /> Filters
          </button>
          <aside className={`courses-catalog-filters${filtersOpen ? " open" : ""}`} aria-label="Course filters">
            <h2>Filter courses</h2>
            <label>
              Search
              <span className="courses-filter-search">
                <SearchOutlinedIcon />
                <input
                  value={query}
                  onChange={(event) => { setPage(1); updateFilter("q", event.target.value); }}
                  placeholder="Course, skill, or instructor"
                />
              </span>
            </label>
            <label>
              Category
              <select value={category} onChange={(event) => { setPage(1); updateFilter("category", event.target.value, ""); }}>
                <option value="">All categories</option>
                {FALLBACK_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </label>
            <label>
              Level
              <select value={level} onChange={(event) => { setPage(1); updateFilter("level", event.target.value, ""); }}>
                <option value="">All levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="all">All Levels</option>
              </select>
            </label>
            <label>
              Type
              <select value={courseType} onChange={(event) => { setPage(1); updateFilter("type", event.target.value, ""); }}>
                <option value="">All</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </label>
            <label>
              Certificate
              <select value={certificate} onChange={(event) => { setPage(1); updateFilter("certificate", event.target.value, ""); }}>
                <option value="">Any</option>
                <option value="available">Certificate Available</option>
              </select>
            </label>
            <label>
              Sort by
              <select value={sort} onChange={(event) => { setPage(1); updateFilter("sort", event.target.value, "newest"); }}>
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </label>
            <button className="courses-clear-filters" type="button" onClick={() => { setPage(1); setSearchParams(new URLSearchParams()); }}>
              Clear all filters
            </button>
          </aside>

          <div className="courses-catalog-results">
            <div className="courses-results-toolbar">
              <p><strong>{total}</strong> {total === 1 ? "course" : "courses"}</p>
            </div>
            {loading ? (
              <div className="courses-loading">Loading courses...</div>
            ) : visibleCourses.length ? (
              <>
                <div className="courses-grid">
                  {visibleCourses.map((course) => (
                    <OnlineCourseCard key={course.id} course={course} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="courses-pagination">
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                    <span>Page {page} of {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                  </div>
                )}
              </>
            ) : (
              <div className="courses-empty">
                <h2>No courses found</h2>
                <p>Try another search or remove some filters.</p>
                <Link className="courses-primary-btn" to="/services/education/courses">
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

export default CourseCenterPage;
