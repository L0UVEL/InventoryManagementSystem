// ─── Backend Model Types ────────────────────────────────────────────
// These interfaces mirror the Java entities in demo/src/main/java/com/example/demo/models/

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  basePrice: number;
  lowStockThreshold: number | null;
  status: string; // "In Stock" | "Low Stock" | "Out of Stock"
}

export interface Inventory {
  id: number;
  product: Product;
  location: string; // e.g., "Main Storage", "IT Lab"
  quantity: number;
}

export interface TransactionItem {
  id: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Transaction {
  id: number;
  transactionId: string; // e.g. "TXN-00142", "RQ-1042"
  type: string; // "Cash Sale" | "Internal Req."
  requestorName: string;
  department: string;
  date: string; // ISO LocalDateTime from backend
  totalAmount: number;
  status: string; // "Approved" | "Pending" | "Rejected"
  items: TransactionItem[];
}

// ─── DTO Types (Request Bodies) ─────────────────────────────────────
// These mirror the Java DTOs in demo/src/main/java/com/example/demo/dto/

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
  fullName: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  role?: 'ROLE_USER' | 'ROLE_ADMIN';
}

export interface TransactionItemDTO {
  productId: number;
  quantity: number;
  location: string;
}

export interface TransactionRequestDTO {
  type: string;
  requestorName: string;
  department: string;
  items: TransactionItemDTO[];
}

export interface DashboardReportDTO {
  totalItems: number;
  lowStockAlertsCount: number;
  transactionsToday: number;
  estimatedInventoryValue: number;
  recentRequisitions: Transaction[];
}

export interface StockInRequest {
  productId: number;
  location: string;
  quantity: number;
}

export interface TransferRequest {
  productId: number;
  fromLocation: string;
  toLocation: string;
  quantity: number;
}
