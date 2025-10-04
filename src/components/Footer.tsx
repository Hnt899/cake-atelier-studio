import { Instagram, MessageCircle, Send } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary/30 border-t-2 border-secondary py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & Social */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl font-bold text-accent-foreground">Sweet</div>
                <div className="text-base text-accent-foreground">Line</div>
                <div className="text-xs text-muted-foreground">BY ESTALINA</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition">
                <Instagram className="w-8 h-8 text-accent" />
              </a>
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition">
                <MessageCircle className="w-8 h-8 text-accent" />
              </a>
              <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition">
                <Send className="w-8 h-8 text-accent" />
              </a>
            </div>

            <div className="text-lg text-foreground font-medium">
              +7 999 (999) 99-99
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 text-center md:text-left">
            <a href="/" className="text-foreground hover:text-accent transition">Все торты</a>
            <a href="/about" className="text-foreground hover:text-accent transition">Обо мне</a>
            <a href="/create" className="text-foreground hover:text-accent transition">Торт: создай сам</a>
          </nav>

          {/* Legal */}
          <div className="text-center md:text-right text-sm text-muted-foreground space-y-1">
            <p>© 000 "Эсталина"</p>
            <p>Политика конфеденциальности</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
