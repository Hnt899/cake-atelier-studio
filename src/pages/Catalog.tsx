import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategorySidebar } from "@/components/CategorySidebar";
import { CakeCard } from "@/components/CakeCard";
import { mockProducts } from "@/data/mockData";
import { CakeProduct, CartItem } from "@/types/cake";
import { toast } from "sonner";

export const Catalog = () => {
  const [selectedCategory, setSelectedCategory] = useState("Все торты");
  const [cart, setCart] = useState<CartItem[]>([]);

  const filteredProducts =
    selectedCategory === "Все торты"
      ? mockProducts
      : mockProducts.filter((p) => p.category === selectedCategory);

  const handleAddToCart = (product: CakeProduct) => {
    const existingItem = cart.find((item) => item.id === product.id);
    
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    toast.success("Товар добавлен в корзину!");
    
    // Save to localStorage
    const updatedCart = existingItem
      ? cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [...cart, { ...product, quantity: 1 }];
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <CategorySidebar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        
        <main className="flex-1 p-6">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            {selectedCategory}
          </h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <CakeCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                В этой категории пока нет товаров
              </p>
            </div>
          )}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};
