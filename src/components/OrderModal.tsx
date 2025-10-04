import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CartItem } from "@/types/cake";
import { toast } from "sonner";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Send to Telegram bot via backend
    console.log("Order data:", {
      ...formData,
      items: cartItems,
      total: totalPrice,
    });

    toast.success("Заказ отправлен! Мы скоро свяжемся с вами.");
    onClose();
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
