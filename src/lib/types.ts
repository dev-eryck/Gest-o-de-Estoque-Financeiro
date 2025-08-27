export interface Product {
  id: string;
  name: string;
  sku: string;
  ean?: string;
  category: string;
  supplierId: string;
  unit: 'garrafa' | 'lata' | 'ml' | 'un';
  contentMl: number;
  abv: number;
  cost: number;
  price: number;
  stock: number;
  minStock: number;
  maxStock?: number;
  location: string;
  expiry?: string;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  cnpj?: string;
  cpf?: string;
  email: string;
  phone: string;
  address?: string;
  paymentTerms?: string;
  deliveryTime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  role: 'Gerente' | 'Barman' | 'Garçom' | 'Cozinha' | 'Caixa';
  admissionDate: string;
  observations?: string;
  shift: 'manhã' | 'tarde' | 'noite';
  baseSalary?: number;
  canAdjustStock: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockMove {
  id: string;
  productId: string;
  type: 'entrada' | 'saída';
  quantity: number;
  unitCost?: number;
  unitPrice?: number;
  reason: 'compra' | 'venda' | 'perda' | 'consumo_interno' | 'ajuste' | 'transferencia';
  notes?: string;
  employeeId: string;
  date: string;
  createdAt: string;
}

export interface Settings {
  id: string;
  brandName: string;
  logo?: string;
  theme: 'light' | 'dark';
  primaryColor: string;
  alertDays: number;
  currency: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  expiringProducts: number;
  totalCost: number;
  totalValue: number;
  totalMoves: number;
  recentMoves: StockMove[];
  topProducts: Array<{
    product: Product;
    moves: number;
  }>;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface TableColumn {
  id: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface SortingState {
  id: string;
  desc: boolean;
}

export interface FilterState {
  id: string;
  value: string;
}
