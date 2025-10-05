import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategorySidebar } from "@/components/CategorySidebar";
import { CakeCard } from "@/components/CakeCard";
import { CakeProduct, CartItem } from "@/types/cake";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PRODUCTS_PER_PAGE = 12;

export const Catalog = () => {
  const [selectedCategory, setSelectedCategory] = useState("Все торты");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<CakeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase.from("products").select("*");

      if (selectedCategory !== "Все торты") {
        query = query.eq("category", selectedCategory);
      }

      if (searchQuery.trim()) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data, error } = await query.order("name");

      if (error) throw error;

      const formattedData: CakeProduct[] = (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.image_url,
        category: item.category,
      }));

      setProducts(formattedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Ошибка загрузки товаров");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);

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
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <CategorySidebar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        
        <main className="flex-1 p-6">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            {selectedCategory}
            {searchQuery && ` - поиск: "${searchQuery}"`}
          </h1>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Загрузка...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentProducts.map((product) => (
                  <CakeCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {products.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    {searchQuery ? "Ничего не найдено" : "В этой категории пока нет товаров"}
                  </p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="border-secondary hover:bg-hover"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Назад
                  </Button>
                  
                  <span className="text-foreground font-medium">
                    Страница {currentPage} из {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="border-secondary hover:bg-hover"
                  >
                    Вперёд
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};
