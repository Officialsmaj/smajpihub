import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AppLayout from "../../layouts/AppLayout";
import CourseCard from "../../components/education/CourseCard";
import { toEducationCategorySlug } from "../../utils/education";
import { getEducationCategories, getEducationCourses } from "../../lib/educationApi";
import type { EducationCourse } from "../../types/education";
import EducationHeader from "./EducationHeader";
import "../EducationPage.css";

const titleFromSlug = (slug: string) =>
  slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const EducationCatalogPage = () => {
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<EducationCourse[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const query = searchParams.get("q") || "";
  const level = searchParams.get("level") || "all";
  const sort = searchParams.get("sort") || "relevance";

  useEffect(() => {
    let cancelled = false;
    Promise.all([getEducationCourses(), getEducationCategories()])
      .then(([courseData, categoryData]) => {
        if (!cancelled) {
          setCourses(courseData);
          setCategories(categoryData);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const category = useMemo(
    () => categories.find(item => toEducationCategorySlug(item) === categorySlug),
    [categories, categorySlug]
  );

  const visibleCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = courses.filter(course => {
      const matchesCategory = !categorySlug || toEducationCategorySlug(course.category) === categorySlug;
      const matchesLevel = level === "all" || course.level.toLowerCase() === level;
      const matchesQuery =
        !normalizedQuery ||
        [course.title, course.provider, course.category, course.description].some(value =>
          value?.toLowerCase().includes(normalizedQuery)
        );
      return matchesCategory && matchesLevel && matchesQuery;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "rating") return Number(b.rating) - Number(a.rating);
      if (sort === "price-low") return a.priceUsdt - b.priceUsdt;
      if (sort === "price-high") return b.priceUsdt - a.priceUsdt;
      return 0;
    });
  }, [categorySlug, courses, level, query, sort]);

  const updateFilter = (key: string, value: string, defaultValue = "") => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === defaultValue) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  const pageTitle = category || (categorySlug ? titleFromSlug(categorySlug) : "All Courses");

  return (
    <AppLayout showHeader={false} showFooter={false}>
      <main className="education-page">
        <EducationHeader query={query} onQueryChange={value => updateFilter("q", value)} />
        <section className="education-catalog-hero">
          <span className="education-kicker">EXPLORE LEARNING</span>
          <h1>{pageTitle}</h1>
          <p>Discover practical courses from verified education providers and build skills at your own pace.</p>
        </section>

        <section className="education-catalog-layout">
          <button className="education-filter-toggle" type="button" onClick={() => setFiltersOpen(open => !open)}>
            <FilterListOutlinedIcon /> Filters
          </button>
          <aside className={`education-catalog-filters${filtersOpen ? " open" : ""}`} aria-label="Course filters">
            <h2>Filter courses</h2>
            <label>
              Search
              <span className="education-filter-search">
                <SearchOutlinedIcon />
                <input
                  value={query}
                  onChange={event => updateFilter("q", event.target.value)}
                  placeholder="Course or provider"
                />
              </span>
            </label>
            <label>
              Level
              <select value={level} onChange={event => updateFilter("level", event.target.value, "all")}>
                <option value="all">All levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
            <Link to="/services/education/courses">Clear all filters</Link>
          </aside>

          <div className="education-catalog-results">
            <div className="education-results-toolbar">
              <p>
                <strong>{visibleCourses.length}</strong> {visibleCourses.length === 1 ? "course" : "courses"}
              </p>
              <label>
                Sort by
                <select value={sort} onChange={event => updateFilter("sort", event.target.value, "relevance")}>
                  <option value="relevance">Relevance</option>
                  <option value="rating">Highest rated</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                </select>
              </label>
            </div>
            {loading ? (
              <div className="education-loading">Loading courses...</div>
            ) : visibleCourses.length ? (
              <div className="education-course-grid">
                {visibleCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="education-empty">
                <h2>No courses found</h2>
                <p>Try another category or remove some filters.</p>
                <Link className="education-primary-btn" to="/services/education/courses">
                  Browse all courses
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </AppLayout>
  );
};

export default EducationCatalogPage;
