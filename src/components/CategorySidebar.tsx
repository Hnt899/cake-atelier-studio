import { ChevronRight } from "lucide-react";
import { categories } from "@/data/mockData";

interface CategorySidebarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategorySidebar = ({ selectedCategory, onSelectCategory }: CategorySidebarProps) => {
  return (
    <aside className="w-full md:w-64 bg-primary/30 border-r-2 border-secondary p-6 min-h-[calc(100vh-120px)]">
      <nav className="space-y-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between group ${
              selectedCategory === category
                ? "bg-accent text-accent-foreground font-medium"
                : "hover:bg-hover text-foreground"
            }`}
          >
            <span>{category}</span>
            {selectedCategory === category && (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
};
