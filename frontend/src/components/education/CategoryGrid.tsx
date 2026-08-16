import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { Link } from "react-router-dom";
import type { EducationCategory } from "../../types/education";
import { toEducationCategorySlug } from "../../utils/education";

type CategoryGridProps = {
  categories: EducationCategory[];
  selected?: string;
};

const CategoryGrid = ({ categories, selected }: CategoryGridProps) => (
  <div className="education-category-grid">
    {categories.map(category => {
      const slug = toEducationCategorySlug(category);
      const isUniversities = category.toLowerCase() === "universities";
      return (
        <Link
          key={category}
          to={isUniversities ? "/services/education/universities" : `/services/education/categories/${slug}`}
          className={`education-category-tile${selected === category ? " selected" : ""}`}
        >
          <SchoolOutlinedIcon />
          <span>{category}</span>
        </Link>
      );
    })}
  </div>
);

export default CategoryGrid;
