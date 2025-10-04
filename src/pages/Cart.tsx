import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategorySidebar } from "@/components/CategorySidebar";
import { CakeCard } from "@/components/CakeCard";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/types/cake";
import { OrderModal } from "@/components/OrderModal";
import { toast } from "sonner";

export const Cart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const handleIncrement = (id: string) => {
    const newCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    updateCart(newCart);
  };

  const handleDecrement = (id: string) => {
    const item = cart.find((item) => item.id === id);
    if (item && item.quantity > 1) {
      const newCart = cart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      );
      updateCart(newCart);
    } else {
      const newCart = cart.filter((item) => item.id !== id);
      updateCart(newCart);
      toast.info("Товар удален из корзины");
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <CategorySidebar
          selectedCategory="Корзина"
          onSelectCategory={() => {}}
        />
        
        <main className="flex-1 p-6">
          <h1 className="text-3xl font-bold text-foreground mb-6">Корзина</h1>
          
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                Ваша корзина пуста
              </p>
              <Button asChild className="bg-accent hover:bg-accent/90">
                <a href="/">Вернуться к каталогу</a>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {cart.map((item) => (
                  <CakeCard
                    key={item.id}
                    product={item}
                    onAddToCart={() => {}}
                    quantity={item.quantity}
                    onIncrement={() => handleIncrement(item.id)}
                    onDecrement={() => handleDecrement(item.id)}
                    showQuantityControls
                  />
                ))}
              </div>

              <div className="bg-primary/30 border-2 border-secondary rounded-lg p-6 max-w-md ml-auto">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium">Итого:</span>
                    <span className="font-bold text-2xl">{totalPrice} ₽</span>
                  </div>
                  <Button
                    onClick={() => setShowOrderModal(true)}
                    className="w-full bg-secondary hover:bg-hover text-secondary-foreground text-lg py-6"
                  >
                    Заказать
                  </Button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      
      <OrderModal
        open={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        cartItems={cart}
        totalPrice={totalPrice}
      />
      
      <Footer />
    </div>
  );
};
