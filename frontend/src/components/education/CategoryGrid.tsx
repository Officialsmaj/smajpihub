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
    {categories.map(category => (
      <Link
        key={category}
        to={`/services/education/categories/${toEducationCategorySlug(category)}`}
        className={`education-category-tile${selected === category ? " selected" : ""}`}
      >
        <SchoolOutlinedIcon />
        <span>{category}</span>
      </Link>
    ))}
  </div>
);

export default CategoryGrid;
