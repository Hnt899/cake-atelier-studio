import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategorySidebar } from "@/components/CategorySidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";

type CakeType = "cupcake" | "bento" | "custom" | null;

interface CustomOptions {
  shape?: string;
  filling?: string;
  topping?: string;
  design?: string;
  wall?: string;
}

export const CreateCake = () => {
  const [selectedType, setSelectedType] = useState<CakeType>(null);
  const [customOptions, setCustomOptions] = useState<CustomOptions>({});
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const cakeTypes = [
    {
      id: "cupcake" as CakeType,
      name: "Капкейки",
      price: 5000,
      image: "https://images.unsplash.com/photo-1426869884541-df7117556757?w=400&h=400&fit=crop",
    },
    {
      id: "bento" as CakeType,
      name: "Бенто торт",
      price: 2000,
      image: "https://images.unsplash.com/photo-1558312657-d9f5ecd68375?w=400&h=400&fit=crop",
    },
    {
      id: "custom" as CakeType,
      name: "Торт произвольной формы",
      price: 15000,
      image: "https://images.unsplash.com/photo-1562440499-64c9a4a4bf86?w=400&h=400&fit=crop",
    },
  ];

  const shapes = ["круглый", "сердце", "звезда", "квадрат"];
  const fillings = ["ванильный крем", "шоколадный мусс", "клубничный", "карамель", "орех"];
  const toppings = ["ягоды", "шоколад", "крем", "безе", "макарон"];
  const designs = ["классический", "минималистичный", "яркий", "нежный"];
  const walls = ["простой корж", "шоколадный корж", "бисквит", "песочный"];

  const handleAddToCart = () => {
    const selectedCake = cakeTypes.find((t) => t.id === selectedType);
    if (!selectedCake) return;

    const cartItem = {
      id: `custom-${Date.now()}`,
      name: `${selectedCake.name} (индивидуальный)`,
      description: Object.entries(customOptions)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", "),
      price: selectedCake.price,
      imageUrl: selectedCake.image,
      category: "Фирменые торты",
      quantity: 1,
    };

    const savedCart = localStorage.getItem("cart");
    const cart = savedCart ? JSON.parse(savedCart) : [];
    cart.push(cartItem);
    localStorage.setItem("cart", JSON.stringify(cart));

    toast.success("Ваш торт добавлен в корзину!");
    setSelectedType(null);
    setCustomOptions({});
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderOptions = (title: string, options: string[], key: keyof CustomOptions) => (
    <div className="bg-accent/30 rounded-lg overflow-hidden border-2 border-accent">
      <button
        onClick={() => toggleSection(key)}
        className="w-full px-6 py-4 flex justify-between items-center hover:bg-accent/20 transition"
      >
        <span className="font-medium text-foreground">{title}</span>
        <span className="text-foreground">{customOptions[key] || "не выбрано"}</span>
        {expandedSection === key ? <ChevronUp /> : <ChevronDown />}
      </button>
      
      {expandedSection === key && (
        <div className="px-6 pb-4 pt-2 space-y-2">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => setCustomOptions({ ...customOptions, [key]: option })}
              className={`w-full text-left px-4 py-2 rounded transition ${
                customOptions[key] === option
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary hover:bg-hover"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <CategorySidebar
          selectedCategory="Создай сам"
          onSelectCategory={() => {}}
        />
        
        <main className="flex-1 p-6 md:p-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Создай сам!</h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
            Используя наш готовый элюстрационный инструмент вы можете собрать свой собственный шедевр
            из наших заготовленных пресетов, но если вам его не хватит вы всегда обратиться нам по телефону
          </p>

          {!selectedType ? (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Выберите формат вашего торта
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cakeTypes.map((cake) => (
                  <Card
                    key={cake.id}
                    className="overflow-hidden border-2 border-secondary hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => setSelectedType(cake.id)}
                  >
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={cake.image}
                        alt={cake.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-6 bg-secondary/20 text-center">
                      <h3 className="font-bold text-lg text-foreground mb-2">{cake.name}</h3>
                      <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                        Выбрать
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  {cakeTypes.find((t) => t.id === selectedType)?.name}
                </h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedType(null);
                    setCustomOptions({});
                  }}
                >
                  Назад
                </Button>
              </div>

              <div className="space-y-4">
                {renderOptions("выбор формы", shapes, "shape")}
                {renderOptions("начинку", fillings, "filling")}
                
                {selectedType === "cupcake" && renderOptions("верхушку", toppings, "topping")}
                
                {selectedType === "bento" && renderOptions("шапку торта (дизайн)", designs, "design")}
                
                {selectedType === "custom" && (
                  <>
                    {renderOptions("стенка торта", walls, "wall")}
                    {renderOptions("шапка торта", designs, "design")}
                  </>
                )}
              </div>

              <div className="bg-primary/30 border-2 border-secondary rounded-lg p-6 mt-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium">Цена:</span>
                  <span className="text-3xl font-bold text-foreground">
                    {cakeTypes.find((t) => t.id === selectedType)?.price} ₽
                  </span>
                </div>
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-secondary hover:bg-hover text-secondary-foreground text-lg py-6"
                  disabled={!customOptions.shape || !customOptions.filling}
                >
                  Добавить в корзину
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};
