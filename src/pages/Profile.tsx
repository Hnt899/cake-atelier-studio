import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Cake, Package, History, LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  username: string;
  full_name: string;
  phone: string;
  email: string;
  avatar_url?: string;
}

interface SavedCake {
  id: string;
  name: string;
  layers: any;
  created_at: string;
}

interface Order {
  id: string;
  items: any;
  total_price: number;
  customer_name: string;
  customer_phone: string;
  delivery_date: string;
  comment?: string;
  status: string;
  created_at: string;
  track_number?: string;
}

export const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedCakes, setSavedCakes] = useState<SavedCake[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    await loadProfile(session.user.id);
    await loadSavedCakes(session.user.id);
    await loadOrders(session.user.id);
    setLoading(false);
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      toast.error("Ошибка загрузки профиля");
      return;
    }

    setProfile(data);
  };

  const loadSavedCakes = async (userId: string) => {
    const { data, error } = await supabase
      .from("saved_cakes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading saved cakes:", error);
      return;
    }

    setSavedCakes(data || []);
  };

  const loadOrders = async (userId: string) => {
    // Current order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!orderError && orderData) {
      setCurrentOrder(orderData);
    }

    // Order history
    const { data: historyData, error: historyError } = await supabase
      .from("order_history")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (!historyError) {
      setOrderHistory(historyData || []);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Вы вышли из аккаунта");
    navigate("/");
  };

  const addSavedCakeToCart = (cake: SavedCake) => {
    const cartItem = {
      id: `saved-${cake.id}`,
      name: cake.name,
      description: "Сохраненный торт",
      price: 15000,
      imageUrl: "https://images.unsplash.com/photo-1562440499-64c9a4a4bf86?w=400&h=400&fit=crop",
      category: "Создай сам",
      quantity: 1,
    };

    const savedCart = localStorage.getItem("cart");
    const cart = savedCart ? JSON.parse(savedCart) : [];
    cart.push(cartItem);
    localStorage.setItem("cart", JSON.stringify(cart));
    
    toast.success("Торт добавлен в корзину!");
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "На рассмотрении", variant: "default" },
      accepted: { label: "Принят", variant: "secondary" },
      preparing: { label: "Готовится", variant: "secondary" },
      processing: { label: "В обработке", variant: "default" },
      completed: { label: "Выполнен", variant: "outline" },
      cancelled: { label: "Отменён", variant: "destructive" },
    };

    const statusInfo = statusMap[status] || { label: status, variant: "default" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Профиль не найден</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-center">Профиль</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-3xl">
                    {profile.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              </div>
              
              <Separator />
              
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium">ID:</p>
                  <p className="text-muted-foreground break-all">{profile.id}</p>
                </div>
                <div>
                  <p className="font-medium">Email:</p>
                  <p className="text-muted-foreground">{profile.email}</p>
                </div>
                <div>
                  <p className="font-medium">Телефон:</p>
                  <p className="text-muted-foreground">{profile.phone}</p>
                </div>
              </div>
              
              <Button onClick={handleLogout} variant="destructive" className="w-full">
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </CardContent>
          </Card>
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Order Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Отслеживание заказа
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentOrder ? (
                  <div className="space-y-4">
                    {currentOrder.track_number && (
                      <div className="bg-accent/20 p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1">Трек-номер заказа:</p>
                        <p className="text-2xl font-bold text-accent">{currentOrder.track_number}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Статус:</span>
                        {getStatusBadge(currentOrder.status)}
                      </div>
                      <div>
                        <span className="font-medium">Дата доставки:</span>
                        <p>{new Date(currentOrder.delivery_date).toLocaleDateString("ru-RU")}</p>
                      </div>
                      <div>
                        <span className="font-medium">Сумма:</span>
                        <p className="text-xl font-bold">{currentOrder.total_price} ₽</p>
                      </div>
                      {currentOrder.comment && (
                        <div>
                          <span className="font-medium">Комментарий:</span>
                          <p className="text-muted-foreground">{currentOrder.comment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-2">У вас пока нет активных заказов</p>
                    <p className="text-sm text-muted-foreground">
                      Сделайте заказ и отслеживайте его в реальном времени!
                    </p>
                    <Button asChild className="mt-4">
                      <a href="/catalog">Перейти к каталогу</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Saved Cakes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cake className="w-5 h-5" />
                  Сохраненные торты ({savedCakes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {savedCakes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    У вас пока нет сохраненных тортов
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedCakes.map((cake) => (
                      <Card key={cake.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-2">{cake.name}</h3>
                          <p className="text-xs text-muted-foreground mb-3">
                            Создан: {new Date(cake.created_at).toLocaleDateString("ru-RU")}
                          </p>
                          <Button
                            onClick={() => addSavedCakeToCart(cake)}
                            className="w-full"
                            size="sm"
                          >
                            Добавить в корзину
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Order History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  История заказов ({orderHistory.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orderHistory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    История заказов пуста
                  </p>
                ) : (
                  <div className="space-y-4">
                    {orderHistory.map((order) => (
                      <Card key={order.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">
                                Заказ от {new Date(order.completed_at).toLocaleDateString("ru-RU")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Доставка: {new Date(order.delivery_date).toLocaleDateString("ru-RU")}
                              </p>
                            </div>
                            <p className="font-bold">{order.total_price} ₽</p>
                          </div>
                          {order.comment && (
                            <p className="text-sm text-muted-foreground">{order.comment}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};
