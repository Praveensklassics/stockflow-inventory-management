export interface Organization {
  id: string;
  name: string;
  currency: string;
  defaultLowStockLevel: number;
  taxRate: number;
  industry: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  organizationId: string;
}

export interface Product {
  id: string;
  organizationId: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  lowStockLevel: number;
  location?: string;
  updatedAt: string;
}

export interface InventoryTransaction {
  id: string;
  organizationId: string;
  productId: string;
  productName: string;
  sku: string;
  type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';
  quantityChanged: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  userName: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalSKUs: number;
  totalUnits: number;
  totalCostValuation: number;
  totalRetailValuation: number;
  potentialProfit: number;
  averageMargin: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  units: number;
  totalValue: number;
}

export interface AuthSession {
  token: string;
  user: User;
  organization: Organization;
}
