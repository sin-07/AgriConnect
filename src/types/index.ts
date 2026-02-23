export type UserRole = "farmer" | "individual" | "industrial";

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address: Address;
  businessName?: string;
  gstNumber?: string;
  farmSize?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface Product {
  _id: string;
  farmer: {
    _id: string;
    name: string;
    phone: string;
    address: Address;
  };
  name: string;
  description: string;
  category: string;
  pricePerUnit: number;
  unit: string;
  imageUrl: string;
  localStock: number;
  industrialStock: number;
  totalStock: number;
  isActive: boolean;
  harvestDate?: string;
  expiryDate?: string;
  isOrganic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  pricePerUnit: number;
  unit: string;
  imageUrl: string;
  localStock: number;
  industrialStock: number;
  isOrganic: boolean;
  harvestDate?: string;
  expiryDate?: string;
}

export interface OrderItem {
  product: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  unit: string;
  subtotal: number;
  farmer: string;
}

export interface Order {
  _id: string;
  buyer: User | string;
  buyerType: "individual" | "industrial";
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: Address;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
