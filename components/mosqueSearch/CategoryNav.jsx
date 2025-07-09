export default function CategoryNav({
  categories,
  activeCategory,
  handleCategoryChange,
}) {
  return (
    <div className="container mx-auto px-4 py-2 overflow-x-auto hide-scrollbar bg-white z-20 border-b border-gray-200">
      <div className="flex gap-6 items-center">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`flex flex-col items-center gap-1 pb-2 transition-all min-w-max ${
              activeCategory === category.id
                ? "border-b-2 border-primary text-primary font-medium"
                : "text-gray-500 hover:text-gray-800 border-b-2 border-transparent"
            }`}
            onClick={() => handleCategoryChange(category.id)}
          >
            <span className="text-lg">{category.icon}</span>
            <span className="text-xs whitespace-nowrap">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
