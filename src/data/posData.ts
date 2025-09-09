// Centralized POS data used across the app
// NOTE: Keep this in sync with existing mock data used in Checkout

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Premium Espresso Blend",
    description: "Artisanal dark roast",
    price: 24.99,
    category: "Coffee"
  },
  {
    id: 2,
    name: "Organic Green Tea",
    description: "Hand-picked leaves",
    price: 18.50,
    category: "Tea"
  },
  {
    id: 3,
    name: "Gourmet Chocolate Cake",
    description: "Belgian chocolate",
    price: 45.00,
    category: "Dessert"
  },
  {
    id: 4,
    name: "Vintage Wine Selection",
    description: "Reserve collection",
    price: 89.99,
    category: "Beverages"
  },
  {
    id: 5,
    name: "Artisan Croissant",
    description: "Buttery perfection",
    price: 12.99,
    category: "Pastry"
  },
  {
    id: 6,
    name: "Truffle Collection",
    description: "Hand-crafted luxury",
    price: 65.00,
    category: "Confectionery"
  }
];

export const CATEGORIES: string[] = [
  "All",
  "Coffee",
  "Tea",
  "Dessert",
  "Beverages",
  "Pastry",
  "Confectionery"
];
