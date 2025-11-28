import { getCategories } from '../utils/blogLoader';
import './CategoryNav.css';

function CategoryNav({ selectedCategory, onCategoryChange }) {
  const categories = getCategories();

  return (
    <nav className="category-nav">
      <div className="category-container">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default CategoryNav;
