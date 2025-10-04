export interface CakeProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

export interface CartItem extends CakeProduct {
  quantity: number;
}

export interface CustomCake {
  type: 'cupcake' | 'bento' | 'custom';
  shape?: string;
  filling?: string;
  topping?: string;
  design?: string;
  wall?: string;
  price: number;
}
