import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { checkStockStatus, calculateInventoryMetrics, applyStockMovement, validateSkuFormat } from './src/utils/inventoryCalculations.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// --- IN-MEMORY MULTI-TENANT DATABASE STORE ---
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
  passwordHash: string;
  organizationId: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
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

interface Database {
  organizations: Organization[];
  users: User[];
  products: Product[];
  transactions: InventoryTransaction[];
}

// Initial multi-tenant seed data demonstrating isolation
const initialDatabase: Database = {
  organizations: [
    {
      id: 'org-apex',
      name: 'Apex Electronics & Hardware',
      currency: 'USD',
      defaultLowStockLevel: 5,
      taxRate: 8.5,
      industry: 'Consumer Tech & Hardware',
      createdAt: '2026-01-15T08:00:00Z',
    },
    {
      id: 'org-greenleaf',
      name: 'GreenLeaf Organics & Groceries',
      currency: 'USD',
      defaultLowStockLevel: 10,
      taxRate: 4.0,
      industry: 'Food & Organic Goods',
      createdAt: '2026-02-01T10:30:00Z',
    },
    {
      id: 'org-velvet',
      name: 'Velvet Atelier Apparel',
      currency: 'EUR',
      defaultLowStockLevel: 4,
      taxRate: 19.0,
      industry: 'Fashion & Retail',
      createdAt: '2026-02-20T14:15:00Z',
    },
  ],
  users: [
    {
      id: 'usr-1',
      name: 'Alex Mercer (Apex Admin)',
      email: 'alex@apexelectronics.io',
      passwordHash: '$2b$10$hashedApexAdminSecret123',
      organizationId: 'org-apex',
      role: 'ADMIN',
    },
    {
      id: 'usr-2',
      name: 'Elena Rostova (GreenLeaf Admin)',
      email: 'elena@greenleaforganics.com',
      passwordHash: '$2b$10$hashedGreenleafSecret456',
      organizationId: 'org-greenleaf',
      role: 'ADMIN',
    },
    {
      id: 'usr-3',
      name: 'Marc Dupont (Velvet Admin)',
      email: 'marc@velvetatelier.paris',
      passwordHash: '$2b$10$hashedVelvetSecret789',
      organizationId: 'org-velvet',
      role: 'ADMIN',
    },
  ],
  products: [
    // Apex Products
    {
      id: 'prd-apx-1',
      organizationId: 'org-apex',
      name: 'Pro Wireless ANC Headphones',
      sku: 'APX-ANC-01',
      category: 'Audio',
      quantity: 18,
      costPrice: 85.0,
      sellingPrice: 199.99,
      lowStockLevel: 5,
      location: 'Aisle 3, Bin B2',
      updatedAt: '2026-11-08T14:20:00Z',
    },
    {
      id: 'prd-apx-2',
      organizationId: 'org-apex',
      name: 'UltraWide Curved Monitor 34"',
      sku: 'APX-MON-34',
      category: 'Displays',
      quantity: 4, // LOW STOCK
      costPrice: 320.0,
      sellingPrice: 549.0,
      lowStockLevel: 6,
      location: 'Rack 7, High-Bay',
      updatedAt: '2026-11-09T09:15:00Z',
    },
    {
      id: 'prd-apx-3',
      organizationId: 'org-apex',
      name: 'RGB Mechanical Gaming Keyboard',
      sku: 'APX-KB-RGB',
      category: 'Peripherals',
      quantity: 32,
      costPrice: 42.0,
      sellingPrice: 99.5,
      lowStockLevel: 8,
      location: 'Aisle 2, Bin C1',
      updatedAt: '2026-11-07T11:45:00Z',
    },
    {
      id: 'prd-apx-4',
      organizationId: 'org-apex',
      name: 'Thunderbolt 4 Docking Station',
      sku: 'APX-DOC-TB4',
      category: 'Accessories',
      quantity: 0, // OUT OF STOCK
      costPrice: 110.0,
      sellingPrice: 229.0,
      lowStockLevel: 5,
      location: 'Aisle 4, Bin A3',
      updatedAt: '2026-11-09T18:00:00Z',
    },
    {
      id: 'prd-apx-5',
      organizationId: 'org-apex',
      name: 'Ergonomic Vertical Mouse',
      sku: 'APX-MOU-V1',
      category: 'Peripherals',
      quantity: 25,
      costPrice: 22.5,
      sellingPrice: 59.99,
      lowStockLevel: 6,
      location: 'Aisle 2, Bin C4',
      updatedAt: '2026-11-06T16:30:00Z',
    },
    {
      id: 'prd-apx-6',
      organizationId: 'org-apex',
      name: 'USB-C Braided Cable 2M (100W)',
      sku: 'APX-CAB-100W',
      category: 'Cables',
      quantity: 140,
      costPrice: 3.5,
      sellingPrice: 16.99,
      lowStockLevel: 25,
      location: 'Aisle 1, Peg 12',
      updatedAt: '2026-11-05T12:00:00Z',
    },

    // GreenLeaf Products
    {
      id: 'prd-grn-1',
      organizationId: 'org-greenleaf',
      name: 'Cold-Pressed Extra Virgin Olive Oil 1L',
      sku: 'GRN-OIL-EV1',
      category: 'Pantry',
      quantity: 45,
      costPrice: 9.0,
      sellingPrice: 18.5,
      lowStockLevel: 10,
      location: 'Shelf 12, Pantry',
      updatedAt: '2026-11-09T08:00:00Z',
    },
    {
      id: 'prd-grn-2',
      organizationId: 'org-greenleaf',
      name: 'Organic Raw Wildflower Honey 500g',
      sku: 'GRN-HNY-500',
      category: 'Pantry',
      quantity: 8, // LOW STOCK
      costPrice: 4.5,
      sellingPrice: 11.99,
      lowStockLevel: 12,
      location: 'Shelf 14, Jars',
      updatedAt: '2026-11-08T15:10:00Z',
    },
    {
      id: 'prd-grn-3',
      organizationId: 'org-greenleaf',
      name: 'Almond Milk Barista Edition 1L',
      sku: 'GRN-MLK-ALM',
      category: 'Beverages',
      quantity: 90,
      costPrice: 1.8,
      sellingPrice: 4.25,
      lowStockLevel: 20,
      location: 'Cooler 2, Bay 1',
      updatedAt: '2026-11-09T11:00:00Z',
    },
    {
      id: 'prd-grn-4',
      organizationId: 'org-greenleaf',
      name: 'Fair-Trade Arabica Coffee Beans 1kg',
      sku: 'GRN-COF-ARA',
      category: 'Beverages',
      quantity: 0, // OUT OF STOCK
      costPrice: 12.0,
      sellingPrice: 24.0,
      lowStockLevel: 10,
      location: 'Shelf 4, Coffee',
      updatedAt: '2026-11-07T13:45:00Z',
    },

    // Velvet Apparel Products
    {
      id: 'prd-vel-1',
      organizationId: 'org-velvet',
      name: 'Italian Merino Wool Turtleneck',
      sku: 'VEL-SWT-MER',
      category: 'Knitwear',
      quantity: 14,
      costPrice: 45.0,
      sellingPrice: 130.0,
      lowStockLevel: 5,
      location: 'Rack 3, Section A',
      updatedAt: '2026-11-08T10:00:00Z',
    },
    {
      id: 'prd-vel-2',
      organizationId: 'org-velvet',
      name: 'Raw Denim Selvedge Jeans',
      sku: 'VEL-JNS-RAW',
      category: 'Denim',
      quantity: 2, // LOW STOCK
      costPrice: 50.0,
      sellingPrice: 165.0,
      lowStockLevel: 6,
      location: 'Wall Unit 2',
      updatedAt: '2026-11-09T16:20:00Z',
    },
  ],
  transactions: [
    {
      id: 'tx-1',
      organizationId: 'org-apex',
      productId: 'prd-apx-1',
      productName: 'Pro Wireless ANC Headphones',
      sku: 'APX-ANC-01',
      type: 'STOCK_IN',
      quantityChanged: 20,
      previousQuantity: 0,
      newQuantity: 20,
      reason: 'Initial PO Delivery from Supplier ShenZhen Tech',
      userName: 'Alex Mercer',
      createdAt: '2026-11-05T09:00:00Z',
    },
    {
      id: 'tx-2',
      organizationId: 'org-apex',
      productId: 'prd-apx-1',
      productName: 'Pro Wireless ANC Headphones',
      sku: 'APX-ANC-01',
      type: 'STOCK_OUT',
      quantityChanged: 2,
      previousQuantity: 20,
      newQuantity: 18,
      reason: 'Fulfillment for Wholesale Order #WH-4029',
      userName: 'Alex Mercer',
      createdAt: '2026-11-08T14:20:00Z',
    },
    {
      id: 'tx-3',
      organizationId: 'org-apex',
      productId: 'prd-apx-4',
      productName: 'Thunderbolt 4 Docking Station',
      sku: 'APX-DOC-TB4',
      type: 'STOCK_OUT',
      quantityChanged: 5,
      previousQuantity: 5,
      newQuantity: 0,
      reason: 'B2B Enterprise Batch Order - Depleted',
      userName: 'Alex Mercer',
      createdAt: '2026-11-09T18:00:00Z',
    },
    {
      id: 'tx-4',
      organizationId: 'org-greenleaf',
      productId: 'prd-grn-1',
      productName: 'Cold-Pressed Extra Virgin Olive Oil 1L',
      sku: 'GRN-OIL-EV1',
      type: 'STOCK_IN',
      quantityChanged: 50,
      previousQuantity: 0,
      newQuantity: 50,
      reason: 'Farm direct harvest shipment from Tuscany',
      userName: 'Elena Rostova',
      createdAt: '2026-11-07T08:30:00Z',
    },
  ],
};

// Deep copy for runtime modifications
let db: Database = JSON.parse(JSON.stringify(initialDatabase));

// --- TENANT AUTHENTICATION & MULTI-TENANCY MIDDLEWARE ---
// Simulates JWT & organization resolution. Client can pass Authorization: Bearer org-xxx or X-Organization-Id
interface AuthenticatedRequest extends Request {
  user?: User;
  organization?: Organization;
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const orgHeader = req.headers['x-organization-id'] as string;

  let resolvedOrgId = 'org-apex'; // Default tenant

  if (orgHeader && db.organizations.some(o => o.id === orgHeader)) {
    resolvedOrgId = orgHeader;
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    if (token.startsWith('org-') && db.organizations.some(o => o.id === token)) {
      resolvedOrgId = token;
    } else {
      // Find user with matching token or fallback
      const matchingUser = db.users.find(u => u.id === token || u.email === token);
      if (matchingUser) {
        resolvedOrgId = matchingUser.organizationId;
      }
    }
  }

  const org = db.organizations.find(o => o.id === resolvedOrgId) || db.organizations[0];
  const user = db.users.find(u => u.organizationId === org.id) || db.users[0];

  req.organization = org;
  req.user = user;
  next();
};

// --- REST API ENDPOINTS ---

// 1. Auth & Organizations
app.get('/api/auth/organizations', (_req: Request, res: Response) => {
  res.json({
    organizations: db.organizations.map(org => ({
      id: org.id,
      name: org.name,
      currency: org.currency,
      industry: org.industry,
      productCount: db.products.filter(p => p.organizationId === org.id).length,
    })),
  });
});

app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    user: req.user,
    organization: req.organization,
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. User not found.' });
  }

  const org = db.organizations.find(o => o.id === user.organizationId);
  return res.json({
    token: `token-${user.id}-${Date.now()}`,
    user,
    organization: org,
  });
});

app.post('/api/auth/signup', (req: Request, res: Response) => {
  const { name, email, password, organizationName, currency, industry } = req.body;
  if (!name || !email || !password || !organizationName) {
    return res.status(400).json({ error: 'Missing required signup fields' });
  }

  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const newOrgId = `org-${Date.now().toString(36)}`;
  const newUserId = `usr-${Date.now().toString(36)}`;

  const newOrg: Organization = {
    id: newOrgId,
    name: organizationName,
    currency: currency || 'USD',
    defaultLowStockLevel: 5,
    taxRate: 8.0,
    industry: industry || 'General Retail',
    createdAt: new Date().toISOString(),
  };

  const newUser: User = {
    id: newUserId,
    name,
    email,
    passwordHash: `$2b$10$hashed_${newUserId}`,
    organizationId: newOrgId,
    role: 'ADMIN',
  };

  db.organizations.push(newOrg);
  db.users.push(newUser);

  // Add 2 starter products for immediate demo gratification
  const starter1: Product = {
    id: `prd-${Date.now()}-1`,
    organizationId: newOrgId,
    name: 'Sample Core Product A',
    sku: 'SMP-001',
    category: 'General',
    quantity: 15,
    costPrice: 20,
    sellingPrice: 45,
    lowStockLevel: 5,
    location: 'Shelf 1',
    updatedAt: new Date().toISOString(),
  };
  const starter2: Product = {
    id: `prd-${Date.now()}-2`,
    organizationId: newOrgId,
    name: 'Sample High-Velocity Product B',
    sku: 'SMP-002',
    category: 'General',
    quantity: 3, // Low stock demo
    costPrice: 12,
    sellingPrice: 28,
    lowStockLevel: 5,
    location: 'Shelf 2',
    updatedAt: new Date().toISOString(),
  };
  db.products.push(starter1, starter2);

  return res.status(201).json({
    token: newUser.id,
    user: newUser,
    organization: newOrg,
  });
});

// 2. Products Catalog (CRUD & Multi-Tenant Scoped)
app.get('/api/products', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.organization!.id;
  const search = ((req.query.search as string) || '').trim().toLowerCase();
  const category = (req.query.category as string) || '';
  const filter = (req.query.filter as string) || 'all'; // all, lowStock, outOfStock, inStock
  const sortBy = (req.query.sortBy as string) || 'name'; // name, quantity, price, value

  let tenantProducts = db.products.filter(p => p.organizationId === orgId);

  // Search filter
  if (search) {
    tenantProducts = tenantProducts.filter(
      p => p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search) || p.category.toLowerCase().includes(search)
    );
  }

  // Category filter
  if (category && category !== 'All') {
    tenantProducts = tenantProducts.filter(p => p.category === category);
  }

  // Stock status filter
  if (filter === 'lowStock') {
    tenantProducts = tenantProducts.filter(p => p.quantity > 0 && p.quantity <= p.lowStockLevel);
  } else if (filter === 'outOfStock') {
    tenantProducts = tenantProducts.filter(p => p.quantity <= 0);
  } else if (filter === 'inStock') {
    tenantProducts = tenantProducts.filter(p => p.quantity > p.lowStockLevel);
  }

  // Sorting
  tenantProducts.sort((a, b) => {
    if (sortBy === 'quantity') return b.quantity - a.quantity;
    if (sortBy === 'price') return b.sellingPrice - a.sellingPrice;
    if (sortBy === 'value') return b.quantity * b.sellingPrice - a.quantity * a.sellingPrice;
    return a.name.localeCompare(b.name);
  });

  const categories = Array.from(new Set(db.products.filter(p => p.organizationId === orgId).map(p => p.category)));

  res.json({
    products: tenantProducts,
    categories,
    totalCount: tenantProducts.length,
    organizationId: orgId,
  });
});

app.post('/api/products', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.organization!.id;
  const { name, sku, description, category, quantity, costPrice, sellingPrice, lowStockLevel, location } = req.body;

  if (!name || !sku) {
    return res.status(400).json({ error: 'Product name and SKU are required' });
  }

  const skuCheck = validateSkuFormat(sku);
  if (!skuCheck.valid) {
    return res.status(400).json({ error: skuCheck.reason });
  }

  const cleanSku = sku.trim().toUpperCase();

  // Multi-tenant check: SKU must be unique WITHIN this organization
  const duplicate = db.products.find(p => p.organizationId === orgId && p.sku.toUpperCase() === cleanSku);
  if (duplicate) {
    return res.status(409).json({ error: `SKU '${cleanSku}' already exists in your organization's catalog.` });
  }

  const parsedQty = Math.max(0, parseInt(quantity, 10) || 0);
  const parsedCost = Math.max(0, parseFloat(costPrice) || 0);
  const parsedSell = Math.max(0, parseFloat(sellingPrice) || 0);
  const parsedLowStock = parseInt(lowStockLevel, 10) || req.organization!.defaultLowStockLevel || 5;

  const newProduct: Product = {
    id: `prd-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    organizationId: orgId,
    name: name.trim(),
    sku: cleanSku,
    description: description ? description.trim() : '',
    category: category ? category.trim() : 'General',
    quantity: parsedQty,
    costPrice: parsedCost,
    sellingPrice: parsedSell,
    lowStockLevel: parsedLowStock,
    location: location ? location.trim() : 'Default Aisle',
    updatedAt: new Date().toISOString(),
  };

  db.products.push(newProduct);

  // If initial quantity > 0, log an initial stock-in transaction
  if (parsedQty > 0) {
    const tx: InventoryTransaction = {
      id: `tx-${Date.now().toString(36)}`,
      organizationId: orgId,
      productId: newProduct.id,
      productName: newProduct.name,
      sku: newProduct.sku,
      type: 'STOCK_IN',
      quantityChanged: parsedQty,
      previousQuantity: 0,
      newQuantity: parsedQty,
      reason: 'Initial stock intake upon SKU creation',
      userName: req.user?.name || 'Admin',
      createdAt: new Date().toISOString(),
    };
    db.transactions.unshift(tx);
  }

  return res.status(201).json({
    message: 'Product created successfully',
    product: newProduct,
  });
});

app.put('/api/products/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.organization!.id;
  const { id } = req.params;
  const { name, sku, description, category, costPrice, sellingPrice, lowStockLevel, location } = req.body;

  const productIndex = db.products.findIndex(p => p.id === id && p.organizationId === orgId);
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found in this organization' });
  }

  const existing = db.products[productIndex];

  if (sku && sku.trim().toUpperCase() !== existing.sku) {
    const cleanSku = sku.trim().toUpperCase();
    const skuCheck = validateSkuFormat(cleanSku);
    if (!skuCheck.valid) {
      return res.status(400).json({ error: skuCheck.reason });
    }
    const duplicate = db.products.find(p => p.organizationId === orgId && p.id !== id && p.sku.toUpperCase() === cleanSku);
    if (duplicate) {
      return res.status(409).json({ error: `SKU '${cleanSku}' already exists in your organization.` });
    }
    existing.sku = cleanSku;
  }

  if (name) existing.name = name.trim();
  if (description !== undefined) existing.description = description.trim();
  if (category) existing.category = category.trim();
  if (costPrice !== undefined) existing.costPrice = Math.max(0, parseFloat(costPrice) || 0);
  if (sellingPrice !== undefined) existing.sellingPrice = Math.max(0, parseFloat(sellingPrice) || 0);
  if (lowStockLevel !== undefined) existing.lowStockLevel = Math.max(0, parseInt(lowStockLevel, 10) || 5);
  if (location !== undefined) existing.location = location.trim();
  existing.updatedAt = new Date().toISOString();

  return res.json({
    message: 'Product updated successfully',
    product: existing,
  });
});

app.delete('/api/products/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.organization!.id;
  const { id } = req.params;

  const productIndex = db.products.findIndex(p => p.id === id && p.organizationId === orgId);
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found in this organization' });
  }

  const deleted = db.products.splice(productIndex, 1)[0];

  return res.json({
    message: `Product ${deleted.name} (${deleted.sku}) deleted successfully.`,
    deletedId: id,
  });
});

// 3. Stock Adjustment & Transactions (Stock In / Stock Out / Audit)
app.post('/api/products/:id/adjust', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.organization!.id;
  const { id } = req.params;
  const { type, amount, reason } = req.body;

  if (!type || !['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT'].includes(type)) {
    return res.status(400).json({ error: "Type must be 'STOCK_IN', 'STOCK_OUT', or 'ADJUSTMENT'" });
  }

  const parsedAmount = Math.max(0, parseInt(amount, 10) || 0);
  if (parsedAmount === 0 && type !== 'ADJUSTMENT') {
    return res.status(400).json({ error: 'Movement amount must be greater than zero' });
  }

  const product = db.products.find(p => p.id === id && p.organizationId === orgId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const previousQuantity = product.quantity;
  const result = applyStockMovement(product.quantity, type, parsedAmount);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  product.quantity = result.newQuantity;
  product.updatedAt = new Date().toISOString();

  const quantityChanged = type === 'ADJUSTMENT' ? Math.abs(result.newQuantity - previousQuantity) : parsedAmount;

  const transaction: InventoryTransaction = {
    id: `tx-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
    organizationId: orgId,
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    type,
    quantityChanged,
    previousQuantity,
    newQuantity: product.quantity,
    reason: reason ? reason.trim() : `${type === 'STOCK_IN' ? 'Stock received' : type === 'STOCK_OUT' ? 'Stock removed' : 'Manual count adjustment'}`,
    userName: req.user?.name || 'Staff User',
    createdAt: new Date().toISOString(),
  };

  db.transactions.unshift(transaction);

  return res.json({
    message: 'Stock updated successfully',
    product,
    transaction,
  });
});

// 4. Transactions Audit Log
app.get('/api/transactions', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.organization!.id;
  const limit = parseInt(req.query.limit as string, 10) || 50;
  const tenantTx = db.transactions.filter(t => t.organizationId === orgId).slice(0, limit);

  res.json({
    transactions: tenantTx,
    total: tenantTx.length,
  });
});

// 5. Dashboard Summary Metrics
app.get('/api/dashboard', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.organization!.id;
  const orgProducts = db.products.filter(p => p.organizationId === orgId);
  const orgTransactions = db.transactions.filter(t => t.organizationId === orgId).slice(0, 8);

  const metrics = calculateInventoryMetrics(orgProducts);

  // Group by category for visual distribution
  const categoryMap: Record<string, { count: number; totalValue: number; units: number }> = {};
  for (const p of orgProducts) {
    if (!categoryMap[p.category]) {
      categoryMap[p.category] = { count: 0, totalValue: 0, units: 0 };
    }
    categoryMap[p.category].count += 1;
    categoryMap[p.category].units += p.quantity;
    categoryMap[p.category].totalValue += p.quantity * p.sellingPrice;
  }

  const categoryBreakdown = Object.entries(categoryMap).map(([category, stats]) => ({
    category,
    count: stats.count,
    units: stats.units,
    totalValue: Math.round(stats.totalValue * 100) / 100,
  })).sort((a, b) => b.totalValue - a.totalValue);

  // Filter low stock and out of stock items
  const lowStockAlerts = orgProducts.filter(p => p.quantity > 0 && p.quantity <= p.lowStockLevel);
  const outOfStockAlerts = orgProducts.filter(p => p.quantity <= 0);

  res.json({
    organization: req.organization,
    metrics,
    categoryBreakdown,
    lowStockAlerts,
    outOfStockAlerts,
    recentTransactions: orgTransactions,
  });
});

// 6. Organization Settings
app.get('/api/settings', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    organization: req.organization,
    user: req.user,
  });
});

app.put('/api/settings', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.organization!.id;
  const { name, currency, defaultLowStockLevel, taxRate, industry } = req.body;

  const org = db.organizations.find(o => o.id === orgId);
  if (!org) {
    return res.status(404).json({ error: 'Organization not found' });
  }

  if (name) org.name = name.trim();
  if (currency) org.currency = currency.trim();
  if (defaultLowStockLevel !== undefined) org.defaultLowStockLevel = Math.max(1, parseInt(defaultLowStockLevel, 10) || 5);
  if (taxRate !== undefined) org.taxRate = Math.max(0, parseFloat(taxRate) || 0);
  if (industry) org.industry = industry.trim();

  res.json({
    message: 'Settings updated successfully',
    organization: org,
  });
});

// 7. Seed / Reset Data
app.post('/api/seed', (_req: Request, res: Response) => {
  db = JSON.parse(JSON.stringify(initialDatabase));
  res.json({
    message: 'Database reset to initial multi-tenant seed data successfully.',
    organizationCount: db.organizations.length,
    productCount: db.products.length,
  });
});

// 8. CSV Export for current organization
app.get('/api/export-csv', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const org = req.organization!;
  const orgProducts = db.products.filter(p => p.organizationId === org.id);

  const header = ['SKU', 'Product Name', 'Category', 'Quantity', 'Cost Price', 'Selling Price', 'Low Stock Threshold', 'Stock Status', 'Location'];
  const rows = orgProducts.map(p => {
    const status = checkStockStatus(p.quantity, p.lowStockLevel);
    return [
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.quantity,
      p.costPrice.toFixed(2),
      p.sellingPrice.toFixed(2),
      p.lowStockLevel,
      `"${status}"`,
      `"${p.location || ''}"`,
    ].join(',');
  });

  const csvContent = [header.join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${org.name.replace(/[^a-zA-Z0-9]/g, '_')}_inventory.csv"`);
  res.send(csvContent);
});

// --- VITE MIDDLEWARE OR STATIC SERVING ---
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 StockFlow Express Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
