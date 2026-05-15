import apiClient from './client';
import type {
  Product,
  Inventory,
  Transaction,
  DashboardReportDTO,
  AuthRequest,
  AuthResponse,
  RegisterRequest,
  TransactionRequestDTO,
  StockInRequest,
  TransferRequest,
} from './types';

// ─── Auth API ───────────────────────────────────────────────────────
// Maps to: AuthController @ /api/auth
export const AuthAPI = {
  /** POST /api/auth/authenticate */
  login: (data: AuthRequest) =>
    apiClient.post<AuthResponse>('/auth/authenticate', data),

  /** POST /api/auth/register */
  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/auth/register', data),
};

// ─── Product API ────────────────────────────────────────────────────
// Maps to: ProductController @ /api/products
export const ProductAPI = {
  /** GET /api/products */
  getAll: () => apiClient.get<Product[]>('/products'),

  /** GET /api/products/:id */
  getById: (id: number) => apiClient.get<Product>(`/products/${id}`),

  /** POST /api/products  (ADMIN only) */
  create: (data: Omit<Product, 'id'>) =>
    apiClient.post<Product>('/products', data),

  /** PUT /api/products/:id  (ADMIN only) */
  update: (id: number, data: Partial<Product>) =>
    apiClient.put<Product>(`/products/${id}`, data),

  /** DELETE /api/products/:id  (ADMIN only) */
  delete: (id: number) => apiClient.delete(`/products/${id}`),
};

// ─── Inventory API ──────────────────────────────────────────────────
// Maps to: InventoryController @ /api/inventory
export const InventoryAPI = {
  /** GET /api/inventory */
  getAll: () => apiClient.get<Inventory[]>('/inventory'),

  /** GET /api/inventory/product/:productId */
  getByProduct: (productId: number) =>
    apiClient.get<Inventory[]>(`/inventory/product/${productId}`),

  /** POST /api/inventory/stock-in  (ADMIN | USER) */
  addStock: (data: StockInRequest) =>
    apiClient.post<Inventory>('/inventory/stock-in', data),

  /** POST /api/inventory/transfer  (ADMIN | USER) */
  transferStock: (data: TransferRequest) =>
    apiClient.post<void>('/inventory/transfer', data),
};

// ─── Transaction API ────────────────────────────────────────────────
// Maps to: TransactionController @ /api/transactions
export const TransactionAPI = {
  /** GET /api/transactions */
  getAll: () => apiClient.get<Transaction[]>('/transactions'),

  /** GET /api/transactions/recent */
  getRecent: () => apiClient.get<Transaction[]>('/transactions/recent'),

  /** POST /api/transactions  (ADMIN | USER) */
  create: (data: TransactionRequestDTO) =>
    apiClient.post<Transaction>('/transactions', data),
};

// ─── Report API ─────────────────────────────────────────────────────
// Maps to: ReportController @ /api/reports
export const ReportAPI = {
  /** GET /api/reports/dashboard */
  getDashboard: () =>
    apiClient.get<DashboardReportDTO>('/reports/dashboard'),
};
