import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CakeProduct } from "@/types/cake";

interface CakeCardProps {
  product: CakeProduct;
  onAddToCart: (product: CakeProduct) => void;
  quantity?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
  showQuantityControls?: boolean;
}

export const CakeCard = ({
  product,
  onAddToCart,
  quantity = 1,
  onIncrement,
  onDecrement,
  showQuantityControls = false,
}: CakeCardProps) => {
  return (
    <Card className="overflow-hidden border-2 border-secondary hover:shadow-lg transition-shadow bg-card">
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-4 bg-secondary/20">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Цена: {product.price} ₽</p>
          <h3 className="font-medium text-foreground line-clamp-2 min-h-[2.5rem]">
            {product.description}
          </h3>
          
          {showQuantityControls ? (
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={onDecrement}
                className="h-8 w-8 border-secondary hover:bg-hover"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-medium min-w-[2rem] text-center">{quantity}</span>
              <Button
                size="icon"
                variant="outline"
                onClick={onIncrement}
                className="h-8 w-8 border-secondary hover:bg-hover"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => onAddToCart(product)}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              В корзину
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
