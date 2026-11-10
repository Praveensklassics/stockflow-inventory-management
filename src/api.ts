import { Organization, User, Product, InventoryTransaction, DashboardMetrics, CategoryBreakdown } from './types';

export const API_BASE = '/api';

export async function fetchWithOrg<T>(endpoint: string, orgId: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    'X-Organization-Id': orgId,
    'Authorization': `Bearer ${orgId}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export async function loginUser(email: string, password: string): Promise<{ token: string; user: User; organization: Organization }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function signupUser(payload: { name: string; email: string; password: string; organizationName: string }): Promise<{ token: string; user: User; organization: Organization }> {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function getOrganizations(): Promise<{ organizations: (Organization & { productCount: number })[] }> {
  const res = await fetch(`${API_BASE}/auth/organizations`);
  return res.json();
}

export async function getDashboard(orgId: string): Promise<{
  organization: Organization;
  metrics: DashboardMetrics;
  categoryBreakdown: CategoryBreakdown[];
  lowStockAlerts: Product[];
  outOfStockAlerts: Product[];
  recentTransactions: InventoryTransaction[];
}> {
  return fetchWithOrg('/dashboard', orgId);
}

export async function getProducts(orgId: string, queryParams: { search?: string; category?: string; filter?: string; sortBy?: string } = {}): Promise<{
  products: Product[];
  categories: string[];
  totalCount: number;
}> {
  const params = new URLSearchParams();
  if (queryParams.search) params.append('search', queryParams.search);
  if (queryParams.category) params.append('category', queryParams.category);
  if (queryParams.filter) params.append('filter', queryParams.filter);
  if (queryParams.sortBy) params.append('sortBy', queryParams.sortBy);

  return fetchWithOrg(`/products?${params.toString()}`, orgId);
}

export async function createProduct(orgId: string, productData: Partial<Product>): Promise<{ message: string; product: Product }> {
  return fetchWithOrg('/products', orgId, {
    method: 'POST',
    body: JSON.stringify(productData),
  });
}

export async function updateProduct(orgId: string, id: string, productData: Partial<Product>): Promise<{ message: string; product: Product }> {
  return fetchWithOrg(`/products/${id}`, orgId, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
}

export async function deleteProduct(orgId: string, id: string): Promise<{ message: string; deletedId: string }> {
  return fetchWithOrg(`/products/${id}`, orgId, {
    method: 'DELETE',
  });
}

export async function adjustStock(orgId: string, id: string, movement: { type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT'; amount: number; reason: string }): Promise<{
  message: string;
  product: Product;
  transaction: InventoryTransaction;
}> {
  return fetchWithOrg(`/products/${id}/adjust`, orgId, {
    method: 'POST',
    body: JSON.stringify(movement),
  });
}

export async function getTransactions(orgId: string): Promise<{ transactions: InventoryTransaction[]; total: number }> {
  return fetchWithOrg('/transactions', orgId);
}

export async function updateSettings(orgId: string, settings: Partial<Organization>): Promise<{ message: string; organization: Organization }> {
  return fetchWithOrg('/settings', orgId, {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

export async function seedDatabase(): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/seed`, { method: 'POST' });
  return res.json();
}
