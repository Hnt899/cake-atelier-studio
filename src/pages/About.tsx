import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategorySidebar } from "@/components/CategorySidebar";

export const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <CategorySidebar
          selectedCategory="Обо мне"
          onSelectCategory={() => {}}
        />
        
        <main className="flex-1 p-6 md:p-12">
          <h1 className="text-4xl font-bold text-foreground mb-8">Обо мне</h1>
          
          <div className="max-w-4xl space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-1/3">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop"
                  alt="Эсталина"
                  className="rounded-2xl shadow-lg border-4 border-secondary w-full"
                />
              </div>
              
              <div className="flex-1 space-y-4">
                <p className="text-lg text-foreground leading-relaxed">
                  Меня зовут Эсталина, мне 19 лет, я живу в уютном Ростове-на-Дону.
                </p>
                <p className="text-lg text-foreground leading-relaxed">
                  Пеку торты с любовью прямо у себя дома — для меня это не просто увлечение,
                  а настоящее искусство, где каждый десерт рождается с душой и вдохновением.
                </p>
              </div>
            </div>

            <div className="bg-primary/30 rounded-2xl p-8 border-2 border-secondary">
              <h2 className="text-2xl font-bold text-foreground mb-4">Опыт и путь</h2>
              <p className="text-foreground leading-relaxed">
                Я уже работала в сфере кондитерского искусства — готовила торты и десерты на заказ,
                изучала современные техники украшения, искала идеальные сочетания вкусов и декора.
              </p>
              <p className="text-foreground leading-relaxed mt-4">
                Этот опыт помог мне создать собственный стиль — нежный, изысканный и душевный.
              </p>
            </div>

            <div className="bg-secondary/30 rounded-2xl p-8 border-2 border-primary">
              <h2 className="text-2xl font-bold text-foreground mb-4">Мои принципы</h2>
              <div className="space-y-3 text-foreground">
                <p className="leading-relaxed">
                  ✨ Каждый торт я создаю с особой любовью и вниманием к деталям.
                </p>
                <p className="leading-relaxed">
                  🍰 Использую только свежие продукты, проверенные рецепты и изысканные сочетания вкусов.
                </p>
                <p className="leading-relaxed">
                  💝 Для меня важно, чтобы каждый десерт был не просто вкусным,
                  а стал частью вашего праздника и оставил тёплые воспоминания.
                </p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-2xl p-8 border-2 border-accent">
              <h2 className="text-2xl font-bold text-foreground mb-4">Моё вдохновение</h2>
              <p className="text-foreground leading-relaxed">
                Меня вдохновляют улыбки людей, для которых я пеку. Красивые детали, гармония цветов,
                ароматы ванили и свежего теста — всё это превращает процесс в волшебство.
              </p>
              <p className="text-foreground leading-relaxed mt-4">
                Каждый заказ — это новая история, и я с радостью воплощаю её в сладком виде.
              </p>
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};
