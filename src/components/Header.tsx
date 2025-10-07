import { ShoppingBasket, Instagram, MessageCircle, Send, Search, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const Header = ({ searchQuery = "", onSearchChange }: HeaderProps) => {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b-2 border-secondary">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-accent-foreground">Sweet</div>
                <div className="text-sm text-accent-foreground">Line</div>
                <div className="text-xs text-muted-foreground">BY ESTALINA</div>
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Button variant="ghost" asChild className="hover:bg-hover">
              <Link to="/profile">
                <User className="w-5 h-5 mr-2" />
                Профиль
              </Link>
            </Button>
            <Button variant="ghost" asChild className="hover:bg-hover">
              <Link to="/cart">
                <ShoppingBasket className="w-5 h-5 mr-2" />
                Корзина
              </Link>
            </Button>
            <Button variant="ghost" asChild className="hover:bg-hover">
              <Link to="/about">Обо мне</Link>
            </Button>
            <Button variant="ghost" asChild className="hover:bg-hover">
              <Link to="/create">Торт: создай сам</Link>
            </Button>
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden lg:block">
            <div className="relative">
              <Input
                type="text"
                placeholder="Поиск по названию торта"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pr-10 bg-background border-2 border-secondary"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </form>

          {/* Social & Contact */}
          <div className="flex items-center gap-3">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition">
              <Instagram className="w-6 h-6 text-accent" />
            </a>
            <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition">
              <MessageCircle className="w-6 h-6 text-accent" />
            </a>
            <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition">
              <Send className="w-6 h-6 text-accent" />
            </a>
            <div className="hidden xl:block text-sm text-foreground font-medium">
              +7 999 (999) 99-99
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-4 mt-4 pb-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link to="/profile">Профиль</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link to="/cart">Корзина</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link to="/about">Обо мне</Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link to="/create">Создай сам</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};
