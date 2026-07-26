import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import type { EducationCategory } from "../../types/education";

type CategoryGridProps = {
  categories: EducationCategory[];
  selected?: string;
  onSelect?: (category: EducationCategory) => void;
};

const CategoryGrid = ({ categories, selected, onSelect }: CategoryGridProps) => (
  <div className="education-category-grid">
    {categories.map((category) => (
      <button
        key={category}
        type="button"
        className={`education-category-tile${selected === category ? " selected" : ""}`}
        onClick={() => onSelect?.(category)}
      >
        <SchoolOutlinedIcon />
        <span>{category}</span>
      </button>
    ))}
  </div>
);

export default CategoryGrid;
