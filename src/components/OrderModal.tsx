import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CartItem } from "@/types/cake";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalPrice: number;
}

export const OrderModal = ({ open, onClose, cartItems, totalPrice }: OrderModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    comment: "",
  });
  const [userTrackNumber, setUserTrackNumber] = useState<string>("");

  useEffect(() => {
    const loadUserTrackNumber = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const trackNum = session.user.id.substring(0, 10).toUpperCase();
        setUserTrackNumber(trackNum);
      }
    };
    
    if (open) {
      loadUserTrackNumber();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Необходимо войти в аккаунт");
      return;
    }

    try {
      // Создаем заказ в БД
      const { data, error } = await supabase
        .from("orders")
        .insert([{
          user_id: session.user.id,
          items: cartItems as any,
          total_price: totalPrice,
          customer_name: formData.name,
          customer_phone: formData.phone,
          delivery_date: formData.date,
          comment: formData.comment || null,
          status: 'pending' as const
        }])
        .select()
        .single();

      if (error) throw error;

      // Очищаем корзину
      localStorage.removeItem("cart");
      
      toast.success("Заказ отправлен! Отслеживайте его в профиле.");
      onClose();
      
      // Перезагружаем страницу для обновления корзины
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Ошибка при создании заказа");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-primary/90 border-2 border-secondary">
        <DialogHeader>
          <DialogTitle className="text-center text-foreground">
            Заполните форму чтобы создать ваш заказ.
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground">
            Позже с вами свяжется наш представитель.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {userTrackNumber && (
            <div className="bg-accent/20 p-3 rounded-lg">
              <p className="text-sm font-medium mb-1">Ваш трек-номер заказа:</p>
              <p className="text-lg font-bold text-accent">{userTrackNumber}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Используйте этот номер для отслеживания заказа в профиле
              </p>
            </div>
          )}
          
          <div>
            <Input
              placeholder="Как к вам обращаться?"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-secondary border-2 border-secondary"
            />
          </div>

          <div>
            <Input
              placeholder="Ваш номер телефона?"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="bg-secondary border-2 border-secondary"
            />
          </div>

          <div>
            <Input
              placeholder="К какому числу привезти заказ?"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="bg-secondary border-2 border-secondary"
            />
          </div>

          <div>
            <Textarea
              placeholder="Комментарий к заказу"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              maxLength={300}
              className="bg-secondary border-2 border-secondary min-h-[100px]"
            />
            <div className="text-right text-xs text-muted-foreground mt-1">
              {formData.comment.length}/300
            </div>
          </div>

          <Button type="submit" className="w-full bg-secondary hover:bg-hover text-secondary-foreground">
            Отправить
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
