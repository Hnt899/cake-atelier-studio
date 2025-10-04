import { CakeProduct } from "@/types/cake";

export const categories = [
  "Все торты",
  "Бенто торты",
  "Фруктовые торты",
  "Бисквитные торты",
  "Чизкейки",
  "Шоколадные торты",
  "Класические торты",
  "Брауни",
  "Карамельные торты",
  "Фирменые торты",
  "Ягодные торты",
  "Ореховые торты",
  "Добавки",
];

export const mockProducts: CakeProduct[] = [
  {
    id: "1",
    name: "Лимонный тортик",
    description: "Лимонный тортик с очень вкусной секретной начинкой",
    price: 2000,
    imageUrl: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=400&fit=crop",
    category: "Фруктовые торты",
  },
  {
    id: "2",
    name: "Клубничный бенто",
    description: "Нежный бенто торт с клубникой и кремом",
    price: 2500,
    imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop",
    category: "Бенто торты",
  },
  {
    id: "3",
    name: "Шоколадный мусс",
    description: "Воздушный шоколадный торт с муссом",
    price: 2800,
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop",
    category: "Шоколадные торты",
  },
  {
    id: "4",
    name: "Чизкейк Нью-Йорк",
    description: "Классический чизкейк с нежной текстурой",
    price: 3000,
    imageUrl: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=400&h=400&fit=crop",
    category: "Чизкейки",
  },
  {
    id: "5",
    name: "Ягодный микс",
    description: "Торт с ассорти из свежих ягод",
    price: 3200,
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop",
    category: "Ягодные торты",
  },
  {
    id: "6",
    name: "Карамельный крем",
    description: "Торт с соленой карамелью и нежным кремом",
    price: 2700,
    imageUrl: "https://images.unsplash.com/photo-1557308536-ee471ef2c390?w=400&h=400&fit=crop",
    category: "Карамельные торты",
  },
];
